const express = require('express');
const router = express.Router();
const templateService = require('../services/templateService');
const imageService = require('../services/imageService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../temp/uploads'));
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter: function (req, file, cb) {
    // 只允许上传图片
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('只允许上传图片文件！'), false);
    }
    cb(null, true);
  }
});

// 确保上传目录和输出目录存在
const uploadDir = path.join(__dirname, '../../temp/uploads');
const outputDir = path.join(__dirname, '../../temp/output');
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);
fs.mkdir(outputDir, { recursive: true }).catch(console.error);

// 获取所有模板列表
router.get('/templates', async (req, res) => {
  try {
    const templates = await templateService.getTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('获取模板列表失败:', error);
    res.status(500).json({ success: false, message: '获取模板列表失败' });
  }
});

// 获取单个模板详情
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await templateService.getTemplate(req.params.id);
    res.json({ success: true, data: template });
  } catch (error) {
    console.error('获取模板详情失败:', error);
    res.status(404).json({ success: false, message: '模板不存在' });
  }
});

// 生成GIF
router.post('/generate', async (req, res) => {
  try {
    const { templateId, imageUrl, text } = req.body;

    if (!templateId) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    // 获取模板信息
    const template = await templateService.getTemplate(templateId);
    
    // 生成GIF
    const gifBuffer = await imageService.generateCustomGIF({
      templateId,
      imagePath: imageUrl ? imageUrl.replace(/^http:\/\/[^\/]+/, '') : null,
      text: text || '',
      config: template.config
    });

    // 保存GIF文件到output目录
    const gifFileName = `result_${Date.now()}.gif`;
    const gifPath = path.join(__dirname, '../../temp/output', gifFileName);
    await fs.mkdir(path.dirname(gifPath), { recursive: true });
    await fs.writeFile(gifPath, gifBuffer);

    // 返回JSON响应
    const baseUrl = process.env.SERVER_URL || 'http://localhost:3000';
    res.json({
      success: true,
      data: {
        url: `/output/${gifFileName}`,
        text: text || ''
      }
    });

  } catch (error) {
    console.error('生成GIF失败:', error);
    res.status(500).json({ success: false, message: '生成GIF失败' });
  }
});

// 图片上传接口
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('收到上传请求:', {
      headers: req.headers,
      file: req.file ? {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : null
    });

    // 检查是否有文件上传
    if (!req.file) {
      console.log('没有文件被上传');
      return res.status(400).json({ 
        success: false, 
        message: '没有上传文件' 
      });
    }

    // 检查文件大小
    if (req.file.size > 5 * 1024 * 1024) {
      console.log('文件太大:', req.file.size);
      // 删除超大文件
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        success: false,
        message: '文件大小不能超过5MB'
      });
    }

    // 处理上传的图片
    console.log('开始处理图片...');
    const resizedBuffer = await imageService.resizeImage(req.file.path, {
      width: 800,
      height: 800
    });
    console.log('图片处理完成');

    // 保存处理后的图片
    const processedPath = path.join(
      path.dirname(req.file.path),
      'processed-' + path.basename(req.file.path)
    );
    await fs.writeFile(processedPath, resizedBuffer);
    console.log('处理后的图片已保存:', processedPath);

    // 删除原始文件
    await fs.unlink(req.file.path).catch(console.error);

    // 返回处理后的图片URL
    const imageUrl = `/uploads/processed-${path.basename(req.file.path)}`;
    
    // 确保返回正确的JSON格式
    const response = {
      success: true,
      data: {
        url: `${process.env.SERVER_URL || 'http://localhost:3000'}${imageUrl}`,
        width: 800,
        height: 800
      }
    };
    
    console.log('发送响应:', response);
    return res.json(response);

  } catch (error) {
    // 发生错误时，确保清理所有文件
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
      const processedPath = path.join(
        path.dirname(req.file.path),
        'processed-' + path.basename(req.file.path)
      );
      await fs.unlink(processedPath).catch(console.error);
    }

    console.error('图片上传处理失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '图片上传处理失败',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 