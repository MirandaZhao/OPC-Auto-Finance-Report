/* WeChat's original bill: preserve the statement's gross receipts/payments.
 * A refunded purchase and its refund receipt are separate source records.
 * Neutral entries are retained for review, never inferred as revenue/cost.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./data-engine.js'));
  else root.YoushuWechat=factory(root.YoushuData);
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
  'use strict';
  const text=v=>String(v==null?'':v).trim(),cents=v=>Math.round(v*100);
  const labels=['交易时间','交易类型','交易对方','商品','收/支','金额(元)','支付方式','当前状态','交易单号'];
  const clean=v=>text(v).replace(/（/g,'(').replace(/）/g,')').replace(/\s/g,'');
  function detect(sheets){
    const found=[];
    (sheets||[]).forEach((sheet,sheetIndex)=>{
      const rows=sheet.rows||[],header=rows.slice(0,60).findIndex(row=>labels.every(label=>row.some(v=>clean(v)===label)));
      if(header>=0&&rows.slice(0,header).some(row=>row.some(v=>/微信支付账单/.test(text(v)))))found.push({sheetIndex,header});
    });
    return found.length===1?found[0]:null;
  }
  function parse(sheets,name){
    const match=detect(sheets);if(!match)return null;
    const matrix=sheets[match.sheetIndex].rows,header=matrix[match.header].map(clean),get=(row,label)=>text(row[header.indexOf(label)]);
    const rows=[],neutralRows=[],errors=[],seen=new Set();
    const summary={count:0,incomeCount:0,income:0,expenseCount:0,expense:0,neutralCount:0,neutral:0,refundCount:0,refund:0};
    function issue(row,message){errors.push({row,message});}
    matrix.slice(match.header+1).forEach((raw,index)=>{
      if(raw.every(v=>!text(v)))return;
      const sourceRow=match.header+index+2;
      try{
        const date=D.parseDate(raw[header.indexOf('交易时间')]),direction=get(raw,'收/支'),type=get(raw,'交易类型'),status=get(raw,'当前状态');
        const amount=D.parseMoney(get(raw,'金额(元)'),{nonNegative:true}),id=get(raw,'交易单号');
        if(!amount)throw Error('金额为零，请核对原账单。');
        if(!['收入','支出','/','不计收支'].includes(direction))throw Error('尚不能确认这条记录的收支方向，未计入报告。');
        if(!/^(支付成功|对方已收钱|已存入零钱|已转账|已收钱|已到账|提现已到账|充值成功|已全额退款|对方已退还|已退款(?:[（(]?[¥￥]?[\d,.]+[)）]?)?)$/.test(status))throw Error('交易状态“'+status+'”需要核对，未计入报告。');
        if(id&&id!=='/'&&seen.has(id))throw Error('交易单号重复，请核对原账单；没有自动重复计入。');
        if(id&&id!=='/')seen.add(id);
        const isNeutral=direction==='/'||direction==='不计收支';
        const refund=!isNeutral&&direction==='收入'&&(/退款|退还/.test(type)||/退款|退还/.test(status));
        const meta={sourceType:'wechat',sourceRow,transactionType:type,transactionStatus:status,paymentMethod:get(raw,'支付方式'),product:get(raw,'商品'),note:get(raw,'备注'),direction,amount,isRefund:refund};
        const record={...meta,id:id==='/'?'':id,date,account:'微信支付',counterparty:get(raw,'交易对方')||'未提供交易对方',category:refund?'退款收回':type||'其他',balance:null};
        summary.count++;
        if(isNeutral){neutralRows.push(record);summary.neutralCount++;summary.neutral+=cents(amount);}
        else{
          rows.push({...record,inflow:direction==='收入'?amount:0,outflow:direction==='支出'?amount:0,activity:'operating'});
          const key=direction==='收入'?'income':'expense';summary[key+'Count']++;summary[key]+=cents(amount);
          if(refund){summary.refundCount++;summary.refund+=cents(amount);}
        }
      }catch(e){issue(sourceRow,e.message);}
    });
    ['income','expense','neutral','refund'].forEach(key=>summary[key]/=100);
    const prefix=matrix.slice(0,match.header).map(row=>row.map(text).join(' ')).join('\n');
    const countMatch=prefix.match(/共\s*([\d,]+)\s*笔记录/),declared={};
    if(countMatch)declared.count=Number(countMatch[1].replace(/,/g,''));
    [['income','收入'],['expense','支出'],['neutral','中性交易']].forEach(([key,label])=>{
      const m=prefix.match(new RegExp(label+'[：:]\\s*([\\d,]+)\\s*笔\\s*([\\d,.]+)\\s*元'));
      if(m){declared[key+'Count']=Number(m[1].replace(/,/g,''));declared[key]=Number(m[2].replace(/,/g,''));}
    });
    Object.keys(declared).forEach(key=>{if(cents(summary[key])!==cents(declared[key]))issue(0,'明细合计与微信文件开头的汇总不一致，请使用完整的原始账单。');});
    if(!summary.count&&!errors.length)issue(0,'这份微信账单没有交易记录。');
    const period=prefix.match(/起始时间[：:]\s*\[?(\d{4}-\d{2}-\d{2})[\s\S]*?终止时间[：:]\s*\[?(\d{4}-\d{2}-\d{2})/);
    const dates=rows.concat(neutralRows).map(r=>r.date).sort();
    const start=period?period[1]:dates[0],end=period?period[2]:dates[dates.length-1];
    if(period&&dates.some(date=>date<start||date>end))issue(0,'部分明细日期超出了账单注明的期间，请核对原文件。');
    return{rows,errors,statement:{format:'wechat-v1',sourceName:name,headerRow:match.header+1,start,end,summary,declared,reconciled:Object.keys(declared).length===7&&!errors.length,neutralRows}};
  }
  return Object.freeze({detect,parse});
});
