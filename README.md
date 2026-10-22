# 有数 Youshu · OPC Auto Finance Report

**有数是一个开源财务看板原型，帮助一人运营及小微企业在同一页理解现金流、利润、应收和现金情景。**

**Youshu is an open-source financial dashboard prototype that helps owner-operated businesses read cash flow, profit, receivables, and cash scenarios in one place.**

[现有演示文件 / Existing demo](index.html) · [新版中英技术摘要 / New prototype summary](docs/TECHNICAL_SUMMARY.md) · [现有部署说明 / Existing deployment guide](DEPLOY.md) · [MIT 许可证 / License](LICENSE)

公开维护者：**Yuchen Zhao**。仓库：**MirandaZhao/OPC-Auto-Finance-Report**。

Public maintainer: **Yuchen Zhao**. Repository: **MirandaZhao/OPC-Auto-Finance-Report**.

## 当前发布状态 / Publication status

**截至2026年10月23日，仓库正在分批更新。** 当前 `index.html` 仍是使用虚构机械加工企业数据的早期版本。新版 OPC AI 企业原型已在本地准备；仓库已发布其[技术摘要](docs/TECHNICAL_SUMMARY.md)，对应的新版应用、数据、截图和自动化校验文件尚未上传。本次更新只替换 README，不改变演示程序。

**As of October 23, 2026, the repository is being updated in stages.** The current `index.html` is an earlier version using a fictional manufacturing business. A new OPC AI business prototype has been prepared locally; its [technical summary](docs/TECHNICAL_SUMMARY.md) is published, while the matching application, data, screenshots, and automated evaluation files are still pending upload. This update replaces only the README; it does not change the demo application.

| 内容 / Item | 状态 / Status |
|---|---|
| `index.html` | 已发布：早期制造业示例 / Published: earlier manufacturing example |
| `docs/TECHNICAL_SUMMARY.md` | 已发布：描述新版 OPC AI 原型 / Published: describes the new OPC AI prototype |
| 新版 OPC AI 应用及配套材料 / New OPC AI application and supporting materials | 本地已准备，待上传 / Prepared locally; pending upload |

## 它帮助谁，解决什么问题 / Who it helps and why

面向没有专职财务负责人的一人运营及小微企业经营者。看板围绕四个问题组织信息：账上还有多少钱、经营是否盈利、哪些款项需要催收，以及收入或支出变化后现金还能支撑多久。现金结余与会计利润分别说明，避免把“收到的钱”直接当成“赚到的钱”。

“OPC”在本项目中表示一人运营模式，不代表某种法律主体或税务分类。新版示例聚焦提供 AI 智能体、工作流实施和订阅维护服务的企业；AI 企业是报告的展示对象，看板本身不调用 AI 模型。

The intended users are owner-operated and micro businesses without a dedicated finance lead. The dashboard organizes information around four questions: how much cash is available, whether operations are profitable, which receivables need attention, and how long cash could last if receipts or spending change. Cash surplus and accounting profit are explained separately so owners do not mistake money collected for profit earned.

“OPC” describes a one-person operating model in this project, not a legal or tax entity classification. The new example focuses on AI agents, workflow implementation, and subscription/maintenance services. An AI business is the subject of the report; the dashboard itself does not call an AI model.

## 现在如何试用 / Try the currently published demo

1. 在仓库首页选择 **Code → Download ZIP**，解压后用现代桌面浏览器打开 `index.html`。
2. 先使用内置虚构数据，查看财务总览、收入分析、现金流、应收账款、财务报表和分析建议。
3. 当前旧版通过 CDN 加载 Chart.js，因此图表首次加载需要网络。无需注册账号或配置 API 密钥。

如果使用 Git，下面的命令会进入正确的仓库目录；随后打开其中的 `index.html`。现阶段仓库没有新版 `package.json`，不应运行新版材料包中的 `npm start` 或 `npm test`。

1. On the repository page, select **Code → Download ZIP**, extract it, and open `index.html` in a modern desktop browser.
2. Start with the built-in fictional data to explore the overview, income analysis, cash flow, receivables, financial statements, and recommendations.
3. The earlier version loads Chart.js from a CDN, so the first chart load requires a network connection. No account or API key is required.

For Git users, these commands enter the correct repository folder; then open its `index.html`. The repository does not yet contain the new package's `package.json`, so its `npm start` and `npm test` commands are not available here yet.

```sh
git clone https://github.com/MirandaZhao/OPC-Auto-Finance-Report.git
cd OPC-Auto-Finance-Report
```

当前旧版包含 CSV 导入入口，模板在 [`docs/template.csv`](docs/template.csv)，金额单位为万元。导入处理使用简化的解析与估算规则，例如应收账龄使用固定比例，不能将输出视为逐笔核验结果。建议先用合成或脱敏数据评估，现有[部署说明](DEPLOY.md)、[测试说明](TEST.md)和[设计说明](docs/design.md)均对应旧版。

The earlier version includes a CSV import entry point. Its template is [`docs/template.csv`](docs/template.csv), with monetary values in units of CNY 10,000. Import uses simplified parsing and estimation rules, including fixed proportions for receivables aging; its output is not transaction-level verification. Evaluate it first with synthetic or anonymized data. The existing [deployment](DEPLOY.md), [testing](TEST.md), and [design](docs/design.md) documents describe this earlier version.

## 新版 OPC AI 原型已准备的功能 / Features prepared for the new OPC AI prototype

**以下功能对应本地新版，待匹配的应用上传后才能在本仓库试用。**

- 六项总览指标：账户现金、经营收款、经营付款、现金结余、账务净利润率和现金可支撑月数。
- 最近12、6或3个月的月度图表；净利润率数字平时隐藏，鼠标移到折线时显示，悬停单点时突出该月。
- 应收与逾期、客户集中度，以及模型 API、云资源、AI 工具、创始人薪酬和外部协作支出。
- 六个月现金沙盘：调整收款增长、客户付款延迟、弹性支出削减及税费支付情景，对照三个月管理安全线。
- 收入与成本分配、三张示例财务报表，以及可查看依据的管理评分和行动建议。
- 点击图表或报告行打开明细表，并在本地下载对应 CSV。

**The following features belong to the locally prepared version and will become available in this repository after the matching application is uploaded.**

- Six overview metrics: account cash, cash receipts, cash payments, cash surplus, accrual net margin, and cash runway.
- Twelve-, six-, or three-month charts. Net-margin labels are hidden by default, appear when the line is hovered, and emphasize the hovered month.
- Receivables, overdue balances, customer concentration, and costs for model APIs, cloud resources, AI tools, founder compensation, and outside collaboration.
- A six-month cash scenario with receipt growth, customer payment delay, adjustable costs, and a tax-payment toggle, compared with a three-month management safety line.
- Income-to-cost allocation, three illustrative financial statements, and management scores and actions with inspectable reasoning.
- Detail tables opened from charts or report rows, with local CSV downloads.

## 理解新版的示例数据 / Understand the new example

新版以一名创始人运营、按需采购项目支持的 AI 服务企业为例。企业、客户、财务金额和经营结果全部为合成数据，不代表真实客户表现。下面数值用于理解新版技术摘要，与当前仓库旧版 `index.html` 的示例不同。

The new example follows one founder operating an AI services business and purchasing project support as needed. All companies, clients, financial amounts, and business outcomes are synthetic, not evidence of actual customer performance. These figures explain the new technical summary and differ from the earlier `index.html` currently in this repository.

| 2026年9月合成指标 / September 2026 synthetic metric | 数值 / Value |
|---|---:|
| 经营收款 / Cash receipts | CNY 120,000 |
| 经营付款，含创始人薪酬 / Cash payments, including founder compensation | CNY 72,000 |
| 现金结余 / Cash surplus | CNY 48,000 |
| 期末账户现金 / Ending account cash | CNY 434,000 |
| 权责发生制营业收入 / Accrual revenue | CNY 144,000 |
| 账务净利润 / Accrual net profit | CNY 59,674 |
| 净利润率 / Net profit margin | 41.4% |
| 静态现金可支撑 / Static cash runway | 6.03个月 / months |

现金结余等于收款减付款；净利润率等于账务净利润除以已确认营业收入。此处现金可支撑为账户现金除以最近一个月的全部经营现金付款，假定没有新收款、支出不变。净利润已经扣除创始人薪酬。口径与推演假设见[技术摘要](docs/TECHNICAL_SUMMARY.md)。

Cash surplus is receipts minus payments; net margin is accrual net profit divided by recognized revenue. Cash runway here is account cash divided by the latest month's total operating cash payments, assuming no new receipts and unchanged spending. Net profit already includes founder compensation. See the [technical summary](docs/TECHNICAL_SUMMARY.md) for definitions and scenario assumptions.

## 当前边界与验证状态 / Boundaries and verification status

新版是中文界面、人民币示例，使用中国税务参考材料；英文界面、美元场景及美国会计口径复核尚未实现。三个月安全线与管理评分是产品设计假设，未验证为行业标准；税务提示用于指出需核对的资料，不构成欠税认定或报税结果。

新版文件选择器目前只显示文件名，不解析、不上传、不替换数据；它与旧版的简化 CSV 导入不同。银行连接、登录、后端和报税引擎均未实现。新版应用采用内置 CSS、JavaScript 和 SVG 图表，不依赖旧版的 Chart.js CDN。

新版自动化校验已在本地运行，匹配的测试代码、带日期记录和输入文件校验值尚待上传。校验使用简化 DOM，不能据此认定真实浏览器显示、无障碍、税务合规、生产可用性、用户采用或经营收益已得到验证。当前仓库的 `TEST.md` 不是该新版自动化运行记录。

The new prototype has a Chinese interface, a CNY example, and China-oriented tax references. An English interface, USD scenario, and U.S.-specific accounting review are not implemented. The three-month safety line and management scores are product assumptions, not validated industry standards. Tax prompts identify information to check; they do not establish tax arrears or filing results.

The new file picker displays a filename only; it does not parse, upload, or replace data. This differs from the earlier version's simplified CSV import. Bank connections, authentication, a backend, and a tax-filing engine are not implemented. The new application embeds CSS, JavaScript, and SVG charts without relying on the earlier Chart.js CDN.

Automated checks for the new prototype have been run locally; the matching test code, dated records, and input hashes are pending upload. The checks use a simplified DOM and do not establish real-browser rendering, accessibility conformance, tax compliance, production readiness, user adoption, or business gains. The repository's current `TEST.md` is not the new automated run record.

## 已发布文件与后续材料 / Published files and pending materials

| 已发布文件 / Published file | 用途 / Purpose |
|---|---|
| [`index.html`](index.html) | 早期制造业演示 / Earlier manufacturing demo |
| [`docs/TECHNICAL_SUMMARY.md`](docs/TECHNICAL_SUMMARY.md) | 新版 OPC AI 技术摘要，中英对照 / Bilingual technical summary of the new OPC AI prototype |
| [`docs/template.csv`](docs/template.csv) | 旧版 CSV 模板 / Earlier CSV template |
| [`DEPLOY.md`](DEPLOY.md)、[`TEST.md`](TEST.md)、[`docs/design.md`](docs/design.md) | 旧版部署、测试与设计说明 / Earlier deployment, testing, and design documentation |
| [`docs/workflow.md`](docs/workflow.md) | 现有协作流程 / Existing collaboration workflow |
| [`LICENSE`](LICENSE) | MIT 许可正文 / MIT license text |

新版待上传材料包括：匹配的 `index.html`、`data/`、`schemas/`、`tests/`、`scripts/`、`package.json`、使用与方法说明、截图与图示、`evidence/` 校验记录，以及英文独立阅读版和技术摘要 PDF。这里仅列出待上传路径，不提供尚不存在的附件链接。材料包准备版本为0.1.0，不改写既有仓库的版本历史。

Pending materials for the new prototype include the matching `index.html`, `data/`, `schemas/`, `tests/`, `scripts/`, `package.json`, user and methodology guides, screenshots and figures, `evidence/` records, English-only reading copies, and the technical summary PDF. Pending paths are listed as text rather than links to unavailable attachments. The prepared package is labeled 0.1.0; this does not revise the repository's existing version history.

## 参与和复用 / Contribute and reuse

欢迎通过 Issue 或 Pull Request 提出改进。请注明针对旧版演示还是新版技术摘要，提供复现步骤；不要在公开讨论中放入真实客户财务记录。提交说明应写清实际动作及对用户的影响，例如“修正 CSV 模板链接，帮助使用者找到正确的导入格式”。仅更新文档时，应如实描述文档变化。

本 README 采用每节中文在上、完整英文在下的形式。新版原型经过 Codex 辅助迭代，产品决策、生成代码、验证和人工复核需要分别记录。本项目不声称已经获得客户采用、商业收益或独立技术创新验证。

项目按现有 [MIT 许可证](LICENSE)开放，当前许可文件保留 `Copyright (c) 2026 MirandaZhao`。公开维护者署名不改变许可文件中的版权声明。

Issues and pull requests are welcome. Identify whether feedback concerns the earlier demo or the new technical summary and include reproduction steps. Do not post actual customer financial records in public discussions. Commit messages should describe the action and its user impact, such as “Fix the CSV template link so users can find the import format.” Documentation-only changes should describe the documentation actually changed.

This README places Chinese above the corresponding complete English text in each section. The new prototype was iteratively developed with Codex assistance; product decisions, generated code, validation, and human review should be recorded separately. The project does not claim established customer adoption, business gains, or independently validated technical novelty.

The project uses the existing [MIT license](LICENSE), which currently retains `Copyright (c) 2026 MirandaZhao`. The public maintainer credit does not alter the copyright notice in that file.
