import { createClient, type RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: RedisClientType | null = null;

export const getRedisClient = () => {
    if (!redisClient) {
        const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        redisClient = createClient({ url: redisUrl });
        redisClient.on('error', (error: Error) => {
            console.error('Redis client error:', error);
        });
    }

    return redisClient;
};

export const connectRedis = async () => {
    const client = getRedisClient();
    if (!client.isOpen) {
        await client.connect();
        console.log('Redis connected successfully');
    }

    return client;
};
