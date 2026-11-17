const env = require('../config/env')
const storage = require('../services/storage')

function request(options) {
  const token = storage.getAuthToken()
  const path = options.path || ''
  const url = /^https?:\/\//.test(path)
    ? path
    : `${env.API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: env.REQUEST_TIMEOUT,
      header: Object.assign(
        {
          'content-type': 'application/json',
          'x-client': 'wechat-miniprogram'
        },
        token ? { Authorization: `Bearer ${token}` } : {},
        options.header || {}
      ),
      success(response) {
        const body = response.data || {}
        if (response.statusCode >= 200 && response.statusCode < 300 && body.code !== -1) {
          resolve(body.data !== undefined ? body.data : body)
          return
        }

        const message = body.message || body.msg || `请求失败（${response.statusCode}）`
        reject(new Error(message))
      },
      fail(error) {
        reject(new Error(error.errMsg || '网络连接失败，请稍后再试'))
      }
    })
  })
}

function upload(options) {
  const token = storage.getAuthToken()
  const path = options.path || ''
  const url = /^https?:\/\//.test(path)
    ? path
    : `${env.API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url,
      filePath: options.filePath,
      name: options.name || 'file',
      formData: options.formData || {},
      timeout: env.REQUEST_TIMEOUT,
      header: Object.assign(
        token ? { Authorization: `Bearer ${token}` } : {},
        options.header || {}
      ),
      success(response) {
        let body = response.data
        if (typeof body === 'string') {
          try {
            body = JSON.parse(body)
          } catch (error) {
            body = {}
          }
        }
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(body && body.data !== undefined ? body.data : body)
          return
        }
        reject(new Error((body && (body.message || body.msg)) || `上传失败（${response.statusCode}）`))
      },
      fail(error) {
        reject(new Error(error.errMsg || '图片上传失败'))
      }
    })
  })
}

module.exports = {
  request,
  upload
}
