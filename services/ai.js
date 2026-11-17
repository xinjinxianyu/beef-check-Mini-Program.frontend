const env = require('../config/env')
const { request } = require('../utils/request')
const {
  buildDishRecipeAnswer,
  buildTechniqueRecipeAnswer,
  findBeefDish,
  findTechniqueGuide
} = require('../data/beefRecipes')

const SUGGESTED_QUESTIONS = [
  {
    id: 'best_cooking',
    label: '怎么吃更好吃？',
    question: '这个部位怎么做更好吃？',
    category: '烹饪'
  },
  {
    id: 'stew_or_fry',
    label: '适合炖还是炒？',
    question: '这块肉更适合炖还是快速炒制？',
    category: '做法'
  },
  {
    id: 'doneness',
    label: '几分熟更合适？',
    question: '如果做牛排，几分熟更合适？',
    category: '熟度'
  },
  {
    id: 'storage',
    label: '吃不完怎么保存？',
    question: '一次吃不完应该怎么保存？',
    category: '保存'
  }
]

const ALLOWED_QUESTION_IDS = ['best_cooking', 'stew_or_fry', 'doneness', 'storage', 'custom']
const BEEF_TERMS = /牛肉|牛排|牛腩|牛腱|牛尾|牛颈|牛肩|牛胸|牛霖|牛筋|肥牛|眼肉|西冷|菲力|里脊|外脊|上脑|肥胼|胸口朥|吊龙|脖仁|匙仁|匙柄|三花趾|五花趾|嫩肉|雪花牛肉|牛柳|牛扒|和牛|牛肋|牛小排|牛舌|牛肚|牛百叶|牛板腱|牛心|牛肝|牛蹄筋|牛肉粒|牛外脊|牛眼肉|牛腱子|牛河|beef/
const BEEF_GENERIC_TERMS = /牛(?:的|身上).{0,6}(?:部位|肉)/
const COOKING_TERMS =
  /部位|挑选|怎么选|新鲜|新鲜度|颜色|色泽|气味|闻|摸|按压|弹性|黏|粘|血水|水分|肥瘦|脂肪|筋膜|纹理|雪花|切|清洗|处理|去腥|焯水|腌制|回温|排酸|煎|烤|炒|炖|煮|涮|卤|火候|熟度|几分熟|生熟|嫩|柴|肉汁|火锅|汤|红烧|咖喱|黑椒|孜然|番茄|土豆|洋葱|萝卜|杭椒|青椒|葱|蒜|姜|香菜|菜谱|料理|菜品|菜肴|寿喜锅|汉堡|沙拉|馅|丸|串|饺|包|面|粉|饭|保存|储存|冷藏|冷冻|保鲜|冰箱|室温|解冻|隔夜|常温|放多久|怎么放|还能吃|保质期|加热|搭配|配菜|酱|价格|多少钱|牛肉丸|牛肉干|怎么吃|吃法|能吃|好不好吃|味道|肉质|质量|怎么做|做法|好吃|口感|区别|哪个|正常吗|好不好|怎么样|怎么办|可以吗|能不能|需要注意|判断|辨别|变质|坏|腐败/
const BEEF_KNOWLEDGE_TERMS = /是什么|为什么|怎么回事|有什么用|有什么特点/
const CONTINUATION_TERMS = /还有|继续|详细|具体|展开|举例|再说|为什么|可以吗|怎么判断|注意什么|需要注意|然后呢/
const QUESTION_INTENT_TERMS =
  /怎么|如何|为什么|什么|哪种|哪个|哪块|哪类|多少|多久|哪里|在哪|可以|能不能|要不要|是不是|需要|推荐|判断|区别|适合|正常|注意|吗|呢/
const OFF_TOPIC_TERMS =
  /天气|股票|基金|证券|代码|编程|算法|数学|作业|考试|作文|小说|诗歌|诗|写诗|作诗|歌词|故事|段子|散文|广告文案|演讲稿|翻译|新闻|政治|明星|电影|音乐|旅行|酒店|手机|电脑|游戏|恋爱|情感|历史|地理|物理|化学|笑话|彩票|如果.*会说话|忽略.*(指令|规则)|系统提示|扮演|假装|角色扮演|开发者模式|越狱/
const OTHER_MEAT_TERMS = /鸡肉|鸡胸|鸡腿|猪肉|五花肉|排骨|羊肉|羊排|鸭肉|鹅肉|鱼肉|海鲜|虾仁|虾肉/
const CROSS_MEAT_COMPARISON_TERMS = /代替|替代|换成|相比|对比|区别|哪个更|哪个好|可以换/
const QUESTION_CUT_REFERENCES = [
  { id: 'brisket', name: '牛腩', pattern: /牛腩|肥胼/ },
  { id: 'ribeye', name: '眼肉', pattern: /眼肉|吊龙/ },
  { id: 'sirloin', name: '外脊', pattern: /外脊|西冷/ },
  { id: 'tenderloin', name: '里脊', pattern: /里脊|菲力|牛柳/ },
  { id: 'shank', name: '牛腱', pattern: /牛腱子|牛腱|腱子|三花趾|五花趾|金钱腱/ },
  { id: 'shoulder', name: '肩肉', pattern: /肩肉|匙仁|匙柄|板腱/ },
  { id: 'brisket-chest', name: '胸肉', pattern: /胸肉|胸口朥|胸口油/ },
  { id: 'rump', name: '臀肉', pattern: /臀肉|米龙|黄瓜条|牛霖|嫩肉/ }
]

const MOCK_ANSWERS = {
  ribeye: {
    best_cooking: '眼肉脂肪分布细密，最稳妥的做法是高温香煎或炭烤。切成 2–3 厘米厚，表面擦干后先将锅烧热，两面煎出焦香，再静置 3–5 分钟。这样能保住肉汁，也能突出脂香。',
    stew_or_fry: '眼肉优先选择香煎、烤或快炒，不建议长时间炖煮。它的优势是嫩度和脂香，长时间加热反而容易失去口感。',
    doneness: '建议五分熟至七分熟。中心温度可按约 54–60°C 控制，离火后还会继续升温；切之前静置几分钟。',
    storage: '冷藏时密封放在 0–4°C，建议 1–2 天内吃完。需要更久保存时按一餐份量分装后冷冻，解冻放冷藏室进行。'
  },
  brisket: {
    best_cooking: '牛腩适合番茄炖、红烧或清炖。先焯水去浮沫，再用小火慢炖 60–90 分钟，让筋膜转化为软糯胶质。盐可以后放，肉更容易炖软。',
    stew_or_fry: '牛腩更适合炖。筋膜和结缔组织需要较长时间才能软化，短时间快炒不易达到理想口感。',
    doneness: '牛腩一般做全熟。以筷子能轻松插入、筋膜软糯为准，比单纯按时间判断更可靠。',
    storage: '熟牛腩连汤汁一起冷藏，建议 2 天内吃完；冷冻可分餐保存。再次加热时补少量水，小火回温。'
  },
  sirloin: {
    best_cooking: '外脊（西冷）适合煎牛排或快速烤制。先煎外侧脂肪边逼出油香，再两面高温煎制。切片时逆着纹理切，口感会更嫩。',
    stew_or_fry: '外脊（西冷）更适合香煎或快炒，不建议久炖。它肉味鲜明且带适量嚼劲，短时间高温烹饪更能保留风味。',
    doneness: '外脊（西冷）推荐三分熟到五分熟。厚切牛排煎好后静置 5 分钟再切，熟度更均匀；介意生熟口感可选七分熟。',
    storage: '外脊（西冷）当天吃不完可密封冷藏至次日，再用平底锅快速回温。不要反复冷冻和解冻，以免影响口感与安全性。'
  }
}

const PREP_ANSWERS = {
  ribeye:
    '眼肉煎前先从冷藏取出回温约 15–20 分钟，表面擦干。较厚的肉可以让锅充分预热；煎好后静置 3–5 分钟再逆纹切片。',
  sirloin:
    '外脊先把外侧脂肪边修整整齐，煎前擦干表面。可先立起煎脂肪边逼出油香，再煎两个大面，最后逆纹切片。',
  brisket:
    '牛腩切成大小均匀的块，冷水下锅焯去浮沫后捞出。炖煮时保持小火，盐可以后放；筋膜较多的块要留足时间。'
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function normalizeContext(context) {
  return {
    cutId: context && context.cutId ? context.cutId : 'generic',
    cutName: context && context.cutName ? context.cutName : '牛肉',
    freshness: context && context.freshness ? context.freshness : null,
    source: 'local-recognition'
  }
}

function resolveQuestionContext(context, question) {
  const reference = QUESTION_CUT_REFERENCES.find((item) => item.pattern.test(question))
  if (!reference) return context
  return Object.assign({}, context, {
    cutId: reference.id,
    cutName: reference.name,
    source: 'question-text'
  })
}

function assessBeefTopic(question, context, questionId) {
  const normalized = String(question || '').toLowerCase()
  if (questionId !== 'custom') return { allowed: true }

  if (OFF_TOPIC_TERMS.test(normalized)) {
    return {
      allowed: false,
      reason: 'off_topic',
      message:
        '这个问题即使提到了牛肉，也超出了牛肉挑选、处理、烹饪和保存的范围。请换一个真正与牛肉相关的问题。'
    }
  }

  const hasRecognizedCut = context.cutId && context.cutId !== 'generic'
  const matchedDish = findBeefDish(normalized)
  const hasExplicitBeef = BEEF_TERMS.test(normalized) || BEEF_GENERIC_TERMS.test(normalized) || Boolean(matchedDish)
  const isCrossMeatComparison = CROSS_MEAT_COMPARISON_TERMS.test(normalized)

  if (OTHER_MEAT_TERMS.test(normalized) && !hasExplicitBeef && !(hasRecognizedCut && isCrossMeatComparison)) {
    return {
      allowed: false,
      reason: 'other_meat',
      message:
        '当前助手以牛肉为主，不单独回答鸡肉、猪肉、羊肉等其他肉类。如果你想做牛肉与其他肉类的比较或替代，请在问题中明确提到牛肉。'
    }
  }

  const hasBeefSubject = hasExplicitBeef
  const hasFoodIntent = COOKING_TERMS.test(normalized) || BEEF_KNOWLEDGE_TERMS.test(normalized)

  if (hasRecognizedCut) {
    return { allowed: true }
  }
  if (matchedDish || (hasBeefSubject && (hasFoodIntent || QUESTION_INTENT_TERMS.test(normalized)))) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'unclear',
    message:
      '我还不能确认这是关于牛肉的具体问题。请说明想问的部位，以及挑选、切法、火候、熟度、烹饪或保存中的哪一方面。'
  }
}

function getMockAnswerSet(context) {
  if (MOCK_ANSWERS[context.cutId]) return MOCK_ANSWERS[context.cutId]
  return {
    best_cooking: `这块${context.cutName}建议先根据筋膜和纹理判断：较嫩的部位适合煎、烤或快炒，筋膜较多的部位更适合慢炖。切薄片时逆纹切，口感会更嫩。`,
    stew_or_fry: `这块${context.cutName}要根据筋膜多少决定。筋膜少可优先快炒或煎制，筋膜多则更适合炖煮；如果厚度和部位不确定，优先选择不容易变柴的炖煮方式。`,
    doneness: `这块${context.cutName}如果切片快速煎制，建议先煎至全熟更稳妥；如果确认是适合牛排的厚切部位，可按个人接受度选择五至七分熟。`,
    storage: `这块${context.cutName}冷藏时密封放在 0–4°C，尽量在 1–2 天内吃完。需要更久保存时按一餐份量分装冷冻，解冻时放冷藏室。`
  }
}

function isStorageQuestion(question) {
  return /保存|储存|冷藏|冷冻|保鲜|冰箱|室温|常温|解冻|隔夜|放多久|几天|一天|两天|还能吃|保质期|吃不完|存放/.test(
    question
  )
}

function buildStorageAnswer(context, question) {
  const normalized = String(question || '')
  const cutName = context.cutName && context.cutName !== '牛肉' ? `这块${context.cutName}` : '牛肉'
  const isCooked = /熟|剩菜|剩肉|卤好|煮好|炖好|外卖/.test(normalized)
  const isTwoDays = /两天|2天/.test(normalized)

  if (/解冻/.test(normalized)) {
    return `${cutName}建议连密封包装放在冷藏室慢解冻，按厚度预留 6–12 小时。不要长时间放在室温，也不要在解冻后反复冷冻。若解冻后出现明显酸味、黏手或大量浑浊汁水，不建议继续食用。`
  }

  if (/冷冻|零下|-18/.test(normalized)) {
    return `${cutName}需要长期保存时，按一餐用量密封分装，尽量排出空气后放在 -18°C 以下冷冻。家庭保存更重视口感，建议 1–3 个月内吃完；解冻时放冷藏室，解冻后尽快彻底加热，不要反复冻融。`
  }

  if (/常温|室温/.test(normalized)) {
    return `${cutName}不要长时间放在室温。生肉或熟肉在常温下放置时间越长，微生物风险越高；一般不建议超过 2 小时，高温环境下应更短。无法及时冷藏或冷冻时，应尽快烹饪并充分加热。`
  }

  if (/冷藏|保鲜|冰箱/.test(normalized)) {
    if (isCooked) {
      return `${cutName}如果是已经煮熟的牛肉，应密封放在 0–4°C 冷藏。两天通常处于建议时限的边缘，必须充分复热后再吃；如果出现酸味、发黏、汤汁浑浊或包装鼓胀，不要食用。`
    }
    if (isTwoDays) {
      return `${cutName}如果是生肉，一直密封放在 0–4°C 冷藏两天属于建议期限的上限。应尽快彻底加热，不建议再生食或做半熟牛排；如果运输或冰箱温度不稳定，或出现酸味、黏手、灰绿变色，建议丢弃。闻起来正常也不能完全排除风险。`
    }
    return `${cutName}应密封放在 0–4°C 冷藏。生牛肉一般建议 1–2 天内吃完，熟牛肉也建议尽快食用；取用时避免反复开盖和长时间暴露在室温。`
  }

  return `${cutName}短期保存应密封放在 0–4°C，建议 1–2 天内吃完；长期保存则按一餐份量分装后放在 -18°C 以下冷冻。解冻时放冷藏室，解冻后尽快彻底加热，不要反复冻融。`
}

function buildCustomAnswer(context, question) {
  const answers = getMockAnswerSet(context)
  const normalized = String(question || '').toLowerCase()
  const matchedDish = findBeefDish(normalized)

  if (isStorageQuestion(normalized)) {
    return buildStorageAnswer(context, normalized)
  }

  if (matchedDish) {
    return buildDishRecipeAnswer(matchedDish, context)
  }

  if (/病|药|治疗|减肥|排毒|检测是否/.test(normalized)) {
    return `我主要提供这块${context.cutName}的挑选、处理、烹饪和保存建议，不能判断疾病或代替食品安全检测。如果是食用安全疑问，请以购买渠道、储存条件和实际感官判断为准。`
  }

  if (/水煮肉片|水煮牛肉/.test(normalized)) {
    return `可以用${context.cutName}做水煮肉片：先把肉逆纹切成薄片，加入少量盐、白胡椒、生抽、蛋清和淀粉抓匀，分次加一点清水，腌制 10–15 分钟。碗底铺焯熟的豆芽或生菜。锅中炒香姜蒜、郫县豆瓣和少量辣椒，加入热水或高汤煮开，调味后把肉片分散下锅，煮到完全变色即可，通常约 20–40 秒。连汤倒入碗中，撒蒜末、干辣椒和花椒，再淋少量热油。肉片不要久煮，否则容易变柴。`
  }

  if (findTechniqueGuide(normalized)) {
    return buildTechniqueRecipeAnswer(normalized, context)
  }

  const parts = []
  if (/保存|冷藏|冷冻|解冻|吃不完/.test(normalized)) parts.push(answers.storage)
  if (/几分熟|熟度|中心温度/.test(normalized)) parts.push(answers.doneness)
  if (/炖还是|炒还是|煎还是|适合.*(炖|炒|煎)/.test(normalized)) {
    parts.push(answers.stew_or_fry)
  }
  if (/处理|去腥|清洗|切法|怎么切|焯水|回温|腌制/.test(normalized)) {
    parts.push(
      PREP_ANSWERS[context.cutId] ||
      `这块${context.cutName}处理时先擦干表面，去除明显筋膜，再观察纹理。快炒或煎制可逆纹切薄片；筋膜较多的部分适合切块慢炖。`
    )
  }
  if (
    /煎|烤|炒|炖|涮|怎么做|做法|好吃|火候/.test(normalized) &&
    !/炖还是|炒还是|煎还是|适合.*(炖|炒|煎)/.test(normalized)
  ) {
    parts.push(answers.best_cooking)
  }

  if (parts.length) return Array.from(new Set(parts)).join('\n\n')

  return `关于这块${context.cutName}，可以进一步问我切法、腌制、火候、熟度、搭配或保存方式。你也可以补充准备做的菜，我会按这个部位给出更具体的建议。`
}

/**
 * 牛肉做法助手唯一 AI 入口。
 * 接入真实模型时，后端必须再次校验部位、问题长度和烹饪话题范围。
 */
async function askBeefAssistant(payload) {
  const question = String(payload.question || '').trim().slice(0, 120)
  if (!question) throw new Error('请输入想了解的问题')
  const context = resolveQuestionContext(normalizeContext(payload.context), question)
  const requestedId = payload.questionId || 'custom'
  const questionId = ALLOWED_QUESTION_IDS.includes(requestedId) ? requestedId : 'custom'
  const topicAssessment = assessBeefTopic(question, context, questionId)
  const matchedDish = findBeefDish(question)

  if (!topicAssessment.allowed) {
    return {
      answer: topicAssessment.message,
      answerId: `topic_${Date.now()}`,
      disclaimer: '',
      blocked: true,
      blockLabel:
        topicAssessment.reason === 'other_meat'
            ? '只支持牛肉'
          : topicAssessment.reason === 'unclear'
            ? '请说明牛肉问题'
            : '请换个牛肉问题'
    }
  }

  const safePayload = {
    questionId,
    question,
    context,
    policy: 'beef-cooking-context-v1',
    dishId: matchedDish ? matchedDish.id : null,
    dishName: matchedDish ? matchedDish.name : null
  }

  if (env.USE_MOCK_AI) {
    await delay(620)
    const answers = getMockAnswerSet(context)
    const answer =
      questionId === 'custom'
        ? buildCustomAnswer(context, question)
        : answers[questionId] || buildCustomAnswer(context, question)
    return {
      answer,
      answerId: `ai_${Date.now()}`,
      disclaimer: '建议仅供家庭烹饪参考，食用安全请以充分加热和实际储存条件为准。',
      blocked: false
    }
  }

  return request({
    path: env.AI_ASSISTANT_PATH,
    method: 'POST',
    data: safePayload
  })
}

module.exports = {
  SUGGESTED_QUESTIONS,
  askBeefAssistant,
  assessBeefTopic
}
