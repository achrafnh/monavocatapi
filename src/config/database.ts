import mysql from 'mysql2/promise';
import { logger } from './logger.js';

const createPool = () => {
  try {
    return mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  } catch (error) {
    logger.error('Failed to create database pool:', error);
    throw error;
  }
};

export const pool = createPool();

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('Database connection established successfully');
    connection.release();
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};