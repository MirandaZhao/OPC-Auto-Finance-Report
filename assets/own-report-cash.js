/* Cash evidence and explicitly labelled scenarios for a user's real ledger.
 * Does not alter source rows or turn an estimated flow into an account balance. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./data-engine.js'));
  else root.YoushuOwnCash=factory(root.YoushuData);
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
  'use strict';
  const round=n=>Math.round(n*100)/100,sum=(rows,f)=>round(rows.reduce((n,r)=>n+(Number(f(r))||0),0));
  const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
  const finite=v=>typeof v==='number'&&Number.isFinite(v);
  const statement=p=>p.ledgerStatement||p.alipayStatement||p.wechatStatement;
  const sourceRows=p=>(p.cash||[]).concat(statement(p)?.neutralRows||[],statement(p)?.zeroRows||[]);
  function addMonths(date,offset){const [y,m,d]=date.split('-').map(Number),s=new Date(Date.UTC(y,m-1+offset,1)),last=new Date(Date.UTC(s.getUTCFullYear(),s.getUTCMonth()+1,0)).getUTCDate();return new Date(Date.UTC(s.getUTCFullYear(),s.getUTCMonth(),Math.min(d,last))).toISOString().slice(0,10);}
  const addDays=(date,n)=>new Date(Date.parse(date+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
  function sourceEnd(project,cutoff,scope){
    const rows=sourceRows(project).filter(r=>!scope||r.account===scope),imports=(project.ledger?.imports||[]).filter(b=>!scope||(b.bankStatement?.account||b.statement?.account||b.accountScope)===scope),s=statement(project),singleScope=!scope||s?.account===scope||!project.ledger?.imports?.length&&sourceRows(project).every(r=>r.account===scope);
    const dates=rows.map(r=>r.date).concat(imports.map(b=>b.statement?.end||b.bankStatement?.end),singleScope?s?.end:null).filter(d=>validDate(d)&&(!cutoff||d<=cutoff));
    return dates.sort().at(-1)||'';
  }
  function ordered(rows){
    return rows.map((row,index)=>({row,index})).sort((a,b)=>{
      const x=a.row,y=b.row,day=x.date.localeCompare(y.date);if(day)return day;
      if(x.time&&y.time&&x.time!==y.time)return x.time.localeCompare(y.time);
      const direction=x.bankFormat==='bob-pdf-v1'&&y.bankFormat==='bob-pdf-v1'?-1:1;
      return direction*((x.sourcePage||0)-(y.sourcePage||0)||(x.sourceRow||a.index)-(y.sourceRow||b.index));
    }).map(x=>x.row);
  }
  function checkChain(rows){
    let running=0,anchor=null,count=0;for(const row of rows){running=round(running+(row.inflow||0)-(row.outflow||0));if(finite(row.balance)){count++;const opening=round(row.balance-running);if(anchor!==null&&Math.abs(opening-anchor)>.011)return {valid:false,count};anchor=opening;}}
    return {valid:count>0,count};
  }
  function balanceContext(project,options={}){
    const scope=options.account||'',asOf=options.asOf||sourceEnd(project,null,scope)||project.asOf||'',all=sourceRows(project).filter(r=>(!scope||r.account===scope)&&validDate(r.date)&&(!asOf||r.date<=asOf));
    const imports=(project.ledger?.imports||[]).filter(b=>b.kind==='cash'),manual=(project.supplements?.records||[]).filter(r=>r.type==='balance'&&validDate(r.data?.date)&&(!asOf||r.data.date<=asOf));
    const names=[...new Set(all.map(r=>r.account).concat(manual.flatMap(r=>r.data.accounts.map(a=>a.account))).filter(a=>a&&(!scope||a===scope)))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
    const candidates=new Map(names.map(a=>[a,[]]));const add=(account,row)=>{if(candidates.has(account))candidates.get(account).push(row);};
    // Verified bank exports carry an explicit statement coverage date. A lack
    // of transactions after its last row is meaningful only inside that file.
    const coveredImports=new Set();
    for(const batch of imports){
      const meta=batch.bankStatement;if(!meta||meta.balanceErrors?.length||!validDate(meta.end))continue;
      const account=meta.account||batch.accountScope;if(scope&&account!==scope)continue;
      const rows=ordered((batch.rows||[]).concat(meta.zeroRows||[]).filter(r=>r.date<=asOf));if(!rows.length)continue;
      const check=checkChain(rows),last=[...rows].reverse().find(r=>finite(r.balance));
      if(!last)continue;
      const covered=meta.start<=asOf&&meta.end>=asOf,date=covered?asOf:meta.end;
      const latestDate=date>=last.date?date:last.date;
      add(account,{account,date:latestDate,amount:check.valid?last.balance:null,source:'账单识别',sourceName:batch.name||meta.sourceName||meta.bank||'银行流水',verified:check.valid,issue:check.valid?'':'流水余额不连续，请核对',lastTransactionDate:last.date,coverageStart:meta.start,coverageEnd:meta.end});
      coveredImports.add(batch.id);
    }
    // Generic balance columns remain useful evidence. Ambiguous conflicting
    // balances are not silently converted into a trustworthy latest snapshot.
    for(const account of names){
      const rows=ordered(all.filter(r=>r.account===account&&!coveredImports.has(r.sourceImportId)));
      if(!rows.some(r=>finite(r.balance)))continue;
      let sequence=rows,check=checkChain(rows);
      if(!check.valid&&rows.length>1&&rows.every(r=>r.date===rows[0].date)){const reverse=rows.slice().reverse(),other=checkChain(reverse);if(other.valid){sequence=reverse;check=other;}}
      const last=[...sequence].reverse().find(r=>finite(r.balance)),tail=sequence.slice(sequence.lastIndexOf(last)+1).filter(r=>r.date===last.date),sameDayNet=sum(tail,r=>(r.inflow||0)-(r.outflow||0));
      add(account,{account,date:last.date,amount:check.valid?last.balance:null,source:'账单识别',sourceName:last.sourceImportName||'流水余额列',verified:check.valid,issue:check.valid?'':'流水余额不连续或同日顺序不明确，请核对',lastTransactionDate:last.date,sameDayNet,sameDayCount:tail.length});
    }
    for(const record of manual)for(const item of record.data.accounts||[])if(finite(item.amount))add(item.account,{account:item.account,date:record.data.date,amount:item.amount,source:'手动补充',sourceName:'已保存的余额确认',verified:true,manual:true});
    const accounts=names.map(account=>{
      const list=candidates.get(account).sort((a,b)=>b.date.localeCompare(a.date)),latest=list[0];
      if(!latest)return {account,date:null,amount:null,source:null,sourceName:'',verified:false,issue:'账单没有提供余额'};
      const peers=list.filter(r=>r.date===latest.date),manual=peers.find(r=>r.manual);
      if(manual){const conflict=peers.some(r=>finite(r.amount)&&Math.abs(r.amount-manual.amount)>.011);return {...manual,issue:conflict?'手动确认与同日账单余额不同，请核对':''};}
      if(peers.some(r=>!r.verified)||new Set(peers.filter(r=>finite(r.amount)).map(r=>Math.round(r.amount*100))).size>1)return {...latest,amount:null,verified:false,issue:'同一账户的余额证据不一致，请核对'};
      return latest;
    });
    const known=accounts.filter(a=>finite(a.amount)),dates=[...new Set(known.map(a=>a.date))],aligned=dates.length===1,complete=accounts.length>0&&known.length===accounts.length&&aligned;
    const knownTotal=aligned?sum(known,r=>r.amount):null,date=aligned?dates[0]:null;
    return {asOf,accounts,date,total:complete?knownTotal:null,knownTotal,complete,confirmedCount:known.length,accountCount:accounts.length,source:known.every(r=>r.manual)?'手动补充':known.some(r=>r.manual)?'账单与补录':'账单识别',note:complete?'截至 '+date+' · '+accounts.length+' 个账户':known.length&& !aligned?'各账户余额日期不同，分别展示后再确认同日余额':known.length?'已识别 '+known.length+' / '+accounts.length+' 个账户余额':'账单未提供可用余额，可先查看现金增减趋势'};
  }
  // This layer is an editable reporting assumption, kept separate from the
  // original balance evidence above. Unknown accounts default to zero only
  // because the user explicitly chose that reporting convention.
  function balanceSummary(project,options={}){
    const scope=options.account||'',date=options.asOf||sourceEnd(project,null,scope)||project.asOf||'',position=balanceContext(project,{...options,asOf:date});
    const raw=sourceRows(project).filter(r=>(!scope||r.account===scope)&&validDate(r.date)&&r.date<=date);
    const net=(account,from,to)=>sum(raw.filter(r=>r.account===account&&r.date>from&&r.date<=to),r=>(r.inflow||0)-(r.outflow||0));
    const accounts=position.accounts.map(fact=>{
      const known=finite(fact.amount),changedDate=known&&(fact.date!==date||fact.sameDayCount>0),movement=known?net(fact.account,fact.date,date)+(fact.sameDayNet||0):0;
      return {account:fact.account,date,amount:known?round(fact.amount+movement):0,sourceDate:fact.date||null,sourceAmount:known?fact.amount:null,source:known?fact.source:'未填按0暂计',sourceName:fact.sourceName||'',assumedZero:!known,estimated:!known||changedDate,note:!known?(fact.issue?fact.issue+'；':'')+'未填余额按0暂计，可修改':changedDate?'按 '+fact.date+' 的余额及之后已上传流水推算至 '+date+'；未推算缺失交易':'截至 '+date+' · '+fact.source};
    });
    let total=sum(accounts,r=>r.amount),aggregate=false,source='账户余额汇总';
    // Existing whole-ledger opening cash is legitimate evidence. It is never
    // assigned arbitrarily among several unidentified accounts.
    if(!scope&&!statement(project)&&finite(project.openingCash)&&!position.complete){
      total=round(project.openingCash+sum(raw,r=>(r.inflow||0)-(r.outflow||0)));source='账本计算';
      if(accounts.length===1){Object.assign(accounts[0],{amount:total,sourceDate:date,sourceAmount:total,source,sourceName:'已提供期初余额及实际资金变动',assumedZero:false,estimated:false,note:'按已提供的期初余额及实际资金变动计算'});}
      else aggregate=true;
    }
    const assumedZeroCount=accounts.filter(r=>r.assumedZero).length,estimatedCount=accounts.filter(r=>r.estimated).length,estimated=!aggregate&&estimatedCount>0;
    const note=aggregate?'截至 '+date+' · 按已提供期初余额计算整体余额，各账户余额尚未拆分':'截至 '+date+(assumedZeroCount?' · '+assumedZeroCount+' 个未填账户按0暂计':'')+(estimatedCount>assumedZeroCount?' · 部分余额按已上传流水推算':'')+(!estimatedCount?' · '+accounts.length+' 个账户':'');
    return {date,total,accounts,assumedZeroCount,estimatedCount,estimated,aggregate,source,note};
  }
  function balanceHistory(model,project,options,summary){
    if(!validDate(summary.date))return [];
    const scope=options.account||'',all=sourceRows(project).filter(r=>(!scope||r.account===scope)&&validDate(r.date)&&r.date<=summary.date),selected=model.period?.monthKeys;
    const months=[...new Set(all.map(r=>r.date.slice(0,7)))].filter(k=>!selected||selected.includes(k)).sort().slice(-12);
    if(!months.length)return [];
    const dates=months.map(key=>key===summary.date.slice(0,7)?summary.date:D.monthEnd(key)).filter(d=>d<=summary.date);let openingDate=null;
    if(dates.at(-1)!==summary.date)dates.push(summary.date);
    // A single supplied month can still show the opening-to-closing movement.
    // This opening point is derived and explicitly labelled, never a fake row.
    if(dates.length===1){const first=all.filter(r=>r.date.startsWith(months[0])).map(r=>r.date).sort()[0];if(first){openingDate=addDays(first,-1);dates.unshift(openingDate);}}
    const net=(account,from,to)=>sum(all.filter(r=>(!account||r.account===account)&&r.date>from&&r.date<=to),r=>(r.inflow||0)-(r.outflow||0));
    return dates.map(date=>{
      if(date===summary.date)return {month:date.slice(0,7),date,value:summary.total,estimated:summary.estimated,note:summary.note,source:summary.estimated?'estimate':'balance',accounts:summary.accounts};
      if(summary.aggregate){const value=round(summary.total-net('',date,summary.date));return {month:date.slice(0,7),date,value,estimated:true,note:'按已提供期初余额及实际流水计算；未推算缺失交易',source:'derived',accounts:[]};}
      const evidence=balanceContext(project,{...options,asOf:date});
      const accounts=summary.accounts.map(current=>{
        const fact=evidence.accounts.find(r=>r.account===current.account),known=finite(fact?.amount),exact=known&&fact.date===date&&!fact.sameDayCount;
        const amount=known?round(fact.amount+(fact.sameDayNet||0)+net(current.account,fact.date,date)):round(current.amount-net(current.account,date,summary.date));
        return {account:current.account,amount,sourceDate:known?fact.date:current.sourceDate,assumedZero:!known&&current.assumedZero,estimated:!exact,source:exact?fact.source:'按已上传流水推算',note:exact?'采用当日余额':known?'以 '+fact.date+' 余额及已上传流水推算':'以 '+summary.date+' '+(current.assumedZero?'暂计0余额':'余额')+'及已上传流水回推'};
      });
      const estimated=accounts.some(r=>r.estimated),value=sum(accounts,r=>r.amount);
      return {month:date.slice(0,7),date,value,estimated,note:estimated?'部分历史余额按现有余额及已上传流水推算；未填余额按0暂计，未推算缺失交易':'当日已识别账户余额合计',source:estimated?'derived':'balance',accounts};
    }).map(point=>point.date===openingDate?{...point,opening:true,anchorDate:summary.date,anchorValue:summary.total,netAfter:net('',point.date,summary.date),note:'起始余额按已有余额及已上传流水推算；'+point.note}:point);
  }
  function coverageWindows(project,scope){
    const rows=[];for(const b of project.ledger?.imports||[]){const s=b.bankStatement||b.statement;if(b.kind!=='cash'||!s||!validDate(s.start)||!validDate(s.end))continue;const account=s.account||b.accountScope||b.rows?.[0]?.account||'';if(!scope||account===scope)rows.push({account,start:s.start,end:s.end});}
    if(!rows.length){const s=statement(project);if(validDate(s?.start)&&validDate(s?.end))rows.push({account:scope||project.cash?.[0]?.account||'',start:s.start,end:s.end});}
    return rows;
  }
  function coversMonth(project,options,key,model){
    if(model.period?.cashComplete===true)return true;
    const scope=options.account||'',names=scope?[scope]:[...new Set(sourceRows(project).map(r=>r.account).filter(Boolean))],windows=coverageWindows(project,scope),start=key+'-01',end=D.monthEnd(key);
    return names.length>0&&names.every(account=>{let cursor=start;for(const w of windows.filter(w=>w.account===account).sort((a,b)=>a.start.localeCompare(b.start))){if(w.start>cursor)break;if(w.end>=cursor)cursor=addDays(w.end,1);if(cursor>end)return true;}return false;});
  }
  function datedPlans(model,anchorDate){
    if(!validDate(anchorDate))return {receipts:[],payments:[],horizon:null};
    const horizon=addMonths(anchorDate,6),records=model.supplement?.records||[],payments=[],receipts=[];
    // The supplement projection has already scoped these rows. Its raw
    // records remain global and must not leak unassigned plans into an account.
    const planRows=model.supplement?.plans?.rows??records.filter(r=>r.type==='plan'&&r.status==='ready').map(r=>({id:r.id,...r.data}));
    for(const d of planRows){
      const [sy,sm]=d.date.split('-').map(Number),[ay,am]=anchorDate.split('-').map(Number),initial=d.repeat?Math.max(0,(ay-sy)*12+am-sm):0;
      for(let offset=initial;offset<initial+8;offset++){if(offset&&!d.repeat)break;const date=addMonths(d.date,offset);if(date>horizon)break;if(date>anchorDate)payments.push({id:d.id,date,amount:d.amount,category:d.category||'未分类',counterparty:d.payee});}
    }
    const seen=new Set();
    for(const row of (model.ar?.rows||[]).concat(model.supplement?.ar?.currentSnapshotRows||[])){
      const id=row.supplementId||row.id||row.invoiceId||[row.customer,row.dueDate,row.outstanding].join('|');
      if(seen.has(id)||!validDate(row.dueDate)||row.dueDate<=anchorDate||row.dueDate>horizon||!(row.outstanding>0))continue;
      seen.add(id);receipts.push({id,date:row.dueDate,amount:row.outstanding,counterparty:row.customer});
    }
    return {receipts,payments,horizon};
  }
  function decorate(model,project,options={}){
    if(model.source!=='mine')return model;
    const position=balanceContext(project,{...options,asOf:model.asOf}),originalClosing=model.totals.closingCash;
    // A pre-existing full-ledger accounting anchor is already authoritative.
    if(!position.complete&&finite(originalClosing)&&!model.isStatement){Object.assign(position,{date:model.asOf,total:originalClosing,complete:true,source:'账本计算',note:'按已提供的期初余额及实际资金变动计算'});}
    model.cashPosition=position;
    if(position.complete&&position.date===model.asOf&&!position.accounts.some(r=>r.sameDayCount)){model.totals.closingCash=position.total;model.availability.closingCash=true;}
    const summary=balanceSummary(project,{...options,asOf:model.asOf}),anchorDate=summary.accounts.length||model.hasData?summary.date:null;
    if(position.complete&&position.source==='账本计算'){summary.total=position.total;summary.aggregate=summary.accounts.length!==1;summary.estimated=false;summary.source='账本计算';summary.note='截至 '+model.asOf+' · 按已提供期初余额及实际资金变动计算';}
    model.cashEstimate=summary;
    const transactions=(model.transactions||[]).filter(r=>r.date<=anchorDate),keys=[...new Set(transactions.map(r=>r.date.slice(0,7)))].sort(),full=keys.filter(key=>D.monthEnd(key)<=anchorDate&&coversMonth(project,options,key,model));
    const selected=(full.length?full:keys).slice(-3),baseRows=transactions.filter(r=>selected.includes(r.date.slice(0,7))),months=selected.length;
    const monthlyIncome=months?round(sum(baseRows,r=>r.inflow)/months):0,monthlyExpense=months?round(sum(baseRows,r=>r.outflow)/months):0;
    const categories=[...new Set(baseRows.filter(r=>r.outflow>0).map(r=>r.category||'未分类'))],categoryMonthly=Object.fromEntries(categories.map(k=>[k,round(sum(baseRows.filter(r=>(r.category||'未分类')===k),r=>r.outflow)/Math.max(1,months))]));
    const plans=datedPlans(model,anchorDate),planCategories=[...new Set(plans.payments.map(r=>r.category))],planCategoryMonthly=Object.fromEntries(planCategories.map(k=>[k,round(sum(plans.payments.filter(r=>r.category===k),r=>r.amount)/6)]));
    const preferred=items=>{const likely=items.filter(k=>/订阅|API|模型|软件|广告|推广|协作|外包|餐饮|购物|采购|工具/i.test(k));return likely.length?likely:items;},defaultFlexCategories=[...new Set(preferred(categories).concat(preferred(planCategories)))];
    const availableModes=[];if(baseRows.length)availableModes.push('history');if(plans.receipts.length||plans.payments.length)availableModes.push('plans');
    const completeMonths=full.length>0,coverageNote=months?(completeMonths?'按最近 '+months+' 个完整账单月份的月均收付估算':'按最近 '+months+' 个已提供月份的收付记录估算 · 未将缺月视为零，未推算缺失交易'):'尚未提供可用于历史估算的收付款';
    const note=summary.note+'；历史余额采用已识别值或按流水推算，未填账户按0暂计，可在余额弹窗修改';
    const history=balanceHistory(model,project,options,summary);
    model.ownForecast={available:availableModes.length>0,anchorDate,relative:false,relativeReason:null,balanceDate:summary.date,start:summary.total,estimated:summary.estimated,balanceNote:summary.note,monthlyIncome,monthlyExpense,baselineMonthKeys:selected,baselineMonths:months,completeMonths,coverageNote,defaultFlexCategories,categoryMonthly,planCategoryMonthly,availableModes,planReceipts:plans.receipts,planPayments:plans.payments,planHorizon:plans.horizon,history,historyNote:history.some(p=>p.estimated)?'历史余额含按已上传流水推算的金额；未填账户按0暂计，点击数据点查看依据':'历史余额来自已识别的账户余额',note};
    model.availability.forecast=model.ownForecast.available;
    if(model.report)model.report={...model.report,totals:model.totals};
    return model;
  }
  function forecast(model,adjustments={}){
    const f=model.ownForecast;if(!f||!validDate(f.anchorDate))return {available:false,points:[],history:[]};
    const growth=Number(adjustments.growth)||0,delay=Number(adjustments.delay)||0,expense=Number(adjustments.expense)||0;
    const explicit=finite(adjustments.monthlyIncome)||finite(adjustments.monthlyExpense),mode=adjustments.mode==='plans'&&f.availableModes.includes('plans')?'plans':f.availableModes.includes('history')||explicit?'history':f.availableModes[0]||'history';
    const income=finite(adjustments.monthlyIncome)?Math.max(0,adjustments.monthlyIncome):f.monthlyIncome,out=finite(adjustments.monthlyExpense)?Math.max(0,adjustments.monthlyExpense):f.monthlyExpense;
    const flex=Array.isArray(adjustments.flexCategories)?adjustments.flexCategories:f.defaultFlexCategories,categoryFlexible=sum(flex,k=>(mode==='plans'?f.planCategoryMonthly:f.categoryMonthly)[k]||0),flexible=mode==='history'&&finite(adjustments.monthlyExpense)?round(f.monthlyExpense>0?out*Math.min(1,categoryFlexible/f.monthlyExpense):out):categoryFlexible;
    const start=f.start,anchor=f.anchorDate,dates=Array.from({length:7},(_,i)=>addMonths(anchor,i));
    function amounts(step,g,d,e){
      if(step===0)return {received:0,paid:0};
      if(mode==='history')return {received:income*(1+g/100)*Math.min(6,Math.max(0,step-d/30)),paid:(out+flexible*e/100)*step};
      const cutoff=dates[step],received=sum(f.planReceipts.filter(r=>addDays(r.date,d)<=cutoff),r=>r.amount*(1+g/100)),paid=sum(f.planPayments.filter(r=>r.date<=cutoff),r=>r.amount*(1+(flex.includes(r.category)?e/100:0)));
      return {received,paid};
    }
    const points=dates.map((date,step)=>{const a=amounts(step,growth,delay,expense);return {step,date,month:date.slice(0,7),value:round(start+a.received-a.paid),received:round(a.received),paid:round(a.paid)};});
    const baseline=points.map(p=>{const a=amounts(p.step,0,0,0);return round(start+a.received-a.paid);}),rangeValues=[start];
    for(let i=1;i<=6;i++)for(const g of [-30,30])for(const d of [-60,60])for(const e of [-30,30]){const a=amounts(i,g,d,e);rangeValues.push(round(start+a.received-a.paid));}
    const end=points.at(-1).value,baselineEnd=baseline.at(-1);
    return {available:f.available||explicit,mode,points,history:f.history,start,end,min:Math.min(...points.slice(1).map(r=>r.value)),baselineEnd,delta:round(end-baselineEnd),firstDelta:round(points[1].value-baseline[1]),relative:f.relative,relativeReason:f.relativeReason,estimated:f.estimated,balanceNote:f.balanceNote,historyNote:f.historyNote,anchorDate:anchor,safety:!f.relative&&mode==='history'?round(out*3):null,rangeValues,monthlyIncome:income,monthlyExpense:out,flexibleMonthly:flexible,note:f.note+'；'+(mode==='plans'?'仅按已填写且有日期的收付款计划推演，不叠加历史月均收付，未填日期的应收不假设到账时间。':f.coverageNote+'；收入变化与付款时间均为情景假设，已填计划可切换查看。'),details:points.map(p=>({step:p.step,date:p.date,start,received:p.received,paid:p.paid,value:p.value}))};
  }
  return Object.freeze({balanceContext,balanceSummary,decorate,forecast});
});
