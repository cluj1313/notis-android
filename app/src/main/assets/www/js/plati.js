/* Notis module: plati — Plăți (tab kind util): UT_DEF, grupuri, migrări, plăți/alarme. See MODULES.md */
'use strict';
(function(){
var UT_DEF=[['parcare','Loc parcare'],['centrala','Verificare centrală'],['impcasa','Impozit casă'],['impmas','Impozit mașină'],['asigm','Asigurare mașină'],['itp','ITP'],['vigneta','Vignetă'],['crcasa','Credit Casă'],['crauto','Credit Auto'],['net','Internet'],['stream','Plăți streaming']].map(function(x){return [x[0],x[1],'','pay']}); /* v168: payment-by-month defaults */
var UT_OLD=[['curent','Curent','kWh','idx'],['gaz','Gaz','m³','idx'],['apa','Apă','m³','idx'],['gunoi','Gunoi','','pay'],['internet','Internet','','pay'],['media','Media','','pay']]; /* v168: removed defaults (kept in backup / UT.old) */
var UT_GONE=[['amanet','Amanet'],['cimitir','Cimitir'],['biserica','Biserică']]; /* v188: removed defaults; kept only where they hold user data */
function utDef(x){return{id:x[0],k:x[0],unit:x[2],mode:x[3],cur:NL==='ro'?'lei':'',rows:[],grp:'home'}}
/* v168: one-time migration. Old defaults leave the list; any that hold entries go to d.old (restorable, exported). Amanet / Asigurare AUTO keep their entries. */
function utMig(d){if(d.v>=168)return d;var f=function(x){return nFold(String(x||'')).trim().replace(/\s+/g,' ')},OK=UT_OLD.map(function(x){return x[0]});d.old=Array.isArray(d.old)?d.old:[];
 d.list=d.list.filter(function(u){if(OK.indexOf(u.k)<0)return true;if((u.rows||[]).length||u.rem){u.oldTs=Date.now();d.old.push(u)}return false});
 d.list.forEach(function(u){var n=f(u.name),k='';if(n==='amanet')k='amanet';else if(/^(asigurare (auto|masina|masinii)|rca)$/.test(n))k='asigm';if(k&&(!u.k||OK.indexOf(u.k)<0)){u.k=k;delete u.name;if(!(u.rows||[]).some(function(r){return r.b!=null&&r.b!==''}))u.mode='pay'}});
 var seen={};d.list=d.list.filter(function(u){if(!u.k||!UT_DEF.some(function(x){return x[0]===u.k}))return true;var p=seen[u.k];if(p){p.rows=(p.rows||[]).concat(u.rows||[]);if(!p.rem&&u.rem)p.rem=u.rem;return false}seen[u.k]=u;return true});
 var head=UT_DEF.map(function(x){return seen[x[0]]||utDef(x)});d.list=head.concat(d.list.filter(function(u){return head.indexOf(u)<0}));d.v=168;d.__m=1;return d}
/* v188: remove empty Amanet / Cimitir / Biserică (no rows, reminder, alarm, own name, own group); any with user data stay. Add the new defaults once. */
function utEmpty(u){return !(u.rows||[]).length&&!u.rem&&!u.al&&!u.name&&!u.g&&!(u.yrs||[]).length&&!u.yr}
function utMig188(d){if(d.v>=188)return d;var G=UT_GONE.map(function(x){return x[0]}),rm=[];
 d.list=d.list.filter(function(u){if(G.indexOf(u.k)>=0){rm.push(u.k);if(d.open)delete d.open[u.id];return false}return true});
 UT_DEF.forEach(function(x){if(['vigneta','crcasa','crauto','net','stream'].indexOf(x[0])>=0&&!d.list.some(function(u){return u.k===x[0]}))d.list.push(utDef(x))});
 try{LS.set('ns_util_mig188',{ts:Date.now(),removed:rm})}catch(_){}d.v=188;d.__m=1;return d}
/* v189: snapshot, then rename a user payment named RADP to APD (nothing else changes) */
function utMig189(d){if(d.v>=189)return d;try{LS.set('ns_util_bak188',JSON.parse(JSON.stringify(d)))}catch(_){}var n=0;
 d.list.forEach(function(u){if(typeof u.name==='string'&&/^\s*radp\s*$/i.test(u.name)){u.name='APD';n++}});d.v=189;d.__m=1;try{LS.set('ns_util_mig189',{ts:Date.now(),renamed:n})}catch(_){}return d}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function utLoad(){var d=LS.get('ns_util',null);var raw168=null;try{raw168=localStorage.getItem(PFX+'ns_util')}catch(_){}if(!d||!Array.isArray(d.list)){d={list:[],open:{}}}if(!d.open)d.open={};d.list.forEach(function(u){if(u.rem&&(u.rows||[]).length){if(u.rem.on){var L=uRows(u).filter(function(r){return !r.rem})[0];if(L)L.rem=u.rem;else return}delete u.rem}}); /* v70: utility-level reminder moves onto its most recent payment entry */
 if(!LS.get('ns_utg1',0)){try{var raw=localStorage.getItem('ns_util');if(raw)localStorage.setItem('ns_util_bak122',raw)}catch(_){}LS.set('ns_utg1',1)} /* v123: one-time raw backup before adding groups */
 d.list.forEach(function(u){if(u.grp!=='firm')u.grp='home'});if(d.sub!=='firm')d.sub='home'; /* v123: Acasă / Firmă — everything existing goes to Acasă, nothing removed */
 if(!(d.v>=168)&&raw168&&!LS.get('ns_util_bak168',null))try{LS.set('ns_util_bak168',{ts:Date.now(),data:raw168})}catch(_){} /* v168: full raw backup before the payment-by-month migration */
 if(!(d.v>=188)&&raw168&&!LS.get('ns_util_premig188',null))try{LS.set('ns_util_premig188',{ts:Date.now(),data:raw168})}catch(_){} /* v188: raw snapshot before the defaults change */
 d=utMig(d);d=utMig188(d);d=utMig189(d);d.list.forEach(utYearly);if(d.__m){delete d.__m;LS.set('ns_util',d)}return d}
function medNorm(d){if(!d||!Array.isArray(d.list))d={list:[]};if(!Array.isArray(d.persons)){d.persons=[{id:'me',k:'me'}];d.open=d.open||{};d.open.me=1} /* v65: persons — existing medicines move into the first person, nothing is dropped */
 if(!d.open)d.open={};if(!d.snz)d.snz={};var p0=d.persons[0];if(!d.info||typeof d.info!=='object')d.info={};if(!Array.isArray(d.lib))d.lib=[];if(!Array.isArray(d.alt))d.alt=[];if(!d.hist||typeof d.hist!=='object')d.hist={};if(!d.lo||typeof d.lo!=='object')d.lo={};if(!d.lopen)d.lopen={u:1,n:1,a:1}; /* v71: library (info per medicine name), alternative treatments, order */
 d.list.forEach(function(m){var mk=String(m.name||'').trim().toLowerCase();if(mk&&!d.hist[mk])d.hist[mk]=m.name;if(!m.rep&&!Array.isArray(m.pat)){var n=m.n||3,I=n===1?[0]:n===2?[0,2]:[0,1,2];m.pat=[0,1,2].map(function(i){return I.indexOf(i)>=0?1:0});if(m.c&&Array.isArray(m.c.s)){var o=m.c.s,ns=[];I.forEach(function(si,k){if(o[k])ns[si]=true});m.c.s=ns}}if(m.adm===undefined&&mk&&d.info[mk]&&d.info[mk].h)m.adm=String(d.info[mk].h); /* v125: administration prefilled from library */ /* v66: n → pattern 1-0-1; today's checks re-indexed by slot */if(!m.p||!d.persons.some(function(x){return x.id===m.p})){if(!p0){p0={id:'me',k:'me'};d.persons.push(p0);d.open.me=1}m.p=p0.id}
  if(!m.d0||!/^\d{4}-\d\d-\d\d$/.test(m.d0)){m.d0=(m.sch&&m.sch.d0)||mStart0(m);d.__d0=1}var c0=m.c&&m.c.d;mChk(m);if(c0&&c0!==m.c.d)d.__d0=1;});return d}
/* v160: start date for medicines saved before start dates existed = earliest of: creation time in the id, oldest dose history, today's check record; else today */
function mTreat0(pid){var t=today(),b=null;MED.list.forEach(function(m){if(m.p!==pid)return;var r=mRange(m);if(r[0]<=t&&r[1]>=t&&(!b||r[0]<b))b=r[0]});return b||t} /* v160: one start date for the whole running treatment (editable per medicine) */
function mStart0(m){var c=[],t=parseInt(String(m.id||'').slice(0,-4),36);if(t>15e11&&t<=Date.now())c.push(dkey(new Date(t)));Object.keys(m.h||{}).forEach(function(k){if(/^\d{4}-\d\d-\d\d$/.test(k))c.push(k)});if(m.c&&/^\d{4}-\d\d-\d\d$/.test(m.c.d||''))c.push(m.c.d);c.push(today());c.sort();return c[0]}
function medLoad(){var raw=LS.get('ns_med',null);try{if(raw&&LS.get('ns_med_bak',null)==null)LS.set('ns_med_bak',raw)}catch(_){}
 try{if(raw&&!LS.get('ns_med_bak160',null))LS.set('ns_med_bak160',{ts:Date.now(),data:raw})}catch(_){} /* v160: raw backup before the day-by-day view */
 var d=medNorm(raw);if(raw&&d.__d0){delete d.__d0;LS.set('ns_med',d)}else delete d.__d0;return d} /* v125: one-time raw backup before the card fields */
var UT=utLoad(),MED=medLoad();
/* v183: one-time — raw snapshot ns_med_premig183, settings templates for every medicine, Alternative 'Despre tratament' filled from old Simptome/Atenție (old fields kept) */
(function(){try{if(LS.get('ns_med_mig183',null))return;var raw=LS.get('ns_med',null);if(raw&&!LS.get('ns_med_premig183',null))LS.set('ns_med_premig183',{ts:Date.now(),data:raw});
 if(!MED.tpl||typeof MED.tpl!=='object')MED.tpl={};MED.list.forEach(function(m){var k=mKey(m.name);if(k&&!MED.tpl[k])MED.tpl[k]=mTplOf(m)});
 MED.alt.forEach(function(a){var i=a.info||{};if(!i.d&&(i.s||i.w)){i.d=[i.s?TR('Simptome')+': '+i.s:'',i.w?TR('Atenție')+': '+i.w:''].filter(Boolean).join('\n');a.info=i}});
 var L=libLists();LS.set('ns_med_mig183',{ts:Date.now(),act:L.u.map(function(x){return x.name}),moved:L.n.map(function(x){return x.name})});if(raw)LS.set('ns_med',MED)}catch(e){console.warn(e)}})();
function utSave(){LS.set('ns_util',UT);try{saveNotes(true)}catch(_){}} /* v191: push widget snapshot */
function medSave(){LS.set('ns_med',MED);try{saveNotes(true)}catch(_){}} /* saveNotes pushes the snapshot (native alarms) */
window.spReload=function(){UT=utLoad();MED=medLoad()};
window.spCollect=function(){var o={ns_util:JSON.parse(JSON.stringify(UT)),ns_med:JSON.parse(JSON.stringify(MED))},b=LS.get('ns_util_bak168',null);if(b)o.ns_util_bak168=b;return o};
window.spApply=function(d){if(d&&d.ns_util&&Array.isArray(d.ns_util.list)){if(d.ns_util_bak168&&d.ns_util_bak168.data&&!LS.get('ns_util_bak168',null))LS.set('ns_util_bak168',d.ns_util_bak168);UT=JSON.parse(JSON.stringify(d.ns_util));if(!UT.open)UT.open={};UT.list.forEach(function(u){if(u.grp!=='firm')u.grp='home'});if(UT.sub!=='firm')UT.sub='home';UT=utMig188(utMig(UT));delete UT.__m;UT.list.forEach(utYearly);utSave()}if(d&&d.ns_med&&Array.isArray(d.ns_med.list)){MED=medNorm(JSON.parse(JSON.stringify(d.ns_med)));medSave()}};
/* ---- tabs: one-time additive migration ---- */
window.spMigrate=function(){if(LS.get('ns_spmig1',0))return;var ch=false;
 function fit(kind,names,id,name,color){if(noteTabs.some(function(t){return t.kind===kind}))return;var f=noteTabs.filter(function(t){return names.indexOf(nFold(t.name).trim())>=0})[0]||(kind==='util'?noteTabs.filter(function(t){return t.id==='ut'&&!t.kind})[0]:null);
  if(f){f.kind=kind}else{var nid=id;while(findNT(nid))nid=id+Math.random().toString(36).slice(2,5);noteTabs.push({id:nid,name:TR(name),color:color,kind:kind})}ch=true}
 fit('util',['utilitati',nFold(TR('Utilități'))],'ut','Plăți','#5fd38d');fit('med',['medicamente',nFold(TR('Medicamente'))],'med','Medicamente','#ff8a65');
 LS.set('ns_spmig1',1);if(ch){LS.set('ns_notetabs',noteTabs)}};
function kindOf(){var t=findNT(noteTab);return t&&t.kind||''}
/* ---- small dialog ---- */
var dlg=null;
function dOpen(title,body,onSave,onDel){window.dOpen=dOpen;var m=$('spModal');m.querySelector('.sptitle').textContent=title;var b=m.querySelector('.spbody');b.innerHTML=body;
 b.querySelectorAll('datalist').forEach(function(x){x.remove()});b.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=time]):not([type=date]),textarea').forEach(function(x){x.removeAttribute('list');x.setAttribute('autocomplete','off');x.setAttribute('data-lpignore','true');x.setAttribute('data-form-type','other');x.setAttribute('autocorrect','off');if(x.tagName==='INPUT'){x.setAttribute('spellcheck','false');x.setAttribute('autocapitalize','sentences')}});
 $('spDel').style.display=onDel?'':'none';$('spDel').onclick=function(){if(onDel)onDel()};$('spSave').onclick=function(){if(onSave()!==false)jvClose('spModal')};$('spNo').onclick=function(){jvClose('spModal')};
 m.classList.add('show');return b}
function ask(txt,yes){var cf=$('cfModal').querySelector('.cftxt'),t0=cf.textContent,ok=$('cfOk'),no=$('cfNo'),o0=ok.textContent,n0=no.textContent;cf.textContent=TR(txt);ok.textContent=TR('Da');no.textContent=TR('Nu');
 var back=function(){cf.textContent=t0;ok.textContent=o0;no.textContent=n0};$('cfOk').onclick=function(){jvClose('cfModal');back();yes()};$('cfNo').onclick=function(){jvClose('cfModal');back()};$('cfModal').classList.add('show')}
function seg(id,opts,val){return '<div class="alseg" id="'+id+'">'+opts.map(function(o){return '<button type="button" class="btn'+(String(o[0])===String(val)?' on':'')+'" data-v="'+o[0]+'">'+o[1]+'</button>'}).join('')+'</div>'}
function segWire(id,cb){var s=$(id);s.onclick=function(e){var b=e.target.closest('button');if(!b)return;s.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});if(cb)cb(b.dataset.v)}}
function segVal(id){var b=$(id).querySelector('.on');return b?b.dataset.v:''}
function num(v){v=String(v==null?'':v).replace(',','.').trim();if(v==='')return NaN;return +v}
function fmt(n){if(n==null||isNaN(n))return '';try{return Number(n).toLocaleString(NL==='ro'?'ro-RO':NL,{maximumFractionDigits:3,useGrouping:false})}catch(_){return String(+(+n).toFixed(3))}}
function today(){return dkey(new Date())}
function dParse(s){var p=String(s||'').split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function monLbl(s){var d=dParse(s),m='';try{m=d.toLocaleDateString(NL==='ro'?'ro-RO':NL,{month:'short'}).replace('.','')}catch(_){m=String(d.getMonth()+1)}m=m.charAt(0).toUpperCase()+m.slice(1);return d.getFullYear()!==new Date().getFullYear()?m+' '+String(d.getFullYear()).slice(2):m}
function dLbl(s){return fDate(s)}
/* ---- Utilități ---- */
/* v69: payment reminder u.rem={on,iv:'1'|'2'|'3'|'6'|'12'|'d',days,next:'YYYY-MM-DD',hm,dom}. Months keep the day-of-month (clamped to month end); 'd' = every X days. */
function rAddM(ds,n,dom){var d=dParse(ds),y=d.getFullYear(),m=d.getMonth()+n;y+=Math.floor(m/12);m=((m%12)+12)%12;var last=new Date(y,m+1,0).getDate();return dkey(new Date(y,m,Math.min(dom||d.getDate(),last)))}
function rStep(r,ds){if(r.iv==='d'){var d=dParse(ds);d.setDate(d.getDate()+(Math.max(1,r.days|0)));return dkey(d)}return rAddM(ds,+r.iv||1,r.dom)}
function rAt(r){if(r.x&&r.x.at)return r.x.at;var p=(r.hm||'09:00').split(':'),d=dParse(r.next);d.setHours(+p[0],+p[1],0,0);return d.getTime()}
function rOn(r){return r&&r.on&&r.next}
function uDueAl(u){var R=(u.rows||[]).filter(function(r){return r.pd===0||r.pd===1});if(!R.length)return true;var lim=dkey(new Date(rAt(u.al)+31*864e5));return R.some(function(r){return r.pd===0&&r.d<=lim})} /* v168: utility alarm rings while a month due by the next alarm (+31 days) is unpaid */
function remH(){var o=[];UT.list.forEach(function(u){if(rOn(u.al)&&uDueAl(u))o.push({u:u,r:u.al,id:'payu-'+u.id,t:'💳 '+uName(u)+' — '+TR('plată')});if(rOn(u.rem))o.push({u:u,r:u.rem,id:'pay-'+u.id,t:'💳 '+uName(u)+' — '+TR('plată')});(u.rows||[]).forEach(function(w){if(rOn(w.rem))o.push({u:u,w:w,r:w.rem,id:'pay-'+u.id+'-'+w.id,t:'💳 '+uName(u)+(w.nt?' · '+w.nt:'')+' — '+fmt(w.amt)+(u.cur?' '+u.cur:'')})})});return o}
function rShort(r){return r.iv==='d'?(r.days|0)+(NL==='ro'?'z':TR('z')):(+r.iv||1)+(NL==='ro'?'L':TR('L'))}
function utRoll(){var now=Date.now(),ch=false;UT.list.forEach(function(u){if(utYearly(u))ch=true});remH().forEach(function(h){var r=h.r,at=rAt(r),k=0;if(at>now)return;
  if(now-at<5*60000&&window.alFire&&!(window.NotisNative&&h.r===h.u.al)&&!utRoll.f[h.id+at]){utRoll.f[h.id+at]=1;try{window.alFire({id:h.id,text:h.t,med:1},null)}catch(_){}} /* v168: inside the Android app utility alarms ring natively only (one source) */
  if(r.x){if(!r.x.rep){r.on=0}else{var nx=alRollA(r.x,at,now);if(nx<=now||(r.x.until&&nx>r.x.until))r.on=0;else{r.x.at=nx;r.x.snz=null;uaSync(r)}}ch=true;return} /* v212: notes-style alarm x (same engine as notes) */
  if(r.once){r.on=0;ch=true;return}
  while(rAt(r)<=now&&k++<2400)r.next=rStep(r,r.next);ch=true});if(ch)utSave();return ch}
utRoll.f={};
window.payAlarms=function(){var out=[];if(!noteTabs.some(function(t){return t.kind==='util'}))return out;utRoll();remH().forEach(function(h){var r=h.r;
  var a={id:h.id,text:h.t,at:rAt(r),rep:0};if(r.x){a.rep=r.x.rep||0;['rd','wd','repM','dom','until'].forEach(function(k){if(r.x[k])a[k]=r.x[k]})}else if(r.once){}else if(r.iv==='d')a.rep=Math.max(1,r.days|0)*1440;else{a.repM=+r.iv||1;a.dom=r.dom||dParse(r.next).getDate()}out.push(a)});return out};
function uName(u){return u.name||TR((UT_DEF.concat(UT_OLD,UT_GONE).filter(function(x){return x[0]===u.k})[0]||[0,'?'])[1])}
function uRows(u){return (u.rows||[]).slice().sort(function(a,b){return String(b.d).localeCompare(String(a.d))||(b.ts||0)-(a.ts||0)})}
function rY(r){var y=String(r&&r.d||'').slice(0,4);return /^\d{4}$/.test(y)?+y:new Date().getFullYear()}
function uYears(u){var S={};(u.rows||[]).forEach(function(r){S[rY(r)]=1});(u.yrs||[]).forEach(function(y){S[y]=1});if(!Object.keys(S).length)S[new Date().getFullYear()]=1;return Object.keys(S).map(Number).sort(function(a,b){return a-b})} /* v168: chronological */
function uNext(u){return (u.rows||[]).filter(function(r){return r.pd===0}).sort(function(a,b){return String(a.d).localeCompare(String(b.d))})[0]||null}
function uSt(R){var t=today(),late=0,due=0,pd=0;R.forEach(function(r){if(r.pd===0&&r.d<t)late++;if(r.d<=t&&(r.pd===0||r.pd===1)){due++;if(r.pd===1)pd++}});return{late:late,ok:due>0&&pd===due}}
function stCls(s){return s.late?' stlate':s.ok?' stok':''}
function stB(s){return s.late?'<span class="spst" aria-label="'+esc(TR('Neachitat'))+'">'+s.late+'</span>':''}
function utYearly(u){if(!u||!u.yr)return false;var R=(u.rows||[]).filter(function(r){return r.amt!=null&&r.amt!==''}).sort(function(a,b){return String(a.d).localeCompare(String(b.d))}),L=R[R.length-1],ch=false,k=0;
 while(L&&(L.pd===1||+String(L.d).slice(0,4)<new Date().getFullYear())&&k++<60){var n={id:uid(),d:rAddM(L.d,12,u.dom||dParse(L.d).getDate()),amt:L.amt,pd:0,ts:Date.now()+k,auto:1};u.rows.push(n);L=n;ch=true}return ch} /* v168: yearly repeat — next year's row appears once this one is paid, or when its year is already over */
function yOpen(u,y){var k=u.id+'|'+y;UT.yo=UT.yo||{};if(k in UT.yo)return !!UT.yo[k];var n=uNext(u),Y=uYears(u),cy=new Date().getFullYear();return y===(n?rY(n):Y.indexOf(cy)>=0?cy:Y[Y.length-1])}
function uUnp(u){var t=0,n=0;(u.rows||[]).forEach(function(r){if(r.pd===0&&!isNaN(+r.amt)&&r.amt!==''&&r.amt!=null){t+=+r.amt;n++}});return n?t:null}
function pdBtn(r){return '<button type="button" class="sppd ux'+(r.pd===0?' no':'')+'" data-a="pd" aria-label="'+esc(TR(r.pd===0?'Neachitat':'Achitat'))+'">'+(r.pd===0?'○':'✓')+'</button>'}
function utRender(){var AFM=window.afMode?afMode('ut'):'both';if(AFM!=='both')UT.sub=AFM;var h='<div class="spv sput">'+(AFM==='both'?seg('utSub',[['home',TR('Acasă')],['firm',TR('Firmă')]],UT.sub).replace('class="alseg"','class="alseg utsub"'):''),t=today();
 if(UT.old&&UT.old.length&&!UT.oldSeen)h+='<div class="spinfo ux">ℹ️ '+esc(TR('Utilitățile vechi cu înregistrări sunt păstrate în copia de siguranță'))+': '+esc(UT.old.map(function(u){return uName(u)+' ('+(u.rows||[]).length+')'}).join(', '))+'<button type="button" class="btn" data-a="oldok">OK</button></div>';
 var H0=h,SC=[];UT.list.filter(function(u){return u.grp===UT.sub}).forEach(function(u){h='';var o=!!UT.open[u.id],R=uRows(u),st=uSt(R),pay=u.mode!=='idx',nx=uNext(u);
 h+='<div class="spsec'+(o?' open':'')+'" data-u="'+esc(u.id)+'"><div class="sphd" data-a="tog"><span class="spnm'+(u.name?' ux':'')+stCls(st)+'">'+esc(uName(u))+'</span>'+stB(st)+(rOn(u.al)?'<span class="spal" aria-hidden="true">⏰</span>':'')+'<button type="button" class="spgear" data-a="cfg" aria-label="Setări">⚙</button><i class="sparr"></i></div>';
 if(o){h+='<div class="spbd">'+(rOn(u.al)?'<div class="spalx">⏰ '+esc(uaSum(uaX(u.al)))+'</div>':'');uYears(u).forEach(function(y){var YR=R.filter(function(r){return rY(r)===y}).reverse(),yo=yOpen(u,y),ys=uSt(YR);h+='<div class="spyr'+(yo?' open':'')+'" data-y="'+y+'"><div class="spyh" data-a="ytog"><span class="ux'+stCls(ys)+'">'+esc(uName(u))+' '+y+'</span>'+stB(ys)+'<i class="sparr"></i></div>';if(yo){YR.forEach(function(r){
   var hp=r.pd===0||r.pd===1,hm=r.amt!=null&&r.amt!==''&&!isNaN(+r.amt),uc=r.pd===0?' unpd':'';
   if(!pay)h+='<div class="sprow idx ux'+uc+'" data-r="'+esc(r.id)+'"><span class="c0">'+esc(monLbl(r.d))+'</span><span class="c1">'+fmt(r.a)+'</span><span class="c2">'+fmt(r.b)+'</span><span class="c3">'+(isNaN(r.b-r.a)?'':fmt(Math.round((r.b-r.a)*1000)/1000)+' '+esc(u.unit||''))+'</span>'+'<button type="button" class="spshr" data-a="shr" aria-label="Share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/></svg></button>'+(hm||hp?'<span class="spsub">'+(hm?fmt(r.amt)+' '+esc(u.cur||''):'')+(hp?pdBtn(r):'')+'</span>':'')+'</div>';
   else h+='<div class="sprow spmo'+(r.pd===1?' paid':r.pd===0&&r.d<t?' late':'')+(nx===r?' spnext':'')+'" data-r="'+esc(r.id)+'"><span class="spmd">'+esc(dLbl(r.d))+(r.nt?' <span class="spnt ux">'+esc(r.nt)+'</span>':'')+'</span><span class="spma ux">'+(hm?fmt(r.amt)+(u.cur?' '+esc(u.cur):''):'')+'</span><button type="button" class="mdck spck'+(r.pd===1?' on':'')+'" data-a="pd" role="checkbox" aria-checked="'+(r.pd===1)+'" aria-label="'+esc(TR('Achitat'))+'"></button></div>'});
  if(!YR.length)h+='<div class="spempty">Nicio înregistrare.</div>';
  h+='<button type="button" class="btn spadd" data-a="add" data-y="'+y+'">+ '+(pay?TR('Adaugă plată'):TR('Adaugă citire'))+'</button>'}h+='</div>'});h+=(pay?'<button type="button" class="btn spadd spplan" data-a="plan">+ '+esc(TR('Plan de plată'))+'</button>':'')+'</div>'}
 h+='</div>';SC.push([u,h])});h=H0+utGrp(SC);
 return h+'<button type="button" class="btn spnew" data-a="unew">+ Utilitate nouă</button>'+(window.afSel?afSel('ut'):'')+'</div>'}
/* v183: Plăți groups (Impozite / Verificări / Auto); the rest stay loose, in order */
var UTG=[['auto','Auto',['asigm','itp','vigneta','parcare']],['ver','Verificări',['centrala']],['imp','Impozite',['impcasa','impmas']],['cred','Credite',['crcasa','crauto']]]; /* v189: groups first in this order, then the loose payments */ /* v188: Vignetă + Credite */
function utGL(){var L=UTG.map(function(G){return {id:G[0],name:G[1],b:1,k:G[2]}});(UT.grps||[]).forEach(function(g){if(g&&g.id)L.push({id:g.id,name:g.name||'',b:0,k:[]})});return L}
function utGOf(u,L){if(u.g==='-')return null;var x=null;if(u.g){x=L.filter(function(G){return G.id===u.g})[0];if(x)return x}return L.filter(function(G){return G.b&&G.k.indexOf(u.k)>=0})[0]||null}
function utGrp(SC){var o='',done={},L=utGL();UT.gopen=UT.gopen||{};
 var hd=function(g,op){return '<div class="spgrp'+(op?' open':'')+'" data-g="'+esc(g.id)+'"><div class="spghd" role="button" aria-expanded="'+op+'"><span class="spgnm">'+esc(g.b?TR(g.name):g.name)+'</span><button type="button" class="spgear" data-ug="cfg" data-gid="'+esc(g.id)+'" aria-label="'+esc(TR('Setări'))+'">⚙</button><i class="sparr" aria-hidden="true"></i></div>'};
 var loose='';SC.forEach(function(x){if(!utGOf(x[0],L))loose+=x[1]});
 L.forEach(function(g){var M=SC.filter(function(y){var gy=utGOf(y[0],L);return gy&&gy.id===g.id});if(!M.length&&g.b)return;done[g.id]=1;var op=!!UT.gopen[g.id];
  o+=hd(g,op)+(op?'<div class="spgbd">'+(M.length?M.map(function(y){return y[1]}).join(''):'<div class="spempty">'+esc(TR('Grup gol'))+'</div>')+'</div>':'')+'</div>'});
 o+=loose;
 return o+'<button type="button" class="btn spadd spgnew" data-ug="new">+ '+esc(TR('Grup nou'))+'</button>'}
/* v183: own groups — name, rename, delete (Da/Nu), choose which payments belong */
function utGCfg(gid){var L=utGL(),g=gid?L.filter(function(G){return G.id===gid})[0]:null;if(gid&&!g)return;var isNew=!g,cust=isNew||!g.b;
 var us=UT.list.filter(function(u){return u.grp===UT.sub});
 var body=(cust?'<div class="field"><label>'+esc(TR('Nume grup'))+'</label><input id="ugN" value="'+esc(g?g.name:'')+'"></div>':'')+'<div class="field"><label>'+esc(TR('Plăți în grup'))+'</label>'+us.map(function(u){var gg=utGOf(u,L),on=g&&gg&&gg.id===g.id;return '<label class="mdal"><input type="checkbox" data-ugu="'+esc(u.id)+'"'+(on?' checked':'')+'> '+esc(uName(u))+'</label>'}).join('')+'</div>';
 dOpen(isNew?TR('Grup nou'):(g.b?TR(g.name):g.name),body,function(){var id=g?g.id:'ug'+uid();if(cust){var nm=($('ugN').value||'').trim();if(!nm){toast(TR('Scrie un nume'));return false}UT.grps=UT.grps||[];if(isNew)UT.grps.push({id:id,name:nm});else UT.grps.forEach(function(x){if(x.id===id)x.name=nm})}
  document.querySelectorAll('#spModal [data-ugu]').forEach(function(c){var u=uFind(c.dataset.ugu);if(!u)return;var gg=utGOf(u,utGL()),inG=gg&&gg.id===id;if(c.checked&&!inG)u.g=id;else if(!c.checked&&inG)u.g='-'});
  UT.gopen=UT.gopen||{};UT.gopen[id]=1;utSave();try{saveNotes(true)}catch(_){}spRender()},
  cust&&!isNew?function(){var go=function(){UT.grps=(UT.grps||[]).filter(function(x){return x.id!==g.id});UT.list.forEach(function(u){if(u.g===g.id)delete u.g});if(UT.gopen)delete UT.gopen[g.id];utSave();try{saveNotes(true)}catch(_){}spRender()};if(typeof ask==='function')ask('Ștergi grupul? Plățile rămân, doar ies din grup.',go);else if(confirm(TR('Ștergi grupul?')))go()}:null)}
document.addEventListener('click',function(e){var v=$('spView');if(!v||!v.contains(e.target))return;var b=e.target.closest('[data-ug]');if(!b)return;e.stopPropagation();e.preventDefault();utGCfg(b.dataset.ug==='new'?null:b.dataset.gid)},true);
window.utGCfg=utGCfg;
window.UTX={get:function(){return UT},save:utSave};
function utScroll(id){setTimeout(function(){var v=$('spView');if(!v)return;var e=null;v.querySelectorAll('.spsec').forEach(function(x){if(x.dataset.u===id)e=x.querySelector('.spyr.open .spnext')});if(e&&e.scrollIntoView)e.scrollIntoView({block:'center'})},60)} /* v168: next unpaid month in view */
/* v168: payment plan — first date, amount (monthly rate or total), number of installments → monthly rows (same day, clamped to month end) */
function utPlanRows(d0,amt,n,tot){n=Math.max(1,Math.min(360,n|0));var dom=dParse(d0).getDate(),c=Math.round(amt*100),per=tot?Math.floor(c/n):c,o=[];for(var i=0;i<n;i++)o.push({d:rAddM(d0,i,dom),amt:(tot&&i===n-1?c-per*(n-1):per)/100});return o}
window.utPlanRows=utPlanRows;
function utPlan(u){var cur=u.cur||'';dOpen(TR('Plan de plată')+' · '+uName(u),'<div class="field"><label>'+esc(TR('Prima dată'))+'</label><input type="date" id="plD" value="'+today()+'"></div>'+seg('plM',[['m',TR('Rată lunară')],['t',TR('Sumă totală')]],'m')+
  '<div class="al2" style="margin-top:10px"><div class="field"><label>'+esc(TR('Sumă'))+'</label><input id="plA" inputmode="decimal"></div><div class="field"><label>'+esc(TR('Număr de rate'))+'</label><input id="plN" type="number" min="1" max="360" inputmode="numeric" value="1"></div></div><div class="spdiff ux" id="plP"></div><label class="mdal"><input type="checkbox" id="plY"'+(u.yr?' checked':'')+'> '+esc(TR('Se repetă anual'))+'</label>',
  function(){var d=$('plD').value,a=num($('plA').value),n=parseInt($('plN').value,10);if(!d){toast(TR('Alege data'));return false}if(isNaN(a)||a<0){toast(TR('Sumă invalidă'));return false}if(!(n>=1&&n<=360)){toast(TR('Număr de rate'));return false}
   var R=utPlanRows(d,a,n,segVal('plM')==='t'),pid=uid();u.rows=u.rows||[];R.forEach(function(x,i){u.rows.push({id:uid()+i,d:x.d,amt:x.amt,pd:0,ts:Date.now()+i,pl:pid})});u.dom=dParse(d).getDate();u.yr=$('plY').checked?1:0;u.mode='pay';utYearly(u);
   UT.open[u.id]=1;UT.yo=UT.yo||{};UT.yo[u.id+'|'+rY({d:d})]=1;utSave();utRoll();try{saveNotes(true)}catch(_){}spRender();utScroll(u.id)},null);
 var pv=function(){var a=num($('plA').value),n=parseInt($('plN').value,10);if(isNaN(a)||!(n>=1)){$('plP').textContent='';return}var R=utPlanRows($('plD').value||today(),a,n,segVal('plM')==='t');$('plP').textContent=n+' × '+fmt(R[0].amt)+(cur?' '+cur:'')+(n>1?' → '+fDate(R[n-1].d):'')};
 segWire('plM',pv);$('plA').oninput=$('plN').oninput=$('plD').onchange=pv}
function uFind(id){return UT.list.filter(function(u){return u.id===id})[0]}
function utRow(u,r,yy){var idx=u.mode==='idx',last=uRows(u)[0],isNew=!r,td=today();if(yy&&+td.slice(0,4)!==+yy)td=yy+td.slice(4).replace('-02-29','-02-28');r=r||{id:uid(),d:td,a:last&&!isNaN(last.b)?last.b:'',b:'',amt:''};
 var b=dOpen(TR(idx?'Citire':'Plată')+' · '+uName(u),'<div class="field"><label>Dată</label><input type="date" id="spD" value="'+esc(r.d)+'"></div>'+
  (idx?'<div class="al2"><div class="field"><label>Index anterior</label><input id="spA" inputmode="decimal" value="'+esc(r.a==null?'':r.a)+'"></div><div class="field"><label>Index actual</label><input id="spB" inputmode="decimal" value="'+esc(r.b==null?'':r.b)+'"></div></div><div class="spdiff ux" id="spDf"></div><div class="field"><label>Sumă (opțional)</label><input id="spM" inputmode="decimal" value="'+esc(r.amt==null?'':r.amt)+'"></div>'+pdBlk(r,isNew)
   :'<div class="field"><label>Sumă</label><input id="spM" inputmode="decimal" value="'+esc(r.amt==null?'':r.amt)+'"></div><div class="field"><label>Notă (opțional)</label><input id="spNt" maxlength="30" value="'+esc(r.nt||'')+'"></div>'+pdBlk(r,isNew)+remBlk(r.rem,r.d)),
  function(){var d=$('spD').value||today();if(idx){var a=num($('spA').value),bb=num($('spB').value);if(isNaN(bb)||(!isNaN(a)&&false)){toast(TR('Index invalid'));return false}r.a=isNaN(a)?null:a;r.b=bb;var mv=$('spM').value.trim(),m2=num(mv);if(mv&&isNaN(m2)){toast(TR('Sumă invalidă'));return false}if(mv){r.amt=m2;r.pd=$('spPd').checked?1:0}else{delete r.amt;if($('spPd').checked||r.pd!=null)r.pd=$('spPd').checked?1:0}}
   else{var m=num($('spM').value);if(isNaN(m)){toast(TR('Sumă invalidă'));return false}var rr=remRead();if(rr===false)return false;r.amt=m;r.pd=$('spPd').checked?1:0;r.nt=$('spNt').value.trim()||undefined;if(rr)r.rem=rr;else if(r.rem)r.rem.on=0}r.d=d;if(isNew){r.ts=Date.now();u.rows.push(r)}utSave();if(!idx){utRoll();try{saveNotes(true)}catch(_){}if(rOn(r.rem))try{alPerm()}catch(_){}}spRender()},
  isNew?null:function(){ask('Ștergi rândul?',function(){u.rows=u.rows.filter(function(x){return x!==r});utSave();jvClose('spModal');spRender()})});
 if(idx){var up=function(){var a=num($('spA').value),bb=num($('spB').value);$('spDf').textContent=isNaN(a)||isNaN(bb)?'':'= '+fmt(Math.round((bb-a)*1000)/1000)+' '+(u.unit||'')};$('spA').oninput=$('spB').oninput=up;up();setTimeout(function(){(isNew?$('spB'):$('spB')).focus()},80)}else remWire()}
function pdBlk(r,isNew){var on=isNew?false:r.pd!==0;return '<label class="mdal sppdl"><input type="checkbox" id="spPd"'+(on?' checked':'')+'> '+TR('Achitat')+'</label>'}
function remBlk(rm,d){rm=rm||{iv:'1',hm:'09:00'};var nx=rm.next||rStep({iv:rm.iv||'1',days:rm.days||30},d||today());
 return '<label class="mdal sprem"><input type="checkbox" id="spRo"'+(rm.on?' checked':'')+'> ⏰ Reamintire</label><div id="spRb">'+seg('spRi',[['1',TR('Lunar')],['2',TR('La 2 luni')],['3',TR('La 3 luni')],['6',TR('La 6 luni')],['12',TR('Anual')],['d',TR('La fiecare X zile')]],rm.iv||'1')+
  '<div class="field" id="spRdf"><label>Zile</label><input id="spRd" type="number" min="1" max="3650" inputmode="numeric" value="'+(rm.days||30)+'"></div><div class="al2"><div class="field"><label>Următoarea plată</label><input type="date" id="spRn" value="'+esc(nx)+'"'+(rm.next?' data-ed="1"':'')+'></div><div class="field"><label>Ora</label><input type="time" id="spRh" value="'+esc(rm.hm||'09:00')+'"></div></div></div>'}
function remWire(){var auto=function(){var n=$('spRn');if(n.dataset.ed)return;var iv=segVal('spRi')||'1';n.value=rStep({iv:iv,days:parseInt($('spRd').value,10)||30},$('spD').value||today())};
 var uv=function(){$('spRb').style.display=$('spRo').checked?'':'none';$('spRdf').style.display=segVal('spRi')==='d'?'':'none';auto()};
 segWire('spRi',uv);$('spRo').onchange=uv;$('spD').addEventListener('change',auto);$('spRd').oninput=auto;$('spRn').onchange=function(){this.dataset.ed='1'};uv()}
function remRead(){if(!$('spRo').checked)return null;var iv=segVal('spRi')||'1',nx=$('spRn').value;if(!nx){toast(TR('Alege data'));return false}var dd=parseInt($('spRd').value,10);if(iv==='d'&&!(dd>0)){toast(TR('Alege data'));return false}
 return{on:1,iv:iv,days:iv==='d'?Math.min(3650,dd):undefined,next:nx,hm:$('spRh').value||'09:00',dom:dParse(nx).getDate()}}
function utCfg(u){var isNew=!u;u=u||{id:uid(),name:'',unit:'',mode:'idx',cur:'lei',rows:[],grp:UT.sub};var rm=u.rem||{iv:'1',hm:'09:00',next:''};if(!rm.next){var dn=new Date();dn.setMonth(dn.getMonth()+1);rm.next=dkey(dn)}
 dOpen(isNew?TR('Utilitate nouă'):uName(u),'<div class="field"><label>Nume</label><input id="spN" maxlength="30" value="'+esc(uName(u)==='?'?'':uName(u))+'"></div>'+seg('spMd',[['idx',TR('Cu index')],['pay',TR('Doar plată')]],u.mode)+
  '<div style="margin-top:10px">'+seg('spGr',[['home',TR('Acasă')],['firm',TR('Firmă')]],u.grp||'home')+'</div><div class="al2" style="margin-top:12px"><div class="field" id="spUf"><label>Unitate</label><input id="spU" maxlength="10" value="'+esc(u.unit||'')+'"></div><div class="field"><label>Monedă</label><input id="spC" maxlength="10" value="'+esc(u.cur||'')+'"></div></div>'+uaBlk(u),
  function(){var n=$('spN').value.trim();if(!n){toast(TR('Numele e obligatoriu'));return false}var ua=uaRead();if(ua===false)return false;if(ua==='keep'){}else if(ua)u.al=ua;else if(u.al)u.al.on=0;if(isNew||n!==uName(u))u.name=n;u.mode=segVal('spMd')||'idx';if(u.mode==='idx'||isNew)u.unit=$('spU').value.trim();u.cur=$('spC').value.trim();u.grp=segVal('spGr')==='firm'?'firm':'home';if(u.grp!==UT.sub)UT.sub=u.grp;
   if(isNew){UT.list.push(u);UT.open[u.id]=1}utSave();utRoll();try{saveNotes(true)}catch(_){}if(rOn(u.al))try{alPerm()}catch(_){}spRender()},
  isNew?null:function(){ask('Ștergi utilitatea?',function(){UT.list=UT.list.filter(function(x){return x!==u});delete UT.open[u.id];utSave();jvClose('spModal');spRender()})});
 if(isNew)$('spN').value='';var uv=function(){$('spUf').style.display=segVal('spMd')==='pay'?'none':''};
 segWire('spMd',uv);segWire('spGr');uv();uaWire()}
/* v168: per-utility payment alarm u.al={on,ev:'0'|'d'|'m',n,next,hm,dom,iv,days,once} — reuses the reminder engine (remH/payAlarms) */
/* v212: the payment alarm uses the notes alarm dialog (#alModal: Data și ora, Unic/Ore/Zile/Custom, weekdays, Sfârșit). Stored as u.al={on,x:<notes alarm>,next,hm,once}; old u.al (ev/iv/days) keeps working and is converted only when edited. */
var UAD=null;
function uaX(al){if(!al||!al.on||!al.next)return null;if(al.x)return JSON.parse(JSON.stringify(al.x));var at=rAt(al);if(al.once)return{at:at,rep:0,until:null,snz:null};if(al.iv==='d'){var n=Math.max(1,al.days|0);return{at:at,rep:n*1440,rd:n,until:null,snz:null}}var m=Math.max(1,+al.iv||1);return{at:at,rep:m*43200,repM:m,dom:al.dom||dParse(al.next).getDate(),cu:{n:m,u:'mo'},until:null,snz:null}}
function uaSync(r){var d=new Date(r.x.at);r.next=dkey(d);r.hm=pad(d.getHours())+':'+pad(d.getMinutes());r.once=r.x.rep?0:1;if(r.x.repM)r.dom=r.x.dom}
function uaSum(x){if(!x)return '';var s=fDate(new Date(x.at),1)+' · '+(x.rep?alRepTxt(x):TR('Unic'));if(x.rep&&x.until)s+=' · '+TR('Până la…').replace('…','').trim()+' '+fDate(new Date(x.until),1);return s}
function uaBlk(u){var nx=uNext(u),d=nx&&nx.d>=today()?nx.d:today(),p=d.split('-');UAD={u:u,text:uName(u),alarm:uaX(u.al),dirty:0,alDef:new Date(+p[0],+p[1]-1,+p[2],9,0,0,0).getTime()};if(UAD.alDef<Date.now())UAD.alDef=Date.now()+3600000-Date.now()%60000;
 return '<label class="mdal sprem"><input type="checkbox" id="uaO"'+(UAD.alarm?' checked':'')+'> ⏰ '+esc(TR('Alarmă de plată'))+'</label><button type="button" class="btn uasum" id="uaS"></button>'}
window.uaDraft=function(){if(!UAD)return null;var n=$('spN');UAD.text=(n&&n.value.trim())||uName(UAD.u);return UAD};
window.uaDone=function(){if(!UAD)return;UAD.dirty=1;uaUI()};
function uaUI(){var b=$('uaS'),o=$('uaO');if(!b||!UAD)return;if(!UAD.alarm)o.checked=false;b.style.display=o.checked?'':'none';b.textContent=UAD.alarm?'⏰ '+uaSum(UAD.alarm):''}
function uaWire(){var o=$('uaO');o.onchange=function(){UAD.dirty=1;if(o.checked&&!UAD.alarm){uaUI();o.checked=true;openAlarm({k:'u'})}else uaUI()};$('uaS').onclick=function(){openAlarm({k:'u'})};
 if(!uaWire.mo){uaWire.mo=new MutationObserver(function(){if(!$('alModal').classList.contains('show'))setTimeout(uaUI,0)});uaWire.mo.observe($('alModal'),{attributes:true,attributeFilter:['class']})}uaUI()}
function uaRead(){if(!$('uaO').checked||!UAD.alarm)return null;if(!UAD.dirty&&rOn(UAD.u.al))return 'keep';var r={on:1,x:JSON.parse(JSON.stringify(UAD.alarm))};uaSync(r);return r}
function utAl(nx,hm,ev,n){return{on:1,ev:ev,n:ev==='0'?undefined:n,next:nx,hm:hm,dom:dParse(nx).getDate(),iv:ev==='d'?'d':String(ev==='m'?n:1),days:ev==='d'?n:undefined,once:ev==='0'?1:0}}
window.utDbg={get UT(){return UT},save:function(){utSave()},render:function(){spRender()},roll:function(){utRoll()}};window.utAlDbg={mk:utAl,step:function(r,d){return rStep(r,d)},list:function(){return payAlarms()},rem:function(){return remH().map(function(h){return h.id})}};
/* ---- Medicamente ---- */
var SLOT=['Dimineață','Amiază','Seară'];
function mSlots(m){if(m.rep>0){var st=m.st||'08:00',p=st.split(':'),t0=+p[0]*60+(+p[1]),k=Math.max(1,Math.min(6,Math.floor(24/m.rep))),a=[];for(var i=0;i<k;i++){var x=(t0+i*m.rep*60)%1440;a.push({lbl:pad(Math.floor(x/60))+':'+pad(x%60),t:pad(Math.floor(x/60))+':'+pad(x%60),al:!!m.ral})}return a}
 var idx=[0,1,2].filter(function(i){return (m.pat||[1,1,1])[i]});return idx.map(function(i){var t=(m.t||[])[i];return{s:i,lbl:t||TR(SLOT[i]),t:t||'',al:!!(m.al||[])[i]&&!!t}})}
function mChk(m){var d=today();if(!m.c||m.c.d!==d){if(m.c&&m.c.d&&(m.c.s||[]).some(Boolean)){m.h=m.h||{};m.h[m.c.d]=m.c.s;var ks=Object.keys(m.h).sort();while(ks.length>90)delete m.h[ks.shift()]}m.c={d:d,s:[]}}return m.c}
function pName(p){return p.name||TR('Eu')}
function pFind(id){return MED.persons.filter(function(p){return p.id===id})[0]}
function medRender(){if(VLIB)return libRender();var h='<div class="spv spmed">'+(MED.persons.length?'':'<div class="mdtop"><button type="button" class="mdall" data-a="lib">Toate</button></div>');MED.persons.forEach(function(p,pi){var o=!!MED.open[p.id],L=MED.list.filter(function(m){return m.p===p.id});
 h+='<div class="spsec mdper'+(o?' open':'')+'" data-p="'+esc(p.id)+'"><div class="sphd" data-a="ptog"><span class="spnm'+(p.name?' ux':'')+'">'+esc(pName(p))+'</span>'+(pi?'':'<button type="button" class="mdall mdin" data-a="lib">Toate</button>')+(o?'':'<span class="spcnt">'+(L.length||'')+'</span>')+(o?'<button type="button" class="spgear" data-a="pcfg" aria-label="Setări">⚙</button>':'')+'<i class="sparr"></i></div>';
 if(o){h+='<div class="spbd">'+medDays(L,p)+'<button type="button" class="btn spadd" data-a="mnew">+ Medicament nou</button></div>'}h+='</div>'});
 return h+'<button type="button" class="btn spnew spplus" data-a="pnew" aria-label="Persoană nouă" title="Persoană nouă">+</button></div>'} /* v68: collapsed = name only; '+' person under the list; gear only when open; long-press name = settings */
function mDays(m){if(!(m.days>0))return null;var a=dParse(m.d0||today()),b=dParse(today()),e=Math.round((b-a)/864e5)+1;return{t:m.days,e:Math.max(0,Math.min(m.days,e)),f:e>=m.days}}
/* v160: day-by-day treatment view — one row per day across the union of all medicines' days; tap the date = open/close; round check = all doses of the day taken (auto), red = no medicine that day */
var MDO={},MDCEN='';
function dAdd(k,n){var d=dParse(k);d.setDate(d.getDate()+n);return dkey(d)}
function mRange(m){var a=m.d0||(m.sch&&m.sch.d0)||today();return [a,m.days>0?dAdd(a,m.days-1):(dAdd(today(),7)>a?dAdd(today(),7):dAdd(a,7))]} /* no duration = ongoing: shown until a week ahead */
function mOn(m,k){var r=mRange(m);return k>=r[0]&&k<=r[1]&&mDue(m,k)}
function mReq(m){if(m.rep>0)return mSlots(m).map(function(_,i){return i});var P=m.pat||[1,1,1];return [0,1,2].filter(function(i){return P[i]})}
function mS(m,k,w){if(k===today())return mChk(m).s;m.h=m.h||{};var s=m.h[k];if(!Array.isArray(s)){s=[];if(w)m.h[k]=s}return s}
function mDone(m,k){var S=mS(m,k);return mReq(m).every(function(i){return !!S[i]})}
function mdDayMeds(L,k){return L.filter(function(m){return mOn(m,k)})}
function medDays(L,p){L=mSort(L);L.forEach(mChk); /* v161: archive the last-used day's 1/0 counters into history first, so past days auto-check on open */if(!L.length)return '<div class="spempty">Niciun medicament.</div>';var t=today(),s=null,e=null;
 L.forEach(function(m){var r=mRange(m);if(!s||r[0]<s)s=r[0];if(!e||r[1]>e)e=r[1]});var lim=dAdd(t,-366);if(s<lim)s=lim;if(e<s)e=s;
 var h='<div class="mdlist">',n=0;for(var k=s;k<=e&&n<800;k=dAdd(k,1),n++){var D=mdDayMeds(L,k),gap=!D.length,all=!gap&&D.every(function(m){return mDone(m,k)}),o=!!MDO[p.id+'|'+k],fut=k>t;
  h+='<div class="mdday'+(k===t?' mdtoday':fut?' mdfut':' mdpast')+(o?' open':'')+(gap?' mdgap':'')+(!gap&&!all&&mdMiss(D,k,t)?' mdmiss':'')+'" data-k="'+k+'"><div class="mddh"><button type="button" class="mddt" data-a="dtog" aria-expanded="'+o+'"><span class="mddl">'+esc(dLbl(k))+'</span>'+'</button><button type="button" class="mdck'+(gap?' red on':all?' on':'')+'" data-a="dck" role="checkbox" aria-checked="'+(gap||all)+'" aria-label="'+esc(dLbl(k))+'"></button></div>';
  if(o)h+='<div class="mddb">'+(gap?'<div class="spempty">'+esc(TR('Fără medicamente în această zi'))+'</div>':D.map(function(m){return mLine(m,k,fut)}).join(''))+'</div>';if(k===t&&!gap&&D.length)h+='<div class="mdtbar" aria-hidden="true">'+D.map(function(m,i){return '<i class="mdts'+(mDone(m,k)?' tk':'')+'" data-i="'+i+'"></i>'}).join('')+'</div>';h+='</div>'}
 return h+'</div>'}
/* v189: a dose whose time has passed and is not ticked turns that day red */
function mdMiss(D,k,t){if(k>t)return false;var now=new Date(),nm=now.getHours()*60+now.getMinutes(),DF=[480,780,1140];
 return D.some(function(m){var S=mS(m,k);return mSlots(m).some(function(x,i){var ix=m.rep>0?i:x.s;if(S[ix])return false;if(k<t)return true;var tm=x.t?hmM(x.t):DF[x.s];return !isNaN(tm)&&tm<=nm})})}
function mLine(m,k,fut){var S=mS(m,k),dd=m.days>0?{t:m.days,e:Math.round((dParse(k)-dParse(mRange(m)[0]))/864e5)+1}:null,dis=fut?' disabled':'',h='<div class="mdrow" data-m="'+esc(m.id)+'" data-k="'+k+'"><span class="mdnm ux" data-a="medit">💊 '+esc(m.name)+(dd?' <span class="mddays">('+dd.t+'/'+dd.e+')</span>':'')+'</span><span class="mddo">';
 if(m.rep>0){mSlots(m).forEach(function(x,i){h+='<span class="mdd"><button type="button" class="mdg ux'+(S[i]?' on':'')+'" data-a="mchk" data-i="'+i+'" aria-label="'+esc(x.t)+'"'+dis+'>1</button><small class="ux">'+(x.al?'⏰':'')+esc(x.t)+'</small></span>'})}
 else{var P=m.pat||[1,1,1],T=m.t||[],A=m.al||[];[0,1,2].forEach(function(i){if(i)h+='<span class="mdsep">–</span>';
  if(P[i])h+='<span class="mdd"><button type="button" class="mdg ux'+(S[i]?' on':'')+'" data-a="mchk" data-i="'+i+'" aria-label="'+esc(TR(SLOT[i]))+'"'+dis+'>1</button>'+(T[i]?'<small class="ux">'+(A[i]?'⏰':'')+esc(T[i])+'</small>':'')+'</span>';
  else h+='<span class="mdd"><span class="mdg z ux">0</span></span>'})}
 return h+'</span></div>'}
function mdCenter(v){var pk=MED.persons.filter(function(p){return MED.open[p.id]}).map(function(p){return p.id}).join(','),lp=LS.get('ns_medlast',''),tp=MED.open[lp]&&pFind(lp)?lp:(pk.split(',')[0]||''),key=noteTab+'|'+today()+'|'+pk+'|'+tp;if(MDCEN===key)return;var go=function(n){var r=null;v.querySelectorAll('.mdper').forEach(function(s){if(s.dataset.p===tp)r=s.querySelector('.mdday.mdtoday')});r=r||v.querySelector('.mdday.mdtoday');if(!r||MDCEN===key)return;if(!r.getClientRects().length){if(n<20)setTimeout(function(){go(n+1)},60);return}MDCEN=key;try{r.scrollIntoView({block:'center'})}catch(_){}};setTimeout(function(){go(0)},30)}
window.__md={dd:medDays,center:function(){MDCEN=''},o:MDO};
function medRows(L){var h='';L=mSort(L);L.forEach(function(m){var c=mChk(m);
 var dd=mDays(m);h+='<div class="mdrow'+(dd&&dd.f?' mdfin':'')+(mDue(m)?'':' mdoff')+'" data-m="'+esc(m.id)+'"><span class="mdnm ux" data-a="medit">💊 '+esc(m.name)+(dd?' <span class="mddays">('+dd.t+'/'+dd.e+')</span>':'')+'</span><span class="mddo">';
 if(m.rep>0){var on=c.r&&Date.now()-c.r<m.rep*3600000;h+='<span class="mdd"><button type="button" class="mdg ux'+(on?' on':'')+'" data-a="mrep" aria-label="'+esc(TR(m.rep+' ore'))+'">'+m.rep+'</button></span>'}
 else{var P=m.pat||[1,1,1],T=m.t||[],A=m.al||[];[0,1,2].forEach(function(i){if(i)h+='<span class="mdsep">–</span>';
  if(P[i])h+='<span class="mdd"><button type="button" class="mdg ux'+(c.s[i]?' on':'')+'" data-a="mchk" data-i="'+i+'" aria-label="'+esc(TR(SLOT[i]))+'">1</button>'+(T[i]?'<small class="ux">'+(A[i]?'⏰':'')+esc(T[i])+'</small>':'')+'</span>';
  else h+='<span class="mdd"><span class="mdg z ux">0</span></span>'})}
 h+='</span></div>'});if(!L.length)h+='<div class="spempty">Niciun medicament.</div>';return h}
function pCfg(p){var isNew=!p;p=p||{id:uid(),name:''};
 dOpen(isNew?TR('Persoană nouă'):pName(p),'<div class="field"><label>Nume</label><input id="spN" maxlength="30"></div>',
  function(){var n=$('spN').value.trim();if(!n){toast(TR('Numele e obligatoriu'));return false}if(isNew||n!==pName(p)){p.name=n;delete p.k}if(isNew){MED.persons.push(p);MED.open[p.id]=1}medSave();spRender()},
  isNew?null:function(){ask('Ștergi persoana și medicamentele ei?',function(){MED.persons=MED.persons.filter(function(x){return x!==p});MED.list=MED.list.filter(function(m){return m.p!==p.id});delete MED.open[p.id];medSave();jvClose('spModal');spRender()})});
 $('spN').value=isNew?'':pName(p);setTimeout(function(){$('spN').focus()},80)}
/* v125: schedule kinds — d daily · xd every N days · xh every N hours · wd weekdays (old pat/t/al/rep/st/ral kept for older versions) */
function mKind(m){var k=m.sch&&m.sch.k;if(m.rep>0)return 'xh';return k==='xd'||k==='wd'?k:'d'}
function hmM(t){var p=String(t||'').split(':');return p.length<2?NaN:+p[0]*60+(+p[1])}
function mDue(m,dk){var k=mKind(m),d=dParse(dk||today());if(k==='xd'){var n=Math.max(1,m.sch.n|0),e=Math.round((d-dParse(m.sch.d0||m.d0||today()))/864e5);return e>=0&&e%n===0}if(k==='wd')return !!((m.sch.wd|0)&(1<<d.getDay()));return true}
function mSortKey(m){if(m.rep>0){var x=hmM(m.st||'08:00');return isNaN(x)?1e5:x}var S=mSlots(m),b=1e5,D=[480,780,1140];S.forEach(function(s){var x=s.t?hmM(s.t):D[s.s]+.5;if(!isNaN(x)&&x<b)b=x});return b}
function mSort(L){return L.map(function(m,i){return{m:m,i:i,k:mSortKey(m)}}).sort(function(a,b){return a.k-b.k||a.i-b.i}).map(function(x){return x.m})}
function wdNm(d){try{var x=new Date(2024,0,7+d).toLocaleDateString(NL==='ro'?'ro':NL,{weekday:'short'});return x.charAt(0).toUpperCase()+x.slice(1).replace('.','')}catch(_){return ['Du','Lu','Ma','Mi','Jo','Vi','Sâ'][d]}}
function schTxt(m){var k=mKind(m),t;if(k==='xh')return TR('La X ore').replace('X',m.rep)+' · '+(m.st||'08:00');
 t=mSlots(m).map(function(s){return s.t||TR(SLOT[s.s])}).join(', ');
 var h=k==='xd'?TR('La X zile').replace('X',m.sch.n):k==='wd'?[1,2,3,4,5,6,0].filter(function(d){return (m.sch.wd|0)&(1<<d)}).map(wdNm).join(', '):TR('Zilnic');return h+(t?' · '+t:'')}
var MOE=[['ok','Eficient'],['part','Parțial'],['no','Nu a fost eficient']];
function obsTxt(m){var o=m.obs||{},e=MOE.filter(function(x){return x[0]===o.e})[0];return [e?TR(e[1]):'',o.t||''].filter(Boolean).join(' — ')}
function medShareTxt(m){var pp=pFind(m.p),L=['💊 '+m.name];if(m.adm)L.push(TR('Mod de administrare')+': '+m.adm);L.push(TR('Program')+': '+schTxt(m));var dd=mDays(m);if(dd)L.push(TR('Zile de luat')+': '+dd.t+' ('+TR('Început')+' '+(m.d0||today())+')');var o=obsTxt(m);if(o)L.push(TR('Observații')+': '+o);if(pp&&pp.name)L.push(TR('Persoană')+': '+pp.name);return L.join('\n')}
function medShare(m){var all=medShareTxt(m),ti=m.name,fb=function(){try{navigator.clipboard.writeText(all).then(function(){toast(TR('Copiat'))},function(){toast(TR('Copiat'))})}catch(_){toast(all)}};
 try{if(window.NotisNative&&NotisNative.shareText){NotisNative.shareText(all,ti);return}}catch(_){}
 if(navigator.share){navigator.share({title:ti,text:all}).catch(function(e){if(!e||e.name!=='AbortError')fb()})}else fb()}
function medEdit(m,pid){var isNew=!m,PRE=window.__mdPre;window.__mdPre=null;if(!m&&PRE){m=JSON.parse(JSON.stringify(PRE));m.id=uid();m.p=pid;m.d0=mTreat0(pid);delete m.sch_d0}m=m||{id:uid(),p:pid,name:'',pat:[1,0,1],t:['','',''],al:[0,0,0],rep:0,st:'08:00',ral:1,days:14,d0:mTreat0(pid)};var T=(m.t||['','','']).slice(),A=(m.al||[]).slice(),P=(m.pat||[1,1,1]).slice(),K=mKind(m),sc=m.sch||{},WD=sc.wd|0||(1<<new Date().getDay()),ob=m.obs||{};
 if(m.adm===undefined){var inf=MED.info[mKey(m.name)];if(inf&&inf.h)m.adm=String(inf.h)}
 var dz='';[0,1,2].forEach(function(i){dz+='<div class="mdz" data-s="'+i+'"><button type="button" class="mdg mdpt ux'+(P[i]?' on1':'')+'" id="mdP'+i+'">'+(P[i]?1:0)+'</button><span class="mdzl">'+SLOT[i]+'</span><input type="time" id="mdT'+i+'" value="'+esc(T[i]||'')+'"><label class="mdal"><input type="checkbox" id="mdA'+i+'"'+(A[i]?' checked':'')+'> ⏰</label></div>'});
 var wdb='<div class="mdwd" id="mdWd">'+[1,2,3,4,5,6,0].map(function(d){return '<button type="button" class="btn ux'+(WD&(1<<d)?' on':'')+'" data-d="'+d+'">'+esc(wdNm(d))+'</button>'}).join('')+'</div>';
 var names={};Object.keys(MED.hist).forEach(function(k){names[MED.hist[k]]=1});MED.lib.forEach(function(x){if(x.name)names[x.name]=1});
 var sec=function(id,ti,body){return '<div class="lbf mdsec'+(isNew&&id==='a'?' open':'')+'" data-s="'+id+'"><div class="lbfh" data-t="'+id+'"><span>'+ti+'</span><small class="ux" id="mdS'+id+'"></small><i class="sparr"></i></div><div class="mdab">'+body+'</div></div>'};
 dOpen(isNew?TR('Medicament nou'):TR('Medicament'),'<div class="mdcard">'+
  sec('a','Medicament','<div class="field"><input id="mdN" maxlength="40" value="'+esc(m.name)+'"></div>')+
  sec('b','Mod de administrare','<textarea id="mdAdm" class="lbta ux" rows="3" maxlength="1000">'+esc(m.adm||'')+'</textarea>')+
  sec('c','Program',seg('mdK',[['d',TR('Zilnic')],['xh',TR('La N ore')],['xd',TR('La N zile')]].concat(K==='wd'?[['wd',TR('Zile din săptămână')]]:[]),K)+
   '<div id="mdXd" class="field" style="margin-top:10px"><label>O dată la (zile)</label><input id="mdXn" type="number" min="2" max="60" inputmode="numeric" value="'+(sc.n>1?sc.n:2)+'"></div><div id="mdWdw" style="margin-top:10px">'+wdb+'</div>'+
   '<div id="mdFix" style="margin-top:12px"><div class="mdhint">Atinge 0 / 1. Ora e opțională (fără oră = fără alarmă).</div>'+dz+'</div>'+
   '<div id="mdRep" style="margin-top:12px"><div class="al2"><div class="field"><label>O dată la (ore)</label><input id="mdH" type="number" min="1" max="24" inputmode="numeric" value="'+(m.rep||6)+'"></div><div class="field"><label>Prima doză la</label><input type="time" id="mdSt" value="'+esc(m.st||'08:00')+'"></div></div><label class="mdal"><input type="checkbox" id="mdRal"'+(m.rep>0?(m.ral?' checked':''):' checked')+'> ⏰ Alarmă</label></div>'+
   '<div class="al2" style="margin-top:10px"><div class="field"><label>Început</label><input id="mdD0" type="date" value="'+esc(sc.d0||m.d0||today())+'"></div><div class="field"><label>Zile de luat</label><input id="mdDz" type="number" min="1" max="999" inputmode="numeric" value="'+(m.days>0?m.days:'')+'"></div></div>')+
  sec('d','Observații','<div id="mdOe" class="mdobl">'+MOE.map(function(x){var on=ob.e===x[0];return '<button type="button" class="mdob'+(on?' on':'')+'" data-v="'+x[0]+'"><span>'+TR(x[1])+'</span><i class="mdrg ux">'+(on?'✓':'')+'</i></button>'}).join('')+'</div>'+'<textarea id="mdOt" class="lbta ux" rows="2" maxlength="1000" style="margin-top:8px">'+esc(ob.t||'')+'</textarea>')+
  (isNew?'':'<button type="button" class="btn mdshr" id="mdShr"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg><span>'+TR('Share')+'</span></button>')+'</div>',
  function(){var n=$('mdN').value.trim();if(!n){toast(TR('Numele e obligatoriu'));return false}var k=segVal('mdK')||'d',d0=$('mdD0').value||today();
   if(k==='wd'){var w=0;$('mdWd').querySelectorAll('button.on').forEach(function(b){w|=1<<(+b.dataset.d)});if(!w){toast(TR('Zile din săptămână'));return false}}
   var pat=[0,1,2].map(function(i){return $('mdP'+i).textContent==='1'?1:0});if(k!=='xh'&&!pat.some(Boolean)){toast(TR('Alege cel puțin o doză'));return false}
   m.name=n;var dz=parseInt($('mdDz').value,10);if(dz>0)m.days=Math.min(999,dz);else delete m.days;m.d0=d0;
   if(k==='xh'){m.rep=Math.max(1,Math.min(24,parseInt($('mdH').value,10)||6));m.st=$('mdSt').value||'08:00';m.ral=$('mdRal').checked?1:0;m.sch={k:'xh'}}
   else{m.rep=0;m.pat=pat;m.n=pat.filter(Boolean).length;m.t=[0,1,2].map(function(i){return $('mdT'+i).value||''});m.al=[0,1,2].map(function(i){return m.pat[i]&&$('mdA'+i).checked&&$('mdT'+i).value?1:0});
    m.sch=k==='xd'?{k:'xd',n:Math.max(2,Math.min(60,parseInt($('mdXn').value,10)||2)),d0:d0}:k==='wd'?{k:'wd',wd:w}:{k:'d'}}
   m.adm=$('mdAdm').value.trim();var oe=segVal('mdOe')||'',ot=$('mdOt').value.trim();if(oe||ot)m.obs={e:oe,t:ot};else delete m.obs;
   MED.hist[mKey(n)]=n;if(isNew)MED.list.push(m);if(m.c)m.c.s=[];mTplPut(m);if(isNew&&VLIB)VLIB=0;medSave();spRender();alPerm()},
  isNew?null:function(){ask('Ștergi medicamentul?',function(){mTplPut(m);MED.list=MED.list.filter(function(x){return x!==m});medSave();jvClose('spModal');spRender()})});
 var cur=function(){var k=segVal('mdK')||'d',x={name:$('mdN').value.trim(),p:m.p,rep:0,st:$('mdSt').value,pat:[0,1,2].map(function(i){return $('mdP'+i).textContent==='1'?1:0}),t:[0,1,2].map(function(i){return $('mdT'+i).value||''}),al:[],d0:$('mdD0').value,adm:$('mdAdm').value.trim(),obs:{e:segVal('mdOe')||'',t:$('mdOt').value.trim()}};
  if(k==='xh')x.rep=parseInt($('mdH').value,10)||6;var w=0;$('mdWd').querySelectorAll('button.on').forEach(function(b){w|=1<<(+b.dataset.d)});x.sch={k:k,n:parseInt($('mdXn').value,10)||2,wd:w,d0:x.d0};var dz=parseInt($('mdDz').value,10);if(dz>0)x.days=dz;return x};
 var sum=function(){if(window.mdTUp)mdTUp();var x=cur();$('mdSa').textContent=x.name;$('mdSb').textContent=(x.adm||'').split('\n')[0].slice(0,40);$('mdSc').textContent=schTxt(x);$('mdSd').textContent=obsTxt(x).split('\n')[0].slice(0,40)};
 var card=document.querySelector('#spModal .mdcard');
 (function(){var H12=false;try{H12=/h1[12]/.test(new Intl.DateTimeFormat(navigator.language||undefined,{hour:'numeric'}).resolvedOptions().hourCycle||'')}catch(_){}var U=[];
  card.querySelectorAll('input[type=time]').forEach(function(inp){var w=document.createElement('span');w.className='mdtw';inp.parentNode.insertBefore(w,inp);w.appendChild(inp);var d=document.createElement('span');d.className='mdtd ux';w.insertBefore(d,inp);
   var up=function(){var v=inp.value||'';if(!/^\d\d:\d\d/.test(v)){d.innerHTML='<span class="mdtp">--:--</span>';return}var h=+v.slice(0,2),mi=v.slice(3,5);if(H12)d.innerHTML=((h%12)||12)+':'+mi+'<small>'+(h<12?'AM':'PM')+'</small>';else d.textContent=v.slice(0,5)};
   up();U.push(up);inp.addEventListener('input',up);inp.addEventListener('change',up);inp.addEventListener('click',function(){try{inp.showPicker()}catch(_){}})});
  window.mdTUp=function(){U.forEach(function(f){f()})}})();
 card.querySelectorAll('.mdsec>.lbfh').forEach(function(h){h.onclick=function(){var f=h.parentNode,o=!f.classList.contains('open');card.querySelectorAll('.mdsec').forEach(function(x){x.classList.toggle('open',o&&x===f)});sum();mkFit()}});
 var mkFit=function(){$('mdK').querySelectorAll('.btn').forEach(function(b){b.style.fontSize='';var f=13;while(b.clientWidth&&b.scrollWidth>b.clientWidth&&f>9){f-=.5;b.style.fontSize=f+'px'}})};
 var vis=function(){var k=segVal('mdK')||'d';$('mdFix').style.display=k==='xh'?'none':'';$('mdRep').style.display=k==='xh'?'':'none';$('mdXd').style.display=k==='xd'?'':'none';$('mdWdw').style.display=k==='wd'?'':'none';mkFit();
  [0,1,2].forEach(function(i){var on=$('mdP'+i).textContent==='1';$('mdT'+i).disabled=!on;$('mdA'+i).disabled=!on})};
 [0,1,2].forEach(function(i){$('mdP'+i).onclick=function(){var on=this.textContent!=='1';this.textContent=on?'1':'0';this.classList.toggle('on1',on);vis()};$('mdT'+i).oninput=function(){if(this.value)$('mdA'+i).checked=true}});
 $('mdWd').onclick=function(e){var b=e.target.closest('button');if(b)b.classList.toggle('on')};
 segWire('mdK',vis);$('mdOe').onclick=function(e){var b=e.target.closest('.mdob');if(!b)return;var on=!b.classList.contains('on');this.querySelectorAll('.mdob').forEach(function(x){var y=on&&x===b;x.classList.toggle('on',y);x.querySelector('.mdrg').textContent=y?'✓':''});sum()};if($('mdShr'))$('mdShr').onclick=function(){var x=cur();x.name=x.name||m.name;medShare(x)};vis();sum()}
/* ---- v71: ⚙ library — every medicine ever added (deduplicated by name) + library-only + alternative treatments; info per name ---- */
var VLIB=0,LOP={},LFOP={},LF=[['s','Simptome'],['h','Cum se administrează'],['w','Atenție']],LFA=[['h','Mod administrare'],['d','Despre tratament']]; /* v183: Alternative = Denumirea, Mod administrare, Despre tratament */
function mKey(n){return String(n||'').trim().toLowerCase()}
/* v183: settings template per medicine name (mode, hours, alarms, days, administration) — reused when added again from Nefolosite */
function mTplOf(m){var o={};['name','pat','t','al','rep','st','ral','sch','days','adm','n'].forEach(function(k){if(m[k]!==undefined)o[k]=JSON.parse(JSON.stringify(m[k]))});if(o.sch)delete o.sch.d0;return o}
function mTplPut(m){var k=mKey(m&&m.name);if(!k)return;if(!MED.tpl||typeof MED.tpl!=='object')MED.tpl={};MED.tpl[k]=mTplOf(m)}
function mAct(m){return mRange(m)[1]>=today()}
function libLists(){var used=[],seen={},now={};MED.list.forEach(function(m){var k=mKey(m.name);if(k&&!now[k]&&mAct(m))now[k]=m.name});
 Object.keys(now).forEach(function(k){if(k&&!seen[k]){seen[k]=1;used.push({k:k,name:now[k]})}});
 var un=Object.keys(MED.hist).filter(function(k){if(!k||seen[k])return false;seen[k]=1;return true}).map(function(k){return{k:k,name:MED.hist[k]}}).concat(MED.lib.filter(function(x){var k=mKey(x.name);if(!k||seen[k])return false;seen[k]=1;return true}).map(function(x){return{k:mKey(x.name),name:x.name}}));
 var al=MED.alt.map(function(x){return{k:x.id,name:x.name}});
 var az=MED.lo.az!==0,so=function(L,o){o=o||[];return L.sort(function(a,b){if(az)return a.name.localeCompare(b.name,undefined,{sensitivity:'base'});var i=o.indexOf(a.k),j=o.indexOf(b.k);return (i<0?1e6:i)-(j<0?1e6:j)})};
 return{u:so(used,MED.lo.u),n:so(un,MED.lo.n),a:so(al,MED.lo.a)}}
function libInfo(l,k,mk){if(l==='a'){var a=MED.alt.filter(function(x){return x.id===k})[0];if(!a)return null;if(!a.info)a.info={};return a.info}if(!MED.info[k]){if(!mk)return {};MED.info[k]={}}return MED.info[k]}
function libRender(){var L=libLists(),az=MED.lo.az!==0,h='<div class="spv spmed mdlib"><div class="mdtop"><span class="alseg mdord"><button type="button" class="btn'+(az?' on':'')+'" data-a="lord" data-v="az">A–Z</button><button type="button" class="btn'+(az?'':' on')+'" data-a="lord" data-v="man">↕</button></span><button type="button" class="mdall on" data-a="lib">Toate</button></div>';
 [['u','Folosite'],['n','Toate'],['a','Tratamente alternative']].forEach(function(S){var o=!!MED.lopen[S[0]],R=L[S[0]];
  h+='<div class="spsec lbsec'+(o?' open':'')+'" data-l="'+S[0]+'"><div class="sphd" data-a="lstog"><span class="spnm">'+S[1]+'</span><span class="spcnt">'+(R.length||'')+'</span><i class="sparr"></i></div>';
  if(o){h+='<div class="spbd lblist">';R.forEach(function(it){var id=S[0]+'|'+it.k,io=!!LOP[id],inf=libInfo(S[0],it.k)||{};
    var FL=S[0]==='a'?LFA:LF;h+='<div class="lbit'+(io?' open':'')+'" data-k="'+esc(it.k)+'"><div class="lbhd" data-a="litog"><span class="mdnm ux">'+esc(it.name)+'</span>'+(io?'':'<span class="lbdot ux">'+FL.map(function(f){return inf[f[0]]?'•':''}).join('')+'</span>')+(S[0]==='n'?'<button type="button" class="lbuse" data-a="luse" aria-label="'+esc(TR('Adaugă în tratament'))+'">＋</button>':'')+'<i class="sparr"></i></div>';
    if(io){h+='<div class="lbbd">'+(S[0]==='a'?'<div class="lbf lbname" data-a="lren"><div class="lbfh"><span>'+esc(TR('Denumirea'))+'</span><small class="ux">'+esc(it.name)+'</small></div></div>':'');FL.forEach(function(f){var fo=!!LFOP[id+'|'+f[0]];h+='<div class="lbf'+(fo?' open':'')+'"><div class="lbfh" data-a="lftog" data-f="'+f[0]+'"><span>'+f[1]+'</span>'+(!fo&&inf[f[0]]?'<small class="ux">'+esc(String(inf[f[0]]).split('\n')[0].slice(0,40))+'</small>':'')+'<i class="sparr"></i></div>'+(fo?'<textarea class="lbta ux" data-f="'+f[0]+'" rows="2">'+esc(inf[f[0]]||'')+'</textarea>':'')+'</div>'});if(S[0]==='a')h+='<div class="lbshw"><button type="button" class="shGo lbsh" data-a="lash" aria-label="'+esc(TR('Distribuie'))+'"><svg class="shI" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/></svg></button></div>';h+='</div>'}
    h+='</div>'});
   if(S[0]!=='u')h+='<button type="button" class="btn spnew spplus" data-a="lnew" aria-label="+">+</button>';else if(!R.length)h+='<div class="spempty">Niciun medicament.</div>';h+='</div>'}
  h+='</div>'});return h+'</div>'}
function libEdit(l,k){var isNew=!k,it=null;if(!isNew){var L=libLists()[l];it=L.filter(function(x){return x.k===k})[0];if(!it)return}
 dOpen(isNew?TR(l==='a'?'Tratament nou':'Medicament nou'):it.name,'<div class="field"><label>Nume</label><input id="spN" maxlength="40"></div>',
  function(){var n=$('spN').value.trim();if(!n){toast(TR('Numele e obligatoriu'));return false}
   if(l==='a'){if(isNew){var a={id:uid(),name:n,info:{}};MED.alt.push(a)}else MED.alt.forEach(function(x){if(x.id===k)x.name=n})}
   else{var nk=mKey(n);if(isNew){if(!MED.hist[nk]&&!MED.lib.some(function(x){return mKey(x.name)===nk}))MED.lib.push({name:n})}
    else if(nk!==k||n!==it.name){if(MED.info[k]&&!MED.info[nk]){MED.info[nk]=MED.info[k]}if(nk!==k)delete MED.info[k];
     if(l==='u'){delete MED.hist[k];MED.hist[nk]=n;MED.list.forEach(function(m){if(mKey(m.name)===k)m.name=n})}
     else MED.lib.forEach(function(x){if(mKey(x.name)===k)x.name=n});
     var o=MED.lo[l]||[],i=o.indexOf(k);if(i>=0)o[i]=nk}}
   medSave();spRender()},
  isNew?null:function(){ask(l==='a'?'Ștergi tratamentul?':'Ștergi medicamentul?',function(){if(l==='a')MED.alt=MED.alt.filter(function(x){return x.id!==k});else{delete MED.info[k];delete MED.hist[k];MED.lib=MED.lib.filter(function(x){return mKey(x.name)!==k})}medSave();jvClose('spModal');spRender()})});
 $('spN').value=isNew?'':it.name;setTimeout(function(){$('spN').focus()},80)}
document.addEventListener('input',function(e){var t=e.target;if(!t.classList||!t.classList.contains('lbta'))return;var it=t.closest('.lbit'),l=t.closest('.lbsec').dataset.l,inf=libInfo(l,it.dataset.k,1);if(!inf)return;if(t.value.trim())inf[t.dataset.f]=t.value;else delete inf[t.dataset.f];t.style.height='auto';t.style.height=t.scrollHeight+'px';clearTimeout(t._sv);t._sv=setTimeout(function(){LS.set('ns_med',MED)},300)});
document.addEventListener('focusout',function(e){if(e.target.classList&&e.target.classList.contains('lbta'))LS.set('ns_med',MED)});
/* long-press on a library row: ~0.55s = menu (rename/delete); in manual order ~1.55s = drag to reorder */
var LB={};function lbEnd(){clearTimeout(LB.t1);clearTimeout(LB.t2)}
document.addEventListener('pointerdown',function(e){var hd=e.target.closest&&e.target.closest('#spView .mdlib .lbhd');if(LB.drag)return;LB={};if(!hd)return;var it=hd.closest('.lbit'),man=MED.lo.az===0;LB.it=it;LB.x=e.clientX;LB.y=e.clientY;
 LB.t1=setTimeout(function(){LB.lp=1;try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}if(!man){LB.sup=1;libEdit(it.closest('.lbsec').dataset.l,it.dataset.k)}},550);
 if(man)LB.t2=setTimeout(function(){LB.drag=1;LB.lp=0;it.classList.add('lbdrag');try{navigator.vibrate&&navigator.vibrate([30,40,30])}catch(_){}},1550)});
document.addEventListener('pointermove',function(e){if(!LB.it)return;if(LB.drag){e.preventDefault();lbMove(e.clientX,e.clientY);return}
 if(Math.abs(e.clientX-LB.x)+Math.abs(e.clientY-LB.y)>8){lbEnd();LB.lp=0;LB.it=null}},{passive:false});
function lbMove(x,y){var el=document.elementFromPoint(x,y),o=el&&el.closest('.lbit');if(!o||o===LB.it||o.parentNode!==LB.it.parentNode)return;var r=o.getBoundingClientRect();o.parentNode.insertBefore(LB.it,y<r.top+r.height/2?o:o.nextSibling)}
document.addEventListener('touchmove',function(e){if(!LB.drag||!LB.it)return;if(e.cancelable)e.preventDefault();var p=e.touches[0];if(p)lbMove(p.clientX,p.clientY)},{passive:false});
['touchend','touchcancel'].forEach(function(t){document.addEventListener(t,function(){if(LB.drag&&LB.it&&!(event.touches&&event.touches.length))lbDrop()})});
function lbDrop(){lbEnd();var it=LB.it;it.classList.remove('lbdrag');var l=it.closest('.lbsec').dataset.l,ks=[].map.call(it.parentNode.querySelectorAll(':scope>.lbit'),function(x){return x.dataset.k});MED.lo[l]=ks;
  if(l==='a')MED.alt.sort(function(a,b){return ks.indexOf(a.id)-ks.indexOf(b.id)});LS.set('ns_med',MED);LB={sup:1};setTimeout(function(){LB.sup=0;spRender()},30)}
['pointerup','pointercancel'].forEach(function(t){document.addEventListener(t,function(e){if(!LB.it)return;
 if(LB.drag){if(t==='pointercancel'&&e.pointerType==='touch')return;lbDrop();return}lbEnd();var it=LB.it;
 if(0){var l=it.closest('.lbsec').dataset.l,ks=[].map.call(it.parentNode.querySelectorAll(':scope>.lbit'),function(x){return x.dataset.k});MED.lo[l]=ks;
  if(l==='a')MED.alt.sort(function(a,b){return ks.indexOf(a.id)-ks.indexOf(b.id)});LS.set('ns_med',MED);LB={sup:1};setTimeout(function(){LB.sup=0;spRender()},30);return}
 if(LB.lp&&t==='pointerup'&&MED.lo.az===0){LB={sup:1};libEdit(it.closest('.lbsec').dataset.l,it.dataset.k);return}
 LB.it=null})});
document.addEventListener('click',function(e){var v=$('spView');if(!v||!v.contains(e.target))return;var a=e.target.closest('[data-a]');if(!a)return;var A=a.dataset.a;
 if(A==='lib'){VLIB=VLIB?0:1;spRender();return}
 if(!a.closest('.mdlib'))return;if(LB.sup){LB.sup=0;e.stopPropagation();return}var sec=a.closest('.lbsec'),l=sec&&sec.dataset.l,it=a.closest('.lbit'),id=it&&l+'|'+it.dataset.k;
 if(A==='lord'){if(a.dataset.v==='man'){if(MED.lo.az!==0){var L=libLists();MED.lo.u=L.u.map(function(x){return x.k});MED.lo.n=L.n.map(function(x){return x.k});MED.lo.a=L.a.map(function(x){return x.k})}MED.lo.az=0}else MED.lo.az=1;LS.set('ns_med',MED);spRender()}
 else if(A==='lstog'&&l){MED.lopen[l]=MED.lopen[l]?0:1;LS.set('ns_med',MED);spRender()}
 else if(A==='lnew'&&l)libEdit(l,null);
 else if(A==='luse'&&it){e.stopPropagation();var tk=it.dataset.k,tp=(MED.tpl||{})[tk],nm=MED.hist[tk]||(MED.lib.filter(function(x){return mKey(x.name)===tk})[0]||{}).name||tk,lp=LS.get('ns_medlast',''),pp=pFind(lp)||MED.persons.filter(function(p){return MED.open[p.id]})[0]||MED.persons[0];if(!pp){toast(TR('Persoană nouă'));return}
  var pre=tp?JSON.parse(JSON.stringify(tp)):{pat:[1,0,1],t:['','',''],al:[0,0,0],rep:0,st:'08:00',ral:1,days:14};pre.name=nm;if(pre.adm===undefined&&MED.info[tk]&&MED.info[tk].h)pre.adm=String(MED.info[tk].h);window.__mdPre=pre;MED.open[pp.id]=1;medEdit(null,pp.id)}
 else if(A==='lren'&&it&&l)libEdit(l,it.dataset.k);
 else if(A==='lash'&&it){var al0=MED.alt.filter(function(x){return x.id===it.dataset.k})[0];if(al0){var ii=al0.info||{},tx=[al0.name].concat(LFA.filter(function(f){return ii[f[0]]}).map(function(f){return TR(f[1])+':\n'+ii[f[0]]})).join('\n\n'),fb=function(){try{navigator.clipboard.writeText(tx).then(function(){toast(TR('Copiat'))},function(){toast(TR('Copiat'))})}catch(_){toast(tx)}};
  try{if(window.NotisNative&&NotisNative.shareText){NotisNative.shareText(tx,al0.name);return}}catch(_){}if(navigator.share)navigator.share({title:al0.name,text:tx}).catch(function(x){if(!x||x.name!=='AbortError')fb()});else fb()}}
 else if(A==='litog'&&it){LOP[id]=LOP[id]?0:1;spRender()}
 else if(A==='lftog'&&it){var fk=id+'|'+a.dataset.f;LFOP[fk]=LFOP[fk]?0:1;spRender();if(LFOP[fk]){var ta=$('spView').querySelector('.lbit[data-k="'+CSS.escape(it.dataset.k)+'"] .lbta[data-f="'+a.dataset.f+'"]');if(ta){ta.style.height=ta.scrollHeight+'px';ta.focus()}}}},true);
/* dose alarm instants */
function hmNext(hm,stepMin,now){var p=hm.split(':'),d=new Date(now);d.setHours(+p[0],+p[1],0,0);var at=d.getTime(),st=(stepMin||1440)*60000;if(at>now)at-=Math.ceil((at-now)/st)*st;while(at<=now)at+=st;return at}
/* v155: notification text = ONE emoji + main thing once (title), details once (body) — same rules as native NotifText */
function ntLead(s){var i=0,f='',a=Array.from(s);for(;i<a.length;i++){var ch=a[i],cp=ch.codePointAt(0);if(/[\p{L}\p{N}("'„\[#+\-]/u.test(ch))break;if((!f||ntEm(f)==='⏰')&&!/\s/.test(ch)&&!(cp===0xFE0F||cp===0xFE0E||cp===0x200D||cp===0x20E3||(cp>=0x1F3FB&&cp<=0x1F3FF))&&cp>=0x2000)f=ch}return[f,a.slice(i).join('').trim()]}
function ntEm(e){return(!e||e==='⏰'||e==='📞'||e==='🔔'||e==='⏱')?'⏰':e}
function ntClean(core,body){var o=[];String(body||'').split('\n').forEach(function(l){l=l.trim();if(!l)return;var t=ntLead(l)[1];if(core&&t===core)return;if(core&&t.indexOf(core+' ')===0){t=t.slice(core.length).replace(/^\s*[·—\-:]?\s*/,'');if(!t)return;l=t}o.push(l)});return o.join('\n')}
function ntSplit(text){var s=String(text||'').trim(),nl=s.indexOf('\n'),first=nl<0?s:s.slice(0,nl).trim(),rest=nl<0?'':s.slice(nl+1),L=ntLead(first),em=ntEm(L[0]),core=L[1],det='',who='',d=core.lastIndexOf(' — ');
 if(d>0){who=core.slice(d+3).trim();core=core.slice(0,d).trim()}var p=core.indexOf(' · ');if(p>0){det=core.slice(p+3).trim();core=core.slice(0,p).trim()}
 if(who)det=det?det+' · '+who:who;if(!core)core='Notis';var b=ntClean(core,rest);if(det)b=b?det+'\n'+b:det;return{t:em+' '+core,b:b}}
window.ntSplit=ntSplit;window.ntLead=ntLead;window.ntClean=ntClean;
function medAlarms(){var out=[],now=Date.now();if(!noteTabs.some(function(t){return t.kind==='med'}))return medSnz(out,now);
 var many=MED.persons.length>1;
 MED.list.forEach(function(m){var pp=pFind(m.p),who=pp&&many?' — '+pName(pp):'',k=mKind(m);if(m.rep>0){if(m.ral)out.push({id:'med-'+m.id+'-r',text:'💊 '+m.name+who,hm:m.st||'08:00',rep:m.rep*60})}
  else mSlots(m).forEach(function(s){if(s.al){var a={id:'med-'+m.id+'-'+s.s,text:'💊 '+m.name+' · '+TR(SLOT[s.s])+' '+s.t+who,hm:s.t,rep:1440};if(k!=='d')medDayAl(a,m,k,now);out.push(a)}})});
 out.forEach(function(a){if(!a.at)a.at=hmNext(a.hm,a.rep,now)});
 return medSnz(out,now)}
/* v125: every N days (rd) / weekdays (wd) — exact next + previous instants; native rolls them with Store.rollDays */
function medDayAl(a,m,k,now){var p=a.hm.split(':'),at0=function(d){var x=new Date(d);x.setHours(+p[0],+p[1],0,0);return x},ok,st;
 if(k==='xd'){var n=Math.max(1,m.sch.n|0),b=dParse(m.sch.d0||m.d0||today());ok=function(d){var e=Math.round((dParse(dkey(d))-b)/864e5);return e>=0&&e%n===0};a.rd=n;a.rep=n*1440}
 else{var w=m.sch.wd|0;if(!w)return;ok=function(d){return !!(w&(1<<d.getDay()))};a.wd=w;a.rep=1440}
 var d=new Date(now);d.setHours(0,0,0,0);var nx=0,pv=0;for(var i=-62;i<=62;i++){var x=new Date(d);x.setDate(d.getDate()+i);if(!ok(x))continue;var t=at0(x).getTime();if(t>now){nx=t;break}pv=t}
 if(!nx){var x2=new Date(dParse(m.sch.d0||m.d0||today()));if(at0(x2).getTime()>now)nx=at0(x2).getTime()}a.at=nx||hmNext(a.hm,1440,now);a.prev=pv||0}
function medSnz(out,now){Object.keys(MED.snz||{}).forEach(function(k){var z=MED.snz[k];if(z&&z.at>now)out.push({id:k+'-z',text:z.text,at:z.at,rep:0,snz:1})});return out}
window.medSnooze=function(id,text,mn){mn=mn===20||mn===30?mn:10;MED.snz=MED.snz||{};var now=Date.now();for(var k in MED.snz)if(!MED.snz[k]||MED.snz[k].at<now-6e5)delete MED.snz[k];MED.snz[String(id).replace(/-z$/,'')]={at:now+mn*60000,text:text};medSave()};
/* v191: data for the native Pastile / Plăți home-screen widgets (local only, never logged). Locked tabs export nothing. */
function secTabOk(k){var t=noteTabs.filter(function(x){return x.kind===k})[0];return !!(t&&!t.lk)}
window.secSnapMed=function(){if(!secTabOk('med'))return null;var k0=today(),o=[],seen={};
 function lab(k){var a=dParse(k),b=dParse(k0),n=Math.round((a-b)/864e5);if(n===0)return TR('Azi');if(n===-1)return TR('Ieri');if(n===1)return TR('Mâine');return fDate(k)}
 function add(k){mSort(mdDayMeds(MED.list,k)).forEach(function(m){var sl=mSlots(m),S=mS(m,k),p=pFind(m.p);mReq(m).forEach(function(i){o.push({m:String(m.id),i:i,day:k,g:lab(k),t:String(m.name||'').slice(0,60),tm:((m.rep>0?sl[i]:sl.filter(function(x){return x.s===i})[0])||{}).lbl||'',d:!!S[i],p:p?String(pName(p)).slice(0,30):''})})})}
 for(var off=-7;off<=7;off++){var d=new Date();d.setDate(d.getDate()+off);var k=dkey(d);if(!mdDayMeds(MED.list,k).length)continue;add(k)}
 return {day:k0,rows:o.slice(0,120)}};
window.secSnapUtil=function(){if(!secTabOk('util'))return null;var L=utGL(),o=[];(UT.list||[]).forEach(function(u){var n=uNext(u),g=utGOf(u,L),st=uSt(uRows(u));o.push({u:String(u.id||''),t:String(uName(u)).slice(0,60),g:g?String(g.name||TR(g.name)||'').slice(0,40):'',sub:u.grp==='firm'?'firm':'home',due:n?String(n.d||''):'',amt:n&&n.amt!=null?String(n.amt):'',late:st.late||0})});o.sort(function(a,b){return (a.due||'9').localeCompare(b.due||'9')});return {groups:L.map(function(G){return String(G.name||'')}).filter(Boolean).slice(0,30),rows:o.slice(0,80)}};
window.medSnap=function(){var t=(noteTabs.filter(function(x){return x.kind==='med'})[0]||{}).id||'';return medAlarms().concat(payAlarms()).map(function(a){var al={at:a.at,rep:a.rep,until:a.until||null,snz:null};if(a.repM){al.repM=a.repM;al.dom=a.dom}if(a.rd)al.rd=a.rd;if(a.wd)al.wd=a.wd;return{id:a.id,tab:'__med',type:'med',title:a.text,text:a.text,upd:'',alarm:al}})};
/* in-page ring (web, or app on screen; native rings when the app is closed) */
var fired={},boot=Date.now();
function medTick(){if(DEMO)return;var now=Date.now();try{if(noteTabs.some(function(t){return t.kind==='util'})&&utRoll())spRender()}catch(_){}
 Object.keys(MED.snz||{}).forEach(function(k){var z=MED.snz[k];if(z&&z.at<=now){delete MED.snz[k];LS.set('ns_med',MED);if(now-z.at<5*60000)try{alFire({id:k+'-z',text:z.text,med:1},null)}catch(_){}}});
 medAlarms().forEach(function(a){if(a.snz)return;var last=a.prev!==undefined?a.prev:a.at-a.rep*60000;if(last>boot&&now-last<5*60000&&!fired[a.id+last]){fired[a.id+last]=1;try{alFire({id:a.id,text:a.text,med:1},null)}catch(_){}}})}
setInterval(medTick,15000);
/* ---- render into the notes page ---- */
document.addEventListener('click',function(e){var v=$('spView');if(!v||!v.contains(e.target))return;var gh=e.target.closest('.sput .spghd');if(gh){e.stopPropagation();var gk=gh.parentNode.dataset.g;UT.gopen=UT.gopen||{};UT.gopen[gk]=UT.gopen[gk]?0:1;if(!UT.gopen[gk])delete UT.gopen[gk];utSave();spRender();return}var sb=e.target.closest('.utsub button');if(sb){e.stopPropagation();UT.sub=sb.dataset.v==='firm'?'firm':'home';utSave();spRender();return}
 var pb=e.target.closest('.sput [data-a="pd"]');if(!pb)return;e.stopPropagation();e.preventDefault();var rw=pb.closest('.sprow'),su=rw&&rw.closest('.spsec'),u=su&&uFind(su.dataset.u),r=u&&(u.rows||[]).filter(function(x){return x.id===rw.dataset.r})[0];if(!r)return;r.pd=pb.classList.contains('spck')?(r.pd===1?0:1):(r.pd===0?1:0);utYearly(u);utSave();try{utRoll();saveNotes(true)}catch(_){}spRender()},true); /* v123 */
/* v74: global search over Utilități / Medicamente / library */
window.spSearch=function(qs,fold){var R=[],M=function(t){var f=fold(t);return qs.every(function(w){return f.indexOf(w)>=0})},TB=function(k){return noteTabs.filter(function(t){return t.kind===k})};
 TB('util').forEach(function(t){UT.list.forEach(function(u){var un=uName(u);if(M(un))R.push({tab:t.id,path:[t.name,TR(u.grp==='firm'?'Firmă':'Acasă')],text:un,act:{k:'u',u:u.id}});
  (u.rows||[]).forEach(function(r){var tx=(u.mode==='idx'?monLbl(r.d)+' '+fmt(r.a)+' → '+fmt(r.b)+' '+(u.unit||''):dLbl(r.d)+' '+fmt(r.amt)+' '+(u.cur||''))+(r.nt?' · '+r.nt:'')+(r.pd===0?' · '+TR('Neachitat'):r.pd===1?' · '+TR('Achitat'):'');if(M(tx))R.push({tab:t.id,path:[t.name,TR(u.grp==='firm'?'Firmă':'Acasă'),un+' '+rY(r)],text:tx,act:{k:'u',u:u.id,r:r.id}})})})});
 TB('med').forEach(function(t){MED.persons.forEach(function(p){var pn=pName(p);if(M(pn))R.push({tab:t.id,path:[t.name],text:pn,act:{k:'p',p:p.id}});
   MED.list.forEach(function(m){if(m.p===p.id&&M(m.name||''))R.push({tab:t.id,path:[t.name,pn],text:m.name,act:{k:'m',p:p.id,m:m.id}})})});
  var L=libLists();[['u','Folosite'],['n','Toate'],['a','Tratamente alternative']].forEach(function(S){L[S[0]].forEach(function(it){var sn=TR(S[1]);
   if(M(it.name))R.push({tab:t.id,path:[t.name,sn],text:it.name,act:{k:'l',S:S[0],key:it.k}});var inf=libInfo(S[0],it.k)||{};
   (S[0]==='a'?LFA:LF).forEach(function(f){if(inf[f[0]]&&M(inf[f[0]]))R.push({tab:t.id,path:[t.name,sn,it.name,TR(f[1])],text:String(inf[f[0]]),act:{k:'l',S:S[0],key:it.k,f:f[0]}})})})})});
 return R};
window.spGo=function(a){var sel='';
 if(a.k==='u'){var gu=uFind(a.u);if(gu){UT.sub=gu.grp||'home';if(a.r){var gr=(gu.rows||[]).filter(function(x){return x.id===a.r})[0];if(gr){UT.yo=UT.yo||{};UT.yo[gu.id+'|'+rY(gr)]=1}}}UT.open[a.u]=1;utSave();sel=a.r?'.sput [data-r="'+a.r+'"]':'.sput [data-u="'+a.u+'"]'}
 else if(a.k==='p'||a.k==='m'){VLIB=0;MED.open[a.p]=1;LS.set('ns_med',MED);sel=a.m?'.mdrow[data-m="'+a.m+'"]':'.mdper[data-p="'+a.p+'"]'}
 else if(a.k==='l'){VLIB=1;MED.lopen[a.S]=1;var id=a.S+'|'+a.key;LOP[id]=1;if(a.f)LFOP[id+'|'+a.f]=1;LS.set('ns_med',MED);sel='.lbsec[data-l="'+a.S+'"] .lbit[data-k="'+String(a.key).replace(/"/g,'\\"')+'"]'+(a.f?' .lbfh[data-f="'+a.f+'"]':'')}
 spRender();return sel};
/* v187: small interface for js/glicemie.js (categories + Glicemie); Pastile code unchanged */
window.__medX={sched:function(){var s=VLIB;VLIB=0;try{return medRender()}finally{VLIB=s}},lib:function(){return libRender()},getV:function(){return VLIB},setV:function(x){VLIB=x?1:0},dOpen:dOpen,ask:ask,close:function(){jvClose('spModal')},LS:LS};
window.spRender=function(){var v=$('spView');if(!v)return;var k=kindOf(),srch=!!nFold(nQ).trim(),on=k&&!nTrash&&!srch&&!tbHidden(noteTab)&&!nFolder;
 $('notesPg').classList.toggle('sptab',!!on);if(!on){v.innerHTML='';v.hidden=true;MDCEN='';return}v.hidden=false;
 try{v.innerHTML=k==='util'?utRender():k==='crm'?(window.crmRender?crmRender():''):k!=='med'?'':(window.NSG&&window.__medX?NSG.render(medRender):medRender())}catch(e){console.warn(e);if(!v.innerHTML)v.innerHTML='';$('notesPg').classList.add('spnone')}
 if(k==='med'&&!VLIB)mdCenter(v);else MDCEN='';
 var has=notes.some(function(n){return !n.del&&n.tab===noteTab&&(n.fd||'')===''&&(n.lock||String(n.text||'').trim())})||noteFolders.some(function(f){return f.tab===noteTab&&!f.del});$('notesPg').classList.toggle('spnone',!has||!v.innerHTML)};
var rn=renderNotes;renderNotes=function(){var r=rn.apply(this,arguments);try{spRender()}catch(e){console.warn(e)}return r};
var lpT=0,lpDone=0;document.addEventListener('pointerdown',function(e){var v=$('spView');if(!v||!v.contains(e.target))return;var hd=e.target.closest('.mdper .sphd');lpDone=0;clearTimeout(lpT);if(!hd)return;lpT=setTimeout(function(){var pp=pFind(hd.closest('.mdper').dataset.p);if(pp){lpDone=1;try{navigator.vibrate&&navigator.vibrate(20)}catch(_){}pCfg(pp)}},550)});
['pointerup','pointercancel','pointermove'].forEach(function(t){document.addEventListener(t,function(e){if(t==='pointermove'&&!(Math.abs(e.movementX)+Math.abs(e.movementY)>6))return;clearTimeout(lpT)})});
document.addEventListener('click',function(e){var v=$('spView');if(!v||!v.contains(e.target))return;if(lpDone&&e.target.closest('.mdper .sphd')){lpDone=0;e.stopPropagation();return}var a=e.target.closest('[data-a]');if(!a)return;var A=a.dataset.a;
 var su=a.closest('.spsec'),u=su&&uFind(su.dataset.u);
 if(A==='tog'&&u){if(e.target.closest('.spgear'))return;UT.open[u.id]=UT.open[u.id]?0:1;if(!UT.open[u.id])delete UT.open[u.id];utSave();spRender();if(UT.open[u.id])utScroll(u.id)}
 else if(A==='shr'&&u){e.stopPropagation();var rid=a.closest('[data-r]');rid=rid&&rid.dataset.r;var r=(u.rows||[]).filter(function(x){return x.id===rid})[0];if(!r)return;var diff=isNaN(r.b-r.a)?'':(Math.round((r.b-r.a)*1000)/1000);var t=uName(u)+' · '+monLbl(r.d)+': '+fmt(r.a)+' → '+fmt(r.b)+(diff!==''?(' = '+diff+' '+(u.unit||'')):'');try{if(navigator.share)navigator.share({text:t}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast(TR('Copiat'))})}catch(_){toast(t)};return}
 else if(A==='cfg'&&u){e.stopPropagation();utCfg(u)}
 else if(A==='add'&&u){var yy=String(new Date().getFullYear());u.yrs=u.yrs||[];if(u.yrs.indexOf(yy)<0&&u.yrs.indexOf(+yy)<0){u.yrs.push(yy);UT.yo=UT.yo||{};UT.yo[u.id+'|'+yy]=1;utSave()} /* v213: auto year */ utRow(u,null,a.dataset.y)}
 else if(A==='ytog'&&u){var yb=a.closest('.spyr'),yk=u.id+'|'+yb.dataset.y;UT.yo=UT.yo||{};UT.yo[yk]=yOpen(u,+yb.dataset.y)?0:1;utSave();spRender();if(UT.yo[yk])utScroll(u.id)}
 else if(A==='ynew'&&u){var Y=uYears(u).slice().reverse(),ny=Math.max(Y[0],new Date().getFullYear())+(Y.indexOf(new Date().getFullYear())>=0?1:0);u.yrs=u.yrs||[];if(u.yrs.indexOf(ny)<0)u.yrs.push(ny);UT.yo=UT.yo||{};UT.yo[u.id+'|'+ny]=1;utSave();spRender()}else if(A==='unew')utCfg(null);
 else if(A==='plan'&&u)utPlan(u);
 else if(A==='oldok'){UT.oldSeen=1;utSave();spRender()}
 else if(A==='pnew')pCfg(null);
 else if((A==='ptog'||A==='pcfg'||A==='mnew')&&a.closest('.mdper')){var pp=pFind(a.closest('.mdper').dataset.p);if(!pp)return;
  if(A==='pcfg'){e.stopPropagation();pCfg(pp)}else if(A==='mnew')medEdit(null,pp.id);else{if(e.target.closest('.spgear'))return;MED.open[pp.id]=MED.open[pp.id]?0:1;if(!MED.open[pp.id])delete MED.open[pp.id];else LS.set('ns_medlast',pp.id);LS.set('ns_med',MED);spRender()}}
 else if((A==='dtog'||A==='dck')&&a.closest('.mdday')){var dy=a.closest('.mdday'),dk=dy.dataset.k,pq=a.closest('.mdper'),pid=pq&&pq.dataset.p;if(!pid)return;
  if(A==='dtog'){var ok=pid+'|'+dk;if(MDO[ok])delete MDO[ok];else MDO[ok]=1;spRender();return}
  var DL=mdDayMeds(MED.list.filter(function(m){return m.p===pid}),dk);if(!DL.length)return;if(dk>today()){toast(TR('Zilele viitoare nu se pot bifa încă'));return}
  var done=DL.every(function(m){return mDone(m,dk)});ask(TR(done?'Debifezi toate dozele din această zi?':'Marchezi toate dozele din această zi ca luate?'),function(){DL.forEach(function(m){var S=mS(m,dk,1);mReq(m).forEach(function(i){S[i]=!done});if(dk===today()&&m.rep>0&&!done){var c=mChk(m);c.rp=c.r||0;c.r=Date.now()}});LS.set('ns_med',MED);spRender()})}
 else{var md=a.closest('.mdrow'),m=md&&MED.list.filter(function(x){return x.id===md.dataset.m})[0];if(!m)return;
  if(A==='medit')medEdit(m);else if(A==='mrep'){var c=mChk(m),on=c.r&&Date.now()-c.r<m.rep*3600000;if(on)c.r=c.rp||0;else{c.rp=c.r||0;c.r=Date.now();c.n=(c.n||0)+1}LS.set('ns_med',MED);spRender()}else if(A==='mchk'){var dk=md.dataset.k||today();if(dk>today())return;var S=mS(m,dk,1),i=+a.dataset.i;S[i]=!S[i];if(dk===today()&&m.rep>0&&S[i]){var c=mChk(m);c.rp=c.r||0;c.r=Date.now()}LS.set('ns_med',MED);spRender()}}});
document.addEventListener('click',function(e){var v=$('spView');if(!v||!v.contains(e.target))return;var r=e.target.closest('.sprow');if(!r)return;var su=r.closest('.spsec'),u=su&&uFind(su.dataset.u);if(!u)return;var row=(u.rows||[]).filter(function(x){return x.id===r.dataset.r})[0];if(row)utRow(u,row)});
/* long-press on a medicine = edit */
(function(){var T=null;document.addEventListener('pointerdown',function(e){var n=e.target.closest&&e.target.closest('#spView .mdrow');if(!n||e.target.closest('.mdc,.mdg'))return;clearTimeout(T);T=setTimeout(function(){var m=MED.list.filter(function(x){return x.id===n.dataset.m})[0];if(m)medEdit(m)},550)});
 ['pointerup','pointercancel','pointermove'].forEach(function(t){document.addEventListener(t,function(e){if(t!=='pointermove'||Math.abs(e.movementY)>4)clearTimeout(T)})})})();
/* daily reset while open */
setInterval(function(){if(kindOf()==='med'&&MED.list.some(function(m){return m.c&&m.c.d!==today()})){MED.list.forEach(mChk);LS.set('ns_med',MED);spRender()}},60000);
/* notification tap ?open=med-… → Medicamente tab */
var nl=nsLaunch;nsLaunch=function(u){try{var q=new URL(u,location.href).searchParams.get('open');if(q&&q.indexOf('med-')===0){var t=noteTabs.filter(function(x){return x.kind==='med'})[0];var mp=MED.list.filter(function(m){return m.id===q.split('-')[1]})[0];if(mp){MED.open[mp.p]=1;LS.set('ns_med',MED)}if(t){if($('noteFull').classList.contains('show'))fullClose();notesOpen();noteTab=t.id;nFolder='';saveNotes(true);renderNotes()}return}}catch(_){}return nl.apply(this,arguments)};
spMigrate();renderNotes();
})();
qrWrapSP();

(function(){var prev=window.secApply;window.secApply=function(c){if(c&&c.op==='mt'){try{if(typeof MED==='undefined'||!MED||!MED.list)return false;var m=MED.list.filter(function(x){return String(x.id)===String(c.m)})[0];if(!m)return false;var day=c.day||today();if(day>today())return false;var S=mS(m,day,1),i=+c.i,want=!!c.d;if(!!S[i]===want)return false;S[i]=want;if(day===today()&&m.rep>0&&want){var ck=mChk(m);ck.rp=ck.r||0;ck.r=Date.now()}LS.set('ns_med',MED);try{if(typeof kindOf==='function'&&kindOf()==='med'&&typeof spRender==='function')spRender()}catch(_){}return true}catch(e){return false}}return prev?prev(c):false}})();
