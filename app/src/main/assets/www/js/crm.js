/* Notis module: crm — CRM (tab kind crm). See MODULES.md */
'use strict';
(function(){
var ST_DEF={nou:'Nou',disc:'În discuție',cli:'Client',ina:'Inactiv'};
var PAL=['#fde68a','#f59e0b','#4ade80','#94a3b8','#3fd8ff','#a78bfa','#f472b6','#fb923c','#ff6b6b','#e6f2fa'];
var DFLD=[['tel','Telefon'],['addr','Adresă'],['email','Email'],['firm','Firmă / CUI']];
var TY={call:'Apel',msg:'Mesaj',meet:'Întâlnire',note:'Notă'};
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function def(){return{v:1,sub:'firm',st:[{id:'nou',c:PAL[0]},{id:'disc',c:PAL[1]},{id:'cli',c:PAL[2]},{id:'ina',c:PAL[3]}],list:[],fld:{home:[],firm:[]},hide:{home:{firm:1},firm:{}},lock:{home:0,firm:0},auto:1,ask:1,sort:'rem'}}
var MIG=0,EXP='',SOM=0,BK=0,RX=0,RP='',RPT=0;function fRD(d){return fDate(d)}function norm(d){var D=def();if(!d||typeof d!=='object'||!Array.isArray(d.list))return D;
 var o=JSON.parse(JSON.stringify(d));o.v=1;if(o.sub!=='home')o.sub='firm';if(!Array.isArray(o.st)||!o.st.length)o.st=D.st;o.st=o.st.filter(function(s){return s&&s.id});if(!o.st.length)o.st=D.st;
 ['fld','hide','lock'].forEach(function(k){if(!o[k]||typeof o[k]!=='object')o[k]=D[k]});['home','firm'].forEach(function(p){if(!Array.isArray(o.fld[p]))o.fld[p]=[];if(!o.hide[p]||typeof o.hide[p]!=='object')o.hide[p]={};o.lock[p]=o.lock[p]?1:0});
 if(o.auto==null)o.auto=1;if(o.ask==null)o.ask=1;if(['rem','last','name'].indexOf(o.sort)<0)o.sort='rem';
 var ids=o.st.map(function(s){return s.id});
 o.list=o.list.filter(function(c){return c&&c.id}).map(function(c){if(c.grp!=='home')c.grp='firm';if(!Array.isArray(c.tel))c.tel=c.tel?[String(c.tel)]:[];if(!Array.isArray(c.hist))c.hist=[];if(!c.cf||typeof c.cf!=='object')c.cf={};if(!Array.isArray(c.work))c.work=[];c.work=c.work.filter(function(w){return w&&w.id});if(typeof c.nt==='string'&&c.nt.trim()){var t0=0;c.hist.forEach(function(h){if(h&&h.ts&&(!t0||h.ts<t0))t0=h.ts});var tc=parseInt(String(c.id).slice(0,8),36);if(!(tc>1e12&&tc<4e12))tc=0;var ts=t0?t0-60000:(tc||c.last||Date.now());if(tc&&tc<ts)ts=tc;c.hist.push({id:'nt'+String(c.id),ts:ts,ty:'note',nt:c.nt.trim(),mig:1});MIG=1}if('nt' in c)delete c.nt;if(/^(inchis|inch|closed)$/.test(c.st)&&ids.indexOf('ina')>=0)c.st='ina';if(ids.indexOf(c.st)<0)c.st=ids[0];return c});if(typeof o.cur!=='string')o.cur='';if(o.tot==null)o.tot=1;if(['','m','g'].indexOf(o.sum)<0)o.sum='';o.sumM=o.sumM==='g'?'g':'m';return o}
function load(){var a=LS.get('ns_crm',null),o;if(a&&Array.isArray(a.list)){MIG=0;o=norm(a);if(MIG){try{if(!localStorage.getItem(PFX+'ns_crm_v148'))localStorage.setItem(PFX+'ns_crm_v148',JSON.stringify(a))}catch(_){}LS.set('ns_crm',o)}return o}var b=LS.get('ns_crm_bak',null);return norm(b)}
var C=load(),unl={home:0,firm:0},Q='',F='',crmShow=null,pend=null,away=false;
function save(){try{var p=localStorage.getItem(PFX+'ns_crm');if(p)localStorage.setItem(PFX+'ns_crm_bak',p)}catch(_){}LS.set('ns_crm',C);try{saveNotes(true)}catch(_){}}
function stName(s){return s.n||TR(ST_DEF[s.id]||'?')}
function stOf(id){return C.st.filter(function(s){return s.id===id})[0]||C.st[0]}
function fT(ts){return fDate(new Date(ts))}
function fTH(ts){return fDate(new Date(ts),1)}
function remAt(c){var r=c.rem;if(!r||!r.on||!r.d)return 0;var p=String(r.d).split('-'),h=String(r.hm||'09:00').split(':');return new Date(+p[0],+p[1]-1,+p[2],+h[0]||0,+h[1]||0).getTime()}
function today0(){var d=new Date();d.setHours(23,59,59,999);return d.getTime()}
function over(c){var a=remAt(c);return a&&a<Date.now()}
function ntTxt(c){return c.hist.filter(function(h){return h.ty==='note'&&h.nt}).sort(function(a,b){return a.ts-b.ts}).map(function(h){return h.nt}).join('\n')}
function last(c){var t=0;c.hist.forEach(function(h){if(h.ty!=='note'&&h.ts>t)t=h.ts});return t||c.last||0}
function city(c){var a=String(c.addr||'').split(',');return a[a.length-1]||''}
function hay(c){return nFold([c.name,c.tel.join(' '),c.addr,c.email,c.firm,c.cui,c.nt].concat(c.hist.map(function(h){return h.nt||''})).concat(Object.keys(c.cf).map(function(k){return c.cf[k]})).join(' '))}
function inPart(){return C.list.filter(function(c){return c.grp===C.sub})}
function lockedP(p){return !!C.lock[p]&&!!pinGet()&&!unl[p]}
function pinGet(){var p=LS.get('ns_crmpin',null);return p&&p.ct?p:null}
function shown(p,k){return !C.hide[p][k]&&!(k==='firm'&&p==='home'&&C.hide.home.firm!==0)}
function vis(){var L=inPart(),q=nFold(Q).trim().split(/\s+/).filter(Boolean);if(q.length)L=L.filter(function(c){var h=hay(c);return q.every(function(w){return h.indexOf(w)>=0})});
 var byS=L;if(F)L=L.filter(function(c){return c.st===F});
 L=L.slice().sort(function(a,b){if(C.sort==='name')return String(a.name).localeCompare(String(b.name),NL);if(C.sort==='last')return last(b)-last(a);if(C.sort==='st'){var si=function(c){var i=C.st.map(function(s){return s.id}).indexOf(c.st);return i<0?99:i};return si(a)-si(b)||String(a.name).localeCompare(String(b.name),NL)}var x=remAt(a)||9e15,y=remAt(b)||9e15;return x-y||String(a.name).localeCompare(String(b.name),NL)});return{L:L,all:byS}}
/* v150: readable status ink per theme (single source: C.st colors) */
var INK={};function rgbOf(v){var e=document.createElement('i');e.style.color='#000';e.style.color=v;document.body.appendChild(e);var m=getComputedStyle(e).color.match(/[\d.]+/g)||[0,0,0];e.remove();return [+m[0],+m[1],+m[2],m[3]==null?1:+m[3]]}
function lum(c){return [0,1,2].reduce(function(a,i){var v=c[i]/255;v=v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);return a+v*[.2126,.7152,.0722][i]},0)}
function cRat(a,b){var x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function bgRGB(){var cs=getComputedStyle(document.documentElement),b=rgbOf(cs.getPropertyValue('--bg').trim()||'#000'),c=rgbOf(cs.getPropertyValue('--card').trim()||'#000'),a=c[3];return [0,1,2].map(function(i){return Math.round(c[i]*a+b[i]*(1-a))})}
function ink(col){var th=document.documentElement.getAttribute('data-theme')||'';var k=th+'|'+col;if(INK[k])return INK[k];var bg=bgRGB(),c=rgbOf(col),out=col;
 if(lum(bg)>.4){var t=0,x=c.slice(0,3);while(t<1&&(cRat(x,bg)<5||cRat(x,[0,1,2].map(function(i){return bg[i]*.78+c[i]*.22}))<5)){t+=.05;x=c.slice(0,3).map(function(v){return Math.round(v*(1-t))})}out='rgb('+x.join(',')+')'}
 return INK[k]=out}
function scv(c){return '--sc:'+esc(c)+';--sk:'+esc(ink(c))}
try{new MutationObserver(function(){INK={};rr()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']})}catch(_){}
function tyFit(g){if(!g)return;var f=function(){g.classList.remove('noico','tight');var ov=function(){return [].some.call(g.children,function(b){return b.scrollWidth>b.clientWidth+1})};if(ov())g.classList.add('tight');if(ov())g.classList.add('noico')};f();requestAnimationFrame(f)}
function hxH(c,s,tel,x){return '<div class="crhx'+(x||'')+'" style="'+scv(s.c)+'"><i class="crsd" title="'+esc(stName(s))+'"></i><span class="crnm ux">'+esc(c.name||'—')+'</span>'+(tel?'<span class="crlk crnt" data-k="p" data-v="'+esc(tel)+'">'+esc(tel)+'</span>':'')+'</div>'}
function telH(v,cls){return '<span class="crlk '+(cls||'')+'" data-k="p" data-v="'+esc(v)+'">📞 '+esc(v)+'</span>'}
/* v146: search in the phone agenda (Android) without importing; nothing is stored until a contact is tapped */
var AG={q:'',L:null,perm:'',t:0};
function canAg(){return !!(window.NotisNative&&NotisNative.contactsSearch)}
function agHave(){var h={};C.list.forEach(function(c){c.tel.forEach(function(t){var d=digits(t);if(d)h[d]=1})});return h}
function agRows(){var h=agHave();return (AG.L||[]).filter(function(x){return x&&(x.tel||[]).length&&!x.tel.some(function(t){return h[digits(t)]})})}
function agH(){if(!canAg()||!Q.trim()||lockedP(C.sub))return '';var hd='<div class="crh crag">📇 '+esc(TR('Din agendă'))+'</div>';
 if(AG.perm==='no')return '<div class="cragw">'+hd+'<div class="crc cragp" data-ag="perm"><div class="crr"><span class="ux">🔓 '+esc(TR('Permite accesul la contacte'))+'</span></div></div></div>';
 if(AG.q!==Q.trim())return '<div class="cragw"></div>';var R=agRows();if(!R.length)return '<div class="cragw"></div>';
 return '<div class="cragw">'+hd+R.map(function(x,i){return '<div class="crc crag1" data-ag="'+AG.L.indexOf(x)+'"><div class="crr"><span class="crnm ux">'+esc(x.name||x.tel[0])+'</span><span class="crplus">＋</span></div><div class="crr"><span class="crmut ux">📞 '+esc(x.tel[0])+'</span><span class="crmut">'+(x.tel.length>1?'+'+(x.tel.length-1):'')+'</span></div></div>'}).join('')+'</div>'}
function agPaint(){var v=$('spView'),o=v&&v.querySelector('.crm .cragw');if(!o)return;var t=document.createElement('div');t.innerHTML=agH()||'<div class="cragw"></div>';o.replaceWith(t.firstChild)}
function agRun(){var q=Q.trim();if(!canAg()||!q||lockedP(C.sub)){AG.L=null;agPaint();return}var r='';try{r=NotisNative.contactsSearch(q,20)}catch(_){r='err'}
 if(r==='perm'){if(AG.perm==='no'){agPaint();return}if(AG.perm==='asked')return;if(LS.get('ns_crmag',0)==='no'){AG.perm='no';agPaint();return}AG.perm='asked';
  ask('📇 '+TR('Caut și în agenda telefonului?')+'\n'+TR('Notis cere acces la contacte doar pentru căutare. Nu se importă nimic până nu atingi un contact.'),function(){var x='';try{x=NotisNative.contactsAsk()}catch(_){}if(x==='ok')window.__ctPerm(true)},function(){AG.perm='no';LS.set('ns_crmag','no');agPaint()});return}
 if(/^err/.test(r)){AG.L=null;agPaint();return}var a=[];try{a=JSON.parse(r)}catch(_){}AG.perm='ok';AG.q=q;AG.L=Array.isArray(a)?a.slice(0,20):[];agPaint()}
function agSched(){clearTimeout(AG.t);AG.t=setTimeout(agRun,250)}
window.__ctPerm=function(ok){AG.perm=ok?'ok':'no';if(ok){try{localStorage.removeItem(PFX+'ns_crmag')}catch(_){}agRun()}else{LS.set('ns_crmag','no');agPaint()}};
function agAdd(i){var x=AG.L&&AG.L[i];if(!x)return;var h=agHave();if(x.tel.some(function(t){return h[digits(t)]})){toast(TR('există deja'));agPaint();return}
 var c={id:uid(),grp:C.sub,name:x.name||x.tel[0],tel:x.tel.slice(0,3),addr:'',email:'',st:C.st[0].id,hist:[],cf:{},rem:{on:0},work:[]};C.list.push(c);save();rr();toast(TR('Adăugat în CRM'));clientOpen(c)}
function agPerm(){var x='';try{x=NotisNative.contactsAsk()}catch(_){}if(x==='ok')window.__ctPerm(true)}
function render(){var AFM=window.afMode?afMode('crm'):'both';if(AFM!=='both')C.sub=AFM;var p=C.sub,h='<div class="spv crm">'+(AFM!=='both'?'':'<div class="alseg utsub crsub">'+[['firm',TR('Firmă')],['home',TR('Acasă')]].map(function(o){return '<button type="button" class="btn'+(o[0]===p?' on':'')+'" data-cs="'+o[0]+'">'+esc(o[1])+(C.lock[o[0]]?' 🔒':'')+'</button>'}).join('')+'</div>');
 if(lockedP(p))return h+'<div class="crlock"><div>🔒 '+esc(TR('CRM protejat cu PIN'))+'</div><button type="button" class="btn" data-c="unl">'+esc(TR('Deblochează'))+'</button></div></div>';
 var V=vis(),cnt={};V.all.forEach(function(c){cnt[c.st]=(cnt[c.st]||0)+1});
 var SOL=[['rem','⏰','⏰ '+TR('Reamintire')],['last','🕘',TR('Ultimul contact')],['name','A–Z',TR('Nume')],['st','●',TR('Stare')]],SOc=SOL.filter(function(o){return o[0]===C.sort})[0]||SOL[0];
 h+='<div class="crtop"><input type="search" id="crQ" class="ux" placeholder="🔍 '+esc(TR('Caută nume, telefon, oraș, note'))+'" value="'+esc(Q)+'" autocomplete="off" data-lpignore="true"><button type="button" class="btn crb" data-c="add" aria-label="'+esc(TR('Adaugă client'))+'">＋</button><button type="button" class="btn crb" data-c="cfg" aria-label="'+esc(TR('Setări CRM'))+'">⚙</button></div>';
 h+='<div class="crbody"><div class="crfrow"><div class="crchips">'+C.st.map(function(s){return '<button type="button" class="crch'+(F===s.id?' on':'')+'" data-f="'+esc(s.id)+'" style="'+scv(s.c)+'"><span class="ux">'+esc(stName(s))+'</span> <small class="crcn">'+(cnt[s.id]||0)+'</small></button>'}).join('')+'</div><div class="crsortw"><button type="button" class="btn crb crsb" data-sm="1" aria-haspopup="true" aria-expanded="'+(SOM?'true':'false')+'" aria-label="'+esc(TR('Sortare'))+': '+esc(SOc[2])+'" title="'+esc(TR('Sortare'))+': '+esc(SOc[2])+'"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5"/></svg><i class="crsbd">'+esc(SOc[1])+'</i></button>'+(SOM?'<div class="crsortm" role="menu">'+SOL.map(function(o){return '<button type="button" role="menuitem" class="'+(C.sort===o[0]?'on':'')+'" data-so="'+o[0]+'">'+esc(o[2])+'</button>'}).join('')+'</div>':'')+'</div></div>';
 var due=inPart().filter(function(c){return remAt(c)>0}).sort(function(a,b){return remAt(a)-remAt(b)});
 if(due.length){var tm0=new Date().setHours(0,0,0,0),DY=864e5,NT=due.length>5&&!RX;var cs0=getComputedStyle(document.documentElement),og=(cs0.getPropertyValue('--orange')||'#f5b84a').trim()||'#f5b84a',rd=(cs0.getPropertyValue('--red')||'#ef4444').trim()||'#ef4444';h+='<div class="crdue" style="--crdh:'+ink(og)+';--crdb:'+ink(og)+';--crdr:'+ink(rd)+'"><button type="button" class="crh crdt" data-rt="1" aria-expanded="'+(C.remC?'false':'true')+'">⏰ '+esc(TR('Reamintiri'))+' · '+due.length+'<i class="crar sparr sp19'+(C.remC?'':' on')+'"></i></button>'+(C.remC?[]:NT?due.slice(0,5):due).map(function(c){var o=over(c),ra=remAt(c),d=new Date(ra),hm=pad(d.getHours())+':'+pad(d.getMinutes()),dd=Math.floor((new Date(ra).setHours(0,0,0,0)-tm0)/DY),w;
  if(o)w=TR('întârziat')+' · '+(dd===0?hm:dd===-1?TR('ieri'):fRD(d));else if(dd===0)w=TR('azi')+' '+hm;else if(dd===1)w=TR('mâine')+' '+hm;else w=fRD(d)+' '+hm;
  return '<div class="crdr'+(o?' crdro':'')+'" data-id="'+esc(c.id)+'">'+hxH(c,stOf(c.st),'')+(RP===c.id&&c.tel[0]?'<span class="crrt crrp crlk ux" data-k="p" data-v="'+esc(c.tel[0])+'">'+esc(c.tel[0])+'</span>':'<span class="crrt ux" data-rp="1">'+(o?'<i class="crdot"></i>':'')+esc(w)+'</span>')+'</div>'}).join('')+(due.length>5&&!C.remC?'<button type="button" class="crlk crrx" data-rx="1">'+esc(RX?TR('Arată mai puțin'):TR('Vezi toate')+' ('+due.length+')')+'</button>':'')+'</div>'}
 if(!inPart().length)h+='<div class="crempty"><div>'+esc(TR('Încă nu ai clienți aici. Adaugă primul client sau importă din contacte (⚙).'))+'</div><button type="button" class="btn" data-c="add">＋ '+esc(TR('Adaugă client'))+'</button></div>';
 else if(!V.L.length)h+='<div class="crempty"><div>'+esc(TR('Niciun rezultat'))+'</div></div>';
 else{if(Q.trim())h+='<div class="crmut crres">'+V.L.length+' '+esc(TR('rezultate'))+'</div>';
  V.L.forEach(function(c){var s=stOf(c.st),o=over(c),ra=remAt(c),l=last(c);
  if(EXP!==c.id){h+='<div class="crc crn'+(o?' crov':'')+'" data-id="'+esc(c.id)+'" style="'+scv(s.c)+'">'+hxH(c,s,c.tel[0]&&shown(p,'tel')?c.tel[0]:'')+(o?'<i class="crdot"></i>':'')+'</div>';return}
  h+='<div class="crc crexp" data-id="'+esc(c.id)+'" style="'+scv(s.c)+'">'+hxH(c,s,c.tel[0]&&shown(p,'tel')?c.tel[0]:'')+'<div class="crr"><span class="crchip ux" style="'+scv(s.c)+'">'+esc(stName(s))+'</span><span class="crmut">'+(l?esc(TR('ultim'))+': '+fT(l):'')+'</span></div>'+(ra?'<div class="crr"><span class="crmut ux">'+esc(c.firm&&shown(p,'firm')?c.firm:city(c))+'</span><span class="'+(o?'crred':'crmut')+'">'+(o?'<i class="crdot"></i>':'')+'⏰ '+esc(fTH(ra))+'</span></div>':'')+'</div>'})}
 h+=agH();
 return h+(window.afSel?afSel('crm'):'')+'</div></div>'}
window.crmRender=render;
window.__crm={get:function(){return C},set:function(d){C=norm(d);save();rr()},norm:norm,csv:csv,unl:unl,reload:function(){C=load()},vis:vis,ask:dial,ret:back,pending:function(){return pend},contacts:function(a){impShow(a)},tabs:function(){return noteTabs},ag:function(){return AG},agRun:agRun,go:function(){var t=noteTabs.filter(function(x){return x.kind==='crm'})[0];if(typeof notesOpen==='function')notesOpen();noteTab=t.id;try{nFolder=''}catch(_){}renderNotes()},st:function(){return {unl:unl,pend:pend}}};
function rr(){try{if(window.spRender)spRender()}catch(e){console.warn(e)}}
function ask(t,yes,no){var cf=$('cfModal').querySelector('.cftxt'),ok=$('cfOk'),nb=$('cfNo'),t0=cf.textContent,o0=ok.textContent,n0=nb.textContent,dg=ok.classList.contains('dngb');var back=function(){cf.textContent=t0;ok.textContent=o0;nb.textContent=n0;if(dg)ok.classList.add('dngb')};
 cf.textContent=t;cf.style.whiteSpace='pre-line';ok.textContent=TR('Da');nb.textContent=TR('Nu');ok.onclick=function(){jvClose('cfModal');back();yes()};nb.onclick=function(){jvClose('cfModal');back();if(no)no()};$('cfModal').classList.add('show')}
function openUri(k,v){var u,N=window.NotisNative;if(k==='p')u='tel:'+v.replace(/[^\d+]/g,'').replace(/^00/,'+');else if(k==='e')u='mailto:'+v;else if(k==='u')u=/^https?:/i.test(v)?v:'https://'+v;else u=N?'geo:0,0?q='+encodeURIComponent(v):'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(v);
 try{if(N&&N.openUri&&N.openUri(u))return}catch(_){}if(/^https:/.test(u)){var w=window.open(u,'_blank','noopener');if(!w)location.href=u}else location.href=u}
function dial(c,v){ask(TR('Suni?')+'\n'+v,function(){if(c&&C.auto){var h={id:uid(),ts:Date.now(),ty:'call',nt:''};c.hist.push(h);save();if(crmShow&&crmShow.id===c.id){crmShow.hist.push(JSON.parse(JSON.stringify(h)))}if(C.ask)pend={c:c.id,h:h.id,t:Date.now()};away=false;rr();shRefresh()}openUri('p',v)})}
function lnk(c,k,v){if(k==='p')return dial(c,v);ask(TR(k==='a'?'Deschizi locația?':k==='e'?'Scrii un email?':'Deschizi linkul?')+'\n'+v,function(){openUri(k,v)})}
/* return from the call → note card */
function back(){if(!pend)return;var p=pend;pend=null;var c=C.list.filter(function(x){return x.id===p.c})[0];if(!c)return;var h=c.hist.filter(function(x){return x.id===p.h})[0];if(!h)return;discDlg(c,h,true)}
document.addEventListener('visibilitychange',function(){if(document.hidden){away=true;if(!pend){unl.home=unl.firm=0}}else if(pend&&away&&Date.now()-pend.t>1500)setTimeout(back,250)});
window.addEventListener('blur',function(){if(pend)away=true});window.addEventListener('focus',function(){if(pend&&away&&Date.now()-pend.t>1500)setTimeout(back,250)});
(function w(){var A=window.NotisApp;if(!A||!A.sync){setTimeout(w,500);return}if(A.sync._crm)return;var s0=A.sync;A.sync=function(){var r=s0.apply(this,arguments);if(pend&&Date.now()-pend.t>1500){away=true;setTimeout(back,250)}return r};A.sync._crm=1})();
/* ---- generic sheet ---- */
function sheet(html,cls){var m=$('crmSheet');if(!m){m=document.createElement('div');m.id='crmSheet';m.className='modal crmm';document.body.appendChild(m)}var st=m.scrollTop,same=cls==='crcl'&&m.classList.contains('crcardm')&&m.classList.contains('show');m.innerHTML='<div class="card crm crsh '+(cls||'')+'">'+html+'</div>';cardPos(m,cls==='crcl');m.classList.add('show');m.scrollTop=same?st:0;return m.firstChild}
function cardPos(m,on){m.classList.toggle('crcardm',!!on);if(!on){m.style.top=m.style.bottom='';return}var t=0,b=0,H=innerHeight,nt=$('noteTabs'),tp=document.querySelector('#notesPg .ntop');[nt,tp].forEach(function(e){if(e&&e.offsetParent!==null){var r=e.getBoundingClientRect();if(r.bottom>t&&r.bottom<H/2)t=r.bottom}});document.querySelectorAll('body *').forEach(function(e){if(e===m||m.contains(e))return;var s=getComputedStyle(e);if(s.position!=='fixed'||s.display==='none'||s.visibility==='hidden')return;var r=e.getBoundingClientRect();if(r.height>0&&r.height<H/3&&r.top>H/2&&r.width>=innerWidth*.6&&H-r.top>b)b=H-r.top});m.style.top=Math.round(Math.max(0,t))+'px';m.style.bottom=Math.round(b)+'px'}
window.addEventListener('resize',function(){var m=$('crmSheet');if(m&&m.classList.contains('crcardm')&&m.classList.contains('show'))cardPos(m,true)});
function stepBack(){var c=crmShow;if(!c)return;grab();var sv=C.list.filter(function(x){return x.id===c.id})[0];var cl=function(x){x=fixC(JSON.parse(JSON.stringify(x)));delete x._new;return JSON.stringify(x)};var go=function(){EXP=c.id;BK=1;shClose();rr()};
 if(!sv||cl(sv)===cl(c)){go();return}ask(TR('Salvezi modificările?'),function(){if(commit(c))go()},function(){})}
function shClose(){var m=$('crmSheet');if(m){m.classList.remove('show');m.innerHTML=''}crmShow=null}
function dlg(html){var m=$('crmDlg');if(!m){m=document.createElement('div');m.id='crmDlg';m.className='modal crmm';document.body.appendChild(m)}m.innerHTML='<div class="card crm crdlg">'+html+'</div>';m.classList.add('show');return m.firstChild}
function dlgClose(){var m=$('crmDlg');if(m){m.classList.remove('show');m.innerHTML=''}}
window.__crmBack=function(){var d=$('crmDlg');if(d&&d.classList.contains('show')){dlgClose();return true}var s=$('crmSheet');if(s&&s.classList.contains('show')){shClose();rr();return true}return false};
(function(){var hb=window.notisHandleBack;window.notisHandleBack=function(){var top=['cfModal','pinModal','alFire'].some(function(i){var e=$(i);return e&&e.classList.contains('show')});if(!top&&window.__crmBack())return true;return hb?hb.apply(this,arguments):false}})();
/* ---- client sheet ---- */
var OPN={d:0,h:0,n:0,w:0};
function fixC(c){if(!c)return c;if(!Array.isArray(c.tel))c.tel=c.tel?[String(c.tel)]:[];if(!Array.isArray(c.hist))c.hist=[];if(!Array.isArray(c.work))c.work=[];if(!c.cf||typeof c.cf!=='object')c.cf={};if(!c.rem||typeof c.rem!=='object')c.rem={on:0};return c}
function prParse(v){v=String(v||'').replace(/[\s\u00a0']/g,'');if(!v)return '';if(/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(v))v=v.replace(/\./g,'');v=v.replace(',','.');var n=+v;return isFinite(n)&&n>=0?Math.round(n*100)/100:NaN}
function clientOpen(c,isNew){fixC(c);OPN.w=0;OPN.h=0;crmShow=fixC(JSON.parse(JSON.stringify(c)));crmShow._new=isNew?1:0;if(isNew)OPN.d=1;shRender()}
function shRefresh(){if(crmShow&&$('crmSheet')&&$('crmSheet').classList.contains('show'))shRender()}
function fldIn(lbl,k,v,ty){return '<label class="crf"><span>'+esc(lbl)+'</span><input class="ux" data-f="'+esc(k)+'" type="'+(ty||'text')+'" value="'+esc(v||'')+'" autocomplete="off" data-lpignore="true"'+(ty==='tel'?' inputmode="tel"':'')+'></label>'}
function shRender(){var c=crmShow,p=c.grp,s=stOf(c.st),h='';
 var T=shown(p,'tel')?c.tel.filter(Boolean):[];h+=hxH({name:c.name||TR('Client nou')},s,T[0]||'',' crhd crhs')+'<div class="crr crr1s"><span class="crchip crchs ux" style="'+scv(s.c)+'">'+esc(stName(s))+'</span></div>';
 T.slice(1).forEach(function(t){h+='<div class="crr crr1">'+telH(t,'crtel')+'</div>'});
 h+='<hr class="crhr">';if(c.addr&&shown(p,'addr'))h+='<div class="crln"><span class="crlk" data-k="a" data-v="'+esc(c.addr)+'">📍 '+esc(c.addr)+'</span></div><hr class="crhr">';
 h+=workH(c);
 if(c.email&&shown(p,'email'))h+='<div><span class="crlk" data-k="e" data-v="'+esc(c.email)+'">✉︎ '+esc(c.email)+'</span></div>';
 if(p==='firm'&&shown(p,'firm')&&(c.firm||c.cui))h+='<div class="crmut ux">🏢 '+esc([c.firm,c.cui?'CUI '+c.cui:''].filter(Boolean).join(' · '))+'</div>';
 h+='<div class="crsec"><button type="button" class="crcol'+(OPN.d?' open':'')+'" data-o="d">'+esc(TR('Date client'))+'<i class="sparr"></i></button>';
 if(OPN.d){h+='<div class="crf"><span>'+esc(TR('Stare'))+'</span><div class="crchips crstp">'+C.st.map(function(x){return '<button type="button" class="crch'+(x.id===c.st?' on':'')+'" data-st="'+esc(x.id)+'" style="'+scv(x.c)+'"><span class="ux">'+esc(stName(x))+'</span></button>'}).join('')+'</div></div>';h+=fldIn(TR('Nume'),'name',c.name);if(shown(p,'tel')){h+=fldIn(TR('Telefon'),'tel0',c.tel[0],'tel');h+=fldIn(TR('Telefon 2'),'tel1',c.tel[1],'tel')}
  if(shown(p,'addr'))h+=fldIn(TR('Adresă'),'addr',c.addr);if(shown(p,'email'))h+=fldIn(TR('Email'),'email',c.email,'email');
  if(p==='firm'&&shown(p,'firm')){h+=fldIn(TR('Firmă'),'firm',c.firm);h+=fldIn('CUI','cui',c.cui)}
  C.fld[p].forEach(function(f){h+=fldIn(f.n,'cf:'+f.id,c.cf[f.id],f.t==='num'?'number':f.t==='date'?'date':'text')})}
 else C.fld[p].forEach(function(f){if(c.cf[f.id])h+='<div class="crr"><span class="crmut ux">'+esc(f.n)+'</span><span class="ux">'+esc(f.t==='date'?dLbl2(c.cf[f.id]):c.cf[f.id])+'</span></div>'});
 h+='</div><div class="crsec"><button type="button" class="crcol'+(OPN.h?' open':'')+'" data-o="h">'+esc(TR('Istoric notițe'))+' <span class="crmut">'+c.hist.length+'</span><i class="sparr"></i></button>';
 if(OPN.h){var H=c.hist.slice().sort(function(a,b){return b.ts-a.ts});h+='<div class="crtl">'+H.map(function(x){return '<div class="crti" data-h="'+esc(x.id)+'"><b>'+esc(fTH(x.ts))+'</b> · '+esc(TR(TY[x.ty]||TY.call))+(x.nt?' · <span class="ux crpre">'+esc(x.nt)+'</span>':'')+'</div>'}).join('')+'</div><button type="button" class="crlk crad" data-c="disc">＋ '+esc(TR('Adaugă'))+'</button>'}
 h+='</div>';
 var r=c.rem||{};h+='<div class="crsec"><label class="crrow"><span>⏰ '+esc(TR('Reamintire'))+'</span><input type="checkbox" data-rem="on"'+(r.on?' checked':'')+'></label><div class="crr2"><input type="date" data-rem="d" value="'+esc(r.d||dkey(new Date(Date.now()+864e5)))+'"><input type="time" data-rem="hm" value="'+esc(r.hm||'10:00')+'"></div>'+(r.on&&over(c)?'<div class="crred"><i class="crdot"></i>'+esc(TR('Reamintire depășită'))+'</div>':'')+'</div>';
 h+='<div class="crbtns"><button type="button" class="btn" data-c="share">⤴ '+esc(TR('Trimite'))+'</button>'+(c._new?'':'<button type="button" class="btn dngb" data-c="del">'+esc(TR('Șterge'))+'</button>')+'<button type="button" class="btn" data-c="cancel">'+esc(TR('Anulează'))+'</button><button type="button" class="btn crok" data-c="save">'+esc(TR('Salvează'))+'</button></div>';
 var el=sheet(h,'crcl');}
function wk(d){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()-((x.getDay()+6)%7));return dkey(x)}
function money(n){var v=Math.round(n*100)/100;try{return v.toLocaleString(NL,{maximumFractionDigits:2})}catch(_){return String(v)}}
function cur(){return C.cur||TR('lei')}
function workH(c){var T0,h,W=(c.work||[]).slice().sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:0}),T0=0;W.forEach(function(w){if(w.pr!==''&&w.pr!=null&&!isNaN(+w.pr))T0+=+w.pr});h='<div class="crsec crwork"><button type="button" class="crcol'+(OPN.w?' open':'')+'" data-o="w">'+esc(TR('Lucrări'))+' <span class="crmut">'+W.length+'</span>'+(function(){var v=0,mk=dkey(new Date()).slice(0,7);if(C.sum==='g')v=T0;else if(C.sum==='m')W.forEach(function(w){if(String(w.d).slice(0,7)===mk&&w.pr!==''&&w.pr!=null&&!isNaN(+w.pr))v+=+w.pr});return C.sum&&v?'<span class="crtot crsum ux">'+esc(money(v))+' '+esc(cur())+'</span>':''})()+'<i class="sparr"></i></button>';
 if(!OPN.w)return h+'</div>';h+='<div class="crwsum"><label><input type="checkbox" data-ws="1"'+(C.sum?' checked':'')+'> '+esc(TR('Arată suma în afară'))+'</label><span class="crwseg">'+['m','g'].map(function(k){return '<button type="button" data-wsm="'+k+'" class="'+((C.sum||C.sumM)===k?'on':'')+'">'+esc(TR(k==='m'?'Lunar':'General'))+'</button>'}).join('')+'</span></div>';h+='<button type="button" class="crlk crad" data-c="wadd">＋ '+esc(TR('Adaugă lucrare'))+'</button>';
 if(!W.length)return h+'<div class="crmut">'+esc(TR('Nicio lucrare încă. Adaugă data, denumirea lucrării și prețul.'))+'</div></div>';
 var ys=[];W.forEach(function(w){var y=String(w.d).slice(0,4);if(ys.indexOf(y)<0)ys.push(y)});
 ys.forEach(function(y,yi){var L=W.filter(function(w){return String(w.d).slice(0,4)===y}),tot=0;L.forEach(function(w){if(w.pr!==''&&w.pr!=null&&!isNaN(+w.pr))tot+=+w.pr});var yo=OPN.y&&y in OPN.y?OPN.y[y]:yi===0;
  h+='<div class="spyr'+(yo?' open':'')+'" data-y="'+y+'"><div class="spyh" data-yy="'+y+'"><span class="ux">'+y+'</span><span class="spcnt">'+L.length+'</span>'+(C.tot&&tot?'<span class="crtot ux">'+esc(money(tot))+' '+esc(cur())+'</span>':'')+'<i class="sparr"></i></div>';
  if(yo){var mo='',wq='';L.forEach(function(w){var m=String(w.d).slice(0,7),k=wk(w.d),sep='';if(m!==mo){mo=m;wq=k;var dt=new Date(w.d+'T12:00:00'),ml;try{ml=dt.toLocaleDateString(NL,{month:'long'})}catch(_){ml=m}h+='<div class="crmon ux">'+esc(ml)+'</div>'}else if(k!==wq){wq=k;sep=' crwsep'}
   h+='<div class="crwk'+sep+'" data-w="'+esc(w.id)+'"><span class="c0">'+esc(dLbl2(w.d))+'</span><span class="c1 ux">'+esc(w.n||'—')+'</span><span class="c2 ux">'+(w.pr!==''&&w.pr!=null&&!isNaN(+w.pr)?esc(money(+w.pr))+' '+esc(cur()):'')+'</span></div>'})}
  h+='</div>'});return h+'</div>'}
function workDlg(w){var c=crmShow,isN=!w;w=w||{id:uid(),d:dkey(new Date()),n:'',pr:''};
 var d=dlg('<div class="crh crbig">'+esc(TR(isN?'Adaugă lucrare':'Lucrare'))+' · <span class="ux">'+esc(c.name||'')+'</span></div>'+
 '<label class="crf"><span>'+esc(TR('Data'))+'</span><input type="date" id="cwD" value="'+esc(w.d)+'"></label>'+
 '<label class="crf"><span>'+esc(TR('Denumirea lucrării'))+'</span><input class="ux" id="cwN" value="'+esc(w.n)+'" autocomplete="off" data-lpignore="true"></label>'+
 '<label class="crf"><span>'+esc(TR('Preț'))+' ('+esc(cur())+')</span><input id="cwP" type="text" inputmode="decimal" autocomplete="off" value="'+esc(w.pr)+'"></label>'+
 '<div class="crbtns">'+(isN?'':'<button type="button" class="btn dngb" id="cwDel">'+esc(TR('Șterge'))+'</button>')+'<button type="button" class="btn" id="cwNo">'+esc(TR('Anulează'))+'</button><button type="button" class="btn crok" id="cwOk">'+esc(TR('Salvează'))+'</button></div>');
 function put(){var s=C.list.filter(function(x){return x.id===c.id})[0];if(s&&!c._new){s.work=JSON.parse(JSON.stringify(c.work));save();rr()}OPN.y=OPN.y||{};OPN.y[String(w.d).slice(0,4)]=1;dlgClose();shRender()}
 d.querySelector('#cwNo').onclick=dlgClose;
 d.querySelector('#cwOk').onclick=function(){var dv=d.querySelector('#cwD').value,nv=d.querySelector('#cwN').value.trim(),pv=d.querySelector('#cwP').value.trim();if(!dv)dv=dkey(new Date());if(!nv&&!pv){toast(TR('Scrie denumirea lucrării'));return}var pp=prParse(pv);if(pp!==pp){toast(TR('Preț invalid'));return}try{if(!/^\d{4}-\d\d-\d\d$/.test(dv))dv=dkey(new Date());fixC(c);w.d=dv;w.n=nv;w.pr=pp;var i=c.work.findIndex(function(x){return x.id===w.id});if(i>=0)c.work[i]=w;else c.work.push(w);put()}catch(e){toast(TR('Eroare la salvare')+': '+(e&&e.message||e))}};
 var dl=d.querySelector('#cwDel');if(dl)dl.onclick=function(){ask(TR('Ștergi lucrarea?')+'\n'+(w.n||dLbl2(w.d)),function(){c.work=c.work.filter(function(x){return x.id!==w.id});put()})}}
window.addEventListener('click',function(e){var m=$('crmSheet');if(!m||!m.contains(e.target)||!m.querySelector('.crcl')||!crmShow)return;var t=e.target,y=t.closest('[data-yy]'),w=t.closest('[data-w]'),a=t.closest('[data-c="wadd"]');if(!y&&!w&&!a)return;e.stopPropagation();e.preventDefault();grab();
 if(y){OPN.y=OPN.y||{};var k=y.dataset.yy,cur0=m.querySelector('.spyr[data-y="'+k+'"]').classList.contains('open');OPN.y[k]=!cur0;shRender()}else if(w){var x=crmShow.work.filter(function(q){return q.id===w.dataset.w})[0];if(x)workDlg(JSON.parse(JSON.stringify(x)))}else workDlg(null)},true);
/* tapping the tabs/top bar while a client card is open: keep edits (autosave), then close */
window.addEventListener('click',function(e){var m=$('crmSheet');if(!m||!m.classList.contains('show')||!m.classList.contains('crcardm')||!crmShow)return;var t=e.target;if(!t.closest||!(t.closest('#noteTabs')||t.closest('#notesPg .ntop')))return;grab();var c=crmShow;if(String(c.name||'').trim()||c.tel.length)commit(c);shClose()},true);
function dLbl2(s){return fDate(s)}
function grab(){var c=crmShow,m=$('crmSheet');if(!c||!m)return;m.querySelectorAll('[data-f]').forEach(function(i){var k=i.dataset.f,v=i.value.trim();if(k==='tel0')c.tel[0]=v;else if(k==='tel1')c.tel[1]=v;else if(k.indexOf('cf:')===0){if(v)c.cf[k.slice(3)]=v;else delete c.cf[k.slice(3)]}else c[k]=v});c.tel=c.tel.filter(Boolean);
 var ro=m.querySelector('[data-rem="on"]');if(ro){c.rem={on:ro.checked?1:0,d:m.querySelector('[data-rem="d"]').value,hm:m.querySelector('[data-rem="hm"]').value||'09:00'}}}
function commit(c){if(!String(c.name||'').trim()&&!c.tel.length){toast(TR('Scrie numele clientului'));return false}var o=JSON.parse(JSON.stringify(c));delete o._new;var i=C.list.findIndex(function(x){return x.id===o.id});if(i>=0)C.list[i]=o;else C.list.push(o);save();rr();return true}
function shareTxt(c){var p=c.grp,L=[c.name];c.tel.forEach(function(t){L.push('📞 '+t)});if(c.addr)L.push('📍 '+c.addr);if(c.email)L.push('✉ '+c.email);if(p==='firm'&&(c.firm||c.cui))L.push('🏢 '+[c.firm,c.cui?'CUI '+c.cui:''].filter(Boolean).join(' · '));L.push(TR('Stare')+': '+stName(stOf(c.st)));C.fld[p].forEach(function(f){if(c.cf[f.id])L.push(f.n+': '+c.cf[f.id])});var nx=ntTxt(c);if(nx)L.push(nx);return L.filter(Boolean).join('\n')}
function shareStr(t,title){try{if(window.NotisNative&&NotisNative.shareText){NotisNative.shareText(t,title);return}}catch(_){}if(navigator.share){navigator.share({title:title,text:t}).catch(function(){});return}try{navigator.clipboard.writeText(t);toast(TR('Copiat'))}catch(_){}}
document.addEventListener('click',function(e){var m=$('crmSheet');if(!m||!m.contains(e.target)||!crmShow||!m.querySelector('.crcl'))return;var c=crmShow,t=e.target;
 if(t.closest('.crhd .crsd')&&!c._new){e.preventDefault();stepBack();return}if(t.closest('.crhd .crnm'))return;
 var l=t.closest('.crlk[data-k]');if(l){e.preventDefault();grab();lnk(C.list.filter(function(x){return x.id===c.id})[0]||null,l.dataset.k,l.dataset.v);return}
 var st=t.closest('[data-st]');if(st){grab();c.st=st.dataset.st;if(!c._new){var so=C.list.filter(function(x){return x.id===c.id})[0];if(so){so.st=c.st;save();rr()}}shRender();return}
 var ws=t.closest('[data-ws],[data-wsm]');if(ws){grab();if(ws.dataset.wsm){C.sumM=ws.dataset.wsm;if(C.sum)C.sum=C.sumM}else C.sum=ws.checked?C.sumM:'';save();shRender();return}
 var o=t.closest('[data-o]');if(o){grab();OPN[o.dataset.o]=OPN[o.dataset.o]?0:1;shRender();return}
 var ti=t.closest('.crti');if(ti){grab();var hh=c.hist.filter(function(x){return x.id===ti.dataset.h})[0];if(hh)discDlg(c,hh,false,true);return}
 var b=t.closest('[data-c]');if(!b)return;var A=b.dataset.c;
 if(A==='disc'){grab();discDlg(c,null)}
 else if(A==='save'){grab();if(commit(c))shClose()}
 else if(A==='cancel'){shClose();rr()}
 else if(A==='share'){grab();shareStr(shareTxt(c),c.name)}
 else if(A==='del'){ask(TR('Ștergi clientul?')+'\n'+(c.name||''),function(){C.list=C.list.filter(function(x){return x.id!==c.id});save();shClose();rr();toast(TR('Client șters'))})}},true);
/* ---- add / edit discussion; post-call note ---- */
function discDlg(c,h,post,edit){var now=new Date(h?h.ts:Date.now()),ty=h?h.ty:'call',r=c.rem||{};
 var html='<div class="crh crbig">'+esc(post?TR('Notiță despre convorbire'):(edit?TR('Discuție'):TR('Adaugă discuție')))+' · <span class="ux">'+esc(c.name||'')+'</span></div>'+
 '<div class="crr2"><input type="date" id="cdD" value="'+dkey(now)+'"><input type="time" id="cdT" value="'+pad(now.getHours())+':'+pad(now.getMinutes())+'"></div>'+
 '<div class="alseg crseg" id="cdTy">'+Object.keys(TY).map(function(k){return '<button type="button" class="btn'+(k===ty?' on':'')+'" data-v="'+k+'"><i class="crti0">'+({call:'📞',msg:'💬',meet:'🤝',note:'📝'}[k]||'')+'</i><span>'+esc(TR(TY[k]))+'</span></button>'}).join('')+'</div>'+
 '<textarea id="cdN" class="ux" rows="3" placeholder="'+esc(TR('Notă (opțional)'))+'">'+esc(h&&h.nt||'')+'</textarea>'+
 '<label class="crrow"><span>⏰ '+esc(TR('Următoarea reamintire'))+'</span><input type="checkbox" id="cdR"'+(r.on&&!over(c)?' checked':'')+'></label><div class="crr2"><input type="date" id="cdRD" value="'+esc(r.on&&!over(c)?r.d:dkey(new Date(Date.now()+3*864e5)))+'"><input type="time" id="cdRT" value="'+esc(r.hm||'10:00')+'"></div>'+
 '<div class="crbtns">'+(edit?'<button type="button" class="btn dngb" id="cdDel">'+esc(TR('Șterge'))+'</button>':'')+'<button type="button" class="btn" id="cdNo">'+esc(post?TR('Sari peste'):TR('Anulează'))+'</button><button type="button" class="btn crok" id="cdOk">'+esc(TR('Salvează'))+'</button></div>';
 var d=dlg(html);tyFit(d.querySelector('#cdTy'));d.querySelector('#cdTy').onclick=function(e){var b=e.target.closest('button');if(!b)return;[].forEach.call(this.children,function(x){x.classList.toggle('on',x===b)})};
 d.querySelector('#cdNo').onclick=dlgClose;
 if(edit)d.querySelector('#cdDel').onclick=function(){ask(TR('Ștergi discuția?'),function(){c.hist=c.hist.filter(function(x){return x.id!==h.id});dlgClose();if(!sync(c))shRender()})};
 d.querySelector('#cdOk').onclick=function(){try{fixC(c);cdSave()}catch(e){toast(TR('Eroare la salvare')+': '+(e&&e.message||e))}};function cdSave(){var D=d.querySelector('#cdD').value||dkey(),T=(d.querySelector('#cdT').value||'00:00').split(':'),p=D.split('-'),ts=new Date(+p[0],+p[1]-1,+p[2],+T[0]||0,+T[1]||0).getTime();
  var o=h||{id:uid()};o.ts=ts;o.ty=d.querySelector('#cdTy .on').dataset.v;o.nt=d.querySelector('#cdN').value.trim();if(!h)c.hist.push(o);
  if(d.querySelector('#cdR').checked)c.rem={on:1,d:d.querySelector('#cdRD').value,hm:d.querySelector('#cdRT').value||'09:00'};else c.rem={on:0,d:'',hm:''};
  dlgClose();if(!sync(c))shRender();toast(TR('Salvat'))}}
/* a discussion saved from the open sheet stays in the working copy; from outside (post-call) it is written at once */
function sync(c){var open=crmShow&&crmShow.id===c.id&&$('crmSheet').querySelector('.crcl');if(c===crmShow&&open){if(!c._new){var s=C.list.filter(function(x){return x.id===c.id})[0];if(s){s.hist=JSON.parse(JSON.stringify(c.hist));s.rem=JSON.parse(JSON.stringify(c.rem||{}));save();rr()}}return false}save();rr();if(open){crmShow.hist=JSON.parse(JSON.stringify(c.hist));crmShow.rem=JSON.parse(JSON.stringify(c.rem||{}));shRender()}return true}
/* ---- list clicks ---- */
window.addEventListener('click',function(e){var v=$('spView');if(!v||!v.contains(e.target)||!e.target.closest('.crm'))return;var t=e.target;e.stopPropagation();
 var sb=t.closest('[data-cs]');if(sb){C.sub=sb.dataset.cs;F='';LS.set('ns_crm',C);rr();return}
 var l=t.closest('.crlk[data-k]');if(l){var cc=t.closest('[data-id]');lnk(cc&&C.list.filter(function(x){return x.id===cc.dataset.id})[0],l.dataset.k,l.dataset.v);return}
 var f=t.closest('[data-f]');if(f&&f.classList.contains('crch')){F=F===f.dataset.f?'':f.dataset.f;rr();return}
 var sm=t.closest('[data-sm]')||(t.classList&&t.classList.contains('crsortw')?t:null);if(sm){SOM=SOM?0:1;rr();return}
 var so=t.closest('[data-so]');if(so){C.sort=so.dataset.so;SOM=0;LS.set('ns_crm',C);rr();return}
 if(SOM){SOM=0;rr();if(!t.closest('[data-id]'))return}
 var b=t.closest('[data-c]');if(b){var A=b.dataset.c;if(A==='add')clientOpen({id:uid(),grp:C.sub,name:'',tel:[],addr:'',email:'',st:C.st[0].id,hist:[],cf:{},rem:{on:0}},true);else if(A==='cfg')cfgOpen();else if(A==='unl')unlock(C.sub);return}
 var ag=t.closest('[data-ag]');if(ag){if(ag.dataset.ag==='perm')agPerm();else agAdd(+ag.dataset.ag);return}
 var rt=t.closest('[data-rt]');if(rt){C.remC=C.remC?0:1;RP='';LS.set('ns_crm',C);rr();return}
 var rx=t.closest('[data-rx]');if(rx){RX=RX?0:1;rr();return}
 var rp=t.closest('[data-rp]'),dr=t.closest('.crdr');if(rp&&dr){RP=RP===dr.dataset.id?'':dr.dataset.id;clearTimeout(RPT);if(RP)RPT=setTimeout(function(){if(RP){RP='';rr()}},6000);rr();return}
 if(RP){RP='';rr();if(!t.closest('[data-id]'))return}
 var cd=t.closest('[data-id]');if(cd){var id=cd.dataset.id,bk=!!t.closest('.crsd'),c0=C.list.filter(function(x){return x.id===id})[0];if(!c0)return;BK=0;
  if(bk){if(EXP===id){EXP='';rr()}return}
  if(EXP!==id){EXP=id;rr();if(cd.classList.contains('crdr'))setTimeout(function(){var e=document.querySelector('#spView .crc[data-id="'+id+'"]');if(e&&e.scrollIntoView)e.scrollIntoView({block:'nearest'})},30);return}
  clientOpen(c0)}},true);
document.addEventListener('input',function(e){if(e.target.id!=='crQ')return;Q=e.target.value;var v=$('spView'),o=v&&v.querySelector('.crm .crbody');if(!o){rr();return}var t=document.createElement('div');t.innerHTML=render();var n=t.querySelector('.crbody');if(n)o.replaceWith(n);agSched()});
/* ---- lock (same PIN mechanism as Bibliotecă: PBKDF2→AES-GCM check value, pinShow, fingerprint) ---- */
function pinTry(pn){var L=pinGet();return lkDerive(pn,b64d(L.salt)).then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(L.iv)},k,b64d(L.ct))}).then(function(b){return new TextDecoder().decode(b)==='notis-crm'}).catch(function(){return false})}
function unlock(p,then){var L=pinGet();if(!L){unl[p]=1;rr();return}pinShow({bio:'crm',len:L.n,title:'🔒 CRM'+TR(' · introdu PIN-ul'),done:function(pn){return pinTry(pn).then(function(ok){if(!ok)return TR('PIN greșit');unl.home=unl.firm=1;setTimeout(function(){rr();if(then)then()},0);return true})}})}
function pinMake(pl,done){if(!window.crypto||!crypto.subtle){toast(TR('Criptarea nu e disponibilă aici'));return}
 function s1(msg){pinShow({len:pl,title:TR('Alege un PIN pentru CRM'),msg:msg,done:function(p1){setTimeout(function(){s2(p1)},0);return true}})}
 function s2(p1){pinShow({len:pl,bio:'crm',title:TR('Confirmă PIN-ul'),done:function(p2){if(p2!==p1){setTimeout(function(){s1(TR('PIN-urile nu se potrivesc'))},0);return true}
  var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));return lkDerive(p2,salt).then(function(k){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode('notis-crm'))}).then(function(ct){LS.set('ns_crmpin',{n:pl,salt:b64e(salt),iv:b64e(iv),ct:b64e(ct)});unl.home=unl.firm=1;done();return true})}})}
 s1()}
/* ---- settings ---- */
function cfgOpen(){var p=C.sub,h='<div class="crh crbig">⚙ '+esc(TR('Setări CRM'))+' · '+esc(TR(p==='firm'?'Firmă':'Acasă'))+'</div>';
 h+='<div class="crsec"><div class="crh">'+esc(TR('Stări'))+'</div>'+C.st.map(function(s,i){return '<div class="crst" data-i="'+i+'"><button type="button" class="crsw2" data-a="col" style="'+scv(s.c)+'" aria-label="'+esc(TR('Culoare'))+'"></button><input class="ux" data-a="nm" value="'+esc(stName(s))+'"><button type="button" class="crx" data-a="up" aria-label="↑">↑</button><button type="button" class="crx" data-a="dn" aria-label="↓">↓</button><button type="button" class="crx dngt" data-a="del" aria-label="'+esc(TR('Șterge'))+'">✕</button></div>'}).join('')+'<div class="crpal" hidden>'+PAL.map(function(c){return '<button type="button" data-pc="'+c+'" style="--sc:'+c+'"></button>'}).join('')+'</div><button type="button" class="crlk crad" data-a="stadd">＋ '+esc(TR('Adaugă stare'))+'</button></div>';
 h+='<div class="crsec"><div class="crh">'+esc(TR('Câmpuri'))+'</div>'+DFLD.filter(function(f){return f[0]!=='firm'||p==='firm'}).map(function(f){return '<label class="crrow"><span>'+esc(TR(f[1]))+'</span><input type="checkbox" data-fv="'+f[0]+'"'+(shown(p,f[0])?' checked':'')+'></label>'}).join('')+
  C.fld[p].map(function(f,i){return '<div class="crst" data-fi="'+i+'"><input class="ux" data-a="fn" value="'+esc(f.n)+'"><select data-a="ft">'+[['txt','Text'],['num','Număr'],['date','Dată']].map(function(o){return '<option value="'+o[0]+'"'+(f.t===o[0]?' selected':'')+'>'+esc(TR(o[1]))+'</option>'}).join('')+'</select><button type="button" class="crx dngt" data-a="fdel" aria-label="'+esc(TR('Șterge'))+'">✕</button></div>'}).join('')+'<button type="button" class="crlk crad" data-a="fadd">＋ '+esc(TR('Câmp nou'))+'</button></div>';
 h+='<div class="crsec"><div class="crh">'+esc(TR('Apeluri'))+'</div><label class="crrow"><span>'+esc(TR('Notează automat apelurile'))+'</span><input type="checkbox" data-o="auto"'+(C.auto?' checked':'')+'></label><label class="crrow"><span>'+esc(TR('Cere notă după convorbire'))+'</span><input type="checkbox" data-o="ask"'+(C.ask?' checked':'')+'></label></div>';
 h+='<div class="crsec"><div class="crh">'+esc(TR('Lucrări'))+'</div><label class="crrow"><span>'+esc(TR('Total pe an'))+'</span><input type="checkbox" data-o="tot"'+(C.tot?' checked':'')+'></label><label class="crrow"><span>'+esc(TR('Arată suma în afară'))+'</span><select data-a="sum">'+[['',TR('Nu')],['m',TR('Total lunar')],['g',TR('Total general')]].map(function(o){return '<option value="'+o[0]+'"'+(C.sum===o[0]?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select></label><label class="crrow"><span>'+esc(TR('Monedă'))+'</span><input class="ux crcur" data-a="cur" value="'+esc(cur())+'" maxlength="6"></label></div>';
 h+='<div class="crsec"><div class="crh">🔒 '+esc(TR('Blocare cu PIN'))+'</div>'+['firm','home'].map(function(q){return '<label class="crrow"><span>'+esc(TR(q==='firm'?'Firmă':'Acasă'))+'</span><input type="checkbox" data-lk="'+q+'"'+(C.lock[q]?' checked':'')+'></label>'}).join('')+'</div>';
 var canImp=!!(window.NotisNative&&NotisNative.contactsPick)||!!(navigator.contacts&&navigator.contacts.select);
 h+='<div class="crsec">'+(canImp?'<button type="button" class="btn crwide" data-a="imp">📇 '+esc(TR('Importă din contacte'))+'</button>':'<div class="crmut">📇 '+esc(TR('Importul din contacte merge în aplicația Android sau în Chrome pe Android.'))+'</div>')+'<button type="button" class="btn crwide" data-a="csv">⤴ '+esc(TR('Export CSV'))+'</button></div>';
 h+='<div class="crbtns"><button type="button" class="btn crok" data-a="close">OK</button></div>';sheet(h,'crcfg')}
var palI=-1;
document.addEventListener('click',function(e){var m=$('crmSheet');if(!m||!m.contains(e.target)||!m.querySelector('.crcfg'))return;var t=e.target,p=C.sub;
 var pc=t.closest('[data-pc]');if(pc&&palI>=0){C.st[palI].c=pc.dataset.pc;palI=-1;save();cfgOpen();rr();return}
 var a=t.closest('[data-a]');if(!a)return;var A=a.dataset.a,row=a.closest('.crst'),i=row?+row.dataset.i:-1,fi=row?+row.dataset.fi:-1;
 if(A==='col'){palI=i;var P=m.querySelector('.crpal');P.hidden=false;row.after(P)}
 else if(A==='up'&&i>0){var x=C.st.splice(i,1)[0];C.st.splice(i-1,0,x);save();cfgOpen();rr()}
 else if(A==='dn'&&i<C.st.length-1){var y=C.st.splice(i,1)[0];C.st.splice(i+1,0,y);save();cfgOpen();rr()}
 else if(A==='del'){if(C.st.length<2){toast(TR('Rămâne cel puțin o stare'));return}var s=C.st[i];ask(TR('Ștergi starea?')+'\n'+stName(s),function(){C.st.splice(i,1);var f=C.st[0].id;C.list.forEach(function(c){if(c.st===s.id)c.st=f});if(F===s.id)F='';save();cfgOpen();rr()})}
 else if(A==='stadd'){var used=C.st.map(function(s){return s.c}),c=PAL.filter(function(x){return used.indexOf(x)<0})[0]||PAL[4];C.st.push({id:'s'+uid(),n:TR('Stare nouă'),c:c});save();cfgOpen();rr()}
 else if(A==='fadd'){C.fld[p].push({id:'f'+uid(),n:TR('Câmp nou'),t:'txt'});save();cfgOpen()}
 else if(A==='fdel'){var fl=C.fld[p][fi];ask(TR('Ștergi câmpul?')+'\n'+fl.n,function(){C.fld[p].splice(fi,1);C.list.forEach(function(c){delete c.cf[fl.id]});save();cfgOpen();rr()})}
 else if(A==='imp')impStart();else if(A==='csv')csvShare();else if(A==='close'){shClose();rr()}},true);
document.addEventListener('change',function(e){var m=$('crmSheet');if(!m||!m.contains(e.target)||!m.querySelector('.crcfg'))return;var t=e.target,p=C.sub,a=t.dataset.a,row=t.closest('.crst');
 if(a==='nm'){var s=C.st[+row.dataset.i],v=t.value.trim();if(v&&v!==stName(s))s.n=v;save();rr()}
 else if(a==='sum'){C.sum=t.value;if(t.value)C.sumM=t.value;save()}
 else if(a==='cur'){C.cur=t.value.trim();save();rr()}
 else if(a==='fn'){var f=C.fld[p][+row.dataset.fi];if(t.value.trim())f.n=t.value.trim();save()}
 else if(a==='ft'){C.fld[p][+row.dataset.fi].t=t.value;save()}
 else if(t.dataset.fv){var k=t.dataset.fv;if(t.checked){if(k==='firm')C.hide[p].firm=0;else delete C.hide[p][k]}else C.hide[p][k]=1;save();rr()}
 else if(t.dataset.o){C[t.dataset.o]=t.checked?1:0;save()}
 else if(t.dataset.lk){var q=t.dataset.lk;if(!t.checked){if(!pinGet()){C.lock[q]=0;save();rr();return}t.checked=true;unlock(q,function(){C.lock[q]=0;if(!C.lock.home&&!C.lock.firm){localStorage.removeItem(PFX+'ns_crmpin');bioRm('crm')}save();cfgOpen();rr();toast(TR('Blocare oprită'))});return}
  if(pinGet()){C.lock[q]=1;unl[q]=1;save();rr();return}t.checked=false;pinMake(4,function(){C.lock[q]=1;save();cfgOpen();rr();toast(TR('CRM protejat cu PIN'))})}},true);
/* ---- contacts import ---- */
var IMP=null;
function digits(t){return String(t||'').replace(/\D/g,'').replace(/^(00)?40/,'0').slice(-9)}
function impStart(){var N=window.NotisNative;if(N&&N.contactsPick){var r='';try{r=N.contactsPick()}catch(_){r='err'}if(r==='perm')toast(TR('Permite accesul la contacte'));else if(r!=='ok')toast(TR('Contactele nu sunt disponibile'));return}
 if(navigator.contacts&&navigator.contacts.select){navigator.contacts.select(['name','tel','email','address'],{multiple:true}).then(function(a){impShow((a||[]).map(function(x){var ad=x.address&&x.address[0];return{name:(x.name||[])[0]||'',tel:x.tel||[],email:x.email||[],addr:ad?[ad.addressLine&&ad.addressLine.join(' '),ad.city].filter(Boolean).join(', '):''}}))}).catch(function(){})}}
window.__contacts=function(j){if(j==null){toast(TR('Fără acces la contacte'));return}var a=[];try{a=typeof j==='string'?JSON.parse(j):j}catch(_){}impShow(a)};
function impShow(a){var have={};C.list.forEach(function(c){c.tel.forEach(function(t){var d=digits(t);if(d)have[d]=1})});
 IMP={L:(a||[]).filter(function(x){return x&&(x.name||(x.tel||[]).length)}).map(function(x,i){var tel=(x.tel||[]).filter(Boolean),dup=tel.some(function(t){return have[digits(t)]});return{i:i,name:x.name||tel[0]||'',tel:tel,email:(x.email||[])[0]||'',addr:x.addr||'',dup:dup,on:0}}),q:'',p:C.sub,st:C.st[0].id};impRender()}
function impRender(){sheet(impHtml(),'crimpd')}
function impHtml(){var q=nFold(IMP.q).trim(),L=IMP.L.filter(function(x){return !q||nFold(x.name+' '+x.tel.join(' ')).indexOf(q)>=0}),n=IMP.L.filter(function(x){return x.on}).length;
 var h='<div class="crh crbig">📇 '+esc(TR('Importă din contacte'))+'</div><input type="search" id="imQ" class="ux" placeholder="🔍 '+esc(TR('Caută'))+'" value="'+esc(IMP.q)+'"><div class="crr"><button type="button" class="crlk" data-i="all">'+esc(TR('Selectează tot'))+'</button><button type="button" class="crlk" data-i="none">'+esc(TR('Niciunul'))+'</button><span class="crmut">'+n+' / '+IMP.L.length+'</span></div><div class="crimp">'+
 L.map(function(x){return '<label class="crrow'+(x.dup?' crdup':'')+'"><span><span class="ux">'+esc(x.name)+'</span><br><span class="crmut">'+esc(x.tel[0]||x.email||'')+(x.dup?' · '+esc(TR('există deja')):'')+'</span></span><input type="checkbox" data-ix="'+x.i+'"'+(x.on?' checked':'')+(x.dup?' disabled':'')+'></label>'}).join('')+'</div>'+
 '<div class="alseg crseg" id="imP">'+[['firm',TR('Firmă')],['home',TR('Acasă')]].map(function(o){return '<button type="button" class="btn'+(IMP.p===o[0]?' on':'')+'" data-v="'+o[0]+'">'+esc(o[1])+'</button>'}).join('')+'</div><label class="crrow"><span>'+esc(TR('Stare'))+'</span><select id="imS">'+C.st.map(function(s){return '<option value="'+esc(s.id)+'"'+(s.id===IMP.st?' selected':'')+'>'+esc(stName(s))+'</option>'}).join('')+'</select></label>'+
 '<div class="crbtns"><button type="button" class="btn" data-i="no">'+esc(TR('Anulează'))+'</button><button type="button" class="btn crok" data-i="go">'+esc(TR('Importă'))+' ('+n+')</button></div>';return h}
function impDo(){var have={},k=0;C.list.forEach(function(c){c.tel.forEach(function(t){have[digits(t)]=1})});IMP.L.forEach(function(x){if(!x.on||x.dup)return;if(x.tel.some(function(t){return have[digits(t)]}))return;x.tel.forEach(function(t){have[digits(t)]=1});C.list.push({id:uid(),grp:IMP.p,name:x.name,tel:x.tel.slice(0,3),addr:x.addr,email:x.email,st:IMP.st,hist:[],cf:{},rem:{on:0}});k++});C.sub=IMP.p;save();IMP=null;shClose();rr();toast(TR('Importați')+': '+k);return k}
window.__crm.impDo=impDo;window.__crm.imp=function(){return IMP};
document.addEventListener('click',function(e){var m=$('crmSheet');if(!m||!m.contains(e.target)||!m.querySelector('.crimpd')||!IMP)return;var b=e.target.closest('[data-i]'),pp=e.target.closest('#imP button');
 if(pp){IMP.p=pp.dataset.v;impRender();return}if(!b)return;var A=b.dataset.i,q=nFold(IMP.q).trim();
 if(A==='all'||A==='none'){IMP.L.forEach(function(x){if(!x.dup&&(!q||nFold(x.name+' '+x.tel.join(' ')).indexOf(q)>=0))x.on=A==='all'?1:0});impRender()}else if(A==='no'){IMP=null;shClose()}else if(A==='go')impDo()},true);
document.addEventListener('change',function(e){if(!IMP)return;var t=e.target;if(t.dataset&&t.dataset.ix!=null){var x=IMP.L[+t.dataset.ix];if(x)x.on=t.checked?1:0;var g=$('crmSheet').querySelector('[data-i="go"]');if(g)g.textContent=TR('Importă')+' ('+IMP.L.filter(function(x){return x.on}).length+')'}else if(t.id==='imS')IMP.st=t.value},true);
document.addEventListener('input',function(e){if(e.target.id!=='imQ'||!IMP)return;IMP.q=e.target.value;var o=$('crmSheet').querySelector('.crimp'),t=document.createElement('div');t.innerHTML=impHtml();o.replaceWith(t.querySelector('.crimp'))});
/* ---- CSV ---- */
function csvQ(v){v=String(v==null?'':v);return /[",;\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function csv(){var cf=[];['firm','home'].forEach(function(p){C.fld[p].forEach(function(f){cf.push(f)})});
 var H=[TR('Parte'),TR('Nume'),TR('Telefon'),TR('Adresă'),TR('Email'),TR('Firmă'),'CUI',TR('Stare'),TR('Ultimul contact'),TR('Reamintire'),TR('Discuții'),TR('Lucrări'),TR('Total lucrări'),TR('Note')].concat(cf.map(function(f){return f.n}));
 var R=[H].concat(C.list.map(function(c){var l=last(c),ra=remAt(c);return [TR(c.grp==='firm'?'Firmă':'Acasă'),c.name,c.tel.join(' / '),c.addr,c.email,c.firm,c.cui,stName(stOf(c.st)),l?dkey(new Date(l)):'',ra?dkey(new Date(ra))+' '+(c.rem.hm||''):'',c.hist.filter(function(h){return h.ty!=='note'}).length,(c.work||[]).length,money((c.work||[]).reduce(function(a,w){return a+(isNaN(+w.pr)?0:+w.pr)},0)).replace(/\s/g,''),ntTxt(c)].concat(cf.map(function(f){return c.cf[f.id]||''}))}));
 return '\ufeff'+R.map(function(r){return r.map(csvQ).join(';')}).join('\r\n')+'\r\n'}
function csvShare(){var s=csv(),fn='notis-crm-'+dkey()+'.csv',N=window.NotisNative;
 if(navigator.share&&window.File){try{var f=new File([s],fn,{type:'text/csv'}),p={title:'Notis CRM',files:[f]};if(!navigator.canShare||navigator.canShare(p)){navigator.share(p).catch(function(err){if(!err||err.name!=='AbortError')dl()});return}}catch(_){}}
 dl();function dl(){if(N&&N.saveFile){var ok=false;try{ok=N.saveFile(fn,s)}catch(_){}toast(ok?TR('Salvat în Descărcări: ')+fn:TR('Nu am putut salva'));return}var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/csv;charset=utf-8'}));a.download=fn;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},800)}}
/* ---- alarms: reminders go into the same snapshot as Medicamente/Utilități (native scheduling + reboot), Snooze via medSnooze ---- */
/* v191: data for the native CRM widget — only unlocked groups (home/firm), never logged */
window.secSnapCrm=function(){var t=noteTabs.filter(function(x){return x.kind==='crm'})[0];if(!t||t.lk)return null;var o=[];C.list.forEach(function(c){var p=c.grp==='home'?'home':'firm';if(C.lock[p]&&!unl[p])return;var a=remAt(c);o.push({c:String(c.id),t:String(c.name||'').slice(0,60),sub:p,rem:a||0,hm:a?String(c.rem.hm||'09:00'):'',rd:a?String(c.rem.d||''):''})});o.sort(function(a,b){return (a.rem||9e15)-(b.rem||9e15)||a.t.localeCompare(b.t)});return {rows:o.slice(0,80)}};
function crmAl(){if(!noteTabs.some(function(t){return t.kind==='crm'}))return[];var o=[];C.list.forEach(function(c){var a=remAt(c);if(a&&a>Date.now()-6e4)o.push({id:'crm-'+c.id,text:'📞 '+(c.name||'')+' · '+TR('Reamintire')+' · '+(c.rem.hm||'09:00'),at:a})});return o}
(function w(){var s=window.medSnap;if(typeof s!=='function'){setTimeout(w,300);return}if(s._crm)return;window.medSnap=function(){var r=s.apply(this,arguments)||[];return r.concat(crmAl().map(function(a){return{id:a.id,tab:'__med',type:'med',title:a.text,text:a.text,upd:'',alarm:{at:a.at,rep:0,until:null,snz:null}}}))};window.medSnap._crm=1})();
var fired={};setInterval(function(){if(DEMO)return;var now=Date.now();crmAl().forEach(function(a){if(a.at<=now&&now-a.at<5*60000&&!fired[a.id+a.at]){fired[a.id+a.at]=1;try{alFire({id:a.id,text:a.text,med:1},null)}catch(_){}rr()}})},15000);
/* ---- backup / restore ---- */
(function w(){var c=window.spCollect,a=window.spApply;if(!c){setTimeout(w,300);return}if(c._crm)return;window.spCollect=function(){var o=c.apply(this,arguments)||{};o.ns_crm=JSON.parse(JSON.stringify(C));var bk=LS.get('ns_crm_bak',null);if(bk)o.ns_crm_bak=bk;var pn=LS.get('ns_crmpin',null);if(pn)o.ns_crmpin=pn;return o};window.spCollect._crm=1;
 window.spApply=function(d){var r=a&&a.apply(this,arguments);try{if(d&&d.ns_crm&&Array.isArray(d.ns_crm.list)){C=norm(d.ns_crm);if(d.ns_crmpin&&d.ns_crmpin.ct)LS.set('ns_crmpin',d.ns_crmpin);save()}}catch(_){}return r}})();
/* ---- precreated tab migration (existing users get CRM once, visible, movable) ---- */
function mig(){if(LS.get('ns_spmig2',0))return;if(!noteTabs.some(function(t){return t.kind==='crm'})){var f=noteTabs.filter(function(t){return nFold(t.name).trim()==='crm'&&!t.kind})[0];if(f)f.kind='crm';else{var id='crm';while(findNT(id))id='crm'+Math.random().toString(36).slice(2,5);noteTabs.push({id:id,name:'CRM',color:'#f5d76e',kind:'crm'})}LS.set('ns_notetabs',noteTabs)}LS.set('ns_spmig2',1)}
window.crmMig=mig;try{mig();renderNotes()}catch(e){console.warn(e)}
})();
