"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const subscriptions = {};
setInterval(() => {
    console.log(subscriptions);
}, 5000);
wss.on('connection', function conncection(userSocket) {
    const id = randomId();
    subscriptions[id] = {
        ws: userSocket,
        rooms: []
    };
    userSocket.on('message', function message(data) {
        const parsedMessage = JSON.parse(data);
        if (parsedMessage.type === "SUBSCRIBE") {
            subscriptions[id].rooms.push(parsedMessage.roomId);
        }
        if (parsedMessage.type === "SEND_MESSAGE") {
            const message = parsedMessage.message;
            const roomId = parsedMessage.roomId;
            Object.keys(subscriptions).forEach((userId) => {
                const { ws, rooms } = subscriptions[userId];
                if (rooms.includes(roomId)) {
                    ws.send(message);
                }
            });
        }
    });
});
function randomId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
