const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class CleanupService {
  constructor() {
    this.config = {
      // 文件保留时间配置
      retention: {
        uploads: 24 * 60 * 60 * 1000,    // 上传目录文件保留24小时
        output: 12 * 60 * 60 * 1000,     // 输出目录文件保留12小时
      },
      // 清理间隔（默认6小时）
      cleanupInterval: 6 * 60 * 60 * 1000,
      // 重试配置
      retry: {
        maxAttempts: 3,
        delayMs: 1000,
      },
      // 需要清理的目录
      directories: [
        {
          path: path.join(__dirname, '../../public/uploads'),
          type: 'uploads',
          // 上传的原始图片和处理后的图片
          pattern: /^(processed-)?[\w-]+\.(jpg|jpeg|png|gif)$/
        },
        {
          path: path.join(__dirname, '../../public/output'),
          type: 'output',
          // 生成的GIF文件
          pattern: /^[\w-]+\.gif$/
        }
      ]
    };

    // 清理统计
    this.stats = {
      lastRun: null,
      filesDeleted: 0,
      bytesFreed: 0,
      errors: 0,
    };
  }

  /**
   * 清理指定目录中的过期文件
   * @param {string} directory 目录路径
   * @param {RegExp} pattern 文件名匹配模式
   * @param {string} type 目录类型（uploads/output）
   */
  async cleanDirectory(directory, pattern, type) {
    try {
      // 确保目录存在
      await fs.mkdir(directory, { recursive: true });

      // 读取目录内容
      const files = await fs.readdir(directory);
      const now = Date.now();
      let deletedFiles = 0;
      let deletedBytes = 0;

      for (const file of files) {
        if (!pattern.test(file)) continue;

        const filePath = path.join(directory, file);
        let success = false;
        let attempts = 0;

        while (!success && attempts < this.config.retry.maxAttempts) {
          try {
            const stats = await fs.stat(filePath);
            const fileAge = now - stats.mtime.getTime();
            const maxAge = this.config.retention[type];

            // 如果文件超过最大年龄，删除它
            if (fileAge > maxAge) {
              await fs.unlink(filePath);
              deletedFiles++;
              deletedBytes += stats.size;
              logger.info(`已删除过期文件: ${filePath} (年龄: ${Math.round(fileAge / 1000 / 60 / 60)}小时)`);
              success = true;
            } else {
              success = true; // 文件不需要删除，标记为成功
            }
          } catch (error) {
            attempts++;
            if (attempts < this.config.retry.maxAttempts) {
              logger.warn(`处理文件失败 ${filePath}, 重试 (${attempts}/${this.config.retry.maxAttempts}):`, error);
              await new Promise(resolve => setTimeout(resolve, this.config.retry.delayMs));
            } else {
              logger.error(`处理文件失败 ${filePath}, 已达到最大重试次数:`, error);
              this.stats.errors++;
            }
          }
        }
      }

      // 更新统计信息
      this.stats.filesDeleted += deletedFiles;
      this.stats.bytesFreed += deletedBytes;

      logger.info(`目录 ${directory} 清理完成: 删除了 ${deletedFiles} 个文件, 释放了 ${Math.round(deletedBytes / 1024 / 1024)}MB 空间`);
    } catch (error) {
      logger.error(`清理目录失败 ${directory}:`, error);
      this.stats.errors++;
    }
  }

  /**
   * 执行清理
   */
  async cleanup() {
    logger.info('开始清理临时文件...');
    
    // 重置统计信息
    this.stats.filesDeleted = 0;
    this.stats.bytesFreed = 0;
    this.stats.errors = 0;
    
    for (const dir of this.config.directories) {
      await this.cleanDirectory(dir.path, dir.pattern, dir.type);
    }

    this.stats.lastRun = new Date();
    logger.info(`清理完成: 共删除 ${this.stats.filesDeleted} 个文件, 释放 ${Math.round(this.stats.bytesFreed / 1024 / 1024)}MB 空间, 发生 ${this.stats.errors} 个错误`);
  }

  /**
   * 启动定期清理任务
   * @param {number} interval 清理间隔（毫秒）
   */
  startPeriodicCleanup(interval = this.config.cleanupInterval) {
    logger.info(`启动定期清理任务，间隔: ${Math.round(interval / 1000 / 60 / 60)}小时`);
    this.cleanup(); // 立即执行一次
    setInterval(() => this.cleanup(), interval);
  }

  /**
   * 获取清理服务状态
   */
  getStatus() {
    return {
      lastRun: this.stats.lastRun,
      filesDeleted: this.stats.filesDeleted,
      bytesFreed: this.stats.bytesFreed,
      errors: this.stats.errors,
      config: {
        uploadsRetention: Math.round(this.config.retention.uploads / 1000 / 60 / 60) + '小时',
        outputRetention: Math.round(this.config.retention.output / 1000 / 60 / 60) + '小时',
        cleanupInterval: Math.round(this.config.cleanupInterval / 1000 / 60 / 60) + '小时',
      }
    };
  }
}

module.exports = new CleanupService(); 