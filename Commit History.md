# Commit History · 提交记录

**OPC-Auto-Finance-Report（有数 / Youshu）**
把微信、支付宝和银行账单，变成看得懂的小微企业经营报告。

| 项目 | 内容 |
| --- | --- |
| 仓库 | [github.com/MirandaZhao/OPC-Auto-Finance-Report](https://github.com/MirandaZhao/OPC-Auto-Finance-Report) |
| 统计区间 | 2026-09-22 — 2026-11-01 |
| 提交总数 | 65 次 |
| 作者 | MirandaZhao |
| 许可证 | MIT |

---

## 一、提交总览

| 日期 | 提交数 | 当日主线 |
| --- | ---: | --- |
| 2026-09-22 | 15 | 项目初始化，首个公开版本 1.0.0 |
| 2026-09-28 | 3 | 设计文档补充系统运行与关键决策 |
| 2026-09-29 | 3 | 定义财务指标，扩充验证结果 |
| 2026-10-01 | 2 | README 进阶功能、部署环境说明 |
| 2026-10-04 | 3 | 计算引擎细节、GitHub Pages 部署、复现步骤 |
| 2026-10-05 | 1 | 使用前局限与贡献指南 |
| 2026-10-06 | 2 | 测试评估报告重组、工作流完善 |
| 2026-10-10 | 2 | 数据导入与发布流程说明 |
| 2026-10-22 | 1 | 中英双语摘要 |
| 2026-10-23 | 3 | 预览与发布路径打通 |
| 2026-10-26 | 2 | 28 项检查报告，区分已验证与未测试 |
| 2026-11-01 | 28 | v0.3.1 重构：目录整理、模板与本地处理组件、README 重写 |
| **合计** | **65** | |

---

## 二、演进阶段

### 阶段一 · 2026-09-22 — 从零到 1.0.0

一天之内完成 15 次提交，把原型变成可公开的版本：七个页面（财务总览、收入分析、现金流、应收账款、财务报表、分析建议、数据管理）、五维健康评分与规则式风险预警、未来 6 个月现金沙盘推演、CSV 导入与数据质量检查，并同步补齐 README、设计文档、测试评估与部署说明。

### 阶段二 · 2026-09-28 — 10-10 — 把「能跑」讲清楚

主线从写代码转向写清楚：补充系统运行机制与关键设计决策，明确定义各项财务指标的计算口径，把测试从结论扩充到可复现步骤，并给出静态托管与 GitHub Pages 两种部署路径。工作流文档在这一阶段被反复打磨，用于说明数据导入与发布流程。

### 阶段三 · 2026-10-22 — 10-26 — 双语与可验证

补齐中英双语摘要（让非财务背景的使用者也能读懂现金与利润的关系），把「本地预览 → 发布上线」拆成可照做的步骤，并把测试记录重写为 28 项检查清单，明确区分已验证结果与未覆盖的范围。

### 阶段四 · 2026-11-01 — v0.3.1 重构

单日 27 次提交完成结构性整理：`docs/` 下文档统一为下划线大写命名（`WORKFLOW.md`、`EVALUATION.md`），清理早期重复与废弃文件，新增 `templates/` 财务模板和本地处理组件（直接由账单生成报告），提供 `youshu-github-v0.3.1-bilingual.zip` 分发包，并整篇重写 README，让使用者能自行完成下载、导入与出报告。

---

## 三、完整提交记录

> 按时间正序排列（最早 → 最近）。`类型` 仅用于快速检索，非官方标注。

### 2026-09-22

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 1 | Initial commit | 初始化 |
| 2 | Revise README for project overview and functionality | 文档 |
| 3 | Update license details in README.md | 文档 |
| 4 | Revise cash flow explanation and remove feature note | 文档 |
| 5 | Update README by revising sections | 文档 |
| 6 | Add system design documentation | 文档 |
| 7 | Update workflow documentation for release process | 文档 |
| 8 | Enhance release workflow documentation | 文档 |
| 9 | Rename workflow to workflow.md | 结构 |
| 10 | Create testing and evaluation report in TEST.md | 文档 |
| 11 | Create deployment instructions in DEPLOY.md | 文档 |
| 12 | sample finance report for review | 资源 |
| 13 | Update README to revise Chart.js reference | 文档 |
| 14 | Add files via upload | 资源 |
| 15 | Add initial commit history for version 1.0.0 | 文档 |

### 2026-09-28

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 16 | Revise design document for adding system operation and key design decisions | 文档 |
| 17 | Add testing evaluation report for calculation engine for test efficiency and accuracy | 文档 |
| 18 | Update DEPLOY.md with static hosting options for user convenience | 文档 |

### 2026-09-29

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 19 | Enhance design document with financial metrics definition for user reference | 文档 |
| 20 | Clarify design details in README for user clarification | 文档 |
| 21 | Expand validation results and recommendations in TEST.md | 文档 |

### 2026-10-01

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 22 | Add advanced features to README for user reference | 文档 |
| 23 | Update deployment guidelines in DEPLOY.md for user acknowledgment of environment setting | 文档 |

### 2026-10-04

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 24 | Expand TEST.md with results and reproduction steps to enhance the stable user experience | 文档 |
| 25 | Update DEPLOY.md with Github Pages deployment instructions for user easier installment and access | 文档 |
| 26 | Enhance design document with calculation engine details to help user evaluate the business status in accordance with metrics formula | 文档 |

### 2026-10-05

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 27 | Update limitations and contribution guidelines in README for user notice before use | 文档 |

### 2026-10-06

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 28 | Update the testing and evaluation report for user easier to access to the conclusions, limitations, and recommendations for future improvements. | 文档 |
| 29 | Refine workflow documentation for readiness improvement | 文档 |

### 2026-10-10

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 30 | Revise workflow documentation and user instructions for clarity and structure | 文档 |
| 31 | Update workflow documentation for data import and release | 文档 |

### 2026-10-22

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 32 | Add bilingual summary so owners can interpret cash and profit | 文档 |

### 2026-10-23

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 33 | Clarify demo versions and setup so owners can try the dashboard | 文档 |
| 34 | Publish prepared README so owners can review the full OPC AI prototype | 文档 |
| 35 | Add deployment guides so owners can preview and publish the dashboard | 文档 |

### 2026-10-26

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 36 | Add steps that show the owner how to preview the dashboard locally and publish it on GitHub Pages | 文档 |
| 37 | Replace TEST.md with a 28-check report that separates verified results from untested areas | 文档 |

### 2026-11-01

| # | 提交信息 | 类型 |
| ---: | --- | --- |
| 38 | Delete docs/template.csv | 清理 |
| 39 | Delete docs/TECHNICAL_SUMMARY.md | 清理 |
| 40 | Delete docs/DEPLOYMENT.md | 清理 |
| 41 | Create assets folder | 结构 |
| 42 | Delete assets/folder | 清理 |
| 43 | Enhance workflow documentation for user guidance | 文档 |
| 44 | Delete docs/design.md | 清理 |
| 45 | Add evaluation report so users can review test coverage and limitations | 文档 |
| 46 | Add deployment instructions so users can run and host the app | 文档 |
| 47 | Delete TEST.md | 清理 |
| 48 | Delete index.html | 清理 |
| 49 | Update dashboard so users can explore examples and create personal reports | 功能 |
| 50 | Create file | 资源 |
| 51 | Add local processing components so users can turn statements into reports | 功能 |
| 52 | Create file | 资源 |
| 53 | Delete assets/file | 清理 |
| 54 | Add financial templates to make data preparation and imports easier | 资源 |
| 55 | Rename evaluation.md to EVALUATION.md | 结构 |
| 56 | Rename workflow.md to WORKFLOW.md | 结构 |
| 57 | Revise README so users can understand the app and get started | 文档 |
| 58 | Add files via upload | 资源 |
| 59 | Delete youshu-github-v0.3.1-bilingual.zip | 清理 |
| 60 | Release Youshu v0.3.1 with statement imports, financial reports, and bilingual documentation for user deployment | 发布 |
| 61 | Enhance README with clearer descriptions and download link | 文档 |
| 62 | Update README description for better clarity | 文档 |
| 63 | Update README with grammar fixes and images | 文档 |
| 64 | Update README.md by removing an image | 文档 |
| 65 | Update README.md by adding an image | 文档 |

---

## 四、版本节点

### 0.3.1 — 2026-11-01

当前发布版本，中英双语文档。

- 支持 CSV、Excel、PDF 账单导入，「我的报告」可多份追加、随时管理导入记录与备份
- 首页内置虚构示例（星辰AI应用工作室），点击「再来一个」随机切换，无需安装或注册
- 报告时间范围支持「全部月份」与最近 12 / 6 / 3 / 1 个月，自动跳过缺月
- 新增 `templates/` 财务模板，降低数据准备与导入门槛
- 本地处理组件：账单直接在浏览器端转为报告，数据不上传
- 提供 `youshu-github-v0.3.1-bilingual.zip` 分发包，解压后打开 `index.html` 即可使用

### 1.0.0 — 2026-09-22

首个公开版本。

- 七个页面：财务总览、收入分析、现金流、应收账款、财务报表、分析建议、数据管理
- 五维健康评分与规则式风险预警
- 未来 6 个月现金沙盘推演（收入、回款、弹性支出三个滑块）
- CSV 导入与数据质量检查
- 计算引擎自动化测试 14 项，全部通过

---

## 五、说明

- 全部 65 次提交均由同一账号（MirandaZhao）通过 GitHub 网页界面完成，标记为 Verified；完整 SHA 与逐条 diff 见仓库 [Commits](https://github.com/MirandaZhao/OPC-Auto-Finance-Report/commits/main) 页面。
- 提交信息保留原始英文表述，未做改写；`Create file`、`Add files via upload` 等为网页端直接上传自动生成的标题。
- 同一天内的提交顺序依据 GitHub 时间戳（精确到「几小时前 / 几分钟前」），分钟级先后可能存在误差。
- `类型` 标签按提交内容归类，用于检索，不代表仓库内的正式分类。

*最后更新：2026-11-01*
