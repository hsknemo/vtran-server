require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
})

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
})

prisma.$on('query', (e) => {
  console.log('---------------------------start-------------------------------')
  console.log('Query:', e.query)
  console.log('Params:', e.params)
  console.log('Duration:', e.duration + 'ms')
  console.log('---------------------------end-------------------------------')
})

module.exports = prisma
