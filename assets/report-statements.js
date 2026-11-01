/* One statement presentation for the fixed example and every supplied ledger.
 * Money in the public API is in yuan; the shared view displays ten-thousands. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.YoushuReportStatements=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const finite=v=>typeof v==='number'&&Number.isFinite(v),round=v=>Math.round((v+Number.EPSILON)*100)/100;
  const sum=(rows,get)=>round(rows.reduce((n,r)=>n+(Number(get(r))||0),0));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>finite(v)?(v/10000).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
  const pad=v=>String(v).padStart(2,'0');
  const monthEnd=(year,month)=>new Date(Date.UTC(year,month,0)).toISOString().slice(0,10);
  function normalizeRows(rows){return (rows||[]).map((r,i)=>Array.isArray(r)?{id:String(i),label:r[0],current:r[1],previous:r[2],kind:r[3]||'',group:r[1]===null&&r[2]===null&&r[3]==='group'}:{...r,id:r.id||String(i)});}
  function renderPrepared(spec,options={}){
    const prefix=options.prefix==='q'?'q':'rt',attr=options.detailAttribute==='data-detail'?'data-detail':'data-statement-row',rows=normalizeRows(spec.rows),key=spec.key||'profit';
    return `<div class="${prefix}-report-title"><h3>${esc(spec.title)}</h3><p>${esc(spec.company)} · ${esc(spec.period)}</p></div><div class="${prefix}-row ${prefix}-small" style="margin-bottom:8px"><span>${esc(spec.note)}</span><span>单位：人民币万元</span></div><div class="${prefix}-statement-wrap"><table class="${prefix}-statement" aria-label="${esc(spec.title)}"><thead><tr><th>项目</th><th class="${prefix}-num">${esc(spec.heads?.[0]||'本年累计')}</th><th class="${prefix}-num">${esc(spec.heads?.[1]||'上年同期')}</th><th class="${prefix}-num">变动额</th></tr></thead><tbody>${rows.map((r,i)=>r.group?`<tr class="${prefix}-statement-group"><td colspan="4">${esc(r.label)}</td></tr>`:`<tr ${attr}="${attr==='data-detail'?'statement:':''}${esc(key)}:${i}" tabindex="0" role="button" aria-label="${esc(r.label)}，查看计算明细" class="${r.kind?prefix+'-statement-'+esc(r.kind):''}"><td>${esc(r.label)}</td><td class="${prefix}-num">${money(r.current)}</td><td class="${prefix}-num">${money(r.previous)}</td><td class="${prefix}-num">${finite(r.current)&&finite(r.previous)?(round(r.current-r.previous)>0?'+':'')+money(round(r.current-r.previous)):'—'}</td></tr>`).join('')}</tbody></table></div>${spec.comparisonNote?`<p class="${prefix}-small ${prefix}-statement-note">${esc(spec.comparisonNote)}</p>`:''}`;
  }
  function periods(model){
    const asOf=/^\d{4}-\d{2}-\d{2}$/.test(model.asOf||'')?model.asOf:null,year=asOf?Number(asOf.slice(0,4)):null,month=asOf?Number(asOf.slice(5,7)):null;
    return {asOf,year,month,start:year?year+'-01-01':null,previousStart:year?(year-1)+'-01-01':null,previousEnd:year?`${year-1}-${pad(month)}-${pad(Math.min(Number(asOf.slice(8)),Number(monthEnd(year-1,month).slice(8))))}`:null,period:year?`${year}年1—${month}月`:'期间待补充'};
  }
  function sourceData(model){return {cash:model.periodSource?.cash||model.rawTransactions||[],profit:model.periodSource?.profit||model.profit||[],invoices:model.periodSource?.invoices||model.statementInvoices||[],balances:model.balanceHistory||[]};}
  function rowsInYear(rows,year,month,dateField='month'){return rows.filter(r=>String(r[dateField]||'').slice(0,4)===String(year)&&Number(String(r[dateField]).slice(5,7))<=month);}
  function completedMonths(rows,year,month){const months=new Set(rows.map(r=>r.month));return Array.from({length:month},(_,i)=>year+'-'+pad(i+1)).every(k=>months.has(k));}
  function row(id,label,current,previous,kind=''){return {id,label,current:finite(current)?round(current):null,previous:finite(previous)?round(previous):null,kind};}
  const group=(id,label)=>({id,label,current:null,previous:null,kind:'group',group:true});
  function incomeComponents(model,year,month,total,range=null){
    if(!finite(total))return [];
    const personal=['personal','investor'].includes(model.family),choose=(rows,field)=>range?rows.filter(r=>r[field]>=range.start&&r[field]<=range.end&&(!range.monthKeys||range.monthKeys.includes(String(r[field]).slice(0,7)))):rowsInYear(rows,year,month,field),source=personal?choose(model.periodSource?.cash||model.rawTransactions||[],'date').filter(r=>r.activity==='operating'&&r.inflow>0):choose((model.periodSource?.invoices||model.statementInvoices||[]).map(r=>({...r,recognition:r.recognitionDate||r.invoiceDate})),'recognition');
    if(!source.length)return [];
    const by=new Map();for(const item of source){const name=item.category||'其他收入';by.set(name,round((by.get(name)||0)+(personal?item.inflow:item.amount)));}
    const components=Array.from(by,([label,amount])=>({label,amount})).sort((a,b)=>b.amount-a.amount||a.label.localeCompare(b.label,'zh-CN'));
    return Math.abs(sum(components,r=>r.amount)-total)<=.02?components:[];
  }
  function profitStatement(model,p,data){
    const family=model.family||'business',personal=family!=='business',investor=family==='investor',current=model.period?model.profit:rowsInYear(data.profit,p.year,p.month),previous=model.period?model.previousPeriod.profit:rowsInYear(data.profit,p.year-1,p.month),has=current.length>0,currentComplete=model.period?new Set(current.map(r=>r.month)).size===model.period.months:!!p.year&&completedMonths(current,p.year,p.month),priorComplete=currentComplete&&(model.period?model.previousPeriod.profitComplete:completedMonths(previous,p.year-1,p.month));
    const amount=(list,key,known)=>known?sum(list,r=>r[key]):null,cur={},prev={};for(const key of ['revenue','cost','expenses','tax']){cur[key]=amount(current,key,has);prev[key]=amount(previous,key,priorComplete);}
    for(const o of [cur,prev]){o.gross=finite(o.revenue)?round(o.revenue-o.cost):null;o.before=finite(o.revenue)?round(o.revenue-o.cost-o.expenses):null;o.net=finite(o.before)?round(o.before-o.tax):null;}
    const labels=investor?['一、已实现收益收入','减：已实现亏损','扣除已实现亏损后收益','减：投资费用','二、已实现收益结余','三、税前已实现净收益','四、已实现净收益']:personal?['一、税后与副业收入','减：副业成本','扣除副业成本后收入','减：生活支出','二、收支结余','三、另列税费前结余','四、收支结余']:['一、营业收入','减：营业成本','毛利','减：期间费用','二、营业利润','三、利润总额','四、净利润'];
    const rows=[row('revenue',labels[0],cur.revenue,prev.revenue,'group')],components=incomeComponents(model,p.year,p.month,cur.revenue,model.period),oldComponents=incomeComponents(model,p.year-1,p.month,prev.revenue,model.period?{start:model.period.previousStart,end:model.period.previousEnd,monthKeys:model.previousPeriod?.monthKeys}:null),oldMap=new Map(oldComponents.map(r=>[r.label,r.amount]));
    components.forEach((c,i)=>rows.push(row('revenue-part-'+i,(i===0?'其中：':'')+c.label,c.amount,priorComplete&&oldComponents.length?(oldMap.get(c.label)||0):null,'child')));
    rows.push(row('cost',labels[1],cur.cost,prev.cost),row('gross',labels[2],cur.gross,prev.gross,'total'),row('expenses',labels[3],cur.expenses,prev.expenses),row('operating',labels[4],cur.before,prev.before,'total'),row('before-tax',labels[5],cur.before,prev.before,'total'),row('tax',personal?'减：另行列支税费':'减：所得税费用',cur.tax,prev.tax),row('net-profit',labels[6],cur.net,prev.net,'final'));
    const complete=currentComplete,notes=[];if(model.period?.hasGaps)notes.push('按有数据的月份汇总：'+model.period.monthKeys.join('、')+'；跳过缺月。');
    if(!has)notes.push('尚未提供该期间的账务资料，不能由现金收支推算利润。');else if(!complete)notes.push('本年累计仅包含已提供且截止日已结束的账务月份：'+current.map(r=>r.month).join('、')+'。');
    if(!priorComplete)notes.push('未提供完整上年同期账务数据，比较栏及变动额显示“—”。');
    if(personal)notes.push(investor?'只计已实现损益与费用，本金买卖和未实现涨跌不计入收益。':'工资按税后到账记录，副业及生活支出按实际收付记录。');
    return {key:'profit',title:'利润表',company:model.company||'我的报告',period:model.period?.label||p.period,heads:model.period?['本期合计','上期合计']:['本年累计','上年同期'],rows,note:personal?'个人收支口径 · 管理展示格式':'权责发生制 · 管理展示格式',comparisonNote:notes.join(' ').replaceAll(model.period?'本年累计':'\u0000','本期合计').replaceAll(model.period?'上年同期':'\u0000','前一等长期间').replaceAll(model.period?'本年期初':'\u0000','本期期初')};
  }
  function computedBalance(b){
    if(!b)return null;const fields=['cash','receivables','inventory','fixedAssets','otherAssets','payables','taxPayable','debt','otherLiabilities','capital','retainedEarnings'];
    const o={...b};for(const key of fields)if(!finite(o[key]))o[key]=null;
    const add=keys=>keys.every(k=>finite(o[k]))?round(keys.reduce((n,k)=>n+o[k],0)):null;
    o.currentAssets=add(['cash','receivables','inventory']);o.assets=add(['cash','receivables','inventory','fixedAssets','otherAssets']);o.liabilities=add(['payables','taxPayable','debt','otherLiabilities']);o.equity=add(['capital','retainedEarnings']);o.liabilitiesEquity=add(['liabilities','equity']);return o;
  }
  function balanceStatement(model,p,data){
    const current=computedBalance(model.balance),date=current?.date||p.asOf,year=date?Number(date.slice(0,4)):p.year,priorDate=model.period?.openingDate||(year?(year-1)+'-12-31':null),previous=computedBalance(data.balances.find(r=>r.date===priorDate)),personal=['personal','investor'].includes(model.family),investor=model.family==='investor';
    const rows=[],add=(id,label,kind='')=>rows.push(row(id,label,current?.[id],previous?.[id],kind));
    rows.push(group('assets-group','资产'));add('cash','货币资金');add('receivables','应收账款');add('inventory','存货');add('currentAssets','流动资产合计','total');add('fixedAssets','固定资产净值');add('otherAssets',investor?'持仓资产成本':'其他资产');add('assets','资产总计','final');
    rows.push(group('liabilities-group','负债'));add('payables','应付账款');add('taxPayable',personal?'待付税费':'应交税费');add('debt',personal?'借款余额':'借款');add('otherLiabilities','其他负债');add('liabilities','负债合计','total');
    rows.push(group('equity-group',personal?'净资产':'所有者权益'));add('capital',personal?'期初本金与追加投入':'实收资本');add('retainedEarnings',investor?'累计已实现净收益':personal?'累计收支结余':'未分配利润');add('equity',personal?'净资产合计':'所有者权益合计','total');add('liabilitiesEquity',personal?'负债与净资产总计':'负债与所有者权益总计','final');
    const notes=[];if(!current)notes.push('尚未提供资产负债资料，余额显示“—”。');if(!previous)notes.push('未提供'+(priorDate||'上年末')+'资产负债快照，期初比较栏及变动额显示“—”。');if(current&&p.asOf&&current.date!==p.asOf)notes.push('使用最近已提供的 '+current.date+' 快照，不推算到报告截止日。');if(investor)notes.push('持仓按成本列示，未计市场估值浮动。');
    return {key:'balance',title:'资产负债表',company:model.company||'我的报告',period:date?date.replace(/^(\d{4})-(\d{2})-(\d{2})$/,(_,y,m,d)=>`${y}年${Number(m)}月${Number(d)}日`):'日期待补充',heads:['期末余额',model.period?'期初余额':'年初余额'],rows,note:personal?'资产＝负债＋净资产':'资产＝负债＋所有者权益',comparisonNote:notes.join(' ').replaceAll(model.period?'本年累计':'\u0000','本期合计').replaceAll(model.period?'上年同期':'\u0000','前一等长期间').replaceAll(model.period?'本年期初':'\u0000','本期期初')};
  }
  function cashOpening(model,start){
    if(!start)return null;
    if(model.period&&start===model.period.start)return model.totals.openingCash;
    const originalOpening=model.periodSource?.openingCash??model.totals?.openingCash;
    const previousDay=new Date(Date.parse(start+'T00:00:00Z')-86400000).toISOString().slice(0,10),snapshot=(model.balanceHistory||[]).find(row=>row.date===previousDay);
    if(finite(snapshot?.cash))return snapshot.cash;
    // An opening cash amount without an effective date belongs to the supplied
    // ledger, not necessarily January 1. Earlier profit/AR months are no proof.
    if(!finite(originalOpening)||!model.openingDate||model.openingDate>=start)return null;
    return round(originalOpening+sum((model.periodSource?.cash||model.rawTransactions||[]).filter(r=>r.date>model.openingDate&&r.date<start),r=>r.inflow-r.outflow));
  }
  function cashStatement(model,p,data){
    const personal=['personal','investor'].includes(model.family),investor=model.family==='investor',unclassified=model.isStatement===true;
    const current=model.period?model.rawTransactions:data.cash.filter(r=>p.start&&r.date>=p.start&&r.date<=p.asOf),previous=model.period?model.previousPeriod.cash:data.cash.filter(r=>p.previousStart&&r.date>=p.previousStart&&r.date<=p.previousEnd);
    const currentComplete=!!p.year&&(model.period?(model.period.cashComplete??model.monthly.length===model.period.months):completedMonths(current.map(r=>({month:r.date.slice(0,7)})),p.year,p.month)),declared=model.openingDate,priorComplete=currentComplete&&!!p.previousStart&&model.asOf>=p.previousEnd&&(model.period?model.previousPeriod.cashComplete:!!declared&&declared<p.previousStart&&completedMonths(previous.map(r=>({month:r.date.slice(0,7)})),p.year-1,p.month)),has=model.availability?.cash===true&&(current.length>0||model.period?.cashKnown===true);
    const aggregate=(rows,known,start,complete)=>{
      const o={};for(const activity of ['operating','investing','financing','transfer']){const a=rows.filter(r=>r.activity===activity);o[activity+'In']=known&&!unclassified?sum(a,r=>r.inflow):null;o[activity+'Out']=known&&!unclassified?sum(a,r=>r.outflow):null;o[activity+'Net']=known&&!unclassified?sum(a,r=>r.inflow-r.outflow):null;}
      o.cashIn=known?sum(rows,r=>r.inflow):null;o.cashOut=known?sum(rows,r=>r.outflow):null;o.net=known?sum(rows,r=>r.inflow-r.outflow):null;o.opening=known?cashOpening(model,start):null;o.closing=complete&&finite(o.opening)&&finite(o.net)?round(o.opening+o.net):null;return o;
    },cur=aggregate(current,has,p.start,currentComplete&&(model.period?.balanceBridgeComplete??true)),prev=aggregate(previous,priorComplete,p.previousStart,priorComplete&&(model.previousPeriod?.balanceBridgeComplete??true)),rows=[],add=(id,label,kind='')=>rows.push(row(id,label,cur[id],prev[id],kind));
    rows.push(group('operating-group',unclassified?'一、原始账单收支（待分类）':investor?'一、已实现收益与费用现金流量':personal?'一、收入与日常支出现金流量':'一、经营活动现金流量'));
    if(unclassified){add('cashIn','原始记录收款');add('cashOut','原始记录付款');add('net','原始收支差额','total');}
    else{add('operatingIn',investor?'已实现收益收到的现金':personal?'工资及副业收到的现金':'销售商品、提供劳务及其他经营收到的现金');add('operatingOut',investor?'投资费用与已实现亏损':personal?'生活与副业支付的现金':'经营活动支付的现金');add('operatingNet',personal?'收支现金流量净额':'经营活动现金流量净额','total');}
    rows.push(group('investing-group','二、投资活动现金流量'));add('investingIn',investor?'卖出收回的本金':'处置资产等收到的现金');add('investingOut',investor?'买入投资支付的本金':'购建资产等支付的现金');add('investingNet','投资活动现金流量净额','total');
    rows.push(group('financing-group','三、筹资活动现金流量'));add('financingIn',personal?'追加本金及借款收到的现金':'吸收投资、借款收到的现金');add('financingOut',personal?'提取本金、偿还借款支付的现金':'偿还债务、分配利润支付的现金');add('financingNet','筹资活动现金流量净额','total');
    if(current.some(r=>r.activity==='transfer')||previous.some(r=>r.activity==='transfer'))add('transferNet','内部转账净变动（待核对）');
    add('net',unclassified?'四、原始账单收支差额':'四、现金及现金等价物净增加额','total');add('opening','加：期初现金及现金等价物余额');add('closing','五、期末现金及现金等价物余额','final');
    const notes=[];if(model.period?.hasGaps)notes.push('按有数据的月份汇总：'+model.period.monthKeys.join('、')+'；跳过缺月。');if(!has)notes.push('尚未提供该期间现金流水，金额显示“—”。');else if(!currentComplete)notes.push('本年累计仅汇总已提供的流水，月份覆盖不完整，期末现金不作推算。');if(!priorComplete)notes.push('未提供完整上年同期现金流水，比较栏及变动额显示“—”。');if(!finite(cur.opening))notes.push('未确认本年期初现金，期初和期末余额不由流水差额代替。');if(unclassified)notes.push('原始账单尚未完成经营、投资、筹资分类，活动分类行不自动填零。');if(investor)notes.push('买卖结算拆分本金与已实现损益，不重复计入收入或费用；本表不是投资收益预测。');
    return {key:'cash',title:'现金流量表',company:model.company||'我的报告',period:model.period?.label||p.period,heads:model.period?['本期合计','上期合计']:['本年累计','上年同期'],rows,note:unclassified?'原始账单收付 · 活动分类待补充':'现金收付口径 · 直接法简表',comparisonNote:notes.join(' ').replaceAll(model.period?'本年累计':'\u0000','本期合计').replaceAll(model.period?'上年同期':'\u0000','前一等长期间').replaceAll(model.period?'本年期初':'\u0000','本期期初')};
  }
  function build(model){model=model||{};const p=periods(model),data=sourceData(model);if(model.period)Object.assign(p,{start:model.period.start,previousStart:model.period.previousStart,previousEnd:model.period.previousEnd,period:model.period.label});const result={profit:profitStatement(model,p,data),balance:balanceStatement(model,p,data),cash:cashStatement(model,p,data)};if(model.receiptPolicy){result.profit.note+=' · 独立账务口径';result.profit.comparisonNote+=' 账务利润按已提供的账务资料计算，投资损益等按原账务列示，不计入看板的收入和支出。';result.cash.comparisonNote+=' 本表完整保留实际资金流，包括不计入看板收支的投资理财、信用还款、他人代付及本人资金互转；原始活动分类与看板排除原因分别保留。';}return result;}
  function render(model,key='profit',options={}){return renderPrepared(build(model)[key]||build(model).profit,options);}
  function rowDetail(model,key,index){const spec=build(model)[key],r=spec?.rows[Number(index)];if(!r||r.group)return null;return {title:spec.title+' · '+r.label,headers:['项目','金额（元）'],rows:[[spec.heads[0],r.current??'待补充'],[spec.heads[1],r.previous??'待补充'],['变动额',finite(r.current)&&finite(r.previous)?round(r.current-r.previous):'待补充']],note:spec.company+' · '+spec.period+'。'+(spec.comparisonNote||spec.note)};}
  return Object.freeze({build,render,renderPrepared,rowDetail});
});
