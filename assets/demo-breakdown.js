/* Income/cost exploration for the fictional example dashboard only. */
(function (global, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else global.YoushuDemoBreakdown = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';
const LARGE_TRANSACTION=5000;
const tagNames={income:{large:'大额',refund:'退款',payroll:'薪酬'},cost:{large:'大额',subscription:'订阅',install:'分期'}};
function transactionTags(kind,row){
  const tags=[],money=value=>'¥'+value.toLocaleString('zh-CN');
  const hasEvidence=value=>typeof value==='string'&&value.trim().length>0;
  if(!Object.hasOwn(tagNames,kind))return tags;
  if(Number.isFinite(row.amount)&&row.amount>=LARGE_TRANSACTION)tags.push({key:'large',label:tagNames[kind].large,reason:'本笔'+(kind==='income'?'到账':'实际付款')+' '+money(row.amount)+'，达到示例的大额门槛 '+money(LARGE_TRANSACTION)+'。'});
  if(kind==='income'&&hasEvidence(row.natureEvidence)){
    if(row.incomeNature==='refund')tags.push({key:'refund',label:'退款',reason:row.natureEvidence});
    if(row.incomeNature==='payroll')tags.push({key:'payroll',label:'薪酬',reason:row.natureEvidence});
  }
  if(kind==='cost'){
    if(row.subscription===true&&hasEvidence(row.subscriptionEvidence))tags.push({key:'subscription',label:tagNames.cost.subscription,reason:row.subscriptionEvidence});
    const plan=row.installment;
    if(plan&&Number.isInteger(plan.current)&&Number.isInteger(plan.total)&&plan.current>=1&&plan.total>=plan.current&&hasEvidence(plan.evidence))tags.push({key:'install',label:tagNames.cost.install,reason:plan.evidence+'；本次实际付款 '+money(row.amount)+'。明细、合计和大额判断只计本期实付。'});
  }
  return tags;
}
function buildData(demo) {
  const data={income:{total:120000,noun:'收入',action:'收款',label:'收入来源',items:[
    {id:'chengming',name:'澄明电商',note:'电商客服智能体交付',amount:42000,parts:[['智能体开发',29400],['知识库配置',8400],['上线培训',4200]]},
    {id:'hechuan',name:'禾川咨询',note:'业务流程自动化实施',amount:30000,parts:[['流程设计',12000],['自动化实施',15000],['人员培训',3000]]},
    {id:'luming',name:'鹿鸣教育',note:'知识库与教学助手',amount:24000,parts:[['知识库搭建',14400],['教学助手开发',7200],['讲师培训',2400]]},
    {id:'xingyu',name:'星屿软件',note:'AI插件订阅与运维',amount:14400,parts:[['插件订阅',8640],['运维支持',4320],['功能配置',1440]]},
    {id:'beichen',name:'北辰工作室',note:'AI应用咨询与培训',amount:9600,parts:[['应用咨询',5760],['团队培训',3840]]}
  ]},cost:{total:72000,noun:'成本',action:'付款',label:'成本分类',items:[
    {id:'api',name:'模型 API 调用',note:'文本、语音、图像与嵌入',amount:24000,parts:[['文本模型',14400],['语音模型',4800],['图像模型',3600],['向量嵌入',1200]]},
    {id:'salary',name:'创始人薪酬',note:'基础薪酬与项目绩效',amount:18000,parts:[['基础薪酬',14400],['项目绩效',3600]]},
    {id:'cloud',name:'云资源与部署',note:'计算、存储与网络',amount:9600,parts:[['计算资源',4800],['数据库',2400],['对象存储',1440],['网络流量',960]]},
    {id:'collab',name:'按需交付协作',note:'外部项目服务',amount:9600,parts:[['界面开发',4800],['接口集成',2880],['测试验收',1920]]},
    {id:'marketing',name:'推广获客',note:'内容、投放与活动',amount:6000,parts:[['内容制作',3000],['渠道投放',1800],['活动推广',1200]]},
    {id:'tools',name:'AI 工具订阅',note:'开发、设计与协作工具',amount:4800,parts:[['编程工具',2400],['设计工具',1440],['协作工具',960]]}
  ]}};
  // Expand the approved fictional breakdown using the dashboard's own monthly totals.
  for (const [kind, rows] of [['income', demo.clients], ['cost', demo.costs]]) {
    const templates = data[kind].items;
    data[kind].items = rows.map(([name, amount], index) => {
      const template = templates.find(item => item.name === name);
      const parts = template ? template.parts : [[name, amount]];
      const denominator = parts.reduce((sum, part) => sum + part[1], 0);
      let remaining = Math.round(amount * 100);
      const allocated = parts.map(([label, value], part) => {
        const cents = part === parts.length - 1 ? remaining : Math.round(amount * 100 * value / denominator);
        remaining -= cents;
        return [label, cents / 100];
      });
      return {id: template?.id || kind + '-' + index, name, amount, parts: allocated};
    }).sort((a,b) => b.amount - a.amount);
    data[kind].total = data[kind].items.reduce((sum,item) => sum + item.amount, 0);
  }
  const sourceNames=['招商银行','微信支付','支付宝','招商银行'];
  const costCounterparties={api:['云杉模型平台','青竹智能','星河模型服务','云杉模型平台'],salary:['工作室负责人'],cloud:['星海云服务','青竹云计算','云杉数据'],collab:['拾光技术工作室','山屿设计','白鹭测试'],marketing:['青禾传媒','星河广告','映山内容工作室'],tools:['灵感工具平台','墨点设计','云杉协作']};
  for(const kind of ['income','cost']){
    for(const item of data[kind].items){
      item.transactions=[];
      item.parts.forEach(([name,total],part)=>{
        const weights=kind==='income'?[.25,.4,.15,.2]:[.2,.35,.3,.15];
        const amounts=weights.slice(0,3).map(weight=>Math.round(total*100*weight)/100);
        amounts.push(Math.round((total-amounts.reduce((sum,amount)=>sum+amount,0))*100)/100);
        amounts.forEach((amount,index)=>{
          const day=[4,12,21,28][index],hour=9+part,minute=[18,42,6,35][index];
          const counterparties=costCounterparties[item.id] || [item.name];
          item.transactions.push({id:item.id+'-'+part+'-'+index,itemName:item.name,part,partName:name,amount,date:`2026-09-${String(day).padStart(2,'0')} ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`,counterparty:kind==='income'?item.name:counterparties[(index+part)%counterparties.length],summary:name+' · '+(kind==='income'?['首期款','进度款','阶段款','尾款'][index]:['月初结算','用量结算','追加结算','月末结算'][index]),source:sourceNames[(index+part)%sourceNames.length]});
        });
      });
    }
  }
  // Fictional payment-method evidence for the example only; all cash totals stay unchanged.
  for(const item of data.cost.items)for(const row of item.transactions){
    if(item.id==='tools'){
      row.subscription=true;
      row.subscriptionEvidence='示例订单注明：'+row.partName+'订阅服务。';
    }
    if(row.id.startsWith('api-0-')||row.id==='tools-0-3'){
      row.automatic=true;
      row.paymentEvidence=row.id==='tools-0-3'?'示例账单注明：订阅自动续费扣款。':'示例账单注明：协议自动扣款。';
    }
    if(row.id==='cloud-0-0'){
      row.automatic=true;row.paymentEvidence='示例账单注明：协议自动扣款。';
      row.installment={current:3,total:6,evidence:'示例云资源套餐订单注明：分期支付，第 3 / 6 期'};
      row.summary='计算资源套餐 · 第 3 / 6 期';
    }
  }
  return data;
}
function createExportWorkbook(XLSX,group,rows,scope,sortLabel){
  // Store local wall-clock values as Excel serials, without timezone conversion.
  const excelTime=value=>{const [year,month,day,hour,minute]=value.match(/\d+/g).map(Number);return Date.UTC(year,month-1,day,hour,minute)/86400000+25569;};
  const kind=group.action==='收款'?'income':'cost';
  const table=[['交易时间','交易对象',group.action+'金额',group.label,group.noun+'构成','交易摘要','账户','交易标签'],...rows.map(row=>[excelTime(row.date),row.counterparty,row.amount,row.itemName,row.partName,row.summary,row.source,transactionTags(kind,row).map(tag=>tag.label).join('、')])];
  const sheet=XLSX.utils.aoa_to_sheet(table);
  for(let i=2;i<=rows.length+1;i++){
    sheet['A'+i].z='yyyy-mm-dd hh:mm';
    sheet['C'+i].z='"¥"#,##0.00';
  }
  sheet['!cols']=[{wch:22},{wch:25},{wch:18},{wch:24},{wch:22},{wch:36},{wch:18},{wch:28}];
  sheet['!autofilter']={ref:sheet['!ref']};
  const total=rows.reduce((cents,row)=>cents+Math.round(row.amount*100),0)/100;
  const info=XLSX.utils.aoa_to_sheet([
    ['项目','内容'],['报告','有数 · 示例看板'],['数据说明','全部为虚构交易示例'],
    ['期间','2026年9月'],['币种','人民币'],['导出范围',scope],['交易笔数',rows.length],
    ['合计金额',total],['排序方式',sortLabel],['分页范围','当前筛选范围内的全部记录']
  ]);
  info.B8.z='"¥"#,##0.00';info['!cols']=[{wch:18},{wch:64}];
  const book=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book,sheet,group.action+'明细');
  XLSX.utils.book_append_sheet(book,info,'导出说明');
  book.Props={Title:'有数 · '+group.action+'明细',Subject:scope,Comments:'虚构交易示例，2026年9月'};
  return book;
}
// Conservative text metrics also work in offline exports and without canvas.
function textWidth(value,size){return Array.from(String(value)).reduce((n,c)=>n+(/[^\u0000-\u00ff]/.test(c)?1.04:/[.,: ]/.test(c)?.36:.68)*size,0);}
function wrappedLines(value,size,width){let lines=1,used=0;for(const c of Array.from(String(value))){const next=textWidth(c,size);if(used&&used+next>width){lines++;used=0;}used+=next;}return lines;}
function ringLayout(width,item){
  const w=Math.max(80,Number.isFinite(width)&&width>0?width:350),padding=6,gap=10,count=item.parts.length;
  const asMoney=value=>'¥'+value.toLocaleString('zh-CN'),asPercent=value=>(Math.round(value*1000)/10).toLocaleString('zh-CN')+'%';
  const desiredWidth=Math.min(144,Math.max(104,...item.parts.map(([name,value])=>Math.max(textWidth(name,12),textWidth(asMoney(value),11)+textWidth(asPercent(value/item.amount),11)+4))));
  const compact=w<2*desiredWidth+200,columns=Math.max(1,Math.min(Math.ceil(count/2),3,Math.floor((w+gap)/(66+gap))));
  const labelWidth=compact?Math.floor((w-padding*2-(columns-1)*gap)/columns):Math.floor(desiredWidth);
  const stackValues=item.parts.some(([,value])=>textWidth(asMoney(value),11)+textWidth(asPercent(value/item.amount),11)+4>labelWidth);
  const labelHeight=Math.max(44,...item.parts.map(([name,value])=>Math.ceil(wrappedLines(name,12,labelWidth)*17+(stackValues?(wrappedLines(asMoney(value),11,labelWidth)+1)*16:16)+8)));
  let angle=-Math.PI/2;
  const segments=item.parts.map(([name,value],index)=>{const span=item.amount>0?Math.max(0,value/item.amount)*Math.PI*2:0,end=angle+span,middle=(angle+end)/2,inset=Math.min(.012,span*.1);const segment={index,name,value,start:angle+inset,end:end-inset,middle,side:Math.cos(middle)<0?-1:1};angle=end;return segment;});
  const r=compact?Math.min(80,(w-32)/2):Math.min(94,(w-2*labelWidth-40)/2),inner=r*.68,cx=w/2;
  const sideCount=Math.max(1,...[-1,1].map(side=>segments.filter(segment=>segment.side===side).length));
  const topCount=Math.ceil(count/2),bandRows=Math.ceil(topCount/columns),bandHeight=bandRows*labelHeight+Math.max(0,bandRows-1)*gap;
  const h=compact?Math.max(300,2*bandHeight+2*r+52):Math.max(300,sideCount*labelHeight+(sideCount-1)*gap+28),cy=h/2;
  segments.forEach(segment=>segment.desired=cy+(r+16)*Math.sin(segment.middle));
  if(compact){
    const ordered=segments.slice().sort((a,b)=>a.desired-b.desired);
    for(const [band,items] of [[0,ordered.slice(0,topCount)],[1,ordered.slice(topCount)]]){
      items.sort((a,b)=>Math.cos(a.middle)-Math.cos(b.middle));
      const rows=Math.ceil(items.length/columns),height=rows*labelHeight+Math.max(0,rows-1)*gap;
      items.forEach((segment,index)=>{const row=Math.floor(index/columns),rowCount=Math.min(columns,items.length-row*columns);segment.labelX=(w-rowCount*labelWidth-(rowCount-1)*gap)/2+(index%columns)*(labelWidth+gap);segment.labelY=(band===0?padding:h-height-padding)+row*(labelHeight+gap);segment.band=band;});
    }
  }else{
    for(const side of [-1,1]){
      const items=segments.filter(segment=>segment.side===side).sort((a,b)=>a.desired-b.desired),centers=items.map(segment=>Math.max(padding+labelHeight/2,Math.min(h-padding-labelHeight/2,segment.desired)));
      for(let i=1;i<centers.length;i++)centers[i]=Math.max(centers[i],centers[i-1]+labelHeight+gap);
      const overflow=centers.length?Math.max(0,centers.at(-1)+labelHeight/2+padding-h):0;
      items.forEach((segment,index)=>{segment.labelX=side<0?padding:w-labelWidth-padding;segment.labelY=centers[index]-overflow-labelHeight/2;});
    }
  }
  return {w,h,cx,cy,r,inner,labelWidth,labelHeight,compact,stackValues,segments};
}

function mount(root, demo) {
  const doc = root.ownerDocument || document;
  const data = buildData(demo);
  const state={income:{item:data.income.items[0].id,open:true,part:null,tag:null,sort:'date-asc',page:1},cost:{item:data.cost.items[0].id,open:true,part:null,tag:null,sort:'date-asc',page:1}};
  const exportOpen={income:false,cost:false};
  const tagDetail={income:null,cost:null};
  const colors=['--yb-a','--yb-b','--yb-c','--yb-d','--yb-e','--yb-f'],pageSize=5;
  const money=value=>'¥'+value.toLocaleString('zh-CN');
  const percent=value=>(Math.round(value*1000)/10).toLocaleString('zh-CN')+'%';
  const $=id=>root.querySelector('#'+id);
  const selected=kind=>data[kind].items.find(item=>item.id===state[kind].item)||null;
  const chartItem=kind=>selected(kind)||{id:null,name:'全部'+data[kind].noun,amount:data[kind].total,parts:data[kind].items.map(item=>[item.name,item.amount])};
  const scopeName=kind=>{if(state[kind].tag)return '全部'+data[kind].action+' / '+tagNames[kind][state[kind].tag];const item=selected(kind);return item?(state[kind].part===null?item.name+'的全部构成':item.name+' / '+item.parts[state[kind].part][0]):'全部'+data[kind].noun+(kind==='income'?'来源':'分类');};
  const sortLabels={'date-desc':'时间：从新到旧','date-asc':'时间：从旧到新','amount-desc':'金额：从大到小','amount-asc':'金额：从小到大','counterparty-asc':'交易对象：名称 A → Z（按拼音）','counterparty-desc':'交易对象：名称 Z → A（按拼音）'};
  const defaultDirections={date:'asc',amount:'desc',counterparty:'asc'};
  const nameOrder=new Intl.Collator('zh-Hans-CN-u-co-pinyin',{numeric:true,sensitivity:'base'});
  function rowsFor(kind){
    const view=state[kind],item=selected(kind),scopeRows=item?item.transactions.filter(row=>view.part===null||row.part===view.part):data[kind].items.flatMap(item=>item.transactions);
    const rows=view.tag?scopeRows.filter(row=>transactionTags(kind,row).some(tag=>tag.key===view.tag)):scopeRows;
    const [key,direction]=view.sort.split('-'),sign=direction==='asc'?1:-1;
    return rows.sort((a,b)=>sign*(key==='date'?a.date.localeCompare(b.date):key==='amount'?a.amount-b.amount:nameOrder.compare(a.counterparty,b.counterparty))||b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
  }
  function announce(message){$('yb-status').textContent=message;}
  function exportScope(kind){if(state[kind].tag)return scopeName(kind);const item=selected(kind);return item?item.name+(state[kind].part!==null?' / '+item.parts[state[kind].part][0]:''):'全部'+data[kind].label;}
  function exportFilename(kind){return '有数_'+data[kind].noun+'明细_'+exportScope(kind).replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_')+'_2026-09.xlsx';}
  function renderExport(kind){
    const rows=rowsFor(kind),prefix='yb-'+kind+'-export-';
    $(prefix+'panel').hidden=!exportOpen[kind];
    $('yb-'+kind+'-ledger').setAttribute('data-export-open',String(exportOpen[kind]));
    $(prefix+'open').setAttribute('aria-expanded',String(exportOpen[kind]));
    $(prefix+'scope').textContent=exportScope(kind);
    $(prefix+'count').textContent='全部 '+rows.length+' 笔';
    $(prefix+'total').textContent=money(rows.reduce((sum,row)=>sum+row.amount,0));
    $(prefix+'order').textContent='包含全部分页 · '+sortLabels[state[kind].sort];
    $(prefix+'filename').textContent=exportFilename(kind);
    $(prefix+'confirm').textContent='导出 '+rows.length+' 笔';
    $(prefix+'confirm').disabled=!rows.length;
    $(prefix+'open').disabled=!rows.length;
  }
  function closeExport(kind){exportOpen[kind]=false;renderExport(kind);$('yb-'+kind+'-export-open').focus({preventScroll:true});}
  function downloadExcel(kind){
    const prefix='yb-'+kind+'-export-',feedback=$(prefix+'feedback'),errorMessage=$(prefix+'error');
    feedback.hidden=true;errorMessage.hidden=true;
    try{
      if(!window.XLSX)throw new Error('Excel 导出组件未加载，请完整解压软件并重新打开。');
      const rows=rowsFor(kind),filename=exportFilename(kind);
      if(!rows.length)throw new Error('当前范围没有可导出的明细。');
      const book=createExportWorkbook(window.XLSX,data[kind],rows,exportScope(kind),sortLabels[state[kind].sort]);
      const bytes=window.XLSX.write(book,{bookType:'xlsx',type:'array',compression:true,cellStyles:true});
      const url=window.URL.createObjectURL(new window.Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
      const link=doc.createElement('a');link.href=url;link.download=filename;link.style.display='none';
      try{doc.body.appendChild(link);link.click();}
      finally{link.remove();window.setTimeout(()=>window.URL.revokeObjectURL(url),10000);}
      closeExport(kind);
      feedback.textContent='已发起 Excel 下载 · '+rows.length+' 笔 · '+filename;
      announce(feedback.textContent);
    }catch(error){
      errorMessage.textContent=error.message?.includes('导出组件')?error.message:'Excel 导出未成功，请重试。';
      errorMessage.hidden=false;return;
    }
    feedback.hidden=false;
  }
  function applyFilter(kind,item,part){
    $('yb-'+kind+'-export-feedback').hidden=true;
    $('yb-'+kind+'-export-error').hidden=true;
    state[kind].tag=null;tagDetail[kind]=null;
    state[kind].item=item;state[kind].part=item===null?null:part;state[kind].open=true;state[kind].page=1;
    render(kind);
    announce('当前范围：'+scopeName(kind)+'，'+rowsFor(kind).length+'笔，'+sortLabels[state[kind].sort]);
  }
  function selectTag(kind,tag){
    if(!tagNames[kind]||(tag!==null&&!Object.hasOwn(tagNames[kind],tag)))return;
    const view=state[kind];
    view.tag=view.tag===tag?null:tag;view.item=null;view.part=null;view.open=true;view.page=1;
    tagDetail[kind]=null;
    $('yb-'+kind+'-export-feedback').hidden=true;$('yb-'+kind+'-export-error').hidden=true;
    render(kind);
    announce('当前范围：'+scopeName(kind)+'，'+rowsFor(kind).length+'笔。');
  }
  function toggleBar(kind,itemId){applyFilter(kind,state[kind].item===itemId?null:itemId,null);}
  function toggleSlice(kind,index){
    if(state[kind].item===null){applyFilter(kind,data[kind].items[index].id,null);$('yb-'+kind+'-center').focus({preventScroll:true});}
    else{applyFilter(kind,state[kind].item,state[kind].part===index?null:index);$('yb-'+kind+'-parts').querySelectorAll('button')[index].focus({preventScroll:true});}
  }
  function showCurrentDetails(kind){
    state[kind].open=true;render(kind);
    $('yb-'+kind+'-sort-'+state[kind].sort.split('-')[0]).focus({preventScroll:true});
    $('yb-'+kind+'-ledger').scrollIntoView({block:'nearest',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    announce('当前范围：'+scopeName(kind)+'，'+rowsFor(kind).length+'笔。');
  }
  function drawDonut(kind,item){
    const svg=$('yb-'+kind+'-ring'),ns='http://www.w3.org/2000/svg',view=state[kind];
    const geometry=ringLayout($('yb-'+kind+'-stage').getBoundingClientRect().width||350,item),{w,h,cx,cy,r,inner,labelWidth,labelHeight,compact,stackValues,segments}=geometry;
    $('yb-'+kind+'-stage').style.height=h+'px';$('yb-'+kind+'-stage').setAttribute('data-tall-labels',String(labelHeight>44));$('yb-'+kind+'-stage').setAttribute('data-stacked-values',String(stackValues));
    svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    svg.setAttribute('aria-label',item.name+'的构成。'+item.parts.map(part=>part[0]+money(part[1])+'，占比'+percent(part[1]/item.amount)).join('；')+'。当前范围：'+scopeName(kind)+'。');
    const point=(radius,a)=>`${cx+radius*Math.cos(a)} ${cy+radius*Math.sin(a)}`;
    const arcPath=(outer,hole,start,end)=>`M ${point(outer,start)} A ${outer} ${outer} 0 ${end-start>Math.PI?1:0} 1 ${point(outer,end)} L ${point(hole,end)} A ${hole} ${hole} 0 ${end-start>Math.PI?1:0} 0 ${point(hole,start)} Z`;
    segments.forEach(segment=>{
      const {index:i,name,value,start,end,middle,side,labelX,labelY}=segment;
      if(view.part===i){const halo=doc.createElementNS(ns,'path');halo.setAttribute('d',arcPath(r+9,r+4,start,end));halo.setAttribute('fill','var('+colors[i%colors.length]+')');halo.setAttribute('class','yb-selection-arc');svg.appendChild(halo);}
      const path=doc.createElementNS(ns,'path');
      path.setAttribute('d',arcPath(r,inner,start,end));
      path.setAttribute('fill','var('+colors[i%colors.length]+')');path.setAttribute('class','yb-slice cursor-interaction');
      path.setAttribute('data-tooltip',name+' · '+percent(value/item.amount)+' · '+money(value)+(view.part===i?'；再次点击取消此项筛选':'；点击筛选明细'));
      const title=doc.createElementNS(ns,'title');title.textContent=name+' · '+percent(value/item.amount)+' · '+money(value);path.appendChild(title);path.addEventListener('click',()=>toggleSlice(kind,i));svg.appendChild(path);
      const line=doc.createElementNS(ns,'path'),startX=cx+(r+10)*Math.cos(middle),startY=cy+(r+10)*Math.sin(middle);
      let d;
      if(compact){const offset=4+i*2,edge=side<0?offset:w-offset,endY=segment.band===0?labelY+labelHeight:labelY,edgeY=endY+(segment.band===0?11:-11);d=`M ${startX} ${startY} L ${edge} ${startY} L ${edge} ${edgeY} L ${labelX+labelWidth/2} ${endY}`;}
      else{const elbow=cx+side*(r+12),endX=side<0?labelX+labelWidth+1:labelX-1;d=`M ${startX} ${startY} L ${elbow} ${startY} L ${endX} ${labelY+labelHeight/2}`;}
      line.setAttribute('d',d);line.setAttribute('class','yb-leader');line.setAttribute('data-selected',String(view.part===i));svg.appendChild(line);
      const button=$('yb-'+kind+'-parts').querySelectorAll('button')[i];button.style.left=labelX+'px';button.style.top=labelY+'px';button.style.width=labelWidth+'px';button.style.height=labelHeight+'px';
    });
    const center=$('yb-'+kind+'-center'),size=inner*2-6;center.style.left=(cx-size/2)+'px';center.style.top=(cy-size/2)+'px';center.style.width=size+'px';center.style.height=size+'px';
    const name=$('yb-'+kind+'-center-name'),amount=$('yb-'+kind+'-amount');
    name.style.fontSize=Math.min(12,Math.max(9,size*.82*2/Math.max(1,textWidth(name.textContent,1))))+'px';
    amount.style.fontSize=Math.min(12,Math.max(9,size*.82/Math.max(1,textWidth(amount.textContent,1))))+'px';
    $('yb-'+kind+'-center-percent').style.fontSize=Math.min(28,size*.26)+'px';
    name.setAttribute('title',name.textContent);amount.setAttribute('title',amount.textContent);
  }
  function renderTagDetail(kind){
    const detail=tagDetail[kind],row=detail&&rowsFor(kind).find(row=>row.id===detail.row),tag=row&&transactionTags(kind,row).find(tag=>tag.key===detail.tag),prefix='yb-'+kind+'-tag-detail-';
    $(prefix+'panel').hidden=!tag;
    if(!tag){tagDetail[kind]=null;return;}
    $(prefix+'label').textContent=tag.label;$(prefix+'label').setAttribute('data-tag',tag.key);
    $(prefix+'transaction').textContent=row.counterparty+' · '+money(row.amount);
    $(prefix+'reason').textContent=tag.reason;
  }
  function renderLedger(kind){
    const group=data[kind],view=state[kind],item=selected(kind),ledger=$('yb-'+kind+'-ledger');
    ledger.hidden=!view.open;if(!view.open)return;
    const rows=rowsFor(kind),pages=Math.max(1,Math.ceil(rows.length/pageSize));view.page=Math.min(view.page,pages);
    $('yb-'+kind+'-breadcrumb').textContent='当前范围 · '+scopeName(kind);
    $('yb-'+kind+'-ledger-scope').textContent=item?item.name+(view.part===null?'':' / '+item.parts[view.part][0]):'';
    for(const [key,label] of Object.entries(tagNames[kind])){
      const button=$('yb-'+kind+'-tag-'+key),active=view.tag===key;
      button.setAttribute('aria-pressed',String(active));
      button.setAttribute('title',active?'再次点击查看全部'+group.action:(key==='large'?'单笔实收/实付 ≥ ¥5,000；':'')+'查看全部'+group.action+'中的'+label+'明细');
    }
    $('yb-'+kind+'-ledger-summary').innerHTML=rows.length+' 笔 · 合计 <strong>'+money(rows.reduce((sum,row)=>sum+row.amount,0))+'</strong>';
    $('yb-'+kind+'-sort-status').textContent='当前排序 · '+sortLabels[view.sort];
    const [sortKey,direction]=view.sort.split('-');
    for(const key of ['date','counterparty','amount']){
      const active=key===sortKey,next=active?(direction==='asc'?'desc':'asc'):defaultDirections[key];
      $('yb-'+kind+'-th-'+key).setAttribute('aria-sort',active?(direction==='asc'?'ascending':'descending'):'none');
      const button=$('yb-'+kind+'-sort-'+key);
      button.setAttribute('aria-label',(key==='date'?'交易时间':key==='counterparty'?'交易对象':group.action+'金额')+'，'+(active?'当前'+sortLabels[view.sort]+'；':'')+'点击按'+sortLabels[key+'-'+next]+'排序');
      button.setAttribute('title','点击按'+sortLabels[key+'-'+next]+'排序');
    }
    const visibleRows=rows.slice((view.page-1)*pageSize,view.page*pageSize);
    $('yb-'+kind+'-rows').innerHTML=visibleRows.map(row=>{
      const tags=transactionTags(kind,row);
      const labels=tags.length?'<span class="yb-tags">'+tags.map(tag=>`<button type="button" class="yb-tag cursor-interaction" data-row="${row.id}" data-tag="${tag.key}" aria-label="${tag.label}，查看标注依据" aria-controls="yb-${kind}-tag-detail-panel">${tag.label}</button>`).join('')+'</span>':'';
      return `<tr><td><time datetime="${row.date.replace(' ','T')}">${row.date.slice(0,10)}<small>${row.date.slice(11)}</small></time></td><td><span class="yb-counterparty">${row.counterparty}</span><div class="yb-row-meta">${labels}<small>${!item&&kind==='cost'?row.itemName+' · ':''}${row.summary}</small></div></td><td>${money(row.amount)}<small>${row.source}</small></td></tr>`;
    }).join('')||`<tr><td colspan="3" class="yb-empty">${view.tag?'本期暂无'+tagNames[kind][view.tag]+(kind==='income'&&view.tag!=='large'?'收款':'')+'记录':'当前范围暂无交易记录'}</td></tr>`;
    $('yb-'+kind+'-rows').querySelectorAll('.yb-tag').forEach(button=>button.addEventListener('click',()=>{
      const previous=tagDetail[kind];
      tagDetail[kind]=previous?.row===button.dataset.row&&previous?.tag===button.dataset.tag?null:{row:button.dataset.row,tag:button.dataset.tag};
      renderTagDetail(kind);
      if(tagDetail[kind])$('yb-'+kind+'-tag-detail-close').focus({preventScroll:true});
    }));
    $('yb-'+kind+'-pagination').hidden=false;
    $('yb-'+kind+'-page-actions').hidden=pages===1;
    $('yb-'+kind+'-page-info').textContent=view.page+' / '+pages;
    $('yb-'+kind+'-prev').disabled=view.page===1;$('yb-'+kind+'-next').disabled=view.page===pages;
    renderTagDetail(kind);
    renderExport(kind);
  }
  function render(kind){
    const group=data[kind],item=chartItem(kind),view=state[kind];
    $('yb-'+kind+'-bars').querySelectorAll('button').forEach(button=>{const active=button.dataset.item===view.item,source=group.items.find(row=>row.id===button.dataset.item),action=active?'再次点击取消此项筛选，查看全部'+group.noun+'构成与明细':'点击查看该项'+group.noun+'构成与明细';button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-expanded',String(active&&view.open));button.setAttribute('title',action);button.setAttribute('aria-label',source.name+'，'+money(source.amount)+'，占全部'+group.noun+percent(source.amount/group.total)+'；'+action);});
    $('yb-'+kind+'-detail').setAttribute('aria-label',item.name+'的构成');
    $('yb-'+kind+'-name').textContent=item.name;
    $('yb-'+kind+'-share').textContent=money(item.amount)+' · 占全部'+group.noun+' '+percent(item.amount/group.total);
    const [partName,partAmount]=view.part===null?[item.name,item.amount]:item.parts[view.part];
    $('yb-'+kind+'-center-name').textContent=partName;
    $('yb-'+kind+'-center-percent').textContent=percent(partAmount/item.amount);
    $('yb-'+kind+'-amount').textContent=money(partAmount);
    $('yb-'+kind+'-center').setAttribute('aria-expanded',String(view.open));
    $('yb-'+kind+'-center').setAttribute('aria-label','前往'+scopeName(kind)+'的明细，'+money(partAmount));
    $('yb-'+kind+'-center').setAttribute('title','点击前往当前范围的明细');
    $('yb-'+kind+'-chart-caption').textContent='占比均为占'+(view.item===null?'全部':'本项')+group.noun+' · 点击圆心前往当前明细';
    $('yb-'+kind+'-parts').innerHTML=item.parts.map(([name,value],i)=>`<button type="button" class="yb-callout cursor-interaction" data-part="${i}" aria-pressed="${view.part===i}" aria-controls="yb-${kind}-ledger" aria-expanded="${view.open&&view.part===i}" aria-label="${view.part===i?'取消':'选择'}${name}筛选，占比${percent(value/item.amount)}，${money(value)}"><span class="yb-callout-name">${name}</span><span class="yb-callout-values"><strong class="yb-callout-percent">${percent(value/item.amount)}</strong><span>${money(value)}</span></span></button>`).join('');
    $('yb-'+kind+'-parts').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>toggleSlice(kind,Number(button.dataset.part))));
    drawDonut(kind,item);
    renderLedger(kind);
  }
  $('yb-modules').innerHTML=['income','cost'].map(kind=>{
    const group=data[kind];
    return `<section class="yb-module yb-${kind}" aria-labelledby="yb-${kind}-heading">
      <header class="yb-heading q-section-title q-module-heading"><span class="q-no">${kind==='income'?'04':'05'}</span><h2 id="yb-${kind}-heading" aria-describedby="yb-${kind}-intro">${group.noun}</h2><span class="q-heading-copy" id="yb-${kind}-intro">${kind==='income'?'钱都是从哪里来的':'钱都花在哪里了'}</span><div class="q-heading-meta"><div class="yb-kicker q-pill">${kind==='income'?'· 实际到账':'· 实际支付'}</div><div class="yb-total"><span>${kind==='income'?'本月到账':'本月付款'}</span><strong>${money(group.total)}</strong></div></div></header>
      <div class="q-breakdown-card">
      <div id="yb-${kind}-content" class="yb-content">
        <div class="yb-overview"><div class="yb-column-head"><h3>${group.label}</h3><span>金额 · 占全部${group.noun}</span></div><div id="yb-${kind}-bars" class="yb-ranks" aria-label="按金额从高到低的${group.label}"></div></div>
        <section id="yb-${kind}-detail" class="yb-detail" aria-label="选中${group.noun}的构成">
          <div class="yb-detail-heading"><span class="yb-caption">${group.noun}构成</span><div class="yb-detail-title"><h3 id="yb-${kind}-name"></h3></div><div id="yb-${kind}-share" class="yb-detail-meta"></div></div>
          <div class="yb-ring-area"><div id="yb-${kind}-stage" class="yb-ring-stage"><svg id="yb-${kind}-ring" class="yb-ring" role="img"></svg><div id="yb-${kind}-parts" class="yb-chart-labels"></div><button id="yb-${kind}-center" type="button" class="yb-ring-center cursor-interaction" aria-controls="yb-${kind}-ledger" aria-expanded="false"><span id="yb-${kind}-center-name" class="yb-ring-label"></span><strong id="yb-${kind}-center-percent" class="yb-ring-percent"></strong><span id="yb-${kind}-amount" class="yb-ring-amount"></span></button></div></div>
          <div id="yb-${kind}-chart-caption" class="yb-chart-caption"></div>
        </section>
      </div>
      <section id="yb-${kind}-ledger" class="yb-ledger" aria-labelledby="yb-${kind}-ledger-title" hidden>
        <div class="yb-ledger-head">
          <div class="yb-ledger-heading"><h3 id="yb-${kind}-ledger-title">${group.action}明细</h3><span id="yb-${kind}-ledger-scope" class="yb-ledger-scope"></span></div>
          <div id="yb-${kind}-tags" class="yb-tag-filters" role="group" aria-label="按标签查看全部${group.action}">${Object.entries(tagNames[kind]).map(([key,label])=>`<button id="yb-${kind}-tag-${key}" type="button" class="yb-tag-filter cursor-interaction" data-tag="${key}" aria-pressed="false" aria-controls="yb-${kind}-rows">${label}</button>`).join('')}</div>
          <div class="yb-ledger-actions"><button id="yb-${kind}-export-open" type="button" class="yb-export-button cursor-interaction" aria-controls="yb-${kind}-export-panel" aria-expanded="false">导出 Excel</button><button id="yb-${kind}-close" type="button" class="yb-close cursor-interaction">收起</button></div>
        </div>
        <div id="yb-${kind}-breadcrumb" class="yb-sr"></div><span id="yb-${kind}-sort-status" class="yb-sr"></span>
        <p id="yb-${kind}-export-feedback" class="yb-export-feedback" role="status" aria-live="polite" hidden></p>
        <section id="yb-${kind}-export-panel" class="yb-export-panel" aria-labelledby="yb-${kind}-export-title" hidden>
          <div class="yb-export-head"><h4 id="yb-${kind}-export-title">导出${group.action}明细</h4><button id="yb-${kind}-export-close" type="button" class="yb-export-dismiss cursor-interaction" aria-label="关闭导出面板">关闭</button></div>
          <div class="yb-export-label">当前范围</div><div id="yb-${kind}-export-scope" class="yb-export-scope"></div><div class="yb-export-period">2026年9月 · 人民币</div>
          <div class="yb-export-summary"><strong id="yb-${kind}-export-total"></strong><span id="yb-${kind}-export-count"></span></div>
          <div id="yb-${kind}-export-order" class="yb-export-order"></div><div id="yb-${kind}-export-filename" class="yb-export-filename"></div>
          <p class="yb-export-label">Excel 中附带「交易标签」列</p>
          <p id="yb-${kind}-export-error" class="yb-export-error" role="alert" hidden></p>
          <button id="yb-${kind}-export-confirm" type="button" class="yb-export-confirm cursor-interaction"></button>
        </section>
        <table class="yb-table"><thead><tr>${[['date','交易时间'],['counterparty','交易对象'],['amount',group.action+'金额']].map(([key,label])=>`<th id="yb-${kind}-th-${key}" scope="col" aria-sort="none"><button id="yb-${kind}-sort-${key}" type="button" class="yb-sort-button cursor-interaction" aria-controls="yb-${kind}-rows"><span>${label}</span><span class="yb-sort-arrows" aria-hidden="true"><span class="yb-sort-up"></span><span class="yb-sort-down"></span></span></button></th>`).join('')}</tr></thead><tbody id="yb-${kind}-rows"></tbody></table>
        <section id="yb-${kind}-tag-detail-panel" class="yb-tag-detail" aria-label="标签说明" hidden><div class="yb-tag-detail-head"><span id="yb-${kind}-tag-detail-label" class="yb-tag"></span><button id="yb-${kind}-tag-detail-close" class="yb-tag-close cursor-interaction" type="button">收起说明</button></div><p id="yb-${kind}-tag-detail-transaction"></p><p id="yb-${kind}-tag-detail-reason" class="yb-tag-reason"></p></section>
        <div id="yb-${kind}-pagination" class="yb-pagination"><div id="yb-${kind}-ledger-summary" class="yb-ledger-summary"></div><div id="yb-${kind}-page-actions" class="yb-page-actions"><button id="yb-${kind}-prev" type="button" class="yb-page-button cursor-interaction">上一页</button><span id="yb-${kind}-page-info" class="yb-page-info"></span><button id="yb-${kind}-next" type="button" class="yb-page-button cursor-interaction">下一页</button></div></div>
      </section>
      </div>
    </section>`;
  }).join('');
  for(const kind of ['income','cost']){
    const group=data[kind],max=Math.max(...group.items.map(item=>item.amount));
    $('yb-'+kind+'-bars').innerHTML=group.items.map(item=>`<button type="button" class="yb-rank cursor-interaction" data-item="${item.id}" aria-pressed="false" aria-expanded="false" aria-controls="yb-${kind}-detail yb-${kind}-ledger" aria-label="${item.name}，${money(item.amount)}，占全部${group.noun}${percent(item.amount/group.total)}；查看构成与全部明细"><span class="yb-rank-top"><span class="yb-rank-name">${item.name}</span><span class="yb-rank-amount">${money(item.amount)}</span><span class="yb-rank-percent">${percent(item.amount/group.total)}</span></span><span class="yb-bar-track" aria-hidden="true"><span class="yb-bar-fill" style="width:${item.amount/max*100}%"></span></span></button>`).join('');
    $('yb-'+kind+'-bars').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>toggleBar(kind,button.dataset.item)));
    for(const key of Object.keys(tagNames[kind]))$('yb-'+kind+'-tag-'+key).addEventListener('click',()=>selectTag(kind,key));
    $('yb-'+kind+'-center').addEventListener('click',()=>showCurrentDetails(kind));
    $('yb-'+kind+'-close').addEventListener('click',()=>{state[kind].open=false;exportOpen[kind]=false;tagDetail[kind]=null;render(kind);const trigger=state[kind].part!==null?$('yb-'+kind+'-parts').querySelectorAll('button')[state[kind].part]:Array.from($('yb-'+kind+'-bars').querySelectorAll('button')).find(button=>button.dataset.item===state[kind].item)||$('yb-'+kind+'-center');trigger.focus();announce('已收起'+group.action+'明细，当前筛选范围保持为'+scopeName(kind)+'。');});
    $('yb-'+kind+'-tag-detail-close').addEventListener('click',()=>{const previous=tagDetail[kind];tagDetail[kind]=null;renderTagDetail(kind);const trigger=Array.from($('yb-'+kind+'-rows').querySelectorAll('.yb-tag')).find(button=>button.dataset.row===previous?.row&&button.dataset.tag===previous?.tag);(trigger||$('yb-'+kind+'-sort-date')).focus({preventScroll:true});});
    $('yb-'+kind+'-tag-detail-panel').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();$('yb-'+kind+'-tag-detail-close').click();}});
    $('yb-'+kind+'-export-open').addEventListener('click',()=>{exportOpen[kind]=!exportOpen[kind];$('yb-'+kind+'-export-feedback').hidden=true;$('yb-'+kind+'-export-error').hidden=true;renderExport(kind);if(exportOpen[kind])$('yb-'+kind+'-export-confirm').focus({preventScroll:true});});
    $('yb-'+kind+'-export-close').addEventListener('click',()=>closeExport(kind));
    $('yb-'+kind+'-export-panel').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeExport(kind);}});
    $('yb-'+kind+'-export-confirm').addEventListener('click',()=>downloadExcel(kind));
    for(const key of ['date','counterparty','amount'])$('yb-'+kind+'-sort-'+key).addEventListener('click',()=>{const [active,direction]=state[kind].sort.split('-');state[kind].sort=key+'-'+(active===key?(direction==='asc'?'desc':'asc'):defaultDirections[key]);state[kind].page=1;tagDetail[kind]=null;$('yb-'+kind+'-export-feedback').hidden=true;renderLedger(kind);announce('明细已按'+sortLabels[state[kind].sort]+'排序。');});
    for(const [suffix,step] of [['prev',-1],['next',1]])$('yb-'+kind+'-'+suffix).addEventListener('click',()=>{const pages=Math.ceil(rowsFor(kind).length/pageSize);state[kind].page=Math.max(1,Math.min(pages,state[kind].page+step));tagDetail[kind]=null;renderLedger(kind);announce('明细第'+state[kind].page+'页。');});
  }
  render('income');render('cost');
  let observer;const drawnWidths={income:0,cost:0};
  if (typeof ResizeObserver === 'function') {
    observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width=entry.target.getBoundingClientRect().width,kind=entry.target.id === 'yb-income-stage' ? 'income' : 'cost';
        if(width<=0){drawnWidths[kind]=0;continue;}
        if(Math.abs(width-drawnWidths[kind])<.5)continue;
        drawnWidths[kind]=width;drawDonut(kind, chartItem(kind));
      }
    });
    for (const kind of ['income','cost']) observer.observe($('yb-'+kind+'-stage'));
  }
  return {
    selectTag,
    getState: () => JSON.parse(JSON.stringify(state)),
    getRows: kind => rowsFor(kind).map(row => ({...row})),
    destroy: () => {observer?.disconnect();root.replaceChildren();}
  };
}
return {buildData, ringLayout, transactionTags, createExportWorkbook, mount};
});
