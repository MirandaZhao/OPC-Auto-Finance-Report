/* Local user workspace. All imports, calculations and exports stay on the device. */
(()=>{'use strict';
const D=window.YoushuData,L=window.YoushuLedger,Store=window.YoushuLedgerStorage,host=document.getElementById('ys-app');if(!host||!D)return;
const $=s=>host.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kinds={cash:'现金流水',profit:'账务利润',ar:'应收明细',balance:'资产负债'},money=v=>v==null?'待补充':'¥'+v.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}),pct=v=>v==null?'待补充':(v*100).toFixed(1)+'%',sum=(a,f)=>a.reduce((s,r)=>s+(f(r)||0),0);
const empty=()=>({schemaVersion:1,company:'',openingCash:null,asOf:'',cash:[],profit:[],ar:[],balance:[]});
let project=empty(),source=null,preview=null,dirty=false,report=null,viewProject=null,busy=false,isRandomReport=false,detailData=null,previousFocus=null,readGeneration=0;
let route='home',ledgerReady=false,ownNeedsRender=true,randomSample=null,renderedReportKind=null;
const reportViews={mine:{},random:{},sample:{}};
let fixedSample=null;
const randomStorageKey='youshu-random-experience-v1',experienceStorageKey='youshu-experience-view-v1';
let experienceRoute=readExperienceRoute(),experiencePeriod=readExperiencePeriod(),minePeriod=readMinePeriod();
let randomGeneration=null,randomRestoreChecked=false,randomRefreshRequested=false,randomRecentNames=[];
let sharedReportView=null;
let supplementEditor=null,supplementUndo=null;
let fileQueue=[],activeFile=null,queueRunning=false,queueResults=[],saveState='loading',saveRevision=0,undoProject=null,accountView='';
const rawCsv=m=>m.map(r=>r.map(v=>{v=v instanceof Date?v.toISOString().slice(0,10):String(v??'');return /[",\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')).join('\r\n');
const friendly={id:'流水号',date:'日期',account:'账户',counterparty:'交易对方',category:'分类',inflow:'收入',outflow:'支出',amount:'金额',direction:'收支方向',balance:'交易后余额',activity:'活动类型',month:'月份',revenue:'营业收入',cost:'营业成本',expenses:'期间费用',tax:'所得税费用',customer:'客户',invoiceDate:'开票日期',dueDate:'到期日期',received:'已收金额',cash:'货币资金',receivables:'应收账款',inventory:'存货',fixedAssets:'固定资产净值',otherAssets:'其他资产',payables:'应付账款',taxPayable:'应交税费',debt:'借款',otherLiabilities:'其他负债',capital:'实收资本',retainedEarnings:'留存收益'};
host.innerHTML=`<nav class="ys-nav ys-row ys-no-print"><div><span class="ys-brand">有数</span> <span class="ys-muted">给一人公司和小微企业的财务看板</span></div><div class="ys-actions ys-nav-tabs" aria-label="报告导航"><button id="ys-random">随机体验</button><button id="ys-create">我的报告</button></div></nav>
<div id="ys-home-note" class="ys-home-note ys-no-print"><span class="ys-badge">随机体验 · 虚构数据</span><span>点击图表查看明细，或换一家公司体验。</span><div id="ys-example-tools" class="ys-actions ys-no-print"><button type="button" id="ys-example-random">再来一个</button><button type="button" id="ys-example-export">下载报告</button><button type="button" id="ys-example-print">打印 / PDF</button></div></div>
<div id="ys-workspace" hidden>
<section id="ys-own-header" class="ys-page-head ys-row ys-no-print"><div><div id="ys-own-meta" class="ys-section-label">我的账本</div><h1 id="ys-own-title">我的报告</h1><p id="ys-save-summary" class="ys-muted" role="status" aria-live="polite"></p></div><div class="ys-actions"><button id="ys-add-bill" class="ys-primary">＋ 添加账单</button><button id="ys-manage-bills">管理账单</button><button id="ys-own-back" hidden>回到我的报告</button></div></section>
<div id="ys-random-error" class="ys-status ys-error" hidden></div>
<section id="ys-random-banner" class="ys-route-banner ys-row ys-no-print" hidden><div><span class="ys-badge">随机体验 · 虚构数据</span><p class="ys-muted">每次换一组数据，看看不同的经营状况。</p></div><button id="ys-random-own" class="ys-primary">用我的账单生成报告</button></section>
<div id="ys-pending-banner" class="ys-route-banner ys-row ys-no-print" hidden><span id="ys-pending-text">有一份账单尚未确认。</span><button id="ys-continue-import">继续核对</button></div>
<div id="ys-loading" class="ys-status ys-no-print" hidden>正在恢复本机账本…</div>
<div id="ys-storage-status" class="ys-status ys-no-print" role="status" aria-live="polite">正在恢复本机账本…</div>
<section id="ys-empty-own" class="ys-empty-own ys-panel ys-no-print" hidden><div class="ys-badge">微信 · 支付宝 · 银行</div><h2>添加第一份账单，生成我的报告</h2><p class="ys-muted">可以一次添加多份，也可以以后继续追加。支持 CSV、Excel 和 PDF。</p><div class="ys-actions"><button id="ys-empty-add" class="ys-primary">＋ 添加账单</button><button id="ys-empty-open">恢复账本备份</button></div><button id="ys-empty-undo" hidden>撤销删除</button></section>
<div id="ys-import-surface" class="ys-no-print" hidden>
<div class="ys-import-steps"><span>选择账单</span><span>→</span><span>核对数据</span><span>→</span><span>查看我的报告</span></div>
<section class="ys-start-card" id="ys-upload-zone"><span class="ys-step-number">添加我的账单</span><h2>把账单放进来，接着记</h2><p>微信、支付宝、银行流水可以陆续添加，也可一次选择多份。已有数据会保留。支持 CSV、Excel 和 PDF。</p><label class="ys-account-input">账户名称（可选）<input id="ys-import-account" maxlength="80" placeholder="同一平台有多个账户时，分别填写名称"></label><button id="ys-upload" class="ys-primary">添加账单</button><input id="ys-file" type="file" multiple accept=".csv,.tsv,.xlsx,.xls,.pdf" hidden><span class="ys-muted">也可拖入多份文件 · 每份最大 20 MB</span><div class="ys-template-links"><a href="templates/youshu-template.xlsx" download>下载填写模板</a><a href="templates/youshu-example.xlsx" download>下载示例文件</a></div></section>
<div id="ys-queue-status" class="ys-status ys-no-print" role="status" aria-live="polite"></div>
<div id="ys-read-status" class="ys-status ys-no-print" role="status" aria-live="polite"></div>
<section id="ys-editor" class="ys-panel ys-no-print" hidden>
<div class="ys-row"><div><span class="ys-section-label">最后一步</span><h2>核对一下，就能生成</h2></div><button id="ys-cancel-import">取消本次导入</button></div>
<div id="ys-review" hidden><p id="ys-source-name" class="ys-muted ys-filemeta ys-smallgap"></p><div id="ys-reader-warnings" class="ys-status ys-warn"></div><div id="ys-bank-review" class="ys-note" hidden></div><div id="ys-pdf-review" class="ys-note" hidden><p id="ys-pdf-guidance"></p><label class="ys-terms"><input id="ys-pdf-complete" type="checkbox">我已对照原 PDF 的全部页面，确认记录完整、日期和收支金额正确。</label></div><div id="ys-validation" class="ys-status" role="status" aria-live="polite"></div><div id="ys-clean-preview" class="ys-scroll" hidden></div>
<label class="ys-smallgap">归入账户（文件没有账户列时必填）<input id="ys-source-account" maxlength="80" placeholder="例如：招商银行 1234"></label><details id="ys-options"><summary>识别不准确？调整文件设置</summary>
<div class="ys-form"><label>文件内容<select id="ys-kind">${Object.entries(kinds).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>工作表 / PDF 页面<select id="ys-sheet"></select></label><label>第几行是表头<input id="ys-header" type="number" min="1" value="1"></label><label>源文件金额单位<select id="ys-unit"><option value="1">元</option><option value="10000">万元（导入时换算）</option></select></label><label>文字编码（乱码时调整）<select id="ys-encoding"><option value="auto">自动识别（推荐）</option><option value="utf-8">UTF-8</option><option value="gb18030">GB18030</option></select></label><div style="align-self:end"><button id="ys-read">重新读取文件</button></div></div>
<div id="ys-raw-preview" class="ys-scroll"></div><details><summary>修正表格或粘贴 CSV</summary><p class="ys-muted">第一行为表头。可删除页眉、合计和重复表头；含逗号的文本用双引号包裹。</p><textarea id="ys-raw-text" aria-label="可修正的 CSV 内容" spellcheck="false"></textarea><button id="ys-apply-text" class="ys-smallgap">应用文本修正</button><details><summary>查看 PDF 原始文字</summary><pre id="ys-pdf-text" style="white-space:pre-wrap;max-height:240px;overflow:auto"></pre></details></details>
<h3 class="ys-topgap">每一列的含义</h3><p id="ys-mapping-help" class="ys-muted"></p><div id="ys-mapping" class="ys-map"></div>
<div class="ys-form"><label>导入方式<select id="ys-mode"><option value="append">添加到账本（相同流水号自动核对）</option></select></label><label>日期顺序<select id="ys-date-order"><option value="">自动识别</option><option value="DMY">日/月/年</option><option value="MDY">月/日/年</option></select></label><label>疑似重复记录<select id="ys-duplicates"><option value="block">先阻止，让我核对</option><option value="drop">删除内容完全相同的重复行</option><option value="keep">已核对，保留全部</option></select></label></div><button id="ys-check">重新检查</button><a id="ys-csv-template" class="ys-csv-link" href="templates/cash-template.csv" download>下载现金流水 CSV 模板</a></details>

<p class="ys-muted ys-topgap">请核对日期、收支方向和金额。PDF 识别结果尤其需要检查；有误时展开上面的设置调整。</p><input id="ys-reviewed" type="checkbox" hidden><div class="ys-row ys-topgap"><span class="ys-muted">只有流水也能生成现金报告，其他资料可以以后补充。</span><button id="ys-commit" class="ys-primary" disabled>确认并生成报告</button></div></div>
<button id="ys-generate" hidden>生成我的报告</button></section>
</div>
<div id="ys-management-surface" hidden>
<div id="ys-management-tools" class="ys-create-tools ys-no-print"><button id="ys-open">恢复账本备份</button><button id="ys-supplement-records">补录记录</button><a href="README.md" target="_blank" rel="noopener">使用帮助</a><input id="ys-project-file" type="file" accept=".json" hidden></div>
<section id="ys-ledger" class="ys-panel ys-no-print"><div class="ys-row"><div><h2>已导入账单</h2><p id="ys-ledger-count" class="ys-muted"></p></div><div class="ys-actions"><button id="ys-backup">下载账本备份</button><button id="ys-clear" class="ys-clear-report">清空我的报告</button><button id="ys-undo-delete" hidden>撤销删除</button></div></div><div id="ys-import-list" class="ys-import-list"></div><p class="ys-muted ys-smallgap">自动保存在当前浏览器中。请用同一浏览器、同一位置打开软件；移动文件夹、更换浏览器或清理浏览器数据前，请下载备份。多窗口请勿同时编辑。</p></section>
<section id="ys-settings" class="ys-panel ys-no-print"><details id="ys-extra"><summary>补充企业信息与期初余额（可选）</summary><div class="ys-form"><label>企业名称<input id="ys-company" maxlength="80" placeholder="例如：我的 AI 工作室"></label><label>第一笔流水之前，账户里有多少钱？<input id="ys-opening" inputmode="decimal" placeholder="不知道可留空；没有余额填 0"></label><label hidden>账本参考日期<input id="ys-asof" type="date"></label></div><p class="ys-muted">不知道期初余额也可以生成收支报告；填写后可查看期末现金和现金可支撑月数。</p><div id="ys-datasets" class="ys-datasets"></div><div class="ys-actions"><button id="ys-save">下载账本备份</button></div></details></section></div>
<div id="ys-global-status" class="ys-status ys-no-print" role="status" aria-live="polite"></div>
<div id="ys-supplement-undo" class="ys-actions ys-no-print" hidden><span class="ys-muted">已删除补录资料</span><button id="ys-supplement-undo-button">撤销删除</button><button id="ys-supplement-undo-dismiss">关闭</button></div>
<div id="ys-view-tools" class="ys-row ys-topgap ys-no-print" hidden><label>查看账户<select id="ys-account-filter"><option value="">全部账户</option></select></label><span class="ys-muted">跨账户记录可能包含同一笔付款，合并金额仅供核对。</span></div><section id="ys-report" class="ys-topgap" hidden></section><footer class="ys-footer"><span id="ys-route-location">当前：我的报告</span><span>有数 · 数据留在本机</span></footer></div>
<dialog id="ys-detail"><div class="ys-row"><h2 id="ys-detail-title">数据明细</h2><button id="ys-detail-close">关闭</button></div><p id="ys-detail-note" class="ys-muted ys-smallgap"></p><div id="ys-detail-table" class="ys-scroll ys-topgap"></div><button id="ys-detail-csv" class="ys-topgap">下载这份明细 CSV</button></dialog>
<div id="ys-supplement-root" class="ys-no-print"></div>
`;
$('#ys-supplement-records').onclick=()=>openSupplement('records');
$('#ys-supplement-undo-button').onclick=()=>undoSupplement().catch(e=>status('#ys-global-status',e.message,'error'));
$('#ys-supplement-undo-dismiss').onclick=()=>{supplementUndo=null;updateSupplementUndo();};
function status(id,text,type=''){const n=$(id);n.textContent=text;n.className='ys-status'+(type?' ys-'+type:'');}
function supplementContext(){return {asOf:sharedReportView?.model?.asOf||report?.asOf||project.asOf||'',account:accountView,model:sharedReportView?.model||null};}
function updateSupplementUndo(){const box=$('#ys-supplement-undo');if(box)box.hidden=!supplementUndo||!route.startsWith('my');}
async function saveSupplement(record){
  if(blockedByReview())throw Error('请先完成当前账单核对，再保存补充资料。');
  const S=window.YoushuSupplements;if(!S)throw Error('补录组件未加载，请刷新后重试。');
  const next=S.upsert(config(),record),validation=L.validate(next);
  if(!validation.valid)throw Error(validation.errors.map(e=>e.message).join('；'));
  setWorking(true);
  try{
    project=next;undoProject=null;supplementUndo=null;updateSupplementUndo();syncInputs();refreshOwnReport();
    const saved=await persistProject();
    if(!saved)throw Error('资料已保留在当前页面，但尚未保存到本机。请下载账本备份，或稍后再次保存。');
    const result=S.read(project).records.find(r=>r.id===record.id);
    status('#ys-global-status',result?.status==='draft'?'已保存已填部分，其余资料以后再补。':'补充资料已保存，相关模块已更新。','ok');
    return {saved:true,record:result};
  }finally{setWorking(false);}
}
async function deleteSupplement(id){
  if(blockedByReview())throw Error('请先完成当前账单核对，再修改补充资料。');
  const S=window.YoushuSupplements,record=S?.read(project).records.find(r=>r.id===id);if(!record)throw Error('这条补录记录已不存在。');
  const next=S.remove(config(),id);setWorking(true);
  try{
    supplementUndo=JSON.parse(JSON.stringify(record));project=next;undoProject=null;syncInputs();refreshOwnReport();updateSupplementUndo();
    const saved=await persistProject();
    if(!saved)throw Error('删除尚未保存到本机。当前页面可撤销删除，也可以下载账本备份。');
    status('#ys-global-status','已删除这条补录记录，原始账单不受影响。','ok');return {saved:true,canUndo:true};
  }finally{setWorking(false);}
}
async function undoSupplement(){
  if(!supplementUndo)return {saved:true};
  const record=JSON.parse(JSON.stringify(supplementUndo));
  const result=await saveSupplement(record);supplementUndo=null;updateSupplementUndo();
  status('#ys-global-status','已恢复刚才删除的补录记录。','ok');supplementEditor?.refresh?.();return result;
}
function openSupplement(type='records'){
  if(blockedByReview())return;
  if(!route.startsWith('my'))return;
  if(!window.YoushuSupplementUI||!window.YoushuSupplements){status('#ys-global-status','补录组件未加载，请刷新后重试。','error');return;}
  if(!supplementEditor)supplementEditor=window.YoushuSupplementUI.create($('#ys-supplement-root'),{getProject:()=>project,getContext:supplementContext,onSave:saveSupplement,onDelete:deleteSupplement,onUndo:undoSupplement});
  supplementEditor.open(type);
}
function hideReport(){ownNeedsRender=true;if(!isRandomReport){report=null;renderedReportKind=null;$('#ys-report').hidden=true;}}
function edited(){dirty=true;hideReport();}
function cancelPreview(){readGeneration++;source=null;preview=null;$('#ys-review').hidden=true;$('#ys-commit').disabled=true;$('#ys-reviewed').checked=false;$('#ys-file').value='';$('#ys-editor').hidden=true;status('#ys-read-status','');}
function importRows(batch){return (batch.rows||[]).concat(batch.statement?.neutralRows||[],batch.statement?.zeroRows||[],batch.bankStatement?.zeroRows||[]);}
function importPeriod(batch){const dates=importRows(batch).map(r=>r.date||r.month||r.invoiceDate).filter(Boolean).sort();return [batch.statement?.start||batch.bankStatement?.start||dates[0],batch.statement?.end||batch.bankStatement?.end||dates.at(-1)].filter(Boolean).join(' 至 ')||'未提供期间';}
function accountNames(batch){return batch.accountScope||[...new Set(importRows(batch).map(r=>r.account).filter(Boolean))].join('、')||kinds[batch.kind];}
function setWorking(value){busy=value;['ys-upload','ys-read','ys-open','ys-clear','ys-undo-delete','ys-commit','ys-cancel-import'].forEach(id=>$('#'+id).disabled=value||(id==='ys-commit'&&!preview));$('#ys-import-list').querySelectorAll('[data-delete-import]').forEach(b=>b.disabled=value);syncRouteVisibility();}
function showCounts(){
  const has=Object.keys(kinds).some(k=>project[k].length)||statementHasRows(project),imports=project.ledger?.imports||[];
  $('#ys-view-tools').hidden=!has||route!=='my';
  $('#ys-datasets').innerHTML=Object.entries(kinds).map(([k,v])=>`<div class="ys-dataset"><span class="ys-muted">${v}</span><b>${project[k].length}<small class="ys-muted"> 条</small></b></div>`).join('');
  $('#ys-ledger-count').textContent=imports.length?`${imports.length} 份账单 · 相同账户的相同流水号只统计一次`:'还没有账单，添加后会显示在这里。';
  $('#ys-undo-delete').hidden=!undoProject;
  $('#ys-import-list').innerHTML=imports.length?imports.map(batch=>`<article class="ys-import-row"><div class="ys-import-info"><strong>${esc(batch.name)}</strong><span class="ys-muted">${esc(accountNames(batch))} · ${esc(importPeriod(batch))} · 原文件 ${importRows(batch).length} 条</span><span class="ys-muted">${esc(batch.bankStatement?.bank||({wechat:'微信',alipay:'支付宝',generic:kinds[batch.kind],legacy:'原项目'})[batch.sourceType]||kinds[batch.kind])} · ${esc(batch.importedAt?new Date(batch.importedAt).toLocaleString('zh-CN'):'从旧项目恢复')}</span></div><div class="ys-import-actions"><span class="ys-import-state ${saveState==='saved'?'':'ys-import-pending'}">${saveState==='saved'?'已保存':saveState==='error'?'未保存':'保存中'}</span><button class="ys-delete" data-delete-import="${esc(batch.id)}" aria-label="删除本次导入：${esc(batch.name)}" ${busy?'disabled':''}>删除</button></div></article>`).join(''):'<div class="ys-empty">可连续添加微信、支付宝和多个银行账户的账单。</div>';
  $('#ys-import-list').querySelectorAll('[data-delete-import]').forEach(b=>b.onclick=()=>deleteImport(b.dataset.deleteImport));
  const accounts=[...new Set(project.cash.concat(statementOf(project)?.neutralRows||[],statementOf(project)?.zeroRows||[]).map(r=>r.account).filter(Boolean))];
  if(accountView&&!accounts.includes(accountView))accountView='';
  $('#ys-account-filter').innerHTML='<option value="">全部账户</option>'+accounts.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');$('#ys-account-filter').value=accountView;syncRouteVisibility();
}
async function persistProject(){
  const revision=++saveRevision;dirty=true;saveState='saving';status('#ys-storage-status','正在保存到账本…');showCounts();
  try{if(!Store)throw Error('本机保存组件未加载，请下载备份并重新打开完整软件文件夹。');await Store.save(project);if(revision!==saveRevision)return false;saveState='saved';dirty=false;status('#ys-storage-status','已自动保存 · 下次从同一浏览器、同一位置打开可继续。','ok');showCounts();return true;}
  catch(e){if(revision!==saveRevision)return false;saveState='error';dirty=true;status('#ys-storage-status','尚未保存到本机：'+e.message+' 当前数据仍在页面中，请立即下载账本备份。','error');showCounts();return false;}
}
function syncInputs(){$('#ys-company').value=project.company||'';$('#ys-opening').value=project.openingCash??'';$('#ys-asof').value=project.asOf||'';}
async function initializeLedger(){
  setWorking(true);
  try{if(!L||!Store)throw Error('账本组件未加载，请保留完整 assets 文件夹后重新打开。');const saved=await Store.load();project=L.migrate(saved||empty());const v=L.validate(project);if(!v.valid)throw Error(v.errors.map(e=>e.message||e).join('；'));window.YoushuSupplements?.read(project);syncInputs();saveState='saved';dirty=false;status('#ys-storage-status',saved?'已恢复本机保存的账本。':'添加账单后会自动保存在本机。','ok');showCounts();}
  catch(e){saveState='error';status('#ys-storage-status','无法恢复本机账本：'+e.message+' 可以打开此前下载的账本备份。','error');}
  finally{ledgerReady=true;setWorking(false);showCounts();showEntry(true);}
}
function blockedByReview(){if(busy)return true;if(source){status('#ys-read-status','请先确认或取消当前待核对文件，再修改账本。','warn');status('#ys-global-status','当前还有待核对账单，请点击“继续核对”，确认或取消后再修改账本。','warn');return true;}return false;}
async function deleteImport(id){
  if(blockedByReview())return;const batch=project.ledger.imports.find(b=>b.id===id);if(!batch)return;
  const next=L.remove(config(),id),before=project.cash.length+(statementOf(project)?.neutralRows?.length||0)+(statementOf(project)?.zeroRows?.length||0),after=next.cash.length+(statementOf(next)?.neutralRows?.length||0)+(statementOf(next)?.zeroRows?.length||0);
  if(!confirm(`删除「${batch.name}」？\n账户：${accountNames(batch)}\n期间：${importPeriod(batch)}\n将移除本次导入的 ${importRows(batch).length} 条来源记录${batch.kind==='cash'?'，账本净减少 '+(before-after)+' 条交易':''}。其他账单共同包含的交易会保留，原始文件不会删除。`))return;
  setWorking(true);undoProject=JSON.parse(JSON.stringify(project));project=next;cancelPreview();syncInputs();showCounts();refreshOwnReport();await persistProject();setWorking(false);status('#ys-global-status','已删除「'+batch.name+'」；可以点击“撤销删除”。','ok');
}
async function clearOwnReport(){
  if(blockedByReview()||!confirm('清空我的报告？全部账单、账户余额、补录资料和报告都会删除，且不可撤销。已下载的原始文件和备份不会删除。'))return;
  setWorking(true);++saveRevision;saveState='saving';
  try{
    if(!Store?.clear)throw Error('本机保存组件未加载，请重新打开完整软件。');
    await Store.clear();
    project=L.migrate(empty());undoProject=null;supplementUndo=null;
    supplementEditor?.close();supplementEditor=null;$('#ys-supplement-root').innerHTML='';
    sharedReportView?.destroy();sharedReportView=null;report=null;viewProject=null;renderedReportKind=null;
    reportViews.mine={};ownNeedsRender=true;isRandomReport=false;detailData=null;previousFocus=null;
    fileQueue=[];activeFile=null;queueResults=[];queueRunning=false;accountView='';minePeriod=0;
    try{window.localStorage.removeItem('youshu-mine-period-v2');}catch{}
    cancelPreview();syncInputs();updateSupplementUndo();
    if($('#ys-detail').open)$('#ys-detail').close();
    $('#ys-workspace').appendChild($('#ys-view-tools'));
    ['ys-report','ys-detail-title','ys-detail-note','ys-detail-table','ys-source-name','ys-reader-warnings','ys-bank-review','ys-pdf-guidance','ys-validation','ys-clean-preview','ys-raw-preview','ys-pdf-text','ys-mapping','ys-mapping-help','ys-queue-status'].forEach(id=>$('#'+id).textContent='');
    ['ys-source-account','ys-import-account','ys-raw-text','ys-project-file'].forEach(id=>$('#'+id).value='');
    $('#ys-sheet').innerHTML='';$('#ys-account-filter').innerHTML='<option value="">全部账户</option>';
    $('#ys-report').hidden=true;dirty=false;saveState='saved';showCounts();navigate('my');
    status('#ys-storage-status','我的报告已清空，添加账单即可重新开始。','ok');
    status('#ys-global-status','已清空账单、余额、补录资料和报告。','ok');
  }catch(e){
    saveState='error';status('#ys-storage-status','尚未完成清空：'+e.message+' 请重试。','error');
    status('#ys-global-status','清空未完成，当前页面的数据仍保留。','error');
  }finally{setWorking(false);showCounts();}
}
async function undoDelete(){if(blockedByReview()||!undoProject)return;setWorking(true);project=undoProject;undoProject=null;syncInputs();showCounts();refreshOwnReport();await persistProject();setWorking(false);status('#ys-global-status','已恢复刚才删除的数据。','ok');}
function refreshOwnReport(){if(hasOwnData())generate();else{hideReport();syncRouteVisibility();status('#ys-global-status','账本已无导入记录，可继续添加账单。');}}
function queueNote(){status('#ys-queue-status',queueResults.map(r=>r.name+'：'+r.message).join('\n')+(source&&fileQueue.length?'\n还有 '+fileQueue.length+' 份文件，核对或取消当前文件后继续。':''),queueResults.some(r=>!r.ok)?'warn':'ok');}
async function enqueueFiles(files){await ready;if(busy)return;if(source){status('#ys-read-status','请先确认或取消当前待核对文件，再选择其他文件。','warn');return;}navigate('my/import');queueResults=[];fileQueue=Array.from(files).map(file=>({file,account:$('#ys-import-account').value.trim()}));$('#ys-encoding').value='auto';await drainQueue();}
async function drainQueue(){if(queueRunning)return;queueRunning=true;try{while(fileQueue.length&&!source){activeFile=fileQueue.shift();await readFile();}queueNote();}finally{queueRunning=false;syncRouteVisibility();if(route==='my/import'&&!source&&!fileQueue.length&&hasOwnData()&&queueResults.length&&queueResults.every(r=>r.ok))navigate('my');}}
async function cancelCurrentImport(){if(busy)return;if(source)queueResults.push({name:source.name,message:'已取消，原有账本保留',ok:false});cancelPreview();await drainQueue();if(route==='my/import'&&!source&&!fileQueue.length)navigate('my');}
function config(){const p={...project,company:$('#ys-company').value.trim(),openingCash:$('#ys-opening').value.trim()===''?null:D.parseMoney($('#ys-opening').value),asOf:$('#ys-asof').value||''};if(p.asOf)D.parseDate(p.asOf);return p;}
function table(headers,rows,limit=200){return `<table><thead><tr>${headers.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,limit).map(r=>`<tr>${r.map(v=>`<td>${esc(v instanceof Date?v.toISOString().slice(0,10):v)}</td>`).join('')}</tr>`).join('')}</tbody></table>${rows.length>limit?`<p class="ys-muted" style="padding:10px">预览前 ${limit} 行，共 ${rows.length} 行。导入时检查全部记录。</p>`:''}`;}
function datasetMatrix(kind,rows){const fields=Object.keys(D.fields[kind]).filter(k=>!['amount','direction'].includes(k)||kind==='ar'),pdf=rows.some(r=>r.sourcePage);return [fields.map(k=>k==='amount'&&kind==='ar'?'应收金额':friendly[k]||k).concat(pdf?['原 PDF 页码','页内文字行']:[]),...rows.map(r=>fields.map(k=>k==='activity'?({operating:'经营',investing:'投资',financing:'筹资',transfer:'内部转账'}[r[k]]||r[k]):r[k]??'').concat(pdf?[r.sourcePage||'',r.sourceRow||'']:[]))];}
function resetValidation(){preview=null;$('#ys-commit').disabled=true;$('#ys-reviewed').checked=false;$('#ys-pdf-complete').checked=false;$('#ys-clean-preview').hidden=true;status('#ys-validation','');}
function mapSheet(){if(!source)return;resetValidation();const sheet=source.sheets[+$('#ys-sheet').value||0];if(!sheet)return;const header=Math.max(1,Math.min(sheet.rows.length,Number($('#ys-header').value)||1));$('#ys-header').value=header;$('#ys-header').max=sheet.rows.length;const matrix=sheet.rows.slice(header-1),headers=matrix[0]||[];source.current=matrix;source.manualCorrection=!!sheet.manualCorrection;source.currentProvenance=sheet.provenance?.slice(header-1)||null;$('#ys-raw-preview').innerHTML=table(headers,matrix.slice(1),12);$('#ys-raw-text').value=rawCsv(matrix);const kind=$('#ys-kind').value,mapping=D.autoMapping(headers,kind);$('#ys-mapping').innerHTML=Object.keys(D.fields[kind]).map(field=>`<label>${esc(field==='amount'&&kind==='ar'?'应收金额':friendly[field]||field)}<select data-field="${field}"><option value="">不提供此列</option>${headers.map((h,i)=>`<option value="${i}" ${mapping[field]===i?'selected':''}>${i+1}. ${esc(h||'（空表头）')}</option>`).join('')}</select></label>`).join('');$('#ys-mapping').querySelectorAll('select').forEach(n=>n.onchange=resetValidation);$('#ys-mapping-help').textContent=kind==='cash'?'日期必填。收入/支出与“金额＋方向”选一种；优先使用收入/支出列。内部转账请在活动类型填写“内部转账”，其他可选经营、投资、筹资。缺少分类时标记未分类。':'各金额列需要明确数字；没有发生请填 0，不会把空白自动当作零。每个月的账务利润、每个日期的资产负债只保留一行。';$('#ys-mode').value='append';$('#ys-source-account').parentElement.hidden=kind!=='cash';}
function kindChanged(){const k=$('#ys-kind').value;$('#ys-csv-template').href='templates/'+k+'-template.csv';$('#ys-csv-template').textContent='下载'+kinds[k]+' CSV 模板';if(source)mapSheet();}
function detectKind(name){return /现金|流水|cash/i.test(name)?'cash':/利润|profit/i.test(name)?'profit':/应收|receivable|^ar$/i.test(name)?'ar':/资产|balance/i.test(name)?'balance':null;}
async function fileFingerprint(file){if(!window.crypto?.subtle)return undefined;const bytes=await file.arrayBuffer(),hash=await window.crypto.subtle.digest('SHA-256',bytes);return 'sha256:'+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');}
async function readFile(password){
  if(busy)return;const entry=activeFile||{file:$('#ys-file').files[0],account:$('#ys-import-account').value.trim()},f=entry.file;if(!f)return;
  if(!window.YoushuFiles){status('#ys-read-status','读取组件未加载，请保留完整 assets 文件夹后重新打开。','error');return;}
  setWorking(true);status('#ys-global-status','');$('#ys-editor').hidden=true;$('#ys-read').textContent='正在读取…';cancelPreviewOnly();const generation=readGeneration;status('#ys-read-status','正在本机读取：'+f.name);
  try{
    const result=await YoushuFiles.read(f,{encoding:$('#ys-encoding').value,password,onProgress:p=>{if(generation===readGeneration)status('#ys-read-status',f.name+' · '+(typeof p==='string'?p:p.stage||'正在读取…'));}});
    if(generation!==readGeneration)return;if(!result.sheets?.length)throw Error('文件中没有可读取的表格。');
    const fingerprint=await fileFingerprint(f);if(await importStatement(result,f.name,entry.account,fingerprint))return;
    const bank=window.YoushuBank?.parse(result,f.name);
    if(bank)reviewBankFile(bank,result,f.name,entry.account,fingerprint);
    else reviewOrdinaryFile(result,f.name,entry.account,fingerprint);
  }catch(e){
    if(generation!==readGeneration)return;
    if(/PDF_PASSWORD/.test(e.code||'')){const pass=prompt('该 PDF 已加密。请输入打开密码（仅在本机使用）：');if(pass!=null){setWorking(false);return await readFile(pass);}}
    const message=e.message||'读取失败，请检查文件格式。';queueResults.push({name:f.name,message,ok:false});status('#ys-read-status',message+' 原有账本与已成功导入的文件仍保留。','error');
  }finally{setWorking(false);$('#ys-read').textContent='重新读取文件';syncRouteVisibility();}
}
function reviewOrdinaryFile(result,name,account,fingerprint){
  if(result.format==='pdf'&&window.YoushuPdf)result=YoushuPdf.prepare(result);
  $('#ys-bank-review').hidden=true;$('#ys-options').hidden=false;$('#ys-pdf-review').hidden=result.format!=='pdf';$('#ys-pdf-complete').checked=false;$('#ys-pdf-guidance').textContent=result.pdfPreparation?.message||'请核对原 PDF 的全部页面，确认没有遗漏或错位；识别不清楚时可使用银行导出的 CSV 或 Excel。';
  source={...result,name:name,account:account,fingerprint};$('#ys-source-account').value=account;
    $('#ys-sheet').innerHTML=result.sheets.map((s,i)=>`<option value="${i}">${esc(s.name)} · ${Math.max(0,s.rows.length-1)} 行</option>`).join('');
    const first=result.pdfPreparation?.recommendedSheetIndex??Math.max(0,result.sheets.findIndex(s=>s.rows.length>0));$('#ys-sheet').value=first;$('#ys-header').value=result.pdfPreparation?.recommendedHeader||1;
    $('#ys-kind').value=detectKind(result.sheets[first].name)||inferKind(result.sheets[first].rows[Number($('#ys-header').value)-1]||[])||'cash';
    $('#ys-source-name').textContent=name;$('#ys-reader-warnings').textContent=(result.warnings||[]).map(w=>typeof w==='string'?w:w.message).join('\n');$('#ys-pdf-text').textContent=result.text||'该文件不是 PDF，或未提供原始文字。';
    $('#ys-review').hidden=false;$('#ys-editor').hidden=false;$('#ys-options').open=result.format==='pdf'&&!result.pdfPreparation?.complete;kindChanged();checkData();status('#ys-read-status','请核对当前文件，确认后添加到账本。');syncRouteVisibility();if(route==='my/import')$('#ys-editor').scrollIntoView({behavior:'smooth',block:'start'});
}
function cancelPreviewOnly(){readGeneration++;source=null;preview=null;$('#ys-review').hidden=true;$('#ys-commit').disabled=true;}
function fingerprint(kind,r){if(kind==='cash'&&r.id)return 'id:'+r.account+':'+r.id;return rowSignature(kind,r);}
function rowSignature(kind,r){return JSON.stringify(Object.keys(D.fields[kind]).map(k=>[k,r[k]??null]));}
function bankMatrix(rows){return [['PDF 页码','页内文字行','日期','账户','摘要','对手信息','收入（元）','支出（元）','交易后余额（元）'],...rows.map(r=>[r.sourcePage,r.sourceRow,r.date,r.account,r.transactionType||r.category,r.counterparty,r.inflow,r.outflow,r.balance])];}
function reviewBankFile(parsed,result,name,account,fingerprint){
  source={name,account,fingerprint,bankReview:parsed,originalResult:result};$('#ys-pdf-review').hidden=true;$('#ys-source-account').value=account||parsed.statement.account||'';$('#ys-source-account').parentElement.hidden=false;
  $('#ys-source-name').textContent=name;$('#ys-kind').value='cash';$('#ys-bank-review').hidden=false;$('#ys-options').hidden=true;$('#ys-review').hidden=false;$('#ys-editor').hidden=false;
  $('#ys-reader-warnings').textContent='银行 PDF 会先核对再入账。原始文件保留在你的电脑中，识别结果尚未加入账本。';checkBankData();status('#ys-read-status','已识别'+parsed.statement.bank+' PDF，请核对后点击“确认并生成报告”。');syncRouteVisibility();if(route==='my/import')$('#ys-editor').scrollIntoView({behavior:'smooth',block:'start'});
}
function checkBankData(){
  try{
    const parsed=source.bankReview,b=parsed.statement,account=$('#ys-source-account').value.trim(),errors=[...parsed.errors],rows=parsed.rows.map(r=>({...r,account})),zeroRows=(b.zeroRows||[]).map(r=>({...r,account})),allRows=rows.concat(zeroRows).sort(sourceOrder),ack=source.reviewAccount===account&&($('#ys-bank-overlap')?.checked||false);source.reviewAccount=account;
    if(!account)errors.push({message:'请确认这份账单归入哪个银行账户。'});
    let added;if(!errors.length)added=L.add(config(),{name:source.name,fingerprint:source.fingerprint,kind:'cash',sourceType:'generic',rows,bankStatement:{...b,account,...(b.zeroRows?{zeroRows}:{})},importedAt:new Date().toISOString()});
    const first=allRows[0]?.date,last=allRows.at(-1)?.date,overlap=!!(added&&!added.duplicate&&project.cash.some(r=>r.account===account&&r.date>=first&&r.date<=last));
    const balanceText=b.balanceChecked?`逐笔余额连续性已核对：${b.balanceCheckCount??Math.max(0,allRows.length-1)} 处相邻余额一致。`:allRows.length===1?'只有 1 笔记录，没有可比较的相邻余额。':'余额连续性尚未核对通过。';
    $('#ys-bank-review').innerHTML=`<h3>${esc(b.bank)} PDF · 待确认</h3><p>${esc(b.pages)} 页 · ${allRows.length} 笔候选记录${zeroRows.length?'（含 '+zeroRows.length+' 笔零金额记录，保留供核对）':''} · ${esc(b.start||'')} 至 ${esc(b.end||'')}</p><p>收入 ${money(b.income)} · 支出 ${money(b.outflow)} · 末笔余额 ${money(b.closingBalance)}</p><p>${esc(balanceText)}</p><p class="ys-muted">首笔交易前余额 ${money(b.openingBalance)} 是根据流水反推的核对值，不会自动填写为整个账本的期初现金。本格式没有流水号，不会按同日同金额误删记录。</p>${overlap?'<label class="ys-terms"><input id="ys-bank-overlap" type="checkbox" '+(ack?'checked':'')+'>期间与同一账户的已有记录重叠，无法凭流水号去重。我已对照原文件核对，确认保留本次记录。</label>':''}<div class="ys-actions ys-smallgap"><button id="ys-bank-detail">查看全部识别记录</button><button id="ys-bank-manual">改用手动调整表格</button></div>`;
    $('#ys-bank-detail').onclick=()=>{const m=bankMatrix(allRows);openDetail('银行 PDF 候选明细 · 尚未入账',m[0],m.slice(1),'请对照原 PDF 的页码核对。识别有误时取消本次导入或手动修正。');};
    $('#ys-bank-manual').onclick=()=>{const old=source;reviewOrdinaryFile(old.originalResult,old.name,account,old.fingerprint);};
    if($('#ys-bank-overlap'))$('#ys-bank-overlap').onchange=checkBankData;
    const m=bankMatrix(allRows);$('#ys-clean-preview').innerHTML=table(m[0],m.slice(1),30);$('#ys-clean-preview').hidden=false;
    if(errors.length||overlap&&!ack){preview=null;$('#ys-commit').disabled=true;status('#ys-validation',errors.length?'尚未入账，需要修正：\n'+errors.slice(0,15).map(e=>(e.page?'第 '+e.page+' 页：':'')+(e.message||e)).join('\n'):'请先核对重叠期间；如有重复，请取消并改用不重叠的账单。','error');return;}
    preview={kind:'cash',rows,candidate:added.project,source:source.name,stats:added.stats,duplicate:added.duplicate};$('#ys-commit').disabled=false;
    status('#ys-validation',added.duplicate?'这份账单已在账本中，确认后会跳过，不会重复计数。':`已完整读取 ${allRows.length} 笔。正数计收入、负数计支出${zeroRows.length?'；零金额记录保留，不影响收支合计':''}。请确认账户及金额。`+(parsed.warnings?.length?'\n'+parsed.warnings.map(w=>w.message||w).join('\n'):''),'ok');
  }catch(e){preview=null;$('#ys-commit').disabled=true;status('#ys-validation',e.message,'error');}
}
function checkData(){if(source?.bankReview){checkBankData();return;}try{
  if(!source?.current)throw Error('请先读取文件。');const kind=$('#ys-kind').value,mapping={},account=$('#ys-source-account').value.trim();
  $('#ys-mapping').querySelectorAll('select').forEach(n=>{if(n.value!=='')mapping[n.dataset.field]=Number(n.value);});
  const result=D.normalize(source.current,kind,mapping,{dateOrder:$('#ys-date-order').value,moneyScale:Number($('#ys-unit').value),defaultAccount:account||'默认账户'});
  const errors=[...result.errors];let pdfAudit=null;const currentSheet=source.sheets[+$('#ys-sheet').value||0];if(source.format==='pdf'&&((!source.manualCorrection&&!currentSheet?.pdfPrepared)||Number($('#ys-header').value)!==1))errors.push({message:'当前表格尚未整理为完整账单。请使用“自动整理的全部页面”的第 1 行表头，或在“修正表格或粘贴 CSV”中补齐全部页面并将列名放在首行，再重新核对。'});if(source.format==='pdf'&&!$('#ys-pdf-complete').checked)errors.push({message:'请对照原 PDF 的全部页面，完成上方的完整性核对。'});if(source.format==='pdf'&&!source.manualCorrection)errors.push(...(source.pdfPreparation?.issues||[]).filter(e=>!['PDF_CURRENCY','PDF_UNSIGNED_AMOUNT'].includes(e.code)));if(source.format==='pdf'&&kind==='cash'&&window.YoushuPdf?.validateMapping)errors.push(...YoushuPdf.validateMapping(source.current,mapping));if(kind==='cash'&&result.rows.some(r=>r.account==='默认账户')&&!account)errors.push({message:'请填写归入账户名称，或在文件设置中选择账户列，避免混淆多个银行账户。'});
  let rows=result.rows.map(r=>{const pos=source.currentProvenance?.[r.sourceRow-1];return pos?{...r,sourcePage:pos.page,sourceRow:pos.row,sourceRows:[pos.row]}:r;});
  if(source.format==='pdf'&&kind==='cash'&&window.YoushuPdf&&!result.errors.length){pdfAudit=YoushuPdf.audit(rows);rows=pdfAudit.rows;errors.push(...pdfAudit.errors);}
  const seen=new Map();let duplicates=0;rows=rows.filter(r=>{const key=fingerprint(kind,r);if(seen.has(key)&&rowSignature(kind,seen.get(key))===rowSignature(kind,r)){duplicates++;return $('#ys-duplicates').value!=='drop';}seen.set(key,r);return true;});
  if(duplicates&&$('#ys-duplicates').value==='block')errors.push({message:'本文件内有 '+duplicates+' 条疑似重复，请核对后选择去重或保留。'});
  let added;if(!errors.length)added=L.add(config(),{name:source.name,fingerprint:source.fingerprint,kind,sourceType:'generic',rows,importedAt:new Date().toISOString()});
  if(added){const v=D.validateProject(added.project);errors.push(...v.errors);}
  const warnings=(result.warnings||[]).concat(pdfAudit?.warnings||[]).filter(w=>w.code!=='DUPLICATE_ROW');
  if(errors.length){preview=null;$('#ys-commit').disabled=true;$('#ys-options').open=true;status('#ys-validation','有 '+errors.length+' 项需要修正。\n'+errors.slice(0,20).map(e=>(e.row?'第 '+e.row+' 行：':'')+(e.message||'').replace(/“([a-zA-Z]+)”/g,(_,f)=>'“'+(friendly[f]||f)+'”')).join('\n'),'error');}
  else{preview={kind,rows,candidate:added.project,source:source.name,stats:added.stats,duplicate:added.duplicate};status('#ys-validation',`已识别 ${rows.length} 条${kinds[kind]}。`+(added.duplicate?'这份账单已导入，将跳过。':`本次新增 ${added.stats.added} 条，重叠 ${added.stats.duplicates} 条，更新 ${added.stats.updated} 条。`)+(kind==='profit'||kind==='balance'?'相同期间更新为本次版本，删除本次导入可恢复旧版本。':'')+(warnings.length?'\n'+warnings.slice(0,5).map(w=>w.message).join('\n'):''),'ok');$('#ys-commit').disabled=false;}
  const matrix=datasetMatrix(kind,rows);$('#ys-clean-preview').innerHTML=table(matrix[0],matrix.slice(1),30);$('#ys-clean-preview').hidden=false;
}catch(e){preview=null;$('#ys-commit').disabled=true;status('#ys-validation',e.message,'error');}}
function prepareAddition(next){const first=p=>p.cash.reduce((v,r)=>r.date<v?r.date:v,'9999-12-31');if(project.cash.length&&first(next)<first(project))next.openingCash=null;return next;}
async function applyImport(){
  if(busy||!preview||!$('#ys-reviewed').checked)return;const item=preview;setWorking(true);
  project=prepareAddition(item.candidate);undoProject=null;syncInputs();cancelPreview();showCounts();generate();await persistProject();setWorking(false);
  const message=item.duplicate?'相同账单已跳过':`已添加，新增 ${item.stats.added} 条，重叠 ${item.stats.duplicates} 条，更新 ${item.stats.updated} 条`;
  queueResults.push({name:item.source,message,ok:true});status('#ys-global-status',item.source+'：'+message+'。','ok');await drainQueue();
}
function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function basename(){return (project.company||'我的企业').replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').slice(0,60);}
function saveProject(){try{project=config();const v=L.validate(project);if(!v.valid)throw Error(v.errors.map(x=>x.message||x).join('\n'));download(JSON.stringify(project,null,2),basename()+'-有数账本备份.json','application/json');status('#ys-global-status','账本备份下载已发起，包含全部导入记录。请确认下载完成并妥善保存。','ok');}catch(e){status('#ys-global-status',e.message,'error');}}
async function restoreFile(){
  await ready;const file=$('#ys-project-file').files[0];if(!file||blockedByReview())return;setWorking(true);
  try{if(file.size>100*1024*1024)throw Error('备份文件超过 100 MB，请使用较小的备份。');const p=L.migrate(JSON.parse(await file.text())),v=L.validate(p);if(!v.valid)throw Error(v.errors.slice(0,10).map(x=>x.message||x).join('\n'));window.YoushuSupplements?.read(p);
    if(project.ledger?.imports.length&&!confirm('恢复备份会替换当前账本的全部数据。需要保留时请先下载当前账本备份。继续？'))return;
    project=p;undoProject=null;supplementUndo=null;updateSupplementUndo();supplementEditor?.close();fileQueue=[];accountView='';syncInputs();cancelPreview();showCounts();goCreate();refreshOwnReport();await persistProject();
  }catch(e){status('#ys-global-status','无法打开备份：'+e.message,'error');}finally{$('#ys-project-file').value='';setWorking(false);}
}
function openDetail(title,headers,rows,note=''){previousFocus=document.activeElement;detailData=[headers,...rows];$('#ys-detail-title').textContent=title;$('#ys-detail-note').textContent=note;$('#ys-detail-table').innerHTML=table(headers,rows,1000);$('#ys-detail').showModal();}
function cashDetail(rows,title){if(isStatementReport()){const m=billMatrix(rows);openDetail(title,m[0],m.slice(1),billFlowNote());return;}const m=familyReportMatrix('cash',rows);openDetail(title,m[0],m.slice(1),reportTerms().family==='business'?'金额：元。流水按用户提供的原始记录显示；内部转账计入账户流动，不计经营收支。':'金额：元。原始现金流保留；本金和转账与收入分开列示。');}
function generate(){
  ownNeedsRender=true;
  if(route==='home'||route==='random')return;
  renderOwnReport();syncRouteVisibility();
}
function renderOwnReport(){
  try{
    rememberReportView();isRandomReport=false;project=config();
    if(!hasOwnData()){hideReport();return;}
    const v=D.validateProject(project);if(!v.valid)throw Error(v.errors.slice(0,10).map(x=>x.message).join('\n'));
    viewProject=reportProject();report=D.buildReport(isStatementReport()?{...viewProject,cash:viewProject.cash.map(r=>({...r,activity:'operating'})),openingCash:null}:viewProject);
    renderedReportKind='mine';ownNeedsRender=false;$('#ys-report').hidden=route!=='my';renderReport();restoreReportView('mine');
  }catch(e){ownNeedsRender=true;report=null;renderedReportKind=null;$('#ys-report').hidden=true;status('#ys-global-status',e.message,'error');}
}

function emptyBox(text){return `<div class="ys-empty">${esc(text)}</div>`;}
function reportWarnings(r){const w=(r.warnings||[]).map(x=>x.message||x);if(!viewProject.cash.length)w.push('未导入现金流水，现金收支和现金沙盘暂不可用。');if(viewProject.cash.length&&viewProject.openingCash==null)w.push('缺少期初现金，期末现金及可支撑月数暂不计算。');if(!viewProject.profit.length)w.push('未提供账务利润，净利润率暂不计算；现金结余不等于净利润。');if(!viewProject.ar.length)w.push('未提供应收明细，不能判断客户逾期情况。');return [...new Set(w)];}
function cashBaseline(){return [...report.monthly].reverse().find(m=>m.transactionCount>0)||null;}
function bookRows(){if(sharedReportView?.model?.period)return sharedReportView.model.profit;return viewProject.profit.filter(r=>D.monthEnd(r.month)<=report.asOf).map(r=>({...r,netProfit:Math.round((r.revenue-r.cost-r.expenses-r.tax)*100)/100}));}
function statementOf(p){return p?.ledgerStatement||p?.alipayStatement?.format==='alipay-v1'&&(p.alipayStatement)||p?.wechatStatement?.format==='wechat-v1'&&(p.wechatStatement)||null;}
function statementHasRows(p){const b=statementOf(p);return !!(b?.neutralRows?.length||b?.zeroRows?.length);}
function isStatementReport(){const b=statementOf(viewProject);return !isRandomReport&&!!b&&Array.isArray(b.neutralRows);}
function isCombinedReport(){return isStatementReport()&&statementOf(viewProject).format==='combined-v1';}
function isAlipayReport(){return isStatementReport()&&statementOf(viewProject).format==='alipay-v1';}
function statementName(){return isCombinedReport()?'多账户':isAlipayReport()?'支付宝':'微信';}
function billIncomeLabel(){return isCombinedReport()?'原始记录收入':isAlipayReport()?'账单收入':'账单收入（含退款）';}
function billExpenseLabel(){return isCombinedReport()||isAlipayReport()?'原始支出':'账单支出';}
function isBankOnlyReport(){const b=statementOf(viewProject);return !!b?.bankStatements?.length&&!b?.sourceStatements?.length;}
function billFlowNote(){return sharedReportView?.model?.basisNote||'原始流水完整保留供核对。看板收入和支出不计投资理财、信用还款、他人代付及本人资金互转；用途不明确的记录仍需核对。收支差额不等于余额或账务利润。';}
function sourceOrder(a,b){const order=a.bankFormat==='bob-pdf-v1'&&b.bankFormat==='bob-pdf-v1'?-1:1;return a.date.localeCompare(b.date)||(a.sourceImportId||'').localeCompare(b.sourceImportId||'')||order*((a.sourcePage||0)-(b.sourcePage||0))||order*(a.sourceRow-b.sourceRow);}
function billMatrix(rows){return [['原文件行号','日期','交易类型 / 分类','交易对方','商品','收/支','金额（元）','当前状态','支付方式','交易单号','来源文件','账户','原 PDF 页码','交易后余额（元）'],...rows.map(r=>[r.sourceRow,r.date,r.transactionType||r.category,r.counterparty,r.product,r.direction||(r.inflow?'收入':'支出'),r.amount??(r.inflow||r.outflow),r.transactionStatus,r.paymentMethod,r.id,r.sourceImportName||'',r.account||'',r.sourcePage||'',r.balance??''])];}
function reportProject(){
  let p={...project};const bankStatements=(project.ledger?.imports||[]).filter(b=>b.bankStatement).map(b=>({name:b.name,statement:b.bankStatement}));if(bankStatements.length){p.ledgerStatement={...(statementOf(p)||{format:'combined-v1',neutralRows:[],zeroRows:[],sourceStatements:[],reconciled:false}),bankStatements};}const bill=statementOf(p);
  if(accountView){p={...p,cash:p.cash.filter(r=>r.account===accountView),openingCash:null,profit:[],ar:[],balance:[]};if(bill){p.ledgerStatement={...bill,format:'combined-v1',sourceName:accountView,reconciled:false,bankStatements:(bill.bankStatements||[]).filter(b=>b.statement.account===accountView),sourceStatements:(bill.sourceStatements||[]).filter(b=>b.accountScope===accountView),neutralRows:bill.neutralRows.filter(r=>r.account===accountView),zeroRows:(bill.zeroRows||[]).filter(r=>r.account===accountView)};delete p.alipayStatement;delete p.wechatStatement;}}
  const dates=p.cash.concat(statementOf(p)?.neutralRows||[],statementOf(p)?.zeroRows||[],p.balance,p.ar).map(r=>r.date||r.invoiceDate).concat(p.profit.map(r=>D.monthEnd(r.month)),(project.ledger?.imports||[]).map(b=>b.statement?.end||b.bankStatement?.end)).filter(Boolean).sort();
  if(!dates.length)dates.push(...p.ar.map(r=>r.dueDate).filter(Boolean).sort());
  if(!p.asOf&&dates.length)p.asOf=dates.at(-1);return p;
}
async function importStatement(result,name,account,fingerprint){
  const parsed=window.YoushuAlipay?.parse(result.sheets,name)||window.YoushuWechat?.parse(result.sheets,name);if(!parsed)return false;
  const bill=parsed.statement,alipay=bill.format==='alipay-v1',label=alipay?'支付宝':'微信';
  if(parsed.errors.length)throw Error('已识别为'+label+'账单，但有 '+parsed.errors.length+' 项需要核对。'+parsed.errors.slice(0,5).map(e=>(e.row?'原文件第 '+e.row+' 行：':'')+e.message).join('；'));
  const added=L.add(config(),{name,fingerprint,kind:'cash',sourceType:alipay?'alipay':'wechat',accountScope:account||undefined,rows:parsed.rows,statement:bill,importedAt:new Date().toISOString()});
  const validation=D.validateProject(added.project);if(!validation.valid)throw Error(validation.errors.slice(0,5).map(e=>e.message).join('\n'));
  project=prepareAddition(added.project);if(!project.company)project.company='我的收支账本';undoProject=null;syncInputs();cancelPreview();showCounts();generate();await persistProject();
  const message=added.duplicate?'相同账单已跳过，未重复计数':`已添加 ${bill.summary.count} 笔来源记录，新增 ${added.stats.added} 条，重叠 ${added.stats.duplicates} 条，更新 ${added.stats.updated} 条`;
  queueResults.push({name,message,ok:true});status('#ys-global-status','已自动识别'+label+'原始账单，'+message+'。','ok');return true;
}
function extraFinancePanels(){return ['profit','ar','balance'].filter(k=>viewProject[k].length).map(k=>`<div class="ys-panel ys-topgap"><div class="ys-row"><h3>${kinds[k]} · ${viewProject[k].length} 条</h3><button class="ys-no-print" data-extra-kind="${k}">查看明细</button></div><p class="ys-muted">保留已导入的财务资料，未从收支推算利润或余额。</p></div>`).join('');}
function wireExtraFinance(){$('#ys-report').querySelectorAll('[data-extra-kind]').forEach(el=>el.onclick=()=>{const k=el.dataset.extraKind,m=datasetMatrix(k,viewProject[k]);openDetail(kinds[k],m[0],m.slice(1));});}
function renderCombinedReport(){
  const b=statementOf(viewProject),t=report.totals,rows=viewProject.cash.filter(r=>r.date<=report.asOf),neutral=b.neutralRows.filter(r=>r.date<=report.asOf),zero=(b.zeroRows||[]).filter(r=>r.date<=report.asOf),all=rows.concat(neutral,zero).sort(sourceOrder),refunds=all.filter(r=>r.isRefund),otherNeutral=neutral.filter(r=>!r.isRefund);
  const incomeRefund=sum(rows.filter(r=>r.isRefund),r=>r.inflow),neutralRefund=sum(neutral.filter(r=>r.isRefund),r=>r.amount);
  const kpis=[['原始记录收入',money(t.cashIn),'含按收入记录的退款','in'],['原始支出',money(t.cashOut),'保留原付款；不重复扣退款','out'],['原始收支差额',money(t.net),'收入－支出；不是余额或利润','net'],['已标记的退款',money(sum(refunds,r=>r.amount)),refunds.length+' 笔；未推断银行退款分类','refund'],['其他不计收支',money(sum(otherNeutral,r=>r.amount)),otherNeutral.length+' 笔；不含退款','neutral'],['交易记录',all.length.toLocaleString('zh-CN')+' 笔','相同账户的相同流水号已合并','all']];
  $('#ys-report').innerHTML=`<div class="ys-row"><div><span class="ys-section-label">${accountView?'账户账单':isBankOnlyReport()?'银行账单':'多份账单'} · 汇总看板</span><h2>${esc(accountView||viewProject.company||'我的收支账本')}</h2><p class="ys-muted">截至 ${esc(report.asOf)} · 人民币元 · ${esc(accountView||'全部已导入账户')}</p></div><div class="ys-actions ys-no-print"><button id="ys-report-save">下载账本备份</button><button id="ys-export-html">下载报告</button><button id="ys-print">打印 / PDF</button></div></div>
  <p class="ys-status ys-warn">${esc(billFlowNote())}</p>
  <div class="ys-kpis">${kpis.map(([name,value,note,key])=>`<button class="ys-kpi" data-bill-kpi="${key}"><span>${name}</span><strong>${esc(value)}</strong><span>${esc(note)}</span></button>`).join('')}</div>
  <div class="ys-insights"><article class="ys-insight"><h3>${isBankOnlyReport()?'银行原始收支':'退款按来源分别保留'}</h3><p>${isBankOnlyReport()?'金额正负号区分收支，银行摘要保留为原始分类。退款、内部转账和经营性质仍需逐笔核对。':'已计入收入的退款 '+money(incomeRefund)+'；不计收支的退款 '+money(neutralRefund)+'。不再重复加减。'}</p></article><article class="ys-insight"><h3>相同流水号只计一次</h3><p>同一账户、同一来源的重叠账单会自动核对。没有流水号的记录保留，避免误删同日同金额的真实交易。</p></article><article class="ys-insight"><h3>跨账户付款需要核对</h3><p>银行卡付款可能同时出现在银行、微信或支付宝账单里。可用上方账户筛选分别查看；跨账户尚未自动抵销。</p></article></div>
  <div class="ys-panel"><div class="ys-row"><div><h3>月度原始收支</h3><p class="ys-muted">按各原文件分类汇总；点击月份查看包含中性交易与零金额记录的明细。</p></div><div class="ys-actions ys-no-print"><label>图表期间<select id="ys-range"><option value="0" selected>全部月份</option><option value="12">最近 12 个月</option><option value="6">最近 6 个月</option><option value="1">最近一个月</option></select></label><button id="ys-all-cash">查看全部原始记录</button></div></div><div class="ys-legend"><span><i style="background:#629374"></i>原始记录收入</span><span><i style="background:#a39bbb"></i>原始支出</span></div><div id="ys-monthly-chart"></div></div>
  <div class="ys-grid ys-grid-equal"><div class="ys-panel"><h3>原始收入来源</h3><div id="ys-income-ranks"></div></div><div class="ys-panel"><h3>原始支出结构</h3><div id="ys-cost-ranks"></div></div></div>
  <div class="ys-panel ys-topgap"><h3>原始记录收支流向</h3><p class="ys-muted">包含银行原始转账记录；跨账户尚未抵销，中性交易单列。</p><div id="ys-allocation-chart"></div></div>
  <div class="ys-panel ys-topgap"><div class="ys-row"><div><h3>不计收支的记录</h3><p class="ys-muted">${neutral.length} 笔 · ${money(sum(neutral,r=>r.amount))}；零金额交易 ${zero.length} 笔。</p></div><button id="ys-bill-neutral" class="ys-no-print">查看全部不计收支</button></div></div>
  <details class="ys-panel ys-topgap"><summary>每份原始账单的核对信息</summary>${(b.sourceStatements||[]).map(source=>`<p class="ys-smallgap"><strong>${esc(source.name)}</strong> · ${source.statement.reconciled?'已与文件汇总核对':'按明细计算，原文件汇总不足以完整核对'} · ${esc(source.statement.summary?.count??'')} 笔原始记录</p>`).join('')}${(b.bankStatements||[]).map(source=>`<p class="ys-smallgap"><strong>${esc(source.name)}</strong> · ${esc(source.statement.pages)} 页 · ${esc(source.statement.recordCount)} 笔 · ${source.statement.balanceChecked?'逐笔余额连续性核对通过':'需核对余额连续性'}</p>`).join('')}<p class="ys-muted ys-smallgap">以上是各文件的原始统计；仅相同流水号可以合并。没有流水号的重叠文件需要核对；余额连续性通过不等于已与银行总额核对。</p></details>
  ${extraFinancePanels()}`;
  $('#ys-report-save').onclick=saveProject;$('#ys-export-html').onclick=exportReport;$('#ys-print').onclick=()=>window.print();$('#ys-range').onchange=()=>{rememberReportView();drawMonthly();};$('#ys-all-cash').onclick=()=>cashDetail(all,'账本 · 全部原始记录');$('#ys-bill-neutral').onclick=()=>cashDetail(neutral.concat(zero).sort(sourceOrder),'全部不计收支及零金额记录');
  $('#ys-report').querySelectorAll('[data-bill-kpi]').forEach(el=>el.onclick=()=>{const key=el.dataset.billKpi;if(key==='net'){openDetail('原始收支差额',['项目','金额（元）'],[['原始记录收入',t.cashIn],['原始支出',t.cashOut],['原始收支差额',t.net]],billFlowNote());return;}cashDetail(key==='neutral'?otherNeutral:key==='refund'?refunds:key==='in'?rows.filter(r=>r.inflow>0):key==='out'?rows.filter(r=>r.outflow>0):all,el.firstElementChild.textContent);});
  wireExtraFinance();drawMonthly();renderRanks();drawAllocation();
}

function renderStatementReport(){
  if(isCombinedReport()){renderCombinedReport();return;}
  const b=statementOf(viewProject),alipay=isAlipayReport(),label=statementName(),t=report.totals;
  const rows=viewProject.cash.filter(r=>r.date<=report.asOf),neutral=b.neutralRows.filter(r=>r.date<=report.asOf),zero=(b.zeroRows||[]).filter(r=>r.date<=report.asOf);
  const all=rows.concat(neutral,zero).sort(sourceOrder),refunds=all.filter(r=>r.isRefund),refund=sum(refunds,r=>r.amount),neutralTotal=sum(neutral,r=>r.amount),otherNeutral=neutral.filter(r=>!r.isRefund),incomeRefund=sum(rows.filter(r=>r.isRefund),r=>r.inflow);
  const expenseLabel=billExpenseLabel(),incomeLabel=billIncomeLabel(),neutralLabel=alipay?'不计收支':'中性交易';
  const originalNote=alipay?'沿用每条记录的“收/支”标记，保留原付款与退款，不将账单差额作为实际现金变动。':'原付款与退款到账分别保留，按各自日期计入。';
  let reconciliation=b.reconciled?(alipay?'已核对原始文件中提供的汇总。':'原始账单明细的笔数、收入、支出、中性交易金额均已核对一致。'):'按明细计算；原文件未提供完整的汇总核对信息。';
  if(alipay&&b.reconciliationBasis==='expense-less-neutral-refunds')reconciliation+=' 文件汇总支出 '+money(b.declared.expense)+' = 原始支出 '+money(b.summary.expense)+' − 不计收支退款 '+money(sum(b.neutralRows.filter(r=>r.isRefund),r=>r.amount))+'。这是汇总金额核对，不表示每笔退款已与原订单匹配。';
  const kpis=[['账单收入',money(t.cashIn),alipay?'按原文件收入标记；不等于营业收入':'含退款收回；不等于营业收入','in'],[expenseLabel,money(t.cashOut),alipay?'按原文件支出标记；与退款后汇总分开':'保留原付款；不重复扣减退款','out'],[alipay?'原始收支差额':'收支差额',money(t.net),'收入－'+expenseLabel+'；不是余额或利润','net'],[alipay?'退款记录':'其中退款收回',money(refund),refunds.length+' 笔；'+(alipay?'按原文件分类保留，不重复加减':'已包含在账单收入中'),'refund'],[alipay?'其他不计收支':neutralLabel,money(alipay?sum(otherNeutral,r=>r.amount):neutralTotal),(alipay?otherNeutral:neutral).length+' 笔；'+(alipay?'不含上方退款':'不计收入、支出'),'neutral'],['交易记录',all.length.toLocaleString('zh-CN')+' 笔','保留全部记录，包括退款与零金额交易','all']];
  $('#ys-report').innerHTML=`<div class="ys-row"><div><span class="ys-section-label">${label}账单 · 自动生成</span><h2>${esc(viewProject.company||'我的'+label+'收支报告')}</h2><p class="ys-muted">${esc(b.start)} 至 ${esc(report.asOf)} · 人民币元 · 文件仅在本机读取</p></div><div class="ys-actions ys-no-print"><button id="ys-report-save">下载账本备份</button><button id="ys-export-html">下载报告</button><button id="ys-print">打印 / PDF</button></div></div>
  <p class="ys-status ${b.reconciled?'ys-ok':'ys-warn'}">${esc(reconciliation)} <span class="ys-muted">来源：${esc(b.sourceName)}</span></p>
  <div class="ys-kpis">${kpis.map(([name,value,note,key])=>`<button class="ys-kpi" data-bill-kpi="${key}"><span>${name}</span><strong>${esc(value)}</strong><span>${esc(note)}</span></button>`).join('')}</div>
  <div class="ys-insights"><article class="ys-insight"><h3>收进来的钱</h3><p>${alipay?'按收入标记汇总 '+money(t.cashIn)+'。退款记录按原账单标记单列；不计收支中的退款没有再次加入收入。':'其他收款 '+money(t.cashIn-incomeRefund)+'，退款收回 '+money(incomeRefund)+'。退款单列说明，避免当成新增营业收入。'}</p></article><article class="ys-insight"><h3>花出去的钱</h3><p>${expenseLabel} ${money(t.cashOut)}。${originalNote}</p></article><article class="ys-insight"><h3>这份报告能告诉你什么</h3><p>展示${label}账单的收支、退款与资金去向。个人消费与企业经营尚未区分；余额、净利润和现金可支撑暂不计算。</p></article></div>
  <div class="ys-panel"><div class="ys-row"><div><h3>月度收支</h3><p class="ys-muted">按原文件收支分类汇总，${neutralLabel}单列。点击柱形可看当月原始记录。</p></div><div class="ys-actions ys-no-print"><label>图表期间<select id="ys-range"><option value="0" selected>全部月份</option><option value="12">最近 12 个月</option><option value="6">最近 6 个月</option><option value="3">最近 3 个月</option><option value="1">最近一个月</option></select></label><button id="ys-all-cash">查看全部原始记录</button></div></div><div class="ys-legend"><span><i style="background:#629374"></i>${incomeLabel}</span><span><i style="background:#a39bbb"></i>${expenseLabel}</span></div><div id="ys-monthly-chart"></div></div>
  <div class="ys-grid ys-grid-equal"><div class="ys-panel"><h3>${alipay?'收入来源':'收入来源（含退款）'}</h3><p class="ys-muted">按原账单交易对方汇总；退款详情可点击上方指标查看。</p><div id="ys-income-ranks"></div></div><div class="ys-panel"><h3>${alipay?'原始支出结构':'支出结构'}</h3><p class="ys-muted">沿用${label}${alipay?'交易分类':'交易类型'}，尚未判断是否属于企业成本。</p><div id="ys-cost-ranks"></div></div></div>
  <div class="ys-panel ys-topgap"><h3>收支流向</h3><p class="ys-muted">左侧${incomeLabel}，右侧${expenseLabel}及收支差额；${neutralLabel}不参与分配。</p><div id="ys-allocation-chart"></div></div>
  <div class="ys-panel ys-topgap"><div class="ys-row"><div><h3>${neutralLabel}单独看</h3><p class="ys-muted">保留原记录，不当作收入或费用；${alipay?'其中退款已在上方单列，不重复加减。':'不推断其他账户是否到账。'}</p></div><button id="ys-bill-neutral" class="ys-no-print">查看全部${neutralLabel}</button></div><p class="ys-topgap">${neutral.length} 笔 · ${money(neutralTotal)}${zero.length?'；另保留 '+zero.length+' 笔零金额交易，可在全部原始记录中查看。':''}</p></div>
  <p class="ys-muted ys-topgap">范围：当前已导入的${label}账单，可能包含银行卡付款及个人交易，并非完整企业财务报表。期间首尾月份可能不完整；收支差额不是${label}余额或净利润。</p>${extraFinancePanels()}`;
  $('#ys-report-save').onclick=saveProject;$('#ys-export-html').onclick=exportReport;$('#ys-print').onclick=()=>window.print();$('#ys-range').onchange=()=>{rememberReportView();drawMonthly();};
  $('#ys-all-cash').onclick=()=>cashDetail(all,label+'账单 · 全部原始记录');$('#ys-bill-neutral').onclick=()=>cashDetail(neutral,neutralLabel+' · 不计入收入、支出');
  $('#ys-report').querySelectorAll('[data-bill-kpi]').forEach(el=>el.onclick=()=>{const key=el.dataset.billKpi;if(key==='net'){openDetail('收支差额的计算',['项目','金额（元）'],[[incomeLabel,t.cashIn],[expenseLabel,t.cashOut],['收入－'+expenseLabel,t.net]],billFlowNote());return;}cashDetail(key==='neutral'?(alipay?otherNeutral:neutral):key==='refund'?refunds:key==='in'?all.filter(r=>r.direction==='收入'):key==='out'?all.filter(r=>r.direction==='支出'):all,el.firstElementChild.textContent);});
  wireExtraFinance();drawMonthly();renderRanks();drawAllocation();
}

function scopedReportRows(kind){
  const model=sharedReportView?.model;
  if(model?.period)return kind==='cash'?model.rawTransactions:kind==='profit'?model.profit:kind==='ar'?model.ar.rows:kind==='balance'?(model.balance?[model.balance]:[]):[];
  return viewProject[kind]||[];
}
function renderReport(){
  const UI=window.YoushuReportView,Model=window.YoushuTemplateData;
  if(!UI||!Model||!window.YoushuTemplateCharts){renderLegacyReport();return;}
  const kind=isRandomReport?(route==='home'?'sample':'random'):'mine',view=reportViews[kind],experience=kind!=='mine',data=kind==='sample'?fixedSample:kind==='random'?randomSample:project;
  if(!view.template)view.template=UI.newState();
  view.template.range=experience?experiencePeriod:minePeriod;
  const model=Model.build(data,{source:experience?'random':'mine',account:experience?'':accountView,periodMonths:experience?experiencePeriod:minePeriod});
  if(experience&&data.scenario){
    if(!window.YoushuScenarioInsights)throw Error('随机报告分析组件未加载，请刷新后重试。');
    model.design={scenario:data.scenario,insights:window.YoushuScenarioInsights.build(data,model),period:model.period?.label||data.scenario.periodLabel,arRows:model.periodArRows||model.ar.rows};
  }
  if(model.period)report=model.report;
  const accountTools=$('#ys-view-tools');if(accountTools)$('#ys-workspace').appendChild(accountTools);
  sharedReportView=UI.create($('#ys-report'),model,{
    state:view.template,drawMonthly:()=>drawMonthly(model),
    onRendered:()=>{if(accountTools){const slot=!experience&&$('#rt-account-tools');(slot||$('#ys-workspace')).appendChild(accountTools);accountTools.hidden=experience;}},
    onChange:next=>{view.template=next;if(kind==='random')saveRandomExperience();},
    onPeriodChange:months=>{
      if(!(experience?[12,6,3,1]:[0,12,6,3,1]).includes(Number(months)))return;
      const value=Number(months);if(experience)experiencePeriod=value;else minePeriod=value;view.template.range=value;
      try{window.localStorage.setItem(experience?'youshu-experience-period-v1':'youshu-mine-period-v2',String(value));}catch{}
      const detail=$('#ys-detail');if(detail.open)detail.close();
      renderReport();if(kind==='random')saveRandomExperience();$('#ys-range')?.focus({preventScroll:true});
    },
    onCashDetail:(rows,title)=>cashDetail(rows.slice().sort(sourceOrder),title),onTable:openDetail,
    onExtraDetail:kind=>{const m=familyReportMatrix(kind,scopedReportRows(kind));openDetail(kind==='profit'?reportTerms().profit:kinds[kind],m[0],m.slice(1));},
    onAction:action=>{
      if(action==='random')randomReport();else if(action==='backup')saveProject();else if(action==='export')exportReport();
      else if(action==='print')window.print();else if(action==='add')navigate('my/import');else if(action==='manage')navigate('my/bills');else if(action==='mine')goCreate();
      else if(!experience&&action.startsWith('supplement:'))openSupplement(action.slice('supplement:'.length));
    }
  });
}

function renderLegacyReport(){if(isStatementReport()){renderStatementReport();return;}const r=report,t=r.totals,l=cashBaseline();const cashAvailable=viewProject.cash.some(x=>x.date<=r.asOf),lastOp=l?.opOut??0,runway=cashAvailable&&t.closingCash!=null&&lastOp>0?t.closingCash/lastOp:null;const kpis=[['期末现金',cashAvailable?money(t.closingCash):'待补充','期初现金＋全部现金净变动','cash'],['期间经营流入',cashAvailable?money(t.opIn):'待补充','已剔除标记的内部转账','in'],['期间经营流出',cashAvailable?money(t.opOut):'待补充','按现金实际支付','out'],['期间经营现金结余',cashAvailable?money(t.opNet):'待补充','经营流入－经营流出','net'],['期间净利润率',pct(t.netMargin),'按已导入账务月份计算','profit'],['现金可支撑',runway==null?'待补充':runway.toFixed(2)+'个月','期末现金÷'+(l?l.month:'最近一月')+'经营流出','cash']];
const warnings=reportWarnings(r);if(l&&(l.month!==r.asOf.slice(0,7)||r.asOf!==D.monthEnd(l.month)))warnings.push('现金支撑与沙盘采用 '+l.month+' 已导入的经营收付，可能不是完整月份或最新月份，请先核对覆盖期间。');const cashText=cashAvailable?`期间经营现金${t.opNet>=0?'净流入':'净流出'} ${money(Math.abs(t.opNet))}。${t.closingCash==null?'补充期初现金后可查看期末余额。':`期末现金 ${money(t.closingCash)}。`}`:'先导入流水，查看真实现金收支。';const riskText=r.ar.overdue>0?`截至 ${r.asOf}，已导入应收中有 ${money(r.ar.overdue)} 逾期，建议先确认回款日。`:viewProject.ar.length?'已导入应收中未发现到期未收金额。':'补充客户应收资料后，可识别逾期金额。';const actionText=runway!=null&&runway<3?'按最近一月经营付款测算，现金覆盖不足三个月。请核对近期付款和可回收应收款。':!viewProject.profit.length?'补充账务利润数据，区分现金结余与真正的利润。':'核对未分类流水、账务与现金差异，并保存本期项目。';
$('#ys-report').innerHTML=`<div class="ys-row"><div><div class="ys-section-label">${isRandomReport?'随机体验 · 虚构数据':'我的经营报告'}</div><h2>${esc(r.company||'我的企业')}</h2><p class="ys-muted">截至 ${esc(r.asOf)} · 人民币元 · ${isRandomReport?'随机生成的虚构数据，仅用于体验':'数据来源：用户导入'}</p></div><div class="ys-actions ys-no-print">${isRandomReport?'<button id="ys-report-random">再来一个</button>':'<button id="ys-report-save">下载账本备份</button>'}<button id="ys-export-html">下载报告</button><button id="ys-print">打印 / PDF</button></div></div>
<div class="ys-row ys-topgap ys-no-print"><label>图表期间<select id="ys-range"><option value="0">全部月份</option><option value="12" selected>最近 12 个月</option><option value="6">最近 6 个月</option><option value="3">最近 3 个月</option><option value="1">最近一个月</option></select></label><span class="ys-muted">总览与报表按全部已导入期间；此筛选仅改变月度图表。</span></div>
<div class="ys-kpis">${kpis.map(([label,val,note,key])=>`<button class="ys-kpi" data-kpi="${key}"><span>${label}</span><strong>${esc(val)}</strong><span>${note}</span></button>`).join('')}</div>
<div class="ys-insights"><article class="ys-insight"><h3>财务状况</h3><p>${esc(cashText)} ${t.netProfit!=null?'账务净利润 '+money(t.netProfit)+'。':''}</p></article><article class="ys-insight"><h3>风险摘要</h3><p>${esc(riskText)} ${r.balance?.taxPayable?`账面应交税费 ${money(r.balance.taxPayable)}，需与申报及缴款记录核对。`:'税务状态需补充申报及缴款资料核验。'}</p></article><article class="ys-insight"><h3>优先行动</h3><p>${esc(actionText)}</p></article></div>
${warnings.length?`<details class="ys-status ys-warn"><summary>${warnings.length} 项数据说明与待核对事项</summary><ul class="ys-list">${warnings.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}
<div class="ys-panel"><div class="ys-row"><div><h3>月度收支与净利润率</h3><p class="ys-muted">现金按实际收付；利润率按提供的账务数据。点击柱形查看当月流水。</p></div><button class="ys-no-print" id="ys-all-cash">查看全部流水</button></div><div class="ys-legend"><span><i style="background:#629374"></i>经营流入</span><span><i style="background:#a39bbb"></i>经营流出</span><span><i style="background:#6d9bb5"></i>净利润率 · 悬停显示</span></div><div id="ys-monthly-chart"></div></div>
<div class="ys-grid"><div class="ys-panel"><h3>现金沙盘</h3><p class="ys-muted">以最近有流水月份的经营收付为基准，推演未来六个月；请核对该月资料完整性。</p><label class="ys-topgap">收款变化 <b id="ys-growth-label">0%</b><input id="ys-growth" type="range" min="-50" max="50" step="5" value="0"></label><label class="ys-topgap">新增回款延迟 <b id="ys-delay-label">0天</b><input id="ys-delay" type="range" min="0" max="60" step="5" value="0"></label><label class="ys-topgap">每月可削减的支出（元）<input id="ys-cut" type="number" min="0" step="100" value="0"></label><label class="ys-topgap">首月额外支付（税款等，元）<input id="ys-once" type="number" min="0" step="100" value="0"></label><div id="ys-sim-summary" class="ys-sim-summary"></div><p class="ys-muted ys-topgap">假设未来新增收款在月内均匀发生；应收催收及未来融资未自动加入。三个月支出线是可讨论的管理目标。</p></div><div class="ys-panel"><h3>未来六个月现金推演</h3><div id="ys-sim-chart"></div></div></div>
<div class="ys-grid"><div class="ys-panel"><h3>应收与回款</h3>${viewProject.ar.length?`<p class="ys-muted ys-topgap">截至 ${esc(r.asOf)}</p><p class="ys-topgap">应收余额 <strong>${money(r.ar.total)}</strong></p><p>其中逾期 <strong class="ys-negative">${money(r.ar.overdue)}</strong></p><p class="ys-muted">逾期占比 ${pct(r.ar.overdueRatio)}</p>`:emptyBox('导入应收明细后，显示未收与逾期情况。')}</div><div class="ys-panel"><div class="ys-row"><h3>客户应收明细</h3><button class="ys-no-print" id="ys-ar-detail">查看明细</button></div><div id="ys-ar-table" class="ys-scroll ys-topgap"></div></div></div>
<div class="ys-grid ys-grid-equal"><div class="ys-panel"><h3>经营流入来源</h3><p class="ys-muted">按交易对方汇总</p><div id="ys-income-ranks"></div></div><div class="ys-panel"><h3>经营支出结构</h3><p class="ys-muted">按用户确认的分类汇总</p><div id="ys-cost-ranks"></div></div></div>
<div class="ys-panel ys-topgap"><h3>经营分析</h3><p class="ys-muted">左侧按交易对方汇总经营收入，右侧按分类汇总经营支出，并显示经营现金结余；内部转账及非经营活动不计入。</p><div id="ys-allocation-chart"></div></div>
<div class="ys-grid ys-grid-equal"><div class="ys-panel"><div class="ys-row"><h3>账务利润汇总</h3><button class="ys-no-print" id="ys-profit-detail">按月明细</button></div><div id="ys-profit-table" class="ys-topgap"></div></div><div class="ys-panel"><h3>资产负债快照</h3><div id="ys-balance-table" class="ys-topgap"></div></div></div>
<div class="ys-panel ys-topgap"><h3>现金收付汇总</h3><p class="ys-muted">按导入流水的活动分类汇总，保留内部转账净额供核对；不是自动编制的完整法定报表。</p><div id="ys-cash-summary" class="ys-topgap"></div></div>
<p class="ys-muted ys-topgap">报告依据已导入资料计算。未知项目保持待补充；现金沙盘属于假设推演。保存为项目可继续编辑，下载报告为当前静态快照。</p>`;
$('#ys-range').onchange=()=>{rememberReportView();drawMonthly();};if($('#ys-report-save'))$('#ys-report-save').onclick=saveProject;if($('#ys-report-random'))$('#ys-report-random').onclick=randomReport;$('#ys-export-html').onclick=exportReport;$('#ys-print').onclick=()=>window.print();$('#ys-all-cash').onclick=()=>cashDetail(viewProject.cash.filter(x=>x.date<=r.asOf),'全部现金流水');$('#ys-report').querySelectorAll('[data-kpi]').forEach(n=>n.onclick=()=>{const key=n.dataset.kpi;if(key==='profit')profitDetail();else cashDetail(viewProject.cash.filter(x=>x.date<=r.asOf&&(key==='in'?x.activity==='operating'&&x.inflow>0:key==='out'?x.activity==='operating'&&x.outflow>0:true)),n.firstElementChild.textContent);});
drawMonthly();renderRanks();drawAllocation();renderStatements();$('#ys-ar-detail').onclick=arDetail;$('#ys-profit-detail').onclick=()=>profitDetail();['ys-growth','ys-delay','ys-cut','ys-once'].forEach(id=>$('#'+id).oninput=drawScenario);drawScenario();}
const svg=(width,height,body)=>`<svg viewBox="0 0 ${width} ${height}" role="img">${body}</svg>`;
let monthlyViewport=0;
function drawMonthly(scopedModel){
  scopedModel=scopedModel||sharedReportView?.model;
  const bill=isStatementReport(),n=+$('#ys-range').value,rows=scopedModel?.period?scopedModel.monthly:n?report.monthly.slice(-n):report.monthly.slice(-120),c=$('#ys-monthly-chart'),M=window.YoushuMonthly;
  if(!rows.length){c.innerHTML=emptyBox('还没有可绘制的月度数据。');return;}
  const left=55,right=bill?25:65,top=58,bottom=42,h=340;
  const amounts=rows.flatMap(r=>[r.opIn,r.opOut]),fit=rows.length<=12,single=rows.length===1;
  monthlyViewport=c.clientWidth||c.getBoundingClientRect?.().width||1000;
  const w=M.chartWidth(monthlyViewport,rows.length,amounts,left+right),step=(w-left-right)/rows.length,bw=Math.min(19,step*.20);
  const barOffset=single?Math.min(step/4,bw/2+7):step/4;
  const max=Math.max(1,...amounts),y=v=>h-bottom-v/max*(h-top-bottom),x=i=>left+step*(i+.5);
  const margins=rows.filter(r=>r.netMargin!=null).map(r=>r.netMargin),lo=Math.min(0,...margins),hi=Math.max(.1,...margins),yr=v=>h-bottom-(v-lo)/(hi-lo||1)*(h-top-bottom);
  const terms={...reportTerms(),...(scopedModel?.presentation?.marginLabel?{margin:scopedModel.presentation.marginLabel}:{})},incomeLabel=scopedModel?.labels?.income||(bill?billIncomeLabel():terms.income),expenseLabel=scopedModel?.labels?.expense||(bill?billExpenseLabel():terms.expense);
  let out='',line='';const barLabels=[];
  [0,.5,1].forEach(f=>{out+=`<line x1="${left}" x2="${w-right}" y1="${y(f*max)}" y2="${y(f*max)}" stroke="#e0e7dd"/><text x="${left-8}" y="${y(f*max)+4}" text-anchor="end" fill="#687d6e">${M.amountLabel(f*max)}</text>${bill||single&&!margins.length?'':`<text x="${w-right+8}" y="${y(f*max)+4}" fill="#687d6e">${pct(lo+(hi-lo)*f)}</text>`}`;});
  rows.forEach((r,i)=>{
    [[r.opIn,'in',incomeLabel,'#629374',-barOffset],[r.opOut,'out',expenseLabel,'#a39bbb',barOffset]].forEach(([amount,side,label,color,dx])=>{
      const cx=x(i)+dx,py=y(amount),height=y(0)-py,key=i+':'+side,value=M.amountLabel(amount),labelWidth=value.length*6.2+6,description=r.month+' '+label+' '+money(amount);
      out+=`<g data-month="${esc(r.month)}" data-monthly-bar="${key}" data-monthly-direction="${side}" data-monthly-description="${esc(description)}" class="ys-chart-click" tabindex="0" role="button" aria-label="${esc(r.month+' '+label+' '+money(amount)+'；查看当月'+(side==='in'?'收款':'付款')+'明细')}"><rect class="ym-bar-shape" x="${cx-bw/2}" y="${height?py:y(0)-1}" width="${bw}" height="${Math.max(1,height)}" rx="2" fill="${color}"><title>${esc(description)}</title></rect><rect x="${cx-bw/2-4}" y="${Math.min(py,y(0)-10)}" width="${bw+8}" height="${Math.max(10,height)}" fill="transparent"><title>${esc(description)}</title></rect></g>`;
      barLabels.push({center:cx,top:py-29,width:labelWidth,height:21,anchorY:py,key,side,value,color});
    });
    const short=step<58,month=Number(r.month.slice(5));
    out+=`<text x="${x(i)}" y="${h-(!single&&short?25:13)}" text-anchor="middle" fill="#687d6e">${esc(single?r.month.slice(0,4)+'年'+month+'月':short?(step<28?String(month):month+'月'):r.month)}</text>`;
    if(r.netMargin!=null)line+=(i>0&&rows[i-1].netMargin!=null?' L ':' M ')+x(i)+' '+yr(r.netMargin);
  });
  if(!single&&step<58){
    // Center each year under its months, including a short December–January
    // range, so neighboring year labels never compete for one month's width.
    for(let first=0;first<rows.length;){
      const year=rows[first].month.slice(0,4);let last=first;
      while(last+1<rows.length&&rows[last+1].month.startsWith(year+'-'))last++;
      out+=`<text x="${(x(first)+x(last))/2}" y="${h-9}" text-anchor="middle" fill="#687d6e">${esc(year)}</text>`;
      first=last+1;
    }
  }
  out+='<g class="ys-margin-series" data-monthly-margin="">';
  if(!single)out+=`<path d="${line}" fill="none" stroke="#6d9bb5" stroke-width="2.5" pointer-events="none"/><path d="${line}" fill="none" stroke="transparent" stroke-width="18" pointer-events="stroke"/>`;
  const marginLabels=M.placeLabels(rows.flatMap((r,i)=>r.netMargin==null?[]:[{r,center:x(i),top:yr(r.netMargin)-31,width:pct(r.netMargin).length*7+12,height:21}]),{left,right:w-right,gap:3});
  marginLabels.forEach(box=>{
    const r=box.r,label=pct(r.netMargin),py=yr(r.netMargin),cx=box.center;
    const leader=box.y<box.top-1?`<line x1="${cx}" x2="${box.x+box.width/2}" y1="${py-5}" y2="${box.y+box.height}" stroke="#6d9bb5" stroke-width=".7"/>`:'';
    out+=`<g class="ys-margin-point ys-chart-click" tabindex="0" role="button" data-profit-month="${esc(r.month)}" aria-label="${esc(r.month)}${esc(terms.margin)}${label}"><circle cx="${cx}" cy="${py}" r="4" fill="#6d9bb5"/><circle cx="${cx}" cy="${py}" r="${Math.min(12,step*.46)}" fill="transparent"/><g class="ys-margin-label ym-margin-label" aria-hidden="true">${leader}<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="4" fill="white" stroke="#dce6eb"/><text x="${box.x+box.width/2}" y="${box.y+15}" text-anchor="middle" fill="#285e7a">${label}</text></g></g>`;
  });
  out+='</g>';
  const placed=M.placeLabels(barLabels,{left,right:w-right,gap:3});
  placed.forEach(box=>{
    const leader=box.y<box.top-1?`<line x1="${box.center}" x2="${box.x+box.width/2}" y1="${box.anchorY-2}" y2="${box.y+box.height}" stroke="${box.color}" stroke-width=".7" stroke-opacity=".55"/>`:'';
    out+=`<g class="ym-bar-label ym-${box.side}-label" data-monthly-label-for="${box.key}" aria-hidden="true">${leader}<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="4"/><text x="${box.x+box.width/2}" y="${box.y+15}" text-anchor="middle">${esc(box.value)}</text></g>`;
  });
  const minY=Math.min(0,...placed.concat(marginLabels).map(box=>box.y-25));
  out+=`<text x="${left}" y="${minY+18}" fill="#687d6e">万元</text>`;
  const hint=single?'悬停任意柱子显示收支金额；'+(margins.length?'悬停蓝点显示'+terms.margin+'。':'本月账务数据待补充，'+terms.margin+'暂不计算。')+'移出绘图区隐藏，点击收款或付款柱查看对应明细。':'悬停任意柱子显示全部收支金额；移到折线上显示全部'+terms.margin+'。移出绘图区隐藏，点击收款或付款柱查看对应明细。';
  c.innerHTML=`<div class="ym-scroll${fit?' ym-fit':''}"><svg class="ym-chart" data-monthly-chart="" data-monthly-count="${rows.length}" data-monthly-mode="" viewBox="0 ${minY} ${w} ${h-minY}" style="min-width:${fit?0:w}px;height:${h-minY}px" role="group" aria-label="月度收支，金额单位万元；悬停或聚焦柱子显示全部金额，点击查看明细">${out}</svg></div><p class="ym-readout" aria-live="polite"></p><p class="ys-muted">${bill?'悬停任意柱子显示全部收支金额；移出绘图区隐藏，点击收款或付款柱查看对应明细。':hint}${fit?'':' 月份较多时可在图内左右滑动。'}</p>`+(!scopedModel?.period&&!n&&report.monthly.length>120?'<p class="ys-muted">图表显示最近 120 个月；全部记录可在明细中查看。</p>':'');
  c.querySelectorAll('[data-monthly-bar]').forEach(node=>activate(node,()=>{
    const income=node.dataset.monthlyDirection==='in',field=income?'inflow':'outflow';
    const sourceRows=scopedModel?.transactions||viewProject.cash.filter(row=>window.YoushuTemplateData?.includedInReceipts?window.YoushuTemplateData.includedInReceipts(row,bill,viewProject):bill||row.activity==='operating');
    const selected=sourceRows.filter(row=>row.date.startsWith(node.dataset.month)&&row.date<=report.asOf&&row[field]>0);
    cashDetail(selected,node.dataset.month+' · '+(income?incomeLabel:expenseLabel)+'明细');
  }));
  c.querySelectorAll('[data-profit-month]').forEach(node=>activate(node,()=>profitDetail(node.dataset.profitMonth)));
  M.bind(c.querySelector('[data-monthly-chart]'),{readout:c.querySelector('.ym-readout')});
}
function activate(el,fn){el.onclick=fn;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}};}
function renderRanks(){[['incomeGroups','ys-income-ranks',false],['costGroups','ys-cost-ranks',true]].forEach(([key,id,cost])=>{const a=report[key],total=sum(a,x=>x.amount);$('#'+id).innerHTML=a.length?a.slice(0,12).map((r,i)=>`<div class="ys-rank ${cost?'ys-cost':''}" tabindex="0" role="button" data-index="${i}"><div class="ys-row"><span>${esc(r.name)}</span><span class="ys-number">${money(r.amount)} · ${pct(total?r.amount/total:null)}</span></div><div class="ys-track"><i style="width:${total?r.amount/total*100:0}%"></i></div></div>`).join(''):emptyBox('导入现金流水后显示。');$('#'+id).querySelectorAll('[data-index]').forEach(n=>activate(n,()=>cashDetail(viewProject.cash.filter(r=>r.date<=report.asOf&&(isStatementReport()||r.activity==='operating')&&(cost?r.category===a[+n.dataset.index].name&&r.outflow>0:r.counterparty===a[+n.dataset.index].name&&r.inflow>0)),a[+n.dataset.index].name+' 明细')));});}
function drawAllocation(){
  const wechat=isStatementReport(),word=(ordinary,bill)=>wechat?bill:ordinary;
  const el=$('#ys-allocation-chart'),flow=window.YoushuAllocation.build(report);
  if(!flow.total){el.innerHTML=emptyBox(word('报告期间没有经营类现金收支。','报告期间没有计入收入、支出的记录。'));return;}
  const {sources,targets,income,outflow,net,gap,layout:l}=flow;
  const sourceCount=report.incomeGroups.length;
  const resultLabel=net<0?word('经营现金缺口','支出超出收入'):word('经营现金结余','收支结余');
  sources.concat(targets).forEach(item=>{if(item.type==='gap'||item.type==='surplus')item.name=resultLabel;});
  const summary=`<div class="ys-allocation-summary"><div><span>01 收入来源</span><strong>${sourceCount} 个交易对方 · ${money(income)}</strong></div><div><span>02 ${word('经营收款',billIncomeLabel())}</span><strong>${money(income)}</strong></div><div><span>03 支出与结余</span><strong>${word('支出',billExpenseLabel())} ${money(outflow)} · ${wechat?'差额':net<0?'缺口':'结余'} ${money(Math.abs(net))}</strong></div></div>`;
  const colors=['#79a78f','#7fa99d','#7baab8','#93aac6','#a4afd0'];
  const shortName=name=>Array.from(name).length>14?Array.from(name).slice(0,13).join('')+'…':name;
  const ribbon=(x1,x2,y1,y2,h)=>{
    const c1=x1+(x2-x1)*.48,c2=x2-(x2-x1)*.48;
    return `M ${x1} ${y1} C ${c1} ${y1}, ${c2} ${y2}, ${x2} ${y2} L ${x2} ${y2+h} C ${c2} ${y2+h}, ${c1} ${y1+h}, ${x1} ${y1+h} Z`;
  };
  let out=`<title>${word('经营现金流向',statementName()+'收支流向')}：收入来源、收款汇总、支出与结余</title>`;
  out+=`<text x="${l.leftX-12}" y="24" text-anchor="end" fill="#65796c">收入来源 · 按交易对方</text><text x="${l.hubX+5}" y="24" text-anchor="middle" fill="#65796c">汇总后分配</text><text x="${l.rightX+22}" y="24" fill="#65796c">${word('支出分类与现金结余','支出分类与收支差额')}</text>`;
  function branch(item,index,side){
    const left=side==='source',isGap=item.type==='gap',isSurplus=item.type==='surplus';
    const color=isGap?'#bf9163':left?colors[index%colors.length]:isSurplus?'#548b6c':'#a29abb';
    const x=left?l.leftX:l.rightX,labelX=left?x-12:x+l.nodeWidth+12,center=item.y+item.height/2;
    const share=isGap?'不计收入':pct(item.amount/(left?income:flow.total));
    const description=isGap?word('经营付款超过经营收款的差额，资金来源待核对','账单支出超过收入的差额，不代表实际资金短缺'):`${item.type==='income'?word('经营收入',billIncomeLabel()):isSurplus?word('经营现金结余','收支结余'):word('经营支出',billExpenseLabel())} ${money(item.amount)}`;
    const path=left?ribbon(x+l.nodeWidth,l.hubX,item.y,item.hubY,item.height):ribbon(l.hubX+l.nodeWidth,x,item.hubY,item.y,item.height);
    return `<g class="ys-allocation-branch ys-chart-click" tabindex="0" role="button" data-flow-side="${side}" data-flow-index="${index}" data-flow-type="${item.type}" data-flow-amount="${item.amount}" aria-label="${esc(item.name)}，${esc(description)}，查看明细"><title>${esc(item.name)} · ${esc(description)}</title><path class="ys-flow-ribbon" d="${path}" fill="${color}" fill-opacity=".28" ${isGap?'stroke="#bf9163" stroke-width=".6" stroke-dasharray="4 4"':''}/><rect x="${x}" y="${item.y}" width="${l.nodeWidth}" height="${item.height}" rx="2" fill="${color}"/><rect x="${x-2}" y="${center-16}" width="${l.nodeWidth+4}" height="32" fill="transparent"/><text x="${labelX}" y="${center-3}" text-anchor="${left?'end':'start'}" fill="#45624f">${esc(shortName(item.name))}</text><text x="${labelX}" y="${center+12}" text-anchor="${left?'end':'start'}" fill="#65796c" font-size="10">${esc(money(item.amount))} · ${share}</text></g>`;
  }
  sources.forEach((item,i)=>out+=branch(item,i,'source'));
  targets.forEach((item,i)=>out+=branch(item,i,'target'));
  out+=`<rect x="${l.hubX}" y="${l.hubY}" width="${l.nodeWidth}" height="${l.hubHeight}" rx="3" fill="#6d9bb5"/>`;
  if(gap)out+=`<rect x="${l.hubX}" y="${l.hubY+income*l.scale}" width="${l.nodeWidth}" height="${gap*l.scale}" fill="#bf9163"/>`;
  out+=`<rect x="${l.hubX-85}" y="${l.hubY-50}" width="180" height="42" rx="8" fill="#fff" stroke="#dfe7dc"/><text x="${l.hubX+5}" y="${l.hubY-33}" text-anchor="middle" fill="#536c5d">${gap?word('经营资金分配','支出分配'):word('经营收款',billIncomeLabel())}</text><text x="${l.hubX+5}" y="${l.hubY-17}" text-anchor="middle" fill="#536c5d">${money(flow.total)}</text>`;
  if(!income)out+=`<text x="${l.leftX-12}" y="48" text-anchor="end" fill="#8b765b">本期${word('经营收入','账单收入')}为 ¥0.00</text>`;
  el.innerHTML=summary+`<div class="ys-allocation-scroll">${svg(l.width,l.height,out).replace('role="img"','role="group" aria-label="'+word('经营现金流向',statementName()+'收支流向')+'"')}</div><p class="ys-muted ys-allocation-scroll-hint">窗口较窄，可在图内左右滑动查看收入和支出。</p><div class="ys-allocation-footer"><button class="ys-balance-detail" data-flow-balance>${resultLabel} ${money(Math.abs(net))} · 查看计算</button><span class="ys-muted">点击节点或色带查看明细；带宽代表金额。</span></div>`+(gap?`<p class="ys-note">${word('橙色为经营付款超过经营收款的差额，不是收入；请结合期初现金及投资、筹资等流水核对资金来源。','橙色是账单支出超过收入的差额，仅用于平衡图形；不是额外收入，也不代表实际资金短缺。')}</p>`:'')+`<p class="ys-muted ys-smallgap">${word('资金按总额汇集后分配，不代表某个客户直接支付某项成本。经营现金结余不等于账务净利润。',billFlowNote())}</p>`;
  const within=r=>r.date<=report.asOf&&(isStatementReport()||r.activity==='operating');
  function balanceDetail(){openDetail(resultLabel,['项目','金额'],[[word('经营收款',billIncomeLabel()),income],[word('经营付款',billExpenseLabel()),outflow],[word('经营现金结余（收款－付款）','收支差额（收入－支出）'),net]],wechat?billFlowNote():gap?'负数表示经营现金缺口。差额是计算结果，资金来源需结合期初现金及其他活动流水核对，不计作经营收入。':'现金结余为经营收款减经营付款，不代表账务净利润。');}
  el.querySelectorAll('[data-flow-side]').forEach(node=>activate(node,()=>{
    const item=(node.dataset.flowSide==='source'?sources:targets)[+node.dataset.flowIndex];
    if(item.type==='gap'||item.type==='surplus'){balanceDetail();return;}
    const isIncome=item.type==='income';
    cashDetail(viewProject.cash.filter(r=>within(r)&&(isIncome?r.inflow>0&&item.names.includes(r.counterparty):r.outflow>0&&item.names.includes(r.category))),item.name+(isIncome?word(' · 经营收入',' · '+billIncomeLabel()):word(' · 经营支出',' · '+billExpenseLabel())));
  }));
  el.querySelector('[data-flow-balance]').onclick=balanceDetail;
}
function reportTerms(){
  const family=isRandomReport?viewProject?.scenario?.family:'business';
  if(family==='personal')return {family,income:'收入到账',expense:'生活与副业支出',profit:'收支结余',margin:'结余率',revenue:'税后及副业收入',cost:'副业成本',expenses:'生活支出',tax:'另列税费',capital:'期初自有资金',retained:'累计收支结余',otherAssets:'其他资产',activity:{operating:'生活与副业收支',investing:'资产购置',financing:'本金与借款'}};
  if(family==='investor')return {family,income:'已实现收益到账',expense:'费用与已实现亏损',profit:'已实现净收益',margin:'收益结余比例',revenue:'已实现收益收入',cost:'已实现亏损',expenses:'投资费用',tax:'另列税费',capital:'自有本金',retained:'累计已实现净收益',otherAssets:'持仓成本',activity:{operating:'已实现收益与费用',investing:'投资本金买卖',financing:'自有本金投入'}};
  return {family:'business',income:'经营流入',expense:'经营流出',profit:'账务利润',margin:'净利润率'};
}
function familyReportMatrix(kind,rows){
  const periodAr=kind==='ar'&&!!sharedReportView?.model?.period;
  if(periodAr)rows=rows.map(row=>({...row,invoiceDate:row.originalInvoiceDate||row.invoiceDate}));
  if(isRandomReport&&kind==='ar'&&viewProject?.scenario?.receivableBasis?.mode==='settled-history')return [['到账日期','收入来源','收入科目','记录金额','已收金额','应收余额','对应流水'],...rows.map(row=>[row.invoiceDate,row.customer,row.category,row.amount,row.received,row.outstanding,(row.payments||[]).map(payment=>payment.cashId).join('；')])];
  const matrix=datasetMatrix(kind,rows),t=reportTerms();
  if(periodAr){matrix[0].push('期间归属','已收口径','本期已收');matrix.slice(1).forEach((row,index)=>{const source=rows[index];row.push(!source.invoiceDate?'日期待补充':source.openingCarry?'期初待收':'本期发生',source.receiptTimingUnknown?'累计已收 · 日期待核对':'本期已收',source.receiptTimingUnknown?'待核对':source.periodReceived??source.received);});}
  if(t.family==='business')return matrix;
  const replacements={'营业收入':t.revenue,'营业成本':t.cost,'期间费用':t.expenses,'所得税费用':t.tax,'实收资本':t.capital,'留存收益':t.retained,'其他资产':t.otherAssets};
  matrix[0]=matrix[0].map(h=>replacements[h]||h);
  if(kind==='cash')for(const row of matrix.slice(1)){const i=matrix[0].indexOf('活动类型');if(i>=0)row[i]=({'经营':t.activity.operating,'投资':t.activity.investing,'筹资':t.activity.financing})[row[i]]||row[i];}
  return matrix;
}
function profitDetail(month){const rows=bookRows().filter(r=>!month||r.month===month),t=reportTerms(),personal=t.family!=='business';openDetail((month||'期间')+' '+t.profit,['月份',personal?t.revenue:'营业收入',personal?t.cost:'营业成本',personal?t.expenses:'期间费用',personal?t.tax:'所得税费用',personal?t.profit:'净利润',t.margin],rows.map(r=>[r.month,r.revenue,r.cost,r.expenses,r.tax,r.netProfit,pct(r.revenue>0?r.netProfit/r.revenue:null)]),personal?(t.family==='investor'?'本金不计收益；收益结余比例不是投资回报率。':'工资按税后到账记录，结余为收入减已支付支出。'):'来自已导入的账务汇总。没有提供的月份不会由现金推算。');}
function arDetail(){openDetail('客户应收明细',['客户','开票日期','到期日期','应收金额','已收金额','未收金额','逾期天数'],report.ar.rows.map(r=>[r.customer,r.invoiceDate||'未提供',r.dueDate,r.amount,r.received,r.outstanding,r.daysOverdue]),'按报告截止日判断逾期；到期当天不计逾期。');}
function renderStatements(){const r=report;$('#ys-ar-table').innerHTML=r.ar.rows.length?table(['客户','到期日','未收金额','逾期天数'],r.ar.rows.map(x=>[x.customer,x.dueDate,money(x.outstanding),x.daysOverdue]),20):emptyBox('尚未导入应收明细。');const p=bookRows();$('#ys-profit-table').innerHTML=p.length?table(['项目','金额'],[['营业收入',money(sum(p,x=>x.revenue))],['营业成本',money(sum(p,x=>x.cost))],['期间费用',money(sum(p,x=>x.expenses))],['所得税费用',money(sum(p,x=>x.tax))],['净利润',money(sum(p,x=>x.netProfit))],['净利润率',pct(r.totals.netMargin)]])+`<p class="ys-muted ys-smallgap">覆盖 ${p.length} 个已提供账务月份。</p>`:emptyBox('导入账务利润后显示。流水不能替代账务利润。');const b=r.balance;$('#ys-balance-table').innerHTML=b?`<p class="ys-muted">最近快照：${esc(b.date)}</p>`+table(['项目','金额'],[['资产合计',money(b.assets)],['负债合计',money(b.liabilities)],['权益合计',money(b.equity)],['资产－负债－权益',money(b.difference)]])+`<p class="ys-status ${b.balanced?'ys-ok':'ys-warn'}">${b.balanced?'报表等式平衡。':'报表不平衡，请核对输入项目。'}</p><button id="ys-balance-detail" class="ys-no-print">查看所有科目</button>`:emptyBox('导入资产负债资料后显示，系统不会补造资产或负债。');if(b)$('#ys-balance-detail').onclick=()=>{const m=datasetMatrix('balance',[b]);openDetail('资产负债快照 '+b.date,m[0],m.slice(1));};const a=viewProject.cash.filter(x=>x.date<=r.asOf),cashRows=['operating','investing','financing','transfer'].map(k=>{const x=a.filter(r=>r.activity===k);return [{operating:'经营活动',investing:'投资活动',financing:'筹资活动',transfer:'内部转账（核对项）'}[k],money(sum(x,r=>r.inflow)),money(sum(x,r=>r.outflow)),money(sum(x,r=>r.inflow-r.outflow))];});$('#ys-cash-summary').innerHTML=a.length?table(['活动','现金流入','现金流出','现金净变动'],cashRows.concat([['全部合计',money(r.totals.cashIn),money(r.totals.cashOut),money(r.totals.net)]])):emptyBox('尚未导入截止日以内的现金流水。');}
function drawScenario(){const r=report,l=cashBaseline(),start=r.totals.closingCash;if(start==null||!l||!viewProject.cash.length){$('#ys-sim-summary').innerHTML=emptyBox('导入现金流水并填写期初现金后，可推演。');$('#ys-sim-chart').innerHTML=emptyBox('等待现金数据');return;}const growth=+$('#ys-growth').value,delay=+$('#ys-delay').value,cut=+$('#ys-cut').value,once=+$('#ys-once').value;$('#ys-growth-label').textContent=(growth>0?'+':'')+growth+'%';$('#ys-delay-label').textContent=delay+'天';if(!Number.isFinite(cut)||cut<0||cut>l.opOut||!Number.isFinite(once)||once<0||once>1e12){$('#ys-sim-summary').textContent='削减支出须在 0 至最近一月经营流出之间；额外支付须为非负金额。';$('#ys-sim-chart').innerHTML='';return;}const receipt=l.opIn*(1+growth/100),payment=l.opOut-cut,values=Array.from({length:7},(_,m)=>start+receipt*Math.max(0,m-delay/30)-payment*m-(m>0?once:0)),base=Array.from({length:7},(_,m)=>start+(l.opIn-l.opOut)*m-(m>0?once:0)),safety=l.opOut*3,min=Math.min(...values.slice(1)),end=values[6];$('#ys-sim-summary').innerHTML=`<p>六个月后预计现金</p><strong>${money(end)}</strong><p>期间最低 ${money(min)}</p><p class="ys-muted">${min<0?'推演出现资金缺口。':min<safety?'低于三个月经营付款目标线。':'高于三个月经营付款目标线。'}</p>`;const lo=Math.min(0,...values,...base),hi=Math.max(1,safety,...values,...base),w=760,h=290,left=65,right=30,top=35,bottom=40,x=i=>left+i*(w-left-right)/6,y=v=>h-bottom-(v-lo)/(hi-lo||1)*(h-top-bottom);let out='';for(let i=0;i<5;i++){const val=lo+(hi-lo)*i/4;out+=`<line x1="${left}" x2="${w-right}" y1="${y(val)}" y2="${y(val)}" stroke="#e1e8dd"/><text x="${left-8}" y="${y(val)+4}" text-anchor="end" fill="#6b7e70">${(val/10000).toFixed(1)}</text>`;}out+=`<text x="${left}" y="15" fill="#6b7e70">万元 · 最近一月基准：${esc(l.month)}</text><line x1="${left}" x2="${w-right}" y1="${y(safety)}" y2="${y(safety)}" stroke="#54876b" stroke-dasharray="3 4"/><path d="M ${base.map((v,i)=>x(i)+' '+y(v)).join(' L ')}" fill="none" stroke="#a7b3a7" stroke-dasharray="3 5"/><path d="M ${values.map((v,i)=>x(i)+' '+y(v)).join(' L ')}" fill="none" stroke="#bf795e" stroke-width="2.5" stroke-dasharray="6 4"/>`;values.forEach((v,i)=>{out+=`<g data-sim="${i}" tabindex="0" role="button" class="ys-chart-click"><circle cx="${x(i)}" cy="${y(v)}" r="5" fill="#bf795e"/><title>${i}个月后 ${money(v)}</title></g><text x="${x(i)}" y="${h-15}" text-anchor="middle" fill="#6b7e70">${i?'+'+i+'月':'当前'}</text>`;});$('#ys-sim-chart').innerHTML=svg(w,h,out);$('#ys-sim-chart').querySelectorAll('[data-sim]').forEach(n=>activate(n,()=>{const i=+n.dataset.sim;openDetail('现金推演 · '+i+'个月后',['项目','金额'],[['当前现金',start],['累计推演收款',receipt*Math.max(0,i-delay/30)],['累计推演付款',payment*i],['额外支付',i>0?once:0],['推演期末现金',values[i]]],'情景假设，不含额外融资或单列应收催收；金额为元。');}));}
function exportReport(){if(!report)return;const clone=$('#ys-report').cloneNode(true);clone.querySelectorAll('.rt-composition-pages').forEach(legend=>{const all=legend.querySelector('.rt-composition-print');if(all){const full=all.cloneNode(true);full.className='rt-composition-snapshot';full.removeAttribute('style');legend.replaceWith(full);}});clone.querySelectorAll('.rt-tag').forEach(n=>{if(n.getAttribute('aria-pressed')==='true'){const label=document.createElement('span');label.className=n.className;label.textContent=n.textContent;label.setAttribute('aria-pressed','true');n.replaceWith(label);}else n.remove();});clone.querySelectorAll('.ys-no-print,button').forEach(n=>{if(n.classList.contains('ys-kpi')||n.classList.contains('rt-kpi')||n.classList.contains('rt-rank')||n.classList.contains('rt-tab')||n.hasAttribute('data-sort')||n.classList.contains('rt-verification-item')||n.classList.contains('rt-cash-segment')||n.classList.contains('rt-focus-item')||n.classList.contains('rn-score')||n.classList.contains('rn-reading')||n.classList.contains('rn-action')||n.hasAttribute('data-customer')||n.getAttribute('data-insight')==='distribution'||n.classList.contains('rt-composition-item')){const d=document.createElement('div');d.className=n.className;['aria-pressed','aria-selected'].forEach(k=>{if(n.hasAttribute(k))d.setAttribute(k,n.getAttribute(k));});d.innerHTML=n.innerHTML;n.replaceWith(d);}else n.remove();});clone.querySelectorAll('dialog,.rt-actions').forEach(n=>n.remove());clone.querySelectorAll('[role="tabpanel"]').forEach(n=>n.removeAttribute('hidden'));clone.querySelectorAll('details').forEach(n=>n.open=true);clone.querySelectorAll('input,select').forEach(n=>{const s=document.createElement('span');const live=n.id?document.getElementById(n.id):null,value=live?.value??n.value;s.textContent=n.tagName.toLowerCase()==='select'?(Array.from((live||n).querySelectorAll('option')).find(option=>option.value===String(value))?.textContent||value):value;n.replaceWith(s);});const css=`.ys-allocation-scroll-hint{display:none}@media(max-width:1000px){.ys-allocation-scroll-hint{display:block;margin-top:8px}}@media print{.ys-allocation-scroll-hint{display:none}}.ys-allocation-summary{display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:16px;padding:20px 0 16px;margin-bottom:8px;border-bottom:1px solid #dfe7dc}.ys-allocation-summary span{display:block;font-size:11px;color:#687e6e}.ys-allocation-summary strong{display:block;font-size:13px;font-weight:600;margin-top:4px}.ys-allocation-summary>div:nth-child(2){text-align:center}.ys-allocation-summary>div:last-child{text-align:right}.ys-allocation-scroll{overflow-x:auto}.ys-allocation-scroll svg{min-width:880px}.ys-allocation-branch:hover .ys-flow-ribbon,.ys-allocation-branch:focus .ys-flow-ribbon{fill-opacity:.52}.ys-allocation-branch:hover text,.ys-allocation-branch:focus text{fill:#254f3b}.ys-allocation-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.ys-balance-detail{font-size:12px!important;background:#eef4eb!important;padding:6px 10px!important}@media(max-width:700px){.ys-allocation-summary{grid-template-columns:1fr}.ys-allocation-summary>div:nth-child(2),.ys-allocation-summary>div:last-child{text-align:left}}@media print{.ys-allocation-scroll{overflow:visible}.ys-allocation-scroll svg{min-width:0}}body{font:14px/1.7 Arial,'Microsoft YaHei',sans-serif;background:#f2f5f1;color:#263d33;max-width:1250px;margin:24px auto;padding:20px}h2{font-size:24px}h3{font-size:17px}table{width:100%;border-collapse:collapse;font-size:12px}td,th{padding:9px;border-bottom:1px solid #dce5d6;text-align:left}th{background:#edf2e8}.ys-row,.ys-actions{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap}.ys-panel,.ys-insight,.ys-kpi{background:white;border:1px solid #dce5d6;border-radius:10px;padding:18px;margin-top:15px}.ys-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ys-kpi strong{font-size:25px;display:block}.ys-kpi span,.ys-muted{font-size:12px;color:#617363}.ys-grid{display:grid;grid-template-columns:1fr 1.8fr;gap:16px}.ys-grid-equal{grid-template-columns:1fr 1fr}.ys-insights{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ys-status{padding:12px;background:#f6eddc}.ys-scroll,#ys-profit-table,#ys-balance-table,#ys-cash-summary{overflow:auto}.ys-margin-label{opacity:1}.ys-track{height:7px;background:#edf2e8}.ys-track i{height:100%;display:block;background:#699477}.ys-rank{margin:12px 0}.ys-sim-summary{background:#e6eee3;padding:15px}.ys-sim-summary strong{font-size:25px}svg{width:100%;height:auto;font-size:11px}.ys-topgap{margin-top:16px}.ys-footer{font-size:11px;color:#687d6d}@media(max-width:700px){.ys-grid,.ys-insights{grid-template-columns:1fr}.ys-kpis{grid-template-columns:repeat(2,1fr)}}@media print{body{margin:0;padding:0;background:white}.ys-panel{break-inside:avoid}}`;
const included=sharedReportView?.model?.period?{cash:scopedReportRows('cash'),profit:scopedReportRows('profit'),ar:scopedReportRows('ar'),balance:scopedReportRows('balance')}:{cash:viewProject.cash.filter(x=>x.date<=report.asOf),profit:bookRows(),ar:report.ar.rows,balance:report.balance?[report.balance]:[]};const detailSections=isStatementReport()?(()=>{const model=sharedReportView?.model,rows=model?.period?model.rawTransactions.concat(model.neutralTransactions,model.zeroTransactions):viewProject.cash.concat(statementOf(viewProject).neutralRows,statementOf(viewProject).zeroRows||[]);const m=billMatrix(rows.filter(r=>r.date<=report.asOf).sort(sourceOrder));return `<details open><summary>账单原始明细 · ${m.length-1} 条</summary>${table(m[0],m.slice(1),50000)}</details>`;})():Object.entries(kinds).filter(([k])=>included[k].length).map(([k,label])=>{const m=familyReportMatrix(k,included[k]);return `<details><summary>${esc(label)}原始明细 · ${m.length-1} 条</summary>${table(m[0],m.slice(1),50000)}</details>`;}).join('');download(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(viewProject.company||'我的企业')} · 有数报告</title><style>${css}\n${window.YoushuMonthly?.exportCss||''}\n${document.getElementById('ys-report-template-css')?.textContent||''}</style><body><p class="ys-muted">有数 · 本地报告快照 · 截至 ${esc(report.asOf)}。本文件包含财务数据，请自行妥善保存。</p><main id="ys-report" class="${esc(clone.className)}">${clone.innerHTML}</main><section class="ys-panel"><h3>报告数据明细</h3>${detailSections}${isStatementReport()?['profit','ar','balance'].filter(k=>included[k].length).map(k=>{const m=familyReportMatrix(k,included[k]);return `<details open><summary>${kinds[k]}原始明细 · ${included[k].length} 条</summary>${table(m[0],m.slice(1),50000)}</details>`;}).join(''):''}</section><p class="ys-footer">静态快照，不会发送数据。需要继续编辑请在有数中打开保存的项目 JSON。</p></body></html>`,(isRandomReport?'随机体验示例':basename())+'-经营报告.html','text/html;charset=utf-8');}
function inferKind(headers){
  const p=D.autoMapping(headers,'profit'),b=D.autoMapping(headers,'balance'),a=D.autoMapping(headers,'ar');
  if(p.month!=null&&p.revenue!=null)return 'profit';
  if(b.date!=null&&b.cash!=null&&b.capital!=null)return 'balance';
  if(a.customer!=null&&a.dueDate!=null&&a.amount!=null)return 'ar';
  return 'cash';
}
function hasOwnData(){return Object.keys(kinds).some(k=>project[k].length)||statementHasRows(project)||!!project.supplements?.records?.length;}
function rememberReportView(){
  if(sharedReportView&&renderedReportKind){reportViews[renderedReportKind].template=sharedReportView.state;return;}
  if(!renderedReportKind||!$('#ys-range'))return;
  const view=reportViews[renderedReportKind];view.range=$('#ys-range').value;
  ['ys-growth','ys-delay','ys-cut','ys-once'].forEach(id=>{if($('#'+id))view[id]=$('#'+id).value;});
}
function restoreReportView(kind){
  if(sharedReportView)return;
  const view=reportViews[kind],select=$('#ys-range');
  if(select&&view.range!=null&&Array.from(select.querySelectorAll('option')).some(o=>o.value===view.range)){select.value=view.range;drawMonthly();}
  let scenario=false;['ys-growth','ys-delay','ys-cut','ys-once'].forEach(id=>{if($('#'+id)&&view[id]!=null){$('#'+id).value=view[id];scenario=true;}});if(scenario)drawScenario();
}
function readMinePeriod(){
  try{const raw=window.localStorage.getItem('youshu-mine-period-v2'),value=Number(raw);return raw!==null&&[0,12,6,3,1].includes(value)?value:0;}catch{return 0;}
}
function readExperiencePeriod(){
  try{const value=Number(window.localStorage.getItem('youshu-experience-period-v1'));if([12,6,3,1].includes(value))return value;const saved=JSON.parse(window.localStorage.getItem(randomStorageKey)||'null');return [12,6,3,1].includes(saved?.view?.range)?saved.view.range:12;}catch{return 12;}
}
function showSampleReport(){
  rememberReportView();
  try{
    if(!window.YoushuFixedSampleProject||!window.YoushuExampleScenario)throw Error('示例数据组件未加载，请刷新后重试。');
    if(!fixedSample){const candidate=window.YoushuFixedSampleProject.create(window.YoushuExampleScenario);const checked=D.validateProject(candidate);if(!checked.valid)throw Error('示例账本校验未通过。');fixedSample=candidate;}
    isRandomReport=true;viewProject=fixedSample;report=D.buildReport(fixedSample);renderedReportKind='sample';
    renderReport();status('#ys-random-error','');
  }catch(error){report=null;renderedReportKind=null;status('#ys-random-error','暂时无法显示报告：'+error.message,'error');}
}
function readExperienceRoute(){
  // A normal opening always introduces the original fixed example first.
  // The generated company is still restored by an explicit #random link and
  // by the experience navigation within the same open session.
  return 'home';
}
function rememberExperienceRoute(next){
  experienceRoute=next;try{window.localStorage.setItem(experienceStorageKey,next==='home'?'sample':'random');}catch{/* Navigation remains usable when local storage is unavailable. */}
}
function routeFromHash(){const hash=location.hash.replace(/^#/,'');return hash==='create'?'my':['home','random','my','my/import','my/bills'].includes(hash)?hash:experienceRoute;}
function exportSampleReport(){
  const sample=document.getElementById('qingzhang-v4'),clone=sample.cloneNode(true);clone.removeAttribute('hidden');
  clone.querySelectorAll('script,dialog,.ys-no-print,.q-upload').forEach(node=>node.remove());
  clone.querySelectorAll('[role="tabpanel"]').forEach(node=>node.removeAttribute('hidden'));
  clone.querySelectorAll('button,input,select').forEach(node=>{node.setAttribute('disabled','');node.setAttribute('tabindex','-1');});
  const externalCss=Array.from(document.styleSheets||[]).flatMap(sheet=>{try{return Array.from(sheet.cssRules||[]).map(rule=>rule.cssText);}catch{return [];}}).join('\n');
  const css=externalCss+'\n'+Array.from(document.querySelectorAll('style')).map(node=>node.textContent).join('\n')+'\n#qingzhang-v4 button:disabled{opacity:1;cursor:default}#qingzhang-v4{display:block!important}';
  download('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>星辰AI应用工作室 · 有数报告</title><style>'+css+'</style><body>'+clone.outerHTML+'</body></html>','星辰AI应用工作室-有数报告.html','text/html;charset=utf-8');
}
function syncRouteVisibility(){
  const mine=route.startsWith('my'),has=hasOwnData(),home=route==='home',random=route==='random',imports=project.ledger?.imports||[];
  document.getElementById('qingzhang-v4').hidden=ledgerReady||!home;
  $('#ys-home-note').hidden=ledgerReady||!home;$('#ys-workspace').hidden=!ledgerReady&&home;
  $('#ys-random').setAttribute('aria-current',home||random?'page':'false');$('#ys-create').setAttribute('aria-current',mine?'page':'false');
  $('#ys-own-header').hidden=!mine||(route==='my'&&has&&renderedReportKind==='mine'&&!!report&&!!sharedReportView);$('#ys-random-banner').hidden=true;$('#ys-random-error').hidden=!(home||random);
  $('#ys-own-title').textContent=route==='my/import'?'添加账单':route==='my/bills'?'管理账单':'我的报告';
  $('#ys-own-meta').textContent='我的账本'+(imports.length?' · '+imports.length+' 份账单':'');
  $('#ys-save-summary').textContent=saveState==='loading'?'正在恢复本机账本…':saveState==='error'?'尚未保存，请下载账本备份':saveState==='saving'?'正在保存…':has?'已保存在本机 · 可继续添加账单':'添加账单，生成自己的收支报告';
  $('#ys-save-summary').className='ys-muted'+(saveState==='error'?' ys-error':'');
  $('#ys-add-bill').hidden=route==='my/import'||(!has&&route==='my');$('#ys-manage-bills').hidden=route!=='my'||!has;$('#ys-own-back').hidden=route==='my';
  $('#ys-empty-own').hidden=!ledgerReady||route!=='my'||has;$('#ys-empty-undo').hidden=!undoProject;
  $('#ys-loading').hidden=ledgerReady||home;$('#ys-storage-status').hidden=!mine;
  $('#ys-import-surface').hidden=route!=='my/import';$('#ys-management-surface').hidden=route!=='my/bills';
  $('#ys-pending-banner').hidden=!mine||route==='my/import'||(!source&&!busy&&!fileQueue.length);
  $('#ys-pending-text').textContent=source?'「'+source.name+'」尚未确认，可继续核对。':busy?'正在处理账单，可返回查看进度。':'还有 '+fileQueue.length+' 份账单等待处理。';
  $('#ys-continue-import').textContent=source?'继续核对':'查看导入进度';
  $('#ys-view-tools').hidden=route!=='my'||!has;
  $('#ys-global-status').hidden=!mine;
  $('#ys-report').hidden=!ledgerReady||!(home&&renderedReportKind==='sample'||random&&renderedReportKind==='random'||route==='my'&&has&&renderedReportKind==='mine')||!report;
  $('#ys-random-own').textContent=has?'回到我的报告':'用我的账单生成报告';
  if($('#ys-from-demo'))$('#ys-from-demo').textContent=has?'查看我的报告 →':'创建我的报告 →';
  $('#ys-route-location').textContent='当前：'+(random?'随机体验 · 虚构数据':route==='my/import'?'我的报告 / 添加账单':route==='my/bills'?'我的报告 / 管理账单':'我的报告');
  ['ys-add-bill','ys-empty-add','ys-empty-open'].forEach(id=>$('#'+id).disabled=busy);
}
function showEntry(force=false){
  const next=routeFromHash(),changed=next!==route;
  if(changed){rememberReportView();supplementEditor?.close();const flex=$('#rt-flex-dialog');if(flex?.open)flex.close();if($('#ys-detail').open)$('#ys-detail').close();route=next;updateSupplementUndo();}
  if(route==='home')rememberExperienceRoute('home');
  syncRouteVisibility();if(!ledgerReady)return;
  if(route==='home'&&(changed||force||renderedReportKind!=='sample'))showSampleReport();
  else if(route==='random'&&(changed||force||renderedReportKind!=='random'))showRandomReport();
  else if(route.startsWith('my')&&hasOwnData()&&(changed||force||ownNeedsRender||renderedReportKind!=='mine'))renderOwnReport();
  syncRouteVisibility();
}
function navigate(next){
  if(location.hash!=='#'+next)location.hash='#'+next;
  showEntry();$('.ys-nav').scrollIntoView({behavior:'smooth',block:'start'});
}
function goCreate(){navigate('my');}
function chooseFile(){if(busy)return;if(source){navigate('my/import');return;}navigate('my/import');$('#ys-encoding').value='auto';$('#ys-file').value='';$('#ys-file').click();}

function freshRandomSeed(){
  const bytes=new Uint32Array(1);
  if(window.crypto?.getRandomValues)window.crypto.getRandomValues(bytes);else bytes[0]=Math.floor(Math.random()*4294967296);
  return bytes[0]||1;
}
function randomReferenceDate(){
  const now=new Date(),pad=n=>String(n).padStart(2,'0');
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T12:00:00Z`;
}
function cleanRandomView(saved){
  const state=window.YoushuReportView.newState();if(!saved||typeof saved!=='object')return state;
  if([0,1,3,6,12].includes(saved.range))state.range=saved.range;
  if(['cash','profit','balance'].includes(saved.statement))state.statement=saved.statement;
  for(const key of ['growth','delay','expense'])if(Number.isFinite(saved[key]))state[key]=Math.max(key==='delay'?-60:-30,Math.min(key==='delay'?60:30,saved[key]));
  if(Array.isArray(saved.flex))state.flex=saved.flex.filter(x=>typeof x==='string').slice(0,80);
  state.flexInitialized=saved.flexInitialized===true;
  for(const key of ['moreIncome','moreCost'])state[key]=saved[key]===true;
  for(const kind of ['income','cost']){
    const from=saved[kind];if(!from||typeof from!=='object')continue;const into=state[kind];
    for(const key of ['item','part'])if(from[key]===null||typeof from[key]==='string')into[key]=from[key];
    if(['large','refund','payroll','subscription','install'].includes(from.tag))into.tag=from.tag;
    if(['date','counterparty','amount'].includes(from.sort))into.sort=from.sort;
    into.direction=from.direction===-1?-1:1;into.page=Number.isInteger(from.page)?Math.max(1,Math.min(10000,from.page)):1;
    into.open=from.open!==false;
  }
  return state;
}
function restoreRandomExperience(){
  if(randomRestoreChecked)return;randomRestoreChecked=true;
  try{
    const saved=JSON.parse(window.localStorage.getItem(randomStorageKey)||'null'),g=saved?.generation,profiles=window.YoushuScenarioGenerator.profiles;
    if(![1,2].includes(saved?.version)||!g||!Number.isInteger(g.seed)||g.seed<1||g.seed>4294967295||!Number.isInteger(g.scenarioIndex)||g.scenarioIndex<0||g.scenarioIndex>=window.YoushuScenarioGenerator.scenarios.length||!Number.isInteger(g.turn)||g.turn<1||typeof g.now!=='string'||!/^\d{4}-\d{2}-\d{2}T12:00:00Z$/.test(g.now)||!Number.isFinite(Date.parse(g.now)))return;
    // Stable IDs survive catalog reordering; the original three numeric indices remain supported.
    const profileIndex=saved.version===2?profiles.findIndex(p=>p.id===g.profileId):g.profileIndex;
    if(!Number.isInteger(profileIndex)||profileIndex<0||profileIndex>=profiles.length)return;
    const profileId=profiles[profileIndex].id;
    const legacySeen=[0,2,1].slice(0,Math.min(g.turn,3)).map(i=>profiles[i]?.id).filter(Boolean);
    const seen=Array.isArray(g.seenProfileIds)?g.seenProfileIds:legacySeen;
    const seenProfileIds=Array.from(new Set(seen.filter(id=>profiles.some(p=>p.id===id)).concat(profileId)));
    randomGeneration={seed:g.seed,profileIndex,profileId,scenarioIndex:g.scenarioIndex,now:g.now,turn:g.turn,seenProfileIds,round:Number.isInteger(g.round)&&g.round>0?g.round:1};
    reportViews.random.template=cleanRandomView(saved.view);
    randomRecentNames=Array.isArray(saved.recentNames)?saved.recentNames.filter(n=>typeof n==='string').slice(-45):[];
  }catch{/* Unavailable storage or obsolete sample data does not prevent a fresh experience. */}
}
function saveRandomExperience(){
  if(!randomGeneration)return;
  try{window.localStorage.setItem(randomStorageKey,JSON.stringify({version:2,generation:randomGeneration,view:reportViews.random.template,recentNames:randomRecentNames}));}
  catch{status('#ys-random-error','当前随机报告仍可使用，但暂时无法保存到本机。','warn');}
}
function nextRandomGeneration(){
  const profiles=window.YoushuScenarioGenerator.profiles,last=randomGeneration&&profiles.find(p=>p.id===randomGeneration.profileId)||profiles[randomGeneration?.profileIndex];
  let seen=(randomGeneration?.seenProfileIds||[]).filter(id=>profiles.some(p=>p.id===id)),round=randomGeneration?.round||1;
  let remaining=profiles.map((p,index)=>({...p,index})).filter(p=>!seen.includes(p.id));
  if(!remaining.length){remaining=profiles.map((p,index)=>({...p,index}));seen=[];round++;}
  // Prefer a different industry and business mode without repeating a type within a round.
  const previous=profiles.find(p=>p.id===seen.at(-2));
  const distance=p=>(p.id===last?.id?-100:0)+(p.rotationGroup!==last?.rotationGroup?6:0)+(p.rotationGroup!==previous?.rotationGroup?2:0)+(p.family!==last?.family?1:0);
  const viable=remaining.filter(candidate=>{
    const rest=remaining.filter(p=>p.id!==candidate.id),counts={};
    for(const p of rest)counts[p.rotationGroup]=(counts[p.rotationGroup]||0)+1;
    // Leave an order that can start with a different group and continue alternating.
    return Object.entries(counts).every(([group,count])=>count<=(group===candidate.rotationGroup?Math.floor(rest.length/2):Math.ceil(rest.length/2)));
  });
  const pool=viable.length?viable:remaining,best=Math.max(...pool.map(distance)),choices=pool.filter(p=>distance(p)===best);
  const next=!randomGeneration?profiles.map((p,index)=>({...p,index}))[0]:choices[freshRandomSeed()%choices.length];
  return {seed:freshRandomSeed(),profileIndex:next.index,profileId:next.id,scenarioIndex:randomGeneration?freshRandomSeed()%window.YoushuScenarioGenerator.scenarios.length:0,now:randomReferenceDate(),turn:(randomGeneration?.turn||0)+1,seenProfileIds:[...seen,next.id],round};
}
function randomProject(generation){
  if(!window.YoushuScenarioGenerator)throw Error('随机数据组件未加载，请刷新后重试。');
  const next=window.YoushuScenarioGenerator.create(generation),validation=D.validateProject(next);
  if(!validation.valid)throw Error('随机账本暂时无法生成，请再试一次。');
  const calculated=D.buildReport(next);
  if(!calculated.balance?.balanced||calculated.warnings.some(w=>['SOURCE_BALANCE_MISMATCH','CLOSING_CASH_MISMATCH'].includes(w.code)))throw Error('随机账本核对未通过，请再试一次。');
  return next;
}
function showRandomReport(){
  rememberReportView();
  const previous={sample:randomSample,generation:randomGeneration,view:reportViews.random.template,report,viewProject,kind:renderedReportKind,isRandomReport,names:randomRecentNames.slice()};
  try{
    if(!window.YoushuScenarioGenerator)throw Error('随机数据组件未加载，请刷新后重试。');
    restoreRandomExperience();
    const fresh=randomRefreshRequested||!randomGeneration,generation=fresh?nextRandomGeneration():randomGeneration;
    let candidate=!fresh&&randomSample?randomSample:randomProject(generation);
    if(fresh){
      for(let attempt=0;randomRecentNames.includes(candidate.company)&&attempt<8;attempt++){generation.seed=freshRandomSeed();candidate=randomProject(generation);}
      reportViews.random.template=window.YoushuReportView.newState();reportViews.random.template.range=experiencePeriod;
    }
    randomSample=candidate;isRandomReport=true;viewProject=candidate;report=D.buildReport(candidate);renderedReportKind='random';
    $('#ys-report').hidden=false;renderReport();restoreReportView('random');
    randomGeneration=generation;randomRefreshRequested=false;
    if(fresh)randomRecentNames=[...randomRecentNames,candidate.company].slice(-45);
    status('#ys-random-error','');saveRandomExperience();rememberExperienceRoute('random');
  }catch(e){
    randomSample=previous.sample;randomGeneration=previous.generation;reportViews.random.template=previous.view;randomRecentNames=previous.names;randomRefreshRequested=false;
    if(previous.kind==='random'&&previous.sample){
      isRandomReport=true;viewProject=previous.viewProject;report=previous.report;renderedReportKind='random';
      try{renderReport();$('#ys-report').hidden=false;}catch{report=null;renderedReportKind=null;$('#ys-report').hidden=true;}
    }else{isRandomReport=previous.isRandomReport;report=null;renderedReportKind=null;$('#ys-report').hidden=true;}
    status('#ys-random-error','暂时无法换一份报告：'+e.message,'error');
  }
}
function randomReport(){
  if(busy&&ledgerReady)return;randomRefreshRequested=true;
  const detail=$('#ys-detail');if(detail.open)detail.close();
  if(route!=='random')navigate('random');else{showRandomReport();syncRouteVisibility();}
}

function setupEntry(){
  $('#ys-create').onclick=goCreate;$('#ys-random').onclick=()=>navigate(experienceRoute);
  document.getElementById('ys-example-random').onclick=randomReport;
  document.getElementById('ys-example-export').onclick=exportSampleReport;
  document.getElementById('ys-example-print').onclick=()=>window.print();
  const sampleHead=document.getElementById('qingzhang-v4').querySelector('.q-head');
  if(sampleHead)sampleHead.appendChild(document.getElementById('ys-example-tools'));
  $('#ys-upload').onclick=chooseFile;$('#ys-own-back').onclick=goCreate;$('#ys-random-own').onclick=goCreate;
  $('#ys-add-bill').onclick=()=>navigate('my/import');$('#ys-manage-bills').onclick=()=>navigate('my/bills');$('#ys-empty-add').onclick=()=>navigate('my/import');$('#ys-continue-import').onclick=()=>navigate('my/import');
  $('#ys-empty-open').onclick=()=>{if(!blockedByReview())$('#ys-project-file').click();};$('#ys-empty-undo').onclick=undoDelete;
  window.addEventListener('hashchange',()=>showEntry());showEntry();
  const zone=$('#ys-upload-zone');
  zone.ondragover=e=>{e.preventDefault();if(!busy)zone.classList.add('ys-dragover');};
  zone.ondragleave=e=>{if(!zone.contains(e.relatedTarget))zone.classList.remove('ys-dragover');};
  zone.ondrop=e=>{e.preventDefault();zone.classList.remove('ys-dragover');if(busy)return;enqueueFiles(e.dataTransfer.files);};
  const oldUpload=document.getElementById('q2-upload');
  if(oldUpload){const section=oldUpload.closest('section');section.querySelector('.q-section-title h2').textContent='开始你的报告';section.querySelector('.q-panel').innerHTML='<div class="q-row"><div><h3>用自己的数据，也做一份这样的报告</h3><p class="q-muted">先随机体验，再导入银行流水或填写模板。</p></div><button id="ys-from-demo" class="ys-home-cta">创建我的报告 →</button></div>';document.getElementById('ys-from-demo').onclick=goCreate;}
}
$('#ys-read').onclick=()=>readFile();$('#ys-file').onchange=()=>enqueueFiles($('#ys-file').files);$('#ys-source-account').oninput=checkData;$('#ys-kind').onchange=()=>{kindChanged();checkData();};$('#ys-sheet').onchange=()=>{$('#ys-header').value=1;const k=detectKind(source.sheets[+$('#ys-sheet').value].name);if(k)$('#ys-kind').value=k;kindChanged();checkData();};$('#ys-header').onchange=()=>{mapSheet();checkData();};$('#ys-apply-text').onclick=()=>{try{const rows=D.parseCSV($('#ys-raw-text').value);if(!rows.length)throw Error('修正文本为空。');const sheet=source.sheets[+$('#ys-sheet').value];sheet.rows=rows;delete sheet.provenance;sheet.manualCorrection=true;source.manualCorrection=true;$('#ys-pdf-complete').checked=false;$('#ys-header').value=1;mapSheet();checkData();}catch(e){status('#ys-validation',e.message,'error');}};$('#ys-cancel-import').onclick=cancelCurrentImport;$('#ys-check').onclick=checkData;$('#ys-pdf-complete').onchange=checkData;$('#ys-reviewed').onchange=()=>$('#ys-commit').disabled=!preview||!$('#ys-reviewed').checked;$('#ys-commit').onclick=()=>{$('#ys-reviewed').checked=true;return applyImport();};['ys-unit','ys-mode','ys-date-order','ys-duplicates'].forEach(id=>$('#'+id).onchange=()=>{resetValidation();checkData();});['ys-company','ys-opening','ys-asof'].forEach(id=>$('#'+id).onchange=()=>{try{project=config();edited();persistProject();if(source)checkData();}catch(e){status('#ys-global-status',e.message,'error');}});$('#ys-generate').onclick=generate;$('#ys-save').onclick=saveProject;$('#ys-open').onclick=()=>{if(!blockedByReview())$('#ys-project-file').click();};$('#ys-project-file').onchange=restoreFile;$('#ys-clear').onclick=clearOwnReport;$('#ys-backup').onclick=saveProject;$('#ys-undo-delete').onclick=undoDelete;$('#ys-account-filter').onchange=()=>{accountView=$('#ys-account-filter').value;if(reportViews.mine.template){const fresh=window.YoushuReportView.newState();reportViews.mine.template.income=fresh.income;reportViews.mine.template.cost=fresh.cost;reportViews.mine.template.flex=[];reportViews.mine.template.flexInitialized=false;reportViews.mine.template.ownFlexInitialized=false;}generate();};$('#ys-detail-close').onclick=()=>$('#ys-detail').close();$('#ys-detail').onclose=()=>previousFocus?.focus();$('#ys-detail-csv').onclick=()=>{if(detailData)download(D.safeCsv(detailData),'有数-明细.csv','text/csv;charset=utf-8');};window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});showCounts();setupEntry();let ready=initializeLedger();
// Redraw only when the available width changes; height changes from staggered
// labels must not create a ResizeObserver loop.
if(typeof ResizeObserver==='function')new ResizeObserver(()=>{
  const chart=$('#ys-monthly-chart'),width=chart?.clientWidth||0;
  if(report&&width>0&&Math.abs(width-monthlyViewport)>.5)drawMonthly();
}).observe($('#ys-report'));
})();
