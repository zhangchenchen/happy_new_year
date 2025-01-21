const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: '未登录'
      });
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 查找用户
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: '认证失败'
    });
  }
}; 