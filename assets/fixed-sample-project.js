/* Adapt the original fictional example to the shared report model.
 * Monthly cash/accounting totals and the September breakdown are authoritative.
 * Earlier transaction-level allocations are explicitly synthetic, not new facts
 * about a real business. No storage access and no random-persona dependency. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./demo-breakdown.js'));
  else root.YoushuFixedSampleProject=factory(root.YoushuDemoBreakdown);
})(typeof globalThis!=='undefined'?globalThis:this,function(defaultBreakdown){
  'use strict';
  const round=n=>Math.round(n*100)/100;
  const total=(rows,get)=>round(rows.reduce((n,row)=>n+get(row),0));
  const copy=value=>JSON.parse(JSON.stringify(value));
  const monthEnd=month=>new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5)),0)).toISOString().slice(0,10);
  // Allocate cents with a deterministic remainder so the source total never drifts.
  function allocate(amount,weights){
    const denominator=weights.reduce((n,v)=>n+v,0),cents=Math.round(amount*100);
    let remaining=cents;
    return weights.map((weight,index)=>{
      const value=index===weights.length-1?remaining:Math.round(cents*weight/denominator);
      remaining-=value;return value/100;
    });
  }
  function create(source,breakdownApi){
    if(!source?.monthlyAccounting?.rows?.length)throw Error('缺少原始示例的月度账务数据。');
    const api=breakdownApi||defaultBreakdown;
    if(!api?.buildData)throw Error('缺少原始示例的收入成本明细。');
    const original=copy(source),breakdown=api.buildData(original),months=original.monthlyAccounting.rows;
    const lastMonth=months.at(-1).period,asOf=original.scenario.asOf;
    const first=months[0].period,openingDate=new Date(Date.parse(first+'-01T00:00:00Z')-86400000).toISOString().slice(0,10);
    const allocationNote='原示例仅提供历史月度汇总；历史收款按原示例末月客户与服务构成分配，历史付款保留每月创始人薪酬和已付税费后按末月其他成本构成分配。交易日期沿用示例明细的月内日期，均为虚构演示分配；原始月度收付、利润、应收和期末余额保持不变。';
    const project={schemaVersion:1,company:'星辰AI应用工作室',openingCash:original.openingCash2025Oct,openingDate,asOf,cash:[],profit:[],ar:[],balance:[],invoices:[],costInvoices:[],advanceContracts:[]};
    const incomeTemplates=breakdown.income.items.flatMap(item=>item.transactions),otherCosts=breakdown.cost.items.filter(item=>item.name!=='创始人薪酬');
    function append(kind,template,amount,month){
      if(amount<=0)return;
      const row=copy(template),date=month+row.date.slice(7,10),id='fixed-'+month+'-'+row.id;
      const cash={id,date,time:row.date.slice(11),account:'经营账户',counterparty:row.counterparty,category:kind==='income'?row.partName:row.itemName,inflow:kind==='income'?amount:0,outflow:kind==='cost'?amount:0,activity:'operating',summary:row.summary,sourceImportName:row.source,synthetic:true,allocationMethod:month===lastMonth?'original-example-detail':'historical-proportional-allocation'};
      if(kind==='cost')cash.breakdownPart=row.partName;
      for(const key of ['subscription','subscriptionEvidence','automatic','paymentEvidence','incomeNature','natureEvidence'])if(row[key]!==undefined)cash[key]=row[key];
      // A single given instalment does not establish an invented historical plan.
      if(month===lastMonth&&row.installment)cash.installment=row.installment;
      if(month!==lastMonth&&row.installment)cash.summary=row.partName+' · 示例月度结算';
      project.cash.push(cash);
    }
    for(const accounting of months){
      const month=accounting.period;
      const incomeAmounts=allocate(accounting.cashIn,incomeTemplates.map(row=>row.amount));
      incomeTemplates.forEach((row,index)=>append('income',row,incomeAmounts[index],month));
      if(month===lastMonth){
        for(const item of breakdown.cost.items)for(const row of item.transactions)append('cost',row,row.amount,month);
      }else{
        const salary=breakdown.cost.items.find(item=>item.name==='创始人薪酬');
        const salaryAmounts=allocate(accounting.founderSalary,salary.transactions.map(row=>row.amount));
        salary.transactions.forEach((row,index)=>append('cost',row,salaryAmounts[index],month));
        const amounts=allocate(round(accounting.cashOut-accounting.founderSalary-accounting.taxPaid),otherCosts.map(item=>item.amount));
        otherCosts.forEach((item,index)=>{
          const parts=allocate(amounts[index],item.transactions.map(row=>row.amount));
          item.transactions.forEach((row,part)=>append('cost',row,parts[part],month));
        });
        if(accounting.taxPaid)append('cost',{id:'tax-paid',itemName:'税费',partName:'已付税费',date:lastMonth+'-28 15:00',counterparty:'税费缴纳',summary:'示例已付税费',source:'招商银行'},accounting.taxPaid,month);
      }
      project.profit.push({month,revenue:accounting.revenue,cost:accounting.cogs,expenses:round(accounting.sales+accounting.admin+accounting.finance),tax:accounting.tax,netProfit:accounting.netProfit,depreciation:accounting.depreciation,founderSalary:accounting.founderSalary,sales:accounting.sales,admin:accounting.admin,finance:accounting.finance,synthetic:true});
    }
    project.cash.sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||Number(b.inflow>0)-Number(a.inflow>0)||a.id.localeCompare(b.id));
    let running=project.openingCash;
    project.cash.forEach((row,index)=>{running=round(running+row.inflow-row.outflow);row.balance=running;row.sourceRow=index+1;});
    // Settled records link to their actual synthetic cash row. The source does
    // not contain historical contractual dates, so collection averages stay unknown.
    for(const row of project.cash.filter(row=>row.inflow>0)){
      const id='invoice-'+row.id;row.invoiceId=id;
      project.invoices.push({id,customer:row.counterparty,category:row.category,invoiceDate:row.date,recognitionDate:row.date,dueDate:row.date,amount:row.inflow,received:row.inflow,outstanding:0,payments:[{date:row.date,amount:row.inflow,cashId:row.id}],actualAverageDays:null,termsKnown:false,collectionOnly:true,synthetic:true,allocationMethod:row.allocationMethod,recordType:'示例已收款服务'});
    }
    // These seven synthetic claims preserve every source cohort and customer
    // outstanding/overdue amount. Dates express its supplied 30/90 day terms.
    const claims=[
      ['澄明电商',8000,'2026-07-15','2026-08-14'],
      ['鹿鸣教育',4000,'2026-07-15','2026-10-13'],
      ['澄明电商',8000,'2026-08-15','2026-09-14'],
      ['禾川咨询',8000,'2026-08-15','2026-09-14'],
      ['鹿鸣教育',8000,'2026-08-15','2026-11-13'],
      ['澄明电商',14000,'2026-09-08','2026-10-08'],
      ['禾川咨询',10000,'2026-09-12','2026-10-12']
    ];
    claims.forEach(([customer,amount,invoiceDate,dueDate],index)=>{
      const item=breakdown.income.items.find(row=>row.name===customer);
      project.invoices.push({id:'fixed-unpaid-'+index,customer,category:item.parts[0][0],invoiceDate,recognitionDate:invoiceDate,dueDate,amount,received:0,outstanding:amount,payments:[],actualAverageDays:null,termsKnown:true,synthetic:true,allocationMethod:'original-ar-cohort-allocation',recordType:'示例已确认未收款服务'});
    });
    project.invoices.sort((a,b)=>a.invoiceDate.localeCompare(b.invoiceDate)||a.id.localeCompare(b.id));
    project.ar=project.invoices.map(copy);
    const opening={date:openingDate,cash:project.openingCash,receivables:0,inventory:0,fixedAssets:48000,otherAssets:0,payables:0,taxPayable:0,debt:0,otherLiabilities:0,capital:100000,retainedEarnings:28000};
    project.openingBalance=copy(opening);project.balance.push(copy(opening));
    let current=opening;
    months.forEach((row,index)=>{
      current={...current,date:monthEnd(row.period),cash:original.balances[index],receivables:round(current.receivables+row.arIncrease),fixedAssets:round(current.fixedAssets-row.depreciation),payables:round(current.payables+row.apIncrease),taxPayable:round(current.taxPayable+row.taxPayableIncrease),retainedEarnings:round(current.retainedEarnings+row.netProfit)};
      project.balance.push(current);
    });
    const year=asOf.slice(0,4),yearProfit=total(project.profit.filter(row=>row.month.startsWith(year)),row=>row.netProfit),reportProfit=total(project.profit,row=>row.netProfit),yearCarry=round(current.retainedEarnings-yearProfit);
    project.distribution={carry:yearCarry,yearCarry,openingCarry:opening.retainedEarnings,dividends:0,yearDividends:0,reportDividends:0,adjustments:0,capital:opening.capital,netProfit:yearProfit,reportNetProfit:reportProfit,retained:yearProfit,distributable:current.retainedEarnings,periodLabel:year+'年1—'+Number(asOf.slice(5,7))+'月',reportPeriodLabel:first+' — '+lastMonth,openingDate};
    project.scenario={family:'business',profileId:'fixed-example',profileIndex:-1,id:'fixed-example',name:'原始示例',business:'AI 智能体与工作流服务工作室',customerLabel:'客户',recordDateLabel:'收入确认日期',fictional:true,isSynthetic:true,generatorVersion:1,openingDate,openingCapital:opening.capital,equityFunding:0,periodLabel:first+' — '+lastMonth,flexibleCategories:['模型 API 调用','按需交付协作','推广获客'],services:[...new Set(incomeTemplates.map(row=>row.partName))],clientNames:breakdown.income.items.map(row=>row.name),clients:breakdown.income.items.map(item=>({name:item.name,services:item.parts.map(part=>part[0]),weight:item.amount/breakdown.income.total})),costCategories:breakdown.cost.items.map(item=>item.name),allocationNote,provenance:original.scenario.provenance,providedArAverages:{'澄明电商':48,'禾川咨询':42,'鹿鸣教育':58},providedArAverageNote:'原示例汇总平均回款天数保留为来源元数据；缺少对应历史收款日期，明细报告不据此编造逐笔回款天数。',priorYearComparison:original.priorYearComparison};
    return project;
  }
  return {create};
});
