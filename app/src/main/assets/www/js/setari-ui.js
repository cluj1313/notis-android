/* Notis module: setari-ui — Setări: Iconiță + secțiuni pliabile. See MODULES.md */
'use strict';
(function(){var row=document.getElementById('icoRow'),hint=document.getElementById('icoHint');if(!row)return;var N=window.NotisNative,nat=!!(N&&N.iconSet&&N.iconGet);
 var css=document.createElement('style');css.textContent='#icoRow{display:flex;gap:14px}#icoRow .icc{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px;border-radius:14px;border:2px solid var(--line);background:rgba(var(--s1R),.35);color:var(--txt);font:inherit;font-size:13px;cursor:pointer}#icoRow .icc img{width:64px;height:64px;border-radius:16px}#icoRow .icc.cur{border-color:var(--cyan);box-shadow:0 0 0 1px var(--cyan)}#icoField .hint{font-size:12px;opacity:.75;margin-top:8px;line-height:1.35}#icoRow.off .icc{opacity:.55;cursor:default}';document.head.appendChild(css);
 function mark(k){row.querySelectorAll('.icc').forEach(function(b){b.classList.toggle('cur',b.dataset.ico===k)})}
 if(!nat){row.classList.add('off');mark('new');hint.textContent=TR('În browser, iconița aplicației instalate nu se poate schimba. O poți alege în aplicația Notis pentru Android.');return}
 var cur='new';try{cur=N.iconGet()||'new'}catch(e){}mark(cur);hint.textContent=TR('După schimbare, ecranul telefonului poate avea nevoie de câteva secunde ca să arate noua iconiță.');
 row.addEventListener('click',function(e){var b=e.target.closest('.icc');if(!b||b.dataset.ico===cur)return;var ok=false;try{ok=N.iconSet(b.dataset.ico)}catch(x){}
  var T=function(m){m=TR(m);if(typeof toast=='function')return toast(m);var t=document.getElementById('toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(T._t);T._t=setTimeout(function(){t.classList.remove('show')},3000)};if(ok){cur=b.dataset.ico;mark(cur);T('Iconiță schimbată. Poate dura câteva secunde.')}else T('Nu s-a putut schimba iconița')})})();
/* v60: Setări — every section is a collapsible dropdown (default closed, state remembered in nt_secopen) */
(function(){var card=document.querySelector('#modal .card');if(!card)return;
 var st={};try{st=JSON.parse(localStorage.getItem('nt_secopen')||'{}')||{}}catch(e){st={}}
 var secs=[].slice.call(card.querySelectorAll('.sec:not(.secact)'));
 secs.forEach(function(h,i){var par=h.parentNode,box=document.createElement('div');box.className='secb';
  var n=h.nextSibling;while(n){var nx=n.nextSibling;if(n.nodeType===1&&(n.classList.contains('sec')||n.classList.contains('mrow')||n.querySelector('.sec')))break;box.appendChild(n);n=nx}
  par.insertBefore(box,h.nextSibling);h.classList.add('sect');h.setAttribute('role','button');h.setAttribute('tabindex','0');
  var set=function(o){h.classList.toggle('open',o);h.setAttribute('aria-expanded',o?'true':'false')};set(!!st[i]);
  var tg=function(){var o=!h.classList.contains('open');set(o);st[i]=o?1:0;try{localStorage.setItem('nt_secopen',JSON.stringify(st))}catch(e){}};
  h.addEventListener('click',tg);h.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tg()}})});
 var css=document.createElement('style');css.textContent='#modal .sect{cursor:pointer;display:flex;align-items:center;justify-content:space-between;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;padding-bottom:4px}'+
  '#modal .sect::after{content:none;display:none}'+
  '#modal .secact{cursor:pointer;display:flex;align-items:center;justify-content:space-between;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;padding-bottom:4px}#modal .secact::after{content:none;display:none}#modal .secact.shRow{justify-content:flex-start;gap:10px}#modal .shRow .shApp{width:22px;height:22px;border-radius:6px;flex:none;object-fit:cover}#modal .shRow .shL{flex:1;min-width:0;font:inherit!important;letter-spacing:inherit!important;text-transform:inherit!important;color:inherit!important;opacity:1!important}#modal .shRow .shI{width:20px;height:20px;flex:none;color:var(--cyan)}'+'#modal .secb{display:none}#modal .sect.open+.secb{display:block}';document.head.appendChild(css)
;/* v183: Acasă / Firmă choice (Plăți + CRM), onboarding question, Plăți rename, quick settings per tab, Parole tap-to-unlock, Recordings defaults, backups */


})();
;/* v206: Backup = one section with two collapsible sub-sections (Backup manual / Backup automat), state in nt_bksub */
(function(){var g=document.getElementById('bkGrp');if(!g)return;var K='nt_bksub',st={};try{st=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){st={}}
 [].forEach.call(g.querySelectorAll('.ssec'),function(h){var k=h.id;var set=function(o){h.classList.toggle('open',o);h.setAttribute('aria-expanded',o?'true':'false')};set(!!st[k]);
  var tg=function(){var o=!h.classList.contains('open');set(o);st[k]=o?1:0;try{localStorage.setItem(K,JSON.stringify(st))}catch(e){}};
  h.addEventListener('click',tg);h.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tg()}})});
 var c=document.createElement('style');c.textContent='#bkGrp .ssec{cursor:pointer;display:flex;align-items:center;justify-content:space-between;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;font-size:14px;font-weight:300;letter-spacing:.5px;color:var(--txt);padding:10px 2px 8px;margin:0 0 2px;border-bottom:1px solid rgba(127,127,127,.18)}#bkGrp .ssec .sparr::after{font-size:18px}#bkGrp .ssec.open .sparr::after{transform:none}#bkGrp .ssecb{display:none;padding-top:6px}#bkGrp .ssec.open+.ssecb{display:block}';document.head.appendChild(c)})();
