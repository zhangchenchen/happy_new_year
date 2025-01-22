/**
 * HTTP请求工具类
 */
const request = ({ url, method = 'GET', data = null }) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}` // 如果需要token
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络错误'));
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