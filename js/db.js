/*import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
// 创建两个数据库连接池
const adminPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'admin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const employeePool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'employee_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
export { adminPool, employeePool };*/

import mysql from 'mysql2/promise';
import { config } from './env.js';

// 创建两个数据库连接池
const createPool = (database) => mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
export const adminPool = createPool('admin_db');
export const employeePool = createPool('employee_db');