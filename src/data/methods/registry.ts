import type { MethodId, TaskType } from '../domain'

export interface LocalizedText {
  zh: string
  en: string
}

export interface MethodSpec {
  id: MethodId
  name: LocalizedText
  purpose: LocalizedText
  taskTypes: TaskType[]
  /** 方法的完整介绍：起源、核心思想、适用场景。 */
  introduction: LocalizedText
  /** 什么时候该用这个方法——具体的触发信号。 */
  whenToUse: LocalizedText
  /** 什么时候不该用——常见的误用场景。 */
  whenNotToUse: LocalizedText
  /** 与易混淆方法的对比：关键区别在哪。 */
  vsOtherMethods: LocalizedText
  /** 运行该方法前必须先补齐的条件（也是动态问题的生成依据）。 */
  requiredInputs: LocalizedText[]
  /** 具体的操作步骤说明。 */
  steps: LocalizedText[]
  outputs: LocalizedText[]
  /** 误用边界，界面上必须随方法一起展示。 */
  caution: LocalizedText
  /** 一句话示例场景，帮助用户理解什么时候用这个方法。 */
  example: LocalizedText
  /** 完整的示例演练：用一个具体场景演示怎么用这个方法。 */
  exampleWalkthrough: LocalizedText
  depth: 'interactive' | 'guided'
}

export const methodRegistry: readonly MethodSpec[] = [
  {
    id: 'fishbone',
    name: { zh: '鱼骨分析', en: 'Fishbone diagram' },
    purpose: { zh: '把问题按类别展开成候选原因树', en: 'Expand a problem into a tree of candidate causes by category' },
    taskTypes: ['diagnosis'],
    introduction: {
      zh: '鱼骨图（又称石川图、因果图）由日本质量管理专家石川馨于 1960 年代提出。核心思想是：面对一个问题时，不要急着猜答案，而是先按「人、机、料、法、环、测」等类别系统地展开所有可能的原因。它的价值在于防止遗漏——团队往往只关注最显眼的原因，鱼骨图强制你扫描每个类别。适合问题刚出现、原因不明确、需要头脑风暴列出候选原因的阶段。',
      en: "The fishbone diagram (also called Ishikawa or cause-and-effect diagram) was developed by Kaoru Ishikawa in the 1960s. The core idea: when facing a problem, don't jump to conclusions—systematically list all possible causes organized by categories such as People, Machine, Material, Method, Environment, and Measurement. Its value lies in preventing blind spots: teams tend to fixate on the most obvious cause, and the fishbone forces you to scan every category. Best used when a problem has just surfaced, root causes are unclear, and you need structured brainstorming.",
    },
    whenToUse: {
      zh: '问题刚出现，你还不确定原因在哪个方向；需要带团队一起发散思考；担心遗漏了某类原因。触发信号："我们只是在猜"、"每个人说的原因都不一样"、"上次修了没用，可能不是那个原因"。',
      en: 'A problem just appeared and you\'re unsure which direction the cause lies; you need the team to brainstorm broadly; you worry about blind spots. Trigger signals: "we\'re just guessing," "everyone has a different theory," "last fix didn\'t work—maybe wrong root cause."',
    },
    whenNotToUse: {
      zh: '原因已经很明确（比如日志直接报了错误行），不需要发散。或者问题太笼统还没定义清楚——先定义问题再画鱼骨。问题有 20+ 个变量互相缠绕时，鱼骨图的树状结构不够用，考虑因果图。',
      en: 'The cause is already clear (e.g., logs show the exact error line)—no need to brainstorm. Or the problem is too vague to define—define it first. When 20+ variables are intertwined, the tree structure is insufficient—consider a causal graph instead.',
    },
    vsOtherMethods: {
      zh: '鱼骨图 vs 5 Why：鱼骨是"广度优先"（列出所有可能方向），5 Why 是"深度优先"（沿一条线追到底）。通常先鱼骨找到 3-5 个候选方向，再对最可疑的那条用 5 Why 深挖。\n鱼骨图 vs 因果图：鱼骨是单向的（原因→问题），因果图允许变量之间互相影响和环路。',
      en: 'Fishbone vs 5 Whys: Fishbone is "breadth-first" (list all possible directions), 5 Whys is "depth-first" (drill one chain to the bottom). Typically use fishbone first to find 3-5 candidates, then 5 Whys on the most suspicious one.\nFishbone vs Causal graph: Fishbone is one-directional (causes→problem); causal graphs allow mutual influence and loops between variables.',
    },
    requiredInputs: [
      { zh: '要解释的异常或问题是什么', en: 'The problem or anomaly to explain' },
      { zh: '问题从什么时候开始、影响了哪些范围', en: 'When the problem started and what scope it affects' },
    ],
    steps: [
      {
        zh: '把问题写在鱼头（右侧），画一条主轴线',
        en: 'Write the problem at the fish head (right side), draw the main spine',
      },
      {
        zh: '确定分类骨架（如：人、机、料、法、环、测），画成分支',
        en: 'Define category bones (e.g., People, Machine, Material, Method, Environment, Measurement) as branches',
      },
      {
        zh: '在每个分支下头脑风暴可能的原因，写成子骨',
        en: 'Brainstorm possible causes under each branch, write as sub-bones',
      },
      {
        zh: '对每个原因追问"还有更深层的原因吗？"添加更细的分支',
        en: 'For each cause, ask "is there a deeper cause?" and add finer branches',
      },
      {
        zh: '标记出最可能的 3-5 个候选原因，用于后续验证',
        en: 'Mark the 3-5 most likely candidate causes for subsequent verification',
      },
    ],
    outputs: [{ zh: '按类别组织的候选原因树', en: 'Candidate cause tree organized by category' }],
    caution: {
      zh: '鱼骨分支只是候选原因，不能当作已证实的因果结论。',
      en: 'Branches are candidate causes only, never verified causal conclusions.',
    },
    example: {
      zh: '线上订单取消率本月突然翻倍，需要列出所有可能的原因类别。',
      en: 'Online order cancellation rate doubled this month; list all possible cause categories.',
    },
    exampleWalkthrough: {
      zh: '问题：某电商平台本月订单取消率从 5% 涨到 11%。\n\n鱼头：订单取消率翻倍\n\n人：客服响应慢导致用户等不及 → 新客服刚入职缺少培训\n机：支付接口超时率上升 → 第三方支付网关上周升级\n料：热门商品缺货但前端未及时下架 → 库存同步延迟\n法：满减活动规则复杂用户凑单后放弃 → 营销策略未做用户测试\n环：竞品同期大促吸走流量 → 价格竞争力下降\n\n标记重点验证：支付超时率、库存同步延迟、客服响应时间。',
      en: "Problem: An e-commerce platform's order cancellation rate rose from 5% to 11% this month.\n\nFish head: Order cancellation doubled\n\nPeople: Slow customer service → new hires lack training\nMachine: Payment timeout rate increased → 3rd-party gateway upgraded last week\nMaterial: Popular items out of stock but still listed → inventory sync delay\nMethod: Complex promotion rules → users abandon carts after failed bundling\nEnvironment: Competitor running major sale → price competitiveness dropped\n\nPriority for verification: payment timeout rate, inventory sync delay, customer service response time.",
    },
    depth: 'interactive',
  },
  {
    id: 'five-why',
    name: { zh: '5 Why 追问', en: '5 Whys' },
    purpose: {
      zh: '沿单条因果链向下追问，直到可行动的根因',
      en: 'Chase one causal chain down to an actionable root cause',
    },
    taskTypes: ['diagnosis'],
    introduction: {
      zh: '5 Why 由丰田生产系统创始人大野耐一推广，是精益管理的基础工具。核心逻辑：对一个问题反复问"为什么"（通常 5 次左右），穿透表面现象直达根因。它的前提是你已经锁定了一条可能的因果链（如鱼骨图筛选后的重点），需要深挖到可以直接行动的层面。注意：不是机械地问 5 次，而是每一层都用事实验证，问到"我可以对这个原因采取行动"为止。',
      en: 'The 5 Whys was popularized by Taiichi Ohno, father of the Toyota Production System. Core logic: repeatedly ask "why?" (typically around 5 times) to penetrate surface symptoms and reach the root cause. Prerequisite: you\'ve already identified a likely causal chain (e.g., from a fishbone analysis) and need to drill down to an actionable level. Note: it\'s not about mechanically asking 5 times—each layer must be fact-checked, and you stop when you reach a cause you can directly act on.',
    },
    whenToUse: {
      zh: '你已经有一个明确的嫌疑方向（比如鱼骨图筛出来的），但停在表面层——需要深挖到"我明天能做什么来解决它"的层面。触发信号："原因我知道，但感觉还不够深"、"修了表面问题但反复出现"。',
      en: 'You already have a suspected direction (e.g., from a fishbone) but are stuck at a surface level—need to drill to "what can I do tomorrow to fix this." Trigger signals: "I know the cause, but it feels too shallow," "fixed the surface issue but it keeps recurring."',
    },
    whenNotToUse: {
      zh: '你还没锁定方向（原因可能在多个完全不同的类别）——先用鱼骨图发散。或者问题涉及多个变量互相纠缠——5 Why 只能追一条线性链，处理不了网状因果。',
      en: "You haven't locked onto a direction yet (causes might be in multiple unrelated categories)—use fishbone first. Or the problem involves multiple intertwined variables—5 Whys only handles one linear chain, not a causal web.",
    },
    vsOtherMethods: {
      zh: '5 Why vs 鱼骨图：鱼骨是发散（"有哪些可能原因？"），5 Why 是收敛（"沿这条线，根因到底是什么？"）。两者是前后搭配关系。\n5 Why vs 因果图：5 Why 假设因果链是线性的（A→B→C），因果图允许 A 和 B 互相影响、有共同原因等复杂结构。简单问题用 5 Why，复杂系统用因果图。',
      en: '5 Whys vs Fishbone: Fishbone diverges ("what are all possible causes?"), 5 Whys converges ("down this line, what\'s the root?"). They\'re sequential partners.\n5 Whys vs Causal graph: 5 Whys assumes a linear chain (A→B→C); causal graphs allow mutual influence, common causes, and loops. Simple problems: 5 Whys. Complex systems: causal graph.',
    },
    requiredInputs: [
      { zh: '一个具体的、可观察的问题现象', en: 'One concrete, observable symptom' },
      { zh: '问题发生时的现场事实或记录', en: 'First-hand facts or records from when the problem occurred' },
    ],
    steps: [
      { zh: '写下具体的问题现象（可观察、可度量）', en: 'State the specific, observable, measurable problem' },
      {
        zh: '问"为什么会发生这个现象？"——用事实回答，不猜',
        en: 'Ask "Why did this happen?" — answer with facts, not guesses',
      },
      { zh: '对上一步的答案继续问"为什么？"', en: 'Ask "Why?" again on the previous answer' },
      {
        zh: '重复追问，直到答案是你可以直接采取行动改变的事情',
        en: 'Repeat until the answer is something you can directly act on',
      },
      {
        zh: '验证整条链：从根因出发正向推导，能否解释问题？',
        en: 'Verify: trace forward from root cause — does it explain the original problem?',
      },
    ],
    outputs: [{ zh: '若干条"现象 → 根因"的追问链', en: 'Several symptom-to-root-cause chains' }],
    caution: {
      zh: '每一层"为什么"都需要事实支撑，否则追问会退化成猜测。',
      en: 'Each "why" needs factual support, otherwise the chain degrades into guessing.',
    },
    example: {
      zh: '新员工入职三个月内离职率高，追问根因到底是培训、薪资还是文化。',
      en: 'High turnover within 3 months of hire—trace the root cause: training, pay, or culture?',
    },
    exampleWalkthrough: {
      zh: '现象：新员工 3 个月内离职率 35%（行业平均 15%）\n\nWhy 1：为什么离职？→ 离职面谈显示"工作内容和预期不符"\nWhy 2：为什么不符？→ 入职前 JD 写的是"产品设计"，实际做的是"运营支持"\nWhy 3：为什么 JD 不准确？→ JD 是 2 年前写的，岗位职责早已变化\nWhy 4：为什么没更新？→ 没有人负责定期审核 JD\nWhy 5：为什么没有这个流程？→ HR 团队缺少 JD 审核制度\n\n根因：缺少 JD 定期审核流程\n行动：每季度由用人经理和 HR 共同审核 JD，确保与实际工作一致。',
      en: 'Symptom: 35% turnover within 3 months (industry avg 15%)\n\nWhy 1: Why do they leave? → Exit interviews show "job didn\'t match expectations"\nWhy 2: Why the mismatch? → JD said "product design" but actual work was "ops support"\nWhy 3: Why is the JD wrong? → Written 2 years ago, role has changed since\nWhy 4: Why wasn\'t it updated? → No one owns periodic JD review\nWhy 5: Why no process? → HR lacks a JD audit system\n\nRoot cause: No JD review process\nAction: Quarterly JD review by hiring manager + HR to ensure alignment with actual work.',
    },
    depth: 'interactive',
  },
  {
    id: 'kj',
    name: { zh: 'KJ 法 / 亲和图', en: 'KJ method / affinity diagram' },
    purpose: {
      zh: '从零散材料（访谈、评论、笔记）中归纳出主题',
      en: 'Surface themes from scattered notes, interviews, and comments',
    },
    taskTypes: ['exploration', 'diagnosis'],
    introduction: {
      zh: 'KJ 法由日本人类学家川喜田二郎发明，用于从大量零散信息中发现结构。做法是把每条信息写成一张卡片，然后不预设分类地将相似卡片自然聚拢成组，再给每组命名。它特别适合：你有一堆原始材料（用户访谈、竞品评论、问题反馈）但还不知道该怎么组织时。KJ 法的关键是"先分组后命名"——避免用预设框架强行塞信息。',
      en: 'The KJ method was invented by Japanese anthropologist Jiro Kawakita to find structure in large amounts of scattered information. Write each piece of information on a card, then naturally group similar cards without predefined categories, and finally name each group. Best used when you have raw materials (user interviews, reviews, feedback) but don\'t yet know how to organize them. The key principle is "group first, name later" — avoid forcing information into predefined frameworks.',
    },
    whenToUse: {
      zh: '你面前有大量碎片信息（20+ 条笔记、评论、反馈），但还没有分类框架。触发信号："信息太多不知道从哪看起"、"每条都有道理但看不出规律"、"老板问总结我不知道怎么归纳"。',
      en: 'You have a pile of fragmented information (20+ notes, comments, feedback) with no classification framework yet. Trigger signals: "too much info, don\'t know where to start," "each piece makes sense but I can\'t see a pattern," "boss asked for a summary and I don\'t know how to group this."',
    },
    whenNotToUse: {
      zh: '你已经有明确的分类框架（比如按部门、按时间线），直接用那个框架就好。或者信息量太少（< 10 条），用不着 KJ 法，直接读一遍就能看出规律。',
      en: "You already have a clear framework (e.g., by department, by timeline)—just use it directly. Or the amount of information is too small (< 10 items)—just read through and you'll spot patterns without KJ.",
    },
    vsOtherMethods: {
      zh: 'KJ 法 vs 鱼骨图：鱼骨图是"已知问题，找原因"（有方向性），KJ 法是"不知道问题是什么，先从材料中发现结构"（无预设方向）。\nKJ 法 vs ABC 分析：KJ 法归纳"是什么"（定性分组），ABC 分析回答"哪个重要"（定量排序）。通常先 KJ 分出类别，再 ABC 对类别排优先级。',
      en: 'KJ vs Fishbone: Fishbone is "known problem, find causes" (directional); KJ is "don\'t know what the problem is, discover structure from raw material" (no predefined direction).\nKJ vs ABC: KJ answers "what are the categories" (qualitative grouping); ABC answers "which matters most" (quantitative ranking). Often use KJ first to find categories, then ABC to prioritize them.',
    },
    requiredInputs: [
      { zh: '一批原始材料（每条一句话左右的笔记或摘录）', en: 'A batch of raw notes or excerpts, one idea per card' },
    ],
    steps: [
      {
        zh: '把每条信息写成独立的卡片（一卡一意）',
        en: 'Write each piece of information on a separate card (one idea per card)',
      },
      {
        zh: '不预设分类，将"感觉相近"的卡片自然聚拢',
        en: 'Without predefined categories, naturally cluster cards that "feel related"',
      },
      { zh: '为每组起一个能概括其内容的标题', en: 'Give each group a title that captures its essence' },
      { zh: '检查未归入任何组的卡片，它们可能是独特洞察', en: 'Review ungrouped cards — they may be unique insights' },
      {
        zh: '画出组与组之间的关系（相互影响、因果、对立）',
        en: 'Map relationships between groups (mutual influence, causal, opposing)',
      },
    ],
    outputs: [{ zh: '分组后的主题地图与未分类项', en: 'Grouped theme map with unclassified cards' }],
    caution: {
      zh: '主题数量不代表影响大小，分组结果需要人工确认。',
      en: 'Theme counts do not equal impact; grouping needs human confirmation.',
    },
    example: {
      zh: '收集了 50 条用户投诉，想找出共性问题分类。',
      en: 'Collected 50 user complaints; need to group them into common themes.',
    },
    exampleWalkthrough: {
      zh: '场景：收到 50 条 App 用户投诉，想找出共性问题。\n\n步骤：\n1. 每条投诉写一张卡："加载太慢"、"找不到退款入口"、"推送太多"、"闪退"、"客服不回复"...\n2. 自然分组后得到 5 组：\n   · 性能问题（加载慢、闪退、卡顿）— 12 张\n   · 功能找不到（退款入口、设置页、历史订单）— 9 张\n   · 骚扰感（推送多、广告弹窗）— 8 张\n   · 客服体验（不回复、回复慢、态度差）— 15 张\n   · 其他（3 张独立问题）\n3. 结论：客服体验是最大的投诉类别，但"性能问题"可能影响面更广（需结合数据验证）。',
      en: 'Scenario: Received 50 app user complaints, need to find common themes.\n\nSteps:\n1. One card per complaint: "too slow", "can\'t find refund", "too many notifications", "crashes", "support never replies"...\n2. Natural grouping yields 5 clusters:\n   · Performance (slow, crashes, lag) — 12 cards\n   · Can\'t find features (refund, settings, order history) — 9 cards\n   · Feels intrusive (too many pushes, popup ads) — 8 cards\n   · Support experience (no reply, slow, rude) — 15 cards\n   · Misc (3 standalone issues)\n3. Conclusion: Support experience is the largest complaint category, but "performance" may affect more users (needs data validation).',
    },
    depth: 'interactive',
  },
  {
    id: 'abc',
    name: { zh: 'ABC / Pareto 分析', en: 'ABC / Pareto analysis' },
    purpose: {
      zh: '按价值口径排序，找出最值得优先处理的少数项',
      en: 'Rank items by a value metric to find the vital few',
    },
    taskTypes: ['improvement', 'exploration'],
    introduction: {
      zh: 'ABC 分析基于帕累托原则（80/20 法则）：少数项目往往贡献了大部分价值。做法是按某个统一指标（收入、频次、成本）对所有项目排序，计算累计占比，把前 70-80% 标为 A 类（重点管理）、接下来 15-20% 为 B 类、最后为 C 类。适合你面对一长串项目不知道先做哪个时，快速找出"关键少数"。注意：80/20 只是经验规则，不是自然法则。',
      en: 'ABC analysis is based on the Pareto principle (80/20 rule): a few items often contribute most of the value. Rank all items by a single metric (revenue, frequency, cost), compute cumulative share, and label the top 70-80% as A (manage closely), next 15-20% as B, rest as C. Use it when facing a long list and you need to identify the "vital few" quickly. Note: 80/20 is a heuristic, not a law of nature.',
    },
    whenToUse: {
      zh: '你有一长串项目/任务/客户/产品，资源有限，需要决定"先搞哪些"。触发信号："什么都想做但做不完"、"客户那么多该重点服务谁"、"库存品类太多管不过来"。',
      en: 'You have a long list of items/tasks/customers/products, limited resources, and need to decide "which first." Trigger signals: "want to do everything but can\'t," "too many customers—who gets priority," "too many SKUs to manage."',
    },
    whenNotToUse: {
      zh: '你的项目之间有强依赖关系（A 做完才能做 B），单纯按价值排序没意义——需要 PERT 排期。或者"价值"没法用一个统一维度衡量——需要 MCDA 多准则。',
      en: 'Items have strong dependencies (A must finish before B)—simple value ranking is meaningless, use PERT. Or "value" can\'t be measured on a single dimension—use MCDA for multi-criteria.',
    },
    vsOtherMethods: {
      zh: 'ABC vs MCDA：ABC 只按一个维度排序（收入 or 频次 or 成本），够用就用 ABC，够简单。MCDA 是多个冲突维度（便宜 vs 质量 vs 速度）需要综合权衡时才用。\nABC vs KJ：KJ 回答"这些东西怎么分类"，ABC 回答"分好类后哪类最重要"。',
      en: 'ABC vs MCDA: ABC ranks by one dimension (revenue OR frequency OR cost)—if one metric suffices, use ABC for simplicity. MCDA is for multiple conflicting dimensions (cheap vs quality vs speed) that need weighted trade-offs.\nABC vs KJ: KJ answers "how to categorize these," ABC answers "after categorizing, which category matters most."',
    },
    requiredInputs: [
      { zh: '一组可比较的项目清单', en: 'A comparable list of items' },
      {
        zh: '每个项目在同一口径下的数值（成本、频次、收益等）',
        en: 'A value per item on one consistent metric (cost, frequency, revenue...)',
      },
    ],
    steps: [
      { zh: '列出所有项目和它们的数值', en: 'List all items with their values' },
      { zh: '按数值从大到小排序', en: 'Sort by value, descending' },
      { zh: '计算每项的占比和累计占比', en: "Calculate each item's share and cumulative share" },
      {
        zh: '划分 A/B/C 类（如累计 80% 为 A，80-95% 为 B，其余为 C）',
        en: 'Classify into A/B/C (e.g., cumulative 80% = A, 80-95% = B, rest = C)',
      },
      {
        zh: '对 A 类制定精细管理策略，C 类简化处理',
        en: 'Apply detailed management to A class, simplified handling for C class',
      },
    ],
    outputs: [{ zh: '排序、累计占比和 A/B/C 分类', en: 'Ranking, cumulative share, and A/B/C classes' }],
    caution: {
      zh: '80/20 只是排序启发式，不能把固定阈值当作客观规律。',
      en: '80/20 is a ranking heuristic; fixed thresholds are not a law of nature.',
    },
    example: {
      zh: '仓库有 200 种商品，想找出哪 20% 的品类贡献了 80% 的销售额。',
      en: '200 SKUs in warehouse; find which 20% drive 80% of revenue.',
    },
    exampleWalkthrough: {
      zh: '场景：一家奶茶店有 25 种产品，想知道该重点备料哪些。\n\n按月销量排序后：\n1. 杨枝甘露 — 3200 杯（22%，累计 22%）→ A\n2. 珍珠奶茶 — 2800 杯（19%，累计 41%）→ A\n3. 芒果冰沙 — 2100 杯（14%，累计 55%）→ A\n4. 柠檬茶 — 1500 杯（10%，累计 65%）→ A\n5. 抹茶拿铁 — 1200 杯（8%，累计 73%）→ A\n...\n前 5 种产品（20%）贡献了 73% 的销量。\n\n结论：A 类这 5 种原料必须保证充足供应不断货，C 类的 10 种长尾产品可以按需少量备货。',
      en: 'Scenario: A bubble tea shop has 25 products; which ones need priority stocking?\n\nSorted by monthly sales:\n1. Mango Pomelo — 3200 cups (22%, cumulative 22%) → A\n2. Pearl Milk Tea — 2800 cups (19%, cumulative 41%) → A\n3. Mango Smoothie — 2100 cups (14%, cumulative 55%) → A\n4. Lemon Tea — 1500 cups (10%, cumulative 65%) → A\n5. Matcha Latte — 1200 cups (8%, cumulative 73%) → A\n...\nTop 5 items (20%) contribute 73% of sales.\n\nConclusion: A-class ingredients must be stocked without fail; C-class long-tail items can be ordered in small quantities on demand.',
    },
    depth: 'guided',
  },
  {
    id: 'causal-graph',
    name: { zh: '基础因果图', en: 'Causal graph (DAG)' },
    purpose: {
      zh: '显式画出变量间假设的因果方向，暴露混杂因素',
      en: 'Make assumed causal directions explicit and expose confounders',
    },
    taskTypes: ['diagnosis', 'prediction'],
    introduction: {
      zh: '因果图（DAG，有向无环图）是把"我认为 A 会影响 B"这种假设显式画出来的工具。当你观察到两个变量相关时，可能是 A→B、B→A、或者有个共同原因 C 同时影响了它们。因果图强迫你把每条假设的方向画清楚，从而暴露混杂变量和虚假相关。适合你需要区分"相关"和"因果"的场景。',
      en: 'A causal graph (DAG, Directed Acyclic Graph) makes your assumptions about cause-and-effect explicit. When two variables are correlated, it could be A→B, B→A, or a common cause C affecting both. Causal graphs force you to draw each assumed direction clearly, exposing confounders and spurious correlations. Use it when you need to distinguish "correlation" from "causation".',
    },
    whenToUse: {
      zh: '你观察到两件事总是一起出现，想搞清楚"是 A 导致 B，还是巧合"。或者有人拿相关性当因果在做决策（"培训多的员工绩效好，所以加培训预算"）。触发信号："相关不等于因果"、"可能有第三个变量在背后"、"这个结论怎么这么方便"。',
      en: 'You observe two things always co-occurring and want to know "does A cause B, or is it coincidence?" Or someone is treating correlation as causation in a decision. Trigger signals: "correlation ≠ causation," "maybe a third variable lurks behind," "this conclusion is suspiciously convenient."',
    },
    whenNotToUse: {
      zh: '因果方向已经很明确（物理机制清楚，如"加热→水沸腾"），不需要画图来分辨。或者你还没收集到足够数据判断哪些变量相关——先收数据。',
      en: 'Causal direction is already clear (physical mechanism obvious, e.g., "heat→water boils")—no need to diagram. Or you haven\'t collected enough data to know which variables correlate—gather data first.',
    },
    vsOtherMethods: {
      zh: '因果图 vs 鱼骨图：鱼骨图是"一个问题有哪些可能原因"（单向树），因果图是"多个变量之间的因果网络是什么样"（可以有多个结果、互相影响）。鱼骨图用于头脑风暴阶段，因果图用于验证假设阶段。\n因果图 vs 5 Why：5 Why 是线性追问，因果图允许分叉、合流、混杂。',
      en: 'Causal graph vs Fishbone: Fishbone is "what could cause this one problem" (one-directional tree); causal graph is "what does the full causal network among variables look like" (multiple outcomes, mutual influence). Fishbone for brainstorming, causal graph for hypothesis testing.\nCausal graph vs 5 Whys: 5 Whys is linear; causal graph allows branching, merging, confounding.',
    },
    requiredInputs: [
      {
        zh: '关键变量清单（结果变量与可能影响它的因素）',
        en: 'Key variables: the outcome and factors that may influence it',
      },
      { zh: '哪些关系有证据、哪些只是假设', en: 'Which relations are evidence-backed vs assumed' },
    ],
    steps: [
      {
        zh: '列出关心的结果变量和所有可能相关的因素',
        en: 'List the outcome variable and all potentially relevant factors',
      },
      {
        zh: '对每对变量判断方向：谁可能影响谁？',
        en: 'For each pair, judge the direction: which might influence which?',
      },
      { zh: '画箭头（A→B 表示"A 可能导致 B"）', en: 'Draw arrows (A→B means "A may cause B")' },
      {
        zh: '找出混杂变量：有没有第三个变量同时影响了 A 和 B？',
        en: 'Identify confounders: is there a third variable affecting both A and B?',
      },
      {
        zh: '标注哪些箭头有数据支持、哪些只是假设，规划验证方案',
        en: 'Mark which arrows are data-supported vs assumed, plan verification',
      },
    ],
    outputs: [
      { zh: '变量、方向、关系类型和未验证假设', en: 'Variables, directions, relation types, and untested assumptions' },
    ],
    caution: {
      zh: '相关不等于因果；声称"改变 X 导致 Y"需要实验或明确假设。',
      en: 'Correlation is not causation; claiming "X causes Y" needs experiments or explicit assumptions.',
    },
    example: {
      zh: '广告投放增加后销量上升了，但同期竞品涨价了——如何区分真正原因？',
      en: 'Sales rose after ad spend increased, but competitors also raised prices—how to separate causes?',
    },
    exampleWalkthrough: {
      zh: '场景：公司发现"参加培训的员工绩效更高"，想论证应该增加培训预算。\n\n画因果图：\n· 培训 → 绩效？（可能）\n· 但也许：上进心强的员工 → 主动参加培训 AND 上进心强 → 绩效高\n· 混杂变量：员工上进心\n\n图示：\n  上进心 → 参加培训\n  上进心 → 高绩效\n  培训 → 高绩效（待验证）\n\n结论：不能直接说"培训提高绩效"，因为可能是自选择偏差。需要做对照实验（如随机指派培训）来验证培训本身的因果效应。',
      en: 'Scenario: Company observes "employees who attend training perform better" and wants to justify more training budget.\n\nCausal graph:\n· Training → Performance? (possible)\n· But maybe: Motivated employees → Attend training AND Motivated → High performance\n· Confounder: Employee motivation\n\nGraph:\n  Motivation → Attends training\n  Motivation → High performance\n  Training → High performance (unverified)\n\nConclusion: Can\'t claim "training improves performance" directly — may be self-selection bias. Need a controlled experiment (e.g., random assignment to training) to verify the causal effect of training itself.',
    },
    depth: 'guided',
  },
  {
    id: 'mcda',
    name: { zh: 'MCDA 多准则决策分析', en: 'Multi-criteria decision analysis' },
    purpose: {
      zh: '在多个冲突目标下透明地比较方案并检验结论稳健性',
      en: 'Compare options across conflicting goals transparently and test robustness',
    },
    taskTypes: ['selection'],
    introduction: {
      zh: 'MCDA 解决的是"鱼和熊掌不可兼得"的问题：当你有多个评价标准且它们互相冲突时（便宜 vs 质量高 vs 交付快），如何系统地比较方案？做法是给每个标准赋权重、给每个方案在每个标准上打分、计算加权总分。关键不是追求"唯一正确答案"，而是让决策过程透明可审视：别人能看到你为什么选了这个，权重调一调结论会不会翻转。',
      en: 'MCDA addresses "you can\'t have it all": when you have multiple conflicting criteria (cheap vs high quality vs fast delivery), how do you systematically compare options? Assign weights to each criterion, score each option on each criterion, compute weighted totals. The goal isn\'t finding "the one right answer" but making the decision process transparent and auditable: others can see why you chose this, and whether tweaking weights flips the conclusion.',
    },
    whenToUse: {
      zh: '你有 2-5 个现实方案且各有优劣（没有一个全面碾压其他的），需要说服别人（或说服自己）选哪个。触发信号："A 便宜但功能少，B 贵但好，怎么选"、"每个人偏好不同，需要一个透明的比较框架"。',
      en: 'You have 2-5 realistic options, each with trade-offs (none dominates all others), and need to justify the choice to others or yourself. Trigger signals: "A is cheap but limited, B is expensive but good—how to choose," "everyone has different preferences, need a transparent framework."',
    },
    whenNotToUse: {
      zh: '只有一个维度在乎（比如只看价格）——直接排序就好，不需要 MCDA。或者某个方案在所有维度都最优——不需要分析，直接选。方案数量超过 10 个时先用 ABC 分析缩小到 3-5 个再做 MCDA。',
      en: 'Only one dimension matters (e.g., just price)—sort directly, no MCDA needed. Or one option dominates on all dimensions—just pick it. If you have 10+ options, first use ABC to narrow to 3-5, then MCDA.',
    },
    vsOtherMethods: {
      zh: 'MCDA vs ABC：ABC 是单维度排序，MCDA 是多维度权衡。如果只在乎一个指标就用 ABC，多个冲突指标才用 MCDA。\nMCDA vs FMEA：MCDA 比较"哪个方案更好"，FMEA 检查"选定方案可能怎么出错"。通常先 MCDA 选方案，再 FMEA 做风险检查。\nMCDA vs 价值分析：MCDA 比较并选择方案，价值分析审查已有支出是否值得。',
      en: 'MCDA vs ABC: ABC is single-dimension ranking; MCDA is multi-dimension trade-off. One metric → ABC; conflicting metrics → MCDA.\nMCDA vs FMEA: MCDA compares "which option is better"; FMEA checks "how might the chosen option fail." Typically MCDA first to select, then FMEA for risk check.\nMCDA vs Value analysis: MCDA selects among options; value analysis audits whether existing spending is worthwhile.',
    },
    requiredInputs: [
      { zh: '至少两个现实可行的候选方案（含"维持现状"）', en: 'At least two feasible options, including "do nothing"' },
      { zh: '不能突破的硬约束', en: 'Hard constraints that must not be violated' },
      { zh: '你在乎的评价准则和大致重要性', en: 'Evaluation criteria and rough importance' },
    ],
    steps: [
      { zh: '列出所有候选方案（包括"不做"）', en: 'List all options (including "do nothing")' },
      { zh: '确定评价标准，给每个标准分配权重（总和 100%）', en: 'Define criteria, assign weights (summing to 100%)' },
      { zh: '给每个方案在每个标准上打分（如 0-10）', en: 'Score each option on each criterion (e.g., 0-10)' },
      { zh: '计算加权总分并排序', en: 'Compute weighted total scores and rank' },
      {
        zh: '做敏感性分析：调整权重 ±20%，结论是否翻转？',
        en: 'Sensitivity analysis: adjust weights ±20%, does the ranking flip?',
      },
    ],
    outputs: [
      {
        zh: '加权得分、排序和敏感性（权重变化是否颠覆结论）',
        en: 'Weighted scores, ranking, and sensitivity (does the conclusion flip?)',
      },
    ],
    caution: {
      zh: '不允许只显示一个神秘总分；权重和最低可接受值必须可见。',
      en: 'No opaque single score; weights and minimum acceptable values stay visible.',
    },
    example: {
      zh: '选租房：离公司近但贵 vs 便宜但通勤久 vs 中间但老旧，怎么系统比较？',
      en: 'Choosing an apartment: close but expensive vs cheap but long commute vs middle but old—how to compare?',
    },
    exampleWalkthrough: {
      zh: '场景：选一个项目管理工具，候选 A（贵但功能全）、B（便宜但功能少）、C（开源免费但需要自己运维）。\n\n标准和权重：功能完整性 40%、成本 30%、维护难度 20%、团队学习成本 10%\n\n评分（0-10）：\n        功能  成本  维护  学习\nA:       9     3     8     7  → 加权 = 9×0.4 + 3×0.3 + 8×0.2 + 7×0.1 = 6.8\nB:       5     9     8     9  → 加权 = 5×0.4 + 9×0.3 + 8×0.2 + 9×0.1 = 7.2\nC:       7     10    3     4  → 加权 = 7×0.4 + 10×0.3 + 3×0.2 + 4×0.1 = 6.8\n\n结论：B 略胜。但如果把"功能完整性"权重调到 50%，A 反超 → 结论不够稳健，需要团队讨论功能到底有多重要。',
      en: 'Scenario: Choosing a project management tool — A (expensive, full-featured), B (cheap, fewer features), C (free open-source, self-hosted).\n\nCriteria & weights: Features 40%, Cost 30%, Maintenance 20%, Learning curve 10%\n\nScores (0-10):\n       Features  Cost  Maintenance  Learning\nA:       9        3       8           7  → Weighted = 6.8\nB:       5        9       8           9  → Weighted = 7.2\nC:       7       10       3           4  → Weighted = 6.8\n\nConclusion: B wins slightly. But if "Features" weight rises to 50%, A overtakes → conclusion is fragile, team needs to discuss how critical full features really are.',
    },
    depth: 'interactive',
  },
  {
    id: 'value-analysis',
    name: { zh: '价值分析', en: 'Value analysis' },
    purpose: {
      zh: '逐项检查功能是否值得它的成本，寻找更省的替代做法',
      en: 'Check whether each function is worth its cost and find cheaper alternatives',
    },
    taskTypes: ['selection', 'improvement'],
    introduction: {
      zh: '价值分析的核心问题是"这个功能值得花这么多钱吗？"。它要求你把每个功能/支出拆开看：这个东西为目标贡献了什么？成本是多少？有没有更便宜的方式达到同样效果？适合你感觉"钱花了不少但效果不明显"的时候做一次体检式审视。',
      en: 'Value analysis asks: "Is this function worth what it costs?" Break each function/expense apart: What does it contribute to the goal? What does it cost? Is there a cheaper way to achieve the same effect? Use it when you feel "spending a lot but results are unclear" — it\'s like a financial health check.',
    },
    whenToUse: {
      zh: '你在做"缩减预算"或"优化支出"类决策：手上有一堆在付费的东西/功能/流程，不确定哪些该砍。触发信号："预算超了需要砍"、"这个工具/功能真的有用吗"、"我在为什么不用的东西付费"。',
      en: 'You\'re making "cut budget" or "optimize spending" decisions: you have multiple things you\'re paying for and aren\'t sure which to cut. Trigger signals: "over budget, need to cut," "is this tool/feature actually useful," "why am I paying for things I don\'t use."',
    },
    whenNotToUse: {
      zh: '你在比较新方案该选哪个（还没选定）——那是 MCDA 的场景。或者问题不是"花太多"而是"效果不好"——那可能需要 DMAIC 改进流程。',
      en: 'You\'re comparing new options you haven\'t chosen yet—that\'s MCDA. Or the problem isn\'t "spending too much" but "not getting results"—that might need DMAIC to fix the process.',
    },
    vsOtherMethods: {
      zh: '价值分析 vs MCDA：价值分析审查"已有的东西值不值"，MCDA 比较"新方案选哪个"。一个向后看（优化现状），一个向前看（选择未来）。\n价值分析 vs ABC：ABC 找出"哪些贡献大"，价值分析找出"哪些成本高但贡献小"。ABC 是正向筛选（重点关注什么），价值分析是逆向筛选（砍什么）。',
      en: 'Value analysis vs MCDA: Value analysis audits "is what we have worth it"; MCDA compares "which new option to pick." One looks backward (optimize current state), the other forward (choose the future).\nValue analysis vs ABC: ABC finds "what contributes most"; value analysis finds "what costs a lot but contributes little." ABC is positive selection (focus on what); value analysis is negative selection (cut what).',
    },
    requiredInputs: [
      { zh: '要评估的功能或支出清单', en: 'The list of functions or expenses to evaluate' },
      { zh: '每项的大致成本', en: 'Rough cost per item' },
    ],
    steps: [
      { zh: '列出所有功能/支出及其成本', en: 'List all functions/expenses and their costs' },
      {
        zh: '对每项评估：它对核心目标的贡献程度（高/中/低）',
        en: 'For each: rate contribution to core goal (high/medium/low)',
      },
      { zh: '标记"高成本 + 低贡献"的项目为重点审查对象', en: 'Flag "high cost + low contribution" items for review' },
      {
        zh: '对重点项探索替代方案：能否用更便宜的方式实现？',
        en: 'For flagged items, explore alternatives: cheaper way to achieve the same?',
      },
      { zh: '决策：保留/替换/砍掉', en: 'Decide: keep / replace / cut' },
    ],
    outputs: [{ zh: '必要性、成本、价值判断与替代方案', en: 'Necessity, cost, worth judgment, and alternatives' }],
    caution: {
      zh: '"便宜"不等于"值得"；先确认功能对目标的贡献再砍成本。',
      en: 'Cheap is not the same as worthwhile; confirm contribution to the goal before cutting cost.',
    },
    example: {
      zh: '团队用了 8 个 SaaS 工具，月费 5000 元，哪些可以砍掉或合并？',
      en: 'Team uses 8 SaaS tools at $700/mo total; which can be dropped or consolidated?',
    },
    exampleWalkthrough: {
      zh: '场景：个人每月支出审查，发现有 6 个订阅服务共 ¥500/月。\n\n| 服务 | 月费 | 贡献 | 判断 |\n| 视频会员 | ¥25 | 高（每天用）| 保留 |\n| 音乐会员 | ¥15 | 高 | 保留 |\n| 云存储 | ¥20 | 中 | 保留 |\n| 健身 App | ¥50 | 低（3 个月没用）| 砍掉 |\n| AI 工具 A | ¥200 | 中 | 找平替（工具 B ¥60 功能够用）|\n| 杂志订阅 | ¥190 | 低 | 砍掉 |\n\n结论：砍 2 个 + 替换 1 个，月省 ¥380（76%），核心体验不受影响。',
      en: 'Scenario: Monthly personal subscription audit — 6 services totaling $70/mo.\n\n| Service | Cost | Contribution | Decision |\n| Video streaming | $4 | High (daily use) | Keep |\n| Music | $2 | High | Keep |\n| Cloud storage | $3 | Medium | Keep |\n| Fitness app | $7 | Low (unused 3 months) | Cut |\n| AI tool A | $28 | Medium | Replace with tool B at $8 |\n| Magazine | $26 | Low | Cut |\n\nResult: Cut 2 + replace 1, saving $53/mo (76%) with no impact on core experience.',
    },
    depth: 'guided',
  },
  {
    id: 'fmea',
    name: { zh: 'FMEA 失效模式分析', en: 'FMEA' },
    purpose: {
      zh: '事前列出方案可能的失败方式，按严重度×发生度×可探测度排序',
      en: 'List failure modes upfront, ranked by severity × occurrence × detection',
    },
    taskTypes: ['planning', 'selection', 'improvement'],
    introduction: {
      zh: 'FMEA（失效模式与效果分析）是一种"事前验尸"工具：在方案执行前，系统性地想象"哪里可能出错"，然后对每种失效按严重度（S）、发生概率（O）、可探测度（D）三个维度打分，乘积为 RPN（风险优先数）。RPN 最高的先处理。它的价值在于把"可能出问题"从模糊焦虑变成可排序的待办。',
      en: 'FMEA (Failure Mode and Effects Analysis) is a "pre-mortem" tool: before execution, systematically imagine "what could go wrong," then score each failure mode on Severity (S), Occurrence (O), and Detection (D). The product is RPN (Risk Priority Number). Handle highest RPN first. Its value: turning vague worry about "things might go wrong" into a sorted, actionable list.',
    },
    whenToUse: {
      zh: '你已经选定了一个方案，准备执行——但想提前知道哪里最可能翻车。触发信号："这个方案风险大不大"、"万一出问题怎么办"、"上线前我们该检查什么"。不是在"选方案"而是在"给已选方案做体检"。',
      en: 'You\'ve already chosen a plan and are about to execute—but want to know where it might derail. Trigger signals: "how risky is this plan," "what if something goes wrong," "what should we check before launch." Not choosing between options, but stress-testing the chosen one.',
    },
    whenNotToUse: {
      zh: '你还在比较多个方案该选哪个——那是 MCDA 的事。FMEA 假设方案已定，只做风险检查。或者问题已经发生了（不是"可能出错"而是"已经出错了"）——用鱼骨/5 Why 诊断。',
      en: 'You\'re still comparing options—that\'s MCDA. FMEA assumes the plan is set and only does risk checking. Or the problem already happened (not "might fail" but "already failed")—use fishbone/5 Whys to diagnose.',
    },
    vsOtherMethods: {
      zh: 'FMEA vs MCDA：MCDA 是"选哪个方案"，FMEA 是"选完之后检查风险"。顺序：先 MCDA 选方案 → 再 FMEA 找风险。\nFMEA vs PDSA：FMEA 是执行前的风险扫描（纸上推演），PDSA 是执行中的小试验（实际跑一遍）。FMEA 找出你该担心什么，PDSA 用实验验证那些担心是否成立。',
      en: 'FMEA vs MCDA: MCDA selects the plan; FMEA risk-checks it afterward. Sequence: MCDA to choose → FMEA to stress-test.\nFMEA vs PDSA: FMEA is pre-execution risk scanning (paper exercise); PDSA is mid-execution experimentation (actually run it). FMEA identifies what to worry about; PDSA tests whether those worries materialize.',
    },
    requiredInputs: [
      { zh: '要检查的方案或计划', en: 'The plan or option to stress-test' },
      { zh: '什么后果算不可接受', en: 'What consequences are unacceptable' },
    ],
    steps: [
      { zh: '列出方案中所有可能失败的环节', en: 'List all steps/components that could fail' },
      { zh: '对每个失效描述：会导致什么后果？', en: "For each failure: what's the consequence?" },
      {
        zh: '打分：严重度 S（1-10）、发生概率 O（1-10）、可探测度 D（1-10）',
        en: 'Score: Severity S (1-10), Occurrence O (1-10), Detection D (1-10)',
      },
      { zh: '计算 RPN = S × O × D，按 RPN 排序', en: 'Calculate RPN = S × O × D, sort by RPN' },
      { zh: '对高 RPN 项制定预防/应急措施', en: 'For high-RPN items, define preventive/contingency measures' },
    ],
    outputs: [{ zh: '失效模式、RPN 排序和缓解措施', en: 'Failure modes, RPN ranking, and mitigations' }],
    caution: {
      zh: '缺少领域经验时不能宣称风险已全覆盖；RPN 只是排序工具。',
      en: 'Without domain expertise do not claim risks are fully covered; RPN is a ranking aid only.',
    },
    example: {
      zh: '新产品下周上线，提前列出可能出问题的地方和应急方案。',
      en: 'New product launches next week; list what could go wrong and contingency plans.',
    },
    exampleWalkthrough: {
      zh: '场景：下周上线新支付功能。\n\n| 失效模式 | 后果 | S | O | D | RPN | 措施 |\n| 第三方支付 API 超时 | 用户付款失败 | 9 | 4 | 3 | 108 | 设置超时重试 + 备用通道 |\n| 金额计算精度错误 | 多扣/少扣钱 | 10 | 2 | 2 | 40 | 单元测试覆盖边界值 |\n| 并发下订单重复扣款 | 用户投诉 + 退款 | 9 | 3 | 5 | 135 | 加幂等锁 |\n| 上线后回滚失败 | 长时间故障 | 8 | 2 | 6 | 96 | 灰度发布 + 演练回滚 |\n\n按 RPN 排序：重复扣款 (135) > API 超时 (108) > 回滚 (96) > 精度 (40)\n优先解决前两项。',
      en: 'Scenario: New payment feature launching next week.\n\n| Failure Mode | Effect | S | O | D | RPN | Mitigation |\n| 3rd-party API timeout | Payment fails | 9 | 4 | 3 | 108 | Retry + fallback gateway |\n| Amount calculation error | Over/under charge | 10 | 2 | 2 | 40 | Unit tests on edge cases |\n| Concurrent duplicate charge | Complaints + refunds | 9 | 3 | 5 | 135 | Idempotency lock |\n| Rollback failure | Extended outage | 8 | 2 | 6 | 96 | Canary deploy + rollback drill |\n\nSorted by RPN: Duplicate charge (135) > API timeout (108) > Rollback (96) > Precision (40)\nPrioritize fixing the first two.',
    },
    depth: 'guided',
  },
  {
    id: 'dmaic',
    name: { zh: 'DMAIC 改进流程', en: 'DMAIC' },
    purpose: {
      zh: '用 Define-Measure-Analyze-Improve-Control 系统改善已有流程',
      en: 'Improve an existing process via Define-Measure-Analyze-Improve-Control',
    },
    taskTypes: ['improvement'],
    introduction: {
      zh: 'DMAIC 是六西格玛的核心方法论，专门用于改进已存在但表现不佳的流程。五个阶段：Define（定义问题）→ Measure（测量现状）→ Analyze（分析根因）→ Improve（实施改进）→ Control（固化成果）。适合你有一个"一直在跑但跑得不好"的流程，需要系统性提升而非推倒重来。',
      en: 'DMAIC is the core Six Sigma methodology for improving existing but underperforming processes. Five phases: Define → Measure → Analyze → Improve → Control. Use it when you have a process that "keeps running but runs poorly" and needs systematic improvement rather than a complete redesign.',
    },
    whenToUse: {
      zh: '有一个已在运行的流程/系统/服务，性能指标不达标，需要从"现状"提升到"目标"。触发信号："这个流程太慢了"、"错误率太高"、"客户一直在投诉同一个问题"、"我们知道有问题但不知道根因是什么"。',
      en: 'An existing process/system/service is running but performance metrics are below target, and you need to go from "current state" to "target state." Trigger signals: "this process is too slow," "error rate is too high," "customers keep complaining about the same thing," "we know there\'s a problem but not the root cause."',
    },
    whenNotToUse: {
      zh: '流程还不存在（需要从零设计）——那是 PERT 排期的事。或者问题很小、原因很明确——直接用 PDSA 试一轮就行，不需要完整五阶段。DMAIC 适合中到大型改进项目。',
      en: "The process doesn't exist yet (needs to be designed from scratch)—that's PERT's job. Or the problem is small and the cause is obvious—just run a PDSA cycle, no need for the full five phases. DMAIC suits medium-to-large improvement projects.",
    },
    vsOtherMethods: {
      zh: 'DMAIC vs PDSA：DMAIC 是完整的改进项目框架（几周到几个月），PDSA 是单次小试验（几天）。DMAIC 的 Improve 阶段内部可以嵌套多轮 PDSA。问题大用 DMAIC 框架，问题小直接 PDSA。\nDMAIC vs 鱼骨/5 Why：鱼骨和 5 Why 是 DMAIC 第三阶段（Analyze）的具体工具。DMAIC 是整个项目的框架，鱼骨/5 Why 是框架里某一步用的工具。',
      en: "DMAIC vs PDSA: DMAIC is a full improvement project framework (weeks to months); PDSA is a single small experiment (days). DMAIC's Improve phase can embed multiple PDSA cycles. Big problem → DMAIC framework; small problem → straight to PDSA.\nDMAIC vs Fishbone/5 Whys: Fishbone and 5 Whys are tools used inside DMAIC's third phase (Analyze). DMAIC is the project framework; fishbone/5 Whys are specific tools within one step.",
    },
    requiredInputs: [
      { zh: '一个已存在、可测量的流程', en: 'An existing, measurable process' },
      { zh: '当前基线指标', en: 'The current baseline metric' },
    ],
    steps: [
      {
        zh: 'Define：明确要改进什么指标、目标值是多少、谁受影响',
        en: 'Define: What metric to improve, target value, who is affected',
      },
      {
        zh: 'Measure：收集当前表现数据，建立基线',
        en: 'Measure: Collect current performance data, establish baseline',
      },
      {
        zh: 'Analyze：找出导致差距的根因（可结合鱼骨/5 Why）',
        en: 'Analyze: Find root causes of the gap (use fishbone/5 Whys)',
      },
      { zh: 'Improve：设计并实施改进方案，验证效果', en: 'Improve: Design and implement changes, verify results' },
      { zh: 'Control：建立监控机制，防止回退', en: 'Control: Establish monitoring to prevent regression' },
    ],
    outputs: [{ zh: '五阶段改进模板，每阶段有明确产出', en: 'Five-phase improvement template with defined outputs' }],
    caution: {
      zh: '原因已清楚的小问题不要套完整 DMAIC，直接用 PDSA。',
      en: 'Do not wrap small, well-understood problems in full DMAIC; use PDSA.',
    },
    example: {
      zh: '客服平均响应时间 48 小时，目标降到 12 小时，怎么系统改进？',
      en: 'Customer support avg response is 48h, target is 12h—how to systematically improve?',
    },
    exampleWalkthrough: {
      zh: '场景：客服平均响应时间 48 小时，目标 12 小时。\n\nD：目标——响应时间从 48h 降到 12h，影响所有付费用户\nM：收集 30 天数据——中位数 52h，P90 是 96h，周一最严重\nA：根因——周一积压来自周末无人值班 + 工单分配不均（3 人处理 80% 工单）\nI：增加周末轮班 1 人 + 自动按技能分配工单 + 设置 SLA 警报\nC：每日看板监控响应时间，超 24h 自动升级\n\n实施两周后：中位数降到 14h，继续优化中。',
      en: 'Scenario: Support response time avg 48h, target 12h.\n\nD: Goal — reduce from 48h to 12h, affects all paying users\nM: 30-day data — median 52h, P90 is 96h, worst on Mondays\nA: Root causes — Monday backlog from no weekend coverage + uneven ticket distribution (3 people handle 80%)\nI: Add 1 weekend shift + auto-assign by skill + SLA alerts\nC: Daily dashboard monitoring response time, auto-escalate if >24h\n\nAfter 2 weeks: median dropped to 14h, still optimizing.',
    },
    depth: 'guided',
  },
  {
    id: 'pdsa',
    name: { zh: 'PDSA 小试验', en: 'PDSA cycle' },
    purpose: {
      zh: '先写预测，再小范围测试，用结果决定推广或调整',
      en: 'Predict, test small, compare, then scale or adjust',
    },
    taskTypes: ['improvement', 'learning'],
    introduction: {
      zh: 'PDSA（Plan-Do-Study-Act）是最小的改进循环：先预测结果，再小范围试，把实际结果和预测比较，然后决定下一步。和 DMAIC 的区别是 PDSA 更轻量，适合"试一试看看行不行"的场景。关键纪律：必须先写下预测（"我认为这样做会让 X 指标提高 Y%"），否则事后怎么说都对。',
      en: 'PDSA (Plan-Do-Study-Act) is the smallest improvement cycle: predict the result, test small, compare actual vs predicted, then decide next step. Unlike DMAIC, PDSA is lightweight — suited for "let\'s try and see." Key discipline: you must write down your prediction first ("I believe this will improve X by Y%"), otherwise hindsight bias makes everything seem obvious.',
    },
    whenToUse: {
      zh: '你有一个想法/改动，不确定会不会有效，想低成本验证。触发信号："试试看呗"、"我觉得这样会好，但没把握"、"先小范围跑一下"。重点：改动范围可控、可以随时停止、有明确的衡量指标。',
      en: 'You have an idea/change, unsure if it\'ll work, and want to validate cheaply. Trigger signals: "let\'s just try it," "I think this would help but I\'m not sure," "let\'s pilot it first." Key: the change is controllable, stoppable, and has a clear metric to measure.',
    },
    whenNotToUse: {
      zh: '改动不可逆（比如裁员、签长期合同）——不能"试试看"。或者问题很大很复杂，需要先诊断清楚根因——先用 DMAIC 的 Define/Measure/Analyze 阶段。PDSA 假设你已经有了假设，只是要验证。',
      en: 'The change is irreversible (e.g., layoffs, long-term contracts)—can\'t "just try." Or the problem is large and complex, needing diagnosis first—use DMAIC\'s Define/Measure/Analyze phases. PDSA assumes you already have a hypothesis to test.',
    },
    vsOtherMethods: {
      zh: 'PDSA vs DMAIC：PDSA 是一次迭代（几天），DMAIC 是完整改进项目（几周~几个月）。小问题直接 PDSA；大问题用 DMAIC 框架，其中 Improve 阶段嵌套 PDSA。\nPDSA vs 概率预测：两者都强调"先写预测再验证"，但 PDSA 验证的是"行动有没有效"，概率预测验证的是"事件会不会发生"。一个是干预实验，一个是观察判断。',
      en: 'PDSA vs DMAIC: PDSA is one iteration (days); DMAIC is a full improvement project (weeks to months). Small problem → PDSA directly; big problem → DMAIC with PDSA nested in Improve phase.\nPDSA vs Probabilistic forecast: Both emphasize "predict first, then verify," but PDSA validates "does this action work" while forecasting validates "will this event happen." One is an intervention experiment; the other is observational judgment.',
    },
    requiredInputs: [
      { zh: '一个想要验证的改动假设', en: 'A change hypothesis to validate' },
      { zh: '可以小范围试验且可停止的范围', en: 'A small, stoppable test scope' },
    ],
    steps: [
      {
        zh: 'Plan：写下假设和预测（"做了 X 后，Y 会变成 Z"）、确定试验范围',
        en: 'Plan: Write hypothesis and prediction ("after X, Y will become Z"), define test scope',
      },
      { zh: 'Do：在小范围执行，记录过程中的意外', en: 'Do: Execute in small scope, record surprises' },
      {
        zh: 'Study：对比预测和实际结果，分析差异原因',
        en: 'Study: Compare prediction vs actual, analyze why they differ',
      },
      {
        zh: 'Act：根据结果决定——推广 / 调整再试 / 放弃',
        en: 'Act: Based on results — scale up / adjust and retry / abandon',
      },
    ],
    outputs: [
      { zh: '预测、范围、指标、停止规则和下一轮安排', en: 'Prediction, scope, metrics, stop rule, and the next cycle' },
    ],
    caution: {
      zh: '试点样本不代表所有场景；先比较预测与结果再扩大投入。',
      en: 'A pilot sample does not represent all scenarios; compare prediction vs result before scaling.',
    },
    example: {
      zh: '想把周报改成异步文档，先在一个小组试行两周看效果。',
      en: 'Want to replace weekly meetings with async docs; pilot with one team for 2 weeks.',
    },
    exampleWalkthrough: {
      zh: '场景：觉得每天站会浪费时间，想改成异步文字更新。\n\nPlan：假设——取消站会改为 Slack 日报后，开发时间每天多 30 分钟；试验范围——后端组 4 人，两周。\nDo：执行两周，第一周有人忘记发日报、第二周适应了。\nStudy：实际——开发时间确实多了约 25 分钟/人/天，但出现 2 次信息遗漏导致重复工作。\nAct：调整——保留异步日报 + 每周一次 15 分钟同步，再试两周。\n\n第二轮：信息遗漏降为 0，效率保持。→ 推广到全组。',
      en: 'Scenario: Daily standups feel wasteful; try replacing with async text updates.\n\nPlan: Hypothesis — replacing standup with Slack daily update saves 30 min/day of dev time. Scope: backend team of 4, two weeks.\nDo: Week 1 some people forget to post; Week 2 adapted.\nStudy: Actual — dev time increased ~25 min/person/day, but 2 instances of info gaps caused rework.\nAct: Adjust — keep async daily + add one 15-min weekly sync, try 2 more weeks.\n\nRound 2: Info gaps dropped to 0, efficiency maintained. → Roll out to full team.',
    },
    depth: 'guided',
  },
  {
    id: 'forecast',
    name: { zh: '概率预测与校准', en: 'Probabilistic forecast' },
    purpose: {
      zh: '先看基准率，再给情景和概率，事后校准',
      en: 'Start from base rates, assign scenario probabilities, calibrate later',
    },
    taskTypes: ['prediction'],
    introduction: {
      zh: '概率预测是"用数字表达不确定性"的方法。不说"可能涨价"，而说"我认为 70% 概率三个月内涨价"。然后事后回顾：你说 70% 的事情里，真的有 70% 发生了吗？如果你说 70% 的事情 90% 都发生了，说明你太保守。这个校准过程会逐渐提升你对不确定性的判断能力。起点是基准率：类似的事以前多大比例发生过？',
      en: 'Probabilistic forecasting means "expressing uncertainty with numbers." Don\'t say "might increase" — say "I believe there\'s a 70% chance of a price increase within 3 months." Then review: of things you said were 70%, did 70% actually happen? If 90% happened, you were underconfident. This calibration process gradually improves your judgment under uncertainty. Start with base rates: how often did similar things happen before?',
    },
    whenToUse: {
      zh: '你需要对未来做判断，而且这个判断会影响决策（是否囤货、是否提前招人、是否投入研发）。触发信号："竞品会不会降价"、"这个项目能按时交付吗"、"市场会不会变差"——所有关于未来的"会不会"问题。',
      en: 'You need to judge the future and that judgment will affect decisions (stockpile or not, hire early or not, invest in R&D or not). Trigger signals: "will competitors cut prices," "will this project deliver on time," "will the market decline"—all "will it or won\'t it" questions about the future.',
    },
    whenNotToUse: {
      zh: '问题是关于过去或现在的（"为什么出了问题"）——那是诊断类方法（鱼骨/5 Why）。或者结果完全在你控制之内（"我的代码能跑通吗"——跑一遍就知道了，不需要预测）。',
      en: 'The question is about the past or present ("why did this fail")—use diagnostic methods (fishbone/5 Whys). Or the outcome is entirely within your control ("will my code run?"—just run it, no prediction needed).',
    },
    vsOtherMethods: {
      zh: '概率预测 vs FMEA：FMEA 问"我的计划可能怎么失败"（关于你能控制的事），概率预测问"外部环境会怎么变"（关于你不能控制的事）。一个是风险管理，一个是不确定性判断。\n概率预测 vs PDSA：PDSA 是"做实验验证假设"，概率预测是"观察并等待结果"。你能干预的用 PDSA，只能观察的用概率预测。',
      en: 'Forecast vs FMEA: FMEA asks "how might my plan fail" (things you control); forecast asks "how will the environment change" (things you can\'t control). One is risk management, the other is uncertainty judgment.\nForecast vs PDSA: PDSA is "run an experiment to test a hypothesis"; forecast is "observe and wait for the outcome." If you can intervene → PDSA; if you can only observe → forecast.',
    },
    requiredInputs: [
      { zh: '一句可验证、有截止时间的预测陈述', en: 'A verifiable prediction statement with a deadline' },
      { zh: '类似情况的基准率或历史样本', en: 'Base rates or historical samples of similar cases' },
    ],
    steps: [
      {
        zh: '写出可验证的预测（必须有明确截止时间和判定标准）',
        en: 'Write a verifiable prediction (must have clear deadline and resolution criteria)',
      },
      {
        zh: '查找基准率：类似事件历史上发生了多少比例？',
        en: 'Find the base rate: what proportion of similar events happened historically?',
      },
      { zh: '根据本次情境的特殊因素从基准率上调整', en: 'Adjust from base rate based on situation-specific factors' },
      { zh: '给出你的概率判断（0-100%）', en: 'State your probability estimate (0-100%)' },
      {
        zh: '到期后记录结果，校准自己的判断倾向',
        en: 'After deadline, record outcome and calibrate your judgment tendency',
      },
    ],
    outputs: [
      {
        zh: '基准率、情景概率和 0-100% 的预测记录',
        en: 'Base rate, scenario probabilities, and a 0-100% forecast record',
      },
    ],
    caution: {
      zh: '不允许只给"高/中/低"；概率必须可到期验证。',
      en: 'No bare "high/medium/low"; probabilities must be resolvable at a deadline.',
    },
    example: {
      zh: '预测竞品三个月内会不会降价，给一个具体概率而不是"可能"。',
      en: 'Predict whether competitor will cut prices within 3 months—give a number, not "maybe".',
    },
    exampleWalkthrough: {
      zh: '场景：预测"竞品 X 在 3 个月内降价 10% 以上"。\n\n1. 基准率：过去 3 年同行业竞品在任意 3 个月窗口降价 ≥10% 的比例 ≈ 15%\n2. 本次特殊因素：\n   · 竞品刚融资（+），有钱打价格战 → 上调\n   · 他们上季度利润下滑（+）→ 可能降价引流 → 上调\n   · 但他们刚发了高端新品（-）→ 可能维持高价策略 → 下调\n3. 综合判断：从基准 15% 上调到 35%\n4. 记录：35%，截止 10 月 26 日\n\n到期后复盘：如果没降价，这个 35% 的判断是合理的（65% 概率不降价就是说大多数情况不会降）。多次积累后看校准曲线。',
      en: 'Scenario: Predict "Competitor X will cut prices ≥10% within 3 months."\n\n1. Base rate: In the past 3 years, competitors cut ≥10% in any 3-month window ~15% of the time\n2. Situation-specific factors:\n   · Competitor just raised funding (+) — may wage price war → adjust up\n   · Their profit dropped last quarter (+) → may cut to drive volume → adjust up\n   · But they just launched a premium product (-) → may maintain high pricing → adjust down\n3. Final estimate: Adjust from 15% base to 35%\n4. Record: 35%, deadline Oct 26\n\nPost-deadline review: If no cut happened, the 35% judgment was reasonable (65% said it wouldn\'t). Accumulate over time to check calibration curve.',
    },
    depth: 'guided',
  },
  {
    id: 'pert',
    name: { zh: 'PERT / CPM 排程', en: 'PERT / CPM' },
    purpose: {
      zh: '把目标拆成有依赖的任务，找出关键路径和真实周期',
      en: 'Decompose into dependent tasks, find the critical path and real duration',
    },
    taskTypes: ['planning', 'learning'],
    introduction: {
      zh: 'PERT（计划评审技术）和 CPM（关键路径法）是项目排期工具。核心思想：把一个大目标拆成多个任务，标明谁依赖谁（B 必须在 A 做完后才能开始），然后找出最长的那条依赖链——这就是"关键路径"，它决定了项目最短工期。不在关键路径上的任务有"浮动时间"，可以延迟而不影响整体。适合你需要排期但不确定"到底要多久"的场景。',
      en: 'PERT (Program Evaluation and Review Technique) and CPM (Critical Path Method) are project scheduling tools. Core idea: break a big goal into tasks, mark dependencies (B can\'t start until A finishes), then find the longest dependency chain — the "critical path" — which determines minimum project duration. Tasks not on the critical path have "float" — they can be delayed without affecting the whole. Use when you need to schedule but aren\'t sure "how long will this really take."',
    },
    whenToUse: {
      zh: '你有一个大目标要在限定时间内完成，涉及多个并行/串行的子任务。触发信号："这个项目到底要多久"、"哪些事情可以同时做"、"如果 X 延迟了会影响什么"、"deadline 能不能赶上"。',
      en: 'You have a big goal to complete within a deadline, involving multiple parallel/serial subtasks. Trigger signals: "how long will this project really take," "what can be done in parallel," "if X is delayed, what else is affected," "can we meet the deadline."',
    },
    whenNotToUse: {
      zh: '任务之间没有依赖关系（都是独立的）——直接用 ABC 排优先级就行。或者范围还没确定（"做什么"还没定清楚）——先定义范围再排期。',
      en: 'Tasks have no dependencies (all independent)—just use ABC to prioritize. Or scope isn\'t defined yet ("what to build" is unclear)—define scope before scheduling.',
    },
    vsOtherMethods: {
      zh: 'PERT vs ABC：ABC 回答"先做哪个"（优先级），PERT 回答"什么时候做什么"（时间线）。没有依赖关系时用 ABC 排序就够，有依赖关系时必须用 PERT 画出网络。\nPERT vs DMAIC：DMAIC 改进已有流程，PERT 规划新项目的执行顺序。一个是"怎么做得更好"，一个是"怎么排得更准"。',
      en: 'PERT vs ABC: ABC answers "which first" (priority); PERT answers "when to do what" (timeline). No dependencies → ABC is enough; with dependencies → PERT network required.\nPERT vs DMAIC: DMAIC improves existing processes; PERT schedules new project execution. One is "how to do better," the other is "how to schedule accurately."',
    },
    requiredInputs: [
      { zh: '最终要交付的成果', en: 'The final deliverable' },
      { zh: '截止时间', en: 'The deadline' },
      { zh: '主要任务和它们之间的先后依赖', en: 'Major tasks and their dependencies' },
    ],
    steps: [
      { zh: '列出所有需要完成的任务', en: 'List all tasks that need to be done' },
      {
        zh: '标明依赖关系（哪些任务必须等别的完成后才能开始）',
        en: 'Mark dependencies (which tasks must wait for others)',
      },
      {
        zh: '估计每个任务的工期（乐观/最可能/悲观三点估计）',
        en: 'Estimate duration for each task (optimistic/most-likely/pessimistic)',
      },
      { zh: '画出网络图，计算最早/最晚开始时间', en: 'Draw the network, compute earliest/latest start times' },
      {
        zh: '找出关键路径（浮动为 0 的链），计算总工期',
        en: 'Identify critical path (zero-float chain), compute total duration',
      },
    ],
    outputs: [{ zh: '期望工期、关键路径、浮动时间', en: 'Expected durations, critical path, and slack' }],
    caution: {
      zh: '工期必须由执行者确认，LLM 只能提出候选任务拆分。',
      en: 'Durations must be confirmed by the people doing the work; the LLM only drafts task breakdowns.',
    },
    example: {
      zh: '要在两个月内上线 MVP，有设计、开发、测试三条线，怎么排期？',
      en: 'Ship MVP in 2 months with design, dev, and QA tracks—how to schedule?',
    },
    exampleWalkthrough: {
      zh: '场景：8 周内上线 MVP。\n\n任务拆解：\nA. 需求确认（1 周）→ 无依赖\nB. UI 设计（2 周）→ 依赖 A\nC. 后端开发（4 周）→ 依赖 A\nD. 前端开发（3 周）→ 依赖 B\nE. 联调测试（1 周）→ 依赖 C 和 D\nF. 修复 + 上线（1 周）→ 依赖 E\n\n路径分析：\n路径 1：A→B→D→E→F = 1+2+3+1+1 = 8 周\n路径 2：A→C→E→F = 1+4+1+1 = 7 周\n\n关键路径：路径 1（8 周），刚好卡住 deadline。\n结论：UI 设计和前端不能延期，否则必定超期。后端有 1 周浮动。',
      en: 'Scenario: Ship MVP in 8 weeks.\n\nTask breakdown:\nA. Requirements (1 wk) → no dependency\nB. UI design (2 wks) → depends on A\nC. Backend dev (4 wks) → depends on A\nD. Frontend dev (3 wks) → depends on B\nE. Integration test (1 wk) → depends on C and D\nF. Fix + deploy (1 wk) → depends on E\n\nPath analysis:\nPath 1: A→B→D→E→F = 1+2+3+1+1 = 8 weeks\nPath 2: A→C→E→F = 1+4+1+1 = 7 weeks\n\nCritical path: Path 1 (8 weeks), exactly meets deadline.\nConclusion: UI design and frontend cannot slip or we miss the deadline. Backend has 1 week of float.',
    },
    depth: 'interactive',
  },
]

export const methodRegistryMap: ReadonlyMap<MethodId, MethodSpec> = new Map(
  methodRegistry.map((spec) => [spec.id, spec]),
)

export function getMethodSpec(id: MethodId): MethodSpec {
  const spec = methodRegistryMap.get(id)
  if (!spec) throw new Error(`Unknown method id: ${id}`)
  return spec
}
