Component({
  data: {
    height: 32
  },

  lifetimes: {
    attached() {
      const windowInfo = wx.getWindowInfo
        ? wx.getWindowInfo()
        : wx.getSystemInfoSync()
      const statusBarHeight = Number(windowInfo.statusBarHeight) || 20
      let menuTop = 0

      try {
        const menuRect = wx.getMenuButtonBoundingClientRect()
        menuTop = Math.max(0, Number(menuRect.top) - 6)
      } catch (error) {
        menuTop = statusBarHeight
      }

      const safeHeight = Math.max(statusBarHeight, menuTop) + 8
      this.setData({ height: Math.max(28, safeHeight) })
    }
  }
})
