/* Optional manual records. Source imports and cash movements are never edited.
 * A partial form remains a draft; zero only means an explicitly supplied zero. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./data-engine.js'));
  else root.YoushuSupplements=factory(root.YoushuData);
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
  'use strict';
  const TYPES=['balance','ar','books','plan','assets'];
  const BOOKS=['revenue','cost','expenses','tax'];
  const ASSETS=['cash','receivables','inventory','fixedAssets','otherAssets','payables','taxPayable','debt','otherLiabilities','capital','retainedEarnings'];
  const clone=v=>JSON.parse(JSON.stringify(v)),round=n=>Math.round(n*100)/100;
  const text=v=>String(v??'').trim();
  function fail(message){const e=Error(message);e.code='INVALID_SUPPLEMENT';throw e;}
  function word(v){const s=text(v);if(s.length>500)fail('填写内容请控制在 500 字以内。');return s;}
  function date(v){const s=text(v);if(s&&(!/^\d{4}-\d{2}-\d{2}$/.test(s)||D.parseDate(s)!==s))fail('请填写有效日期。');return s;}
  function month(v){const s=text(v);if(s&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(s))fail('请选择有效月份。');if(s)D.monthEnd(s);return s;}
  function amount(v,signed=false){if(v===null||v===undefined||text(v)==='')return null;try{return D.parseMoney(v,{nonNegative:!signed});}catch{fail(signed?'请填写有效金额。':'金额请填 0 或正数，不知道可以留空。');}}
  function normalize(record){
    if(!record||typeof record!=='object'||!TYPES.includes(record.type))fail('补录资料类型不正确。');
    if(record.data!==undefined&&(!record.data||typeof record.data!=='object'||Array.isArray(record.data)))fail('补录字段格式不正确。');
    const d=record.data||{},type=record.type;let data;
    if(type==='balance'){
      if(d.accounts!==undefined&&!Array.isArray(d.accounts))fail('账户余额格式不正确。');
      const accounts=(d.accounts||[]).map(a=>({account:word(a.account),amount:amount(a.amount,true)}));
      if(accounts.length>200||accounts.some(a=>!a.account)||new Set(accounts.map(a=>a.account)).size!==accounts.length)fail('请为每个账户保留一个不同的名称。');
      data={date:date(d.date),accounts};
    }else if(type==='ar'){
      if(d.receiptKeys!==undefined&&!Array.isArray(d.receiptKeys))fail('关联流水格式不正确。');
      data={mode:d.mode==='none'?'none':'entry',basis:d.basis==='outstanding'?'outstanding':'total',snapshotAsOf:date(d.snapshotAsOf),date:date(d.date),customer:word(d.customer),business:word(d.business),amount:amount(d.amount),dueDate:date(d.dueDate),receiptKeys:[...new Set((d.receiptKeys||[]).map(text))],complete:d.complete===true,completeAsOf:d.complete===true?date(d.completeAsOf):''};
      if(data.basis==='outstanding'&&data.receiptKeys.length)fail('当前未收金额已扣除到账款，请不要再次关联抵扣；也可以改为填写应收总额。');
      if(data.receiptKeys.length>500)fail('关联流水数量过多，请分笔补充。');
      if(data.date&&data.dueDate&&data.dueDate<data.date)fail('约定到账日不能早于业务日期。');
      if(data.amount===0&&data.mode!=='none'&&data.basis!=='outstanding')fail('这笔应收总额应大于 0，没有应收可选择“确认没有”。');
    }else if(type==='books')data={month:month(d.month),...Object.fromEntries(BOOKS.map(k=>[k,amount(d[k])]))};
    else if(type==='assets')data={date:date(d.date),...Object.fromEntries(ASSETS.map(k=>[k,amount(d[k],k==='retainedEarnings')]))};
    else data={date:date(d.date),payee:word(d.payee),category:word(d.category),amount:amount(d.amount),repeat:d.repeat===true};
    const id=word(record.id);if(!id||id.length>200)fail('补录记录编号无效。');
    return {id,type,data,updatedAt:text(record.updatedAt)||new Date().toISOString()};
  }
  function raw(project){
    if(!project.supplements)return [];
    if(project.supplements.version!==1||!Array.isArray(project.supplements.records)||project.supplements.records.length>2000)fail('补录资料格式无效。请保留原备份。');
    const rows=project.supplements.records.map(normalize);if(new Set(rows.map(r=>r.id)).size!==rows.length)fail('补录记录编号重复。');
    const periods=new Set();let magnitude=0;
    for(const r of rows){
      const key=r.type+':'+(r.data.month||r.data.date||'');
      if(['books','balance','assets'].includes(r.type)&&(r.data.month||r.data.date)){if(periods.has(key))fail('同一期间的补录记录重复，请核对备份。');periods.add(key);}
      const values=r.type==='balance'?r.data.accounts.map(a=>a.amount):Object.values(r.data).filter(v=>typeof v==='number');
      for(const value of values)if(value!==null){magnitude+=Math.abs(Math.round(value*100));if(!Number.isSafeInteger(magnitude))fail('补录金额总规模过大，请拆分账本后保存。');}
    }
    return rows;
  }
  function bill(project){return project.ledgerStatement||project.alipayStatement||project.wechatStatement;}
  function sourceRecords(project){const s=bill(project);return (project.cash||[]).concat(s?.neutralRows||[],s?.zeroRows||[]);}
  function anchor(project,records=[]){
    const dates=sourceRecords(project).map(r=>r.date).concat((project.profit||[]).map(r=>D.monthEnd(r.month)),(project.balance||[]).map(r=>r.date),(project.ar||[]).map(r=>r.invoiceDate),(project.ledger?.imports||[]).map(b=>b.statement?.end||b.bankStatement?.end)).filter(Boolean).sort();
    if(dates.length)return D.monthEnd(dates.at(-1).slice(0,7));
    if(project.asOf)return project.asOf;
    const supplementary=records.filter(r=>r.type!=='plan').map(r=>r.data.snapshotAsOf||r.data.date||(r.data.month?D.monthEnd(r.data.month):'')).filter(Boolean).sort();
    return supplementary.at(-1)||'';
  }
  function receiptKey(row,index){return JSON.stringify(row.id&&row.id!=='/'?['id',row.sourceType||'generic',row.account,row.id,row.date,row.inflow]:['row',row.sourceImportId||'',row.sourceRow??index,row.account,row.date,row.counterparty,row.category,row.inflow,row.outflow]);}
  function receiptsOf(project){return (project.cash||[]).map((row,index)=>({key:receiptKey(row,index),date:row.date,account:row.account,counterparty:row.counterparty||'',amount:row.inflow,sourceImportId:row.sourceImportId||''})).filter(r=>r.amount>0);}
  function assess(record,project,records,asOf){
    const d=record.data,issues=[],receiptMap=new Map(receiptsOf(project).map(r=>[r.key,r]));let received=0,linked=[];
    const need=(condition,message)=>{if(!condition)issues.push(message);};
    if(record.type==='ar'){
      const snapshot=d.basis==='outstanding'&&d.mode!=='none';
      need(snapshot?!!d.snapshotAsOf:!!d.date,snapshot?'待确认应收余额日期':'待补业务日期');
      if(d.mode!=='none'){
        need(!!d.customer,'待补客户');need(d.amount!==null,'待补应收金额');if(!snapshot)need(!!d.dueDate,'未填回款日');
        for(const key of d.receiptKeys){const row=receiptMap.get(key);if(!row){issues.push('关联流水已移除，请重新核对');continue;}linked.push(row);received=round(received+row.amount);if(asOf&&row.date>asOf)issues.push('关联流水超出报告期间');if(d.date&&row.date<d.date)issues.push('关联流水早于业务日期，请核对');if(records.some(r=>r.id!==record.id&&r.type==='ar'&&r.data.mode!=='none'&&r.data.receiptKeys.includes(key)))issues.push('这笔到账已关联其他应收款');}
        if(d.amount!==null&&received>d.amount)issues.push('已到账金额超过应收总额');
      }
      if(asOf&&d.date>asOf)issues.push('业务日期晚于报告截止日');
      if(snapshot&&asOf&&d.snapshotAsOf>asOf)issues.push('应收余额日期晚于报告截止日');
    }else if(record.type==='balance'){
      need(!!d.date,'待补余额日期');need(d.accounts.length>0,'待补账户');need(d.accounts.length>0&&d.accounts.every(a=>a.amount!==null),'还有账户余额待确认');
      const known=[...new Set(sourceRecords(project).map(r=>r.account).filter(Boolean))];
      need(known.every(account=>d.accounts.some(a=>a.account===account&&a.amount!==null)),'还有已上传账户的余额待确认');
    }else if(record.type==='books'){
      need(!!d.month,'待补账务月份');need(BOOKS.every(k=>d[k]!==null),'还有账务金额待补充');
      if((project.profit||[]).some(row=>row.month===d.month))issues.push('该月已有导入账务，请先核对已有资料');
      if(asOf&&d.month&&D.monthEnd(d.month)>asOf)issues.push('账务月份晚于报告截止日');
    }else if(record.type==='plan'){
      need(!!d.payee,'待补付款对象');need(!!d.date,'待补付款日期');need(d.amount!==null&&d.amount>0,'待补付款金额');
      if(asOf&&d.date&&d.date<=asOf&&!d.repeat)issues.push('计划日期已在报告期间内，请核对是否已经付款');
    }else{
      need(!!d.date,'待补报表日期');need(ASSETS.every(k=>d[k]!==null),'还有资产负债金额待补充');
      if((project.balance||[]).some(row=>row.date===d.date))issues.push('该日已有导入报表，请先核对已有资料');
      if(asOf&&d.date>asOf)issues.push('报表日期晚于报告截止日');
      if(ASSETS.every(k=>d[k]!==null)&&Math.abs(round(d.cash+d.receivables+d.inventory+d.fixedAssets+d.otherAssets-d.payables-d.taxPayable-d.debt-d.otherLiabilities-d.capital-d.retainedEarnings))>.01)issues.push('资产与负债加权益尚未核对一致');
      const balanceRecord=records.find(r=>r.type==='balance'&&r.data.date===d.date),known=[...new Set(sourceRecords(project).map(r=>r.account).filter(Boolean))];
      if(balanceRecord&&balanceRecord.data.accounts.length&&balanceRecord.data.accounts.every(a=>a.amount!==null)&&known.every(name=>balanceRecord.data.accounts.some(a=>a.account===name))&&d.cash!==null&&Math.abs(round(balanceRecord.data.accounts.reduce((n,a)=>n+a.amount,0)-d.cash))>.01)issues.push('货币资金与同日确认的账户余额不一致');
    }
    return {...record,status:issues.length?'draft':'ready',issues:[...new Set(issues)],received,linkedReceipts:linked,outstanding:d.amount==null||issues.some(s=>/关联流水|已关联|已到账金额/.test(s))?null:round(d.amount-received)};
  }
  function read(project,options={}){const records=raw(project),asOf=options.asOf||anchor(project,records);return {version:1,records:records.map(r=>assess(r,project,records,asOf))};}
  function context(project,options={}){
    const base=raw(project),asOf=options.asOf||anchor(project,base),records=base.map(r=>assess(r,project,base,asOf));
    const accounts=[...new Set(sourceRecords(project).map(r=>r.account).concat(base.filter(r=>r.type==='balance').flatMap(r=>r.data.accounts.map(a=>a.account))).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
    const receipts=receiptsOf(project).filter(r=>(!asOf||r.date<=asOf)&&(!options.account||r.account===options.account)).map(row=>({...row,linkedRecordId:records.find(r=>r.type==='ar'&&r.data.mode!=='none'&&r.data.receiptKeys.includes(row.key))?.id||null}));
    return {asOf,records,accounts,receipts,importedProfitMonths:(project.profit||[]).map(r=>r.month),importedBalanceDates:(project.balance||[]).map(r=>r.date)};
  }
  function meaningful(r){const d=r.data;return r.type==='ar'?d.mode==='none'||!!d.customer||!!d.business||d.amount!==null:r.type==='balance'?d.accounts.some(a=>a.amount!==null):r.type==='books'?BOOKS.some(k=>d[k]!==null):r.type==='assets'?ASSETS.some(k=>d[k]!==null):!!d.payee||!!d.category||d.amount!==null;}
  function upsert(project,input){
    const record=normalize({...input,id:input.id||'supp-'+Date.now()+'-'+Math.random().toString(36).slice(2),updatedAt:new Date().toISOString()}),id=record.id;if(!meaningful(record))fail('先填一项已知资料即可保存，其他可以以后再补。');
    const records=raw(project),same=records.find(r=>r.id===record.id);if(same&&same.type!==record.type)fail('不能更改已有补录资料的类型。');
    const d=record.data,others=records.filter(r=>r.id!==id);
    if(record.type==='ar'&&d.mode==='none'){
      if((project.ar||[]).some(r=>r.amount>r.received)||others.some(r=>r.type==='ar'&&r.data.mode!=='none'&&r.data.amount>assess(r,project,records,anchor(project,records)).received))fail('已有待收款项，请先核对或删除对应补录记录。');
    }
    if(record.type==='books'&&d.month&&(project.profit||[]).some(r=>r.month===d.month))fail('这个月已有导入账务，请先在账单管理中核对。');
    if(record.type==='assets'&&d.date&&(project.balance||[]).some(r=>r.date===d.date))fail('这个日期已有导入报表，请先在账单管理中核对。');
    if(['books','assets','balance'].includes(record.type)&&others.some(r=>r.type===record.type&&(d.month||d.date)&&(r.data.month||r.data.date)===(d.month||d.date)))fail('该期间已有补录记录，请直接编辑已有记录。');
    const next=others.filter(r=>!(record.type==='ar'&&r.type==='ar'&&r.data.mode==='none')).concat(record);
    if(record.type==='ar'){
      const cutoff=anchor(project,next);
      if(record.data.basis==='outstanding'&&record.data.mode!=='none')record.data.snapshotAsOf=cutoff||record.data.snapshotAsOf;
      record.data.completeAsOf=record.data.complete?cutoff:'';
    }
    const assessed=assess(record,project,next,anchor(project,next));
    const linkError=assessed.issues.find(s=>/关联流水|已关联|已到账金额/.test(s));if(linkError&&record.type==='ar')fail(linkError);
    if(record.type==='plan'&&d.amount===0)fail('预计付款金额应大于 0，不确定可以留空。');
    if(next.length>2000)fail('补录记录过多，请先整理已有资料。');
    const result={...clone(project),supplements:{version:1,records:next}};raw(result);return result;
  }
  function remove(project,id){return {...clone(project),supplements:{version:1,records:raw(project).filter(r=>r.id!==id)}};}
  function projectForReport(project,options={}){
    if(options.account)return project;
    const p={...project,profit:(project.profit||[]).slice(),ar:(project.ar||[]).slice(),balance:(project.balance||[]).slice()},records=read(project,options).records;
    for(const record of records){if(record.status!=='ready')continue;const d=record.data,meta={supplementId:record.id,manualSupplement:true};
      if(record.type==='books')p.profit.push({...d,...meta});
      if(record.type==='assets')p.balance.push({...d,...meta});
      if(record.type==='ar'&&d.mode==='entry'&&d.basis!=='outstanding')p.ar.push({invoiceId:record.id,customer:d.customer,invoiceDate:d.date,dueDate:d.dueDate,amount:d.amount,received:record.received,payments:record.linkedReceipts.map(r=>({date:r.date,amount:r.amount,receiptKey:r.key})),business:d.business,...meta});
    }
    return p;
  }
  function decorate(model,project,options={}){
    const c=context(project,{...options,asOf:model.asOf}),scope=options.account||'',records=c.records,drafts=records.filter(r=>r.status==='draft');
    const entries=records.filter(r=>r.type==='balance'&&r.data.date===model.asOf).flatMap(r=>r.data.accounts);
    const names=scope?[scope]:c.accounts,confirmed=names.map(account=>entries.find(a=>a.account===account)).filter(a=>a&&a.amount!==null);
    const complete=names.length>0&&confirmed.length===names.length,knownTotal=round(confirmed.reduce((n,a)=>n+a.amount,0));
    const balance={date:model.asOf,total:complete?knownTotal:null,knownTotal,complete,confirmedCount:confirmed.length,accountCount:names.length};
    if(complete){
      model.totals.closingCash=knownTotal;model.availability.closingCash=true;
      if(model.forecastBase)model.forecastBase.closingCash=knownTotal;
      // This point-in-time anchor proves no historical balance or coverage.
      model.availability.forecast=false;
      model.forecastUnavailableReason='余额已确认，继续补充未来收付款计划。';
      const last=model.monthly.find(r=>r.month===model.asOf.slice(0,7));if(last)last.closingCash=knownTotal;
      model.cashBalances=model.monthly.map(r=>({month:r.month,balance:r.closingCash}));
      if(!scope&&model.balance?.date===model.asOf&&Math.abs(round(model.balance.cash-knownTotal))>.01){balance.issue='确认的账户余额与同日资产负债表货币资金不一致，请核对。';model.warnings.push({code:'SUPPLEMENT_BALANCE_MISMATCH',message:balance.issue});}
    }
    const arEntries=scope?[]:records.filter(r=>r.type==='ar'&&r.data.mode==='entry'&&(r.data.basis==='outstanding'?r.data.snapshotAsOf:r.data.date)<=model.asOf);
    // An unpaid balance is a point-in-time fact, not an invoice. Keep it out of
    // dated history and never deduct old cash receipts from it a second time.
    const snapshotRows=arEntries.filter(r=>r.data.basis==='outstanding'&&r.status==='ready').map(r=>{
      const d=r.data,days=d.dueDate?Math.max(0,Math.floor((Date.parse(d.snapshotAsOf+'T00:00:00Z')-Date.parse(d.dueDate+'T00:00:00Z'))/86400000)):null;
      return {id:r.id,invoiceId:r.id,supplementId:r.id,manualSupplement:true,basis:'outstanding',customer:d.customer,business:d.business,amount:d.amount,outstanding:d.amount,received:0,snapshotDate:d.snapshotAsOf,invoiceDate:d.date||null,dateUnknown:!d.date,dueDate:d.dueDate||null,dueUnknown:!d.dueDate,overdue:d.dueDate?d.amount>0&&days>0:null,daysOverdue:d.dueDate?(d.amount>0?days:0):null,termDays:d.date&&d.dueDate?Math.round((Date.parse(d.dueDate+'T00:00:00Z')-Date.parse(d.date+'T00:00:00Z'))/86400000):null,actualAverageDays:null,stale:d.snapshotAsOf!==model.asOf};
    });
    const currentSnapshotRows=snapshotRows.filter(r=>!r.stale),staleSnapshotRows=snapshotRows.filter(r=>r.stale);
    if(currentSnapshotRows.length){
      const rows=(model.ar?.rows||[]).concat(currentSnapshotRows),total=round(rows.reduce((n,r)=>n+r.outstanding,0)),knownOverdue=round(rows.filter(r=>r.overdue===true).reduce((n,r)=>n+r.outstanding,0)),overdueUnknown=rows.some(r=>r.outstanding>0&&r.overdue===null);
      model.ar={...model.ar,rows,total,knownOverdue,overdueUnknown,overdue:overdueUnknown?null:knownOverdue,overdueRatio:overdueUnknown?null:total>0?knownOverdue/total:0};model.availability.ar=true;
    }
    const none=!scope&&records.some(r=>r.type==='ar'&&r.data.mode==='none'&&r.data.date===model.asOf)&&!(model.ar?.rows||[]).some(r=>r.outstanding>0)&&!arEntries.some(r=>r.outstanding===null||r.outstanding>0);
    const draftRows=arEntries.filter(r=>r.status==='draft').map(r=>({id:r.id,customer:r.data.customer,business:r.data.business,amount:r.data.amount,received:r.received,outstanding:r.outstanding!==null&&r.outstanding>=0?r.outstanding:null,dateUnknown:!r.data.date,dueUnknown:!r.data.dueDate,dueDate:r.data.dueDate,issues:r.issues}));
    if(none){model.ar={rows:[],total:0,overdue:0,overdueRatio:0};model.availability.ar=true;}
    // The checkbox confirms the whole list at one cutoff, not each invoice.
    // Upsert appends the latest edit; older undated confirmations stay unknown.
    const latestAr=arEntries.at(-1),arComplete=none||arEntries.length>0&&arEntries.every(r=>r.status==='ready')&&!staleSnapshotRows.length&&latestAr.data.complete&&latestAr.data.completeAsOf===model.asOf;
    const ar={none,complete:arComplete,partial:arEntries.length>0&&!arComplete,knownOutstanding:round(draftRows.reduce((n,r)=>n+(r.outstanding||0),0)),draftRows,snapshotRows,currentSnapshotRows,staleSnapshotRows,snapshotOutstanding:round(currentSnapshotRows.reduce((n,r)=>n+r.outstanding,0)),overdueUnknown:currentSnapshotRows.some(r=>r.outstanding>0&&r.overdue===null),dateUnknown:draftRows.concat(currentSnapshotRows).some(r=>r.dateUnknown),dueUnknown:draftRows.concat(currentSnapshotRows).some(r=>r.dueUnknown)};
    const planRows=scope?[]:records.filter(r=>r.type==='plan'&&r.status==='ready').map(r=>({id:r.id,...r.data})).sort((a,b)=>a.date.localeCompare(b.date));
    const [asOfYear,asOfMonth]=model.asOf.split('-').map(Number),horizon=new Date(Date.UTC(asOfYear,asOfMonth+6,0)).toISOString().slice(0,10),payments=[];
    for(const row of planRows){
      const [year,month,day]=row.date.split('-').map(Number);
      // Anchor each occurrence to the original day, rather than incrementing
      // an already clamped date (Jan 31 -> Feb 28 -> Mar 31).
      const firstOffset=row.repeat?Math.max(0,(asOfYear-year)*12+asOfMonth-month):0;
      for(let offset=firstOffset;offset<firstOffset+8;offset++){
        if(offset&&!row.repeat)break;
        const monthStart=new Date(Date.UTC(year,month-1+offset,1)),lastDay=new Date(Date.UTC(monthStart.getUTCFullYear(),monthStart.getUTCMonth()+1,0)).getUTCDate();
        const occurrence=new Date(Date.UTC(monthStart.getUTCFullYear(),monthStart.getUTCMonth(),Math.min(day,lastDay))).toISOString().slice(0,10);
        if(occurrence>horizon)break;
        if(occurrence>model.asOf)payments.push({planId:row.id,date:occurrence,payee:row.payee,category:row.category,amount:row.amount,repeat:row.repeat});
      }
    }
    payments.sort((a,b)=>a.date.localeCompare(b.date)||a.planId.localeCompare(b.planId));
    const totalCents=payments.reduce((n,r)=>n+Math.round(r.amount*100),0),total=Number.isSafeInteger(totalCents)?totalCents/100:null;
    const plans={rows:planRows,payments,occurrenceCount:payments.length,total,horizon,nextDate:payments[0]?.date||null,throughDate:payments.at(-1)?.date||null,cashAfter:complete&&payments.length&&total!==null?round(knownTotal-total):null,label:'已补充付款后的现金',note:'按未来 6 个月已补充付款计划计算；每月重复按原定日期逐月计入，月末不足日取当月最后一天；未包含尚未补充的收入和支出。'};
    if(total===null)plans.issue='计划金额总规模过大，暂不计算合计，请拆分计划。';
    const metadata={asOf:model.asOf,records,counts:{total:records.length,draft:drafts.length},balance,ar,plans,drafts};model.supplement=metadata;model.supplements=metadata;
    model.hasData=model.hasData||records.length>0;
    if(model.report)model.report={...model.report,totals:model.totals,monthly:model.monthly,ar:model.ar};
    return model;
  }
  return Object.freeze({read,upsert,remove,context,projectForReport,decorate,receiptKey,fields:{books:BOOKS,assets:ASSETS}});
});
