const imageService = require('../services/imageService');
const templateService = require('../services/templateService');
const path = require('path');
const fs = require('fs').promises;

async function testTemplateGIF(templateId) {
  console.log(`开始测试${templateId} GIF生成...`);
  
  try {
    // 获取模板帧文件
    const templateDir = path.join(__dirname, '../../public/templates', templateId);
    const frames = [];
    
    // 只读取3帧
    for (let i = 1; i <= 3; i++) {
      const framePath = path.join(templateDir, `frame${i}.png`);
      const stats = await fs.stat(framePath);
      console.log(`帧文件 frame${i}.png 大小: ${stats.size} 字节`);
      frames.push(framePath);
    }

    // 生成GIF
    const gifBuffer = await imageService.generateGIF(frames, {
      fps: 12,
      quality: 20
    });

    // 保存GIF
    const outputPath = path.join(templateDir, 'preview.gif');
    await fs.writeFile(outputPath, gifBuffer);
    console.log(`GIF已保存到: ${outputPath}`);
    console.log(`GIF大小: ${gifBuffer.length} 字节`);

  } catch (error) {
    console.error('测试失败:', error);
    console.error('错误堆栈:', error);
  }
}

// 运行测试
testTemplateGIF('template1'); 