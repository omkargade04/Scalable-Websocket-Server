import { createClient, RedisClientType } from "redis";

export class RedisManager {
    private static instance: RedisManager;
    private publishClient: RedisClientType;
    private subscribeClient: RedisClientType;

    private constructor() {
        this.publishClient = createClient();
        this.subscribeClient = createClient();
    }

    public static getInstance(): RedisManager {
        if(!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }
        return RedisManager.instance;
    }

    public async connect(): Promise<void> {
        await Promise.all([
            this.publishClient.connect(),
            this.subscribeClient.connect()
        ])
    }

    public async publish(channel: string, message: string): Promise<void> {
        await this.publishClient.publish(channel, message);
    }

    public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        await this.subscribeClient.subscribe(channel, callback);
    }

    public async unsubscribe(channel: string): Promise<void> {
        await this.subscribeClient.unsubscribe(channel);
    }

    public async disconnect(): Promise<void> {
        await Promise.all([
            this.publishClient.disconnect(),
            this.subscribeClient.disconnect()
        ]);
    }
}