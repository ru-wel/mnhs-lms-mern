import pg from 'pg';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const db = new pg.Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "MNHS-DB",
    password: process.env.DB_PASS || "admin",
    port: process.env.DB_PORT || 5432
});

const sequelize = new Sequelize("MNHS-DB", "postgres", "admin", { // change to process.env
  host: 'localhost',
  dialect: 'postgres',
});

db.connect();

export { db, sequelize };