const storage = require('./services/storage')

App({
  globalData: {
    user: null,
    lastResult: null
  },

  onLaunch() {
    this.globalData.user = storage.getUser()
    this.globalData.lastResult = storage.getPendingResult()
  }
})
