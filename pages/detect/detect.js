const { choosePhoto, getImageInfo, persistImage } = require('../../utils/media')
const inference = require('../../services/inference')
const history = require('../../services/history')
const storage = require('../../services/storage')

Page({
  data: {
    photoPath: '',
    photoWidth: 0,
    photoHeight: 0,
    isRecognizing: false,
    resultReady: false,
    result: null,
    modelProgress: 0,
    modelSizeLabel: inference.MODEL_SIZE_LABEL,
    engineStatus: '正在加载识别引擎',
    engineCached: false
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
      return
    }
    wx.reLaunch({ url: '/pages/index/index' })
  },

  chooseFromCamera() {
    this.selectPhoto('camera')
  },

  chooseFromAlbum() {
    this.selectPhoto('album')
  },

  async selectPhoto(sourceType) {
    if (this.data.isRecognizing) return

    try {
      const photo = await choosePhoto(sourceType)
      let width = photo.width
      let height = photo.height
      if (!width || !height) {
        const info = await getImageInfo(photo.path)
        width = info.width
        height = info.height
      }
      const persistedPath = await persistImage(photo.path)

      this.setData({
        photoPath: persistedPath,
        photoWidth: width,
        photoHeight: height,
        result: null,
        resultReady: false,
        isRecognizing: true,
        modelProgress: 4,
        engineStatus: '正在加载识别引擎'
      })

      await this.runRecognition(persistedPath)
    } catch (error) {
      console.error('[beef] photo selection failed', error)
      if (String(error.errMsg || error.message || '').includes('cancel')) return
      wx.showToast({
        title: '图片读取失败，请重试',
        icon: 'none'
      })
    }
  },

  async runRecognition(photoPath) {
    try {
      const model = await inference.loadModel((progress) => {
        this.setData({
          modelProgress: Math.min(55, 4 + Math.round(progress * 0.51)),
          engineStatus: progress < 100 ? '正在加载识别引擎' : '正在理解图片'
        })
      })

      this.setData({
        engineCached: model.cached,
        engineStatus: '正在分析部位与新鲜度',
        modelProgress: 58
      })

      const result = await inference.recognize(photoPath, (progress) => {
        this.setData({
          modelProgress: 58 + Math.round(progress * 0.4),
          engineStatus: progress < 90 ? '正在分析部位与新鲜度' : '正在整理识别结论'
        })
      })

      history.saveResult(result)
      storage.savePendingResult(result)
      this.setData(
        {
          result,
          resultReady: true,
          isRecognizing: false,
          modelProgress: 100,
          engineStatus: '识别完成'
        },
        () => {
          this.drawCanvas()
        }
      )
    } catch (error) {
      console.error('[beef] recognition failed', error)
      this.setData({
        isRecognizing: false,
        engineStatus: '识别未完成'
      })
      const rawMessage = error && (error.errMsg || error.message)
        ? String(error.errMsg || error.message)
        : String(error || 'unknown error')
      wx.showModal({
        title: '识别失败',
        content: rawMessage.slice(0, 300),
        showCancel: false
      })
    }
  },

  drawCanvas() {
    const query = wx.createSelectorQuery().in(this)
    query
      .select('#detectCanvas')
      .fields({ node: true, size: true })
      .exec((response) => {
        const target = response && response[0]
        if (!target || !target.node) return

        const canvas = target.node
        const context = canvas.getContext('2d')
        const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
        const dpr = windowInfo.pixelRatio || 1
        const width = target.width
        const height = target.height

        canvas.width = width * dpr
        canvas.height = height * dpr
        context.scale(dpr, dpr)
        context.fillStyle = '#142d25'
        context.fillRect(0, 0, width, height)

        const image = canvas.createImage()
        image.onload = () => {
          const imageWidth = this.data.photoWidth || image.width || 1200
          const imageHeight = this.data.photoHeight || image.height || 900
          const scale = Math.max(width / imageWidth, height / imageHeight)
          const drawWidth = imageWidth * scale
          const drawHeight = imageHeight * scale
          const offsetX = (width - drawWidth) / 2
          const offsetY = (height - drawHeight) / 2

          context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
          context.fillStyle = 'rgba(10, 26, 20, 0.08)'
          context.fillRect(0, 0, width, height)

          const boxes = this.data.result ? this.data.result.boxes : []
          boxes.forEach((box) => {
            const x = offsetX + box.x * drawWidth
            const y = offsetY + box.y * drawHeight
            const boxWidth = box.width * drawWidth
            const boxHeight = box.height * drawHeight

            context.fillStyle = 'rgba(242, 200, 91, 0.08)'
            context.fillRect(x, y, boxWidth, boxHeight)
            context.strokeStyle = '#F2C85B'
            context.lineWidth = 2
            context.strokeRect(x, y, boxWidth, boxHeight)

            context.fillStyle = '#F2C85B'
            context.fillRect(x, Math.max(0, y - 22), 94, 22)
            context.fillStyle = '#18382E'
            context.font = '600 11px sans-serif'
            context.textBaseline = 'middle'
            context.fillText(box.label || '牛肉', x + 7, Math.max(11, y - 11))
          })
        }
        image.src = this.data.photoPath
      })
  },

  viewResult() {
    if (!this.data.result) return
    wx.navigateTo({
      url: `/pages/result/result?id=${this.data.result.id}`
    })
  },

  openAssistant() {
    if (!this.data.result) return
    const result = this.data.result
    wx.navigateTo({
      url: `/pages/assistant/assistant?cutId=${result.cutId}&cutName=${encodeURIComponent(result.cutName)}`
    })
  },

  showPhotoTips() {
    wx.showModal({
      title: '拍摄小提示',
      content: '尽量在自然光下拍摄，让牛肉完整出现在画面内，避免包装反光。识别结果仅作挑选参考。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#D9543D'
    })
  }
})
