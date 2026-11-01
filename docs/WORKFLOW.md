# 工作流程

有数 0.3.1 使用同一套报告界面展示虚构示例和用户自己的账本，两类数据相互独立。

## 数据如何生成报告

1. **选择数据**：随机体验使用内置合成场景；我的报告接收 CSV、Excel、PDF 和补录资料。
2. **读取与核对**：在浏览器中解析文件，识别账户、日期、交易对象、收支方向、金额和余额。需要审核的文件经过用户核对后导入；PDF 需检查记录完整性。
3. **加入账本**：多份账单持续追加，保留导入来源并检查可识别的重复记录。跨平台同一笔付款仍可能需要人工核对。
4. **选择期间**：按全部月份或最近有数据的月份汇总，联动各模块。余额、应收等时点信息按各自日期展示。
5. **计算与展示**：生成收支、余额、收入成本结构、现金预测、应收、分析建议及有资料支持的财务报表；点击图表可查看对应明细。
6. **本机保存**：账本保存在当前浏览器中。下载账本备份可以恢复工作，导出报告用于阅读。

## 计算口径

- 看板收支排除已识别的投资理财、信用还款、他人代付、本人资金互转；退款入账计入收入。原始交易保留，实际资金变动和账务报表按各自口径计算。
- 账户余额优先使用已识别或用户确认的数据。缺失余额暂按 0 估算并标注，用户可在余额弹窗修改。
- 现金流沙盘保留历史和未来六个月预测；推算历史与预测均不代表银行已确认余额。
- 应收款、计划收付款、账务利润和资产负债可按需补录。缺失日期不作为判断逾期的依据。
- 评分、雷达图和建议依据已有资料生成，并提示样本局限。

**现金结余不等于账务利润。**只有流水时，可以分析收支与现金；完整利润表和资产负债表需要相应账务资料，不用虚构数据补齐。

## 发布范围

软件仅附带虚构示例和空白模板，不附带个人账本。个人记录保存在浏览器中，不会随源码复制；个人备份和导出报告应放在发布目录之外。

---

# Workflow

Youshu 0.3.1 uses the same report interface for fictional examples and users' own ledgers. The two datasets remain separate.

## From data to reports

1. **Select data:** Random experience uses built-in synthetic scenarios. My report accepts CSV, Excel, PDF, and supplementary records.
2. **Read and review:** files are parsed in the browser to identify accounts, dates, counterparties, cash directions, amounts, and balances. Files requiring review are imported after user confirmation. Check PDFs for complete transaction extraction.
3. **Add to the ledger:** append multiple statements while retaining import sources and checking identifiable duplicates. The same payment appearing across platforms may still require manual review.
4. **Choose the period:** summarize all months or the latest months containing data, updating the report modules together. Balances, receivables, and other point-in-time information retain their respective dates.
5. **Calculate and display:** generate cash activity, balances, income/cost breakdowns, cash projections, receivables, insights, and financial statements supported by the supplied records. Click charts to view the corresponding details.
6. **Save locally:** the ledger stays in the current browser. Downloaded ledger backups restore editable work; exported reports are reading copies.

## Calculation definitions

- Dashboard income and spending exclude recognized investing, credit repayments, payments made by others, and transfers between your own accounts. Incoming refunds count as income. Original transactions are retained; actual cash movements and accounting statements use their respective definitions.
- Account balances prioritize recognized or user-confirmed values. Missing balances temporarily use a marked zero estimate, which users can edit in the balance dialog.
- Cash scenarios retain historical data and a six-month forecast. Inferred history and projections do not represent bank-confirmed balances.
- Receivables, planned receipts/payments, accounting profit, and balance-sheet information can be supplemented as needed. Missing dates are not evidence of overdue status.
- Scores, radar charts, and suggestions use available records and indicate sample limitations.

**Cash surplus is not accounting profit.** Transactions alone support cash activity analysis. Complete income statements and balance sheets require supporting accounting records and are not filled with invented data.

## Release contents

The software includes fictional examples and blank templates, not a personal ledger. Personal records stay in the browser and are not copied with the source files. Keep personal backups and exported reports outside the release folder.
