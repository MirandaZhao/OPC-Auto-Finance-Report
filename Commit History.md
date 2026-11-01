# 有数提交历史 / Youshu Commit History

[中文摘要](#中文) · [历史版本说明原文](#历史版本说明原文) · [English](#english) · [66 条原始提交 / Original commits](#original-commit-messages)

## 中文

本文件保留有数仓库 **66 次提交时写下的原始标题和完整正文**，包括当时说明的更改动作、用户收益、验证结果和待完成事项；另保留旧版历史文档中的版本功能说明。

- 仓库：[MirandaZhao/OPC-Auto-Finance-Report](https://github.com/MirandaZhao/OPC-Auto-Finance-Report)；分支：`main`。
- 覆盖期间：**2026 年 9 月 22 日—2026 年 11 月 1 日**。日期按北京时间计算，仅显示年月日。
- 截止提交：[86cf00d](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/86cf00dafb5bf21d098584ec2e0692e5f49cff46)，2026 年 11 月 1 日。此后新增的提交不在本次范围内。
- 原始记录：[跳转到 66 条完整提交](#original-commit-messages)。按最早到最近排列，逐条展开，保留日期、提交哈希和变更链接。
- 更新摘要：下方中文、英文摘要按最近到最早归纳五个阶段，供快速浏览。

**整理说明：** 阶段摘要是本次后续整理；标为“原文”的内容保留当时的表述和拼写。英文提交记录仅统一换行格式，未润色或删减标题和正文。每条记录都可通过链接回到 GitHub 核对。

摘要以提交消息为依据；对笼统的文件上传消息，补充核对了文件清单。文档修订与软件更新分别表述；测试结果按原记录归属到当时的版本，本次整理未重新运行软件测试。

### 2026-11-01｜发布 v0.3.1 并完善上手体验

共 29 条提交。

- **更新报告看板，让用户既能浏览示例，也能创建自己的财务报告。** 替换原有入口文件并上传新版看板。 相关提交：[7933c62](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/7933c62227ea127fcbdfba0bbf4888b7777aac08)。

- **加入本地处理组件和财务模板，让用户更容易把账单整理成报告。** 补齐账单处理所需的组件，并提供准备导入数据的模板。 相关提交：[8bbdf22](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/8bbdf22f2771c412a2128b54eb4c0dcb35c3522c)、[960dffd](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/960dffd9d8ec72ce74b813888ed121c2ac83a75c)。

- **发布有数 v0.3.1 压缩包，让用户一次下载账单导入、财务报告及双语使用资料。** 这一组提交包含压缩包的上传、删除和重新发布。 相关提交：[002a54a](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/002a54aa76833e56f4d71fdee9cea6f19f0ef711)。

- **整理部署、评估、工作流和提交历史说明，让用户更容易找到使用方法与验证范围。** 统一 WORKFLOW.md、EVALUATION.md 文件名，更新数据处理指引，并清理或替换部分旧文档、模板及目录占位文件。 相关提交：[dd65c1c](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/dd65c1c01319dcb398e60bab872327c6e78e78c2)、[c9adf3e](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/c9adf3e56298214e4be698ebc7816e9649400505)、[86cf00d](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/86cf00dafb5bf21d098584ec2e0692e5f49cff46)。

- **完善 README 介绍、下载链接和截图，让用户更快理解软件并开始体验。** 更新版本与功能说明，调整文字和配图，并在最新修订中补充两张截图。 相关提交：[9147e9b](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/9147e9b2fb2c2fe271c7e1bb684e62fda66102cb)、[bd4dd64](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/bd4dd64262d0d151477ae9119ba78de7be06ae30)。

### 2026-10-26｜明确验证范围与部署步骤

共 2 条提交。

- **用 28 项检查报告区分已验证结果和未测试部分，让用户能够判断报告的验证范围。** 记录现金历史、现金与权责发生制之间的核对、财务报表、预测边界、120 种明细类型、CSV 输出和交互等检查内容；提交消息说明检查已在本地 Node.js 23/24 运行，提供的 Node.js 22/24 Actions 矩阵尚未执行。 相关提交：[ce79a3c](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/ce79a3cebc6fe61d953e4b9b3534fb7f7c6be7c8)。

- **将本机预览和 GitHub Pages 发布写成逐步指南，让项目使用者知道每一步该打开什么、看到什么。** 以中英双语说明本机预览、仓库状态、托管设置和发布记录。 相关提交：[0f9a83b](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/0f9a83b478ba161e0f7b24484fbe0f46d37978df)。

### 2026-10-22—2026-10-23｜完善 OPC AI 原型的双语说明

共 4 条提交。

- **解释现金结余、净利润、净利率和现金可支撑时间，让用户读懂示例中的财务数字。** 完善中文在前、英文在后的概览，说明合成数据、预测假设和验证边界，并区分已发布的制造业示例与当时仍待上传的 OPC AI 应用材料。 相关提交：[ac54bb9](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/ac54bb909fe8f073b07f4f23bcae44bffe4057c3)、[097e045](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/097e045d1bb179d0ac885dc9144f4816c10bf6ad)、[8e20169](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/8e2016934daff5ee692a4073a97829958ec0a25d)。

- **补齐预览、部署和发布记录的文档入口，让用户按现有材料找到操作步骤。** 这些提交仅发布说明文档；相关应用和配套材料当时仍待上传，部署指南也不代表已经完成托管发布。 相关提交：[9deb102](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/9deb102d235f43c7dc07dfa80e232dc2729d1892)。

### 2026-09-28—2026-10-10｜细化计算说明、测试记录与使用流程

共 16 条提交。

- **补充财务指标、评分规则和阈值说明，让用户理解数字背后的计算口径。** 设计文档进一步解释系统结构、数据模型、计算规则和行业适配方式。 相关提交：[09859b8](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/09859b8cc8f9640cf39c32eae898ca581cd38a63)、[fe19175](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/fe19175406ee3b3392afaf6a08fd438c82c07eda)。

- **充实测试结果、复现步骤和限制说明，让用户清楚哪些内容经过检查。** 评估文档覆盖现金流核对、CSV 导入和评分等内容，并记录未验证事项与改进建议。 相关提交：[75d2030](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/75d2030ced6a23e65e11af2ca68ac49b3f76ae0d)、[3bd7554](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/3bd75549318c839c7be5e71380ee1df589f472ce)。

- **细化静态托管和 GitHub Pages 部署指引，让用户更容易选择并配置运行方式。** 补充环境设置、数据处理、自定义域名和使用提示。 相关提交：[15d7b57](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/15d7b57d788ba1a4b6f3012e2b5899f56b1944c8)、[556c430](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/556c430aec2365da6968366637e88d808d4d115b)。

- **完善功能、指标和使用限制的介绍，让用户使用前了解项目的用途与边界。** 在 README 中补充设计解释、进阶功能说明和贡献指引。 相关提交：[2ab3fa4](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/2ab3fa470f41e79d0d54f880b306952d6802ea44)、[82f7a4a](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/82f7a4aabe9e17281389cea0cebd39ded4bd546c)。

- **整理导入和发布工作流，让数据准备及版本更新的步骤更容易跟随。** 调整文档结构，并明确变更记录、开发检查和发布测试步骤。 相关提交：[e07ea6c](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/e07ea6ce6f7f0a7f2d6f95e42b739b272aad20a7)。

### 2026-09-22｜建立项目、示例报告与基础文档

共 15 条提交。

- **建立仓库并上传示例财务报告和 CSV 模板，让用户有可查看的报告与数据准备参考。** 对应初始仓库、index.html 示例页面和 docs/template.csv。 相关提交：[cf3aa8d](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/cf3aa8d01f22d851d3dcc7d684f20194d7bb1f6a)、[21d2830](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/21d2830225e98a7d97a84d32e9a99802902e8f3f)。

- **完善项目概览、许可和现金流解释，让用户快速了解项目用途与文件结构。** 修订 README 的测试说明和功能描述，并移除其中的 Chart.js 引用。 相关提交：[7034f10](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/7034f108f3862fce7c57fffbc8d0398de1a87e60)、[d0af6cb](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/d0af6cbc8ddd8c8b7b080fdc56919a32228e6419)。

- **加入系统设计与发布流程说明，让读者了解评分、建议和预测的设计依据。** 记录系统目标、架构和已知限制，补充更新记录及测试步骤，并建立初始版本历史文档。 相关提交：[1eb0a78](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/1eb0a788c36553a8f384a5e51e71db57d67d28bc)、[f2e97ac](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/f2e97acbffd2a77517bbab160680a7b988e7d0a6)、[35d5750](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/35d575042032cd7460471c0803b39ba06d5d9b5a)。

- **提供静态 HTML 部署指南和测试评估报告，让用户能够找到运行方法与检查记录。** 说明部署方式，并记录自动化测试结果、样例数据评估及人工检查清单。 相关提交：[9f7a986](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/9f7a9862c91a1d523ae24b25b1edd4c2eadb6fee)、[e7d09f1](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/e7d09f131816067402407846736093fd7120f860)。

**版本名称说明：** 历史消息中分别出现过“version 1.0.0”和“v0.3.1”。本文件保留当时的名称，不据此推断统一的版本顺序或 Git 标签。

### 历史版本说明原文

以下保留旧版 Commit History.md 中的版本功能说明。它们是当时写入文档的描述，来源链接固定到对应提交，便于追溯；功能和测试表述按原文保留，本次未重新验证。完整历史文档可通过各来源链接查看。

#### v0.3.1 — 2026-11-01

来源：[Commit History.md · 86cf00d](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/blob/86cf00dafb5bf21d098584ec2e0692e5f49cff46/Commit%20History.md)，原文“四、版本节点”中的 0.3.1 小节。

> 当前发布版本，中英双语文档。
> 
> - 支持 CSV、Excel、PDF 账单导入，「我的报告」可多份追加、随时管理导入记录与备份
> - 首页内置虚构示例（星辰AI应用工作室），点击「再来一个」随机切换，无需安装或注册
> - 报告时间范围支持「全部月份」与最近 12 / 6 / 3 / 1 个月，自动跳过缺月
> - 新增 `templates/` 财务模板，降低数据准备与导入门槛
> - 本地处理组件：账单直接在浏览器端转为报告，数据不上传
> - 提供 `youshu-github-v0.3.1-bilingual.zip` 分发包，解压后打开 `index.html` 即可使用

#### 1.0.0 — 2026-09-22

来源：[首次提交的 Commit History.md · 35d5750](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/blob/35d575042032cd7460471c0803b39ba06d5d9b5a/Commit%20History.md)。

> 首个公开版本。
> 
> - 七个页面：财务总览、收入分析、现金流、应收账款、财务报表、分析建议、数据管理
> - 五维健康评分与规则式风险预警
> - 未来 6 个月现金沙盘推演（收入、回款、弹性支出三个滑块）
> - CSV 导入与数据质量检查
> - 计算引擎自动化测试 14 项，全部通过

---

## English

This document preserves the **original subjects and complete bodies of 66 Git commits**, including the changes, user benefits, validation results, and pending work described at the time. It also retains version-feature notes from earlier history documents.

- Repository: [MirandaZhao/OPC-Auto-Finance-Report](https://github.com/MirandaZhao/OPC-Auto-Finance-Report); branch: `main`.
- Period: **September 22–November 1, 2026**. Dates use China Standard Time and are displayed to the day.
- Snapshot: [86cf00d](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/86cf00dafb5bf21d098584ec2e0692e5f49cff46), November 1, 2026. Later commits are outside this document’s scope.
- Original records: [read all 66 complete commit messages](#original-commit-messages), fully expanded and ordered oldest first, with dates, commit hashes, and links to the changes.
- Summary: the Chinese and English summaries group related changes into five periods, newest first, for a quick overview.

**Editorial note:** The period summaries were prepared retrospectively. Content marked as original retains its wording and spelling. Only line endings in the English commit messages are normalized; subjects and bodies have not been rewritten or shortened. Every record links back to GitHub.

The summaries are based on commit messages, with file lists checked for generic upload messages. Documentation revisions are distinguished from application updates. Test results are attributed to the versions described in the original records; no software tests were rerun for this history document.

### 2026-11-01 | Release v0.3.1 and improve getting started

29 commits.

- **Update the dashboard so users can explore examples and create their own financial reports.** Replace the previous entry file with the updated dashboard. Related commits: [7933c62](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/7933c62227ea127fcbdfba0bbf4888b7777aac08).

- **Add local-processing components and financial templates so users can turn statements into reports more easily.** Supply processing components and templates for preparing import data. Related commits: [8bbdf22](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/8bbdf22f2771c412a2128b54eb4c0dcb35c3522c), [960dffd](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/960dffd9d8ec72ce74b813888ed121c2ac83a75c).

- **Publish the Youshu v0.3.1 package so users can download statement imports, financial reports, and bilingual documentation together.** This group includes uploading, removing, and republishing the archive. Related commits: [002a54a](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/002a54aa76833e56f4d71fdee9cea6f19f0ef711).

- **Organize deployment, evaluation, workflow, and history documents so users can find instructions and validation coverage more easily.** Standardize WORKFLOW.md and EVALUATION.md filenames, clarify data handling, and remove or replace selected older documents, templates, and directory placeholders. Related commits: [dd65c1c](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/dd65c1c01319dcb398e60bab872327c6e78e78c2), [c9adf3e](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/c9adf3e56298214e4be698ebc7816e9649400505), [86cf00d](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/86cf00dafb5bf21d098584ec2e0692e5f49cff46).

- **Improve the README introduction, download link, and screenshots so users can understand the app and start more quickly.** Update version and feature descriptions, refine wording and images, and add two screenshots in the latest README revision. Related commits: [9147e9b](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/9147e9b2fb2c2fe271c7e1bb684e62fda66102cb), [bd4dd64](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/bd4dd64262d0d151477ae9119ba78de7be06ae30).

### 2026-10-26 | Clarify validation coverage and deployment steps

2 commits.

- **Replace the test report with 28 checks that separate verified results from untested areas so users can assess validation coverage.** Document cash history, the accrual bridge, financial statements, forecast boundaries, 120 detail types, CSV output, and interactions. The message records local runs on Node.js 23/24; the supplied Node.js 22/24 Actions matrix had not run. Related commits: [ce79a3c](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/ce79a3cebc6fe61d953e4b9b3534fb7f7c6be7c8).

- **Turn local preview and GitHub Pages publishing into a step-by-step guide so repository owners know what to open and what to expect.** Provide bilingual instructions for previewing locally, checking repository status, configuring hosting, and recording a release. Related commits: [0f9a83b](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/0f9a83b478ba161e0f7b24484fbe0f46d37978df).

### 2026-10-22–2026-10-23 | Explain the OPC AI prototype in both languages

4 commits.

- **Explain cash surplus, net profit, net margin, and cash runway so users can interpret the example’s financial figures.** Expand the Chinese-first, English-second overview, describe synthetic data, forecast assumptions, and validation limits, and distinguish the published manufacturing demo from OPC AI application materials still awaiting upload at that time. Related commits: [ac54bb9](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/ac54bb909fe8f073b07f4f23bcae44bffe4057c3), [097e045](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/097e045d1bb179d0ac885dc9144f4816c10bf6ad), [8e20169](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/8e2016934daff5ee692a4073a97829958ec0a25d).

- **Add entry points for preview, deployment, and release-recording instructions so users can find the available setup guidance.** These commits publish documentation only: matching application materials were still pending, and the deployment guide does not establish a completed hosted deployment. Related commits: [9deb102](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/9deb102d235f43c7dc07dfa80e232dc2729d1892).

### 2026-09-28–2026-10-10 | Expand calculation guidance, evaluation records, and workflows

16 commits.

- **Document financial metrics, scoring rules, and thresholds so users can understand how to interpret the figures.** Expand design guidance on architecture, data models, calculation rules, and industry adaptation. Related commits: [09859b8](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/09859b8cc8f9640cf39c32eae898ca581cd38a63), [fe19175](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/fe19175406ee3b3392afaf6a08fd438c82c07eda).

- **Expand test findings, reproduction steps, and limitations so users can see what has been checked.** Evaluation documents cover cash-flow reconciliation, CSV imports, and scoring, with unverified areas and improvement recommendations. Related commits: [75d2030](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/75d2030ced6a23e65e11af2ca68ac49b3f76ae0d), [3bd7554](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/3bd75549318c839c7be5e71380ee1df589f472ce).

- **Clarify static-hosting and GitHub Pages instructions so users can choose and configure a deployment method more easily.** Add notes on environment settings, data handling, custom domains, and usage. Related commits: [15d7b57](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/15d7b57d788ba1a4b6f3012e2b5899f56b1944c8), [556c430](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/556c430aec2365da6968366637e88d808d4d115b).

- **Clarify features, metrics, and limitations so users understand the project’s purpose and boundaries before using it.** Add design explanations, advanced-feature descriptions, and contribution guidance to the README. Related commits: [2ab3fa4](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/2ab3fa470f41e79d0d54f880b306952d6802ea44), [82f7a4a](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/82f7a4aabe9e17281389cea0cebd39ded4bd546c).

- **Organize import and release workflows so data preparation and version updates are easier to follow.** Restructure the guidance and clarify changelog, development-check, and release-testing steps. Related commits: [e07ea6c](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/e07ea6ce6f7f0a7f2d6f95e42b739b272aad20a7).

### 2026-09-22 | Establish the project, example report, and core documentation

15 commits.

- **Initialize the repository and upload a sample financial report and CSV template so users have an example to review and a reference for preparing data.** These commits establish the repository, the index.html example page, and docs/template.csv. Related commits: [cf3aa8d](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/cf3aa8d01f22d851d3dcc7d684f20194d7bb1f6a), [21d2830](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/21d2830225e98a7d97a84d32e9a99802902e8f3f).

- **Improve the overview, licensing information, and cash-flow explanation so users can quickly understand the project and its file structure.** Revise README testing and feature descriptions and remove its Chart.js reference. Related commits: [7034f10](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/7034f108f3862fce7c57fffbc8d0398de1a87e60), [d0af6cb](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/d0af6cbc8ddd8c8b7b080fdc56919a32228e6419).

- **Add system-design and release-workflow guidance so readers can understand the rationale behind scoring, recommendations, and forecasts.** Document objectives, architecture, and known limits; add changelog and testing steps; and create the initial version-history document. Related commits: [1eb0a78](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/1eb0a788c36553a8f384a5e51e71db57d67d28bc), [f2e97ac](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/f2e97acbffd2a77517bbab160680a7b988e7d0a6), [35d5750](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/35d575042032cd7460471c0803b39ba06d5d9b5a).

- **Provide a static-HTML deployment guide and evaluation report so users can find running instructions and validation records.** Document deployment methods, reported automated-test results, sample-data assessment, and a manual-inspection checklist. Related commits: [9f7a986](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/9f7a9862c91a1d523ae24b25b1edd4c2eadb6fee), [e7d09f1](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/e7d09f131816067402407846736093fd7120f860).

**Version labels:** The original messages refer to both “version 1.0.0” and “v0.3.1.” This document preserves those historical labels without inferring a unified version sequence or Git tags. See the original messages below.

### Historical version notes — reference translation

The notes below translate the Chinese source excerpts retained above. They describe what the earlier history documents stated; they are not newly verified feature or test results. Each source link opens the complete file at its historical commit.

#### v0.3.1 — 2026-11-01

Source: [Commit History.md at 86cf00d](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/blob/86cf00dafb5bf21d098584ec2e0692e5f49cff46/Commit%20History.md), the 0.3.1 version-notes subsection.

Current release, with Chinese and English documentation.

- Support CSV, Excel, and PDF statement imports; allow multiple imports, import management, and backups in My Report.
- Open with a fictional example, Xingchen AI Application Studio; switch examples using “Another one,” without installation or registration.
- Offer All Months and the most recent 12, 6, 3, or 1 months, automatically skipping months without data.
- Add financial templates in templates/ to make data preparation and imports easier.
- Process statements into reports locally in the browser without uploading the data.
- Provide youshu-github-v0.3.1-bilingual.zip; extract the package and open index.html to use it.

#### 1.0.0 — 2026-09-22

Source: [the initial Commit History.md at 35d5750](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/blob/35d575042032cd7460471c0803b39ba06d5d9b5a/Commit%20History.md).

First public version.

- Seven pages: financial overview, income analysis, cash flow, receivables, financial statements, analysis and recommendations, and data management.
- Five-dimensional financial-health scoring and rule-based risk alerts.
- Six-month cash-flow simulation with sliders for income, customer payments, and flexible expenses.
- CSV imports and data-quality checks.
- Fourteen automated calculation-engine tests, all reported as passing.

---

## Original commit messages

The following 66 records preserve the complete original messages, including their subjects and bodies. All entries are visible and ordered oldest first. Wording, spelling, reported user benefits, and stated limitations remain unchanged. Dates are based on committer timestamps in China Standard Time and are displayed to the day; only message line endings are normalized for Markdown.

### 2026-09-22

#### 01 · 4e0e0e6

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/4e0e0e6f8c3112e9087b36ffdc9c5855be0c6964)

> Initial commit

#### 02 · 7034f10

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/7034f108f3862fce7c57fffbc8d0398de1a87e60)

> Revise README for project overview and functionality
> 
> Updated README to reflect new project features and structure.

#### 03 · 87a83f4

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/87a83f4d1b14b3536f449b1d2340852d327eb6db)

> Update license details in README.md

#### 04 · d0af6cb

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/d0af6cbc8ddd8c8b7b080fdc56919a32228e6419)

> Revise cash flow explanation and remove feature note
> 
> Updated the README to clarify cash flow duration and removed a line about planned features.

#### 05 · 3466b17

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/3466b1702428f36ed17bb651eac41eed17a7c0db)

> Update README by revising sections
> 
> Revised project structure and testing sections from README.

#### 06 · 1eb0a78

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/1eb0a788c36553a8f384a5e51e71db57d67d28bc)

> Add system design documentation
> 
> Added a comprehensive system design document outlining objectives, architecture, data models, scoring rules, advice generation, forecasting methods, rendering layer details, and known limitations.

#### 07 · 8e91068

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/8e910685ce18227482fb0ae6c5b23850298fb069)

> Update workflow documentation for release process

#### 08 · f2e97ac

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/f2e97acbffd2a77517bbab160680a7b988e7d0a6)

> Enhance release workflow documentation
> 
> Add steps for updating CHANGELOG and running tests.

#### 09 · 41595cb

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/41595cb20c5bde3a106a6f36fc2eb8f71ebdb034)

> Rename workflow to workflow.md

#### 10 · e7d09f1

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/e7d09f131816067402407846736093fd7120f860)

> Create testing and evaluation report in TEST.md
> 
> Added a comprehensive testing and evaluation report including automated test results, sample data assessment, and manual inspection checklist.

#### 11 · 9f7a986

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/9f7a9862c91a1d523ae24b25b1edd4c2eadb6fee)

> Create deployment instructions in DEPLOY.md
> 
> Added deployment guide for static HTML project.

#### 12 · cf3aa8d

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/cf3aa8d01f22d851d3dcc7d684f20194d7bb1f6a)

> sample finance report for review

#### 13 · 43fdb29

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/43fdb2967d505d70e3d41b50cd5f51d92c1f6e20)

> Update README to revise Chart.js reference
> 
> Removed mention of Chart.js from the README.

#### 14 · 21d2830

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/21d2830225e98a7d97a84d32e9a99802902e8f3f)

> Add files via upload

#### 15 · 35d5750

2026-09-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/35d575042032cd7460471c0803b39ba06d5d9b5a)

> Add initial commit history for version 1.0.0

### 2026-09-28

#### 16 · 3dfa0eb

2026-09-28 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/3dfa0ebd528473dd6e4545990e344f049c3bd72e)

> Revise design document for adding system operation and key design decisions
> 
> Updated the design document to clarify system operation and key design decisions, including architecture, data models, and scoring rules.

#### 17 · e46e9c4

2026-09-28 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/e46e9c41987be39843d7688dff18c7511fdcad4e)

> Add testing evaluation report for calculation engine for test efficiency and accuracy
> 
> Added a detailed testing evaluation report for the calculation engine in order to improve the test efficiency and accuracy. The report includes test results, coverage, known limitations, and conclusions.

#### 18 · 15d7b57

2026-09-28 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/15d7b57d788ba1a4b6f3012e2b5899f56b1944c8)

> Update DEPLOY.md with static hosting options for user convenience
> 
> Added deployment methods for static file hosting services in order to make users easy to deploy the software.

### 2026-09-29

#### 19 · fe19175

2026-09-29 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/fe19175406ee3b3392afaf6a08fd438c82c07eda)

> Enhance design document with financial metrics definition for user reference
> 
> Added detailed metrics explanation and thresholds details used in the software in order to make user easy to understand the terminology meaning behind.

#### 20 · 2ab3fa4

2026-09-29 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/2ab3fa470f41e79d0d54f880b306952d6802ea44)

> Clarify design details in README for user clarification
> 
> Updated the README to clarify design details and metric definitions for user easy access to the metrics clarification in design doc.

#### 21 · 75d2030

2026-09-29 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/75d2030ced6a23e65e11af2ca68ac49b3f76ae0d)

> Expand validation results and recommendations in TEST.md
> 
> Added detailed validation results for cash flow reconciliation, CSV import checks, and score engine performance. Included suggestions for future improvements and noted unverified items.

### 2026-10-01

#### 22 · 6ba27f2

2026-10-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/6ba27f27891dd4130d07a189348cfca2e9bf0d80)

> Add advanced features to README for user reference
> 
> Added advanced features section with detailed descriptions, a guideline for user to grasp the meaning at the first glance

#### 23 · 257a714

2026-10-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/257a7147dd75e009a61b6e270df08fffe1782554)

> Update deployment guidelines in DEPLOY.md for user acknowledgment of environment setting
> 
> Added deployment notes regarding environment variables, data handling, custom domains, and usage warnings. This aims to make user have the full picture of the software deployment information.

### 2026-10-04

#### 24 · 3ec6056

2026-10-04 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/3ec6056f85a2d76b1dd2852b7d730463431663f2)

> Expand TEST.md with results and reproduction steps to enhance the stable user experience  
> 
> Added summary of results and reproduction methods for testing

#### 25 · 556c430

2026-10-04 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/556c430aec2365da6968366637e88d808d4d115b)

> Update DEPLOY.md with Github Pages deployment instructions for user easier installment and access
> 
> Added steps for deploying to GitHub Pages and other static hosts. That makes user easier to follow the Github deployment step by step.

#### 26 · 09859b8

2026-10-04 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/09859b8cc8f9640cf39c32eae898ca581cd38a63)

> Enhance design document with calculation engine details to help user evaluate the business status in accordance with metrics formula
> 
> Added a new section on the calculation engine and adjusted thresholds for various metrics. Included explanations for design choices and industry adaptation tips.

### 2026-10-05

#### 27 · 82f7a4a

2026-10-05 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/82f7a4aabe9e17281389cea0cebd39ded4bd546c)

> Update limitations and contribution guidelines in README for user notice before use
> 
> Clarify limitations of the tool and provide guidance for contributions.

### 2026-10-06

#### 28 · 3bd7554

2026-10-06 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/3bd75549318c839c7be5e71380ee1df589f472ce)

> Update the testing and evaluation report for user easier to access to the conclusions, limitations, and recommendations for future improvements.
> 
> Updated the testing and evaluation report with new sections and detailed results from automated tests.

#### 29 · a9a8d50

2026-10-06 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/a9a8d5007d321422c22d17817cb535ca97c9097a)

> Refine workflow documentation  for readiness improvement
> 
> Updated workflow documentation for clarity and consistency, including formatting changes and additional details in the development and release processes.

### 2026-10-10

#### 30 · 7f09f3e

2026-10-10 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/7f09f3e6be58dd7a98c560693003c97b9660dfb6)

> Revise workflow documentation and user instructions for clarity and structure 
> 
> Updated workflow documentation for clarity and structure.

#### 31 · e07ea6c

2026-10-10 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/e07ea6ce6f7f0a7f2d6f95e42b739b272aad20a7)

> Update workflow documentation for data import and release
> 
> Clarified the data import process and updated the release process steps to include changelog updates and testing.

### 2026-10-22

#### 32 · ac54bb9

2026-10-22 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/ac54bb909fe8f073b07f4f23bcae44bffe4057c3)

> Add bilingual summary so owners can interpret cash and profit
> 
> Explain how the prepared OPC AI prototype distinguishes cash surplus, accounting net profit, net margin and cash runway, so owner-operated businesses can read the example without confusing cash with earnings.
> 
> Describe the synthetic scenario, forecast assumptions, local validation scope and unimplemented features so readers can judge what the demo does and what still needs verification.
> 
> Publish only docs/TECHNICAL_SUMMARY.md. Label the matching application, data, figures, English/PDF versions and evaluation artifacts as pending upload, with plain-path references instead of unavailable attachment links.

### 2026-10-23

#### 33 · 097e045

2026-10-23 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/097e045d1bb179d0ac885dc9144f4816c10bf6ad)

> Clarify demo versions and setup so owners can try the dashboard
> 
> Rewrite the README in Chinese-first, English-second sections so owners can understand the dashboard's purpose, financial measures, and limits.
> 
> Distinguish the published manufacturing demo from the locally prepared OPC AI prototype, and label its application, data, screenshots, and evaluation files as pending upload.
> 
> Fix the repository-folder and CSV-template instructions and link to available files so readers can follow setup without missing attachments or unavailable npm commands.
> 
> This commit updates README.md only; it does not publish new application features.

#### 34 · 8e20169

2026-10-23 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/8e2016934daff5ee692a4073a97829958ec0a25d)

> Publish prepared README so owners can review the full OPC AI prototype
> 
> Replace the staged-publication README with the previously prepared Chinese-first, English-second README from the original open-source package, without editing its text.
> 
> Give owners the complete feature overview, cash-versus-profit example, setup instructions, validation scope, and project map in that document.
> 
> This commit replaces README.md only. The matching application and supporting files remain pending upload.

#### 35 · 9deb102

2026-10-23 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/9deb102d235f43c7dc07dfa80e232dc2729d1892)

> Add deployment guides so owners can preview and publish the dashboard
> 
> Publish the previously prepared Chinese-first, English-second deployment documents without changing their text.
> 
> Replace DEPLOY.md with the guide entry point and add docs/DEPLOYMENT.md so readers can find local preview instructions, GitHub Pages setup, and steps for recording a verified deployment.
> 
> This commit publishes documentation only. The matching application, preview scripts, workflow, and deployment-record template remain pending upload; no hosting settings are changed or successful deployment claimed.

### 2026-10-26

#### 36 · 0f9a83b

2026-10-26 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/0f9a83b478ba161e0f7b24484fbe0f46d37978df)

> Add steps that show the owner how to preview the dashboard locally and publish it on GitHub Pages
> 
> Replace the previous DEPLOY.md with a bilingual walkthrough of local preview, repository status, Pages setup, and release recording.
> 
> Written for the repository owner: each step names what to open and what a correct result looks like.
> 
> Updated deployment instructions for the Youshu static prototype, including local preview setup and GitHub Pages configuration.

#### 37 · ce79a3c

2026-10-26 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/ce79a3cebc6fe61d953e4b9b3534fb7f7c6be7c8)

> Replace TEST.md with a 28-check report that separates verified results from untested areas
> 
> Cover scenario shape, cash history, the accrual bridge, statements, forecast boundaries, 120 detail types, CSV output, interactions, and source structure.
> 
> Note the 28 checks ran locally on Node.js 23 and 24, and that the Node.js 22/24 Actions matrix is supplied but has not run.

### 2026-11-01

#### 38 · 3d096cf

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/3d096cf7ec61218f69b2ec96c315126fa6ab288e)

> Delete docs/template.csv

#### 39 · ddb04a9

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/ddb04a97e3c6f52ae96d6c9ccc4e63d7902c684c)

> Delete docs/TECHNICAL_SUMMARY.md

#### 40 · 5623caa

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/5623caaccd0cdaabbc1d29161a4da4eb83249419)

> Delete docs/DEPLOYMENT.md

#### 41 · b7625d2

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/b7625d2b76709469f5ce6667018a1d9354869520)

> Create assets folder

#### 42 · ff6ceee

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/ff6ceee04c64828cb7bbe41990e9502f8921c508)

> Delete assets/folder

#### 43 · 098a91f

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/098a91f7edb8a680185f7ea29dbe096228f1847a)

> Enhance workflow documentation for user guidance
> 
> Updated workflow documentation to clarify data handling and user instructions.

#### 44 · aa71399

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/aa71399e0e27954e2a5ac8f4c6e4b48ca89acd70)

> Delete docs/design.md

#### 45 · c9adf3e

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/c9adf3e56298214e4be698ebc7816e9649400505)

> Add evaluation report so users can review test coverage and limitations
> 
> This document provides a comprehensive evaluation of version 0.3.1, detailing the scope of functional checks, results, and validation boundaries. It includes both English and Chinese documentation for better accessibility.

#### 46 · dd65c1c

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/dd65c1c01319dcb398e60bab872327c6e78e78c2)

> Add deployment instructions so users can run and host the app
> 
> Updated deployment instructions, including local usage and static hosting guidelines.

#### 47 · 1fab3b0

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/1fab3b051bd81ec2628845d5a20dfe45f1855bc7)

> Delete TEST.md

#### 48 · 4e8bea3

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/4e8bea36bc9b72fdefe2b70c9504ced133f52ecc)

> Delete index.html

#### 49 · 7933c62

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/7933c62227ea127fcbdfba0bbf4888b7777aac08)

> Update dashboard so users can explore examples and create personal reports
> 
> latest version

#### 50 · ddd0a09

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/ddd0a095eddeb22c3db1631768a25bdafd65b243)

> Create file

#### 51 · 8bbdf22

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/8bbdf22f2771c412a2128b54eb4c0dcb35c3522c)

> Add local processing components so users can turn statements into reports

#### 52 · 54952ce

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/54952ce893a667c4e648f4a300a01103ec60b2c2)

> Create file

#### 53 · 181e9fb

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/181e9fb58ff02833caf4e3427c8273f1d4e1ae53)

> Delete assets/file

#### 54 · 960dffd

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/960dffd9d8ec72ce74b813888ed121c2ac83a75c)

> Add financial templates to make data preparation and imports easier

#### 55 · aab2119

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/aab2119abb84a90334123cbffe2d06aa0e6a697c)

> Rename evaluation.md to EVALUATION.md

#### 56 · 373e5fc

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/373e5fcff53b52b761aaa87a0d3021f1b7afe129)

> Rename workflow.md to WORKFLOW.md

#### 57 · 2628cdf

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/2628cdf8a7e9511d98427be85a32ffcf82cbf00b)

> Revise README so users can understand the app and get started
> 
> Updated the README to reflect new version and features, including usage instructions and project documentation.

#### 58 · 65ba718

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/65ba7188f59bbf867c0b6995837328d9030474a9)

> Add files via upload

#### 59 · f71ff63

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/f71ff6382e256b2c0e692db8550fd015ecf01966)

> Delete youshu-github-v0.3.1-bilingual.zip

#### 60 · 002a54a

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/002a54aa76833e56f4d71fdee9cea6f19f0ef711)

> Release Youshu v0.3.1 with statement imports, financial reports, and bilingual documentation for user deployment

#### 61 · 9147e9b

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/9147e9b2fb2c2fe271c7e1bb684e62fda66102cb)

> Enhance README with clearer descriptions and download link
> 
> Updated descriptions for clarity and added download link for the zip file.

#### 62 · 31a25e4

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/31a25e4531d803fbd1a7c452d75d6519923855dc)

> Update README description for better clarity
> 
> Refine the description for clarity and professionalism.

#### 63 · 5aeaee6

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/5aeaee6c5e4237238abd842e5d6bf7cb55a1b8f5)

> Update README with grammar fixes and images
> 
> Corrected grammar and added additional images to the README.

#### 64 · eaadb8b

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/eaadb8be3bedd1ff10fda839d89ea6ca1b936470)

> Update README.md by removing an image
> 
> Removed an image and updated the README content for clarity.

#### 65 · bd4dd64

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/bd4dd64262d0d151477ae9119ba78de7be06ae30)

> Add additional screenshots to README
> 
> Added two new images to the README file.

#### 66 · 86cf00d

2026-11-01 · [View commit and changes](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commit/86cf00dafb5bf21d098584ec2e0692e5f49cff46)

> Revise Commit History for clarity and updates
> 
> Updated commit history document to reflect changes and enhancements made in the project, including version details and submission summaries.
