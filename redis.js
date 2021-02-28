const redis = require('redis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1'
const redisPort = process.env.REDIS_PORT || 6379

module.exports = () => {
    const client = redis.createClient(redisPort, redisHost, {
        auth_pass: null
    })

    return client;
}