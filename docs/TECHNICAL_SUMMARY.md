# 有数：技术设计摘要 / Youshu: Technical Design Summary

> **本次单文件发布说明（2026年10月22日）：** 本文说明已在本地准备、测试的 OPC AI 新版原型。本次仅发布这份摘要；对应的新版应用、数据、图示、英文摘要、PDF 和校验记录尚未上传。仓库现有 `index.html` 仍是旧版，不对应本文的财务示例。下文使用纯文本路径标识待上传材料，暂不提供附件跳转。
>
> **Single-file publication note (October 22, 2026):** This summary describes the OPC AI prototype prepared and tested locally. Only this summary is published in this update; the matching application, data, figures, English summary, PDF and evaluation records have not yet been uploaded. The repository's existing `index.html` is an earlier version and does not match the financial examples below. References to pending materials appear as plain paths rather than attachment links.

本文件按小节提供中文在上、英文在下的完整对照。已在本地准备的纯英文源文档 `docs/TECHNICAL_SUMMARY.en.md` 和4页英文 PDF `docs/technical-summary.pdf` 尚待上传。

This document places Chinese above the corresponding complete English text in each section. The locally prepared English-only source, `docs/TECHNICAL_SUMMARY.en.md`, and four-page English PDF, `docs/technical-summary.pdf`, are pending upload.

有数是一个开源财务看板原型，帮助一人运营企业在同一处理解现金流、利润、应收和现金情景。

Youshu is an open-source financial dashboard prototype that helps owner-operated businesses read cash flow, profit, receivables, and cash scenarios in one place.

**状态：** 本地原型 | **公开维护者：** Yuchen Zhao | **整理日期：** 2026年10月21日

**Status:** Local prototype | **Maintainer:** Yuchen Zhao | **Prepared:** 2026-10-21

## 1. 解决的问题与当前实现 / 1. Problem and present implementation

销售 AI 实施与订阅服务的经营者，需要区分实际收到的钱、已经赚取的服务收入、交付成本，以及未来需要支付的款项。单看银行余额，无法判断一家盈利企业能否承担下一次交付。本原型把这些相关视角放进一份可交互报告。

An owner who sells AI implementation and subscription services needs to distinguish money received, services earned, delivery costs, and cash committed to future payments. A bank balance alone does not answer whether a profitable business can fund its next delivery. This prototype brings those related views into one interactive report.

演示以一家由创始人独立运营、提供 AI 智能体与工作流服务的企业为例。客户、现金交易、会计记录、上年对比、税务输入和结果全部为合成数据。创始人现金薪酬计入经营成本；外部交付支持作为采购服务列示，不表示存在雇员团队。

The demonstration follows one founder-operated AI agent and workflow services company. Its clients, cash transactions, accounting entries, prior-year comparison, tax inputs, and results are entirely synthetic. Founder cash salary is included in operating costs; outside delivery support is a purchased service, not an employee team.

应用是独立 HTML 文件，内置 CSS、JavaScript 与 SVG 图表。已准备的 JSON 示例便于核对，将随匹配的原型材料上传。浏览器中的控件可以切换期间、账户拆分和现金假设；点击图表标记或报告行可打开对应明细表，并把该表下载为 CSV。

The application is a self-contained HTML file with embedded CSS, JavaScript, and SVG charts. The prepared JSON fixture makes the scenario inspectable and is pending upload with the matching prototype materials. Browser controls change the displayed period, account split, and cash assumptions. Clicking chart marks or report rows opens the corresponding detail table; the table can be downloaded as CSV.

图示：当前架构 / Figure: Current architecture（`figures/01-current-architecture.png`，待上传 / pending upload） · 中英图注 / Bilingual descriptions（`figures/README.md`，待上传 / pending upload）

## 当前边界 / Present boundaries

应用未调用 AI 模型进行推理，未连接银行 API、后端、用户账号或真实账务导入。选择文件仅显示文件名，不改变合成图表。界面采用中文、人民币和中国税务参考材料，尚未适配美国会计或报税场景。

No AI model performs inference in the application. No bank API, backend, user account, or real accounting import is connected. Selecting a file shows its filename only and leaves the synthetic charts unchanged. The interface uses Chinese, CNY, and China-oriented tax reference material. It is not a US accounting or tax preparation product.

Yuchen Zhao 为公开维护者。本演示经过 Codex 辅助迭代开发。产品决策、生成代码、验证及后续人工复核应分别说明；本摘要不声称独立完成全部代码，也不主张已经证明技术创新性。

Yuchen Zhao is the public maintainer. This demo was iteratively developed with Codex assistance. Product decisions, generated code, validation, and subsequent human review should be described separately; this summary does not assert sole authorship or technical novelty.

<!-- PAGE -->

# 财务定义与可复现情景 / Financial definitions and reproducible scenarios

## 2. 区分现金与会计利润 / 2. Cash and accounting profit are separate measures

现金结余等于现金收款减现金付款。会计净利润等于已确认营业收入减去成本、经营费用及指定税费；净利润率等于净利润除以已确认收入。此处现金可支撑月数等于现金余额除以最近一个月的全部经营现金付款，是假定没有新收款、支出不变时的静态覆盖指标。

Cash surplus is cash receipts minus cash payments. Accounting net profit is recognized revenue minus costs, operating expenses, and the specified tax expense. Net profit margin is net profit divided by recognized revenue. Cash runway here is cash balance divided by the latest month's total operating cash payments: a static coverage measure that assumes no new receipts and unchanged spending.

在合成的2026年9月示例中，现金收款为120,000元、付款为72,000元，现金结余为48,000元。已确认营业收入为144,000元、净利润为59,674元，净利润率为41.4%。数据中包含尚未收回的收入、尚未支付的成本与税费，以及折旧，因此现金结余率与净利润率不同。

For synthetic September 2026, cash receipts are CNY 120,000 and payments CNY 72,000, producing CNY 48,000 cash surplus. Recognized revenue is CNY 144,000 and net profit is CNY 59,674, giving a 41.4% net profit margin. The two margins differ because the fixture includes uncollected revenue, unpaid costs and tax expense, and depreciation.

图示：现金与会计利润桥接 / Figure: Cash and accrual profit bridge（`figures/02-cash-profit-bridge.png`，待上传 / pending upload） · 中英图注 / Bilingual descriptions（`figures/README.md`，待上传 / pending upload）

## 现金沙盘 / Cash sandbox

基准情景从434,000元现金出发，每月重复120,000元收款和72,000元付款，并在首个预测月加入一次18,000元情景税费支付。6个月后现金为704,000元。安全线采用本演示的设计约定：基准月支出的3倍，即216,000元；该阈值不是行业标准。

The baseline starts at CNY 434,000, repeats monthly receipts of CNY 120,000 and payments of CNY 72,000, and includes one CNY 18,000 scenario tax payment in the first forecast month. Six-month ending cash is therefore CNY 704,000. The safety line is a design convention in this demo: three times baseline monthly payments, or CNY 216,000. It is not an industry standard.

收款变化可调为-40%至+40%，回款延迟为0至60天，弹性支出削减为0%至50%。月支出中仅39,600元归入弹性支出。延迟只移动新增预测收款，不把现有60,000元应收再加一次。账户视图采用已披露的70%/30%示例拆分。

Receipts can change by -40% to +40%; receipt delay by 0 to 60 days; and flexible spending reductions by 0% to 50%. Only CNY 39,600 of monthly spending is classified as flexible. Delay shifts new projected receipts; the existing CNY 60,000 receivable balance is not added again. Account views use a disclosed 70%/30% illustrative split.

18,000元税费是输入的合成数值，并非按法定税率计算所得。预留不等于支付，情景付款也不等于已认定的应纳税额。实际合同、负债、受限现金及付款日期仍需核验。

The CNY 18,000 tax expense is a supplied synthetic input, not the result of applying a statutory tax rate. A reserve is not a payment, and a scenario payment is not a determination of tax due. Actual contract, liability, restricted-cash, and payment dates would need verification.

<!-- PAGE -->

# 验证范围与实际限制 / Verification and practical limits

## 3. 本地已经检查了什么 / 3. What has been checked locally

仓库的自定义隔离 DOM 测试工具执行看板脚本，检查示例一致性、月度利润与现金桥接、资产负债平衡、报告行、预测情景、明细表和 CSV。已准备的校验记录由本地测试生成，并记录运行环境与结果，尚待上传；它不是浏览器认证，也不是财务记录审计。

The repository's custom isolated DOM harness executes the dashboard scripts and checks fixture consistency, monthly cash-profit bridges, balance-sheet equality, report rows, forecast cases, detail tables, and CSV output. The prepared evaluation record is generated from this local suite, identifies its environment and result, and is pending upload. It is not a browser certification or an audit of financial records.

测试覆盖120类明细及其 CSV 导出；48组边界组合覆盖收款变化、延迟、弹性支出削减、账户和税费选项，每组检查7个现金位置。期间控件覆盖12、6、3个月。通过这些检查说明实现与合成模型相符，不表示预测准确或软件已得到穷尽验证。

The suite exercises 120 distinct detail keys and their CSV exports. Forty-eight boundary combinations cover receipt change, delay, flexible-spending reduction, account choice, and tax selection, with seven cash positions per combination. Period controls cover 12, 6, and 3 months. Passing these checks establishes agreement with the implemented synthetic model; it does not establish predictive accuracy or exhaustive software correctness.

图示：本地验证范围 / Figure: Local validation coverage（`figures/06-validation-coverage.png`，待上传 / pending upload） · 中英图注 / Bilingual descriptions（`figures/README.md`，待上传 / pending upload）

## 解释边界与待完成工作 / Interpretation limits and open work

管理评分使用已披露的自定义锚点和等权平均，不是信用评级、行业基准、审计意见或税务合规判断。示例中的较强盈利和现金表现是构造结果，不是已实现客户成效或预期回报的证据。

Management scores use disclosed custom anchors and an equal-weight average. They are not credit ratings, industry benchmarks, audit opinions, or tax compliance judgments. The fixture's strong profit and cash measures are constructed examples, not evidence of achieved customer outcomes or expected returns.

当前预测为确定性推演，除三个控制项外保持月度经营条件不变，未对概率、季节性、客户流失、项目交付能力或 API 使用波动进行统计校准。所示节支属于情景算术，尚未测量优化带来的实际收益。

The current forecast is deterministic. It holds monthly economics constant apart from its three controls and does not model probability, seasonality, churn, project capacity, or variable API usage in a statistically calibrated way. Proposed cost savings are scenario arithmetic; no optimization benefit has been measured.

仓库尚无生产安全评审、真实数据导入验证、在线集成测试或独立用户研究。现有预览图记录本地呈现状态；自动化测试不能替代人工浏览器检查、无障碍测试及真实企业评估。未来版本应保留带版本的原始结果，并说明其能支持的陈述。

The repository has no production security review, real-data import validation, live integration test, or independent user study. Existing visual preview images document a local presentation state; the automated suite does not replace manual browser review, accessibility testing, or evaluation with actual businesses. Any future release should preserve versioned raw results and explain which claims they support.

<!-- PAGE -->

# 计划用途与证据积累 / Planned use and evidence development

## 4. 面向美国小微企业的适配计划 / 4. Proposed adaptation for US microbusinesses

下一阶段计划面向一人运营的服务企业提供英文流程，明确币种设置、美国术语、支持的输入结构、隐私控制，以及经会计人员复核的指标定义。特定司法辖区的税务内容应与通用财务分析分离。这些事项仍属计划，尚未在本演示中实现或验证。

A proposed next stage is an English-language workflow for owner-operated service businesses, with an explicit currency setting, US terminology, supported input schemas, privacy controls, and accountant-reviewed metric definitions. Jurisdiction-specific tax content should be separated from general financial analysis. These items are planned and have not been implemented or validated in the present demo.

分阶段评估可以先在经同意、去标识化的示例上检查导入与勾稽，再评估经营者能否正确区分现金结余、净利润、逾期应收和情景假设。小规模试点可对照已披露基线记录任务准确性、耗时、错误、使用反馈与持续使用情况。财务或经营效果还需纵向证据，不能仅凭使用看板推断。

A staged evaluation could first test import correctness and reconciliation on consented, de-identified fixtures; then assess whether owners can correctly distinguish cash surplus, net profit, overdue receivables, and scenario assumptions. A small pilot could record task accuracy, time, errors, usability feedback, and retained use against a disclosed baseline. Financial or business effects would require additional longitudinal evidence and could not be inferred from dashboard usage alone.

图示：路线图与证据链 / Figure: Roadmap and evidence chain（`figures/07-roadmap-evidence-chain.png`，待上传 / pending upload） · 中英图注 / Bilingual descriptions（`figures/README.md`，待上传 / pending upload）

## 公共背景与审慎陈述 / Public context and responsible claims

来源登记列明 SBA、美国人口普查局、美联储小企业信贷调查和 IRS 的官方材料，提供小企业、无雇员经营主体、融资挑战和记录保存的背景。其统计对象不同：SBA 的广义小企业总体不等于本原型的可服务市场；Census 的无雇员口径不等于所有一人企业；雇主企业调查也不是 OPC 经营表现估计。

The source register records official SBA, Census, Federal Reserve Small Business Credit Survey, and IRS materials. They provide context on small businesses, nonemployer establishments, financing challenges, and recordkeeping. Their populations differ: the SBA's broad small-business universe is not the addressable market for this prototype; Census nonemployer status is not identical to every one-person company; employer-firm survey findings are not OPC performance estimates.

这些来源支持研究该问题，不证明本项目具有国家重要性或已经被采用。本摘要是技术项目文档，不证明 EB-2 资格、NIW 结论、经济影响或独立专家背书。

Those sources support investigating the problem, not a finding that this project has national importance or proven adoption. This summary is technical project documentation. It does not establish EB-2 eligibility, an NIW finding, economic impact, or independent expert endorsement.

## 参考资料与复现 / References and reproducibility

已在本地准备、尚待上传的主要项目来源：合成示例（`../data/opc-ai-scenario.json`，待上传 / pending upload）、应用（`../index.html`，待上传 / pending upload）、评估报告（`EVALUATION_REPORT.md`，待上传 / pending upload）、自动校验记录（`../evidence/records/automated-evaluation.json`，待上传 / pending upload）及来源登记 S1-S4（`SOURCE_REGISTER.md`，待上传 / pending upload）。七组可编辑图示及独立高清 PNG/PDF 见图示目录（`figures/README.md`，待上传 / pending upload）。安装已说明的可选文档依赖后，可执行 `python scripts/render-documents.py`，从独立英文摘要源文档重建4页英文 PDF 和图示；本中英对照文件不作为4页 PDF 的排版源。

Primary project sources prepared locally and pending upload: data/opc-ai-scenario.json（`../data/opc-ai-scenario.json`，待上传 / pending upload）, index.html（`../index.html`，待上传 / pending upload）, EVALUATION_REPORT.md（`EVALUATION_REPORT.md`，待上传 / pending upload）, automated-evaluation.json（`../evidence/records/automated-evaluation.json`，待上传 / pending upload）, and SOURCE_REGISTER.md (S1-S4)（`SOURCE_REGISTER.md`，待上传 / pending upload）. The seven editable diagrams and individual high-resolution PNG/PDF exports are indexed in figures（`figures/README.md`，待上传 / pending upload）. Rebuild this summary and diagrams with `python scripts/render-documents.py` after installing the documented optional documentation dependencies.

所有陈述应对应带日期的版本、真实提交、可归属的复核、可复现测试和真实外部反馈。计划中的里程碑在有支持证据前应持续标明为计划。

Claims should remain tied to dated releases, actual commits, attributable review, reproducible test records, and genuine external feedback. Planned milestones must remain labeled as planned until supporting evidence exists.
