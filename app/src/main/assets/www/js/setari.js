/* Notis module: setari — Setări (modal). See MODULES.md */
'use strict';
(function(){var M=$('modal');if(!M)return;var card=M.querySelector('.card');
 var css=document.createElement('style');css.textContent=
 '#tbLib .tbl{list-style:none;margin:6px 0;padding:0}#tbLib .tbr{display:flex;align-items:center;gap:10px;padding:7px 4px;border-bottom:1px solid var(--line);background:transparent;touch-action:pan-y}#tbLib .tbr.drg{transition:none!important;background:rgba(var(--s1R),.9);box-shadow:0 4px 14px rgba(0,0,0,.4);border-radius:10px;position:relative;z-index:3}'+
 '#tbLib .tbh{cursor:grab;font-size:20px;opacity:.7;padding:0 6px;touch-action:none;-webkit-user-select:none;user-select:none}#tbLib .tbd{width:12px;height:12px;border-radius:50%;flex:none;background:var(--tc,var(--cyan))}#tbLib .tbn{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#tbLib .tbr.off .tbn{opacity:.5}'+
 '#tbLib input[type=checkbox]{width:22px;height:22px;accent-color:var(--cyan);flex:none;margin:0}#tbLib .tbui{background:none;border:1px solid var(--line);border-radius:8px;font-size:17px;padding:2px 6px;color:inherit;cursor:pointer}'+
 '#tbLib .tbsep{height:1px;background:var(--line);margin:10px 0 4px;opacity:.8}#tbLib .tbex{font-size:12px;opacity:.7;text-transform:uppercase;letter-spacing:.06em}#tbLib .hint{font-size:12px;opacity:.75;line-height:1.35;margin-top:6px}'+
 '#tbLib .tblk{display:flex;align-items:center;gap:8px;width:100%;background:rgba(var(--s1R),.35);border:1px solid var(--line);border-radius:12px;padding:9px 12px;color:var(--txt);font:inherit;cursor:pointer}#tbLib .tblk i{flex:1;border-bottom:2px dotted var(--line);height:0;margin-top:8px}#tbLib .tblk b{font-weight:400;font-size:12px;opacity:.75}'+
 '#tbLib .tbpin{display:none;gap:8px;margin-top:6px}#tbLib .tbpin.on{display:flex}#tbLib .tbpin .btn{flex:1}#tbLib.lkd .tbl,#tbLib.lkd .tbsep,#tbLib.lkd .tbex,#tbLib.lkd #tbHint{display:none}'+
 '#tbLib .tbuic{display:none;flex-wrap:wrap;gap:6px;margin-top:8px}#tbLib .tbuic.on{display:flex}#tbLib .tbuic button{font-size:20px;width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:rgba(var(--s1R),.35);cursor:pointer}#tbLib .tbuic button.cur{border-color:var(--cyan);box-shadow:0 0 0 1px var(--cyan)}'+
 '#dsgn .dsub{border-top:1px solid var(--line)}#dsgn .dsub:first-child{border-top:0}#dsgn .dsh{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 2px;font-family:Oswald,sans-serif;font-weight:400;font-size:16px;letter-spacing:.03em;cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}#dsgn .dsb{display:none;padding-bottom:8px}#dsgn .dsub.open>.dsb{display:block}#dsgn .dsub.open>.dsh{color:var(--cyan)}'+
 '#fMsg textarea{width:100%;box-sizing:border-box;margin:8px 0;min-height:84px;resize:vertical}#fMsg .hint{font-size:12.5px;opacity:.8;line-height:1.4;white-space:pre-line}#sVer .sverv{font-size:13px;opacity:.85;font-family:system-ui,sans-serif;font-weight:400;letter-spacing:0;text-transform:none}.upre{margin-right:2px}';
 document.head.appendChild(css);
 /* ---- DESIGN ---- */
 var thH=[].filter.call(card.querySelectorAll('.sec.pvsec'),function(x){return x.nextElementSibling&&x.nextElementSibling.querySelector('#thRow')})[0];
 var bgH=[].filter.call(card.querySelectorAll('.sec.pvsec'),function(x){return x.nextElementSibling&&x.nextElementSibling.querySelector('#bgRow')})[0];
 var icF=$('icoField'),icH=icF&&icF.previousElementSibling;
 if(thH&&bgH&&icF){var D=document.createElement('div');D.className='sec';D.textContent=TR('Design');var B=document.createElement('div');B.className='field';B.id='dsgn';
  var ds={};try{ds=JSON.parse(localStorage.getItem('nt_dsub')||'{}')||{}}catch(e){}
  function sub(k,title,peek,els){var w=document.createElement('div');w.className='dsub'+(ds[k]?' open':'');var h=document.createElement('div');h.className='dsh';h.setAttribute('role','button');h.setAttribute('tabindex','0');var sp=document.createElement('span');sp.textContent=title;h.appendChild(sp);if(peek)h.appendChild(peek);var b=document.createElement('div');b.className='dsb';els.forEach(function(e){if(e)b.appendChild(e)});w.appendChild(h);w.appendChild(b);
   var tg=function(e){if(e&&e.target.closest('.peekb'))return;var o=!w.classList.contains('open');w.classList.toggle('open',o);ds[k]=o?1:0;try{localStorage.setItem('nt_dsub',JSON.stringify(ds))}catch(_){}};h.addEventListener('click',tg);h.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tg()}});B.appendChild(w)}
  thH.parentNode.insertBefore(D,thH);thH.parentNode.insertBefore(B,thH);
  var thF=thH.nextElementSibling,bgF=bgH.nextElementSibling;
  sub('th',TR('Teme'),thH.querySelector('.peekb'),[thF]);
  sub('ts',TR('Stil taburi'),null,[$('fTst')]);
  sub('font',TR('Font'),null,[$('fFont')]);sub('ssv',TR('Protecție ecran'),null,[$('fSsv')]);
  sub('bg',TR('Fundal'),bgH.querySelector('.peekb'),[bgF]);
  sub('fine',TR('Setări fine'),null,[$('fBgk'),$('fNrp'),$('fSmg'),$('fCdo')]);
  sub('ico',TR('Iconiță'),null,[icF]);
  var tsl=$('fTst')&&$('fTst').querySelector('label');if(tsl)tsl.style.display='none';
  [thH,bgH,icH].forEach(function(x){if(x&&x.classList.contains('sec'))x.remove()})}
 /* ---- TABURI / Bibliotecă ---- */
 var EX=[['util','ut','Plăți','#5fd38d'],['med','med','Medicamente','#ff8a65'],['crm','crm','CRM','#f5d76e']];
 var lib=$('tbLib'),uU=$('tbUser'),uE=$('tbEx'),unl=false;
 function pinGet(){var p=LS.get('ns_libpin',null);return p&&p.ct?p:null}
 function locked(){return !!pinGet()&&!unl}
 function row(t,ex){var on=t?!t.off:false,id=t?t.id:'x:'+ex[0];return '<li class="tbr'+(on?'':' off')+'" data-id="'+esc(id)+'"'+((t&&t.color)||ex?' style="--tc:'+esc((t&&t.color)||ex[3])+'"':'')+'><span class="tbh" aria-label="'+esc(TR('Mută'))+'">≡</span><span class="tbd"></span><span class="tbn ux">'+esc(t?t.name:TR(ex[2]))+'</span>'+((t&&t.kind)||ex?'<button type="button" class="lk tbpc">('+esc(TR('precreate'))+'*)</button>':'')+(t&&isUrgTab(t)?'<button type="button" class="tbui" data-ui="1" aria-label="'+esc(TR('Iconiță urgență'))+'">'+esc(LS.get('ns_urgico','🚨'))+'</button>':'')+'<input type="checkbox"'+(on?' checked':'')+' aria-label="'+esc(TR('Arată pe pagina principală'))+'"></li>'}
 function render(){lib.classList.toggle('lkd',locked());var p=pinGet();$('tbLockS').textContent=p?(unl?TR('deblocată'):TR('protejată cu PIN')):TR('fără PIN');
  if(locked()){uU.innerHTML='';uE.innerHTML='';return}
  var hu='',he='';noteTabs.forEach(function(t){hu+=row(t)});EX.forEach(function(x){if(!noteTabs.some(function(t){return t.kind===x[0]}))hu+=row(null,x)});
  uU.innerHTML=hu;uE.innerHTML=he;var ui=$('tbUic'),cur=LS.get('ns_urgico','🚨');ui.innerHTML=URG_ICONS.map(function(c){return '<button type="button" class="'+(c===cur?'cur':'')+'" data-c="'+c+'">'+c+'</button>'}).join('')}
 window.tbLibRender=render;
 function pcInfo(){var o=document.createElement('div');o.className='pcov';o.innerHTML='<div class="pcbx" role="dialog"><div class="pct">'+esc(TR('Taburi precreate'))+'</div><div class="pcx">'+esc(TR('Taburi făcute deja de aplicație, cu structură pregătită (Medicamente, Utilități, CRM, Înregistrări). Le poți muta oriunde în listă cu ≡ sau ascunde cu bifa, ca pe celelalte.'))+'</div><button type="button" class="btn pcok">OK</button></div>';o.addEventListener('click',function(e){if(e.target===o||e.target.closest('.pcok'))o.remove()});document.body.appendChild(o)}
 function commit(){saveNotes();renderNotes();render()}
 lib.addEventListener('change',function(e){var c=e.target;if(c.type!=='checkbox')return;var li=c.closest('.tbr'),id=li.dataset.id;
  if(id.indexOf('x:')===0){if(!c.checked)return;var x=EX.filter(function(q){return 'x:'+q[0]===id})[0];var nid=x[1];while(findNT(nid))nid=x[1]+Math.random().toString(36).slice(2,5);noteTabs.push({id:nid,name:TR(x[2]),color:x[3],kind:x[0]});commit();toast(TR('Tab activat'));return}
  var t=findNT(id);if(!t)return;if(!c.checked&&noteTabs.filter(function(q){return !q.off&&q!==t}).length===0){c.checked=true;toast(TR('Cel puțin un tab rămâne vizibil'));return}
  if(c.checked)delete t.off;else t.off=1;commit()});
 lib.addEventListener('click',function(e){var pc=e.target.closest('.tbpc');if(pc){e.preventDefault();e.stopPropagation();pcInfo();return}var b=e.target.closest('[data-ui]');if(b){$('tbUic').classList.toggle('on');return}var c=e.target.closest('#tbUic button');if(c){LS.set('ns_urgico',c.dataset.c);$('tbUic').classList.remove('on');render();renderNotes();toast(TR('Iconiță urgență')+': '+c.dataset.c)}});
 /* drag & drop by ≡ inside its own group */
 /* v121: drag & drop by ≡ inside its own group: fresh rects + midpoints every move, modal scroll + autoscroll aware, FLIP neighbours, no page scroll */
 var dr=null;function scP(el){for(var p=el.parentNode;p&&p!==document.body;p=p.parentNode){var o=getComputedStyle(p).overflowY;if((o==='auto'||o==='scroll')&&p.scrollHeight>p.clientHeight)return p}return document.scrollingElement}
 function drPlace(){if(!dr)return;var li=dr.li,ul=dr.ul,y=dr.cy;li.style.transform='';var sibs=[].filter.call(ul.children,function(x){return x!==li&&x.classList.contains('tbr')}),ref=null;
  for(var k=0;k<sibs.length;k++){var r=sibs[k].getBoundingClientRect();if(y<r.top+r.height/2){ref=sibs[k];break}}
  var cur=li.nextElementSibling;while(cur&&!cur.classList.contains('tbr'))cur=cur.nextElementSibling;
  if(ref!==cur&&!(ref===null&&!cur)){var F=sibs.map(function(x){return x.getBoundingClientRect().top});ul.insertBefore(li,ref);
   sibs.forEach(function(x,k){var d=F[k]-x.getBoundingClientRect().top;if(d){x.style.transition='none';x.style.transform='translateY('+d+'px)';x.getBoundingClientRect();x.style.transition='transform .15s';x.style.transform=''}})}
  var top=li.getBoundingClientRect().top;li.style.transform='translateY('+(y-dr.off-top)+'px)'}
 function drTick(){if(!dr)return;var sc=dr.sc,R=sc===document.scrollingElement?{top:0,bottom:innerHeight}:sc.getBoundingClientRect(),v=0;if(dr.cy<R.top+44)v=-Math.ceil((R.top+44-dr.cy)/4);else if(dr.cy>R.bottom-44)v=Math.ceil((dr.cy-R.bottom+44)/4);if(v){var b=sc.scrollTop;sc.scrollTop+=v;if(sc.scrollTop!==b)drPlace()}dr.raf=requestAnimationFrame(drTick)}
 lib.addEventListener('pointerdown',function(e){var h=e.target.closest('.tbh');if(!h||dr)return;e.preventDefault();var li=h.closest('.tbr'),ul=li.parentNode;try{h.setPointerCapture(e.pointerId)}catch(_){}var r=li.getBoundingClientRect();dr={li:li,ul:ul,pid:e.pointerId,cy:e.clientY,off:e.clientY-r.top,sc:scP(ul)};li.classList.add('drg');document.documentElement.classList.add('tbdrag');dr.raf=requestAnimationFrame(drTick)});
 lib.addEventListener('pointermove',function(e){if(!dr||e.pointerId!==dr.pid)return;e.preventDefault();dr.cy=e.clientY;drPlace()},{passive:false});
 document.addEventListener('touchmove',function(e){if(dr)e.preventDefault()},{passive:false});
 function end(e){if(!dr||e&&e.pointerId!==undefined&&e.pointerId!==dr.pid)return;cancelAnimationFrame(dr.raf);var li=dr.li,ul=dr.ul;li.style.transform='';li.classList.remove('drg');document.documentElement.classList.remove('tbdrag');[].forEach.call(ul.children,function(x){x.style.transition='';x.style.transform=''});dr=null;var ids=[].map.call(ul.children,function(x){return x.dataset.id}).filter(function(x){return x&&x.indexOf('x:')!==0});var old=noteTabs.filter(function(t){return ids.indexOf(t.id)>=0}).map(function(t){return t.id});if(ids.join()!==old.join()){ntApplyOrder(ids);commit()}}
 lib.addEventListener('pointerup',end);lib.addEventListener('pointercancel',end);
 /* PIN lock */
 function pinMake(pl){if(!window.crypto||!crypto.subtle){toast(TR('Criptarea nu e disponibilă aici'));return}
  function s1(msg){pinShow({len:pl,title:TR('Alege un PIN pentru Bibliotecă'),msg:msg,done:function(p1){setTimeout(function(){s2(p1)},0);return true}})}
  function s2(p1){pinShow({len:pl,title:TR('Confirmă PIN-ul'),done:function(p2){if(p2!==p1){setTimeout(function(){s1(TR('PIN-urile nu se potrivesc'))},0);return true}
   var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));return lkDerive(p2,salt).then(function(k){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode('notis-lib'))}).then(function(ct){LS.set('ns_libpin',{n:pl,salt:b64e(salt),iv:b64e(iv),ct:b64e(ct)});unl=true;render();toast(TR('Biblioteca e protejată cu PIN'));return true})}})}
  s1()}
 function pinTry(p){var L=pinGet();return lkDerive(p,b64d(L.salt)).then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(L.iv)},k,b64d(L.ct))}).then(function(b){return new TextDecoder().decode(b)==='notis-lib'}).catch(function(){return false})}
 function unlock(then){var L=pinGet();pinShow({bio:'lib',len:L.n,title:'🔒 '+TR('Bibliotecă')+TR(' · introdu PIN-ul'),done:function(p){return pinTry(p).then(function(ok){if(!ok)return TR('PIN greșit');unl=true;setTimeout(function(){render();if(then)then()},0);return true})}})}
 $('tbLock').addEventListener('click',function(){var pp=$('tbPinPick');if(!pinGet()){pp.classList.toggle('on');return}
  if(!unl){unlock();return}
  ask('Elimini PIN-ul Bibliotecii?',function(){localStorage.removeItem('ns_libpin');bioRm('lib');render();toast(TR('PIN eliminat'))})});
 $('tbPinPick').addEventListener('click',function(e){var b=e.target.closest('[data-pl]');if(!b)return;this.classList.remove('on');pinMake(+b.dataset.pl)});
 function ask(txt,yes){var cf=$('cfModal').querySelector('.cftxt'),ok=$('cfOk'),no=$('cfNo'),t0=cf.textContent,o0=ok.textContent,n0=no.textContent;cf.textContent=TR(txt);ok.textContent=TR('Da');no.textContent=TR('Nu');var rs=function(){setTimeout(function(){cf.textContent=t0;ok.textContent=o0;no.textContent=n0},300)};jvConfirm(function(){rs();yes()});var n1=no.onclick;no.onclick=function(){rs();if(n1)n1()}}
 /* opening TABURI while locked asks for the PIN first */
 var sh=$('secTabs');sh.addEventListener('click',function(e){if(locked()&&!sh.classList.contains('open')){e.stopImmediatePropagation();unlock(function(){sh.click()})}});
 new MutationObserver(function(){if(M.classList.contains('show')){render();if(locked())setTimeout(function(){sh.classList.remove('open');sh.setAttribute('aria-expanded','false')},0)}else{unl=false;$('tbUic').classList.remove('on');$('tbPinPick').classList.remove('on')}}).observe(M,{attributes:true,attributeFilter:['class']});
 render();
 /* ---- Comunică cu creatorul ---- */
 function ver(){var v='';try{if(window.NotisNative&&NotisNative.version)v=String(NotisNative.version()||'')}catch(_){}return v}
 (function(){var I=$('cmInfo');I.textContent='';I.classList.add('cmList');[TR('Dacă vrei ceva schimbat, modificat sau adăugat, trimite aici un mesaj.'),TR('Asistentul virtual se ocupă de prima interacțiune și verifică dacă aceeași cerere a mai fost făcută de alți utilizatori.'),TR('Fiecare utilizator primește un răspuns.'),TR('Oricine își poate spune părerea; cererile utilizatorilor Pro și Unlimited au prioritate.')].forEach(function(t){var d=document.createElement('div');d.className='cmLi';d.textContent=t;I.appendChild(d)})})();
 $('cmTx').placeholder=TR('Mesajul tău…');
 $('cmSend').addEventListener('click',function(){var tx=$('cmTx').value.trim();if(!tx){toast(TR('Scrie mai întâi mesajul'));return}
  var v=ver(),meta='Notis '+(v?v+' · ':'')+'web '+NOTIS_WEB_REL+' · '+NOTIS_TIER+' · '+NL,body=tx+'\n\n—\n'+meta,subj='Notis – '+TR('mesaj pentru creator');
  var mt='mailto:'+CREATOR_CONTACT+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body),gone=false,nb=$('cmNo');nb.style.display='none';
  var mark=function(){gone=true};window.addEventListener('blur',mark,{once:true});document.addEventListener('visibilitychange',mark,{once:true});
  var noMail=function(){nb.innerHTML=esc(TR('Nu s-a deschis nicio aplicație de email. Scrie-ne la:'))+' <b class="ux" style="user-select:all">'+esc(CREATOR_CONTACT)+'</b>'+(CREATOR_CONTACT?' <button type="button" class="btn" id="cmCp">'+esc(TR('Copiază'))+'</button>':'');nb.style.display='block';
   var cp=$('cmCp');if(cp)cp.onclick=function(){try{navigator.clipboard.writeText(CREATOR_CONTACT).then(function(){toast(TR('Copiat'))})}catch(_){}}};
  if(!CREATOR_CONTACT){noMail();return}
  try{location.href=mt}catch(_){noMail();return}
  setTimeout(function(){if(!gone&&!document.hidden)noMail()},1500)});
 /* ---- Versiune ---- */
 var vb=$('sVer'),vv=$('sVerV'),newer=null;$('sVerL').textContent=TR('Versiune');
 function vn(s){return String(s||'').replace(/[^0-9.]/g,'').split('.').map(function(x){return +x||0})}
 function gt(a,b){a=vn(a);b=vn(b);for(var i=0;i<3;i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)>(b[i]||0)}return false}
 function show(st){var v=ver();vv.textContent=(v?v:'web '+NOTIS_WEB_REL)+' · '+st}
 window.__updGt=gt;function check(){show(TR('se verifică…'));var v=ver();
  if(v){/* v178: compare versionName with versionName (apk/version.json, fallback release title) — never the vNNN tag */fetch('https://cluj1313.github.io/notis/apk/version.json?t='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return fetch('https://api.github.com/repos/cluj1313/notis-android/releases/latest',{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){return{versionName:j.name}})}).then(function(j){var t=(/\d+\.\d+\.\d+/.exec(String(j.versionName||''))||[''])[0];if(t&&gt(t,v)){newer=t;show('🆕 '+TR('Update nou')+': '+newer)}else{newer=null;show('✓ '+TR('Ultima versiune'))}}).catch(function(){show(TR('verificare indisponibilă'))});return}
  fetch('sw.js',{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){var m=/notis-shell-v(\d+)/.exec(t),n=m?+m[1]:0;if(n>+NOTIS_WEB_REL.slice(1)){newer='v'+n;show('🆕 '+TR('Update nou')+': web v'+n)}else{newer=null;show('✓ '+TR('Ultima versiune'))}}).catch(function(){show(TR('verificare indisponibilă'))})}
 vb.addEventListener('click',function(){if(newer){if(ver()){try{if(NotisNative.updCheck){NotisNative.updCheck();return}}catch(_){}location.href='https://cluj1313.github.io/notis/apk/'}else location.reload();return}check()});
 vb.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();vb.click()}});
 var vck=0;new MutationObserver(function(){if(M.classList.contains('show')&&Date.now()-vck>60000){vck=Date.now();check()}}).observe(M,{attributes:true,attributeFilter:['class']});show('');
})();
try{renderNotes()}catch(_){}

