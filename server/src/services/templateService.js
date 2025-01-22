const path = require('path');
const fs = require('fs').promises;

class TemplateService {
  constructor() {
    // 模板基础目录
    this.templatesDir = path.join(__dirname, '../../public/templates');
    
    // 模板配置
    this.templates = [
      {
        id: 1,
        name: '新年红',
        description: '喜庆红色主题',
        thumbnail: 'template1/thumbnail.png',
        frames: [
          'template1/frame1.png',
          'template1/frame2.png',
          'template1/frame3.png'
        ],
        config: {
          textPosition: { x: 0.5, y: 0.6 }, // 相对位置（0-1）
          fontSize: 32,
          textColor: '#FFFFFF',
          animation: {
            fps: 10,
            duration: 3000, // 动画持续时间（毫秒）
            effects: ['fadeIn', 'scale']
          }
        },
        isPremium: false
      },
      {
        id: 2,
        name: '金玉满堂',
        description: '金色高贵主题',
        thumbnail: 'template2/thumbnail.png',
        frames: [
          'template2/frame1.png',
          'template2/frame2.png',
          'template2/frame3.png'
        ],
        config: {
          textPosition: { x: 0.5, y: 0.7 },
          fontSize: 36,
          textColor: '#FFD700',
          animation: {
            fps: 12,
            duration: 4000,
            effects: ['slideIn', 'glow']
          }
        },
        isPremium: true
      }
    ];
  }

  /**
   * 获取所有模板
   * @param {Boolean} includePremium 是否包含付费模板
   * @returns {Array} 模板列表
   */
  async getTemplates(includePremium = false) {
    return this.templates.filter(template => 
      includePremium ? true : !template.isPremium
    );
  }

  /**
   * 获取单个模板
   * @param {Number} templateId 模板ID
   * @returns {Object} 模板信息
   */
  async getTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('模板不存在');
    }
    return template;
  }

  /**
   * 获取模板帧图片路径
   * @param {Number} templateId 模板ID
   * @returns {Array<String>} 帧图片的完整路径
   */
  async getTemplateFramePaths(templateId) {
    const template = await this.getTemplate(templateId);
    return template.frames.map(frame => 
      path.join(this.templatesDir, frame)
    );
  }

  /**
   * 获取模板缩略图路径
   * @param {Number} templateId 模板ID
   * @returns {String} 缩略图的完整路径
   */
  async getTemplateThumbnailPath(templateId) {
    const template = await this.getTemplate(templateId);
    return path.join(this.templatesDir, template.thumbnail);
  }

  /**
   * 检查模板文件是否存在
   * @param {Number} templateId 模板ID
   * @returns {Promise<Boolean>} 是否所有文件都存在
   */
  async checkTemplateFiles(templateId) {
    try {
      const template = await this.getTemplate(templateId);
      const files = [
        template.thumbnail,
        ...template.frames
      ];

      // 检查所有文件是否存在
      await Promise.all(
        files.map(file =>
          fs.access(path.join(this.templatesDir, file))
        )
      );

      return true;
    } catch (error) {
      console.error('模板文件检查失败:', error);
      return false;
    }
  }

  /**
   * 应用模板配置
   * @param {Number} templateId 模板ID
   * @param {Object} options 自定义配置
   * @returns {Object} 合并后的配置
   */
  async getTemplateConfig(templateId, options = {}) {
    const template = await this.getTemplate(templateId);
    return {
      ...template.config,
      ...options
    };
  }
}

module.exports = new TemplateService(); 