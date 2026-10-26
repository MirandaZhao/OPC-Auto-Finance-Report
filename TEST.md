# 原型评估报告 / Prototype evaluation report

本报告于 **2026-10-21（Asia/Shanghai）** 为 0.1.0 仓库材料包编制。

Prepared on **2026-10-21 (Asia/Shanghai)** for the 0.1.0 repository package.

## 复现并识别测试结果 / Reproduce and identify the result

在仓库根目录运行 `npm test`。[机器可读记录](../evidence/records/automated-evaluation.json)包含本次运行的真实 UTC 时间戳、Node 版本、方法、局限、源文件 SHA-256、场景文件 SHA-256、逐项检查详情和失败信息。该记录是所测试版本的结果依据；重新运行测试会刷新记录。

Run `npm test` from the repository root. The [machine-readable record](../evidence/records/automated-evaluation.json) contains the run's actual UTC timestamps, Node version, method, limitations, source SHA-256, scenario SHA-256, per-check details, and failures. It is the authoritative result for that tested revision; rerunning the suite refreshes it.

便携测试套件通过了 **28 项检查中的全部 28 项**。本地运行在 Node.js 24 和 Node.js 23 下均通过；所附记录注明最近一次运行的环境和时间戳。Node.js 22/24 的 GitHub Actions 矩阵已提供，供以后执行；材料包不声称远程持续集成已经运行。

The portable suite passed **28 of 28 checks**. Local runs passed under Node.js 24 and Node.js 23; the attached record identifies the runtime and timestamp of its latest run. The Node.js 22/24 GitHub Actions matrix is supplied for future execution; this package does not claim that remote CI has already run.

## 已检查的内容 / What was checked

| 范围 | 已观察的检查内容 |
|---|---|
| 场景结构 | 核心字段、金额、单位、期间，以及明确的合成数据来源标记 |
| 历史现金 | 十二个月的收款、付款、期初现金和期末现金 |
| 权责与现金衔接 | 月度利润到现金的对应关系，以及 1—9 月累计数 |
| 财务报表 | 资产负债表的两列数据、现金流算术，以及示例比较年度的衔接 |
| 预测 | 基准、税费开关、延迟、支出削减、账户拆分，以及 48 组边界组合；每组检查第 0—6 月 |
| 明细 | 120 种不同明细类型；在模拟 DOM 中填充对话框内容与表格行 |
| CSV | 在内存中检查生成的 120 份明细 CSV 的表头、行、引号与 CRLF 换行 |
| 交互 | 期间与页签的事件连接、文件选择占位行为，以及监听器是否累积 |
| 源码与 CSS 结构 | 六张卡片、评分规则、桑基图守恒、净利润率标签结构与悬停规则 |

| Area | Observed scope |
|---|---|
| Scenario shape | Core fields, amounts, units, periods, and explicit synthetic provenance |
| Cash history | Twelve months of receipts, payments, opening and closing cash |
| Accrual bridge | Monthly profit-to-cash relationships and January-September totals |
| Statements | Both balance-sheet columns, cash-flow arithmetic, and the illustrative comparative-year bridge |
| Forecast | Baseline, tax toggle, delay, cuts, account split, and 48 boundary combinations, each checked across months 0-6 |
| Details | 120 distinct detail types; dialog content and rows populated in the mock DOM |
| CSV | 120 generated detail CSVs checked in memory for headers, rows, quoting, and CRLF |
| Interactions | Period/tab wiring, file-picker placeholder behavior, and listener accumulation |
| Source/CSS structure | Six cards, score rules, Sankey conservation, margin-label markup, and hover rules |

启用 18,000 元税费支付情景时，基准情景的六个月期末现金为人民币 704,000 元。支持范围内最不利的滑块边界组合得到人民币 272,000 元，高于人民币 216,000 元的管理安全线。这些是确定性的合成数据计算，不是已用真实结果验证的企业预测。

The baseline six-month ending cash is CNY 704,000 with the CNY 18,000 tax-payment scenario enabled. The worst supported slider boundary produces CNY 272,000, above the CNY 216,000 management safety line. These are deterministic synthetic calculations, not business forecasts validated against actual outcomes.

## 人工视觉检查记录 / Manual visual observations

现有演示在 2026-10-20/21（Asia/Shanghai）期间，通过本地应用内浏览器进行了检查。观察到的行为包括：桌面端六张卡片等高、四组非等宽行的纵向分区一致、窄屏切换为单列、收入明细可点击，以及净利润率标签在悬停折线时显示、移出时隐藏。

The existing demonstration was inspected locally in an in-app browser during 2026-10-20/21 (Asia/Shanghai). Observed behavior included six equal-height desktop cards, matching vertical divisions across four asymmetric rows, a narrow-screen single-column switch, clickable income details, and net-margin labels showing on line hover and hiding on exit.

[总览截图](images/overview.png)和[收入明细截图](images/income-detail.png)展示的都是合成内容。这些观察仅构成有限的人工检查，不是设备／浏览器兼容性矩阵或无障碍认证。自动化测试环境不会复现这些视觉观察。

The [overview capture](images/overview.png) and [income-detail capture](images/income-detail.png) show synthetic content. These observations are a limited manual check, not a device/browser compatibility matrix or accessibility certification. The automated harness does not reproduce those visual observations.

## 方法与局限 / Method and limits

自动化套件在自定义、隔离的 DOM 测试环境中执行实际嵌入的应用脚本，模拟尺寸、事件、对话框、文件选择、计时和对象 URL。CSS 规则按文本检查；真实计算布局和指针渲染不在其范围内。CSV Blob 文本在内存中检查，不经过浏览器下载或电子表格软件。核心字段检查不等于完整的 JSON Schema 符合性测试。

The automated suite executes the actual embedded application scripts inside a custom isolated DOM harness. It uses mocked dimensions, events, dialogs, file selection, timing, and object URLs. CSS rules are checked as text; real computed layout and pointer rendering are outside its scope. CSV Blob text is inspected in memory, not through a browser download or spreadsheet application. Core field validation is not full JSON Schema conformance testing.

本次没有测试真实银行账户、生产账簿、纳税申报表、客户部署、外部贡献者群体、财务节省、可用性收益、安全认证或美国会计合规性。所有财务数值均来自合成样例。当前证据用于说明原型的可复现性，不是对实际应用效果的研究。

No actual bank account, production ledger, tax return, customer deployment, external contributor population, financial saving, usability benefit, security certification, or U.S. accounting compliance was tested. All finance values originate in the synthetic fixture. Current evidence is reproducibility evidence for this prototype, not a study of its real-world effect.

## 下一阶段评估 / Next evaluation stage

按照[路线图](ROADMAP.md)，先记录真实浏览器的覆盖情况，再取得同意，以去标识或合成任务开展小规模可用性研究。将明确的任务与已说明的基准方法进行比较，记录时间、正确性、失败、参与者选择和局限。使用[证据模板](../evidence/README.md)，分别报告计划、观察和验证后的结果。

Follow the [roadmap](ROADMAP.md). Record real-browser coverage, then obtain consent for a small usability study using de-identified or synthetic tasks. Compare defined tasks with a stated baseline and record time, correctness, failures, participant selection, and limitations. Use the [evidence templates](../evidence/README.md); report planned, observed, and verified results separately.
