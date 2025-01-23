const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class CleanupService {
  constructor() {
    this.config = {
      // 文件保留时间（24小时）
      maxAge: 24 * 60 * 60 * 1000,
      // 需要清理的目录
      directories: [
        {
          path: path.join(__dirname, '../../temp/uploads'),
          // 上传的原始图片和处理后的图片
          pattern: /^(processed-)?[\w-]+\.(jpg|jpeg|png|gif)$/
        },
        {
          path: path.join(__dirname, '../../temp/output'),
          // 生成的GIF文件
          pattern: /^[\w-]+\.gif$/
        }
      ]
    };
  }

  /**
   * 清理指定目录中的过期文件
   * @param {string} directory 目录路径
   * @param {RegExp} pattern 文件名匹配模式
   */
  async cleanDirectory(directory, pattern) {
    try {
      // 确保目录存在
      await fs.mkdir(directory, { recursive: true });

      // 读取目录内容
      const files = await fs.readdir(directory);
      const now = Date.now();

      for (const file of files) {
        if (!pattern.test(file)) continue;

        const filePath = path.join(directory, file);
        try {
          const stats = await fs.stat(filePath);
          const fileAge = now - stats.mtime.getTime();

          // 如果文件超过最大年龄，删除它
          if (fileAge > this.config.maxAge) {
            await fs.unlink(filePath);
            logger.info(`已删除过期文件: ${filePath}`);
          }
        } catch (error) {
          logger.error(`处理文件失败 ${filePath}:`, error);
        }
      }
    } catch (error) {
      logger.error(`清理目录失败 ${directory}:`, error);
    }
  }

  /**
   * 执行清理
   */
  async cleanup() {
    logger.info('开始清理临时文件...');
    
    for (const dir of this.config.directories) {
      await this.cleanDirectory(dir.path, dir.pattern);
    }

    logger.info('清理完成');
  }

  /**
   * 启动定期清理任务
   * @param {number} interval 清理间隔（毫秒）
   */
  startPeriodicCleanup(interval = 6 * 60 * 60 * 1000) { // 默认每6小时清理一次
    this.cleanup(); // 立即执行一次
    setInterval(() => this.cleanup(), interval);
  }
}

module.exports = new CleanupService(); 