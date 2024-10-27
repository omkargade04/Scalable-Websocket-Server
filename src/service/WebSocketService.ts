import { WebSocket, WebSocketServer } from "ws";
import { CustomWebSocket, Message } from "../types/type";
import { RedisManager } from "../manager/RedisManager";
import { SubscriptionService } from "./SubscriptionService";

export class WebSocketService {
    private wss: WebSocketServer;
    private redisManager: RedisManager;
    private subscriptionService: SubscriptionService;

    constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.redisManager = RedisManager.getInstance();
        this.subscriptionService = new SubscriptionService();
        this.initialize();
    }

    private initialize(): void {
        this.wss.on('connection', this.handleConnection.bind(this));   
        
        setInterval(() => {
            console.log(this.subscriptionService.getSubscriptions());
        }, 5000);
    }

    private handleConnection(ws: WebSocket): void {
        const id = this.subscriptionService.addSubscription(ws);

        ws.on('message', async(data: any) => {
            const parsedMessage: Message = JSON.parse(data.toString());
            await this.handleMessage(id, parsedMessage);
        });
    }

    private async handleMessage(id: string, message: Message) {
        switch(message.type) {
            case 'SUBSCRIBE':
                await this.handleSubscribe(id, message.room!);
                break;
            case 'UNSUBSCRIBE':
                await this.handleUnsubscribe(id, message.room!);
                break;
            case 'SEND_MESSAGE':
                await this.handleSendMessage(message);
                break;
        }
    }

    private async handleSubscribe(id: string, room: string): Promise<void> {
        this.subscriptionService.addRoomToSubscription(id, room);

        if(this.subscriptionService.isFirstSubscriber(room)) {
            console.log(`Subscribing to room: ${room}`);
            await this.redisManager.subscribe(room, (message) => {
                const parsedMessage = JSON.parse(message);
                this.subscriptionService.broadCastToRoom(parsedMessage.roomId, parsedMessage.message);
            })
        }
    }

    private async handleUnsubscribe(id: string, room: string): Promise<void> {
        this.subscriptionService.removeRoomFromSubscription(id, room);

        if(this.subscriptionService.isLastSubscriber(room)) {
            console.log(`Unsubscribing from room: ${room}`);
            await this.redisManager.unsubscribe(room);
        }
    }

    private async handleSendMessage(message: Message): Promise<void> {
        await this.redisManager.publish(message.roomId!, JSON.stringify({
            type: 'SEND_MESSAGE',
            roomId: message.roomId,
            message: message.message
        }))
    }

    public async close(): Promise<void> {
        this.wss.close();
        await this.redisManager.disconnect();
    }
}