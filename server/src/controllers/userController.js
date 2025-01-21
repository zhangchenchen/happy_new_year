const User = require('../models/user');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const { code2Session } = require('../utils/wxUtils');

/**
 * 微信登录
 */
exports.wxLogin = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: '缺少登录code'
      });
    }

    // 调用微信接口获取openid和session_key
    const { openid, session_key } = await code2Session(code);
    
    // 查找或创建用户
    let user = await User.findOne({ openid });
    
    if (!user) {
      user = await User.create({
        openid,
        sessionKey: session_key
      });
      logger.info(`新用户注册: ${openid}`);
    } else {
      // 更新session_key
      user.sessionKey = session_key;
      await user.save();
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user._id, openid: user.openid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          isVip: user.isVip
        }
      }
    });
    
  } catch (error) {
    logger.error('登录错误:', error);
    res.status(500).json({
      status: 'error',
      message: '登录失败'
    });
  }
};

/**
 * 更新用户信息
 */
exports.updateUserInfo = async (req, res) => {
  try {
    const { nickname, avatarUrl } = req.body;
    const user = req.user;

    // 更新用户信息
    user.nickname = nickname;
    user.avatarUrl = avatarUrl;
    await user.save();

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          isVip: user.isVip
        }
      }
    });
    
  } catch (error) {
    logger.error('更新用户信息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '更新用户信息失败'
    });
  }
}; 