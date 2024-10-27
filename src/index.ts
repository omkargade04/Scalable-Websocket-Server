import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";

const wss = new WebSocketServer({port: 8081});

const publishClient = createClient();
publishClient.connect();

const subscribeClient = createClient();
subscribeClient.connect();

const subscriptions: {[keys: string]: {
    ws: WebSocket,
    rooms: string[]
}} = {}

setInterval(()=>{
    console.log(subscriptions)
}, 5000)

wss.on('connection', function conncection(userSocket) {

    const id = randomId();
    subscriptions[id] = {
        ws: userSocket,
        rooms: []
    }

    userSocket.on('message', function message(data) {
        const parsedMessage = JSON.parse(data as unknown as string);

        if(parsedMessage.type === "SUBSCRIBE") {
            subscriptions[id].rooms.push(parsedMessage.room);
            if(oneUserSubscribedTo(parsedMessage.room)) {
                console.log("Subscribing on the Pub sub on room:" + parsedMessage.room);
                subscribeClient.subscribe(parsedMessage.room, (message) => {
                    const parsedMessage = JSON.parse(message);
                    Object.keys(subscriptions).forEach((userId) => {
                        const { ws, rooms } = subscriptions[userId];
                        if(rooms.includes(parsedMessage.roomId)) {
                            ws.send(parsedMessage.message);
                        }
                    })
                })
            }
        }

        if(parsedMessage.type === "UNSUBSCRIBE") {
            subscriptions[id].rooms = subscriptions[id].rooms.filter(x => x !== parsedMessage.roomId);
            if(lastUserLeftRoom(parsedMessage.room)) {
                console.log("Unsubscribing from Pub sub on room: "+ parsedMessage.room);
                subscribeClient.unsubscribe(parsedMessage.room);
            }
        }

        if(parsedMessage.type === "SEND_MESSAGE") {
            const message = parsedMessage.message;
            const roomId = parsedMessage.roomId;

            publishClient.publish(roomId, JSON.stringify({
                type: "SEND_MESSAGE",
                roomId: roomId,
                message
            }))
        }
    })

})

function randomId() {
    return Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
}
function oneUserSubscribedTo(roomId: string) {
    let totalUserSubscribed = 0;
    Object.keys(subscriptions).map((userId)=>{
        if(subscriptions[userId].rooms.includes(roomId)) {
            totalUserSubscribed++;
        }
    })
    if(totalUserSubscribed == 1) return true;
    return false;
}

function lastUserLeftRoom(roomId: string) {
    let totalUserSubscribed = 0;
    Object.keys(subscriptions).map((userId)=>{
        if(subscriptions[userId].rooms.includes(roomId)) {
            totalUserSubscribed++;
        }
    })
    if(totalUserSubscribed === 0) return true;
    return false;
}

