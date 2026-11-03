/* Notis module: boot — Pornire: screensaver, NOTIS_BOOTED, backup automat, Acasă/Firmă. See MODULES.md */
'use strict';
(function(){if(!window.NSS)return;try{NSS.picker($('ssvBox'));var stc=$('ssTips'),syn=function(){stc.checked=NSS.tipsOn()};syn();stc.addEventListener('change',function(){NSS.wr('ns_tipoff',!stc.checked)});window.addEventListener('nsschange',syn);$('ssTipR').addEventListener('click',function(){NSS.wr('ns_tipseen',[]);NSS.wr('ns_tipoff',false);try{toast(TR('Sfaturile au fost resetate'))}catch(_){}})}catch(_){}var last=Date.now(),ov=null,sw=0,pvT=null;function act(){if(!ov)last=Date.now()}
 ['pointerdown','keydown','wheel','touchstart','input'].forEach(function(e){document.addEventListener(e,act,{capture:true,passive:true})});document.addEventListener('scroll',act,{capture:true,passive:true});
 document.addEventListener('visibilitychange',act);window.addEventListener('nsschange',function(){act();if(ov){var c=ov.querySelector('.nsCoin');if(c)c.style.animationDuration=NSS.spdSec()+'s'}});
 function lockedOpen(){var n=$('noteFull').classList.contains('show')&&fullId&&findN(fullId);return !!(n&&n.lock)}
 function busy(){if(document.hidden||document.getElementById('nsSpl'))return true;if(document.querySelector('.modal.show,#crx,#nwOb,#crRing'))return true;try{if(speaking||listening)return true}catch(_){}
  if($('noteFull').classList.contains('show')&&!lockedOpen())return true;var a=document.activeElement;if(a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||a.isContentEditable)&&!lockedOpen())return true;
  var m=document.querySelectorAll('audio,video');for(var i=0;i<m.length;i++)if(!m[i].paused)return true;return false}
 function show(pv){if(ov)return;var re=false;pvT=pv?[localStorage.getItem('ns_tipi')]:null;if(!pv){try{if(lockedOpen())fullClose()}catch(_){}}if(!pv)try{if(Object.keys(fdOpen).length){fdOpen={};re=true}if(Object.keys(tabOpen).length){tabOpen={};re=true}}catch(_){}
  if(re)try{renderNotes()}catch(_){}try{document.activeElement&&document.activeElement.blur()}catch(_){}ov=document.createElement('div');ov.className='nsOv';ov.id='nsSS';NSS.overlay(ov,function(e){e.preventDefault();e.stopPropagation();hide()},1);var c=ov.querySelector('.nsCoin');if(c)c.style.animationDuration=NSS.spdSec()+'s';document.body.appendChild(ov)}
 function hide(){if(!ov)return;var o=ov;ov=null;/* preview leaves the tip rotation as it was */if(pvT){try{if(pvT[0]==null)localStorage.removeItem('ns_tipi');else localStorage.setItem('ns_tipi',pvT[0])}catch(_){}pvT=null}sw=Date.now();o.classList.add('out');setTimeout(function(){o.remove()},380);act()}
 /* the dismissing tap must not also press whatever lies under it */
 ['click','pointerup','mouseup','touchend'].forEach(function(ev){document.addEventListener(ev,function(e){if(sw&&Date.now()-sw<700&&!(e.target.closest&&e.target.closest('.nsOv'))){e.stopImmediatePropagation();if(ev==='click')e.preventDefault()}},true)});
 (function wrap(){var c=window.spCollect,ap=window.spApply;if(!c){window.addEventListener('load',wrap);return}if(c._v104)return;var K=['ns_ssaver','ns_ssspd','ns_tipoff','ns_tipseen','ns_tipi'];window.spCollect=function(){var o=c.apply(this,arguments)||{};K.forEach(function(k){var v=localStorage.getItem(k);if(v!=null)o[k]=JSON.parse(v)});return o};window.spCollect._v104=1;for(var q in c)if(!(q in window.spCollect))window.spCollect[q]=c[q];
  window.spApply=function(d){var r=ap&&ap.apply(this,arguments);try{K.forEach(function(k){if(d&&d[k]!=null){localStorage.setItem(k,JSON.stringify(d[k]));if(window.nspPush)nspPush(k)}});window.dispatchEvent(new Event('nsschange'))}catch(_){}return r}})();
 window.nssShow=show;try{$('ssPv').addEventListener('click',function(e){e.stopPropagation();show(1)})}catch(_){}setInterval(function(){var m=NSS.get();if(!m||ov||busy())return;if(Date.now()-last>=m*60000)show()},4000)})();
window.NOTIS_BOOTED=true;
try{setTimeout(function(){try{window.tabFix179&&tabFix179()}catch(_){}},1200)}catch(_){}
try{window.nsSplDone&&nsSplDone()}catch(_){}
if(NOTIS_AB.changed&&!DEMO){try{localStorage.setItem('ns_lastver',NOTIS_AB.cur)}catch(_){}
 var rec0=NOTIS_AB.rec;phDump().then(function(p){rec0.photos=p;return abStore(rec0)}).then(renderAbList)}
renderAbList();
(function(){
function rr(){try{renderNotes()}catch(_){try{spRender()}catch(__){}}}
/* ---- Acasă / Firmă ---- */
function afGet(){var o=LS.get('ns_afvis',null);return o&&typeof o==='object'?o:{}}
window.afMode=function(k){var v=afGet()[k];return v==='home'||v==='firm'?v:'both'};
window.afSel=function(k){var m=afMode(k);return '<div class="afrow"><span>'+esc(TR('Afișează'))+'</span><select class="afsel" data-af="'+k+'" aria-label="'+esc(TR('Afișează'))+'">'+[['both',TR('Acasă și Firmă')],['home',TR('Doar Acasă')],['firm',TR('Doar Firmă')]].map(function(o){return '<option value="'+o[0]+'"'+(o[0]===m?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select></div>'};
document.addEventListener('change',function(e){var s=e.target;if(!s.classList||!s.classList.contains('afsel'))return;var o=afGet();o[s.dataset.af]=s.value;LS.set('ns_afvis',o);try{saveNotes(true)}catch(_){}try{spRender()}catch(_){}});
/* onboarding: new users only (inside the first-run card); existing users keep both parts */
(function(){if(LS.get('ns_afOb',0))return;if(LS.get('ns_afvis',null)){LS.set('ns_afOb',1);return}var ans='both';
 function add(o){var c=o.querySelector('.obc'),go=o.querySelector('#obGo');if(!c||!go||c.querySelector('.afq'))return;var d=document.createElement('div');d.className='afq';
  d.innerHTML='<div class="obt">🏠 🏢 '+esc(TR('Pentru ce folosești Plăți și CRM?'))+'</div><div class="afqb"><button type="button" class="afy" data-af1="home">'+esc(TR('Acasă'))+'</button><button type="button" class="afy" data-af1="firm">'+esc(TR('Firmă'))+'</button><button type="button" class="afy on" data-af1="both">'+esc(TR('Ambele'))+'</button></div><div class="obt afqs">'+esc(TR('Plăți și CRM pot avea o parte separată pentru firmă. O poți activa sau ascunde oricând, din partea de jos a taburilor Plăți și CRM. Nimic nu se șterge.'))+'</div>';
  c.insertBefore(d,go);d.addEventListener('click',function(e){var b=e.target.closest('[data-af1]');if(!b)return;ans=b.dataset.af1;d.querySelectorAll('[data-af1]').forEach(function(x){x.classList.toggle('on',x===b)})});
  go.addEventListener('click',function(){var v=afGet();v.ut=ans;v.crm=ans;LS.set('ns_afvis',v);LS.set('ns_afOb',1);try{spRender()}catch(_){}},true)}
 var x=document.getElementById('nwOb');if(x)add(x);
 try{var mo=new MutationObserver(function(){var o=document.getElementById('nwOb');if(o)add(o);if(LS.get('ns_afOb',0))mo.disconnect()});mo.observe(document.body,{childList:true})}catch(_){}
 setTimeout(function(){if(!document.getElementById('nwOb')&&LS.get('ns_newsOb',false)&&!LS.get('ns_afOb',0)){LS.set('ns_afOb',1)}},8000)})();
/* ---- Utilități → Plăți (only an unrenamed tab; data in ns_util untouched) ---- */
(function(){try{if(LS.get('ns_plati183',0))return;var ch=false;(noteTabs||[]).forEach(function(t){if(t&&t.kind==='util'){var f=nFold(String(t.name||'')).trim();if(f==='utilitati'||f===nFold(TR('Utilități')).trim()){t.name=TR('Plăți');ch=true}}});LS.set('ns_plati183',1);if(ch){saveNotes(true);rr()}}catch(e){console.warn(e)}})();
/* ---- Recordings: default pill white (dot stays red) ---- */
(function(){try{if(LS.get('ns_rec183',0))return;var ch=false;(noteTabs||[]).forEach(function(t){if(t&&t.kind==='rec'&&String(t.color||'').toLowerCase()==='#ff5a5a'){t.color='#ffffff';ch=true}});LS.set('ns_rec183',1);if(ch){saveNotes(true);rr()}}catch(e){console.warn(e)}})();
/* ---- Parole: tap anywhere on the locked screen = fingerprint prompt ---- */
document.addEventListener('click',function(e){var lk=e.target.closest&&e.target.closest('#spView .pwlk');if(!lk||e.target.closest('button,a,input,select,textarea,[data-pa]'))return;var b=lk.querySelector('[data-pa=bio]');if(b&&lk.dataset.bio2==='1')b.click();else{var i=lk.querySelector('input[type=password],input');if(i)i.focus()}});
/* ---- Medicamente: header fixed, only the day list scrolls (inner container), today centred ---- */
var MDS={};function mdTK(){try{if(typeof dkey==='function')return dkey()}catch(_){}var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function mdFit(){var v=$('spView');if(!v)return;var L=v.querySelectorAll('.spmed:not(.mdlib) .mdlist');if(!L.length){MDS={};return}var vh=window.innerHeight||640,bb=0;try{var nav=document.querySelector('#bnav,.bnav,#bottomNav,nav.tabbar');if(nav&&nav.getClientRects().length&&getComputedStyle(nav).position==='fixed')bb=nav.getBoundingClientRect().height}catch(_){}
 L.forEach(function(l){var sec=l.closest('.spbd'),per=l.closest('.mdper'),key=(per&&per.dataset.p)||'',tail=0;if(sec){var aft=false;[].forEach.call(sec.children,function(c){if(c===l){aft=true;return}if(aft)tail+=c.getBoundingClientRect().height+6})}
  var nx=per&&per.nextElementSibling,ex=0;while(nx){ex+=nx.getBoundingClientRect().height;nx=nx.nextElementSibling}var h=Math.max(170,Math.floor(vh-Math.max(0,l.getBoundingClientRect().top)-tail-Math.min(ex,90)-bb-10));l.style.maxHeight=h+'px';
  var st=MDS[key+'|'+mdTK()];if(st!=null)l.scrollTop=st;else{var t=l.querySelector('.mdday.mdtoday');if(t){l.scrollTop=Math.max(0,t.offsetTop-l.offsetTop-(l.clientHeight-t.offsetHeight)/2)}}
  if(!l.__mdf){l.__mdf=1;l.addEventListener('scroll',function(){MDS[key+'|'+mdTK()]=l.scrollTop},{passive:true})}})}
window.__mdFit=mdFit;
(function(){var q=0;function w(){var v=$('spView');if(!v||v.__mdo||!window.MutationObserver)return;v.__mdo=1;new MutationObserver(function(){if(q)return;var f=v.querySelector('.spmed:not(.mdlib) .mdlist');if(!f||f.__mdf)return;q=1;Promise.resolve().then(function(){q=0;try{mdFit()}catch(_){}})}).observe(v,{childList:true,subtree:true})}try{w()}catch(_){}setTimeout(function(){try{w()}catch(_){}},400)})();
/* ---- quick settings per tab (ns_tabstyle {tabId:{fs,c,lh}}) ---- */
function TS(){var o=LS.get('ns_tabstyle',null);return o&&typeof o==='object'?o:{}}
function tsApply(){var pg=$('notesPg');if(!pg)return;var s=TS()[noteTab]||{};pg.classList.toggle('tsF',!!s.fs);pg.classList.toggle('tsC',!!s.c);pg.classList.toggle('tsL',!!s.lh);
 if(s.fs)pg.style.setProperty('--tsfs',s.fs+'px');else pg.style.removeProperty('--tsfs');if(s.c)pg.style.setProperty('--tsc',s.c);else pg.style.removeProperty('--tsc');if(s.lh)pg.style.setProperty('--tslh',String(s.lh));else pg.style.removeProperty('--tslh')}
window.tsApply=tsApply;
var COL=['#ffffff','#e5e7eb','#a5f3fc','#bbf7d0','#fde68a','#fecdd3','#ddd6fe','#111827','#1e3a8a'];
function tsSet(f){var o=TS(),s=o[noteTab]||{};f(s);Object.keys(s).forEach(function(k){if(s[k]==null||s[k]==='')delete s[k]});if(Object.keys(s).length)o[noteTab]=s;else delete o[noteTab];LS.set('ns_tabstyle',o);try{saveNotes(true)}catch(_){}tsApply();tsPaint()}
function tsPaint(){var m=$('tsMenu');if(!m)return;var s=TS()[noteTab]||{};m.querySelector('[data-v="fs"]').textContent=s.fs?s.fs+'px':TR('Auto');m.querySelector('[data-v="lh"]').textContent=s.lh?String(s.lh):TR('Auto');m.querySelectorAll('.tsw button').forEach(function(b){b.classList.toggle('on',(b.dataset.c||'')===(s.c||''))})}
function tsClose(){var m=$('tsMenu');if(m)m.remove();document.removeEventListener('pointerdown',tsOut,true)}
function tsOut(e){var m=$('tsMenu');if(m&&!m.contains(e.target)){e.stopPropagation();e.preventDefault();tsClose();TSX.sup=Date.now()}}
function tsOpen(){tsClose();var t=findNT(noteTab);var m=document.createElement('div');m.id='tsMenu';m.__tab=noteTab;m.setAttribute('role','dialog');
 m.innerHTML='<div class="tsh"><span>'+esc(TR('Aspect tab'))+(t?' · '+esc(t.name):'')+'</span><button type="button" class="tsx" data-ts="x" aria-label="'+esc(TR('Închide'))+'">×</button></div>'+
  '<div class="tsr"><span class="tsl">'+esc(TR('Mărime font'))+'</span><button type="button" class="tsb" data-ts="fs-">−</button><span class="tsv" data-v="fs"></span><button type="button" class="tsb" data-ts="fs+">+</button></div>'+
  '<div class="tsr"><span class="tsl">'+esc(TR('Culoare font'))+'</span></div><div class="tsw"><button type="button" class="tsa" data-ts="c" data-c="" aria-label="'+esc(TR('Auto'))+'"></button>'+COL.map(function(c){return '<button type="button" data-ts="c" data-c="'+c+'" style="background:'+c+'" aria-label="'+c+'"></button>'}).join('')+'</div>'+
  '<div class="tsr"><span class="tsl">'+esc(TR('Spațiere rânduri'))+'</span><button type="button" class="tsb" data-ts="lh-">−</button><span class="tsv" data-v="lh"></span><button type="button" class="tsb" data-ts="lh+">+</button></div>'+
  '<button type="button" class="tsrs" data-ts="rs">'+esc(TR('Resetare'))+'</button>';
 document.body.appendChild(m);tsPaint();setTimeout(function(){document.addEventListener('pointerdown',tsOut,true)},0);
 m.addEventListener('click',function(e){var b=e.target.closest('[data-ts]');if(!b)return;var a=b.dataset.ts;
  if(a==='x'){tsClose();return}
  if(a==='rs'){tsSet(function(s){delete s.fs;delete s.c;delete s.lh});return}
  if(a==='c'){tsSet(function(s){s.c=b.dataset.c||''});return}
  if(a==='fs+'||a==='fs-')tsSet(function(s){var v=s.fs||16;v+=a==='fs+'?1:-1;s.fs=Math.max(11,Math.min(28,v))});
  if(a==='lh+'||a==='lh-')tsSet(function(s){var v=s.lh||1.4;v=Math.round((v+(a==='lh+'?.1:-.1))*10)/10;s.lh=Math.max(1,Math.min(2.2,v))})})}
window.tsOpen=tsOpen;
/* long-press ONLY on empty background (never on a note, row, button, field or header) */
var TSX={t:0,x:0,y:0,fired:0,sup:0};
function bgTarget(el){if(!el||!el.closest)return false;var pg=$('notesPg');if(!pg||!pg.contains(el)||!pg.classList.contains('show')&&getComputedStyle(pg).display==='none')return false;
 if(el.closest('button,a,input,textarea,select,label,li.note,.nfo,.nxr,[data-a],[data-pa],[data-c],[data-cs],[data-id],[data-r],[data-k],[data-u],[data-g],.sphd,.spghd,.lbhd,.ntabs,.ntab,.pwlk,.mdday,.crc,#tsMenu,.qrr,.qrb,[contenteditable]'))return false;
 return true} /* anything inside the tab page that is not an item, control or header */
document.addEventListener('pointerdown',function(e){clearTimeout(TSX.t);TSX.fired=0;if(e.button>0||document.querySelector('.modal.show,#noteFull.show'))return;if(!bgTarget(e.target))return;TSX.x=e.clientX;TSX.y=e.clientY;
 TSX.t=setTimeout(function(){TSX.fired=1;try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}tsOpen()},650)},true);
['pointerup','pointercancel'].forEach(function(t){document.addEventListener(t,function(){clearTimeout(TSX.t)},true)});
document.addEventListener('pointermove',function(e){if(Math.abs(e.clientX-TSX.x)+Math.abs(e.clientY-TSX.y)>10)clearTimeout(TSX.t)},true);
window.addEventListener('scroll',function(){clearTimeout(TSX.t)},true);
document.addEventListener('click',function(e){if(TSX.fired||Date.now()-TSX.sup<400){if(!(e.target.closest&&e.target.closest('#tsMenu'))){TSX.fired=0;e.stopPropagation();e.preventDefault()}}},true);
document.addEventListener('contextmenu',function(e){if(bgTarget(e.target))e.preventDefault()},true);
/* hooks: apply on every render / tab change */
var rn0=window.renderNotes||renderNotes;renderNotes=function(){var r=rn0.apply(this,arguments);try{tsApply();if(document.getElementById('tsMenu')&&$('tsMenu').__tab!==noteTab)tsClose()}catch(_){}try{mdFit()}catch(_){}return r};
var sr0=window.spRender;if(sr0){window.spRender=function(){var r=sr0.apply(this,arguments);try{tsApply();mdFit()}catch(_){}return r};if(sr0.__pw)window.spRender.__pw=1}
window.addEventListener('resize',function(){try{mdFit()}catch(_){}});
setTimeout(function(){try{tsApply();mdFit()}catch(_){}},300);
/* ---- backups carry the new keys ---- */
var KS=['ns_tabstyle','ns_afvis'];
(function wrap(){var c=window.spCollect,a=window.spApply;if(!c){setTimeout(wrap,300);return}if(c._v183)return;window.spCollect=function(){var o=c.apply(this,arguments)||{};KS.forEach(function(k){var v=LS.get(k,null);if(v!=null)o[k]=v});return o};window.spCollect._v183=1;
 window.spApply=function(d){var r=a&&a.apply(this,arguments);try{KS.forEach(function(k){if(d&&d[k]&&typeof d[k]==='object')LS.set(k,d[k])});tsApply()}catch(_){}return r}})();
})();

