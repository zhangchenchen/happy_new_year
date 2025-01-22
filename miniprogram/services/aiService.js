const { API_BASE_URL, API_PATHS } = require('../config/config');

/**
 * AI 服务
 */
class AIService {
  /**
   * 生成祝福语
   * @param {Object} params 生成参数
   * @param {string} params.receiverTitle 接收者称谓
   * @param {string} params.relationship 与接收者的关系
   * @param {string} [params.story] 共同经历（可选）
   * @returns {Promise<string>} 生成的祝福语
   */
  async generateGreeting(params) {
    try {
      console.log('调用 AI 生成祝福语，参数:', params);
      
      // 使用 Promise 包装 wx.request
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE_URL}${API_PATHS.ai.generateGreeting}`,
          method: 'POST',
          data: {
            receiver: params.receiverTitle,
            relationship: params.relationship,
            content: params.story || '',
            style: '温暖诚恳'  // 默认风格
          },
          success: (res) => {
            console.log('请求成功:', res);
            resolve(res);
          },
          fail: (error) => {
            console.error('请求失败:', error);
            reject(new Error(error.errMsg || '网络请求失败'));
          }
        });
      });

      console.log('AI 生成结果:', response);

      // 检查请求是否成功
      if (response.statusCode !== 200) {
        throw new Error(`请求失败: ${response.statusCode}`);
      }

      // 检查响应数据
      const responseData = response.data;
      if (!responseData || !responseData.success) {
        throw new Error(responseData?.message || '生成失败');
      }

      return responseData.data.greeting;

    } catch (error) {
      console.error('生成祝福语失败:', error);
      throw error;
    }
  }
}

module.exports = new AIService(); 