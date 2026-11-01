# 本机文件读取组件与许可证

这些组件随下载包保存，帮助用户在自己的浏览器中读取 Excel、PDF 和扫描件。应用按需加载同目录脚本、内存 Blob 和内嵌二进制资源；运行时不从 CDN 下载组件，也不将财务文件发送给组件供应方。离线使用时请保留完整的 `assets` 文件夹。

| 组件 | 本包版本与来源 | 用途 | 许可证文件 |
|---|---|---|---|
| SheetJS Community Edition | 0.20.3；[官方独立浏览器包](https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js) | XLS / XLSX 读取；只读取已保存的公式结果；示例交易明细 XLSX 导出 | `SHEETJS-LICENSE.txt`（Apache-2.0） |
| Mozilla PDF.js | 5.6.205，构建 `ada343803`；[官方源码版本](https://github.com/mozilla/pdf.js/tree/v5.6.205)，使用发行包的 legacy build | PDF 文字提取、扫描页本机绘制 | `PDFJS-LICENSE.txt`（Apache-2.0） |
| core-js（PDF.js legacy build 内嵌） | 3.48.0；[官方许可证](https://github.com/zloirock/core-js/blob/v3.48.0/LICENSE) | 浏览器兼容性补齐 | `COREJS-LICENSE.txt`（MIT） |
| Tesseract.js | 7.0.0；[官方项目](https://github.com/naptha/tesseract.js) | 浏览器中的本机 OCR 调度 | `TESSERACT-LICENSE.txt`、`TESSERACT-BUNDLE-NOTICES.txt`、`TESSERACT-WORKER-NOTICES.txt` |
| Tesseract.js-core | 7.0.0；[官方项目](https://github.com/naptha/tesseract.js-core) | WebAssembly OCR 核心，LSTM 版本 | `TESSERACT-CORE-LICENSE.txt`（Apache-2.0） |
| tessdata_fast | `main` 分支下载快照，2026-10-26；[官方项目](https://github.com/tesseract-ocr/tessdata_fast)；仅 `eng` 与 `chi_sim` | 英文、简体中文本机识别模型 | `TESSDATA-LICENSE.txt`（Apache-2.0） |

PDF.js 的 CMap、标准字体及图像解码器另有各自版权声明。本目录保留 `PDFJS-cmaps-*`、`PDFJS-standard_fonts-*`、`PDFJS-wasm-*` 许可证；项目自身的 MIT 许可证不替代这些第三方条款。

## 本机打包修改

- `pdf.classic.js` 与 `pdf.worker.classic.js`：保留上游 legacy 代码及许可证；将模块末尾的导出语句移除、以函数作用域隔离，并替换仅在 Node.js 路径使用的 `import.meta.url`。浏览器使用上游已有的 `pdfjsLib` / `pdfjsWorker` 全局入口与本线程 worker fallback，避免 `file://` 模块导入和 worker 路径限制。
- `pdf-binary-assets.js`：将同版 PDF.js 的 CMap、字体、WASM 解码器打包为 base64；应用通过 `BinaryDataFactory` 返回本机字节，不请求远程资源。
- `ocr-runtime.js`：保留上游 Tesseract 浏览器 worker 与自带 WASM 的 LSTM core，作为脚本文本打包。本包修复一处上游对象语言初始化表达式：初始化时将语言对象的 `.data` 改为 `.code`，与同文件加载 `{code, data}` 的逻辑一致；避免把模型字节当作语言名称。修改仅应用于本包副本。
- `ocr-languages.js`：将原始训练模型打包为 base64，通过 `{code, data}` 传入，不依赖在线模型下载或浏览器缓存。
- `xlsx.full.min.js` 与 `tesseract.min.js`：上游发行文件原文，不修改业务代码。

训练模型 SHA-256（原始 `.traineddata` 字节）：

| 模型 | 字节数 | SHA-256 |
|---|---:|---|
| `eng` | 4,113,088 | `7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2` |
| `chi_sim` | 2,469,156 | `a5fcb6f0db1e1d6d8522f39db4e848f05984669172e584e8d76b6b3141e1f730` |

PDF 表格提取与 OCR 都是候选数据读取，不保证任意银行版式、图片质量或手写文字的识别准确性。金额、日期、收支方向、空列与余额必须经过用户核对。当前限制：每文件 20 MB；PDF 最多 20 页，其中最多 5 页需要 OCR；候选表格总计最多 20,000 行、每行 200 列、40 万个单元格。超限时报错并要求拆分，不静默导入部分结果。加密 PDF 可用用户输入的打开密码重试；加密 Excel 需要先在本机另存无密码副本。

---

# Local file readers and licenses

These dependencies ship in the download so users can read Excel workbooks, PDFs and scans in their own browser. The application loads adjacent scripts, in-memory Blob URLs and embedded binary resources on demand. It does not download runtime dependencies from a CDN or send financial documents to these vendors. Keep the complete `assets` folder for offline use.

| Component | Packaged version and source | Purpose | License file |
|---|---|---|---|
| SheetJS Community Edition | 0.20.3; [official standalone bundle](https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js) | XLS / XLSX reading; saved formula results only; sample transaction XLSX export | `SHEETJS-LICENSE.txt` (Apache-2.0) |
| Mozilla PDF.js | 5.6.205, build `ada343803`; [official source version](https://github.com/mozilla/pdf.js/tree/v5.6.205); legacy distribution build | PDF text extraction and local scan rendering | `PDFJS-LICENSE.txt` (Apache-2.0) |
| core-js (embedded in PDF.js legacy build) | 3.48.0; [official license](https://github.com/zloirock/core-js/blob/v3.48.0/LICENSE) | Browser compatibility polyfills | `COREJS-LICENSE.txt` (MIT) |
| Tesseract.js | 7.0.0; [official project](https://github.com/naptha/tesseract.js) | Browser OCR orchestration | `TESSERACT-LICENSE.txt`, `TESSERACT-BUNDLE-NOTICES.txt`, `TESSERACT-WORKER-NOTICES.txt` |
| Tesseract.js-core | 7.0.0; [official project](https://github.com/naptha/tesseract.js-core) | LSTM WebAssembly OCR engine | `TESSERACT-CORE-LICENSE.txt` (Apache-2.0) |
| tessdata_fast | `main` snapshot downloaded 2026-10-26; [official project](https://github.com/tesseract-ocr/tessdata_fast); `eng` and `chi_sim` only | English and Simplified Chinese recognition models | `TESSDATA-LICENSE.txt` (Apache-2.0) |

The PDF.js CMaps, standard fonts and image decoders retain separate notices in the `PDFJS-cmaps-*`, `PDFJS-standard_fonts-*` and `PDFJS-wasm-*` files. The application's MIT license does not replace third-party terms.

## Packaging modifications

- `pdf.classic.js` and `pdf.worker.classic.js` retain upstream legacy code and licenses. The final ESM export is removed, each bundle is isolated in a function, and Node-only `import.meta.url` references are replaced. The browser uses upstream `pdfjsLib` / `pdfjsWorker` globals and its same-thread worker fallback to avoid `file://` module and worker-path restrictions.
- `pdf-binary-assets.js` embeds the matching PDF.js CMaps, fonts and WASM image decoders as base64. A local `BinaryDataFactory` supplies their bytes without remote requests.
- `ocr-runtime.js` packages the upstream browser worker and self-contained LSTM WASM core as script text. One upstream object-language initialization expression is patched from `.data` to `.code`, matching the same worker's `{code, data}` loading path. This prevents model bytes from being used as a language name. Only the packaged copy is changed.
- `ocr-languages.js` embeds original trained data as base64, supplied through `{code, data}` without online language downloads or a browser cache dependency.
- `xlsx.full.min.js` and `tesseract.min.js` retain the upstream distribution contents.

SHA-256 digests of the original `.traineddata` bytes:

| Model | Bytes | SHA-256 |
|---|---:|---|
| `eng` | 4,113,088 | `7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2` |
| `chi_sim` | 2,469,156 | `a5fcb6f0db1e1d6d8522f39db4e848f05984669172e584e8d76b6b3141e1f730` |

PDF extraction and OCR produce candidate data and do not guarantee accurate recognition across arbitrary bank layouts, image quality or handwriting. Users must review amounts, dates, cash directions, empty columns and balances. Current limits are 20 MB per file; 20 PDF pages including at most 5 OCR pages; and 20,000 candidate rows, 200 columns per row and 400,000 cells. Exceeding a limit fails the import with a request to split the file rather than silently returning partial results. Encrypted PDFs can be retried with the user's opening password; encrypted workbooks must first be saved locally without encryption.
