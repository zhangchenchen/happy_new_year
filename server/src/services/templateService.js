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
   * 获取所有可用模板列表
   * @returns {Promise<Array>} 模板列表
   */
  async getTemplates() {
    try {
      // 读取模板目录
      const templates = [];
      const dirs = await fs.readdir(this.templatesDir);
      
      for (const dir of dirs) {
        const templatePath = path.join(this.templatesDir, dir);
        const stats = await fs.stat(templatePath);
        
        if (stats.isDirectory()) {
          // 读取模板配置和缩略图
          const template = {
            id: dir,
            name: dir === 'template1' ? '清新烟花' : '金玉满堂',
            thumbnail: `/templates/${dir}/thumbnail.png`,
            frames: [
              `/templates/${dir}/frame1.png`,
              `/templates/${dir}/frame2.png`,
              `/templates/${dir}/frame3.png`
            ],
            config: {
              imageArea: {
                x: 200,
                y: 250,
                width: 400,
                height: 400
              },
              textArea: {
                x: 400,
                y: 750,
                maxWidth: 600,
                fontSize: 42,
                color: '#2c3e50',
                font: 'Microsoft YaHei'
              }
            }
          };
          
          templates.push(template);
        }
      }
      
      return templates;
    } catch (error) {
      console.error('获取模板列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个模板详情
   * @param {string} templateId 模板ID
   * @returns {Promise<Object>} 模板详情
   */
  async getTemplate(templateId) {
    try {
      const templatePath = path.join(this.templatesDir, templateId);
      const stats = await fs.stat(templatePath);
      
      if (!stats.isDirectory()) {
        throw new Error('模板不存在');
      }

      // 返回模板详情
      return {
        id: templateId,
        name: templateId === 'template1' ? '清新烟花' : '金玉满堂',
        thumbnail: `/templates/${templateId}/thumbnail.png`,
        frames: [
          `/templates/${templateId}/frame1.png`,
          `/templates/${templateId}/frame2.png`,
          `/templates/${templateId}/frame3.png`
        ],
        config: {
          imageArea: {
            x: 200,
            y: 250,
            width: 400,
            height: 400
          },
          textArea: {
            x: 400,
            y: 750,
            maxWidth: 600,
            fontSize: 42,
            color: '#2c3e50',
            font: 'Microsoft YaHei'
          }
        }
      };
    } catch (error) {
      console.error('获取模板详情失败:', error);
      throw error;
    }
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

  // 生成自定义GIF
  async generateCustomGIF({ templateId, imagePath, text, config, isPreview = false }) {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('模板不存在');
      }

      // 如果是预览模式，使用默认图片
      const finalImagePath = isPreview ? template.previewImage : (imagePath || template.previewImage);

      // 生成GIF
      const gifBuffer = await imageService.generateGIF({
        templatePath: template.path,
        imagePath: finalImagePath,
        text: text || '',
        config: config || template.config
      });

      return gifBuffer;
    } catch (error) {
      console.error('生成自定义GIF失败:', error);
      throw error;
    }
  }
}

module.exports = new TemplateService(); 