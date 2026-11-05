/* v199: TASKS tab (kind 'task', ON by default since v201, can be hidden in Settings → Tabs) + named photos (tasks, subtasks, notes).
   Data: ns_tk {list:[{id,tab,t,d:'YYYY-MM-DD',s:'HH:MM',e:'HH:MM',done,dt,ts,ph:[{id,nm}],sub:[{id,t,done,ph:[{id,nm}]}]}]} + ns_tk_bak (previous copy).
   Photo bytes: same IndexedDB store as note photos, note:'tk:'+taskId (never garbage-collected, carried by phDump/phLoad).
   Sorting: open tasks by start (date+time; time without date = today; no date/time = at the end); done tasks below, dimmed. End time is optional. */
(function(){
var TK=tkLoad(),tkURL={},tkLP=0,tkLPT=0;
function tkNorm(r){if(!r||typeof r!=='object'||!Array.isArray(r.list))return null;r.list=r.list.filter(function(x){return x&&x.id});r.list.forEach(function(x){if(!Array.isArray(x.sub))x.sub=[];if(!Array.isArray(x.ph))x.ph=[];x.sub.forEach(function(s){if(!Array.isArray(s.ph))s.ph=[]})});return r}
function tkLoad(){return tkNorm(LS.get('ns_tk',null))||tkNorm(LS.get('ns_tk_bak',null))||{list:[]}}
function tkSave(){try{var o=LS.get('ns_tk',null);if(o)LS.set('ns_tk_bak',o)}catch(_){}LS.set('ns_tk',TK);/* v206: re-push the native snapshot so task alarms are (re)scheduled or cancelled */try{if(window.NotisNative&&typeof saveNotes==='function')saveNotes(true)}catch(_){}}
/* v206: optional task alarm. Stored in the task: al:1 (+ ald = day the alarm was set, used when the task has no date = today), alS = when it was armed.
   Alarm time = (d || ald) + s. Done / unchecked / deleted / no start time = no alarm. A time already past is never scheduled (no instant ring). */
function alAt(x){if(!x||!x.al||x.done||!x.s)return 0;var d=x.d||x.ald;if(!d)return 0;var m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(d),h=/^(\d\d):(\d\d)$/.exec(x.s);if(!m||!h)return 0;return new Date(+m[1],m[2]-1,+m[3],+h[1],+h[2],0,0).getTime()}
function alArm(o,on){if(on&&o.s){o.al=1;if(!o.d)o.ald=today();else delete o.ald;o.alS=Date.now();if(alAt(o)<=Date.now())setTimeout(function(){toast(TR('Ora a trecut deja'))},350)}else{delete o.al;delete o.ald;delete o.alS}}
window.tkAlarms=function(){var now=Date.now(),o=[];TK.list.forEach(function(x){var at=alAt(x);if(at&&at>now&&(x.alS||0)<at)o.push({id:'tk-'+x.id,text:'⏰ '+ttl(x)+' · '+x.s,at:at})});return o};
window.__tkAlDue=function(){var now=Date.now(),o=[];TK.list.forEach(function(x){var at=alAt(x);if(at&&at<=now&&now-at<5*60000&&(x.alS||0)<at)o.push({id:'tk-'+x.id,text:'⏰ '+ttl(x)+' · '+x.s,at:at})});return o};
function alBox(id,x){return '<label class="tkal"><input type="checkbox" id="'+id+'"'+(x.al?' checked':'')+(x.s?'':' disabled')+'><span>⏰ <span class="ux">'+esc(TR('Alarmă la ora setată'))+'</span></span></label>'}
function alWire(cb,tm){var c=$(cb),t=$(tm);if(!c||!t)return;function u(){c.disabled=!t.value;if(!t.value)c.checked=false}t.addEventListener('input',u);t.addEventListener('change',u)}
var BELL='<svg class="tkbell" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-label="⏰"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>';
function tkId(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function p2(n){return(n<10?'0':'')+n}
function today(){var d=new Date();return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
function key(x){if(!x.d&&!x.s)return '~';return(x.d||today())+'T'+(x.s||'99:99')}
/* v209: a task text may span several lines: line 1 = title, the rest shown under it */
function ttl(x){return String((x&&x.t)||'').split('\n')[0]}
function tmore(x){var a=String((x&&x.t)||'').split('\n');a.shift();var r=a.join('\n').replace(/\s+$/,'');return r.replace(/^\n+/,'')}
function dmy(d){var m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(d||'');return m?m[3]+'/'+m[2]+'/'+m[1]:''}
function line(x){var a=[];if(x.d)a.push(dmy(x.d));if(x.s||x.e)a.push((x.s||'…')+(x.e?' – '+x.e:''));var n=x.sub.length;if(n)a.push(x.sub.filter(function(s){return s.done}).length+'/'+n);return a.join(' · ')}
function find(id){for(var i=0;i<TK.list.length;i++)if(TK.list[i].id===id)return TK.list[i];return null}
function subOf(t,sid){for(var i=0;i<t.sub.length;i++)if(t.sub[i].id===sid)return t.sub[i];return null}
var IC={ph:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="M21 16l-5-5-8 8"/></svg>',
 cam:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>',
 sub:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4v9a3 3 0 0 0 3 3h11M15 12l4 4-4 4"/></svg>'};
window.tkIcon=IC.ph;
function chips(ph,tid,sid){if(!ph.length)return '';return '<div class="tkp">'+ph.map(function(p){return '<button type="button" class="tkch" data-ta="pv" data-t="'+esc(tid)+'"'+(sid?' data-s="'+esc(sid)+'"':'')+' data-p="'+esc(p.id)+'">'+IC.ph+'<span class="ux">'+esc(p.nm||TR('Foto'))+'</span></button>'}).join('')+'</div>'}
function row(x,sub,tid){var lbl=esc(TR(x.done?'Marchează ca nefinalizată':'Marchează ca finalizată'));
 return '<div class="tkr"><button type="button" class="tkc'+(x.done?' on':'')+'" data-ta="'+(sub?'schk':'chk')+'" aria-label="'+lbl+'"></button><div class="tkm" data-ta="'+(sub?'sed':'ed')+'"><div class="tkt ux">'+esc(ttl(x))+'</div>'+(tmore(x)?'<div class="tkx ux">'+esc(tmore(x))+'</div>':'')+(!sub&&line(x)?'<div class="tks ux">'+(alAt(x)?BELL+' ':'')+esc(line(x))+'</div>':'')+'</div>'+
 '<button type="button" class="tkb" data-ta="'+(sub?'sph':'ph')+'" aria-label="'+esc(TR('Adaugă poză'))+'">'+IC.ph+'</button>'+(sub?'':'<button type="button" class="tkb" data-ta="sub" aria-label="'+esc(TR('Adaugă subsarcină'))+'">'+IC.sub+'</button>')+'</div>'}
function ord(a){var u=a.filter(function(x){return !x.done}),d=a.filter(function(x){return x.done});return{u:u,d:d}}
window.tkRender=function(){var tab=noteTab,L=TK.list.filter(function(x){return x.tab===tab}),u=L.filter(function(x){return !x.done}).sort(function(a,b){var ka=key(a),kb=key(b);return ka<kb?-1:ka>kb?1:(a.ts||0)-(b.ts||0)}),d=L.filter(function(x){return x.done}).sort(function(a,b){return(b.dt||0)-(a.dt||0)});
 var h='<div class="tkv"><button type="button" class="btn pill tknew" data-ta="new">+ <span class="ux">'+esc(TR('Sarcină nouă'))+'</span></button>';
 if(!L.length)h+='<div class="tkemp ux">'+esc(TR('Nicio sarcină încă. Adaugă una cu ora de început.'))+'</div>';
 function one(x){var s=ord(x.sub);return '<div class="tki'+(x.done?' done':'')+'" data-id="'+esc(x.id)+'">'+row(x,0)+chips(x.ph,x.id)+(x.sub.length?'<div class="tksb">'+s.u.concat(s.d).map(function(q){return '<div class="tksi'+(q.done?' done':'')+'" data-sid="'+esc(q.id)+'">'+row(q,1)+chips(q.ph,x.id,q.id)+'</div>'}).join('')+'</div>':'')+'</div>'}
 function grp(A){return A.map(function(x,i){var o=one(x);return i<A.length-1?o.replace('class="tki','class="tki tkl'):o}).join('')}
 h+=grp(u);if(d.length)h+='<div class="tksep ux">'+esc(TR('Finalizate'))+' ('+d.length+')</div>'+grp(d);return h+'</div>'};
/* v210: global search over task text (all lines) and subtasks */
window.tkSearch=function(qs,fold){var R=[],M=function(t){var f=fold(t);return qs.every(function(w){return f.indexOf(w)>=0})},nm=function(id){var t=findNT(id);return t?t.name:''};
 (TK&&TK.list||[]).forEach(function(x){if(!x||!findNT(x.tab))return;if(M(x.t||''))R.push({path:[nm(x.tab)],text:String(x.t||''),tab:x.tab,tk:x.id});
  (x.sub||[]).forEach(function(q){if(M(q.t||''))R.push({path:[nm(x.tab),ttl(x)],text:String(q.t||''),tab:x.tab,tk:x.id,sid:q.id})})});return R};
function rr(){try{window.spRender()}catch(e){console.warn(e)}}
/* dialogs */
function X(){return window.__medX}
function edTask(t){var isNew=!t,x=t||{t:'',d:'',s:'',e:''};
 var body='<div class="field"><label class="ux">'+esc(TR('Sarcină'))+'</label><textarea id="tkT" class="tkta" rows="2" maxlength="2000">'+esc(x.t)+'</textarea></div>'+
  '<div class="field"><label class="ux">'+esc(TR('Data'))+'</label><input type="date" id="tkD" value="'+esc(x.d||(isNew?today():''))+'"></div>'+
  '<div class="al2"><div class="field"><label class="ux">'+esc(TR('Început'))+'</label><input type="time" id="tkS" value="'+esc(x.s)+'"></div><div class="field"><label class="ux">'+esc(TR('Sfârșit (opțional)'))+'</label><input type="time" id="tkE" value="'+esc(x.e)+'"></div></div>'+alBox('tkA',x);
 var b=X().dOpen(TR(isNew?'Sarcină nouă':'Editează sarcina'),body,function(){var v=$('tkT').value.replace(/\r\n?/g,'\n').replace(/[ \t]+$/gm,'').replace(/^\s*\n/,'').replace(/\s+$/,'');if(!v.trim()){$('tkT').focus();return false}
  var o=t||{id:tkId('t'),tab:noteTab,done:0,ts:Date.now(),sub:[],ph:[]};o.t=v.slice(0,2000);o.d=$('tkD').value||'';o.s=$('tkS').value||'';o.e=$('tkE').value||'';alArm(o,!!($('tkA')&&$('tkA').checked));if(isNew)TK.list.push(o);tkSave();rr()},
  isNew?null:function(){X().ask('Ștergi sarcina?',function(){X().close();delTask(t)})});
 alWire('tkA','tkS');taGrow($('tkT'));setTimeout(function(){try{if(isNew)$('tkT').focus()}catch(_){}},40);return b}
/* auto-growing textarea; Enter = new line (stopPropagation so no dialog-level handler can treat it as submit) */
function taGrow(ta){if(!ta)return;var f=function(){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight+2,Math.round(innerHeight*.4))+'px'};
 ta.addEventListener('input',f);ta.addEventListener('keydown',function(e){if(e.key==='Enter')e.stopPropagation()});ta.addEventListener('beforeinput',function(e){e.stopPropagation()});requestAnimationFrame(f)}
(function(){var st=document.createElement('style');st.textContent='.tkta{width:100%;box-sizing:border-box;resize:none;overflow-y:auto;min-height:2.6em;line-height:1.35;font:inherit;font-weight:300}.tkx{white-space:pre-line;font-size:13px;font-weight:300;opacity:.72;line-height:1.35;margin-top:2px;overflow-wrap:anywhere}';document.head.appendChild(st)})();
function edSub(t,s){var isNew=!s;X().dOpen(TR(isNew?'Subsarcină nouă':'Editează subsarcina'),'<div class="field"><label class="ux">'+esc(TR('Subsarcină'))+'</label><input id="tkU" maxlength="200" value="'+esc(s?s.t:'')+'"></div>',
  function(){var v=$('tkU').value.trim();if(!v){$('tkU').focus();return false}if(isNew)t.sub.push({id:tkId('s'),t:v.slice(0,200),done:0,ph:[]});else s.t=v.slice(0,200);tkSave();rr()},
  isNew?null:function(){X().ask('Ștergi subsarcina?',function(){X().close();var ids=s.ph.map(function(p){return p.id});t.sub=t.sub.filter(function(q){return q.id!==s.id});tkSave();ids.forEach(function(i){phDel(i).catch(function(){})});rr()})});
 setTimeout(function(){try{$('tkU').focus()}catch(_){}},40)}
function delTask(t){var ids=t.ph.map(function(p){return p.id});t.sub.forEach(function(s){s.ph.forEach(function(p){ids.push(p.id)})});TK.list=TK.list.filter(function(x){return x.id!==t.id});tkSave();ids.forEach(function(i){phDel(i).catch(function(){})});rr()}
/* photo name prompt (resolves null on cancel) */
function askName(def){return new Promise(function(res){var done=false,m=$('prModal');function fin(v){if(done)return;done=true;mo.disconnect();res(v)}
 jvPrompt(TR('Numele pozei'),def,function(v){fin(v.slice(0,40))});m._ot=Date.now();var no=$('prNo').onclick;$('prNo').onclick=function(){no&&no();fin(null)};
 var mo=new MutationObserver(function(){if(!m.classList.contains('show'))setTimeout(function(){fin(null)},0)});mo.observe(m,{attributes:true,attributeFilter:['class']})})}
window.tkAskName=askName;
/* pick → existing crop editor → name → store */
function pickVia(cam,cb){var i=document.createElement('input');i.type='file';i.accept='image/*';if(cam)i.setAttribute('capture','environment');else i.multiple=true;i.hidden=true;document.body.appendChild(i);
 i.addEventListener('change',function(){var f=[].slice.call(i.files||[]);i.remove();if(f.length)cb(f)});i.click();setTimeout(function(){if(document.body.contains(i)&&!i.files.length)i.remove()},120000)}
function cropName(files,n0){var out=[];return files.reduce(function(p,f,i){return p.then(function(){return cropEdit(f,i+1,files.length).then(function(b){if(!b)return;return askName(TR('Foto')+' '+(n0+out.length+1)).then(function(nm){if(nm)out.push({b:b,nm:nm})})},function(e){console.warn(e)})})},Promise.resolve()).then(function(){return out})}
/* v211: one photo save at a time, immediate visible busy state, storage errors reported, the task is never touched by a failure */
var PHS=0;function phErrMsg(e,nt){return window.phIsFull&&phIsFull(e)?(nt?TR('Nu e destul spațiu pentru poză.'):TR('Nu e destul spațiu pentru poză. Sarcina e păstrată.')):TR('Nu am putut adăuga poza')}
function phBusy(on){PHS=on?1:0;document.body.classList.toggle('tkphs',!!on);if(on)toast(TR('Se salvează…'))}
function tmo(p,ms){return Promise.race([p,new Promise(function(_,no){setTimeout(function(){no(new Error('timeout'))},ms)})])}
function addPh(t,s,files){if(PHS){toast(TR('Se salvează…'));return}var arr=(s||t).ph,n=0;cropName(files,arr.length).then(function(out){if(!out.length)return 0;phBusy(1);return out.reduce(function(p,o,i){return p.then(function(){return o.b.arrayBuffer().then(function(buf){var id=tkId('p');return tmo(phPut({id:id,note:'tk:'+t.id,ts:Date.now()+i,buf:buf,mt:o.b.type||'image/jpeg'}),45000).then(function(){arr.push({id:id,nm:o.nm});n++})})})},Promise.resolve()).then(function(){return n})}).then(function(k){phBusy(0);if(k){tkSave();rr();toast(TR('Poză adăugată')+(k>1?' ('+k+')':''))}}).catch(function(e){console.warn(e);phBusy(0);try{if(n){tkSave();rr()}}catch(_){}toast(phErrMsg(e))})}
function phMenu(btn,cb){var p=$('tkPop');if(!p){p=document.createElement('div');p.id='tkPop';document.body.appendChild(p);
  document.addEventListener('pointerdown',function(e){if(p.classList.contains('show')&&!p.contains(e.target))p.classList.remove('show')},true)}
 p.innerHTML='<button type="button" data-c="0">'+IC.ph+'<span class="ux">'+esc(TR('Alege imagine'))+'</span></button><button type="button" data-c="1">'+IC.cam+'<span class="ux">'+esc(TR('Fă o poză'))+'</span></button>';
 p.onclick=function(e){var b=e.target.closest('[data-c]');if(!b)return;p.classList.remove('show');pickVia(b.dataset.c==='1',cb)};
 p.classList.add('show');var r=btn.getBoundingClientRect();p.style.left=Math.max(8,Math.min(innerWidth-p.offsetWidth-8,r.right-p.offsetWidth))+'px';p.style.top=(r.bottom+p.offsetHeight+8>innerHeight?Math.max(8,r.top-p.offsetHeight-6):r.bottom+6)+'px'}
window.tkPhMenu=phMenu;window.tkPick=pickVia;
function urlOf(pid){if(tkURL[pid])return Promise.resolve(tkURL[pid]);return phGet(pid).then(function(r){if(!r||!r.buf)throw new Error('missing');var u=URL.createObjectURL(new Blob([r.buf],{type:r.mt||'image/jpeg'}));tkURL[pid]=u;return u})}
function urlTO(pid,tid){return new Promise(function(res){var ok=0,tm=setTimeout(function(){if(!ok){ok=1;res(null)}},6000);urlOf(pid).catch(function(){/* fallback: by the task key */return phOf('tk:'+tid).then(function(a){var r=(a||[]).filter(function(x){return x.id===pid})[0];if(!r||!r.buf)return null;var u=URL.createObjectURL(new Blob([r.buf],{type:r.mt||'image/jpeg'}));tkURL[pid]=u;return u})}).then(function(u){if(!ok){ok=1;clearTimeout(tm);res(u||null)}},function(){if(!ok){ok=1;clearTimeout(tm);res(null)}})})}
function view(t,s,pid){var arr=(s||t).ph;Promise.all(arr.map(function(p){return urlTO(p.id,t.id)})).then(function(us){var i=arr.map(function(p){return p.id}).indexOf(pid);if(!us[i]){toast(TR('Poza lipsește'));return}var ok=[];arr.forEach(function(p,k){if(us[k])ok.push(p.id)});phView(us[i],us.filter(Boolean));PV={t:t.id,s:s?s.id:'',ids:ok};pvBar().classList.add('on');document.body.classList.add('pvon')})}
function phEdit(t,s,pid){var arr=(s||t).ph,p=arr.filter(function(q){return q.id===pid})[0];if(!p)return;
 X().dOpen(TR('Poză'),'<div class="field"><label class="ux">'+esc(TR('Numele pozei'))+'</label><input id="tkPN" maxlength="40" value="'+esc(p.nm||'')+'"></div>',function(){var v=$('tkPN').value.trim();if(!v){$('tkPN').focus();return false}p.nm=v.slice(0,40);tkSave();rr()},
  function(){X().ask('Ștergi poza?',function(){X().close();var k=arr.indexOf(p);if(k>=0)arr.splice(k,1);tkSave();phDel(pid).catch(function(){});try{URL.revokeObjectURL(tkURL[pid])}catch(_){}delete tkURL[pid];rr()})})}

/* v202: viewer + crop overlays lived inside #noteFull (hidden outside the note editor) → from the Sarcini tab the crop step was invisible, so the photo was never saved/shown. Move them to <body>. */
function tkLift(){['crop','phView'].forEach(function(id){var e=$(id);if(e&&e.parentNode!==document.body)document.body.appendChild(e)})}
tkLift();if(document.readyState!=='complete')window.addEventListener('load',tkLift);
/* v202: task photo viewer toolbar: Decupează / Rotește / Redenumește / Mută în altă sarcină / Șterge (Da/Nu) */
var PV=null,PVB=0,PVLast=0;
/* v209: real-phone fix. The Da/Nu and name dialogs (#cfModal/#prModal z-index 12, #spModal 10) opened UNDER the viewer (#phView z-index 60):
   Redenumește/Șterge looked dead, and the hidden dialog surfaced when Mută closed the viewer. Now: body.pvon lifts the dialogs above the viewer,
   one action at a time (busy state on the button), taps on the bar act on pointerup (WebView may drop the click) with click dedupe,
   rotate/crop update the open viewer in place (no close + reload of every photo), rotate decodes off-thread via createImageBitmap. */
function pvBusy(k,on){PVB=on?k:0;var b=$('tkPvBar');if(!b)return;b.classList.toggle('busy',!!on);[].forEach.call(b.querySelectorAll('[data-pa]'),function(x){x.disabled=!!on;x.classList.toggle('wk',on&&x.dataset.pa===k)})}
function dlgOpen(){return !!document.querySelector('#cfModal.show,#prModal.show,#spModal.show,#crop.show')||($('crop')&&getComputedStyle($('crop')).display!=='none')}
function pvBar(){var b=$('tkPvBar');if(b)return b;b=document.createElement('div');b.id='tkPvBar';
 [['crop','M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14','Decupează'],['rot','M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5','Rotește'],['ren','M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4','Redenumește'],['mv','M5 12h14M13 6l6 6-6 6','Mută în altă sarcină'],['del','M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13','Șterge']].forEach(function(a){
  b.insertAdjacentHTML('beforeend','<button type="button" data-pa="'+a[0]+'"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+a[1]+'"/></svg><span class="ux">'+esc(TR(a[2]))+'</span></button>')});
 var D=null;
 b.addEventListener('pointerdown',function(e){e.stopPropagation();var x=e.target.closest('[data-pa]');D=x?{x:x,cx:e.clientX,cy:e.clientY,id:e.pointerId}:null});
 b.addEventListener('pointerup',function(e){e.stopPropagation();var d=D;D=null;if(!d||e.pointerId!==d.id)return;if(Math.abs(e.clientX-d.cx)+Math.abs(e.clientY-d.cy)>14)return;var x=e.target.closest('[data-pa]');if(x!==d.x)return;PVLast=Date.now();fire(x.dataset.pa)});
 b.addEventListener('pointercancel',function(e){e.stopPropagation();D=null});
 b.addEventListener('touchstart',function(e){e.stopPropagation()},{passive:true});
 /* the dialog now opens on top of the bar: cancel the synthetic click so it cannot land on the new dialog's backdrop and close it */
 b.addEventListener('touchend',function(e){e.stopPropagation();if(e.cancelable&&e.target.closest&&e.target.closest('[data-pa]'))e.preventDefault()},{passive:false});
 b.addEventListener('click',function(e){e.stopPropagation();var x=e.target.closest('[data-pa]');if(!x||Date.now()-PVLast<700)return;fire(x.dataset.pa)});
 function fire(k){if(!PV||PVB||dlgOpen())return;pvAct(k)}
 $('phView').appendChild(b);new MutationObserver(function(){var on=$('phView').classList.contains('show');document.body.classList.toggle('pvon',on);if(!on){PV=null;b.classList.remove('on');pvBusy(0,false)}}).observe($('phView'),{attributes:true,attributeFilter:['class']});
 var st=document.createElement('style');st.textContent='body.tkphs .tkb[data-ta="ph"],body.tkphs .tkb[data-ta="sph"]{opacity:.45;pointer-events:none;animation:tkphp 1s ease-in-out infinite alternate}@keyframes tkphp{to{opacity:.2}}body.pvon #cfModal,body.pvon #prModal{z-index:85}body.pvon #spModal{z-index:84}#tkPvBar button{touch-action:manipulation}#tkPvBar button:disabled{opacity:.45}#tkPvBar button.wk{opacity:1;animation:tkpvw 1s ease-in-out infinite}@keyframes tkpvw{50%{opacity:.4}}';document.head.appendChild(st);return b}
function cur(){if(!PV)return null;var t=find(PV.t),s=t&&PV.s?subOf(t,PV.s):null,arr=t?(s||t).ph:[],pid=PV.ids[window.pvI|0],p=arr.filter(function(q){return q.id===pid})[0];return p?{t:t,s:s,arr:arr,p:p}:null}
/* swap the shown image in place (old object URL revoked; the next open builds a fresh one) */
function swap(pid,blob){var u=URL.createObjectURL(blob),old=tkURL[pid];tkURL[pid]=u;var i=pvL.indexOf(old);if(i<0)i=window.pvI|0;pvL[i]=u;if((window.pvI|0)===i){$('phImg').src=u}setTimeout(function(){try{URL.revokeObjectURL(old)}catch(_){}},1500);rr()}
function rewrite(pid,blob,note){return phGet(pid).then(function(r){if(!r)throw new Error('missing');var go=function(buf){r.buf=buf;if(blob)r.mt=blob.type||'image/jpeg';if(note)r.note=note;return phPut(r)};return blob?blob.arrayBuffer().then(go):go(r.buf)})}
function rot90(pid){return phGet(pid).then(function(r){var bl=new Blob([r.buf],{type:r.mt||'image/jpeg'});
 var dec=window.createImageBitmap?createImageBitmap(bl):new Promise(function(ok,ko){var u=URL.createObjectURL(bl),im=new Image();im.onload=function(){URL.revokeObjectURL(u);ok(im)};im.onerror=ko;im.src=u});
 return dec.then(function(im){var w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;return new Promise(function(ok,ko){requestAnimationFrame(function(){var c=document.createElement('canvas');c.width=h;c.height=w;var g=c.getContext('2d');g.translate(h,0);g.rotate(Math.PI/2);g.drawImage(im,0,0);try{im.close&&im.close()}catch(_){}c.toBlob(function(b){c.width=c.height=0;b?ok(b):ko(new Error('blob'))},'image/jpeg',.92)})})})})}
function pvAct(k){var c=cur();if(!c)return;var pid=c.p.id,err=function(e){console.warn(e);pvBusy(0,false);toast(TR('Nu am putut adăuga poza'))},done=function(){pvBusy(0,false)};
 if(k==='ren'){pvBusy(k,true);askName(c.p.nm||TR('Foto')).then(function(v){done();if(v&&v.trim()){c.p.nm=v.trim().slice(0,40);tkSave();rr();toast(TR('Salvat'))}})}
 else if(k==='rot'){pvBusy(k,true);setTimeout(function(){rot90(pid).then(function(b){return rewrite(pid,b).then(function(){swap(pid,b)})}).then(done).catch(err)},30)}
 else if(k==='crop'){pvBusy(k,true);phGet(pid).then(function(r){var f=new File([r.buf],(c.p.nm||'foto')+'.jpg',{type:r.mt||'image/jpeg'});return cropEdit(f,1,1)}).then(function(b){if(b)return rewrite(pid,b).then(function(){swap(pid,b)})}).then(done).catch(err)}
 else if(k==='del'){pvBusy(k,true);var ok0=0;X().ask('Ștergi poza?',function(){ok0=1;var i=c.arr.indexOf(c.p);if(i>=0)c.arr.splice(i,1);tkSave();phDel(pid).catch(function(){});try{phViewClose(true)}catch(_){}setTimeout(function(){try{URL.revokeObjectURL(tkURL[pid])}catch(_){}delete tkURL[pid]},500);rr();done()});
  var m=$('cfModal'),mo=new MutationObserver(function(){if(!m.classList.contains('show')){mo.disconnect();done()}});mo.observe(m,{attributes:true,attributeFilter:['class']})}
 else if(k==='mv'){var others=TK.list.filter(function(x){return x.id!==c.t.id||c.s}).sort(function(a,b){return(a.tab===noteTab?0:1)-(b.tab===noteTab?0:1)||(a.done?1:0)-(b.done?1:0)});
  if(!others.length){toast(TR('Nicio sarcină încă. Adaugă una cu ora de început.'));return}
  pvBusy(k,true);var sm=$('spModal');
  X().dOpen(TR('Mută în altă sarcină'),'<div class="field"><label class="ux">'+esc(TR('Sarcină'))+'</label><select id="tkPvT">'+others.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(ttl(x))+(x.d?' · '+dmy(x.d):'')+'</option>'}).join('')+'</select></div>',function(){var to=find($('tkPvT').value);if(!to)return;var i=c.arr.indexOf(c.p);if(i<0)return;
   return rewrite(pid,null,'tk:'+to.id).then(function(){var j=c.arr.indexOf(c.p);if(j>=0)c.arr.splice(j,1);to.ph.push(c.p);tkSave();try{phViewClose(true)}catch(_){}rr();toast(TR('Salvat'))}).catch(function(e){console.warn(e);toast(TR('Nu am putut adăuga poza'))})});
  var mo2=new MutationObserver(function(){if(!sm.classList.contains('show')){mo2.disconnect();done()}});mo2.observe(sm,{attributes:true,attributeFilter:['class']})}}
window.__tkPvBusy=function(){return PVB};
/* while the viewer is open a stray tap on a dialog backdrop (e.g. a second, fast tap on another bar button) must not cancel the open dialog: close only with its buttons or Back */
document.addEventListener('click',function(e){if(!document.body.classList.contains('pvon'))return;var t=e.target;if(t&&(t.id==='cfModal'||t.id==='prModal'||t.id==='spModal')){e.stopImmediatePropagation();e.preventDefault()}},true);
function ctx(el){var it=el.closest('.tki'),t=it&&find(it.dataset.id),si=el.closest('.tksi'),s=t&&si?subOf(t,si.dataset.sid):null;return{t:t,s:s}}
/* long-press a photo chip → rename / delete */
document.addEventListener('pointerdown',function(e){var v=$('spView');if(!v||!v.contains(e.target))return;var c=e.target.closest('.tkch');clearTimeout(tkLPT);tkLP=0;if(!c)return;
 tkLPT=setTimeout(function(){tkLP=1;try{navigator.vibrate&&navigator.vibrate(20)}catch(_){}var q=ctx(c);if(q.t)phEdit(q.t,q.s,c.dataset.p)},500)});
['pointerup','pointercancel'].forEach(function(n){document.addEventListener(n,function(){clearTimeout(tkLPT)})});
document.addEventListener('pointermove',function(e){if(Math.abs(e.movementX)+Math.abs(e.movementY)>6)clearTimeout(tkLPT)});
document.addEventListener('contextmenu',function(e){if(e.target.closest&&e.target.closest('.tkch'))e.preventDefault()});
document.addEventListener('click',function(e){var v=$('spView');if(!v||!v.contains(e.target))return;var a=e.target.closest('[data-ta]');if(!a)return;
 if(tkLP===2){tkLP=0;return}if(tkLP&&a.dataset.ta==='pv'){tkLP=0;return}var k=a.dataset.ta,q=ctx(a),t=q.t,s=q.s;
 if(k==='new'){edTask(null);return}if(!t)return;
 if(k==='chk'){t.done=t.done?0:1;if(t.done)t.dt=Date.now();else delete t.dt;tkSave();rr()}
 else if(k==='schk'&&s){s.done=s.done?0:1;tkSave();rr()}
 else if(k==='ed')edTask(t);else if(k==='sed'&&s)edSub(t,s);else if(k==='sub')edSub(t,null);
 else if(k==='ph')phMenu(a,function(f){addPh(t,null,f)});else if(k==='sph'&&s)phMenu(a,function(f){addPh(t,s,f)});
 else if(k==='pv')view(t,s,a.dataset.p)});

/* v200: long-press a task row → Edit / Move to another time / Delete (Da/Nu) */
function moveTask(t){X().dOpen(TR('Mută la altă oră'),'<div class="field"><label class="ux">'+esc(TR('Data'))+'</label><input type="date" id="tkMD" value="'+esc(t.d||today())+'"></div><div class="al2"><div class="field"><label class="ux">'+esc(TR('Început'))+'</label><input type="time" id="tkMS" value="'+esc(t.s)+'"></div><div class="field"><label class="ux">'+esc(TR('Sfârșit (opțional)'))+'</label><input type="time" id="tkME" value="'+esc(t.e)+'"></div></div>'+alBox('tkMA',t),
 function(){t.d=$('tkMD').value||'';t.s=$('tkMS').value||'';t.e=$('tkME').value||'';alArm(t,!!($('tkMA')&&$('tkMA').checked));tkSave();rr()});alWire('tkMA','tkMS')}
function taskMenu(el,t){var p=$('tkPop');if(!p){phMenu(el,function(){});p=$('tkPop')}
 p.innerHTML='<button type="button" data-m="ed"><span class="ux">'+esc(TR('Editează'))+'</span></button><button type="button" data-m="mv"><span class="ux">'+esc(TR('Mută la altă oră'))+'</span></button><button type="button" data-m="del"><span class="ux">'+esc(TR('Șterge'))+'</span></button>';
 p.onclick=function(e){var b=e.target.closest('[data-m]');if(!b)return;p.classList.remove('show');var m=b.dataset.m;if(m==='ed')edTask(t);else if(m==='mv')moveTask(t);else X().ask('Ștergi sarcina?',function(){delTask(t)})};
 p.classList.add('show');var r=el.getBoundingClientRect();p.style.left=Math.max(8,Math.min(innerWidth-p.offsetWidth-8,r.left+40))+'px';p.style.top=(r.bottom+p.offsetHeight+8>innerHeight?Math.max(8,r.top-p.offsetHeight-6):r.bottom+4)+'px'}
var tkRT=0,tkRP=null;
document.addEventListener('pointerdown',function(e){var v=$('spView');if(!v||!v.contains(e.target))return;clearTimeout(tkRT);var m=e.target.closest('.tki>.tkr .tkm');if(!m||e.target.closest('.tkch'))return;var it=m.closest('.tki');tkRP={x:e.clientX,y:e.clientY};
 tkRT=setTimeout(function(){var t=find(it.dataset.id);if(!t)return;tkLP=2;it.classList.add('tklp');setTimeout(function(){it.classList.remove('tklp')},350);try{navigator.vibrate&&navigator.vibrate(20)}catch(_){}taskMenu(m,t)},550)});
['pointerup','pointercancel'].forEach(function(n){document.addEventListener(n,function(){clearTimeout(tkRT)})});
document.addEventListener('pointermove',function(e){if(tkRP&&Math.abs(e.clientX-tkRP.x)+Math.abs(e.clientY-tkRP.y)>8)clearTimeout(tkRT)});
document.addEventListener('contextmenu',function(e){if(e.target.closest&&e.target.closest('#spView .tkm'))e.preventDefault()});
/* v200: in a task tab the + button makes a task; plain notes left in a task tab become tasks (note → trash, recoverable) */
function isTT(){var t=typeof findNT==='function'&&findNT(noteTab);return t&&t.kind==='task'&&!nTrash&&!nFolder}
document.addEventListener('click',function(e){var f=e.target.closest&&e.target.closest('#noteFab');if(!f||!isTT())return;e.preventDefault();e.stopImmediatePropagation();edTask(null)},true);
function strip(s){return String(s||'').replace(/^\s*(?:[-*•]\s*)?(?:\[[ xX]?\]\s*)?/,'').trim()}
function migNotes(){if(!isTT())return;var ch=0;notes.forEach(function(n){if(n.del||n.tab!==noteTab||(n.fd||'')!==''||n.lock)return;var L=String(n.text||'').split('\n').map(strip).filter(Boolean);if(!L.length)return;
 TK.list.push({id:tkId('t'),tab:noteTab,t:L[0].slice(0,200),d:'',s:'',e:'',done:0,ts:Date.parse(n.createdAt||n.ts)||Date.now(),ph:[],from:n.id,sub:L.slice(1).map(function(x){return{id:tkId('s'),t:x.slice(0,200),done:0,ph:[]}})});
 try{saveNotes()}catch(_){}n.del=new Date().toISOString();n.delTab=n.tab;ch=1});if(ch){tkSave();try{nFlush()}catch(_){}}}
window.tkMig=migNotes;
/* v201: Sarcini tab ON by default (once per install; an existing task tab, even hidden with t.off, is respected; appended at the end, nothing reordered) */
function tkDef(){try{if(LS.get('ns_tkdef',0))return;if(!Array.isArray(window.noteTabs)&&typeof noteTabs==='undefined')return;
 if(!noteTabs.some(function(t){return t.kind==='task'})){var id='tk';while(findNT(id))id='tk'+Math.random().toString(36).slice(2,5);noteTabs.push({id:id,name:TR('Sarcini'),color:'#8fd3ff',kind:'task'});saveNotes();try{renderNotes()}catch(_){}try{window.tbLibRender&&tbLibRender()}catch(_){}}
 LS.set('ns_tkdef',1)}catch(e){console.warn(e)}}
if(document.readyState==='complete')setTimeout(tkDef,0);else window.addEventListener('load',function(){setTimeout(tkDef,0)});
window.tkDef=tkDef;
/* tab view */
(function wrapSP(){var o=window.spRender;if(!o||o.__tk)return;window.spRender=function(){var v=$('spView'),t=findNT(noteTab);if(!v||!t||t.kind!=='task')return o.apply(this,arguments);
 var on=!nTrash&&!nFold(nQ).trim()&&!tbHidden(noteTab)&&!nFolder;$('notesPg').classList.toggle('sptab',on);if(!on){v.innerHTML='';v.hidden=true;return}try{migNotes()}catch(e){console.warn(e)}v.hidden=false;v.innerHTML=tkRender();
 var has=notes.some(function(n){return !n.del&&n.tab===noteTab&&(n.fd||'')===''&&(n.lock||String(n.text||'').trim())})||noteFolders.some(function(f){return f.tab===noteTab&&!f.del});$('notesPg').classList.toggle('spnone',!has);try{if(window.tsApply)tsApply()}catch(_){}};
 for(var k in o)if(Object.prototype.hasOwnProperty.call(o,k))window.spRender[k]=o[k];window.spRender.__tk=1})();
/* v207: startup could render the Sarcini tab with plati's base renderer (Medicamente content) before this wrapper existed — re-render once now; persist the current tab on every switch and when leaving the app */
try{var _t7=findNT(noteTab);if(_t7&&_t7.kind==='task')renderNotes()}catch(e){console.warn(e)}
(function(){function sv(){try{if(noteTab&&findNT(noteTab))LS.set('ns_notetab',noteTab)}catch(_){}}document.addEventListener('visibilitychange',function(){if(document.hidden)sv()});window.addEventListener('pagehide',sv)})();
/* backup: metadata via spCollect/spApply (merge, never drops local tasks); photo bytes via phDump ('tk:' prefix) */
(function wrap(){var c=window.spCollect,a=window.spApply;if(!c||c._tk){if(!c)window.addEventListener('load',wrap);return}
 window.spCollect=function(){var r=c.apply(this,arguments)||{};r.ns_tk=JSON.parse(JSON.stringify(TK));return r};
 window.spApply=function(d){var r=a&&a.apply(this,arguments);try{var n=d&&tkNorm(JSON.parse(JSON.stringify(d.ns_tk||null)));if(n){var have={};n.list.forEach(function(x){have[x.id]=1});TK.list.forEach(function(x){if(!have[x.id])n.list.push(x)});TK=n;tkSave()}}catch(_){}return r};
 for(var k in c)if(Object.prototype.hasOwnProperty.call(c,k))window.spCollect[k]=c[k];window.spCollect._tk=1})();
/* notes: attach → "Photo with name" → existing crop editor → name → inline block {t:'img',ph:[id],nm} shown as icon + name */
window.phPickN=function(files){var list=[].slice.call(files||[]);if(!list.length)return;var n0=fullId&&findN(fullId);if(n0&&n0.lock&&!n0._key){toast(TR('Notiță blocată'));return}
 var caret=mCaret?JSON.parse(JSON.stringify(mCaret)):null;
 if(PHS){toast(TR('Se salvează…'));return}cropName(list,0).then(function(out){if(!out.length)return;phBusy(1);mCaret=caret;var n=fullId&&findN(fullId);if(!n){var now=new Date().toISOString();n={id:ntUid(),text:$('nfText').value||'',ts:now,createdAt:now,updatedAt:now,tab:noteTab,fd:nFolder||undefined};notes.push(n);fullId=n.id;fullIsNew=true}
  return phStore(n,out.map(function(o){return o.b})).then(function(ids){var m=null;mCaret=caret;ids.forEach(function(id,i){var nb={id:bUid(),t:'img',ph:[id],nm:out[i].nm},r=mInsertB(nb);if(!r)return;m=r;var bi=r.blocks.indexOf(nb),nx=r.blocks[bi+1];mCaret=nx&&nx.t==='text'?{b:nx.id,pos:0}:null});if(!m)return;return phCount(m).then(function(a){mAdopt(m,a);nFlush();mRender()})})}).then(function(){phBusy(0)},function(e){console.warn(e);phBusy(0);toast(phErrMsg(e,1))})};
window.__tkLPon=function(){var v=tkLP;tkLP=0;return !!v};
document.addEventListener('tkpv',function(e){var q=e.detail||{},t=q.t&&find(q.t),s=t&&q.s?subOf(t,q.s):null;if(t&&q.p)view(t,s,q.p)});
window.tkDbg={st:function(){return JSON.parse(JSON.stringify(TK))},set:function(o){TK=tkNorm(o)||{list:[]};tkSave();rr()}};
})();
/* v206: robust photo-chip tap (2.23.6 phone report: tapping a named photo row did not open the viewer).
   Opens on a short pointer tap itself (no dependence on the synthetic click, which a WebView can drop after a
   pointer/touch sequence), dedupes the click that may follow, finds the bytes by id OR via the task's photo list
   (key 'tk:'+id) and never hangs silently: a 6 s timeout or missing bytes show a toast. Viewer forced on top. */
(function(){var D=null,lastOpen=0;
function open(c){var now=Date.now();if(now-lastOpen<700)return;lastOpen=now;var it=c.closest('.tki'),si=c.closest('.tksi');
 c.dispatchEvent(new CustomEvent('tkpv',{bubbles:true,detail:{t:it&&it.dataset.id,s:si&&si.dataset.sid,p:c.dataset.p}}))}
window.__tkPvOpen=open;window.__tkPvLast=function(){return lastOpen};
document.addEventListener('pointerdown',function(e){var c=e.target.closest&&e.target.closest('#spView .tkch');D=c?{c:c,x:e.clientX,y:e.clientY,t:Date.now(),id:e.pointerId}:null},true);
document.addEventListener('pointermove',function(e){if(D&&e.pointerId===D.id&&Math.abs(e.clientX-D.x)+Math.abs(e.clientY-D.y)>10)D=null},true);
document.addEventListener('pointercancel',function(){D=null},true);
document.addEventListener('pointerup',function(e){var d=D;D=null;if(!d||e.pointerId!==d.id)return;if(Date.now()-d.t>480)return;/* long-press = rename */
 if(Math.abs(e.clientX-d.x)+Math.abs(e.clientY-d.y)>10)return;if(!document.contains(d.c))return;open(d.c)},true);
/* the click (if the WebView still sends it) is ignored when the pointer tap already opened the viewer; else it opens via the same path */
document.addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('#spView .tkch');if(!c)return;e.stopImmediatePropagation();e.preventDefault();if(Date.now()-lastOpen<700)return;if(window.__tkLPon&&window.__tkLPon())return;open(c)},true);
var st=document.createElement('style');st.textContent='#spView .tkch{touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;position:relative;z-index:2}#spView .tkch *{pointer-events:none}';document.head.appendChild(st)})();
/* v206: task alarms → native snapshot (same path as Medicamente/CRM: Scheduler exact alarms, Sunet alarmă, Stop/snooze, reboot via BootReceiver) + web fallback ring */
(function w(){var s=window.medSnap;if(typeof s!=='function'){setTimeout(w,300);return}if(s._tk)return;var f=function(){var r=s.apply(this,arguments)||[];var a=[];try{a=window.tkAlarms()}catch(_){}return r.concat(a.map(function(x){return{id:x.id,tab:'__med',type:'med',title:x.text,text:x.text,upd:'',alarm:{at:x.at,rep:0,until:null,snz:null}}}))};for(var k in s)if(Object.prototype.hasOwnProperty.call(s,k))f[k]=s[k];f._tk=1;window.medSnap=f;try{if(window.NotisNative&&typeof saveNotes==='function')saveNotes(true)}catch(_){}})();
(function(){var K='ns_tk_fired';setInterval(function(){if(window.DEMO||window.NotisNative)return;/* the app rings natively */var F={};try{F=LS.get(K,{})||{}}catch(_){}var ch=0,now=Date.now();
 for(var k in F)if(F[k]<now-864e5){delete F[k];ch=1}
 (window.__tkAlDue?__tkAlDue():[]).forEach(function(a){var key=a.id+'@'+a.at;if(F[key])return;F[key]=now;ch=1;try{alFire({id:a.id,text:a.text,med:1},null)}catch(_){}});
 if(ch)try{LS.set(K,F)}catch(_){}},15000)})();
(function(){var st=document.createElement('style');st.textContent='.tkal{display:flex;align-items:center;gap:8px;margin:6px 2px 2px;font-weight:300;font-size:14px;cursor:pointer}.tkal input{width:18px;height:18px;margin:0;accent-color:currentColor}.tkal input:disabled+span{opacity:.45}.tkbell{vertical-align:-1px;opacity:.85}';document.head.appendChild(st)})();
