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
const RedisManager_1 = require("./manager/RedisManager");
const WebSocketService_1 = require("./service/WebSocketService");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const redisManager = RedisManager_1.RedisManager.getInstance();
            yield redisManager.connect();
            const wsService = new WebSocketService_1.WebSocketService(8080);
            process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
                yield wsService.close();
                process.exit(0);
            }));
        }
        catch (error) {
            console.error('Failed to start the server:', error);
            process.exit(1);
        }
    });
}
main();
