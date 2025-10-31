require('dotenv').config();
let { init, exec, sql, transaction } = require('mysqls')
let config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    // connectionLimit: 1000,
    charset: 'utf8mb4',
    ispool: true,
}
init(config)

module.exports = {
    sql, exec, transaction,config
};
