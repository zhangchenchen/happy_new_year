const { createCanvas, loadImage } = require('canvas');
const imageService = require('../services/imageService');
const path = require('path');
const fs = require('fs').promises;

// 模板配置
const templateConfig = {
  template1: {
    imageArea: {
      x: 200,
      y: 150,
      width: 400,
      height: 400
    },
    textArea: {
      x: 400,
      y: 700,
      maxWidth: 600,
      fontSize: 48,
      color: '#ffffff',
      font: 'Microsoft YaHei'
    }
  }
};

// 处理用户图片
async function processUserImage(imagePath, targetConfig) {
  // 读取用户图片
  const image = await loadImage(imagePath);
  const canvas = createCanvas(targetConfig.width, targetConfig.height);
  const ctx = canvas.getContext('2d');

  // 计算最佳缩放比例
  const scale = Math.max(
    targetConfig.width / image.width,
    targetConfig.height / image.height
  );

  // 计算居中位置
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const x = (targetConfig.width - scaledWidth) / 2;
  const y = (targetConfig.height - scaledHeight) / 2;

  // 绘制并缩放图片
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

  return canvas;
}

async function testCustomGIF() {
  try {
    console.log('开始测试自定义GIF生成...');

    // 使用测试图片
    const testImagePath = path.join(__dirname, './assets/test.jpg');
    const userText = '祝您新年快乐，万事如意！';

    // 获取模板1的帧图片
    const template1Dir = path.join(__dirname, '../../public/templates/template1');
    const templateFrames = [
      path.join(template1Dir, 'frame1.png'),
      path.join(template1Dir, 'frame2.png'),
      path.join(template1Dir, 'frame3.png')
    ];

    // 处理用户图片
    console.log('处理用户图片...');
    const processedImage = await processUserImage(testImagePath, templateConfig.template1.imageArea);

    // 生成自定义帧
    console.log('生成自定义帧...');
    const customFrames = [];
    for (const templateFrame of templateFrames) {
      const canvas = createCanvas(800, 1000);
      const ctx = canvas.getContext('2d');

      // 绘制模板帧
      const frameImage = await loadImage(templateFrame);
      ctx.drawImage(frameImage, 0, 0);

      // 绘制用户图片
      const imageArea = templateConfig.template1.imageArea;
      ctx.drawImage(processedImage, imageArea.x, imageArea.y);

      // 添加用户文字
      const textArea = templateConfig.template1.textArea;
      ctx.fillStyle = textArea.color;
      ctx.font = `bold ${textArea.fontSize}px ${textArea.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(userText, textArea.x, textArea.y, textArea.maxWidth);

      customFrames.push(canvas.toBuffer('image/png'));
    }

    // 生成GIF
    console.log('生成最终GIF...');
    const gifBuffer = await imageService.generateGIF(customFrames, {
      fps: 2,
      quality: 10
    });

    // 保存GIF文件
    const outputPath = path.join(__dirname, '../../temp/custom_template1.gif');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, gifBuffer);

    console.log('自定义GIF生成成功:', outputPath);
    console.log('GIF文件大小:', gifBuffer.length, '字节');

  } catch (error) {
    console.error('测试失败:', error);
    if (error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 运行测试
testCustomGIF(); 