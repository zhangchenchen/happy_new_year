// templates.js
const templateService = require('../../services/templateService');
const { API_BASE_URL } = require('../../config/config');

Page({
  data: {
    templates: [],
    loading: true,
    error: null,
    previewVisible: false,
    currentTemplate: null,
    mode: 'browse',
    userPhoto: '',
    userGreeting: '',
    isPreview: false,
    greeting: ''
  },

  onLoad: async function(options) {
    const mode = options.mode || 'browse';
    const userPhoto = decodeURIComponent(options.photo || '');
    const greeting = decodeURIComponent(options.greeting || '');
    const isPreview = options.preview === 'true';
    
    console.log('模板页面加载参数:', {
      mode,
      userPhoto,
      greeting,
      isPreview
    });
    
    this.setData({ 
      mode,
      userPhoto,
      greeting,
      isPreview
    });

    wx.setNavigationBarTitle({
      title: mode === 'select' ? '选择模板' : '模板中心'
    });

    try {
      await this.loadTemplates();
    } catch (error) {
      console.error('加载模板失败:', error);
      this.setData({
        error: '加载模板失败，请稍后重试',
        loading: false
      });
    }
  },

  async loadTemplates() {
    this.setData({ loading: true, error: null });
    try {
      const templates = await templateService.getTemplates();
      this.setData({
        templates,
        loading: false
      });
    } catch (error) {
      this.setData({
        error: '加载模板失败，请稍后重试',
        loading: false
      });
      throw error;
    }
  },

  async handleTemplateClick(e) {
    const { templateId } = e.currentTarget.dataset;
    try {
      const template = await templateService.getTemplate(templateId);
      // 从API_BASE_URL中移除可能的/api后缀
      const baseUrl = API_BASE_URL.replace(/\/api$/, '');
      const previewImage = `${baseUrl}/templates/${templateId}/preview.gif`;
      console.log('设置预览图片路径:', previewImage);
      template.previewImage = previewImage;
      this.setData({
        currentTemplate: template,
        previewVisible: true
      });
    } catch (error) {
      console.error('加载模板详情失败:', error);
      wx.showToast({
        title: '加载模板详情失败',
        icon: 'none'
      });
    }
  },

  handlePreviewClose() {
    this.setData({
      previewVisible: false,
      currentTemplate: null
    });
  },

  async handleUseTemplate() {
    const { currentTemplate, mode, userPhoto, greeting } = this.data;
    if (!currentTemplate) return;
    
    if (mode === 'select') {
      // 选择模式：直接生成GIF
      wx.showLoading({ title: '正在生成GIF...' });
      try {
        // 只检查祝福语
        if (!greeting) {
          throw new Error('请先输入祝福语');
        }

        console.log('开始生成GIF，参数:', {
          templateId: currentTemplate.id,
          userPhoto: userPhoto || '使用默认头像',
          greeting
        });

        const result = await templateService.generateGIF(
          currentTemplate.id,
          userPhoto,  // 可以为空，服务端会使用默认头像
          greeting
        );
        
        console.log('GIF生成成功:', result);

        // 跳转到预览页面
        wx.navigateTo({
          url: `/pages/preview/preview?url=${encodeURIComponent(result.url)}`
        });
      } catch (error) {
        console.error('生成GIF失败:', error);
        wx.showToast({
          title: error.message || '生成失败，请重试',
          icon: 'none',
          duration: 3000
        });
      } finally {
        wx.hideLoading();
      }
    } else {
      // 浏览模式：跳转到创作页面
      console.log('跳转到创作页面，模板ID:', currentTemplate.id);
      // 先保存模板ID到全局数据
      const app = getApp();
      app.globalData = app.globalData || {};
      app.globalData.selectedTemplateId = currentTemplate.id;
      
      wx.switchTab({
        url: '/pages/create/create',
        success: function() {
          console.log('跳转成功');
        },
        fail: function(error) {
          console.error('跳转失败:', error);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    }
  },

  onPullDownRefresh: async function() {
    try {
      await this.loadTemplates();
    } catch (error) {
      console.error('刷新模板失败:', error);
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  async previewTemplate(e) {
    const { id } = e.currentTarget.dataset;
    
    try {
      // 从API_BASE_URL中移除可能的/api后缀
      const baseUrl = API_BASE_URL.replace(/\/api$/, '');
      const previewUrl = `${baseUrl}/templates/${id}/preview.gif`;
      console.log('预览图片URL:', previewUrl);
      
      // 显示预览
      wx.previewImage({
        urls: [previewUrl],
        fail: (error) => {
          console.error('预览图片失败:', error);
        }
      });
    } catch (error) {
      console.error('预览失败:', error);
      wx.showToast({
        title: '预览失败，请重试',
        icon: 'none'
      });
    }
  }
}); 