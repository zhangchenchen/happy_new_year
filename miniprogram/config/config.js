// API配置
const API_BASE_URL = 'http://localhost:3000/api';

const API_PATHS = {
  templates: '/templates',
  templateDetail: (id) => `/templates/${id}`,
  generate: '/generate',
  upload: '/upload'
};

module.exports = {
  API_BASE_URL,
  API_PATHS
}; 