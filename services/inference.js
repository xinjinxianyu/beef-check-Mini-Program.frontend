const config = require('../config/model')
const real = require('./onnxInference')
const demo = require('./inferenceDemo')

async function loadModel(onProgress) {
  if (!config.USE_ONNX) return demo.loadModel(onProgress)
  try {
    return await real.loadModel(onProgress)
  } catch (error) {
    if (!config.ALLOW_MOCK_FALLBACK) throw error
    console.warn('[inference] local ONNX unavailable, using demo:', error)
    return demo.loadModel(onProgress)
  }
}

function recognize(photoPath, onProgress) {
  if (real.isReady()) return real.recognize(photoPath, onProgress)
  if (config.ALLOW_MOCK_FALLBACK) return demo.recognize(photoPath, onProgress)
  return Promise.reject(new Error('local ONNX model is not ready'))
}

module.exports = {
  MODEL_VERSION: config.MODEL_VERSION,
  MODEL_SIZE_LABEL: config.MODEL_SIZE_LABEL,
  loadModel,
  recognize
}
