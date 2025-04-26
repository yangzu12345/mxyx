import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import { config } from './config/env.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: config.NODE_ENV === 'development' 
    ? 'http://localhost:5500' 
    : 'https://yourdomain.com',
  credentials: true
}));

app.use(express.json());

// 路由
app.use('/api/auth', authRouter);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});