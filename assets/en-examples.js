/* Only the application's fictional ledgers use these translations. Real payees,
 * invoice notes and company names must retain the spelling in the source file. */
(() => {
  'use strict';
  const text = Object.create(null);
  function add(lines) {
    for (const row of lines.trim().split('\n')) {
      const [zh, en] = row.split('|');
      if (!en || !zh) throw new Error('Invalid example translation: ' + row);
      text[zh.trim()] = en.trim();
    }
  }
  add(`
星辰AI应用工作室|Xingchen AI Applications Studio
AI 智能体与工作流服务工作室|AI agents and workflow automation
澄明电商|Chengming E-commerce
禾川咨询|Hechuan Consulting
鹿鸣教育|Luming Education
星屿软件|Xingyu Software
北辰工作室|Beichen Studio
电商客服智能体交付|E-commerce customer support agents
业务流程自动化实施|Business process automation
知识库与教学助手|Knowledge bases and teaching assistants
AI插件订阅与运维|AI plug-in subscriptions and support
AI应用咨询与培训|AI consulting and training
智能体开发|AI agent development
知识库配置|Knowledge base configuration
上线培训|Launch training
流程设计|Workflow design
自动化实施|Automation implementation
人员培训|Staff training
知识库搭建|Knowledge base development
教学助手开发|Teaching assistant development
讲师培训|Instructor training
插件订阅|Plug-in subscription
运维支持|Operations support
功能配置|Feature configuration
应用咨询|Application consulting
团队培训|Team training
模型 API 调用|Model API usage
创始人薪酬|Founder compensation
云资源与部署|Cloud infrastructure and deployment
按需交付协作|Contract delivery services
推广获客|Marketing and customer acquisition
AI 工具订阅|AI tool subscriptions
文本模型|Text models
语音模型|Speech models
图像模型|Image models
向量嵌入|Vector embeddings
基础薪酬|Base pay
项目绩效|Project bonuses
计算资源|Compute resources
数据库|Databases
对象存储|Object storage
网络流量|Network traffic
界面开发|Interface development
接口集成|API integration
测试验收|Acceptance testing
内容制作|Content production
渠道投放|Paid media
活动推广|Event marketing
编程工具|Programming tools
设计工具|Design tools
协作工具|Collaboration tools
星海云服务|Xinghai Cloud
青竹云计算|Qingzhu Cloud Computing
云杉数据|Yunshan Data
拾光技术工作室|Shiguang Technology Studio
山屿设计|Shanyu Design
白鹭测试|Bailu Testing
青禾传媒|Qinghe Media
星河广告|Xinghe Advertising
映山内容工作室|Yingshan Content Studio
灵感工具平台|Linggan Tools
墨点设计|Modian Design
云杉协作|Yunshan Collaboration
云杉模型平台|Yunshan Model Platform
青竹智能|Qingzhu AI
星河模型服务|Xinghe Model Services
工作室负责人|Studio owner
首期款|Initial payment
进度款|Progress payment
阶段款|Milestone payment
尾款|Final payment
月初结算|Start-of-month settlement
用量结算|Usage-based settlement
追加结算|Additional payment
月末结算|Month-end settlement
示例月度结算|Sample monthly settlement
经营账户|Operating account
招商银行|China Merchants Bank
微信支付|WeChat Pay
支付宝|Alipay
税费|Taxes
已付税费|Taxes paid
税费缴纳|Tax authority
示例已付税费|Sample tax payment
计算资源套餐|Compute service plan
示例已收款服务|Sample paid service
示例已确认未收款服务|Sample recognized but unpaid service
稳步增长|Steady growth
回款放慢|Slower collections
投入上升|Rising costs
业务波动|Variable demand
业务逐步增加，交付与回款保持稳定|Business volume is growing, with steady delivery and collections.
服务持续交付，部分已确认收入的回款延后|Service delivery continues, but some recognized revenue takes longer to collect.
业务持续开展，近期主要投入和成本增加|Business continues while major costs have risen recently.
业务随交付和申请节奏波动，近期收入回落|Revenue fluctuates with deliveries and applications, with a recent decline.
企业 AI 自动化工作室|Enterprise AI automation studio
企业自动化工作室|Automation Studio
小微模型公司 · 自有模型研发|Small AI company developing in-house models
模型研发科技|Model Research
留学中介与咨询工作室|Study-abroad advising
留学咨询工作室|Study Abroad Consulting
AI／软件开发工作室|AI and software development studio
AI软件工作室|AI Software Studio
数据分析／咨询工作室|Data analytics and consulting
数据咨询工作室|Data Consulting
自媒体创作者|Independent content creator
内容创作工作室|Content Studio
设计／摄影自由职业|Freelance design and photography
设计摄影工作室|Design and Photography
电商／服饰小店|Online clothing retailer
服饰小店|Clothing Boutique
美甲／美睫工作室|Nail and lash salon
美甲美睫工作室|Nail and Lash Studio
花艺／礼品店|Florist and gift shop
花艺礼品店|Flowers and Gifts
咖啡／烘焙店|Coffee shop and bakery
咖啡烘焙店|Coffee and Bakery
瑜伽／普拉提工作室|Yoga and Pilates studio
瑜伽普拉提工作室|Yoga and Pilates
小型批发／贸易公司|Wholesale and trading business
商贸|Trading
上班族／上班兼副业|Salaried worker with a side business
自有资金投资者|Self-funded investor
企业知识库搭建|Enterprise knowledge base development
智能客服部署|Customer support automation
业务流程自动化|Business process automation
系统集成实施|Systems integration
自动化运维服务|Automation support
模型调用服务|Model API services
云平台与部署|Cloud hosting and deployment
实施交付协作|Implementation contractors
经营者薪酬|Owner compensation
软件订阅|Software subscriptions
客户拓展|Customer acquisition
流程测试与评估|Workflow testing and evaluation
工作室结算账户|Studio settlement account
自研模型授权|In-house model licenses
自研模型 API 服务|In-house model API services
私有化模型部署|Private model deployment
行业模型定制训练|Industry-specific model training
推理服务算力|Inference compute
部署交付协作|Deployment contractors
模型训练算力|Training compute
数据采购与标注|Data acquisition and labeling
研发人员薪酬|Research staff compensation
模型评测|Model evaluation
商业拓展|Business development
模型公司结算账户|Model company settlement account
留学规划咨询|Study-abroad planning
院校申请服务|University application services
文书辅导服务|Application essay coaching
面试辅导服务|Interview coaching
行前指导服务|Pre-departure advising
申请服务协作|Application support contractors
专业翻译服务|Professional translation
文书制作协作|Application document support
顾问薪酬|Adviser compensation
渠道推广|Channel marketing
场地与办公|Premises and office costs
留学服务结算账户|Study-abroad settlement account
AI应用开发|AI app development
业务系统开发|Business systems development
软件维护服务|Software maintenance
产品原型开发|Product prototyping
开发交付协作|Contract development
模型与云服务|Model and cloud services
软件测试服务|Software testing
开发者薪酬|Developer compensation
产品推广|Product marketing
技术培训|Technical training
软件工作室结算账户|Software studio settlement account
经营数据分析|Business data analysis
数据看板搭建|Dashboard development
市场调研咨询|Market research consulting
数据治理服务|Data governance
数据采购|Data purchases
调研执行协作|Research contractors
数据处理服务|Data processing
分析师薪酬|Analyst compensation
专业培训|Professional training
数据咨询结算账户|Consulting settlement account
品牌内容合作|Branded content partnerships
平台内容分成|Platform revenue sharing
付费内容服务|Paid content
直播推广服务|Livestream promotions
视频剪辑协作|Contract video editing
拍摄制作|Filming and production
内容素材授权|Content licensing
创作者薪酬|Creator compensation
创作工具订阅|Creative tool subscriptions
内容推广|Content promotion
拍摄场地|Filming locations
内容创作结算账户|Creator settlement account
橙光品牌|Chengguang Brand
青屿生活品牌|Qingyu Lifestyle
视频平台甲|Video Platform A
内容平台乙|Content Platform B
知识社群|Learning community
直播合作方|Livestream partner
品牌视觉设计|Brand identity design
商业摄影|Commercial photography
人像摄影|Portrait photography
活动拍摄|Event photography
摄影助理协作|Freelance photography assistants
后期制作|Post-production
道具与耗材|Props and consumables
主理人薪酬|Owner compensation
设计工具订阅|Design tool subscriptions
作品推广|Portfolio promotion
摄影棚租赁|Studio rental
设计摄影结算账户|Photography settlement account
通勤服饰|Workwear
休闲服饰|Casualwear
饰品配件|Accessories
定制服饰|Custom clothing
服饰进货成本|Clothing purchases
包装与物流|Packaging and shipping
平台交易服务费|Platform transaction fees
店员薪酬|Retail staff pay
店铺工具订阅|Store software subscriptions
店铺推广|Store marketing
仓储租赁|Warehouse rent
服饰店结算账户|Clothing store settlement account
网店平台甲|Online Marketplace A
网店平台乙|Online Marketplace B
直播店铺|Livestream store
私域商城|Direct online store
线下零售|In-store retail
基础美甲服务|Basic manicures
设计美甲服务|Nail art
美睫服务|Lash services
美甲修护服务|Nail repair
美甲美睫耗材|Nail and lash supplies
消毒与清洁耗材|Sanitation supplies
服务协作提成|Service commissions
美甲师薪酬|Nail technician pay
预约工具订阅|Booking software subscriptions
门店推广|Local marketing
门店租金|Store rent
美甲工作室结算账户|Salon settlement account
门店到店客户|Walk-in customers
预约平台客户|Booking platform customers
老客复购|Repeat customers
社群预约|Community bookings
活动体验客户|Event customers
日常花束|Everyday bouquets
节日花礼|Holiday flower gifts
活动花艺|Event arrangements
定制礼盒|Custom gift boxes
鲜花与礼品材料|Flowers and gift supplies
包装耗材|Packaging supplies
配送与布置|Delivery and installation
花艺师薪酬|Florist pay
花艺店结算账户|Florist settlement account
门店花礼客户|In-store gift shoppers
同城平台客户|Local platform customers
企业花礼客户|Corporate flower clients
婚礼合作客户|Wedding partners
社群订花客户|Community flower orders
咖啡饮品|Coffee drinks
烘焙点心|Baked goods
定制蛋糕|Custom cakes
企业茶歇|Corporate catering
咖啡与烘焙原料|Coffee and baking ingredients
食品包装|Food packaging
配送平台服务费|Delivery platform fees
门店工具订阅|Store software subscriptions
门店水电|Store utilities
咖啡烘焙结算账户|Cafe settlement account
门店堂食客户|Dine-in customers
外卖平台客户|Delivery app customers
定制蛋糕客户|Custom cake customers
企业茶歇客户|Corporate catering clients
社区团购客户|Community group orders
普拉提私教课|Private Pilates sessions
瑜伽小班课|Small-group yoga
体态评估服务|Posture assessments
团体训练课|Group fitness classes
课程教练协作|Contract instructors
器材维护|Equipment maintenance
课程耗材|Class supplies
课程推广|Class promotion
场馆租金|Studio rent
运动工作室结算账户|Fitness studio settlement account
私教课程学员|Private training clients
小班课程学员|Small-group students
团课预约学员|Group class bookings
企业团体学员|Corporate groups
体态评估客户|Posture assessment clients
办公用品批发|Office supply wholesale
日用百货批发|Household goods wholesale
企业采购服务|Corporate purchasing services
门店补货|Store replenishment
已售商品采购成本|Cost of merchandise sold
仓储物流|Warehousing and logistics
订单配货协作|Contract fulfillment
经营人员薪酬|Operations staff pay
进销存软件订阅|Inventory software subscriptions
业务拓展|Business development
仓库租赁|Warehouse rent
商贸结算账户|Trading settlement account
税后工资|Take-home pay
税后奖金|After-tax bonuses
副业设计|Freelance design
副业咨询|Freelance consulting
稿酬收入|Writing fees
个人收支账户|Personal checking account
投资已实现收益|Realized investment gains
投资已实现亏损|Realized investment losses
现金分红|Cash dividends
存款利息|Deposit interest
个人投资账户|Personal investment account
住房支出|Housing
日常餐饮|Food and dining
通勤交通|Commuting
生活用品|Household supplies
数字订阅|Digital subscriptions
休闲学习|Leisure and learning
居住租金|Housing rent
物业水电|Property fees and utilities
影音服务|Streaming services
学习工具|Learning tools
日常商户甲|Local Merchant A
日常商户乙|Local Merchant B
内容合作平台|Content partner platform
副业工具订阅|Side business tools
副业协作费用|Side business contractors
项目协作方|Project contractor
创作工具服务|Creative tools provider
虚构权益组合甲|Sample Equity Portfolio A
虚构权益组合乙|Sample Equity Portfolio B
虚构债券组合|Sample Bond Portfolio
虚构指数基金|Sample Index Fund
个人储蓄账户|Personal savings account
追加投资本金|Additional capital contribution
投资本金买入|Investment purchases at cost
卖出收回本金|Principal recovered on sale
虚构储蓄账户|Sample savings account
虚构交易服务|Sample brokerage
行情数据服务|Market data service
交易费用|Transaction fees
行情工具订阅|Market data subscription
已完成服务阶段|Completed service stage
已完成消费或已交付商品|Completed sale or goods delivered
已交付商品|Goods delivered
已交付服务|Services delivered
已完成阶段尾款|Final milestone payment
已完成阶段首款|Initial milestone payment
虚构申请服务与回款台账|Sample application services and collections ledger
虚构业务交付与回款台账|Sample delivery and collections ledger
虚构供应商付款台账|Sample supplier payments ledger
虚构投资结算明细（本金与收益分列）|Sample investment settlements (principal and gains separate)
虚构个人收入与支出记录|Sample personal income and expenses
虚构待交付服务合同|Sample contract for undelivered services
留学服务预收款|Advance for study-abroad services
后续申请服务|Future application services
待交付|Pending delivery
已到账收款记录|Settled receipt
曜石设备|Yaoshi Equipment
研发设备购置|Research equipment purchases
门店设备购置|Store equipment purchases
摄影器材购置|Photography equipment purchases
工作设备购置|Work equipment purchases
虚构经营借款|Sample business loan
经营借款到账|Loan proceeds
偿还借款本金|Loan principal repayment
虚构股权投资方|Sample equity investor
研发股权增资到账|Equity funding for research
借款利息|Loan interest
虚构税费缴款|Sample tax authority
示例税费|Illustrative taxes
虚构经营出资人|Sample equity holder
已宣告并支付分红|Dividends declared and paid
经营者|Business owner
模型研发团队|Model research team
咨询顾问团队|Advisory team
工作室经营者|Studio owner
开发者|Developer
分析师|Analyst
创作者|Content creator
主理人|Owner
店员|Store staff
美甲师|Nail technician
花艺师|Florist
经营人员|Operations staff
开发交付与云资源|Software delivery and cloud infrastructure
分析交付与数据资源|Analytics delivery and data resources
内容制作与渠道合作|Content production and channel partnerships
零税费列示原因|Why taxes are shown as zero
创作交付与设备投入|Creative delivery and equipment
创作交付与设备|creative delivery and equipment
进货与平台履约|Purchasing and marketplace fulfillment
材料消耗与门店支出|Materials and store expenses
花材采购与配送|Flower purchases and delivery
食材采购与门店支出|Ingredient purchases and store expenses
教练服务与场地支出|Instructor and venue costs
采购履约与客户账期|Purchasing, fulfillment and customer payment terms
软件交付与维护|Software delivery and maintenance
数据服务与咨询|Data services and consulting
内容创作与合作|Content production and partnerships
设计摄影与交付|Design and photography delivery
商品销售与结算|Merchandise sales and settlements
到店服务与消费|In-store services and sales
花艺订单与交付|Florist orders and deliveries
门店销售与结算|Store sales and settlements
课程服务与交付|Classes and services delivered
贸易交付与回款|Trade deliveries and collections
稳步积累|Steady accumulation
分红疏密变化|Variable dividend timing
已实现亏损|Realized losses
收益波动|Fluctuating returns
收支改善|Improving budget balance
副业回款放慢|Slower side-business collections
生活开支增加|Rising living expenses
副业波动|Variable side-business income
`);
  add(`
财务健康五维评分|Five financial management scores
盈利能力|Profitability
结余能力|Ability to generate a surplus
现金安全|Cash coverage
现金留存|Cash reserves
来源分散|Diversification of receipts
回款效率|Collections
成本控制|Cost control
支出控制|Spending control
收益结余|Retained investment income
持仓分散|Portfolio concentration
费用控制|Fee control
借款负担|Debt burden
到账记录|Receipts history
按计划|On track
优先处理|Prioritize
稳健|Healthy
有短板需关注|Needs attention
所选期间经营|Operating results
所选期间收支|Income and spending
现金与预测|Cash and projections
回款与未收|Collections and outstanding balances
成本与投入|Costs and spending
支出构成|Spending breakdown
模型研发与商业化|Model research and commercialization
申请服务与交付|Application services and delivery
已实现投资结果|Realized investment results
现金与持仓|Cash and holdings
资金来源与去向|Sources and uses of funds
费用与已实现亏损|Fees and realized losses
工资与副业收支|Salary and side-business activity
生活与副业支出|Living and side-business expenses
核对主要收款来源|Review the main sources of receipts
核对投资本金与收益|Reconcile investment principal and returns
分开记录工资和副业|Track salary and side-business income separately
核对期初与期末余额|Reconcile opening and closing balances
安排已预收的后续申请服务|Schedule application services paid for in advance
分开核对投资收益与本金|Reconcile investment returns and principal separately
分别核对税后工资与副业|Review take-home pay and side-business income separately
复核所选期间已实现亏损|Review realized losses for the period
复核所选期间的收支缺口|Review the shortfall for the period
核对研发预算与商业化进度|Check the research budget and progress toward sales
核对申请服务定价与交付成本|Review pricing and delivery costs for application services
复核所选期间的业务投入|Review business spending for the period
安排近期现金预算|Prepare a short-term cash budget
查看未计入收支的记录|Review entries excluded from dashboard cash activity
口径说明|Calculation basis
不适用|Not applicable
本期无计入收支的到账|No eligible receipts this period
所选期间没有收款记录|No receipts recorded during this period
所选期间暂无收款记录|No receipts recorded during this period
主要支出|major expenses
当前没有持仓成本记录|No holdings have a recorded cost
所选期间统一计算|All measures use the selected period
五项等权的演示管理规则|Five equally weighted sample management indicators
适用指标等权的演示管理规则|Equal weighting for applicable sample indicators
收支已按看板口径排除四类交易|Dashboard totals exclude four transaction types
利润与资产按原账务资料|Profit and assets come from accounting records
期初结转加本期留存|Opening retained earnings plus this period’s retained profit
期末累计利润不等于可提取现金|Cash available for withdrawal may differ from cumulative profit
账务分析使用独立账务资料|The accounting analysis uses separate books
投资损益等仍在账务报表中列示，不计入看板收入和支出|The financial statements include investment gains and losses, which the dashboard excludes from receipts and payments
前一等长期间资料不足，暂不比较|There are insufficient data for the preceding period of equal length
沙盘按所选期间月均收付推演|The projection uses average monthly receipts and payments for the period
本金与收益分别列示|Principal and returns are shown separately
本金另列|Principal is recorded separately
本金回收和未实现涨跌没有计入|The calculation excludes principal recovered and unrealized gains or losses
持仓没有按未来售价计为现金|Holdings are carried at cost and excluded from cash
本金买卖和未实现涨跌不计入收入|Income excludes principal transactions and unrealized gains or losses
工资按税后实际到账计算|Salary is recorded at the after-tax amount received
收入按已完成服务确认|Revenue is recognized as services are delivered
将收入与相应交易、服务或成本对应，避免重复计算|Match income to the relevant transactions, services or costs to avoid double counting
核对分类与付款凭证，按已发生记录更新预算|Check the categories and payment records, then update the budget using actual transactions
只依据所选期间已发生记录；情景测算不是实际到账或节省承诺|The scenario uses recorded activity for this period. Actual receipts and savings may differ.
逐项核对收入与成本；已实现损益、本金及未实现涨跌分别记录|Reconcile each revenue and cost item. Track principal, realized gains and losses, and unrealized changes separately.
保持期初余额加期间现金净变动等于期末余额|Check that opening cash plus the net cash movement equals closing cash
按申请批次核对交付义务，不把预收服务款全额当作已实现收入|Check outstanding services by application cohort and recognize advance payments as each service is delivered
把已完成的销售或服务与相关收款、成本逐项对应|Match completed sales or services to the corresponding receipts and costs
买卖本金单列投资现金流，收益只使用已实现损益|Show principal transactions in investing cash flows and use realized gains and losses for returns
工资使用税后到账金额，副业收入与相关成本分别记录|Use take-home pay and track side-business income and costs separately
投资理财等记录已从看板收支排除，不能据此评价收入到账情况|The dashboard excludes investment transactions. These entries cannot establish receipt frequency.
本期没有计入看板收入和支出的交易；原始资金流与独立账务仍保留|No transactions qualify for dashboard receipts or payments. Original cash movements and accounting records remain available.
在报告底部查看未计入收支的记录及原因|Review excluded entries and the reasons at the end of the report
不把已排除的投资理财等交易用于收入变化或弹性支出推演|Income and flexible spending scenarios exclude investment activity and other ineligible transactions
本期没有适用的收入和支出，沙盘暂不推演|No eligible receipts or payments are available for a projection
按所选期间已提供的成本费用记录计算|Based on recorded costs and expenses for the period
所选期间结余或净利润占收入的比例，按演示目标换算为0—100分；不是收益预测。|Surplus or net profit divided by revenue, scaled to a score of 0–100 against an illustrative target. This score measures historical results.
期末现金以截止日余额为准；企业与个人支出覆盖按所选期间月均支出与6个月演示刻度计算；投资画像以现金占资产20%为演示刻度。|Ending cash is measured at the cutoff date. For business and personal budgets, coverage uses average monthly spending and a six-month reference. Investment portfolios use cash equal to 20% of assets as the reference.
有收入到账月份÷所选月份×100；历史到账不保证未来收入。|Months with receipts divided by the number of selected months, multiplied by 100. Future receipts may differ.
（1－逾期金额÷期末未收金额）×100；无未收时记100分；包含期初带入且仍待收的款项。|One minus overdue amounts divided by ending receivables, multiplied by 100. A zero receivable balance scores 100. Opening balances still unpaid are included.
按所选期间最大收款来源占比计算，20%以内100分，65%及以上0分；仅为来源集中度演示。|The largest source’s share of receipts determines the score. A share of 20% or less scores 100. A share of 65% or more scores zero. This scale illustrates concentration.
采用所选期间成本费用占收入比例；如有完整前一等长期间则比较变化。演示评分不代表审计结论。|Measures costs and expenses as a share of revenue. Changes are compared when the preceding period has complete records. This is an illustrative management score.
已实现净收益÷已实现收益收入×100；不是投资回报率。|Realized net income divided by realized investment income, multiplied by 100. This measures income retained after costs.
期末最大持仓成本占比20%以内100分，80%及以上0分；是账面集中度刻度，不评估资产风险。|The largest holding at cost scores 100 at a share of 20% or less and zero at 80% or more. The score measures concentration by book value.
100－费用占已实现收入比例×200，下限0；本金买入与未实现涨跌不计费用。|Subtract 200 times the ratio of fees to realized income from 100, with a floor of zero. Expenses exclude purchases of principal and unrealized gains or losses.
100－借款占账面资产比例÷50%×100，下限0；只用于本演示账本对比。|Start at 100 and subtract 100 times the debt-to-assets ratio divided by 50%, with a floor of zero. This is an illustrative comparison.
统计期间|Reporting period
截止日期|Cutoff date
所选月数|Months selected
期间付款|Payments during period
期间收入|Revenue during period
月均付款|Average monthly payments
期初待收|Opening receivables
本期已收|Collected during period
期末未收|Closing receivables
其中逾期|Of which overdue
收款来源|Source of receipts
该来源收款|Receipts from this source
期间成本与费用|Costs and expenses for the period
费用率|Expense ratio
前一等长期间费用率|Expense ratio in preceding comparable period
税后及副业收入|Take-home pay and side-business income
已实现收益收入|Realized investment income
已实现净收益|Realized net income
期末借款|Closing debt
期末资产|Closing assets
已实现收入|Realized income
期间费用|Expenses for the period
实际业务构成|Service mix
主要来源|Main source
月均弹性支出|Average monthly flexible spending
净利润|Net profit
净利润率|Net margin
收支结余|Cash surplus
收支结余率|Cash surplus margin
净收益|Net income
结余率|Surplus margin
支出费用率|Expense ratio
收益结余比例|Share of realized income retained
所选期间|Selected period
期间月均付款|Average monthly payments
逾期来源|Source of overdue receivables
未收金额|Outstanding amount
期末预收待交付|Closing advances for undelivered services
本期已确认收入|Revenue recognized this period
收入科目|Revenue categories
最大付款分类|Largest spending category
买入本金|Principal invested
副业成本|Side-business costs
排除记录笔数|Number of excluded entries
未计入收支笔数|Number of entries excluded from cash totals
计入看板的收款|Receipts included on the dashboard
原始资金流入|Original cash inflows
原始资金流出|Original cash outflows
已扣除个税与个人社保的虚构实发工资|Sample take-home pay after personal taxes and social insurance
副业服务税后实际收款，未到账金额不计入本期收入|Side-business cash receipts after tax. Uncollected amounts are excluded.
按已到账分红与利息展示收款历史；本金买卖和交易损益不作为应收款，未提供约定账期。|Collection history includes dividends and interest actually received. Principal trades and trading gains or losses are excluded from receivables. No contractual payment terms were supplied.
按已到账工资、奖金与副业收入展示收款历史；不增加未到账应收，不推定约定账期。|Receipt history includes take-home pay, bonuses and side-business income received. No unpaid receivables or contractual payment terms are assumed.
已实现损益|Realized gains and losses
同笔卖出结算中的已实现损益；本金另列投资现金流|Realized gains or losses from the same sale. Principal is reported under investing cash flows.
买入本金按成本增加持仓，不计入费用|The purchase adds to holdings at cost and is excluded from expenses
个人资金划入投资账户，增加投入本金，不属于投资收益|Personal transfer to the investment account, recorded as an additional capital contribution
虚构投资组合实际到账的税后现金分红|After-tax cash dividends received on the sample portfolio
实际到账的税后利息|After-tax interest received
虚构按月续订记录|Sample monthly renewal
虚构副业工具按月续订|Sample monthly side-business tool subscription
虚构行情工具按月续订|Sample monthly market data subscription
虚构工资单中的税后实际到账金额|Take-home pay received per the sample payslip
虚构奖金单中的税后实际到账金额|After-tax bonus received per the sample bonus statement
虚构设备采购，按36个月计提演示折旧|Sample equipment purchase depreciated over 36 months
虚构协作合同分三期支付，本笔为实际本期付款|The sample contract specifies three installments. This entry records the installment paid.
后续申请服务预付款，尚未交付，不计入当期营业收入|Advance for future application services, excluded from current revenue until delivery
本期已到账的虚构股权增资，不计入营业收入|Sample equity contribution received this period, excluded from revenue
虚构利润分配，非经营成本|Sample profit distribution, excluded from operating costs
税费为演示假设，非适用税率|Taxes use sample assumptions. The figures do not specify an applicable tax rate.
示例账单注明：订阅自动续费扣款。|Sample statement: automatic subscription renewal charge.
示例账单注明：协议自动扣款。|Sample statement: authorized automatic debit.
示例云资源套餐订单注明：分期支付，第 3 / 6 期|Sample cloud contract: third of six installments
`);

  function dictionary(chinese, english) {
    const keys = chinese.split(' '), values = english.split(' ');
    if (keys.length !== values.length) throw new Error('Mismatched example name list');
    return Object.fromEntries(keys.map((key, i) => [key, values[i].replaceAll('_', ' ')]));
  }
  const studioNames = dictionary('澄川 拾光 青岚 松果 知微 观澜 云帆 鹿溪 初禾 南星 映山 禾序 星沐 清野 墨白 浅行 沐原 晴屿 简知 远棠 书禾 知序 溪桥 望野','Chengchuan Shiguang Qinglan Songguo Zhiwei Guanlan Yunfan Luxi Chuhe Nanxing Yingshan Hexu Xingmu Qingye Mobai Qianxing Muyuan Qingyu Jianzhi Yuantang Shuhe Zhixu Xiqiao Wangye');
  const buyers = dictionary('晴禾 沐森 远舟 青屿 橙石 知岸 朗星 初见 云栖 白榆 微光 溪山 知鹿 澄洲 北棠 南序','Qinghe Musen Yuanzhou Qingyu Chengshi Zhian Langxing Chujian Yunqi Baiyu Weiguang Xishan Zhilu Chengzhou Beitang Nanxu');
  const sectors = dictionary('电商 教育 咨询 家居 软件 文旅 设计 零售 供应链 健康科技 科技（雇主） 设计客户 咨询客户','E-commerce Education Consulting Home Software Travel Design Retail Supply_Chain Health_Tech Technology_(employer) Design_Client Consulting_Client');
  const supplierNames = dictionary('灵犀 星桥 云衡 知程 澄见 时序 墨禾 松石 曜云 一木','Lingxi Xingqiao Yunheng Zhicheng Chengjian Shixu Mohe Songshi Yaoyun Yimu');
  const trades = dictionary('服务 技术 供货商 配送服务 场地 平台服务 协作服务','Services Technology Supplies Delivery Venues Platform_Services Contract_Services');
  const lastNames = dictionary('林 陈 王 李 周 张 吴 许 郑 何 刘 杨 赵 孙 徐 高 谢 沈 梁 宋','Lin Chen Wang Li Zhou Zhang Wu Xu Zheng He Liu Yang Zhao Sun Xu Gao Xie Shen Liang Song');
  const givenNames = dictionary('清禾 知夏 一宁 思远 嘉禾 予安 星然 沐晴','Qinghe Zhixia Yining Siyuan Jiahe Yuan Xingran Muqing');
  const destinations = dictionary('英国硕士 澳洲本科 香港硕士 新加坡硕士 美国本科','UK_master’s Australian_undergraduate Hong_Kong_master’s Singapore_master’s US_undergraduate');
  const suffixes = '企业自动化工作室 模型研发科技 留学咨询工作室 AI软件工作室 数据咨询工作室 内容创作工作室 设计摄影工作室 服饰小店 美甲美睫工作室 花艺礼品店 咖啡烘焙店 瑜伽普拉提工作室 商贸'.split(' ');
  const names = Object.create(null);
  function combine(first, endings) {
    for (const [a, start] of Object.entries(first)) {
      for (const [b, end] of Object.entries(endings)) names[a + b] = start + ' ' + end;
    }
  }
  combine(studioNames, Object.fromEntries(suffixes.map(s => [s, text[s]])));
  combine(buyers, sectors);
  combine(supplierNames, trades);
  for (const [surname, family] of Object.entries(lastNames)) {
    for (const [given, name] of Object.entries(givenNames)) {
      names[surname + given + '的投资账本'] = name + ' ' + family + '’s Investment Ledger';
      names[surname + given + '的收支账本'] = name + ' ' + family + '’s Personal Ledger';
    }
    for (const [destination, en] of Object.entries(destinations)) {
      names[surname + '同学 · ' + destination] = 'Applicant ' + family + ' · ' + en;
    }
  }
  Object.assign(text, names);
  // The compact chart in this release shortens applicant labels before rendering.
  // Use its exact source prefix to keep the abbreviated category identifiable.
  for (const [surname, family] of Object.entries(lastNames)) {
    for (const [destination, en] of Object.entries(destinations)) {
      text[(surname + '同学 · ' + destination).slice(0, 9)] = family + ' · ' + en;
    }
  }
  add(`
申请人|Applicant
渠道／客群|Sales channel or customer group
现金缺口|Cash shortfall
累计留存亏损|Accumulated deficit
一眼看懂自己的财务状况|Your finances at a glance
收入到账|Cash income received
本期收入到账|Cash income received this period
个人与副业收支|Personal and side-business cash activity
折线|Line
收款时间|Receipt date
还有哪些钱没到账|Which payments are still outstanding?
收支分析|Income and spending analysis
收入与支出去向|Sources and uses of cash
税后与副业收入|Take-home pay and side-business income
减：本期提取|Less: withdrawals
减：其他调整|Less: other adjustments
税后到账收入减已支付支出|After-tax cash received less expenses paid
不等同于当前现金余额|Measured separately from current cash on hand
税后收入与另列税费|After-tax income and separately recorded taxes
工资与副业口径|Salary and side-business accounting
支出记录与凭证|Expense records and supporting documents
账户与资产资料|Account and asset records
算清收入支出和个人家底|Review personal income, expenses and net assets
账务利润及实际资金流独立列示，不套用看板收支排除规则。沿用本份个人账本的收益与资产记录。|Financial statements and actual cash flows follow their own accounting rules. Income and assets come from this personal ledger.
查看收支结余原始明细|View records supporting the cash surplus
看板收支差额|Dashboard cash surplus or shortfall
账务收益结余比例|Share of investment income retained
账务已实现净收益|Realized net investment income
本期账务收益结余比例|Share of investment income retained this period
现金占账面资产|Cash as a share of assets
持仓按成本计|Holdings carried at cost
现金与资产总额之比，不是收益率。|Cash divided by total assets measures the cash share of the portfolio.
报告收支|Reported receipts and payments
当前没有可用于推演的收支|No eligible receipts or payments for this scenario
本期记录均为投资理财等不计收支项目，沙盘暂无可用于推演的收入和支出。|This period contains only excluded transactions such as investment activity. No eligible cash flows are available for projection.
收益来源|Income source
本期没有计入看板的收款|No dashboard receipts for this period
全部收入|All income
全部来源|All sources
暂无构成数据|No breakdown available
当前筛选下没有记录|No entries match the selected filter
本期没有计入看板的付款|No dashboard payments for this period
全部支出|All spending
收支与投资分析|Cash activity and investment analysis
暂无现金收支数据|No cash receipts or payments available
累计账务已实现净收益|Cumulative realized net investment income
本期留存账务已实现净收益|Realized net investment income retained this period
投资收益保留在独立账务资料中|Investment income is recorded in the separate accounts
不计入本看板收入和支出|Excluded from dashboard cash activity
未评分|Not scored
本金与已实现损益|Principal and realized gains or losses
算清投资收益和持有资产|Review investment income and assets held
查看账务已实现净收益原始明细|View entries supporting realized net investment income
工资按税后到账记录，副业按实际收付记录|Salary is recorded after tax. Side-business activity reflects actual cash receipts and payments
投资收益与费用在原始记录和独立账务资料中查看|See the original transactions and separate books for investment income and fees
退款入账计入收入；投资理财、信用还款、他人代付和本人资金互转不计入收入和支出。退款按原始到账方向计入，原文件标为不计收支的记录保留原分类。原始流水与实际资金变动仍保留；账务利润和资产负债按另行提供的账务资料计算。|The dashboard counts cash refunds as receipts, except where the source marks the entry as neutral. It excludes investments, credit repayments, payments by others and transfers between the owner’s accounts. Original cash movements are preserved. Profit, assets and liabilities use separate accounting records.
点击节点或色带查看明细|Select a category or band to view the entries
元|CNY
`);

  // Match complete clauses. Slots keep the variable amounts, dates and ledger labels.
  const clauses = [];
  function template(zh, en) {
    const parts = zh.split(/(\{\d\})/g);
    const re = new RegExp('^' + parts.map(p => /^\{\d\}$/.test(p) ? '(.+?)' : p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$');
    clauses.push([re, (...captures) => en.replace(/\{(\d)\}/g, (_, i) => atom(captures[Number(i) + 1]) || captures[Number(i) + 1])]);
  }
  function templates(lines) {
    for (const line of lines.trim().split('\n')) template(...line.split('|'));
  }
  templates(`
{0} 天|{0} days
展开全部 {0} 项|Show all {0} categories
其他支出（{0}项）|Other spending ({0} categories)
其他来源（{0}项）|Other sources ({0} categories)
其他来源（{0}项） {1}|Other sources ({0} categories) {1}
其他支出（{0}项） {1}|Other spending ({0} categories) {1}
当前累计可分配利润估算为 {0}|Estimated cumulative distributable profit: {0}
{0} · 首月含期初待收|{0} · First month includes opening receivables
含期初待收 {0}|Includes opening receivables of {0}
共 {0} 位申请人|{0} applicants
共 {0} 位渠道／客群|{0} channels or customer groups
共 {0} 位收益来源|{0} income sources
应收 {0}|Receivables: {0}
{0} · 占全部支出 {1}|{0} · {1} of total spending
· 展开{0}项资料核验明细|· Show {0} supporting record checks
安全线 {0} · 低于图示范围|Cash safety level {0} · below chart range
安全线 {0} · 高于图示范围|Cash safety level {0} · above chart range
悬停任意柱子显示收支金额；悬停蓝点显示{0}。移出绘图区隐藏，点击收款或付款柱查看对应明细。|Hover over a bar for receipts and payments or a blue point for {0}. Select a bar to see its transactions.
悬停任意柱子显示全部收支金额；移到折线上显示全部{0}。移出绘图区隐藏，点击收款或付款柱查看对应明细。|Hover over a bar to see receipts and payments, or the line to see {0}. Select a bar to view its transactions.
{0}在所选期间贡献 {1}，占 {2}|{0} accounted for {2} of receipts during the period ({1})
{0}为所选期间最大付款分类，合计 {1}|{0} was the largest spending category at {1}
{0}收入 {1}，{2} {3}|Revenue for {0} was {1}. {2}: {3}
{0}收入 {1}，{2} {3}，较前一等长期间收入增加 {4}|Revenue for {0} was {1}, up {4} from the preceding comparable period. {2}: {3}
{0}收入 {1}，{2} {3}，较前一等长期间收入减少 {4}|Revenue for {0} was {1}, down {4} from the preceding comparable period. {2}: {3}
期末现金 {0}，所选期间月均付款 {1}|Closing cash was {0}. Monthly payments averaged {1} for the period
期末现金 {0}，期间月均付款 {1}|Closing cash was {0}. Monthly payments averaged {1}
期初待收 {0}，本期已收 {1}，期末未收 {2}|Opening receivables were {0}. Receipts totaled {1}, and {2} remained outstanding at period end
其中逾期 {0}|Of that balance, {0} was overdue
期末现金 {0}，逾期未收 {1}|Closing cash was {0}, with {1} overdue
期间成本费用 {0}|Costs and expenses for the period totaled {0}
所选期间弹性支出合计 {0}，月均 {1}|Flexible spending totaled {0} for the period and averaged {1} per month
若选定弹性支出减少10%，每月假设少付 {0}|A 10% cut in the selected expenses would reduce monthly payments by {0}
截止 {0} 仍有 {1} 未收|At {0}, {1} remained outstanding
若全部到账，现金可从 {0} 增至 {1}|Full collection would raise cash from {0} to {1}
所选期间已记录回款 {0}，本金另列|Receipts recorded during the period totaled {0}. Principal is reported separately
按所选期间月均付款 {0}，期末现金覆盖 {1}个月|At average monthly payments of {0}, closing cash covers {1} months
3个月同等付款的参考金额为 {0}|Three months of payments at this rate would total {0}
所选期间期初现金 {0}，现金净变动 {1}，期末 {2}|Opening cash was {0}. Net cash movement was {1}, bringing closing cash to {2}
期末已收但待交付服务款 {0} 单列其他负债|Advances of {0} for undelivered services appear under other liabilities
所选期间收入 {0}，按当前科目核对{1}|Revenue for the period was {0}. Review {1} against the recorded categories
期间本金回收 {0}，本金买入 {1}，费用 {2}|Principal recovered was {0}, principal invested was {1}, and fees totaled {2}
期间税后工资 {0}，副业到账 {1}，副业成本 {2}|Take-home pay totaled {0}, side-business receipts were {1}, and side-business costs were {2}
期间税后工资 {0}，副业到账 {1}|Take-home pay totaled {0} and side-business receipts were {1}
期间已实现收入 {0}，净收益 {1}|Realized income was {0}, with net income of {1}
{0}期末成本 {1}，占 {2}|{0} accounted for {2} of closing holdings at cost ({1})
所选期间费用 {0}，已实现收入 {1}|Fees totaled {0} against realized income of {1}
期末借款 {0}，账面资产 {1}|Closing debt was {0} and assets at book value were {1}
期间研发相关现金投入 {0}，筹资流入 {1} 单独列示|Cash spending on research was {0}. Financing inflows of {1} are shown separately
期末预收待交付 {0} 单列其他负债，收入按已完成服务确认|Advances of {0} for undelivered work are recorded as other liabilities. Revenue is recognized as services are delivered
期末现金 {0}，持仓成本 {1}|Closing cash was {0} and holdings at cost were {1}
期间追加及其他筹资流入 {0}，本金买入 {1}，卖出回收本金 {2}|Additional capital and other financing inflows totaled {0}, purchases totaled {1}, and sales returned principal of {2}
本期收入科目包括 {0}|Revenue categories included {0}
期末现金占账面资产 {0}|Cash as a share of closing assets: {0}
期末最大持仓成本占比 {0}|Largest holding’s share of closing cost: {0}
期间费用占已实现收入 {0}|Fees as a share of realized income: {0}
期末借款占账面资产 {0}|Debt as a share of closing assets: {0}
期末逾期应收占比 {0}|Overdue share of closing receivables: {0}
最大收款来源占比 {0}|Largest source’s share of receipts: {0}
按所选期间月均支出覆盖 {0}个月|Cash covers {0} months of average spending
有收入到账 {0}/{1}个月|Income received in {0} of {1} months
跟进{0}的逾期款|Follow up with {0} on overdue payments
核对{0}投入|Review spending on {0}
核对{0}|Review {0}
所选期间{0} {1}|{0} for the period: {1}
期末现金 {0}|Closing cash: {0}
{0} {1}为 {2}|{1} for {0} was {2}
已记录回款 {0}|Recorded receipts: {0}
期末持仓成本 {0}|Closing holdings at cost: {0}
{0}月服务|Services in month {0}
示例订单注明：{0}订阅服务|The sample order lists a subscription for {0}
虚构合同约定按月续订，服务期为 {0}|Sample monthly renewal agreement for {0}
第 {0} / {1} 期|Installment {0} of {1}
卖出结算按成本拆分本金 {0} 与已实现损益 {1}；该次实际结算 {2}|Sale settlement of {2}, comprising principal at cost of {0} and realized gain or loss of {1}
`);

  const withCurrency = s => s.replace(/¥\s*(?=-?[\d,.])/g, 'CNY ');
  const hasHan = s => /[\u3400-\u9fff]/.test(s);
  const monthName = n => ['January','February','March','April','May','June','July','August','September','October','November','December'][Number(n)-1];
  function atom(value) {
    const s = value.trim();
    if (text[s]) return text[s];
    if (!hasHan(s)) return withCurrency(s);
    if (s === '人民币') return 'CNY';
    const wan = /^(-?[\d,]+(?:\.\d+)?)\s*万(?:元)?$/.exec(s);
    if (wan) return 'CNY ' + (Number(wan[1].replace(/,/g, '')) * 10000).toLocaleString('en-US', {maximumFractionDigits: 2});
    const date = /^(\d{4})年(\d{1,2})月(?:(\d{1,2})日)?$/.exec(s);
    if (date) return monthName(date[2]) + (date[3] ? ' ' + Number(date[3]) + ',' : '') + ' ' + date[1];
    if (s.includes('、')) {
      const list = s.split('、').map(x => text[x]);
      if (list.every(Boolean)) return list.join(', ');
    }
    return '';
  }
  function simple(s) {
    // Period ranges and CNY amounts can both contain spaces. Match currency
    // explicitly when two adjacent slots otherwise have ambiguous boundaries.
    const largest = /^期间成本费用 (.+?)，最大现金付款分类为(.+?) (¥[\d,.-]+)$/.exec(s);
    if (largest && atom(largest[2])) return 'Costs and expenses totaled ' + withCurrency(largest[1]) + '. The largest payment category was ' + atom(largest[2]) + ' at ' + withCurrency(largest[3]);
    const net = /^([\d-]+ [—–-] [\d-]+) (.+)为 (¥[\d,.-]+)$/.exec(s);
    if (net && atom(net[2])) return atom(net[2]) + ' for ' + net[1] + ' was ' + withCurrency(net[3]);
    const plain = atom(s);
    if (plain) return plain;
    const withValue = /^(.+?)\s*[， ]\s*(¥[\d,.-]+)(?:[， ]\s*(?:占比\s*)?([\d.]+%))?$/.exec(s);
    if (withValue && atom(withValue[1])) return atom(withValue[1]) + ' · ' + withCurrency(withValue[2]) + (withValue[3] ? ' · ' + withValue[3] : '');
    const within = /^其中：(.+)$/.exec(s);
    if (within && atom(within[1])) return 'Including: ' + atom(within[1]);
    const action = /^(\d+\. |预期效果：)(.+)$/.exec(s);
    if (action) {
      const tail = sentence(action[2]);
      if (tail) return (action[1] === '预期效果：' ? 'Expected effect: ' : action[1]) + tail;
    }
    for (const [re, translate] of clauses) {
      const match = re.exec(s);
      if (match) {
        const result = translate(...match);
        if (!hasHan(result)) return withCurrency(result);
      }
    }
    return '';
  }
  function sentence(s) {
    if (text[s]) return text[s];
    if (s.endsWith('。')) {
      const inner = sentence(s.slice(0, -1));
      if (inner) return inner.replace(/[.]$/, '') + '.';
    }
    const direct = simple(s);
    if (direct) return direct;
    const groups = s.split(/\s*·\s*/);
    if (groups.length > 1) {
      const parts = groups.map(group => simple(group));
      if (parts.every(Boolean)) return parts.join(' · ');
    }
    if (/[。；]/.test(s)) {
      const parts = s.split(/[。；]/).map(x => x.trim()).filter(Boolean).map(x => simple(x) || text[x+'。']);
      if (parts.length && parts.every(Boolean)) return parts.map(x => x.replace(/[.]$/, '')).join('. ') + '.';
    }
    return '';
  }

  (globalThis.YoushuEnglish ||= []).push({
    scope: 'example',
    text,
    // Compound labels, report narratives and chart descriptions are built with
    // human-authored templates. Unknown labels fall through to the UI catalog.
    patterns: [[/^[\s\S]*[\u3400-\u9fff][\s\S]*$/, source => sentence(source) || source]]
  });
})();
