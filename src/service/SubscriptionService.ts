import { Subscription, Subscriptions, CustomWebSocket} from "../types/type";
import { generateRandomId } from "../utils/helper";


export class SubscriptionService {
    private subscriptions: Subscriptions = {};

    public addSubscription(ws: CustomWebSocket): string {
        const id = generateRandomId();
        this.subscriptions[id] = {
            ws,
            rooms: []
        }
        return id;
    }

    public addRoomToSubscription(id: string, room: string): void {
        if(this.subscriptions[id]) {
            this.subscriptions[id].rooms.push(room);
        }
    }

    public removeRoomFromSubscription(id: string, room: string): void {
        if(this.subscriptions[id]) {
            this.subscriptions[id].rooms = this.subscriptions[id].rooms.filter(roomId => roomId != room)
        }
    }

    public isFirstSubscriber(room: string): boolean {
        let totalUserSubscribed = 0;
        Object.values(this.subscriptions).forEach((subscription) => {
            if(subscription.rooms.includes(room)) {
                totalUserSubscribed++;
            }
        });
        if(totalUserSubscribed === 1) return true;
        return false;
    }

    public isLastSubscriber(room: string): boolean {
        let totalUserSubscribed = 0;
        Object.values(this.subscriptions).forEach((subscription) => {
            if(subscription.rooms.includes(room)) {
                totalUserSubscribed++;
            }
        });
        if(totalUserSubscribed === 0) return true;
        return false;
    }

    public broadCastToRoom(room: string, message: string): void {
        Object.values(this.subscriptions).forEach((subscription) => {
            if(subscription.rooms.includes(room)) {
                subscription.ws.send(message);
            }
        })
    }

    public getSubscriptions(): Subscriptions {
        return this.subscriptions;
    }
}