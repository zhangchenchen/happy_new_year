const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs').promises;

// 模板配置
// 修改模板配置，添加形状属性
const templateConfig = {
  template1: {
    imageArea: {
      x: 200,
      y: 250,
      width: 400,
      height: 400,
      shape: 'circle',  // 添加形状属性
      border: {         // 添加边框配置
        width: 4,
        color: '#748ffc',
        style: 'solid'
      }
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

// 绘制烟花效果
function drawFirework(ctx, x, y, size, color, phase) {
  const particles = 16; // 增加粒子数量
  const innerRadius = size * 0.2 * phase;
  const outerRadius = size * phase;

  for (let i = 0; i < particles; i++) {
    const angle = (i * Math.PI * 2) / particles;
    const gradient = ctx.createLinearGradient(
      x + Math.cos(angle) * innerRadius,
      y + Math.sin(angle) * innerRadius,
      x + Math.cos(angle) * outerRadius,
      y + Math.sin(angle) * outerRadius
    );
    
    gradient.addColorStop(0, `${color}ff`);
    gradient.addColorStop(1, `${color}00`);
    
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * innerRadius, y + Math.sin(angle) * innerRadius);
    ctx.lineTo(x + Math.cos(angle) * outerRadius, y + Math.sin(angle) * outerRadius);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 添加星星点点效果
    if (phase > 0.7) {
      const sparkleRadius = Math.random() * 3;
      const sparkleAngle = Math.random() * Math.PI * 2;
      const distance = Math.random() * outerRadius;
      const sparkleX = x + Math.cos(sparkleAngle) * distance;
      const sparkleY = y + Math.sin(sparkleAngle) * distance;
      
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, sparkleRadius, 0, Math.PI * 2);
      ctx.fillStyle = color + '80';
      ctx.fill();
    }
  }
}

// 绘制装饰花纹
function drawDecoration(ctx, x, y, size, color, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  // 绘制优雅的曲线装饰
  ctx.beginPath();
  ctx.moveTo(-size/2, 0);
  ctx.quadraticCurveTo(-size/4, -size/3, 0, -size/2);
  ctx.quadraticCurveTo(size/4, -size/3, size/2, 0);
  ctx.quadraticCurveTo(size/4, size/3, 0, size/2);
  ctx.quadraticCurveTo(-size/4, size/3, -size/2, 0);
  
  ctx.strokeStyle = color + '40';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // 添加小圆点装饰
  const dots = 8;
  for (let i = 0; i < dots; i++) {
    const angle = (i * Math.PI * 2) / dots;
    const dotX = Math.cos(angle) * (size/3);
    const dotY = Math.sin(angle) * (size/3);
    
    ctx.beginPath();
    ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
    ctx.fillStyle = color + '80';
    ctx.fill();
  }
  
  ctx.restore();
}

async function generateTemplates() {
  try {
    console.log('开始生成模板资源...');

    // 模板1：小清新风格
    const template1Dir = path.join(__dirname, '../../public/templates/template1');
    await fs.mkdir(template1Dir, { recursive: true });

    // 创建画布
    const width = 800;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 生成缩略图
    console.log('生成模板1缩略图...');
    
    // 渐变背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#f8f9fa');
    bgGradient.addColorStop(0.5, '#e9ecef');
    bgGradient.addColorStop(1, '#dee2e6');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 添加装饰边框
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    const margin = 30;
    ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);

    // 添加角落装饰
    drawDecoration(ctx, margin, margin, 80, '#748ffc', Math.PI * 0.25);
    drawDecoration(ctx, width - margin, margin, 80, '#748ffc', Math.PI * 0.75);
    drawDecoration(ctx, margin, height - margin, 80, '#748ffc', -Math.PI * 0.25);
    drawDecoration(ctx, width - margin, height - margin, 80, '#748ffc', -Math.PI * 0.75);

    // 添加烟花装饰
    drawFirework(ctx, 100, 150, 60, '#ff6b6b', 1);
    drawFirework(ctx, width - 120, 180, 50, '#4dabf7', 0.9);
    drawFirework(ctx, 150, height - 200, 55, '#51cf66', 0.95);
    drawFirework(ctx, width - 150, height - 180, 45, '#ffd43b', 0.85);

    // 绘制图片占位区域
    // 修改缩略图的头像区域绘制代码
    const imageArea = templateConfig.template1.imageArea;
    const centerX = imageArea.x + imageArea.width/2;
    const centerY = imageArea.y + imageArea.height/2;
    const radius = imageArea.width/2;
    
    // 只绘制边框
    if (imageArea.border) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.lineWidth = imageArea.border.width;
      ctx.strokeStyle = imageArea.border.color;
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 保存缩略图
    await fs.writeFile(
      path.join(template1Dir, 'thumbnail.png'),
      canvas.toBuffer('image/png')
    );

    // 绘制头像区域的函数
    function drawImageArea(ctx, imageArea) {
      const centerX = imageArea.x + imageArea.width/2;
      const centerY = imageArea.y + imageArea.height/2;
      const radius = imageArea.width/2;
    
      // 绘制圆形区域
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#adb5bd';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
    
      // 绘制边框
      if (imageArea.border) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.setLineDash([]);
        ctx.lineWidth = imageArea.border.width;
        ctx.strokeStyle = imageArea.border.color;
        ctx.stroke();
      }
    }

    // 帧1：初始状态
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);
    
    drawDecoration(ctx, margin, margin, 80, '#748ffc', Math.PI * 0.25);
    drawDecoration(ctx, width - margin, margin, 80, '#748ffc', Math.PI * 0.75);
    drawDecoration(ctx, margin, height - margin, 80, '#748ffc', -Math.PI * 0.25);
    drawDecoration(ctx, width - margin, height - margin, 80, '#748ffc', -Math.PI * 0.75);
    
    drawFirework(ctx, 100, 150, 60, '#ff6b6b', 0.5);
    drawFirework(ctx, width - 120, 180, 50, '#4dabf7', 0.4);
    drawFirework(ctx, 150, height - 200, 55, '#51cf66', 0.45);
    drawFirework(ctx, width - 150, height - 180, 45, '#ffd43b', 0.35);
    
    drawImageArea(ctx, imageArea);
    
    await fs.writeFile(
      path.join(template1Dir, 'frame1.png'),
      canvas.toBuffer('image/png')
    );

    // 帧2：烟花绽放
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);
    
    drawDecoration(ctx, margin, margin, 80, '#748ffc', Math.PI * 0.25);
    drawDecoration(ctx, width - margin, margin, 80, '#748ffc', Math.PI * 0.75);
    drawDecoration(ctx, margin, height - margin, 80, '#748ffc', -Math.PI * 0.25);
    drawDecoration(ctx, width - margin, height - margin, 80, '#748ffc', -Math.PI * 0.75);
    
    drawFirework(ctx, 100, 150, 60, '#ff6b6b', 1);
    drawFirework(ctx, width - 120, 180, 50, '#4dabf7', 0.9);
    drawFirework(ctx, 150, height - 200, 55, '#51cf66', 0.95);
    drawFirework(ctx, width - 150, height - 180, 45, '#ffd43b', 0.85);
    
    drawImageArea(ctx, imageArea);
    
    await fs.writeFile(
      path.join(template1Dir, 'frame2.png'),
      canvas.toBuffer('image/png')
    );

    // 帧3：烟花消散
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);
    
    drawDecoration(ctx, margin, margin, 80, '#748ffc', Math.PI * 0.25);
    drawDecoration(ctx, width - margin, margin, 80, '#748ffc', Math.PI * 0.75);
    drawDecoration(ctx, margin, height - margin, 80, '#748ffc', -Math.PI * 0.25);
    drawDecoration(ctx, width - margin, height - margin, 80, '#748ffc', -Math.PI * 0.75);
    
    drawFirework(ctx, 100, 150, 60, '#ff6b6b', 0.8);
    drawFirework(ctx, width - 120, 180, 50, '#4dabf7', 0.7);
    drawFirework(ctx, 150, height - 200, 55, '#51cf66', 0.75);
    drawFirework(ctx, width - 150, height - 180, 45, '#ffd43b', 0.65);
    
    drawImageArea(ctx, imageArea);
    
    await fs.writeFile(
      path.join(template1Dir, 'frame3.png'),
      canvas.toBuffer('image/png')
    );

    // 模板2：金玉满堂（金色高贵主题）
    const template2Dir = path.join(__dirname, '../../public/templates/template2');
    await fs.mkdir(template2Dir, { recursive: true });

    // 生成缩略图
    console.log('生成模板2缩略图...');
    ctx.clearRect(0, 0, width, height);
    
    // 渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#ffd700');
    gradient.addColorStop(1, '#ff8c00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 添加装饰 - 使用imageArea配置的位置和大小
    const template2ImageArea = {
      x: 300,
      y: 300,
      width: 200,
      height: 200
    };
    const template2CenterX = template2ImageArea.x + template2ImageArea.width / 2;
    const template2CenterY = template2ImageArea.y + template2ImageArea.height / 2;
    const template2Radius = template2ImageArea.width / 2;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(template2CenterX, template2CenterY, template2Radius, 0, Math.PI * 2);
    ctx.stroke();

    // 添加示例文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Microsoft YaHei';

    // 保存缩略图
    await fs.writeFile(
      path.join(template2Dir, 'thumbnail.png'),
      canvas.toBuffer('image/png')
    );

    // 生成动画帧
    console.log('生成模板2动画帧...');
    
    // 帧1：基础状态
    await fs.writeFile(
      path.join(template2Dir, 'frame1.png'),
      canvas.toBuffer('image/png')
    );

    // 帧2：光晕效果
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制放大的光晕
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(template2CenterX, template2CenterY, template2Radius + 10, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Microsoft YaHei';
    await fs.writeFile(
      path.join(template2Dir, 'frame2.png'),
      canvas.toBuffer('image/png')
    );

    // 帧3：恢复原状
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(template2CenterX, template2CenterY, template2Radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Microsoft YaHei';
    await fs.writeFile(
      path.join(template2Dir, 'frame3.png'),
      canvas.toBuffer('image/png')
    );

    console.log('模板资源生成完成！');

  } catch (error) {
    console.error('生成模板资源失败:', error);
    if (error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 运行生成器
generateTemplates();