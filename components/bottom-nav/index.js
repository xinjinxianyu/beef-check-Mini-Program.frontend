Component({
  properties: {
    active: {
      type: String,
      value: 'home'
    }
  },

  data: {
    items: [
      { key: 'home', label: '首页', path: '/pages/index/index' },
      { key: 'detect', label: '识别', path: '/pages/detect/detect' },
      { key: 'assistant', label: '助手', path: '/pages/assistant/assistant' },
      { key: 'wiki', label: '百科', path: '/pages/wiki/wiki' },
      { key: 'profile', label: '我的', path: '/pages/profile/profile' }
    ]
  },

  methods: {
    navigate(event) {
      const item = event.currentTarget.dataset.item
      if (!item || item.key === this.data.active) return
      wx.reLaunch({ url: item.path })
    }
  }
})
