# 部署指南

项目是单个静态 HTML 文件，任何静态托管都能跑。以下是三种方式，推荐第一种。

## 方式一：GitHub Pages（手动）

**Settings → Pages → Source** 选择 `Deploy from a branch`，分支 `main`，目录 `/ (root)`。因为入口文件叫 `index.html`，无需其他配置。

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
