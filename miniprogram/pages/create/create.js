const app = getApp()

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
    canGenerate: false
  },

  onLoad(options) {
    // 如果是编辑模式，加载现有数据
    if (options.id) {
      this.loadGreeting(options.id)
    }
    // 监听表单数据变化
    this.watchFormData()
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
      
      // TODO: 调用上传API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      this.setData({
        'formData.photo': res.tempFilePaths[0]
      })
      
      wx.hideLoading()
    } catch (error) {
      console.error('选择图片失败', error)
      wx.showToast({
        title: '选择图片失败',
        icon: 'none'
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
      // 如果已经生成过祝福，点击下一步
      wx.navigateTo({
        url: '/pages/preview/preview'
      })
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

      // TODO: 调用AI生成接口
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟生成的祝福文案
      const greeting = `亲爱的${params.receiverTitle}：
新年来临之际，祝愿您在新的一年里身体健康，万事如意！${params.story ? '\n记得' + params.story + '，这些温暖的回忆永远铭记于心。' : ''}愿您接下来的日子里充满欢笑与幸福，前程似锦！`

      this.setData({
        greeting,
        greetingGenerated: true
      })

      wx.hideLoading()
    } catch (error) {
      console.error('生成祝福失败', error)
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