const storage = require('./storage')
const { removePersistedImage } = require('../utils/media')

function readHistory() {
  const list = storage.read(storage.KEYS.HISTORY, [])
  return Array.isArray(list) ? list : []
}

function saveResult(result) {
  if (!result || !result.id) return readHistory()
  const next = [result].concat(readHistory().filter((item) => item.id !== result.id))
  storage.write(storage.KEYS.HISTORY, next.slice(0, 100))
  return next
}

function getResult(id) {
  if (!id) return null
  return readHistory().find((item) => item.id === id) || null
}

function removeResult(id) {
  const current = readHistory()
  const removed = current.find((item) => item.id === id)
  const next = current.filter((item) => item.id !== id)
  storage.write(storage.KEYS.HISTORY, next)
  if (removed && removed.imagePath) removePersistedImage(removed.imagePath)
  return next
}

function clearHistory() {
  readHistory().forEach((item) => {
    if (item && item.imagePath) removePersistedImage(item.imagePath)
  })
  storage.remove(storage.KEYS.HISTORY)
}

function getCount() {
  return readHistory().length
}

module.exports = {
  readHistory,
  saveResult,
  getResult,
  removeResult,
  clearHistory,
  getCount
}
