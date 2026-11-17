const categories = [
  { id: 'cuts', label: '部位百科' },
  { id: 'freshness', label: '新鲜度' },
  { id: 'storage', label: '保存指南' }
]

const articles = [
  {
    id: 'ribeye',
    category: 'cuts',
    kicker: '柔嫩 · 脂香',
    title: '眼肉',
    subtitle: '肋眼 / Ribeye',
    summary: '大理石纹细密，嫩度与脂香平衡，是牛排和快速煎烤的常用部位。',
    facts: ['适合：香煎、炭烤、厚切牛排', '熟度：建议五至七分熟', '切法：逆纹切片，煎后静置'],
    accent: 'red'
  },
  {
    id: 'sirloin',
    category: 'cuts',
    kicker: '肉香 · 嚼劲',
    title: '西冷',
    subtitle: '外脊 / Sirloin',
    summary: '肉味鲜明，通常带一条外侧脂肪边，口感比眼肉更有嚼劲。',
    facts: ['适合：牛排、香煎、快炒', '处理：先煎脂肪边出香', '切法：逆纹切薄片'],
    accent: 'dark'
  },
  {
    id: 'brisket',
    category: 'cuts',
    kicker: '筋膜 · 软糯',
    title: '牛腩',
    subtitle: '胸腹肉 / Brisket',
    summary: '筋膜与肌肉交错，适合长时间炖煮，能形成浓稠口感和醇厚肉香。',
    facts: ['适合：番茄炖、红烧、清炖', '时间：小火慢炖 60–90 分钟', '技巧：盐后放，肉更易软烂'],
    accent: 'yellow'
  },
  {
    id: 'shank',
    category: 'cuts',
    kicker: '胶质 · 紧实',
    title: '牛腱',
    subtitle: '腱子肉 / Shank',
    summary: '运动量大、筋膜多，卤制后切片纹理清晰，是冷盘和面食的常见搭配。',
    facts: ['适合：卤、酱、炖', '处理：冷水下锅去浮沫', '切片：完全放凉后更整齐'],
    accent: 'sage'
  },
  {
    id: 'fresh-color',
    category: 'freshness',
    kicker: '第一步',
    title: '看颜色与光泽',
    subtitle: '鲜红不等于越亮越好',
    summary: '新鲜牛肉通常呈自然鲜红至暗红，切面有轻微光泽。局部发灰、发绿或异常黏亮需要警惕。',
    facts: ['观察：颜色是否均匀自然', '注意：脂肪应为乳白或淡黄色', '异常：灰绿、暗黑且无光泽'],
    accent: 'red'
  },
  {
    id: 'fresh-smell',
    category: 'freshness',
    kicker: '第二步',
    title: '闻自然肉香',
    subtitle: '不应有酸腐味',
    summary: '新鲜牛肉气味清淡自然。出现明显酸味、腐败味或刺鼻异味时，不建议继续食用。',
    facts: ['正常：淡淡肉香', '异常：酸味、臭味', '提醒：气味判断应结合储存温度'],
    accent: 'yellow'
  },
  {
    id: 'fresh-touch',
    category: 'freshness',
    kicker: '第三步',
    title: '轻按看弹性',
    subtitle: '微润但不黏手',
    summary: '表面应微润、紧实，轻按后能较快回弹。表面湿滑发黏通常提示存放时间较长。',
    facts: ['正常：微润、有弹性', '异常：黏手、按痕不回弹', '提醒：不要只凭单一指标判断'],
    accent: 'sage'
  },
  {
    id: 'store-fridge',
    category: 'storage',
    kicker: '短期',
    title: '冷藏保存',
    subtitle: '0–4°C · 密封',
    summary: '生牛肉应密封后放在冰箱冷藏区下层，避免汁液污染其他食物。一般建议 1–2 天内烹饪。',
    facts: ['温度：0–4°C', '方式：密封、分装、避免反复开盖', '时间：尽量在 1–2 天内吃完'],
    accent: 'sage'
  },
  {
    id: 'store-freeze',
    category: 'storage',
    kicker: '长期',
    title: '分装冷冻',
    subtitle: '-18°C 以下',
    summary: '按一餐用量密封分装，尽量排出空气。标注日期后冷冻，避免大块反复解冻。',
    facts: ['温度：-18°C 以下', '份量：一餐一袋', '标记：部位、日期和重量'],
    accent: 'dark'
  },
  {
    id: 'store-thaw',
    category: 'storage',
    kicker: '解冻',
    title: '冷藏室慢解冻',
    subtitle: '提前计划更稳',
    summary: '前一晚将密封牛肉移至冷藏室解冻。避免室温长时间放置，也不建议反复冷冻。',
    facts: ['方式：连包装放冷藏室', '时间：按厚度预留 6–12 小时', '提醒：解冻后尽快烹饪'],
    accent: 'yellow'
  }
]

function getPopularArticles(limit) {
  return articles.filter((item) => item.category === 'cuts').slice(0, limit || 3)
}

function getArticlesByCategory(category) {
  return articles.filter((item) => item.category === category)
}

module.exports = {
  categories,
  articles,
  getPopularArticles,
  getArticlesByCategory
}

// 兼容旧页面的数据入口，统一指向新版百科目录。
module.exports = require('./encyclopedia')
