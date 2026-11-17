const categories = [
  {
    id: 'cn',
    label: '中式部位',
    countLabel: '11',
    intro: '按国内常见分割方式整理位置、辨认特征与价格参考；7 组潮汕火锅叫法直接并入对应中文部位。'
  },
  {
    id: 'freshness',
    label: '新鲜度',
    countLabel: '6',
    intro: '先看颜色、纹理与水分，再闻排酸和异常气味，最后按弹性与黏性；底部附不同状态避坑指南。'
  },
  {
    id: 'storage',
    label: '保存指南',
    countLabel: '3',
    intro: '冷藏、冷冻和解冻的实用处理方式。'
  }
]

const articles = [
  {
    id: 'chuck-roll',
    category: 'cn',
    kicker: '肩颈 · 大理石纹',
    title: '上脑',
    subtitle: '肩颈肉 / Chuck Roll',
    summary: '脂肪交错均匀渗在瘦肉里，口感接近眼肉，但整体脂肪含量更低。',
    accent: 'red',
    priceLabel: '¥76.5/斤',
    priceMode: '鲜品批发参考',
    sections: [
      {
        label: '位置',
        text: '牛颈椎到第 6 胸椎之间，位于肩颈部靠后、脊骨两侧。'
      },
      {
        label: '辨认',
        text: '看脂肪分布。上脑的脂肪交错均匀渗在瘦肉里，形成大理石花纹；不像眼肉有大块脂肪覆盖，也不像里脊几乎纯瘦。'
      },
      {
        label: '特性',
        text: '肉质细嫩，肥瘦比例适中，大理石花纹密集。整体口感接近眼肉，但脂肪含量更低。'
      },
      {
        label: '做法',
        text: '涮火锅、煎烤、红烧炖煮。'
      }
    ],
    priceRows: [
      { source: '河北 · 排酸鲜品', spec: 'A 级', price: '76.50 元/斤' },
      { source: '山东 · 冷冻', spec: 'B 级', price: '40.50 元/斤' }
    ],
    priceNote: '河北鲜品上脑是当地报价中最高的一档，比眼肉 S 级还高。'
  },
  {
    id: 'ribeye',
    category: 'cn',
    kicker: '肋脊 · 红白镶嵌',
    title: '眼肉',
    subtitle: '肋眼 / Ribeye',
    summary: '脂肪在红色瘦肉中形成“眼睛”状斑纹，鲜嫩多汁，是牛肉分级常采用的部位。',
    accent: 'red',
    priceLabel: '¥72.5/斤',
    priceMode: 'S 级鲜品参考',
    sections: [
      {
        label: '位置',
        text: '第 6 至第 12 根肋骨之间，一端接上脑，另一端接外脊。'
      },
      {
        label: '辨认',
        text: '核心特征是红白镶嵌呈“眼睛”状：白色脂肪在红色瘦肉中间形成类似眼睛的斑纹。'
      },
      {
        label: '特性',
        text: '脂肪含量较高，肉质鲜嫩多汁，香甜不干涩。是全球牛肉分级最常采用的评级部位。'
      },
      {
        label: '做法',
        text: '煎牛排、涮火锅、烧烤。'
      }
    ],
    priceRows: [
      { source: '河北 · 排酸鲜品', spec: 'S 级', price: '72.50 元/斤' },
      { source: '河北 · 排酸鲜品', spec: 'A 级', price: '69.50 元/斤' },
      { source: '山东 · 冷冻', spec: '冷冻品', price: '42.50 元/斤' }
    ],
    priceNote: '河北 S 级与 A 级每斤相差 3 元，等级溢价相对清晰。'
  },
  {
    id: 'sirloin',
    category: 'cn',
    kicker: '外脊 · 脂肪边',
    title: '外脊',
    subtitle: '西冷 / Striploin',
    summary: '外侧通常带一条半圈状脂肪或筋膜，口感香嫩油润，并保留一定嚼劲。',
    accent: 'dark',
    priceLabel: '¥74/斤',
    priceMode: 'S 级鲜品参考',
    sections: [
      {
        label: '位置',
        text: '第 12、13 肋骨到最后腰椎处，位于眼肉之后、里脊之外。'
      },
      {
        label: '辨认',
        text: '看外缘那圈白色脂肪筋。肉块外侧带一条半圈状白色脂肪或筋膜组织，是区别于里脊和眼肉的关键外观。'
      },
      {
        label: '特性',
        text: '带脂肪和筋膜，口感香嫩油润，有一定嚼劲。'
      },
      {
        label: '做法',
        text: '外脊牛排（西冷）、葱爆牛肉、涮锅。'
      }
    ],
    priceRows: [
      { source: '河北 · 排酸鲜品', spec: 'S 级', price: '74.00 元/斤' },
      { source: '河北 · 排酸鲜品', spec: 'A 级', price: '60.00 元/斤' }
    ],
    priceNote: 'S 级与 A 级每斤相差 14 元，是等级价差最大的部位之一。'
  },
  {
    id: 'tenderloin',
    category: 'cn',
    kicker: '腰内侧 · 纯瘦',
    title: '里脊',
    subtitle: '菲力 / Tenderloin',
    summary: '全牛最嫩的长条圆柱状肌肉，几乎无肌间脂肪，牛肉风味相对清淡。',
    accent: 'sage',
    priceLabel: '¥65/斤',
    priceMode: 'S 级鲜品参考',
    sections: [
      {
        label: '位置',
        text: '腰椎内侧，腹腔后壁的一条长圆柱形肌肉，即腰大肌。'
      },
      {
        label: '辨认',
        text: '看纯瘦度和形状。几乎看不到肌间脂肪，通体深红，形状规整呈长条圆柱状，没有外脊那圈脂肪边。'
      },
      {
        label: '特性',
        text: '全牛最嫩，但脂肪少，牛肉风味相对清淡。'
      },
      {
        label: '做法',
        text: '里脊牛排（菲力）、铁板牛柳、黑椒牛柳。'
      }
    ],
    priceRows: [
      { source: '河北 · 排酸鲜品', spec: 'S 级', price: '65.00 元/斤' },
      { source: '河北 · 排酸鲜品', spec: 'A 级', price: '60.00 元/斤' },
      { source: '山东 · 冷冻', spec: 'A 级', price: '53.00 元/斤' }
    ],
    priceNote: '鲜品里脊 S 级反而低于眼肉和外脊，说明国内定价中脂肪花纹的权重高于纯嫩度。'
  },
  {
    id: 'brisket',
    category: 'cn',
    kicker: '腹部 · 筋油相间',
    title: '牛腩',
    subtitle: '胸腹肉 / Brisket',
    summary: '筋、肉、油花混合，久炖后筋膜转化为胶质，口感软烂浓郁。',
    accent: 'yellow',
    priceLabel: '¥39/斤',
    priceMode: '冷冻批发参考',
    sections: [
      {
        label: '位置',
        text: '牛腹部及靠近牛肋处的松软肌肉统称。'
      },
      {
        label: '辨认',
        text: '看筋、肉、油花三者混杂的松软状态。切开常能看到筋膜穿插在瘦肉和脂肪之间，类似牛身上的“五花肉”。'
      },
      {
        label: '特性',
        text: '肥瘦相间并带筋膜，长时间炖煮后筋膜转化为胶质，口感软烂浓郁。'
      },
      {
        label: '做法',
        text: '红烧、清炖、番茄牛腩、咖喱牛腩。'
      }
    ],
    priceRows: [
      { source: '山东 · 冷冻', spec: '10 月 15 日报价', price: '39.00 元/斤' }
    ],
    priceNote: '此前折算价为 37 元/斤。国产鲜品牛腩在河北报价表中未单列。'
  },
  {
    id: 'shank',
    category: 'cn',
    kicker: '腱子 · 筋花纹理',
    title: '牛腱',
    subtitle: '精选腱子 / 金钱腱',
    summary: '透明筋呈花状或树枝状嵌在红肉里，卤熟后胶质感明显，切片不易散。',
    accent: 'red',
    priceLabel: '¥45–61/斤',
    priceMode: '腱子与金钱腱',
    sections: [
      {
        label: '位置',
        text: '前后腿肌肉。'
      },
      {
        label: '辨认',
        text: '看肉中夹筋的“花形”纹路。透明筋镶嵌在红色瘦肉里，呈花状或树枝状分布；金钱腱是其中筋花最漂亮的部分。'
      },
      {
        label: '特性',
        text: '硬度适中，煮熟后有胶质感，切片不散。'
      },
      {
        label: '做法',
        text: '卤制首选：酱牛腱、五香牛腱。'
      }
    ],
    priceRows: [
      { source: '河北 · 排酸鲜品', spec: '精选腱子', price: '45.00 元/斤' },
      { source: '河北 · 排酸鲜品', spec: '金钱腱', price: '60.00 元/斤' },
      { source: '山东 · 冷冻', spec: '精修牛前腱', price: '47.00 元/斤' },
      { source: '山东 · 冷冻', spec: '金钱腱', price: '61.00 元/斤' }
    ],
    priceNote: '金钱腱比普通腱子每斤贵约 15 元，筋花溢价清晰。'
  },
  {
    id: 'shoulder',
    category: 'cn',
    kicker: '前肩胛 · 紧实含筋',
    title: '肩肉',
    subtitle: '前肩胛部',
    summary: '有肥有瘦、肉质紧实且含筋，炖煮后胶质融化，适合卤煮和咖喱。',
    accent: 'dark',
    priceLabel: '¥41/斤 参照',
    priceMode: '板腱冷冻参考',
    sections: [
      {
        label: '位置',
        text: '前肩胛部，前腿上部。'
      },
      {
        label: '辨认',
        text: '纤维较细，间隙脂肪含量较多，但不像上脑那样形成密集大理石纹。表面有筋膜覆盖。'
      },
      {
        label: '特性',
        text: '有肥有瘦，肉质紧实，含筋较多。炖煮后胶质融化，使肉质可口。'
      },
      {
        label: '做法',
        text: '炖、煮、卤、咖喱牛肉。'
      }
    ],
    priceRows: [
      { source: '山东 · 冷冻', spec: '精修板腱（肩胛相关参照）', price: '41.00 元/斤' }
    ],
    priceNote: '国产鲜品肩肉在河北表中未单列；板腱仅作为肩胛相关部位的邻近参照。'
  },
  {
    id: 'brisket-chest',
    category: 'cn',
    kicker: '前胸 · 脂肪分层',
    title: '胸肉',
    subtitle: '牛胸口两前腿之间',
    summary: '常见一面脂肪、一面精肉的分层结构，纤维稍粗，慢煮后软嫩多汁。',
    accent: 'yellow',
    priceLabel: '报价稀缺',
    priceMode: '暂无独立鲜品报价',
    sections: [
      {
        label: '位置',
        text: '牛胸口两前腿之间。'
      },
      {
        label: '辨认',
        text: '看一面脂肪、一面精肉的分层结构。纤维稍粗但口感较嫩，肥而不腻。'
      },
      {
        label: '特性',
        text: '纤维较粗，表面有脂肪覆盖，慢煮后软嫩多汁。'
      },
      {
        label: '做法',
        text: '慢炖、慢烤、涮肉。'
      }
    ],
    priceRows: [],
    priceNote: '国产鲜品胸肉在现有国内分割品报价中未单列，价格数据稀缺。'
  },
  {
    id: 'rump',
    category: 'cn',
    kicker: '后腿 · 纯瘦紧实',
    title: '臀肉 / 米龙 / 黄瓜条',
    subtitle: '后腿分割部位',
    summary: '肉色偏暗红、表面有筋覆盖。黄瓜条纯瘦、纹理清晰，适合水煮和干煸。',
    accent: 'sage',
    priceLabel: '¥38–45/斤',
    priceMode: '冷冻分割参考',
    sections: [
      {
        label: '位置',
        text: '后腿区域。黄瓜条是臀腿部位中辨识度较高的分割品。'
      },
      {
        label: '辨认',
        text: '肉色偏暗红，表面有筋覆盖。黄瓜条呈长条状，纯瘦，纹理清晰。'
      },
      {
        label: '特性',
        text: '口感紧实，纯瘦健康，比里脊、眼肉更“柴”一些。'
      },
      {
        label: '做法',
        text: '水煮牛肉、干煸牛肉丝、牛肉干、黑椒牛肉。'
      }
    ],
    priceRows: [
      { source: '河北 · 排酸鲜品', spec: '黄瓜条', price: '41.00 元/斤' },
      { source: '山东 · 冷冻', spec: '米龙', price: '38.00 元/斤' },
      { source: '山东 · 冷冻', spec: '黄瓜条', price: '45.00 元/斤' },
      { source: '山东 · 冷冻', spec: '牛霖', price: '38.50 元/斤' }
    ],
    priceNote: '冷冻黄瓜条反而高于鲜品报价，可能与规格和修清程度有关。'
  },
  {
    id: 'neck',
    category: 'cn',
    kicker: '脖颈 · 肉纹杂乱',
    title: '牛颈肉 / 牛脖肉',
    subtitle: '脖颈及颈椎周围',
    summary: '肥瘦兼有、肉纹不规则且偏干实，适合制馅、煨汤和制作牛肉丸。',
    accent: 'dark',
    priceLabel: '报价不单列',
    priceMode: '多走馅料渠道',
    sections: [
      {
        label: '位置',
        text: '脖颈部位，包裹颈椎。'
      },
      {
        label: '辨认',
        text: '看肉纹的杂乱程度。肥瘦兼有，肉纹不规则，肉质干实，纤维较粗。'
      },
      {
        label: '特性',
        text: '肌肉多、脂肪少，柔嫩有嚼劲，整体偏干实。'
      },
      {
        label: '做法',
        text: '制馅、煨汤、牛肉丸。'
      }
    ],
    priceRows: [
      { source: '山东 · 冷冻', spec: '脖骨（带骨，仅供邻近参考）', price: '13.00 元/斤' }
    ],
    priceNote: '精细分割报价中通常不单列牛颈肉，多走馅料或低端渠道。脖骨是带骨产品，不能直接与纯肉部位比较。'
  },
  {
    id: 'oxtail',
    category: 'cn',
    kicker: '尾部 · 骨肉胶质',
    title: '牛尾',
    subtitle: '牛尾部',
    summary: '切段后骨头居中，周围包裹深红色肉和白色脂肪，久炖后汤汁浓郁。',
    accent: 'red',
    priceLabel: '按根 / 段计价',
    priceMode: '暂无独立分割报价',
    sections: [
      {
        label: '位置',
        text: '牛尾部。'
      },
      {
        label: '辨认',
        text: '看骨肉比例和胶质外观。切段后骨头居中，周围包裹深红色肉和白色脂肪。'
      },
      {
        label: '特性',
        text: '长时间炖煮后胶质尽释，汤汁浓郁。'
      },
      {
        label: '做法',
        text: '红烧牛尾、牛尾汤。'
      }
    ],
    priceRows: [],
    priceNote: '国内分割品报价中通常未单列，一般按根或段计价。'
  },
  {
    id: 'fresh-color',
    category: 'freshness',
    kicker: '第一步',
    title: '看颜色与纹理',
    subtitle: '肌红蛋白 · 脂肪 · 水分',
    summary:
      '牛肉颜色会随接触空气的时间变化。不要只追求“鲜红”，还要一起观察切面光泽、脂肪成色、水分和纤维走向。',
    accent: 'red',
    sections: [
      {
        label: '发色',
        text:
          '真空包装或刚切开的牛肉常呈暗红至紫红色，接触空气 15–30 分钟后会转为鲜红。这是肌红蛋白与氧气结合后的发色过程，并不能单凭“更红”判断更新鲜。'
      },
      {
        label: '氧化',
        text:
          '暴露空气过久后，鲜红可能转为暗褐或灰褐。这表示肌红蛋白已经氧化、肉质开始老化；如果同时出现发黏、异味或灰绿色斑点，则不要再食用。'
      },
      {
        label: '切面',
        text:
          '新鲜肉的切面通常有轻微光泽，肌肉纹理清楚。切面发干、发暗，或出现灰绿色斑点时，可能提示微生物已经大量繁殖。'
      },
      {
        label: '脂肪',
        text:
          '健康牛脂肪通常呈乳白或微淡黄色，质地紧实。明显深黄、暗黄，或看起来半透明、水汪汪时，可能提示牛龄较大、存放较久或脂肪氧化，需留意哈喇味。'
      },
      {
        label: '水分',
        text:
          '正常牛肉能看到清楚的肌肉纤维走向。表面像打了蜡一样水光锃亮，或盘底出现大量血水（排除正常化冻水）时，可能提示注水或保水过度，但仍要结合来源和触感判断。'
      },
      {
        label: '表面',
        text:
          '新鲜肉表面可呈微干状态，或有一层极薄的干燥“风干膜”。这不等于肉已经失水；异常湿亮、黏液和积水更值得警惕。'
      }
    ],
    priceRows: [],
    priceNote: ''
  },
  {
    id: 'fresh-smell',
    category: 'freshness',
    kicker: '第二步',
    title: '闻排酸与气味',
    subtitle: '肉香 · 酸味 · 氨味',
    summary:
      '新鲜牛肉不应有刺鼻气味。排酸良好时气味清淡，可能带轻微肉香、奶香或草木香；酸味、氨味和掩盖性香味都要警惕。',
    accent: 'yellow',
    sections: [
      {
        label: '正常',
        text:
          '凑近闻时气味清淡自然，可能有淡淡肉香和轻微奶香、草木香。冷藏肉刚取出时气味会更淡，可稍等片刻再闻。'
      },
      {
        label: '酸味',
        text:
          '动物死后肌肉会进行无氧酵解并产生乳酸。若排酸工艺不足或存放温度偏高，可能留下明显酸味；酸味越重，越应谨慎。'
      },
      {
        label: '氨味',
        text:
          '如果闻到刺鼻的氨味或尿味，通常说明蛋白质已经发生深度腐败，不应食用。'
      },
      {
        label: '掩盖',
        text:
          '浓烈香料味、酒味或异常甜味可能用于掩盖不新鲜。气味不是唯一标准，应同时检查包装温度、颜色、表面黏性和购买时间。'
      },
      {
        label: '提醒',
        text:
          '低温会抑制气味挥发，有些变质肉在冷藏状态下气味并不明显。解冻或回温后气味突然变重，也应停止食用。'
      }
    ],
    priceRows: [],
    priceNote: ''
  },
  {
    id: 'fresh-touch',
    category: 'freshness',
    kicker: '第三步',
    title: '按弹性与黏性',
    subtitle: '回弹 · 干湿度 · 黏液',
    summary:
      '轻按瘦肉应能较快回弹，表面微润而不过分黏手。凹陷难恢复、拉丝黏液或胶水般滑腻都提示肉质已经异常。',
    accent: 'sage',
    sections: [
      {
        label: '弹性',
        text:
          '用手指轻轻按压瘦肉，新鲜肉的凹陷会较快回弹。如果形成明显凹坑且恢复很慢，说明肌肉蛋白可能已经降解、保水能力下降。'
      },
      {
        label: '湿度',
        text:
          '正常表面应微湿润但不粘手。肉汁造成的轻微黏性通常一摸就滑开；有明显积水、湿滑发亮则要结合温度和解冻状态判断。'
      },
      {
        label: '黏液',
        text:
          '若表面出现能拉丝的黏液，或洗手时像胶水一样滑腻，可能是细菌产生的多糖物质，属于明显变质信号。'
      },
      {
        label: '提醒',
        text:
          '表面有极薄干燥风干膜可属正常；不要只凭单一指标判断，应把看、闻、按和储存条件结合起来。'
      }
    ],
    priceRows: [],
    priceNote: ''
  },
  {
    id: 'fresh-chilled',
    category: 'freshness',
    kicker: '状态避坑',
    title: '冷鲜肉',
    subtitle: '0–4°C · 看包装与血水',
    summary:
      '冷鲜肉重点核对包装日期、保质期和冷链状态。包装内大量血水可能提示运输温度波动，但不能单独等同于已经变质。',
    accent: 'red',
    guideType: 'state',
    sections: [
      {
        label: '包装',
        text: '先看生产或分切日期、保质期、储存温度和包装是否完整，避免临期且反复出入冷柜的产品。'
      },
      {
        label: '血水',
        text:
          '包装内大量血水或“血水袋”可能来自运输温度不稳定或反复化冻造成的细胞破裂。若同时伴随异味、发黏或颜色灰绿，不建议食用。'
      },
      {
        label: '复核',
        text: '拆封后重新检查颜色、气味、切面光泽和按压回弹，不要只依赖包装日期。'
      }
    ],
    priceRows: [],
    priceNote: ''
  },
  {
    id: 'fresh-frozen',
    category: 'freshness',
    kicker: '状态避坑',
    title: '冷冻肉',
    subtitle: '-18°C · 看冰霜与解冻',
    summary:
      '厚白冰霜可能提示长期存放和水分流失；解冻后的弹性、渗出液和肉质状态，比表面“冻得很硬”更重要。',
    accent: 'yellow',
    guideType: 'state',
    sections: [
      {
        label: '冰霜',
        text:
          '表面结着很厚的白色冰霜，甚至像雪一样时，可能发生了“冷冻烧”和明显水分流失。它不一定代表腐败，但通常意味着品质下降。'
      },
      {
        label: '解冻',
        text:
          '品质较好的冷冻肉解冻后仍有一定弹性；劣质或反复冻融的肉会流出大量浑浊血水，肉色发白、发柴或容易散碎。'
      },
      {
        label: '温度',
        text:
          '避免反复解冻再冷冻。冷冻温度不稳定会加速细胞损伤，也会增加微生物风险。'
      }
    ],
    priceRows: [],
    priceNote: ''
  },
  {
    id: 'fresh-cut',
    category: 'freshness',
    kicker: '状态避坑',
    title: '鲜切肉',
    subtitle: '火锅店 / 菜市场现切',
    summary:
      '天然表面黏性会让新鲜、未过度注水的鲜切肉容易贴盘；如果迅速滑落或盘底大量积水，要结合气味和触感进一步判断。',
    accent: 'dark',
    guideType: 'state',
    sections: [
      {
        label: '立盘',
        text:
          '新鲜鲜切肉依靠天然表面黏性，贴在盘上立起时通常不易掉落。它是辅助判断，不应代替气味、弹性和来源检查。'
      },
      {
        label: '积水',
        text:
          '如果肉片迅速滑落、盘底很快积水，可能提示水分过多、保水过度或肉质较差；若水液浑浊并伴异味，应谨慎。'
      },
      {
        label: '现闻',
        text: '鲜切肉离开冷柜后应尽快食用。闻到酸味、氨味或明显异味时，不要因为“刚切”而忽略风险。'
      }
    ],
    priceRows: [],
    priceNote: ''
  },
  {
    id: 'store-fridge',
    category: 'storage',
    kicker: '短期',
    title: '冷藏保存',
    subtitle: '0–4°C · 密封',
    summary: '生牛肉应密封后放在冷藏区下层，避免汁液污染其他食物。一般建议 1–2 天内烹饪。',
    accent: 'sage',
    sections: [
      {
        label: '温度',
        text: '0–4°C。'
      },
      {
        label: '方式',
        text: '密封、分装，避免反复开盖和长时间暴露在室温。'
      },
      {
        label: '时间',
        text: '尽量在 1–2 天内吃完。'
      }
    ],
    priceRows: [],
    priceNote: ''
  },
  {
    id: 'store-freeze',
    category: 'storage',
    kicker: '长期',
    title: '分装冷冻',
    subtitle: '-18°C 以下',
    summary: '按一餐用量密封分装，尽量排出空气。标注日期后冷冻，避免大块反复解冻。',
    accent: 'dark',
    sections: [
      {
        label: '温度',
        text: '-18°C 以下。'
      },
      {
        label: '份量',
        text: '按一餐一袋分装，减少大块反复解冻。'
      },
      {
        label: '标记',
        text: '标注部位、日期和重量。'
      }
    ],
    priceRows: [],
    priceNote: ''
  },
  {
    id: 'store-thaw',
    category: 'storage',
    kicker: '解冻',
    title: '冷藏室慢解冻',
    subtitle: '提前计划更稳',
    summary: '前一晚将密封牛肉移至冷藏室解冻。避免室温长时间放置，也不建议反复冷冻。',
    accent: 'yellow',
    sections: [
      {
        label: '方式',
        text: '连同密封包装放在冷藏室解冻。'
      },
      {
        label: '时间',
        text: '按厚度预留 6–12 小时。'
      },
      {
        label: '提醒',
        text: '解冻后尽快烹饪，避免再次冷冻。'
      }
    ],
    priceRows: [],
    priceNote: ''
  }
]

const chaoshanReferenceMap = {
  'chuck-roll': {
    aliases: '脖仁（雪花）',
    relation:
      '潮汕火锅取颈背核心，以密集点状雪花为辨认特征。两者都位于颈背区域，但潮汕分割更聚焦雪花核心，实际切分范围并非完全一致。建议涮 6–8 秒。',
    priceLabel: '约 ¥90/斤',
    priceNote: '按公开火锅菜单约 100g/份折算；通常高于吊龙。'
  },
  ribeye: {
    aliases: '吊龙',
    relation:
      '潮汕吊龙取牛脊背长条肉，常见特征是瘦肉主体配边缘细白脂肪。该区域可能跨眼肉、外脊与里脊邻近部分，因此统一归入眼肉主卡并注明边界差异。建议涮 8–15 秒。',
    priceLabel: '¥190–290/斤',
    priceNote: '按餐饮端约 100g/份折算；批发端另有吊龙 59 元/斤的报价。'
  },
  shoulder: {
    aliases: '匙仁 / 匙柄',
    relation:
      '匙仁肉中有细筋和脂肪星点，口感嫩中带脆；匙柄切片中间有明显的白色树杈状肉筋，入口柔软弹嫩。两者都来自肩胛区域，建议涮 6–10 秒。',
    priceLabel: '¥180–340/斤',
    priceNote: '按约 100g/份折算：匙柄约 180–260 元/斤，匙仁约 240–340 元/斤。'
  },
  brisket: {
    aliases: '肥胼',
    relation:
      '潮汕肥胼取自牛腹部夹层肉，以明显的厚脂肪与瘦肉分层为特征，涮后多汁鲜嫩，建议约 15 秒。',
    priceLabel: '与吊龙档位相近',
    priceNote: '公开图鉴未单独列价，通常与吊龙档位相近或略低。'
  },
  shank: {
    aliases: '三花趾 / 五花趾',
    relation:
      '三花趾来自前腿肌腱，五花趾来自后腿对应部位。三花筋相对少，口感爽脆；五花筋更多、纹路更明显，更脆弹。三花建议约 10 秒，五花约 8–15 秒。',
    priceLabel: '¥165–440/斤',
    priceNote: '按约 100g/份折算：三花趾约 240–360 元/斤，五花趾约 290–440 元/斤。'
  },
  'brisket-chest': {
    aliases: '胸口朥',
    relation:
      '潮汕胸口朥取自牛前胸软组织，呈鹅黄白色，看似肥油但煮后爽脆不腻、越煮越脆。部分菜单写作“胸口油”，建议煮 3–5 分钟。',
    priceLabel: '¥90–225/斤',
    priceNote: '按约 100g/份折算；部分菜单写作“胸口油”。'
  },
  rump: {
    aliases: '嫩肉',
    relation:
      '潮汕嫩肉颜色深红、几乎无脂肪纹理，取自臀腿纯瘦肉，嫩滑鲜甜但煮久容易老，建议约 8 秒。它对应黄瓜条、米龙等后腿纯瘦分割，并非中式里脊。',
    priceLabel: '¥160–240/斤',
    priceNote: '按约 100g/份折算，通常涮约 8 秒。'
  }
}

function getPopularArticles(limit) {
  return articles.filter((item) => item.category === 'cn').slice(0, limit || 3)
}

function getArticlesByCategory(category) {
  return articles
    .filter((item) => item.category === category)
    .map((item) => {
      if (category !== 'cn') return Object.assign({}, item)
      return Object.assign({}, item, {
        chaoshanReference: chaoshanReferenceMap[item.id] || null
      })
    })
}

const encyclopediaApi = {
  categories,
  articles,
  getPopularArticles,
  getArticlesByCategory
}

module.exports = encyclopediaApi
