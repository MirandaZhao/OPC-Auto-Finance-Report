/* Local import ledger. Source batches are immutable; the visible report is
 * rebuilt from them so removing one file never removes another file's rows.
 * No network, storage or DOM access. All money comparisons use integer cents.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./data-engine.js'));
  else root.YoushuLedger=factory(root.YoushuData);
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
  'use strict';
  const KINDS=['cash','profit','ar','balance'],SOURCES=['wechat','alipay','generic'];
  const clone=v=>JSON.parse(JSON.stringify(v)),text=v=>String(v==null?'':v).trim(),cents=v=>Math.round(v*100);
  const base=()=>({schemaVersion:1,company:'',openingCash:null,asOf:'',cash:[],profit:[],ar:[],balance:[]});
  function fault(message,code='INVALID_LEDGER'){const e=new Error(message);e.code=code;throw e;}
  function canonical(value){
    if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
    if(value&&typeof value==='object')return '{'+Object.keys(value).filter(k=>value[k]!==undefined&&!['sourceRow','sourceImportId','sourceImportName','sourceImportIds','sourceImports','sourceAccount'].includes(k)).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
    return JSON.stringify(value);
  }
  function identity(batch){return canonical({kind:batch.kind,sourceType:batch.sourceType,accountScope:batch.accountScope,rows:batch.rows,neutralRows:batch.statement?.neutralRows||[],zeroRows:(batch.statement?.zeroRows||[]).concat(batch.bankStatement?.zeroRows||[])});}
  function hasStableIdentities(batch){
    if(['profit','balance'].includes(batch.kind))return true;
    const rows=records(batch);return rows.length>0&&rows.every(({row})=>{const id=text(batch.kind==='ar'?(row.invoiceId||row.invoiceNumber||row.id):row.id);return id!==''&&id!=='/';});
  }
  function sameSourceFile(a,b){return typeof a.fingerprint==='string'&&a.fingerprint.trim()!==''&&a.fingerprint===b.fingerprint;}
  function stripProvenance(row){const r={...row};['sourceImportId','sourceImportName','sourceImportIds','sourceImports','sourceAccount'].forEach(k=>delete r[k]);return r;}
  function normalizedBatch(batch,index){
    if(!batch||typeof batch!=='object'||Array.isArray(batch))fault('导入记录格式无效。');
    if(!KINDS.includes(batch.kind))fault('导入记录的数据类型无效。');
    if(!Array.isArray(batch.rows))fault('导入记录缺少来源数据。');
    const sourceType=batch.sourceType||'generic';if(!SOURCES.includes(sourceType))fault('导入记录的来源类型无效。');
    if(sourceType!=='generic'&&batch.kind!=='cash')fault('支付平台账单必须为现金流水。');
    const result={...clone(batch),id:text(batch.id)||'import-'+(index+1),name:text(batch.name)||'未命名账单',kind:batch.kind,sourceType,accountScope:text(batch.accountScope)||(sourceType==='wechat'?'微信支付':sourceType==='alipay'?'支付宝':''),importedAt:text(batch.importedAt)||new Date().toISOString()};result.rows=result.rows.map(stripProvenance);
    if(result.id.length>200||result.name.length>1000||result.accountScope.length>200)fault('导入记录的名称或账户名称过长。');
    const validation=D.validateProject({...base(),[result.kind]:result.rows});
    if(!validation.valid)fault('“'+result.name+'”的来源数据无效：'+validation.errors.slice(0,3).map(x=>x.message).join('；'));
    if(sourceType!=='generic'&&!result.statement)fault('支付平台账单缺少原始汇总信息。');
    if(sourceType!=='generic')for(const r of result.rows){
      if(!['收入','支出'].includes(r.direction)||typeof r.amount!=='number'||D.parseMoney(r.amount,{nonNegative:true})!==r.amount||r.amount===0)fault('支付平台流水的原始金额或收支分类无效。');
      if(cents(r.inflow)!==(r.direction==='收入'?cents(r.amount):0)||cents(r.outflow)!==(r.direction==='支出'?cents(r.amount):0))fault('支付平台流水的收支金额与原始记录不一致。');
    }
    if(result.statement){
      if(result.kind!=='cash')fault('账单信息只能附属于现金流水。');
      if(sourceType==='generic')fault('普通流水不能包含支付平台的原始汇总信息。');
      const s=result.statement,expected=sourceType==='wechat'?'wechat-v1':sourceType==='alipay'?'alipay-v1':null;
      if(typeof s!=='object'||Array.isArray(s))fault('账单原始汇总信息格式无效。');
      if(expected&&s.format!==expected)fault('账单来源与原始汇总信息不一致。');
      if(!Array.isArray(s.neutralRows)||s.zeroRows!==undefined&&!Array.isArray(s.zeroRows))fault('账单的中性或零金额记录无效。');
      s.neutralRows=s.neutralRows.map(stripProvenance);s.zeroRows=(s.zeroRows||[]).map(stripProvenance);
      for(const [section,rows] of [['neutral',s.neutralRows],['zero',s.zeroRows]])for(const r of rows){
        if(!r||typeof r!=='object'||Array.isArray(r))fault('账单包含无效的来源记录。');
        if(typeof r.date!=='string'||D.parseDate(r.date)!==r.date)fault('账单来源记录的日期无效。');
        if(typeof r.amount!=='number'||D.parseMoney(r.amount,{nonNegative:true})!==r.amount)fault('账单来源记录的金额无效。');
        if(typeof r.id!=='string'||typeof r.account!=='string')fault('账单来源记录的单号或账户无效。');
        if(section==='neutral'&&!['/','不计收支'].includes(r.direction))fault('中性记录的收支分类无效。');
        if(section==='zero'&&(r.amount!==0||!['收入','支出'].includes(r.direction)))fault('零金额记录的收支分类无效。');
      }
      validateStatement(result);
    }
    if(Object.prototype.hasOwnProperty.call(result,'bankStatement')){
      // Earlier CMB backups allowed display-name overrides only on source rows.
      // Preserve them and align the account used by report filters.
      if(result.bankStatement?.format==='cmb-pdf-v1'&&typeof result.bankStatement.account==='string'&&result.rows.length)result.bankStatement.account=result.rows[0].account;
      validateBankStatement(result);
      if(result.bankStatement.zeroRows)result.bankStatement.zeroRows=result.bankStatement.zeroRows.map(stripProvenance);
    }
    return result;
  }
  function records(batch){return batch.rows.map(row=>({row,section:batch.kind})).concat((batch.statement?.neutralRows||[]).map(row=>({row,section:'neutral'})),(batch.statement?.zeroRows||[]).concat(batch.bankStatement?.zeroRows||[]).map(row=>({row,section:'zero'})));}
  function recordKey(batch,row,section,index){
    if(batch.kind==='profit')return 'profit:'+row.month;
    if(batch.kind==='balance')return 'balance:'+row.date;
    const id=text(batch.kind==='ar'?(row.invoiceId||row.invoiceNumber||row.id):row.id);
    if(id&&id!=='/')return JSON.stringify([batch.kind,batch.sourceType,batch.accountScope,batch.kind==='ar'?row.customer:row.account,id]);
    // Equal date / amount / merchant is not a transaction identifier.
    return JSON.stringify(['unidentified',batch.id,section,index]);
  }
  function financialIdentity(record){
    const r=record.row;return canonical({section:record.section,date:r.date,direction:r.direction||((r.inflow||0)>0?'收入':(r.outflow||0)>0?'支出':''),inflow:r.inflow==null?null:cents(r.inflow),outflow:r.outflow==null?null:cents(r.outflow),amount:r.amount==null?null:cents(r.amount)});
  }
  function materialize(batch,record,previous){
    const row={...record.row},refs=previous?previous.row.sourceImports.slice():[];
    if(!refs.some(r=>r.id===batch.id))refs.push({id:batch.id,name:batch.name,sourceRow:row.sourceRow});
    row.sourceImportId=batch.id;row.sourceImportName=batch.name;row.sourceImportIds=refs.map(r=>r.id);row.sourceImports=refs;row.sourceType=batch.sourceType;
    if(batch.kind==='cash'&&batch.sourceType!=='generic'&&batch.accountScope){row.sourceAccount=row.account;row.account=batch.accountScope;}
    return {...record,row};
  }
  function summaryOf(rows,neutral,zero){
    const s={count:0,incomeCount:0,income:0,expenseCount:0,expense:0,neutralCount:0,neutral:0,refundCount:0,refund:0,neutralRefundCount:0,neutralRefund:0,zeroCount:zero.length};
    const add=(key,v)=>{s[key]+=cents(v||0);if(!Number.isSafeInteger(s[key]))fault('账单金额总规模过大，无法保证分级精度。');};
    const neutralSet=new Set(neutral);
    for(const r of rows.concat(neutral,zero)){
      s.count++;const n=['/','不计收支'].includes(r.direction)||neutralSet.has(r),amount=r.amount??((r.inflow||0)+(r.outflow||0)),key=n?'neutral':r.direction==='收入'||r.inflow>0?'income':'expense';
      s[key+'Count']++;add(key,amount);
      if(r.isRefund){s.refundCount++;add('refund',amount);if(n){s.neutralRefundCount++;add('neutralRefund',amount);}}
    }
    ['income','expense','neutral','refund','neutralRefund'].forEach(k=>s[k]/=100);return s;
  }
  function validateStatement(batch){
    const s=batch.statement,object=v=>v&&typeof v==='object'&&!Array.isArray(v);
    if(!object(s.summary)||!object(s.declared))fault('账单备份缺少有效的原始明细汇总或文件汇总。');
    if(typeof s.reconciled!=='boolean')fault('账单备份的核对状态无效。');
    if(typeof s.start!=='string'||typeof s.end!=='string'||D.parseDate(s.start)!==s.start||D.parseDate(s.end)!==s.end||s.start>s.end)fault('账单备份的期间无效。');
    if(records(batch).some(({row})=>row.date<s.start||row.date>s.end))fault('账单来源明细超出了原始账单期间。');
    const computed=summaryOf(batch.rows,s.neutralRows,s.zeroRows),required=['count','incomeCount','income','expenseCount','expense','neutralCount','neutral','refundCount','refund'];
    function checkNumber(key,value){
      if(typeof value!=='number'||!Number.isFinite(value)||value<0)fault('账单汇总中的笔数或金额无效。');
      if(key==='count'||key.endsWith('Count')){if(!Number.isSafeInteger(value))fault('账单汇总笔数必须为非负整数。');}
      else D.parseMoney(value,{nonNegative:true});
    }
    required.forEach(key=>{if(!Object.prototype.hasOwnProperty.call(s.summary,key))fault('账单备份的明细汇总缺少必要字段。');});
    for(const key of Object.keys(computed))if(Object.prototype.hasOwnProperty.call(s.summary,key)){
      checkNumber(key,s.summary[key]);if(cents(s.summary[key])!==cents(computed[key]))fault('账单备份的明细汇总与来源记录不一致。');
    }
    const declaredKeys=['count','incomeCount','income','expenseCount','expense','neutralCount','neutral'];
    for(const key of declaredKeys)if(Object.prototype.hasOwnProperty.call(s.declared,key))checkNumber(key,s.declared[key]);
    if(s.reconciled){
      if(declaredKeys.some(key=>!Object.prototype.hasOwnProperty.call(s.declared,key)))fault('已核对账单缺少完整的原文件汇总，无法确认备份有效。');
      for(const key of declaredKeys){
        const expected=key==='expense'&&batch.sourceType==='alipay'&&s.reconciliationBasis==='expense-less-neutral-refunds'?cents(computed.expense)-cents(computed.neutralRefund):cents(computed[key]);
        if(cents(s.declared[key])!==expected)fault('账单备份的原文件汇总与核对状态不一致。');
      }
    }
  }
  function validateBankStatement(batch){
    const s=batch.bankStatement;
    const fail=message=>fault('银行账单备份无效：'+message,'INVALID_BANK_STATEMENT');
    if(batch.kind!=='cash'||batch.sourceType!=='generic'||!s||typeof s!=='object'||Array.isArray(s))fail('来源记录类型不正确。');
    const descending=s.format==='bob-pdf-v1';
    if(!(s.format==='cmb-pdf-v1'&&s.bank==='招商银行'||descending&&s.bank==='北京银行'))fail('银行或账单格式不受支持。');
    if(descending?s.sourceOrder!=='descending':s.sourceOrder!==undefined&&s.sourceOrder!=='ascending')fail('原账单排列顺序与银行格式不一致。');
    if(s.zeroRows!==undefined&&!Array.isArray(s.zeroRows))fail('零金额记录格式无效。');
    const zero=s.zeroRows||[];
    if((!descending&&zero.length)||descending&&s.zeroCount!==zero.length||s.zeroCount!==undefined&&s.zeroCount!==zero.length)fail('零金额记录笔数不一致。');
    const n=batch.rows.length+zero.length;
    if(!n||s.recordCount!==n)fail('记录笔数与来源明细不一致。');
    if(typeof s.sourceName!=='string'||!s.sourceName.trim()||typeof s.account!=='string'||typeof s.accountMasked!=='string')fail('文件或账户信息缺失。');
    if(typeof s.start!=='string'||typeof s.end!=='string'||D.parseDate(s.start)!==s.start||D.parseDate(s.end)!==s.end||s.start>s.end)fail('账单期间无效。');
    if(!Number.isSafeInteger(s.pages)||s.pages<1||s.pages>n)fail('PDF 页数无效或缺少部分页的交易记录。');
    if(s.openingBalanceInferred!==true||s.hasTransactionIds!==false)fail('期初余额或流水号的来源说明不正确。');
    if(s.balanceChecked!==(n>1)||s.balanceCheckCount!==n-1||!Array.isArray(s.balanceErrors)||s.balanceErrors.length)fail('逐笔余额核对状态不正确，或仍有未解决的核对错误。');
    const money=(v,nonNegative=false)=>{
      if(typeof v!=='number')fail('汇总或余额必须为数值。');
      try{return cents(D.parseMoney(v,{nonNegative}));}catch(_){fail('汇总或余额的金额格式无效。');}
    };
    // Zero entries never enter cash, but must satisfy the same date, account,
    // provenance, currency and balance checks as every nonzero transaction.
    const sourceCompare=(a,b)=>(a.sourcePage-b.sourcePage||a.sourceRow-b.sourceRow)*(descending?-1:1);
    for(const part of [batch.rows,zero])for(let i=0;i<part.length;i++){
      const r=part[i];
      if(!r||typeof r!=='object'||Array.isArray(r))fail('包含无效的来源记录。');
      if(!Number.isSafeInteger(r.sourcePage)||r.sourcePage<1||r.sourcePage>s.pages||!Number.isSafeInteger(r.sourceRow)||r.sourceRow<1)fail('来源页码或行号无效。');
      if(i&&sourceCompare(part[i-1],r)>=0)fail('来源页码或交易行重复，或未按时间顺序排列。');
    }
    const rows=batch.rows.concat(zero).sort(sourceCompare),zeroSet=new Set(zero);
    const declaredIncome=money(s.income,true),declaredOutflow=money(s.outflow,true),declaredOpening=money(s.openingBalance),declaredClosing=money(s.closingBalance);
    let income=0,outflow=0,previous=null;const pages=new Set(),account=rows[0].account;
    if(typeof account!=='string'||!text(account))fail('缺少归入账户，请先核对账户名称。');
    for(const r of rows){
      if(r.id!==''||r.bankFormat!==s.format||r.currency!=='CNY')fail('来源行的单号、银行格式或币种与原文件说明不一致。');
      if(r.account!==account||s.account!==account)fail('账户信息与来源明细不一致，或同一文件包含多个不同账户。');
      if(typeof r.date!=='string'||D.parseDate(r.date)!==r.date||r.date<s.start||r.date>s.end||previous&&r.date<previous.date)fail('明细日期超出账单期间，或顺序不正确。');
      if(typeof r.counterparty!=='string'||typeof r.category!=='string'||!text(r.category)||!['operating','investing','financing','transfer'].includes(r.activity))fail('来源记录的交易对方、摘要或活动类型无效。');
      if(!Array.isArray(r.sourceRows)||!r.sourceRows.length||!r.sourceRows.includes(r.sourceRow)||r.sourceRows.some((line,i)=>!Number.isSafeInteger(line)||line<1||i>0&&line<=r.sourceRows[i-1]))fail('来源行位置缺失或无效。');
      if(previous&&sourceCompare(previous,r)>=0)fail('来源页码或交易行重复，或未按时间顺序排列。');
      const received=money(r.inflow,true),paid=money(r.outflow,true),balance=money(r.balance),signed=received-paid;
      if(zeroSet.has(r)){
        if(received!==0||paid!==0||r.zeroAmount!==true||!['收入','支出'].includes(r.direction))fail('零金额信息记录不能包含收支金额。');
      }else if(received===0&&paid===0||received>0&&paid>0||r.zeroAmount===true||r.direction!==(signed>0?'收入':'支出'))fail('原始金额与收支方向不一致。');
      if(money(r.signedAmount)!==signed||money(r.amount,true)!==Math.abs(signed))fail('原始金额与收支方向不一致。');
      if(previous&&cents(previous.balance)+signed!==balance)fail('相邻交易余额无法衔接，不能认定已经核对。');
      income+=received;outflow+=paid;if(!Number.isSafeInteger(income)||!Number.isSafeInteger(outflow))fail('金额总规模过大，无法保证分级精度。');
      pages.add(r.sourcePage);previous=r;
    }
    // Each PDF page needs an auditable record, including a zero-value entry.
    if(pages.size!==s.pages)fail('来源记录缺少部分 PDF 页面。');
    const opening=cents(rows[0].balance)-cents(rows[0].inflow)+cents(rows[0].outflow),closing=cents(rows[n-1].balance);
    if(income!==declaredIncome||outflow!==declaredOutflow||opening!==declaredOpening||closing!==declaredClosing)fail('收支汇总、推算期初或期末余额与来源明细不一致。');
  }
  function projectFromImports(input,imports){
    const project={...clone(input),cash:[],profit:[],ar:[],balance:[],ledger:{version:1,imports}};
    delete project.wechatStatement;delete project.alipayStatement;delete project.ledgerStatement;
    const seen=new Map(),statsById=new Map();
    for(const batch of imports){
      const stats={added:0,duplicates:0,updated:0,total:0};statsById.set(batch.id,stats);
      records(batch).forEach((record,index)=>{
        const key=recordKey(batch,record.row,record.section,index),previous=seen.get(key);stats.total++;
        if(previous){
          if(previous.batchId===batch.id)fault('“'+batch.name+'”中同一流水号出现多次，请核对后重新导入。','DUPLICATE_SOURCE_ID');
          if(batch.kind==='cash'&&financialIdentity(previous)!==financialIdentity(record)){
            const e=new Error('“'+batch.name+'”与已导入账单中有相同流水号，但日期、方向或金额不一致。请核对后重新导入，本次没有加入账本。');e.code='TRANSACTION_CONFLICT';e.transactionId=record.row.id;e.sourceNames=[previous.row.sourceImportName,batch.name];throw e;
          }
          if(canonical(stripProvenance(previous.originalRow))===canonical(stripProvenance(record.row)))stats.duplicates++;else stats.updated++;
        }else stats.added++;
        seen.set(key,{...materialize(batch,record,previous),originalRow:record.row,batchId:batch.id});
      });
    }
    const neutral=[],zero=[];
    for(const record of seen.values())if(record.section==='neutral')neutral.push(record.row);else if(record.section==='zero')zero.push(record.row);else project[record.section].push(record.row);
    const cashImports=imports.filter(b=>b.kind==='cash'),statements=cashImports.filter(b=>b.statement),bankStatements=cashImports.filter(b=>b.bankStatement).map(b=>({importId:b.id,name:b.name,statement:clone(b.bankStatement)}));
    if(statements.length||bankStatements.length){
      const sourceStatements=statements.map(b=>({importId:b.id,name:b.name,accountScope:b.accountScope,sourceType:b.sourceType,statement:clone(b.statement)}));
      if(cashImports.length===1&&statements.length===1){
        const b=statements[0],s={...clone(b.statement),summary:summaryOf(project.cash,neutral,zero),neutralRows:neutral,zeroRows:zero};
        project[b.sourceType==='alipay'?'alipayStatement':'wechatStatement']=s;
      }else{
        const dates=project.cash.concat(neutral,zero).map(r=>r.date).sort(),start=cashImports.map(b=>b.statement?.start||b.bankStatement?.start).filter(Boolean).sort()[0]||dates[0],end=cashImports.map(b=>b.statement?.end||b.bankStatement?.end).filter(Boolean).sort().pop()||dates[dates.length-1];
        project.ledgerStatement={format:'combined-v1',sourceName:cashImports.map(b=>b.name).join('、'),start:dates[0]&&dates[0]<start?dates[0]:start,end:dates[dates.length-1]&&dates[dates.length-1]>end?dates[dates.length-1]:end,summary:summaryOf(project.cash,neutral,zero),neutralRows:neutral,zeroRows:zero,sourceStatements,bankStatements,reconciled:false,sourceReconciled:!bankStatements.length&&statements.every(b=>b.statement.reconciled),reconciliationBasis:'deduplicated-imports'};
      }
    }
    const v=D.validateProject(project);if(!v.valid)fault(v.errors.slice(0,5).map(e=>e.message).join('；'));
    return {project,statsById};
  }
  function legacyImports(project){
    const imports=[];for(const kind of KINDS){
      const statement=kind==='cash'?(project.alipayStatement?.format==='alipay-v1'?project.alipayStatement:project.wechatStatement?.format==='wechat-v1'?project.wechatStatement:null):null;
      if(!project[kind].length&&!statement?.neutralRows?.length&&!statement?.zeroRows?.length)continue;
      imports.push(normalizedBatch({id:'legacy-'+kind,name:statement?.sourceName||'原有'+({cash:'现金流水',profit:'账务利润',ar:'应收明细',balance:'资产负债'}[kind]),kind,sourceType:statement?(statement.format==='alipay-v1'?'alipay':'wechat'):'generic',rows:project[kind],...(statement?{statement}:{})},imports.length));
    }return imports;
  }
  function rebuild(project){
    if(!project||typeof project!=='object'||Array.isArray(project))fault('账本格式无效。');
    if(!project.ledger){const v=D.validateProject(project);if(!v.valid)fault(v.errors.slice(0,5).map(e=>e.message).join('；'));return projectFromImports(project,legacyImports(project)).project;}
    if(project.ledger.version!==1||!Array.isArray(project.ledger.imports))fault('账本导入记录版本不支持。');
    if(project.ledger.imports.length>1000)fault('导入文件数量超过 1,000 份，请分开管理账本。');
    const imports=project.ledger.imports.map(normalizedBatch),ids=new Set();let count=0;
    imports.forEach(b=>{if(ids.has(b.id))fault('账本中有重复的导入记录编号。');ids.add(b.id);count+=records(b).length;});
    if(count>250000)fault('来源记录超过 250,000 条，请分开管理账本。');
    return projectFromImports(project,imports).project;
  }
  function migrate(project){return rebuild(project===undefined?base():project);}
  function add(input,batch){
    const project=migrate(input),imports=project.ledger.imports,next=normalizedBatch(batch,imports.length);
    const signature=identity(next),stable=hasStableIdentities(next),duplicate=imports.find(b=>(stable||sameSourceFile(b,next))&&identity(b)===signature);
    if(duplicate)return {project,duplicate:true,existingImportId:duplicate.id,stats:{added:0,duplicates:records(next).length,updated:0,total:records(next).length}};
    if(imports.some(b=>b.id===next.id)){
      if(batch.id)fault('这次导入的编号已存在，请重试。');
      let i=imports.length+1;while(imports.some(b=>b.id==='import-'+i))i++;next.id='import-'+i;
    }
    const merged=projectFromImports(project,[...imports,next]);
    // Match the same size limits used when a backup is reopened.
    if(merged.project.ledger.imports.length>1000||merged.project.ledger.imports.reduce((n,b)=>n+records(b).length,0)>250000)fault('账本来源记录过多，请分开管理账本。');
    return {project:merged.project,duplicate:false,stats:merged.statsById.get(next.id)};
  }
  function remove(input,batchId){const project=migrate(input);if(!project.ledger.imports.some(b=>b.id===batchId))fault('找不到这次导入，账本没有改变。');return projectFromImports(project,project.ledger.imports.filter(b=>b.id!==batchId)).project;}
  function validate(project){try{rebuild(project);return {valid:true,errors:[]};}catch(e){return {valid:false,errors:[{message:e.message,code:e.code||'INVALID_LEDGER'}]};}}
  return Object.freeze({migrate,rebuild,add,remove,validate});
});
