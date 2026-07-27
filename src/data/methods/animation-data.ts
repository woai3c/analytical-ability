import type { MethodId } from '../domain'

export interface AnimationFrame {
  label: { zh: string; en: string }
}

type I18n = { zh: string; en: string }

// ── Fishbone ──────────────────────────────────────────────────────

export interface FishboneFrame extends AnimationFrame {
  head: I18n
  categories: {
    name: I18n
    causes: { text: I18n; sub?: I18n }[]
    highlighted?: boolean
  }[]
}

export const fishboneFrames: FishboneFrame[] = [
  {
    label: { zh: '写下问题（鱼头）', en: 'Write the problem (fish head)' },
    head: { zh: '订单取消率翻倍', en: 'Order cancellation doubled' },
    categories: [],
  },
  {
    label: { zh: '添加第一个分类：人', en: 'Add first category: People' },
    head: { zh: '订单取消率翻倍', en: 'Order cancellation doubled' },
    categories: [{ name: { zh: '人', en: 'People' }, causes: [] }],
  },
  {
    label: { zh: '在"人"下列出原因', en: 'List causes under People' },
    head: { zh: '订单取消率翻倍', en: 'Order cancellation doubled' },
    categories: [
      {
        name: { zh: '人', en: 'People' },
        causes: [
          {
            text: { zh: '客服响应慢', en: 'Slow CS response' },
            sub: { zh: '新客服缺少培训', en: 'New staff untrained' },
          },
        ],
      },
    ],
  },
  {
    label: { zh: '添加"机"分类', en: 'Add Machine category' },
    head: { zh: '订单取消率翻倍', en: 'Order cancellation doubled' },
    categories: [
      {
        name: { zh: '人', en: 'People' },
        causes: [
          {
            text: { zh: '客服响应慢', en: 'Slow CS response' },
            sub: { zh: '新客服缺少培训', en: 'New staff untrained' },
          },
        ],
      },
      { name: { zh: '机', en: 'Machine' }, causes: [] },
    ],
  },
  {
    label: { zh: '在"机"下列出原因', en: 'List causes under Machine' },
    head: { zh: '订单取消率翻倍', en: 'Order cancellation doubled' },
    categories: [
      {
        name: { zh: '人', en: 'People' },
        causes: [
          {
            text: { zh: '客服响应慢', en: 'Slow CS response' },
            sub: { zh: '新客服缺少培训', en: 'New staff untrained' },
          },
        ],
      },
      {
        name: { zh: '机', en: 'Machine' },
        causes: [
          {
            text: { zh: '支付接口超时', en: 'Payment API timeout' },
            sub: { zh: '网关上周升级', en: 'Gateway upgraded last week' },
          },
        ],
      },
    ],
  },
  {
    label: { zh: '添加"料"分类和原因', en: 'Add Material category and causes' },
    head: { zh: '订单取消率翻倍', en: 'Order cancellation doubled' },
    categories: [
      {
        name: { zh: '人', en: 'People' },
        causes: [
          {
            text: { zh: '客服响应慢', en: 'Slow CS response' },
            sub: { zh: '新客服缺少培训', en: 'New staff untrained' },
          },
        ],
      },
      {
        name: { zh: '机', en: 'Machine' },
        causes: [
          {
            text: { zh: '支付接口超时', en: 'Payment API timeout' },
            sub: { zh: '网关上周升级', en: 'Gateway upgraded last week' },
          },
        ],
      },
      {
        name: { zh: '料', en: 'Material' },
        causes: [
          {
            text: { zh: '热门商品缺货', en: 'Popular items out of stock' },
            sub: { zh: '库存同步延迟', en: 'Inventory sync delayed' },
          },
        ],
      },
    ],
  },
  {
    label: { zh: '添加"法"分类和原因', en: 'Add Method category and causes' },
    head: { zh: '订单取消率翻倍', en: 'Order cancellation doubled' },
    categories: [
      {
        name: { zh: '人', en: 'People' },
        causes: [
          {
            text: { zh: '客服响应慢', en: 'Slow CS response' },
            sub: { zh: '新客服缺少培训', en: 'New staff untrained' },
          },
        ],
      },
      {
        name: { zh: '机', en: 'Machine' },
        causes: [
          {
            text: { zh: '支付接口超时', en: 'Payment API timeout' },
            sub: { zh: '网关上周升级', en: 'Gateway upgraded last week' },
          },
        ],
      },
      {
        name: { zh: '料', en: 'Material' },
        causes: [
          {
            text: { zh: '热门商品缺货', en: 'Popular items out of stock' },
            sub: { zh: '库存同步延迟', en: 'Inventory sync delayed' },
          },
        ],
      },
      {
        name: { zh: '法', en: 'Method' },
        causes: [
          {
            text: { zh: '满减规则复杂', en: 'Complex discount rules' },
            sub: { zh: '未做用户测试', en: 'No user testing done' },
          },
        ],
      },
    ],
  },
  {
    label: { zh: '添加"环"分类和原因', en: 'Add Environment category and causes' },
    head: { zh: '订单取消率翻倍', en: 'Order cancellation doubled' },
    categories: [
      {
        name: { zh: '人', en: 'People' },
        causes: [
          {
            text: { zh: '客服响应慢', en: 'Slow CS response' },
            sub: { zh: '新客服缺少培训', en: 'New staff untrained' },
          },
        ],
      },
      {
        name: { zh: '机', en: 'Machine' },
        causes: [
          {
            text: { zh: '支付接口超时', en: 'Payment API timeout' },
            sub: { zh: '网关上周升级', en: 'Gateway upgraded last week' },
          },
        ],
      },
      {
        name: { zh: '料', en: 'Material' },
        causes: [
          {
            text: { zh: '热门商品缺货', en: 'Popular items out of stock' },
            sub: { zh: '库存同步延迟', en: 'Inventory sync delayed' },
          },
        ],
      },
      {
        name: { zh: '法', en: 'Method' },
        causes: [
          {
            text: { zh: '满减规则复杂', en: 'Complex discount rules' },
            sub: { zh: '未做用户测试', en: 'No user testing done' },
          },
        ],
      },
      {
        name: { zh: '环', en: 'Environ.' },
        causes: [
          {
            text: { zh: '竞品大促', en: 'Competitor sale' },
            sub: { zh: '价格竞争力下降', en: 'Less price competitive' },
          },
        ],
      },
    ],
  },
  {
    label: { zh: '标记重点验证方向', en: 'Mark priority causes for verification' },
    head: { zh: '订单取消率翻倍', en: 'Order cancellation doubled' },
    categories: [
      {
        name: { zh: '人', en: 'People' },
        causes: [
          {
            text: { zh: '客服响应慢', en: 'Slow CS response' },
            sub: { zh: '新客服缺少培训', en: 'New staff untrained' },
          },
        ],
        highlighted: true,
      },
      {
        name: { zh: '机', en: 'Machine' },
        causes: [
          {
            text: { zh: '支付接口超时', en: 'Payment API timeout' },
            sub: { zh: '网关上周升级', en: 'Gateway upgraded last week' },
          },
        ],
        highlighted: true,
      },
      {
        name: { zh: '料', en: 'Material' },
        causes: [
          {
            text: { zh: '热门商品缺货', en: 'Popular items out of stock' },
            sub: { zh: '库存同步延迟', en: 'Inventory sync delayed' },
          },
        ],
        highlighted: true,
      },
      {
        name: { zh: '法', en: 'Method' },
        causes: [
          {
            text: { zh: '满减规则复杂', en: 'Complex discount rules' },
            sub: { zh: '未做用户测试', en: 'No user testing done' },
          },
        ],
      },
      {
        name: { zh: '环', en: 'Environ.' },
        causes: [
          {
            text: { zh: '竞品大促', en: 'Competitor sale' },
            sub: { zh: '价格竞争力下降', en: 'Less price competitive' },
          },
        ],
      },
    ],
  },
]

// ── Five Whys ─────────────────────────────────────────────────────

export interface FiveWhyFrame extends AnimationFrame {
  problem: I18n
  whys: { question: I18n; answer: I18n }[]
  rootCause?: I18n
}

export const fiveWhyFrames: FiveWhyFrame[] = [
  {
    label: { zh: '写下可观察的问题', en: 'State the observable problem' },
    problem: { zh: '新员工 3 个月内离职率 35%', en: '35% of new hires leave within 3 months' },
    whys: [],
  },
  {
    label: { zh: 'Why 1：为什么离职？', en: 'Why 1: Why do they leave?' },
    problem: { zh: '新员工 3 个月内离职率 35%', en: '35% of new hires leave within 3 months' },
    whys: [
      {
        question: { zh: '为什么离职？', en: 'Why do they leave?' },
        answer: { zh: '工作内容和预期不符', en: "Job doesn't match expectations" },
      },
    ],
  },
  {
    label: { zh: 'Why 2：为什么不符？', en: 'Why 2: Why the mismatch?' },
    problem: { zh: '新员工 3 个月内离职率 35%', en: '35% of new hires leave within 3 months' },
    whys: [
      {
        question: { zh: '为什么离职？', en: 'Why do they leave?' },
        answer: { zh: '工作内容和预期不符', en: "Job doesn't match expectations" },
      },
      {
        question: { zh: '为什么不符？', en: 'Why the mismatch?' },
        answer: {
          zh: 'JD 写"产品设计"，实际做"运营支持"',
          en: 'JD says "Product Design" but actual work is "Ops Support"',
        },
      },
    ],
  },
  {
    label: { zh: 'Why 3：为什么 JD 不准确？', en: 'Why 3: Why is the JD wrong?' },
    problem: { zh: '新员工 3 个月内离职率 35%', en: '35% of new hires leave within 3 months' },
    whys: [
      {
        question: { zh: '为什么离职？', en: 'Why do they leave?' },
        answer: { zh: '工作内容和预期不符', en: "Job doesn't match expectations" },
      },
      {
        question: { zh: '为什么不符？', en: 'Why the mismatch?' },
        answer: {
          zh: 'JD 写"产品设计"，实际做"运营支持"',
          en: 'JD says "Product Design" but actual work is "Ops Support"',
        },
      },
      {
        question: { zh: '为什么 JD 不准确？', en: 'Why is the JD inaccurate?' },
        answer: { zh: 'JD 是 2 年前写的，岗位已变化', en: 'JD was written 2 years ago, role has changed' },
      },
    ],
  },
  {
    label: { zh: 'Why 4：为什么没更新？', en: "Why 4: Why wasn't it updated?" },
    problem: { zh: '新员工 3 个月内离职率 35%', en: '35% of new hires leave within 3 months' },
    whys: [
      {
        question: { zh: '为什么离职？', en: 'Why do they leave?' },
        answer: { zh: '工作内容和预期不符', en: "Job doesn't match expectations" },
      },
      {
        question: { zh: '为什么不符？', en: 'Why the mismatch?' },
        answer: {
          zh: 'JD 写"产品设计"，实际做"运营支持"',
          en: 'JD says "Product Design" but actual work is "Ops Support"',
        },
      },
      {
        question: { zh: '为什么 JD 不准确？', en: 'Why is the JD inaccurate?' },
        answer: { zh: 'JD 是 2 年前写的，岗位已变化', en: 'JD was written 2 years ago, role has changed' },
      },
      {
        question: { zh: '为什么没更新？', en: "Why wasn't it updated?" },
        answer: { zh: '没有人负责定期审核 JD', en: 'Nobody owns periodic JD reviews' },
      },
    ],
  },
  {
    label: { zh: 'Why 5：找到根因', en: 'Why 5: Root cause found' },
    problem: { zh: '新员工 3 个月内离职率 35%', en: '35% of new hires leave within 3 months' },
    whys: [
      {
        question: { zh: '为什么离职？', en: 'Why do they leave?' },
        answer: { zh: '工作内容和预期不符', en: "Job doesn't match expectations" },
      },
      {
        question: { zh: '为什么不符？', en: 'Why the mismatch?' },
        answer: {
          zh: 'JD 写"产品设计"，实际做"运营支持"',
          en: 'JD says "Product Design" but actual work is "Ops Support"',
        },
      },
      {
        question: { zh: '为什么 JD 不准确？', en: 'Why is the JD inaccurate?' },
        answer: { zh: 'JD 是 2 年前写的，岗位已变化', en: 'JD was written 2 years ago, role has changed' },
      },
      {
        question: { zh: '为什么没更新？', en: "Why wasn't it updated?" },
        answer: { zh: '没有人负责定期审核 JD', en: 'Nobody owns periodic JD reviews' },
      },
      {
        question: { zh: '为什么没有这个流程？', en: 'Why is there no such process?' },
        answer: { zh: 'HR 缺少 JD 审核制度', en: 'HR lacks a JD audit policy' },
      },
    ],
    rootCause: { zh: '每季度由用人经理和 HR 共同审核 JD', en: 'Quarterly JD review by hiring manager + HR' },
  },
]

// ── ABC / Pareto ──────────────────────────────────────────────────

export interface AbcFrame extends AnimationFrame {
  metric: I18n
  items: { name: I18n; value: number; cumPct: number; grade: 'A' | 'B' | 'C' }[]
  conclusion?: I18n
}

export const abcFrames: AbcFrame[] = [
  {
    label: { zh: '列出所有产品', en: 'List all products' },
    metric: { zh: '月销量（杯）', en: 'Monthly Sales (cups)' },
    items: [
      { name: { zh: '杨枝甘露', en: 'Mango Sago' }, value: 3200, cumPct: 0, grade: 'A' },
      { name: { zh: '珍珠奶茶', en: 'Bubble Tea' }, value: 2800, cumPct: 0, grade: 'A' },
      { name: { zh: '芒果冰沙', en: 'Mango Smoothie' }, value: 2100, cumPct: 0, grade: 'A' },
      { name: { zh: '柠檬茶', en: 'Lemon Tea' }, value: 1500, cumPct: 0, grade: 'A' },
      { name: { zh: '抹茶拿铁', en: 'Matcha Latte' }, value: 1200, cumPct: 0, grade: 'A' },
      { name: { zh: '其他 20 种', en: 'Other 20 items' }, value: 3800, cumPct: 0, grade: 'C' },
    ],
  },
  {
    label: { zh: '按销量从大到小排序', en: 'Sort by sales, descending' },
    metric: { zh: '月销量（杯）', en: 'Monthly Sales (cups)' },
    items: [
      { name: { zh: '杨枝甘露', en: 'Mango Sago' }, value: 3200, cumPct: 22, grade: 'A' },
      { name: { zh: '珍珠奶茶', en: 'Bubble Tea' }, value: 2800, cumPct: 41, grade: 'A' },
      { name: { zh: '芒果冰沙', en: 'Mango Smoothie' }, value: 2100, cumPct: 55, grade: 'A' },
      { name: { zh: '柠檬茶', en: 'Lemon Tea' }, value: 1500, cumPct: 65, grade: 'A' },
      { name: { zh: '抹茶拿铁', en: 'Matcha Latte' }, value: 1200, cumPct: 73, grade: 'A' },
      { name: { zh: '其他 20 种', en: 'Other 20 items' }, value: 3800, cumPct: 100, grade: 'C' },
    ],
  },
  {
    label: { zh: '计算累计占比', en: 'Calculate cumulative share' },
    metric: { zh: '月销量（杯）', en: 'Monthly Sales (cups)' },
    items: [
      { name: { zh: '杨枝甘露', en: 'Mango Sago' }, value: 3200, cumPct: 22, grade: 'A' },
      { name: { zh: '珍珠奶茶', en: 'Bubble Tea' }, value: 2800, cumPct: 41, grade: 'A' },
      { name: { zh: '芒果冰沙', en: 'Mango Smoothie' }, value: 2100, cumPct: 55, grade: 'A' },
      { name: { zh: '柠檬茶', en: 'Lemon Tea' }, value: 1500, cumPct: 65, grade: 'A' },
      { name: { zh: '抹茶拿铁', en: 'Matcha Latte' }, value: 1200, cumPct: 73, grade: 'A' },
      { name: { zh: '其他 20 种', en: 'Other 20 items' }, value: 3800, cumPct: 100, grade: 'C' },
    ],
  },
  {
    label: { zh: '划分 A/B/C 类', en: 'Classify into A/B/C' },
    metric: { zh: '月销量（杯）', en: 'Monthly Sales (cups)' },
    items: [
      { name: { zh: '杨枝甘露', en: 'Mango Sago' }, value: 3200, cumPct: 22, grade: 'A' },
      { name: { zh: '珍珠奶茶', en: 'Bubble Tea' }, value: 2800, cumPct: 41, grade: 'A' },
      { name: { zh: '芒果冰沙', en: 'Mango Smoothie' }, value: 2100, cumPct: 55, grade: 'A' },
      { name: { zh: '柠檬茶', en: 'Lemon Tea' }, value: 1500, cumPct: 65, grade: 'A' },
      { name: { zh: '抹茶拿铁', en: 'Matcha Latte' }, value: 1200, cumPct: 73, grade: 'A' },
      { name: { zh: '其他 20 种', en: 'Other 20 items' }, value: 3800, cumPct: 100, grade: 'C' },
    ],
    conclusion: {
      zh: '前 5 种产品（20%）贡献 73% 销量 → A 类优先备货',
      en: 'Top 5 products (20%) contribute 73% of sales → stock A-class first',
    },
  },
]

// ── KJ / Affinity ─────────────────────────────────────────────────

export interface KjFrame extends AnimationFrame {
  cards: { text: I18n; group?: I18n }[]
  groups: { name: I18n; count: number }[]
}

export const kjFrames: KjFrame[] = [
  {
    label: { zh: '写出所有卡片', en: 'Write all cards' },
    cards: [
      { text: { zh: '加载太慢', en: 'Slow loading' } },
      { text: { zh: '找不到退款入口', en: "Can't find refund" } },
      { text: { zh: '推送太多', en: 'Too many pushes' } },
      { text: { zh: '闪退', en: 'App crashes' } },
      { text: { zh: '客服不回复', en: 'CS no reply' } },
      { text: { zh: '卡顿', en: 'Laggy' } },
      { text: { zh: '设置页找不到', en: "Can't find settings" } },
      { text: { zh: '广告弹窗', en: 'Ad pop-ups' } },
      { text: { zh: '回复慢', en: 'Slow replies' } },
      { text: { zh: '态度差', en: 'Rude service' } },
      { text: { zh: '历史订单找不到', en: "Can't find orders" } },
      { text: { zh: '通知关不掉', en: "Can't disable alerts" } },
    ],
    groups: [],
  },
  {
    label: { zh: '开始自然分组', en: 'Begin natural grouping' },
    cards: [
      { text: { zh: '加载太慢', en: 'Slow loading' }, group: { zh: '性能问题', en: 'Performance' } },
      { text: { zh: '闪退', en: 'App crashes' }, group: { zh: '性能问题', en: 'Performance' } },
      { text: { zh: '卡顿', en: 'Laggy' }, group: { zh: '性能问题', en: 'Performance' } },
      { text: { zh: '找不到退款入口', en: "Can't find refund" } },
      { text: { zh: '推送太多', en: 'Too many pushes' } },
      { text: { zh: '客服不回复', en: 'CS no reply' } },
      { text: { zh: '设置页找不到', en: "Can't find settings" } },
      { text: { zh: '广告弹窗', en: 'Ad pop-ups' } },
      { text: { zh: '回复慢', en: 'Slow replies' } },
      { text: { zh: '态度差', en: 'Rude service' } },
      { text: { zh: '历史订单找不到', en: "Can't find orders" } },
      { text: { zh: '通知关不掉', en: "Can't disable alerts" } },
    ],
    groups: [{ name: { zh: '性能问题', en: 'Performance' }, count: 3 }],
  },
  {
    label: { zh: '继续分组', en: 'Continue grouping' },
    cards: [
      { text: { zh: '加载太慢', en: 'Slow loading' }, group: { zh: '性能问题', en: 'Performance' } },
      { text: { zh: '闪退', en: 'App crashes' }, group: { zh: '性能问题', en: 'Performance' } },
      { text: { zh: '卡顿', en: 'Laggy' }, group: { zh: '性能问题', en: 'Performance' } },
      { text: { zh: '找不到退款入口', en: "Can't find refund" }, group: { zh: '功能找不到', en: 'Hard to Find' } },
      { text: { zh: '设置页找不到', en: "Can't find settings" }, group: { zh: '功能找不到', en: 'Hard to Find' } },
      { text: { zh: '历史订单找不到', en: "Can't find orders" }, group: { zh: '功能找不到', en: 'Hard to Find' } },
      { text: { zh: '推送太多', en: 'Too many pushes' }, group: { zh: '骚扰感', en: 'Annoying' } },
      { text: { zh: '广告弹窗', en: 'Ad pop-ups' }, group: { zh: '骚扰感', en: 'Annoying' } },
      { text: { zh: '通知关不掉', en: "Can't disable alerts" }, group: { zh: '骚扰感', en: 'Annoying' } },
      { text: { zh: '客服不回复', en: 'CS no reply' }, group: { zh: '客服体验', en: 'CS Quality' } },
      { text: { zh: '回复慢', en: 'Slow replies' }, group: { zh: '客服体验', en: 'CS Quality' } },
      { text: { zh: '态度差', en: 'Rude service' }, group: { zh: '客服体验', en: 'CS Quality' } },
    ],
    groups: [
      { name: { zh: '性能问题', en: 'Performance' }, count: 3 },
      { name: { zh: '功能找不到', en: 'Hard to Find' }, count: 3 },
      { name: { zh: '骚扰感', en: 'Annoying' }, count: 3 },
      { name: { zh: '客服体验', en: 'CS Quality' }, count: 3 },
    ],
  },
  {
    label: { zh: '命名主题，得出结论', en: 'Name themes and conclude' },
    cards: [
      { text: { zh: '加载太慢', en: 'Slow loading' }, group: { zh: '性能问题', en: 'Performance' } },
      { text: { zh: '闪退', en: 'App crashes' }, group: { zh: '性能问题', en: 'Performance' } },
      { text: { zh: '卡顿', en: 'Laggy' }, group: { zh: '性能问题', en: 'Performance' } },
      { text: { zh: '找不到退款入口', en: "Can't find refund" }, group: { zh: '功能找不到', en: 'Hard to Find' } },
      { text: { zh: '设置页找不到', en: "Can't find settings" }, group: { zh: '功能找不到', en: 'Hard to Find' } },
      { text: { zh: '历史订单找不到', en: "Can't find orders" }, group: { zh: '功能找不到', en: 'Hard to Find' } },
      { text: { zh: '推送太多', en: 'Too many pushes' }, group: { zh: '骚扰感', en: 'Annoying' } },
      { text: { zh: '广告弹窗', en: 'Ad pop-ups' }, group: { zh: '骚扰感', en: 'Annoying' } },
      { text: { zh: '通知关不掉', en: "Can't disable alerts" }, group: { zh: '骚扰感', en: 'Annoying' } },
      { text: { zh: '客服不回复', en: 'CS no reply' }, group: { zh: '客服体验', en: 'CS Quality' } },
      { text: { zh: '回复慢', en: 'Slow replies' }, group: { zh: '客服体验', en: 'CS Quality' } },
      { text: { zh: '态度差', en: 'Rude service' }, group: { zh: '客服体验', en: 'CS Quality' } },
    ],
    groups: [
      { name: { zh: '性能问题', en: 'Performance' }, count: 3 },
      { name: { zh: '功能找不到', en: 'Hard to Find' }, count: 3 },
      { name: { zh: '骚扰感', en: 'Annoying' }, count: 3 },
      { name: { zh: '客服体验', en: 'CS Quality' }, count: 3 },
    ],
  },
]

// ── Causal Graph ──────────────────────────────────────────────────

export interface CausalGraphFrame extends AnimationFrame {
  nodes: { id: string; label: I18n; type: 'factor' | 'outcome' | 'confounder' }[]
  edges: { from: string; to: string; verified: boolean }[]
}

export const causalGraphFrames: CausalGraphFrame[] = [
  {
    label: { zh: '列出关键变量', en: 'List key variables' },
    nodes: [
      { id: 'training', label: { zh: '参加培训', en: 'Training' }, type: 'factor' },
      { id: 'performance', label: { zh: '高绩效', en: 'High Perf.' }, type: 'outcome' },
    ],
    edges: [],
  },
  {
    label: { zh: '画出假设的因果方向', en: 'Draw assumed causal direction' },
    nodes: [
      { id: 'training', label: { zh: '参加培训', en: 'Training' }, type: 'factor' },
      { id: 'performance', label: { zh: '高绩效', en: 'High Perf.' }, type: 'outcome' },
    ],
    edges: [{ from: 'training', to: 'performance', verified: false }],
  },
  {
    label: { zh: '发现混杂变量', en: 'Discover confounder' },
    nodes: [
      { id: 'training', label: { zh: '参加培训', en: 'Training' }, type: 'factor' },
      { id: 'performance', label: { zh: '高绩效', en: 'High Perf.' }, type: 'outcome' },
      { id: 'motivation', label: { zh: '上进心', en: 'Motivation' }, type: 'confounder' },
    ],
    edges: [{ from: 'training', to: 'performance', verified: false }],
  },
  {
    label: { zh: '画出混杂变量的影响', en: 'Draw confounder influence' },
    nodes: [
      { id: 'training', label: { zh: '参加培训', en: 'Training' }, type: 'factor' },
      { id: 'performance', label: { zh: '高绩效', en: 'High Perf.' }, type: 'outcome' },
      { id: 'motivation', label: { zh: '上进心', en: 'Motivation' }, type: 'confounder' },
    ],
    edges: [
      { from: 'training', to: 'performance', verified: false },
      { from: 'motivation', to: 'training', verified: true },
      { from: 'motivation', to: 'performance', verified: true },
    ],
  },
]

// ── MCDA ──────────────────────────────────────────────────────────

export interface McdaFrame extends AnimationFrame {
  criteria: { name: I18n; weight: number }[]
  options: { name: I18n; scores: number[]; total?: number }[]
  winner?: I18n
}

export const mcdaFrames: McdaFrame[] = [
  {
    label: { zh: '列出候选方案', en: 'List options' },
    criteria: [],
    options: [
      { name: { zh: 'A（贵但全）', en: 'A (pricey, full)' }, scores: [] },
      { name: { zh: 'B（便宜少）', en: 'B (cheap, basic)' }, scores: [] },
      { name: { zh: 'C（开源）', en: 'C (open-source)' }, scores: [] },
    ],
  },
  {
    label: { zh: '确定评价标准和权重', en: 'Define criteria and weights' },
    criteria: [
      { name: { zh: '功能', en: 'Features' }, weight: 40 },
      { name: { zh: '成本', en: 'Cost' }, weight: 30 },
      { name: { zh: '维护', en: 'Maint.' }, weight: 20 },
      { name: { zh: '学习', en: 'Learning' }, weight: 10 },
    ],
    options: [
      { name: { zh: 'A（贵但全）', en: 'A (pricey, full)' }, scores: [] },
      { name: { zh: 'B（便宜少）', en: 'B (cheap, basic)' }, scores: [] },
      { name: { zh: 'C（开源）', en: 'C (open-source)' }, scores: [] },
    ],
  },
  {
    label: { zh: '逐个打分', en: 'Score each option' },
    criteria: [
      { name: { zh: '功能', en: 'Features' }, weight: 40 },
      { name: { zh: '成本', en: 'Cost' }, weight: 30 },
      { name: { zh: '维护', en: 'Maint.' }, weight: 20 },
      { name: { zh: '学习', en: 'Learning' }, weight: 10 },
    ],
    options: [
      { name: { zh: 'A（贵但全）', en: 'A (pricey, full)' }, scores: [9, 3, 8, 7] },
      { name: { zh: 'B（便宜少）', en: 'B (cheap, basic)' }, scores: [5, 9, 8, 9] },
      { name: { zh: 'C（开源）', en: 'C (open-source)' }, scores: [7, 10, 3, 4] },
    ],
  },
  {
    label: { zh: '计算加权总分并排序', en: 'Calculate weighted totals and rank' },
    criteria: [
      { name: { zh: '功能', en: 'Features' }, weight: 40 },
      { name: { zh: '成本', en: 'Cost' }, weight: 30 },
      { name: { zh: '维护', en: 'Maint.' }, weight: 20 },
      { name: { zh: '学习', en: 'Learning' }, weight: 10 },
    ],
    options: [
      { name: { zh: 'A（贵但全）', en: 'A (pricey, full)' }, scores: [9, 3, 8, 7], total: 6.8 },
      { name: { zh: 'B（便宜少）', en: 'B (cheap, basic)' }, scores: [5, 9, 8, 9], total: 7.2 },
      { name: { zh: 'C（开源）', en: 'C (open-source)' }, scores: [7, 10, 3, 4], total: 6.8 },
    ],
    winner: { zh: 'B（便宜少）', en: 'B (cheap, basic)' },
  },
]

// ── Value Analysis ────────────────────────────────────────────────

export interface ValueAnalysisFrame extends AnimationFrame {
  items: { name: I18n; cost: string; contribution: 'high' | 'medium' | 'low'; decision?: I18n }[]
  saving?: I18n
}

export const valueAnalysisFrames: ValueAnalysisFrame[] = [
  {
    label: { zh: '列出所有订阅和成本', en: 'List all subscriptions and costs' },
    items: [
      { name: { zh: '视频会员', en: 'Video' }, cost: '¥25', contribution: 'high' },
      { name: { zh: '音乐会员', en: 'Music' }, cost: '¥15', contribution: 'high' },
      { name: { zh: '云存储', en: 'Cloud' }, cost: '¥20', contribution: 'medium' },
      { name: { zh: '健身 App', en: 'Fitness' }, cost: '¥50', contribution: 'low' },
      { name: { zh: 'AI 工具 A', en: 'AI Tool A' }, cost: '¥200', contribution: 'medium' },
      { name: { zh: '杂志订阅', en: 'Magazine' }, cost: '¥190', contribution: 'low' },
    ],
  },
  {
    label: { zh: '评估贡献度', en: 'Rate contribution' },
    items: [
      { name: { zh: '视频会员', en: 'Video' }, cost: '¥25', contribution: 'high' },
      { name: { zh: '音乐会员', en: 'Music' }, cost: '¥15', contribution: 'high' },
      { name: { zh: '云存储', en: 'Cloud' }, cost: '¥20', contribution: 'medium' },
      { name: { zh: '健身 App', en: 'Fitness' }, cost: '¥50', contribution: 'low' },
      { name: { zh: 'AI 工具 A', en: 'AI Tool A' }, cost: '¥200', contribution: 'medium' },
      { name: { zh: '杂志订阅', en: 'Magazine' }, cost: '¥190', contribution: 'low' },
    ],
  },
  {
    label: { zh: '标记并决策', en: 'Flag and decide' },
    items: [
      {
        name: { zh: '视频会员', en: 'Video' },
        cost: '¥25',
        contribution: 'high',
        decision: { zh: '保留', en: 'Keep' },
      },
      {
        name: { zh: '音乐会员', en: 'Music' },
        cost: '¥15',
        contribution: 'high',
        decision: { zh: '保留', en: 'Keep' },
      },
      {
        name: { zh: '云存储', en: 'Cloud' },
        cost: '¥20',
        contribution: 'medium',
        decision: { zh: '保留', en: 'Keep' },
      },
      {
        name: { zh: '健身 App', en: 'Fitness' },
        cost: '¥50',
        contribution: 'low',
        decision: { zh: '砍掉', en: 'Cut' },
      },
      {
        name: { zh: 'AI 工具 A', en: 'AI Tool A' },
        cost: '¥200',
        contribution: 'medium',
        decision: { zh: '替换 → ¥60', en: 'Switch → ¥60' },
      },
      {
        name: { zh: '杂志订阅', en: 'Magazine' },
        cost: '¥190',
        contribution: 'low',
        decision: { zh: '砍掉', en: 'Cut' },
      },
    ],
    saving: { zh: '月省 ¥380（76%）', en: 'Save ¥380/mo (76%)' },
  },
]

// ── FMEA ──────────────────────────────────────────────────────────

export interface FmeaFrame extends AnimationFrame {
  items: { mode: I18n; effect: I18n; s: number; o: number; d: number; rpn: number; mitigation?: I18n }[]
  sorted?: boolean
}

export const fmeaFrames: FmeaFrame[] = [
  {
    label: { zh: '列出失效模式', en: 'List failure modes' },
    items: [
      {
        mode: { zh: '支付 API 超时', en: 'Payment API timeout' },
        effect: { zh: '付款失败', en: 'Payment fails' },
        s: 9,
        o: 4,
        d: 3,
        rpn: 0,
      },
      {
        mode: { zh: '金额精度错误', en: 'Amount precision error' },
        effect: { zh: '多扣/少扣', en: 'Over/under charge' },
        s: 10,
        o: 2,
        d: 2,
        rpn: 0,
      },
      {
        mode: { zh: '并发重复扣款', en: 'Duplicate charge' },
        effect: { zh: '用户投诉', en: 'User complaints' },
        s: 9,
        o: 3,
        d: 5,
        rpn: 0,
      },
      {
        mode: { zh: '回滚失败', en: 'Rollback failure' },
        effect: { zh: '长时间故障', en: 'Extended outage' },
        s: 8,
        o: 2,
        d: 6,
        rpn: 0,
      },
    ],
  },
  {
    label: { zh: '打 S/O/D 分', en: 'Score S/O/D' },
    items: [
      {
        mode: { zh: '支付 API 超时', en: 'Payment API timeout' },
        effect: { zh: '付款失败', en: 'Payment fails' },
        s: 9,
        o: 4,
        d: 3,
        rpn: 108,
      },
      {
        mode: { zh: '金额精度错误', en: 'Amount precision error' },
        effect: { zh: '多扣/少扣', en: 'Over/under charge' },
        s: 10,
        o: 2,
        d: 2,
        rpn: 40,
      },
      {
        mode: { zh: '并发重复扣款', en: 'Duplicate charge' },
        effect: { zh: '用户投诉', en: 'User complaints' },
        s: 9,
        o: 3,
        d: 5,
        rpn: 135,
      },
      {
        mode: { zh: '回滚失败', en: 'Rollback failure' },
        effect: { zh: '长时间故障', en: 'Extended outage' },
        s: 8,
        o: 2,
        d: 6,
        rpn: 96,
      },
    ],
  },
  {
    label: { zh: '按 RPN 排序，制定措施', en: 'Sort by RPN, define mitigations' },
    items: [
      {
        mode: { zh: '并发重复扣款', en: 'Duplicate charge' },
        effect: { zh: '用户投诉', en: 'User complaints' },
        s: 9,
        o: 3,
        d: 5,
        rpn: 135,
        mitigation: { zh: '加幂等锁', en: 'Add idempotency lock' },
      },
      {
        mode: { zh: '支付 API 超时', en: 'Payment API timeout' },
        effect: { zh: '付款失败', en: 'Payment fails' },
        s: 9,
        o: 4,
        d: 3,
        rpn: 108,
        mitigation: { zh: '重试 + 备用通道', en: 'Retry + fallback' },
      },
      {
        mode: { zh: '回滚失败', en: 'Rollback failure' },
        effect: { zh: '长时间故障', en: 'Extended outage' },
        s: 8,
        o: 2,
        d: 6,
        rpn: 96,
        mitigation: { zh: '灰度发布 + 演练', en: 'Canary deploy + drills' },
      },
      {
        mode: { zh: '金额精度错误', en: 'Amount precision error' },
        effect: { zh: '多扣/少扣', en: 'Over/under charge' },
        s: 10,
        o: 2,
        d: 2,
        rpn: 40,
        mitigation: { zh: '边界值测试', en: 'Boundary tests' },
      },
    ],
    sorted: true,
  },
]

// ── DMAIC ─────────────────────────────────────────────────────────

export interface DmaicFrame extends AnimationFrame {
  phases: { name: string; content: I18n | null; active: boolean }[]
}

export const dmaicFrames: DmaicFrame[] = [
  {
    label: { zh: 'Define：定义问题', en: 'Define: State the problem' },
    phases: [
      {
        name: 'Define',
        content: {
          zh: '响应时间从 48h 降到 12h，影响所有付费用户',
          en: 'Reduce response time from 48h to 12h for all paid users',
        },
        active: true,
      },
      { name: 'Measure', content: null, active: false },
      { name: 'Analyze', content: null, active: false },
      { name: 'Improve', content: null, active: false },
      { name: 'Control', content: null, active: false },
    ],
  },
  {
    label: { zh: 'Measure：测量现状', en: 'Measure: Collect baseline' },
    phases: [
      {
        name: 'Define',
        content: {
          zh: '响应时间从 48h 降到 12h，影响所有付费用户',
          en: 'Reduce response time from 48h to 12h for all paid users',
        },
        active: false,
      },
      {
        name: 'Measure',
        content: { zh: '中位数 52h，P90 = 96h，周一最严重', en: 'Median 52h, P90 = 96h, worst on Mondays' },
        active: true,
      },
      { name: 'Analyze', content: null, active: false },
      { name: 'Improve', content: null, active: false },
      { name: 'Control', content: null, active: false },
    ],
  },
  {
    label: { zh: 'Analyze：分析根因', en: 'Analyze: Find root causes' },
    phases: [
      {
        name: 'Define',
        content: {
          zh: '响应时间从 48h 降到 12h，影响所有付费用户',
          en: 'Reduce response time from 48h to 12h for all paid users',
        },
        active: false,
      },
      {
        name: 'Measure',
        content: { zh: '中位数 52h，P90 = 96h，周一最严重', en: 'Median 52h, P90 = 96h, worst on Mondays' },
        active: false,
      },
      {
        name: 'Analyze',
        content: { zh: '周末无人值班 + 工单分配不均', en: 'No weekend coverage + uneven ticket routing' },
        active: true,
      },
      { name: 'Improve', content: null, active: false },
      { name: 'Control', content: null, active: false },
    ],
  },
  {
    label: { zh: 'Improve：实施改进', en: 'Improve: Implement changes' },
    phases: [
      {
        name: 'Define',
        content: {
          zh: '响应时间从 48h 降到 12h，影响所有付费用户',
          en: 'Reduce response time from 48h to 12h for all paid users',
        },
        active: false,
      },
      {
        name: 'Measure',
        content: { zh: '中位数 52h，P90 = 96h，周一最严重', en: 'Median 52h, P90 = 96h, worst on Mondays' },
        active: false,
      },
      {
        name: 'Analyze',
        content: { zh: '周末无人值班 + 工单分配不均', en: 'No weekend coverage + uneven ticket routing' },
        active: false,
      },
      {
        name: 'Improve',
        content: {
          zh: '增加周末轮班 + 自动按技能分配 + SLA 警报',
          en: 'Weekend shifts + skill-based routing + SLA alerts',
        },
        active: true,
      },
      { name: 'Control', content: null, active: false },
    ],
  },
  {
    label: { zh: 'Control：固化成果', en: 'Control: Sustain gains' },
    phases: [
      {
        name: 'Define',
        content: {
          zh: '响应时间从 48h 降到 12h，影响所有付费用户',
          en: 'Reduce response time from 48h to 12h for all paid users',
        },
        active: false,
      },
      {
        name: 'Measure',
        content: { zh: '中位数 52h，P90 = 96h，周一最严重', en: 'Median 52h, P90 = 96h, worst on Mondays' },
        active: false,
      },
      {
        name: 'Analyze',
        content: { zh: '周末无人值班 + 工单分配不均', en: 'No weekend coverage + uneven ticket routing' },
        active: false,
      },
      {
        name: 'Improve',
        content: {
          zh: '增加周末轮班 + 自动按技能分配 + SLA 警报',
          en: 'Weekend shifts + skill-based routing + SLA alerts',
        },
        active: false,
      },
      {
        name: 'Control',
        content: {
          zh: '每日看板监控，超 24h 自动升级 → 中位数降到 14h',
          en: 'Daily dashboard, auto-escalate >24h → median down to 14h',
        },
        active: true,
      },
    ],
  },
]

// ── PDSA ──────────────────────────────────────────────────────────

export interface PdsaFrame extends AnimationFrame {
  activePhase: 'plan' | 'do' | 'study' | 'act'
  content: { plan: I18n; do_: I18n; study: I18n; act: I18n }
}

export const pdsaFrames: PdsaFrame[] = [
  {
    label: { zh: 'Plan：写下假设和预测', en: 'Plan: Write hypothesis' },
    activePhase: 'plan',
    content: {
      plan: {
        zh: '取消站会改 Slack 日报 → 预测每天多 30 分钟开发时间\n范围：后端组 4 人，两周',
        en: 'Replace standup with Slack daily → expect +30min dev time/day\nScope: backend team of 4, two weeks',
      },
      do_: { zh: '', en: '' },
      study: { zh: '', en: '' },
      act: { zh: '', en: '' },
    },
  },
  {
    label: { zh: 'Do：小范围执行', en: 'Do: Execute in small scope' },
    activePhase: 'do',
    content: {
      plan: {
        zh: '取消站会改 Slack 日报 → 预测每天多 30 分钟开发时间\n范围：后端组 4 人，两周',
        en: 'Replace standup with Slack daily → expect +30min dev time/day\nScope: backend team of 4, two weeks',
      },
      do_: { zh: '第一周有人忘记发日报\n第二周适应了', en: 'Week 1: some forgot to post\nWeek 2: adapted well' },
      study: { zh: '', en: '' },
      act: { zh: '', en: '' },
    },
  },
  {
    label: { zh: 'Study：对比预测和实际', en: 'Study: Compare prediction vs actual' },
    activePhase: 'study',
    content: {
      plan: {
        zh: '取消站会改 Slack 日报 → 预测每天多 30 分钟开发时间\n范围：后端组 4 人，两周',
        en: 'Replace standup with Slack daily → expect +30min dev time/day\nScope: backend team of 4, two weeks',
      },
      do_: { zh: '第一周有人忘记发日报\n第二周适应了', en: 'Week 1: some forgot to post\nWeek 2: adapted well' },
      study: {
        zh: '实际多了 25 分钟/人/天 ✓\n但出现 2 次信息遗漏导致重复工作 ✗',
        en: 'Actual: +25min/person/day ✓\nBut 2 info gaps caused rework ✗',
      },
      act: { zh: '', en: '' },
    },
  },
  {
    label: { zh: 'Act：决定下一步', en: 'Act: Decide next step' },
    activePhase: 'act',
    content: {
      plan: {
        zh: '取消站会改 Slack 日报 → 预测每天多 30 分钟开发时间\n范围：后端组 4 人，两周',
        en: 'Replace standup with Slack daily → expect +30min dev time/day\nScope: backend team of 4, two weeks',
      },
      do_: { zh: '第一周有人忘记发日报\n第二周适应了', en: 'Week 1: some forgot to post\nWeek 2: adapted well' },
      study: {
        zh: '实际多了 25 分钟/人/天 ✓\n但出现 2 次信息遗漏导致重复工作 ✗',
        en: 'Actual: +25min/person/day ✓\nBut 2 info gaps caused rework ✗',
      },
      act: {
        zh: '调整 → 保留异步日报 + 每周一次 15 分钟同步\n再试两周',
        en: 'Adjust → keep async daily + 1x weekly 15min sync\nTry for two more weeks',
      },
    },
  },
]

// ── Forecast ──────────────────────────────────────────────────────

export interface ForecastFrame extends AnimationFrame {
  prediction: I18n
  baseRate?: number
  adjustments: { factor: I18n; direction: 'up' | 'down' }[]
  finalProbability?: number
}

export const forecastFrames: ForecastFrame[] = [
  {
    label: { zh: '写出可验证的预测', en: 'Write verifiable prediction' },
    prediction: { zh: '竞品 X 在 3 个月内降价 ≥10%', en: 'Competitor X cuts price ≥10% within 3 months' },
    adjustments: [],
  },
  {
    label: { zh: '查找基准率', en: 'Find base rate' },
    prediction: { zh: '竞品 X 在 3 个月内降价 ≥10%', en: 'Competitor X cuts price ≥10% within 3 months' },
    baseRate: 15,
    adjustments: [],
  },
  {
    label: { zh: '根据特殊因素调整', en: 'Adjust for situation-specific factors' },
    prediction: { zh: '竞品 X 在 3 个月内降价 ≥10%', en: 'Competitor X cuts price ≥10% within 3 months' },
    baseRate: 15,
    adjustments: [
      { factor: { zh: '竞品刚融资，有钱打价格战', en: 'Just raised funds, can afford price war' }, direction: 'up' },
      { factor: { zh: '上季度利润下滑', en: 'Last quarter profit declined' }, direction: 'up' },
      {
        factor: { zh: '刚发高端新品，可能维持高价', en: 'Just launched premium product, may hold price' },
        direction: 'down',
      },
    ],
  },
  {
    label: { zh: '给出最终概率', en: 'State final probability' },
    prediction: { zh: '竞品 X 在 3 个月内降价 ≥10%', en: 'Competitor X cuts price ≥10% within 3 months' },
    baseRate: 15,
    adjustments: [
      { factor: { zh: '竞品刚融资，有钱打价格战', en: 'Just raised funds, can afford price war' }, direction: 'up' },
      { factor: { zh: '上季度利润下滑', en: 'Last quarter profit declined' }, direction: 'up' },
      {
        factor: { zh: '刚发高端新品，可能维持高价', en: 'Just launched premium product, may hold price' },
        direction: 'down',
      },
    ],
    finalProbability: 35,
  },
]

// ── PERT / CPM ────────────────────────────────────────────────────

export interface PertFrame extends AnimationFrame {
  tasks: {
    id: string
    name: I18n
    duration: number
    unit: I18n
    deps: string[]
    critical?: boolean
    es?: number
    ef?: number
    float?: number
  }[]
  criticalPath?: string[]
  totalDuration?: number
}

export const pertFrames: PertFrame[] = [
  {
    label: { zh: '列出婚礼筹备的所有任务', en: 'List all wedding prep tasks' },
    tasks: [
      { id: 'A', name: { zh: '选场地', en: 'Book venue' }, duration: 2, unit: { zh: '周', en: 'wk' }, deps: [] },
      { id: 'B', name: { zh: '定菜单', en: 'Plan menu' }, duration: 1, unit: { zh: '周', en: 'wk' }, deps: [] },
      { id: 'C', name: { zh: '发请帖', en: 'Send invites' }, duration: 1, unit: { zh: '周', en: 'wk' }, deps: [] },
      { id: 'D', name: { zh: '布置现场', en: 'Setup decor' }, duration: 2, unit: { zh: '周', en: 'wk' }, deps: [] },
      { id: 'E', name: { zh: '彩排', en: 'Rehearsal' }, duration: 1, unit: { zh: '周', en: 'wk' }, deps: [] },
    ],
  },
  {
    label: { zh: '标明依赖关系：什么必须先完成', en: 'Mark dependencies: what must finish first' },
    tasks: [
      { id: 'A', name: { zh: '选场地', en: 'Book venue' }, duration: 2, unit: { zh: '周', en: 'wk' }, deps: [] },
      { id: 'B', name: { zh: '定菜单', en: 'Plan menu' }, duration: 1, unit: { zh: '周', en: 'wk' }, deps: ['A'] },
      { id: 'C', name: { zh: '发请帖', en: 'Send invites' }, duration: 1, unit: { zh: '周', en: 'wk' }, deps: ['A'] },
      { id: 'D', name: { zh: '布置现场', en: 'Setup decor' }, duration: 2, unit: { zh: '周', en: 'wk' }, deps: ['A'] },
      {
        id: 'E',
        name: { zh: '彩排', en: 'Rehearsal' },
        duration: 1,
        unit: { zh: '周', en: 'wk' },
        deps: ['B', 'C', 'D'],
      },
    ],
  },
  {
    label: { zh: '正向推算：最早开始/最早结束', en: 'Forward pass: earliest start/finish' },
    tasks: [
      {
        id: 'A',
        name: { zh: '选场地', en: 'Book venue' },
        duration: 2,
        unit: { zh: '周', en: 'wk' },
        deps: [],
        es: 0,
        ef: 2,
      },
      {
        id: 'B',
        name: { zh: '定菜单', en: 'Plan menu' },
        duration: 1,
        unit: { zh: '周', en: 'wk' },
        deps: ['A'],
        es: 2,
        ef: 3,
      },
      {
        id: 'C',
        name: { zh: '发请帖', en: 'Send invites' },
        duration: 1,
        unit: { zh: '周', en: 'wk' },
        deps: ['A'],
        es: 2,
        ef: 3,
      },
      {
        id: 'D',
        name: { zh: '布置现场', en: 'Setup decor' },
        duration: 2,
        unit: { zh: '周', en: 'wk' },
        deps: ['A'],
        es: 2,
        ef: 4,
      },
      {
        id: 'E',
        name: { zh: '彩排', en: 'Rehearsal' },
        duration: 1,
        unit: { zh: '周', en: 'wk' },
        deps: ['B', 'C', 'D'],
        es: 4,
        ef: 5,
      },
    ],
  },
  {
    label: { zh: '找关键路径：浮动时间为 0 的任务', en: 'Find critical path: tasks with zero float' },
    tasks: [
      {
        id: 'A',
        name: { zh: '选场地', en: 'Book venue' },
        duration: 2,
        unit: { zh: '周', en: 'wk' },
        deps: [],
        critical: true,
        es: 0,
        ef: 2,
        float: 0,
      },
      {
        id: 'B',
        name: { zh: '定菜单', en: 'Plan menu' },
        duration: 1,
        unit: { zh: '周', en: 'wk' },
        deps: ['A'],
        critical: false,
        es: 2,
        ef: 3,
        float: 1,
      },
      {
        id: 'C',
        name: { zh: '发请帖', en: 'Send invites' },
        duration: 1,
        unit: { zh: '周', en: 'wk' },
        deps: ['A'],
        critical: false,
        es: 2,
        ef: 3,
        float: 1,
      },
      {
        id: 'D',
        name: { zh: '布置现场', en: 'Setup decor' },
        duration: 2,
        unit: { zh: '周', en: 'wk' },
        deps: ['A'],
        critical: true,
        es: 2,
        ef: 4,
        float: 0,
      },
      {
        id: 'E',
        name: { zh: '彩排', en: 'Rehearsal' },
        duration: 1,
        unit: { zh: '周', en: 'wk' },
        deps: ['B', 'C', 'D'],
        critical: true,
        es: 4,
        ef: 5,
        float: 0,
      },
    ],
    criticalPath: ['A', 'D', 'E'],
    totalDuration: 5,
  },
]

// ── Registry ──────────────────────────────────────────────────────

export type AnyAnimationFrame =
  | FishboneFrame
  | FiveWhyFrame
  | AbcFrame
  | KjFrame
  | CausalGraphFrame
  | McdaFrame
  | ValueAnalysisFrame
  | FmeaFrame
  | DmaicFrame
  | PdsaFrame
  | ForecastFrame
  | PertFrame

export const animationRegistry: Record<MethodId, AnyAnimationFrame[]> = {
  fishbone: fishboneFrames,
  'five-why': fiveWhyFrames,
  abc: abcFrames,
  kj: kjFrames,
  'causal-graph': causalGraphFrames,
  mcda: mcdaFrames,
  'value-analysis': valueAnalysisFrames,
  fmea: fmeaFrames,
  dmaic: dmaicFrames,
  pdsa: pdsaFrames,
  forecast: forecastFrames,
  pert: pertFrames,
}
