const cloud = require('wx-server-sdk')
const nodemailer = require('nodemailer')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const TARGET_EMAIL = process.env.FEEDBACK_TO || '2960453506@qq.com'
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeFeedback(input, openid) {
  const feedback = input && typeof input === 'object' ? input : {}
  return {
    id: String(feedback.id || `feedback_${Date.now()}`).slice(0, 100),
    resultId: String(feedback.resultId || '').slice(0, 100),
    cutId: String(feedback.cutId || '').slice(0, 100),
    reasons: Array.isArray(feedback.reasons)
      ? feedback.reasons.slice(0, 8).map((item) => String(item).slice(0, 50))
      : [],
    note: String(feedback.note || '').slice(0, 500),
    includeImage: Boolean(feedback.includeImage),
    hasImage: Boolean(feedback.hasImage),
    imageFileId: String(feedback.imageFileId || ''),
    openid,
    createdAtClient: Number(feedback.createdAt) || Date.now()
  }
}

function feedbackHtml(feedback) {
  const rows = [
    ['反馈编号', feedback.id],
    ['识别部位 ID', feedback.cutId || '未识别'],
    ['识别记录 ID', feedback.resultId || '未提供'],
    ['反馈类型', feedback.reasons.join('、') || '未填写'],
    ['用户补充', feedback.note || '无'],
    ['用户 OpenID', feedback.openid || '未获取'],
    ['提交时间', new Date(feedback.createdAtClient).toISOString()]
  ]
  return `
    <h2>识牛小程序用户反馈</h2>
    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;font-family:sans-serif">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="background:#f5f2e8"><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`
        )
        .join('')}
    </table>
  `
}

exports.main = async (event) => {
  const smtpUser = String(process.env.SMTP_USER || '').trim()
  const smtpPass = String(process.env.SMTP_PASS || '').trim()

  if (!smtpUser || !smtpPass) {
    return {
      ok: false,
      code: 'SMTP_NOT_CONFIGURED',
      message: '云函数缺少 SMTP_USER 或 SMTP_PASS 环境变量'
    }
  }
  if (!smtpUser.includes('@')) {
    return {
      ok: false,
      code: 'SMTP_USER_INVALID',
      message: 'SMTP_USER 必须填写完整 QQ 邮箱地址'
    }
  }

  const context = cloud.getWXContext()
  const feedback = normalizeFeedback(event && event.feedback, context.OPENID)
  const attachments = []

  if (feedback.hasImage && feedback.imageFileId) {
    try {
      const image = await cloud.downloadFile({
        fileID: feedback.imageFileId
      })
      if (image.fileContent && image.fileContent.length <= MAX_ATTACHMENT_BYTES) {
        attachments.push({
          filename: `${feedback.id}.jpg`,
          content: image.fileContent
        })
      }
    } catch (error) {
      console.error('feedback image download failed', error)
    }
  }

  let info
  let lastError
  try {
    const transports = [
      { port: 465, secure: true },
      { port: 587, secure: false, requireTLS: true }
    ]
    for (const transportConfig of transports) {
      const transporter = nodemailer.createTransport(
        Object.assign(
          {
            host: 'smtp.qq.com',
            auth: {
              user: smtpUser,
              pass: smtpPass
            },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 12000
          },
          transportConfig
        )
      )
      try {
        info = await transporter.sendMail({
          from: `"识牛小程序" <${smtpUser}>`,
          to: TARGET_EMAIL,
          subject: `【识牛小程序】用户反馈 ${feedback.id}`,
          text: [
            '识牛小程序用户反馈',
            `反馈编号：${feedback.id}`,
            `识别部位：${feedback.cutId || '未识别'}`,
            `识别记录：${feedback.resultId || '未提供'}`,
            `反馈类型：${feedback.reasons.join('、') || '未填写'}`,
            `用户补充：${feedback.note || '无'}`,
            `用户 OpenID：${feedback.openid || '未获取'}`
          ].join('\n'),
          html: feedbackHtml(feedback),
          attachments
        })
        break
      } catch (error) {
        lastError = error
        const networkFailure = ['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'ECONNREFUSED'].includes(error.code)
        if (!networkFailure) throw error
        console.error(`SMTP port ${transportConfig.port} failed`, error.code)
      }
    }
    if (!info) throw lastError || new Error('SMTP 连接失败')
  } catch (error) {
    console.error('feedback email failed', error)
    const code = error.code || 'EMAIL_SEND_FAILED'
    const hint =
      code === 'EAUTH' || error.responseCode === 535
        ? 'QQ 邮箱授权码无效，请重新生成授权码并更新 SMTP_PASS'
        : code === 'ETIMEDOUT' || code === 'ESOCKET' || code === 'ECONNECTION'
          ? '云函数无法连接 smtp.qq.com，请检查云函数网络'
          : '请检查 QQ 邮箱 SMTP 设置和云函数日志'
    return {
      ok: false,
      code,
      message: `邮件发送失败（${code}）：${hint}`
    }
  }

  let saved = false
  try {
    await db.collection('feedback').add({
      data: Object.assign({}, feedback, {
        emailStatus: 'sent',
        emailMessageId: info.messageId,
        deliveredTo: TARGET_EMAIL,
        createdAt: db.serverDate()
      })
    })
    saved = true
  } catch (error) {
    console.error('feedback database save failed', error)
  }

  return {
    ok: true,
    feedbackId: feedback.id,
    deliveredTo: TARGET_EMAIL,
    messageId: info.messageId,
    stored: saved
  }
}
