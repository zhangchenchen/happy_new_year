// 导入必要的模块
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const mongoose = require('mongoose');
const path = require('path');
const templateRoutes = require('./routes/templateRoutes');
const fs = require('fs');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

// 创建 Express 应用
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志记录
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../temp/uploads')));
app.use('/output', express.static(path.join(__dirname, '../temp/output'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.gif')) {
      res.set('Content-Type', 'image/gif');
    }
  }
}));
app.use('/templates', express.static(path.join(__dirname, '../public/templates'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.gif')) {
      res.set('Content-Type', 'image/gif');
    }
  }
}));
app.use(express.static(path.join(__dirname, '../public')));

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../temp/uploads');
const outputDir = path.join(__dirname, '../temp/output');
fs.promises.mkdir(uploadDir, { recursive: true }).catch(err => {
  logger.error('创建上传目录失败:', err);
});
fs.promises.mkdir(outputDir, { recursive: true }).catch(err => {
  logger.error('创建输出目录失败:', err);
});

// 注册路由
app.use('/api/user', userRoutes);
app.use('/api', templateRoutes);

// 基础路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '服务正常运行',
    database: mongoose.connection.readyState === 1 ? '数据库已连接' : '数据库未连接',
    env: {
      node_env: process.env.NODE_ENV,
      mongodb_uri: process.env.MONGODB_URI ? '已配置' : '未配置',
      jwt_secret: process.env.JWT_SECRET ? '已配置' : '未配置',
      wechat_config: process.env.WECHAT_APPID && process.env.WECHAT_SECRET ? '已配置' : '未配置'
    }
  });
});

// 404 处理
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

// 确保在数据库连接成功后再启动服务器
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    logger.info(`服务器运行在 http://localhost:${PORT}`);
    logger.info('数据库连接成功');
  });
});

// 监听数据库错误
mongoose.connection.on('error', (err) => {
  logger.error(`数据库连接错误: ${err}`);
}); 