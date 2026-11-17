const storage = require('../../services/storage')
const history = require('../../services/history')
const auth = require('../../services/auth')
const inference = require('../../services/inference')

Page({
  data: {
    user: null,
    recognizedCount: 0,
    modelReady: false,
    modelVersion: inference.MODEL_VERSION,
    modelSizeLabel: inference.MODEL_SIZE_LABEL,
    menus: [
      { key: 'history', icon: '◷', title: '识别历史', subtitle: '记录仅保存在当前设备' },
      { key: 'privacy', icon: '◇', title: '隐私说明', subtitle: '了解图片与数据如何保存' },
      { key: 'clear', icon: '⌫', title: '清理本地缓存', subtitle: '保留账号，删除本机记录' },
      { key: 'about', icon: 'i', title: '关于识牛', subtitle: '版本与使用说明' }
    ]
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    this.setData({
      user: storage.getUser(),
      recognizedCount: history.getCount(),
      modelReady: storage.read(storage.KEYS.MODEL_READY, false)
    })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login?from=profile' })
  },

  openMenu(event) {
    const key = event.currentTarget.dataset.key
    if (key === 'history') {
      wx.navigateTo({ url: '/pages/history/history' })
      return
    }
    if (key === 'privacy') {
      this.showPrivacy()
      return
    }
    if (key === 'clear') {
      this.clearCache()
      return
    }
    if (key === 'about') {
      wx.showModal({
        title: '关于识牛',
        content: '识牛是一款牛肉识别与烹饪知识小程序。当前版本已接入 YOLO26 ONNX 端侧推理与新鲜度分类模型，图片在本机完成识别；AI 建议服务仍通过独立接口接入。',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#D9543D'
      })
    }
  },

  showPrivacy() {
    wx.showModal({
      title: '隐私说明',
      content: '识别图片只在本机处理，图片和识别记录仅保存在当前设备。登录只用于展示头像昵称，不会上传或跨设备同步识别记录。',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#D9543D'
    })
  },

  clearCache() {
    wx.showModal({
      title: '清理本地缓存？',
      content: '将删除本机识别记录、待处理结果与模型加载缓存，不影响你的微信账号。',
      confirmText: '确认清理',
      confirmColor: '#D9543D',
      success: ({ confirm }) => {
        if (!confirm) return
        storage.clearLocalCache()
        this.refresh()
        wx.showToast({ title: '缓存已清理', icon: 'success' })
      }
    })
  },

  logout() {
    wx.showModal({
      title: '退出登录？',
      content: '退出后仍可继续使用本地识别，本机记录不会被删除。',
      confirmText: '退出',
      confirmColor: '#D9543D',
      success: ({ confirm }) => {
        if (!confirm) return
        auth.logout()
        getApp().globalData.user = null
        this.refresh()
      }
    })
  }
})
