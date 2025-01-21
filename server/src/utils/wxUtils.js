const axios = require('axios');
const logger = require('./logger');

/**
 * 调用微信登录接口获取openid和session_key
 * @param {string} code 小程序登录时获取的code
 * @returns {Promise<{openid: string, session_key: string}>}
 */
async function code2Session(code) {
  try {
    const { WECHAT_APPID, WECHAT_SECRET } = process.env;
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`;
    
    const response = await axios.get(url);
    const { openid, session_key, errcode, errmsg } = response.data;
    
    if (errcode) {
      throw new Error(`微信登录失败: ${errmsg}`);
    }
    
    return { openid, session_key };
  } catch (error) {
    logger.error('微信登录错误:', error);
    throw error;
  }
}

module.exports = {
  code2Session
}; 