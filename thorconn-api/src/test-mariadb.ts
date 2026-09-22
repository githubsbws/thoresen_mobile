import 'dotenv/config'
import mariadb from 'mariadb'

async function main() {
    console.log('Testing MariaDB driver directly...')

    const pool = mariadb.createPool({
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_DATABASE!,

        connectionLimit: 1,
        connectTimeout: 10000,
        acquireTimeout: 10000,
    })

    let conn

    try {
        conn = await pool.getConnection()

        console.log('✅ MariaDB connection successful!')

        const result = await conn.query('SELECT 1 AS test')

        console.log('Query result:')
        console.log(result)

    } catch (error) {
        console.error('❌ MariaDB error:')
        console.error(error)

    } finally {
        if (conn) {
            conn.release()
        }

        await pool.end()
    }
}

main()