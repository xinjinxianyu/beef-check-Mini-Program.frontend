const knowledge = require('../../data/encyclopedia')

Page({
  data: {
    categories: knowledge.categories,
    activeCategory: 'cn',
    activeLabel: '中式部位',
    categoryIntro: '',
    priceGuide: '',
    articles: [],
    expandedId: ''
  },

  onLoad(options) {
    const focus = options.focus || ''
    const article = knowledge.articles.find((item) => item.id === focus)
    const category = article ? article.category : 'cn'
    this.loadCategory(category, article ? article.id : '')
  },

  loadCategory(category, expandedId) {
    const meta = knowledge.categories.find((item) => item.id === category)
    let stateGuideStarted = false
    const articles = knowledge.getArticlesByCategory(category).map((item) => {
      const isStateGuideStart =
        category === 'freshness' && item.guideType === 'state' && !stateGuideStarted
      if (isStateGuideStart) stateGuideStarted = true
      return Object.assign({}, item, {
        open: item.id === expandedId,
        isStateGuideStart
      })
    })
    this.setData({
      activeCategory: category,
      activeLabel: meta ? meta.label : '牛肉百科',
      categoryIntro: meta ? meta.intro : '',
      priceGuide:
        category === 'cn'
          ? '价格统一按元/斤展示。河北为排酸鲜品、山东为冷冻分割品；潮汕火锅餐饮价按约 100g/份折算，仅作量级参考。'
          : '',
      articles,
      expandedId: expandedId || ''
    })
  },

  switchCategory(event) {
    const category = event.currentTarget.dataset.id
    if (category === this.data.activeCategory) return
    this.loadCategory(category, '')
  },

  toggleArticle(event) {
    const id = event.currentTarget.dataset.id
    const expandedId = this.data.expandedId === id ? '' : id
    this.setData({
      expandedId,
      articles: this.data.articles.map((item) => {
        return Object.assign({}, item, { open: item.id === expandedId })
      })
    })
  },

  goAssistant() {
    wx.navigateTo({ url: '/pages/assistant/assistant' })
  }
})
