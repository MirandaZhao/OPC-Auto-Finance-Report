/* Generated random reports. Every conclusion is derived from the generated ledger.
 * The scores are fixed illustrative management rules, not an external rating. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.YoushuScenarioInsights=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const round=n=>Math.round((n+Number.EPSILON)*100)/100;
  const sum=(rows,get)=>round(rows.reduce((n,r)=>n+(Number(get(r))||0),0));
  const finite=n=>typeof n==='number'&&Number.isFinite(n);
  const clamp=n=>Math.max(0,Math.min(100,n));
  const money=n=>finite(n)?'¥'+n.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}):'待补充';
  const pct=n=>finite(n)?(n*100).toFixed(1)+'%':'待补充';
  const point=n=>Math.abs(n*100).toFixed(1)+' 个百分点';
  const days=(a,b)=>Math.round((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/86400000);
  const status=score=>score==null?'待补充':score>=80?'稳健':score>=60?'关注':'优先处理';
  const totals=rows=>({revenue:sum(rows,r=>r.revenue),cost:sum(rows,r=>r.cost),expenses:sum(rows,r=>r.expenses),tax:sum(rows,r=>r.tax),net:sum(rows,r=>r.netProfit??(r.revenue-r.cost-r.expenses-r.tax))});
  const byAmount=(rows,name,amount)=>{const map=new Map();for(const r of rows){const key=name(r)||'未分类';map.set(key,round((map.get(key)||0)+(Number(amount(r))||0)));}return Array.from(map,([name,amount])=>({name,amount})).sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name,'zh-CN'));};
  function householdInsights(project,model){
    const investor=model.family==='investor',family=model.family,sc=project.scenario||{},asOf=model.asOf,year=asOf.slice(0,4),profit=model.profit.slice().sort((a,b)=>a.month.localeCompare(b.month));
    const months=model.monthly,recentMonths=months.slice(-3).map(r=>r.month),previousMonths=months.slice(-6,-3).map(r=>r.month);
    const recent=totals(profit.filter(r=>recentMonths.includes(r.month))),previous=totals(profit.filter(r=>previousMonths.includes(r.month))),all=totals(profit),annual=totals(profit.filter(r=>r.month.startsWith(year+'-')));
    const paymentMonth=model.latestCash.month,paymentRows=model.transactions.filter(r=>r.date.startsWith(paymentMonth)),monthlyPayment=sum(paymentRows,r=>r.outflow),closing=model.totals.closingCash,runway=monthlyPayment>0?closing/monthlyPayment:null;
    const flexibleRows=paymentRows.filter(r=>(sc.flexibleCategories||[]).includes(r.category)),flexibleMonthly=sum(flexibleRows,r=>r.outflow),flexible=byAmount(flexibleRows,r=>r.category,r=>r.outflow),largestFlexible=flexible[0]||null;
    const recentCosts=byAmount(model.cost.transactions.filter(r=>recentMonths.includes(r.date.slice(0,7))),r=>r.category,r=>r.outflow),largestCost=recentCosts[0]||null;
    const income=model.income.items,largest=income[0]||null,largestShare=largest?.share||0,margin=recent.revenue>0?recent.net/recent.revenue:null,expenseRatio=recent.revenue>0?(recent.cost+recent.expenses)/recent.revenue:null,previousExpenseRatio=previous.revenue>0?(previous.cost+previous.expenses)/previous.revenue:null,costDelta=expenseRatio!=null&&previousExpenseRatio!=null?expenseRatio-previousExpenseRatio:null;
    const revenueChange=previous.revenue>0?recent.revenue/previous.revenue-1:null,assets=model.balance?.assets||0,debt=model.balance?.debt||0,debtRatio=assets>0?debt/assets:0,activeMonths=profit.filter(r=>r.revenue>0).length,inflowContinuity=months.length?activeMonths/months.length:0;
    const investments=sc.investment||{},holdings=investments.holdings||[],holdingsCost=sum(holdings,r=>r.cost),topHolding=holdings.slice().sort((a,b)=>b.cost-a.cost)[0],topHoldingShare=holdingsCost>0?(topHolding?.cost||0)/holdingsCost:0;
    const period=recentMonths[0]+'—'+recentMonths.at(-1),name=investor?'已实现净收益':'收支结余',dimension=(id,title,score,metric,rule,explanation,rows)=>({id,name:title,score:finite(score)?Math.round(clamp(score)):null,metric,rule,status:status(finite(score)?Math.round(clamp(score)):null),explanation,rows});
    const dimensions=investor?[
      dimension('profit','收益结余',margin==null?null:margin*100,'已实现收益结余比例 '+pct(margin),'已实现净收益÷已实现收益收入×100；上下限0和100。只衡量已实现收入扣除费用与亏损后的保留比例，不是投资回报率。',`近3个月已实现收入 ${money(recent.revenue)}，已实现净收益 ${money(recent.net)}。本金回收不计为收益。`,[['期间',period],['已实现收益收入',recent.revenue],['费用与已实现亏损',round(recent.cost+recent.expenses)],['已实现净收益',recent.net]]),
      dimension('cash','现金留存',assets>0?closing/assets/.2*100:null,'现金占账面资产 '+pct(assets>0?closing/assets:null),'期末现金占账面资产比例÷20%×100，上限100。20%仅为本演示观察刻度，不是配置建议。',`现金 ${money(closing)}，持仓成本 ${money(holdingsCost)}。持仓没有按未来售价计为现金。`,[['期末现金',closing],['持仓成本',holdingsCost],['账面资产',assets]]),
      dimension('collection','收益记录',inflowContinuity*100,'有已实现收入的月份 '+activeMonths+'/'+months.length,'有已实现收入的月份数÷报告月份数×100；不表示收益稳定或未来持续。',`报告中 ${activeMonths} 个月记录了分红或已实现收益，未实现涨跌没有计入。`,profit.map(r=>[r.month,r.revenue])),
      dimension('customer','持仓分散',holdingsCost>0?(0.8-topHoldingShare)/.6*100:null,'最大持仓成本占比 '+pct(holdingsCost>0?topHoldingShare:null),'最大持仓成本占比20%以内记100分，80%及以上记0分，中间线性。仅为演示集中度刻度，不评估资产风险。',topHolding?`${topHolding.name}成本 ${money(topHolding.cost)}，占持仓成本 ${pct(topHoldingShare)}。`:'当前没有持仓成本记录。',holdings.map(r=>[r.name,r.cost])),
      dimension('cost','费用控制',all.revenue>0?100-(investments.fees||0)/all.revenue*200:null,'费用占已实现收入 '+pct(all.revenue>0?(investments.fees||0)/all.revenue:null),'100－费用占已实现收入比例×200，下限0。费用不含本金买入，也不把未实现涨跌当作成本。',`报告期间费用 ${money(investments.fees||0)}，已实现收入 ${money(all.revenue)}。`,[['费用合计',investments.fees||0],['已实现收入',all.revenue],['费用记录',sc.costCategories?.join('、')||'按账本分类']])
    ]:[
      dimension('profit','结余能力',margin==null?null:margin/.25*100,'近3个月结余率 '+pct(margin),'税后到账及副业收入减生活与副业支出后，结余率÷25%×100，上下限0和100。25%仅为演示预算刻度。',`近3个月收入 ${money(recent.revenue)}，收支结余 ${money(recent.net)}。`,[['期间',period],['到账收入',recent.revenue],['生活与副业支出',round(recent.cost+recent.expenses)],['收支结余',recent.net]]),
      dimension('cash','现金缓冲',runway==null?null:runway/6*100,'支出覆盖 '+(runway==null?'待补充':runway.toFixed(2)+' 个月'),'当前现金÷最近一月生活与副业支出÷6×100，上限100。6个月是演示预算刻度。',`现金 ${money(closing)}，${paymentMonth} 已支付支出 ${money(monthlyPayment)}。`,[['当前现金',closing],['基准月份',paymentMonth],['基准月支出',monthlyPayment]]),
      dimension('collection','收入连续',inflowContinuity*100,'有到账收入的月份 '+activeMonths+'/'+months.length,'有到账收入的月份数÷报告月份数×100。历史记录不保证未来收入。',`${activeMonths} 个月有工资或副业到账，工资按税后收入记录。`,profit.map(r=>[r.month,r.revenue])),
      dimension('customer','借款负担',(1-debtRatio/.5)*100,'借款占账面资产 '+pct(debtRatio),'100－借款占账面资产比例÷50%×100，下限0。只用于本演示账本对比。',debt>0?`账面借款 ${money(debt)}，后续还款应与生活预算一起安排。`:'当前账本没有借款余额。', [['借款余额',debt],['账面资产',assets]]),
      dimension('cost','支出控制',expenseRatio==null?null:100-Math.max(0,expenseRatio-.75)*200-Math.max(0,costDelta||0)*200,'近3个月支出占收入 '+pct(expenseRatio),'支出占收入75%以内记100分，超出每1个百分点扣2分；比前3个月增加每1个百分点再扣2分，下限0。',largestCost?`${largestCost.name}是近3个月最大支出分类，合计 ${money(largestCost.amount)}。`:'按已支付生活与副业支出计算。',[['近3个月支出',round(recent.cost+recent.expenses)],['近3个月收入',recent.revenue],['前3个月支出占比',pct(previousExpenseRatio)]])
    ];
    const scored=dimensions.filter(d=>d.score!=null),score=scored.length?Math.round(scored.reduce((n,d)=>n+d.score,0)/scored.length):null;
    const action=(priority,title,description,expected,condition,rows)=>({priority,status:priority<60?'关注':'按计划',title,description,expected,condition,rows});
    let actions;
    if(investor){
      actions=[
        action(recent.net<0?15:85,recent.net<0?'核对已实现亏损来源':'分开核对收益与本金',`近3个月已实现净收益 ${money(recent.net)}；报告期间回收本金 ${money(investments.salePrincipal||0)} 单列投资现金流。`,'用已实现损益记录判断结果，避免将卖出回款全额计为收入。','持仓按成本列示，本报告没有计算未实现涨跌或预测投资收益。',[['近3个月已实现净收益',recent.net],['回收本金',investments.salePrincipal||0],['累计已实现净收益',all.net]]),
        action(topHoldingShare>.5?30:95,'核对持仓成本与资金分布',topHolding?`最大持仓 ${topHolding.name}，成本 ${money(topHolding.cost)}，占 ${pct(topHoldingShare)}。`:'当前账面没有持仓。','按持仓逐项核对买入成本、已卖出本金和剩余成本。','这里只核对账本和集中度，不按虚构数据给出买卖决策。',holdings.map(r=>[r.name,r.cost])),
        action(70,'检查交易与管理费用',`报告期间费用 ${money(investments.fees||0)}，占已实现收入 ${pct(all.revenue>0?(investments.fees||0)/all.revenue:null)}。`,'按渠道核对佣金和服务费，确认费用没有与本金重复入账。','实际费用以成交或服务记录为准。',[['费用',investments.fees||0],['已实现收益收入',all.revenue],['期末现金',closing]])
      ];
    }else{
      const personal=sc.personal||{},saving=round(flexibleMonthly*.1);
      actions=[
        action(recent.net<0?10:90,recent.net<0?'先调整支出预算':'分别记录工资和副业收入',`报告期间税后工资 ${money(personal.salaryIncome||0)}，副业到账 ${money(personal.sidegigIncome||0)}，近3个月结余 ${money(recent.net)}。`,recent.net<0?`在收入不变的假设下，近3个月需减少 ${money(-recent.net)} 支出才能收支平衡。`:'把副业收入与副业投入对应，保留每月真实结余。','工资使用税后到账金额，不重复扣个人所得税；转账不计为收入。',[['税后工资',personal.salaryIncome||0],['副业到账',personal.sidegigIncome||0],['副业支出',personal.sidegigCost||0],['近3个月结余',recent.net]]),
        action(runway!=null&&runway<3?20:100,'安排近期现金预算',`当前现金 ${money(closing)}，按 ${paymentMonth} 支出 ${money(monthlyPayment)} 可覆盖 ${runway==null?'—':runway.toFixed(2)} 个月。`,'把固定生活开销与可调整支出分开安排。','只使用已到账现金；未来工资或副业订单没有提前加进余额。',[['当前现金',closing],['最近一月支出',monthlyPayment],['3个月支出参考',round(monthlyPayment*3)]]),
        action(costDelta>0?40:95,`复核${largestFlexible?.name||'可调整支出'}`,`${paymentMonth} 选定弹性支出 ${money(flexibleMonthly)}${largestFlexible?'，其中'+largestFlexible.name+' '+money(largestFlexible.amount):''}。`,saving>0?`若这些支出减少10%，每月可少付 ${money(saving)}。`:'按分类核对每月预算。','节省金额是情景假设，不改变已经发生的支出。',[['弹性支出',flexibleMonthly],['假设少付',saving]])
      ];
    }
    actions.sort((a,b)=>a.priority-b.priority);actions=actions.map((a,i)=>({...a,order:i+1}));
    const readings=[
      {title:investor?'已实现投资结果':'工资与副业收支',text:`报告期间收入 ${money(all.revenue)}，${name} ${money(all.net)}。${investor?'回收本金、追加投入和未实现涨跌均不计入已实现收入。':'工资按税后到账计算，生活与副业支出分别记录。'}`},
      {title:investor?'现金与持仓':'现金缓冲',text:investor?`期末现金 ${money(closing)}，剩余持仓成本 ${money(holdingsCost)}，未用市场估值替代可用现金。`:`期末现金 ${money(closing)}，按 ${paymentMonth} 支出水平可覆盖 ${runway==null?'—':runway.toFixed(2)} 个月。`},
      {title:investor?'资金来源与去向':'收入构成',text:investor?`期间追加本金 ${money(investments.principalContributions||0)}，买入本金 ${money(investments.purchases||0)}，卖出回收本金 ${money(investments.salePrincipal||0)}。`:`税后工资 ${money(sc.personal?.salaryIncome||0)}，副业到账 ${money(sc.personal?.sidegigIncome||0)}，副业成本 ${money(sc.personal?.sidegigCost||0)}。`},
      {title:investor?'费用与已实现亏损':'生活与副业支出',text:`近3个月支出 ${money(recent.cost+recent.expenses)}${largestCost?'，最大分类为'+largestCost.name+' '+money(largestCost.amount):''}。${investor?'本金买入单列投资活动，不混入费用。':'转账和借款本金不作为生活消费。'}`}
    ];
    const raw=project.distribution||{},carry=raw.yearCarry??raw.carry??0,dividends=raw.yearDividends??raw.dividends??0,adjustments=raw.adjustments??0,retained=round(annual.net-dividends-adjustments),distributable=round(carry+retained),periodLabel=raw.periodLabel||`${year}年1—${Number(asOf.slice(5,7))}月`;
    const distribution={ready:true,title:model.presentation.distributionTitle,netProfit:annual.net,revenue:annual.revenue,cost:round(annual.cost+annual.expenses),tax:annual.tax,beforeTax:round(annual.revenue-annual.cost-annual.expenses),carry,dividends,adjustments,retained,distributable,available:Math.max(0,distributable),periodLabel,carryAsOf:year+'-01-01',note:model.presentation.distributionNote,rows:[{label:investor?'已实现收益收入':'税后及副业收入',value:annual.revenue},{label:investor?'费用与已实现亏损':'生活与副业支出',value:round(annual.cost+annual.expenses)},{label:'本年'+name,value:annual.net},{label:'本年提取',value:dividends},{label:'其他调整',value:adjustments},{label:'本年留存'+name,value:retained},{label:'上年结转',value:carry},{label:'累计'+name,value:distributable}]};
    return {family,business:sc.business,overview:`近3个月${name} ${money(recent.net)} · ${investor?'本金与收益分开记录':'收入与生活支出分开记录'}`,dimensions,score,status:scored.some(d=>d.score<60)?'有短板需关注':status(score),method:'五项等权平均 · 使用本画像的演示管理规则 · 不作为投资或信用评级',readings,actions,distribution,metrics:{recentMonths,previousMonths,recent,previous,margin,expenseRatio,previousExpenseRatio,costDelta,revenueChange,paymentMonth,monthlyPayment,closing,runway,outstanding:0,overdue:0,overdueRatio:0,actualAverageDays:null,largestCustomer:largest?.name||null,largestShare,largestCost,largestFlexible,flexibleMonthly,paidTotal:sum(model.ar.rows,r=>r.received),year,period,holdingsCost,topHoldingShare}};
  }
  function periodInsights(project,model){
    const p=model.period,family=model.family||'business',personal=family!=='business',investor=family==='investor',cash=model.rawTransactions,books=model.profit,ar=model.ar,prior=model.previousPeriod,cur=totals(books),before=totals(prior.profit),avg=model.forecastBase.opOut,closing=model.totals.closingCash,runway=avg>0&&finite(closing)?closing/avg:null;
    const margin=cur.revenue>0?cur.net/cur.revenue:null,expenseRatio=cur.revenue>0?(cur.cost+cur.expenses)/cur.revenue:null,previousRatio=prior.profitComplete&&before.revenue>0?(before.cost+before.expenses)/before.revenue:null,costDelta=expenseRatio!=null&&previousRatio!=null?expenseRatio-previousRatio:null,revenueChange=prior.profitComplete&&before.revenue>0?cur.revenue/before.revenue-1:null;
    const largest=model.income.items[0],share=largest?.share||0,costs=model.cost.items,largestCost=costs[0]||null,flexNames=project.scenario?.flexibleCategories||[],flex=model.cost.transactions.filter(r=>flexNames.includes(r.category)),flexTotal=sum(flex,r=>r.amount),flexibleMonthly=flexTotal/p.months,flexGroups=byAmount(flex,r=>r.category,r=>r.amount),largestFlexible=flexGroups[0]||null;
    const overdue=ar.overdue||0,outstanding=ar.total||0,overdueRatio=outstanding>0?overdue/outstanding:0,paidTotal=sum(ar.rows,r=>r.received),paid=ar.rows.filter(r=>Number.isFinite(r.actualAverageDays)).flatMap(r=>(r.payments||[]).map(pay=>({amount:pay.amount,days:r.termsKnown===false?null:days(pay.date,r.originalInvoiceDate||r.invoiceDate)}))).filter(r=>r.days!=null),den=sum(paid,r=>r.amount),actualAverageDays=den>0?sum(paid,r=>r.amount*r.days)/den:null;
    const sc=project.scenario||{},isModel=sc.profileId==='model-lab',isStudy=sc.profileId==='study-abroad',holdings=sc.investment?.holdings||[],holdingsCost=sum(holdings,r=>r.cost),topHolding=holdings.slice().sort((a,b)=>b.cost-a.cost)[0],topHoldingShare=holdingsCost>0?(topHolding?.cost||0)/holdingsCost:0,investmentFees=cur.expenses,researchCash=sum(model.transactions.filter(r=>/研发|训练|评测|数据标注|算力/.test(r.category||'')),r=>r.outflow),financingIn=sum(cash.filter(r=>r.activity==='financing'),r=>r.inflow),unearned=model.balance?.otherLiabilities||0,salaryIncome=sum(model.transactions.filter(r=>r.incomeNature==='payroll'),r=>r.inflow),sidegigIncome=round(cur.revenue-salaryIncome),salePrincipal=sum(cash.filter(r=>r.activity==='investing'),r=>r.inflow),purchases=sum(cash.filter(r=>r.activity==='investing'),r=>r.outflow);
    const sectors={'software-ai':['软件交付与维护','开发交付与云资源'],'data-consulting':['数据服务与咨询','分析交付与数据资源'],creator:['内容创作与合作','内容制作与渠道合作'],'design-photo':['设计摄影与交付','创作交付与设备投入'],ecommerce:['商品销售与结算','进货与平台履约'],'nail-lash':['到店服务与消费','材料消耗与门店支出'],florist:['花艺订单与交付','花材采购与配送'],'cafe-bakery':['门店销售与结算','食材采购与门店支出'],'yoga-pilates':['课程服务与交付','教练服务与场地支出'],wholesale:['贸易交付与回款','采购履约与客户账期']},sector=sectors[sc.profileId];
    const receiptMonths=new Set(model.transactions.filter(r=>r.inflow>0).map(r=>r.date.slice(0,7))).size,profitName=model.presentation.profitLabel,ratioName=model.presentation.marginLabel;
    const dim=(id,name,score,metric,rule,explanation,rows)=>({id,name,score:finite(score)?Math.round(clamp(score)):null,metric,rule,explanation,rows,status:status(finite(score)?Math.round(clamp(score)):null)});
    const dimensions=[
      dim('profit',personal?'结余能力':'盈利能力',margin==null?null:margin/(personal?.25:.30)*100,'所选期间'+ratioName+' '+pct(margin),'所选期间结余或净利润占收入的比例，按演示目标换算为0—100分；不是收益预测。',`${p.label}收入 ${money(cur.revenue)}，${profitName} ${money(cur.net)}。`,[['统计期间',p.label],['收入',cur.revenue],['成本与费用',round(cur.cost+cur.expenses)],['税费',cur.tax],[profitName,cur.net]]),
      dim('cash',investor?'现金留存':'现金安全',investor?(model.balance?.assets>0?closing/model.balance.assets/.2*100:null):runway==null?null:runway/6*100,investor?'期末现金占账面资产 '+pct(model.balance?.assets>0?closing/model.balance.assets:null):'按所选期间月均支出覆盖 '+(runway==null?'—':runway.toFixed(2)+'个月'),'期末现金以截止日余额为准；企业与个人支出覆盖按所选期间月均支出与6个月演示刻度计算；投资画像以现金占资产20%为演示刻度。',`期末现金 ${money(closing)}，所选期间月均付款 ${money(avg)}。`,[['截止日期',p.end],['期末现金',closing],['所选月数',p.months],['期间付款',model.totals.opOut],['月均付款',round(avg)]]),
      dim('collection',personal?'到账记录':'回款效率',personal?(model.income.total>0?receiptMonths/p.months*100:null):(1-overdueRatio)*100,personal?`有收入到账 ${receiptMonths}/${p.months}个月`:'期末逾期应收占比 '+pct(overdueRatio),personal?'有收入到账月份÷所选月份×100；历史到账不保证未来收入。':'（1－逾期金额÷期末未收金额）×100；无未收时记100分；包含期初带入且仍待收的款项。',personal?`所选期间已记录回款 ${money(paidTotal)}，本金另列。`:`期初待收 ${money(p.openingAr)}，本期已收 ${money(paidTotal)}，期末未收 ${money(outstanding)}。`,[['期初待收',p.openingAr],['本期已收',paidTotal],['期末未收',outstanding],['其中逾期',overdue]]),
      dim('customer',personal?'收入来源':'来源分散',largest?(0.65-share)/.45*100:null,'最大收款来源占比 '+pct(share),'按所选期间最大收款来源占比计算，20%以内100分，65%及以上0分；仅为来源集中度演示。',largest?`${largest.name}在所选期间贡献 ${money(largest.amount)}，占 ${pct(share)}。`:'所选期间没有收款记录。',[['收款来源',largest?.name||'无'],['该来源收款',largest?.amount||0],['期间收款',model.income.total],['占比',pct(share)]]),
      dim('cost',personal?'支出控制':'成本控制',expenseRatio==null?null:100-Math.max(0,expenseRatio-.65)*200-Math.max(0,costDelta||0)*300,'所选期间支出费用率 '+pct(expenseRatio),'采用所选期间成本费用占收入比例；如有完整前一等长期间则比较变化。演示评分不代表审计结论。',largestCost?`${largestCost.name}为所选期间最大付款分类，合计 ${money(largestCost.amount)}。`:'按所选期间已提供的成本费用记录计算。',[['期间成本与费用',round(cur.cost+cur.expenses)],['期间收入',cur.revenue],['费用率',pct(expenseRatio)],['前一等长期间费用率',pct(previousRatio)]])
    ];
    if(investor){
      dimensions[0]=dim('profit','收益结余',margin==null?null:margin*100,'所选期间收益结余比例 '+pct(margin),'已实现净收益÷已实现收益收入×100；不是投资回报率。',`期间已实现收入 ${money(cur.revenue)}，净收益 ${money(cur.net)}；本金回收和未实现涨跌没有计入。`,[['已实现收入',cur.revenue],['已实现净收益',cur.net]]);
      dimensions[3]=dim('customer','持仓分散',holdingsCost>0?(0.8-topHoldingShare)/.6*100:null,'期末最大持仓成本占比 '+pct(holdingsCost>0?topHoldingShare:null),'期末最大持仓成本占比20%以内100分，80%及以上0分；是账面集中度刻度，不评估资产风险。',topHolding?`${topHolding.name}期末成本 ${money(topHolding.cost)}，占 ${pct(topHoldingShare)}。`:'当前没有持仓成本记录。',holdings.map(r=>[r.name,r.cost]));
      dimensions[4]=dim('cost','费用控制',cur.revenue>0?100-investmentFees/cur.revenue*200:null,'期间费用占已实现收入 '+pct(cur.revenue>0?investmentFees/cur.revenue:null),'100－费用占已实现收入比例×200，下限0；本金买入与未实现涨跌不计费用。',`所选期间费用 ${money(investmentFees)}，已实现收入 ${money(cur.revenue)}。`,[['期间费用',investmentFees],['已实现收入',cur.revenue]]);
    }else if(personal){
      const debt=model.balance?.debt||0,assets=model.balance?.assets||0,debtRatio=assets>0?debt/assets:0;
      dimensions[3]=dim('customer','借款负担',(1-debtRatio/.5)*100,'期末借款占账面资产 '+pct(debtRatio),'100－借款占账面资产比例÷50%×100，下限0；只用于本演示账本对比。',`期末借款 ${money(debt)}，账面资产 ${money(assets)}。`,[['期末借款',debt],['期末资产',assets]]);
    }
    const scored=dimensions.filter(d=>d.score!=null),score=scored.length?Math.round(scored.reduce((n,d)=>n+d.score,0)/scored.length):null;
    const topLate=byAmount(ar.rows.filter(r=>r.overdue),r=>r.customer,r=>r.outstanding)[0];
    const action=(priority,title,description,expected,rows)=>({priority,status:priority<40?'优先处理':priority<80?'关注':'按计划',title,description,expected,condition:'只依据所选期间已发生记录；情景测算不是实际到账或节省承诺。',rows});
    const actions=[];
    if(topLate)actions.push(action(10,`跟进${topLate.name}的逾期款`,`截止 ${p.end} 仍有 ${money(topLate.amount)} 未收。`,`若全部到账，现金可从 ${money(closing)} 增至 ${money(closing+topLate.amount)}。`,[['逾期来源',topLate.name],['未收金额',topLate.amount]]));
    if(cur.net<0)actions.push(action(15,investor?'复核所选期间已实现亏损':personal?'复核所选期间的收支缺口':isModel?'核对研发预算与商业化进度':isStudy?'核对申请服务定价与交付成本':'复核所选期间的业务投入',`${p.label} ${profitName}为 ${money(cur.net)}。`,'逐项核对收入与成本；已实现损益、本金及未实现涨跌分别记录。',[[profitName,cur.net],['期间收入',cur.revenue],['期间成本费用',round(cur.cost+cur.expenses)]]));
    if(!investor&&runway!=null&&runway<3)actions.push(action(20,'安排近期现金预算',`按所选期间月均付款 ${money(avg)}，期末现金覆盖 ${runway.toFixed(2)}个月。`,`3个月同等付款的参考金额为 ${money(avg*3)}。`,[['期末现金',closing],['期间月均付款',round(avg)]]));
    actions.push(action(costDelta>0?45:85,`核对${largestFlexible?.name||largestCost?.name||'主要支出'}投入`,`所选期间弹性支出合计 ${money(flexTotal)}，月均 ${money(flexibleMonthly)}。`,flexibleMonthly>0?`若选定弹性支出减少10%，每月假设少付 ${money(flexibleMonthly*.1)}。`:'核对分类与付款凭证，按已发生记录更新预算。',[['所选期间',p.label],['弹性支出',flexTotal],['月均弹性支出',round(flexibleMonthly)]]));
    actions.push(action(90,investor?'核对投资本金与收益':personal?'分开记录工资和副业':'核对主要收款来源',largest?`${largest.name}在所选期间贡献 ${money(largest.amount)}，占 ${pct(share)}。`:'所选期间暂无收款记录。','将收入与相应交易、服务或成本对应，避免重复计算。',[['主要来源',largest?.name||'无'],['期间收款',model.income.total]]));
    actions.push(action(100,'核对期初与期末余额',`所选期间期初现金 ${money(model.totals.openingCash)}，现金净变动 ${money(model.totals.net)}，期末 ${money(closing)}。`,'保持期初余额加期间现金净变动等于期末余额。',[['期初现金',model.totals.openingCash],['现金净变动',model.totals.net],['期末现金',closing]]));
    if(isStudy&&unearned>0)actions.push(action(35,'安排已预收的后续申请服务',`期末已收但待交付服务款 ${money(unearned)} 单列其他负债。`,'按申请批次核对交付义务，不把预收服务款全额当作已实现收入。',[['期末预收待交付',unearned],['本期已确认收入',cur.revenue]]));
    if(sector)actions.push(action(84,'核对'+sector[1],`所选期间收入 ${money(cur.revenue)}，按当前科目核对${sector[1]}。`,'把已完成的销售或服务与相关收款、成本逐项对应。',[['收入科目',(sc.services||[]).join('、')],['期间收入',cur.revenue],['最大付款分类',largestCost?.name||'无']]));
    if(investor)actions.push(action(75,'分开核对投资收益与本金',`期间本金回收 ${money(salePrincipal)}，本金买入 ${money(purchases)}，费用 ${money(investmentFees)}。`,'买卖本金单列投资现金流，收益只使用已实现损益。',[['买入本金',purchases],['卖出收回本金',salePrincipal],['已实现净收益',cur.net],['期间费用',investmentFees]]));
    if(personal&&!investor)actions.push(action(86,'分别核对税后工资与副业',`期间税后工资 ${money(salaryIncome)}，副业到账 ${money(sidegigIncome)}。`,'工资使用税后到账金额，副业收入与相关成本分别记录。',[['税后工资',salaryIncome],['副业收入',sidegigIncome],['副业成本',cur.cost]]));
    const chosen=actions.sort((a,b)=>a.priority-b.priority).slice(0,3).map((a,i)=>({...a,order:i+1}));
    const dividends=sum(cash.filter(r=>r.activity==='financing'&&/分红|利润分配/.test(r.category||'')),r=>r.outflow),adjustments=Number(project.distribution?.adjustments)||0,endRetained=model.balance?.retainedEarnings,ready=finite(endRetained)&&adjustments===0,retained=ready?round(cur.net-dividends):null,carry=ready?round(endRetained-retained):null;
    const distribution={ready,title:model.presentation.distributionTitle,netProfit:cur.net,revenue:cur.revenue,cost:round(cur.cost+cur.expenses),tax:cur.tax,beforeTax:round(cur.revenue-cur.cost-cur.expenses),carry,dividends,adjustments:ready?0:null,retained,distributable:ready?endRetained:null,available:ready?Math.max(0,endRetained):null,periodLabel:p.label,carryAsOf:p.start,note:personal?model.presentation.distributionNote:'期初结转加本期留存 · 期末累计利润不等于可提取现金',rows:[{label:'本期收入',value:cur.revenue},{label:'本期成本与费用',value:round(cur.cost+cur.expenses)},{label:'本期税费',value:cur.tax},{label:'本期'+profitName,value:cur.net},{label:'本期已分配',value:dividends},{label:'本期留存',value:retained},{label:'期初结转',value:carry},{label:'期末累计留存',value:ready?endRetained:null}]};
    const overview=`所选期间${profitName} ${money(cur.net)} · ${investor?'本金与收益分别列示':'期末现金 '+money(closing)}`;
    const readings=[{title:personal?'所选期间收支':'所选期间经营',text:`${p.label}收入 ${money(cur.revenue)}，${profitName} ${money(cur.net)}${revenueChange==null?'；前一等长期间资料不足，暂不比较':'，较前一等长期间收入'+(revenueChange>=0?'增加':'减少')+' '+pct(Math.abs(revenueChange))}。`},{title:'现金与预测',text:`期末现金 ${money(closing)}，期间月均付款 ${money(avg)}；沙盘按所选期间月均收付推演。`},{title:personal?'到账记录':'回款与未收',text:`期初待收 ${money(p.openingAr)}，本期已收 ${money(paidTotal)}，期末未收 ${money(outstanding)}；其中逾期 ${money(overdue)}。`},{title:personal?'支出构成':'成本与投入',text:`期间成本费用 ${money(cur.cost+cur.expenses)}${largestCost?'，最大现金付款分类为'+largestCost.name+' '+money(largestCost.amount):''}。`}];
    if(sector){readings[0].title=sector[0];readings[0].text+=' 本期收入科目包括 '+(sc.services||[]).slice(0,3).join('、')+'。';readings[3].title=sector[1];}
    if(isModel){readings[0].title='模型研发与商业化';readings[0].text+=` 期间研发相关现金投入 ${money(researchCash)}，筹资流入 ${money(financingIn)} 单独列示。`;}
    if(isStudy){readings[0].title='申请服务与交付';readings[0].text+=` 期末预收待交付 ${money(unearned)} 单列其他负债，收入按已完成服务确认。`;}
    if(investor){readings[0].title='已实现投资结果';readings[0].text+=' 本金买卖和未实现涨跌不计入收入。';readings[1].title='现金与持仓';readings[1].text=`期末现金 ${money(closing)}，持仓成本 ${money(holdingsCost)}；持仓没有按未来售价计为现金。`;readings[2]={title:'资金来源与去向',text:`期间追加及其他筹资流入 ${money(financingIn)}，本金买入 ${money(purchases)}，卖出回收本金 ${money(salePrincipal)}。`};readings[3].title='费用与已实现亏损';}
    else if(personal){readings[0].title='工资与副业收支';readings[0].text+=' 工资按税后实际到账计算。';readings[2]={title:'收入构成',text:`期间税后工资 ${money(salaryIncome)}，副业到账 ${money(sidegigIncome)}，副业成本 ${money(cur.cost)}。`};readings[3].title='生活与副业支出';}
    return {family,overview,business:project.scenario?.business||'',dimensions,score,status:scored.some(d=>d.score<60)?'有短板需关注':status(score),method:'所选期间统一计算 · 五项等权的演示管理规则',readings,actions:chosen,distribution,metrics:{recentMonths:model.monthly.map(r=>r.month),previousMonths:prior.profit.map(r=>r.month),recent:cur,previous:before,margin,expenseRatio,previousExpenseRatio:previousRatio,costDelta,revenueChange,paymentMonth:p.label,monthlyPayment:round(avg),closing,runway,outstanding,overdue,overdueRatio,actualAverageDays,largestCustomer:largest?.name||null,largestShare:share,largestCost,largestFlexible,flexibleMonthly:round(flexibleMonthly),paidTotal,researchCash,financingIn,unearned,holdingsCost,topHoldingShare,salaryIncome,sidegigIncome,investmentFees,salePrincipal,purchases,year:p.end.slice(0,4),period:p.label}};
  }
  function buildBase(project,model){
    if(!project||!model)throw Error('分析需要本次生成的账本与报告。');
    if(model.period)return periodInsights(project,model);
    if(['personal','investor'].includes(model.family))return householdInsights(project,model);
    const isModel=project.scenario?.profileId==='model-lab',isStudy=project.scenario?.profileId==='study-abroad';
    const asOf=model.asOf,year=asOf.slice(0,4),profit=model.profit.slice().sort((a,b)=>a.month.localeCompare(b.month));
    const latestMonth=asOf.slice(0,7),recentMonths=model.monthly.filter(r=>r.month<=latestMonth).slice(-3).map(r=>r.month),previousMonths=model.monthly.filter(r=>r.month<recentMonths[0]).slice(-3).map(r=>r.month);
    const recent=totals(profit.filter(r=>recentMonths.includes(r.month))),previous=totals(profit.filter(r=>previousMonths.includes(r.month))),yearBooks=totals(profit.filter(r=>r.month.startsWith(year+'-')));
    const all=totals(profit),margin=recent.revenue>0?recent.net/recent.revenue:null,expenseRatio=recent.revenue>0?(recent.cost+recent.expenses)/recent.revenue:null,previousExpenseRatio=previous.revenue>0?(previous.cost+previous.expenses)/previous.revenue:null;
    const costDelta=expenseRatio!=null&&previousExpenseRatio!=null?expenseRatio-previousExpenseRatio:null,revenueChange=previous.revenue>0?recent.revenue/previous.revenue-1:null;
    const recentCash=model.rawTransactions.filter(r=>recentMonths.includes(r.date.slice(0,7))),operating=model.transactions.filter(r=>recentMonths.includes(r.date.slice(0,7)));
    const paymentMonth=model.latestCash?.month||latestMonth,paymentRows=model.transactions.filter(r=>r.date.startsWith(paymentMonth)),monthlyPayment=sum(paymentRows,r=>r.outflow),closing=model.totals.closingCash,runway=monthlyPayment>0&&finite(closing)?closing/monthlyPayment:null;
    const arRows=model.ar.rows||[],outstanding=sum(arRows,r=>r.outstanding),overdue=sum(arRows.filter(r=>r.overdue),r=>r.outstanding),overdueRatio=outstanding>0?overdue/outstanding:0;
    const overdueCustomers=byAmount(arRows.filter(r=>r.overdue),r=>r.customer,r=>r.outstanding),topOverdue=overdueCustomers[0]||null;
    const invoices=(project.invoices||[]).filter(r=>r.invoiceDate<=asOf),paid=invoices.flatMap(invoice=>(invoice.payments||[]).filter(p=>p.date<=asOf).map(payment=>({amount:payment.amount,days:days(payment.date,invoice.invoiceDate),customer:invoice.customer,date:payment.date,dueDate:invoice.dueDate,invoiceDate:invoice.invoiceDate})));
    const paidTotal=sum(paid,r=>r.amount),actualAverageDays=paidTotal>0?sum(paid,r=>r.days*r.amount)/paidTotal:null;
    const byCustomer=model.income.items||[],largest=byCustomer[0]||null,largestShare=largest&&model.income.total>0?largest.amount/model.income.total:0;
    const recentCosts=byAmount(operating.filter(r=>r.outflow>0),r=>r.category,r=>r.outflow),largestCost=recentCosts[0]||null;
    const flexibleNames=project.scenario?.flexibleCategories||[],flexiblePayments=paymentRows.filter(r=>flexibleNames.includes(r.category)),flexibleMonthly=sum(flexiblePayments,r=>r.outflow),flexibleCosts=byAmount(flexiblePayments.filter(r=>r.outflow>0),r=>r.category,r=>r.outflow),largestFlexible=flexibleCosts[0]||null;
    const previousCost=previous.cost+previous.expenses,recentCost=recent.cost+recent.expenses,costAmountChange=previousCost>0?recentCost/previousCost-1:null;
    const costContext=costDelta>0&&revenueChange<0?(costAmountChange<=0?'收入下降快于成本费用调整，费用率因此上升。':'收入减少 '+pct(-revenueChange)+'，成本费用同时增加 '+pct(costAmountChange)+'。'):costAmountChange>0?'成本费用较前3个月增加 '+pct(costAmountChange)+'。':'';
    const researchCategories=['模型训练算力','数据采购与标注','研发人员薪酬','模型评测'],researchCash=sum(operating.filter(r=>researchCategories.includes(r.category)),r=>r.outflow),financingIn=sum(model.rawTransactions.filter(r=>r.activity==='financing'),r=>r.inflow),unearned=round(project.balance?.at(-1)?.otherLiabilities||0);
    const period=recentMonths.length?recentMonths[0]+'—'+recentMonths.at(-1):'当前期间';
    const dimension=(id,name,score,metric,rule,explanation,rows)=>({id,name,score:finite(score)?Math.round(clamp(score)):null,metric,rule,status:status(finite(score)?Math.round(clamp(score)):null),explanation,rows});
    const dimensions=[
      dimension('profit','盈利能力',margin==null?null:margin/.30*100,'近3个月净利率 '+pct(margin),'净利率÷30%×100；低于0按0分，高于100按100分。24%对应80分管理关注线。',recent.net<0?'近3个月账务净亏损 '+money(-recent.net)+'，需要复核收入与投入节奏。':'近3个月账务净利润 '+money(recent.net)+'，收入 '+money(recent.revenue)+'。',[['统计期间',period],['营业收入',recent.revenue],['营业成本',recent.cost],['期间费用',recent.expenses],['演示税费',recent.tax],['账务净利润',recent.net],['净利率',pct(margin)]]),
      dimension('cash','现金安全',runway==null?null:runway/6*100,'现金覆盖 '+(runway==null?'待补充':runway.toFixed(2)+' 个月'),'期末现金÷最近有流水月份经营付款÷6×100，上下限为0和100。4.8个月对应80分管理关注线。',runway==null?'需要期末现金和经营付款记录。':'期末现金 '+money(closing)+'，'+paymentMonth+' 经营付款 '+money(monthlyPayment)+'。',[['截止日期',asOf],['期末现金',closing],['付款基准月份',paymentMonth],['基准月经营付款',round(monthlyPayment||0)],['现金覆盖月数',runway==null?'待补充':runway.toFixed(2)],['说明','用于管理对比，不含尚未实际支付的后续融资或催收结果']]),
      dimension('collection','回款效率',(1-overdueRatio)*100,'逾期应收占比 '+pct(overdueRatio),'（1－逾期金额÷未收金额）×100；未收金额为0时记100分。逾期占比20%对应80分管理关注线。',outstanding===0?'截至报告日应收已全部收回。':`未收 ${money(outstanding)}，其中逾期 ${money(overdue)}${actualAverageDays==null?'':'；已收款金额加权平均回款 '+actualAverageDays.toFixed(1)+' 天'}。`,[['截止日期',asOf],['未收金额',outstanding],['其中逾期',overdue],['已收金额',paidTotal],['金额加权平均回款天数',actualAverageDays==null?'待补充':actualAverageDays.toFixed(1)],['最大逾期客户',topOverdue?.name||'无']]),
      dimension('customer','客户分散',(0.65-largestShare)/.45*100,'最大客户占比 '+pct(largestShare),'最大客户收款占比20%以内为100分，65%及以上为0分，中间线性计算。29%对应80分管理关注线。',largest?`${largest.name}贡献 ${money(largest.amount)}，占报告期间经营收款 ${pct(largestShare)}。`:'没有经营收款记录。',[['统计范围','报告期间全部经营收款'],['最大客户',largest?.name||'无'],['该客户收款',largest?.amount||0],['经营收款合计',model.income.total||0],['占比',pct(largestShare)],['有收款的客户数',byCustomer.length]]),
      dimension('cost','成本控制',expenseRatio==null?null:100-Math.max(0,expenseRatio-.65)*200-Math.max(0,costDelta||0)*300,'近3个月成本费用率 '+pct(expenseRatio),'成本费用率65%以内为100分；超出每1个百分点扣2分；较前3个月上升每1个百分点再扣3分，下限0分。',costDelta==null?'需要连续6个月账务记录作比较。':`较前3个月${costDelta>=0?'增加':'减少'} ${point(costDelta)}${largestCost?'；近3个月最大付款分类为'+largestCost.name+' '+money(largestCost.amount):''}。`,[['统计期间',period],['本期成本及费用',round(recent.cost+recent.expenses)],['本期收入',recent.revenue],['本期成本费用率',pct(expenseRatio)],['前3个月成本费用率',pct(previousExpenseRatio)],['变化',costDelta==null?'待补充':(costDelta>=0?'+':'−')+point(costDelta)],['说明','比例来自账务资料，不直接用现金付款替代费用']])
    ];
    const scored=dimensions.filter(d=>d.score!=null),score=scored.length?Math.round(scored.reduce((n,d)=>n+d.score,0)/scored.length):null;
    const scoreBy=Object.fromEntries(dimensions.map(d=>[d.id,d.score]));
    const candidates=[];
    function action(priority,status,title,description,expected,condition,rows){candidates.push({priority,status,title,description,expected,condition,rows});}
    if(topOverdue){
      const after=round(closing+topOverdue.amount),covered=monthlyPayment>0?after/monthlyPayment:null;
      action(scoreBy.collection,'优先处理',`跟进${topOverdue.name}的逾期款`,`${topOverdue.name}尚有 ${money(topOverdue.amount)} 已逾期。先确认服务完成情况、付款安排和预计回款日。`,`若全部收回，现金 ${money(closing)} → ${money(after)}${covered==null?'':'，支出覆盖 '+runway.toFixed(2)+' → '+covered.toFixed(2)+' 个月'}。`,'只计算该客户目前逾期的未收金额；未来实际回款尚未发生，不与沙盘重复相加。',[['客户',topOverdue.name],['当前逾期未收',topOverdue.amount],['当前现金',closing],['假设收回后现金',after]]);
    }
    if(runway!=null&&runway<3){
      const reserve=round(monthlyPayment*3),gap=round(Math.max(0,reserve-closing));
      action(scoreBy.cash,'优先处理','先安排未来三个月的现金',`当前现金可覆盖 ${runway.toFixed(2)} 个月经营付款。先按到期日梳理应付款和可回收应收。`,`按 ${paymentMonth} 付款水平，3个月参考金额为 ${money(reserve)}，与当前现金相差 ${money(gap)}。`,'三个月是本演示的管理参考线；没有将未来融资或预计回款当作已到账现金。',[['当前现金',closing],['基准月经营付款',round(monthlyPayment)],['3个月参考金额',reserve],['参考差额',gap]]);
    }
    if((expenseRatio!=null&&expenseRatio>.8)||(costDelta!=null&&costDelta>.03)){
      const saving=round(flexibleMonthly*.10),six=round(saving*6);
      action(scoreBy.cost,'关注',`复核${largestFlexible?.name||'弹性支出'}投入`,`近3个月成本费用率 ${pct(expenseRatio)}${costDelta==null?'':`，较前3个月${costDelta>=0?'增加':'减少'} ${point(costDelta)}`}。${costContext}${largestFlexible?paymentMonth+' '+largestFlexible.name+'付款 '+money(largestFlexible.amount)+'，可先按项目核对投入与交付安排。':''}`,saving>0?`若选定弹性支出减少10%，按 ${paymentMonth} 的 ${money(flexibleMonthly)} 测算每月少付 ${money(saving)}，6个月共 ${money(six)}。`:'先确认哪些费用可以调整，再录入沙盘比较。','节支为情景假设；是否能节省取决于合同、使用量和交付安排，未改变本期利润。',[['成本费用率',pct(expenseRatio)],['弹性支出基准月份',paymentMonth],['选定分类中最大付款',largestFlexible?.name||'无'],['该分类付款',largestFlexible?.amount||0],['基准月选定弹性支出',round(flexibleMonthly)],['假设减少比例','10%'],['6个月假设少付',six]]);
    }
    if(largest&&largestShare>.35){
      const additional=round(Math.max(0,largest.amount/.30-model.income.total));
      action(scoreBy.customer,'关注',`降低对${largest.name}的依赖`,`${largest.name}贡献经营收款 ${money(largest.amount)}，占 ${pct(largestShare)}。把后续获客和续约计划分散到其他客户。`,`若该客户金额不变，其他客户再贡献 ${money(additional)}，其占比可降至30%。`,'30%为演示目标，不是预测；计算假设最大客户金额保持不变，新增收款全部来自其他客户。',[['最大客户',largest.name],['该客户收款',largest.amount],['总经营收款',model.income.total],['目标占比','30%'],['所需其他客户新增收款',additional]]);
    }
    if(recent.net<0){
      action(Math.max(-1,scoreBy.profit-1),'优先处理',isModel?'核对研发预算与商业化进度':isStudy?'核对申请服务定价与交付成本':'复核最近三个月的项目报价',`最近3个月收入 ${money(recent.revenue)}，账务净亏损 ${money(-recent.net)}。${isModel?'本期研发相关现金投入 '+money(researchCash)+'，按训练、评测和上线节点安排预算。':'逐个核对服务范围与已计入的成本费用。'}`,`若本期成本、费用和税费不变，至少增加 ${money(-recent.net)} 收入可弥补这段亏损。`,'这是固定成本及税费下的演示测算；新增订单可能增加交付成本，不能直接当作实际收益。',[['近3个月收入',recent.revenue],['成本及费用',round(recent.cost+recent.expenses)],['税费',recent.tax],['净亏损',-recent.net],['固定支出下弥补亏损所需收入',-recent.net]]);
    }else if(revenueChange!=null&&revenueChange<-.1){
      action(Math.min(scoreBy.profit,55),'关注','复核后续项目交付节奏',`近3个月账务收入较前3个月减少 ${pct(-revenueChange)}，由 ${money(previous.revenue)} 降至 ${money(recent.revenue)}。确认在手订单与验收安排。`,`恢复到前3个月收入水平需要增加 ${money(previous.revenue-recent.revenue)} 已确认收入。`,'只比较已确认收入；合同金额、未验收订单和预计回款不提前计为收入。',[['前3个月收入',previous.revenue],['近3个月收入',recent.revenue],['收入差额',round(previous.revenue-recent.revenue)]]);
    }
    if(isStudy&&unearned>0)action(35,'关注','安排已预收的后续申请服务',`截至报告日有 ${money(unearned)} 已收服务款尚未完成交付，单列在其他负债。按申请批次核对后续服务与人员安排。`,'将已收款与已完成的服务分别核对，避免把预收款全部作为当期营业收入。','预收款是后续交付义务，不等同于已经发生的成本或可自由分配利润。',[['已预收待交付金额',unearned],['列示位置','资产负债表 · 其他负债']]);
    const pending=arRows.filter(r=>r.outstanding>0&&!r.overdue&&r.customer!==topOverdue?.name).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||b.outstanding-a.outstanding)[0];
    if(pending)action(105,'按计划',`按约跟进${pending.customer}回款`,`最近一笔未到期应收 ${money(pending.outstanding)}，约定 ${pending.dueDate} 到期。提前确认服务完成记录与付款安排。`,`若如期收回这笔款，现金可增加 ${money(pending.outstanding)}。`,'未到期不表示逾期；是否实际到账仍以回款记录为准。',[['客户',pending.customer],['到期日',pending.dueDate],['未收金额',pending.outstanding]]);
    action(110,'按计划','延续支出预算并核对新增投入',`${paymentMonth} 经营付款 ${money(monthlyPayment)}${runway==null?'':'，当前现金覆盖 '+runway.toFixed(2)+' 个月'}。新增投入前对照月度预算。`,flexibleMonthly>0?`${paymentMonth} 选定弹性支出 ${money(flexibleMonthly)}，可在沙盘比较调整后的现金走势。`:'按已确认的付款计划观察后续现金变化。','当前指标采用已发生的收付款；未来收益和节支效果单独作为假设。',[['基准月份',paymentMonth],['基准月经营付款',round(monthlyPayment||0)],['基准月弹性付款',round(flexibleMonthly)]]);
    if(largest)action(115,'按计划',isStudy?`跟进${largest.name}的服务进度`:`维护${largest.name}的后续合作`,`${largest.name}本报告期间贡献收款 ${money(largest.amount)}，占 ${pct(largestShare)}。按服务完成节点和服务期限安排后续合作。`,'将后续服务与回款节点对应到客户计划。','后续合作尚未成交，不添加到本期收入或现金。',[['客户',largest.name],['期间收款',largest.amount],['收款占比',pct(largestShare)],['实际业务构成',largest.parts.map(p=>p.name).join('、')]]);
    action(120,'按计划','核对本期利润与现金差异',`报告期间账务净利润 ${money(all.net)}，全部现金净变动 ${money(model.totals.net)}。核对应收、设备投入和融资分配记录。`,'保持账务报表、现金流水和应收记录对应。','现金净变动与净利润口径不同，不要求两者金额相等。',[['报告期间净利润',all.net],['全部现金净变动',model.totals.net],['期末应收',outstanding],['期末固定资产',model.balance?.fixedAssets??0]]);
    const sectors={
      'software-ai':['软件交付与维护','按开发里程碑核对验收和维护范围','开发交付与云资源'],
      'data-consulting':['数据服务与咨询','按数据范围核对分析工时和交付成果','分析交付与数据资源'],
      creator:['内容创作与合作','按内容项目核对合作回款和制作投入','内容制作与渠道合作'],
      'design-photo':['设计摄影与交付','按拍摄或设计项目核对交付范围和外包成本','创作交付与设备投入'],
      ecommerce:['商品销售与结算','按销售渠道核对已结算货款和商品履约成本','进货与平台履约'],
      'nail-lash':['到店服务与消费','按已完成服务核对收款和材料消耗','材料消耗与门店支出'],
      florist:['花艺订单与交付','按已交付订单核对花材采购和配送成本','花材采购与配送'],
      'cafe-bakery':['门店销售与结算','按门店和平台核对营业收款与食材支出','食材采购与门店支出'],
      'yoga-pilates':['课程服务与交付','按已完成课程核对课时收入和教练支出','教练服务与场地支出'],
      wholesale:['贸易交付与回款','按已交付批次核对货款账期和采购成本','采购履约与客户账期']
    },sector=sectors[project.scenario?.profileId];
    if(sector){
      action(85,'按计划',sector[1],`近3个月收入 ${money(recent.revenue)}${largestCost?'，'+largestCost.name+'付款 '+money(largestCost.amount):''}。按本期真实分类检查${sector[2]}。`,'把收款与已完成的销售或服务对应，避免漏记成本或重复计收。','只核对当前已发生记录，未交付订单和未来收入不加入本期。',[['收入科目',(project.scenario.services||[]).join('、')],['近3个月收入',recent.revenue],['最大付款分类',largestCost?.name||'无'],['该分类付款',largestCost?.amount||0]]);
      for(const item of candidates){item.title=item.title.replace('项目报价','商品或服务定价').replace('项目交付节奏','销售与交付节奏');item.description=item.description.replace('在手订单与验收安排','已成交订单与交付安排');}
    }
    const actions=candidates.sort((a,b)=>a.priority-b.priority).slice(0,3).map((a,i)=>({...a,order:i+1}));
    const readings=[
      {title:'经营表现',text:`报告期间营业收入 ${money(all.revenue)}，账务净利润 ${money(all.net)}。近3个月收入 ${money(recent.revenue)}${revenueChange==null?'':`，较前3个月${revenueChange>=0?'增长':'减少'} ${pct(Math.abs(revenueChange))}`}，净利率 ${pct(margin)}。`,rows:dimensions[0].rows},
      {title:'现金安全',text:`期末现金 ${money(closing)}，${paymentMonth} 经营付款 ${money(monthlyPayment)}${runway==null?'':'，可覆盖 '+runway.toFixed(2)+' 个月'}。${model.balance?.debt>0?'账面借款余额 '+money(model.balance.debt)+'，后续还款需要纳入付款计划。':'当前账面无借款余额。'}`,rows:dimensions[1].rows},
      {title:'回款与客户',text:`应收未收 ${money(outstanding)}，逾期 ${money(overdue)}${actualAverageDays==null?'':'，已收款金额加权平均回款 '+actualAverageDays.toFixed(1)+' 天'}。${largest?largest.name+'收款占比 '+pct(largestShare)+'。':''}`,rows:dimensions[2].rows.concat(dimensions[3].rows)},
      {title:'成本与投入',text:`近3个月成本费用率 ${pct(expenseRatio)}${costDelta==null?'':'，较前3个月'+(costDelta>=0?'增加':'减少')+' '+point(costDelta)}。${largestCost?largestCost.name+'为近3个月最大付款分类，合计 '+money(largestCost.amount)+'。':''}${model.balance?.taxPayable>0?'账面待缴税费 '+money(model.balance.taxPayable)+'，需与申报和缴款记录核对。':''}`,rows:dimensions[4].rows}
    ];
    if(sector){readings[0].title=sector[0];readings[0].text+=' 本期收入科目包括 '+(project.scenario.services||[]).slice(0,3).join('、')+'。';readings[3].title=sector[2];}
    if(isModel){readings[0].title='模型研发与商业化';readings[0].text+=' 近3个月研发相关现金投入 '+money(researchCash)+'，报告期间筹资流入 '+money(financingIn)+' 单独列示，未计入营业收入。';}
    if(isStudy){readings[0].title='申请服务与交付';readings[0].text+=' 截止日已预收待交付 '+money(unearned)+' 单列其他负债，营业收入按已完成服务确认。';}
    const weakest=scored.slice().sort((a,b)=>a.score-b.score)[0];
    let overview=`近3个月净利率 ${pct(margin)}${runway==null?'':' · 现金可覆盖 '+runway.toFixed(2)+' 个月'}`;
    if(recent.net<0)overview=`近3个月账务亏损 ${money(-recent.net)} · ${isModel?'核对研发预算与商业化进度':'先复核报价与交付成本'}`;
    else if(revenueChange!=null&&revenueChange<-.15)overview=`近3个月收入减少 ${pct(-revenueChange)} · 先复核项目交付节奏`;
    else if(weakest?.score<80){const messages={cash:`现金可覆盖 ${runway.toFixed(2)} 个月 · 优先安排后续付款`,collection:`逾期未收 ${money(overdue)} · 优先跟进${topOverdue?.name||'客户'}回款`,cost:`成本费用率 ${pct(expenseRatio)} · 优先复核主要投入`,customer:`${largest?.name}贡献 ${pct(largestShare)} 收款 · 后续合作需分散`,profit:`近3个月净利率 ${pct(margin)} · ${isModel?'复核模型定价与研发投入':isStudy?'复核申请服务定价':'优先复核项目报价'}`};overview=messages[weakest.id]||overview;}
    const raw=project.distribution||{},carry=raw.yearCarry??raw.carry,dividends=raw.yearDividends??raw.dividends,adjustments=raw.adjustments;
    const ready=[carry,dividends,adjustments].every(finite),retained=ready?round(yearBooks.net-dividends-adjustments):null,distributable=ready?round(carry+retained):null;
    const distribution={ready,netProfit:yearBooks.net,revenue:yearBooks.revenue,cost:round(yearBooks.cost+yearBooks.expenses),tax:yearBooks.tax,beforeTax:round(yearBooks.revenue-yearBooks.cost-yearBooks.expenses),carry:ready?carry:null,dividends:ready?dividends:null,adjustments:ready?adjustments:null,retained,distributable,available:ready?Math.max(0,distributable):null,periodLabel:raw.periodLabel||`${year}年1—${Number(asOf.slice(5,7))}月`,carryAsOf:year+'-01-01',note:'管理演示估算 · 不等于可提取现金 · 实际分配还需确认相关条件',rows:[{label:'营业收入',value:yearBooks.revenue},{label:'成本与费用',value:round(yearBooks.cost+yearBooks.expenses)},{label:'税前利润',value:round(yearBooks.revenue-yearBooks.cost-yearBooks.expenses)},{label:'演示税费',value:yearBooks.tax},{label:'本年净利润',value:yearBooks.net},{label:'已分配利润',value:ready?dividends:null},{label:'其他分配调整',value:ready?adjustments:null},{label:'本年留存利润',value:retained},{label:'上年结转',value:ready?carry:null},{label:'累计留存利润',value:distributable},{label:'累计可分配利润 · 估算',value:ready?Math.max(0,distributable):null}]};
    if(project.scenario?.customerLabel==='渠道／客群'){
      const d=dimensions.find(d=>d.id==='customer');d.name='来源分散';d.metric=d.metric.replace('最大客户','最大来源');d.rule=d.rule.replaceAll('客户','来源');
      // Preserve names taken from the ledger; only change explanatory labels.
      const wording=text=>text.replaceAll('其他客户','其他来源').replaceAll('最大客户金额','最大来源金额').replaceAll('该客户金额','该来源金额').replaceAll('该客户目前','该来源目前').replaceAll('该客户收款','该来源收款');
      for(const item of [...dimensions,...actions]){
        if(item.rows)item.rows=item.rows.map(([label,value])=>[typeof label==='string'?label.replaceAll('客户','来源'):label,value]);
        for(const key of ['explanation','description','expected','condition'])if(item[key])item[key]=wording(item[key]);
      }
      readings[2].title='回款与收款来源';
    }
    return {overview,business:project.scenario?.business||'',dimensions,score,status:scored.some(d=>d.score<60)?'有短板需关注':status(score),method:'五项等权平均 · 采用统一的演示管理规则 · 80分为管理关注线',readings,actions,distribution,metrics:{recentMonths,previousMonths,recent,previous,margin,expenseRatio,previousExpenseRatio,costDelta,costAmountChange,revenueChange,paymentMonth,monthlyPayment:round(monthlyPayment||0),closing,runway,outstanding,overdue,overdueRatio,actualAverageDays,largestCustomer:largest?.name||null,largestShare,largestCost,largestFlexible,flexibleMonthly:round(flexibleMonthly),paidTotal,year,period,researchCash,financingIn,unearned}};
  }
  function build(project,model){
    const result=buildBase(project,model);
    if(!model.receiptPolicy)return result;
    // Accounting and balance analyses retain the supplied books. Only cash
    // receipt/payment analyses use the dashboard exclusion policy.
    const accountingNote='账务分析使用独立账务资料；投资损益等仍在账务报表中列示，不计入看板收入和支出。';
    result.method+=' · 收支已按看板口径排除四类交易 · 利润与资产按原账务资料';
    result.distribution.note=(result.distribution.note||'')+' · 独立账务口径，不等同于看板收支结余';
    if(result.readings?.length)result.readings[0].text+=' '+accountingNote;
    for(const item of result.dimensions||[])if(['profit','cost'].includes(item.id))item.explanation+=' '+accountingNote;
    if(model.transactions.length===0){
      const collection=result.dimensions?.find(item=>item.id==='collection');
      if(collection)Object.assign(collection,{score:null,status:'不适用',metric:'本期无计入收支的到账',explanation:'投资理财等记录已从看板收支排除，不能据此评价收入到账情况。',rows:[['计入看板的收款',0],['排除记录笔数',model.receiptPolicy.count]]});
      const applicable=result.dimensions.filter(item=>item.score!==null);
      result.score=applicable.length?Math.round(applicable.reduce((n,item)=>n+item.score,0)/applicable.length):null;
      result.status=applicable.some(item=>item.score<60)?'有短板需关注':status(result.score);
      result.method=result.method.replace('五项等权','适用指标等权');
      result.actions=(result.actions||[]).filter(item=>!/^核对主要支出投入$/.test(item.title));
      result.actions.unshift({priority:5,status:'口径说明',title:'查看未计入收支的记录',description:'本期没有计入看板收入和支出的交易；原始资金流与独立账务仍保留。',expected:'在报告底部查看未计入收支的记录及原因。',condition:'不把已排除的投资理财等交易用于收入变化或弹性支出推演。',rows:[['未计入收支笔数',model.receiptPolicy.count],['原始资金流入',model.totals.cashIn],['原始资金流出',model.totals.cashOut]]});
      result.actions=result.actions.slice(0,3).map((item,i)=>({...item,order:i+1}));
      const forecast=result.readings?.find(item=>item.title==='现金与预测');if(forecast)forecast.text='期末现金 '+money(model.totals.closingCash)+'；本期没有适用的收入和支出，沙盘暂不推演。';
    }
    return result;
  }
  return Object.freeze({build});
});
