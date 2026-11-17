const assert = require('assert')
const knowledge = require('../data/encyclopedia')

const chineseArticles = knowledge.getArticlesByCategory('cn')
const priceRows = chineseArticles.flatMap((article) => article.priceRows || [])

priceRows.forEach((row) => {
  assert(row.price.endsWith('元/斤'), `价格单位不是元/斤：${row.price}`)
})

chineseArticles.forEach((article) => {
  if (article.priceLabel && /¥\d/.test(article.priceLabel)) {
    assert(article.priceLabel.includes('/斤'), `价格标签单位不是元/斤：${article.priceLabel}`)
  }
  const referencePrice = article.chaoshanReference && article.chaoshanReference.priceLabel
  if (referencePrice && /¥\d/.test(referencePrice)) {
    assert(referencePrice.includes('/斤'), `潮汕价格单位不是元/斤：${referencePrice}`)
  }
})

console.log(`Price unit check passed: ${priceRows.length} price rows.`)
