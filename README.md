<img width="1265" height="712" alt="youshu-navigation-home" src="https://github.com/user-attachments/assets/53b16ace-152f-4143-8d48-595a93ff819e" /># 有数

**把微信、支付宝和银行账单，变成个性化财务报告。专业还能看得懂！小微企业及OPC个人最佳搭子！**

版本 **0.3.1** · 中文界面 · 人民币

<img width="1265" height="712" alt="youshu-navigation-home" src="https://github.com/user-attachments/assets/f0906334-49c3-46ac-90e0-d562e825f81e" />
<img width="1320" height="518" alt="youshu-own-report-hover" src="https://github.com/user-attachments/assets/50459107-4589-4aab-87f2-ed9959defd68" />
<img width="1173" height="809" alt="youshu-sandbox-centered" src="https://github.com/user-attachments/assets/389f3300-f79d-43e8-9827-5ab2a48875ec" />


## 使用

下载[压缩包](youshu-github-v0.3.1-bilingual.zip)。
完整解压后，直接打开 **[index.html](index.html)**。
首页展示模拟的星辰AI应用工作室报告，无需安装或注册。数据仅存留你的本地，无收集上传。

- **随机体验**：点击“再来一个”，查看不同公司的模拟报告。
- **我的报告**：添加自己的账单，核对后生成报告。可以一次添加多份，也可以继续追加；在“管理账单”中管理导入记录和备份。

支持 CSV、Excel 和 PDF。银行 PDF 的版式和扫描质量不同，识别后需要核对全部页面、日期、方向和金额；无法正确读取时，可使用银行导出的 Excel 或 CSV。

我的报告支持“全部月份”和最近 12 / 6 / 3 / 1 个月。“最近”取账单中有数据的最近月份，跳过缺月。

## 数据与保存

软件只附带虚构示例，不附带个人账本。我的报告使用自己导入和补录的数据，保存在当前浏览器中，没有自动云同步。等待“已保存”后关闭；更换浏览器、移动软件或清理浏览器数据前，请先下载账本备份。

账本 JSON 用于恢复，导出的 HTML / PDF 用于阅读。个人账单、备份和报告应放在软件发布目录之外；上传软件文件不会上传浏览器中保存的账本。

需要清除个人资料时，进入“我的报告 → 管理账单”，点击“清空我的报告”。确认后会清除账单、余额、补录和报告，不保留撤销记录；原始文件和已下载备份仍留在电脑上。

现金结余不等于净利润。账务报表需要相应资料；预测、评分和建议依据已有数据及假设生成。

## 项目文档

[工作流程](docs/WORKFLOW.md) · [测试报告](docs/EVALUATION.md) · [部署说明](DEPLOY.md) · [提交历史说明](Commit%20History.md) · [许可证](LICENSE)

维护者 **Yuchen Zhao**。采用 MIT 许可证，保留 MirandaZhao 与 Yuchen Zhao 的版权声明。随包第三方组件按[各自许可证](assets/vendor/NOTICE.md)分发。

---

# Youshu

**Turn WeChat, Alipay, and bank statements into your own financial report. Small business and OPC use must have. **

Version **0.3.1** · Chinese interface · CNY

## Getting started

Download **[zip file](youshu-github-v0.3.1-bilingual.zip)**. Fully extract the package and open **[index.html](index.html)** directly. The homepage displays the fictional 星辰AI应用工作室 (Xingchen AI Applications Studio) report. No installation or registration is required. No data is collected.

- **Random experience:** select “再来一个” (Another one) to explore fictional reports for different companies.
- **My report:** add your statements, review them, and generate a report. Add multiple files at once or append more later. Use “管理账单” (Manage statements) to manage imports and backups.

CSV, Excel, and PDF are supported. Bank PDF layouts and scan quality vary. After extraction, check every page, date, cash direction, and amount. If a PDF cannot be read correctly, use the bank's Excel or CSV export.

My report offers “全部月份” (All months) and the latest 12 / 6 / 3 / 1 months. “Latest” refers to the most recent months with data in the ledger, skipping missing months.

## Data and saving

The software includes fictional examples, not a personal ledger. My report uses your imported and supplementary records, saved in the current browser without automatic cloud synchronization. Wait for “已保存” (Saved) before closing. Download a ledger backup before changing browsers, moving the software, or clearing browser data.

Ledger JSON files restore your work; exported HTML / PDF files are reading copies. Keep personal statements, backups, and reports outside the software release folder. Uploading software files does not upload the ledger stored in your browser.

To remove personal data, open “我的报告 → 管理账单” (My report → Manage statements) and select “清空我的报告” (Clear my report). Confirming removes statements, balances, supplementary records, and the report without retaining an undo copy. Original files and downloaded backups remain on your computer.

Cash surplus is not net profit. Accounting statements require supporting records. Forecasts, scores, and suggestions use available data and assumptions.

## Project documentation

[Workflow](docs/WORKFLOW.md) · [Evaluation](docs/EVALUATION.md) · [Deployment](DEPLOY.md) · [Commit history](Commit%20History.md) · [License](LICENSE)

Maintainer: **Yuchen Zhao**. Licensed under MIT, preserving the MirandaZhao and Yuchen Zhao copyright notices. Bundled third-party components are distributed under [their respective licenses](assets/vendor/NOTICE.md).


