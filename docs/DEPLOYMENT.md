# 运行与发布演示 / Running and publishing the demo

有数是一个静态原型。`index.html` 包含示例场景、样式、逻辑和图表。运行看板不需要服务端组件、API 密钥、数据库、安装依赖或构建。

Youshu is a static prototype. `index.html` includes the scenario, styles, logic, and charts. No server-side component, API key, database, package installation, or build is required for the dashboard.

## 本地预览 / Local preview

可以直接用现代浏览器打开 `index.html`，也可以使用 Node.js 22 或更高版本运行以下命令：

Open `index.html` directly in a modern browser, or use Node.js 22 or later:

```sh
npm start
```

访问 `http://127.0.0.1:8000`。需要使用其他端口时，运行：

Visit `http://127.0.0.1:8000`. To use another port:

```sh
npm start -- --port 8080
```

预览服务器只监听本机回环地址，仅提供本项目中的文件，按 Ctrl+C 停止。本地预览属于开发检查，不能作为已公开部署或已有客户使用的证据。

The preview server binds to loopback, serves files from this project only, and stops with Ctrl+C. Local preview is a development check; it is not evidence of a public deployment or customer use.

## 仓库与新版材料状态 / Repository and package status

已确认的公开仓库是 [MirandaZhao/OPC-Auto-Finance-Report](https://github.com/MirandaZhao/OPC-Auto-Finance-Report)，默认分支为 `main`。仓库目前有较早版本的文件；本次准备的新版材料尚未上传，GitHub Pages 站点也尚未验证。仓库已经公开，不代表本材料包或演示站点已经发布。

The confirmed public repository is [MirandaZhao/OPC-Auto-Finance-Report](https://github.com/MirandaZhao/OPC-Auto-Finance-Report), with `main` as its default branch. It currently contains earlier files; this newly prepared package has not yet been uploaded, and a GitHub Pages site has not been verified. An existing public repository does not establish publication of this package or its demonstration site.

## 上传新版后配置 GitHub Pages / GitHub Pages, after package publication

1. 将本项目文件夹内的内容更新到上述现有仓库，包含隐藏文件，并将 `index.html` 保留在仓库根目录。更新前先核对已有文件，避免覆盖需要保留的材料。
2. 使用维护者本人配置的身份作真实提交，并保留仓库已有历史。本材料包不包含人为编造的提交历史。
3. 在仓库 Settings 中打开 Pages，选择从分支发布，再选择实际默认分支 `main` 和根目录。
4. 将 `.nojekyll` 保留在根目录，使静态文件无需经过 Jekyll 处理即可提供访问。
5. 等待 GitHub 返回部署结果。使用 GitHub 实际给出的地址；不能仅凭预期的网址格式判断发布成功。
6. 打开页面，点击总览卡片、切换月度期间、悬停净利润率折线、调整预测输入，并下载明细 CSV。
7. 填写[部署记录](../evidence/templates/deployment-log.md)，记录网址、提交、日期、浏览器和观察结果。验证后再将真实站点地址加入 README。

1. Update the existing repository above with this project's contents, including dotfiles, keeping `index.html` at the repository root. Review existing files before updating so materials that should be retained are not overwritten.
2. Make a genuine commit using the maintainer's configured identity and preserve the repository's existing history. This package does not contain a synthetic commit history.
3. In repository Settings, open Pages and choose the branch publishing source. Select the actual default branch, `main`, and the root folder.
4. Keep `.nojekyll` at the root so the static files are served without Jekyll processing.
5. Wait for GitHub's deployment result. Use the URL GitHub actually returns; do not treat an expected URL pattern as a successful publication.
6. Open the page, click an overview card, switch the monthly period, hover the margin line, adjust a forecast input, and download a detail CSV.
7. Complete a [deployment record](../evidence/templates/deployment-log.md) with the URL, commit, date, browser, and observed result. Add the real URL to the README once verified.

已准备的工作流会在推送或拉取请求后，用 Node.js 22 和 24 运行测试。存在工作流 YAML 文件不等于 GitHub Actions 已经运行完成；执行后应记录真实运行地址和结果。

The prepared workflow runs tests on Node.js 22 and 24 after push or pull request. The presence of workflow YAML is not a completed GitHub Actions run. Record the actual run URL and result after it executes.

公开仓库及其 Pages 网站中所有被跟踪的内容，都应视为公开信息。个人申请材料、签名推荐信、身份证明和客户记录应保存在仓库之外。公开部署说明不会为本原型增加真实数据导入或生产环境访问控制能力。

All tracked content in a public repository and its Pages site should be treated as public. Personal applications, signed letters, identity documents, and customer records belong outside this repository. Public deployment instructions do not add real-data import or production access control.

## 版本发布记录 / Release record

完成验证和发布后，再创建真实的版本发布或标签，记录提交和发布地址，并保留带日期的测试结果和截图。后续发布应作为新事件记录，不应修改较早的结果，使其看起来更有利。

After validation and publication, create the actual release/tag, record the commit and release URL, and retain the dated test result and screenshots. Record subsequent releases as new events rather than editing earlier outcomes to look more favorable.

## 参考资料 / References

- [GitHub：创建 GitHub Pages 站点 / Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub：构建与测试 Node.js / Building and testing Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- 已准备的工作流使用 [Checkout v4](https://github.com/actions/checkout/tree/v4) 和 [setup-node v4](https://github.com/actions/setup-node/tree/v4)。

- [GitHub: Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub: Building and testing Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [Checkout v4](https://github.com/actions/checkout/tree/v4) and [setup-node v4](https://github.com/actions/setup-node/tree/v4), used by the prepared workflow.

参考说明于 2026-10-21 查阅。发布时，仓库所有者仍需核对当时可用的设置。

Reference instructions reviewed on 2026-10-21. The repository owner must verify available settings when publishing.
