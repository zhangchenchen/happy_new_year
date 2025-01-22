// API配置
const API_BASE_URL = 'http://localhost:3000';

const API_PATHS = {
  // 模板相关接口
  templates: '/api/templates',
  templateDetail: '/api/templates/:id',
  upload: '/api/upload',
  generate: '/api/generate',
  
  // AI 相关接口
  ai: {
    generateGreeting: '/api/ai/generate-greeting'
  }
};

// 辅助函数：替换路径中的参数
const replacePathParams = (path, params) => {
  let result = path;
  Object.keys(params).forEach(key => {
    result = result.replace(`:${key}`, params[key]);
  });
  return result;
};

module.exports = {
  API_BASE_URL,
  API_PATHS,
  replacePathParams
}; 