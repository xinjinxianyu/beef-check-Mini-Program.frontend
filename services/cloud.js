const env = require('../config/env')
const { request, upload } = require('../utils/request')
let cloudInitialized = false

async function submitFeedback(payload) {
  const feedback = Object.assign(
    {
      id: `feedback_${Date.now()}`,
      createdAt: Date.now()
    },
    payload
  )
  const localList = storageFeedback(feedback)

  if (env.FEEDBACK_DELIVERY_MODE === 'cloud') {
    const response = await sendFeedbackByCloud(feedback)
    return Object.assign(
      {
        feedbackId: feedback.id,
        emailSent: true,
        deliveredTo: env.FEEDBACK_EMAIL,
        localOnly: false,
        deliveryMode: 'cloud'
      },
      response || {}
    )
  }

  if (env.USE_MOCK_AUTH) {
    return { feedbackId: feedback.id, localOnly: true, count: localList.length }
  }

  const imagePath = feedback.imagePath
  const remotePayload = Object.assign({}, feedback, {
    hasImage: Boolean(imagePath)
  })
  delete remotePayload.imagePath

  const response = await request({
    path: env.FEEDBACK_PATH,
    method: 'POST',
    data: remotePayload
  })

  if (imagePath) {
    await upload({
      path: env.FEEDBACK_IMAGE_PATH,
      filePath: imagePath,
      name: 'sample',
      formData: {
        feedbackId: (response && response.feedbackId) || feedback.id
      }
    })
  }

  return response
}

function initializeCloud() {
  if (!wx.cloud) throw new Error('当前基础库不支持云开发')
  if (cloudInitialized) return
  const options = { traceUser: true }
  if (env.CLOUD_ENV_ID) options.env = env.CLOUD_ENV_ID
  wx.cloud.init(options)
  cloudInitialized = true
}

function uploadFeedbackImage(imagePath, feedbackId) {
  return new Promise((resolve, reject) => {
    const extension = (String(imagePath).match(/\.(png|jpe?g|webp)$/i) || ['.jpg'])[0]
    wx.cloud.uploadFile({
      cloudPath: `feedback/${feedbackId}-${Date.now()}${extension}`,
      filePath: imagePath,
      success(result) {
        resolve(result.fileID)
      },
      fail(error) {
        reject(new Error(error.errMsg || '反馈图片上传失败'))
      }
    })
  })
}

function callFeedbackFunction(feedback) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: env.FEEDBACK_CLOUD_FUNCTION,
      data: { feedback },
      success(result) {
        resolve(result.result || {})
      },
      fail(error) {
        reject(new Error(error.errMsg || '反馈发送失败'))
      }
    })
  })
}

async function sendFeedbackByCloud(feedback) {
  initializeCloud()
  let imageFileId = ''
  if (feedback.includeImage && feedback.imagePath) {
    imageFileId = await uploadFeedbackImage(feedback.imagePath, feedback.id)
  }

  const remoteFeedback = Object.assign({}, feedback, {
    imageFileId,
    hasImage: Boolean(imageFileId)
  })
  delete remoteFeedback.imagePath

  const response = await callFeedbackFunction(remoteFeedback)
  if (!response.ok) {
    throw new Error(response.message || '反馈邮件发送失败，请检查云函数配置')
  }
  return response
}

function storageFeedback(feedback) {
  const storage = require('./storage')
  const list = storage.read(storage.KEYS.FEEDBACK, [])
  const next = [feedback].concat(Array.isArray(list) ? list : []).slice(0, 50)
  storage.write(storage.KEYS.FEEDBACK, next)
  return next
}

module.exports = {
  submitFeedback
}
