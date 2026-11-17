const knowledge = require('../data/encyclopedia')
const config = require('../config/model')
const env = require('../config/env')

const CLASS_NAMES = [
  'beef_chuck',
  'beef_fillet',
  'beef_flank',
  'beef_round',
  'strip_loin'
]

const ARTICLE_IDS = {
  beef_chuck: 'shoulder',
  beef_fillet: 'tenderloin',
  beef_flank: 'brisket',
  beef_round: 'rump',
  strip_loin: 'sirloin'
}

const IMAGENET_MEAN = [0.485, 0.456, 0.406]
const IMAGENET_STD = [0.229, 0.224, 0.225]
let detectorSession = null
let freshnessSession = null
let loadingPromise = null
let cachedModelInfo = null
let cloudInitialized = false

function ensureCloudReady() {
  if (!wx.cloud) throw new Error('wx.cloud is unavailable')
  if (!cloudInitialized) {
    wx.cloud.init({
      env: env.CLOUD_ENV_ID,
      traceUser: true
    })
    cloudInitialized = true
  }
}

function fileExists(path) {
  return new Promise((resolve) => {
    if (!path) return resolve(false)
    const fs = typeof wx.getFileSystemManager === 'function' ? wx.getFileSystemManager() : null
    if (!fs || typeof fs.access !== 'function') return resolve(false)
    fs.access({
      path,
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

function copyFile(srcPath, destPath) {
  return new Promise((resolve, reject) => {
    const fs = typeof wx.getFileSystemManager === 'function' ? wx.getFileSystemManager() : null
    if (!fs || typeof fs.copyFile !== 'function') {
      reject(new Error('wx.getFileSystemManager is unavailable'))
      return
    }
    fs.copyFile({
      srcPath,
      destPath,
      success: resolve,
      fail: reject
    })
  })
}

function modelFileSize(path) {
  return new Promise((resolve) => {
    const fs = typeof wx.getFileSystemManager === 'function' ? wx.getFileSystemManager() : null
    if (!fs || typeof fs.getFileInfo !== 'function') {
      resolve(-1)
      return
    }
    fs.getFileInfo({
      filePath: path,
      success: (result) => resolve(Number(result.size) || -1),
      fail: () => resolve(-1)
    })
  })
}

function removeFile(path) {
  return new Promise((resolve) => {
    const fs = typeof wx.getFileSystemManager === 'function' ? wx.getFileSystemManager() : null
    if (!fs || typeof fs.unlink !== 'function') {
      resolve()
      return
    }
    fs.unlink({ filePath: path, success: resolve, fail: resolve })
  })
}

async function isExpectedModelFile(key, path) {
  const expected = config.EXPECTED_MODEL_BYTES[key]
  if (!expected) return true
  const actual = await modelFileSize(path)
  if (actual === expected) return true
  if (actual > 0) await removeFile(path)
  return false
}

function userModelPath(filename) {
  return `${wx.env.USER_DATA_PATH}/${filename}`
}

function downloadTask(url, onProgress) {
  return new Promise((resolve, reject) => {
    const task = wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`model download status ${res.statusCode}`))
          return
        }
        resolve(res.tempFilePath)
      },
      fail: reject
    })
    if (task && task.onProgressUpdate) {
      task.onProgressUpdate((res) => {
        if (typeof onProgress === 'function') onProgress(res.progress)
      })
    }
  })
}

function modelUrlFromFunction(cloudId) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: config.MODEL_URL_CLOUD_FUNCTION,
      data: { fileID: cloudId },
      success: (response) => {
        const result = response && response.result
        if (!result || !result.ok || !result.tempFileURL) {
          const code = (result && result.code) || 'UNKNOWN'
          const message = (result && result.message) || 'no download url'
          reject(new Error(`model url function failed (${code}: ${message})`))
          return
        }
        resolve(result.tempFileURL)
      },
      fail: (error) => {
        reject(new Error(`model url function failed: ${error && error.errMsg ? error.errMsg : error}`))
      }
    })
  })
}

async function modelUrlFromCloud(cloudId) {
  let functionError = null
  if (config.MODEL_URL_CLOUD_FUNCTION) {
    try {
      return await modelUrlFromFunction(cloudId)
    } catch (error) {
      functionError = error
    }
  }

  const cloudResult = await new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: [cloudId],
      success: resolve,
      fail: reject
    })
  })
  const item = cloudResult.fileList && cloudResult.fileList[0]
  if (item && item.tempFileURL) return item.tempFileURL

  const status = item && item.status !== undefined ? item.status : 'unknown'
  const reason = (item && item.errMsg) || cloudResult.errMsg || 'no error message'
  const functionReason = functionError ? `; function: ${functionError.message}` : ''
  throw new Error(`empty cloud download url (${status}: ${reason}${functionReason})`)
}

async function ensureModel(key, onProgress) {
  const filename = key === 'detector' ? config.DETECTOR_FILE : config.FRESHNESS_FILE
  const cachedPath = userModelPath(filename)
  if (await fileExists(cachedPath) && await isExpectedModelFile(key, cachedPath)) return cachedPath

  const localPath = config.LOCAL_MODEL_PATHS[key]
  if (localPath && await fileExists(localPath) && await isExpectedModelFile(key, localPath)) return localPath

  let tempPath = ''
  const cloudId = config.MODEL_CLOUD_IDS[key]
  if (cloudId) {
    ensureCloudReady()
    const tempFileURL = await modelUrlFromCloud(cloudId)
    tempPath = await downloadTask(tempFileURL, onProgress)
  } else if (config.MODEL_BASE_URL) {
    const url = `${config.MODEL_BASE_URL.replace(/\/$/, '')}/${filename}`
    tempPath = await downloadTask(url, onProgress)
  } else {
    throw new Error('MODEL_NOT_CONFIGURED')
  }

  await copyFile(tempPath, cachedPath)
  const actual = await modelFileSize(cachedPath)
  const expected = config.EXPECTED_MODEL_BYTES[key]
  if (expected && actual !== expected) {
    await removeFile(cachedPath)
    throw new Error(`${key} model size mismatch (cloud: ${actual}, expected: ${expected}); replace the cloud model file`)
  }
  return cachedPath
}

function createSession(modelPath, shape, key) {
  return new Promise((resolve, reject) => {
    if (typeof wx.createInferenceSession !== 'function') {
      reject(new Error('wx.createInferenceSession is unavailable'))
      return
    }
    const session = wx.createInferenceSession({
      model: modelPath,
      precisionLevel: 4,
      typicalShape: { images: shape },
      allowQuantize: false,
      allowNPU: false
    })
    session.onLoad(() => resolve(session))
    session.onError((error) => {
      const message = error && (error.errMsg || error.message) ? (error.errMsg || error.message) : String(error)
      reject(new Error(`${key} model conversion failed: ${message}`))
    })
  })
}

function loadModel(onProgress) {
  if (detectorSession && freshnessSession) {
    if (typeof onProgress === 'function') onProgress(100)
    return Promise.resolve(Object.assign({ cached: true }, cachedModelInfo))
  }
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const progress = (value) => {
      if (typeof onProgress === 'function') onProgress(Math.max(0, Math.min(100, value)))
    }
    const detectorPath = await ensureModel('detector', (p) => progress(Math.round(p * 0.35)))
    progress(42)
    const freshnessPath = await ensureModel('freshness', (p) => progress(42 + Math.round(p * 0.25)))
    progress(72)
    detectorSession = await createSession(detectorPath, [1, 3, config.DET_IMGSZ, config.DET_IMGSZ], 'detector')
    progress(86)
    freshnessSession = await createSession(freshnessPath, [1, 3, config.CLS_IMGSZ, config.CLS_IMGSZ], 'freshness')
    progress(100)
    cachedModelInfo = {
      version: config.MODEL_VERSION,
      sizeLabel: config.MODEL_SIZE_LABEL,
      mode: 'local-onnx'
    }
    return Object.assign({ cached: false }, cachedModelInfo)
  })().catch((error) => {
    loadingPromise = null
    throw error
  })
  return loadingPromise
}

function isReady() {
  return Boolean(detectorSession && freshnessSession)
}

function loadCanvasImage(canvas, src) {
  return new Promise((resolve, reject) => {
    const image = canvas.createImage()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function imageInfo(src) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({ src, success: resolve, fail: reject })
  })
}

function imageDataTensor(imageData, width, height, normalize) {
  const pixels = imageData.data
  const out = new Float32Array(3 * width * height)
  for (let i = 0; i < width * height; i += 1) {
    const r = pixels[i * 4] / 255
    const g = pixels[i * 4 + 1] / 255
    const b = pixels[i * 4 + 2] / 255
    if (normalize) {
      out[i] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0]
      out[width * height + i] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1]
      out[2 * width * height + i] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2]
    } else {
      out[i] = r
      out[width * height + i] = g
      out[2 * width * height + i] = b
    }
  }
  return out
}

async function detectorTensor(src) {
  const size = config.DET_IMGSZ
  const info = await imageInfo(src)
  const scale = Math.min(size / info.width, size / info.height)
  const drawWidth = Math.round(info.width * scale)
  const drawHeight = Math.round(info.height * scale)
  const padX = Math.round((size - drawWidth) / 2)
  const padY = Math.round((size - drawHeight) / 2)
  const canvas = wx.createOffscreenCanvas({ type: '2d', width: size, height: size })
  const context = canvas.getContext('2d')
  const image = await loadCanvasImage(canvas, src)
  context.fillStyle = '#727272'
  context.fillRect(0, 0, size, size)
  context.drawImage(image, padX, padY, drawWidth, drawHeight)
  const imageData = context.getImageData(0, 0, size, size)
  return {
    tensor: {
      type: 'float32',
      data: imageDataTensor(imageData, size, size, false).buffer,
      shape: [1, 3, size, size]
    },
    scale,
    padX,
    padY,
    width: info.width,
    height: info.height
  }
}

async function classifierTensor(src, box) {
  const size = config.CLS_IMGSZ
  const info = await imageInfo(src)
  const canvas = wx.createOffscreenCanvas({ type: '2d', width: size, height: size })
  const context = canvas.getContext('2d')
  const image = await loadCanvasImage(canvas, src)
  const sx = box ? box.x1 : 0
  const sy = box ? box.y1 : 0
  const sw = box ? Math.max(1, box.x2 - box.x1) : info.width
  const sh = box ? Math.max(1, box.y2 - box.y1) : info.height
  context.drawImage(image, sx, sy, sw, sh, 0, 0, size, size)
  const imageData = context.getImageData(0, 0, size, size)
  return {
    type: 'float32',
    data: imageDataTensor(imageData, size, size, true).buffer,
    shape: [1, 3, size, size]
  }
}

function tensorArray(tensor) {
  if (!tensor) return new Float32Array()
  if (tensor.data instanceof ArrayBuffer) return new Float32Array(tensor.data)
  return new Float32Array(tensor.data)
}

function articleFor(className) {
  const id = ARTICLE_IDS[className]
  const article = knowledge.articles.find((item) => item.id === id)
  if (!article) {
    return {
      cutId: className,
      cutName: className,
      cutAlias: className,
      flavor: '',
      serving: '',
      reason: [],
      note: ''
    }
  }
  const sections = article.sections || []
  return {
    cutId: article.id,
    cutName: article.title,
    cutAlias: article.subtitle,
    flavor: article.summary || '',
    serving: sections.length ? sections[sections.length - 1].text : '',
    reason: sections.slice(0, 2).map((item) => item.text),
    note: article.summary || ''
  }
}

function toImageBox(box, meta) {
  let x1 = box.x1
  let y1 = box.y1
  let x2 = box.x2
  let y2 = box.y2
  if (Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2)) <= 1.5) {
    x1 *= config.DET_IMGSZ
    y1 *= config.DET_IMGSZ
    x2 *= config.DET_IMGSZ
    y2 *= config.DET_IMGSZ
  }
  return {
    className: box.className,
    score: box.score,
    x1: Math.max(0, Math.min(meta.width, (x1 - meta.padX) / meta.scale)),
    y1: Math.max(0, Math.min(meta.height, (y1 - meta.padY) / meta.scale)),
    x2: Math.max(0, Math.min(meta.width, (x2 - meta.padX) / meta.scale)),
    y2: Math.max(0, Math.min(meta.height, (y2 - meta.padY) / meta.scale))
  }
}

function intersectionOverUnion(a, b) {
  const interWidth = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1))
  const interHeight = Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1))
  const intersection = interWidth * interHeight
  const areaA = Math.max(0, a.x2 - a.x1) * Math.max(0, a.y2 - a.y1)
  const areaB = Math.max(0, b.x2 - b.x1) * Math.max(0, b.y2 - b.y1)
  return intersection / Math.max(1e-9, areaA + areaB - intersection)
}

function nonMaxSuppression(boxes) {
  const sorted = boxes.slice().sort((a, b) => b.score - a.score)
  const kept = []
  for (let i = 0; i < sorted.length && kept.length < config.DET_MAX_BOXES; i += 1) {
    const candidate = sorted[i]
    const duplicate = kept.some((item) => (
      item.className === candidate.className &&
      intersectionOverUnion(item, candidate) > config.DET_NMS_IOU
    ))
    if (!duplicate) kept.push(candidate)
  }
  return kept
}

function endToEndBoxes(output, meta) {
  const values = tensorArray(output)
  const rows = output && output.shape && output.shape.length === 3 ? output.shape[1] : Math.floor(values.length / 6)
  const boxes = []
  for (let row = 0; row < rows; row += 1) {
    const offset = row * 6
    const score = values[offset + 4]
    const classIndex = Math.round(values[offset + 5])
    if (!Number.isFinite(score) || score < config.DET_CONF || classIndex < 0 || classIndex >= CLASS_NAMES.length) continue
    const item = toImageBox({
      className: CLASS_NAMES[classIndex],
      score,
      x1: values[offset],
      y1: values[offset + 1],
      x2: values[offset + 2],
      y2: values[offset + 3]
    }, meta)
    if (item.x2 > item.x1 && item.y2 > item.y1) boxes.push(item)
  }
  return boxes
}

function rawPredictionBoxes(output, meta) {
  const values = tensorArray(output)
  const channels = output.shape[1]
  const anchors = output.shape[2]
  const classCount = channels - 4
  const boxes = []
  for (let anchor = 0; anchor < anchors; anchor += 1) {
    let bestClass = -1
    let bestScore = 0
    for (let classIndex = 0; classIndex < classCount; classIndex += 1) {
      const score = values[(4 + classIndex) * anchors + anchor]
      if (score > bestScore) {
        bestScore = score
        bestClass = classIndex
      }
    }
    if (bestClass < 0 || bestScore < config.DET_CONF || bestClass >= CLASS_NAMES.length) continue
    const centerX = values[anchor]
    const centerY = values[anchors + anchor]
    const width = values[anchors * 2 + anchor]
    const height = values[anchors * 3 + anchor]
    const item = toImageBox({
      className: CLASS_NAMES[bestClass],
      score: bestScore,
      x1: centerX - width / 2,
      y1: centerY - height / 2,
      x2: centerX + width / 2,
      y2: centerY + height / 2
    }, meta)
    if (item.x2 > item.x1 && item.y2 > item.y1) boxes.push(item)
  }
  return nonMaxSuppression(boxes)
}

function bestBox(output, meta) {
  let boxes = []
  if (output && output.shape && output.shape.length === 3) {
    if (output.shape[1] === 300 && output.shape[2] === 6) {
      boxes = endToEndBoxes(output, meta)
    } else if (output.shape[1] >= 5 && output.shape[2] > output.shape[1]) {
      boxes = rawPredictionBoxes(output, meta)
    }
  }
  boxes.sort((a, b) => b.score - a.score)
  return {
    best: boxes.length ? boxes[0] : null,
    boxes
  }
}

async function recognize(src, onProgress) {
  if (!isReady()) await loadModel()
  if (typeof onProgress === 'function') onProgress(5)
  const detectorInput = await detectorTensor(src)
  const detectorResult = await detectorSession.run({ images: detectorInput.tensor })
  if (typeof onProgress === 'function') onProgress(45)
  const parsed = bestBox(detectorResult.output0, detectorInput)
  const best = parsed.best
  const box = best ? {
    x1: Math.max(0, best.x1 - (best.x2 - best.x1) * 0.15),
    y1: Math.max(0, best.y1 - (best.y2 - best.y1) * 0.15),
    x2: Math.min(detectorInput.width, best.x2 + (best.x2 - best.x1) * 0.15),
    y2: Math.min(detectorInput.height, best.y2 + (best.y2 - best.y1) * 0.15)
  } : null
  const classTensor = await classifierTensor(src, box)
  const classResult = await freshnessSession.run({ images: classTensor })
  if (typeof onProgress === 'function') onProgress(92)
  const probabilities = tensorArray(classResult.output0)
  const freshProb = probabilities.length > 0 ? probabilities[0] : 0
  const rottenProb = probabilities.length > 1 ? probabilities[1] : 0
  const className = best ? best.className : 'unknown'
  const meta = className === 'unknown' ? {
    cutId: 'unknown',
    cutName: '\u672a\u8bc6\u522b',
    cutAlias: 'UNKNOWN',
    flavor: '',
    serving: '',
    reason: [],
    note: ''
  } : articleFor(className)
  const partScore = best ? best.score : 0
  const areaRatio = best ? ((best.x2 - best.x1) * (best.y2 - best.y1)) / (detectorInput.width * detectorInput.height) : 0
  const partReliable = Boolean(best && partScore >= config.MIN_PART_CONF && areaRatio <= config.MAX_BBOX_AREA)
  const result = {
    id: `beef_${Date.now()}`,
    imagePath: src,
    createdAt: Date.now(),
    modelVersion: config.MODEL_VERSION,
    status: 'complete',
    cutId: meta.cutId,
    cutName: meta.cutName,
    cutAlias: meta.cutAlias,
    freshness: Math.round(freshProb * 1000) / 10,
    confidence: Math.round(partScore * 1000) / 10,
    freshnessLabel: freshProb >= 0.5 ? '\u65b0\u9c9c' : '\u4e0d\u65b0\u9c9c',
    flavor: meta.flavor,
    serving: meta.serving,
    reason: meta.reason,
    note: meta.note,
    partReliable,
    partStatus: partReliable ? 'accepted' : 'unknown',
    freshProbability: Math.round(freshProb * 1000) / 10,
    rottenProbability: Math.round(rottenProb * 1000) / 10,
    boxes: parsed.boxes.map((item) => ({
      x: item.x1 / detectorInput.width,
      y: item.y1 / detectorInput.height,
      width: (item.x2 - item.x1) / detectorInput.width,
      height: (item.y2 - item.y1) / detectorInput.height,
      label: `${CLASS_NAMES.indexOf(item.className) >= 0 ? articleFor(item.className).cutName : item.className} ${Math.round(item.score * 100)}%`
    }))
  }
  if (typeof onProgress === 'function') onProgress(100)
  return result
}

module.exports = {
  loadModel,
  recognize,
  isReady
}
