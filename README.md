# 经营看板 · 小微企业财务分析与风险预警

一个打开就能用的网页，把小微企业每月的财务数字变成老板看得懂的经营结论：钱够不够、利润去哪了、哪个客户欠款该催、未来账上现金流还剩多少。

> An open-source, single-file web dashboard that turns a small business's monthly bookkeeping numbers into plain-language health scores, risk warnings and actionable advice. No server, no login, no data leaves the browser.

## 它解决什么问题

小微企业老板通常没有财务总监，财务软件导出的报表又只有会计看得懂。这个看板把三张报表翻译成七个问题的答案：

| 页面 | 回答的问题 |
|---|---|
| 财务总览 | 现在最该关心什么？赚到的钱和账上多出来的钱为什么不一样？ |
| 收入分析 | 靠什么挣钱，每 100 元收入一路扣下来还剩几元？ |
| 现金流 | 每月钱进钱出，未来 6 个月账上还剩多少？（可拖滑块推演） |
| 应收账款 | 卖出去的货，钱收回来了吗？哪个客户该催？ |
| 财务报表 | 利润表、资产负债表、现金流量表（按所选期间汇总） |
| 分析建议 | 五个维度打分，风险按轻重排序，每条建议都带影响估算 |
| 数据管理 | 数据从哪来、质量如何、每个指标怎么算 |

## 功能

- **健康评分**：盈利能力、现金安全、回款效率、成本控制、成长性五维加权（25/25/20/15/15），≥70 健康、50–69 关注、<50 风险。
- **风险预警**：规则引擎自动识别利润没变成现金、应收涨得比收入快、毛利盖不住固定开支等情形，并用白话解释。
- **可执行建议**：每条建议给出具体动作（找谁、做什么）和预计影响（现金增加多少、可支撑月数提高到多少）。
- **沙盘推演**：调整收入变化、客户付款快慢、弹性支出削减三个滑块，看未来 6 个月现金曲线与 3 个月安全线。
- **数据导入**：按模板整理 CSV 后导入，看板重新计算全部分析；内置 24 个月虚构样例数据用于演示。
- **月份筛选**：单选、多选、最近 12 个月、按年、全部。
- **零依赖部署**：一个 HTML 文件，仅从 CDN 加载 Chart.js；支持深色模式与手机屏幕。

## 快速开始

```bash

git clone https://github.com/MirandaZhao/OPC-Auto-Finance-Report.git
cd sme-finance-dashboard
# 直接双击 index.html，或起一个本地静态服务器：
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

导入自己的数据：进入「数据管理」→「复制模板列名」→ 按 [data/template.csv](data/template.csv) 的格式整理近 12–24 个月数据（金额单位：万元）→「选择 CSV 文件」。


## 技术说明

- 纯前端：HTML + CSS + 原生 JavaScript，图表用 [Chart.js 4](https://www.chartjs.org/)（CDN）。
- 计算引擎（`ENGINE`）与渲染层分离，引擎不依赖 DOM，可单独测试。
- 数据只在浏览器内存中处理，刷新页面即恢复样例数据；不上传、不存储。
- 设计细节见 [docs/design.md](docs/design.md)。

## 局限与声明

- 看板是只读分析工具，不替代会计核算；评分阈值是经验值，适合制造、贸易类小微企业，其他行业需调整（见 `docs/metrics.md`）。
- 样例数据为虚构的小型机械配件加工企业 2024 年 9 月—2026 年 8 月的经营数据，仅用于演示。

## 参与

欢迎提 Issue 和 Pull Request。提交前请运行测试，提交信息请说明"改了什么、为了谁"（示例见 [docs/workflow.md](docs/workflow.md#提交规范)）。

## 许可证

[MIT](LICENSE) © 2026 <Miranda Zhao>
