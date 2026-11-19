/* Offline presentation layer. The ledger, chart series, input values and report
   state stay in their source language. Each rendered label keeps its source text
   so changing the language also works while a dialog or a chart is open. */
(() => {
  'use strict';
  const preference = 'youshu.ui.language';
  const host = document.getElementById('ys-app');
  if (!host) return;
  const query = new URLSearchParams(location.search).get('lang');
  let saved;
  try { saved = localStorage.getItem(preference); } catch { /* Optional storage. */ }
  const locale = [query, saved, navigator.language].find(s => /^(en|zh)(-|$)/i.test(s || ''));
  let language = /^en/i.test(locale || '') ? 'en' : 'zh';
  let exampleContext = false;
  const nodes = new WeakMap();
  const attributes = new WeakMap();
  const attrs = ['aria-label','placeholder','title','data-tooltip'];
  const raw = '[data-i18n-raw]:not([data-i18n-field]), [translate="no"], script, style, textarea, pre, [contenteditable="true"]';
  const packs = globalThis.YoushuEnglish || [];
  const common = {
    '有数':'Youshu','随机体验':'Explore examples','我的报告':'My report','报告导航':'Report navigation',
    '给一人公司和小微企业的财务看板':'Finance for solo founders and small businesses',
    '全部为虚构示例':'Fictional example','再来一个':'Another example','再来一个随机报告':'Explore another example',
    '报告期间':'Reporting period','最近1个月':'Latest month','最近3个月':'Last 3 months','最近6个月':'Last 6 months','最近12个月':'Last 12 months','全部月份':'All months',
    '有数 · 数据留在本机':'Youshu · Data stays on this device','我的账本':'My ledger',
    '本期':'Selected period','人民币':'CNY','元':'CNY','万':'× 10,000','万元':'CNY × 10,000','个月':' months',
    '当前':'Current view','下载报告':'Download report','打印 / PDF':'Print / PDF','金额单位：万元':'Amounts in CNY × 10,000',
    '有数 · 我的企业经营报告':'Youshu · Business financial report'
  };
  const number = new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
  // Only the labels synthesized by the importers belong in this list. Never run
  // a merchant, account, filename or imported category through the UI dictionary.
  const sourceDefaults = {
    account: {'默认账户':'Default account','微信支付':'WeChat Pay','支付宝':'Alipay'},
    category: {'未分类':'Uncategorized','其他':'Other','退款收回':'Refund received'},
    counterparty: {'未填写交易对象':'Counterparty not supplied','未提供交易对方':'Counterparty not supplied','未分类':'Uncategorized'},
    filename: {'未命名账单':'Untitled statement'}
  };
  function isDefaultCompany(name) {
    return !name || name==='我的企业' || name==='我的收支账本';
  }
  function sourceLabel(value,field) {
    if(language!=='en' || typeof value!=='string') return value;
    const defaults=sourceDefaults[field==='summary'?'category':field];
    if(defaults && Object.hasOwn(defaults,value)) return defaults[value];
    if(field==='account') {
      const bank=value.match(/^(招商银行|北京银行)\s+([\d*•＊]+)$/);
      if(bank) return (bank[1]==='招商银行'?'China Merchants Bank':'Bank of Beijing')+' '+bank[2];
    }
    return value;
  }
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const translating = new Set();
  const cache = [new Map(),new Map()];
  function currency(s) {
    return s.replace(/[¥￥]\s*(-?[\d,.]+)/g,'CNY $1');
  }
  function createVocabulary(example) {
    const active = packs.filter(pack => pack.scope !== 'example' || example);
    const words = Object.assign(Object.create(null), common, ...active.map(pack => pack.text));
    const fragments = Object.assign(Object.create(null), ...active.map(pack => pack.fragments), words);
    const keys = Object.keys(fragments).filter(key => /[\u3400-\u9fff]/.test(key)).sort((a,b) => b.length-a.length);
    const starts = new Map();
    for (const key of keys) {
      if (!starts.has(key[0])) starts.set(key[0],[]);
      starts.get(key[0]).push(key);
    }
    const patternPacks = example ? [...active.filter(pack=>pack.scope==='example'), ...active.filter(pack=>pack.scope!=='example')] : active;
    return {patternPacks,words,starts,fragments};
  }
  const vocabulary = [createVocabulary(false),createVocabulary(true)];
  function translateParts(source, vocabulary) {
    let result = '', offset = 0, matched = false;
    while (offset < source.length) {
      const ch = source[offset];
      const key = vocabulary.starts.get(ch)?.find(k => source.startsWith(k,offset));
      if (key) {
        const word = vocabulary.fragments[key];
        if (/[a-z0-9]$/i.test(result) && /^\w/.test(word)) result+=' ';
        result+=word;
        offset+=key.length;
        if (/\w$/.test(result) && /[a-z0-9]/i.test(source[offset]||' ')) result+=' ';
        matched=true;
      } else {
        if (/[\u3400-\u9fff]/.test(ch)) return source;
        result+=ch;
        offset++;
      }
    }
    return matched ? result.replace(/，/g,', ').replace(/。/g,'. ').replace(/；/g,'; ').replace(/：/g,': ').replace(/、/g,', ').replace(/（/g,' (').replace(/）/g,')').replace(/\s+/g,' ').trim() : source;
  }
  function lookup(source, sample) {
    const bucket = cache[+sample];
    if (bucket.has(source)) return bucket.get(source);
    const v = vocabulary[+sample];
    const id = sample+'|'+source;
    if (translating.has(id)) return source;
    translating.add(id);
    try {
      let out = v.words[source];
      if (out === undefined) {
        for (const pack of v.patternPacks) {
          for (const [pattern, replacement] of pack.patterns || []) {
            if (!pattern.test(source)) continue;
            const candidate = source.replace(pattern,replacement);
            if (candidate!==source) {out=candidate;break;}
          }
          if (out !== undefined) break;
        }
      }
      if (out === undefined) {
        let prepared = source.replace(/(\d{4})年(1[0-2]|0?[1-9])月(?:(3[01]|[12]\d|0?[1-9])日)?/g,
          (_,y,m,d)=>months[Number(m)-1]+' '+(d?Number(d)+', ':'')+y)
          .replace(/(-?[\d,]+(?:\.\d+)?)\s*万(?:元)?/g,(_,n)=>'CNY '+number.format(Number(n.replace(/,/g,''))*10000));
        if (/ · |\n/.test(prepared)) {
          const split = prepared.split(/( · |\n)/);
          prepared = split.map((part,i)=>i%2 ? part : lookup(part.trim(),sample)).join('');
        }
        out=translateParts(prepared,v);
      }
      out=currency(out);
      if (bucket.size>5000) bucket.clear();
      bucket.set(source,out);
      return out;
    } finally {translating.delete(id);}
  }
  function translate(value,sample=exampleContext) {
    if (typeof value!=='string'||language==='zh'||!/[\u3400-\u9fff¥￥]/.test(value)) return value;
    const previous = exampleContext;
    exampleContext=sample;
    try { return value.replace(/\S[\s\S]*\S|\S/,s=>lookup(s,sample)); }
    finally {exampleContext=previous;}
  }
  function isSample(el) {
    if (!el.closest('#ys-report,#ys-detail,#ys-home-note')) return false;
    return document.getElementById('ys-random')?.getAttribute('aria-current')==='page';
  }
  function remember(map,key,current,render) {
    const old=map.get(key);
    const original=old?.shown===current ? old.original : current;
    const shown=render(original);
    if (old || current!==shown) map.set(key,{original,shown});
    return shown;
  }
  function localizeText(node) {
    const el=node.parentElement;
    if (!el||el.closest(raw)) return;
    const shown=remember(nodes,node,node.data,original=>{
      const field=el.closest('[data-i18n-field]')?.dataset.i18nField;
      if(field) return sourceLabel(original,field);
      const amount=el.getAttribute('data-i18n-cny');
      if (amount!==null && language==='en') return 'CNY '+number.format(Number(amount));
      if (language==='en' && el.tagName==='SMALL' && el.previousElementSibling?.hasAttribute('data-i18n-cny')) return '';
      return translate(original,isSample(el));
    });
    if (node.data!==shown) node.data=shown;
  }
  function localizeAttrs(el) {
    for (const name of attrs) {
      if (name==='aria-label' && el.hasAttribute('data-i18n-formatted-aria')) continue;
      const value=el.getAttribute(name);
      if (value===null) continue;
      let map=attributes.get(el);
      if (!map) {map=new Map();attributes.set(el,map);}
      const shown=remember(map,name,value,s=>translate(s,isSample(el)));
      if (shown!==value) el.setAttribute(name,shown);
    }
  }
  function walk(node) {
    if (node.nodeType===3) {localizeText(node);return;}
    if (node.nodeType!==1 || node.closest(raw)) return;
    const filter={acceptNode:n=>n.nodeType===1&&n.matches(raw) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT};
    const walker=document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,filter);
    for (let n=node;n;n=walker.nextNode()) {
      if (n.nodeType===3) localizeText(n);
      else {
        // Options without a value derive it from their displayed text.
        if (n.tagName==='OPTION' && !n.hasAttribute('value')) n.value=n.textContent;
        localizeAttrs(n);
      }
    }
  }
  function flush() {
    if(observer) observer.takeRecords();
    walk(host);
  }
  let observer;
  function mount() {
    const nav=host.querySelector('.ys-nav-tabs');
    if (!nav) return;
    const controls=document.createElement('div');
    controls.className='ys-nav-controls';
    nav.before(controls);
    controls.append(nav);
    const languageButton=document.createElement('button');
    languageButton.type='button';
    languageButton.className='ys-language-switch';
    languageButton.setAttribute('data-i18n-raw','');
    languageButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4.3" ry="10"/><path d="M2 12h20"/></svg><span></span>';
    const label=languageButton.querySelector('span');
    controls.append(languageButton);
    function sync() {
      document.documentElement.lang=language==='en'?'en':'zh-CN';
      document.title=translate('有数 · 我的企业经营报告');
      const showEnglish=language==='zh';
      languageButton.dataset.language=showEnglish?'en':'zh';
      languageButton.lang='en';
      languageButton.setAttribute('aria-label',showEnglish?'Switch to English':'Switch to Chinese');
      label.textContent=showEnglish?'English':'Chinese';
      flush();
    }
    languageButton.addEventListener('click',()=>{
      language=languageButton.dataset.language;
      try {
        localStorage.setItem(preference,language);
        // A shared language link opens in its requested language, but a later
        // manual choice must also survive a refresh of that link.
        const url=new URL(location.href);
        if(url.searchParams.has('lang')) {url.searchParams.set('lang',language);history.replaceState(history.state,'',url.href);}
      } catch { /* Local files can restrict storage or history. */ }
      window.dispatchEvent(new Event('youshu:languagechange'));
      sync();
    });
    sync();
    window.addEventListener('beforeprint',flush);
    observer=new MutationObserver(records=>{
      if(language==='zh')return;
      const roots=new Set();
      for(const record of records) {
        if(record.type==='childList') for(const node of record.addedNodes) roots.add(node);
        else roots.add(record.target);
      }
      for(const node of roots) {
        if(!host.contains(node))continue;
        let parent=node.parentNode;
        while(parent&&!roots.has(parent)) parent=parent.parentNode;
        if(!parent) walk(node);
      }
    });
    observer.observe(host,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
  }
  globalThis.YoushuI18n={get language(){return language;},text:translate,sourceLabel,isDefaultCompany,flush};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',mount,{once:true}):mount();
})();
