# 工作流程

## 从记账数字到经营建议

```text
财务软件 / Excel
│  按模板整理（每月一行，18 列，金额万元）
▼
data/template.csv 格式的 CSV
│  数据管理 → 选择 CSV 文件
▼
importCSV()   校验列数、月份格式、数字有效性 → ENGINE.setRows()
│
▼
quality()     勾稽检查：收入明细 = 收入总额、成本明细 = 成本总额 …
│
▼
筛选月份 → metrics(sel) → score(m) → narrative() / advice() → 七个页面渲染
│
▼
沙盘推演 forecast()（拖滑块即时重算）
```

全链路在同一页面内完成，无后端、无网络请求；刷新页面即回到样例数据。

## 用户使用流程

1. 打开页面，先看「财务总览」顶部的健康评分和"现在最该关心的"一句话。
2. 用月份筛选切换到本月 / 最近 12 个月 / 某一年。
3. 顺着「分析建议」里按轻重排序的建议往下看，每条都说明做什么、找谁、预计效果。
4. 在「现金流」拖滑块回答"如果……会怎样"。
5. 在「数据管理」导入自己的数据；刷新页面即恢复样例。

## 开发流程

```bash
git clone …
git checkout -b feat/<改动主题>           # 不直接改 main

# 修改 index.html

node --test tests/engine.test.js          # 引擎改动必须过测试
python3 -m http.server 8000               # 打开 http://localhost:8000/index.html
                                          # 人工检查：七个页面 + 深色模式 + 375px 手机宽度

git add -A
git commit -m "<类型>: <说明>"
git push -u origin HEAD                   # 推送后开 PR，评审通过再合并 main
```

## 发布流程

1. 更新 `CHANGELOG.md`。
2. 跑测试，把结果与日期写入评估报告。
3. 推送到 `main`，GitHub Actions 自动部署到 GitHub Pages（见 [DEPLOY.md](../DEPLOY.md)）。
4. 打 tag 并推送：`git tag v1.0.0 && git push --tags`。

> 版本号需与 `CHANGELOG.md` 一致；tag 应与实际部署的那次提交（`main` 的 HEAD）落在同一提交上，避免"部署的代码"与"发布的 tag"错位。
