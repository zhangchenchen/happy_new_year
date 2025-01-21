const { post, put } = require('../utils/request');

// 用户服务
const userService = {
  /**
   * 微信登录
   * @returns {Promise<{token: string, user: object}>}
   */
  async login() {
    try {
      // 获取微信登录凭证
      const { code } = await wx.login();
      
      // 调用后端登录接口
      const res = await post('/user/login', { code });
      
      // 保存登录信息
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('userInfo', res.data.user);
      
      return res.data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  /**
   * 更新用户信息
   * @param {object} userInfo 用户信息
   * @returns {Promise<{user: object}>}
   */
  async updateUserInfo(userInfo) {
    try {
      const res = await put('/user/update', userInfo);
      
      // 更新本地存储的用户信息
      const currentUser = wx.getStorageSync('userInfo') || {};
      wx.setStorageSync('userInfo', { ...currentUser, ...res.data.user });
      
      return res.data;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 获取当前登录用户信息
   * @returns {object|null}
   */
  getCurrentUser() {
    return wx.getStorageSync('userInfo') || null;
  },

  /**
   * 检查是否已登录
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!wx.getStorageSync('token');
  },

  /**
   * 退出登录
   */
  logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  }
};

module.exports = userService; 