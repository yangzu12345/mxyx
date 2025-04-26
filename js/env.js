import dotenv from 'dotenv';
dotenv.config();

export const config = {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'web_user',
  DB_PASSWORD: process.env.DB_PASSWORD,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
DB_HOST=localhost
DB_USER=web_user
DB_PASSWORD=your_db_password
SESSION_SECRET=your_session_secret
NODE_ENV=development