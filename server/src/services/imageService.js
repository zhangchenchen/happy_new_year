const sharp = require('sharp');
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');

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
   * 生成GIF动画
   * @param {Array<String>} frames 帧图片路径数组
   * @param {Object} options GIF配置
   * @returns {Promise<Buffer>} GIF图片Buffer
   */
  async generateGIF(frames, options = {}) {
    try {
      console.log('generateGIF - 开始处理...');
      console.log('帧数量:', frames.length);

      // 创建GIF编码器
      const encoder = new GIFEncoder(
        options.width || this.config.width,
        options.height || this.config.height
      );

      // 初始化编码器
      const stream = encoder.createReadStream();
      encoder.start();
      encoder.setFrameRate(options.fps || this.config.fps);
      encoder.setQuality(options.quality || this.config.quality);
      encoder.setRepeat(0); // 0表示无限循环

      // 创建画布
      const canvas = createCanvas(
        options.width || this.config.width,
        options.height || this.config.height
      );
      const ctx = canvas.getContext('2d');

      // 收集所有帧的数据
      let gifData = Buffer.alloc(0);
      stream.on('data', chunk => {
        gifData = Buffer.concat([gifData, chunk]);
      });

      // 添加每一帧
      for (const framePath of frames) {
        console.log('处理帧:', framePath);
        const image = await loadImage(framePath);
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制图片（保持比例）
        const scale = Math.min(
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

        // 添加帧
        encoder.addFrame(ctx);
        console.log('帧已添加');
      }

      // 完成编码
      encoder.finish();
      console.log('编码完成');

      // 等待所有数据收集完成
      return new Promise((resolve, reject) => {
        stream.on('end', () => {
          console.log('GIF数据大小:', gifData.length);
          resolve(gifData);
        });
        stream.on('error', reject);
      });

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
}

module.exports = new ImageService(); 