/* v231: ⋮ on every folder and note row — Redenumește, Mută, Culoare, (Share), Blochează, Șterge. Same compact menu as the tab long-press menu. Reuses the existing actions (fdRename/fdMove/fdLock/fdDel, nShare/lkLock/noteDel); long-press is unchanged. */
(function(){
 function pal(list,attr,cur,def){var h='<div class="lph">'+esc(TR('Culoare'))+'</div><div class="npal">';list.forEach(function(k){h+='<button '+attr+'="'+esc(k[0])+'" class="'+(cur===k[0]?'cur':'')+'" style="--nc:'+esc(def?(ncT(k[0])||'#0a1d30'):k[0])+'" aria-label="'+esc(k[1])+'"><i'+(def&&!k[0]?' class="ncdef"':'')+'></i></button>'});return h+'</div>'}
 function show(li,btn,c){lpCur=c;c.li=li;c.anc=btn;li.classList.add('jv-lpon');$('lpMenu').classList.add('show');try{lpJust=false}catch(_){}lpPos()}
 window.rwOpen=function(li,btn){
  if(li.classList.contains('nsep')){if(window.sepMenu){try{lpJust=false}catch(_){}sepMenu(li);if(lpCur){lpCur.anc=btn;lpPos()}}return}
  if(li.classList.contains('nfo')){var f=findF(li.dataset.fid);if(!f||f.del)return;
   $('lpBox').innerHTML='<button data-a="fren">'+esc(TR('📛 Redenumește'))+'</button><button data-a="fmv">'+esc(TR('📦 Mută'))+'</button><button data-a="fcol">'+esc(TR('🎨 Culoare'))+'</button>'+(f.lk?'<button data-a="funl">'+esc(TR('🔓 Deblochează'))+'</button>':'<button data-a="flock">'+esc(TR('🔒 Blochează'))+'</button>')+'<button data-a="fdel" class="dng">'+esc(TR('🗑 Șterge'))+'</button>';
   show(li,btn,{fd:f.id});return}
  var n=findN(li.dataset.id);if(!n||n.del)return;
  try{nShP=!(n.lock&&!n._key)?nSharePrep(n):null}catch(_){nShP=null}
  $('lpBox').innerHTML=(n.lock?'':'<button data-a="nren">'+esc(TR('📛 Redenumește'))+'</button>')+'<button data-a="nmv">'+esc(TR('📦 Mută'))+'</button><button data-a="rcol">'+esc(TR('🎨 Culoare'))+'</button><button data-a="nshr">'+SH_SVG+' Share</button>'+(n.lock?'<button data-a="nunl">'+esc(TR('🔓 Deblochează'))+'</button>':'<button data-a="nlock">'+esc(TR('🔒 Blochează'))+'</button>')+'<button data-a="ndel" class="dng">'+esc(TR('🗑 Șterge'))+'</button>';
  show(li,btn,{note:true})};
 function renameNote(n){var it=null,t=String(n.text||'').split('\n'),i=0;while(i<t.length&&!t[i].trim())i++;var cur=(t[i]||'').trim();
  jvPrompt(TR('Redenumește'),cur,function(nm){nm=String(nm||'').trim().replace(/\s*\n\s*/g,' ');if(!nm||nm===cur)return;var m=findN(n.id);if(!m)return;saveNotes();
   if(m.type==='check'){m.title=nm;chkSync(m)}
   else if(m.type==='mix'){var b0=(m.blocks||[])[0];if(b0&&b0.t==='text'){var L=String(b0.v||'').split('\n'),j=0;while(j<L.length&&!L[j].trim())j++;if(j<L.length)L[j]=nm;else L=[nm];b0.v=L.join('\n')}else{m.blocks=m.blocks||[];m.blocks.unshift({id:bUid(),t:'text',v:nm})}mSync(m)}
   else{var L2=String(m.text||'').split('\n'),k=0;while(k<L2.length&&!L2[k].trim())k++;if(k<L2.length)L2[k]=nm;else L2=[nm];m.text=L2.join('\n')}
   m.updatedAt=new Date().toISOString();nFlush();renderNotes()})}
 window.rwAct=function(b,c){var a=b.dataset.a,id;
  if(c.fd){var f=findF(c.fd);if(!f){lpClose();return true}
   if(a==='fcol'){$('lpBox').innerHTML=pal(NT_COLORS,'data-fcc',f.color||'#3fd8ff',0);lpPos();return true}
   if(b.dataset.fcc!=null){var v=b.dataset.fcc;lpClose();if(v==='#3fd8ff')delete f.color;else f.color=v;saveNotes();renderNotes();return true}
   return false}
  if(!c.note)return false;var li=c.li;id=li&&li.dataset.id;
  if(a==='nren'){lpClose();var n=findN(id);if(n&&!n.lock)renameNote(n);return true}
  if(a==='rcol'){var n2=findN(id)||{};$('lpBox').innerHTML=pal(NC,'data-rcl',n2.color||'',1);lpPos();return true}
  if(b.dataset.rcl!=null){var n3=findN(id);lpClose();if(n3){saveNotes();if(b.dataset.rcl)n3.color=b.dataset.rcl;else delete n3.color;n3.updatedAt=new Date().toISOString();nFlush();renderNotes()}return true}
  return false};
})();

/* ---------- v231: separators in Taskuri and Înregistrări (flat row lists that sort themselves by date/time). A separator is stored apart from the rows
   (ns_seps = {tabId:[{id,t,c,a,n}]}: a = row it sits after, n = row it sits before, used when a is gone) so no task / recording is ever touched. ---------- */
(function(){
 var KEY='ns_seps',D=null,LT=null,ARM=null;
 function all(){var o=LS.get(KEY,null);return o&&typeof o==='object'&&!Array.isArray(o)?o:{}}
 function lst(tab){var a=all()[tab];return Array.isArray(a)?a:[]}
 function save(tab,L){var o=all();if(L.length)o[tab]=L;else delete o[tab];LS.set(KEY,o)}
 function cfg(){var t=findNT(noteTab);if(!t||nTrash||nFolder||(typeof tbHidden==='function'&&tbHidden(noteTab)))return null;if(t.kind==='task')return{c:'.tkv',r:'.tki[data-id]'};if(t.kind==='rec')return{c:'.qrv',r:'.qri[data-id]'};return null}
 function box(){var g=cfg();return g?document.querySelector('#spView '+g.c):null}
 function rows(){var g=cfg(),b=box();return g&&b?[].slice.call(b.querySelectorAll(g.r)):[]}
 function pill(x){var c=x.c?ncT(x.c):'';return '<span class="sepp"'+(c?' style="'+esc(sepStyle(c))+'"':'')+'>'+esc(x.t)+'</span>'}
 function el(x){var d=document.createElement('div');d.className='spsep';d.dataset.sid=x.id;d.innerHTML='<span class="sept">'+pill(x)+'</span>'+DOTS_BTN;return d}
 function deco(){var b=box(),g=cfg();if(!b||!g)return;[].forEach.call(b.querySelectorAll('.spsep'),function(e){e.remove()});var R=rows(),L=lst(noteTab);if(!L.length)return;
  function byId(id){for(var i=0;i<R.length;i++)if(R[i].dataset.id===id)return R[i];return null}
  var top=R.length?R[0]:null;
  L.forEach(function(x){var e=el(x),A=x.a&&byId(x.a),N=x.n&&byId(x.n),ref;
   if(A){var at=A;while(at.nextElementSibling&&at.nextElementSibling.classList.contains('spsep')&&at.nextElementSibling.dataset.sid!==x.id)at=at.nextElementSibling;at.parentNode.insertBefore(e,at.nextSibling)}
   else if(N)N.parentNode.insertBefore(e,N);
   else if(top)top.parentNode.insertBefore(e,top);else b.appendChild(e)})}
 new MutationObserver(function(){deco()}).observe($('spView'),{childList:true});
 /* + → Sarcină / Separator (Taskuri) · Separator (Înregistrări) */
 window.sxFab=function(f){var g=cfg();if(!g)return false;var t=findNT(noteTab);
  if(t.kind==='rec'){neu();return true}
  lpCur={li:f,xs:'fab',anc:f};$('lpBox').innerHTML='<div class="lph">'+esc(TR('Adaugă'))+'</div><button data-xs="task">'+esc('📝 '+TR('Sarcină'))+'</button><button data-xs="new">'+esc('➖ '+TR('Separator'))+'</button>';$('lpMenu').classList.add('show');try{lpJust=false}catch(_){}lpPos();return true};
 function neu(){jvPrompt(TR('Separator'),'',function(v){v=String(v||'').trim();if(!v)return;var L=lst(noteTab),R=rows(),last=R.length?R[R.length-1].dataset.id:'';L.push({id:'sx'+ntUid(),t:v.slice(0,80),a:last,n:''});save(noteTab,L);deco();setTimeout(function(){var e=document.querySelector('#spView .spsep[data-sid="'+L[L.length-1].id+'"]');if(e)try{e.scrollIntoView({block:'center',behavior:'smooth'})}catch(_){}},50)})}
 function ask(txt,yes){var m=$('cfModal'),cf=m.querySelector('.cftxt'),t0=cf.textContent,ok=$('cfOk'),no=$('cfNo'),o0=ok.textContent,n0=no.textContent,k0=ok.onclick,j0=no.onclick;cf.textContent=txt;ok.textContent=TR('Da');no.textContent=TR('Nu');var back=function(){cf.textContent=t0;ok.textContent=o0;no.textContent=n0};ok.onclick=function(){jvClose('cfModal');back();yes()};no.onclick=function(){jvClose('cfModal');back()};m.classList.add('show')}
 function find(id){var L=lst(noteTab);for(var i=0;i<L.length;i++)if(L[i].id===id)return{L:L,i:i,x:L[i]};return null}
 function openMenu(e0,btn){var f=find(e0.dataset.sid);if(!f)return;lpCur={li:e0,xs:'sep',anc:btn,sid:f.x.id};e0.classList.add('jv-lpon');
  $('lpBox').innerHTML='<button data-xs="ren">'+esc(TR('📛 Redenumește'))+'</button><button data-xs="col">'+esc(TR('🎨 Culoare'))+'</button><button data-xs="mv">'+esc('✥ '+TR('Mută (drag & drop)'))+'</button><button data-xs="del" class="dng">'+esc(TR('🗑 Șterge'))+'</button>';
  $('lpMenu').classList.add('show');try{lpJust=false}catch(_){}lpPos()}
 $('lpMenu').addEventListener('click',function(e){var c=lpCur;if(!c||!c.xs||c.xs==='shr'||lpJust)return;var b=e.target.closest('button');if(!b)return;e.stopPropagation();e.preventDefault();
  if(c.xs==='fab'){lpClose();if(b.dataset.xs==='new')neu();else if(b.dataset.xs==='task'&&window.tkNew)tkNew();else if(b.dataset.xs==='task'){var nb=document.querySelector('#spView [data-ta=new]');if(nb)nb.click()}return}
  var f=find(c.sid),a=b.dataset.xs;
  if(c.xs==='pal'){if(b.dataset.spc==null||!f){return}var v=b.dataset.spc;lpClose();if(v)f.x.c=v;else delete f.x.c;save(noteTab,f.L);deco();return}
  lpClose();if(!f)return;var e0=document.querySelector('#spView .spsep[data-sid="'+f.x.id+'"]');
  if(a==='ren')jvPrompt(TR('Redenumește'),f.x.t,function(v){v=String(v||'').trim();if(!v)return;f.x.t=v.slice(0,80);save(noteTab,f.L);deco()});
  else if(a==='col'&&e0){lpCur={li:e0,xs:'pal',anc:e0.querySelector('.fdots'),sid:f.x.id};$('lpBox').innerHTML=sepPalHtml(f.x.c||'','data-spc');$('lpMenu').classList.add('show');try{lpJust=false}catch(_){}lpPos()}
  else if(a==='mv'&&e0){ARM=e0;toast(TR('Trage separatorul sus sau jos'));e0.classList.add('drag')}
  else if(a==='del')ask(TR('Ștergi separatorul?'),function(){var g=find(f.x.id);if(!g)return;g.L.splice(g.i,1);save(noteTab,g.L);deco();toast(TR('Șters'))})},true);
 /* drag: long-press the separator, then move it up / down; it snaps between rows and is saved on release */
 function cancelLT(){if(LT){clearTimeout(LT.t);LT=null}}
 function startDrag(e0,pid,y){D={el:e0,pid:pid,y:y,raf:0};e0.classList.add('drag');try{navigator.vibrate&&navigator.vibrate(20)}catch(_){}try{e0.setPointerCapture(pid)}catch(_){}D.raf=requestAnimationFrame(tick)}
 function place(y){var b=box(),g=cfg();if(!b||!D)return;var R=rows(),before=null;for(var i=0;i<R.length;i++){var r=R[i].getBoundingClientRect();if(y<r.top+r.height/2){before=R[i];break}}
  if(before){if(D.el.nextElementSibling!==before)before.parentNode.insertBefore(D.el,before)}else if(R.length){var la=R[R.length-1];if(la.nextElementSibling!==D.el)la.parentNode.insertBefore(D.el,la.nextSibling)}}
 function tick(){if(!D)return;var pg=$('notesPg'),h=innerHeight,v=0;if(D.y<110)v=-Math.ceil((110-D.y)/6);else if(D.y>h-110)v=Math.ceil((D.y-(h-110))/6);if(v){var t0=pg.scrollTop;pg.scrollTop+=v;if(pg.scrollTop!==t0)place(D.y);else{var s0=window.pageYOffset;window.scrollBy(0,v);if(window.pageYOffset!==s0)place(D.y)}}D.raf=requestAnimationFrame(tick)}
 function endDrag(){var d=D;if(!d)return;D=null;cancelAnimationFrame(d.raf);d.el.classList.remove('drag');var g=cfg(),f=find(d.el.dataset.sid);
  if(f&&g){var a='',n='',p=d.el.previousElementSibling,q=d.el.nextElementSibling;while(p&&!p.matches(g.r))p=p.previousElementSibling;while(q&&!q.matches(g.r))q=q.nextElementSibling;if(p)a=p.dataset.id;if(q)n=q.dataset.id;f.x.a=a;f.x.n=n;
   /* keep the order among separators sharing the same row: move to the end of the list */f.L.splice(f.i,1);f.L.push(f.x);save(noteTab,f.L)}
  lpJust=true;setTimeout(function(){lpJust=false},400);deco()}
 document.addEventListener('pointerdown',function(e){cancelLT();var s=e.target.closest&&e.target.closest('#spView .spsep');if(!s||e.target.closest('.fdots'))return;
  if(ARM===s){ARM=null;e.preventDefault();startDrag(s,e.pointerId,e.clientY);return}
  LT={x:e.clientX,y:e.clientY,id:e.pointerId,t:setTimeout(function(){var l=LT;LT=null;if(l)startDrag(s,l.id,l.y)},LP_MS)}},true);
 document.addEventListener('pointermove',function(e){if(LT&&e.pointerId===LT.id&&Math.hypot(e.clientX-LT.x,e.clientY-LT.y)>10)cancelLT();if(D&&e.pointerId===D.pid){e.preventDefault();D.y=e.clientY;place(e.clientY)}},{capture:true,passive:false});
 document.addEventListener('pointerup',function(e){cancelLT();if(D&&e.pointerId===D.pid)endDrag()},true);document.addEventListener('pointercancel',function(e){cancelLT();if(D&&e.pointerId===D.pid)endDrag()},true);
 document.addEventListener('touchmove',function(e){if(D&&e.cancelable)e.preventDefault()},{passive:false});
 document.addEventListener('contextmenu',function(e){if(e.target.closest&&e.target.closest('#spView .spsep'))e.preventDefault()},true);
 /* the ⋮ on a separator row */
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#spView .spsep .fdots');if(!b)return;e.stopPropagation();e.preventDefault();var s=b.closest('.spsep');if(lpJust)return;openMenu(s,b)},true);
 /* backups carry the separators; restoring a backup that has none leaves the current ones alone */
 function wrap(){var c=window.spCollect,a=window.spApply;if(!c||c._v231)return;window.spCollect=function(){var o=c.apply(this,arguments)||{};var s=all();if(Object.keys(s).length)o[KEY]=s;return o};window.spCollect._v231=1;
  window.spApply=function(d){var r=a&&a.apply(this,arguments);try{if(d&&d[KEY]&&typeof d[KEY]==='object'){LS.set(KEY,d[KEY]);deco()}}catch(_){}return r}}
 wrap();if(!window.spCollect||!window.spCollect._v231)addEventListener('load',wrap);
 document.addEventListener('click',function(e){var f=e.target.closest&&e.target.closest('#noteFab');if(!f)return;var t=findNT(noteTab);if(t&&t.kind==='rec'&&cfg()&&!(typeof selOn==='function'&&selOn())){e.preventDefault();e.stopImmediatePropagation();neu()}},true);
 window.sxDeco=deco;
 /* v232: per-row ⋮ with Share (Înregistrări, Plăți). Generic: rowShMenu(btn, row, fn) -> menu with the Share glyph; fn() runs the existing share action. */
 window.rowShMenu=function(btn,row,fn){lpCur={li:row,xs:'shr',anc:btn,fn:fn};row.classList.add('jv-lpon');$('lpBox').innerHTML='<button data-xs="shr">'+SH_SVG+' Share</button>';$('lpMenu').classList.add('show');try{lpJust=false}catch(_){}lpPos()};
 $('lpMenu').addEventListener('click',function(e){var c=lpCur;if(!c||c.xs!=='shr'||lpJust)return;var b=e.target.closest('button');if(!b)return;e.stopPropagation();e.preventDefault();var f=c.fn;lpClose();if(f)f()},true);
})();
