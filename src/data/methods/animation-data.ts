import type { MethodId } from '../domain'

export interface AnimationFrame {
  label: { zh: string; en: string }
}

// ── Fishbone ──────────────────────────────────────────────────────

export interface FishboneFrame extends AnimationFrame {
  head: string
  categories: {
    name: string
    causes: { text: string; sub?: string }[]
    highlighted?: boolean
  }[]
}

export const fishboneFrames: FishboneFrame[] = [
  {
    label: { zh: '写下问题（鱼头）', en: 'Write the problem (fish head)' },
    head: '订单取消率翻倍',
    categories: [],
  },
  {
    label: { zh: '添加第一个分类：人', en: 'Add first category: People' },
    head: '订单取消率翻倍',
    categories: [{ name: '人', causes: [] }],
  },
  {
    label: { zh: '在"人"下列出原因', en: 'List causes under People' },
    head: '订单取消率翻倍',
    categories: [
      {
        name: '人',
        causes: [{ text: '客服响应慢', sub: '新客服缺少培训' }],
      },
    ],
  },
  {
    label: { zh: '添加"机"分类', en: 'Add Machine category' },
    head: '订单取消率翻倍',
    categories: [
      {
        name: '人',
        causes: [{ text: '客服响应慢', sub: '新客服缺少培训' }],
      },
      { name: '机', causes: [] },
    ],
  },
  {
    label: { zh: '在"机"下列出原因', en: 'List causes under Machine' },
    head: '订单取消率翻倍',
    categories: [
      {
        name: '人',
        causes: [{ text: '客服响应慢', sub: '新客服缺少培训' }],
      },
      {
        name: '机',
        causes: [{ text: '支付接口超时', sub: '网关上周升级' }],
      },
    ],
  },
  {
    label: { zh: '添加"料"分类和原因', en: 'Add Material category and causes' },
    head: '订单取消率翻倍',
    categories: [
      {
        name: '人',
        causes: [{ text: '客服响应慢', sub: '新客服缺少培训' }],
      },
      {
        name: '机',
        causes: [{ text: '支付接口超时', sub: '网关上周升级' }],
      },
      {
        name: '料',
        causes: [{ text: '热门商品缺货', sub: '库存同步延迟' }],
      },
    ],
  },
  {
    label: { zh: '添加"法"分类和原因', en: 'Add Method category and causes' },
    head: '订单取消率翻倍',
    categories: [
      {
        name: '人',
        causes: [{ text: '客服响应慢', sub: '新客服缺少培训' }],
      },
      {
        name: '机',
        causes: [{ text: '支付接口超时', sub: '网关上周升级' }],
      },
      {
        name: '料',
        causes: [{ text: '热门商品缺货', sub: '库存同步延迟' }],
      },
      {
        name: '法',
        causes: [{ text: '满减规则复杂', sub: '未做用户测试' }],
      },
    ],
  },
  {
    label: { zh: '添加"环"分类和原因', en: 'Add Environment category and causes' },
    head: '订单取消率翻倍',
    categories: [
      {
        name: '人',
        causes: [{ text: '客服响应慢', sub: '新客服缺少培训' }],
      },
      {
        name: '机',
        causes: [{ text: '支付接口超时', sub: '网关上周升级' }],
      },
      {
        name: '料',
        causes: [{ text: '热门商品缺货', sub: '库存同步延迟' }],
      },
      {
        name: '法',
        causes: [{ text: '满减规则复杂', sub: '未做用户测试' }],
      },
      {
        name: '环',
        causes: [{ text: '竞品大促', sub: '价格竞争力下降' }],
      },
    ],
  },
  {
    label: { zh: '标记重点验证方向', en: 'Mark priority causes for verification' },
    head: '订单取消率翻倍',
    categories: [
      {
        name: '人',
        causes: [{ text: '客服响应慢', sub: '新客服缺少培训' }],
        highlighted: true,
      },
      {
        name: '机',
        causes: [{ text: '支付接口超时', sub: '网关上周升级' }],
        highlighted: true,
      },
      {
        name: '料',
        causes: [{ text: '热门商品缺货', sub: '库存同步延迟' }],
        highlighted: true,
      },
      {
        name: '法',
        causes: [{ text: '满减规则复杂', sub: '未做用户测试' }],
      },
      {
        name: '环',
        causes: [{ text: '竞品大促', sub: '价格竞争力下降' }],
      },
    ],
  },
]

// ── Five Whys ─────────────────────────────────────────────────────

export interface FiveWhyFrame extends AnimationFrame {
  problem: string
  whys: { question: string; answer: string }[]
  rootCause?: string
}

export const fiveWhyFrames: FiveWhyFrame[] = [
  {
    label: { zh: '写下可观察的问题', en: 'State the observable problem' },
    problem: '新员工 3 个月内离职率 35%',
    whys: [],
  },
  {
    label: { zh: 'Why 1：为什么离职？', en: 'Why 1: Why do they leave?' },
    problem: '新员工 3 个月内离职率 35%',
    whys: [{ question: '为什么离职？', answer: '工作内容和预期不符' }],
  },
  {
    label: { zh: 'Why 2：为什么不符？', en: 'Why 2: Why the mismatch?' },
    problem: '新员工 3 个月内离职率 35%',
    whys: [
      { question: '为什么离职？', answer: '工作内容和预期不符' },
      { question: '为什么不符？', answer: 'JD 写"产品设计"，实际做"运营支持"' },
    ],
  },
  {
    label: { zh: 'Why 3：为什么 JD 不准确？', en: 'Why 3: Why is the JD wrong?' },
    problem: '新员工 3 个月内离职率 35%',
    whys: [
      { question: '为什么离职？', answer: '工作内容和预期不符' },
      { question: '为什么不符？', answer: 'JD 写"产品设计"，实际做"运营支持"' },
      { question: '为什么 JD 不准确？', answer: 'JD 是 2 年前写的，岗位已变化' },
    ],
  },
  {
    label: { zh: 'Why 4：为什么没更新？', en: "Why 4: Why wasn't it updated?" },
    problem: '新员工 3 个月内离职率 35%',
    whys: [
      { question: '为什么离职？', answer: '工作内容和预期不符' },
      { question: '为什么不符？', answer: 'JD 写"产品设计"，实际做"运营支持"' },
      { question: '为什么 JD 不准确？', answer: 'JD 是 2 年前写的，岗位已变化' },
      { question: '为什么没更新？', answer: '没有人负责定期审核 JD' },
    ],
  },
  {
    label: { zh: 'Why 5：找到根因', en: 'Why 5: Root cause found' },
    problem: '新员工 3 个月内离职率 35%',
    whys: [
      { question: '为什么离职？', answer: '工作内容和预期不符' },
      { question: '为什么不符？', answer: 'JD 写"产品设计"，实际做"运营支持"' },
      { question: '为什么 JD 不准确？', answer: 'JD 是 2 年前写的，岗位已变化' },
      { question: '为什么没更新？', answer: '没有人负责定期审核 JD' },
      { question: '为什么没有这个流程？', answer: 'HR 缺少 JD 审核制度' },
    ],
    rootCause: '每季度由用人经理和 HR 共同审核 JD',
  },
]

// ── ABC / Pareto ──────────────────────────────────────────────────

export interface AbcFrame extends AnimationFrame {
  metric: string
  items: { name: string; value: number; cumPct: number; grade: 'A' | 'B' | 'C' }[]
  conclusion?: string
}

export const abcFrames: AbcFrame[] = [
  {
    label: { zh: '列出所有产品', en: 'List all products' },
    metric: '月销量（杯）',
    items: [
      { name: '杨枝甘露', value: 3200, cumPct: 0, grade: 'A' },
      { name: '珍珠奶茶', value: 2800, cumPct: 0, grade: 'A' },
      { name: '芒果冰沙', value: 2100, cumPct: 0, grade: 'A' },
      { name: '柠檬茶', value: 1500, cumPct: 0, grade: 'A' },
      { name: '抹茶拿铁', value: 1200, cumPct: 0, grade: 'A' },
      { name: '其他 20 种', value: 3800, cumPct: 0, grade: 'C' },
    ],
  },
  {
    label: { zh: '按销量从大到小排序', en: 'Sort by sales, descending' },
    metric: '月销量（杯）',
    items: [
      { name: '杨枝甘露', value: 3200, cumPct: 22, grade: 'A' },
      { name: '珍珠奶茶', value: 2800, cumPct: 41, grade: 'A' },
      { name: '芒果冰沙', value: 2100, cumPct: 55, grade: 'A' },
      { name: '柠檬茶', value: 1500, cumPct: 65, grade: 'A' },
      { name: '抹茶拿铁', value: 1200, cumPct: 73, grade: 'A' },
      { name: '其他 20 种', value: 3800, cumPct: 100, grade: 'C' },
    ],
  },
  {
    label: { zh: '计算累计占比', en: 'Calculate cumulative share' },
    metric: '月销量（杯）',
    items: [
      { name: '杨枝甘露', value: 3200, cumPct: 22, grade: 'A' },
      { name: '珍珠奶茶', value: 2800, cumPct: 41, grade: 'A' },
      { name: '芒果冰沙', value: 2100, cumPct: 55, grade: 'A' },
      { name: '柠檬茶', value: 1500, cumPct: 65, grade: 'A' },
      { name: '抹茶拿铁', value: 1200, cumPct: 73, grade: 'A' },
      { name: '其他 20 种', value: 3800, cumPct: 100, grade: 'C' },
    ],
  },
  {
    label: { zh: '划分 A/B/C 类', en: 'Classify into A/B/C' },
    metric: '月销量（杯）',
    items: [
      { name: '杨枝甘露', value: 3200, cumPct: 22, grade: 'A' },
      { name: '珍珠奶茶', value: 2800, cumPct: 41, grade: 'A' },
      { name: '芒果冰沙', value: 2100, cumPct: 55, grade: 'A' },
      { name: '柠檬茶', value: 1500, cumPct: 65, grade: 'A' },
      { name: '抹茶拿铁', value: 1200, cumPct: 73, grade: 'A' },
      { name: '其他 20 种', value: 3800, cumPct: 100, grade: 'C' },
    ],
    conclusion: '前 5 种产品（20%）贡献 73% 销量 → A 类优先备货',
  },
]

// ── KJ / Affinity ─────────────────────────────────────────────────

export interface KjFrame extends AnimationFrame {
  cards: { text: string; group?: string }[]
  groups: { name: string; count: number }[]
}

export const kjFrames: KjFrame[] = [
  {
    label: { zh: '写出所有卡片', en: 'Write all cards' },
    cards: [
      { text: '加载太慢' },
      { text: '找不到退款入口' },
      { text: '推送太多' },
      { text: '闪退' },
      { text: '客服不回复' },
      { text: '卡顿' },
      { text: '设置页找不到' },
      { text: '广告弹窗' },
      { text: '回复慢' },
      { text: '态度差' },
      { text: '历史订单找不到' },
      { text: '通知关不掉' },
    ],
    groups: [],
  },
  {
    label: { zh: '开始自然分组', en: 'Begin natural grouping' },
    cards: [
      { text: '加载太慢', group: '性能问题' },
      { text: '闪退', group: '性能问题' },
      { text: '卡顿', group: '性能问题' },
      { text: '找不到退款入口' },
      { text: '推送太多' },
      { text: '客服不回复' },
      { text: '设置页找不到' },
      { text: '广告弹窗' },
      { text: '回复慢' },
      { text: '态度差' },
      { text: '历史订单找不到' },
      { text: '通知关不掉' },
    ],
    groups: [{ name: '性能问题', count: 3 }],
  },
  {
    label: { zh: '继续分组', en: 'Continue grouping' },
    cards: [
      { text: '加载太慢', group: '性能问题' },
      { text: '闪退', group: '性能问题' },
      { text: '卡顿', group: '性能问题' },
      { text: '找不到退款入口', group: '功能找不到' },
      { text: '设置页找不到', group: '功能找不到' },
      { text: '历史订单找不到', group: '功能找不到' },
      { text: '推送太多', group: '骚扰感' },
      { text: '广告弹窗', group: '骚扰感' },
      { text: '通知关不掉', group: '骚扰感' },
      { text: '客服不回复', group: '客服体验' },
      { text: '回复慢', group: '客服体验' },
      { text: '态度差', group: '客服体验' },
    ],
    groups: [
      { name: '性能问题', count: 3 },
      { name: '功能找不到', count: 3 },
      { name: '骚扰感', count: 3 },
      { name: '客服体验', count: 3 },
    ],
  },
  {
    label: { zh: '命名主题，得出结论', en: 'Name themes and conclude' },
    cards: [
      { text: '加载太慢', group: '性能问题' },
      { text: '闪退', group: '性能问题' },
      { text: '卡顿', group: '性能问题' },
      { text: '找不到退款入口', group: '功能找不到' },
      { text: '设置页找不到', group: '功能找不到' },
      { text: '历史订单找不到', group: '功能找不到' },
      { text: '推送太多', group: '骚扰感' },
      { text: '广告弹窗', group: '骚扰感' },
      { text: '通知关不掉', group: '骚扰感' },
      { text: '客服不回复', group: '客服体验' },
      { text: '回复慢', group: '客服体验' },
      { text: '态度差', group: '客服体验' },
    ],
    groups: [
      { name: '性能问题', count: 3 },
      { name: '功能找不到', count: 3 },
      { name: '骚扰感', count: 3 },
      { name: '客服体验', count: 3 },
    ],
  },
]

// ── Causal Graph ──────────────────────────────────────────────────

export interface CausalGraphFrame extends AnimationFrame {
  nodes: { id: string; label: string; type: 'factor' | 'outcome' | 'confounder' }[]
  edges: { from: string; to: string; verified: boolean }[]
}

export const causalGraphFrames: CausalGraphFrame[] = [
  {
    label: { zh: '列出关键变量', en: 'List key variables' },
    nodes: [
      { id: 'training', label: '参加培训', type: 'factor' },
      { id: 'performance', label: '高绩效', type: 'outcome' },
    ],
    edges: [],
  },
  {
    label: { zh: '画出假设的因果方向', en: 'Draw assumed causal direction' },
    nodes: [
      { id: 'training', label: '参加培训', type: 'factor' },
      { id: 'performance', label: '高绩效', type: 'outcome' },
    ],
    edges: [{ from: 'training', to: 'performance', verified: false }],
  },
  {
    label: { zh: '发现混杂变量', en: 'Discover confounder' },
    nodes: [
      { id: 'training', label: '参加培训', type: 'factor' },
      { id: 'performance', label: '高绩效', type: 'outcome' },
      { id: 'motivation', label: '上进心', type: 'confounder' },
    ],
    edges: [{ from: 'training', to: 'performance', verified: false }],
  },
  {
    label: { zh: '画出混杂变量的影响', en: 'Draw confounder influence' },
    nodes: [
      { id: 'training', label: '参加培训', type: 'factor' },
      { id: 'performance', label: '高绩效', type: 'outcome' },
      { id: 'motivation', label: '上进心', type: 'confounder' },
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
  criteria: { name: string; weight: number }[]
  options: { name: string; scores: number[]; total?: number }[]
  winner?: string
}

export const mcdaFrames: McdaFrame[] = [
  {
    label: { zh: '列出候选方案', en: 'List options' },
    criteria: [],
    options: [
      { name: 'A（贵但全）', scores: [] },
      { name: 'B（便宜少）', scores: [] },
      { name: 'C（开源）', scores: [] },
    ],
  },
  {
    label: { zh: '确定评价标准和权重', en: 'Define criteria and weights' },
    criteria: [
      { name: '功能', weight: 40 },
      { name: '成本', weight: 30 },
      { name: '维护', weight: 20 },
      { name: '学习', weight: 10 },
    ],
    options: [
      { name: 'A（贵但全）', scores: [] },
      { name: 'B（便宜少）', scores: [] },
      { name: 'C（开源）', scores: [] },
    ],
  },
  {
    label: { zh: '逐个打分', en: 'Score each option' },
    criteria: [
      { name: '功能', weight: 40 },
      { name: '成本', weight: 30 },
      { name: '维护', weight: 20 },
      { name: '学习', weight: 10 },
    ],
    options: [
      { name: 'A（贵但全）', scores: [9, 3, 8, 7] },
      { name: 'B（便宜少）', scores: [5, 9, 8, 9] },
      { name: 'C（开源）', scores: [7, 10, 3, 4] },
    ],
  },
  {
    label: { zh: '计算加权总分并排序', en: 'Calculate weighted totals and rank' },
    criteria: [
      { name: '功能', weight: 40 },
      { name: '成本', weight: 30 },
      { name: '维护', weight: 20 },
      { name: '学习', weight: 10 },
    ],
    options: [
      { name: 'A（贵但全）', scores: [9, 3, 8, 7], total: 6.8 },
      { name: 'B（便宜少）', scores: [5, 9, 8, 9], total: 7.2 },
      { name: 'C（开源）', scores: [7, 10, 3, 4], total: 6.8 },
    ],
    winner: 'B（便宜少）',
  },
]

// ── Value Analysis ────────────────────────────────────────────────

export interface ValueAnalysisFrame extends AnimationFrame {
  items: { name: string; cost: string; contribution: 'high' | 'medium' | 'low'; decision?: string }[]
  saving?: string
}

export const valueAnalysisFrames: ValueAnalysisFrame[] = [
  {
    label: { zh: '列出所有订阅和成本', en: 'List all subscriptions and costs' },
    items: [
      { name: '视频会员', cost: '¥25', contribution: 'high' },
      { name: '音乐会员', cost: '¥15', contribution: 'high' },
      { name: '云存储', cost: '¥20', contribution: 'medium' },
      { name: '健身 App', cost: '¥50', contribution: 'low' },
      { name: 'AI 工具 A', cost: '¥200', contribution: 'medium' },
      { name: '杂志订阅', cost: '¥190', contribution: 'low' },
    ],
  },
  {
    label: { zh: '评估贡献度', en: 'Rate contribution' },
    items: [
      { name: '视频会员', cost: '¥25', contribution: 'high' },
      { name: '音乐会员', cost: '¥15', contribution: 'high' },
      { name: '云存储', cost: '¥20', contribution: 'medium' },
      { name: '健身 App', cost: '¥50', contribution: 'low' },
      { name: 'AI 工具 A', cost: '¥200', contribution: 'medium' },
      { name: '杂志订阅', cost: '¥190', contribution: 'low' },
    ],
  },
  {
    label: { zh: '标记并决策', en: 'Flag and decide' },
    items: [
      { name: '视频会员', cost: '¥25', contribution: 'high', decision: '保留' },
      { name: '音乐会员', cost: '¥15', contribution: 'high', decision: '保留' },
      { name: '云存储', cost: '¥20', contribution: 'medium', decision: '保留' },
      { name: '健身 App', cost: '¥50', contribution: 'low', decision: '砍掉' },
      { name: 'AI 工具 A', cost: '¥200', contribution: 'medium', decision: '替换 → ¥60' },
      { name: '杂志订阅', cost: '¥190', contribution: 'low', decision: '砍掉' },
    ],
    saving: '月省 ¥380（76%）',
  },
]

// ── FMEA ──────────────────────────────────────────────────────────

export interface FmeaFrame extends AnimationFrame {
  items: { mode: string; effect: string; s: number; o: number; d: number; rpn: number; mitigation?: string }[]
  sorted?: boolean
}

export const fmeaFrames: FmeaFrame[] = [
  {
    label: { zh: '列出失效模式', en: 'List failure modes' },
    items: [
      { mode: '支付 API 超时', effect: '付款失败', s: 9, o: 4, d: 3, rpn: 0 },
      { mode: '金额精度错误', effect: '多扣/少扣', s: 10, o: 2, d: 2, rpn: 0 },
      { mode: '并发重复扣款', effect: '用户投诉', s: 9, o: 3, d: 5, rpn: 0 },
      { mode: '回滚失败', effect: '长时间故障', s: 8, o: 2, d: 6, rpn: 0 },
    ],
  },
  {
    label: { zh: '打 S/O/D 分', en: 'Score S/O/D' },
    items: [
      { mode: '支付 API 超时', effect: '付款失败', s: 9, o: 4, d: 3, rpn: 108 },
      { mode: '金额精度错误', effect: '多扣/少扣', s: 10, o: 2, d: 2, rpn: 40 },
      { mode: '并发重复扣款', effect: '用户投诉', s: 9, o: 3, d: 5, rpn: 135 },
      { mode: '回滚失败', effect: '长时间故障', s: 8, o: 2, d: 6, rpn: 96 },
    ],
  },
  {
    label: { zh: '按 RPN 排序，制定措施', en: 'Sort by RPN, define mitigations' },
    items: [
      { mode: '并发重复扣款', effect: '用户投诉', s: 9, o: 3, d: 5, rpn: 135, mitigation: '加幂等锁' },
      { mode: '支付 API 超时', effect: '付款失败', s: 9, o: 4, d: 3, rpn: 108, mitigation: '重试 + 备用通道' },
      { mode: '回滚失败', effect: '长时间故障', s: 8, o: 2, d: 6, rpn: 96, mitigation: '灰度发布 + 演练' },
      { mode: '金额精度错误', effect: '多扣/少扣', s: 10, o: 2, d: 2, rpn: 40, mitigation: '边界值测试' },
    ],
    sorted: true,
  },
]

// ── DMAIC ─────────────────────────────────────────────────────────

export interface DmaicFrame extends AnimationFrame {
  phases: { name: string; content: string; active: boolean }[]
}

export const dmaicFrames: DmaicFrame[] = [
  {
    label: { zh: 'Define：定义问题', en: 'Define: State the problem' },
    phases: [
      { name: 'Define', content: '响应时间从 48h 降到 12h，影响所有付费用户', active: true },
      { name: 'Measure', content: '', active: false },
      { name: 'Analyze', content: '', active: false },
      { name: 'Improve', content: '', active: false },
      { name: 'Control', content: '', active: false },
    ],
  },
  {
    label: { zh: 'Measure：测量现状', en: 'Measure: Collect baseline' },
    phases: [
      { name: 'Define', content: '响应时间从 48h 降到 12h，影响所有付费用户', active: false },
      { name: 'Measure', content: '中位数 52h，P90 = 96h，周一最严重', active: true },
      { name: 'Analyze', content: '', active: false },
      { name: 'Improve', content: '', active: false },
      { name: 'Control', content: '', active: false },
    ],
  },
  {
    label: { zh: 'Analyze：分析根因', en: 'Analyze: Find root causes' },
    phases: [
      { name: 'Define', content: '响应时间从 48h 降到 12h，影响所有付费用户', active: false },
      { name: 'Measure', content: '中位数 52h，P90 = 96h，周一最严重', active: false },
      { name: 'Analyze', content: '周末无人值班 + 工单分配不均', active: true },
      { name: 'Improve', content: '', active: false },
      { name: 'Control', content: '', active: false },
    ],
  },
  {
    label: { zh: 'Improve：实施改进', en: 'Improve: Implement changes' },
    phases: [
      { name: 'Define', content: '响应时间从 48h 降到 12h，影响所有付费用户', active: false },
      { name: 'Measure', content: '中位数 52h，P90 = 96h，周一最严重', active: false },
      { name: 'Analyze', content: '周末无人值班 + 工单分配不均', active: false },
      { name: 'Improve', content: '增加周末轮班 + 自动按技能分配 + SLA 警报', active: true },
      { name: 'Control', content: '', active: false },
    ],
  },
  {
    label: { zh: 'Control：固化成果', en: 'Control: Sustain gains' },
    phases: [
      { name: 'Define', content: '响应时间从 48h 降到 12h，影响所有付费用户', active: false },
      { name: 'Measure', content: '中位数 52h，P90 = 96h，周一最严重', active: false },
      { name: 'Analyze', content: '周末无人值班 + 工单分配不均', active: false },
      { name: 'Improve', content: '增加周末轮班 + 自动按技能分配 + SLA 警报', active: false },
      { name: 'Control', content: '每日看板监控，超 24h 自动升级 → 中位数降到 14h', active: true },
    ],
  },
]

// ── PDSA ──────────────────────────────────────────────────────────

export interface PdsaFrame extends AnimationFrame {
  activePhase: 'plan' | 'do' | 'study' | 'act'
  content: { plan: string; do_: string; study: string; act: string }
}

export const pdsaFrames: PdsaFrame[] = [
  {
    label: { zh: 'Plan：写下假设和预测', en: 'Plan: Write hypothesis' },
    activePhase: 'plan',
    content: {
      plan: '取消站会改 Slack 日报 → 预测每天多 30 分钟开发时间\n范围：后端组 4 人，两周',
      do_: '',
      study: '',
      act: '',
    },
  },
  {
    label: { zh: 'Do：小范围执行', en: 'Do: Execute in small scope' },
    activePhase: 'do',
    content: {
      plan: '取消站会改 Slack 日报 → 预测每天多 30 分钟开发时间\n范围：后端组 4 人，两周',
      do_: '第一周有人忘记发日报\n第二周适应了',
      study: '',
      act: '',
    },
  },
  {
    label: { zh: 'Study：对比预测和实际', en: 'Study: Compare prediction vs actual' },
    activePhase: 'study',
    content: {
      plan: '取消站会改 Slack 日报 → 预测每天多 30 分钟开发时间\n范围：后端组 4 人，两周',
      do_: '第一周有人忘记发日报\n第二周适应了',
      study: '实际多了 25 分钟/人/天 ✓\n但出现 2 次信息遗漏导致重复工作 ✗',
      act: '',
    },
  },
  {
    label: { zh: 'Act：决定下一步', en: 'Act: Decide next step' },
    activePhase: 'act',
    content: {
      plan: '取消站会改 Slack 日报 → 预测每天多 30 分钟开发时间\n范围：后端组 4 人，两周',
      do_: '第一周有人忘记发日报\n第二周适应了',
      study: '实际多了 25 分钟/人/天 ✓\n但出现 2 次信息遗漏导致重复工作 ✗',
      act: '调整 → 保留异步日报 + 每周一次 15 分钟同步\n再试两周',
    },
  },
]

// ── Forecast ──────────────────────────────────────────────────────

export interface ForecastFrame extends AnimationFrame {
  prediction: string
  baseRate?: number
  adjustments: { factor: string; direction: 'up' | 'down' }[]
  finalProbability?: number
}

export const forecastFrames: ForecastFrame[] = [
  {
    label: { zh: '写出可验证的预测', en: 'Write verifiable prediction' },
    prediction: '竞品 X 在 3 个月内降价 ≥10%',
    adjustments: [],
  },
  {
    label: { zh: '查找基准率', en: 'Find base rate' },
    prediction: '竞品 X 在 3 个月内降价 ≥10%',
    baseRate: 15,
    adjustments: [],
  },
  {
    label: { zh: '根据特殊因素调整', en: 'Adjust for situation-specific factors' },
    prediction: '竞品 X 在 3 个月内降价 ≥10%',
    baseRate: 15,
    adjustments: [
      { factor: '竞品刚融资，有钱打价格战', direction: 'up' },
      { factor: '上季度利润下滑', direction: 'up' },
      { factor: '刚发高端新品，可能维持高价', direction: 'down' },
    ],
  },
  {
    label: { zh: '给出最终概率', en: 'State final probability' },
    prediction: '竞品 X 在 3 个月内降价 ≥10%',
    baseRate: 15,
    adjustments: [
      { factor: '竞品刚融资，有钱打价格战', direction: 'up' },
      { factor: '上季度利润下滑', direction: 'up' },
      { factor: '刚发高端新品，可能维持高价', direction: 'down' },
    ],
    finalProbability: 35,
  },
]

// ── PERT / CPM ────────────────────────────────────────────────────

export interface PertFrame extends AnimationFrame {
  tasks: { id: string; name: string; duration: number; deps: string[]; critical?: boolean; float?: number }[]
  criticalPath?: string[]
  totalDuration?: number
}

export const pertFrames: PertFrame[] = [
  {
    label: { zh: '列出所有任务', en: 'List all tasks' },
    tasks: [
      { id: 'A', name: '需求确认', duration: 1, deps: [] },
      { id: 'B', name: 'UI 设计', duration: 2, deps: [] },
      { id: 'C', name: '后端开发', duration: 4, deps: [] },
      { id: 'D', name: '前端开发', duration: 3, deps: [] },
      { id: 'E', name: '联调测试', duration: 1, deps: [] },
      { id: 'F', name: '修复上线', duration: 1, deps: [] },
    ],
  },
  {
    label: { zh: '标明依赖关系', en: 'Mark dependencies' },
    tasks: [
      { id: 'A', name: '需求确认', duration: 1, deps: [] },
      { id: 'B', name: 'UI 设计', duration: 2, deps: ['A'] },
      { id: 'C', name: '后端开发', duration: 4, deps: ['A'] },
      { id: 'D', name: '前端开发', duration: 3, deps: ['B'] },
      { id: 'E', name: '联调测试', duration: 1, deps: ['C', 'D'] },
      { id: 'F', name: '修复上线', duration: 1, deps: ['E'] },
    ],
  },
  {
    label: { zh: '找出关键路径', en: 'Find critical path' },
    tasks: [
      { id: 'A', name: '需求确认', duration: 1, deps: [], critical: true, float: 0 },
      { id: 'B', name: 'UI 设计', duration: 2, deps: ['A'], critical: true, float: 0 },
      { id: 'C', name: '后端开发', duration: 4, deps: ['A'], critical: false, float: 1 },
      { id: 'D', name: '前端开发', duration: 3, deps: ['B'], critical: true, float: 0 },
      { id: 'E', name: '联调测试', duration: 1, deps: ['C', 'D'], critical: true, float: 0 },
      { id: 'F', name: '修复上线', duration: 1, deps: ['E'], critical: true, float: 0 },
    ],
    criticalPath: ['A', 'B', 'D', 'E', 'F'],
    totalDuration: 8,
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
