const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const ALLOWED_FILES = new Set([
  'part_detector_int8.onnx',
  'freshness_classifier_int8.onnx'
])

function isAllowedModelFile(fileID) {
  if (typeof fileID !== 'string') return false
  const match = fileID.match(/^cloud:\/\/[^/]+\/models\/beef-v1\/([^/]+)$/)
  return Boolean(match && ALLOWED_FILES.has(match[1]))
}

exports.main = async (event) => {
  const fileID = event && event.fileID
  if (!isAllowedModelFile(fileID)) {
    return {
      ok: false,
      code: 'FILE_NOT_ALLOWED',
      message: 'only the configured beef model files can be requested'
    }
  }

  try {
    const result = await cloud.getTempFileURL({
      fileList: [fileID]
    })
    const item = result.fileList && result.fileList[0]
    if (!item || !item.tempFileURL) {
      return {
        ok: false,
        code: 'TEMP_URL_UNAVAILABLE',
        message: (item && item.errMsg) || 'cloud storage returned no download url'
      }
    }
    return {
      ok: true,
      tempFileURL: item.tempFileURL
    }
  } catch (error) {
    console.error('model temp url failed', error)
    return {
      ok: false,
      code: 'MODEL_URL_FAILED',
      message: error && error.message ? error.message : String(error)
    }
  }
}
