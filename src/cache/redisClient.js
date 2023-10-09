const { createClient } = require('redis');

const client = createClient({
    password: `${process.env.REDIS_PASSWORD}`,
    socket: {
        host: `${process.env.REDIS_URI}`,
        port: process.env.REDIS_PORT
    }
});

(async () => {
    try {
        await client.connect();
        console.log(`Redis Connected to Port ${process.env.REDIS_PORT}`)
    } catch (error) {
        console.log(error);
    }
})();

module.exports = { client };