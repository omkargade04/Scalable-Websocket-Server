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
exports.RedisManager = void 0;
const redis_1 = require("redis");
class RedisManager {
    constructor() {
        this.publishClient = (0, redis_1.createClient)();
        this.subscribeClient = (0, redis_1.createClient)();
    }
    static getInstance() {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }
        return RedisManager.instance;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                this.publishClient.connect(),
                this.subscribeClient.connect()
            ]);
        });
    }
    publish(channel, message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.publishClient.publish(channel, message);
        });
    }
    subscribe(channel, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.subscribeClient.subscribe(channel, callback);
        });
    }
    unsubscribe(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.subscribeClient.unsubscribe(channel);
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                this.publishClient.disconnect(),
                this.subscribeClient.disconnect()
            ]);
        });
    }
}
exports.RedisManager = RedisManager;
