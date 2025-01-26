const { API_BASE_URL, API_PATHS, replacePathParams } = require('../config/config');

// 处理图片URL，添加完整的服务器地址
const getFullImageUrl = (path) => {
  // 移除API路径部分，因为静态资源直接从根路径访问
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path}`;
};

class TemplateService {
  /**
   * 获取模板列表
   */
  async getTemplates() {
    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE_URL}${API_PATHS.templates}`,
          method: 'GET',
          success: resolve,
          fail: reject
        });
      });

      if (response.statusCode !== 200) {
        throw new Error(`获取模板列表失败: ${response.statusCode}`);
      }

      // 处理图片URL，使用预览GIF
      const templates = response.data.data.map(template => ({
        ...template,
        thumbnail: getFullImageUrl(`/templates/${template.id}/preview.gif`), // 使用预生成的GIF
        frames: template.frames.map(frame => getFullImageUrl(frame))
      }));
      
      return templates;
    } catch (error) {
      console.error('获取模板列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取模板详情
   * @param {string} id 模板ID
   */
  async getTemplate(id) {
    try {
      const url = `${API_BASE_URL}${replacePathParams(API_PATHS.templateDetail, { id })}`;
      console.log('获取模板详情URL:', url);

      const response = await new Promise((resolve, reject) => {
        wx.request({
          url,
          method: 'GET',
          success: resolve,
          fail: reject
        });
      });

      if (response.statusCode !== 200) {
        throw new Error(`获取模板详情失败: ${response.statusCode}`);
      }

      // 处理图片URL，使用预览GIF
      const template = {
        ...response.data.data,
        thumbnail: getFullImageUrl(`/templates/${id}/preview.gif`), // 使用预生成的GIF
        frames: response.data.data.frames.map(frame => getFullImageUrl(frame))
      };
      
      return template;
    } catch (error) {
      console.error('获取模板详情失败:', error);
      throw error;
    }
  }

  /**
   * 生成GIF
   * @param {string} templateId 模板ID
   * @param {string} imageUrl 图片URL
   * @param {string} text 文字内容
   */
  async generateGIF(templateId, imageUrl, text) {
    console.log('开始生成GIF，参数:', { templateId, imageUrl, text });

    // 获取模板配置
    const template = await this.getTemplate(templateId);
    console.log('获取到模板配置:', template);

    // 从图片URL中提取相对路径
    let imagePath = '';
    if (imageUrl) {
      // 尝试从URL中提取uploads路径
      const matches = imageUrl.match(/uploads\/[^?#]+/);
      if (matches) {
        imagePath = '/' + matches[0];
        console.log('提取的图片路径:', imagePath);
      }
    }

    const params = {
      templateId,
      imagePath,
      text,
      config: template.config
    };

    console.log('发送请求参数:', params);

    // 使用 Promise 包装 wx.request
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_BASE_URL}${API_PATHS.generate}`,
        method: 'POST',
        data: params,
        timeout: 30000, // 设置30秒超时
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 0) {
            // 优先使用完整URL
            const gifUrl = res.data.data.fullUrl || getFullImageUrl(res.data.data.url);
            console.log('生成的GIF URL:', gifUrl);
            resolve(gifUrl);
          } else {
            reject(new Error(res.data.message || `生成GIF失败: ${res.statusCode}`));
          }
        },
        fail: reject
      });
    });
  }
}

module.exports = new TemplateService(); 