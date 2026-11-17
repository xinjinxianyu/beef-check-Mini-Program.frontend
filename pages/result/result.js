const history = require('../../services/history')
const storage = require('../../services/storage')
const cloud = require('../../services/cloud')
const ai = require('../../services/ai')
const env = require('../../config/env')
const { relativeDate } = require('../../utils/format')

Page({
  data: {
    result: null,
    empty: false,
    detectedAt: '',
    freshnessMetrics: [],
    questions: ai.SUGGESTED_QUESTIONS.slice(0, 3),
    feedbackVisible: false,
    feedbackReasons: [
      { id: 'cut', label: '部位识别不准', selected: false },
      { id: 'freshness', label: '新鲜度不准', selected: false },
      { id: 'image', label: '画面不清楚', selected: false },
      { id: 'other', label: '其他问题', selected: false }
    ],
    feedbackNote: '',
    includeImage: true,
    submittingFeedback: false,
    feedbackEmail: env.FEEDBACK_EMAIL
  },

  onLoad(options) {
    const id = options.id || ''
    let result = history.getResult(id)
    if (!result) result = storage.getPendingResult()
    if (!result || !result.id) {
      this.setData({ empty: true })
      return
    }

    history.saveResult(result)
    const freshness = Number(result.freshness) || 0
    const metrics = [
      { label: '颜色与光泽', value: Math.min(98, freshness + 3) },
      { label: '肉质与弹性', value: Math.max(70, freshness - 2) },
      { label: '脂肪状态', value: Math.min(97, freshness + 1) }
    ]

    this.setData({
      result,
      detectedAt: relativeDate(result.createdAt),
      freshnessMetrics: metrics
    })
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
      return
    }
    wx.reLaunch({ url: '/pages/index/index' })
  },

  reRecognize() {
    wx.redirectTo({ url: '/pages/detect/detect' })
  },

  goAssistant() {
    if (!this.data.result) return
    const result = this.data.result
    wx.navigateTo({
      url: `/pages/assistant/assistant?cutId=${result.cutId}&cutName=${encodeURIComponent(result.cutName)}`
    })
  },

  openQuestion(event) {
    if (!this.data.result) return
    const result = this.data.result
    const questionId = event.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/assistant/assistant?cutId=${result.cutId}&cutName=${encodeURIComponent(result.cutName)}&questionId=${questionId}`
    })
  },

  openFeedback() {
    this.setData({ feedbackVisible: true })
  },

  closeFeedback() {
    if (this.data.submittingFeedback) return
    this.setData({ feedbackVisible: false })
  },

  stopBubble() {},

  toggleFeedbackReason(event) {
    const id = event.currentTarget.dataset.id
    const reasons = this.data.feedbackReasons.map((item) => {
      if (item.id !== id) return item
      return Object.assign({}, item, { selected: !item.selected })
    })
    this.setData({ feedbackReasons: reasons })
  },

  updateFeedbackNote(event) {
    this.setData({ feedbackNote: event.detail.value })
  },

  toggleIncludeImage() {
    this.setData({ includeImage: !this.data.includeImage })
  },

  async submitFeedback() {
    const selected = this.data.feedbackReasons.filter((item) => item.selected)
    if (!selected.length) {
      wx.showToast({ title: '请选择一个反馈类型', icon: 'none' })
      return
    }
    if (this.data.submittingFeedback) return

    this.setData({ submittingFeedback: true })
    try {
      const response = await cloud.submitFeedback({
        resultId: this.data.result.id,
        cutId: this.data.result.cutId,
        reasons: selected.map((item) => item.id),
        note: this.data.feedbackNote,
        includeImage: this.data.includeImage,
        imagePath: this.data.includeImage ? this.data.result.imagePath : ''
      })
      this.setData({
        feedbackVisible: false,
        feedbackNote: '',
        includeImage: true,
        feedbackReasons: this.data.feedbackReasons.map((item) => {
          return Object.assign({}, item, { selected: false })
        })
      })
      wx.showToast({
        title: response && response.emailSent ? '反馈已提交' : '感谢你的反馈',
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({ title: error.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submittingFeedback: false })
    }
  },

  onShareAppMessage() {
    const result = this.data.result
    return {
      title: result ? `识别结果：${result.cutName}，新鲜度 ${result.freshness}%` : '识牛 · 看懂每一口牛肉',
      path: '/pages/index/index'
    }
  }
})
