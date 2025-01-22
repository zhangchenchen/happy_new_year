const axios = require('axios');
const logger = require('../utils/logger');

// 预设的祝福语模板
const GREETING_TEMPLATES = [
  '愿你在新的一年里事事顺心，梦想成真！',
  '祝你新年快乐，身体健康，万事如意！',
  '愿新年带给你无限的希望和惊喜！',
  '祝你在新的一年里幸福安康，前程似锦！',
  '愿你的新年充满欢笑和温暖，事业蒸蒸日上！'
];

class AIService {
  constructor() {
    // 添加调试日志
    console.log('环境变量:', {
      USE_REAL_AI: process.env.USE_REAL_AI,
      USE_REAL_AI_TYPE: typeof process.env.USE_REAL_AI,
      ZHIPU_API_KEY: process.env.ZHIPU_API_KEY ? '已配置' : '未配置'
    });

    this.useRealAI = process.env.USE_REAL_AI === 'true';
    this.zhipuApiKey = process.env.ZHIPU_API_KEY;

    // 添加实例配置日志
    console.log('AI Service 配置:', {
      useRealAI: this.useRealAI,
      hasApiKey: !!this.zhipuApiKey
    });
  }

  /**
   * 生成祝福语
   * @param {Object} params 生成参数
   * @param {string} params.receiver 接收者
   * @param {string} params.relationship 与接收者的关系
   * @param {string} params.style 祝福语风格
   * @param {string} [params.content] 共同经历（可选）
   * @returns {Promise<string>} 生成的祝福语
   */
  async generateGreeting({ receiver, relationship, style, content }) {
    try {
      // 记录请求参数
      logger.info('生成祝福语，参数:', { receiver, relationship, style, content, useRealAI: this.useRealAI });

      if (!this.useRealAI) {
        // 测试环境：随机返回预设模板
        const randomIndex = Math.floor(Math.random() * GREETING_TEMPLATES.length);
        let greeting = GREETING_TEMPLATES[randomIndex];
        
        // 如果有共同经历，添加到祝福语中
        if (content) {
          greeting = `记得${content}，${greeting}`;
        }
        
        logger.info('测试环境，返回预设祝福语:', greeting);
        return greeting;
      }

      // 生产环境：调用智普 AI
      if (!this.zhipuApiKey) {
        throw new Error('未配置智普 AI API Key');
      }

      // 构建 prompt
      const prompt = this._buildPrompt({ receiver, relationship, style, content });
      
      // 调用智普 AI API
      const response = await this._callZhipuAPI(prompt);
      
      logger.info('AI 生成祝福语成功:', response);
      return response;

    } catch (error) {
      logger.error('生成祝福语失败:', error);
      // 发生错误时返回默认祝福语
      return '祝你新年快乐，万事如意！';
    }
  }

  /**
   * 构建 prompt
   * @private
   */
  _buildPrompt({ receiver, relationship, style, content }) {
    let prompt = `请以${relationship}的身份，用${style}的语气，给${receiver}写一段新年祝福语。`;
    
    if (content) {
      prompt += `\n要在祝福中自然地融入这段共同经历：${content}。`;
    }
    
    prompt += `\n要求：
1. 字数在60字以内
2. 语言要温暖有力
3. 要体现出与${receiver}的关系
4. 要符合${style}的风格特点`;

    if (content) {
      prompt += '\n5. 要巧妙地将共同经历融入祝福中';
    }

    return prompt;
  }

  /**
   * 调用智普 AI API
   * @private
   */
  async _callZhipuAPI(prompt) {
    try {
      const response = await axios.post(
        'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        {
          model: "glm-4",  // 使用 GLM-4 模型
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 100,  // 限制返回长度
          stream: false     // 非流式响应
        },
        {
          headers: {
            'Authorization': `Bearer ${this.zhipuApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 提取 AI 返回的文本
      return response.data.choices[0].message.content;

    } catch (error) {
      logger.error('调用智普 AI API 失败:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new AIService(); 