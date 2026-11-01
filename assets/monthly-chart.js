/* Shared, local-only interaction for the demo and imported monthly charts.
 * Chart renderers own data, scales and drill-down. This module owns label
 * visibility and preserves the selected series while a pointer crosses gaps. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.YoushuMonthly=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const bindings=new WeakMap(),modalities=new WeakMap();
  function modalityFor(doc){
    if(!doc||typeof doc.addEventListener!=='function')return null;
    let state=modalities.get(doc);if(state)return state;
    state={mode:'keyboard'};modalities.set(doc,state);
    // One document-level modality tracker contains no chart references. Replaced
    // SVGs can be collected without accumulating document listeners per chart.
    doc.addEventListener('keydown',()=>{state.mode='keyboard';});
    doc.addEventListener('pointerdown',()=>{state.mode='pointer';});
    doc.addEventListener('mousedown',()=>{state.mode='pointer';});
    return state;
  }
  function amountLabel(yuan){
    if(typeof yuan!=='number'||!Number.isFinite(yuan))return '—';
    if(yuan===0)return '0.00';
    const decimals=Math.abs(yuan)<100?6:2;
    let value=(yuan/10000).toFixed(decimals);
    if(decimals>2)value=value.replace(/(\.\d{2}.*?)0+$/,'$1');
    // A valid source amount is precise to cents. Defensive handling also avoids
    // claiming zero for smaller nonzero values supplied by an external caller.
    if(Number(value)===0)return yuan<0?'−<0.000001':'<0.000001';
    return value;
  }
  function monthWidth(amounts){
    const labels=(Array.isArray(amounts)?amounts:[]).map(amountLabel);
    const length=Math.max(4,...labels.map(label=>label.length));
    return Math.max(76,Math.ceil(2*(length*6.2+6)+4));
  }
  function chartWidth(viewport,count,amounts,padding){
    const available=Number.isFinite(viewport)&&viewport>0?viewport:1000;
    const months=Number.isFinite(count)?Math.max(0,Math.floor(count)):0;
    // A year or less always fits the available panel. Longer histories keep
    // their readable month spacing and may scroll horizontally.
    if(months<=12)return available;
    const inset=Number.isFinite(padding)?Math.max(0,padding):0;
    return Math.max(available,inset+months*monthWidth(amounts));
  }
  function placeLabels(items,bounds){
    const left=bounds.left,right=bounds.right,gap=bounds.gap??3,epsilon=1e-7,placed=[];
    for(const item of items){
      const x=Math.max(left,Math.min(item.center-item.width/2,right-item.width));
      let y=item.top;
      // Keep each label beside its bar horizontally. When labels compete for
      // that space, move up by only the height needed to clear the blockers.
      // Renderers include the minimum y in the SVG viewBox, so every row stays
      // visible without shrinking text or clipping labels at the chart edge.
      while(true){
        const blockers=placed.filter(other=>x<other.x+other.width+gap-epsilon&&x+item.width+gap>other.x+epsilon&&y<other.y+other.height+gap-epsilon&&y+item.height+gap>other.y+epsilon);
        if(!blockers.length)break;
        y=Math.min(...blockers.map(other=>other.y-item.height-gap));
      }
      placed.push({...item,x,y});
    }
    return placed;
  }
  function bind(svg,options){
    if(!svg||typeof svg.addEventListener!=='function')return function(){};
    const prior=bindings.get(svg);if(prior)prior();
    const readout=options&&options.readout,modality=modalityFor(svg.ownerDocument);
    let disposed=false,pointerInside=false,pointerChoice=null,focusedChoice=null,active=null,activeLabels=[],focusFromPointer=false;
    const pointerFocus=()=>modality?modality.mode==='pointer':focusFromPointer;
    const listeners=[];
    const attr=(node,name)=>node&&typeof node.getAttribute==='function'?node.getAttribute(name):null;
    const contains=node=>!!node&&(node===svg||(typeof svg.contains==='function'&&svg.contains(node)));
    const changeClass=(node,name,add)=>{
      if(!node)return;
      if(node.classList&&typeof node.classList[add?'add':'remove']==='function')node.classList[add?'add':'remove'](name);
      else if(typeof node.setAttribute==='function'){
        const values=new Set(String(attr(node,'class')||'').split(/\s+/).filter(Boolean));
        if(add)values.add(name);else values.delete(name);node.setAttribute('class',[...values].join(' '));
      }
    };
    function choiceFor(target){
      let node=target&&target.nodeType===3?target.parentElement:target;
      if(!contains(node))return null;
      while(node){
        if(attr(node,'data-monthly-margin')!==null)return {mode:'margin',target:node};
        if(attr(node,'data-monthly-bar')!==null)return {mode:'bars',target:node};
        if(node===svg)break;node=node.parentElement||node.parentNode;
      }
      return null;
    }
    function apply(choice){
      if(disposed)return;
      changeClass(active,'ym-active',false);activeLabels.forEach(n=>changeClass(n,'ym-active',false));active=null;activeLabels=[];
      svg.setAttribute('data-monthly-mode',choice?choice.mode:'');
      if(choice&&choice.mode==='bars'){
        active=choice.target;changeClass(active,'ym-active',true);
        const token=attr(active,'data-monthly-bar');
        if(typeof svg.querySelectorAll==='function')activeLabels=Array.from(svg.querySelectorAll('[data-monthly-label-for]')).filter(n=>attr(n,'data-monthly-label-for')===token);
        activeLabels.forEach(n=>changeClass(n,'ym-active',true));
        if(readout)readout.textContent=attr(active,'data-monthly-description')||'';
      }else if(readout)readout.textContent='';
    }
    function onPointerOver(event){
      if(disposed)return;pointerInside=true;
      const next=choiceFor(event.target);
      // Blank space retains the previous series; switching between bar shapes
      // therefore never hides the complete set of amounts for a frame.
      if(next){pointerChoice=next;apply(next);}
    }
    function onPointerLeave(){
      if(disposed)return;pointerInside=false;pointerChoice=null;apply(pointerFocus()?null:focusedChoice);
    }
    function onFocusIn(event){
      if(disposed)return;focusedChoice=pointerFocus()?null:choiceFor(event.target);
      apply(focusedChoice||(pointerInside?pointerChoice:null));
    }
    function onFocusOut(event){
      if(disposed)return;focusedChoice=pointerFocus()?null:choiceFor(event.relatedTarget);
      apply(focusedChoice||(pointerInside?pointerChoice:null));
    }
    function onPointerDown(event){
      if(disposed)return;focusFromPointer=true;if(modality)modality.mode='pointer';focusedChoice=null;
      // A mouse click may focus its bar before opening details. That focus must
      // not pin the labels after the pointer leaves the chart.
      onPointerOver(event);
    }
    function onKeyDown(event){
      if(disposed)return;focusFromPointer=false;if(modality)modality.mode='keyboard';
      focusedChoice=choiceFor(event.target);if(focusedChoice)apply(focusedChoice);
    }
    function listen(name,handler){svg.addEventListener(name,handler);listeners.push([name,handler]);}
    svg.setAttribute('data-monthly-chart','');changeClass(svg,'ym-chart',true);apply(null);
    // Mouse fallbacks support older embedded browsers; handlers are idempotent
    // when a modern browser also fires Pointer Events for the same transition.
    listen('pointerover',onPointerOver);listen('mouseover',onPointerOver);
    listen('pointerleave',onPointerLeave);listen('mouseleave',onPointerLeave);listen('pointercancel',onPointerLeave);
    listen('focusin',onFocusIn);listen('focusout',onFocusOut);
    listen('pointerdown',onPointerDown);listen('mousedown',onPointerDown);listen('keydown',onKeyDown);
    function cleanup(){
      if(disposed)return;apply(null);disposed=true;
      if(typeof svg.removeEventListener==='function')listeners.forEach(([name,handler])=>svg.removeEventListener(name,handler));
      if(bindings.get(svg)===cleanup)bindings.delete(svg);
    }
    bindings.set(svg,cleanup);return cleanup;
  }
  const exportCss='.ym-scroll{overflow:visible!important;min-width:0}.ym-chart .ym-bar-label{opacity:1!important;visibility:visible!important;pointer-events:none}.ym-chart .ym-margin-label,.ym-chart[data-monthly-count="1"][data-monthly-mode=""] .ym-margin-label{opacity:0!important;visibility:hidden!important}.ym-chart .ym-bar-label rect{fill:#fff;stroke:#dce5dd;stroke-width:.7}.ym-chart .ym-bar-label text{font-size:11px!important;font-weight:600;fill:#375f49!important}.ym-chart .ym-bar-label.ym-out-label text{fill:#695a87!important}.ym-chart .ym-readout,.ym-readout{display:none!important}.ym-chart .ym-bar-label{transition:none!important}';
  return Object.freeze({amountLabel,monthWidth,chartWidth,placeLabels,bind,exportCss});
});
