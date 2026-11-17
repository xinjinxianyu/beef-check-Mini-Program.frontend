const auth = require('../../services/auth')

Page({
  data: {
    loading: false,
    privacyAccepted: false,
    from: ''
  },

  onLoad(options) {
    this.setData({ from: options.from || '' })
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
      return
    }
    wx.reLaunch({ url: '/pages/index/index' })
  },

  continueAsGuest() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  togglePrivacy() {
    this.setData({ privacyAccepted: !this.data.privacyAccepted })
  },

  showPrivacy() {
    wx.showModal({
      title: '隐私说明',
      content: '图片识别在本机完成，识别记录只保存在当前设备，不会上传或跨设备同步。登录仅用于保存头像昵称等个人资料，我们不会将图片用于公开展示。',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#D9543D'
    })
  },

  async handleLogin() {
    if (!this.data.privacyAccepted) {
      wx.showToast({ title: '请先阅读并同意隐私说明', icon: 'none' })
      return
    }
    if (this.data.loading) return

    this.setData({ loading: true })
    try {
      const user = await auth.login()
      const app = getApp()
      app.globalData.user = user
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        if (this.data.from && getCurrentPages().length > 1) {
          wx.navigateBack()
          return
        }
        wx.reLaunch({ url: '/pages/profile/profile' })
      }, 500)
    } catch (error) {
      const message = error.message || ''
      if (!message.includes('cancel') && !message.includes('取消')) {
        wx.showToast({ title: message || '登录失败，请重试', icon: 'none' })
      }
    } finally {
      this.setData({ loading: false })
    }
  }
})
