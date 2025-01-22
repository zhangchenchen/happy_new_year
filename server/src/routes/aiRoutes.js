const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * 生成祝福语
 * POST /api/ai/generate-greeting
 * @param {string} receiver - 接收者
 * @param {string} relationship - 与接收者的关系
 * @param {string} style - 祝福语风格
 * @param {string} [content] - 共同经历（可选）
 */
router.post('/generate-greeting', async (req, res) => {
  try {
    const { receiver, relationship, style, content } = req.body;

    // 参数验证
    if (!receiver || !relationship || !style) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 调用 AI 服务生成祝福语
    const greeting = await aiService.generateGreeting({
      receiver,
      relationship,
      style,
      content // 可选参数
    });

    // 返回生成的祝福语
    res.json({
      success: true,
      data: {
        greeting
      }
    });

  } catch (error) {
    logger.error('生成祝福语失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成祝福语失败'
    });
  }
});

module.exports = router; 