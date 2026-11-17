/**
 * 部署时只需修改此文件。
 *
 * 安全说明：任何大模型密钥都必须放在服务端。小程序端只请求自有后端，
 * 由后端再调用文心一言、通义千问等服务商接口。
 */
module.exports = {
  API_BASE_URL: 'https://api.example.com',
  AI_ASSISTANT_PATH: '/v1/ai/beef-assistant',
  WECHAT_LOGIN_PATH: '/v1/auth/wechat',
  FEEDBACK_PATH: '/v1/feedback',
  FEEDBACK_IMAGE_PATH: '/v1/feedback/sample',
  FEEDBACK_EMAIL: '2960453506@qq.com',
  FEEDBACK_DELIVERY_MODE: 'cloud',
  CLOUD_ENV_ID: 'xinjinxianyv-d0glj1dtxac1b7bf7',
  FEEDBACK_CLOUD_FUNCTION: 'sendFeedbackEmail',
  USE_MOCK_AI: true,
  USE_MOCK_AUTH: true,
  REQUEST_TIMEOUT: 20000
}
