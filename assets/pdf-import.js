/* Conservative preparation of unknown bank PDFs. Source pages remain available
 * for review; this helper never guesses a bank, an account or missing values. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./data-engine.js'));
  else root.YoushuPdf=factory(root.YoushuData);
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
  'use strict';
  const text=v=>String(v==null?'':v).trim();
  const key=v=>text(v).replace(/^\uFEFF/,'').toLowerCase().replace(/[\s_\-()（）]/g,'');
  const blank=row=>Array.isArray(row)&&row.every(v=>!text(v));
  const signature=row=>JSON.stringify(row.map(key));
  const cents=v=>Math.round(v*100);
  function header(row){
    if(!Array.isArray(row))return null;
    const mapping=D.autoMapping(row,'cash');
    if(!Number.isInteger(mapping.date)||!['inflow','outflow','amount'].some(f=>Number.isInteger(mapping[f]))||Object.keys(mapping).length<2)return null;
    return {mapping,signature:signature(row),columns:row.length};
  }
  function footer(row){
    if(!Array.isArray(row))return null;
    const value=row.map(text).join('').replace(/\s/g,'');
    const match=/^第(\d+)页(?:共(\d+)页)?$/.exec(value)||/^(\d+)\/(\d+)$/.exec(value);
    return match?{page:Number(match[1]),total:match[2]===undefined?null:Number(match[2])}:null;
  }
  // Recheck the current editable matrix and selected mappings at confirmation.
  // Structural corrections never waive currency or transaction-direction checks.
  function validateMapping(matrix,mapping){
    const errors=[];
    if(!Array.isArray(matrix)||!Array.isArray(matrix[0]))return errors;
    const headers=matrix[0];mapping=mapping||D.autoMapping(headers,'cash');
    const mapped=field=>Number.isInteger(mapping[field])&&mapping[field]>=0&&mapping[field]<headers.length;
    if(!mapped('date'))return errors; // Required-column errors belong to normalize.
    const currencyColumns=[];
    headers.forEach((cell,index)=>{if(['币种','货币','currency'].includes(key(cell)))currencyColumns.push(index);});
    matrix.slice(1).forEach((row,index)=>{
      if(!Array.isArray(row))return;
      let dated=false;
      try{dated=!!D.parseDate(row[mapping.date]);}catch(error){dated=error.code==='AMBIGUOUS_DATE';}
      if(!dated)return; // Malformed rows remain for normalize to reject.
      const sourceRow=index+2;
      currencyColumns.forEach(column=>{
        const currency=key(row[column]);
        if(!currency)errors.push({row:sourceRow,field:'currency',code:'PDF_CURRENCY_MISSING',message:'原表有币种列，但这笔交易的币种为空。请对照原文件补明币种后再导入。'});
        else if(!['人民币','人民币元','cny','rmb','人民币cny','cny人民币','元','¥','￥','156'].includes(currency))errors.push({row:sourceRow,field:'currency',code:'PDF_CURRENCY',message:'币种不是可确认的人民币，不能直接计入人民币报告。'});
      });
      if(mapped('amount')&&!mapped('inflow')&&!mapped('outflow')){
        const direction=mapped('direction')?text(row[mapping.direction]):'';
        const amount=text(row[mapping.amount]).replace(/^(?:人民币|RMB|CNY|[¥￥])\s*/i,'');
        if(!direction&&amount&&!/^[+\-−＋－]|^\(.*\)$/.test(amount))errors.push({row:sourceRow,field:'direction',code:'PDF_UNSIGNED_AMOUNT',message:'金额没有明确正负号或已选用的收支方向，请为这笔交易指定收入/支出方向后核对。'});
      }
    });
    return errors;
  }
  function prepare(result){
    if(!result||result.format!=='pdf')return result;
    const originals=Array.isArray(result.sheets)?result.sheets:[];
    const pages=originals.filter(s=>s&&Number.isInteger(s.page)).slice().sort((a,b)=>a.page-b.page);
    const meta={complete:false,message:'',issues:[],removedHeaders:0,removedFooters:0,pages:Number.isInteger(result.pages)?result.pages:pages.length};
    const fail=(page,row,code,message)=>meta.issues.push({page,row,code,message});
    const output=Object.assign({},result,{sheets:originals.slice(),pdfPreparation:meta});
    if(!Number.isInteger(result.pages)||result.pages<1)fail(0,0,'PDF_PAGE_COUNT','无法确认 PDF 总页数，请核对完整文件后重试。');
    if(!pages.length)fail(0,0,'PDF_NO_PAGES','没有可逐页核对的 PDF 表格，请使用银行导出的 CSV / Excel。');
    const seen=new Set();
    for(const page of pages){
      if(page.page<1||page.page>meta.pages)fail(page.page,0,'PDF_PAGE_RANGE','PDF 页码超出文件总页数，请重新读取完整文件。');
      if(seen.has(page.page))fail(page.page,0,'PDF_DUPLICATE_PAGE','第 '+page.page+' 页重复，请重新读取文件，避免重复记账。');
      seen.add(page.page);
    }
    for(let n=1;n<=meta.pages;n++)if(!seen.has(n))fail(n,0,'PDF_MISSING_PAGE','缺少第 '+n+' 页，请重新读取完整文件。');
    let reference=null,mergedHeader=null,headerCount=0;
    const data=[],provenance=[null];
    for(const page of pages){
      if(!Array.isArray(page.rows)){fail(page.page,0,'PDF_INVALID_ROWS','第 '+page.page+' 页没有有效表格。');continue;}
      const candidates=[];
      page.rows.forEach((row,index)=>{const info=header(row);if(info)candidates.push({index,info});});
      const schemas=new Set(candidates.map(c=>c.info.signature));
      if(!candidates.length){fail(page.page,0,'PDF_HEADER_MISSING','第 '+page.page+' 页未找到包含日期和收支金额的表头，请手动选择或修正。');continue;}
      if(schemas.size!==1){fail(page.page,candidates[0].index+1,'PDF_HEADER_AMBIGUOUS','第 '+page.page+' 页存在不同的表头，无法安全合并，请分别核对或使用 CSV / Excel。');continue;}
      const first=candidates[0],sourceHeader=page.rows[first.index];
      if(page.page===1){
        meta.recommendedSheet=page.name;
        meta.recommendedSheetIndex=originals.indexOf(page);
        meta.recommendedHeader=first.index+1;
      }
      if(!reference){reference=first.info;mergedHeader=sourceHeader.slice();}
      if(reference.signature!==first.info.signature||reference.columns!==first.info.columns){
        fail(page.page,first.index+1,'PDF_HEADER_CHANGED','第 '+page.page+' 页的列名或列顺序与前页不同，请核对后手动整理。');continue;
      }
      // A date-bearing row before the table is not safely identifiable as a
      // preamble. Keep the entire PDF in manual review instead of losing it.
      for(let n=0;n<first.index;n++){
        const row=page.rows[n];
        if(Array.isArray(row)&&row.some(cell=>{try{return !!D.parseDate(cell);}catch(_){return false;}})){
          fail(page.page,n+1,'PDF_DATA_BEFORE_HEADER','第 '+page.page+' 页表头前发现日期数据，请核对是否遗漏了交易行。');
        }
      }
      validateMapping(page.rows.slice(first.index),first.info.mapping).forEach(issue=>fail(page.page,first.index+issue.row,issue.code,'第 '+page.page+' 页第 '+(first.index+issue.row)+' 行：'+issue.message));
      for(let n=first.index;n<page.rows.length;n++){
        const row=page.rows[n];
        if(blank(row))continue;
        if(Array.isArray(row)&&signature(row)===reference.signature){headerCount++;continue;}
        const foot=footer(row);
        if(foot){
          meta.removedFooters++;
          if(foot.page!==page.page||(foot.total!==null&&foot.total!==meta.pages))fail(page.page,n+1,'PDF_PRINTED_PAGE','第 '+page.page+' 页的原文件页码与读取页数不一致，请核对是否缺页。');
          continue;
        }
        data.push(Array.isArray(row)?row.slice():row);
        provenance.push({page:page.page,row:n+1});
      }
    }
    meta.removedHeaders=Math.max(0,headerCount-1);
    if(!data.length&&!meta.issues.length)fail(0,0,'PDF_NO_TRANSACTIONS','表头之后没有可用交易行，请核对原文件。');
    if(meta.issues.length){
      const affected=[...new Set(meta.issues.map(i=>i.page).filter(n=>n>0))].sort((a,b)=>a-b);
      meta.message=(affected.length?'第 '+affected.join('、')+' 页需要人工核对。':'PDF 需要人工核对。')+'请在原始页面中选择正确表头并检查全部交易，或使用银行导出的 CSV / Excel；不会自动跳过未识别的页面。';
      return output;
    }
    const ocr=Number(result.ocrPages)>0||pages.some(s=>s.source==='ocr'||s.source==='mixed');
    output.sheets.unshift({name:'自动整理的全部页面',rows:[mergedHeader,...data],provenance,pdfPrepared:true,source:ocr?'mixed':'text'});
    meta.complete=true;meta.recommendedSheet='自动整理的全部页面';meta.recommendedSheetIndex=0;meta.recommendedHeader=1;
    meta.message='已整理 '+pages.length+' 页的表头和页码。请逐页核对交易笔数、日期、收支方向、金额和余额后生成报告。'+(ocr?'本文件含扫描识别内容，文字和数字仍需对照原件确认。':'');
    return output;
  }
  function audit(input){
    const rows=Array.isArray(input)?input.slice():[];
    const result={rows,errors:[],warnings:[],balanceCheckCount:0,order:'unknown'};
    const error=(row,message)=>result.errors.push({row:row?.sourceRow||0,message});
    if(!rows.length){error(null,'没有可核对的交易数据。');return result;}
    for(const row of rows){
      let date='';try{date=D.parseDate(row?.date);}catch(_){}
      if(!date||date!==row.date)error(row,'交易日期无效，请核对原始流水。');
      if(!Number.isFinite(row?.inflow)||!Number.isFinite(row?.outflow)||row.inflow<0||row.outflow<0||row.inflow>0&&row.outflow>0||row.inflow===0&&row.outflow===0)error(row,'收支金额无效，请明确一笔收入或支出。');
      if(row?.balance!==null&&row?.balance!==undefined&&!Number.isFinite(row.balance))error(row,'余额无效，请填写数字或留空后人工核对。');
    }
    if(result.errors.length)return result;
    const ascending=rows.every((r,i)=>!i||rows[i-1].date<=r.date);
    const descending=rows.every((r,i)=>!i||rows[i-1].date>=r.date);
    if(!ascending&&!descending){error(rows.find((r,i)=>i&&rows[i-1].date>r.date),'交易日期既非顺序也非倒序，请按照原始流水顺序整理，不能直接按日期打乱同日交易。');return result;}
    const priorByAccount=new Map(),pairs=[];
    let missingBalance=false;
    for(const row of rows){
      if(!Number.isFinite(row.balance))missingBalance=true;
      const account=text(row.account),prior=priorByAccount.get(account);
      if(prior&&Number.isFinite(prior.balance)&&Number.isFinite(row.balance))pairs.push([prior,row]);
      priorByAccount.set(account,row);
    }
    const movement=row=>cents(row.inflow)-cents(row.outflow);
    const ascErrors=pairs.filter(([a,b])=>cents(b.balance)-cents(a.balance)!==movement(b));
    const descErrors=pairs.filter(([a,b])=>cents(a.balance)-cents(b.balance)!==movement(a));
    result.balanceCheckCount=pairs.length;
    const ascValid=ascending&&!ascErrors.length,descValid=descending&&!descErrors.length;
    if(ascValid){
      result.order='ascending';
      if(descValid&&rows.length>1&&ascending&&descending)result.warnings.push({message:'交易日期均相同，无法仅凭日期和余额确定先后；已保留原顺序，请核对同日交易顺序。'});
    }else if(descValid){result.order='descending';result.rows=rows.slice().reverse();}
    else{
      const failures=ascending?ascErrors:descErrors;
      for(const pair of failures)error(ascending?pair[1]:pair[0],'相邻交易余额与收支金额不连续，请核对缺漏、重复、方向及同日交易顺序。');
      return result;
    }
    if(missingBalance)result.warnings.push({message:'部分交易没有余额，无法完整核对余额连续性；请对照原始流水确认没有漏行或错列。'});
    if(!pairs.length)result.warnings.push({message:'没有足够的连续余额可供核对，请逐页对照原始流水确认交易完整。'});
    if(priorByAccount.size>1)result.warnings.push({message:'已按账户分别核对余额，请确认账户列确实区分了不同银行账户。'});
    return result;
  }
  return Object.freeze({prepare,validateMapping,audit});
});
