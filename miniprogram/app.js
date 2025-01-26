App({
  globalData: {
    selectedTemplateId: null,
    userInfo: null,
    serverUrl: 'http://localhost:3000', // 开发环境
    // serverUrl: 'https://your-production-url.com', // 生产环境
  },
  
  onLaunch() {
    console.log('小程序启动');
  }
}) 