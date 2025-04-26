import express from 'express';
import { adminPool, employeePool } from '../config/db.js';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { body, validationResult } from 'express-validator';


const router = express.Router();

// Session 配置
router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 3600000 // 1小时
  }
}));

router.post('/login', async (req, res) => {
  try {
    const { userType, email, password } = req.body;

    // 参数验证
    if (!['admin', 'employee'].includes(userType)) {
      return res.status(400).json({ error: '无效的用户类型' });
    }

    // 选择数据库
    const pool = userType === 'admin' ? adminPool : employeePool;
    const table = userType === 'admin' ? 'admin_users' : 'employees';

    // 查询用户
    const [rows] = await pool.query(
      `SELECT * FROM ${table} WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: '邮箱未注册' });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: '密码错误' });
    }

    res.json({ 
      success: true,
      user: {
        id: user.id,
        type: userType
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});
router.post('/register', async (req, res) => {
  try {
    const { email, password, userType = 'employee' } = req.body;

    // 密码复杂度验证
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: '密码需至少8位，包含字母和数字' });
    }

    // 检查邮箱唯一性
    const checkQuery = `
      (SELECT email FROM admin_users WHERE email = ?)
      UNION
      (SELECT email FROM employees WHERE email = ?)
    `;
    const [existing] = await adminPool.query(checkQuery, [email, email]);

    if (existing.length > 0) {
      return res.status(409).json({ error: '邮箱已被注册' });
    }

    // 密码哈希
    const hash = await bcrypt.hash(password, 12);

    // 插入数据库
    const pool = userType === 'admin' ? adminPool : employeePool;
    await pool.query(
      `INSERT INTO ${userType === 'admin' ? 'admin_users' : 'employees'} 
      (email, password_hash)
      VALUES (?, ?)`,
      [email, hash]
    );

    res.json({ success: true });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // 跨数据库查询
    const [adminUser] = await adminPool.query(
      'SELECT * FROM admin_users WHERE email = ?', 
      [email]
    );
    
    const [employeeUser] = await employeePool.query(
      'SELECT * FROM employees WHERE email = ?',
      [email]
    );

    const user = adminUser[0] || employeeUser[0];
    if (!user) {
      return res.status(404).json({ error: '邮箱未注册' });
    }

    // 生成重置令牌（示例）
    const token = crypto.randomBytes(32).toString('hex');
    const expireTime = Date.now() + 3600000; // 1小时有效期

    // 更新数据库
    const updateQuery = `
      UPDATE ${userType === 'admin' ? 'admin_users' : 'employees'}
      SET reset_token = ?, reset_expires = ?
      WHERE id = ?
    `;
    
    await pool.query(updateQuery, [token, expireTime, user.id]);

    // 发送邮件逻辑（需自行实现）
    // sendResetEmail(email, token);

    res.json({ success: true });

  } catch (error) {
    console.error('密码重置错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});
