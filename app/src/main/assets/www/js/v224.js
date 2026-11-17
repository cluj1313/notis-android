/* Notis v224: text Separator in note lists (tabs / folders): + → Separator; long-press → Redenumește / Schimbă fundal / Mută / Șterge (Da/Nu → coș, recuperabil). See MODULES.md */
'use strict';
(function(){
function q(s){return document.querySelector(s)}
function plainTab(){try{return !(typeof kindOf==='function'&&kindOf())&&!nTrash&&!tbHidden(noteTab)}catch(_){return false}}
function ask(txt,yes){var m=$('cfModal'),cf=m.querySelector('.cftxt'),t0=cf.textContent,ok=$('cfOk'),no=$('cfNo'),o0=ok.textContent,n0=no.textContent;cf.textContent=txt;ok.textContent=TR('Da');no.textContent=TR('Nu');var back=function(){cf.textContent=t0;ok.textContent=o0;no.textContent=n0};ok.onclick=function(){jvClose('cfModal');back();yes()};no.onclick=function(){jvClose('cfModal');back()};m.classList.add('show')}
function menu(li,html,kind){lpCur={li:li,spx:kind};li.classList.add('jv-lpon');$('lpBox').innerHTML=html;$('lpMenu').classList.add('show');lpPos()}
function B(a,t){return '<button data-spx="'+a+'">'+esc(t)+'</button>'}
/* + → Notiță / Separator (only on plain note tabs; other tab kinds keep their own +) */
$('noteFab').addEventListener('click',function(e){if(!plainTab()||(typeof selOn==='function'&&selOn()))return;e.stopImmediatePropagation();e.preventDefault();
 menu(this,'<div class="lph">'+esc(TR('Adaugă'))+'</div>'+B('newn','📝 '+TR('Notiță'))+B('news','➖ '+TR('Separator')),'fab')},true);
function sepNew(){jvPrompt(TR('Separator'),'',function(v){v=String(v||'').trim();if(!v)return;var now=new Date().toISOString(),n={id:ntUid(),text:v,sep:1,ts:now,createdAt:now,updatedAt:now,tab:noteTab};if(nFolder)n.fd=nFolder;notes.push(n);saveNotes();renderNotes();
 setTimeout(function(){var li=q('#notesList .nsep[data-id="'+n.id+'"]');if(li)try{li.scrollIntoView({block:'center',behavior:'smooth'})}catch(_){}},60)})}
window.sepMenu=sepMenu;function sepMenu(li){var n=findN(li.dataset.id);if(!n)return;menu(li,'<div class="lph">'+esc(String(n.text||'').trim())+'</div>'+B('ren',TR('📛 Redenumește'))+B('col',TR('🎨 Culoare'))+B('mv','✥ '+TR('Mută (drag & drop)'))+'<button data-spx="del" class="dng">🗑 '+esc(TR('Șterge'))+'</button>','sep')}
/* v231: separator pill colours — 12 vivid + 12 pale shades, plus "Implicit" (theme colour). Text colour is chosen automatically (sepInk). */
var SP_V=['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#14b8a6','#06b6d4','#3b82f6','#6366f1','#a855f7','#ec4899'],SP_P=['#fecaca','#fed7aa','#fde68a','#fef08a','#d9f99d','#bbf7d0','#99f6e4','#a5f3fc','#bfdbfe','#c7d2fe','#e9d5ff','#fbcfe8'];
window.sepPalHtml=function(cur,attr){function g(A){return '<div class="npal sp6">'+A.map(function(c){return '<button '+attr+'="'+c+'" class="'+(c===cur?'cur':'')+'" style="--nc:'+c+'" aria-label="'+c+'"><i></i></button>'}).join('')+'</div>'}
 return '<div class="lph">'+esc(TR('Culoare'))+'</div>'+g(SP_V)+g(SP_P)+'<button type="button" '+attr+'="" class="spdef'+(cur?'':' cur')+'">'+esc(TR('Implicit'))+'</button>'};
function sepPal(li){var n=findN(li.dataset.id);if(!n)return;menu(li,sepPalHtml(n.color||'','data-spc'),'sepc')}
$('lpMenu').addEventListener('click',function(e){var c=lpCur;if(!c||!c.spx||lpJust)return;var b=e.target.closest('button');if(!b)return;e.stopPropagation();e.preventDefault();
 var li=c.li,id=li&&li.dataset&&li.dataset.id,n=id&&findN(id),a=b.dataset.spx;
 if(c.spx==='sepc'){if(!n){lpClose();return}var col=b.dataset.spc;if(col==null)return;lpClose();if(col)n.color=col;else delete n.color;n.updatedAt=new Date().toISOString();saveNotes();renderNotes();return}
 lpClose();
 if(a==='newn'){fullNew();return}if(a==='news'){sepNew();return}if(!n)return;
 if(a==='ren'){jvPrompt(TR('Redenumește'),String(n.text||'').trim(),function(v){v=String(v||'').trim();if(!v)return;n.text=v;n.updatedAt=new Date().toISOString();saveNotes();renderNotes()});return}
 if(a==='col'){var l2=q('#notesList .nsep[data-id="'+id+'"]');if(l2)sepPal(l2);return}
 if(a==='mv'){ndModeOn(id);return}
 if(a==='del'){ask(TR('Ștergi separatorul?'),function(){n.del=new Date().toISOString();saveNotes();renderNotes();toast(TR('Mutată în coș'))})}},true);
/* long-press on a separator → its menu (selection mode and drag mode keep the normal behaviour); tap does not open the editor */
var T=null;function cancel(){if(T){clearTimeout(T.t);T=null}}
document.addEventListener('pointerdown',function(e){cancel();var li=e.target.closest&&e.target.closest('#notesList .nsep');if(!li||e.target.closest('.fdots')||nTrash||document.body.classList.contains('ndmode')||(typeof selOn==='function'&&selOn()))return;
 e.stopPropagation();lpJust=false;try{lpCancel()}catch(_){}T={x:e.clientX,y:e.clientY,id:e.pointerId,t:setTimeout(function(){T=null;try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}lpJust=true;lpUnsel();ndModeOn(li.dataset.id)},LP_MS)}},true);
document.addEventListener('pointermove',function(e){if(T&&e.pointerId===T.id&&Math.hypot(e.clientX-T.x,e.clientY-T.y)>10)cancel()},true);
document.addEventListener('pointerup',function(e){if(T&&e.pointerId===T.id)cancel()},true);document.addEventListener('pointercancel',cancel,true);
document.addEventListener('click',function(e){var li=e.target.closest&&e.target.closest('#notesList .nsep');if(!li||e.target.closest('.fdots')||nTrash)return;if(typeof selOn==='function'&&selOn())return;e.stopPropagation();e.preventDefault()},true);
document.addEventListener('contextmenu',function(e){if(e.target.closest&&e.target.closest('#notesList .nsep'))e.preventDefault()},true);

/* v224: on a FRESH install only Taskuri, Cumpărături, Medicamente and Înregistrări start visible; the other tabs start off (Setări → Taburi turns them on).
   Runs once (ns_fresh224); existing installs are never touched (NS_FRESH is false as soon as any data exists). */
(function(){if(typeof NS_FRESH==='undefined'||!NS_FRESH||LS.get('ns_fresh224',null))return;var seen={};
 function keep(t){return t.kind==='task'||t.kind==='med'||t.kind==='rec'||(t.id==='c'&&!t.kind)}
 function pass(first){try{if(first){var r=qrTab(true);if(r)delete r.off;try{if(typeof RECS!=='undefined'&&RECS.vis!==1){RECS.vis=1;qrSave()}}catch(_){}}
  var ch=false;noteTabs.forEach(function(t){if(seen[t.id])return;seen[t.id]=1;if(keep(t)){if(t.off){delete t.off;ch=true}}else if(!t.off){t.off=1;ch=true}});
  if(ch||first){if(window.ntFixCur)ntFixCur();saveNotes();renderNotes()}}catch(e){console.warn(e)}}
 pass(true);setTimeout(function(){pass(false);LS.set('ns_fresh224',1)},2500)})();
})();
