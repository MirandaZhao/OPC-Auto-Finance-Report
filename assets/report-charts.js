/* Shared report charts. Every amount comes from the active report model. */
(function(global){
'use strict';
const NS='http://www.w3.org/2000/svg';
const C={ink:'#253a30',muted:'#69796e',line:'#e2e8e0',green:'#54876b',purple:'#a39dbf',blue:'#6c95b0',forecast:'#cf775e',red:'#ba675c'};
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const number=v=>finite(v)?Number(v):0;
const money=v=>'¥'+Number(v).toLocaleString('zh-CN',{minimumFractionDigits:0,maximumFractionDigits:2});
const percent=v=>(v*100).toFixed(1).replace(/\.0$/,'')+'%';
const wan=v=>(v/10000).toLocaleString('zh-CN',{maximumFractionDigits:Math.abs(v)<1000?4:2});
const month=v=>String(v||'').replace(/^(\d{4})-(\d{2}).*$/,'$1/$2');
const shortMonth=v=>String(v||'').replace(/^(\d{4})-(\d{2}).*$/,(_,y,m)=>y.slice(2)+'/'+m);
function node(tag,attrs,text){const n=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attrs||{}))if(value!==undefined&&value!==null)n.setAttribute(key,String(value));if(text!==undefined)n.textContent=String(text);return n;}
function add(parent,tag,attrs,text){const n=node(tag,attrs,text);parent.appendChild(n);return n;}
function text(parent,x,y,value,attrs={}){return add(parent,'text',{x,y,fill:C.muted,'font-size':12,'font-family':'Arial, PingFang SC, Microsoft YaHei, sans-serif',...attrs},value);}
function svg(container,height,label){
  const measured=container.getBoundingClientRect?.().width||container.clientWidth||640;
  const width=Math.max(260,Math.round(measured));
  container.replaceChildren();
  const s=add(container,'svg',{viewBox:`0 0 ${width} ${height}`,width:'100%',height,role:'img','aria-label':label,style:'display:block;overflow:visible'});
  return {s,w:width,h:height};
}
function tip(el,value){el.setAttribute('data-tooltip',value);add(el,'title',{},value);}
function clickable(el,callback,value,label){
  if(!callback)return;
  el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('class',((el.getAttribute('class')||'')+' cursor-interaction').trim());el.setAttribute('aria-label',label);
  el.addEventListener('click',()=>callback(value));
  el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();callback(value);}});
}
function niceDomain(values,includeZero=true){
  const valid=values.filter(finite).map(Number);if(includeZero)valid.push(0);
  if(!valid.length)return [0,1];
  let lo=Math.min(...valid),hi=Math.max(...valid);if(lo===hi){if(lo===0)hi=1;else{lo-=Math.abs(lo)*.1;hi+=Math.abs(hi)*.1;}}
  const span=hi-lo,raw=span/4,pow=Math.pow(10,Math.floor(Math.log10(raw))),fraction=raw/pow;
  const step=(fraction<=1?1:fraction<=2?2:fraction<=5?5:10)*pow;
  lo=Math.floor(lo/step)*step;hi=Math.ceil(hi/step)*step;if(lo===hi)hi=lo+step;
  return [lo,hi];
}
function linePath(points){let result='',drawing=false;for(const p of points){if(!p){drawing=false;continue;}result+=(drawing?' L ':' M ')+p[0].toFixed(2)+' '+p[1].toFixed(2);drawing=true;}return result.trim();}
function grid(s,w,h,domain,box,format=wan){
  const {left,right,top,bottom}=box,[lo,hi]=domain,y=v=>h-bottom-(v-lo)/(hi-lo)*(h-top-bottom);
  for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,py=y(v);add(s,'line',{x1:left,x2:w-right,y1:py,y2:py,stroke:C.line,'stroke-width':1});text(s,left-8,py+4,format(v),{'text-anchor':'end'});}
  if(lo<0&&hi>0)add(s,'line',{x1:left,x2:w-right,y1:y(0),y2:y(0),stroke:'#afbdaf','stroke-width':1});
  return y;
}
function monthly(container,rows,onMonth){
  rows=Array.isArray(rows)?rows:[];
  const {s,w,h}=svg(container,304,rows.length?'月度收付款及可用的净利润率':'暂无月度收付款数据');
  if(!rows.length){text(s,w/2,140,'暂无月度数据',{'text-anchor':'middle'});return s;}
  const hasMargin=rows.some(r=>finite(r.netMargin)),box={left:54,right:hasMargin?50:14,top:38,bottom:40};
  const amounts=rows.flatMap(r=>[r.opIn,r.opOut]),y=grid(s,w,h,niceDomain(amounts),box);
  const plot=w-box.left-box.right,step=plot/rows.length,x=i=>box.left+step*(i+.5),bw=Math.min(19,step*.23),gap=Math.min(7,step*.07);
  const amountLayer=add(s,'g',{'data-chart-labels':'amount',visibility:'hidden','pointer-events':'none'}),rateLayer=add(s,'g',{'data-chart-labels':'margin',visibility:'hidden','pointer-events':'none'}),amountLabels=[];
  const show=kind=>{amountLayer.setAttribute('visibility',kind==='amount'?'visible':'hidden');rateLayer.setAttribute('visibility',kind==='margin'?'visible':'hidden');};
  s.addEventListener('mouseleave',()=>show(null));s.addEventListener('focusout',event=>{if(!event.relatedTarget||!s.contains(event.relatedTarget))show(null);});
  const labelEvery=Math.max(1,Math.ceil(rows.length/(w<420?4:w<650?6:12)));
  rows.forEach((r,i)=>{
    const group=add(s,'g',{'data-month':r.month});
    for(const [key,offset,color] of [['opIn',-bw-gap/2,C.green],['opOut',gap/2,C.purple]]){
      if(!finite(r[key]))continue;const value=Number(r[key]),py=y(value),zero=y(0);
      const bar=add(group,'rect',{x:x(i)+offset,y:Math.min(py,zero),width:bw,height:Math.max(1,Math.abs(zero-py)),rx:2,fill:color});
      tip(bar,`${month(r.month)} ${key==='opIn'?'收款':'付款'} ${money(value)}`);
      bar.addEventListener('mouseenter',()=>show('amount'));bar.addEventListener('focus',()=>show('amount'));
      clickable(bar,onMonth,r,`${month(r.month)} ${key==='opIn'?'收款':'付款'} ${money(value)}，查看当月明细`);
      const labelY=value>=0?py-7:py+15;
      // Stagger paired labels when the bars are close so the two values remain distinct.
      const near=finite(r.opIn)&&finite(r.opOut)&&Math.abs(y(Number(r.opIn))-y(Number(r.opOut)))<17;
      amountLabels.push({x:x(i)+offset+bw/2,y:Math.max(24,Math.min(h-20,labelY+(near&&key==='opOut'?-15:0))),anchorY:py,content:wan(value),color});
    }
    if(i%labelEvery===0||i===rows.length-1)text(s,x(i),h-15,shortMonth(r.month),{'text-anchor':'middle'});
  });
  const placedLabels=[];
  amountLabels.sort((a,b)=>a.y-b.y||a.x-b.x).forEach(label=>{
    const width=Array.from(label.content).length*6.3+8,height=16;
    let center=Math.max(box.left+width/2,Math.min(w-box.right-width/2,label.x)),chosen;
    for(let distance=0;distance<24&&!chosen;distance++)for(const direction of distance?[1,-1]:[1]){
      const baseline=label.y+distance*18*direction;if(baseline<22||baseline>h-box.bottom-6)continue;
      const candidate={x:center-width/2,y:baseline-12,width,height,baseline};
      if(!placedLabels.some(p=>candidate.x<p.x+p.width+3&&candidate.x+candidate.width+3>p.x&&candidate.y<p.y+p.height+2&&candidate.y+candidate.height+2>p.y)){chosen=candidate;break;}
    }
    if(!chosen)chosen={x:center-width/2,y:label.y-12,width,height,baseline:label.y};
    placedLabels.push(chosen);
    if(Math.abs(chosen.baseline-label.y)>2)add(amountLayer,'line',{x1:label.x,y1:label.anchorY,x2:center,y2:chosen.baseline,stroke:label.color,'stroke-width':.65,opacity:.6});
    add(amountLayer,'rect',{x:chosen.x,y:chosen.y,width,height,rx:3,fill:'#fff',opacity:.94});
    text(amountLayer,center,chosen.baseline,label.content,{'text-anchor':'middle',fill:label.color,'font-size':11});
  });
  if(hasMargin){
    const [lo,hi]=niceDomain(rows.map(r=>r.netMargin)),yr=v=>h-box.bottom-(v-lo)/(hi-lo)*(h-box.top-box.bottom),points=rows.map((r,i)=>finite(r.netMargin)?[x(i),yr(Number(r.netMargin))]:null);
    const line=add(s,'path',{d:linePath(points),fill:'none',stroke:C.blue,'stroke-width':2.6,'stroke-linejoin':'round'});line.addEventListener('mouseenter',()=>show('margin'));
    for(let i=0;i<=2;i++){const value=lo+(hi-lo)*i/2;text(s,w-box.right+8,yr(value)+4,percent(value));}
    rows.forEach((r,i)=>{if(!finite(r.netMargin))return;const value=Number(r.netMargin),py=yr(value);
      const hit=add(s,'circle',{cx:x(i),cy:py,r:12,fill:'transparent'});add(s,'circle',{cx:x(i),cy:py,r:4,fill:C.blue,'pointer-events':'none'});
      tip(hit,`${month(r.month)} 净利润率 ${percent(value)}`);clickable(hit,onMonth,r,`${month(r.month)} 净利润率 ${percent(value)}，查看当月明细`);
      hit.addEventListener('mouseenter',()=>show('margin'));hit.addEventListener('focus',()=>show('margin'));
      const label=add(rateLayer,'g',{}),labelY=Math.max(20,py-18);add(label,'rect',{x:x(i)-25,y:labelY-12,width:50,height:20,rx:4,fill:'#fff',stroke:'#dce6eb','stroke-width':.6});text(label,x(i),labelY+2,percent(value),{'text-anchor':'middle',fill:C.blue,'font-size':11});
    });
    text(s,w-box.right,17,'净利润率',{'text-anchor':'end'});
  }
  text(s,box.left,17,'万元');s.appendChild(amountLayer);s.appendChild(rateLayer);
  s.setAttribute('aria-label',`共 ${rows.length} 个月。收款 ${money(rows.reduce((sum,r)=>sum+number(r.opIn),0))}，付款 ${money(rows.reduce((sum,r)=>sum+number(r.opOut),0))}。${hasMargin?'含已有账务的净利润率。':'未提供净利润率。'}点击柱子查看对应月份的原始明细。`);
  return s;
}
function polar(cx,cy,r,a){return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];}
function ringPath(cx,cy,r,inner,a,b){b=Math.min(b,a+Math.PI*2-.00001);const p=polar(cx,cy,r,a),q=polar(cx,cy,r,b),u=polar(cx,cy,inner,b),v=polar(cx,cy,inner,a),large=b-a>Math.PI?1:0;return `M ${p} A ${r} ${r} 0 ${large} 1 ${q} L ${u} A ${inner} ${inner} 0 ${large} 0 ${v} Z`;}
function splitLabel(value,max=10){const chars=Array.from(String(value));return chars.length>max?[chars.slice(0,max).join(''),chars.slice(max,max*2-1).join('')+(chars.length>max*2-1?'…':'')]:[String(value)];}
// Measure the same font used by SVG labels; the conservative fallback also
// works while a report is hidden and in environments without a canvas.
let donutMeasureContext;
function donutTextWidth(value,size=12){
  if(donutMeasureContext===undefined){try{donutMeasureContext=document.createElement('canvas').getContext?.('2d')||null;}catch{donutMeasureContext=null;}}
  if(donutMeasureContext){donutMeasureContext.font=`${size}px Arial, "PingFang SC", "Microsoft YaHei", sans-serif`;return donutMeasureContext.measureText(String(value)).width+1;}
  return Array.from(String(value)).reduce((n,c)=>n+(c.charCodeAt(0)>255?1.08:/[MW@%]/.test(c)?.95:/[il.,' :]/.test(c)?.35:.67)*size,0);
}
function donutLines(value,width,size=12,maxLines=Infinity){
  const chars=Array.from(String(value)),lines=[];let line='';
  for(const char of chars){if(line&&donutTextWidth(line+char,size)>width){lines.push(line);line='';}line+=char;}
  if(line||!lines.length)lines.push(line);
  if(lines.length<=maxLines)return lines;
  const shortened=lines.slice(0,maxLines);let tail=shortened.at(-1);
  while(tail&&donutTextWidth(tail+'…',size)>width)tail=Array.from(tail).slice(0,-1).join('');
  shortened[shortened.length-1]=tail+'…';return shortened;
}
function donut(container,parts,selected,onSelect,options={}){
  const markPart=(element,part)=>{element.setAttribute('data-chart-part',String(part.key??part.id??''));element.setAttribute('data-chart-kind',container.dataset?.kind||'income');};
  parts=(Array.isArray(parts)?parts:[]).filter(p=>finite(p.amount)&&Number(p.amount)!==0);
  const measured=container.getBoundingClientRect?.().width||container.clientWidth||520,w=Math.max(180,Math.round(measured));
  const cost=container.dataset?.kind==='cost',colors=cost?['#817a9d','#a39dbf','#bbb6d0','#ccc8da','#9089ad','#d8d4e2']:['#54876b','#7fa58b','#a6c0a6','#bfcead','#72978b','#d1dcc5'];
  const signed=parts.some(p=>Number(p.amount)<0),total=parts.reduce((n,p)=>n+Number(p.amount),0),dense=parts.length>8;
  const key=(p,i)=>p.key??p.id??String(i);
  if(selected===undefined)selected=parts.length?key(parts[0],0):null;
  let angle=-Math.PI/2;
  const data=parts.map((p,index)=>{const span=signed?0:Number(p.amount)/total*Math.PI*2,result={...p,key:key(p,index),source:p,index,start:angle,end:angle+span,mid:angle+span/2,color:colors[index%colors.length]};angle+=span;return result;});
  const select=onSelect?p=>onSelect(p.source):null;
  const pad=12,gutter=18,minRadius=88;
  const maxColumn=(w-2*pad-2*gutter-2*minRadius)/2;
  const desiredColumn=Math.max(100,...data.map(p=>Math.max(donutTextWidth(money(p.amount)+' · '+percent(p.amount/total),11)+12,Math.min(160,donutTextWidth(p.name,12)/2+12))));
  const labelWidth=Math.min(168,Math.floor(maxColumn),Math.ceil(desiredColumn));
  const labelInfo=data.map(p=>({...p,lines:donutLines(p.name,Math.max(1,labelWidth-12)),values:money(p.amount)+' · '+percent(p.amount/total)}));
  const callouts=!signed&&!dense&&w>=440&&labelWidth>=100&&labelInfo.every(p=>p.lines.length<=3&&donutTextWidth(p.values,11)<=labelWidth-12);
  const r=callouts?Math.min(110,(w-2*pad-2*gutter-2*labelWidth)/2):Math.min(96,(w-24)/2),inner=r*.72;
  const sides=[-1,1].map(side=>labelInfo.filter(p=>(Math.cos(p.mid)<0?-1:1)===side).sort((a,b)=>Math.sin(a.mid)-Math.sin(b.mid)));
  labelInfo.forEach(p=>p.labelHeight=Math.max(44,p.lines.length*15+23));
  const stackHeight=rows=>rows.reduce((n,p)=>n+p.labelHeight,0)+Math.max(0,rows.length-1)*8;
  const h=signed?48:callouts?Math.max(300,...sides.map(rows=>stackHeight(rows)+2*pad)):Math.max(242,2*r+42);
  container.replaceChildren();
  const s=add(container,'svg',{viewBox:`0 0 ${w} ${h}`,width:'100%',height:h,role:'img','data-donut-layout':signed?'signed-list':callouts?'callouts':'list','aria-label':'收入或成本构成',style:'display:block;overflow:hidden'});
  if(!data.length){text(s,w/2,Math.min(h/2,120),'暂无构成数据',{'text-anchor':'middle'});return s;}
  const cx=w/2,cy=h/2;
  if(signed){text(s,12,28,'含负向调整 · 按金额展示',{fill:C.ink});}
  else{
    data.forEach(p=>{
      if(p.key===selected)add(s,'path',{d:ringPath(cx,cy,r+7,r+3,p.start,p.end),fill:p.color,opacity:.3,'pointer-events':'none'});
      const shape=add(s,'path',{d:ringPath(cx,cy,r,inner,p.start,p.end),fill:p.color,stroke:'#fff','stroke-width':2,'aria-pressed':String(p.key===selected)});
      const label=`${p.name}，${money(p.amount)}，占比 ${percent(p.amount/total)}`;tip(shape,label);markPart(shape,p);
      if(dense&&select){shape.setAttribute('class','cursor-interaction');shape.setAttribute('aria-label',label);shape.addEventListener('click',()=>select(p));}
      else clickable(shape,select,p,label);
    });
    const active=data.find(p=>p.key===selected),name=active?.name||options.label||'本项合计',amount=money(active?.amount??total),rate=active?percent(active.amount/total):'100%';
    // An inscribed square leaves every center line clear of the inner arc,
    // including the currency row at its widest and longest possible value.
    const box=inner*Math.SQRT2*.96,nameSize=11.5,amountSize=11,rateSize=Math.min(27,box/donutTextWidth(rate,27)*27);
    const names=donutLines(name,box,nameSize,2),amountLines=donutLines(amount,box,amountSize),nameHeight=names.length*14,amountHeight=amountLines.length*13;
    const contentHeight=nameHeight+5+rateSize+5+amountHeight,scale=Math.min(1,box/contentHeight),top=cy-contentHeight*scale/2;
    const center=add(s,'g',{'data-donut-center':'true','data-center-x':cx-box/2,'data-center-y':cy-box/2,'data-center-size':box,'aria-label':`${name}，${rate}，${amount}`});tip(center,`${name} ${amount} · ${rate}`);
    let baseline=top+11.5*scale;
    names.forEach(line=>{text(center,cx,baseline,line,{'text-anchor':'middle',fill:C.ink,'font-size':nameSize*scale,'data-center-line':'name'});baseline+=14*scale;});
    baseline=top+(nameHeight+5+rateSize*.82)*scale;
    text(center,cx,baseline,rate,{'text-anchor':'middle',fill:C.ink,'font-size':rateSize*scale,'font-weight':500,'data-center-line':'percent'});
    baseline=top+(nameHeight+5+rateSize+5+10.5)*scale;
    amountLines.forEach(line=>{text(center,cx,baseline,line,{'text-anchor':'middle',fill:C.muted,'font-size':amountSize*scale,'data-center-line':'amount'});baseline+=13*scale;});
  }
  if(callouts){
    const leaders=add(s,'g',{'pointer-events':'none'});
    for(const rows of sides){
      if(!rows.length)continue;const side=Math.cos(rows[0].mid)<0?-1:1;
      let positions=rows.map(p=>cy+Math.sin(p.mid)*(r+24)-p.labelHeight/2);
      positions[0]=Math.max(pad,positions[0]);
      for(let i=1;i<rows.length;i++)positions[i]=Math.max(positions[i],positions[i-1]+rows[i-1].labelHeight+8);
      positions[positions.length-1]=Math.min(positions.at(-1),h-pad-rows.at(-1).labelHeight);
      for(let i=rows.length-2;i>=0;i--)positions[i]=Math.min(positions[i],positions[i+1]-rows[i].labelHeight-8);
      rows.forEach((p,index)=>{
        const x=side<0?pad:w-pad-labelWidth,y=positions[index],start=polar(cx,cy,r+3,p.mid),edge=side<0?x+labelWidth:x,elbow=cx+side*(r+10),targetY=y+p.labelHeight/2;
        add(leaders,'path',{d:`M ${start} L ${elbow} ${targetY} L ${edge} ${targetY}`,fill:'none',stroke:'#aebdb1','stroke-width':.8});
        const group=add(s,'g',{'data-donut-label':p.key,'data-label-x':x,'data-label-y':y,'data-label-width':labelWidth,'data-label-height':p.labelHeight,'aria-pressed':String(p.key===selected)});
        add(group,'rect',{x,y,width:labelWidth,height:p.labelHeight,rx:5,fill:p.key===selected?(cost?'#f0edf5':'#edf3ea'):'#fff','fill-opacity':p.key===selected?1:.94});
        const tx=side<0?x+6:x+labelWidth-6,anchor=side<0?'start':'end';
        p.lines.forEach((line,i)=>text(group,tx,y+14+i*15,line,{'text-anchor':anchor,fill:C.ink,'font-size':12}));
        text(group,tx,y+p.lines.length*15+14,p.values,{'text-anchor':anchor,'font-size':11});
        const label=`${p.name} ${money(p.amount)} ${percent(p.amount/total)}`;tip(group,label);markPart(group,p);clickable(group,select,p,label);
      });
    }
  }
  // Keep the same readable, clickable composition below every ring. Callouts
  // supplement this list on wide charts; they must not replace it after resize.
  {
    function html(tag,attrs,content){const element=document.createElement(tag);for(const [k,v]of Object.entries(attrs||{}))element.setAttribute(k,v);if(content!==undefined)element.textContent=content;return element;}
    const legend=html('div',{class:'rt-composition-pages'+(dense?' rt-composition-paginated':'')}),screen=html('div',{class:'rt-composition-screen'}),list=html('div',{class:'rt-composition-list'}),footer=html('div',{class:'rt-composition-footer'});
    legend.appendChild(screen);screen.appendChild(list);screen.appendChild(footer);container.appendChild(legend);
    const stacked=w<360||data.some(p=>donutTextWidth(money(p.amount)+(signed?'':' · '+percent(p.amount/total)),12)>w*.52);
    function legendRow(p,interactive=true){
      const label=`${p.name}，${money(p.amount)}${signed?'':'，占比 '+percent(p.amount/total)}`;
      const row=html(interactive?'button':'div',{...(interactive?{type:'button','aria-pressed':String(p.key===selected)}:{}),class:'rt-composition-item'+(stacked?' rt-composition-stacked':''),'aria-label':label});
      const name=html('span',{class:'rt-composition-name'}),swatch=html('span',{'aria-hidden':'true',class:'rt-composition-swatch',style:'background:'+p.color});
      name.appendChild(swatch);name.appendChild(html('span',{},p.name));row.appendChild(name);
      const values=html('span',{class:'rt-composition-values'});values.appendChild(html('span',{class:'rt-composition-money'},money(p.amount)));if(!signed)values.appendChild(html('span',{class:'rt-composition-share'},percent(p.amount/total)));row.appendChild(values);
      if(interactive){markPart(row,p);clickable(row,select,p,label);}return row;
    }
    const pageSize=dense?6:data.length,totalPages=Math.ceil(data.length/pageSize);let page=Math.floor(Math.max(0,data.findIndex(p=>p.key===selected))/pageSize);
    function drawPage(){
      list.replaceChildren();footer.replaceChildren();data.slice(page*pageSize,(page+1)*pageSize).forEach(p=>list.appendChild(legendRow(p)));
      if(totalPages<2)return;
      footer.appendChild(html('span',{},`第 ${page+1} / ${totalPages} 页 · 共 ${data.length} 项`));const actions=html('span',{class:'rt-composition-page-actions'});
      for(const [label,step]of [['上一页',-1],['下一页',1]]){const button=html('button',{type:'button',class:'rt-button'},label);button.disabled=page+step<0||page+step>=totalPages;button.addEventListener('click',()=>{page+=step;drawPage();});actions.appendChild(button);}footer.appendChild(actions);
    }
    drawPage();
    if(dense){const print=html('div',{class:'rt-composition-print',style:'display:none'});data.forEach(p=>print.appendChild(legendRow(p,false)));legend.appendChild(print);}
  }
  s.setAttribute('aria-label',`总额 ${money(total)}。`+parts.map(p=>`${p.name} ${money(p.amount)}${signed?'':' 占比 '+percent(p.amount/total)}`).join('；'));
  return s;
}
function forecast(container,history,prediction,safety,onPoint,options={}){
  history=Array.isArray(history)?history:[];prediction=Array.isArray(prediction)?prediction:[];
  if(history.length&&prediction[0]?.month===history.at(-1)?.month)prediction=prediction.slice(1);
  const valueLabel=options.valueLabel||'账上现金',rows=history.concat(prediction),{s,w,h}=svg(container,310,options.relative?'未来现金累计增减试算':'现金历史和未来预测');
  if(!rows.some(r=>finite(r.value))){text(s,w/2,145,'缺少可绘制的现金余额',{'text-anchor':'middle'});return s;}
  const scaleValues=rows.map(r=>r.value).concat(options.rangeValues||[]),fullDomain=niceDomain(scaleValues.concat(finite(safety)?[Number(safety)]:[])),focusedDomain=niceDomain(scaleValues,false);
  const focused=focusedDomain[0]>0&&(fullDomain[1]-fullDomain[0])>(focusedDomain[1]-focusedDomain[0])*1.65,domain=focused?focusedDomain:fullDomain;
  const box={left:58,right:24,top:38,bottom:focused?58:40},y=grid(s,w,h,domain,box),x=i=>box.left+i*(w-box.left-box.right)/Math.max(1,rows.length-1);
  s.setAttribute('data-forecast-scale',focused?'focused':'full');s.setAttribute('data-forecast-min',domain[0]);s.setAttribute('data-forecast-max',domain[1]);
  const boundary=history.length?x(history.length-1):box.left;
  if(prediction.length){add(s,'rect',{x:boundary,y:box.top,width:w-box.right-boundary,height:h-box.top-box.bottom,fill:'#f4f7f2',opacity:.65});add(s,'line',{x1:boundary,x2:boundary,y1:box.top,y2:h-box.bottom,stroke:'#c9d5cb','stroke-dasharray':'3 4'});text(s,boundary+(w-box.right-boundary)/2,19,'预测区间',{'text-anchor':'middle'});}
  const makePoints=(data,start)=>data.map((r,i)=>finite(r.value)?[x(start+i),y(Number(r.value))]:null);
  add(s,'path',{d:linePath(makePoints(history,0)),fill:'none',stroke:C.blue,'stroke-width':2.4,'stroke-linejoin':'round'});
  const futureStart=history.length?[history.at(-1),...prediction]:prediction;
  add(s,'path',{d:linePath(makePoints(futureStart,Math.max(0,history.length-1))),fill:'none',stroke:C.forecast,'stroke-width':2.3,'stroke-dasharray':'5 5','stroke-linejoin':'round'});
  rows.forEach((r,i)=>{if(!finite(r.value))return;const predicted=i>=history.length,color=predicted?C.forecast:C.blue;
    const dot=add(s,'circle',{cx:x(i),cy:y(Number(r.value)),r:3.4,fill:color}),hit=add(s,'circle',{cx:x(i),cy:y(Number(r.value)),r:11,fill:'transparent'});
    const label=`${r.date||month(r.month)} ${valueLabel}（${predicted?'推演':r.estimated?'历史 · 推算':'历史'}）${money(r.value)}${!predicted&&r.note?' · '+r.note:''}`;
    tip(hit,label);dot.setAttribute('pointer-events','none');hit.setAttribute('data-forecast-kind',predicted?'prediction':'history');if(!predicted)hit.setAttribute('data-balance-estimated',r.estimated?'true':'false');
    clickable(hit,onPoint,{...r,kind:predicted?'prediction':'history',index:predicted?i-history.length:i},label+'，查看明细');
  });
  if(finite(safety)){
    const offScale=Number(safety)<domain[0]||Number(safety)>domain[1];
    if(offScale)text(s,box.left,h-5,'安全线 '+wan(Number(safety))+'万 · '+(Number(safety)<domain[0]?'低于':'高于')+'图示范围',{fill:C.green,'font-size':11,'data-forecast-safety':'outside'});
    else{add(s,'line',{x1:box.left,x2:w-box.right,y1:y(Number(safety)),y2:y(Number(safety)),stroke:C.green,'stroke-width':1.2,'stroke-dasharray':'2 4'});text(s,box.left+4,Math.max(16,y(Number(safety))-7),'安全线 '+wan(Number(safety))+'万',{fill:C.green,'font-size':11});}
  }
  const last=prediction.at(-1);if(last&&finite(last.value))text(s,w-box.right,Math.max(box.top+14,Math.min(h-box.bottom-8,y(Number(last.value))-12)),money(last.value),{'text-anchor':'end',fill:C.forecast,'font-size':12,'font-weight':600,'data-forecast-ending':last.value});
  const step=Math.max(1,Math.ceil(rows.length/(w<450?4:7)));rows.forEach((r,i)=>{if(i%step===0||i===rows.length-1)text(s,x(i),h-(focused?29:15),r.opening?'期初':shortMonth(r.month),{'text-anchor':i===0?'start':i===rows.length-1?'end':'middle'});});
  text(s,box.left,18,'万元');
  s.setAttribute('aria-label',rows.map((r,i)=>`${r.date||month(r.month)} ${i<history.length?(r.estimated?'历史推算':'历史'):'预测'}${valueLabel} ${finite(r.value)?money(r.value):'待补充'}`).join('；'));
  return s;
}
function receivables(container,rows,onGroup,options={}){
  rows=Array.isArray(rows)?rows:[];
  const grouped=new Map();
  for(const row of rows){
    const raw=String(row.invoiceDate||''),key=/^\d{4}-(0[1-9]|1[0-2])(?:-|$)/.test(raw)?raw.slice(0,7):'未提供开票日期';
    if(!grouped.has(key))grouped.set(key,{month:key,rows:[],received:0,pending:0,late:0});
    const group=grouped.get(key);group.rows.push(row);group.received+=number(row.received);
    group[row.overdue?'late':'pending']+=number(row.outstanding);
  }
  const groups=Array.from(grouped.values()).sort((a,b)=>a.month==='未提供开票日期'?1:b.month==='未提供开票日期'?-1:a.month.localeCompare(b.month));
  const {s,w,h}=svg(container,292,'按'+(options.groupLabel||'开票日期')+'月份分组的已收、未到期和逾期金额');
  if(!groups.length){text(s,w/2,145,'尚未提供应收台账',{'text-anchor':'middle'});return s;}
  const colors={received:C.green,pending:'#bb914d',late:'#be6960'},names={received:'已收',pending:'未到期',late:'逾期'};
  ['received','pending','late'].forEach((key,index)=>{add(s,'rect',{x:12+index*82,y:8,width:8,height:8,rx:1,fill:colors[key]});text(s,25+index*82,16,names[key],{'font-size':11});});
  const box={left:54,right:18,top:45,bottom:46};
  const bounds=groups.flatMap(g=>{const amounts=[g.received,g.pending,g.late];return[amounts.filter(n=>n>0).reduce((sum,n)=>sum+n,0),amounts.filter(n=>n<0).reduce((sum,n)=>sum+n,0)];});
  const y=grid(s,w,h,niceDomain(bounds),box),step=(w-box.left-box.right)/groups.length,bw=Math.min(34,step*.58),x=i=>box.left+step*(i+.5),every=Math.max(1,Math.ceil(groups.length/(w<420?4:w<650?6:12)));
  groups.forEach((g,index)=>{
    const group=add(s,'g',{'data-invoice-month':g.month}),total=g.received+g.pending+g.late;let positive=0,negative=0;
    for(const key of ['received','pending','late']){
      const value=g[key],start=value>=0?positive:negative,end=start+value;
      if(value>=0)positive=end;else negative=end;
      if(value===0)continue;
      const rect=add(group,'rect',{x:x(index)-bw/2,y:Math.min(y(start),y(end)),width:bw,height:Math.max(1,Math.abs(y(end)-y(start))),fill:colors[key]});
      tip(rect,`${g.month} ${names[key]} ${money(value)}`);
      if(key==='received'&&total>0&&value>=0&&Math.abs(y(end)-y(start))>=24&&bw>=32)text(group,x(index),(y(start)+y(end))/2+4,percent(value/total),{'text-anchor':'middle',fill:C.ink,'font-size':11});
    }
    clickable(group,onGroup,g,`${g.month}，已收 ${money(g.received)}，未到期 ${money(g.pending)}，逾期 ${money(g.late)}，查看原始应收明细`);
    if(index%every===0||index===groups.length-1){
      if(g.month==='未提供开票日期'){text(s,x(index),h-25,'未提供',{'text-anchor':'middle','font-size':11});text(s,x(index),h-11,'开票日期',{'text-anchor':'middle','font-size':11});}
      else text(s,x(index),h-18,shortMonth(g.month),{'text-anchor':'middle'});
    }
  });
  text(s,box.left,34,'万元');
  s.setAttribute('aria-label',groups.map(g=>`${g.month}：已收 ${money(g.received)}，未到期 ${money(g.pending)}，逾期 ${money(g.late)}`).join('；'));
  return s;
}
function allocation(container,incomeGroups,costGroups,onSelect,options={}){
  const labels={surplus:options.surplusLabel||'经营结余',shortfall:options.shortfallLabel||'现金缺口',income:options.incomeLabel||'收款',cost:options.costLabel||options.expenseLabel||'付款'};
  const income=(incomeGroups||[]).filter(r=>finite(r.amount)&&Number(r.amount)!==0).map(r=>({...r,kind:'income',amount:Number(r.amount)}));
  const costs=(costGroups||[]).filter(r=>finite(r.amount)&&Number(r.amount)!==0).map(r=>({...r,kind:'cost',amount:Number(r.amount)}));
  const inTotal=income.reduce((sum,r)=>sum+r.amount,0),outTotal=costs.reduce((sum,r)=>sum+r.amount,0),net=inTotal-outTotal;
  let left=[],right=[];
  income.forEach(r=>(r.amount>0?left:right).push(r.amount>0?r:{...r,name:'收入冲减 · '+r.name,rawAmount:r.amount,amount:-r.amount}));
  costs.forEach(r=>(r.amount>0?right:left).push(r.amount>0?r:{...r,name:'支出冲回 · '+r.name,rawAmount:r.amount,amount:-r.amount}));
  if(net>=0)right.push({key:'surplus',kind:'surplus',name:labels.surplus,amount:net});else left.push({key:'shortfall',kind:'shortfall',name:labels.shortfall,amount:-net});
  left=left.filter(r=>r.amount>0);right=right.filter(r=>r.amount>0);
  const groupSide=(rows,side)=>{
    const special=rows.filter(r=>r.kind==='surplus'||r.kind==='shortfall'),regular=rows.filter(r=>r.kind!=='surplus'&&r.kind!=='shortfall').sort((a,b)=>b.amount-a.amount);
    if(regular.length<=8)return regular.concat(special);
    const members=regular.slice(7),aggregate={key:'__chart-other-'+side,kind:side,name:(side==='income'?'其他来源':'其他支出')+'（'+members.length+'项）',amount:Math.round(members.reduce((sum,r)=>sum+r.amount,0)*100)/100,members,transactions:members.flatMap(r=>Array.isArray(r.transactions)?r.transactions:[])};
    return regular.slice(0,7).concat(aggregate,special);
  };
  left=groupSide(left,'income');right=groupSide(right,'cost');
  const total=left.reduce((sum,r)=>sum+r.amount,0),cw=container.getBoundingClientRect?.().width||container.clientWidth||800;
  const compact=cw<560,count=Math.max(left.length,right.length,1),height=compact?130+(left.length+right.length)*46:Math.max(340,count*40+140),{s,w,h}=svg(container,height,'收入到支出及现金结余的资金流向');
  if(!total){text(s,w/2,150,'暂无现金收支数据',{'text-anchor':'middle'});return s;}
  const color=r=>r.kind==='shortfall'?C.red:r.kind==='surplus'?C.green:r.kind==='income'?C.green:C.purple;
  if(compact){
    let y=28;
    for(const [title,list] of [['资金来源',left],['资金去向',right]]){
      text(s,12,y,title,{fill:C.ink,'font-size':13});y+=26;
      list.forEach(r=>{const g=add(s,'g',{});text(g,12,y,r.name,{fill:C.ink});text(g,w-12,y,money(r.amount),{'text-anchor':'end'});add(g,'rect',{x:12,y:y+8,width:w-24,height:5,rx:2,fill:'#eef2eb'});add(g,'rect',{x:12,y:y+8,width:(w-24)*r.amount/total,height:5,rx:2,fill:color(r)});clickable(g,onSelect,r,`${r.name} ${money(r.amount)}`);y+=46;});y+=15;
    }
    s.setAttribute('height',y+5);s.setAttribute('viewBox',`0 0 ${w} ${y+5}`);
  }else{
    const xL=132,xR=w-132,xC=w/2,nodeW=8,gap=32,flowHeight=h-55-(count-1)*gap,centerY=(h-flowHeight)/2,scale=flowHeight/total;
    const arrange=list=>{let value=0;return list.map((r,i)=>{const item={...r,y:27+value*scale+i*gap,height:r.amount*scale,center:centerY+value*scale};value+=r.amount;return item;});};
    const lhs=arrange(left),rhs=arrange(right);
    lhs.forEach(r=>{const end=r.center+r.height,d=`M ${xL+nodeW} ${r.y} C ${xC-65} ${r.y} ${xC-65} ${r.center} ${xC} ${r.center} L ${xC} ${end} C ${xC-65} ${end} ${xC-65} ${r.y+r.height} ${xL+nodeW} ${r.y+r.height} Z`;const p=add(s,'path',{d,fill:color(r),opacity:.23});tip(p,r.name+' '+money(r.amount));clickable(p,onSelect,r,r.name+' '+money(r.amount));});
    rhs.forEach(r=>{const end=r.center+r.height,d=`M ${xC+nodeW} ${r.center} C ${xC+65} ${r.center} ${xC+65} ${r.y} ${xR} ${r.y} L ${xR} ${r.y+r.height} C ${xC+65} ${r.y+r.height} ${xC+65} ${end} ${xC+nodeW} ${end} Z`;const p=add(s,'path',{d,fill:color(r),opacity:.25});tip(p,r.name+' '+money(r.amount));clickable(p,onSelect,r,r.name+' '+money(r.amount));});
    add(s,'rect',{x:xC,y:centerY,width:nodeW,height:flowHeight,rx:3,fill:C.blue});
    for(const [list,x,side] of [[lhs,xL,-1],[rhs,xR,1]])list.forEach(r=>{
      const g=add(s,'g',{});add(g,'rect',{x,y:r.y,width:nodeW,height:Math.max(1,r.height),rx:2,fill:color(r)});
      const tx=side<0?x-9:x+nodeW+9,anchor=side<0?'end':'start',mid=r.y+r.height/2,label=splitLabel(r.name,9)[0];
      text(g,tx,mid-3,label,{'text-anchor':anchor,fill:C.ink,'font-size':12});text(g,tx,mid+14,`${money(r.amount)} · ${percent(r.amount/total)}`,{'text-anchor':anchor,'font-size':11});tip(g,r.name+' '+money(r.amount));clickable(g,onSelect,r,r.name+' '+money(r.amount));
    });
  }
  s.setAttribute('aria-label',`${labels.income} ${money(inTotal)}，${labels.cost} ${money(outTotal)}，${net>=0?labels.surplus:labels.shortfall} ${money(Math.abs(net))}。`);
  return s;
}
global.YoushuTemplateCharts={monthly,donut,forecast,receivables,allocation};
})(globalThis);
