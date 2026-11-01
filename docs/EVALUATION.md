# 测试报告

版本 **0.3.1** · 功能检查日期 **2026 年 11 月 1 日**

## 功能检查范围

- 首页直接展示虚构的星辰AI应用工作室报告，保留随机体验、我的报告两个入口。
- 新访客的我的报告为空；同一浏览器中的旧存储不会被自动加载到当前账本。
- 账单、期初余额、账户余额补录、应收和计划付款全部清空后，当页与重新打开时均无个人报告或撤销记录。
- 清空失败会显示未完成，保留当前页面数据并允许重试；重新添加账单后能够正常保存和恢复。
- CSV、Excel、PDF 的读取与核对、多份账单追加、重复记录、月份筛选、图表明细、财务报表、余额、现金预测、评分及建议。
- 本地资源和文档链接有效；发布包不包含引导页、个人账单、个人报告、账本备份或私人截图。

## 功能检查结果

**497 项检查通过，0 项失败。**其中 432 项为功能回归，36 项为示例报告检查，29 项为文件读取检查。

存储与发布隔离检查共 21 项，包含完整清空、失败重试、空账本以及新增资料的保存恢复，属于上述功能验证范围。

测试环境：Node.js v23.11.0。正式发布文件清单为 70 个文件。

## 发布文件检查

发布文档与许可说明提供中英双语。`index.html`、JavaScript、样式和六份导入模板与上述已验证版本逐字节一致，软件界面和功能保持原样。主许可证保留完整英文正文并附中文参考译文；第三方许可正文保留原文，另附双语导读。

本地资源和文档链接已核对，压缩包仅包含正式发布文件，不包含系统缓存、个人账单或账本备份。本次文档排版调整未更改软件；发布检查核对了文档、许可原文及运行文件一致性，未重复运行未改动软件的完整功能测试。

## 验证边界

自动检查使用 Node.js、合成账单和模拟页面环境，不读取发布者的真实账本。本报告不等同于真实浏览器的全面兼容验收，也不代表任意银行 PDF 都能自动识别成功。扫描质量、跨平台重复交易和账务完整性仍需使用者核对。

当前包提供本测试报告，不附带测试开发材料。应用和组件保留必要许可证。部署后的表现仍需在实际访问地址检查。

---

# Evaluation report

Version **0.3.1** · Functional checks dated **November 1, 2026**

## Functional check scope

- The homepage directly displays the fictional 星辰AI应用工作室 (Xingchen AI Applications Studio) report, with Random experience and My report as the two entry points.
- My report is empty for new visitors. Older storage in the same browser is not automatically loaded into the current ledger.
- After clearing statements, opening balances, supplementary account balances, receivables, and planned payments, neither the current page nor a reopened page retains a personal report or undo record.
- A failed clear operation reports that it is incomplete, retains the current page's data, and allows retrying. Newly added statements can subsequently be saved and restored.
- Coverage includes CSV, Excel, and PDF reading/review; multiple-statement imports; duplicate records; month filtering; chart details; financial statements; balances; cash projections; scores; and suggestions.
- Local resources and documentation links are valid. The release excludes an onboarding page, personal statements, personal reports, ledger backups, and private screenshots.

## Functional check results

**497 checks passed and 0 failed:** 432 functional regression checks, 36 example-report checks, and 29 file-reading checks.

The functional validation includes 21 storage and release-isolation checks covering complete clearing, failure/retry, empty ledgers, and saving/restoring newly added records.

Test environment: Node.js v23.11.0. The formal release contains 70 files.

## Release file checks

Release documentation and license explanations are bilingual. `index.html`, JavaScript, styles, and the six import templates are byte-for-byte identical to the validated version described above; the interface and functionality are unchanged. The main license retains its complete English text with a Chinese reference translation. Third-party license texts remain intact with bilingual reading guides.

Local resource and documentation links were checked. The archive contains only formal release files, excluding system caches, personal statements, and ledger backups. This documentation-layout update does not change the software. Release checks cover documentation, original license text, and runtime-file identity; the full functional suite was not repeated for the unchanged software.

## Validation boundaries

Automated checks use Node.js, synthetic statements, and a simulated page environment without reading the publisher's real ledger. This report is not comprehensive compatibility acceptance in real browsers and does not establish successful automatic recognition of every bank PDF. Users must still review scan quality, cross-platform duplicate transactions, and accounting completeness.

The package includes this evaluation report, not the test-development materials. The application and bundled components retain the required licenses. Behavior after deployment must still be checked at the actual access address.
