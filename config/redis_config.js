const Redis = require("ioredis");
require('dotenv').config();
const redis = new Redis({
  host: process.env.REDIS_HOST, // 或者 Redis 服务器的公网 IP
  port: process.env.REDIS_PORT, // Redis 端口，默认是 6379
});

module.exports = redis;
