import { config } from 'dotenv';
config();
import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
});

console.log('Pool Created!!')

export default pool;