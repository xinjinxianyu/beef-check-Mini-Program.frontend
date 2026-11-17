const KEYS = {
  USER: 'beef_user_profile_v1',
  TOKEN: 'beef_auth_token_v1',
  HISTORY: 'beef_history_v1',
  PENDING_RESULT: 'beef_pending_result_v1',
  MODEL_READY: 'beef_model_ready_v1',
  FEEDBACK: 'beef_feedback_v1'
}

function read(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined ? fallback : value
  } catch (error) {
    return fallback
  }
}

function write(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (error) {
    return false
  }
}

function remove(key) {
  try {
    wx.removeStorageSync(key)
  } catch (error) {
    // Cache removal is best effort on the client.
  }
}

function getUser() {
  return read(KEYS.USER, null)
}

function saveUser(user) {
  write(KEYS.USER, user)
}

function getAuthToken() {
  return read(KEYS.TOKEN, '')
}

function saveAuth(session) {
  if (session && session.token) write(KEYS.TOKEN, session.token)
  if (session && session.user) saveUser(session.user)
}

function clearAuth() {
  remove(KEYS.USER)
  remove(KEYS.TOKEN)
}

function getPendingResult() {
  return read(KEYS.PENDING_RESULT, null)
}

function savePendingResult(result) {
  write(KEYS.PENDING_RESULT, result)
}

function clearPendingResult() {
  remove(KEYS.PENDING_RESULT)
}

function clearLocalCache() {
  const { removePersistedImage } = require('../utils/media')
  const records = read(KEYS.HISTORY, [])
  const pending = read(KEYS.PENDING_RESULT, null)
  const feedback = read(KEYS.FEEDBACK, [])
  const imagePaths = []

  if (Array.isArray(records)) {
    records.forEach((item) => {
      if (item && item.imagePath) imagePaths.push(item.imagePath)
    })
  }
  if (pending && pending.imagePath) imagePaths.push(pending.imagePath)
  if (Array.isArray(feedback)) {
    feedback.forEach((item) => {
      if (item && item.imagePath) imagePaths.push(item.imagePath)
    })
  }

  Array.from(new Set(imagePaths)).forEach((imagePath) => {
    removePersistedImage(imagePath)
  })

  remove(KEYS.HISTORY)
  remove(KEYS.PENDING_RESULT)
  remove(KEYS.MODEL_READY)
  remove(KEYS.FEEDBACK)
}

module.exports = {
  KEYS,
  read,
  write,
  remove,
  getUser,
  saveUser,
  getAuthToken,
  saveAuth,
  clearAuth,
  getPendingResult,
  savePendingResult,
  clearPendingResult,
  clearLocalCache
}
