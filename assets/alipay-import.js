/* Alipay original statements. Preserve source income/expense classifications.
 * Refunds marked 不计收支 remain separate records, never synthetic income.
 * The header may use a different expense basis; reconcile it explicitly.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./data-engine.js'));
  else root.YoushuAlipay=factory(root.YoushuData);
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
  'use strict';
  const text=v=>String(v==null?'':v).trim(),cents=v=>Math.round(v*100);
  const clean=v=>text(v).replace(/^\uFEFF/,'').replace(/（/g,'(').replace(/）/g,')').replace(/\s/g,'');
  const labels=['交易时间','交易分类','交易对方','商品说明','收/支','金额','收/付款方式','交易状态','交易订单号'];
  const canonical=v=>clean(v)==='金额(元)'?'金额':clean(v);
  function detect(sheets){
    const found=[];
    (sheets||[]).forEach((sheet,sheetIndex)=>{
      const rows=sheet.rows||[],header=rows.slice(0,100).findIndex(row=>labels.every(label=>row.some(v=>canonical(v)===label)));
      if(header>=0&&rows.slice(0,header).some(row=>row.some(v=>/支付宝/.test(text(v)))))found.push({sheetIndex,header});
    });
    return found.length===1?found[0]:null;
  }
  function parse(sheets,name){
    const match=detect(sheets);if(!match)return null;
    const matrix=sheets[match.sheetIndex].rows,header=matrix[match.header].map(canonical),get=(row,label)=>text(row[header.indexOf(label)]);
    const rows=[],neutralRows=[],zeroRows=[],errors=[],seen=new Set();
    const summary={count:0,incomeCount:0,income:0,expenseCount:0,expense:0,neutralCount:0,neutral:0,refundCount:0,refund:0,neutralRefundCount:0,neutralRefund:0,zeroCount:0};
    const issue=(row,message)=>errors.push({row,message});
    if(labels.some(label=>header.filter(value=>value===label).length!==1))issue(match.header+1,'支付宝账单中有重复的必要列，请使用未改动的原始文件。');
    function add(key,amount){
      const next=summary[key]+cents(amount);
      if(!Number.isSafeInteger(next))throw Error('账单金额总规模过大，无法保证分级精度，请拆分账单。');
      summary[key]=next;
    }
    matrix.slice(match.header+1).forEach((raw,index)=>{
      const nonempty=raw.map(text).filter(Boolean);
      if(!nonempty.length)return;
      // Exporters can append a separator or their standard explanatory footer.
      // Never skip a malformed multi-column transaction or an arbitrary note.
      if(nonempty.length===1&&(/^[—_-]{3,}$/.test(nonempty[0])||/^(?:特别提示[：:]|本明细仅供个人对账使用[。.]?$|支付宝支付科技有限公司)/.test(nonempty[0])))return;
      const sourceRow=match.header+index+2;
      try{
        const date=D.parseDate(raw[header.indexOf('交易时间')]),direction=get(raw,'收/支'),type=get(raw,'交易分类'),status=get(raw,'交易状态');
        const amount=D.parseMoney(get(raw,'金额'),{nonNegative:true}),id=get(raw,'交易订单号');
        if(!['收入','支出','不计收支'].includes(direction))throw Error('尚不能确认这条支付宝记录的收支方向，未计入报告。');
        if(!['交易成功','支付成功','等待确认收货','交易关闭','已关闭','退款成功','已退款','交易完成'].includes(status))throw Error('交易状态“'+status+'”需要核对，未计入报告。');
        if(!id||id==='/')throw Error('交易订单号缺失，请使用完整的原始支付宝账单。');
        if(typeof raw[header.indexOf('交易订单号')]==='number')throw Error('交易订单号已被转成数字，可能丢失精度；请直接上传原始支付宝 CSV。');
        if(seen.has(id))throw Error('交易订单号重复，请核对原账单；没有自动重复计入。');
        seen.add(id);
        const isNeutral=direction==='不计收支',refund=status==='退款成功'||/退款/.test(type)||(direction!=='支出'&&status==='已退款');
        const record={sourceType:'alipay',sourceRow,id,date,account:'支付宝',counterparty:get(raw,'交易对方')||'未提供交易对方',category:type||'其他',transactionType:type,transactionStatus:status,paymentMethod:get(raw,'收/付款方式'),product:get(raw,'商品说明'),note:get(raw,'备注'),merchantOrderId:get(raw,'商家订单号'),direction,amount,isRefund:refund,balance:null};
        summary.count++;
        const key=isNeutral?'neutral':direction==='收入'?'income':'expense';summary[key+'Count']++;add(key,amount);
        if(refund){summary.refundCount++;add('refund',amount);if(isNeutral){summary.neutralRefundCount++;add('neutralRefund',amount);}}
        if(isNeutral)neutralRows.push(record);
        else if(amount===0){zeroRows.push(record);summary.zeroCount++;}
        else rows.push({...record,inflow:direction==='收入'?amount:0,outflow:direction==='支出'?amount:0,activity:'operating'});
      }catch(e){issue(sourceRow,e.message);}
    });
    ['income','expense','neutral','refund','neutralRefund'].forEach(key=>summary[key]/=100);
    const prefix=matrix.slice(0,match.header).map(row=>row.map(text).join(' ')).join('\n'),declared={},verifiedFields=[];
    const countMatch=prefix.match(/共\s*([\d,]+)\s*笔记录/);
    if(countMatch)declared.count=Number(countMatch[1].replace(/,/g,''));
    [['income','收入'],['expense','支出'],['neutral','不计收支']].forEach(([key,label])=>{
      const m=prefix.match(new RegExp('(?:^|\\n)\\s*'+label+'[：:]\\s*([\\d,]+)\\s*笔\\s*([\\d,.]+)\\s*元'));
      if(m){
        declared[key+'Count']=Number(m[1].replace(/,/g,''));
        try{declared[key]=D.parseMoney(m[2],{nonNegative:true});}catch(e){issue(0,'支付宝文件开头的'+label+'汇总金额格式不正确。');}
      }
    });
    let reconciliationBasis='unverified';
    Object.keys(declared).forEach(key=>{
      if(cents(summary[key])===cents(declared[key])){verifiedFields.push(key);if(key==='expense')reconciliationBasis='source-classification';}
      else if(key==='expense'&&summary.neutralRefundCount>0&&cents(summary.expense)-cents(summary.neutralRefund)===cents(declared.expense)){
        // This checks an aggregate relationship only. It does not match refunds
        // to this period's orders or change the original transaction amounts.
        verifiedFields.push(key);reconciliationBasis='expense-less-neutral-refunds';
      }else issue(0,'明细合计与支付宝文件开头的'+({count:'总笔数',income:'收入金额',incomeCount:'收入笔数',expense:'支出金额',expenseCount:'支出笔数',neutral:'不计收支金额',neutralCount:'不计收支笔数'}[key]||key)+'不一致，请核对原始账单。');
    });
    if(!summary.count&&!errors.length)issue(0,'这份支付宝账单没有交易记录。');
    const period=prefix.match(/起始时间[：:]\s*\[?(\d{4}-\d{2}-\d{2})[\s\S]*?终止时间[：:]\s*\[?(\d{4}-\d{2}-\d{2})/);
    const dates=rows.concat(neutralRows,zeroRows).map(r=>r.date).sort();
    let start=dates[0],end=dates[dates.length-1];
    if(period){
      try{start=D.parseDate(period[1]);end=D.parseDate(period[2]);if(start>end||dates.some(date=>date<start||date>end))issue(0,'部分明细日期超出了支付宝账单注明的期间，请核对原文件。');}
      catch(e){issue(0,'支付宝账单注明的期间日期无效。');}
    }
    return{rows,errors,statement:{format:'alipay-v1',sourceName:name,headerRow:match.header+1,start,end,summary,declared,verifiedFields,reconciliationBasis,reconciled:verifiedFields.length===7&&!errors.length,neutralRows,zeroRows}};
  }
  return Object.freeze({detect,parse});
});
