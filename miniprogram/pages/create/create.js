const app = getApp()
const templateService = require('../../services/templateService')
const aiService = require('../../services/aiService')
const { API_BASE_URL, API_PATHS } = require('../../config/config')

Page({
  data: {
    // 表单数据
    formData: {
      receiverTitle: '',
      relationshipIndex: null,
      photo: '',
      story: ''
    },
    // 关系选项
    relationships: [
      '父母', '子女', '配偶', 
      '兄弟姐妹', '亲戚', '朋友', 
      '同事', '老师', '学生', '其他'
    ],
    // AI生成的祝福文案
    greeting: '',
    // 是否已生成祝福
    greetingGenerated: false,
    // 是否可以生成祝福
    canGenerate: false,
    // 预选的模板ID（从模板中心进入时会有）
    selectedTemplateId: null
  },

  onLoad(options) {
    console.log('创作页面加载参数:', options);
    
    // 从全局数据中获取模板ID
    if (app.globalData && app.globalData.selectedTemplateId) {
      console.log('从全局数据获取模板ID:', app.globalData.selectedTemplateId);
      this.setData({ 
        selectedTemplateId: app.globalData.selectedTemplateId 
      });
      // 使用后清除全局数据
      app.globalData.selectedTemplateId = null;
    }
    
    // 如果是编辑模式，加载现有数据
    if (options.id) {
      this.loadGreeting(options.id)
    }
    // 监听表单数据变化
    this.watchFormData()
  },

  // 页面显示时触发
  onShow() {
    // 检查是否有新的模板ID（从模板中心返回时）
    const app = getApp();
    if (app.globalData && app.globalData.selectedTemplateId) {
      console.log('页面显示时获取新的模板ID:', app.globalData.selectedTemplateId);
      this.setData({ 
        selectedTemplateId: app.globalData.selectedTemplateId 
      });
      // 使用后清除全局数据
      app.globalData.selectedTemplateId = null;
    }
  },

  // 监听表单数据变化
  watchFormData() {
    const canGenerate = this.data.formData.receiverTitle && 
                       this.data.formData.relationshipIndex !== null
    if (canGenerate !== this.data.canGenerate) {
      this.setData({ canGenerate })
    }
  },

  // 输入收礼人称谓
  onInputReceiverName(e) {
    this.setData({
      'formData.receiverTitle': e.detail.value
    }, () => {
      this.watchFormData()
    })
  },

  // 选择关系
  onSelectRelationship(e) {
    this.setData({
      'formData.relationshipIndex': parseInt(e.detail.value)
    }, () => {
      this.watchFormData()
    })
  },

  // 选择照片
  async chooseImage() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      
      wx.showLoading({ title: '上传中...' })
      
      // 打印上传URL
      console.log('上传URL:', `${API_BASE_URL}${API_PATHS.upload}`);
      
      // 使用Promise包装上传操作
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadTask = wx.uploadFile({
          url: `${API_BASE_URL}${API_PATHS.upload}`,
          filePath: res.tempFilePaths[0],
          name: 'image',
          header: {
            'Authorization': `Bearer ${wx.getStorageSync('token')}`
          },
          success: (res) => {
            console.log('上传成功，原始响应:', res);
            resolve(res);
          },
          fail: (error) => {
            console.error('上传失败:', error);
            reject(new Error(error.errMsg || '网络请求失败'));
          }
        });

        // 监听上传进度
        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度:', res.progress);
        });
      });

      // 检查响应状态码
      if (uploadResult.statusCode !== 200) {
        throw new Error(`上传失败：服务器返回 ${uploadResult.statusCode} 状态码`);
      }

      let result;
      try {
        result = JSON.parse(uploadResult.data);
        console.log('解析后的响应数据:', result);
      } catch (parseError) {
        console.error('解析响应数据失败:', uploadResult.data);
        throw new Error('服务器返回的数据格式不正确');
      }

      if (!result.success) {
        throw new Error(result.message || '上传失败：服务器返回失败状态');
      }

      if (!result.data || !result.data.url) {
        throw new Error('上传成功但未返回图片URL');
      }

      // 设置图片URL到表单数据
      this.setData({
        'formData.photo': result.data.url
      })

      console.log('设置的图片URL:', result.data.url);

      wx.hideLoading()
      
      // 显示成功提示
      wx.showToast({
        title: '上传成功',
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('选择/上传图片失败:', error);
      wx.hideLoading()
      wx.showToast({
        title: error.message || '上传失败，请重试',
        icon: 'none',
        duration: 3000
      })
    }
  },

  // 删除照片
  deletePhoto() {
    this.setData({
      'formData.photo': ''
    })
  },

  // 输入共同经历
  onInputStory(e) {
    this.setData({
      'formData.story': e.detail.value
    })
  },

  // 生成祝福文案
  async generateGreeting() {
    if (!this.data.canGenerate) return

    if (this.data.greetingGenerated) {
      if (this.data.selectedTemplateId) {
        // 如果有预选模板，直接生成GIF
        await this.generateGIF()
      } else {
        // 跳转到模板选择页面，传递照片和祝福语
        wx.navigateTo({
          url: `/pages/templates/templates?mode=select&photo=${encodeURIComponent(this.data.formData.photo || '')}&greeting=${encodeURIComponent(this.data.greeting)}`
        })
      }
      return
    }

    wx.showLoading({ title: '正在生成...' })

    try {
      // 准备请求参数
      const params = {
        receiverTitle: this.data.formData.receiverTitle,
        relationship: this.data.relationships[this.data.formData.relationshipIndex],
        story: this.data.formData.story
      }

      // 调用 AI 服务生成祝福语
      const greeting = await aiService.generateGreeting(params)
      
      this.setData({
        greeting,
        greetingGenerated: true
      })

      wx.hideLoading()
    } catch (error) {
      console.error('生成祝福失败', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || '生成失败，请重试',
        icon: 'none'
      })
    }
  },

  // 生成GIF（仅在有预选模板时使用）
  async generateGIF() {
    wx.showLoading({ title: '正在生成GIF...' })

    try {
      // 调用模板服务生成GIF，如果没有上传照片则传空值，由服务处理默认照片
      const result = await templateService.generateGIF(
        this.data.selectedTemplateId,
        this.data.formData.photo || '',  // 如果没有上传照片则传空字符串
        this.data.greeting
      )

      // 跳转到预览页面
      wx.navigateTo({
        url: `/pages/preview/preview?url=${encodeURIComponent(result.url)}`
      })

      wx.hideLoading()
    } catch (error) {
      console.error('生成GIF失败', error)
      wx.hideLoading()
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      })
    }
  },

  // 重新生成祝福
  async regenerateGreeting() {
    this.setData({
      greeting: '',
      greetingGenerated: false
    }, () => {
      this.generateGreeting()
    })
  },

  // 编辑祝福文案
  onGreetingInput(e) {
    this.setData({
      greeting: e.detail.value
    })
  },

  // 返回上一页
  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
  },

  // 加载现有祝福（编辑模式）
  async loadGreeting(id) {
    wx.showLoading({ title: '加载中...' })

    try {
      // TODO: 调用获取祝福详情API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟数据
      this.setData({
        formData: {
          receiverTitle: '爸爸',
          relationshipIndex: 0,
          photo: '',
          story: '去年春节一起包饺子的温馨时刻'
        },
        greeting: '亲爱的爸爸：\n新年来临之际，祝愿您在新的一年里身体健康，万事如意！记得去年春节一起包饺子的温馨时刻，这些温暖的回忆永远铭记于心。愿您接下来的日子里充满欢笑与幸福，前程似锦！',
        greetingGenerated: true
      })

      wx.hideLoading()
    } catch (error) {
      console.error('加载祝福失败', error)
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  }
}) 