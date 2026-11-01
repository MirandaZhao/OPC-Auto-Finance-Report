/* Local fictional business ledgers. Every chart is derived from reconciled records. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.YoushuScenarioGenerator=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const round=n=>Math.round((n+Number.EPSILON)*100)/100;
  const sum=(rows,get)=>round(rows.reduce((n,r)=>n+Number(get(r)||0),0));
  const pad=n=>String(n).padStart(2,'0');
  const shift=(date,days)=>{const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);};
  const daysBetween=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
  const normalizeIndex=(n,length)=>((Number.isFinite(Number(n))?Math.trunc(Number(n)):0)%length+length)%length;
  const scenarios=[
    {id:'growth',label:'稳步增长',description:'业务逐步增加，交付与回款保持稳定'},
    {id:'slow-collection',label:'回款放慢',description:'服务持续交付，部分已确认收入的回款延后'},
    {id:'cost-pressure',label:'投入上升',description:'业务持续开展，近期主要投入和成本增加'},
    {id:'volatile',label:'业务波动',description:'业务随交付和申请节奏波动，近期收入回落'}
  ];
  const profiles=[
    {id:'automation',business:'企业 AI 自动化工作室',suffix:'企业自动化工作室',customerLabel:'客户',recordDateLabel:'收入确认日期',services:['企业知识库搭建','智能客服部署','业务流程自动化','系统集成实施','自动化运维服务'],direct:['模型调用服务','云平台与部署','实施交付协作'],expense:['经营者薪酬','软件订阅','客户拓展','流程测试与评估'],base:[85000,130000],salary:[16000,23000],capital:[140000,240000],account:'工作室结算账户'},
    {id:'model-lab',business:'小微模型公司 · 自有模型研发',suffix:'模型研发科技',customerLabel:'客户',recordDateLabel:'收入确认日期',services:['自研模型授权','自研模型 API 服务','私有化模型部署','行业模型定制训练'],direct:['推理服务算力','部署交付协作'],expense:['模型训练算力','数据采购与标注','研发人员薪酬','软件订阅','模型评测','商业拓展'],base:[130000,175000],salary:[65000,100000],capital:[800000,1200000],account:'模型公司结算账户'},
    {id:'study-abroad',business:'留学中介与咨询工作室',suffix:'留学咨询工作室',customerLabel:'申请人',recordDateLabel:'服务确认日期',services:['留学规划咨询','院校申请服务','文书辅导服务','面试辅导服务','行前指导服务'],direct:['申请服务协作','专业翻译服务','文书制作协作'],expense:['顾问薪酬','软件订阅','渠道推广','场地与办公'],base:[50000,78000],salary:[14000,21000],capital:[100000,170000],account:'留学服务结算账户'}
,
    {id:'software-ai',business:'AI／软件开发工作室',suffix:'AI软件工作室',rotationGroup:'technology',services:['AI应用开发','业务系统开发','软件维护服务','产品原型开发'],direct:['开发交付协作','模型与云服务','软件测试服务'],expense:['开发者薪酬','软件订阅','产品推广','技术培训'],base:[60000,100000],salary:[15000,22000],capital:[90000,160000],account:'软件工作室结算账户',rates:[.15,.07,.04,.04,.025]},
    {id:'data-consulting',business:'数据分析／咨询工作室',suffix:'数据咨询工作室',rotationGroup:'professional',services:['经营数据分析','数据看板搭建','市场调研咨询','数据治理服务'],direct:['数据采购','调研执行协作','数据处理服务'],expense:['分析师薪酬','软件订阅','客户拓展','专业培训'],base:[55000,90000],salary:[14000,21000],capital:[80000,140000],account:'数据咨询结算账户',rates:[.10,.09,.06,.04,.025]},
    {id:'creator',business:'自媒体创作者',suffix:'内容创作工作室',rotationGroup:'content',services:['品牌内容合作','平台内容分成','付费内容服务','直播推广服务'],direct:['视频剪辑协作','拍摄制作','内容素材授权'],expense:['创作者薪酬','创作工具订阅','内容推广','拍摄场地'],base:[35000,65000],salary:[10000,15000],capital:[60000,110000],account:'内容创作结算账户',rates:[.12,.08,.035,.06,.04],clientNames:['橙光品牌','青屿生活品牌','视频平台甲','内容平台乙','知识社群','直播合作方']},
    {id:'design-photo',business:'设计／摄影自由职业',suffix:'设计摄影工作室',rotationGroup:'creative',services:['品牌视觉设计','商业摄影','人像摄影','活动拍摄'],direct:['摄影助理协作','后期制作','道具与耗材'],expense:['主理人薪酬','设计工具订阅','作品推广','摄影棚租赁'],base:[30000,55000],salary:[9000,14000],capital:[50000,100000],account:'设计摄影结算账户',rates:[.09,.08,.05,.04,.06]},
    {id:'ecommerce',business:'电商／服饰小店',suffix:'服饰小店',rotationGroup:'retail',services:['通勤服饰','休闲服饰','饰品配件','定制服饰'],direct:['服饰进货成本','包装与物流','平台交易服务费'],expense:['店员薪酬','店铺工具订阅','店铺推广','仓储租赁'],base:[90000,150000],salary:[10000,16000],capital:[120000,200000],account:'服饰店结算账户',rates:[.40,.055,.035,.09,.035],retail:true,clientNames:['网店平台甲','网店平台乙','直播店铺','私域商城','线下零售'],terms:[7,7,7,0,0]},
    {id:'nail-lash',business:'美甲／美睫工作室',suffix:'美甲美睫工作室',rotationGroup:'care',services:['基础美甲服务','设计美甲服务','美睫服务','美甲修护服务'],direct:['美甲美睫耗材','消毒与清洁耗材','服务协作提成'],expense:['美甲师薪酬','预约工具订阅','门店推广','门店租金'],base:[32000,56000],salary:[9000,14000],capital:[70000,120000],account:'美甲工作室结算账户',rates:[.11,.025,.08,.04,.10],retail:true,clientNames:['门店到店客户','预约平台客户','老客复购','社群预约','活动体验客户'],terms:[0,3,0,0,0]},
    {id:'florist',business:'花艺／礼品店',suffix:'花艺礼品店',rotationGroup:'retail',services:['日常花束','节日花礼','活动花艺','定制礼盒'],direct:['鲜花与礼品材料','包装耗材','配送与布置'],expense:['花艺师薪酬','店铺工具订阅','门店推广','门店租金'],base:[45000,75000],salary:[9000,14000],capital:[80000,140000],account:'花艺店结算账户',rates:[.32,.07,.06,.035,.07],retail:true,clientNames:['门店花礼客户','同城平台客户','企业花礼客户','婚礼合作客户','社群订花客户'],terms:[0,3,15,7,0],seasonality:[1.1,1.4,.9,.9,1.35,.85,.85,1.15,.9,1.1,.9,1.05]},
    {id:'cafe-bakery',business:'咖啡／烘焙店',suffix:'咖啡烘焙店',rotationGroup:'food',services:['咖啡饮品','烘焙点心','定制蛋糕','企业茶歇'],direct:['咖啡与烘焙原料','食品包装','配送平台服务费'],expense:['店员薪酬','门店工具订阅','门店水电','门店租金'],base:[65000,100000],salary:[15000,22000],capital:[140000,220000],account:'咖啡烘焙结算账户',rates:[.28,.04,.05,.04,.09],retail:true,clientNames:['门店堂食客户','外卖平台客户','定制蛋糕客户','企业茶歇客户','社区团购客户'],terms:[0,7,0,15,3]},
    {id:'yoga-pilates',business:'瑜伽／普拉提工作室',suffix:'瑜伽普拉提工作室',rotationGroup:'wellness',services:['普拉提私教课','瑜伽小班课','体态评估服务','团体训练课'],direct:['课程教练协作','器材维护','课程耗材'],expense:['主理人薪酬','预约工具订阅','课程推广','场馆租金'],base:[50000,85000],salary:[12000,18000],capital:[120000,190000],account:'运动工作室结算账户',rates:[.22,.035,.015,.04,.12],retail:true,clientNames:['私教课程学员','小班课程学员','团课预约学员','企业团体学员','体态评估客户'],terms:[0,0,0,7,0]},
    {id:'wholesale',business:'小型批发／贸易公司',suffix:'商贸',rotationGroup:'trade',services:['办公用品批发','日用百货批发','企业采购服务','门店补货'],direct:['已售商品采购成本','仓储物流','订单配货协作'],expense:['经营人员薪酬','进销存软件订阅','业务拓展','仓库租赁'],base:[180000,280000],salary:[17000,25000],capital:[250000,400000],account:'商贸结算账户',rates:[.57,.035,.025,.025,.035],terms:[30,45,60,30,45]},
    {id:'salaried-sidegig',business:'上班族／上班兼副业',suffix:'的收支账本',family:'personal',rotationGroup:'personal',customerLabel:'收入来源',recordDateLabel:'到账日期',services:['税后工资','税后奖金','副业设计','副业咨询','稿酬收入'],direct:[],expense:[],capital:[70000,140000],account:'个人收支账户'},
    {id:'own-investor',business:'自有资金投资者',suffix:'的投资账本',family:'investor',rotationGroup:'investment',customerLabel:'收益来源',recordDateLabel:'到账日期',services:['投资已实现收益','现金分红','存款利息'],direct:[],expense:[],capital:[450000,800000],account:'个人投资账户'}
  ].map((profile,index)=>({family:'business',rotationGroup:index===0?'technology':index===1?'research':'education',customerLabel:profile.retail?'渠道／客群':'客户',recordDateLabel:'收入确认日期',...profile}));
  const prefixes=['澄川','拾光','青岚','松果','知微','观澜','云帆','鹿溪','初禾','南星','映山','禾序','星沐','清野','墨白','浅行','沐原','晴屿','简知','远棠','书禾','知序','溪桥','望野'];
  const clientPrefixes=['晴禾','沐森','远舟','青屿','橙石','知岸','朗星','初见','云栖','白榆','微光','溪山','知鹿','澄洲','北棠','南序'];
  const clientKinds=['电商','教育','咨询','家居','软件','文旅','设计','零售','供应链','健康科技'];
  const surnames=['林','陈','王','李','周','张','吴','许','郑','何','刘','杨','赵','孙','徐','高','谢','沈','梁','宋'];
  const destinations=['英国硕士','澳洲本科','香港硕士','新加坡硕士','美国本科'];
  const vendorPrefixes=['灵犀','星桥','云衡','知程','澄见','时序','墨禾','松石','曜云','一木'];
  function create(options={}){
    let seed=(Number.isFinite(Number(options.seed))?Number(options.seed):137903)>>>0;
    const initialSeed=seed,random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
    const integer=(a,b)=>a+Math.floor(random()*(b-a+1)),money=(a,b)=>Math.round((a+random()*(b-a))/100)*100;
    const pick=a=>a[integer(0,a.length-1)],shuffle=a=>a.map(x=>({x,r:random()})).sort((a,b)=>a.r-b.r).map(o=>o.x);
    const profileIndex=normalizeIndex(options.profileIndex,profiles.length),scenarioIndex=normalizeIndex(options.scenarioIndex,scenarios.length),profile=profiles[profileIndex],config=scenarios[scenarioIndex];
    const modelLab=profile.id==='model-lab',study=profile.id==='study-abroad';
    const end=new Date(options.now||Date.now());if(!Number.isFinite(end.getTime()))throw Error('生成日期无效');end.setUTCDate(0);
    const asOf=end.toISOString().slice(0,10),year=Number(asOf.slice(0,4)),endMonth=Number(asOf.slice(5,7));
    const months=Array.from({length:12},(_,i)=>new Date(Date.UTC(year,endMonth-12+i,1)).toISOString().slice(0,7)),openingDate=shift(months[0]+'-01',-1);
    if(profile.family!=='business')return createPersonal({profile,profileIndex,scenarioIndex,config,months,asOf,year,endMonth,openingDate,initialSeed,random,integer,money,pick});
    const legacy=profileIndex<3;
    let initialCapital=money(...profile.capital),openingCarry=modelLab?-money(50000,130000):money(20000,50000),capital=initialCapital;
    const p={schemaVersion:1,company:pick(prefixes)+profile.suffix,openingCash:round(initialCapital+openingCarry),asOf,cash:[],profit:[],ar:[],balance:[],invoices:[],costInvoices:[],advanceContracts:[]};
    const account=profile.account,clientCount=study?integer(4,5)*4:profile.clientNames?profile.clientNames.length:integer(5,8),names=shuffle(clientPrefixes),studentNames=shuffle(surnames);
    const clientNames=Array.from({length:clientCount},(_,i)=>profile.clientNames?profile.clientNames[i]:study?studentNames[i]+'同学 · '+destinations[i%destinations.length]:names[i]+clientKinds[(i+integer(0,9))%clientKinds.length]);
    const services=study?profile.services.slice():shuffle(profile.services).slice(0,integer(3,profile.services.length));
    const clientWeights=clientNames.map((_,i)=>i===0?(scenarioIndex===3?2.8:1.8):.55+random()),weightTotal=clientWeights.reduce((a,b)=>a+b,0);
    const clients=clientNames.map((name,i)=>({name,termDays:profile.terms?profile.terms[i%profile.terms.length]:study?[7,15,30][i%3]:[15,30,45,60][(i+scenarioIndex)%4],services:[services[i%services.length],services[(i+1)%services.length]],weight:clientWeights[i]/weightTotal}));
    let cashId=0,invoiceId=0,costId=0;
    const addCash=(date,counterparty,category,inflow,outflow,activity='operating',extra={})=>{
      if(date>asOf)return null;
      const row={id:'FICTION-'+profile.id+'-'+initialSeed+'-'+(++cashId),date,time:'10:'+pad(cashId%60)+':00',account,counterparty,category,inflow:round(inflow),outflow:round(outflow),balance:null,activity,summary:extra.summary||category,...extra};p.cash.push(row);return row;
    };
    const baseRevenue=money(...profile.base),salary=money(...profile.salary),software=modelLab?money(3000,6000):study?money(800,1800):money(1800,3600);
    const training=money(30000,65000),dataSpend=money(10000,22000),evaluation=money(4000,9000),office=money(2000,4000);
    const costNames=[...profile.direct,...profile.expense],vendorNames=shuffle(vendorPrefixes),vendors={};
    costNames.forEach((c,i)=>vendors[c]=c.includes('薪酬')?[modelLab?'模型研发团队':study?'咨询顾问团队':'工作室经营者']:[vendorNames[i%vendorNames.length]+'服务',vendorNames[(i+4)%vendorNames.length]+'技术']);
    if(!legacy){
      for(const [i,category] of costNames.entries()){
        if(category.includes('薪酬')){vendors[category]=[category.replace('薪酬','')];continue;}
        const type=/采购|进货|原料|材料|耗材/.test(category)?'供货商':/物流|配送/.test(category)?'配送服务':/租赁|租金/.test(category)?'场地':/工具|订阅/.test(category)?'平台服务':'协作服务';
        vendors[category]=[vendorNames[i%vendorNames.length]+type,vendorNames[(i+4)%vendorNames.length]+type];
      }
    }
    const flexibleCategories=costNames.filter(c=>!c.includes('薪酬')&&!['软件订阅','场地与办公'].includes(c)&&!c.includes('租赁')&&!c.includes('租金')&&!c.includes('订阅'));
    let totalUnpaidCost=0,totalTaxPayable=0,equipmentCost=0,depreciationTotal=0,loanBalance=0;
    const purchases=[{month:0,amount:money(modelLab?50000:14000,modelLab?95000:28000)},{month:5,amount:money(modelLab?70000:16000,modelLab?140000:35000)}],capex=[];
    const loan=modelLab?0:money(30000,80000),loanRepayment=round(loan*.5),equityFunding=modelLab?money(400000,800000):0;
    for(let mi=0;mi<months.length;mi++){
      const month=months[mi],calendarMonth=Number(month.slice(5));
      let growth=scenarioIndex===0?.78+mi*.057:scenarioIndex===1?.90+mi*.022:scenarioIndex===2?.95+mi*.013:1.05+.22*Math.sin(mi*1.1);
      if(scenarioIndex===3&&mi>=9)growth*=1-(mi-8)*.13;
      if(modelLab)growth*=.45+mi*.065;
      if(study)growth*=[.85,.8,.9,.7,.7,.8,.95,1.15,1.35,1.45,1.3,1.05][calendarMonth-1];
      if(profile.seasonality)growth*=profile.seasonality[calendarMonth-1];
      const target=Math.max(16000,money(baseRevenue*growth*.94,baseRevenue*growth*1.06));
      const activeClients=study?clients.slice(Math.floor(mi/3)*(clientCount/4),(Math.floor(mi/3)+1)*(clientCount/4)):clients;
      const activeWeight=activeClients.reduce((n,c)=>n+c.weight,0);let left=target,revenue=0;
      for(let ci=0;ci<activeClients.length;ci++){
        const client=activeClients[ci],clientAmount=ci===activeClients.length-1?left:Math.round(target*client.weight/activeWeight/100)*100;left-=clientAmount;
        const split=Math.round(clientAmount*(.56+random()*.18)/100)*100,amounts=[split,clientAmount-split];
        amounts.forEach((amount,part)=>{
          const invoiceDate=month+'-'+pad(2+ci+part*4),category=study?services[(mi%3+part+ci)%services.length]:client.services[part],dueDate=shift(invoiceDate,client.termDays);
          const inv={id:'INV-'+profile.id+'-'+initialSeed+'-'+(++invoiceId),customer:client.name,category,invoiceDate,recognitionDate:invoiceDate,recordType:study?'已完成服务阶段':profile.retail?'已完成消费或已交付商品':profile.id==='wholesale'?'已交付商品':'已交付服务',dueDate,amount,received:0,outstanding:amount,payments:[]};
          let lag=scenarioIndex===0?integer(-6,-1):scenarioIndex===1?integer(15,55):scenarioIndex===2?integer(-3,12):integer(-4,20);
          if(scenarioIndex===1&&ci===0&&mi>=8)lag+=20;
          if(profile.retail)lag=client.termDays===0?0:scenarioIndex===1?integer(1,7):0;
          const firstAmount=round(amount*(scenarioIndex===1?.3:study?.6:.4)),firstDate=profile.retail?invoiceDate:shift(invoiceDate,integer(0,3)),finalDate=shift(dueDate,lag);
          const schedule=[{date:firstDate,amount:firstAmount},{date:finalDate<firstDate?(profile.retail?firstDate:shift(firstDate,2)):finalDate,amount:round(amount-firstAmount)}];
          schedule.forEach((pay,pi)=>{if(pay.date>asOf)return;const row=addCash(pay.date,client.name,category,pay.amount,0,'operating',{invoiceId:inv.id,summary:category+' · '+(pi?'已完成阶段尾款':'已完成阶段首款'),sourceImportName:study?'虚构申请服务与回款台账':'虚构业务交付与回款台账'});inv.payments.push({date:pay.date,amount:pay.amount,cashId:row.id});});
          inv.received=sum(inv.payments,r=>r.amount);inv.outstanding=round(inv.amount-inv.received);inv.actualAverageDays=inv.received?round(sum(inv.payments,r=>daysBetween(invoiceDate,r.date)*r.amount)/inv.received):null;
          p.invoices.push(inv);p.ar.push({...inv,termDays:client.termDays});revenue=round(revenue+amount);
        });
      }
      let cost=0,expenses=0,paidCosts=0;const pressure=scenarioIndex===2?1+mi*.045:1,amounts={};
      if(modelLab){
        amounts['推理服务算力']=money(revenue*.08,revenue*.12);amounts['部署交付协作']=money(revenue*.03,revenue*.055);
        amounts['模型训练算力']=round(training*pressure*(.9+random()*.25));amounts['数据采购与标注']=round(dataSpend*pressure*(.9+random()*.2));amounts['研发人员薪酬']=salary;amounts['模型评测']=round(evaluation*pressure);amounts['商业拓展']=money(revenue*.02,revenue*.04);
      }else if(!legacy){
        profile.direct.forEach((name,i)=>amounts[name]=money(revenue*profile.rates[i]*pressure*.92,revenue*profile.rates[i]*pressure*1.08));
        amounts[profile.expense[0]]=salary;amounts[profile.expense[1]]=software;
        amounts[profile.expense[2]]=money(revenue*profile.rates[3]*pressure*.9,revenue*profile.rates[3]*pressure*1.1);
        amounts[profile.expense[3]]=money(baseRevenue*profile.rates[4]*pressure*.95,baseRevenue*profile.rates[4]*pressure*1.05);
      }else{
        amounts[profile.direct[0]]=money(revenue*(study?.13:.10)*pressure,revenue*(study?.18:.14)*pressure);
        amounts[profile.direct[1]]=money(revenue*(study?.06:.035)*pressure,revenue*(study?.09:.06)*pressure);
        amounts[profile.direct[2]]=money(revenue*.075*pressure,revenue*.115*pressure);
        amounts[study?'顾问薪酬':'经营者薪酬']=salary;
        if(study){amounts['渠道推广']=money(revenue*.06*pressure,revenue*.09*pressure);amounts['场地与办公']=office;}
        else{amounts['客户拓展']=money(revenue*.025*pressure,revenue*.045*pressure);amounts['流程测试与评估']=money(revenue*.015*pressure,revenue*.03*pressure);}
      }
      if(legacy)amounts['软件订阅']=software;
      for(const category of costNames){
        const amount=amounts[category],isDirect=profile.direct.includes(category),suppliers=vendors[category],subtotals=suppliers.length===1?[amount]:[round(amount*(.58+random()*.14)),0];if(subtotals.length>1)subtotals[1]=round(amount-subtotals[0]);
        subtotals.forEach((subtotal,si)=>{
          const date=month+'-'+pad(17+(costId%8)),unpaid=mi===11&&category===profile.direct.at(-1)?round(subtotal*.22):0,paid=round(subtotal-unpaid);
          const item={id:'COST-'+initialSeed+'-'+(++costId),date,category,supplier:suppliers[si],amount:subtotal,paid,outstanding:unpaid};p.costInvoices.push(item);totalUnpaidCost=round(totalUnpaidCost+unpaid);
          const meta={summary:category+' · '+calendarMonth+'月服务',costInvoiceId:item.id,sourceImportName:'虚构供应商付款台账'};
          if(category.includes('订阅')){meta.subscription=true;meta.subscriptionEvidence='虚构合同约定按月续订，服务期为 '+month;}
          if(!profile.retail&&category===profile.direct.at(-1)&&mi>=9)meta.installment={current:mi-8,total:3,evidence:'虚构协作合同分三期支付，本笔为实际本期付款'};
          addCash(date,suppliers[si],category,0,paid,'operating',meta);paidCosts=round(paidCosts+paid);
        });
        if(isDirect)cost=round(cost+amount);else expenses=round(expenses+amount);
      }
      const purchase=purchases.find(x=>x.month===mi);if(purchase){equipmentCost+=purchase.amount;capex.push({date:month+'-12',amount:purchase.amount});addCash(month+'-12','曜石设备',modelLab?'研发设备购置':profile.retail?'门店设备购置':profile.id==='design-photo'?'摄影器材购置':'工作设备购置',0,purchase.amount,'investing',{summary:'虚构设备采购，按36个月计提演示折旧'});}
      const depreciation=sum(capex,r=>round(r.amount/36));depreciationTotal=round(depreciationTotal+depreciation);expenses=round(expenses+depreciation);
      if(mi===2&&loan){loanBalance=loan;addCash(month+'-03','虚构经营借款','经营借款到账',loan,0,'financing');}
      if(mi===8&&loan){loanBalance=round(loanBalance-loanRepayment);addCash(month+'-25','虚构经营借款','偿还借款本金',0,loanRepayment,'financing');}
      if(mi===3&&equityFunding){capital=round(capital+equityFunding);addCash(month+'-01','虚构股权投资方','研发股权增资到账',equityFunding,0,'financing',{summary:'本期已到账的虚构股权增资，不计入营业收入'});}
      const interest=mi>=2?round(loanBalance*.004):0;if(interest){expenses=round(expenses+interest);addCash(month+'-27','虚构经营借款','借款利息',0,interest,'operating');}
      const tax=round(Math.max(0,revenue-cost-expenses)*(.025+random()*.01)),paidTax=mi===11?round(tax*.45):tax;totalTaxPayable=round(totalTaxPayable+tax-paidTax);
      if(paidTax)addCash(month+'-28','虚构税费缴款','示例税费',0,paidTax,'operating',{summary:'税费为演示假设，非适用税率'});
      p.profit.push({month,revenue,cost,expenses,tax,netProfit:round(revenue-cost-expenses-tax),depreciation,paidOperatingCost:paidCosts});
    }
    // These services occur after the cutoff. Their cash receipts remain liabilities.
    if(study){for(let i=0;i<3;i++){
      const receivedDate=months.at(-1)+'-'+pad(18+i*3),customer=clients[clients.length-1-i].name,amount=money(3000,7000),serviceDate=shift(asOf,15+i*7);
      const row=addCash(receivedDate,customer,'留学服务预收款',amount,0,'operating',{summary:'后续申请服务预付款，尚未交付，不计入当期营业收入',sourceImportName:'虚构待交付服务合同'});
      p.advanceContracts.push({id:'ADV-'+initialSeed+'-'+i,cashId:row.id,customer,category:'后续申请服务',receivedDate,serviceDate,amount,status:'待交付'});
    }}
    const sorted=()=>p.cash.sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.id.localeCompare(b.id));sorted();
    // Size the fictional opening paid-in capital to the planned funding budget.
    // It is present before the first transaction, never invented forecast income.
    let running=p.openingCash,minCash=running;for(const row of p.cash){running=round(running+row.inflow-row.outflow);minCash=Math.min(minCash,running);}
    const reserve=modelLab?200000:30000;if(minCash<reserve){const extra=Math.ceil((reserve-minCash)/10000)*10000;initialCapital+=extra;capital+=extra;p.openingCash+=extra;}
    const dividendDate=months[9]+'-28',profitThroughDividend=sum(p.profit.filter(r=>r.month<=months[9]),r=>r.netProfit),cashThroughDividend=round(p.openingCash+sum(p.cash.filter(r=>r.date<=dividendDate),r=>r.inflow-r.outflow));
    const dividends=modelLab?0:Math.max(0,Math.floor(Math.min(Math.max(0,openingCarry+profitThroughDividend)*.15,Math.max(0,cashThroughDividend-reserve)*.15,50000)/100)*100);
    if(dividends)addCash(dividendDate,'虚构经营出资人','已宣告并支付分红',0,dividends,'financing',{summary:'虚构利润分配，非经营成本'});
    sorted();let cash=p.openingCash;p.cash.forEach((row,i)=>{cash=round(cash+row.inflow-row.outflow);row.balance=cash;row.sourceRow=i+2;});
    const totalProfit=sum(p.profit,r=>r.netProfit),receivables=sum(p.ar,r=>r.amount-r.received),fixedAssets=round(equipmentCost-depreciationTotal),unearnedRevenue=sum(p.advanceContracts,r=>r.amount);
    p.balance=[{date:asOf,cash,receivables,inventory:0,fixedAssets,otherAssets:0,payables:totalUnpaidCost,taxPayable:totalTaxPayable,debt:loanBalance,otherLiabilities:unearnedRevenue,capital,retainedEarnings:round(openingCarry+totalProfit-dividends)}];
    const yearProfit=sum(p.profit.filter(r=>r.month.startsWith(String(year))),r=>r.netProfit),yearDividends=dividendDate.startsWith(String(year))?dividends:0,priorDividends=round(dividends-yearDividends),carry=round(openingCarry+sum(p.profit.filter(r=>!r.month.startsWith(String(year))),r=>r.netProfit)-priorDividends);
    p.distribution={carry,yearCarry:carry,openingCarry,dividends:yearDividends,yearDividends,reportDividends:dividends,adjustments:0,capital,netProfit:yearProfit,retained:round(yearProfit-yearDividends),distributable:round(carry+yearProfit-yearDividends),reportNetProfit:totalProfit,periodLabel:year+'年1—'+endMonth+'月',reportPeriodLabel:months[0]+' — '+months[11],openingDate};
    p.scenario={...config,family:profile.family,rotationGroup:profile.rotationGroup,seed:initialSeed,scenarioIndex,profileId:profile.id,profileIndex,business:profile.business,customerLabel:profile.customerLabel,recordDateLabel:profile.recordDateLabel,flexibleCategories,clientNames,clients,services,costCategories:costNames,invoiceCount:p.invoices.length,openingDate,openingCapital:initialCapital,equityFunding,unearnedRevenue,periodLabel:months[0]+' — '+months[11],taxAssumption:'税费为独立演示假设，不代表企业适用税率',fictional:true,generatorVersion:1};
    return p;
  }
  // Personal examples use cash-basis income. Portfolio principal never becomes income.
  function createPersonal(ctx){
    const {profile,profileIndex,scenarioIndex,config,months,asOf,year,endMonth,openingDate,initialSeed,random,integer,money,pick}=ctx;
    const investor=profile.family==='investor',initialCapital=money(...profile.capital),openingHoldings=investor?round(initialCapital*.45):0;
    const name=pick(surnames)+pick(['清禾','知夏','一宁','思远','嘉禾','予安','星然','沐晴']);
    const p={schemaVersion:1,company:name+profile.suffix,openingCash:round(initialCapital-openingHoldings),asOf,cash:[],profit:[],ar:[],balance:[],invoices:[],costInvoices:[],advanceContracts:[]};
    let cashId=0,capital=initialCapital,contributions=0,totalPurchases=0,totalSalePrincipal=0,totalGains=0,totalDividends=0,totalFees=0,totalInterest=0;
    const holdings=investor?['虚构权益组合甲','虚构权益组合乙','虚构债券组合','虚构指数基金'].map((name,i)=>({name,cost:round(openingHoldings*[.3,.25,.25,.2][i])})):[];
    const employer=pick(clientPrefixes)+'科技（雇主）',sideClients=[pick(clientPrefixes)+'设计客户',pick(clientPrefixes)+'咨询客户','内容合作平台'];
    const salary=money(13000,22000),bonus=money(1000,3500),sideBase=money(3500,8500),livingBase=money(7500,12500);
    const add=(date,counterparty,category,inflow,outflow,activity='operating',extra={})=>{
      const row={id:'FICTION-'+profile.id+'-'+initialSeed+'-'+(++cashId),date,time:'10:'+pad(cashId%60)+':00',account:profile.account,counterparty,category,inflow:round(inflow),outflow:round(outflow),activity,balance:null,summary:category,sourceImportName:investor?'虚构投资结算明细（本金与收益分列）':'虚构个人收入与支出记录',...extra};p.cash.push(row);return row;
    };
    let salaryIncome=0,sidegigIncome=0,livingCost=0,sidegigCost=0;
    for(let mi=0;mi<12;mi++){
      const month=months[mi],growth=scenarioIndex===0?.8+mi*.045:scenarioIndex===1?.95:scenarioIndex===2?1:1.1+.24*Math.sin(mi*.9);
      let revenue=0,cost=0,expenses=0;
      if(!investor){
        const paidSalary=round(salary*(mi>=6?1.03:1)),paidBonus=mi%3===2?round(bonus*(scenarioIndex===3?.7+random():1)):0;
        add(month+'-10',employer,'税后工资',paidSalary,0,'operating',{incomeNature:'payroll',natureEvidence:'虚构工资单中的税后实际到账金额',summary:'已扣除个税与个人社保的虚构实发工资'});
        if(paidBonus)add(month+'-18',employer,'税后奖金',paidBonus,0,'operating',{incomeNature:'payroll',natureEvidence:'虚构奖金单中的税后实际到账金额'});
        salaryIncome=round(salaryIncome+paidSalary+paidBonus);revenue=round(paidSalary+paidBonus);
        sideClients.forEach((client,i)=>{
          // The delayed-payment scenario only includes actual receipts; uncollected fees are not invented.
          const received=money(sideBase*growth*[.45,.35,.2][i]*(scenarioIndex===1&&mi>=9?.65:.94),sideBase*growth*[.45,.35,.2][i]*(scenarioIndex===1&&mi>=9?.8:1.06));
          add(month+'-'+pad(14+i*4),client,profile.services[i+2],received,0,'operating',{summary:'副业服务税后实际收款，未到账金额不计入本期收入'});revenue=round(revenue+received);sidegigIncome=round(sidegigIncome+received);
        });
        const household=['住房支出','日常餐饮','通勤交通','生活用品','数字订阅','休闲学习'],weights=[.40,.23,.09,.12,.04,.12];
        household.forEach((category,i)=>{
          const amount=money(livingBase*weights[i]*(scenarioIndex===2?1+mi*.035:1)*.94,livingBase*weights[i]*(scenarioIndex===2?1+mi*.035:1)*1.06);
          const split=round(amount*.6),vendors=i===0?['居住租金','物业水电']:i===4?['影音服务','学习工具']:['日常商户甲','日常商户乙'];
          [split,round(amount-split)].forEach((payment,j)=>add(month+'-'+pad(16+i),vendors[j],category,0,payment,'operating',i===4?{subscription:true,subscriptionEvidence:'虚构按月续订记录'}:{}));
          expenses=round(expenses+amount);livingCost=round(livingCost+amount);
        });
        ['副业工具订阅','副业协作费用'].forEach((category,i)=>{
          const amount=money(i?500:200,i?1100:500);add(month+'-'+pad(25+i),i?'项目协作方':'创作工具服务',category,0,amount,'operating',i?{}:{subscription:true,subscriptionEvidence:'虚构副业工具按月续订'});cost=round(cost+amount);sidegigCost=round(sidegigCost+amount);
        });
      }else{
        if(mi===4){const amount=money(40000,80000);add(month+'-02','个人储蓄账户','追加投资本金',amount,0,'financing',{summary:'个人资金划入投资账户，增加投入本金，不属于投资收益'});capital=round(capital+amount);contributions=round(contributions+amount);}
        for(let j=0;j<2;j++){
          const h=holdings[(mi+j)%holdings.length],amount=money(5000,14000);add(month+'-'+pad(5+j*3),h.name,'投资本金买入',0,amount,'investing',{summary:'买入本金按成本增加持仓，不计入费用'});h.cost=round(h.cost+amount);totalPurchases=round(totalPurchases+amount);
        }
        const holding=holdings[(mi+2)%holdings.length],principal=Math.min(round(holding.cost*.20),money(14000,22000));
        let gainRate=scenarioIndex===0?.035+mi*.006:scenarioIndex===1?.025+random()*.025:scenarioIndex===2?-.035-mi*.003:.09*Math.sin(mi*1.2)-.01;
        const gain=round(principal*gainRate),settlementId='SALE-'+initialSeed+'-'+mi,proceeds=round(principal+gain),saleDate=month+'-20';
        add(saleDate,holding.name,'卖出收回本金',principal,0,'investing',{settlementId,settlementProceeds:proceeds,summary:'卖出结算按成本拆分本金 '+principal+' 与已实现损益 '+gain+'；该次实际结算 '+proceeds});
        if(gain!==0)add(saleDate,holding.name,gain>0?'投资已实现收益':'投资已实现亏损',Math.max(0,gain),Math.max(0,-gain),'operating',{settlementId,settlementProceeds:proceeds,summary:'同笔卖出结算中的已实现损益；本金另列投资现金流'});
        holding.cost=round(holding.cost-principal);totalSalePrincipal=round(totalSalePrincipal+principal);totalGains=round(totalGains+gain);revenue=round(revenue+Math.max(0,gain));cost=round(cost+Math.max(0,-gain));
        if(mi%3===2||scenarioIndex!==1){
          for(const h of holdings.slice(0,3)){
            const dividend=round(h.cost*(scenarioIndex===1?.004:.0025));add(month+'-24',h.name,'现金分红',dividend,0,'operating',{summary:'虚构投资组合实际到账的税后现金分红'});totalDividends=round(totalDividends+dividend);revenue=round(revenue+dividend);
          }
        }
        const interest=money(100,300);add(month+'-26','虚构储蓄账户','存款利息',interest,0,'operating',{summary:'实际到账的税后利息'});totalInterest=round(totalInterest+interest);revenue=round(revenue+interest);
        const fee=money(100,300),subscription=money(100,200);add(month+'-21','虚构交易服务','交易费用',0,fee);add(month+'-27','行情数据服务','行情工具订阅',0,subscription,'operating',{subscription:true,subscriptionEvidence:'虚构行情工具按月续订'});totalFees=round(totalFees+fee+subscription);expenses=round(fee+subscription);
      }
      p.profit.push({month,revenue,cost,expenses,tax:0,netProfit:round(revenue-cost-expenses),depreciation:0,paidOperatingCost:round(cost+expenses)});
    }
    p.cash.sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.id.localeCompare(b.id));
    let cash=p.openingCash;p.cash.forEach((row,i)=>{cash=round(cash+row.inflow-row.outflow);row.balance=cash;row.sourceRow=i+2;});
    const totalProfit=sum(p.profit,r=>r.netProfit),holdingsCost=sum(holdings,r=>r.cost),yearProfit=sum(p.profit.filter(r=>r.month.startsWith(String(year))),r=>r.netProfit),carry=round(totalProfit-yearProfit);
    p.balance=[{date:asOf,cash,receivables:0,inventory:0,fixedAssets:0,otherAssets:holdingsCost,payables:0,taxPayable:0,debt:0,otherLiabilities:0,capital,retainedEarnings:totalProfit}];
    p.distribution={carry,yearCarry:carry,openingCarry:0,dividends:0,yearDividends:0,reportDividends:0,adjustments:0,capital,netProfit:yearProfit,retained:yearProfit,distributable:totalProfit,reportNetProfit:totalProfit,periodLabel:year+'年1—'+endMonth+'月',reportPeriodLabel:months[0]+' — '+months[11],openingDate};
    const familyConfigs=investor?[['稳步积累','分红与已实现收益逐步积累'],['分红疏密变化','部分组合按季度分红，收入到账节奏变化'],['已实现亏损','部分卖出交易出现已实现亏损'],['收益波动','已实现损益随卖出交易而变化']]:[['收支改善','工资稳定，副业到账逐步增加'],['副业回款放慢','近期副业实际到账减少，未到账金额不计入收入'],['生活开支增加','生活支出逐步增加'],['副业波动','副业到账与奖金按月变化']];
    // A fully paid collection still belongs in the collection history. Derive it
    // from the same cash row, without inventing a receivable or recognizing income twice.
    // No contractual payment date was supplied for these cash-basis examples:
    // invoiceDate/dueDate are grouping compatibility fields, not a contractual term.
    const collected=p.cash.filter(row=>row.activity==='operating'&&row.inflow>0&&(!investor||['现金分红','存款利息'].includes(row.category)));
    p.ar=collected.map(row=>({id:'COLLECTION-'+row.id,customer:row.counterparty,category:row.category,invoiceDate:row.date,dueDate:row.date,receivedDate:row.date,amount:row.inflow,received:row.inflow,outstanding:0,payments:[{date:row.date,amount:row.inflow,cashId:row.id}],sourceCashId:row.id,recordType:'已到账收款记录',collectionOnly:true,termsKnown:false,termDays:null,actualAverageDays:null}));
    const clientNames=[...new Set(p.cash.filter(r=>r.activity==='operating'&&r.inflow>0).map(r=>r.counterparty))],costCategories=[...new Set(p.cash.filter(r=>r.activity==='operating'&&r.outflow>0).map(r=>r.category))];
    p.scenario={...config,label:familyConfigs[scenarioIndex][0],description:familyConfigs[scenarioIndex][1],family:profile.family,rotationGroup:profile.rotationGroup,seed:initialSeed,scenarioIndex,profileId:profile.id,profileIndex,business:profile.business,customerLabel:profile.customerLabel,recordDateLabel:profile.recordDateLabel,flexibleCategories:investor?['行情工具订阅']:['休闲学习','数字订阅','副业工具订阅'],clientNames,clients:clientNames.map(name=>({name,termDays:0})),services:profile.services.slice(),costCategories,invoiceCount:0,openingDate,openingCapital:initialCapital,equityFunding:contributions,unearnedRevenue:0,periodLabel:months[0]+' — '+months[11],taxAssumption:'采用虚构税后实际到账金额，不额外重复计提税费',fictional:true,generatorVersion:1};
    p.scenario.receivableBasis={mode:'settled-history',recordDateLabel:'到账日期',note:investor?'按已到账分红与利息展示收款历史；本金买卖和交易损益不作为应收款，未提供约定账期。':'按已到账工资、奖金与副业收入展示收款历史；不增加未到账应收，不推定约定账期。'};
    p.scenario.collectionCount=p.ar.length;
    if(investor)p.scenario.investment={openingPrincipal:initialCapital,openingHoldings,principalContributions:contributions,purchases:totalPurchases,salePrincipal:totalSalePrincipal,realizedGains:totalGains,dividends:totalDividends,interest:totalInterest,fees:totalFees,holdingsCost,holdings,netRealized:totalProfit,basis:'只计已实现损益、税后分红与利息；持仓按成本列示，未计市值浮动；本金划转不计收益'};
    else p.scenario.personal={salaryIncome,sidegigIncome,livingCost,sidegigCost,netSavings:totalProfit,basis:'税后到账收入与已支付支出；工资个人税费已扣，未到账副业收入不提前计入'};
    return p;
  }
  return Object.freeze({create,profiles:profiles.map(({id,business,suffix,customerLabel,recordDateLabel,family,rotationGroup})=>({id,business,suffix,customerLabel,recordDateLabel,family,rotationGroup})),scenarios:scenarios.map(s=>({...s}))});
});
