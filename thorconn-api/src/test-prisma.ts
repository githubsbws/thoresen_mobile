import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,

    connectionLimit: 1,
    connectTimeout: 10000,
    acquireTimeout: 10000,
})

const prisma = new PrismaClient({
    adapter,
})

async function main() {
    console.log('Testing Prisma connection...')

    console.log({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
    })

    const result = await prisma.$queryRaw`
        SELECT 1 AS test
    `

    console.log('✅ Prisma connected successfully!')
    console.log(result)
}

main()
    .catch((error) => {
        console.error('❌ Prisma error:')
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })