# 有数 Youshu · OPC Auto Finance Report

**有数是一个开源财务看板原型，帮助一人运营及小微企业在同一页理解现金流、利润、应收和现金情景。**

**Youshu is an open-source financial dashboard prototype that helps owner-operated businesses read cash flow, profit, receivables, and cash scenarios in one place.**

[中文 / English 对照](#目前能做什么--what-you-can-explore) · [English-only README](README.en.md) · [演示文件 / Demo file](index.html) · [中英技术摘要 / Bilingual summary](docs/TECHNICAL_SUMMARY.md) · [English PDF](docs/technical-summary.pdf) · [批量上传 / Batch update](docs/GITHUB_UPLOAD.md)

公开维护者：**Yuchen Zhao**。当前材料包准备版本：**0.1.0**，它是本次合成 OPC AI 原型的包版本，不改写既有仓库的发布历史。[目标仓库](https://github.com/MirandaZhao/OPC-Auto-Finance-Report)已有旧版；本次新版内容尚未推送。

Public maintainer: **Yuchen Zhao**. Package preparation version: **0.1.0**, identifying this synthetic OPC AI prototype package rather than revising the existing repository's release history. The [target repository](https://github.com/MirandaZhao/OPC-Auto-Finance-Report) contains an older version; this updated package has not been pushed.

![合成 OPC AI 企业的六指标财务总览 / Six-indicator overview using synthetic OPC AI business data](docs/images/overview.png)

## 目前能做什么 / What you can explore

- 六项总览指标：账户现金、经营收款、经营付款、现金结余、账务净利润率、现金可支撑月数。
- 切换最近12、6或3个月；鼠标移至折线上显示净利润率，悬停单点时突出该月。
- 查看应收与逾期、客户集中度，以及 AI 企业经营现金支出。
- 调整收款增长、回款延迟、弹性支出削减和税费支付情景，推演未来6个月现金，并对照3个月管理安全线。
- 查看收入与成本分配、三张示例财务报表和可解释的管理评分。
- 点击图表或报告行查看明细，并在本地下载 CSV。

示例是一家由一名创始人运营、按需采购项目支持的 AI 服务企业。收入来自智能体交付、工作流实施以及订阅和维护；支出包括模型 API、云资源、AI 工具、创始人薪酬及外部协作。

**演示中的企业、客户、财务金额和经营结果全部为合成示例。** AI 企业是报告的展示对象；看板本身使用确定性 JavaScript 计算，未调用 AI 模型。

- A six-indicator overview: account cash, cash receipts, cash payments, cash surplus, accrual net margin, and cash runway.
- Twelve, six, or three months of cash activity, with net-margin labels shown when the line is hovered and the hovered point emphasized.
- Receivables and overdue balances, customer concentration, and AI-business cash costs.
- A six-month cash scenario with receipt growth, payment delay, adjustable costs, a tax-payment toggle, and a three-month management safety line.
- An income-to-cost allocation view, three illustrative financial statements, and explainable management scores.
- Clickable detail tables and local CSV downloads.

The sample company is operated by one founder, with project services purchased as needed. Its receipts come from AI agents, workflow implementation, and subscriptions/maintenance. Its costs include model API use, cloud resources, AI tools, founder compensation, and external collaboration.

**Every company, client, financial amount, and business outcome in the demo is synthetic.** A sample AI business is the subject of the report; the dashboard itself uses deterministic JavaScript and does not call an AI model.

## 如何运行 / Run it

直接用现代桌面浏览器打开 `index.html` 即可。无需 API 密钥、账号、数据库、安装或构建。

如需本地服务器预览，安装 Node.js 22 或以上版本，在项目目录执行下面的 `npm start`，再打开 `http://127.0.0.1:8000`；按 Ctrl+C 结束。命令见下方对应英文段落。

[部署指南](docs/DEPLOYMENT.md)包含 GitHub Pages 的设置方法。你提供的[公开仓库](https://github.com/MirandaZhao/OPC-Auto-Finance-Report)已有旧版内容；这份新版材料包尚未上传，尚未验证新版公开演示地址。批量更新方法见[上传指南](docs/GITHUB_UPLOAD.md)。

For a quick look, open `index.html` in a modern desktop browser. No API key, account, database, installation, or build is required.

For a localhost preview, install Node.js 22 or later and run:

```sh
npm start
```

Open `http://127.0.0.1:8000`. Stop the server with Ctrl+C. [Deployment instructions](docs/DEPLOYMENT.md) also cover GitHub Pages. The existing public repository has been identified; this updated package has not been uploaded and its hosted demo has not been verified. See the [batch update guide](docs/GITHUB_UPLOAD.md).

## 如何核验 / Verify it

在项目目录执行下方 `npm test`。测试无需额外安装项目依赖，检查账务勾稽、月度与累计数据、沙盘边界、明细表、CSV 和基本交互连接。[带日期的校验记录](evidence/records/automated-evaluation.json)记录被测 HTML 与示例数据的 SHA-256。

自动化使用隔离、简化的 DOM；不能据此认定真实浏览器显示、无障碍、税务合规、生产可用性、用户采用或业务节省已经得到验证。范围见[测试说明](tests/README.md)和[功能状态](docs/FEATURE_STATUS.md)。

```sh
npm test
```

The zero-dependency test suite checks accounting relationships, monthly-to-cumulative consistency, forecast boundaries, detail tables, CSV output, and basic interaction wiring. The [dated evaluation record](evidence/records/automated-evaluation.json) identifies the tested HTML and scenario by SHA-256.

The automated harness uses an isolated, simplified DOM. It does not establish real-browser rendering, accessibility conformance, tax compliance, production readiness, user adoption, or business savings. See [test scope](tests/README.md) and [feature status](docs/FEATURE_STATUS.md).

## 理解示例口径 / Understand the example

| 2026年9月合成指标 | 数值 |
|---|---:|
| 经营收款 | 人民币120,000元 |
| 经营付款，含创始人薪酬 | 人民币72,000元 |
| 现金结余 | 人民币48,000元 |
| 期末账户现金 | 人民币434,000元 |
| 权责发生制营业收入 | 人民币144,000元 |
| 账务净利润 | 人民币59,674元 |
| 净利润率 | 41.4% |
| 按月度全部经营付款测算的静态可支撑月数 | 6.03个月 |

现金结余与会计利润是不同指标；净利润已经扣除了创始人薪酬。差异解释见[指标定义](docs/METRIC_DEFINITIONS.md)、[数据来源](docs/DATA_PROVENANCE.md)和[沙盘方法](docs/FORECAST_METHODOLOGY.md)。

| September 2026 sample metric | Value |
|---|---:|
| Cash receipts | CNY 120,000 |
| Cash payments, including founder compensation | CNY 72,000 |
| Cash surplus | CNY 48,000 |
| Ending account cash | CNY 434,000 |
| Accrual revenue | CNY 144,000 |
| Accrual net profit | CNY 59,674 |
| Net profit margin | 41.4% |
| Static runway using all monthly cash payments | 6.03 months |

Cash surplus and accounting profit are different measures. Net profit already includes founder compensation. The [metric definitions](docs/METRIC_DEFINITIONS.md), [data provenance](docs/DATA_PROVENANCE.md), and [forecast methodology](docs/FORECAST_METHODOLOGY.md) explain the differences.

## 当前功能边界 / Current boundaries

目前是中文界面、人民币示例和中国税务参考链接。英文界面、美元场景与美国会计口径复核属于计划，尚未实现。“OPC”在这里表示一人运营模式，不代表某种美国法律主体或税务分类。

文件选择器仅显示文件名，不解析、不上传、不替换数据。银行连接、登录、后端和报税引擎尚未实现。三个月安全线和管理评分属于当前代码采用、可在实现中调整的设计假设，未验证为行业标准。使用前请阅读[使用指南](docs/USER_GUIDE.md)。

The interface is Chinese, the sample currency is CNY, and tax-reference links concern China. An English/USD version and U.S.-specific accounting review are planned, not implemented. “OPC” describes a one-person operating model here; it is not a claim about a U.S. legal or tax entity classification.

The file picker displays a filename only; it does not parse, upload, or replace data. There is no bank connection, authentication, backend, or tax-filing engine. The three-month safety threshold and management scores are configurable design assumptions represented in the current code, not validated industry standards. Review the [user guide](docs/USER_GUIDE.md) before using the prototype.

## 文件导航 / Project map

| 路径 | 用途 |
|---|---|
| `index.html` | 可直接运行的独立原型，含内置合成数据 |
| `data/` | 与演示对应的 JSON 及 CSV 参考数据 |
| `schemas/` | 用于数据审阅和工具开发的示例结构定义 |
| `tests/` | 可移植测试工具与范围说明 |
| `scripts/` | 本地预览和复现辅助工具 |
| `docs/` | 架构、方法、使用指南、路线图与技术摘要 |
| `docs/figures/` | 七组解释图的 SVG、PNG、PDF，以及中英图注 |
| `evidence/` | 带日期的工程记录、声明映射和供将来填写的空白模板 |

建议先看[架构](docs/ARCHITECTURE.md)、[流程](docs/workflow.md)、[设计理由](docs/DESIGN_RATIONALE.md)和[路线图](docs/ROADMAP.md)。[参考来源](docs/SOURCE_REGISTER.md)提供美国小微企业研究背景，不代表项目效果已经得到验证。

**说明文档每节中文在上、完整英文在下。** [英文首页](README.en.md)和[英文技术摘要](docs/TECHNICAL_SUMMARY.en.md)便于独立阅读；技术摘要 PDF 和图示原图保留英文，图示目录提供中英说明。代码、配置、数据字段及 MIT 许可正文保持规范原文。

| Path | Purpose |
|---|---|
| `index.html` | Self-contained runnable prototype and embedded scenario |
| `data/` | Matching synthetic JSON and CSV reference data |
| `schemas/` | Scenario schema for data review and tooling |
| `tests/` | Portable evaluation harness and its limitations |
| `scripts/` | Local preview and reproducibility helpers |
| `docs/` | Architecture, methodology, user guide, roadmap, and technical summary |
| `docs/figures/` | Seven explanatory figures in editable and printable forms |
| `evidence/` | Dated engineering records, claim mapping, and empty templates for future observations |

Start with [architecture](docs/ARCHITECTURE.md), [workflow](docs/workflow.md), [design rationale](docs/DESIGN_RATIONALE.md), and [roadmap](docs/ROADMAP.md). [Source references](docs/SOURCE_REGISTER.md) provide context for possible U.S. microbusiness research; they do not measure this project's impact.

Explanatory documents place Chinese before the corresponding complete English section. English-only reading copies are available for the README and technical summary. The summary PDF and original figures remain in English, with bilingual figure descriptions. Code, configuration, data fields, and the MIT license text retain their standard form.

## 参与和复用 / Contribute and reuse

请阅读[贡献指南](CONTRIBUTING.md)、[行为准则](CODE_OF_CONDUCT.md)、[安全说明](SECURITY.md)和[署名与 AI 辅助说明](AUTHORS.md)。欢迎改进复现性、澄清财务定义及验证可用性。请勿在公开 Issue 中发布真实客户财务记录。

项目采用 [MIT 许可证](LICENSE)。保留既有仓库的2026年 MirandaZhao 版权声明，并列明本材料包2026年 Yuchen Zhao 署名。外部出版物受各自条款约束，本包仅引用链接、不重新分发，见[第三方说明](THIRD_PARTY_NOTICES.md)。

See [CONTRIBUTING.md](CONTRIBUTING.md), [the code of conduct](CODE_OF_CONDUCT.md), [security guidance](SECURITY.md), and [authorship and AI assistance](AUTHORS.md). Contributions that improve reproducibility, clarify financial definitions, or validate usability are welcome. Do not post actual customer financial records in public issues.

Licensed under [MIT](LICENSE). The existing 2026 MirandaZhao copyright notice is retained alongside the 2026 Yuchen Zhao notice for this package. External publications remain subject to their own terms; they are linked, not redistributed. See [third-party notices](THIRD_PARTY_NOTICES.md).

