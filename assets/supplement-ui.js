/* Optional manual information. UI only; the workspace owns data and persistence. */
(function(root){
  'use strict';
  const titles={ar:'补充应收款',balance:'确认账户余额',books:'补充月度账务',plan:'补充付款计划',assets:'补充资产负债',records:'补录记录'};
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=value=>value===null||value===undefined?'未填写':'¥'+Number(value).toLocaleString('zh-CN',{maximumFractionDigits:2});
  const copy=value=>JSON.parse(JSON.stringify(value));
  const makeId=()=> 'supp-'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
  const field=(label,name,value,type='text',hint='')=>`<label class="ys-sup-field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}" ${type==='number'?'step="0.01" min="0" inputmode="decimal" placeholder="不知道可留空"':type==='text'?'maxlength="200"':''}>${hint?`<small>${hint}</small>`:''}</label>`;
  const amount=(label,name,value,hint='')=>field(label+'（元）',name,value,'number',hint);
  const tick=(label,name,checked)=>`<label class="ys-sup-check"><input name="${name}" type="checkbox" ${checked?'checked':''}><span>${label}</span></label>`;
  const assets=['cash','receivables','inventory','fixedAssets','otherAssets','payables','taxPayable','debt','otherLiabilities','capital','retainedEarnings'];
  const assetLabels={cash:'账户现金',receivables:'应收款',inventory:'存货',fixedAssets:'设备等固定资产净值',otherAssets:'其他资产',payables:'应付款',taxPayable:'应交税费',debt:'借款',otherLiabilities:'其他负债',capital:'投入本金',retainedEarnings:'留存收益'};
  function create(host,options={}){
    if(!host)throw Error('补录界面缺少容器。');
    const S=root.YoushuSupplements;
    if(!S)throw Error('补录数据组件尚未加载。');
    let type='records',recordId=null,data={},ctx={},busy=false,previousFocus=null,search='',linked=new Set(),closing=false,canUndo=false,cashFacts=null,balanceSuggestions=null,basisNotice='';
    host.innerHTML='<dialog id="ys-supplement-dialog" class="ys-sup-dialog ys-no-print" aria-labelledby="ys-sup-title"><div class="ys-sup-content"></div></dialog>';
    const dialog=host.querySelector('#ys-supplement-dialog'),content=dialog.querySelector('.ys-sup-content');
    const q=selector=>content.querySelector(selector);
    // Supplements belong to the complete ledger. A report account filter must
    // never hide an existing linked receipt while a global record is edited.
    function context(){const p=options.getProject(),c=options.getContext?.()||{};return {...S.context(p,{...c,account:''}),...c};}
    function emptyData(kind){
      const date=ctx.asOf||'';
      if(kind==='ar')return {mode:'entry',basis:'outstanding',snapshotAsOf:date,date:'',customer:'',business:'',amount:null,dueDate:'',receiptKeys:[],complete:false};
      if(kind==='balance')return {date,accounts:(ctx.accounts||[]).map(account=>({account,amount:null}))};
      if(kind==='books')return {month:date.slice(0,7),revenue:null,cost:null,expenses:null,tax:null};
      if(kind==='plan')return {date:'',payee:'',category:'',amount:null,repeat:false};
      if(kind==='assets')return Object.fromEntries([['date',date],...assets.map(k=>[k,null])]);
      return {};
    }
    function open(kind='records',id){
      if(busy)return;
      type=Object.hasOwn(titles,kind)?kind:'records';ctx=context();search='';basisNotice='';cashFacts=root.YoushuOwnCash?.balanceContext(options.getProject(),{asOf:ctx.asOf,account:''})||null;
      const records=S.read(options.getProject()).records;
      let current=id?records.find(r=>r.id===id):null;
      if(!id&&['balance','books','assets'].includes(type))current=records.find(r=>r.type===type&&(type==='books'?r.data.month===(ctx.asOf||'').slice(0,7):r.data.date===ctx.asOf));
      recordId=current?.id||makeId();data=current?copy(current.data):emptyData(type);
      if(current)type=current.type;
      if(type==='ar'&&data.mode==='none')data={...emptyData('ar'),date:data.date};
      if(type==='balance')for(const account of ctx.accounts||[])if(!data.accounts.some(row=>row.account===account))data.accounts.push({account,amount:null});
      if(type==='balance')prefillBalances();
      if(['books','assets'].includes(type))prefillAccounting();
      linked=new Set(data.receiptKeys||[]);
      if(!dialog.open)previousFocus=host.ownerDocument?.activeElement||root.document?.activeElement;
      render();
      if(!dialog.open){if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');}
      const first=q('[name="customer"]')||q('input')||q('[data-sup-new]')||q('[data-sup-close]');first?.focus();
    }
    function close(){if(busy)return;closing=true;if(dialog.close)dialog.close();else dialog.removeAttribute('open');closing=false;previousFocus?.focus?.();}
    function balanceFact(account){return (cashFacts?.accounts||[]).find(row=>row.account===account);}
    function prefillBalances(){
      const cash=root.YoushuOwnCash,p=options.getProject();cashFacts=cash?.balanceContext(p,{asOf:data.date,account:''})||null;
      balanceSuggestions=cash?.balanceSummary?.(p,{asOf:data.date,account:''})||null;
      for(const row of data.accounts){const suggestion=(balanceSuggestions?.accounts||[]).find(r=>r.account===row.account),fact=balanceFact(row.account);if(row.amount===null||row.amount===undefined)row.amount=Number.isFinite(suggestion?.amount)?suggestion.amount:fact?.date===data.date&&Number.isFinite(fact.amount)?fact.amount:0;}
    }
    function balanceHint(account){
      const fact=balanceFact(account),suggestion=(balanceSuggestions?.accounts||[]).find(row=>row.account===account);
      if(fact&&Number.isFinite(fact.amount)){const source=[fact.source||'已知余额',fact.date,money(fact.amount)].filter(Boolean).join(' · '),computed=suggestion?.estimated&&!suggestion?.assumedZero?' · '+(suggestion.note||'按已导入流水推算至 '+data.date):fact.date!==data.date?' · 原余额日期与所选日期不同':'';return {known:true,text:source+computed+' · 可修改'};}
      if(suggestion&&!suggestion.assumedZero&&Number.isFinite(suggestion.amount))return {known:true,text:[suggestion.source||'账本计算',suggestion.sourceDate||data.date,money(suggestion.sourceAmount??suggestion.amount),suggestion.sourceName||suggestion.note||'', '可修改'].filter(Boolean).join(' · ')};
      return {known:false,text:(fact?.issue||'账单未提供余额')+' · 已预填 0，可直接修改'};
    }
    function accountingImport(d=data){const p=options.getProject();return type==='books'?(p.profit||[]).find(row=>row.month===d.month):type==='assets'?(p.balance||[]).find(row=>row.date===d.date):null;}
    function prefillAccounting(){const existing=accountingImport();if(existing)for(const key of type==='books'?['revenue','cost','expenses','tax']:assets)if(Number.isFinite(existing[key]))data[key]=existing[key];}
    function customerField(){const names=[...new Set((ctx.receipts||[]).map(r=>r.counterparty).filter(Boolean))];return field('谁还没付款','customer',data.customer,'text',names.length?'可选择账单里出现过的交易对象，也可以直接填写':'').replace('name="customer"','name="customer" list="ys-sup-customers" autocomplete="off"')+`<datalist id="ys-sup-customers">${names.map(name=>`<option value="${esc(name)}"></option>`).join('')}</datalist>`;}
    function refresh(){if(dialog.open&&!busy){ctx=context();if(type==='records')render();}}
    function header(){return `<div class="ys-sup-head"><div><p class="ys-sup-eyebrow">我的报告 · 补充资料</p><h2 id="ys-sup-title">${titles[type]}</h2></div><button type="button" class="ys-sup-close" data-sup-close aria-label="关闭补录侧栏">关闭</button></div>`;}
    function footer(note){return `<div class="ys-sup-footer"><p class="ys-sup-note">${note}</p><p id="ys-sup-error" class="ys-sup-error" role="alert" hidden></p><div class="ys-sup-actions"><button type="button" data-sup-close>稍后再补</button><button type="submit" class="ys-primary" id="ys-sup-save">保存</button></div><p class="ys-sup-local">随账本保存在本机</p></div>`;}
    function render(){
      let html=header();
      if(type==='records')html+=recordsHTML();
      else {
        html+='<p class="ys-sup-intro">'+(type==='ar'?'填客户和还没收到的金额，就能看到应收分布。':type==='balance'?'已识别余额已填好，未提供的先按 0 计入。所有金额都可以修改。':'先填知道的就好，其他资料以后再补。')+'</p><form id="ys-sup-form">';
        if(type==='ar'){
          const snapshot=data.basis==='outstanding';
          html+=customerField()+amount(snapshot?'当前未收金额':'应收总额','amount',data.amount,snapshot?'只填剩余未到账的金额，已经收到的不用再填':'填写这笔款的全部金额，已到账部分在下方关联');
          if(snapshot&&data.snapshotAsOf&&data.snapshotAsOf!==ctx.asOf)html+=`<p class="ys-sup-note">上次确认 ${esc(data.snapshotAsOf)} · 保存后更新为 ${esc(ctx.asOf)} 的未收金额</p>`;
          if(basisNotice)html+=`<p class="ys-sup-note" role="status">${esc(basisNotice)}</p>`;
          html+='<details class="ys-sup-more"><summary>更多信息（可选）</summary>'+field('约定到账日','dueDate',data.dueDate,'date','未约定可留空，填写后可判断是否逾期')+field('款项说明','business',data.business)+field('业务日期','date',data.date,'date','不知道可留空，不会猜测发生月份')+`<label class="ys-sup-field"><span>金额怎么填</span><select name="basis"><option value="outstanding" ${snapshot?'selected':''}>当前未收金额</option><option value="total" ${snapshot?'':'selected'}>应收总额减已到账</option></select></label>`;
          if(!snapshot)html+='<div class="ys-sup-links"><p class="ys-sup-label">已经收到过一部分？</p><p class="ys-sup-note">从全部账户关联已有流水，不会重复计入收入。</p><label class="ys-sup-field"><span>查找已到账流水</span><input id="ys-sup-search" type="search" placeholder="客户、金额或日期"></label><div id="ys-sup-receipts"></div></div>';
          html+='</details><div id="ys-sup-ar-result" class="ys-sup-result" aria-live="polite"></div>'+tick('这就是目前全部未收款','complete',data.complete)+footer(snapshot?'保存后立即更新应收分布和客户明细；未填到账日时不判断逾期。':'业务日期和到账日齐全后更新历史回款分析；不确定时可先保存。')+'</form><div class="ys-sup-none"><span>没有未到账的款项？</span><button type="button" class="ys-sup-link" data-sup-none>确认没有应收</button></div>';
        }else if(type==='balance'){
          html+=field('余额日期','date',data.date,'date','确认这一天的账户余额');
          if(balanceSuggestions?.aggregate&&Number.isFinite(balanceSuggestions.total))html+=`<p class="ys-sup-aggregate">账本已知总余额 <strong>${money(balanceSuggestions.total)}</strong> · 尚未分配到账户</p>`;
          if(data.accounts.length)html+=data.accounts.map((row,index)=>{const hint=balanceHint(row.account),input=amount(esc(row.account),'account-'+index,row.amount).replace('min="0"','').replace('placeholder="不知道可留空"','placeholder="未填写按 0 计入"');return `<div class="ys-sup-account">${input}<p class="ys-sup-source ${hint.known?'is-known':''}">${esc(hint.text)}</p></div>`;}).join('');
          else html+='<p class="ys-sup-note">请先添加一份账单以识别账户。</p>';
          html+='<div id="ys-sup-balance-result" class="ys-sup-result" aria-live="polite"></div>'+footer('保存即确认当前金额；留空按 0 计入，不会新增收支或修改原始账单。')+'</form>';
        }else if(type==='books'){
          html+=field('账务月份','month',data.month,'month')+'<p class="ys-sup-note">这里填账务金额，和实际收付款可能不同。</p>'+amount('账务收入','revenue',data.revenue)+amount('成本','cost',data.cost)+amount('费用','expenses',data.expenses)+amount('税费','tax',data.tax)+'<div id="ys-sup-books-result" class="ys-sup-result" aria-live="polite"></div>'+footer('没有发生请填 0；四项齐全后更新利润表，留空时先保存。')+'</form>';
        }else if(type==='plan'){
          html+=field('准备付给谁','payee',data.payee)+amount('预计付款','amount',data.amount)+field('预计付款日','date',data.date,'date')+'<details class="ys-sup-more"><summary>更多信息（可选）</summary>'+field('付款事项','category',data.category)+tick('每月重复这笔付款','repeat',data.repeat)+'</details>'+footer('只用于未来现金安排，不计入已经发生的支出。')+'</form>';
        }else if(type==='assets'){
          html+=field('资料日期','date',data.date,'date')+'<p class="ys-sup-note">可以先记下已知金额。完整且平衡后再生成资产负债表。</p>';
          for(const [title,keys] of [['资产',['cash','receivables','inventory','fixedAssets','otherAssets']],['负债',['payables','taxPayable','debt','otherLiabilities']],['本金与留存',['capital','retainedEarnings']]])html+=`<details class="ys-sup-more" ${title==='资产'?'open':''}><summary>${title}</summary>${keys.map(key=>key==='retainedEarnings'?field(assetLabels[key]+'（元）',key,data[key],'number','累计亏损时可以填负数').replace('min="0"',''):amount(assetLabels[key],key,data[key])).join('')}</details>`;
          html+=footer('不知道可留空，没有发生请填 0；不会修改原始流水。')+'</form>';
        }
      }
      content.innerHTML=html;
      if(accountingImport()){const save=q('#ys-sup-save');if(save){save.disabled=true;save.textContent='已在报告中';}q('#ys-sup-form').querySelectorAll('input[type="number"]').forEach(el=>el.setAttribute('readonly',''));const intro=q('.ys-sup-intro');if(intro)intro.textContent='以下金额来自已导入的账务资料，无需重复补录。';}
      bind();if(type==='ar')renderReceipts();if(type!=='records')live();
    }
    function summary(record){const d=record.data;if(record.type==='balance')return (d.date||'日期待补')+' · '+(d.accounts||[]).filter(x=>x.amount!=null).length+' 个账户已填写';if(record.type==='ar')return d.mode==='none'?(d.date||'')+' · 已确认没有应收':(d.customer||'客户待补')+' · '+(d.basis==='outstanding'?'未收 ':'总额 ')+money(d.amount)+(d.basis==='outstanding'&&d.snapshotAsOf?' · '+d.snapshotAsOf+' 确认':'');if(record.type==='books')return (d.month||'月份待补')+' · 账务资料';if(record.type==='plan')return (d.payee||'付款对象待补')+' · '+money(d.amount)+(d.repeat?' · 每月':'');return (d.date||'日期待补')+' · 资产负债资料';}
    function recordsHTML(){
      const records=S.read(options.getProject()).records.slice().sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
      return `<p class="ys-sup-intro">填过的资料都在这里，可以继续补充或修改。</p><div class="ys-sup-new"><label class="ys-sup-field"><span>添加资料</span><select id="ys-sup-new-type">${['ar','balance','books','plan','assets'].map(t=>`<option value="${t}">${titles[t]}</option>`).join('')}</select></label><button type="button" data-sup-new>添加</button></div>${canUndo&&options.onUndo?'<div class="ys-sup-undo" role="status"><span>已删除这份补录资料</span><button type="button" data-sup-undo>撤销删除</button></div>':''}<p id="ys-sup-error" class="ys-sup-error" role="alert" hidden></p>${records.length?records.map(r=>`<article class="ys-sup-record"><div class="ys-sup-record-top"><strong>${esc(titles[r.type]||r.type)}</strong><span class="ys-sup-badge">${r.status==='ready'?'已保存':'已保存 · 待补充'}</span></div><p>${esc(summary(r))}</p><div class="ys-sup-record-actions"><button type="button" data-sup-edit="${esc(r.id)}">编辑</button><button type="button" class="ys-sup-delete" data-sup-delete="${esc(r.id)}">删除</button></div></article>`).join(''):'<div class="ys-sup-empty"><strong>还没有补录资料</strong><p>需要时再补，不影响查看已有账单。</p></div>'}`;
    }
    function receipts(){return (ctx.receipts||[]).filter(r=>!r.linkedRecordId||r.linkedRecordId===recordId);}
    function renderReceipts(){
      const target=q('#ys-sup-receipts');if(!target)return;
      const all=receipts(),needle=search.trim().toLowerCase(),matches=all.filter(r=>!needle||[r.counterparty,r.account,r.date,r.amount].join(' ').toLowerCase().includes(needle));
      const selected=all.filter(r=>linked.has(r.key)),candidates=matches.filter(r=>!linked.has(r.key)).slice(0,12);
      const missing=[...linked].filter(key=>!all.some(r=>r.key===key));
      target.innerHTML=selected.concat(candidates).map(r=>`<label class="ys-sup-receipt"><input type="checkbox" data-sup-receipt="${esc(r.key)}" ${linked.has(r.key)?'checked':''}><span><span class="ys-sup-receipt-line"><strong>${esc(r.counterparty||'未填写交易对象')}</strong><b>${money(r.amount)}</b></span><small>${esc(r.date)} · ${esc(r.account)}</small></span></label>`).join('')+missing.map(key=>`<div class="ys-sup-missing"><span>原关联流水已不可用</span><button type="button" data-sup-unlink="${esc(key)}">取消关联</button></div>`).join('')+(!selected.length&&!candidates.length&&!missing.length?'<p class="ys-sup-note">'+(needle?'没有找到匹配的到账流水':'暂时没有可关联的到账流水')+'</p>':'')+(matches.length>12?'<p class="ys-sup-note">可输入客户、金额或日期查找更多流水。</p>':'');
      target.querySelectorAll('[data-sup-receipt]').forEach(el=>el.onchange=()=>{const key=el.dataset.supReceipt;el.checked?linked.add(key):linked.delete(key);renderReceipts();live();Array.from(target.querySelectorAll('[data-sup-receipt]')).find(input=>input.dataset.supReceipt===key)?.focus();});
      target.querySelectorAll('[data-sup-unlink]').forEach(el=>el.onclick=()=>{linked.delete(el.dataset.supUnlink);renderReceipts();live();});
    }
    const value=name=>q(`[name="${name}"]`)?.value?.trim()||'';
    const number=name=>value(name)===''?null:Number(value(name));
    const checked=name=>!!q(`[name="${name}"]`)?.checked;
    function collect(){
      if(type==='ar'){const basis=value('basis')||data.basis||'outstanding';return {mode:'entry',basis,snapshotAsOf:basis==='outstanding'?ctx.asOf:'',customer:value('customer'),business:value('business'),amount:number('amount'),date:value('date'),dueDate:value('dueDate'),receiptKeys:basis==='outstanding'?[]:[...linked],complete:checked('complete')};}
      if(type==='balance')return {date:value('date'),accounts:data.accounts.map((row,index)=>({account:row.account,amount:number('account-'+index)??0}))};
      if(type==='books')return {month:value('month'),...Object.fromEntries(['revenue','cost','expenses','tax'].map(key=>[key,number(key)]))};
      if(type==='plan')return {date:value('date'),payee:value('payee'),category:value('category'),amount:number('amount'),repeat:checked('repeat')};
      if(type==='assets')return {date:value('date'),...Object.fromEntries(assets.map(key=>[key,number(key)]))};
      return {};
    }
    function live(){
      if(!q('#ys-sup-form'))return;
      const d=collect();
      if(type==='ar'){const total=d.basis==='outstanding'?0:receipts().filter(r=>linked.has(r.key)).reduce((n,r)=>n+r.amount,0),el=q('#ys-sup-ar-result');el.hidden=d.amount===null;el.innerHTML='<span>这笔还没收回</span><strong>'+money(d.amount===null?null:d.amount-total)+'</strong>'+(total?'<small>已关联到账 '+money(total)+'</small>':'')+(d.basis==='outstanding'?'<small>截至 '+esc(ctx.asOf)+(d.dueDate?'':' · 到账日未约定')+'</small>':'');}
      if(type==='balance'){const el=q('#ys-sup-balance-result'),total=d.accounts.reduce((n,r)=>n+r.amount,0);el.hidden=!d.accounts.length;el.innerHTML='<span>账户余额合计</span><strong>'+money(total)+'</strong><small>截至 '+esc(d.date)+' · '+d.accounts.length+' 个账户 · 留空按 0 计入</small>'+(balanceSuggestions?.aggregate&&Number.isFinite(balanceSuggestions.total)&&Math.abs(total-balanceSuggestions.total)>.005?'<small class="ys-sup-aggregate-change">保存后将按以上账户合计 '+money(total)+' 计算</small>':''); }
      if(type==='books'){const full=['revenue','cost','expenses','tax'].every(key=>d[key]!==null),el=q('#ys-sup-books-result');el.hidden=!full;el.innerHTML='<span>本月账务净利润</span><strong>'+money(full?d.revenue-d.cost-d.expenses-d.tax:null)+'</strong>';}
    }
    function hasContent(d){if(type==='ar')return !!(d.mode==='none'||d.customer||d.business||d.amount!==null||d.dueDate||d.receiptKeys?.length);if(type==='balance')return d.accounts.some(r=>r.amount!==null);if(type==='books')return ['revenue','cost','expenses','tax'].some(key=>d[key]!==null);if(type==='plan')return !!(d.payee||d.category||d.amount!==null||d.date);if(type==='assets')return assets.some(key=>d[key]!==null);return false;}
    function showError(message){const el=q('#ys-sup-error');if(el){el.textContent=message;el.hidden=false;el.scrollIntoView?.({block:'nearest'});}}
    function working(active){busy=active;content.querySelectorAll('button,input,select').forEach(el=>el.disabled=active);const save=q('#ys-sup-save');if(save)save.textContent=active?'正在保存…':'保存';dialog.setAttribute('aria-busy',String(active));}
    async function save(override){
      if(busy)return;
      const next=override||collect();
      if(accountingImport(next)){showError('这个期间已有导入账务，无需重复补录；也可以选择其他期间。');return;}
      if(!hasContent(next)){showError('先填一项已知资料就可以保存，其他内容可留空。');return;}
      working(true);
      try{await options.onSave({id:recordId,type,data:next});canUndo=false;working(false);close();}
      catch(error){working(false);showError(error?.message||'暂时未能保存，请再试一次。');}
    }
    function bind(){
      content.querySelectorAll('[data-sup-close]').forEach(el=>el.onclick=close);
      const form=q('#ys-sup-form');if(form){form.onsubmit=event=>{event.preventDefault();return save();};form.querySelectorAll('input').forEach(el=>{if(el.id==='ys-sup-search')return;el.oninput=live;el.onchange=live;});}
      const searchInput=q('#ys-sup-search');if(searchInput)searchInput.oninput=()=>{search=searchInput.value;renderReceipts();};
      const basis=q('[name="basis"]');if(basis)basis.onchange=()=>{data={...collect(),amount:null,receiptKeys:[]};linked.clear();basisNotice='金额口径已切换，请填写对应的金额。';render();const details=q('.ys-sup-more');if(details)details.open=true;q('[name="amount"]')?.focus();};
      const balanceDate=type==='balance'&&q('[name="date"]');if(balanceDate)balanceDate.onchange=()=>{const date=balanceDate.value,stored=S.read(options.getProject()).records.find(r=>r.type==='balance'&&r.data.date===date);recordId=stored?.id||makeId();data=stored?copy(stored.data):{date,accounts:data.accounts.map(row=>({account:row.account,amount:null}))};for(const account of ctx.accounts||[])if(!data.accounts.some(row=>row.account===account))data.accounts.push({account,amount:null});prefillBalances();render();q('[name="date"]')?.focus();};
      const accountingDate=['books','assets'].includes(type)&&q(type==='books'?'[name="month"]':'[name="date"]');if(accountingDate)accountingDate.onchange=()=>{const key=type==='books'?'month':'date',selected=accountingDate.value,stored=S.read(options.getProject()).records.find(r=>r.type===type&&r.data[key]===selected);recordId=stored?.id||makeId();data=stored?copy(stored.data):{...emptyData(type),[key]:selected};prefillAccounting();render();q(`[name="${key}"]`)?.focus();};
      const none=q('[data-sup-none]');if(none)none.onclick=()=>save({mode:'none',date:ctx.asOf||data.date||''});
      const add=q('[data-sup-new]');if(add)add.onclick=()=>open(q('#ys-sup-new-type').value);
      content.querySelectorAll('[data-sup-edit]').forEach(el=>el.onclick=()=>{const r=S.read(options.getProject()).records.find(r=>r.id===el.dataset.supEdit);if(r)open(r.type,r.id);});
      content.querySelectorAll('[data-sup-delete]').forEach(el=>el.onclick=async()=>{if(busy)return;working(true);try{const result=await options.onDelete(el.dataset.supDelete);canUndo=!!result?.canUndo;working(false);ctx=context();render();}catch(error){working(false);showError(error?.message||'暂时未能删除，请再试一次。');}});
      const undo=q('[data-sup-undo]');if(undo)undo.onclick=async()=>{if(busy||!options.onUndo)return;working(true);try{await options.onUndo();canUndo=false;working(false);ctx=context();render();}catch(error){working(false);showError(error?.message||'暂时未能恢复，请再试一次。');}};
    }
    dialog.oncancel=event=>{if(busy){event.preventDefault();return;}previousFocus?.focus?.();};
    dialog.onclose=()=>{if(!closing)previousFocus?.focus?.();};
    return Object.freeze({open,close,refresh,get isOpen(){return !!dialog.open;}});
  }
  root.YoushuSupplementUI=Object.freeze({create});
})(typeof globalThis!=='undefined'?globalThis:this);
