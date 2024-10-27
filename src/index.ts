import { RedisManager } from "./manager/RedisManager";
import { WebSocketService } from "./service/WebSocketService";


async function main() {
    try{
        const redisManager = RedisManager.getInstance();
        await redisManager.connect();

        const wsService = new WebSocketService(8080);

        process.on('SIGINT', async () => {
            await wsService.close();
            process.exit(0);
        });

    } catch(error: any) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
}

main();