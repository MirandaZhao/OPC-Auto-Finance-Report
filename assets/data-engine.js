/* Youshu local data engine. No network, storage, HTML insertion, or external dependencies. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.YoushuData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var MAX_ROWS = 50000, MAX_TEXT = 20 * 1024 * 1024, MAX_MONEY = 1000000000000;
  var BALANCE_FIELDS = ['cash','receivables','inventory','fixedAssets','otherAssets','payables','taxPayable','debt','otherLiabilities','capital','retainedEarnings'];
  var ALIASES = {
    cash: {
      id:['交易编号','流水号','流水编号','交易流水号','交易序号','交易ID','id','transactionid'],
      date:['日期','交易日期','记账日期','记帐日期','入账日期','交易时间','发生日期','date','transactiondate'],
      account:['账户','账号','账户名称','本方账号','银行账户','account'],
      counterparty:['交易对方','对手信息','对方户名','对方名称','客户供应商','客户/供应商','客户','交易对象','counterparty','payee'],
      category:['分类','收支分类','业务分类','费用类型','业务摘要','交易摘要','摘要','category'],
      inflow:['收入','收入金额','贷方发生额','贷方金额','收款','收款金额','存入金额','收入（元）','inflow','credit','moneyin'],
      outflow:['支出','支出金额','借方发生额','借方金额','付款','付款金额','支取金额','支出（元）','outflow','debit','moneyout'],
      amount:['金额','交易金额','发生额','收支金额','amount'],
      direction:['收支方向','收支类型','借贷标志','借贷方向','方向','direction'],
      balance:['余额','账户余额','交易后余额','联机余额','当前余额','balance'],
      activity:['活动类型','现金流类型','业务活动','现金活动','activity']
    },
    profit: {
      month:['月份','期间','会计期间','年月','month','period'],
      revenue:['营业收入','账务收入','收入','revenue'],
      cost:['营业成本','成本','cost'],
      expenses:['期间费用','费用','管理销售财务费用','expenses'],
      tax:['税费','所得税费用','税费合计','tax']
    },
    ar: {
      customer:['客户','客户名称','交易对方','customer'],
      invoiceDate:['开票日期','确认日期','应收日期','invoiceDate'],
      dueDate:['到期日','到期日期','约定付款日','dueDate'],
      amount:['应收金额','合同应收','含税应收金额','金额','amount'],
      received:['已收金额','累计已收','已回款','received']
    },
    balance: {
      date:['日期','报表日期','资产负债表日期','date'],
      cash:['货币资金','现金','cash'],receivables:['应收账款','应收款','receivables'],
      inventory:['存货','inventory'],fixedAssets:['固定资产净额','固定资产净值','固定资产','fixedAssets'],
      otherAssets:['其他资产','otherAssets'],payables:['应付账款','应付款','payables'],
      taxPayable:['应交税费','应付税费','taxPayable'],debt:['借款','债务','debt'],
      otherLiabilities:['其他负债','otherLiabilities'],capital:['实收资本','投入资本','资本','capital'],
      retainedEarnings:['留存收益','未分配利润','retainedEarnings']
    }
  };
  function round(n) { return Math.round((n + Math.sign(n || 0) * Number.EPSILON) * 100) / 100; }
  function blank(v) { return v === null || v === undefined || String(v).trim() === ''; }
  function text(v) { return blank(v) ? '' : String(v).trim(); }
  function fault(message, code) { var e = new Error(message); e.code = code || 'INVALID_VALUE'; throw e; }
  function key(v) { return text(v).replace(/^\uFEFF/, '').toLowerCase().replace(/[\s_\-()（）]/g, ''); }
  function parseMoney(value, options) {
    options = options || {};
    var scale=options.scale===undefined?1:options.scale;
    if(scale!==1&&scale!==10000)fault('金额单位只支持元或万元。','INVALID_SCALE');
    if (blank(value)) { if (options.optional) return options.defaultValue === undefined ? null : options.defaultValue; fault('金额不能为空，请填入数字或明确填写 0。','MISSING_AMOUNT'); }
    var n;
    if (typeof value === 'number') n = value;
    else {
      var s = text(value).replace(/^(?:人民币|RMB|CNY|[¥￥])\s*/i, '').replace(/\s*(?:元|RMB|CNY)$/i, '');
      var negative = /^\(.*\)$/.test(s);
      if (negative) s = s.slice(1, -1);
      if (!/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(s) || (negative && /^[+-]/.test(s))) fault('金额格式无法确认，请使用 1234.56；不要填写公式、单位缩写或混用小数分隔符。','INVALID_AMOUNT');
      var fraction=(s.split('.')[1]||'').replace(/0+$/,'');
      if(fraction.length>(scale===10000?6:2))fault('金额换算为元后不能小于一分钱；请核对金额单位和小数位。','INVALID_AMOUNT');
      n = Number(s.replace(/,/g, '')) * (negative ? -1 : 1);
    }
    n=n*scale;
    var cents=n*100, nearestCent=Math.round(cents), precisionTolerance=Number.EPSILON*Math.max(1,Math.abs(cents))*2;
    if (!Number.isFinite(n) || Math.abs(n) > MAX_MONEY || (nearestCent===0&&n!==0) || Math.abs(cents-nearestCent)>precisionTolerance) fault('金额换算为元后必须是有限数字，最多两位有效小数，且绝对值不超过 1 万亿元。','INVALID_AMOUNT');
    if (options.nonNegative && n < 0) fault('此列金额不可为负；退款请按实际收支方向填写。','NEGATIVE_AMOUNT');
    return round(n);
  }
  function dateString(y, m, d) {
    if (y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1 || d > 31) fault('日期超出范围或格式错误。','INVALID_DATE');
    var dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) fault('日期不存在，请检查月份和天数。','INVALID_DATE');
    return y + '-' + String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0');
  }
  function parseDate(value, options) {
    options = options || {};
    if (blank(value)) { if (options.optional) return null; fault('日期不能为空。','MISSING_DATE'); }
    if (value instanceof Date) { if (!Number.isFinite(value.getTime())) fault('日期无效。','INVALID_DATE'); return dateString(value.getUTCFullYear(),value.getUTCMonth()+1,value.getUTCDate()); }
    if (typeof value === 'number') {
      if (!Number.isFinite(value) || value < 1 || value > 109574) fault('Excel 日期序号超出支持范围。','INVALID_DATE');
      var serial = Math.floor(value);
      if (serial === 60) fault('Excel 的 1900-02-29 不是真实日期。','INVALID_DATE');
      var dt = new Date(Date.UTC(1899,11,31) + (serial > 60 ? serial-1 : serial)*86400000);
      return dateString(dt.getUTCFullYear(),dt.getUTCMonth()+1,dt.getUTCDate());
    }
    var s=text(value), match;
    if ((match = /^(\d{4})(\d{2})(\d{2})$/.exec(s))) return dateString(+match[1],+match[2],+match[3]);
    if ((match = /^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?(?:(?:T|\s)(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.exec(s))) {
      if ((match[4] && +match[4]>23) || (match[5] && +match[5]>59) || (match[6] && +match[6]>59)) fault('交易时间无效。','INVALID_DATE');
      return dateString(+match[1],+match[2],+match[3]);
    }
    if ((match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(s))) {
      if (options.dateOrder !== 'DMY' && options.dateOrder !== 'MDY') fault('日期顺序不明确，请转换为 YYYY-MM-DD。','AMBIGUOUS_DATE');
      return dateString(+match[3],+(options.dateOrder==='DMY'?match[2]:match[1]),+(options.dateOrder==='DMY'?match[1]:match[2]));
    }
    fault('日期格式无法识别，请使用 YYYY-MM-DD。','INVALID_DATE');
  }
  function parseMonth(value, options) {
    var m=/^(\d{4})[-/年](\d{1,2})月?$/.exec(text(value));
    if(m) return dateString(+m[1],+m[2],1).slice(0,7);
    return parseDate(value,options).slice(0,7);
  }
  function monthEnd(value) {
    var month=parseMonth(value),y=+month.slice(0,4),m=+month.slice(5);
    var last=new Date(Date.UTC(y,m,0)).getUTCDate();
    return dateString(y,m,last);
  }
  function parseCSV(source, delimiter) {
    if (typeof source !== 'string') fault('CSV 内容必须是文本。','INVALID_CSV');
    if (source.length > MAX_TEXT) fault('文件过大，最多支持 20 MB 文本。','LIMIT_EXCEEDED');
    var input=source.replace(/^\uFEFF/, '');
    var sep=/^sep=([,;\t|])\r?\n/i.exec(input);
    if(sep) { delimiter=delimiter||sep[1]; input=input.slice(sep[0].length); }
    if(!delimiter) {
      var counts={',':0,';':0,'\t':0}, quote=false;
      for(var p=0;p<input.length;p++) { var ch=input[p]; if(ch==='"') { if(quote&&input[p+1]==='"')p++;else quote=!quote; } else if(!quote) { if(ch==='\n'||ch==='\r')break; if(Object.prototype.hasOwnProperty.call(counts,ch))counts[ch]++; } }
      delimiter=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];})[0];
    }
    if(typeof delimiter !== 'string' || delimiter.length !== 1 || delimiter==='"'||delimiter==='\r'||delimiter==='\n') fault('分隔符无效。','INVALID_DELIMITER');
    var rows=[], row=[], field='', quoted=false, closed=false;
    function pushRow() { row.push(field); rows.push(row); row=[];field='';closed=false;if(rows.length>MAX_ROWS+1)fault('最多支持 50,000 条数据，请拆分文件。','LIMIT_EXCEEDED'); }
    for(var i=0;i<input.length;i++) {
      var c=input[i];
      if(quoted) { if(c==='"') { if(input[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;} } else field+=c; continue; }
      if(c==='"') { if(field!=='')fault('引号必须位于字段开头。','INVALID_CSV');quoted=true;continue; }
      if(c===delimiter) { row.push(field);field='';closed=false;continue; }
      if(c==='\n'||c==='\r') {if(c==='\r'&&input[i+1]==='\n')i++;pushRow();continue;}
      if(closed) { if(c===' '||c==='\t')continue;fault('引号结束后只能是分隔符或换行。','INVALID_CSV'); }
      field+=c;
    }
    if(quoted)fault('CSV 存在未闭合的引号。','INVALID_CSV');
    if(field!==''||row.length||closed)pushRow();
    return rows;
  }
  function autoMapping(headers, kind) {
    if(!ALIASES[kind])fault('不支持的数据类型。','INVALID_KIND');
    var mapping={};
    Object.keys(ALIASES[kind]).forEach(function(field){var names=ALIASES[kind][field].concat(field).map(key);var matches=[];headers.forEach(function(h,i){if(names.indexOf(key(h))>=0)matches.push(i);});if(matches.length===1)mapping[field]=matches[0];});
    return mapping;
  }
  function normalize(matrix,kind,mapping,options) {
    options=options||{};
    var result={rows:[],errors:[],warnings:[]};
    function issue(list,row,field,code,message){result[list].push({row:row,field:field,code:code,message:message});}
    if(!ALIASES[kind]){issue('errors',0,'','INVALID_KIND','不支持的数据类型。');return result;}
    if(options.moneyScale!==undefined&&options.moneyScale!==1&&options.moneyScale!==10000){issue('errors',0,'','INVALID_SCALE','金额单位只支持元或万元。');return result;}
    if(!Array.isArray(matrix)||!matrix.length||!Array.isArray(matrix[0])){issue('errors',0,'','EMPTY_DATA','文件没有表头或有效数据。');return result;}
    if(matrix.length>MAX_ROWS+1){issue('errors',0,'','LIMIT_EXCEEDED','最多支持 50,000 条数据。');return result;}
    mapping=mapping||autoMapping(matrix[0],kind);
    var required=kind==='cash'?['date']:kind==='profit'?['month','revenue','cost','expenses','tax']:kind==='ar'?['customer','dueDate','amount','received']:['date'].concat(BALANCE_FIELDS);
    required.forEach(function(f){if(!Number.isInteger(mapping[f])||mapping[f]<0||mapping[f]>=matrix[0].length)issue('errors',1,f,'MISSING_COLUMN','请选择“'+f+'”对应的列。');});
    Object.keys(mapping).forEach(function(f){if(mapping[f]!==null&&mapping[f]!==undefined&&mapping[f]!==''&&(!Number.isInteger(mapping[f])||mapping[f]<0||mapping[f]>=matrix[0].length))issue('errors',1,f,'INVALID_MAPPING','列映射无效。');});
    var usedColumns=new Map();
    Object.keys(mapping).forEach(function(f){
      if(!Object.prototype.hasOwnProperty.call(ALIASES[kind],f)||!Number.isInteger(mapping[f])||mapping[f]<0)return;
      if(usedColumns.has(mapping[f]))issue('errors',1,f,'REUSED_COLUMN','同一列不能同时对应 '+usedColumns.get(mapping[f])+' 和 '+f+'，请核对列映射。');
      else usedColumns.set(mapping[f],f);
    });
    if(kind==='cash'&&!Number.isInteger(mapping.inflow)&&!Number.isInteger(mapping.outflow)&&!Number.isInteger(mapping.amount))issue('errors',1,'amount','MISSING_COLUMN','至少指定收入/支出列，或金额列。');
    if(result.errors.length)return result;
    var seen=new Map(), periods=new Map(), missingActivityRows=0;
    matrix.slice(1).forEach(function(raw,index){
      var sourceRow=index+2;if(!Array.isArray(raw)){issue('errors',sourceRow,'','INVALID_ROW','此行不是有效数据行。');return;}
      if(raw.every(blank))return;
      if(raw.length>matrix[0].length&&raw.slice(matrix[0].length).some(function(v){return!blank(v);})){issue('errors',sourceRow,'','COLUMN_COUNT','此行列数多于表头，请检查分隔符和引号。');return;}
      var row={sourceRow:sourceRow},invalid=false;
      function value(f){return Number.isInteger(mapping[f])?raw[mapping[f]]:undefined;}
      function set(f,fn){try{row[f]=fn(value(f));}catch(e){invalid=true;issue('errors',sourceRow,f,e.code||'INVALID_VALUE',e.message);}}
      function money(f,opt){set(f,function(v){return parseMoney(v,Object.assign({},opt,{scale:options.moneyScale===undefined?1:options.moneyScale}));});}
      if(kind==='cash') {
        set('date',function(v){return parseDate(v,options);});
        row.id=text(value('id'));row.account=text(value('account'))||options.defaultAccount||'默认账户';row.counterparty=text(value('counterparty'))||'未填写交易对象';row.category=text(value('category'))||'未分类';
        money('balance',{optional:true});
        var act=text(value('activity')).toLowerCase(),activityMap={operating:'operating','经营':'operating','经营活动':'operating',investing:'investing','投资':'investing','投资活动':'investing',financing:'financing','筹资':'financing','融资':'financing','筹资活动':'financing',transfer:'transfer','内部转账':'transfer','内部划转':'transfer','账户互转':'transfer'};
        row.activity=activityMap[act]||'operating';
        if(act&&!activityMap[act]){invalid=true;issue('errors',sourceRow,'activity','UNKNOWN_ACTIVITY','无法识别活动类型，请选择经营、投资、筹资或内部转账。');}
        if(Number.isInteger(mapping.inflow)||Number.isInteger(mapping.outflow)) {
          money('inflow',{optional:true,defaultValue:0,nonNegative:true});money('outflow',{optional:true,defaultValue:0,nonNegative:true});
          if(row.inflow>0&&row.outflow>0){invalid=true;issue('errors',sourceRow,'amount','BOTH_DIRECTIONS','同一行收入和支出都大于 0，请拆为两笔交易。');}
        } else {
          try {
            var amt=parseMoney(value('amount'),{scale:options.moneyScale===undefined?1:options.moneyScale}),direction=text(value('direction')).toLowerCase(),sign;
            if(!direction)sign=amt>=0?1:-1;
            else if(['收入','收','收款','贷','贷方','credit','in','inflow','收入/贷'].indexOf(direction)>=0)sign=1;
            else if(['支出','付','付款','借','借方','debit','out','outflow','支出/借'].indexOf(direction)>=0)sign=-1;
            else fault('无法识别收支方向，请使用收入/支出。','INVALID_DIRECTION');
            if(direction&&amt<0&&sign===1)fault('负金额与收入方向冲突，请核对。','DIRECTION_CONFLICT');
            row.inflow=sign===1?Math.abs(amt):0;row.outflow=sign===-1?Math.abs(amt):0;
          }catch(e){invalid=true;issue('errors',sourceRow,'amount',e.code,e.message);}
        }
        if(!invalid&&row.inflow===0&&row.outflow===0){invalid=true;issue('errors',sourceRow,'amount','ZERO_FLOW','此行没有收支金额；仅有余额的记录请作为期初余额填写。');}
      } else if(kind==='profit') {
        set('month',function(v){return parseMonth(v,options);});['revenue','cost','expenses','tax'].forEach(function(f){money(f);});
        if(!invalid)row.netProfit=round(row.revenue-row.cost-row.expenses-row.tax);
      } else if(kind==='ar') {
        row.customer=text(value('customer'));if(!row.customer){invalid=true;issue('errors',sourceRow,'customer','MISSING_CUSTOMER','客户名称不能为空。');}
        set('invoiceDate',function(v){return parseDate(v,Object.assign({},options,{optional:true}));});set('dueDate',function(v){return parseDate(v,options);});
        money('amount',{nonNegative:true});money('received',{nonNegative:true});
        if(!invalid&&row.received>row.amount){invalid=true;issue('errors',sourceRow,'received','OVERPAID','已收金额超过应收金额，请分开记录预收或核对。');}
        if(!invalid&&row.invoiceDate&&row.invoiceDate>row.dueDate){invalid=true;issue('errors',sourceRow,'dueDate','INVALID_DATE_ORDER','到期日早于应收确认日期。');}
        if(!invalid)row.outstanding=round(row.amount-row.received);
      } else {
        set('date',function(v){return parseDate(v,options);});BALANCE_FIELDS.forEach(function(f){money(f);});
      }
      Object.keys(row).forEach(function(f){if(typeof row[f]==='string'&&row[f].length>2000){invalid=true;issue('errors',sourceRow,f,'TEXT_TOO_LONG','单个字段不得超过 2,000 字符。');}});
      if(invalid)return;
      if(kind==='cash'&&blank(value('activity')))missingActivityRows++;
      var comparable=Object.assign({},row);delete comparable.sourceRow;
      var fingerprint=JSON.stringify(comparable),identity=kind==='cash'&&row.id?'id:'+row.account+':'+row.id:fingerprint;
      if(kind==='profit'||kind==='balance') {
        var period=kind==='profit'?row.month:row.date;
        if(periods.has(period)) {
          issue('errors',sourceRow,kind==='profit'?'month':'date','DUPLICATE_PERIOD',period+' 与第 '+periods.get(period)+' 行的报表期间重复；每月利润或每日报表只能保留一条汇总，请先核对。');
          return;
        }
        periods.set(period,sourceRow);
      }
      if(seen.has(identity)) {
        var prior=seen.get(identity), conflict=kind==='cash'&&row.id&&prior.fingerprint!==fingerprint;
        issue('warnings',sourceRow,'','DUPLICATE_ROW',conflict?'与第 '+prior.row+' 行使用相同账户和流水号，但日期或金额等内容不一致；请核对原始流水，勿直接重复计入。':'与第 '+prior.row+' 行疑似重复；请核对后删除重复记录或明确保留。');
      } else seen.set(identity,{row:sourceRow,fingerprint:fingerprint});
      result.rows.push(row);
    });
    if(missingActivityRows)issue('warnings',0,'activity','DEFAULT_ACTIVITY',missingActivityRows+' 条流水未提供活动类型，暂按经营活动汇总；请核对借款、出资、投资和内部转账，并修改为相应活动类型后再确认。该分类不会用于推算账务利润。');
    if(!result.rows.length&&!result.errors.length)issue('errors',0,'','EMPTY_DATA','没有可导入的数据行。');
    return result;
  }
  function validateProject(project) {
    var errors=[],warnings=[];
    function problem(field,code,message){errors.push({row:0,field:field,code:code,message:message});}
    if(!project||typeof project!=='object'||Array.isArray(project))return{valid:false,errors:[{row:0,field:'',code:'INVALID_PROJECT',message:'项目文件格式无效。'}],warnings:warnings};
    if(project.schemaVersion!==1)problem('schemaVersion','INVALID_VERSION','项目文件版本不支持。');
    if(typeof project.company!=='string'||project.company.length>200)problem('company','INVALID_COMPANY','企业名称必须为不超过 200 字符的文本。');
    if(project.openingCash!==null)try{if(typeof project.openingCash!=='number')fault('项目期初现金必须为数值或 null。','INVALID_TYPE');parseMoney(project.openingCash);}catch(e){problem('openingCash',e.code,e.message);}
    if(project.asOf!==undefined&&project.asOf!==null&&project.asOf!=='')try{if(parseDate(project.asOf)!==project.asOf)fault('项目日期须使用 YYYY-MM-DD。');}catch(e){problem('asOf',e.code,e.message);}
    var total=0,aggregateMagnitude=0;
    ['cash','profit','ar','balance'].forEach(function(kind){
      var rows=project[kind];if(!Array.isArray(rows)){problem(kind,'INVALID_ROWS','项目必须包含 '+kind+' 数组。');return;}
      total+=rows.length;if(rows.length>MAX_ROWS){problem(kind,'LIMIT_EXCEEDED','单类数据超过 50,000 条。');return;}
      if(!rows.length)return;
      var fields=Object.keys(ALIASES[kind]).filter(function(f){return kind!=='cash'||['amount','direction'].indexOf(f)<0;});
      var matrix=[fields],mapping={};fields.forEach(function(f,i){mapping[f]=i;});
      rows.forEach(function(r,i){if(!r||typeof r!=='object'||Array.isArray(r)){problem(kind+'['+i+']','INVALID_ROW','项目包含无效数据行。');matrix.push([]);return;}matrix.push(fields.map(function(f){return r[f];}));});
      var n=normalize(matrix,kind,mapping);
      n.errors.forEach(function(e){errors.push(Object.assign({},e,{field:kind+'.'+e.field}));});
      n.warnings.forEach(function(e){warnings.push(Object.assign({},e,{field:kind+'.'+e.field}));});
      rows.forEach(function(r,i) {
        if(!r||typeof r!=='object') return;
        var prefix=kind+'['+i+'].';
        var numeric=kind==='cash'?['inflow','outflow']:kind==='profit'?['revenue','cost','expenses','tax']:kind==='ar'?['amount','received']:BALANCE_FIELDS;
        numeric.forEach(function(f){if(typeof r[f]!=='number')problem(prefix+f,'INVALID_TYPE','项目金额必须为数值。');else if(Number.isFinite(r[f]))aggregateMagnitude+=Math.abs(r[f]);});
        if(kind==='cash'&&['operating','investing','financing','transfer'].indexOf(r.activity)<0)problem(prefix+'activity','INVALID_ACTIVITY','项目活动分类无效。');
        var dateFields=kind==='cash'||kind==='balance'?['date']:kind==='ar'?['dueDate']:[];
        dateFields.forEach(function(f){
          try{if(typeof r[f]!=='string'||parseDate(r[f])!==r[f])fault('项目日期必须使用 YYYY-MM-DD。','INVALID_DATE');}
          catch(e){problem(prefix+f,e.code,e.message);}
        });
        if(kind==='profit'&&(typeof r.month!=='string'||!/^\d{4}-\d{2}$/.test(r.month)))problem(prefix+'month','INVALID_DATE','项目月份必须使用 YYYY-MM。');
        if(kind==='ar'&&r.invoiceDate!==null&&r.invoiceDate!==undefined){
          try{if(typeof r.invoiceDate!=='string'||parseDate(r.invoiceDate)!==r.invoiceDate)fault('项目日期必须使用 YYYY-MM-DD。','INVALID_DATE');}
          catch(e){problem(prefix+'invoiceDate',e.code,e.message);}
        }
        if(kind==='cash'&&r.balance!==null&&r.balance!==undefined&&typeof r.balance!=='number')problem(prefix+'balance','INVALID_TYPE','余额必须为数值或 null。');
        var derived=kind==='profit'?'netProfit':kind==='ar'?'outstanding':null;
        if(derived&&r[derived]!==undefined) {
          var expected=kind==='profit'?round(r.revenue-r.cost-r.expenses-r.tax):round(r.amount-r.received);
          if(typeof r[derived]!=='number'||!Number.isFinite(r[derived])||r[derived]!==expected)problem(prefix+derived,'DERIVED_VALUE_MISMATCH','保存的计算结果与来源金额不一致，请核对 '+derived+'；应以来源数据重新计算。');
        }
        var stringFields=kind==='cash'?['id','account','counterparty','category']:kind==='ar'?['customer']:[];
        stringFields.forEach(function(f){if(typeof r[f]!=='string')problem(prefix+f,'INVALID_TYPE','项目文本字段格式无效。');});
      });
    });
    if(aggregateMagnitude>Number.MAX_SAFE_INTEGER/100)problem('','AMOUNT_LIMIT','项目金额总规模过大，无法保证分级精度，请拆分数据。');
    if(total>MAX_ROWS*2)problem('','LIMIT_EXCEEDED','项目合计最多支持 100,000 条数据。');
    return{valid:errors.length===0,errors:errors,warnings:warnings};
  }
  /** Report money is CNY; netMargin is a fraction (0.2 = 20%). Monthly figures
   * are restricted to asOf. closingCash is null without openingCash. Opening
   * cash means the balance immediately before the first imported transaction.
   * This engine never infers accounting profit from cash or fabricates balances. */
  function buildReport(project) {
    var validation=validateProject(project);
    if(!validation.valid){var e=new Error('项目数据未通过校验。');e.details=validation.errors;throw e;}
    var dates=[];project.cash.forEach(function(r){dates.push(r.date);});project.profit.forEach(function(r){dates.push(monthEnd(r.month));});project.balance.forEach(function(r){dates.push(r.date);});
    var asOf=project.asOf||dates.sort().slice(-1)[0]||new Date().toISOString().slice(0,10);
    var byMonth=new Map(), warnings=validation.warnings.slice();
    function month(key){if(!byMonth.has(key))byMonth.set(key,{month:key,cashIn:0,cashOut:0,opIn:0,opOut:0,net:0,opNet:0,closingCash:null,revenue:null,cost:null,expenses:null,tax:null,netProfit:null,netMargin:null,transactionCount:0,profitRecordCount:0});return byMonth.get(key);}
    var cash=project.cash.filter(function(r){return r.date<=asOf;}),profit=project.profit.filter(function(r){return monthEnd(r.month)<=asOf;});
    cash.forEach(function(r){var m=month(r.date.slice(0,7));m.cashIn+=r.inflow;m.cashOut+=r.outflow;m.transactionCount++;if(r.activity==='operating'){m.opIn+=r.inflow;m.opOut+=r.outflow;}});
    profit.forEach(function(r){var m=month(r.month);if(m.revenue===null){m.revenue=0;m.cost=0;m.expenses=0;m.tax=0;}m.revenue+=r.revenue;m.cost+=r.cost;m.expenses+=r.expenses;m.tax+=r.tax;m.profitRecordCount++;});
    var months=Array.from(byMonth.keys()).sort();
    if(months.length){var y=+months[0].slice(0,4),mo=+months[0].slice(5),last=asOf.slice(0,7), count=0;while(y+'-'+String(mo).padStart(2,'0')<=last){month(y+'-'+String(mo).padStart(2,'0'));mo++;if(mo>12){mo=1;y++;}if(++count>3612)fault('报告期间跨度过大。','LIMIT_EXCEEDED');}}
    months=Array.from(byMonth.keys()).sort();var running=project.openingCash,monthly=[];
    months.forEach(function(k){var m=byMonth.get(k);['cashIn','cashOut','opIn','opOut'].forEach(function(f){m[f]=round(m[f]);});m.net=round(m.cashIn-m.cashOut);m.opNet=round(m.opIn-m.opOut);if(running!==null){running=round(running+m.net);m.closingCash=running;}if(m.revenue!==null){['revenue','cost','expenses','tax'].forEach(function(f){m[f]=round(m[f]);});m.netProfit=round(m.revenue-m.cost-m.expenses-m.tax);m.netMargin=m.revenue>0?m.netProfit/m.revenue:null;}monthly.push(m);});
    var totals={cashIn:0,cashOut:0,opIn:0,opOut:0,net:0,opNet:0,openingCash:project.openingCash,closingCash:project.openingCash,netProfit:null,revenue:null,netMargin:null,transactionCount:cash.length};
    monthly.forEach(function(m){['cashIn','cashOut','opIn','opOut','net','opNet'].forEach(function(f){totals[f]=round(totals[f]+m[f]);});if(m.revenue!==null){totals.revenue=round((totals.revenue||0)+m.revenue);totals.netProfit=round((totals.netProfit||0)+m.netProfit);}});
    totals.closingCash=project.openingCash===null?null:round(project.openingCash+totals.net);totals.netMargin=totals.revenue>0?totals.netProfit/totals.revenue:null;
    var arRows=project.ar.filter(function(r){return!r.invoiceDate||r.invoiceDate<=asOf;}).map(function(r){var outstanding=round(r.amount-r.received);var days=outstanding>0?Math.max(0,Math.floor((Date.parse(asOf+'T00:00:00Z')-Date.parse(r.dueDate+'T00:00:00Z'))/86400000)):0;return Object.assign({},r,{outstanding:outstanding,overdue:days>0,daysOverdue:days});});
    var ar={rows:arRows,total:0,overdue:0,overdueRatio:null};arRows.forEach(function(r){ar.total=round(ar.total+r.outstanding);if(r.overdue)ar.overdue=round(ar.overdue+r.outstanding);});ar.overdueRatio=ar.total>0?ar.overdue/ar.total:null;
    var balances=project.balance.filter(function(r){return r.date<=asOf;}).sort(function(a,b){return a.date.localeCompare(b.date);}),balance=null;
    if(balances.length){var b=balances[balances.length-1];var assets=round(b.cash+b.receivables+b.inventory+b.fixedAssets+b.otherAssets),liabilities=round(b.payables+b.taxPayable+b.debt+b.otherLiabilities),equity=round(b.capital+b.retainedEarnings);balance=Object.assign({},b,{assets:assets,liabilities:liabilities,equity:equity,difference:round(assets-liabilities-equity),balanced:Math.abs(round(assets-liabilities-equity))<=0.01});if(!balance.balanced)warnings.push({row:b.sourceRow||0,field:'balance',code:'BALANCE_MISMATCH',message:'资产不等于负债加权益，请核对报表。'});}
    function groups(field,flow){var groupsMap=new Map();cash.filter(function(r){return r.activity==='operating';}).forEach(function(r){var name=r[field];groupsMap.set(name,round((groupsMap.get(name)||0)+r[flow]));});return Array.from(groupsMap.entries()).filter(function(x){return x[1]>0;}).map(function(x){return{name:x[0],amount:x[1]};}).sort(function(a,b){return b.amount-a.amount;});}
    var accountMap=new Map();cash.forEach(function(r){if(!accountMap.has(r.account))accountMap.set(r.account,{name:r.account,cashIn:0,cashOut:0,net:0});var a=accountMap.get(r.account);a.cashIn=round(a.cashIn+r.inflow);a.cashOut=round(a.cashOut+r.outflow);a.net=round(a.cashIn-a.cashOut);});
    // Source balances are reconciliation anchors only. Never use them to
    // fabricate project openingCash, closingCash or cash runway.
    var accountChecks=new Map();
    cash.map(function(r,index){return{record:r,index:index};}).sort(function(a,b){return a.record.date.localeCompare(b.record.date)||a.index-b.index;}).forEach(function(item) {
      var r=item.record;
      if(!accountChecks.has(r.account))accountChecks.set(r.account,{movement:0,anchor:null,anchorRow:0,consistent:true});
      var check=accountChecks.get(r.account);
      check.movement=round(check.movement+r.inflow-r.outflow);
      if(r.balance!==null&&r.balance!==undefined) {
        var impliedOpening=round(r.balance-check.movement);
        if(check.anchor===null) {check.anchor=impliedOpening;check.anchorRow=r.sourceRow||0;}
        else if(Math.abs(round(impliedOpening-check.anchor))>0.01) {
          warnings.push({row:r.sourceRow||0,field:'balance',code:'SOURCE_BALANCE_MISMATCH',message:r.account+' 在 '+r.date+' 的流水余额与已导入收支不连续（差额 '+round(impliedOpening-check.anchor)+' 元）。请核对漏行、重复记录、收支方向及同日交易顺序。'});
          check.consistent=false;
        }
      }
    });
    var checks=Array.from(accountChecks.values());
    if(project.openingCash!==null&&checks.length&&checks.every(function(c){return c.anchor!==null&&c.consistent;})) {
      var sourceOpening=round(checks.reduce(function(sum,c){return sum+c.anchor;},0));
      if(Math.abs(round(sourceOpening-project.openingCash))>0.01)warnings.push({row:0,field:'openingCash',code:'OPENING_BALANCE_MISMATCH',message:'根据各账户流水余额反推的期初合计为 '+sourceOpening+' 元，与填写的期初现金相差 '+round(sourceOpening-project.openingCash)+' 元；当前报告仍按填写的期初现金计算，请核对。'});
    }
    var transferNet=round(cash.filter(function(r){return r.activity==='transfer';}).reduce(function(sum,r){return sum+r.inflow-r.outflow;},0));
    if(transferNet!==0)warnings.push({row:0,field:'cash',code:'UNBALANCED_TRANSFERS',message:'内部转账净额为 '+transferNet+' 元，请检查是否缺少另一账户流水；已保留实际现金变动且不计入经营收支。'});
    if(project.profit.some(function(r){return r.month===asOf.slice(0,7)&&monthEnd(r.month)>asOf;}))warnings.push({row:0,field:'profit',code:'PARTIAL_MONTH_PROFIT_EXCLUDED',message:'截止日在月中；当月账务资料是整月汇总，无法拆到具体日，因此本期未纳入当月利润。选择月末可纳入该月。'});
    if(monthly.length&&cash.length&&monthly[monthly.length-1].transactionCount===0)warnings.push({row:0,field:'cash',code:'LATEST_MONTH_NO_CASH_RECORDS',message:'截止月份没有导入现金流水；图中该月仅表示当前文件未提供交易记录，不证明企业没有收支。现金推演需核对实际基准月份。'});
    if(project.cash.some(function(r){return r.date>asOf;}))warnings.push({row:0,field:'asOf',code:'FUTURE_ROWS_EXCLUDED',message:'截至日期之后的现金记录未计入本期报告。'});
    if(project.openingCash===null)warnings.push({row:0,field:'openingCash',code:'MISSING_OPENING_CASH',message:'未填写期初现金，仅显示收支变化；账户余额和现金可支撑月数暂不计算。'});
    if(project.ar.length)warnings.push({row:0,field:'ar',code:'AR_SNAPSHOT',message:'应收数据按导入时已收金额计算；历史截止日无法反推过去的回款状态。'});
    return{company:project.company,asOf:asOf,months:months,monthly:monthly,totals:totals,latest:monthly.length?monthly[monthly.length-1]:null,ar:ar,balance:balance,incomeGroups:groups('counterparty','inflow'),costGroups:groups('category','outflow'),accounts:Array.from(accountMap.values()),warnings:warnings};
  }
  function safeCsv(matrix) {
    if(!Array.isArray(matrix))fault('导出内容须为表格。','INVALID_CSV');
    return '\uFEFF'+matrix.map(function(row){return row.map(function(v){var s=v===null||v===undefined?'':String(v);if(typeof v==='string'&&/^[\s\uFEFF]*[=+\-@\t\r\n]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',');}).join('\r\n');
  }
  return Object.freeze({parseCSV:parseCSV,parseMoney:parseMoney,parseDate:parseDate,monthEnd:monthEnd,autoMapping:autoMapping,normalize:normalize,validateProject:validateProject,buildReport:buildReport,safeCsv:safeCsv,fields:ALIASES,limits:{maxRows:MAX_ROWS,maxText:MAX_TEXT,maxMoney:MAX_MONEY}});
});
