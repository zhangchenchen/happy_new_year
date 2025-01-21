// API基础URL
const BASE_URL = 'http://localhost:3000/api';

// 请求方法
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: `${BASE_URL}${url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 401) {
          // token过期或无效，需要重新登录
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          // 跳转到登录页或重新登录
          handleReLogin();
          reject(new Error('需要重新登录'));
          return;
        }
        
        if (res.statusCode >= 400) {
          reject(new Error(res.data.message || '请求失败'));
          return;
        }
        
        resolve(res.data);
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
};

// 处理重新登录
const handleReLogin = () => {
  // 可以在这里添加自动重新登录的逻辑
  // 或者跳转到登录页
  console.log('需要重新登录');
};

// 导出请求方法
module.exports = {
  request,
  // GET请求
  get: (url, options = {}) => {
    return request(url, { ...options, method: 'GET' });
  },
  // POST请求
  post: (url, data, options = {}) => {
    return request(url, { ...options, method: 'POST', data });
  },
  // PUT请求
  put: (url, data, options = {}) => {
    return request(url, { ...options, method: 'PUT', data });
  },
  // DELETE请求
  delete: (url, options = {}) => {
    return request(url, { ...options, method: 'DELETE' });
  }
}; 