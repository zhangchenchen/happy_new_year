const imageService = require('../services/imageService');
const templateService = require('../services/templateService');
const path = require('path');
const fs = require('fs').promises;

async function testTemplateGIF() {
  try {
    console.log('开始测试模板2 GIF生成...');

    // 获取模板2的帧图片
    const template2Dir = path.join(__dirname, '../../public/templates/template2');
    const frames = [
      path.join(template2Dir, 'frame1.png'),
      path.join(template2Dir, 'frame2.png'),
      path.join(template2Dir, 'frame3.png')
    ];

    // 检查帧文件是否存在
    for (const frame of frames) {
      const stats = await fs.stat(frame);
      console.log(`帧文件 ${path.basename(frame)} 大小: ${stats.size} 字节`);
    }

    // 生成GIF
    console.log('开始生成GIF...');
    const gifBuffer = await imageService.generateGIF(frames, {
      fps: 2,  // 每秒2帧
      quality: 10
    });

    // 检查GIF buffer是否生成
    if (!gifBuffer || gifBuffer.length === 0) {
      throw new Error('GIF buffer为空');
    }
    console.log('GIF buffer大小:', gifBuffer.length, '字节');

    // 保存GIF文件
    const outputPath = path.join(__dirname, '../../temp/template2.gif');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, gifBuffer);
    
    // 验证文件是否写入成功
    const gifStats = await fs.stat(outputPath);
    console.log('GIF文件生成成功:', outputPath);
    console.log('GIF文件大小:', gifStats.size, '字节');

    console.log('测试完成！');

  } catch (error) {
    console.error('测试失败:', error);
    if (error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 运行测试
testTemplateGIF(); 