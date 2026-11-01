/* Shared operating-cash flow layout for all normalized import formats. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.YoushuAllocation=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const cents=value=>Math.round(value*100);
  function group(rows,type){
    const entries=rows.filter(row=>row.amount>0).map(row=>({type,name:row.name,amount:row.amount,names:[row.name]}));
    if(entries.length<=9)return entries;
    const head=entries.slice(0,8),tail=entries.slice(8);
    if(tail.length)head.push({type,name:type==='income'?'其他收入':'其他支出',amount:tail.reduce((total,row)=>total+cents(row.amount),0)/100,names:tail.map(row=>row.name)});
    return head;
  }
  function build(report){
    const income=cents(report.totals.opIn)/100,outflow=cents(report.totals.opOut)/100;
    const net=(cents(income)-cents(outflow))/100,gap=Math.max(0,-net),total=Math.max(income,outflow);
    const sources=group(report.incomeGroups,'income'),targets=group(report.costGroups,'cost');
    // A calculated shortfall balances the drawing; it is never business income.
    if(gap>0)sources.push({type:'gap',name:'经营现金缺口',amount:gap,names:[]});
    if(net>0)targets.push({type:'surplus',name:'经营现金结余',amount:net,names:[]});
    const scale=total>0?240/total:0,minSlot=32,nodeGap=16,top=70;
    const span=rows=>rows.reduce((height,row)=>height+Math.max(minSlot,row.amount*scale),0)+Math.max(0,rows.length-1)*nodeGap;
    const contentHeight=total>0?Math.max(240,span(sources),span(targets)):0;
    const hubHeight=total*scale,hubY=top+(contentHeight-hubHeight)/2;
    function place(rows){
      let y=top+(contentHeight-span(rows))/2,offsetCents=0;
      return rows.map(row=>{
        const height=row.amount*scale,slotHeight=Math.max(minSlot,height);
        const node={...row,y:y+(slotHeight-height)/2,height,hubY:hubY+offsetCents/100*scale};
        y+=slotHeight+nodeGap;offsetCents+=cents(row.amount);
        return node;
      });
    }
    return {sources:place(sources),targets:place(targets),total,income,outflow,net,gap,
      layout:{width:1120,height:top+contentHeight+30,hubY,hubHeight,scale,leftX:190,hubX:555,rightX:920,nodeWidth:10}};
  }
  return {build};
});
