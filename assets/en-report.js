/* English labels for the report presentation, independent of stored financial records. */
(() => {
  const text = Object.create(null);
  function add(lines) {
    for (const line of lines.trim().split('\n')) {
      const separator = line.indexOf('|');
      text[line.slice(0, separator)] = line.slice(separator + 1);
    }
  }
  add(`
全部为虚构示例|Fictional example
再来一个|Another example
报告期间|Reporting period
所有模块按此期间展示|Applies to the whole report
下载报告|Download report
打印 / PDF|Print / PDF
财务总览|Financial overview
一眼看懂生意做得怎么样|How the business is doing
/ 100 管理评分|/ 100 management score
/ 100 观察评分|/ 100 observation score
风险 <60|At risk <60
健康 ≥80|Healthy ≥80
关注|Watch
稳健|Healthy
风险|At risk
低刻度|Low
高刻度|High
参考|Reference
自定义管理评分 · 点击查看依据 ↗|Management score · View criteria ↗
查看本期优先行动 ↗|View priorities for this period ↗
现在最该关心的|What needs attention
回款效率|Collections
来源分散|Diversification
指标来自本份虚构账本。|Figures are based on this fictional ledger.
已知指标如实展示，缺失资料待补充。|Metrics use the records provided. Add missing information as needed.
期末账户余额|Closing cash balance
账上现金，未扣待付款。|Cash on hand before pending payments.
本期经营收款|Operating receipts
本期经营付款|Operating payments
本期经营现金结余|Operating cash surplus
本期净利润率|Net profit margin
本月经营收款|Monthly operating receipts
本月经营付款|Monthly operating payments
本月经营现金结余|Monthly operating cash surplus
本月净利润率|Monthly net profit margin
净利润率|Net profit margin
已提供月份净利润率|Net margin for recorded months
现金口径|Cash basis
看板收支口径|Dashboard cash basis
按看板收支口径汇总，四类排除项单列。|Dashboard totals exclude four transaction types listed separately.
纳入看板的收款减付款，不等于账务利润或现金净变动。|Receipts less payments included in the dashboard. Accounting profit and total net cash movement are calculated separately.
来自账务资料，区别于看板收支结余。|Calculated from accounting records.
现金可支撑|Cash runway
按本期月均付款静态估算|Based on average monthly payments this period
按本月付款静态估算|Based on this month's payments
没有新收款，还能支撑多久。|How long cash would last without new receipts.
个月|months
现金流|Cash flow
接下来手头还有多少钱|How much cash will be available?
经营收支|Operating cash activity
本期收款分配|Allocation of receipts
本月收款分配|Allocation of monthly receipts
收到的钱怎么分|How receipts are used
稳定支出|Fixed spending
弹性支出|Flexible spending
结余|Surplus
推演分类：已选分类作为弹性支出 · 可在沙盘中调整范围|Selected categories count as flexible spending. Adjust them in the scenario settings.
月度收支|Monthly cash activity
每月收多少、花多少|Receipts and payments by month
经营收款|Operating receipts
经营付款|Operating payments
净利润率 · 折线|Net profit margin · line
经营现金结余|Operating cash surplus
悬停任意柱子显示全部收支金额；移到折线上显示全部净利润率。移出绘图区隐藏，点击收款或付款柱查看对应明细。|Hover over a bar to see amounts or the line to see margins. Select a bar for its underlying transactions.
沙盘推演|Cash scenarios
恢复默认|Reset
收入变化|Change in receipts
客户付款|Customer payment timing
弹性支出范围|Flexible spending categories
6 个月后预计结余|Projected balance after six months
拖动滑块查看现金变化|Adjust the sliders to explore cash changes
按所选期间月均收支推演|Based on average monthly receipts and payments for the selected period
弹性支出按选定分类计算|Flexible spending uses the selected categories
按纳入看板的收支推演 · 未自动加入投资、还款及其他排除项|The scenario uses dashboard cash flows. Investments, debt repayments and other excluded transactions are handled separately.
未来 6 个月现金预测|Six-month cash forecast
账上现金（历史）|Historical cash balance
账上现金（推演）|Projected cash balance
··· 安全线|··· Cash buffer
预测区间|Forecast period
应收账款|Accounts receivable
还有哪些钱没收回来|Which payments are outstanding?
台账补充 · 不计入现金收入|Supplementary receivables ledger · excluded from cash receipts
回款记录 · 不重复计入现金收入|Collection records · receipts counted only once
回款构成|Collections breakdown
已收|Collected
未到期|Not yet due
逾期|Overdue
客户应收明细|Receivables by customer
渠道应收明细|Receivables by channel
到账明细|Receipts detail
客户|Customer
应收余额|Outstanding balance
占比|Share
已收占比|Share of collections
约定账期|Payment terms
实际平均|Average days to pay
逾期金额|Overdue amount
状态|Status
建议动作|Suggested action
日期待补充|Date needed
存在逾期|Overdue
确认回款日期|Confirm payment date
到期前提醒|Remind before due date
已收齐|Paid in full
按约定继续合作|Continue as agreed
按计划完成服务|Deliver the service as planned
核对结算到账|Verify settlement
核对到账记录|Check the deposit
已收款日期待核对|Receipt dates need review
尚未回款|No payment yet
实际平均按有日期的回款金额加权计算|Average days to pay is weighted by the amount of dated receipts
点击查看原始应收记录|Select a row to see the underlying receivables
收入|Income
钱都是从哪里来的|Where receipts come from
期间收款|Receipts for the period
收入来源|Sources of income
金额 · 占比|Amount · share
收入构成|Income breakdown
收款明细|Receipts detail
大额|Large amounts
退款|Refunds
薪酬|Payroll
导出 Excel|Export to Excel
收起|Collapse
展开|Expand
交易时间|Transaction time
交易对象|Counterparty
收款金额|Amount received
上一页|Previous
下一页|Next
成本|Costs
钱都花在哪里了|Where the money goes
期间付款|Payments for the period
成本分类|Cost categories
成本构成|Cost breakdown
付款明细|Payment details
订阅|Subscriptions
分期|Installments
付款金额|Amount paid
经营分析|Business analysis
收入花完还能剩多少|What remains after expenses?
收入与成本桑基图|Flow of receipts and spending
经营结余|Operating surplus
点击节点或色带查看明细|Select a category or band to see details
退款入账计入收入；投资理财、信用还款、他人代付和本人资金互转不计入收入和支出。退款按原始到账方向计入，原文件标为不计收支的记录保留原分类。原始流水与实际资金变动仍保留；账务利润和资产负债按另行提供的账务资料计算。|Incoming refunds count as receipts. Dashboard totals exclude investments, credit repayments, third-party payments and transfers between your accounts. Refunds follow their original cash direction and source classification. Original transactions remain available. Profit and balance-sheet figures use separate accounting records.
累计可分配利润|Cumulative distributable profit
本期赚的加上以前留下的|This period's earnings plus amounts carried forward
今年赚的加上以前留下的|This year's earnings plus amounts carried forward
查看明细|View details
营业收入|Operating revenue
成本与费用|Costs and expenses
税前利润|Profit before tax
减：演示税费|Less: illustrative tax expense
本期净利润|Net profit for the period
减：已分配利润|Less: profit distributed
减：其他分配调整|Less: other distribution adjustments
本期留存利润|Earnings retained this period
期初结转|Opening amount carried forward
上年结转|Prior-year amount carried forward
累计可分配利润 · 估算|Estimated cumulative distributable profit
期初结转加本期留存|Opening carryforward plus earnings retained this period
期末累计利润不等于可提取现金|Cumulative earnings and cash available to withdraw can differ
独立账务口径，不等同于看板收支结余|Based on accounting records, separately from dashboard cash flows
按独立账务资料计算，不套用看板收支排除规则。|Calculated from accounting records using their own transaction classifications.
分析建议|Insights and actions
哪些问题需要先处理|What to address first
财务健康五维评分|Five measures of financial health
越靠外越接近管理目标 · 点击看依据|Values nearer the edge are closer to the management target. Select a measure for details.
本企业|This business
本报告|This report
管理关注线|Management threshold
盈利能力|Profitability
现金安全|Cash runway
成本控制|Cost control
综合评分|Overall score
/ 100 · 自定义管理基准|/ 100 · project-defined benchmark
逐项解读|Measures explained
详细分析|Detailed analysis
所选期间经营。|Operating performance.
现金与预测。|Cash and forecast.
回款与未收。|Collections and receivables.
成本与投入。|Costs and spending.
优先处理|High priority
按计划|On track
核对主要收款来源|Review the main source of receipts
预期效果：将收入与相应交易、服务或成本对应，避免重复计算。|Expected effect: match receipts to the underlying transactions, services or costs to avoid counting them twice.
所选期间统一计算 · 五项等权的演示管理规则 · 收支已按看板口径排除四类交易 · 利润与资产按原账务资料|Calculated for the selected period. The five illustrative measures carry equal weight. Dashboard cash totals exclude four transaction types. Profit and assets come from accounting records.
查看评分口径 ↗|View scoring criteria ↗
税务状态：待核验|Tax status: review needed
· 展开4项账税核验明细|· Show four accounting and tax checks
税费计提与缴纳|Tax accrued and paid
待核验 ↗|Review needed ↗
税费列示口径|Basis of tax presentation
成本付款凭证|Expense documentation
主体与纳税身份|Entity and tax status
数据为虚构演示，核验事项随本份账本展示。|The example is fictional. The checks shown relate to this ledger.
财务报表|Financial statements
算清赚了多少钱和有多少家底|Earnings, assets and obligations
补充账务 · 管理报表示例|Supplementary accounting records · sample management statements
补充账务 · 管理报表|Supplementary accounting records · management statements
利润表|Income statement
资产负债表|Balance sheet
现金流量表|Cash flow statement
权责发生制 · 管理展示格式 · 独立账务口径|Accrual basis · management presentation · separate accounting records
单位：人民币万元|Amounts in CNY 10,000s
项目|Item
本期合计|Current period
上期合计|Prior period
变动额|Change
一、营业收入|I. Operating revenue
减：营业成本|Less: cost of sales
毛利|Gross profit
减：期间费用|Less: operating expenses
二、营业利润|II. Operating profit
三、利润总额|III. Profit before tax
减：所得税费用|Less: income tax expense
四、净利润|IV. Net profit
未提供完整前一等长期间账务数据，比较栏及变动额显示“—”。|Accounting data for the preceding period of equal length is incomplete. Comparative amounts and changes are shown as dashes.
账务利润按已提供的账务资料计算，投资损益等按原账务列示，不计入看板的收入和支出。|Accounting profit follows the supplied records. Investment gains and losses appear in the accounts and are excluded from dashboard receipts and payments.
资产＝负债＋所有者权益|Assets = liabilities + equity
期末余额|Closing balance
期初余额|Opening balance
资产|Assets
货币资金|Cash and cash equivalents
存货|Inventory
流动资产合计|Total current assets
固定资产净值|Net fixed assets
其他资产|Other assets
资产总计|Total assets
负债|Liabilities
应付账款|Accounts payable
应交税费|Taxes payable
借款|Borrowings
其他负债|Other liabilities
负债合计|Total liabilities
所有者权益|Owner's equity
实收资本|Paid-in capital
未分配利润|Retained earnings
所有者权益合计|Total equity
负债与所有者权益总计|Total liabilities and equity
现金收付口径 · 直接法简表|Cash basis · simplified direct method
一、经营活动现金流量|I. Cash flows from operating activities
销售商品、提供劳务及其他经营收到的现金|Cash received from sales, services and other operations
经营活动支付的现金|Cash paid for operating activities
经营活动现金流量净额|Net cash from operating activities
二、投资活动现金流量|II. Cash flows from investing activities
处置资产等收到的现金|Cash received from asset disposals and other investing activities
购建资产等支付的现金|Cash paid to acquire or construct assets
投资活动现金流量净额|Net cash from investing activities
三、筹资活动现金流量|III. Cash flows from financing activities
吸收投资、借款收到的现金|Cash received from capital contributions and borrowings
偿还债务、分配利润支付的现金|Cash paid for debt repayments and profit distributions
筹资活动现金流量净额|Net cash from financing activities
四、现金及现金等价物净增加额|IV. Net change in cash and cash equivalents
加：期初现金及现金等价物余额|Add: opening cash and cash equivalents
五、期末现金及现金等价物余额|V. Closing cash and cash equivalents
未提供完整前一等长期间现金流水，比较栏及变动额显示“—”。|Cash records for the preceding period of equal length are incomplete. Comparative figures and changes are shown as dashes.
本表完整保留实际资金流，包括不计入看板收支的投资理财、信用还款、他人代付及本人资金互转；原始活动分类与看板排除原因分别保留。|This statement includes all recorded cash movements, including investments, credit repayments, third-party payments and transfers between your accounts. It preserves each original classification and the reason for any exclusion from dashboard totals.
账务利润及实际资金流独立列示，不套用看板收支排除规则。仅凭收付流水不能生成完整账务报表，还需补充应收应付、期初账务、折旧与税费。|These statements use accounting records and actual cash flows. Complete accounting statements also require receivables, payables, opening balances, depreciation and tax records.
查看账务利润原始明细|View accounting profit records
查看应收明细原始明细|View receivables records
查看资产负债原始明细|View balance-sheet records
开始你的报告|Start your report
用自己的账单生成报告|Build a report from your statements
随机体验与我的报告各自保留数据|Examples and your personal ledger are stored separately
我的报告|My report
查看当前期间原始记录|View source records for this period
收支口径|Cash reporting rules
退款入账计入收入。投资理财、信用还款、他人代付、本人资金互转不计入收入和支出。|Incoming refunds count as receipts. Dashboard totals exclude investments, credit repayments, third-party payments and transfers between your accounts.
按已识别的交易用途汇总，原始记录完整保留。原账单标记为不计收支的中性退款仍按原始记录单列；账务利润与实际资金流独立列示。|Totals use the identified transaction purpose and preserve the original records. Refunds marked neutral in the source remain separate. Accounting profit and actual cash movement are reported separately.
有数 · 一页看清经营 ｜ 全部为虚构示例 · 图表与报表沿用本份账本的数据口径|Youshu · Business at a glance | Fictional example. Charts and financial statements use the reporting rules for this ledger.
有数 · 一页看清经营 ｜ 文件仅在本机处理 · 报告按已提供资料展示|Youshu · Business at a glance | Files are processed on this device. Reports reflect the records provided.
关闭|Close
选择推演时可以增减的支出分类|Choose the spending categories that can change in this scenario
`);
  add(`
净利润|Net profit
本期收入|Revenue for the period
本期成本与费用|Costs and expenses for the period
本期税费|Tax for the period
本期已分配|Distributed this period
本期留存|Retained this period
期末累计留存|Closing retained earnings
期末现金|Closing cash
期初现金|Opening cash
现金净变动|Net change in cash
账户数量|Number of accounts
所选期间月均付款|Average monthly payments for the selected period
现金可支撑（月）|Cash runway (months)
月均支出|Average monthly spending
收入占比|Share of receipts
待补充|Additional records needed
待核对|Needs review
待核验|Unverified
未提供|Not provided
本期暂无支出|No payments this period
待确认余额|Balance unconfirmed
账上现金|Cash balance
稳定支出分类|Fixed spending categories
所选期间|Selected period
本期优先行动|Priorities for the period
行动|Action
依据|Basis
预期效果|Expected effect
维度|Measure
当前指标|Current reading
分数|Score
计算规则|Calculation rule
当前行动|Action
情景效果|Scenario outcome
成立条件|Assumptions
内容|Item
解读|Interpretation
数据来源|Data source
计量口径|Measurement basis
核对事项|Items to verify
管理演示评分|Illustrative management score
建议根据本份虚构账本生成。|Suggestions are derived from this fictional ledger.
建议根据已提供的资料生成。|Suggestions are derived from the supplied records.
业务|Service
未收金额|Outstanding amount
余额确认日|Balance confirmation date
业务日期|Service date
约定回款日|Payment due date
到账日期|Payment date
收入科目|Revenue category
记录金额|Recorded amount
已收金额|Amount collected
对应流水|Matching transaction
收入确认日期|Revenue recognition date
开票日期|Invoice date
业务科目|Service category
应收金额|Amount billed
到期日期|Due date
回款记录|Payment records
服务与回款|Services and collections
已收金额与现金流水逐笔对应。|Collections are matched to individual cash transactions.
金额（元）|Amount (CNY)
金额|Amount
数值|Value
日期|Date
备注|Notes
原始记录|Source records
名称|Name
交易日期|Transaction date
说明|Description
当前现金|Current cash
累计推演收款|Cumulative projected receipts
累计推演付款|Cumulative projected payments
推演期末现金|Projected closing cash
收款来源|Receipt source
该来源收款|Receipts from this source
截止日期|As-of date
统计期间|Reporting period
所选月数|Months selected
月均付款|Average monthly payments
期初待收|Opening receivables
本期已收|Collected this period
期末未收|Closing receivables
其中逾期|Of which overdue
期间成本与费用|Costs and expenses for the period
期间收入|Period revenue
费用率|Expense ratio
前一等长期间费用率|Previous comparable expense ratio
逾期来源|Overdue customer
无|None
所选期间结余或净利润占收入的比例，按演示目标换算为0—100分；不是收益预测。|Period surplus or net profit as a share of revenue, scaled to the illustrative target on a 0–100 scale.
期末现金以截止日余额为准；企业与个人支出覆盖按所选期间月均支出与6个月演示刻度计算；投资画像以现金占资产20%为演示刻度。|Closing cash uses the reporting-date balance. For businesses and individuals, the illustrative target covers six months of average payments. For investors, the target is cash of 20% of assets.
（1－逾期金额÷期末未收金额）×100；无未收时记100分；包含期初带入且仍待收的款项。|Score = (1 − overdue amount / closing receivables) × 100. A zero balance scores 100. Outstanding amounts carried forward are included.
按所选期间最大收款来源占比计算，20%以内100分，65%及以上0分；仅为来源集中度演示。|The largest receipt source scores 100 if its share is at most 20%, and zero at 65% or more. This is an illustrative concentration measure.
采用所选期间成本费用占收入比例；如有完整前一等长期间则比较变化。演示评分不代表审计结论。|Costs and expenses as a share of period revenue, with change measured when the preceding period has complete data. This is an illustrative score.
账务分析使用独立账务资料；投资损益等仍在账务报表中列示，不计入看板收入和支出。|Accounting analysis uses separate records. Investment gains and losses appear in the financial statements and are excluded from dashboard cash totals.
前一等长期间资料不足，暂不比较|Data for the preceding period of equal length is insufficient for comparison
沙盘按所选期间月均收付推演|The scenario uses average monthly receipts and payments for the selected period
将收入与相应交易、服务或成本对应，避免重复计算。|Match receipts to the underlying transactions, services or costs to avoid double counting.
按期末现金与本期月均付款估算。|Estimated from closing cash and average monthly payments.
确认账户余额|Confirm account balances
点击核对或修改各账户余额。|Select to check or update account balances.
本期收款|Receipts this period
本期付款|Payments this period
本期收支结余|Cash surplus this period
本期收支差额|Net receipts less payments
收入变化与付款时间均为情景假设，已填计划可切换查看。|Changes in receipts and payment timing are scenario assumptions. Switch modes to see dated plans.
现金增减（推演）|Projected change in cash
仅按已填收付款计划试算|Based only on the entered payment schedule
先确认手头有多少钱|Confirm the available cash balance
余额已确认|Balance confirmed
余额已部分补充|Some balances provided
已有收支仍可正常查看|Recorded receipts and payments are available
已补充付款后的现金|Cash after scheduled payments
补充付款计划|Add planned payments
编辑余额|Edit balances
编辑计划|Edit plans
先看已有收支 其他资料可以以后补|Review your recorded cash flows and add other records later.
不适用|Not applicable
暂无支出|No payments
当前调整未改变预计金额|The adjustment leaves the projected amount unchanged
当前组合对预测金额没有净影响|The combined adjustments have no net effect on projected cash
弹性支出范围尚未选择|Flexible spending categories have not been selected
本期所选分类没有支出|No spending in the selected categories this period
请先选择弹性支出范围|Choose flexible spending categories first
本期没有可调整的收款|No receipts to adjust this period
6个月后总额不变|The six-month total is unchanged
期末总额不变|The ending balance is unchanged
6 个月累计现金变化|Six-month change in cash
账务口径|Accounting basis
当前期间|Current period
完整账务|Complete accounts
当前资料|Available records
金额：元。流水按用户提供的原始记录显示；内部转账计入账户流动，不计经营收支。|Amounts in CNY. Transactions follow the supplied records. Transfers between accounts affect individual balances and are excluded from operating receipts and payments.
当前范围没有已识别的排除项。以上记录保留原始方向与金额，不计入看板收入和支出。账务利润及实际资金流按各自口径保留；普通转账等用途不明的记录仍需核对。|No exclusions were identified in this range. Excluded entries retain their original direction and amount. Accounting profit and actual cash flows use their own definitions. Transfers with an unclear purpose need review.
以上记录保留原始方向与金额，不计入看板收入和支出。账务利润及实际资金流按各自口径保留；普通转账等用途不明的记录仍需核对。|These records retain their original direction and amount and are excluded from dashboard totals. Accounting profit and actual cash flows use their own definitions. Transfers with an unclear purpose need review.
排除类别|Exclusion category
原始流入（元）|Source inflow (CNY)
原始流出（元）|Source outflow (CNY)
其他原始金额（元）|Other source amount (CNY)
排除依据|Reason for exclusion
来源|Source
日期待核对|Date needs review
全部月份|All months
到期前关注|Monitor before due date
余额日期|Balance date
账务利润|Accounting profit
应收明细|Receivables detail
资产负债|Assets and liabilities
收支差额|Net cash activity
本人互转|Transfers between own accounts
投资理财|Investments
信用还款|Credit repayments
他人代付|Third-party payments
未分类|Uncategorized
账单与补录|Statements and supplementary records
历史余额来自已识别的账户余额|Historical balances use identified account balances
按已上传流水推算|Estimated from imported transactions
未填按0暂计|Missing balance provisionally set to zero
历史余额含按已上传流水推算的金额；未填账户按0暂计，点击数据点查看依据|Historical balances include estimates from imported transactions. Missing balances provisionally use zero. Select a point for details.
仅按已填写且有日期的收付款计划推演，不叠加历史月均收付，未填日期的应收不假设到账时间。|This scenario uses only scheduled, dated receipts and payments. Historical averages are excluded and undated receivables have no assumed collection date.
收入变化与付款时间均为情景假设，已填计划可切换查看。|Receipt amounts and timing are scenario assumptions. Switch modes to see dated plans.
账务利润及实际资金流独立列示，不套用看板收支排除规则。|Accounting profit and actual cash flows use separate reporting rules.
仅凭收付流水不能生成完整账务报表，还需补充应收应付、期初账务、折旧与税费。|Complete financial statements also need receivables, payables, opening balances, depreciation and taxes.
收付款流水|Cash transactions
应收台账|Receivables ledger
账务资料|Accounting records
资料覆盖|Record coverage
收支范围|Cash activity covered
主要来源|Main sources
主要支出|Main spending
观察范围|Coverage
可关注|Monitor
需跟进|Follow up
记录清晰|Record clarity
收支比例|Receipts vs. payments
现金缓冲|Cash buffer
交易节奏|Transaction timing
收付节奏|Cash flow timing
收付稳定|Cash flow stability
收款分散|Receipt diversification
付款分散|Payment diversification
单笔分散|Transaction concentration
样本有限|Limited sample
已计算|Calculated
样本有限 · 初步观察|Limited sample · preliminary observations
基于已提供记录|Based on the supplied records
记录观察评分|Record quality score
收支观察评分|Cash activity score
80分参考刻度|80-point reference
已有资料评分|Score for available records
/ 100 · 当前五项指标平均分|/ 100 · average of the five available measures
从最大支出分类开始检查|Review the largest spending category
关注主要收款来源|Review the largest receipt source
跟进已录入的逾期款|Follow up on overdue receivables
按现有记录查看变化情景|Explore scenarios based on these records
查看本期最大一笔记录|Review the largest transaction this period
核对暂不清楚的交易|Review unclear transactions
先核对主要付款|Review major payments
核对本月增加的付款|Review the increase in payments
检查规律性付款是否仍需要|Review recurring payments
日期可读|Dates available
账户可辨|Accounts identified
对象清晰|Counterparties identified
分类清晰|Categories identified
金额可核|Amounts verifiable
财务报表类型|Financial statement type
税费列示口径|Tax reporting basis
凭证核验|Document verification
付款来源|Payment sources
付款记录|Payment records
账务税费|Tax expense on the books
已记录税费付款|Recorded tax payments
期末应交税费|Closing taxes payable
本份虚构账本|This fictional ledger
报告名称|Report name
账户范围|Accounts included
税务状态|Tax status
资料状态：待核验|Records: review needed
仅根据当前资料列出需要核对的项目。|These checks are based on the records provided.
零税费记录不能单独证明免税或无需申报。|A zero tax amount alone does not establish exemption or remove a filing obligation.
现金流水用于核对付款，不替代合同、发票或其他业务凭证。|Cash records verify payments. Contracts, invoices and other supporting documents should also be reviewed.
核对所属期、申报记录和实际缴款情况|Check the reporting period, tax filings and payments
当前全部为虚构示例，实际信息需以用户提供的资料核对。|This example is fictional. Verify actual information against the user's documents.
`);

  add(`
本年累计|Year to date
上年同期|Same period last year
其他收入|Other revenue
一、已实现收益收入|I. Realized investment income
减：已实现亏损|Less: realized losses
扣除已实现亏损后收益|Income after realized losses
减：投资费用|Less: investment expenses
二、已实现收益结余|II. Realized earnings
三、税前已实现净收益|III. Realized income before tax
四、已实现净收益|IV. Realized net income
一、税后与副业收入|I. After-tax pay and side income
减：副业成本|Less: side-business costs
扣除副业成本后收入|Income after side-business costs
减：生活支出|Less: living expenses
二、收支结余|II. Net cash surplus
三、另列税费前结余|III. Surplus before separately recorded taxes
四、收支结余|IV. Net cash surplus
减：另行列支税费|Less: separately expensed taxes
尚未提供该期间的账务资料，不能由现金收支推算利润。|Accounting records for this period are missing. Receipts and payments alone cannot establish profit.
未提供完整上年同期账务数据，比较栏及变动额显示“—”。|Last year's comparable accounting records are incomplete. Comparatives and changes appear as dashes.
只计已实现损益与费用，本金买卖和未实现涨跌不计入收益。|Earnings include realized gains, losses and expenses. Principal transactions and unrealized changes are excluded.
工资按税后到账记录，副业及生活支出按实际收付记录。|Salary uses net pay received. Side-business and living expenses use actual cash records.
个人收支口径|Personal cash basis
管理展示格式|Management presentation
权责发生制|Accrual basis
独立账务口径|Separate accounting records
前一等长期间|Preceding period of equal length
本年期初|Beginning of year
本期期初|Beginning of period
持仓资产成本|Investments at cost
待付税费|Tax awaiting payment
借款余额|Outstanding loans
净资产|Net assets
期初本金与追加投入|Opening principal and contributions
累计已实现净收益|Cumulative realized net earnings
累计收支结余|Cumulative cash surplus
净资产合计|Total net assets
负债与净资产总计|Total liabilities and net assets
尚未提供资产负债资料，余额显示“—”。|Balance-sheet data is missing. Unavailable balances appear as dashes.
上年末|End of previous year
持仓按成本列示，未计市场估值浮动。|Investment holdings are stated at cost, excluding changes in market value.
年初余额|Opening balance for the year
资产＝负债＋净资产|Assets = liabilities + net assets
一、原始账单收支（待分类）|I. Source statement cash flows awaiting classification
一、已实现收益与费用现金流量|I. Cash flows from realized returns and expenses
一、收入与日常支出现金流量|I. Cash flows from earnings and daily spending
原始记录收款|Receipts per source records
原始记录付款|Payments per source records
原始收支差额|Net receipts less payments per source records
已实现收益收到的现金|Cash received from realized returns
工资及副业收到的现金|Cash received from salary and side income
投资费用与已实现亏损|Investment expenses and realized losses
生活与副业支付的现金|Cash paid for living and side-business expenses
收支现金流量净额|Net cash from receipts and payments
卖出收回的本金|Principal recovered on sale
买入投资支付的本金|Principal paid for investments
追加本金及借款收到的现金|Cash received from additional capital and loans
提取本金、偿还借款支付的现金|Cash paid for capital withdrawals and loan repayments
内部转账净变动（待核对）|Net change from internal transfers (review required)
四、原始账单收支差额|IV. Net cash activity per source statements
尚未提供该期间现金流水，金额显示“—”。|Cash records for this period are missing. Unavailable amounts appear as dashes.
本年累计仅汇总已提供的流水，月份覆盖不完整，期末现金不作推算。|Year-to-date totals include supplied transactions only. Closing cash is not estimated when months are missing.
未提供完整上年同期现金流水，比较栏及变动额显示“—”。|The corresponding prior-year cash records are incomplete. Comparative amounts and changes appear as dashes.
未确认本年期初现金，期初和期末余额不由流水差额代替。|Opening cash for the year is unconfirmed. The net cash movement cannot establish opening and closing balances.
原始账单尚未完成经营、投资、筹资分类，活动分类行不自动填零。|Operating, investing and financing categories have not yet been assigned. Unclassified activity totals remain blank.
买卖结算拆分本金与已实现损益，不重复计入收入或费用；本表不是投资收益预测。|Trade settlements distinguish principal from realized gains and losses. This statement reports actual cash flows.
原始账单收付 · 活动分类待补充|Source cash movements · activity classification needed
报表项目|Statement item
其他调整|Other adjustments
资料不足 · 未评分|Insufficient data to score
本期没有计入收支的交易，先展示原始记录的可读性。|No transactions are included in cash activity for this period. The score reflects the clarity of the source records.
尚无可分析的收付流水。|No receipt or payment records are available.
没有流水时不填入假定分数。|A score requires transaction data.
补充的余额或应收资料会保留；收支观察需要至少一笔流水。|Recorded balances and receivables are retained. Cash activity analysis requires at least one transaction.
可读取交易日期|Readable transaction dates
可辨认账户|Identifiable accounts
明确交易对象|Identifiable counterparties
明确交易分类|Identifiable categories
提供有效金额|Valid amounts present
原始记录质量|Source record quality
符合此项的原始记录数÷本期原始记录数×100。|Matching source records divided by all source records for the period × 100.
仅衡量已提供记录的可读性，不评价投资表现、收入或支出。|This score measures the readability of the supplied records.
已提供收入÷（已提供收入＋已提供支出）×100；收支相等为50。只反映已提供记录的结构，未上传的收支未知。|Recorded receipts / (recorded receipts + recorded payments) × 100. Equal receipts and payments score 50. Only supplied records are included.
已提供收入|Recorded receipts
已提供支出|Recorded payments
已提供收支|Recorded cash activity
已知账户现金÷完整基准月平均付款÷6×100，限制在0—100。6个月为本软件的观察刻度，不是行业要求。|Known cash / average monthly payments in complete baseline months / 6 × 100, capped at 100. Six months is the app's reference.
已知余额与历史付款|Known balances and historical payments
已知现金|Known cash
基准月均付款|Average monthly baseline payments
参考月数|Reference months
（1－最大一笔收付金额÷已提供收付合计）×100。衡量单笔集中程度，不替代现金安全判断。|(1 − largest transaction / total cash activity) × 100. This measures transaction concentration.
样本很少时集中度自然较高，不据此判定风险。|Small samples often have higher concentration. More records are needed to assess risk.
可结合业务周期核对大额交易。|Check large transactions against the business cycle.
最大一笔|Largest transaction
收付合计|Total receipts and payments
现金缓冲资料不足时观察单笔集中度|When cash buffer data is incomplete, this measure shows transaction concentration.
已录回款|Collections recorded
已确认没有应收款|No receivables confirmed
（1－有到期日期的逾期未收金额÷有到期日期的未收金额）×100。明确确认无应收为100；未知日期或未录款项不进入计算。|(1 − overdue dated receivables / all dated receivables) × 100. Confirmed zero receivables score 100. Undated and unrecorded items are excluded.
仅表示用户已确认本报告截止日没有应收款。|The user confirmed no receivables at the reporting date.
有到期日的未收金额|Outstanding amounts with due dates
范围|Scope
已确认没有|Confirmed none
仅有到期日期的应收|Receivables with due dates only
已录应收资料|Recorded receivables
（1－各交易对象金额占比平方之和）×100。单一对象为0；是集中度观察，不代表对象质量或违约概率。|(1 − sum of squared counterparty shares) × 100. One counterparty scores zero. This is a concentration measure.
未提供可判断应收时观察交易对象分布|Counterparty distribution is used when receivables data is insufficient.
目前样本有限。|The current sample is limited.
固定工资或固定供应商也会形成集中，需结合用途理解。|A regular employer or supplier can explain concentration. Review the purpose of the payments.
（1－完整基准月份收付总额的标准差÷平均额）×100，限制在0—100。仅观察波动，季节性和增长也会带来波动。|(1 − standard deviation / mean of monthly cash activity) × 100, bounded from 0 to 100. Seasonality and growth may cause fluctuations.
完整基准月份|Complete baseline months
（1－单日最大收付金额÷本期收付合计）×100。只描述交易日期集中程度，不判断长期稳定性。|(1 − largest day's activity / total cash activity) × 100. This measures the concentration of transaction dates.
完整月份不足时观察已提供交易日|Uses recorded transaction dates when full months are unavailable.
交易对象明确比例×40＋分类明确比例×40＋日期可读比例×20。衡量已提供字段的可解释性，不证明账本已经完整。|Share with a clear counterparty × 40 + share with a clear category × 40 + share with a readable date × 20. This measures how interpretable the provided fields are.
有明确对象|Counterparty known
有明确分类|Category known
可读取日期|Date readable
本期纳入记录|Included records
已提供流水字段|Available transaction fields
首月含期初待收|First month includes opening receivables
悬停任意柱子显示收支金额；悬停蓝点显示净利润率。移出绘图区隐藏，点击收款或付款柱查看对应明细。|Hover over a bar for amounts or a blue point for the net margin. Select a bar to see the underlying transactions.
按客户核对实际到账情况和下一次付款日期。|Check actual receipts and the next payment date for each customer.
只检查已提供到期日期的应收；没有把未知日期认定为逾期。|Only receivables with a known due date are checked for overdue status.
逐项确认大额付款的用途和是否还有后续付款。|Check the purpose of each large payment and whether further payments are due.
这是已提供记录的收支差额，不等同于亏损，也不说明账户余额为负。|This difference reflects recorded cash activity. Profit and balances require separate evidence.
打开记录确认是否属于仍在使用的订阅、分期或其他固定付款。|Check the records for active subscriptions, installments or other recurring commitments.
相同对象连续至少3个月、相邻日期20—40天、单笔金额与均值偏差不超过5%；仅为候选，不自动认定订阅或重复扣费。|Candidates use the same counterparty across at least three months, 20–40 days apart, with amounts within 5% of the mean. Review them to confirm the payment type.
核对增加部分是一次性投入还是后续会持续发生。|Check whether the increase is one-off or recurring.
仅比较连续两个有完整覆盖的基准月份。|Only two consecutive, fully covered baseline months are compared.
确认这类收款是否会继续，并将已知变化用于沙盘。|Check whether these receipts will continue and use known changes in the scenario.
仅描述本期对象集中度；工资、退款和客户付款可能具有不同含义，不自动认定客户依赖风险。|Concentration describes this period. Salary, refunds and customer payments have different implications.
查看明细，先区分必要支出和可调整支出。|Review the transactions and distinguish necessary from adjustable spending.
付款不是账务成本，未判断费用合理性或可节省金额。|Cash payments and accounting costs can differ. The figures do not measure potential savings.
先核对金额较大的记录，后续分析会更容易理解。|Review the largest records first to clarify subsequent analysis.
不改变原账单的交易类别，也不会擅自删掉收支。|The source category and cash movements are retained.
日期未提供|Date unavailable
交易对象未提供|Counterparty unavailable
核对用途及是否会再次发生，再决定是否纳入未来计划。|Check the purpose and whether the payment will recur before including it in a plan.
大额仅是相对本期其他记录而言，不代表异常或风险。|Size is relative to the other records this period.
尚无可分析的流水|No transactions available to analyze
先查看已有记录；有未上传账户或月份时再继续追加。|Review available records, then add missing accounts or months.
缺失月份不当作零，历史记录不能保证未来持续。|Missing months are excluded. Future results may differ from history.
原始记录仍然保留，投资理财、信用还款、他人代付及本人互转等排除项没有转成收入和支出。|Original records are retained. Investments, credit repayments, third-party payments and own-account transfers are excluded from receipts and payments.
目前没有纳入看板的收款记录，不能据此认定实际没有收入。|No receipts are included in this dashboard. Other receipts may be absent from the records.
目前没有纳入看板的付款记录，不能据此认定实际没有支出。|No payments are included in this dashboard. Other spending may be absent from the records.
样本较少，集中度及节奏不代表长期表现。|With few records, concentration and timing may differ from long-term behavior.
各维度随可用资料调整；替代指标直接显示其实际名称。|The measures adapt to available records. Each measure is labeled by what it represents.
月份完整性待核对|Month coverage needs review
先作初步观察。|The sample supports preliminary observations.
可从主要交易和变化来源着手核对。|Start by reviewing major transactions and sources of change.
尚未填写未来收款 · 收入和时间滑块暂不影响结果|No future receipts are scheduled. Receipt and timing adjustments have no effect yet.
按纳入看板的收支试算 · 投资、还款等排除项未自动加入|Based on dashboard receipts and payments. Investments, debt repayments and other excluded flows are separate.
历史余额采用已识别值或按流水推算，未填账户按0暂计，可在余额弹窗修改|Historical balances use identified amounts or transaction-based estimates. Missing balances provisionally use zero and can be edited in account balances.
补充余额|Add a balance
核对余额|Check balances
估算模式|Forecast basis
按历史收支|Historical cash flows
按收付款计划|Dated payment plans
历史估算|Historical estimate
计划试算|Scheduled cash flows
所选分类没有可调整的支出，可修改弹性支出范围|The selected categories have no adjustable spending. Change the flexible spending categories.
当前期间原始记录|Source transactions for this period
全部原始记录|All source transactions
推演期间|Scenario period
财务报表类型|Statement type
`);

  // Templates match complete interface messages. Formatting is applied only after capture.
  const patterns = [];
  // Statement-backed reports use the same labels for bank and wallet imports.
  add(`
报告收支|Reported receipts and payments
报告收支汇总|Cash activity summary
看板收支差额|Reported net receipts
全部收入|All receipts
全部成本|All spending
收入来源构成|Receipt sources
成本分类构成|Spending categories
收付记录|cash transactions
原始交易|source transactions
其他|Other
应收|Receivables
内部转账|Internal transfer
本期收支概况|Cash activity this period
本月收支概况|Cash activity this month
按看板收支口径汇总|Includes receipts and payments counted in this report
按看板收支口径汇总。|Includes receipts and payments counted in this report.
收支结余|Net receipts
收支结余率|Net receipts as a share of receipts
收支结余不等于账户余额或营业利润|Net receipts differ from the account balance and operating profit.
收支去向|Sources and uses of cash
先填已知的资产和欠款 不用一次填完|Start with the assets and debts you know. You can add the rest later.
查看不计收支及零金额记录|View neutral and zero-amount transactions
不计收支及零金额记录|Neutral and zero-amount transactions
未计入收支|Excluded from receipts and payments
原始中性记录|Source records classified as neutral
原始交易记录|Source transactions
原始中性记录可能与上方排除记录重合，不相加计算。|Neutral records can overlap with the exclusions above. These figures should not be added together.
每份原始账单的核对信息|Reconciliation by source statement
已与文件汇总核对|Reconciled against the statement totals
按明细计算，原文件汇总不足以完整核对|Calculated from individual transactions. The statement totals are insufficient for a full reconciliation.
逐笔余额连续性核对通过|Running balances verified for each transaction
需核对余额连续性|Check the running balances
核对信息保留各文件的原始统计。余额连续性通过不等于已与银行总额核对。|Reconciliation uses each file’s own figures. A running-balance check does not verify bank statement totals.
悬停任意柱子显示全部收支金额；移出绘图区隐藏，点击收款或付款柱查看对应明细。|Hover over a bar to see receipts and payments. Select a bar to view its transactions.
报告日|Report date
本期未记录可用于估算的支出|No recorded expenses are available for this estimate.
按已提供账单估算|Based on the available statements
等待载入现有账本|Waiting for the saved ledger
沿用已保存的数据计算后显示|Figures will appear once the saved ledger is loaded.
补充资料|Add supporting records
仅展示已补充款项 不代表全部应收|Only receivables you have recorded are included.
手动补充 · 与到账流水分别保留|Manually recorded · Shown separately from bank receipts
应收款与实际到账分别核对|Reconcile receivables and actual receipts separately.
编辑补录|Edit supplementary records
已记下的待收款|Recorded outstanding amounts
客户待补充|Customer not provided
待补业务日期|Business date missing
未填回款日|Collection date missing
资料待补齐|More details needed
日期补齐后再显示回款图和逾期情况|Add the dates to see the collections chart and overdue amounts.
按已提供的资产负债快照展示|Based on the balance sheet snapshots provided
按已提供的账务资料展示|Based on the accounting records provided
查看账务明细|View accounting details
等待载入账本|Waiting for ledger
等待载入账本。|Waiting for the ledger to load.
没有对应收付款记录|No matching receipts or payments
本期没有计入看板的收款|No receipts included in this period
本期没有计入看板的付款|No payments included in this period
收起列表|Collapse list
全部来源|All sources
当前筛选下没有记录|No records match these filters
没有可用的收付款数据|No receipts or payments available
口径|Reporting basis
本期实际收款|Actual receipts this period
本月实际收款|Actual receipts this month
本期实际付款|Actual payments this period
本月实际付款|Actual payments this month
收款减付款|Receipts less payments
结余÷收款|Net receipts divided by receipts
本期纳入看板的收款减付款；收支结余不等于账务利润或账户余额。|Reported receipts less payments for this period. This difference measures cash activity, not accounting profit or the account balance.
本月纳入看板的收款减付款；收支结余不等于账务利润或账户余额。|Reported receipts less payments this month. This difference measures cash activity, not accounting profit or the account balance.
占该类支出|Share of this spending category
当前范围没有支出|No spending in this selection
按当前选中的弹性支出分类汇总。|Includes the selected flexible spending categories.
按未选为弹性支出的付款分类汇总。|Includes spending categories outside the flexible selection.
当前选中的弹性支出分类。|Selected flexible spending categories.
原报告数据|Source report figures
未来 6 个月现金增减|Projected cash movement over 6 months
历史线显示最近12个有数据月份|The historical series covers the last 12 months with records.
修改|Edit
应收款已记下|Receivable recorded
当前没有应收款|No receivables recorded
证券持仓单列资产，不列为应收账款|Securities holdings are shown separately as assets.
工资与副业按实际到账记录展示|Salary and side-business income use actual receipts.
到期日|Due date
本份报告没有未到账的应收记录。|There are no outstanding receivables in this report.
尚未提供应收台账|No receivables ledger provided
已逾期|Overdue
未逾期|Not overdue
按账期跟进|Follow up according to payment terms
收到应收台账后按原记录显示|Details appear once a receivables ledger is available.
数据按对应报告计算|Based on this report’s records
收付流水不能直接计算账务利润。|Accounting profit requires separate accounting records.
累计可分配利润不等同于现金余额。|Cumulative distributable profit differs from the cash balance.
尚未提供账务利润资料|Profit figures unavailable
尚未提供资产负债资料|No balance sheet figures available
资产合计|Total assets
权益合计|Total equity
资产－负债－权益|Assets less liabilities and equity
报表等式平衡|Assets equal liabilities plus equity
报表不平衡请核对输入项目|The balance sheet is out of balance. Review the entries.
原始现金流入|Source cash inflows
原始现金流出|Source cash outflows
现金净流入|Net cash inflow
经营活动|Operating activities
投资活动|Investing activities
筹资活动|Financing activities
内部转账（核对项）|Internal transfers for reconciliation
按活动分类汇总|Totals by activity
活动|Activity
现金流入|Cash inflows
现金流出|Cash outflows
全部合计|Grand total
原始明细|Source details
管理报表|Management statements
按上传数据的月份筛选|Filter by the months in your statements
已确认交易用途|Confirmed transaction purpose
当前范围没有已识别的排除项。|No identified exclusions in this selection.
退款入账明细|Refund receipts
看板收支结余的计算|How net receipts are calculated
当前期间 · 账单原始明细|Source transactions for the selected period
账单原始明细|Source statement transactions
原账单|Source statement
查看全部原始记录|View all source transactions
全部收入来源|All receipt sources
全部成本分类|All spending categories
原业务日期|Original business date
本期记录按开票月份分组，期初待收并入首月|Records are grouped by invoice month. Opening receivables are included in the first month.
按原始开票月份分组|Grouped by original invoice month
支出超出收入|Payments in excess of receipts
现金缺口|Cash shortfall
收付款安排还不完整 暂不推算六个月趋势|Add the remaining scheduled cash flows to see a six-month forecast.
补充余额及经营收支口径后预测|Add a balance and identify operating cash flows to see a forecast.
不把账单收支差额当作账上余额|An account balance requires separate balance information.
现金推演|Cash forecast
按所选有数据月份的平均收支推演。|Based on average receipts and payments for selected months with records.
按所选期间的月均收支推演。|Based on average monthly receipts and payments for the selected period.
按最近有流水月份的收支推演。|Based on the latest month with transactions.
未来收款均匀发生，未自动加入融资或单列应收催收。|Assumes evenly distributed future receipts. Financing and separate receivables collections are excluded.
收支推演|Cash flow forecast
现金增减试算|Projected change in cash
现金余额试算|Projected cash balance
变化起点（不代表账户余额）|Starting point for changes, separate from the account balance
累计估算收款|Total projected receipts
累计估算付款|Total projected payments
累计现金增减|Cumulative change in cash
预计账户余额|Projected account balance
当前待收款|Outstanding receivables
上次记录需要确认|Previous record needs confirmation
确认金额后会计入当前待收款|Confirm the amount to include it in outstanding receivables.
未填业务日期时展示当前分布 · 不生成历史回款记录|Undated entries appear in the current breakdown only.
待确认到期日|Due date unconfirmed
待约定回款日|Payment date to be agreed
确认回款安排|Confirm payment schedule
需要时补充回款日|Add a payment date if needed
上次记录 · 待确认|Previous record · Awaiting confirmation
尚未计入本期余额 · 在补录记录中编辑并保存即可确认|Edit and save this supplementary record to confirm it for this period.
导出暂不可用|Export unavailable
Excel组件未加载|The spreadsheet component is unavailable.
原流水号|Source transaction ID
原PDF页码|Source PDF page
按已有资料评分|Scored using the available records
已按提供的账务资料计算利润率。|Margin is calculated from the accounting records provided.
收付账单不能直接判断营业利润。|Operating profit requires accounting figures in addition to cash transactions.
流水范围待核对|Transaction coverage needs review
确认余额后结合已提供流水查看现金情况。|Confirm balances to review cash alongside your transactions.
按期末现金与最近一月付款估算。|Estimated using closing cash and payments in the latest month.
应收资料与实际收款分别核对。|Reconcile receivables records and actual receipts separately.
暂无收款记录|No receipts recorded
按看板口径汇总本期收入来源，已识别的四类交易不计入。|Receipt sources use the report’s cash basis and exclude the four identified transaction types.
支出结构|Spending breakdown
暂无付款记录|No payments recorded
可在支出明细中核对分类与重复记录。|Review categories and duplicates in the payment details.
核对转账与收支分类|Review transfers and cash-flow classifications
已排除有明确依据的四类交易，继续核对用途不明确的转账及重复记录。|Four identified transaction types are excluded. Review transfers with unclear purposes and possible duplicates.
确认收支用途，避免将本人互转计作收入。|Confirm each transaction’s purpose so own-account transfers are excluded from receipts.
收款和付款不直接等同于营业收入或成本。|Receipts and payments can differ from accounting revenue and costs.
仅凭收支流水还不能确定手头有多少钱。|Transaction records alone cannot establish the cash balance.
先填写已知账户的余额，其余可以以后补。|Start with known account balances and add the others later.
余额按报告截止日核对，预测还需要完整收付款资料。|Reconcile balances as of the report date. Forecasts also need complete cash flow information.
可补充|Can be added
跟进逾期应收|Follow up on overdue receivables
确认付款安排并记录实际到账日期。|Confirm the payment schedule and record the actual receipt date.
回款以实际到账记录为准。|Collections follow actual receipt records.
补充账务资料|Add accounting records
当前资料不足以计算账务利润。|The available records are insufficient to calculate accounting profit.
补充收入确认、成本费用与资产负债资料。|Add revenue recognition, expenses and balance sheet figures.
不能用现金差额代替利润。|Net cash flow does not measure profit.
核对截止日期和资料范围|Check the cut-off date and coverage
保持报告期间与原始记录一致。|Align the reporting period with the source records.
资料没有覆盖的指标显示待补充。|Metrics without supporting data are marked as unavailable.
按实际资料展示|Based on actual records
原始账本未套用虚构公司管理评分|The ledger uses an observation score based on your own records.
等待载入已保存的账本|Waiting for saved ledger
先核对收支分类与账户余额|Review cash flow classifications and account balances first.
按已有资料了解收支与现金状况|Review cash movements and balances using available records
收支记录|Receipts and payments
已提供|Provided
数据核对|Data verification
当前计算已完成，明细保留原始记录供核对。|Calculations are complete. Source records remain available for review.
核对 / 修改余额|Review or edit balances
收款渠道|Receipt channel
含期初待收|Includes opening receivables
部分已收款缺少日期，未计入本期回款图|Collections missing receipt dates are excluded from the period chart.
未提供日期的应收款单列保留|Undated receivables are kept separately.
最近6个业务月份|Most recent 6 months of activity
需补充账务资料、申报与缴款记录后核对。|Add accounting records, filings and payments for reconciliation.
报告口径|Reporting basis
已提供的原始记录|Available source records
确认每笔记录的收入、费用及本金分类|Verify each record’s income, expense or principal classification.
收付分类与资产记录分别核对。|Review cash flow classifications and asset records separately.
资产记录|Asset records
已提供资产记录，仍需核对|Asset records provided; verification needed
报告按当前资料展示，未从流水推断未提供的信息。|The report uses the records supplied. Missing items are not inferred from transactions.
资料状态|Record status
核验明细|Verification details
账面资产总额|Total book assets
最近月付款|Payments in the most recent month
金额单位为元，按本报告的数据计算。|Amounts are in CNY, calculated from this report.
未约定|Not agreed
当前未收金额单独记录，未将历史收款重复扣除。|Outstanding amounts are recorded separately. Prior collections are not deducted again.
未提供科目|No account classification provided
按已导入的应收台账展示，缺少回款日期的已收金额为累计值。|Based on the imported receivables ledger. Collections without a receipt date are shown as cumulative.
有完整回款日期的期初待收保留原业务日期，金额为本期期初未收余额。|Dated opening receivables retain their original business date and the amount outstanding at the start of the period.
缺少回款日期的记录保留原应收金额与累计已收，期初余额尚无法确认。|Records without receipt dates retain the original and collected amounts. The opening balance is unconfirmed.
未确认本期期初现金，期初和期末余额不由流水差额代替。|Opening cash for this period is unconfirmed. Net cash movements cannot establish opening or closing balances.
按明确交易类型排除；用途不明的转账仍需核对，收支差额不是余额或账务利润。|Exclusions use identified transaction types. Review transfers with unclear purposes. Net receipts are a cash movement rather than a balance or accounting profit.
历史收支估算|Estimate using historical cash flows
已填计划试算|Estimate using recorded plans
月度收付款及可用的净利润率|Monthly cash flows and available net margins
暂无月度收付款数据|No monthly receipts or payments available
暂无月度数据|No monthly data
收入或成本构成|Receipts or costs by category
暂无构成数据|No breakdown available
含负向调整 · 按金额展示|Includes negative adjustments · Shown by amount
本项合计|Category total
未来现金累计增减试算|Projected cumulative change in cash
现金历史和未来预测|Historical and projected cash balances
缺少可绘制的现金余额|No cash balances available to chart
历史推算|Historical estimate
月份分组的已收、未到期和逾期金额|Collected, not-yet-due and overdue amounts by month
收入到支出及现金结余的资金流向|Flow of receipts into spending and net cash
暂无现金收支数据|No receipts or payments available
资金来源|Sources of cash
资金去向|Uses of cash
账单识别|Recognized from statement
银行流水|Bank transactions
流水余额不连续，请核对|Check discontinuities in the running balance
流水余额列|Running balance column
流水余额不连续或同日顺序不明确，请核对|Review the running balance and the order of same-day transactions.
手动补充|Manually added
已保存的余额确认|Saved balance confirmation
手动确认与同日账单余额不同，请核对|The confirmed balance differs from the same-day statement balance. Review the amounts.
同一账户的余额证据不一致，请核对|Balance records disagree for this account. Review the amounts.
各账户余额日期不同，分别展示后再确认同日余额|Balances have different dates. Review each account before confirming a common balance date.
账单未提供可用余额，可先查看现金增减趋势|No usable balance provided. Review the change in cash instead.
未填余额按0暂计，可修改|Missing balance provisionally set to zero; editable
账户余额汇总|Account balance totals
已提供期初余额及实际资金变动|Opening balance and actual cash movements provided
按已提供的期初余额及实际资金变动计算|Calculated from the opening balance and actual cash movements provided
按已提供期初余额计算整体余额，各账户余额尚未拆分|Total based on the opening balance provided. Individual account balances are unavailable.
按已提供期初余额及实际流水计算；未推算缺失交易|Based on the opening balance and recorded transactions. Missing transactions are excluded.
当日已识别账户余额合计|Total identified account balances on this date
原始记录已标记为退款入账|Identified as a refund receipt in the source record
本笔金额达到 ¥5,000|Transaction amount of at least CNY 5,000
尚未提供带日期的记录|No dated records provided
尚未提供本期流水，不能视为零收支。|No transactions provided for this period. Receipts and payments are unknown.
原始账单尚未确认经营分类和期初现金。|Operating classifications and opening cash remain unconfirmed.
补充已确认的期初现金后可推演。|Confirm opening cash to enable the forecast.
本期流水月份未完整覆盖，无法计算可靠的月均收付。|Incomplete monthly coverage prevents a reliable estimate of average cash flows.
本期没有可用于推演的收付记录。|No cash transactions are available for a forecast in this period.
按本期已提供的各月收支均值推演|Based on average monthly cash flows provided for the period
本人资金互转|Transfers between own accounts
`);
  const localize = value => globalThis.YoushuI18n?.text?.(value) || text[value] || value;
  function phrase(source, english) {
    const pieces = source.split('{}').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    patterns.push([new RegExp('^' + pieces.join('(.+?)') + '$'), (whole, ...groups) =>
      english.replace(/\{(\d+)\}/g, (_, index) => localize(groups[Number(index) - 1].trim()))]);
  }
  function templates(lines) {
    for (const line of lines.trim().split('\n')) {
      const separator = line.indexOf('|');
      phrase(line.slice(0, separator), line.slice(separator + 1));
    }
  }
  templates(`
最近{}个月|Last {1} months
含期初待收 {}|Includes opening receivables of {1}
展开全部 {} 项|Show all {1} categories
其他支出（{}项）|Other spending ({1} categories)
其他收入（{}项）|Other receipts ({1} categories)
报告截止日：{}|Report date: {1}
截至 {} · {}个账户|As of {1} · {2} account(s)
所选期间{} · 期末现金 {}|{1} for the period · closing cash {2}
{}。期末现金 {}，逾期未收 {}。|{1}. Closing cash: {2}. Overdue receivables: {3}.
期末现金 {}，逾期未收 {}。|Closing cash: {1}. Overdue receivables: {2}.
期末账户余额 {}，逾期未收 {}。|Closing cash balance: {1}. Overdue receivables: {2}.
期末现金 {}。|Closing cash: {1}.
{} · 人民币｜金额单位：万元|{1} · Chinese yuan
期末逾期应收占比 {}|Overdue receivables: {1}
最大收款来源占比 {}|Largest receipt source: {1}
收支结余率 {}|Cash surplus margin: {1}
▲ 增长 {} · 较上一期间|▲ Up {1} on the previous period
▼ 减少 {} · 较上一期间|▼ Down {1} on the previous period
{} · 占全部收入 {}|{1} · {2} of receipts
{} · 占全部成本 {}|{1} · {2} of costs
{}，{}，占比 {}|{1}, {2}, share {3}
期间最低 {}|Lowest projected balance: {1}
客户付款推迟 {} 天|Customer payments delayed by {1} days
提前 {} 天|{1} days earlier
推迟 {} 天|{1} days later
提前{}天|{1} days early
比未调整时增加 {}|{1} above baseline
比未调整时减少 {}|{1} below baseline
首月现金增加 {}|First-month cash increases by {1}
首月现金减少 {}|First-month cash decreases by {1}
首个预测月增加 {}|First projected month increases by {1}
首个预测月减少 {}|First projected month decreases by {1}
增加 {}|Increase {1}
减少 {}|Decrease {1}
期间已收 {} · 应收 {}|Collected this period: {1} · Outstanding: {2}
共 {} 位客户 · {}|{1} customers · {2}
共 {} 个{} · {}|{1} {2} · {3}
{} 笔 · 合计 {}|{1} transactions · total {2}
{} 笔原始记录 · {} 个有记录月份|{1} source records · {2} months with records
已收 {}|Collected {1}
安全线 {}万|Cash buffer: {1} × CNY 10,000
{} 账上现金（历史）{}|{1} historical cash: {2}
{} 账上现金（推演）{}|{1} projected cash: {2}
{} 经营收款 {}|{1} operating receipts: {2}
{} 经营付款 {}|{1} operating payments: {2}
{} 已收 {}|{1} collected: {2}
{} 未到期 {}|{1} not yet due: {2}
{} 逾期 {}|{1} overdue: {2}
所选期间净利润率 {}|Net profit margin for the period: {1}
所选期间支出费用率 {}|Expense ratio for the period: {1}
按所选期间月均支出覆盖 {}个月|{1} months at this period’s average spending
{}收入 {}，净利润 {}；前一等长期间资料不足，暂不比较。|{1} revenue: {2}. Net profit: {3}. Data is insufficient for a comparison with the preceding period.
{}收入 {}，净利润 {}，较前一等长期间收入增加 {}。|{1} revenue: {2}. Net profit: {3}. Revenue rose {4} from the preceding comparable period.
{}收入 {}，净利润 {}，较前一等长期间收入减少 {}。|{1} revenue: {2}. Net profit: {3}. Revenue fell {4} from the preceding comparable period.
{}收入 {}，净利润 {}。|{1} revenue: {2}. Net profit: {3}.
期末现金 {}，所选期间月均付款 {}。|Closing cash: {1}. Average monthly payments: {2}.
期末现金 {}，期间月均付款 {}；沙盘按所选期间月均收付推演。|Closing cash: {1}. Average monthly payments: {2}. This scenario uses average monthly receipts and payments for the selected period.
期初待收 {}，本期已收 {}，期末未收 {}；其中逾期 {}。|Opening receivables: {1}. Collected: {2}. Closing receivables: {3}, including {4} overdue.
期初待收 {}，本期已收 {}，期末未收 {}。|Opening receivables: {1}. Collected this period: {2}. Closing receivables: {3}.
{}在所选期间贡献 {}，占 {}。|{1} contributed {2}, or {3} of receipts for the period.
{}为所选期间最大付款分类，合计 {}。|{1} was the largest spending category at {2}.
截止 {} 仍有 {} 未收。|As of {1}, {2} remains outstanding.
若全部到账，现金可从 {} 增至 {}。|If collected in full, cash could rise from {1} to {2}.
所选期间弹性支出合计 {}，月均 {}。|Flexible spending totaled {1}, averaging {2} a month.
若选定弹性支出减少10%，每月假设少付 {}。|A 10% cut in the selected flexible spending would reduce monthly payments by {1}.
跟进{}的逾期款|Follow up on overdue payments from {1}
核对{}投入|Review spending on {1}
未计入收支 {} 笔|Excluded from receipts and payments: {1} transactions
其中：{}|Of which: {1}
预期效果：{}|Expected effect: {1}
{}，查看计算明细|{1}, view calculation details
{} · 评分依据|{1} · score calculation
已识别 {} 个账户余额|Balances identified for {1} account(s)
近 {} 个有记录月份估算|Estimate based on {1} recorded months
{} 个账户余额未填 · 暂按 0 计算|{1} missing account balance(s) provisionally use zero
按最近 {} 个完整账单月份的月均收付估算|Based on average receipts and payments in the last {1} complete statement months
按 {} 个已提供月份的收付记录估算 · 未将缺月视为零，未推算缺失交易|Estimate uses cash movements from {1} recorded months. Missing months and transactions are excluded.
{} 个未填账户按0暂计|{1} missing account balance(s) provisionally use zero
收入占收付合计 {}|Receipts as a share of all cash movements: {1}
已知现金覆盖 {} 个月|Known cash covers {1} months
最大单笔占收付合计 {}|Largest transaction as a share of cash movements: {1}
有日期应收中逾期 {}|Overdue share of dated receivables: {1}
最大对象占比 {}|Largest counterparty: {1}
最大交易日占比 {}|Busiest day’s share: {1}
{}贡献 {}，占本期已提供收款 {}。|{1} contributed {2}, or {3} of recorded receipts.
{}合计 {}，占已提供付款 {}。|{1} totaled {2}, or {3} of recorded payments.
{}是本期最大收款对象，占 {}。这只是已提供记录的分布。|{1} was the largest source, with {2} of the recorded receipts.
{}是最大付款分类，占 {}。可以点击建议查看对应记录。|{1} was the largest payment category, at {2}. Select the recommendation to see its records.
`);
  templates(`
{} 个完整基准月份|{1} complete baseline month(s)
{} 个有记录月份|{1} month(s) with transactions
{} 笔原始记录|{1} source transaction(s)
对象 {} · 分类 {}|Counterparties {1} · categories {2}
月收付波动系数 {}|Monthly cash flow coefficient of variation: {1}
已提供记录收款多于或等于付款 {}，{}|Recorded receipts exceed or equal payments by {1}. {2}
已提供记录付款多于收款 {}，{}|Recorded payments exceed receipts by {1}. {2}
本期收入 {}，支出 {}，收支差额 {}。该差额不等于利润或余额。|Recorded receipts: {1}. Payments: {2}. The difference of {3} measures cash activity, not profit or closing cash.
截至 {}，已知现金 {}；基准月均付款 {}。未来新增收入和支出未计入。|As of {1}, known cash is {2}. Baseline monthly payments average {3}. Future additions to receipts or spending are excluded.
最大一笔 {}，来自 {}。{}|Largest transaction: {1}, from {2}. {3}
已录且有到期日期的未收款 {}，逾期 {}。不代表尚未补录的全部应收。|Dated receivables in the ledger total {1}, including {2} overdue. Other receivables may still be missing.
{} 个交易对象，{}占 {}。{}|{1} counterparties. {2} accounts for {3}. {4}
采用 {} 的收付记录。没有把未提供月份按零处理。|Uses cash records for {1}. Missing months are excluded.
{} 个交易日，{}金额最高 {}。当前不作完整月份的环比判断。|There were {1} transaction days. {2} had the highest activity at {3}. Full-month comparisons are unavailable.
{} 笔交易对象待核对，{} 笔分类待核对。未提供的其他账户不被当作零。|Counterparties need review on {1} records and categories on {2}. Missing accounts are excluded.
{} 笔已录应收超过约定日期，合计 {}。|{1} recorded receivables are overdue, totaling {2}.
本期已提供付款比收款多 {}，最大分类是{} {}。|Recorded payments exceeded receipts by {1}. The largest category was {2} at {3}.
本期已提供付款比收款多 {}。|Recorded payments exceeded receipts by {1}.
{}连续 {} 个月出现接近金额的付款，平均每月 {}。|Payments to {1} occurred at similar amounts for {2} consecutive months, averaging {3} per month.
{}较{}付款增加 {}（{}），其中{}增加 {}。|Payments in {1} rose {3} ({4}) over {2}. {5} rose {6}.
{} 笔记录的交易对象或分类不够明确，合计 {}。|{1} records have unclear counterparties or categories, totaling {2}.
{}，{}记录金额 {}。|{1}, {2}, recorded amount {3}.
{} 个有记录月份、{} 笔{}可作为进一步核对的起点。|Start with {1} months containing records and {2} {3}.
本期纳入收款 {}、付款 {}；退款入账依照报告口径包含在收款中。|Included receipts total {1} and payments total {2}. Receipts include incoming refunds under the reporting rules.
{}采用可查看的自定义观察刻度，{}个有依据维度等权平均。缺失的利润、余额或应收不填零分；改用名称明确的可观察指标。{}。不属于审计结论、信用评级或行业排名，分数变化也可能来自观察维度变化。|{1} averages {2} supported measures equally. Missing records use a clearly labeled alternative measure where available. {3}. This score is an internal observation, and may change when the measures change.
按有数据的月份汇总：{}；跳过缺月。|Summed across recorded months: {1}. Missing months were skipped.
本年累计仅包含已提供且截止日已结束的账务月份：{}。|Year-to-date totals include supplied accounting periods closed by the reporting date: {1}.
{} 资产负债快照，期初比较栏及变动额显示“—”。|{1} balance-sheet snapshot. Opening comparatives and changes appear as dashes.
使用最近已提供的 {} 快照，不推算到报告截止日。|Uses the latest supplied snapshot dated {1}, without projecting to the reporting date.
`);
  patterns.push(
    [/^(其他支出|其他收入)（(\d+)项）\s*((?:¥|CNY )-?[\d,.]+)$/, (_, type, count, amount) => (type === '其他支出' ? 'Other spending' : 'Other receipts') + ' (' + count + ' categories) ' + localize(amount)],
    [/^期间成本费用 (.+?)，最大现金付款分类为(.+?) ((?:¥|CNY )-?[\d,.]+)。$/, (_, total, category, amount) => 'Costs and expenses totaled ' + localize(total) + '. The largest payment category was ' + localize(category) + ' at ' + localize(amount) + '.'],
    [/^(\d+)\s*天$/, (_, days) => days + (days === '1' ? ' day' : ' days')],
    [/^(\d+)分$/, (_, score) => score + ' pts'],
    [/^(\d+(?:—\d+)?)天$/, (_, days) => days + ' days'],
    [/^(\d+)[.．] (.+)$/, (_, i, title) => i + '. ' + localize(title)],
    [/^(.+?)。\s+(账务分析使用独立账务资料.+)$/, (_, claim, basis) => localize(claim + '。') + ' ' + localize(basis)],
    [/^(.+?。)\s+(账务利润按已提供的账务资料计算.+|本表完整保留实际资金流.+)$/, (_, claim, basis) => localize(claim) + ' ' + localize(basis)],
    [/^([\u4e00-\u9fffA-Za-z\s／・]+?)\s+(¥[-\d,.]+)(\s*(?:·\s*)?[-\d.]+%)?$/, (_, name, amount, share) => localize(name.trim()) + ' ' + amount + (share || '')],
    [/^([\u4e00-\u9fff]+) ([\d.]+%)$/, (_, name, share) => localize(name) + ' ' + share]
  );
  add(`
月度收支，金额单位万元；悬停或聚焦柱子显示全部金额，点击查看明细|Monthly receipts and payments in tens of thousands of CNY. Hover over or focus a bar for amounts. Select it for details.
减：支出|Less: payments
减：经营付款|Less: operating payments
收入明细|Receipt details
支出明细|Payment details
对应记录|Supporting records
计算依据|Calculation basis
原始记录已分类为内部转账|Classified as an internal transfer in the source records
投资账本中的本金、收益或相关费用|Principal, returns or fees in the investment ledger
本期合计仅汇总已提供的流水，月份覆盖不完整，期末现金不作推算。|The period total includes the transactions provided. Incomplete monthly coverage prevents a closing cash estimate.
低于图示范围|Below the displayed range
高于图示范围|Above the displayed range
起始余额|Opening balance
本组含期初待收，保留原业务日期。|This group includes opening receivables, with their original business dates.
缺少回款日期的记录仅绘制应收余额，已收金额未归入本期。|When a collection date is missing, only the outstanding balance is plotted. Collections are excluded from period receipts.
历史起始余额|Historical opening balance
余额按流水推算|Balance estimated from transactions
仅包含已补充的付款|Only recorded payments included
账务利润和资产负债按另行提供的账务资料计算。|Accounting profit and balance sheet figures use separate accounting records.
其他来源|Other receipt sources
其他支出|Other spending
历史|Historical
推演|Projected
交易对象或分类不明确|Unclear counterparty or category
`);
  templates(`
{}，已收 {}，未到期 {}，逾期 {}，查看原始应收明细|{1}. Collected: {2}. Not yet due: {3}. Overdue: {4}. View source receivables.
按已提供的 {} 个账务月份展示|Based on the {1} accounting month(s) provided
按近 {} 个有记录月份月均支出估算|Based on average payments in the last {1} recorded month(s)
已提供账务净利润 {}；还需确认期初结转、已分配利润及相关调整。累计可分配利润不等同于现金余额。|Recorded net profit: {1}. Verify opening retained earnings, distributions and adjustments. Distributable profit can differ from the cash balance.
{}；{}。现金可支撑＝账户余额÷月均支出；未填写余额按0暂计，不代表已确认实际余额。|{1}. {2}. Cash runway is the account balance divided by average monthly payments. Missing balances provisionally use zero.
未提供{}资产负债快照，期初比较栏及变动额显示“—”。|No balance sheet snapshot is available for {1}. Opening balances and changes are shown as dashes.
使用最近已提供的 {} 快照，不推算到报告截止日。|The most recent snapshot is dated {1}. Balances are not extrapolated to the report date.
本期合计仅包含已提供且截止日已结束的账务月份：{}。|The period total covers only the available accounting months that ended by the cut-off: {1}.
本年累计仅包含已提供且截止日已结束的账务月份：{}。|Year-to-date totals include available accounting months that ended by the cut-off: {1}.
其他来源（{}项）|Other sources ({1} categories)
其他来源（{}项） {}|Other sources ({1} categories): {2}
其他支出（{}项） {}|Other spending ({1} categories): {2}
第 {} 页|Page {1}
第 {} 行|Row {1}
{} 份可继续补充|{1} draft(s) can be completed later
{} 份暂存资料|{1} draft record(s)
{} 个完整基准月份。{}|{1} complete baseline month(s). {2}
已确认 {} 个账户 · 合计 {}，其余账户可稍后补充|{1} confirmed account(s), totaling {2}. You can add the others later.
未来6个月已知付款 · {} 次|Known payments over the next six months: {1}
截至 {} · 仅包含已补充的付款|Through {1} · Only recorded payments included
截至 {} · 按客户展示已记下的未收款|Outstanding receivables by customer as of {1}
从 {} 开始估算 · 起点 0 表示变化起点|Estimated from {1}. Zero marks the starting point for changes.
{} · 历史起始余额 {}|{1} · Historical opening balance: {2}
至少 {}|At least {1}
{} 明细|{1} details
文件汇总支出 {} = 原始支出 {} − 不计收支退款 {}|Statement spending {1} = original payments {2} less neutral refunds {3}
原始交易类型：{}|Source transaction type: {1}
按{}月份分组|Grouped by {1} month
收入冲减 · {}|Receipt adjustment · {1}
支出冲回 · {}|Payment reversal · {1}
{} · 可调整付款分类|{1} · Adjustable payment category
`);
  // In source statements, a single note may combine independently computed
  // sentences. Translate each sentence against its own reporting rule.
  const counted = (number, noun) => number + ' ' + noun + (number === '1' ? '' : 's');
  patterns.unshift(
    [/^(.+)；(缺少回款日期的记录仅绘制应收余额，已收金额未归入本期。|本组含期初待收，保留原业务日期。)$/, (_, grouping, note) => localize(grouping).replace(/[.]$/, '') + '. ' + localize(note)],
    [/^(\d{4}-\d{2}) 至 (\d{4}-\d{2})$/, (_, from, to) => from + ' to ' + to],
    [/^(\d+) 个有记录月份、(\d+) 笔(收付记录|原始交易)可作为进一步核对的起点。$/, (_, months, records, kind) => 'Start by reviewing ' + counted(records, kind==='收付记录'?'cash transaction':'source transaction') + ' across ' + counted(months,'recorded month') + '.'],
    [/^(\d+) 笔原始记录 · (\d+) 个有记录月份 · (\d+) 个完整基准月份(.*)$/, (_, records, months, baseline, note) => counted(records, 'source transaction') + ' · ' + counted(months, 'recorded month') + ' · ' + counted(baseline, 'complete baseline month') + (note ? '. ' + localize(note.replace(/^。/,'')) : '')],
    [/^(.+。)\s+(.+)$/, (_, left, right) => localize(left) + ' ' + localize(right)],
    [/^(\d[\d,]*)\s*笔$/, (_, count) => count + (count === '1' ? ' transaction' : ' transactions')],
    [/^(\d[\d,]*)\s*页$/, (_, count) => count + (count === '1' ? ' page' : ' pages')],
    [/^(\d[\d,]*)\s*个账户$/, (_, count) => count + (count === '1' ? ' account' : ' accounts')],
    [/^(.+?)，查看明细$/, (_, label) => localize(label) + ', view details'],
    [/^(.+?)；查看当月(收款|付款)明细$/, (_, label, direction) => localize(label) + '; view ' + (direction === '收款' ? 'receipts' : 'payments') + ' for the month'],
    [/^(\d{4}-\d{2}(?: — \d{4}-\d{2})?) (收入|支出|收支结余) ((?:[¥￥]|CNY )-?[\d,.]+)$/, (_, period, kind, amount) => period + ' ' + ({收入:'receipts',支出:'payments',收支结余:'net receipts'}[kind]) + ': ' + localize(amount)],
    [/^((?:[^；]+?-?\d+分；)+[^；]+?-?\d+分)$/, label => label.split('；').map(part=>part.replace(/^(.+?)(-?\d+)分$/,(_,metric,n)=>localize(metric)+' '+n+' pts')).join('; ')],
    [/^(.+?)\s+(\d[\d,]*)\s*笔。以上记录保留原始方向与金额，(.+)$/,(_, name, n, tail)=>localize(name)+' · '+localize(n+' 笔')+'. '+localize('以上记录保留原始方向与金额，'+tail)],
    [/^(\d[\d,]*)\s*笔 · 合计 ((?:[¥￥]|CNY )-?[\d,.]+)。(.+)$/,(_,count,amount,reportingBasis)=>localize(count+' 笔')+' · Total: '+localize(amount)+'. '+localize(reportingBasis)]
  );
  (globalThis.YoushuEnglish ||= []).push({text, patterns});
})();
