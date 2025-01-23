// user.js
Page({
  data: {
    userInfo: null
  },

  onLoad() {
    // 尝试获取缓存中的用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  onShow() {
    // 每次显示页面时更新用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  }
}) 