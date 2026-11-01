# 部署说明

下载压缩包。有数 0.3.1 是静态网页软件。`index.html` 为首页，不需要后端数据库或构建步骤。

## 本机使用

完整解压后直接打开 `index.html`，进入随机体验。保留 `assets/`、`templates/` 等目录和首页的相对位置，不要只复制单个 HTML 文件。

## 静态网站部署

1. 将发布目录中的文件上传到静态网站空间，确保网站根目录可访问 `index.html`。
2. 完整保留本地脚本、读取组件、字体、模板及相关许可证，保持文件路径不变。
3. 使用 HTTPS 访问部署地址，确认首页显示虚构示例，“再来一个”可切换报告。
4. 在没有账本的新浏览器环境中确认“我的报告”为空，再使用虚构账单检查导入、保存及刷新恢复。

发布前检查文件列表，不要上传真实账单、个人账本备份、个人报告或浏览器资料目录。发布包的准备不代表网站已经上线。

## 保存范围

账本保存在使用者当前浏览器的本地存储中，不保存到静态网站服务器。不同浏览器、不同网站地址或本机文件位置可能使用不同的存储空间，彼此不自动同步。切换访问地址前，请下载账本备份，在新地址恢复。

更新网站时保留完整资源和相对路径，并在更新后检查首页及导入功能。网站更新不应主动清空使用者的账本。

---

# Deployment

Youshu 0.3.1 is a static web application. `index.html` is the homepage. No backend database or build step is required.

## Local use

Fully extract the package and open `index.html` to enter Random experience. Keep `assets/`, `templates/`, and the other folders in their original locations relative to the homepage. Do not copy only the HTML file.

## Static hosting

1. Upload the release folder's contents to a static host, ensuring that `index.html` is accessible at the website root.
2. Include all local scripts, file readers, fonts, templates, and applicable licenses, preserving their paths.
3. Open the deployed address over HTTPS. Confirm that the homepage displays a fictional example and “再来一个” (Another one) switches reports.
4. In a fresh browser environment without a ledger, confirm that My report is empty. Then use fictional statements to check importing, saving, and restoration after a refresh.

Review the file list before publishing. Do not upload real statements, personal ledger backups, personal reports, or browser profile folders. Preparing a release package does not mean the website is already live.

## Storage scope

Ledgers are saved in each user's current browser storage, not on the static hosting server. Different browsers, website addresses, or local file locations may use separate storage and do not automatically synchronize. Before changing the access address, download a ledger backup and restore it at the new address.

When updating the website, retain all resources and their relative paths, then check the homepage and import functionality. Website updates should not actively erase users' ledgers.
