const history = require('../../services/history')
const storage = require('../../services/storage')
const { relativeDate } = require('../../utils/format')

Page({
  data: {
    records: [],
    weekCount: 0,
    latestDate: '暂无'
  },

  onShow() {
    this.loadRecords()
  },

  loadRecords() {
    const records = history.readHistory().map((item) => {
      return Object.assign({}, item, {
        displayTime: relativeDate(item.createdAt)
      })
    })
    const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000
    const weekCount = records.filter((item) => Number(item.createdAt) >= weekStart).length

    this.setData({
      records,
      weekCount,
      latestDate: records.length ? records[0].displayTime : '暂无'
    })
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
      return
    }
    wx.reLaunch({ url: '/pages/profile/profile' })
  },

  goDetect() {
    wx.navigateTo({ url: '/pages/detect/detect' })
  },

  openRecord(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/result/result?id=${id}` })
  },

  removeRecord(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '删除这条记录？',
      content: '删除后不可恢复，请确认不再需要这条本地记录。',
      confirmText: '删除',
      confirmColor: '#D9543D',
      success: ({ confirm }) => {
        if (!confirm) return
        history.removeResult(id)
        this.loadRecords()
      }
    })
  },

  clearAll() {
    if (!this.data.records.length) return
    wx.showModal({
      title: '清空本地记录？',
      content: '当前设备上的全部识别记录都会被删除。',
      confirmText: '清空',
      confirmColor: '#D9543D',
      success: ({ confirm }) => {
        if (!confirm) return
        history.clearHistory()
        storage.clearPendingResult()
        this.loadRecords()
        wx.showToast({ title: '已清空', icon: 'success' })
      }
    })
  }
})
