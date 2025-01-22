const path = require('path');
const fs = require('fs').promises;
const imageService = require('../src/services/imageService');
const templateService = require('../src/services/templateService');

// 默认预览配置
const PREVIEW_CONFIG = {
  defaultText: '新年快乐，万事如意！', // 默认祝福语
  fps: 2,
  quality: 10
};

async function generatePreviews() {
  try {
    // 确保默认头像存在
    const defaultAvatarPath = path.join(__dirname, '../public/assets/default-avatar.jpg');
    try {
      await fs.access(defaultAvatarPath);
      console.log('默认头像存在:', defaultAvatarPath);
    } catch (error) {
      console.error('默认头像不存在，请确保文件存在于:', defaultAvatarPath);
      process.exit(1);
    }
    
    // 获取所有模板
    const templates = await templateService.getTemplates();
    
    for (const template of templates) {
      console.log(`生成模板预览: ${template.id}`);
      
      try {
        // 生成预览GIF
        const gifBuffer = await imageService.generateCustomGIF({
          templateId: template.id,
          imagePath: '',  // 使用空字符串，让服务使用默认头像
          text: PREVIEW_CONFIG.defaultText,
          config: template.config
        });
        
        // 保存预览GIF
        const previewPath = path.join(
          __dirname, 
          '../public/templates', 
          template.id, 
          'preview.gif'
        );
        
        await fs.writeFile(previewPath, gifBuffer);
        console.log(`预览已生成: ${previewPath}`);
      } catch (error) {
        console.error(`生成模板 ${template.id} 预览失败:`, error);
        // 继续处理下一个模板
        continue;
      }
    }
    
    console.log('所有预览生成完成');
    
  } catch (error) {
    console.error('生成预览失败:', error);
    process.exit(1);
  }
}

// 运行生成脚本
generatePreviews(); 