# 部署指南

项目是单个静态 HTML 文件，任何静态托管都能跑。以下是三种方式，推荐第一种。

## 方式一：GitHub Pages（手动）

**Settings → Pages → Source** 选择 `Deploy from a branch`，分支 `main`，目录 `/ (root)`。因为入口文件叫 `index.html`，无需其他配置。

1. 把本仓库推送到 GitHub（仓库名建议 `business-dashboard`）
2. 仓库页面 → **Settings** → 左侧 **Pages**
3. **Source** 选择 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`，保存
4. 约 1 分钟后访问：`https://<你的用户名>.github.io/business-dashboard/`

## 方式二：任意静态托管 / 内网

把 `index.html` 上传到 Netlify、Vercel、Cloudflare Pages、阿里云 OSS、Nginx 等即可。本地预览：

```bash
python3 -m http.server 8000
```

## 网络要求

页面从 `cdnjs.cloudflare.com` 加载 Chart.js，从 `fonts.googleapis.com` 加载字体。内网无外网时：

- 下载 `chart.umd.js` 放到仓库，把 `<script src>` 改成本地路径；
- 删除字体 `<link>`，页面会回退到系统中文字体，不影响功能。

## 验证部署成功

打开线上地址后：健康评分显示数字（不是 `--`）、七个图表都有内容、切换深色模式不出现白底。

## 方式三：其他托管

任何能托管静态文件的服务都适用，把 `index.html` 作为入口即可：

| 平台               | 做法                                     |
| ---------------- | -------------------------------------- |
| Vercel           | 导入 GitHub 仓库，Framework 选 "Other"，零配置部署 |
| Netlify          | 拖拽项目文件夹到 Netlify Drop 即可               |
| Cloudflare Pages | 连接仓库，构建命令留空，输出目录填 `/`                  |
| 对象存储（OSS/COS）    | 上传 index.html，开启静态网站托管                 |

## 验证部署成功

- [ ] 页面标题为「经营看板 · 小微企业财务分析与风险预警」
- [ ] 财务总览显示健康评分（样例数据约为 54 分 / 关注）
- [ ] 拖动「沙盘推演」任一滑块，结果框数字实时变化
- [ ] 「数据管理 → 复制模板列名」能复制成功

## 注意事项

- **不需要任何环境变量或密钥**：图表库通过 `cdnjs.cloudflare.com` 的公开 CDN 加载，字体通过 Google Fonts 加载，部署环境需要能访问这两个域名（纯内网环境需要把这两个资源下载后改成本地引用）。
- **数据不落地**：无论部署在哪里，CSV 导入的数据都只存在访客浏览器的内存里（刷新页面即恢复样例数据），不会经过你的服务器，也不需要考虑数据库或存储成本。
- **自定义域名**：GitHub Pages、Netlify、Vercel 都支持绑定自己的域名，在各自平台的域名设置里添加 CNAME 记录即可，具体步骤参考对应平台文档。
- **不要**把这份看板当作会计核算系统直接对接真实财务数据上线使用——部署前请先看 [`docs/TESTS.md`](TESTS.md) 里关于报表建模简化的说明。
