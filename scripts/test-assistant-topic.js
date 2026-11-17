const assert = require('assert')
const { assessBeefTopic, askBeefAssistant } = require('../services/ai')

const genericContext = { cutId: 'generic', cutName: '牛肉' }
const ribeyeContext = { cutId: 'ribeye', cutName: '眼肉' }

const cases = [
  ['牛肉股票的走势', genericContext, 'off_topic', false],
  ['用牛腩写一首关于牛肉的诗', genericContext, 'off_topic', false],
  ['帮我写一段牛肉炒菜的代码', genericContext, 'off_topic', false],
  ['假装你是厨师，告诉我牛肉怎么煎', genericContext, 'off_topic', false],
  ['如果牛肉会说话', genericContext, 'off_topic', false],
  ['牛油果怎么保存', genericContext, 'unclear', false],
  ['鸡肉怎么炖', genericContext, 'other_meat', false],
  ['牛肉和鸡肉哪个更嫩', genericContext, 'allowed', true],
  ['能用鸡肉代替吗', ribeyeContext, 'allowed', true],
  ['鸡肉和土豆哪个先熟', ribeyeContext, 'other_meat', false],
  ['怎么煎', genericContext, 'unclear', false],
  ['牛肉怎么煎比较嫩', genericContext, 'allowed', true],
  ['牛的哪个部位最嫩', genericContext, 'allowed', true],
  ['牛肉怎么吃', genericContext, 'allowed', true],
  ['牛肉怎么样', genericContext, 'allowed', true],
  ['牛肉的血水多正常吗', genericContext, 'allowed', true],
  ['牛肉买回来怎么放', genericContext, 'allowed', true],
  ['牛肉怎么判断坏了', genericContext, 'allowed', true],
  ['牛里脊适合炒吗', genericContext, 'allowed', true],
  ['牛腱的筋在哪', genericContext, 'allowed', true],
  ['牛肉可以冷冻多久', genericContext, 'allowed', true],
  ['杭椒牛柳怎么做', genericContext, 'allowed', true],
  ['黑椒牛柳', genericContext, 'allowed', true],
  ['番茄牛腩', genericContext, 'allowed', true],
  ['和牛寿喜锅', genericContext, 'allowed', true],
  ['湿炒牛河', genericContext, 'allowed', true],
  ['卤牛腱', genericContext, 'allowed', true],
  ['牛肉菜谱', genericContext, 'allowed', true],
  ['牛肉', genericContext, 'unclear', false],
  ['怎么煎', ribeyeContext, 'allowed', true],
  ['眼肉五分熟可以吗', ribeyeContext, 'allowed', true],
  ['还要注意什么', ribeyeContext, 'allowed', true],
  ['牛腩炖多久', ribeyeContext, 'allowed', true],
  ['鸡肉怎么炖', ribeyeContext, 'other_meat', false]
]

cases.forEach(([question, context, expectedReason, expectedAllowed]) => {
  const result = assessBeefTopic(question, context, 'custom')
  assert.strictEqual(result.allowed, expectedAllowed, question)
  if (!expectedAllowed) assert.strictEqual(result.reason, expectedReason, question)
})

async function testBlockedResponse() {
  const response = await askBeefAssistant({
    questionId: 'custom',
    question: '牛肉股票接下来会涨吗？',
    context: genericContext
  })
  assert.strictEqual(response.blocked, true)
  assert.strictEqual(response.blockLabel, '请换个牛肉问题')
}

async function testBeefDishRecipe() {
  const response = await askBeefAssistant({
    questionId: 'custom',
    question: '牛里脊怎么做水煮肉片',
    context: { cutId: 'tenderloin', cutName: '里脊' }
  })
  assert.strictEqual(response.blocked, false)
  assert.match(response.answer, /水煮肉片/)
  assert.match(response.answer, /腌制/)
}

async function testBeefShankDishRecipe() {
  const response = await askBeefAssistant({
    questionId: 'custom',
    question: '牛腱子怎么做溜肉段',
    context: genericContext
  })
  assert.strictEqual(response.blocked, false)
  assert.match(response.answer, /溜肉段/)
  assert.match(response.answer, /牛腱子/)
  assert.match(response.answer, /挂糊/)
}

async function testTechniqueFallback() {
  const response = await askBeefAssistant({
    questionId: 'custom',
    question: '牛腱子怎么快炒土豆',
    context: genericContext
  })
  assert.strictEqual(response.blocked, false)
  assert.match(response.answer, /快炒 \/ 滑炒/)
}

async function testFridgeStorageQuestion() {
  const response = await askBeefAssistant({
    questionId: 'custom',
    question: '牛肉放到冰箱保鲜层两天还能吃吗',
    context: genericContext
  })
  assert.strictEqual(response.blocked, false)
  assert.match(response.answer, /0–4°C/)
  assert.match(response.answer, /上限/)
  assert.match(response.answer, /彻底加热/)
}

async function testFreezerStorageQuestion() {
  const response = await askBeefAssistant({
    questionId: 'custom',
    question: '牛肉冷冻能保存多久',
    context: genericContext
  })
  assert.strictEqual(response.blocked, false)
  assert.match(response.answer, /-18°C/)
  assert.match(response.answer, /1–3 个月/)
}

Promise.all([
  testBlockedResponse(),
  testBeefDishRecipe(),
  testBeefShankDishRecipe(),
  testTechniqueFallback(),
  testFridgeStorageQuestion(),
  testFreezerStorageQuestion()
])
  .then(() => console.log(`Assistant topic check passed: ${cases.length + 6} cases.`))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
