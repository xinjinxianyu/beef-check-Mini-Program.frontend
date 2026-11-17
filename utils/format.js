function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDate(value, withTime) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const day = `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
  if (!withTime) return day
  return `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function relativeDate(value) {
  const date = new Date(value)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const day = 24 * 60 * 60 * 1000

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < day && now.getDate() === date.getDate()) {
    return `今天 ${pad(date.getHours())}:${pad(date.getMinutes())}`
  }
  if (diff < day * 2) return `昨天 ${pad(date.getHours())}:${pad(date.getMinutes())}`
  return formatDate(date)
}

module.exports = {
  formatDate,
  relativeDate
}
