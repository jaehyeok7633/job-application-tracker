const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL 커넥션 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // DATE 컬럼을 'YYYY-MM-DD' 문자열 형태로 유지하여 타임존 오차 방지
});

module.exports = pool;
