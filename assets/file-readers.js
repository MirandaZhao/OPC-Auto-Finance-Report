/* Youshu local file readers. Financial files never leave this browser. */
(function (global) {
  'use strict';
  const LIMITS = Object.freeze({ bytes: 20 * 1024 * 1024, pages: 20, ocrPages: 5, rows: 20000, columns: 200, cells: 400000 });
  const script = typeof document !== 'undefined' ? document.currentScript : null;
  const base = script && script.src ? new URL('vendor/', script.src).href : 'assets/vendor/';
  const loading = new Map();
  function failure(code, message, extra) { return Object.assign(new Error(message), { code }, extra || {}); }
  function progress(options, stage, value, extra) {
    if (typeof options.onProgress === 'function') options.onProgress(Object.assign({ stage, progress: Math.max(0, Math.min(1, value || 0)) }, extra || {}));
  }
  function load(name) {
    if (loading.has(name)) return loading.get(name);
    const promise = new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = new URL(name, base).href;
      el.onload = resolve;
      el.onerror = () => { loading.delete(name); reject(failure('MISSING_COMPONENT', '读取组件缺失。请完整解压下载包，保留 index.html 旁的 assets 文件夹，再重新打开。')); };
      document.head.appendChild(el);
    });
    loading.set(name, promise);
    return promise;
  }
  function bytes64(value) {
    const binary = global.atob(value), out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }
  function checkRows(sheets, cap) {
    let count = 0, cells = 0;
    for (const sheet of sheets) for (const row of sheet.rows) {
      count++; cells += row.length;
      if (row.length > LIMITS.columns) throw failure('COLUMN_LIMIT', '文件列数超过 200 列，请保留与报告有关的列后重试。');
    }
    if (count > cap || cells > LIMITS.cells) throw failure('ROW_LIMIT', '文件过大：本次最多读取 ' + cap + ' 行、40 万个单元格。请按月份拆分文件后重试。');
  }
  function parseCSVFallback(text) {
    text = String(text).replace(/^\uFEFF/, '');
    const first = text.split(/\r?\n/, 1)[0] || '';
    const delimiters = [',', '\t', ';'];
    const separator = delimiters.sort((a, b) => first.split(b).length - first.split(a).length)[0];
    const rows = []; let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else if (!quoted && field.length) field += c; else quoted = !quoted; }
      else if (c === separator && !quoted) { row.push(field); field = ''; }
      else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; if (rows.length > LIMITS.rows) throw failure('ROW_LIMIT', '文件超过 20,000 行，请按月份拆分后重试。'); }
      else field += c;
    }
    if (quoted) throw failure('CSV_QUOTES', 'CSV 引号没有成对结束，请检查文件，或重新另存为 CSV UTF-8。');
    if (field.length || row.length) { row.push(field); rows.push(row); }
    // Preserve blank source rows so header and transaction row numbers remain traceable.
    return rows;
  }
  async function readCSV(file, options) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const requested = String(options.encoding || 'auto').toLowerCase();
    const automatic = requested === 'auto';
    const utf8BOM = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
    // A declared UTF-8 BOM must never be reinterpreted as legacy Chinese text.
    const candidates = automatic ? (utf8BOM ? ['utf-8'] : ['utf-8', 'gb18030']) : [requested === 'gbk' ? 'gb18030' : requested];
    if (candidates.some(value => !['utf-8', 'gb18030'].includes(value))) throw failure('CSV_ENCODING', '请选择自动识别、UTF-8 或 GB18030 / GBK 编码。');
    if ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff)) throw failure('CSV_ENCODING', '此 CSV 使用 UTF-16 编码，请在 Excel 中另存为 CSV UTF-8 后导入。');
    let text, encoding;
    for (const candidate of candidates) {
      try { text = new TextDecoder(candidate, { fatal: true }).decode(bytes); encoding = candidate; break; }
      catch (_) { /* Only decoding failure permits trying the next encoding. */ }
    }
    if (!encoding) throw failure('CSV_ENCODING', automatic ? '无法按 UTF-8 或 GB18030 / GBK 读取此 CSV。请重新导出原始账单，或在 Excel 中另存为 CSV UTF-8。' : requested === 'utf-8' ? 'CSV 不是有效的 UTF-8 编码。请选择自动识别或 GB18030 / GBK，再读取文件。' : '无法按 GB18030 / GBK 读取，请选择自动识别，或在 Excel 中另存为 CSV UTF-8。');
    // Do not pass existing replacement characters or binary controls into financial rows.
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFD]/.test(text)) throw failure('CSV_ENCODING', 'CSV 中含有无法确认的字符或非文本内容。请重新导出原始账单，或在 Excel 中另存为 CSV UTF-8。');
    const rows = global.YoushuData && typeof global.YoushuData.parseCSV === 'function' ? global.YoushuData.parseCSV(text) : parseCSVFallback(text);
    checkRows([{ rows }], options.maxRows || LIMITS.rows);
    return { sheets: [{ name: file.name, rows }], text, warnings: [], format: 'csv', encoding };
  }
  async function readExcel(file, options) {
    await load('xlsx.full.min.js');
    const warnings = [], buffer = await file.arrayBuffer();
    let workbook;
    try { workbook = global.XLSX.read(buffer, { type: 'array', cellDates: true, cellFormula: true, cellHTML: false, sheetRows: (options.maxRows || LIMITS.rows) + 1 }); }
    catch (error) {
      if (/password|encrypt/i.test(error.message)) throw failure('EXCEL_ENCRYPTED', '此 Excel 文件受密码保护。请用 Excel 打开并保存一份不带密码的本地副本后导入。');
      throw failure('EXCEL_INVALID', '无法读取 Excel 文件，请确认文件可正常打开，并另存为 .xlsx 或 CSV 后重试。');
    }
    const sheets = []; let formulaCount = 0;
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      if (!sheet || !sheet['!ref']) { sheets.push({ name, rows: [] }); continue; }
      const ref = global.XLSX.utils.decode_range(sheet['!fullref'] || sheet['!ref']);
      if (ref.e.r - ref.s.r + 1 > (options.maxRows || LIMITS.rows) || ref.e.c - ref.s.c + 1 > LIMITS.columns) throw failure('ROW_LIMIT', '工作表“' + name + '”超过 20,000 行或 200 列。请删除无关空白区域，或按月份拆分。');
      if ((ref.e.r - ref.s.r + 1) * (ref.e.c - ref.s.c + 1) > LIMITS.cells) throw failure('CELL_LIMIT', '工作表范围超过 40 万个单元格，请删除无关空白区域后重试。');
      for (const key of Object.keys(sheet)) if (key[0] !== '!' && sheet[key].f) formulaCount++;
      const rows = global.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '', blankrows: true }).map(row => row.map(v => v instanceof Date ? (Number.isFinite(v.getTime()) ? [v.getFullYear(), String(v.getMonth() + 1).padStart(2, '0'), String(v.getDate()).padStart(2, '0')].join('-') : '') : (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? v : '')));
      sheets.push({ name, rows });
    }
    checkRows(sheets, options.maxRows || LIMITS.rows);
    if (formulaCount) warnings.push('Excel 含 ' + formulaCount + ' 个公式单元格；仅读取文件中已保存的计算结果，不运行公式或宏。请先在 Excel 中重新计算并保存，再核对导入金额。');
    return { sheets, warnings, format: 'excel' };
  }
  function alignPositionedRows(lines) {
    const headerWords = /日期|交易日|摘要|收入|支出|余额|借方|贷方|金额|date|description|debit|credit|balance|amount/ig;
    // Retain empty columns by locating table headers. Compacting a missing debit/credit
    // cell would change the meaning of the subsequent amounts.
    const header = lines.find(line => line.length >= 3 && (line.map(c => c.text).join(' ').match(headerWords) || []).length >= 2);
    if (!header) return lines.map(line => line.map(cell => cell.text));
    const anchors = header.map(cell => (cell.x + cell.end) / 2);
    return lines.map(line => {
      const row = Array(anchors.length).fill('');
      for (const cell of line) {
        const center = (cell.x + cell.end) / 2;
        let column = 0, distance = Infinity;
        for (let i = 0; i < anchors.length; i++) if (Math.abs(center - anchors[i]) < distance) { distance = Math.abs(center - anchors[i]); column = i; }
        row[column] += (row[column] ? ' ' : '') + cell.text;
      }
      return row;
    });
  }
  function textItemsToRows(items, withPositions = false) {
    const usable = items.filter(x => x && typeof x.str === 'string' && x.str.trim()).map(x => ({ text: x.str.trim(), x: Number(x.transform && x.transform[4]) || 0, y: Number(x.transform && x.transform[5]) || 0, width: Number(x.width) || 0, height: Math.abs(Number(x.height) || 10) }));
    usable.sort((a, b) => b.y - a.y || a.x - b.x);
    const lines = [];
    for (const item of usable) {
      let line = lines.find(x => Math.abs(x.y - item.y) <= Math.max(2, Math.min(x.height, item.height) * 0.38));
      if (!line) { line = { y: item.y, height: item.height, items: [] }; lines.push(line); }
      line.items.push(item);
    }
    lines.sort((a, b) => b.y - a.y);
    const positioned = lines.map(line => {
      const sorted = line.items.sort((a, b) => a.x - b.x), cells = []; let cell = null;
      for (const item of sorted) {
        const gap = cell ? item.x - cell.end : Infinity;
        if (!cell || gap > Math.max(6, item.height * 0.55)) { if (cell) cells.push(cell); cell = { text: item.text, x: item.x, end: item.x + item.width }; }
        else { cell.text += (gap > 1.5 && !/[\u3400-\u9fff]$/.test(cell.text) && !/^[\u3400-\u9fff]/.test(item.text) ? ' ' : '') + item.text; cell.end = Math.max(cell.end, item.x + item.width); }
      }
      if (cell) cells.push(cell);
      return cells;
    });
    const rows = alignPositionedRows(positioned);
    // Bank PDFs may center dates beside multi-line counterparties. Preserve
    // physical row positions so adapters can attach lines above and below a date.
    return withPositions ? { rows, rowPositions: lines.map(line => line.y) } : rows;
  }
  function ocrToRows(data) {
    const lines = [];
    for (const block of data.blocks || []) for (const paragraph of block.paragraphs || []) for (const line of paragraph.lines || []) {
      const words = (line.words || []).filter(w => w.text && w.bbox).sort((a, b) => a.bbox.x0 - b.bbox.x0);
      if (!words.length) continue;
      let cell = null; const row = [];
      for (const word of words) {
        const h = word.bbox.y1 - word.bbox.y0;
        if (!cell || word.bbox.x0 - cell.end > Math.max(10, h * 0.9)) { if (cell) row.push(cell); cell = { text: word.text, x: word.bbox.x0, end: word.bbox.x1 }; }
        else { cell.text += (!/[\u3400-\u9fff]$/.test(cell.text) && !/^[\u3400-\u9fff]/.test(word.text) ? ' ' : '') + word.text; cell.end = word.bbox.x1; }
      }
      if (cell) row.push(cell);
      lines.push(row);
    }
    return lines.length ? alignPositionedRows(lines) : String(data.text || '').split(/\r?\n/).filter(x => x.trim()).map(x => x.trim().split(/\t+| {2,}/));
  }
  async function createOCR(options) {
    await load('tesseract.min.js'); await load('ocr-runtime.js'); await load('ocr-languages.js');
    const runtime = global.YoushuOcrRuntime;
    const workerURL = URL.createObjectURL(new Blob([runtime.workerSource], { type: 'application/javascript' }));
    // A data URL ending in .js makes Tesseract use exactly this bundled self-contained core.
    const coreURL = 'data:text/javascript;base64,' + btoa(unescape(encodeURIComponent(runtime.coreSource))) + '#.js';
    let worker;
    try {
      worker = await global.Tesseract.createWorker(['chi_sim', 'eng'].map(code => ({ code, data: bytes64(global.YoushuOcrLanguages[code]) })), 1, {
        workerPath: workerURL, workerBlobURL: false, corePath: coreURL, cacheMethod: 'none', gzip: false,
        logger: event => progress(options, '正在本机识别扫描件：' + event.status, event.progress, { ocr: true }),
        errorHandler: () => {}
      });
      await worker.setParameters({ tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' });
      return { worker, close: async () => { await worker.terminate(); URL.revokeObjectURL(workerURL); } };
    } catch (error) {
      if (worker) await worker.terminate(); URL.revokeObjectURL(workerURL);
      throw failure('OCR_INIT', '本机文字识别组件无法启动。请使用新版 Chrome 或 Edge，完整解压下载包后重试；也可从银行导出 Excel / CSV。' + (options.debug ? ' ' + error.message : ''));
    }
  }
  async function readPDF(file, options) {
    progress(options, '正在加载本机 PDF 读取组件', 0);
    await load('pdf.classic.js'); await load('pdf.worker.classic.js'); await load('pdf-binary-assets.js');
    class LocalBinaryFactory {
      async fetch({ kind, filename }) {
        const encoded = global.YoushuPdfAssets[kind] && global.YoushuPdfAssets[kind][filename];
        if (!encoded) throw failure('PDF_ASSET', 'PDF 所需的本机字体或解码资源缺失：' + filename);
        return bytes64(encoded);
      }
    }
    const task = global.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), password: options.password || '',
      BinaryDataFactory: LocalBinaryFactory, useWorkerFetch: false, useSystemFonts: true, isEvalSupported: false,
      isImageDecoderSupported: false, useWasm: true, enableXfa: false, stopAtErrors: true, maxImageSize: 16000000, verbosity: 0 });
    let pdf, ocr = null;
    try {
      pdf = await task.promise;
      if (pdf.numPages > LIMITS.pages) throw failure('PDF_PAGE_LIMIT', 'PDF 共 ' + pdf.numPages + ' 页，本次最多读取 20 页。请按月份拆分后重试。');
      const warnings = ['PDF 内容是自动提取的候选数据；请核对日期、收支方向、金额和余额后再生成报告。页眉、合计、重复表头可能需要在预览中删除。'];
      const sheets = [], text = []; let ocrCount = 0;
      for (let n = 1; n <= pdf.numPages; n++) {
        progress(options, '正在读取 PDF 第 ' + n + ' / ' + pdf.numPages + ' 页', (n - 1) / pdf.numPages, { page: n, total: pdf.numPages });
        const page = await pdf.getPage(n), content = await page.getTextContent();
        const positioned = textItemsToRows(content.items, true);
        let rows = positioned.rows, rowPositions = positioned.rowPositions, raw = rows.map(row => row.join('\t')).join('\n'), source = 'text';
        const dates = raw.match(/(?:20\d{2}[-/.年]\d{1,2}[-/.月]\d{1,2}|20\d{6})/g) || [];
        let hasImages = false;
        if (raw.replace(/\s/g, '').length < 80 || dates.length < 2) {
          const ops = await page.getOperatorList();
          const kinds = [global.pdfjsLib.OPS.paintImageXObject, global.pdfjsLib.OPS.paintInlineImageXObject, global.pdfjsLib.OPS.paintImageMaskXObject];
          hasImages = ops.fnArray.some(x => kinds.includes(x));
        }
        if (hasImages && (raw.replace(/\s/g, '').length < 80 || dates.length < 2)) {
          ocrCount++;
          if (ocrCount > LIMITS.ocrPages) throw failure('OCR_PAGE_LIMIT', '文件包含超过 5 页需要文字识别的扫描页。为避免电脑卡顿，本次未导入；请拆分为每份最多 5 页后重试。');
          if (!ocr) ocr = await createOCR(options);
          const unit = page.getViewport({ scale: 1 }), scale = Math.min(2.5, 2200 / Math.max(unit.width, unit.height));
          const viewport = page.getViewport({ scale }), canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          await page.render({ canvasContext: ctx, viewport, background: 'white' }).promise;
          progress(options, '正在本机识别扫描件第 ' + n + ' 页，请稍候', (n - 1) / pdf.numPages, { page: n, total: pdf.numPages, ocr: true });
          const result = await ocr.worker.recognize(canvas, {}, { text: true, blocks: true });
          rows = ocrToRows(result.data); rowPositions = null; raw = result.data.text || rows.map(row => row.join('\t')).join('\n'); source = 'ocr';
          canvas.width = 0; canvas.height = 0;
          warnings.push('第 ' + n + ' 页使用本机 OCR 识别（平均置信度 ' + Math.round(result.data.confidence || 0) + '%）；字符、金额、小数点和列位置可能识别错误，必须逐行核对。');
        }
        if (!rows.some(row => row.some(x => String(x).trim()))) throw failure('PDF_EMPTY_PAGE', '第 ' + n + ' 页未识别出文字。本次没有导入不完整文件；请确认页面清晰，或使用银行导出的 CSV / Excel。');
        sheets.push({ name: '第 ' + n + ' 页' + (source === 'ocr' ? '（OCR）' : ''), rows, rowPositions, source, page: n });
        text.push('--- 第 ' + n + ' 页 ---\n' + raw); page.cleanup();
      }
      checkRows(sheets, options.maxRows || LIMITS.rows);
      const merged = { name: '全部页面（请核对表头和合计）', rows: sheets.flatMap(sheet => sheet.rows), source: ocrCount ? 'mixed' : 'text' };
      return { sheets: [merged, ...sheets], text: text.join('\n\n'), warnings, format: 'pdf', pages: pdf.numPages, ocrPages: ocrCount };
    } catch (error) {
      if (error.name === 'PasswordException') throw failure(error.code === 2 ? 'PDF_PASSWORD_INCORRECT' : 'PDF_PASSWORD_REQUIRED', error.code === 2 ? 'PDF 密码不正确，请重新输入打开密码。' : '此 PDF 需要打开密码，请输入银行提供的文件密码后重试。');
      if (error.code) throw error;
      throw failure('PDF_READ_FAILED', 'PDF 读取失败：' + (error.message || '文件损坏或格式不受支持') + '。请确认文件可正常打开，或从银行导出 CSV / Excel。');
    } finally {
      if (ocr) await ocr.close();
      if (pdf) await pdf.destroy(); else await task.destroy();
    }
  }
  async function read(file, options) {
    options = options || {};
    if (!file || typeof file.arrayBuffer !== 'function') throw failure('NO_FILE', '请先选择一个数据文件。');
    if (file.size > LIMITS.bytes) throw failure('FILE_SIZE_LIMIT', '文件超过 20 MB，请按月份拆分后重试。');
    if (file.size === 0) throw failure('EMPTY_FILE', '文件为空，请重新选择。');
    if (options.maxRows) options = Object.assign({}, options, { maxRows: Math.min(LIMITS.rows, Math.max(1, Math.floor(options.maxRows))) });
    const ext = String(file.name || '').toLowerCase().split('.').pop();
    progress(options, '正在本机读取文件', 0);
    let result;
    if (ext === 'csv' || ext === 'tsv') result = await readCSV(file, options);
    else if (ext === 'xlsx' || ext === 'xls') result = await readExcel(file, options);
    else if (ext === 'pdf') result = await readPDF(file, options);
    else throw failure('FILE_TYPE', '请选择 CSV、Excel（.xlsx / .xls）或 PDF 文件。');
    progress(options, '读取完成，请核对数据', 1);
    return result;
  }
  global.YoushuFiles = Object.freeze({ read, limits: LIMITS, helpers: Object.freeze({ parseCSV: parseCSVFallback, textItemsToRows, ocrToRows }) });
  if (typeof module !== 'undefined' && module.exports) module.exports = global.YoushuFiles;
})(typeof window !== 'undefined' ? window : globalThis);
