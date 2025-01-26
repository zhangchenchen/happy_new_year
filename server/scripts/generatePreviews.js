const path = require('path');
const fs = require('fs').promises;
const imageService = require('../src/services/imageService');
const templateService = require('../src/services/templateService');

// 默认预览文本
const DEFAULT_PREVIEW_TEXT = '新年新岁，万象更新！愿你在蛇年事业顺遂，如春日繁花蓬勃绽放；生活温馨，似暖茶在手自在悠然。新春快乐，万事胜意！';

async function generatePreviews() {
  try {
    // 确保默认头像存在
    const defaultAvatarPath = path.join(__dirname, '../public/assets/default-avatar.png');
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
          imagePath: defaultAvatarPath,
          text: DEFAULT_PREVIEW_TEXT,
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

        // 生成缩略图（静态PNG）
        const thumbnailBuffer = await imageService.generateThumbnail({
          templateId: template.id,
          imagePath: defaultAvatarPath,
          text: DEFAULT_PREVIEW_TEXT,
          config: template.config
        });

        // 保存缩略图
        const thumbnailPath = path.join(
          __dirname,
          '../public/templates',
          template.id,
          'thumbnail.png'
        );

        await fs.writeFile(thumbnailPath, thumbnailBuffer);
        console.log(`缩略图已生成: ${thumbnailPath}`);

      } catch (error) {
        console.error(`生成模板 ${template.id} 的预览失败:`, error);
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