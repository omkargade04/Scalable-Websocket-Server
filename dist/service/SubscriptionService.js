"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const helper_1 = require("../utils/helper");
class SubscriptionService {
    constructor() {
        this.subscriptions = {};
    }
    addSubscription(ws) {
        const id = (0, helper_1.generateRandomId)();
        this.subscriptions[id] = {
            ws,
            rooms: []
        };
        return id;
    }
    addRoomToSubscription(id, room) {
        if (this.subscriptions[id]) {
            this.subscriptions[id].rooms.push(room);
        }
    }
    removeRoomFromSubscription(id, room) {
        if (this.subscriptions[id]) {
            this.subscriptions[id].rooms = this.subscriptions[id].rooms.filter(roomId => roomId != room);
        }
    }
    isFirstSubscriber(room) {
        let totalUserSubscribed = 0;
        Object.values(this.subscriptions).forEach((subscription) => {
            if (subscription.rooms.includes(room)) {
                totalUserSubscribed++;
            }
        });
        if (totalUserSubscribed === 1)
            return true;
        return false;
    }
    isLastSubscriber(room) {
        let totalUserSubscribed = 0;
        Object.values(this.subscriptions).forEach((subscription) => {
            if (subscription.rooms.includes(room)) {
                totalUserSubscribed++;
            }
        });
        if (totalUserSubscribed === 0)
            return true;
        return false;
    }
    broadCastToRoom(room, message) {
        Object.values(this.subscriptions).forEach((subscription) => {
            if (subscription.rooms.includes(room)) {
                subscription.ws.send(message);
            }
        });
    }
    getSubscriptions() {
        return this.subscriptions;
    }
}
exports.SubscriptionService = SubscriptionService;
