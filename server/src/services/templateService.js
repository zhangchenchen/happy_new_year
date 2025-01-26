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
          duration: 3000,
          fps: 12,
          imageArea: {
            x: 200,
            y: 250,
            width: 400,
            height: 400,
            animation: {
              type: 'sequence',
              effects: [
                { name: 'fadeIn', duration: 500, delay: 0 },
                { name: 'scale', duration: 1000, delay: 500, from: 0.8, to: 1.1 },
                { name: 'rotate', duration: 1000, delay: 1500, angle: 360 }
              ]
            },
            style: {
              borderRadius: '50%',
              border: '5px solid #FFD700',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
            }
          },
          textArea: {
            x: 400,
            y: 850,
            maxWidth: 700,
            fontSize: 32,
            color: '#E6B422',
            font: 'SimSun, Microsoft YaHei',
            animation: {
              type: 'sequence',
              effects: [
                { name: 'typewriter', duration: 1000, delay: 0 },
                { name: 'glow', duration: 2000, delay: 1000, color: '#E6B422' }
              ]
            },
            style: {
              textShadow: '2px 2px 4px rgba(230, 180, 34, 0.4)',
              fontWeight: 'bold',
              letterSpacing: '3px'
            }
          },
          backgroundEffects: [
            {
              type: 'particles',
              config: {
                particleCount: 50,
                color: '#FFD700',
                size: { min: 2, max: 5 },
                speed: { min: 1, max: 3 }
              }
            }
          ]
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
          duration: 3000,
          fps: 12,
          imageArea: {
            x: 300,
            y: 300,
            width: 200,
            height: 200,
            animation: {
              type: 'sequence',
              effects: [
                { name: 'fadeIn', duration: 500, delay: 0 },
                { name: 'scale', duration: 1000, delay: 500, from: 0.95, to: 1.05 },
                { name: 'glow', duration: 1500, delay: 1500, color: '#FFD700' }
              ]
            },
            style: {
              borderRadius: '50%',
              border: '4px solid #D4AF37',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }
          },
          textArea: {
            x: 400,
            y: 650,
            maxWidth: 700,
            fontSize: 38,
            color: '#FFFFFF',
            font: 'SimSun, Microsoft YaHei',
            animation: {
              type: 'sequence',
              effects: [
                { name: 'fadeInUp', duration: 800, delay: 200 },
                { name: 'glow', duration: 2000, delay: 1000, color: '#FFFFFF' }
              ]
            },
            style: {
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.8)',
              fontWeight: 'bold',
              letterSpacing: '4px',
              textAlign: 'center'
            }
          },
          backgroundEffects: [
            {
              type: 'particles',
              config: {
                particleCount: 35,
                color: ['#FFD700', '#D4AF37', '#B8860B'],
                size: { min: 3, max: 6 },
                speed: { min: 1, max: 2 },
                opacity: { min: 0.3, max: 0.6 }
              }
            }
          ]
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
          // 从 this.templates 中找到对应的模板配置
          const templateConfig = this.templates.find(t => `template${t.id}` === dir);
          if (!templateConfig) continue;  // 如果找不到配置就跳过

          // 构建模板对象
          const template = {
            id: dir,
            name: templateConfig.name,
            description: templateConfig.description,
            thumbnail: `/templates/${dir}/thumbnail.png`,
            frames: templateConfig.frames.map(frame => `/${frame}`),
            config: templateConfig.config,
            isPremium: templateConfig.isPremium
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

      // 从 this.templates 中找到对应的模板配置
      const templateConfig = this.templates.find(t => `template${t.id}` === templateId);
      if (!templateConfig) {
        throw new Error('模板配置不存在');
      }

      // 返回模板详情
      return {
        id: templateId,
        name: templateConfig.name,
        description: templateConfig.description,
        thumbnail: `/templates/${templateId}/thumbnail.png`,
        frames: templateConfig.frames.map(frame => `/${frame}`),
        config: templateConfig.config,
        isPremium: templateConfig.isPremium
      };
    } catch (error) {
      console.error('获取模板详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取模板帧图片路径
   * @param {string} templateId 模板ID
   * @returns {Array<String>} 帧图片的完整路径
   */
  async getTemplateFramePaths(templateId) {
    const template = await this.getTemplate(templateId);
    return template.frames.map(frame => 
      path.join(this.templatesDir, frame.slice(1))  // 移除开头的斜杠
    );
  }

  /**
   * 获取模板缩略图路径
   * @param {string} templateId 模板ID
   * @returns {String} 缩略图的完整路径
   */
  async getTemplateThumbnailPath(templateId) {
    const template = await this.getTemplate(templateId);
    return path.join(this.templatesDir, template.thumbnail.slice(1));  // 移除开头的斜杠
  }

  /**
   * 检查模板文件是否存在
   * @param {string} templateId 模板ID
   * @returns {Promise<Boolean>} 是否所有文件都存在
   */
  async checkTemplateFiles(templateId) {
    try {
      const template = await this.getTemplate(templateId);
      const files = [
        template.thumbnail.slice(1),  // 移除开头的斜杠
        ...template.frames.map(frame => frame.slice(1))  // 移除开头的斜杠
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
   * @param {string} templateId 模板ID
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