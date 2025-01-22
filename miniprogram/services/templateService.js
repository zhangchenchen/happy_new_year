const { request } = require('../utils/request');
const { API_BASE_URL, API_PATHS } = require('../config/config');

// 处理图片URL，添加完整的服务器地址
const getFullImageUrl = (path) => {
  // 移除API路径部分，因为静态资源直接从根路径访问
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path}`;
};

const templateService = {
  // 获取所有模板列表
  async getTemplates() {
    try {
      const response = await request({
        url: `${API_BASE_URL}${API_PATHS.templates}`,
        method: 'GET'
      });
      
      // 处理图片URL，使用预览GIF
      const templates = response.data.map(template => ({
        ...template,
        thumbnail: getFullImageUrl(`/templates/${template.id}/preview.gif`), // 使用预生成的GIF
        frames: template.frames.map(frame => getFullImageUrl(frame))
      }));
      
      return templates;
    } catch (error) {
      console.error('获取模板列表失败:', error);
      throw error;
    }
  },

  // 获取单个模板详情
  async getTemplate(templateId) {
    try {
      const response = await request({
        url: `${API_BASE_URL}${API_PATHS.templateDetail(templateId)}`,
        method: 'GET'
      });
      
      // 处理图片URL，使用预览GIF
      const template = {
        ...response.data,
        thumbnail: getFullImageUrl(`/templates/${templateId}/preview.gif`), // 使用预生成的GIF
        frames: response.data.frames.map(frame => getFullImageUrl(frame))
      };
      
      return template;
    } catch (error) {
      console.error('获取模板详情失败:', error);
      throw error;
    }
  },

  // 生成GIF
  async generateGIF(templateId, imageUrl, text) {
    try {
      if (!templateId) {
        throw new Error('模板ID不能为空');
      }
      if (!text) {
        throw new Error('请输入祝福语');
      }

      // 处理图片URL，转换为相对路径
      let imagePath = '';
      if (imageUrl) {
        // 从完整URL中提取相对路径
        const match = imageUrl.match(/\/uploads\/.+$/);
        imagePath = match ? match[0] : '';
      }

      console.log('开始生成GIF:', {
        templateId,
        imageUrl,
        imagePath,
        text
      });
      
      const response = await request({
        url: `${API_BASE_URL}${API_PATHS.generate}`,
        method: 'POST',
        data: {
          templateId,
          imageUrl: imageUrl,  // 传递完整的URL
          text
        }
      });
      
      // 检查响应状态
      if (!response.success) {
        throw new Error(response.message || '生成GIF失败');
      }

      // 确保返回了URL
      if (!response.data || !response.data.url) {
        throw new Error('服务器返回的数据缺少URL');
      }

      // 返回完整的URL
      const gifUrl = getFullImageUrl(response.data.url);
      console.log('生成的GIF URL:', gifUrl);
      
      return {
        success: true,
        url: gifUrl
      };
    } catch (error) {
      console.error('生成GIF失败:', error);
      throw error;
    }
  }
};

module.exports = templateService; 