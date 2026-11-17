const storage = require('./storage')

const MODEL_VERSION = 'beef-local-demo-1.0'
const MODEL_SIZE_LABEL = '约 3 MB'

const RESULT_TEMPLATES = [
  {
    cutId: 'ribeye',
    cutName: '眼肉',
    cutAlias: '肋眼 · Ribeye',
    freshness: 88,
    confidence: 92,
    freshnessLabel: '新鲜',
    flavor: '脂香浓郁 · 肉质柔嫩',
    serving: '牛排 / 香煎 / 炭烤',
    reason: ['肌间脂肪呈细密大理石纹', '肉色鲜红且有自然光泽'],
    note: '适合快速高温烹饪，煎好后静置 3–5 分钟再切，肉汁更稳定。',
    boxes: [
      { x: 0.16, y: 0.2, width: 0.62, height: 0.58, label: '眼肉 92%' }
    ]
  },
  {
    cutId: 'brisket',
    cutName: '牛腩',
    cutAlias: '胸腹肉 · Brisket',
    freshness: 84,
    confidence: 89,
    freshnessLabel: '较新鲜',
    flavor: '筋膜丰富 · 肉香醇厚',
    serving: '番茄炖牛腩 / 红烧 / 清炖',
    reason: ['可见交错的筋膜与肌纤维', '脂肪颜色自然、表面微润'],
    note: '建议小火慢炖 60–90 分钟，胶原充分软化后口感更佳。',
    boxes: [
      { x: 0.13, y: 0.17, width: 0.68, height: 0.64, label: '牛腩 89%' }
    ]
  },
  {
    cutId: 'sirloin',
    cutName: '外脊',
    cutAlias: '西冷 / Sirloin',
    freshness: 91,
    confidence: 94,
    freshnessLabel: '新鲜',
    flavor: '肉味鲜明 · 带有嚼劲',
    serving: '外脊牛排（西冷）/ 煎烤 / 快炒',
    reason: ['外侧脂肪边完整', '肉色均匀、切面紧实有光泽'],
    note: '先煎脂肪边逼出香气，再按 2–3 厘米厚度控制熟度。',
    boxes: [
      { x: 0.14, y: 0.23, width: 0.66, height: 0.52, label: '外脊 94%' }
    ]
  }
]

function loadModel(onProgress) {
  const cached = storage.read(storage.KEYS.MODEL_READY, false)
  const steps = cached ? [38, 100] : [9, 21, 36, 51, 68, 82, 94, 100]

  return new Promise((resolve) => {
    let index = 0
    const timer = setInterval(() => {
      const progress = steps[index]
      if (typeof onProgress === 'function') onProgress(progress)
      index += 1
      if (index >= steps.length) {
        clearInterval(timer)
        storage.write(storage.KEYS.MODEL_READY, true)
        resolve({
          cached,
          version: MODEL_VERSION,
          sizeLabel: MODEL_SIZE_LABEL
        })
      }
    }, cached ? 160 : 120)
  })
}

function recognize(photoPath, onProgress) {
  return new Promise((resolve) => {
    let progress = 15
    const timer = setInterval(() => {
      progress = Math.min(progress + 14, 96)
      if (typeof onProgress === 'function') onProgress(progress)
      if (progress >= 96) {
        clearInterval(timer)
        const fingerprint = String(photoPath || '').split('').reduce((sum, char) => {
          return sum + char.charCodeAt(0)
        }, 0)
        const template = RESULT_TEMPLATES[fingerprint % RESULT_TEMPLATES.length]
        const result = Object.assign({}, template, {
          id: `beef_${Date.now()}_${fingerprint % 9999}`,
          imagePath: photoPath,
          createdAt: Date.now(),
          modelVersion: MODEL_VERSION,
          status: 'complete'
        })
        resolve(result)
      }
    }, 120)
  })
}

module.exports = {
  MODEL_VERSION,
  MODEL_SIZE_LABEL,
  loadModel,
  recognize
}
