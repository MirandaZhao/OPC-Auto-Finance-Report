/* Shared report view model. Uses the application's existing report calculations
 * and original source rows. No storage access and no generated or example data.
 * Pass the complete project with options.account: ledger migration must happen
 * before account filtering so an excluded account cannot be restored by imports.
 * Browser load order: data-engine.js, ledger.js, report-model.js. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./data-engine.js'),require('./ledger.js'),require('./supplement-data.js'),require('./own-report-cash.js'));
  else root.YoushuTemplateData=factory(root.YoushuData,root.YoushuLedger,root.YoushuSupplements,root.YoushuOwnCash);
})(typeof globalThis!=='undefined'?globalThis:this,function(D,L,S,OwnCash){
  'use strict';
  if(!D)throw Error('请先加载原软件的数据计算组件。');
  const round=value=>Math.round(value*100)/100;
  const sum=(rows,get)=>round(rows.reduce((total,row)=>total+(Number(get(row))||0),0));
  const empty=()=>({schemaVersion:1,company:'',openingCash:null,asOf:'',cash:[],profit:[],ar:[],balance:[]});
  const receiptLabels=Object.freeze({investment:'投资理财',credit_repayment:'信用还款',third_party_payment:'他人代付',own_transfer:'本人资金互转'});
  const receiptNote='退款入账计入收入；投资理财、信用还款、他人代付和本人资金互转不计入收入和支出。退款按原始到账方向计入，原文件标为不计收支的记录保留原分类。原始流水与实际资金变动仍保留；账务利润和资产负债按另行提供的账务资料计算。';
  // Classify transaction purpose, never a merchant name, payment instrument, or
  // the refund status of an original purchase. Unknown transfers stay visible.
  function classifyReceipt(row,context={}){
    const identified=(id,evidence)=>({id,label:receiptLabels[id],evidence});
    const confirmed=row.receiptExclusion;
    if(confirmed?.confirmed===true&&receiptLabels[confirmed.id]&&confirmed.evidence)return identified(confirmed.id,confirmed.evidence);
    const fields=[row.transactionType,row.category,row.summary].filter(value=>typeof value==='string').map(value=>value.trim().replace(/\s+/g,''));
    const matching=regex=>fields.find(value=>regex.test(value));
    const matchingAction=regex=>fields.find(value=>!/(?:咨询|培训|开发|设计|代办|服务费|手续费|申请中|未完成|失败)/.test(value)&&regex.test(value));
    const repayment=matchingAction(/^(?:信用还款|信用卡还款|信用卡自动还款|信用卡预约还款|还信用卡|花呗还款|借呗还款|白条还款|信用购还款)(?:$|[-—:：·（(])/)||matchingAction(/^(?:信用卡还款|信用卡自动还款|花呗还款|借呗还款|白条还款|信用购还款)/);
    if(repayment)return identified('credit_repayment','原始交易类型：'+repayment);
    const proxy=[row.transactionType,row.category].filter(value=>typeof value==='string').map(value=>value.trim().replace(/\s+/g,'')).find(value=>/^(?:他人代付|由他人代付|亲友代付|朋友代付|好友代付)(?:$|[-—:：·（(])/.test(value));
    // An explicit third-party-payment transaction type is excluded in either
    // direction. Customer names and free-form payment notes are not evidence.
    if(proxy)return identified('third_party_payment','原始交易类型：'+proxy);
    const transfer=matching(/^(?:本人资金互转|本人账户互转|本人账户转账|本人银行卡转账|账户内部转账|内部转账|提现|零钱提现|余额提现|支付宝提现|零钱充值|余额充值)(?:$|[-—:：·（(])/);
    if(row.activity==='transfer'||transfer)return identified('own_transfer',transfer?'原始交易类型：'+transfer:'原始记录已分类为内部转账');
    const family=context.family||context.scenario?.family;
    const investment=matchingAction(/^(?:投资理财|投资收益|理财|理财通|理财申购|理财赎回|理财收益|理财购买|理财产品申购|理财产品赎回|理财产品收益|基金交易|基金申购|基金赎回|基金买入|基金卖出|基金分红|股票买入|股票卖出|证券交易|证券买入|证券卖出|投资本金买入|卖出收回本金|追加投资本金|投资已实现收益|投资已实现亏损|现金分红|存款利息|利息收入|结息|定期存款转存|定期存款支取|余额宝转入|余额宝转出|余额宝收益|零钱通转入|零钱通转出|零钱通收益)(?:$|[-—:：·（(])/)||matchingAction(/^(?:理财产品(?:申购|赎回|收益)|理财(?:申购|赎回|收益|购买)|理财通(?:转入|转出|买入|卖出|收益|赎回)|基金(?:申购|赎回|买入|卖出|分红)|股票(?:买入|卖出)|证券(?:买入|卖出)|定期存款(?:转存|支取)|余额宝(?:转入|转出|收益)|零钱通(?:转入|转出|收益))/);
    if(investment||family==='investor')return identified('investment',investment?'原始交易类型：'+investment:'投资账本中的本金、收益或相关费用');
    return null;
  }
  function includedInReceipts(row,isStatement=false,context={}){
    return (row.activity==='operating'||isStatement&&!row.activity)&&!classifyReceipt(row,context);
  }
  function receiptPolicy(rows,context){
    const excludedRows=rows.flatMap(row=>{const reason=classifyReceipt(row,context);return reason?[{...row,receiptExclusion:reason}]:[];});
    const metrics=records=>({count:records.length,totalIn:sum(records,r=>r.inflow),totalOut:sum(records,r=>r.outflow),neutralAmount:sum(records.filter(r=>['不计收支','/'].includes(r.direction)&&!r.inflow&&!r.outflow),r=>r.amount)});
    const groups=Object.entries(receiptLabels).map(([id,label])=>{const records=excludedRows.filter(r=>r.receiptExclusion.id===id);return {id,label,rows:records,...metrics(records)};});
    return {note:receiptNote,excludedRows,groups,...metrics(excludedRows)};
  }
  function applyReceiptPolicy(view){
    const inScope=row=>!view.scopeMonth||row.date.slice(0,7)===view.scopeMonth;
    view.receiptPolicy=receiptPolicy(view.rawTransactions.concat(view.neutralTransactions,view.zeroTransactions).filter(inScope),view);
    if(view.transactions.length===0&&view.receiptPolicy.count>0){view.availability.forecast=false;view.forecastUnavailableReason='本期记录均为投资理财等不计收支项目，沙盘暂无可用于推演的收入和支出。';}
    return view;
  }
  function contentKey(value){
    try{return encodeURIComponent(value);}
    // JSON backups may retain a lone UTF-16 surrogate. Keep it distinct without
    // rejecting an otherwise valid ledger. Normal URI encoding never emits %u.
    catch{return '%u'+Array.from(value,char=>char.codePointAt(0).toString(16)).join('-');}
  }
  function statementOf(p){return p?.ledgerStatement||p?.alipayStatement?.format==='alipay-v1'&&p.alipayStatement||p?.wechatStatement?.format==='wechat-v1'&&p.wechatStatement||null;}
  function sourceBasis(statement,isStatement){
    if(!isStatement)return {mode:'business',isOperatingClassified:true,label:'经营收支',note:receiptNote,labels:{income:'经营收款',expense:'经营付款',net:'经营现金结余',incomeSources:'收入来源',costCategories:'成本分类',cashSummary:'现金收付汇总'}};
    const bankOnly=!!statement?.bankStatements?.length&&!statement?.sourceStatements?.length;
    const combined=statement?.format==='combined-v1',alipay=statement?.format==='alipay-v1';
    return {mode:bankOnly?'bank-statement':combined?'combined-statement':alipay?'alipay-statement':'wechat-statement',isOperatingClassified:false,label:'报告收支',note:receiptNote+' 按明确交易类型排除；用途不明的转账仍需核对，收支差额不是余额或账务利润。',labels:{income:'收入',expense:'支出',net:'收支结余',incomeSources:'收入来源',costCategories:'支出分类',cashSummary:'报告收支汇总'}};
  }
  // Family changes labels and interpretation, never the original ledger amounts.
  function familyBasis(project,source){
    const family=source==='random'&&['personal','investor'].includes(project.scenario?.family)?project.scenario.family:'business';
    const presentation={overviewTitle:'财务总览',incomeTitle:'收入',costTitle:'成本',businessTitle:'经营分析',statementsTitle:'财务报表',profitLabel:'净利润',marginLabel:'净利润率',distributionTitle:'累计可分配利润',distributionNote:'管理演示估算 · 不等同于账上可用现金'};
    if(family==='personal')return {family,presentation:{...presentation,costTitle:'支出',businessTitle:'收支分析',profitLabel:'收支结余',marginLabel:'结余率',distributionTitle:'累计收支结余',distributionNote:'税后到账收入减已支付支出 · 不等同于当前现金余额'},basis:{mode:'personal',isOperatingClassified:true,label:'个人与副业收支',note:receiptNote+' 工资按税后到账记录，副业按实际收付记录。',labels:{income:'收入到账',expense:'生活与副业支出',net:'收支结余',incomeSources:'收入来源',costCategories:'支出分类',cashSummary:'现金收付汇总'}}};
    if(family==='investor')return {family,presentation:{...presentation,incomeTitle:'收入',costTitle:'支出',businessTitle:'收支与投资分析',profitLabel:'账务已实现净收益',marginLabel:'账务收益结余比例',distributionTitle:'累计账务已实现净收益',distributionNote:'投资收益保留在独立账务资料中 · 不计入本看板收入和支出'},basis:{mode:'investor',isOperatingClassified:true,label:'报告收支',note:receiptNote+' 投资收益与费用在原始记录和独立账务资料中查看。',labels:{income:'收入',expense:'支出',net:'收支结余',incomeSources:'收入来源',costCategories:'支出分类',cashSummary:'现金收付汇总'}}};
    return {family,presentation,basis:null};
  }
  function viewOf(project,options){
    let p={...project};
    const bankStatements=(project.ledger?.imports||[]).filter(batch=>batch.bankStatement).map(batch=>({name:batch.name,statement:batch.bankStatement}));
    if(bankStatements.length)p.ledgerStatement={...(statementOf(p)||{format:'combined-v1',neutralRows:[],zeroRows:[],sourceStatements:[],reconciled:false}),bankStatements};
    const bill=statementOf(p),account=options.account||'';
    if(account){
      p={...p,cash:p.cash.filter(row=>row.account===account),openingCash:null,profit:[],ar:[],balance:[]};
      if(bill){p.ledgerStatement={...bill,format:'combined-v1',sourceName:account,reconciled:false,bankStatements:(bill.bankStatements||[]).filter(batch=>batch.statement.account===account),sourceStatements:(bill.sourceStatements||[]).filter(batch=>batch.accountScope===account),neutralRows:(bill.neutralRows||[]).filter(row=>row.account===account),zeroRows:(bill.zeroRows||[]).filter(row=>row.account===account)};delete p.alipayStatement;delete p.wechatStatement;}
    }
    if(options.asOf)p.asOf=options.asOf;
    const dates=p.cash.concat(statementOf(p)?.neutralRows||[],statementOf(p)?.zeroRows||[],p.balance).map(row=>row.date).concat(p.ar.map(row=>row.invoiceDate),p.profit.map(row=>D.monthEnd(row.month)),(project.ledger?.imports||[]).map(batch=>batch.statement?.end||batch.bankStatement?.end)).filter(Boolean).sort();
    if(!dates.length)dates.push(...p.ar.map(row=>row.dueDate).filter(Boolean).sort());
    if(!p.asOf&&dates.length)p.asOf=dates.at(-1);
    return p;
  }
  function suppliedMonthSelection(project,selection){
    const statement=statementOf(project),dates=[];
    const add=date=>{if(/^\d{4}-(0[1-9]|1[0-2])(?:-\d{2})?$/.test(String(date||'')))dates.push(String(date).slice(0,7));};
    for(const row of (project.cash||[]).concat(statement?.neutralRows||[],statement?.zeroRows||[],project.balance||[]))add(row.date);
    for(const row of project.profit||[])add(row.month);
    for(const row of (project.ar||[]).concat(project.invoices||[],project.costInvoices||[])){
      add(row.recognitionDate||row.invoiceDate);for(const payment of row.payments||[])add(payment.date);
    }
    // After all source files are removed, keep saved manual records accessible.
    // Future plans and receivable due dates still never determine report time.
    if(!dates.length&&S)for(const record of S.read(project).records)if(record.type!=='plan')add(record.data.date||record.data.month);
    const availableMonthKeys=[...new Set(dates)].sort(),monthKeys=selection===0?availableMonthKeys.slice():availableMonthKeys.slice(-selection);
    const offset=availableMonthKeys.length-monthKeys.length,previousMonthKeys=selection===0?[]:availableMonthKeys.slice(Math.max(0,offset-selection),offset);
    const first=monthKeys[0],last=monthKeys.at(-1),spanMonths=first&&last?(Number(last.slice(0,4))-Number(first.slice(0,4)))*12+Number(last.slice(5))-Number(first.slice(5))+1:0;
    return {selection,monthKeys,availableMonthKeys,previousMonthKeys,spanMonths,hasGaps:spanMonths>monthKeys.length};
  }
  function refundEvidence(row){
    if(row.isRefund===true)return row.natureEvidence||'原始记录已标记为退款入账';
    if(row.incomeNature==='refund'&&row.natureEvidence)return row.natureEvidence;
    if(row.receiptExclusion?.id==='refund'&&row.receiptExclusion.confirmed===true&&row.receiptExclusion.evidence)return row.receiptExclusion.evidence;
    const values=[row.transactionType,row.category,row.summary].filter(v=>typeof v==='string').map(v=>v.trim().replace(/\s+/g,''));
    return values.find(v=>!/(?:咨询|培训|开发|设计|代办|服务费|手续费|申请中|未完成|失败)/.test(v)&&(/^(?:退款|退款收入|退款入账|退款收回|退款到账|退还|商户退款|购物退款|转账退还|原路退款|POS退货|消费退货)(?:$|[-—:：·（(])/i.test(v)||/^(?:退款收入|退款入账|退款到账|原路退款|商户退款|POS退货|消费退货)/i.test(v)))||null;
  }
  function tags(kind,row,amount){
    const result=[];
    if(amount>=5000)result.push({id:'large',label:'大额',reason:'本笔金额达到 ¥5,000'});
    if(kind==='income'){
      const refund=refundEvidence(row);if(refund)result.push({id:'refund',label:'退款',reason:refund});
      if(row.incomeNature==='payroll'&&row.natureEvidence)result.push({id:'payroll',label:'薪酬',reason:row.natureEvidence});
    }else{
      if(row.subscription===true&&row.subscriptionEvidence)result.push({id:'subscription',label:'订阅',reason:row.subscriptionEvidence});
      const plan=row.installment;
      if(plan&&Number.isInteger(plan.current)&&Number.isInteger(plan.total)&&plan.current>=1&&plan.total>=plan.current&&plan.evidence)result.push({id:'install',label:'分期',reason:plan.evidence});
    }
    return result;
  }
  function breakdown(kind,rows,available){
    const field=kind==='income'?'inflow':'outflow',groupField=kind==='income'?'counterparty':'category',partField=kind==='income'?'category':'counterparty';
    const transactions=rows.filter(row=>row[field]>0).map((row,index)=>{
      const amount=row[field];
      return {...row,key:kind+':'+index+':'+(row.account||'')+':'+(row.id||''),amount,summary:row.summary||row.product||row.transactionType||row.category||'',source:row.sourceImportName||row.sourceName||row.account||'',tags:tags(kind,row,amount)};
    });
    const grouped=new Map();
    for(const row of transactions){const name=row[groupField]||'未分类';if(!grouped.has(name))grouped.set(name,[]);grouped.get(name).push(row);}
    const total=available?sum(transactions,row=>row.amount):null;
    const items=Array.from(grouped,([name,groupRows])=>{
      const id=kind+'-group:'+contentKey(name),amount=sum(groupRows,row=>row.amount),partsMap=new Map();
      for(const row of groupRows){const partName=(kind==='cost'&&row.breakdownPart)||row[partField]||'未分类';if(!partsMap.has(partName))partsMap.set(partName,[]);partsMap.get(partName).push(row);}
      const parts=Array.from(partsMap,([partName,partRows])=>({id:id+'-part:'+contentKey(partName),name:partName,amount:sum(partRows,row=>row.amount),share:amount?sum(partRows,row=>row.amount)/amount:0,transactions:partRows})).sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name,'zh-CN'));
      return {id,name,amount,share:total?amount/total:0,parts,transactions:groupRows};
    }).sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name,'zh-CN'));
    return {kind,total,items,transactions};
  }
  function unavailable(options){
    const totals=Object.fromEntries(['cashIn','cashOut','opIn','opOut','net','opNet','openingCash','closingCash','netProfit','revenue','netMargin','transactionCount'].map(key=>[key,null]));
    return {receiptPolicy:receiptPolicy([],{}),source:options.source||'mine',sourceUnavailable:true,hasData:false,company:null,asOf:null,report:null,totals,scopeTotals:{income:null,cost:null,net:null},latest:null,latestCash:null,monthly:[],incomeGroups:[],costGroups:[],income:breakdown('income',[],false),cost:breakdown('cost',[],false),transactions:[],rawTransactions:[],neutralTransactions:[],zeroTransactions:[],ar:{rows:[],total:null,overdue:null,overdueRatio:null},balance:null,profit:[],imports:[],accounts:[],cashBalances:[],warnings:[],statement:null,isStatement:false,mode:'unavailable',isOperatingClassified:false,basisLabel:null,basisNote:null,labels:sourceBasis(null,false).labels,scopeMonth:null,availability:{source:false,cash:false,profit:false,ar:false,balance:false,closingCash:false,forecast:false,score:false}};
  }
  function applyPeriod(view,p,months,selection=null){
    const end=view.asOf,endMonth=end.slice(0,7),[year,month]=endMonth.split('-').map(Number),dateAt=offset=>new Date(Date.UTC(year,month-1+offset,1)).toISOString().slice(0,10);
    const start=selection?.monthKeys[0]?selection.monthKeys[0]+'-01':dateAt(1-months),openingDate=new Date(Date.parse(start+'T00:00:00Z')-86400000).toISOString().slice(0,10),previousStart=selection?(selection.previousMonthKeys[0]||dateAt(1-months*2).slice(0,7))+'-01':dateAt(1-months*2),previousEnd=selection?.previousMonthKeys.length?D.monthEnd(selection.previousMonthKeys.at(-1)):openingDate,label=selection&&!selection.monthKeys.length?'尚未提供带日期的记录':start.slice(0,7)+' — '+end.slice(0,7);
    const allCash=view.rawTransactions,allProfit=view.profit,allAr=view.ar.rows,allInvoices=view.statementInvoices,sourceOpening=view.totals.openingCash;
    const ownSource=view.source==='mine'?{cash:allCash,profit:allProfit,ar:allAr,neutral:view.neutralTransactions,zero:view.zeroTransactions,totals:view.totals,availability:{...view.availability},accounts:view.accounts}:null;
    const within=(date,a=start,b=end)=>date>=a&&date<=b&&(!selection||(a===start&&b===end?selection.monthKeys:selection.previousMonthKeys).includes(String(date).slice(0,7))),cash=allCash.filter(r=>within(r.date)),profit=allProfit.filter(r=>within(r.month+'-01')),operating=cash.filter(r=>includedInReceipts(r,view.isStatement,view));
    const old=view.totals,openingCash=sourceOpening==null?null:round(sourceOpening+sum(allCash.filter(r=>r.date<start),r=>r.inflow-r.outflow)),cashIn=sum(cash,r=>r.inflow),cashOut=sum(cash,r=>r.outflow),revenue=profit.length?sum(profit,r=>r.revenue):null,netProfit=profit.length?sum(profit,r=>r.netProfit):null;
    const totals={...old,cashIn,cashOut,opIn:sum(operating,r=>r.inflow),opOut:sum(operating,r=>r.outflow),net:round(cashIn-cashOut),opNet:sum(operating,r=>r.inflow-r.outflow),openingCash,closingCash:old.closingCash,revenue,netProfit,netMargin:revenue>0?netProfit/revenue:null,transactionCount:cash.length};
    let openingAr=0;
    const ar=allAr.flatMap(row=>{
      const before=row.invoiceDate<start,payments=(row.payments||[]).filter(payment=>within(payment.date)),priorPaid=sum((row.payments||[]).filter(payment=>payment.date<start),r=>r.amount);
      const initial=before?Math.max(0,round(row.amount-priorPaid)):row.amount;
      if(row.invoiceDate>end||before&&initial<=.005)return [];
      if(before)openingAr=round(openingAr+initial);
      const received=row.payments?sum(payments,r=>r.amount):before?0:row.received;
      const actualAverageDays=Number.isFinite(row.actualAverageDays)&&received>0?sum(payments,payment=>payment.amount*(Date.parse(payment.date+'T00:00:00Z')-Date.parse(row.invoiceDate+'T00:00:00Z'))/86400000)/received:null;
      return [{...row,originalInvoiceDate:row.invoiceDate,invoiceDate:before?start:row.invoiceDate,openingCarry:before,amount:before?initial:row.amount,received,payments,actualAverageDays,outstanding:row.outstanding}];
    });
    const previousCash=allCash.filter(r=>within(r.date,previousStart,previousEnd)),previousProfit=allProfit.filter(r=>within(r.month+'-01',previousStart,previousEnd)),previousOperating=previousCash.filter(r=>includedInReceipts(r,view.isStatement,view));
    const expected=Array.from({length:months},(_,i)=>dateAt(1-months*2+i).slice(0,7)),profitComplete=expected.every(m=>previousProfit.some(r=>r.month===m)),cashComplete=!!view.openingDate&&view.openingDate<previousStart;
    const previous={start:previousStart,end:previousEnd,cash:previousCash,profit:previousProfit,cashComplete,profitComplete,opIn:cashComplete?sum(previousOperating,r=>r.inflow):null,opOut:cashComplete?sum(previousOperating,r=>r.outflow):null,netProfit:profitComplete?sum(previousProfit,r=>r.netProfit):null,revenue:profitComplete?sum(previousProfit,r=>r.revenue):null};
    const income=breakdown('income',operating,view.availability.cash),cost=breakdown('cost',operating,view.availability.cash),monthly=view.monthly.filter(r=>selection?selection.monthKeys.includes(r.month):r.month>=start.slice(0,7)&&r.month<=endMonth);
    const flexibleMonthly=sum(operating.filter(r=>(p.scenario?.flexibleCategories||[]).includes(r.category)),r=>r.outflow)/months;
    const accounts=Array.from(new Set(cash.map(r=>r.account))).map(name=>({name,cashIn:sum(cash.filter(r=>r.account===name),r=>r.inflow),cashOut:sum(cash.filter(r=>r.account===name),r=>r.outflow),net:sum(cash.filter(r=>r.account===name),r=>r.inflow-r.outflow)}));
    Object.assign(view,{period:{months,start,end,label,openingDate,previousStart,previousEnd,openingAr,...(selection||{})},previousPeriod:previous,periodSource:{cash:allCash,profit:allProfit,ar:allAr,invoices:allInvoices,openingCash:sourceOpening,openingDate:view.openingDate},rawTransactions:cash,transactions:operating,profit,monthly,income,cost,incomeGroups:income.items,costGroups:cost.items,totals,accounts,scopeTotals:{income:income.total,cost:cost.total,net:income.total==null?null:round(income.total-cost.total)},cashBalances:monthly.map(r=>({month:r.month,balance:r.closingCash})),periodArRows:ar,ar:{...view.ar,rows:ar,total:sum(ar,r=>r.outstanding),overdue:sum(ar.filter(r=>r.overdue),r=>r.outstanding)},forecastBase:{opIn:totals.opIn/months,opOut:totals.opOut/months,months,label,closingCash:totals.closingCash,flexibleMonthly},statementInvoices:allInvoices.filter(r=>within(r.recognitionDate||r.invoiceDate))});
    view.ar.overdueRatio=view.ar.total>0?view.ar.overdue/view.ar.total:0;
    view.latestCash=[...monthly].reverse().find(r=>r.transactionCount>0)||null;
    view.neutralTransactions=view.neutralTransactions.filter(r=>within(r.date));view.zeroTransactions=view.zeroTransactions.filter(r=>within(r.date));
    view.report={...view.report,monthly,totals,incomeGroups:income.items,costGroups:cost.items,accounts,ar:view.ar};
    if(ownSource)refineOwnPeriod(view,p,ownSource);
    return applyReceiptPolicy(view);
  }
  // Real ledgers can be partial, neutral-only, or carry cumulative AR without
  // payment dates. A shared layout must not turn those gaps into invented facts.
  function refineOwnPeriod(view,p,source){
    const {start,end,months,openingDate,previousStart}=view.period;
    const previousMonth=view.period.previousEnd.slice(0,7),previousEnd=end===D.monthEnd(end.slice(0,7))?view.period.previousEnd:previousMonth+'-'+String(Math.min(Number(end.slice(8)),Number(D.monthEnd(previousMonth).slice(8)))).padStart(2,'0');
    view.period.previousEnd=previousEnd;
    if(end!==D.monthEnd(end.slice(0,7)))view.period.label=start+' — '+end;
    const selectedKeys=view.period.monthKeys,previousKeys=view.period.previousMonthKeys;
    const within=(date,a=start,b=end)=>date>=a&&date<=b&&(!selectedKeys||(a===start&&b===end?selectedKeys:previousKeys).includes(String(date).slice(0,7)));
    const addDay=date=>new Date(Date.parse(date+'T00:00:00Z')+86400000).toISOString().slice(0,10);
    const monthKeys=(a,b)=>{const out=[];for(let d=a.slice(0,7)+'-01';d<=b;){out.push(d.slice(0,7));const date=new Date(d+'T00:00:00Z');date.setUTCMonth(date.getUTCMonth()+1);d=date.toISOString().slice(0,10);}return out;};
    const bill=statementOf(p),records=source.cash.concat(source.neutral,source.zero);
    const windows=[];
    // Use individual file coverage rather than the union's first/last dates,
    // which would silently fill gaps between separate uploads.
    for(const item of [...(bill?.sourceStatements||[]),...(bill?.bankStatements||[])]){
      const st=item.statement||{};if(st.start&&st.end)windows.push({account:item.accountScope||st.account||'',start:st.start,end:st.end});
    }
    if(bill&&!(bill.sourceStatements?.length||bill.bankStatements?.length)&&bill.start&&bill.end)windows.push({account:'',start:bill.start,end:bill.end});
    const accounts=Array.from(new Set(records.map(row=>row.account).filter(Boolean)));
    const declared=!!view.openingDate&&source.cash.every(row=>row.date>view.openingDate);
    const covers=(a,b)=>{
      if(declared&&view.openingDate<a&&view.asOf>=b)return true;
      if(!windows.length)return false;
      return (accounts.length?accounts:['']).every(account=>{
        const spans=windows.filter(w=>w.account?w.account===account:accounts.length<=1).sort((x,y)=>x.start.localeCompare(y.start));let cursor=a;
        for(const w of spans){if(w.start>cursor)break;if(w.end>=cursor)cursor=addDay(w.end);if(cursor>b)return true;}return false;
      });
    };
    const keys=selectedKeys||monthKeys(start,end),complete=keys.length>0&&keys.every(key=>covers(key+'-01',D.monthEnd(key))),observed=new Set(records.filter(row=>within(row.date)).map(row=>row.date.slice(0,7))),allMonthsProvided=keys.every(key=>observed.has(key)),fullMonths=end===D.monthEnd(end.slice(0,7));
    const cashKnown=view.rawTransactions.length>0||view.neutralTransactions.length>0||view.zeroTransactions.length>0||complete;
    const openingSnapshot=!view.isStatement?view.balanceHistory.find(row=>row.date===openingDate):null;
    view.totals.openingCash=view.isStatement?null:typeof openingSnapshot?.cash==='number'?openingSnapshot.cash:declared&&view.openingDate<start&&source.totals.openingCash!==null?round(source.totals.openingCash+sum(source.cash.filter(row=>row.date<start),row=>row.inflow-row.outflow)):null;
    if(!cashKnown)for(const key of ['cashIn','cashOut','opIn','opOut','net','opNet'])view.totals[key]=null;
    view.income=breakdown('income',view.transactions,cashKnown);view.cost=breakdown('cost',view.transactions,cashKnown);
    view.incomeGroups=view.income.items;view.costGroups=view.cost.items;view.scopeTotals={income:view.income.total,cost:view.cost.total,net:cashKnown?round(view.income.total-view.cost.total):null};
    view.totals.transactionCount=view.rawTransactions.length;
    view.period.recordCount=view.rawTransactions.length+view.neutralTransactions.length+view.zeroTransactions.length;
    view.accounts=source.accounts.map(account=>{const rows=view.rawTransactions.filter(row=>row.account===account.name);return {...account,cashIn:sum(rows,row=>row.inflow),cashOut:sum(rows,row=>row.outflow),net:sum(rows,row=>row.inflow-row.outflow)};});
    const monthMap=new Map(view.monthly.map(row=>[row.month,row]));
    view.monthly=keys.filter(key=>observed.has(key)||covers(key+'-01',key===end.slice(0,7)?end:D.monthEnd(key))).map(key=>{
      if(monthMap.has(key))return monthMap.get(key);
      const through=source.cash.filter(row=>row.date<=D.monthEnd(key));
      return {month:key,cashIn:0,cashOut:0,opIn:0,opOut:0,net:0,opNet:0,transactionCount:0,revenue:null,netProfit:null,netMargin:null,closingCash:!view.isStatement&&source.totals.openingCash!==null?round(source.totals.openingCash+sum(through,row=>row.inflow-row.outflow)):null};
    });
    view.latestCash=[...view.monthly].reverse().find(row=>row.transactionCount>0)||null;view.cashBalances=view.monthly.map(row=>({month:row.month,balance:row.closingCash}));
    view.period.cashComplete=complete;view.period.balanceBridgeComplete=covers(start,end);view.period.cashKnown=cashKnown;view.period.providedMonths=observed.size;
    view.period.coverageNote=complete?'':cashKnown?'本期仅汇总已提供的记录，未提供的月份不视为零收支。':'尚未提供本期流水，不能视为零收支。';
    const forecastCoverage=keys.length>0&&fullMonths&&(complete||allMonthsProvided);
    view.availability={...source.availability,cash:cashKnown,profit:view.profit.length>0,forecast:source.availability.forecast&&forecastCoverage&&view.rawTransactions.length>0};
    view.forecastUnavailableReason=view.isStatement?'原始账单尚未确认经营分类和期初现金。':source.totals.closingCash===null?'补充已确认的期初现金后可推演。':!forecastCoverage?'本期流水月份未完整覆盖，无法计算可靠的月均收付。':!view.rawTransactions.length?'本期没有可用于推演的收付记录。':'';
    if(view.forecastBase)view.forecastBase.coverageNote=complete?'按所选期间月均收支推演':'按本期已提供的各月收支均值推演';
    const enoughPrevious=!previousKeys||view.period.selection!==0&&previousKeys.length===view.period.selection;
    const priorCash=source.cash.filter(row=>within(row.date,previousStart,previousEnd)),priorProfit=source.profit.filter(row=>within(D.monthEnd(row.month),previousStart,previousEnd)),priorProfitComplete=enoughPrevious&&priorProfit.length===months;
    const priorComplete=enoughPrevious&&(previousKeys?previousKeys.every(key=>covers(key+'-01',D.monthEnd(key))):covers(previousStart,previousEnd)),priorOp=priorCash.filter(row=>includedInReceipts(row,view.isStatement,view));
    Object.assign(view.previousPeriod,{monthKeys:previousKeys,balanceBridgeComplete:covers(previousStart,previousEnd),end:previousEnd,cash:priorCash,profit:priorProfit,profitComplete:priorProfitComplete,revenue:priorProfitComplete?sum(priorProfit,r=>r.revenue):null,netProfit:priorProfitComplete?sum(priorProfit,r=>r.netProfit):null,cashComplete:priorComplete,opIn:priorComplete?sum(priorOp,row=>row.inflow):null,opOut:priorComplete?sum(priorOp,row=>row.outflow):null});
    let openingAr=0,timingUnknown=false,openingUnknown=false;
    const rows=source.ar.flatMap(row=>{
      const invoice=row.invoiceDate||'',before=!!invoice&&invoice<start;
      const allPayments=(row.payments||[]).filter(payment=>payment.date&&payment.date<=end&&Number.isFinite(payment.amount)&&payment.amount>=0);
      const dated=Array.isArray(row.payments)&&allPayments.length===row.payments.length&&Math.abs(sum(allPayments,r=>r.amount)-row.received)<.011;
      if(!dated&&row.received>0){
        if((before||!invoice)&&row.outstanding<=0)return [];
        timingUnknown=true;if(before)openingUnknown=true;
        return [{...row,originalInvoiceDate:invoice,openingCarry:before,openingAmount:null,periodReceived:null,receiptTimingUnknown:true,lifetimeAverageDays:row.actualAverageDays,actualAverageDays:null}];
      }
      const payments=allPayments.filter(payment=>within(payment.date)),received=dated?sum(payments,r=>r.amount):row.received;
      const initial=round(row.amount-sum(allPayments.filter(payment=>payment.date<start),r=>r.amount));
      if(before&&initial<=0)return [];
      if(before)openingAr=round(openingAr+initial);
      const average=dated&&received>0&&invoice?sum(payments,payment=>payment.amount*(Date.parse(payment.date+'T00:00:00Z')-Date.parse(invoice+'T00:00:00Z'))/86400000)/received:null;
      return [{...row,originalInvoiceDate:invoice,invoiceDate:before?start:invoice,openingCarry:before,originalAmount:row.amount,amount:initial,received,periodReceived:received,payments,actualAverageDays:average}];
    });
    view.period.openingAr=openingUnknown?null:openingAr;view.period.arTimingIncomplete=timingUnknown;
    view.periodArRows=rows.map(row=>row.receiptTimingUnknown?{...row,invoiceDate:row.openingCarry?start:row.invoiceDate,amount:row.outstanding,received:0}:row);
    view.ar=source.availability.ar?{...view.ar,rows,total:sum(rows,r=>r.outstanding),overdue:sum(rows.filter(r=>r.overdue),r=>r.outstanding)}:{rows:[],total:null,overdue:null,overdueRatio:null};
    if(source.availability.ar)view.ar.overdueRatio=view.ar.total>0?view.ar.overdue/view.ar.total:0;
    view.report={...view.report,monthly:view.monthly,totals:view.totals,incomeGroups:view.income.items,costGroups:view.cost.items,accounts:view.accounts,ar:view.ar};
  }
  function build(project,options={}){
    if(project===null||project===undefined)return unavailable(options);
    if((options.source||'mine')==='mine'){
      if(project.ledger&&!L)throw Error('读取账本备份需要加载原软件的账本组件。');
      if(L)project=L.migrate(project);
    }
    const validation=D.validateProject(project);if(!validation.valid){const error=Error('账本未通过原软件的数据校验');error.details=validation.errors;throw error;}
    const source=options.source||'mine',hasPeriod=options.periodMonths!==undefined&&options.periodMonths!==null&&[0,1,3,6,12].includes(Number(options.periodMonths)),selection=source==='mine'&&hasPeriod?suppliedMonthSelection(project,Number(options.periodMonths)):null;
    const suppliedEnd=selection?.monthKeys.length?D.monthEnd(selection.monthKeys.at(-1)):null;
    const originalProject=project,base=viewOf(project,suppliedEnd?{...options,asOf:suppliedEnd}:options);
    // Choose the uploaded-data period before projecting supplements. A future
    // due date, cash plan or balance confirmation cannot move that period.
    if(source==='mine'&&S&&!base.asOf)base.asOf=S.context(project).asOf||base.asOf;
    const p=source==='mine'&&S?S.projectForReport(base,{...options,asOf:base.asOf}):base,statement=statementOf(p),isStatement=source!=='random'&&!!statement&&Array.isArray(statement.neutralRows);
    // Only a calculation projection changes activity; original rows and all-cash
    // movements remain untouched, including the full cash balance bridge. The
    // engine needs a non-operating activity for excluded operating records;
    // use its investing bucket only in this projection, never its transfer
    // bucket (which would fabricate unmatched-account warnings).
    const familyContext=familyBasis(p,source),basis=familyContext.basis||sourceBasis(statement,isStatement);
    const eligible=row=>includedInReceipts(row,isStatement,familyContext);
    const excludedIds=new Set(p.cash.filter(row=>!eligible(row)).map(row=>row.id).filter(Boolean));
    const engineProject={...p,cash:p.cash.map(row=>({...row,activity:eligible(row)?'operating':row.activity==='operating'?'investing':row.activity})),ar:p.ar.filter(row=>!row.collectionOnly||!excludedIds.has(row.sourceCashId)),...(isStatement?{openingCash:null}:{})};
    const report=D.buildReport(engineProject),rawTransactions=p.cash.filter(row=>row.date<=report.asOf);
    const neutralTransactions=(statement?.neutralRows||[]).filter(row=>row.date<=report.asOf),zeroTransactions=(statement?.zeroRows||[]).filter(row=>row.date<=report.asOf);
    const inMonth=row=>!options.month||row.date.slice(0,7)===options.month;
    const operating=rawTransactions.filter(row=>eligible(row)&&inMonth(row));
    const hasCash=rawTransactions.length>0,hasStatementRecords=isStatement&&(neutralTransactions.length>0||zeroTransactions.length>0),hasFlowScope=hasCash||hasStatementRecords;
    const income=breakdown('income',operating,hasFlowScope),cost=breakdown('cost',operating,hasFlowScope);
    const profit=p.profit.filter(row=>D.monthEnd(row.month)<=report.asOf).map(row=>({...row,netProfit:round(row.revenue-row.cost-row.expenses-row.tax)}));
    const arRows=report.ar.rows.map(row=>({...row,termDays:row.invoiceDate?Math.round((Date.parse(row.dueDate+'T00:00:00Z')-Date.parse(row.invoiceDate+'T00:00:00Z'))/86400000):null,actualAverageDays:Number.isFinite(row.actualAverageDays)?row.actualAverageDays:null}));
    const batchRows=batch=>(batch.rows||[]).concat(batch.statement?.neutralRows||[],batch.statement?.zeroRows||[],batch.bankStatement?.zeroRows||[]);
    const imports=(project.ledger?.imports||[]).filter(batch=>!options.account||batch.accountScope===options.account||batchRows(batch).some(row=>row.account===options.account)).map(batch=>{
      const rows=(batch.rows||[]).concat(batch.statement?.neutralRows||[],batch.statement?.zeroRows||[],batch.bankStatement?.zeroRows||[]),dates=rows.map(row=>row.date||row.month||row.invoiceDate).filter(Boolean).sort();
      return {id:batch.id,name:batch.name,kind:batch.kind,sourceType:batch.sourceType,account:batch.accountScope||Array.from(new Set(rows.map(row=>row.account).filter(Boolean))).join('、'),count:rows.length,importedAt:batch.importedAt||null,start:batch.statement?.start||batch.bankStatement?.start||dates[0]||null,end:batch.statement?.end||batch.bankStatement?.end||dates.at(-1)||null};
    });
    const latestCash=[...report.monthly].reverse().find(month=>month.transactionCount>0)||null;
    const accounts=report.accounts.slice();
    for(const row of neutralTransactions.concat(zeroTransactions))if(!accounts.some(account=>account.name===row.account))accounts.push({name:row.account,cashIn:0,cashOut:0,net:0});
    const availability={source:true,cash:hasCash,profit:profit.length>0,ar:engineProject.ar.length>0,balance:report.balance!==null,closingCash:report.totals.closingCash!==null&&hasCash,forecast:!isStatement&&report.totals.closingCash!==null&&latestCash!==null&&operating.length>0,score:false};
    const view={source,sourceUnavailable:false,hasData:hasCash||profit.length>0||p.ar.length>0||p.balance.length>0||neutralTransactions.length>0||zeroTransactions.length>0,company:report.company||'我的企业',asOf:report.asOf,report,totals:report.totals,latest:report.latest,latestCash,monthly:report.monthly,incomeGroups:report.incomeGroups,costGroups:report.costGroups,income,cost,transactions:operating,rawTransactions,neutralTransactions,zeroTransactions,ar:{...report.ar,rows:arRows},balance:report.balance,profit,imports,accounts,cashBalances:report.monthly.map(month=>({month:month.month,balance:month.closingCash})),warnings:report.warnings,statement,isStatement,scopeMonth:options.month||null,scopeTotals:{income:income.total,cost:cost.total,net:hasFlowScope?round(income.total-cost.total):null},availability};
    view.balanceHistory=(!options.account&&p.openingBalance&&!p.balance.some(row=>row.date===p.openingBalance.date)?[p.openingBalance,...p.balance]:p.balance).filter(row=>row.date<=report.asOf).map(row=>({...row}));
    view.statementInvoices=(p.invoices||[]).filter(row=>(row.recognitionDate||row.invoiceDate)<=report.asOf).map(row=>({...row}));
    view.openingDate=options.account?null:p.scenario?.openingDate||p.openingDate||null;
    Object.assign(view,{family:familyContext.family,presentation:familyContext.presentation,mode:basis.mode,isOperatingClassified:basis.isOperatingClassified,basisLabel:basis.label,basisNote:basis.note,labels:basis.labels});
    if(!availability.ar)view.ar=familyContext.family==='business'?{rows:[],total:null,overdue:null,overdueRatio:null}:{rows:[],total:0,overdue:0,overdueRatio:0};
    const result=selection?applyPeriod(view,p,Math.max(1,selection.monthKeys.length),selection):[1,3,6,12].includes(Number(options.periodMonths))?applyPeriod(view,p,Number(options.periodMonths)):applyReceiptPolicy(view);
    const supplemented=source==='mine'&&S?S.decorate(result,originalProject,options):result;
    return source==='mine'&&OwnCash?OwnCash.decorate(supplemented,originalProject,options):supplemented;
  }
  return Object.freeze({build,adapt:build,empty,transactionTags:tags,classifyReceipt,includedInReceipts});
});
