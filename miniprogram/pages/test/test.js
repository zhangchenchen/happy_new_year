Page({
  data: {
    logs: []
  },

  addLog(text) {
    const logs = this.data.logs;
    logs.unshift(`${new Date().toLocaleString()}: ${text}`);
    this.setData({ logs });
  },

  onLoad() {
    this.addLog('页面加载');
  },

  async testLogin() {
    try {
      this.addLog('开始登录测试...');
      
      // 获取登录code
      const loginResult = await wx.login();
      this.addLog(`获取到登录code: ${loginResult.code}`);
      
      // 调用后端登录接口
      const res = await wx.request({
        url: 'http://localhost:3000/api/user/login',
        method: 'POST',
        data: {
          code: loginResult.code
        }
      });
      
      this.addLog(`登录结果: ${JSON.stringify(res.data)}`);
      
    } catch (error) {
      this.addLog(`错误: ${error.message}`);
    }
  }
}); 