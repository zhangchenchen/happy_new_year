const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

// 微信登录
router.post('/login', userController.wxLogin);

// 更新用户信息（需要认证）
router.put('/update', auth, userController.updateUserInfo);

module.exports = router; 