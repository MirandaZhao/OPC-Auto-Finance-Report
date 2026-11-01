/* Original bank text-PDF statements. Positions bind wrapped text to its dated
 * row; page numbers and balances are checked before the UI permits import.
 * No transaction IDs or accounting classifications are inferred from a PDF.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./data-engine.js'));
  else root.YoushuBank=factory(root.YoushuData);
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
  'use strict';
  const HEADERS=['记账日期','货币','交易金额','联机余额','交易摘要','对手信息'];
  const text=v=>String(v==null?'':v).trim(),clean=v=>text(v).replace(/\s/g,''),cents=v=>Math.round(v*100);
  const isHeader=row=>Array.isArray(row)&&row.length===6&&HEADERS.every((h,i)=>clean(row[i])===h);
  const joinText=parts=>parts.reduce((s,v)=>s+(s&&/[a-z0-9]$/i.test(s)&&/^[a-z0-9]/i.test(v)?' ':'')+v,'');
  const title=t=>/招商银行交易流水/.test(clean(t))||/Transaction\s+Statement\s+of\s+China\s+Merchants\s+Bank/i.test(t);
  function detectCmb(result){
    if(result?.format!=='pdf'||!Array.isArray(result.sheets))return false;
    const sheets=result.sheets.filter(s=>Number.isInteger(s.page));
    const first=sheets.find(s=>s.page===1);
    return !!first&&Array.isArray(first.rows)&&title(first.rows.map(r=>r.map(text).join(' ')).join('\n'))&&first.rows.some(isHeader);
  }
  function parseCmb(result,name){
    if(!detectCmb(result))return null;
    const pages=result.sheets.filter(s=>Number.isInteger(s.page)),rows=[],errors=[],warnings=[],balanceErrors=[];
    const issue=(page,row,message,code='BANK_PDF_REVIEW')=>errors.push({page,row,message,code});
    const first=pages.find(s=>s.page===1),headerIndex=first.rows.findIndex(isHeader),preamble=first.rows.slice(0,headerIndex).map(r=>r.map(text).join(' ')).join('\n');
    const period=preamble.match(/(\d{4}-\d{2}-\d{2})\s*(?:--|至|[—－~～])\s*(\d{4}-\d{2}-\d{2})/);
    let start='',end='';
    if(!period)issue(1,0,'无法确认招商银行账单注明的起止日期，请核对完整原文件。');
    else try{start=D.parseDate(period[1]);end=D.parseDate(period[2]);if(start>end)throw Error();}catch(_){issue(1,0,'招商银行账单注明的期间日期无效。');}
    const accountTokens=[...preamble.matchAll(/(?:账\s*[号户]\s*|帐\s*号\s*|Account\s*No\s*)[：:]\s*([0-9*＊xX][0-9*＊xX\s-]{6,}[0-9*＊xX])/g)].map(m=>m[1].replace(/[\s-]/g,''));
    const distinct=[...new Set(accountTokens)];
    let accountMasked='';
    if(distinct.length===1){const token=distinct[0];accountMasked=/^\d{8,}$/.test(token)?token.slice(0,4)+'*'.repeat(token.length-8)+token.slice(-4):token.replace(/[＊xX]/g,'*');}
    else warnings.push('没有唯一可识别的银行账号，请在核对区填写账户名称。');
    const account=accountMasked?'招商银行 '+accountMasked:'';
    const declaredPages=Number(result.pages);
    if(!Number.isInteger(declaredPages)||declaredPages<1||pages.length!==declaredPages)issue(0,0,'PDF 页数或逐页提取结果不完整，本次不能导入。','BANK_PDF_PAGES');
    const pageSet=new Set();
    for(const sheet of pages){
      const page=sheet.page,matrix=sheet.rows,positions=sheet.rowPositions;
      if(pageSet.has(page)||page<1||page>declaredPages)issue(page,0,'PDF 页码重复或超出范围。','BANK_PDF_PAGES');pageSet.add(page);
      if(sheet.source!=='text'){issue(page,0,'该页不是可核对的文字版招商银行流水，请使用原始文字版 PDF，扫描件需要人工核对。','BANK_PDF_OCR');continue;}
      if(!Array.isArray(matrix)||matrix.some(r=>!Array.isArray(r)||r.length!==6)){issue(page,0,'该页列位置与招商银行六列流水格式不一致。');continue;}
      if(!Array.isArray(positions)||positions.length!==matrix.length||positions.some((y,i)=>!Number.isFinite(y)||(i>0&&y>=positions[i-1]))){issue(page,0,'该页缺少可靠的文字位置，无法确定跨行交易对方，请核对原文件。');continue;}
      const hi=matrix.findIndex(isHeader);if(hi<0){issue(page,0,'该页缺少完整的招商银行流水表头。');continue;}
      const footers=[];
      matrix.forEach((r,i)=>{const values=r.map(clean).filter(Boolean);if(values.length===1&&/^\d+\/\d+$/.test(values[0])){const pair=values[0].split('/').map(Number);footers.push(i);if(pair[0]!==page||pair[1]!==declaredPages)issue(page,i+1,'原文件页码与当前 PDF 页数不一致，可能缺页或重复，请重新导出完整账单。','BANK_PDF_PAGES');}});
      if(footers.length!==1)issue(page,0,'该页的原文件页码缺失或重复，无法确认账单完整性。','BANK_PDF_PAGES');
      let tableEnd=footers.length?footers[0]:matrix.length;
      for(let i=hi+1;i<tableEnd;i++){
        const values=matrix[i].map(clean).filter(Boolean);
        if(values.length===1&&(/^[—_\-]{3,}$/.test(values[0])||/^温馨提示[：:]?$/.test(values[0]))){tableEnd=i;break;}
      }
      for(let i=tableEnd;i<matrix.length;i++){
        if(footers.includes(i))continue;
        if(matrix[i].slice(0,4).some(v=>/^\d{4}[-/.]|^[+\-]?\d+(?:[,.]\d+)*$/.test(clean(v))))issue(page,i+1,'页尾说明之后仍出现疑似交易金额或日期，无法确认提取完整性。');
      }
      const englishHeaders=[['','','Transaction','','',''],['','','Amount','','',''],['Date','Currency','','Balance','Transaction Type','Counter Party'],['Date','Currency','Transaction Amount','Balance','Transaction Type','Counter Party']];
      const headerLine=r=>englishHeaders.some(h=>h.every((value,i)=>clean(r[i])===clean(value)));
      const anchors=[],fragments=[];
      for(let i=hi+1;i<tableEnd;i++){
        const raw=matrix[i].map(text);if(raw.every(v=>!v))continue;
        if(isHeader(matrix[i])||headerLine(raw))continue;
        if(raw[0]){anchors.push({index:i,y:positions[i],raw,parts:[[],[]]});continue;}
        if(raw.slice(0,4).some(Boolean)){issue(page,i+1,'发现没有记账日期的货币或金额，不能把它当作普通换行删除。');continue;}
        if(raw[4]||raw[5])fragments.push({index:i,y:positions[i],raw});
      }
      if(!anchors.length){issue(page,hi+1,'该页没有可确认的交易记录。');continue;}
      for(const anchor of anchors){if(anchor.raw[4])anchor.parts[0].push({index:anchor.index,value:anchor.raw[4]});if(anchor.raw[5])anchor.parts[1].push({index:anchor.index,value:anchor.raw[5]});}
      for(const fragment of fragments){
        const nearby=anchors.map(a=>({a,d:Math.abs(a.y-fragment.y)})).sort((a,b)=>a.d-b.d);
        if(nearby.length>1&&Math.abs(nearby[0].d-nearby[1].d)<.01){issue(page,fragment.index+1,'换行文字处于两笔交易之间，无法确认属于哪一笔，请核对原文件。');continue;}
        // CMB puts the financial cells at the vertical center of each table row.
        // Nearest dated center therefore includes both the preceding and following
        // lines of a wrapped name. Distant text cannot be silently assigned.
        if(nearby[0].d>32){issue(page,fragment.index+1,'有文字远离交易行，无法确认是否为完整的交易对方，请核对。');continue;}
        [4,5].forEach((column,j)=>{if(fragment.raw[column])nearby[0].a.parts[j].push({index:fragment.index,value:fragment.raw[column]});});
      }
      for(const anchor of anchors){
        try{
          const raw=anchor.raw,dateText=clean(raw[0]);if(!/^\d{4}-\d{2}-\d{2}$/.test(dateText))throw Error('记账日期格式无法确认。');
          const date=D.parseDate(dateText);if(start&&end&&(date<start||date>end))throw Error('交易日期超出了原账单注明的期间。');
          if(clean(raw[1])!=='CNY')throw Error('这份流水包含非人民币或未识别的货币，不能直接并入人民币账本。');
          const amount=D.parseMoney(clean(raw[2]).replace(/[−－]/g,'-')),balance=D.parseMoney(clean(raw[3]).replace(/[−－]/g,'-'));
          if(amount===0)throw Error('发现零金额银行记录，当前不能将它作为收支导入，请核对。');
          const category=joinText(anchor.parts[0].sort((a,b)=>a.index-b.index).map(x=>x.value)),counterparty=joinText(anchor.parts[1].sort((a,b)=>a.index-b.index).map(x=>x.value));
          if(!category)throw Error('交易摘要缺失，请核对原文件。');
          rows.push({id:'',date,account,counterparty:counterparty||'未提供交易对方',category,inflow:amount>0?amount:0,outflow:amount<0?-amount:0,balance,activity:'operating',sourceType:'bank',sourcePage:page,sourceRow:anchor.index+1,sourceRows:[...new Set([anchor.index,...anchor.parts.flat().map(x=>x.index)])].sort((a,b)=>a-b).map(i=>i+1),transactionType:category,direction:amount>0?'收入':'支出',amount:Math.abs(amount),signedAmount:amount,currency:'CNY',bankFormat:'cmb-pdf-v1'});
        }catch(e){issue(page,anchor.index+1,e.message);}
      }
    }
    for(let n=1;n<=declaredPages;n++)if(!pageSet.has(n))issue(n,0,'PDF 缺少第 '+n+' 页。','BANK_PDF_PAGES');
    let income=0,outflow=0;
    for(let i=0;i<rows.length;i++){
      const r=rows[i];income+=cents(r.inflow);outflow+=cents(r.outflow);
      if(!Number.isSafeInteger(income)||!Number.isSafeInteger(outflow))issue(r.sourcePage,r.sourceRow,'账单金额总规模过大，不能保证分级精度。');
      if(i&&r.date<rows[i-1].date)issue(r.sourcePage,r.sourceRow,'记账日期不是顺序排列，无法按原账单核对余额。');
      if(i&&cents(rows[i-1].balance)+cents(r.inflow)-cents(r.outflow)!==cents(r.balance)){
        const e={page:r.sourcePage,row:r.sourceRow,sourceRow:r.sourceRow,message:'本笔余额与上一笔余额加本笔收支不一致，请核对是否漏行、错列或符号识别错误。',code:'BANK_BALANCE_MISMATCH'};
        balanceErrors.push(e);errors.push(e);
      }
    }
    if(!rows.length&&!errors.length)issue(0,0,'这份银行账单没有可导入的交易记录。');
    warnings.push('银行 PDF 没有交易流水号。不同文件的重叠期间需要核对，不能仅凭同日同金额删除记录。');
    warnings.push('原始摘要和收支方向已保留；尚未区分个人消费、企业经营与账户互转，收支差额不是利润。');
    const firstRow=rows[0],lastRow=rows[rows.length-1];
    return {rows,errors,warnings,statement:{format:'cmb-pdf-v1',sourceName:name,bank:'招商银行',accountMasked,account,start,end,pages:declaredPages,recordCount:rows.length,income:income/100,outflow:outflow/100,openingBalance:firstRow?(cents(firstRow.balance)-cents(firstRow.inflow)+cents(firstRow.outflow))/100:null,openingBalanceInferred:true,closingBalance:lastRow?.balance??null,balanceChecked:rows.length>1&&errors.length===0,balanceCheckCount:Math.max(0,rows.length-1),balanceErrors,hasTransactionIds:false}};
  }
  const BOB_HEADERS=['交易日期','币种','钞汇','业务摘要','发生额','余额','对方户名','对方账号'];
  const isBobHeader=row=>Array.isArray(row)&&row.length===8&&BOB_HEADERS.every((h,i)=>clean(row[i])===h);
  function detectBob(result){
    if(result?.format!=='pdf'||!Array.isArray(result.sheets))return false;
    const first=result.sheets.find(s=>s.page===1);
    return !!first&&Array.isArray(first.rows)&&first.rows.some(r=>Array.isArray(r)&&clean(r.join('')).includes('北京银行个人客户交易流水清单'));
  }
  function parseBob(result,name){
    if(!detectBob(result))return null;
    const pages=result.sheets.filter(s=>Number.isInteger(s.page)),original=[],errors=[],warnings=[],balanceErrors=[];
    const issue=(page,row,message,code='BANK_PDF_REVIEW')=>errors.push({page,row,message,code});
    const declaredPages=Number(result.pages),pageSet=new Set();
    if(!Number.isInteger(declaredPages)||declaredPages<1||pages.length!==declaredPages)issue(0,0,'PDF 页数或逐页提取结果不完整，本次不能导入。','BANK_PDF_PAGES');
    const metadata=[];
    for(const sheet of pages){
      const page=sheet.page,matrix=sheet.rows,positions=sheet.rowPositions;
      if(pageSet.has(page)||page<1||page>declaredPages)issue(page,0,'PDF 页码重复或超出范围。','BANK_PDF_PAGES');pageSet.add(page);
      if(sheet.source!=='text'){issue(page,0,'该页不是可核对的文字版北京银行流水，请使用原始文字版 PDF，扫描件需要人工核对。','BANK_PDF_OCR');continue;}
      if(!Array.isArray(matrix)||matrix.some(r=>!Array.isArray(r)||r.length!==8)){issue(page,0,'该页列位置与北京银行八列流水格式不一致。');continue;}
      if(!Array.isArray(positions)||positions.length!==matrix.length||positions.some((y,i)=>!Number.isFinite(y)||(i>0&&y>=positions[i-1]))){issue(page,0,'该页缺少可靠的文字位置，无法确认交易行顺序。');continue;}
      const hi=matrix.findIndex(isBobHeader);
      if(hi<0){issue(page,0,'该页缺少完整的北京银行流水表头。');continue;}
      const preamble=clean(matrix.slice(0,hi).map(r=>r.join('')).join(''));
      if(!preamble.includes('北京银行个人客户交易流水清单'))issue(page,0,'该页缺少北京银行原始流水标题，请核对是否混入其他文件。');
      const period=preamble.match(/日期范围[：:](\d{4}-\d{2}-\d{2})(?:--|至|[—－~～-])(\d{4}-\d{2}-\d{2})/);
      let start='',end='';
      if(!period)issue(page,0,'无法确认北京银行账单注明的起止日期，请核对完整原文件。');
      else try{start=D.parseDate(period[1]);end=D.parseDate(period[2]);if(start>end)throw Error();}catch(_){issue(page,0,'北京银行账单注明的期间日期无效。');}
      const accountTokens=[...preamble.matchAll(/卡[/／]账号[：:]([0-9*＊xX]{8,32})/g)].map(m=>m[1].replace(/[＊xX]/g,'*'));
      const accounts=[...new Set(accountTokens)];
      if(accounts.length!==1)issue(page,0,'该页缺少唯一可确认的卡／账号，请核对原文件，不能混合不同账户。');
      if(!/币种[：:](?:人民币|CNY)(?![A-Z])/.test(preamble))issue(page,0,'账单页眉的币种不是可确认的人民币，不能直接并入人民币账本。');
      const serial=preamble.match(/流水单号[：:]([A-Za-z0-9]+)/)?.[1]||'';
      metadata.push({page,start,end,accountToken:accounts[0]||'',serial});
      const footers=[];
      matrix.forEach((r,i)=>{const values=r.map(clean).filter(Boolean),m=values.length===1&&/^第(\d+)页共(\d+)页$/.exec(values[0]);if(m){footers.push(i);if(+m[1]!==page||+m[2]!==declaredPages)issue(page,i+1,'原文件页码与当前 PDF 页数不一致，可能缺页或重复，请重新导出完整账单。','BANK_PDF_PAGES');}});
      if(footers.length!==1)issue(page,0,'该页的原文件页码缺失或重复，无法确认账单完整性。','BANK_PDF_PAGES');
      const tableEnd=footers.length?footers[0]:matrix.length;
      if(tableEnd<=hi)issue(page,0,'原文件页码出现在流水表头之前，无法确认表格范围。');
      for(let i=tableEnd+1;i<matrix.length;i++)if(matrix[i].some(v=>text(v)))issue(page,i+1,'页码之后仍有内容，无法确认是否遗漏交易，请核对完整原文件。');
      let pageCount=0;
      for(let i=hi+1;i<tableEnd;i++){
        const raw=matrix[i].map(text);if(raw.every(v=>!v)||isBobHeader(raw))continue;
        if(!raw[0]){issue(page,i+1,'发现没有交易日期的金额或文字，不能确定是否为跨行记录，请核对原文件。');continue;}
        try{
          const dateText=clean(raw[0]);if(!/^\d{4}-\d{2}-\d{2}$/.test(dateText))throw Error('交易日期格式无法确认。');
          const date=D.parseDate(dateText);if(start&&end&&(date<start||date>end))throw Error('交易日期超出了原账单注明的期间。');
          if(!['人民币','CNY'].includes(clean(raw[1])))throw Error('这份流水包含非人民币或未识别的币种，不能直接并入人民币账本。');
          const amountText=clean(raw[4]).replace(/[−－]/g,'-').replace(/＋/g,'+');
          if(!/^[+-]/.test(amountText))throw Error('发生额缺少正负号，无法确认收入或支出，请核对原文件。');
          const amount=D.parseMoney(amountText),balance=D.parseMoney(clean(raw[5]).replace(/[−－]/g,'-'));
          const category=text(raw[3]);if(!category)throw Error('业务摘要缺失，请核对原文件。');
          const direction=amountText[0]==='-'?'支出':'收入';
          original.push({id:'',date,account:'',counterparty:raw[6]||'未提供交易对方',counterpartyAccount:raw[7],category,inflow:amount>0?amount:0,outflow:amount<0?-amount:0,balance,activity:'operating',sourceType:'bank',sourcePage:page,sourceRow:i+1,sourceRows:[i+1],transactionType:category,direction,amount:Math.abs(amount),signedAmount:amount,currency:'CNY',bankFormat:'bob-pdf-v1',...(amount===0?{zeroAmount:true}:{})});pageCount++;
        }catch(e){issue(page,i+1,e.message);}
      }
      if(!pageCount)issue(page,hi+1,'该页没有可确认的交易记录。');
    }
    for(let n=1;n<=declaredPages;n++)if(!pageSet.has(n))issue(n,0,'PDF 缺少第 '+n+' 页。','BANK_PDF_PAGES');
    const firstMeta=metadata.find(m=>m.page===1)||{start:'',end:'',accountToken:'',serial:''};
    for(const m of metadata){
      if(m.start!==firstMeta.start||m.end!==firstMeta.end)issue(m.page,0,'各页注明的账单期间不一致，不能当作同一份流水导入。');
      if(m.accountToken!==firstMeta.accountToken)issue(m.page,0,'各页卡／账号不一致，不能混合不同账户的流水。');
      if(m.serial!==firstMeta.serial)issue(m.page,0,'各页流水单号不一致，可能混入了另一份文件。');
    }
    const token=firstMeta.accountToken,accountMasked=/^\d{8,}$/.test(token)?token.slice(0,4)+'*'.repeat(token.length-8)+token.slice(-4):token,account=accountMasked?'北京银行 '+accountMasked:'';
    for(let i=1;i<original.length;i++){
      const r=original[i],prev=original[i-1];
      if(r.sourcePage<prev.sourcePage)issue(r.sourcePage,r.sourceRow,'PDF 页面未按原文件顺序提取，请重新读取。','BANK_PDF_PAGES');
      if(r.date>prev.date)issue(r.sourcePage,r.sourceRow,'北京银行流水不是从新到旧排列，无法按此格式核对余额。');
    }
    // Reverse the complete sequence, including same-day records and zero entries.
    // Sorting by date alone would lose the original order needed for balance checks.
    const all=original.slice().reverse().map(r=>({...r,account}));
    let income=0,outflow=0;
    for(let i=0;i<all.length;i++){
      const r=all[i];income+=cents(r.inflow);outflow+=cents(r.outflow);
      if(!Number.isSafeInteger(income)||!Number.isSafeInteger(outflow))issue(r.sourcePage,r.sourceRow,'账单金额总规模过大，不能保证分级精度。');
      if(i&&cents(all[i-1].balance)+cents(r.signedAmount)!==cents(r.balance)){
        const e={page:r.sourcePage,row:r.sourceRow,sourceRow:r.sourceRow,message:'本笔余额与前一笔余额加本笔收支不一致，请核对是否漏行、错列或符号识别错误。',code:'BANK_BALANCE_MISMATCH'};balanceErrors.push(e);errors.push(e);
      }
    }
    if(!all.length&&!errors.length)issue(0,0,'这份银行账单没有可导入的交易记录。');
    const zeroRows=all.filter(r=>r.amount===0),rows=all.filter(r=>r.amount!==0),firstRow=all[0],lastRow=all.at(-1);
    if(zeroRows.length)warnings.push(zeroRows.length+' 笔零金额记录已单独保留，不计入收入或支出金额。');
    warnings.push('银行 PDF 没有每笔交易流水号；页眉的流水单号只标识整份文件。不同文件的重叠期间需要核对，不能仅凭同日同金额删除记录。');
    warnings.push('原始摘要和收支方向已保留；尚未区分个人消费、企业经营与账户互转，收支差额不是利润。');
    return {rows,errors,warnings,statement:{format:'bob-pdf-v1',sourceName:name,bank:'北京银行',accountMasked,account,start:firstMeta.start,end:firstMeta.end,pages:declaredPages,recordCount:all.length,income:income/100,outflow:outflow/100,openingBalance:firstRow?(cents(firstRow.balance)-cents(firstRow.signedAmount))/100:null,openingBalanceInferred:true,closingBalance:lastRow?.balance??null,balanceChecked:all.length>1&&errors.length===0,balanceCheckCount:Math.max(0,all.length-1),balanceErrors,hasTransactionIds:false,sourceOrder:'descending',zeroRows,zeroCount:zeroRows.length}};
  }
  function detect(result){return detectCmb(result)||detectBob(result);}
  function parse(result,name){return detectBob(result)?parseBob(result,name):parseCmb(result,name);}
  return Object.freeze({detect,parse});
});
