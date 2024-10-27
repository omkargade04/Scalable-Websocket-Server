"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const ws_1 = require("ws");
const RedisManager_1 = require("../manager/RedisManager");
const SubscriptionService_1 = require("./SubscriptionService");
class WebSocketService {
    constructor(port) {
        this.wss = new ws_1.WebSocketServer({ port });
        this.redisManager = RedisManager_1.RedisManager.getInstance();
        this.subscriptionService = new SubscriptionService_1.SubscriptionService();
        this.initialize();
    }
    initialize() {
        this.wss.on('connection', this.handleConnection.bind(this));
        setInterval(() => {
            console.log(this.subscriptionService.getSubscriptions());
        }, 5000);
    }
    handleConnection(ws) {
        const id = this.subscriptionService.addSubscription(ws);
        ws.on('message', (data) => __awaiter(this, void 0, void 0, function* () {
            const parsedMessage = JSON.parse(data.toString());
            yield this.handleMessage(id, parsedMessage);
        }));
    }
    handleMessage(id, message) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (message.type) {
                case 'SUBSCRIBE':
                    yield this.handleSubscribe(id, message.room);
                    break;
                case 'UNSUBSCRIBE':
                    yield this.handleUnsubscribe(id, message.roomId);
                    break;
                case 'SEND_MESSAGE':
                    yield this.handleSendMessage(message);
                    break;
            }
        });
    }
    handleSubscribe(id, room) {
        return __awaiter(this, void 0, void 0, function* () {
            this.subscriptionService.addRoomToSubscription(id, room);
            if (this.subscriptionService.isFirstSubscriber(room)) {
                console.log(`Subscribing to room: ${room}`);
                yield this.redisManager.subscribe(room, (message) => {
                    const parsedMessage = JSON.parse(message);
                    this.subscriptionService.broadCastToRoom(parsedMessage.roomId, parsedMessage.message);
                });
            }
        });
    }
    handleUnsubscribe(id, room) {
        return __awaiter(this, void 0, void 0, function* () {
            this.subscriptionService.removeRoomFromSubscription(id, room);
            if (this.subscriptionService.isLastSubscriber(room)) {
                console.log(`Unsubscribing from room: ${room}`);
                yield this.redisManager.unsubscribe(room);
            }
        });
    }
    handleSendMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.redisManager.publish(message.room, JSON.stringify({
                type: 'SEND_MESSAGE',
                roomId: message.roomId,
                message: message.message
            }));
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.wss.close();
            yield this.redisManager.disconnect();
        });
    }
}
exports.WebSocketService = WebSocketService;
