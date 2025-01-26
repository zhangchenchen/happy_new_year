const sharp = require('sharp');
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs').promises;

class ImageService {
  constructor() {
    // 默认配置
    this.config = {
      width: 800,      // 图片宽度
      height: 1000,    // 图片高度
      fps: 15,         // GIF帧率
      quality: 10,     // GIF质量
      fontFamily: 'Microsoft YaHei', // 默认字体
      fontSize: 32,    // 默认字号
      textColor: '#333333', // 默认文字颜色
      lineHeight: 1.5, // 行高
    };

    // 动画效果处理器
    this.animationEffects = {
      fadeIn: this.applyFadeIn.bind(this),
      scale: this.applyScale.bind(this),
      rotate: this.applyRotate.bind(this),
      slideIn: this.applySlideIn.bind(this),
      pulse: this.applyPulse.bind(this),
      blur: this.applyBlur.bind(this),
      typewriter: this.applyTypewriter.bind(this),
      glow: this.applyGlow.bind(this),
      shimmer: this.applyShimmer.bind(this)
    };

    // 背景效果处理器
    this.backgroundEffects = {
      particles: this.drawParticles.bind(this),
      fireworks: this.drawFireworks.bind(this)
    };
  }

  /**
   * 应用渐入效果
   */
  applyFadeIn(ctx, progress, element) {
    ctx.globalAlpha = progress;
    return ctx;
  }

  /**
   * 应用缩放效果
   */
  applyScale(ctx, progress, element, effect) {
    const { from = 0.8, to = 1.1 } = effect;
    const scale = from + (to - from) * progress;
    ctx.scale(scale, scale);
    return ctx;
  }

  /**
   * 应用旋转效果
   */
  applyRotate(ctx, progress, element, effect) {
    const { angle = 360 } = effect;
    const rotation = (angle * Math.PI / 180) * progress;
    ctx.rotate(rotation);
    return ctx;
  }

  /**
   * 应用滑入效果
   */
  applySlideIn(ctx, progress, element, effect) {
    const { direction = 'right' } = effect;
    const distance = direction === 'right' ? this.config.width : -this.config.width;
    const offset = distance * (1 - progress);
    ctx.translate(offset, 0);
    return ctx;
  }

  /**
   * 应用脉冲效果
   */
  applyPulse(ctx, progress, element) {
    const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
    ctx.scale(scale, scale);
    return ctx;
  }

  /**
   * 应用模糊效果
   */
  async applyBlur(buffer, progress, effect) {
    const { amount = 5 } = effect;
    const blurAmount = amount * (1 - progress);
    return sharp(buffer)
      .blur(blurAmount)
      .toBuffer();
  }

  /**
   * 应用打字机效果
   */
  applyTypewriter(ctx, progress, element, text) {
    const visibleLength = Math.floor(text.length * progress);
    return text.substring(0, visibleLength);
  }

  /**
   * 应用发光效果
   */
  applyGlow(ctx, progress, element, effect) {
    const { color = '#FFD700' } = effect;
    const blur = 20 * progress;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    return ctx;
  }

  /**
   * 应用闪烁效果
   */
  applyShimmer(ctx, progress, element, effect) {
    const { color = '#FFD700' } = effect;
    const alpha = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.globalAlpha = alpha;
    return ctx;
  }

  /**
   * 绘制粒子效果
   */
  drawParticles(ctx, progress, config) {
    const { particleCount = 50, color = '#FFD700', size, speed } = config;
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.config.width;
      const y = Math.random() * this.config.height;
      const particleSize = size.min + Math.random() * (size.max - size.min);
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * 绘制烟花效果
   */
  drawFireworks(ctx, progress, config) {
    const { sparkCount = 30, colors = ['#FFD700'], size, velocity } = config;
    
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 / sparkCount) * i;
      const distance = velocity.max * progress;
      const x = this.config.width / 2 + Math.cos(angle) * distance;
      const y = this.config.height / 2 + Math.sin(angle) * distance;
      const sparkSize = size.min + Math.random() * (size.max - size.min);
      
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(x, y, sparkSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * 应用样式到画布上下文
   */
  applyStyle(ctx, style) {
    if (!style) return ctx;

    if (style.borderRadius) {
      // 创建圆形裁剪路径
      ctx.beginPath();
      if (style.borderRadius === '50%') {
        // 如果是50%，创建一个完整的圆形
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      } else {
        // 否则使用指定的像素值
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = parseInt(style.borderRadius);
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      }
      ctx.closePath();
      ctx.clip();
    }

    if (style.border) {
      const [width, borderStyle, color] = style.border.split(' ');
      ctx.strokeStyle = color;
      ctx.lineWidth = parseInt(width);
      ctx.beginPath();
      if (style.borderRadius === '50%') {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const radius = Math.min(canvasWidth, canvasHeight) / 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      } else {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const radius = parseInt(style.borderRadius);
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      }
      ctx.closePath();
      ctx.stroke();
    }

    if (style.boxShadow) {
      const shadow = style.boxShadow.split(' ');
      ctx.shadowOffsetX = parseInt(shadow[0]);
      ctx.shadowOffsetY = parseInt(shadow[1]);
      ctx.shadowBlur = parseInt(shadow[2]);
      ctx.shadowColor = shadow[3];
    }

    if (style.textShadow) {
      const shadow = style.textShadow.split(' ');
      ctx.shadowOffsetX = parseInt(shadow[0]);
      ctx.shadowOffsetY = parseInt(shadow[1]);
      ctx.shadowBlur = parseInt(shadow[2]);
      ctx.shadowColor = shadow[3];
    }

    return ctx;
  }

  /**
   * 生成自定义GIF
   * @param {string} templateId 模板ID
   * @param {string} imagePath 图片路径
   * @param {string} text 文字内容
   * @param {Object} config 模板配置
   */
  async generateCustomGIF(templateId, imagePath, text, config) {
    console.log('开始生成GIF，参数:', { templateId, imagePath, text, config });
    
    // 使用 public 目录
    const outputDir = path.join(__dirname, '../../public/output');
    await this.ensureDirectoryExists(outputDir);
    
    try {
      console.time('generateCustomGIF');
      console.log('原始图片路径:', imagePath);

      // 修改这里：确保正确处理图片路径
      let actualImagePath = imagePath;
      if (imagePath) {
        // 移除开头的斜杠并构建正确的路径
        const relativePath = imagePath.replace(/^\/+/, '');
        
        // 使用 public/uploads 目录
        actualImagePath = path.join(__dirname, '../../public/uploads', path.basename(relativePath));
        console.log('最终的绝对路径:', actualImagePath);
      
      } else {
        actualImagePath = path.join(__dirname, '../../public/assets', 'default-avatar.png');
      }
      // 验证文件是否存在
      try {
        await fs.access(actualImagePath);

      } catch (err) {
        console.error('文件不存在于路径:', actualImagePath);
        throw new Error(`找不到图片文件: ${actualImagePath}`);
      }
      // 尝试加载图片
      console.log('尝试加载图片:', actualImagePath);
      let userImage;
      try {
        userImage = await loadImage(actualImagePath);
        console.log('图片加载成功');
      } catch (error) {
        console.error('加载图片失败:', error);
        throw error;
      }

      // 加载模板帧
      console.time('loadTemplateFrames');
      const templateDir = path.join(__dirname, '../../public/templates', templateId.toString());
      console.log('模板目录:', templateDir);
      
      const templateFrames = [];
      for (let i = 1; i <= 3; i++) {
        const framePath = path.join(templateDir, `frame${i}.png`);
        console.log('加载模板帧:', framePath);
        try {
          await fs.access(framePath);
          const frame = await loadImage(framePath);
          templateFrames.push(frame);
          console.log(`成功加载第${i}帧`);
        } catch (error) {
          console.error(`加载第${i}帧失败:`, error);
          throw new Error(`模板帧${i}不存在或无法访问`);
        }
      }
      console.timeEnd('loadTemplateFrames');

      // 计算总帧数
      const totalFrames = Math.min(Math.ceil(config.duration / (1000 / config.fps)), 12);
      console.log('总帧数:', totalFrames);

      // 创建GIF编码器
      console.log('创建GIF编码器，尺寸:', this.config.width, this.config.height);
      const encoder = new GIFEncoder(this.config.width, this.config.height);
      
      try {
        encoder.start();
        encoder.setRepeat(0);   // 0表示无限循环
        encoder.setDelay(Math.floor(1000 / config.fps));
        encoder.setQuality(10); // 图片质量，1-20
        console.log('GIF编码器配置完成');
      } catch (error) {
        console.error('GIF编码器配置失败:', error);
        throw error;
      }

      // 创建画布
      console.log('创建画布，尺寸:', this.config.width, this.config.height);
      const canvas = createCanvas(this.config.width, this.config.height);
      const ctx = canvas.getContext('2d');

      // 生成每一帧
      console.log('开始生成帧，总帧数:', totalFrames);
      console.time('generateFrames');
      
      try {
        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
          console.log(`开始生成第 ${frameIndex + 1}/${totalFrames} 帧`);
          
          // 清空画布
          ctx.clearRect(0, 0, this.config.width, this.config.height);
          
          // 计算当前帧的进度（0-1）
          const progress = frameIndex / (totalFrames - 1);
          
          // 选择当前要使用的模板帧
          const templateFrameIndex = Math.min(
            Math.floor(progress * templateFrames.length),
            templateFrames.length - 1
          );
          
          console.log(`使用模板帧 ${templateFrameIndex + 1}`);
          
          try {
            // 绘制模板帧
            ctx.drawImage(templateFrames[templateFrameIndex], 0, 0, this.config.width, this.config.height);
            
            // 绘制用户图片
            if (userImage) {
              ctx.save();
              const { imageArea } = config;
              
              // 创建临时画布处理用户图片
              const tempCanvas = createCanvas(imageArea.width, imageArea.height);
              const tempCtx = tempCanvas.getContext('2d');
              
              // 在临时画布上绘制用户图片
              tempCtx.save();
              
              // 应用圆形裁剪
              if (imageArea.style && imageArea.style.borderRadius === '50%') {
                tempCtx.beginPath();
                tempCtx.arc(
                  imageArea.width / 2,
                  imageArea.height / 2,
                  Math.min(imageArea.width, imageArea.height) / 2,
                  0,
                  Math.PI * 2
                );
                tempCtx.clip();
              }
              
              // 计算缩放比例并绘制图片
              const scale = Math.max(
                imageArea.width / userImage.width,
                imageArea.height / userImage.height
              );
              
              const scaledWidth = userImage.width * scale;
              const scaledHeight = userImage.height * scale;
              const x = (imageArea.width - scaledWidth) / 2;
              const y = (imageArea.height - scaledHeight) / 2;
              
              tempCtx.drawImage(userImage, x, y, scaledWidth, scaledHeight);
              tempCtx.restore();
              
              // 应用样式
              if (imageArea.style) {
                this.applyStyle(tempCtx, imageArea.style);
              }
              
              // 将临时画布的内容绘制到主画布上
              ctx.drawImage(
                tempCanvas,
                imageArea.x,
                imageArea.y,
                imageArea.width,
                imageArea.height
              );
              
              ctx.restore();
            }

            // 绘制文字
            if (text) {
              ctx.save();
              const { textArea } = config;
              
              ctx.font = `${textArea.fontSize}px "${textArea.font}"`;
              ctx.fillStyle = textArea.color;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              if (textArea.style) {
                this.applyStyle(ctx, textArea.style);
              }
              
              this.drawWrappedText(ctx, text, textArea);
              ctx.restore();
            }

            // 添加帧到GIF
            console.log(`添加第 ${frameIndex + 1} 帧到GIF`);
            encoder.addFrame(ctx);
            console.log(`完成第 ${frameIndex + 1} 帧`);
          } catch (frameError) {
            console.error(`生成第 ${frameIndex + 1} 帧时出错:`, frameError);
            throw frameError;
          }
        }

        console.timeEnd('generateFrames');
        console.log('完成所有帧的生成，开始编码GIF');

        encoder.finish();
        const buffer = encoder.out.getData();
        console.log('GIF编码完成，数据大小:', buffer.length);
        
        // 生成文件名和路径
        const timestamp = Date.now();
        const outputFileName = `result_${timestamp}.gif`;
        const outputPath = path.join(outputDir, outputFileName);
        
        // 保存GIF文件
        await fs.writeFile(outputPath, buffer);
        console.log('GIF文件已保存:', outputPath);
        
        // 返回文件信息
        return {
          buffer,
          fileName: outputFileName,
          path: outputPath,
          url: `/output/${outputFileName}`
        };
      } catch (error) {
        console.error('生成帧过程中出错:', error);
        throw error;
      }
    } catch (error) {
      console.error('生成自定义GIF失败:', error);
      throw error;
    }
  }

  /**
   * 计算效果进度
   */
  calculateEffectProgress(frameProgress, effect) {
    const { duration, delay = 0 } = effect;
    const startTime = delay;
    const endTime = delay + duration;
    const currentTime = frameProgress * this.config.duration;

    if (currentTime < startTime) return 0;
    if (currentTime > endTime) return 1;

    return (currentTime - startTime) / duration;
  }

  /**
   * 绘制自动换行文字
   */
  drawWrappedText(ctx, text, textArea) {
    const words = text.split('');
    const maxWidth = textArea.maxWidth;
    let line = '';
    let lines = [];
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const lineHeight = textArea.fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = textArea.y - totalHeight / 2;

    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        textArea.x,
        startY + index * lineHeight
      );
    });
  }

  /**
   * 将文字渲染到图片上
   * @param {String} imagePath 背景图片路径
   * @param {String} text 要渲染的文字
   * @param {Object} options 渲染配置
   * @returns {Promise<Buffer>} 处理后的图片Buffer
   */
  async renderTextOnImage(imagePath, text, options = {}) {
    try {
      // 创建画布
      const canvas = createCanvas(this.config.width, this.config.height);
      const ctx = canvas.getContext('2d');

      // 加载背景图片
      const image = await loadImage(imagePath);
      
      // 绘制背景图片（自适应填充）
      const scale = Math.max(
        canvas.width / image.width,
        canvas.height / image.height
      );
      const x = (canvas.width - image.width * scale) / 2;
      const y = (canvas.height - image.height * scale) / 2;
      ctx.drawImage(
        image,
        x, y,
        image.width * scale,
        image.height * scale
      );

      // 设置文字样式
      ctx.font = `${options.fontSize || this.config.fontSize}px "${options.fontFamily || this.config.fontFamily}"`;
      ctx.fillStyle = options.textColor || this.config.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 文字换行处理
      const words = text.split('');
      const maxWidth = canvas.width * 0.8; // 文字区域宽度
      const lineHeight = (options.fontSize || this.config.fontSize) * this.config.lineHeight;
      let line = '';
      let lines = [];
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          lines.push(line);
          line = words[i];
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      // 绘制文字
      const textY = canvas.height * 0.6; // 文字起始位置
      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          canvas.width / 2,
          textY + index * lineHeight
        );
      });

      // 转换为Buffer
      const buffer = canvas.toBuffer('image/png');
      return buffer;

    } catch (error) {
      console.error('渲染文字失败:', error);
      throw error;
    }
  }

  /**
   * 生成GIF
   * @param {Array<string>} frames 帧图片路径数组
   * @param {Object} options 配置选项
   * @returns {Promise<Buffer>} GIF图片buffer
   */
  async generateGIF(frames, options = {}) {
    console.log('generateGIF - 开始处理...');
    
    try {
      // 读取第一帧获取尺寸
      const firstFrame = await loadImage(frames[0]);
      const width = firstFrame.width;
      const height = firstFrame.height;

      // 创建GIF编码器
      const encoder = new GIFEncoder(width, height);
      encoder.start();
      encoder.setRepeat(0);   // 0表示无限循环
      encoder.setDelay(options.fps ? 1000 / options.fps : 500);    // 帧延迟时间
      encoder.setQuality(options.quality || 10); // 图片质量，1-20
      
      console.log('帧数量:', frames.length);

      // 创建canvas
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // 添加每一帧
      for (const framePath of frames) {
        console.log('处理帧:', framePath);
        const image = await loadImage(framePath);
        ctx.drawImage(image, 0, 0);
        encoder.addFrame(ctx);
        console.log('帧已添加');
      }

      encoder.finish();
      console.log('编码完成');

      const buffer = encoder.out.getData();
      console.log('GIF数据大小:', buffer.length);
      
      return buffer;
    } catch (error) {
      console.error('生成GIF失败:', error);
      throw error;
    }
  }

  /**
   * 调整图片大小
   * @param {String} imagePath 图片路径
   * @param {Object} options 配置选项
   * @returns {Promise<Buffer>} 处理后的图片Buffer
   */
  async resizeImage(imagePath, options = {}) {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      // 计算调整后的尺寸
      const width = options.width || this.config.width;
      const height = options.height || this.config.height;
      const scale = Math.max(
        width / metadata.width,
        height / metadata.height
      );

      // 调整图片大小并保持比例
      return await image
        .resize(
          Math.round(metadata.width * scale),
          Math.round(metadata.height * scale),
          { fit: 'fill' }
        )
        .toBuffer();

    } catch (error) {
      console.error('调整图片大小失败:', error);
      throw error;
    }
  }

  /**
   * 生成缩略图
   */
  async generateThumbnail(options) {
    const { templateId, imagePath, text, config } = options;

    try {
      // 创建画布
      const canvas = createCanvas(this.config.width, this.config.height);
      const ctx = canvas.getContext('2d');

      // 加载用户图片
      const userImage = await loadImage(imagePath);

      // 加载模板第一帧
      const templateDir = path.join(__dirname, '../../public/templates', templateId);
      const templateFrame = await loadImage(path.join(templateDir, 'frame1.png'));

      // 绘制背景帧
      ctx.drawImage(templateFrame, 0, 0);

      // 绘制用户图片
      ctx.save();
      const { imageArea } = config;
      
      // 创建一个临时画布来处理用户图片
      const tempCanvas = createCanvas(imageArea.width, imageArea.height);
      const tempCtx = tempCanvas.getContext('2d');
      
      // 在临时画布上绘制用户图片并应用样式
      tempCtx.save();
      
      // 应用圆形裁剪
      tempCtx.beginPath();
      tempCtx.arc(
        imageArea.width / 2,
        imageArea.height / 2,
        (Math.min(imageArea.width, imageArea.height) / 2) - 8, // 减去边框宽度
        0,
        Math.PI * 2
      );
      tempCtx.clip();
      
      // 计算缩放比例并绘制图片
      const scale = Math.max(
        imageArea.width / userImage.width,
        imageArea.height / userImage.height
      ) * 1.1; // 稍微放大一点，确保填满圆形区域
      
      // 计算居中位置
      const scaledWidth = userImage.width * scale;
      const scaledHeight = userImage.height * scale;
      const x = (imageArea.width - scaledWidth) / 2;
      const y = (imageArea.height - scaledHeight) / 2;
      
      // 在临时画布上绘制图片
      tempCtx.drawImage(
        userImage,
        x, y,
        scaledWidth, scaledHeight
      );
      
      tempCtx.restore();

      // 应用其他样式（边框和阴影）
      if (imageArea.style) {
        this.applyStyle(tempCtx, imageArea.style);
      }
      
      // 将临时画布的内容绘制到主画布上
      ctx.drawImage(
        tempCanvas,
        imageArea.x,  // 直接使用配置的x坐标
        imageArea.y,  // 直接使用配置的y坐标
        imageArea.width,
        imageArea.height
      );
      
      ctx.restore();

      // 绘制文字
      if (text) {
        ctx.save();
        const { textArea } = config;
        
        // 设置文字样式
        ctx.font = `${textArea.fontSize}px "${textArea.font}"`;
        ctx.fillStyle = textArea.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 应用文字样式
        if (textArea.style) {
          this.applyStyle(ctx, textArea.style);
        }

        // 绘制文字
        this.drawWrappedText(ctx, text, textArea);
        ctx.restore();
      }

      // 转换为PNG Buffer
      return canvas.toBuffer('image/png');

    } catch (error) {
      console.error('生成缩略图失败:', error);
      throw error;
    }
  }

  /**
   * 确保目录存在，如果不存在则创建
   * @param {string} dirPath 目录路径
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      // 目录不存在，创建它
      await fs.mkdir(dirPath, { recursive: true });
      console.log('创建目录成功:', dirPath);
    }
  }
}

module.exports = new ImageService(); 