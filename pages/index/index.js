const storage = require('../../services/storage')
const history = require('../../services/history')
const knowledge = require('../../data/encyclopedia')
const inference = require('../../services/inference')

Page({
  data: {
    user: null,
    recognizedCount: 0,
    modelSizeLabel: inference.MODEL_SIZE_LABEL,
    popularArticles: [],
    utilityCards: [
      {
        key: 'assistant',
        eyebrow: 'AI · 灵活问答',
        title: '牛肉做法助手',
        description: '根据识别部位，快速获得烹饪建议',
        path: '/pages/assistant/assistant',
        tone: 'red'
      },
      {
        key: 'wiki',
        eyebrow: '图谱 · 随时查',
        title: '部位与新鲜度百科',
        description: '眼肉、西冷、牛腩，一看就懂',
        path: '/pages/wiki/wiki',
        tone: 'sage'
      }
    ]
  },

  onShow() {
    this.setData({
      user: storage.getUser(),
      recognizedCount: history.getCount(),
      popularArticles: knowledge.getPopularArticles(5)
    })
  },

  openDetect() {
    wx.navigateTo({ url: '/pages/detect/detect' })
  },

  openAssistant() {
    wx.navigateTo({ url: '/pages/assistant/assistant' })
  },

  openWiki() {
    wx.navigateTo({ url: '/pages/wiki/wiki' })
  },

  openHistory() {
    wx.navigateTo({ url: '/pages/history/history' })
  },

  openProfile() {
    const url = this.data.user ? '/pages/profile/profile' : '/pages/login/login'
    wx.navigateTo({ url })
  },

  navigateUtility(event) {
    wx.navigateTo({ url: event.currentTarget.dataset.path })
  },

  openArticle(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/wiki/wiki?focus=${id}` })
  }
})
