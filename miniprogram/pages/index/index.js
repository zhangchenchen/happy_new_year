const userService = require('../../services/userService');

Page({
  data: {
    motto: '用心传递新年祝福',
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }

    // 检查是否已登录
    const userInfo = userService.getCurrentUser();
    if (userInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true
      });
    }
  },

  async handleLogin() {
    try {
      if (!this.data.canIUseGetUserProfile) {
        wx.showToast({
          title: '请更新微信版本',
          icon: 'none'
        });
        return;
      }

      // 先获取用户信息
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });

      // 再进行微信登录
      await userService.login();
      
      // 更新用户信息
      await userService.updateUserInfo({
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      });
      
      this.setData({
        userInfo,
        hasUserInfo: true
      });
      
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: error.errMsg || '登录失败',
        icon: 'none'
      });
    }
  },

  // 跳转到创建页面
  goToCreate() {
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/create/create'
    });
  },

  // 跳转到模板中心
  goToTemplates() {
    wx.navigateTo({
      url: '/pages/templates/templates'
    });
  }
}); 