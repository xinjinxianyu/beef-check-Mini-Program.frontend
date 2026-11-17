const env = require('../config/env')
const storage = require('./storage')
const { request } = require('../utils/request')

function getWechatCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      timeout: 8000,
      success(result) {
        if (!result.code) {
          reject(new Error('微信登录凭证获取失败'))
          return
        }
        resolve(result.code)
      },
      fail(error) {
        reject(new Error(error.errMsg || '微信登录失败'))
      }
    })
  })
}

function requestProfile() {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于在个人中心展示头像昵称',
      success(result) {
        resolve(result.userInfo)
      },
      fail(error) {
        reject(new Error(error.errMsg || '您取消了授权'))
      }
    })
  })
}

async function login() {
  // getUserProfile 必须在用户点击事件中尽快调用，因此先请求资料，再换登录态。
  const profile = await requestProfile()
  const code = await getWechatCode()

  if (env.USE_MOCK_AUTH) {
    const session = {
      token: `dev_${Date.now()}`,
      user: {
        nickName: profile.nickName || '牛肉爱好者',
        avatarUrl: profile.avatarUrl || '',
        loginAt: Date.now()
      }
    }
    storage.saveAuth(session)
    return session.user
  }

  const session = await request({
    path: env.WECHAT_LOGIN_PATH,
    method: 'POST',
    data: {
      code,
      profile: {
        nickName: profile.nickName || '',
        avatarUrl: profile.avatarUrl || ''
      }
    }
  })
  storage.saveAuth(session)
  return session.user
}

function logout() {
  storage.clearAuth()
}

module.exports = {
  login,
  logout
}
