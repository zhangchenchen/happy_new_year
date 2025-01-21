// templates.js
Page({
  data: {
    templates: [
      {
        id: 1,
        name: '新春喜庆',
        preview: '/images/template1.png',
        isPremium: false
      },
      {
        id: 2,
        name: '温馨祝福',
        preview: '/images/template2.png',
        isPremium: false
      }
    ]
  },
  
  onLoad() {
    // 加载模板列表
  },
  
  selectTemplate(e) {
    const templateId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/create/create?templateId=${templateId}`
    });
  }
}) 