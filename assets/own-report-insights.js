/* Evidence-based observations for an uploaded ledger. No network, persistence,
 * inferred profit, invented debts or changes to source transactions. Scores are
 * disclosed management scales, not audited business or credit ratings. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.YoushuOwnInsights=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const finite=n=>typeof n==='number'&&Number.isFinite(n);
  const round=n=>Math.round(n*100)/100;
  const sum=(rows,get)=>round(rows.reduce((n,r)=>n+(finite(get(r))?get(r):0),0));
  const clamp=n=>Math.max(0,Math.min(100,n));
  const cash=n=>finite(n)?'¥'+n.toLocaleString('zh-CN',{maximumFractionDigits:2}):'待补充';
  const pct=n=>finite(n)?(n*100).toFixed(1)+'%':'待补充';
  const inflow=r=>finite(r.inflow)?Math.max(0,r.inflow):0,outflow=r=>finite(r.outflow)?Math.max(0,r.outflow):0;
  const magnitude=r=>inflow(r)+outflow(r)|| (finite(r.amount)?Math.abs(r.amount):0);
  const text=v=>String(v??'').trim();
  const day=value=>{const s=text(value),n=Date.parse(s+'T00:00:00Z');return /^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===s;};
  const known=value=>{const s=text(value);return !!s&&!/^(?:\/|-|—|其他|其它|未知|未分类|未填写|未提供(?:交易对方|科目|账户)?|默认账户|不详)$/.test(s);};
  const monthNumber=key=>Number(key.slice(0,4))*12+Number(key.slice(5,7));
  function group(rows,key,amount){
    const map=new Map();
    for(const row of rows){const name=text(key(row))||'未提供';if(!map.has(name))map.set(name,{name,amount:0,rows:[]});const item=map.get(name);item.amount=round(item.amount+amount(row));item.rows.push(row);}
    return [...map.values()].filter(r=>r.amount>0).sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name,'zh-CN'));
  }
  function periodic(rows){
    const groups=new Map(),candidates=[];
    for(const r of rows){if(!day(r.date)||!known(r.counterparty))continue;const key=JSON.stringify([r.account,r.counterparty,r.category]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
    for(const all of groups.values()){
      const monthly=new Map();for(const r of all){const key=r.date.slice(0,7);if(!monthly.has(key))monthly.set(key,[]);monthly.get(key).push(r);}
      // Multiple same-month charges cannot be assumed to be one subscription.
      const singles=[...monthly.entries()].filter(([,r])=>r.length===1).sort(([a],[b])=>a.localeCompare(b));
      let run=[];const save=()=>{if(run.length<3)return;const amounts=run.map(r=>outflow(r)),mean=sum(run,outflow)/run.length;if(mean>0&&amounts.every(n=>Math.abs(n-mean)/mean<=.05))candidates.push({name:run[0].counterparty,account:run[0].account,rows:run.slice(),monthly:round(mean),total:sum(run,outflow)});};
      for(const [key,one] of singles){const r=one[0],last=run.at(-1),gap=last?(Date.parse(r.date)-Date.parse(last.date))/86400000:null;if(last&&(monthNumber(key)-monthNumber(last.date.slice(0,7))!==1||gap<20||gap>40)){save();run=[];}run.push(r);}save();
    }
    return candidates.sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name,'zh-CN'));
  }
  function build(model={}){
    const eligible=(model.transactions||[]).filter(r=>inflow(r)+outflow(r)>0),raw=(model.rawTransactions||[]).concat(model.neutralTransactions||[],model.zeroTransactions||[]);
    const rawRows=raw.length?raw:eligible,recordOnly=!eligible.length&&rawRows.length>0,rows=recordOnly?rawRows:eligible;
    const incomeRows=eligible.filter(r=>inflow(r)>0),expenseRows=eligible.filter(r=>outflow(r)>0),income=sum(incomeRows,inflow),expense=sum(expenseRows,outflow),gross=round(income+expense);
    const monthKeys=[...new Set(rows.filter(r=>day(r.date)).map(r=>r.date.slice(0,7)))].sort();
    const forecast=model.ownForecast||{},coveredKeys=forecast.completeMonths?forecast.baselineMonthKeys||[]:model.period?.cashComplete?(model.monthly||[]).map(r=>r.month):[];
    const fullMonths=[...new Set(coveredKeys)].sort(),limited=rows.length<10||monthKeys.length<2;
    const coverage={recordCount:rawRows.length,flowRecordCount:eligible.length,observedMonths:monthKeys.length,fullMonths:fullMonths.length,level:limited?'limited':fullMonths.length?'observed':'partial',label:rawRows.length+' 笔原始记录 · '+monthKeys.length+' 个有记录月份'+(fullMonths.length?' · '+fullMonths.length+' 个完整基准月份':' · 月份完整性待核对')};
    const dim=(id,name,value,metric,rule,explanation,evidence,extra={})=>({id,name,score:finite(value)?Math.round(clamp(value)):null,status:limited?'样本有限':'已计算',metric,rule,explanation,rows:evidence,...extra});
    const dimensions=[];
    if(!rows.length){
      for(const [id,name] of [['balance','收支比例'],['cash','现金缓冲'],['source','来源分散'],['rhythm','收付节奏'],['clarity','记录清晰']])dimensions.push(dim(id,name,null,'尚无可分析的流水','没有流水时不填入假定分数。','补充的余额或应收资料会保留；收支观察需要至少一笔流水。',[]));
    }else if(recordOnly){
      const checks=[['date','日期可读',r=>day(r.date),'可读取交易日期'],['account','账户可辨',r=>known(r.account),'可辨认账户'],['source','对象清晰',r=>known(r.counterparty),'明确交易对象'],['category','分类清晰',r=>known(r.category),'明确交易分类'],['amount','金额可核',r=>finite(r.amount)||finite(r.inflow)&&finite(r.outflow),'提供有效金额']];
      for(const [id,name,check,label] of checks){const n=rows.filter(check).length;dimensions.push(dim(id,name,n/rows.length*100,label+' '+n+'/'+rows.length,'符合此项的原始记录数÷本期原始记录数×100。',`仅衡量已提供记录的可读性，不评价投资表现、收入或支出。`,[[label+'记录',n],['原始记录',rows.length]],{basis:'原始记录质量',proxy:true}));}
    }else{
      dimensions.push(dim('balance','收支比例',income/gross*100,'收入占收付合计 '+pct(income/gross),'已提供收入÷（已提供收入＋已提供支出）×100；收支相等为50。只反映已提供记录的结构，未上传的收支未知。',`本期收入 ${cash(income)}，支出 ${cash(expense)}，收支差额 ${cash(income-expense)}。该差额不等于利润或余额。`,[['已提供收入',income],['已提供支出',expense],['收入占比',pct(income/gross)]],{basis:'已提供收支'}));
      const position=model.cashPosition,knownCash=position?(position.complete&&forecast.relative!==true&&!model.cashEstimate?.estimated&&finite(position.total)?position.total:null):finite(model.totals?.closingCash)?model.totals.closingCash:null;
      const monthlyExpense=finite(forecast.monthlyExpense)?forecast.monthlyExpense:fullMonths.length?sum(expenseRows.filter(r=>fullMonths.includes(text(r.date).slice(0,7))),outflow)/fullMonths.length:null;
      if(knownCash!==null&&monthlyExpense>0&&fullMonths.length){
        const months=knownCash/monthlyExpense;
        dimensions.push(dim('cash','现金缓冲',months/6*100,'已知现金覆盖 '+months.toFixed(2)+' 个月','已知账户现金÷完整基准月平均付款÷6×100，限制在0—100。6个月为本软件的观察刻度，不是行业要求。',`截至 ${position?.date||model.asOf||'报告日'}，已知现金 ${cash(knownCash)}；基准月均付款 ${cash(monthlyExpense)}。未来新增收入和支出未计入。`,[['余额日期',position?.date||model.asOf||''],['已知现金',knownCash],['基准月均付款',round(monthlyExpense)],['参考月数',6]],{basis:'已知余额与历史付款'}));
      }else{
        const largest=rows.slice().sort((a,b)=>magnitude(b)-magnitude(a))[0],share=magnitude(largest)/gross;
        dimensions.push(dim('cash','单笔分散',(1-share)*100,'最大单笔占收付合计 '+pct(share),'（1－最大一笔收付金额÷已提供收付合计）×100。衡量单笔集中程度，不替代现金安全判断。',`最大一笔 ${cash(magnitude(largest))}，来自 ${text(largest.counterparty)||'未提供交易对象'}。${limited?'样本很少时集中度自然较高，不据此判定风险。':'可结合业务周期核对大额交易。'}`, [['最大一笔',magnitude(largest)],['收付合计',gross]],{basis:'现金缓冲资料不足时观察单笔集中度',proxy:true}));
      }
      const ar=model.ar||{},datedAr=(ar.rows||[]).filter(r=>r.outstanding>0&&day(r.dueDate)),arTotal=sum(datedAr,r=>r.outstanding),none=model.supplement?.ar?.none===true;
      if(none||arTotal>0){
        const overdue=sum(datedAr.filter(r=>r.dueDate<model.asOf),r=>r.outstanding),share=arTotal?overdue/arTotal:0;
        dimensions.push(dim('source','已录回款',(1-share)*100,none?'已确认没有应收款':'有日期应收中逾期 '+pct(share),'（1－有到期日期的逾期未收金额÷有到期日期的未收金额）×100。明确确认无应收为100；未知日期或未录款项不进入计算。',none?'仅表示用户已确认本报告截止日没有应收款。':`已录且有到期日期的未收款 ${cash(arTotal)}，逾期 ${cash(overdue)}。不代表尚未补录的全部应收。`,[['有到期日的未收金额',arTotal],['其中逾期',overdue],['范围',none?'已确认没有':'仅有到期日期的应收']],{basis:'已录应收资料'}));
      }else{
        const incoming=incomeRows.length>0,partRows=incoming?incomeRows:expenseRows,amount=incoming?inflow:outflow,total=incoming?income:expense,groups=group(partRows,r=>r.counterparty,amount),hhi=groups.reduce((n,g)=>n+(g.amount/total)**2,0),top=groups[0];
        dimensions.push(dim('source',incoming?'收款分散':'付款分散',(1-hhi)*100,'最大对象占比 '+pct(top.amount/total),'（1－各交易对象金额占比平方之和）×100。单一对象为0；是集中度观察，不代表对象质量或违约概率。',`${groups.length} 个交易对象，${top.name}占 ${pct(top.amount/total)}。${limited?'目前样本有限。':'固定工资或固定供应商也会形成集中，需结合用途理解。'}`,groups.map(g=>[g.name,g.amount]),{basis:'未提供可判断应收时观察交易对象分布',proxy:true}));
      }
      const comparable=fullMonths.filter(key=>monthKeys.includes(key));
      if(comparable.length>=2){
        const totals=comparable.map(key=>({month:key,amount:sum(rows.filter(r=>text(r.date).startsWith(key)),magnitude)})),mean=sum(totals,r=>r.amount)/totals.length,cv=mean>0?Math.sqrt(totals.reduce((n,r)=>n+(r.amount-mean)**2,0)/totals.length)/mean:0;
        dimensions.push(dim('rhythm','收付稳定',(1-cv)*100,'月收付波动系数 '+cv.toFixed(2),'（1－完整基准月份收付总额的标准差÷平均额）×100，限制在0—100。仅观察波动，季节性和增长也会带来波动。',`采用 ${comparable.join('、')} 的收付记录。没有把未提供月份按零处理。`,totals.map(r=>[r.month,r.amount]),{basis:'完整基准月份'}));
      }else{
        const dates=group(rows,r=>r.date,magnitude),top=dates[0],share=top.amount/gross;
        dimensions.push(dim('rhythm','交易节奏',(1-share)*100,'最大交易日占比 '+pct(share),'（1－单日最大收付金额÷本期收付合计）×100。只描述交易日期集中程度，不判断长期稳定性。',`${dates.length} 个交易日，${top.name}金额最高 ${cash(top.amount)}。当前不作完整月份的环比判断。`,dates.slice(0,10).map(r=>[r.name,r.amount]),{basis:'完整月份不足时观察已提供交易日',proxy:true}));
      }
      const validName=rows.filter(r=>known(r.counterparty)).length,validCategory=rows.filter(r=>known(r.category)).length,validDate=rows.filter(r=>day(r.date)).length,clarity=(validName*.4+validCategory*.4+validDate*.2)/rows.length*100;
      dimensions.push(dim('clarity','记录清晰',clarity,'对象 '+validName+'/'+rows.length+' · 分类 '+validCategory+'/'+rows.length,'交易对象明确比例×40＋分类明确比例×40＋日期可读比例×20。衡量已提供字段的可解释性，不证明账本已经完整。',`${rows.length-validName} 笔交易对象待核对，${rows.length-validCategory} 笔分类待核对。未提供的其他账户不被当作零。`,[['有明确对象',validName],['有明确分类',validCategory],['可读取日期',validDate],['本期纳入记录',rows.length]],{basis:'已提供流水字段'}));
    }
    const scored=dimensions.filter(d=>finite(d.score)),score=scored.length?Math.round(sum(scored,d=>d.score)/scored.length):null;
    const incomeGroups=group(incomeRows,r=>r.counterparty,inflow),expenseGroups=group(expenseRows,r=>r.category,outflow),recurring=periodic(expenseRows);
    const candidates=[];
    function action(priority,title,description,expected,condition,cashRows=[],evidence=[],status='可关注'){
      candidates.push({priority,title,description,expected,condition,cashRows,rows:evidence,detailTitle:title+' · 对应记录',status});
    }
    const overdueRows=(model.ar?.rows||[]).filter(r=>r.outstanding>0&&day(r.dueDate)&&r.dueDate<model.asOf),overdue=sum(overdueRows,r=>r.outstanding);
    if(overdue>0)action(0,'跟进已录入的逾期款',`${overdueRows.length} 笔已录应收超过约定日期，合计 ${cash(overdue)}。`,'按客户核对实际到账情况和下一次付款日期。','只检查已提供到期日期的应收；没有把未知日期认定为逾期。',[],overdueRows.map(r=>[r.customer+' · '+r.dueDate,r.outstanding]),'需跟进');
    if(eligible.length&&expense>income)action(1,'先核对主要付款',`本期已提供付款比收款多 ${cash(expense-income)}${expenseGroups[0]?'，最大分类是'+expenseGroups[0].name+' '+cash(expenseGroups[0].amount):''}。`,'逐项确认大额付款的用途和是否还有后续付款。','这是已提供记录的收支差额，不等同于亏损，也不说明账户余额为负。',expenseGroups[0]?.rows||expenseRows,[['已提供收款',income],['已提供付款',expense]],'可关注');
    if(recurring.length){const r=recurring[0];action(2,'检查规律性付款是否仍需要',`${r.name}连续 ${r.rows.length} 个月出现接近金额的付款，平均每月 ${cash(r.monthly)}。`,'打开记录确认是否属于仍在使用的订阅、分期或其他固定付款。','相同对象连续至少3个月、相邻日期20—40天、单笔金额与均值偏差不超过5%；仅为候选，不自动认定订阅或重复扣费。',r.rows,r.rows.map(x=>[x.date,outflow(x)]));}
    const compared=fullMonths.filter(key=>monthKeys.includes(key)).slice(-2);
    if(compared.length===2&&monthNumber(compared[1])-monthNumber(compared[0])===1){
      const before=expenseRows.filter(r=>text(r.date).startsWith(compared[0])),after=expenseRows.filter(r=>text(r.date).startsWith(compared[1])),b=sum(before,outflow),a=sum(after,outflow);
      if(b>0&&a>b*1.15){const names=[...new Set(before.concat(after).map(r=>r.category))],changes=names.map(name=>({name,change:round(sum(after.filter(r=>r.category===name),outflow)-sum(before.filter(r=>r.category===name),outflow))})).sort((x,y)=>y.change-x.change),top=changes[0];action(3,'核对本月增加的付款',`${compared[1]}较${compared[0]}付款增加 ${cash(a-b)}（${pct(a/b-1)}），其中${top.name||'未分类'}增加 ${cash(top.change)}。`,'核对增加部分是一次性投入还是后续会持续发生。','仅比较连续两个有完整覆盖的基准月份。',after.filter(r=>r.category===top.name),[[compared[0],b],[compared[1],a],['增加最多的分类',top.name]]);}
    }
    if(incomeGroups.length){const top=incomeGroups[0],share=top.amount/income;action(4,share>.5?'关注主要收款来源':'核对主要收款来源',`${top.name}贡献 ${cash(top.amount)}，占本期已提供收款 ${pct(share)}。`,'确认这类收款是否会继续，并将已知变化用于沙盘。','仅描述本期对象集中度；工资、退款和客户付款可能具有不同含义，不自动认定客户依赖风险。',top.rows,[[top.name,top.amount],['本期已提供收款',income]]);}
    if(expenseGroups.length){const top=expenseGroups[0];action(5,'从最大支出分类开始检查',`${top.name}合计 ${cash(top.amount)}，占已提供付款 ${pct(top.amount/expense)}。`,'查看明细，先区分必要支出和可调整支出。','付款不是账务成本，未判断费用合理性或可节省金额。',top.rows,[[top.name,top.amount],['本期已提供付款',expense]]);}
    const unclear=rows.filter(r=>!known(r.counterparty)||!known(r.category));
    if(unclear.length)action(6,'核对暂不清楚的交易',`${unclear.length} 笔记录的交易对象或分类不够明确，合计 ${cash(sum(unclear,magnitude))}。`,'先核对金额较大的记录，后续分析会更容易理解。','不改变原账单的交易类别，也不会擅自删掉收支。',unclear.slice().sort((a,b)=>magnitude(b)-magnitude(a)),[['待核对笔数',unclear.length],['金额合计',sum(unclear,magnitude)]]);
    if(rows.length&&candidates.length<3){const largest=rows.slice().sort((a,b)=>magnitude(b)-magnitude(a))[0];action(7,'查看本期最大一笔记录',`${largest.date||'日期未提供'}，${text(largest.counterparty)||'交易对象未提供'}记录金额 ${cash(magnitude(largest))}。`,'核对用途及是否会再次发生，再决定是否纳入未来计划。','大额仅是相对本期其他记录而言，不代表异常或风险。',[largest],[['日期',largest.date||'未提供'],['记录金额',magnitude(largest)]]);}
    if(rows.length&&candidates.length<3)action(8,'按现有记录查看变化情景',`${monthKeys.length} 个有记录月份、${rows.length} 笔${recordOnly?'原始交易':'收付记录'}可作为进一步核对的起点。`,'先查看已有记录；有未上传账户或月份时再继续追加。','缺失月份不当作零，历史记录不能保证未来持续。',rows,[['已有月份',monthKeys.join('、')],['记录笔数',rows.length]]);
    const actions=candidates.sort((a,b)=>a.priority-b.priority).slice(0,3);
    const overallStatus=!rows.length?'等待流水':limited?'样本有限 · 初步观察':'基于已提供记录';
    const title=recordOnly?'记录观察评分':'收支观察评分';
    const overview=recordOnly?'本期没有计入收支的交易，先展示原始记录的可读性。':!eligible.length?'尚无可分析的收付流水。':`已提供记录${income>=expense?'收款多于或等于付款':'付款多于收款'} ${cash(Math.abs(income-expense))}，${limited?'先作初步观察。':'可从主要交易和变化来源着手核对。'}`;
    const readings=[{title:'收支范围',text:recordOnly?'原始记录仍然保留，投资理财、信用还款、他人代付及本人互转等排除项没有转成收入和支出。':`本期纳入收款 ${cash(income)}、付款 ${cash(expense)}；退款入账依照报告口径包含在收款中。`},{title:'主要来源',text:incomeGroups[0]?`${incomeGroups[0].name}是本期最大收款对象，占 ${pct(incomeGroups[0].amount/income)}。这只是已提供记录的分布。`:'目前没有纳入看板的收款记录，不能据此认定实际没有收入。'},{title:'主要支出',text:expenseGroups[0]?`${expenseGroups[0].name}是最大付款分类，占 ${pct(expenseGroups[0].amount/expense)}。可以点击建议查看对应记录。`:'目前没有纳入看板的付款记录，不能据此认定实际没有支出。'},{title:'观察范围',text:coverage.label+'。'+(limited?'样本较少，集中度及节奏不代表长期表现。':'各维度随可用资料调整；替代指标直接显示其实际名称。')}];
    const method=`${title}采用可查看的自定义观察刻度，${scored.length}个有依据维度等权平均。缺失的利润、余额或应收不填零分；改用名称明确的可观察指标。${coverage.label}。不属于审计结论、信用评级或行业排名，分数变化也可能来自观察维度变化。`;
    return {score,title,status:overallStatus,method,overview,dimensions,actions,readings,coverage,metrics:{income,expense,net:round(income-expense),recurringCount:recurring.length},recordOnly};
  }
  return Object.freeze({build});
});
