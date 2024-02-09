const { createClient } = require('redis');

// FOR PRODUCTION
// const client = createClient({
//     password: `${process.env.REDIS_PASSWORD}`,
//     socket: {
//         host: `${process.env.REDIS_URI}`,
//         port: process.env.REDIS_PORT
//     }
// });

// FOR DEVELOPEMT
const client = createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
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