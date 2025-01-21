const app = getApp()

Page({
  data: {
    motto: '用心传递新年祝福',
    userInfo: null,
    hasUserInfo: false
  },

  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true
      });
    }
  },

  // 处理登录
  async handleLogin() {
    try {
      // 获取用户信息
      const { code } = await wx.login();
      
      // 模拟登录成功
      const userInfo = {
        nickName: '测试用户',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
      };
      
      // 保存用户信息
      wx.setStorageSync('userInfo', userInfo);
      
      this.setData({
        userInfo,
        hasUserInfo: true
      });
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }
  },

  // 跳转到创建页面
  goToCreate() {
    console.log('点击了开始制作按钮');
    console.log('hasUserInfo:', this.data.hasUserInfo);
    
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 使用 switchTab 而不是 navigateTo，因为是 tabBar 页面
    wx.switchTab({
      url: '/pages/create/create',
      success: function() {
        console.log('跳转成功');
      },
      fail: function(error) {
        console.error('跳转失败:', error);
        // 尝试使用 navigateTo
        wx.navigateTo({
          url: '/pages/create/create',
          success: function() {
            console.log('navigateTo 跳转成功');
          },
          fail: function(err) {
            console.error('navigateTo 也失败了:', err);
            wx.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  // 跳转到模板中心
  goToTemplates() {
    wx.navigateTo({
      url: '/pages/templates/templates',
      fail: function(error) {
        console.error('模板中心跳转失败:', error);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  }
}); 