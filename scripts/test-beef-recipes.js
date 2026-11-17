const assert = require('assert')
const { dishes, findBeefDish, buildDishRecipeAnswer } = require('../data/beefRecipes')
const { assessBeefTopic } = require('../services/ai')

assert.strictEqual(dishes.length, 112, '牛肉菜谱数量应保持为 112')
assert.strictEqual(new Set(dishes.map((dish) => dish.name)).size, dishes.length, '菜名不能重复')

const context = { cutId: 'generic', cutName: '牛肉' }

dishes.forEach((dish) => {
  const question = `${dish.name}怎么做`
  const matched = findBeefDish(question)
  assert(matched, `未识别菜名：${dish.name}`)
  assert.strictEqual(matched.id, dish.id, `菜名匹配错误：${dish.name}`)

  const topic = assessBeefTopic(question, context, 'custom')
  assert.strictEqual(topic.allowed, true, `牛肉菜名被误拦：${dish.name}`)

  const answer = buildDishRecipeAnswer(dish, context)
  assert(answer.includes(dish.name), `做法缺少菜名：${dish.name}`)
  assert(answer.includes('1.'), `做法缺少步骤：${dish.name}`)
  assert(answer.includes(dish.tip), `做法缺少菜品重点：${dish.name}`)
})

console.log(`Beef recipe check passed: ${dishes.length} dishes.`)
