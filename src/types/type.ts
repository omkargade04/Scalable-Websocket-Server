import { WebSocket as WSWebSocket } from 'ws';

export type CustomWebSocket = WSWebSocket & {
    dispatchEvent?: (event: Event) => boolean;
};

export interface Subscription {
    ws: CustomWebSocket;
    rooms: string[];
}

export interface Subscriptions {
    [key: string] : Subscription;
}

export interface Message {
    type: 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'SEND_MESSAGE';
    room?: string;
    roomId?: string;
    message?: string;
}
