const { Redis } = require("ioredis");
const redis = require("redis");
const REDIS_PORT = process.env.REDIS_PORT || 6379
const redisClient = redis.createClient(REDIS_PORT); 

redisClient.on('connect', () => console.log(`Redis is connected on ${REDIS_PORT}`))
redisClient.on('error', (error) => console.log(error));

// const redisClient = new Redis();

module.exports = { redisClient }