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
      fps: 10,         // GIF帧率
      quality: 10,     // GIF质量
      fontFamily: 'Microsoft YaHei', // 默认字体
      fontSize: 32,    // 默认字号
      textColor: '#333333', // 默认文字颜色
      lineHeight: 1.5, // 行高
    };
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
   * 生成自定义GIF
   * @param {Object} options 配置选项
   * @returns {Promise<Buffer>} GIF图片buffer
   */
  async generateCustomGIF(options) {
    const { templateId, imagePath, text, config } = options;

    try {
      console.log('开始生成自定义GIF，参数:', {
        templateId,
        imagePath,
        text,
        config
      });

      // 获取模板帧
      const templateDir = path.join(__dirname, '../../public/templates', templateId);
      console.log('模板目录:', templateDir);
      
      const templateFrames = [
        path.join(templateDir, 'frame1.png'),
        path.join(templateDir, 'frame2.png'),
        path.join(templateDir, 'frame3.png')
      ];

      // 确保所有模板帧都存在
      for (const frame of templateFrames) {
        try {
          await fs.access(frame);
          console.log('模板帧存在:', frame);
        } catch (error) {
          console.error('模板帧不存在:', frame);
          throw new Error(`模板帧不存在: ${frame}`);
        }
      }

      // 确保临时目录存在
      const tempDir = path.join(__dirname, '../../temp');
      await fs.mkdir(tempDir, { recursive: true });
      console.log('临时目录已创建:', tempDir);

      // 处理用户图片路径
      let finalImagePath;
      if (imagePath && imagePath.startsWith('/uploads/')) {
        finalImagePath = path.join(__dirname, '../../temp', imagePath);
        console.log('使用上传的图片:', finalImagePath);
      } else {
        // 使用默认头像
        finalImagePath = path.join(__dirname, '../../public/assets/default-avatar.jpg');
        console.log('使用默认头像:', finalImagePath);
      }
      console.log('最终图片路径:', finalImagePath);

      // 确保图片文件存在
      try {
        await fs.access(finalImagePath);
        console.log('图片文件存在:', finalImagePath);
      } catch (error) {
        console.error('图片文件不存在，使用默认头像');
        finalImagePath = path.join(__dirname, '../../public/assets/default-avatar.jpg');
      }

      // 加载用户图片
      const userImage = await loadImage(finalImagePath);
      console.log('用户图片已加载，尺寸:', {
        width: userImage.width,
        height: userImage.height
      });

      const { imageArea } = config;
      
      // 创建临时帧
      const tempFrames = [];
      const canvas = createCanvas(800, 1000);
      const ctx = canvas.getContext('2d');

      // 为每一帧添加用户图片和文字
      for (const templateFrame of templateFrames) {
        console.log('处理模板帧:', templateFrame);
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制模板帧
        const frameImage = await loadImage(templateFrame);
        ctx.drawImage(frameImage, 0, 0);

        // 绘制用户图片（保持比例）
        const scale = Math.min(
          imageArea.width / userImage.width,
          imageArea.height / userImage.height
        );
        const scaledWidth = userImage.width * scale;
        const scaledHeight = userImage.height * scale;
        const x = imageArea.x + (imageArea.width - scaledWidth) / 2;
        const y = imageArea.y + (imageArea.height - scaledHeight) / 2;
        
        ctx.drawImage(userImage, x, y, scaledWidth, scaledHeight);

        // 添加文字
        if (text) {
          const { textArea } = config;
          ctx.fillStyle = textArea.color;
          ctx.font = `bold ${textArea.fontSize}px ${textArea.font}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, textArea.x, textArea.y, textArea.maxWidth);
        }

        // 保存临时帧
        const tempFramePath = path.join(tempDir, `temp_frame_${tempFrames.length}.png`);
        await fs.writeFile(tempFramePath, canvas.toBuffer('image/png'));
        console.log('临时帧已保存:', tempFramePath);
        tempFrames.push(tempFramePath);
      }

      console.log('开始生成GIF...');
      // 生成GIF
      const gifBuffer = await this.generateGIF(tempFrames, {
        fps: 2,
        quality: 10
      });
      console.log('GIF生成完成，大小:', gifBuffer.length);

      // 清理临时文件
      for (const tempFrame of tempFrames) {
        await fs.unlink(tempFrame).catch(console.error);
      }
      console.log('临时文件已清理');

      return gifBuffer;

    } catch (error) {
      console.error('生成自定义GIF失败:', error);
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
}

module.exports = new ImageService(); 