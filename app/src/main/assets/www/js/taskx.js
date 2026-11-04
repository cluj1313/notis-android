/* v199: TASKS tab (kind 'task', opt-in from Settings → Tabs) + named photos (tasks, subtasks, notes).
   Data: ns_tk {list:[{id,tab,t,d:'YYYY-MM-DD',s:'HH:MM',e:'HH:MM',done,dt,ts,ph:[{id,nm}],sub:[{id,t,done,ph:[{id,nm}]}]}]} + ns_tk_bak (previous copy).
   Photo bytes: same IndexedDB store as note photos, note:'tk:'+taskId (never garbage-collected, carried by phDump/phLoad).
   Sorting: open tasks by start (date+time; time without date = today; no date/time = at the end); done tasks below, dimmed. End time is optional. */
(function(){
var TK=tkLoad(),tkURL={},tkLP=0,tkLPT=0;
function tkNorm(r){if(!r||typeof r!=='object'||!Array.isArray(r.list))return null;r.list=r.list.filter(function(x){return x&&x.id});r.list.forEach(function(x){if(!Array.isArray(x.sub))x.sub=[];if(!Array.isArray(x.ph))x.ph=[];x.sub.forEach(function(s){if(!Array.isArray(s.ph))s.ph=[]})});return r}
function tkLoad(){return tkNorm(LS.get('ns_tk',null))||tkNorm(LS.get('ns_tk_bak',null))||{list:[]}}
function tkSave(){try{var o=LS.get('ns_tk',null);if(o)LS.set('ns_tk_bak',o)}catch(_){}LS.set('ns_tk',TK)}
function tkId(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function p2(n){return(n<10?'0':'')+n}
function today(){var d=new Date();return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
function key(x){if(!x.d&&!x.s)return '~';return(x.d||today())+'T'+(x.s||'99:99')}
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
 return '<div class="tkr"><button type="button" class="tkc'+(x.done?' on':'')+'" data-ta="'+(sub?'schk':'chk')+'" aria-label="'+lbl+'"></button><div class="tkm" data-ta="'+(sub?'sed':'ed')+'"><div class="tkt ux">'+esc(x.t||'')+'</div>'+(!sub&&line(x)?'<div class="tks ux">'+esc(line(x))+'</div>':'')+'</div>'+
 '<button type="button" class="tkb" data-ta="'+(sub?'sph':'ph')+'" aria-label="'+esc(TR('Adaugă poză'))+'">'+IC.ph+'</button>'+(sub?'':'<button type="button" class="tkb" data-ta="sub" aria-label="'+esc(TR('Adaugă subsarcină'))+'">'+IC.sub+'</button>')+'</div>'}
function ord(a){var u=a.filter(function(x){return !x.done}),d=a.filter(function(x){return x.done});return{u:u,d:d}}
window.tkRender=function(){var tab=noteTab,L=TK.list.filter(function(x){return x.tab===tab}),u=L.filter(function(x){return !x.done}).sort(function(a,b){var ka=key(a),kb=key(b);return ka<kb?-1:ka>kb?1:(a.ts||0)-(b.ts||0)}),d=L.filter(function(x){return x.done}).sort(function(a,b){return(b.dt||0)-(a.dt||0)});
 var h='<div class="tkv"><button type="button" class="btn pill tknew" data-ta="new">+ <span class="ux">'+esc(TR('Sarcină nouă'))+'</span></button>';
 if(!L.length)h+='<div class="tkemp ux">'+esc(TR('Nicio sarcină încă. Adaugă una cu ora de început.'))+'</div>';
 function one(x){var s=ord(x.sub);return '<div class="tki'+(x.done?' done':'')+'" data-id="'+esc(x.id)+'">'+row(x,0)+chips(x.ph,x.id)+(x.sub.length?'<div class="tksb">'+s.u.concat(s.d).map(function(q){return '<div class="tksi'+(q.done?' done':'')+'" data-sid="'+esc(q.id)+'">'+row(q,1)+chips(q.ph,x.id,q.id)+'</div>'}).join('')+'</div>':'')+'</div>'}
 function grp(A){return A.map(function(x,i){var o=one(x);return i<A.length-1?o.replace('class="tki','class="tki tkl'):o}).join('')}
 h+=grp(u);if(d.length)h+='<div class="tksep ux">'+esc(TR('Finalizate'))+' ('+d.length+')</div>'+grp(d);return h+'</div>'};
function rr(){try{window.spRender()}catch(e){console.warn(e)}}
/* dialogs */
function X(){return window.__medX}
function edTask(t){var isNew=!t,x=t||{t:'',d:'',s:'',e:''};
 var body='<div class="field"><label class="ux">'+esc(TR('Sarcină'))+'</label><input id="tkT" maxlength="200" value="'+esc(x.t)+'"></div>'+
  '<div class="field"><label class="ux">'+esc(TR('Data'))+'</label><input type="date" id="tkD" value="'+esc(x.d||(isNew?today():''))+'"></div>'+
  '<div class="al2"><div class="field"><label class="ux">'+esc(TR('Început'))+'</label><input type="time" id="tkS" value="'+esc(x.s)+'"></div><div class="field"><label class="ux">'+esc(TR('Sfârșit (opțional)'))+'</label><input type="time" id="tkE" value="'+esc(x.e)+'"></div></div>';
 var b=X().dOpen(TR(isNew?'Sarcină nouă':'Editează sarcina'),body,function(){var v=$('tkT').value.trim();if(!v){$('tkT').focus();return false}
  var o=t||{id:tkId('t'),tab:noteTab,done:0,ts:Date.now(),sub:[],ph:[]};o.t=v.slice(0,200);o.d=$('tkD').value||'';o.s=$('tkS').value||'';o.e=$('tkE').value||'';if(isNew)TK.list.push(o);tkSave();rr()},
  isNew?null:function(){X().ask('Ștergi sarcina?',function(){X().close();delTask(t)})});
 setTimeout(function(){try{if(isNew)$('tkT').focus()}catch(_){}},40);return b}
function edSub(t,s){var isNew=!s;X().dOpen(TR(isNew?'Subsarcină nouă':'Editează subsarcina'),'<div class="field"><label class="ux">'+esc(TR('Subsarcină'))+'</label><input id="tkU" maxlength="200" value="'+esc(s?s.t:'')+'"></div>',
  function(){var v=$('tkU').value.trim();if(!v){$('tkU').focus();return false}if(isNew)t.sub.push({id:tkId('s'),t:v.slice(0,200),done:0,ph:[]});else s.t=v.slice(0,200);tkSave();rr()},
  isNew?null:function(){X().ask('Ștergi subsarcina?',function(){X().close();var ids=s.ph.map(function(p){return p.id});t.sub=t.sub.filter(function(q){return q.id!==s.id});tkSave();ids.forEach(function(i){phDel(i).catch(function(){})});rr()})});
 setTimeout(function(){try{$('tkU').focus()}catch(_){}},40)}
function delTask(t){var ids=t.ph.map(function(p){return p.id});t.sub.forEach(function(s){s.ph.forEach(function(p){ids.push(p.id)})});TK.list=TK.list.filter(function(x){return x.id!==t.id});tkSave();ids.forEach(function(i){phDel(i).catch(function(){})});rr()}
/* photo name prompt (resolves null on cancel) */
function askName(def){return new Promise(function(res){var done=false,m=$('prModal');function fin(v){if(done)return;done=true;mo.disconnect();res(v)}
 jvPrompt(TR('Numele pozei'),def,function(v){fin(v.slice(0,40))});var no=$('prNo').onclick;$('prNo').onclick=function(){no&&no();fin(null)};
 var mo=new MutationObserver(function(){if(!m.classList.contains('show'))setTimeout(function(){fin(null)},0)});mo.observe(m,{attributes:true,attributeFilter:['class']})})}
window.tkAskName=askName;
/* pick → existing crop editor → name → store */
function pickVia(cam,cb){var i=document.createElement('input');i.type='file';i.accept='image/*';if(cam)i.setAttribute('capture','environment');else i.multiple=true;i.hidden=true;document.body.appendChild(i);
 i.addEventListener('change',function(){var f=[].slice.call(i.files||[]);i.remove();if(f.length)cb(f)});i.click();setTimeout(function(){if(document.body.contains(i)&&!i.files.length)i.remove()},120000)}
function cropName(files,n0){var out=[];return files.reduce(function(p,f,i){return p.then(function(){return cropEdit(f,i+1,files.length).then(function(b){if(!b)return;return askName(TR('Foto')+' '+(n0+out.length+1)).then(function(nm){if(nm)out.push({b:b,nm:nm})})},function(e){console.warn(e)})})},Promise.resolve()).then(function(){return out})}
function addPh(t,s,files){var arr=(s||t).ph;cropName(files,arr.length).then(function(out){return out.reduce(function(p,o,i){return p.then(function(){return o.b.arrayBuffer().then(function(buf){var id=tkId('p');return phPut({id:id,note:'tk:'+t.id,ts:Date.now()+i,buf:buf,mt:o.b.type||'image/jpeg'}).then(function(){arr.push({id:id,nm:o.nm})})})})},Promise.resolve())}).then(function(){tkSave();rr()}).catch(function(e){console.warn(e);toast(TR('Nu am putut adăuga poza'))})}
function phMenu(btn,cb){var p=$('tkPop');if(!p){p=document.createElement('div');p.id='tkPop';document.body.appendChild(p);
  document.addEventListener('pointerdown',function(e){if(p.classList.contains('show')&&!p.contains(e.target))p.classList.remove('show')},true)}
 p.innerHTML='<button type="button" data-c="0">'+IC.ph+'<span class="ux">'+esc(TR('Alege imagine'))+'</span></button><button type="button" data-c="1">'+IC.cam+'<span class="ux">'+esc(TR('Fă o poză'))+'</span></button>';
 p.onclick=function(e){var b=e.target.closest('[data-c]');if(!b)return;p.classList.remove('show');pickVia(b.dataset.c==='1',cb)};
 p.classList.add('show');var r=btn.getBoundingClientRect();p.style.left=Math.max(8,Math.min(innerWidth-p.offsetWidth-8,r.right-p.offsetWidth))+'px';p.style.top=(r.bottom+p.offsetHeight+8>innerHeight?Math.max(8,r.top-p.offsetHeight-6):r.bottom+6)+'px'}
window.tkPhMenu=phMenu;window.tkPick=pickVia;
function urlOf(pid){if(tkURL[pid])return Promise.resolve(tkURL[pid]);return phGet(pid).then(function(r){if(!r||!r.buf)throw new Error('missing');var u=URL.createObjectURL(new Blob([r.buf],{type:r.mt||'image/jpeg'}));tkURL[pid]=u;return u})}
function view(t,s,pid){var arr=(s||t).ph;Promise.all(arr.map(function(p){return urlOf(p.id).catch(function(){return null})})).then(function(us){var i=arr.map(function(p){return p.id}).indexOf(pid);if(!us[i]){toast(TR('Poza lipsește'));return}phView(us[i],us.filter(Boolean))})}
function phEdit(t,s,pid){var arr=(s||t).ph,p=arr.filter(function(q){return q.id===pid})[0];if(!p)return;
 X().dOpen(TR('Poză'),'<div class="field"><label class="ux">'+esc(TR('Numele pozei'))+'</label><input id="tkPN" maxlength="40" value="'+esc(p.nm||'')+'"></div>',function(){var v=$('tkPN').value.trim();if(!v){$('tkPN').focus();return false}p.nm=v.slice(0,40);tkSave();rr()},
  function(){X().ask('Ștergi poza?',function(){X().close();var k=arr.indexOf(p);if(k>=0)arr.splice(k,1);tkSave();phDel(pid).catch(function(){});try{URL.revokeObjectURL(tkURL[pid])}catch(_){}delete tkURL[pid];rr()})})}
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
function moveTask(t){X().dOpen(TR('Mută la altă oră'),'<div class="field"><label class="ux">'+esc(TR('Data'))+'</label><input type="date" id="tkMD" value="'+esc(t.d||today())+'"></div><div class="al2"><div class="field"><label class="ux">'+esc(TR('Început'))+'</label><input type="time" id="tkMS" value="'+esc(t.s)+'"></div><div class="field"><label class="ux">'+esc(TR('Sfârșit (opțional)'))+'</label><input type="time" id="tkME" value="'+esc(t.e)+'"></div></div>',
 function(){t.d=$('tkMD').value||'';t.s=$('tkMS').value||'';t.e=$('tkME').value||'';tkSave();rr()})}
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
/* tab view */
(function wrapSP(){var o=window.spRender;if(!o||o.__tk)return;window.spRender=function(){var v=$('spView'),t=findNT(noteTab);if(!v||!t||t.kind!=='task')return o.apply(this,arguments);
 var on=!nTrash&&!nFold(nQ).trim()&&!tbHidden(noteTab)&&!nFolder;$('notesPg').classList.toggle('sptab',on);if(!on){v.innerHTML='';v.hidden=true;return}try{migNotes()}catch(e){console.warn(e)}v.hidden=false;v.innerHTML=tkRender();
 var has=notes.some(function(n){return !n.del&&n.tab===noteTab&&(n.fd||'')===''&&(n.lock||String(n.text||'').trim())})||noteFolders.some(function(f){return f.tab===noteTab&&!f.del});$('notesPg').classList.toggle('spnone',!has);try{if(window.tsApply)tsApply()}catch(_){}};
 for(var k in o)if(Object.prototype.hasOwnProperty.call(o,k))window.spRender[k]=o[k];window.spRender.__tk=1})();
/* backup: metadata via spCollect/spApply (merge, never drops local tasks); photo bytes via phDump ('tk:' prefix) */
(function wrap(){var c=window.spCollect,a=window.spApply;if(!c||c._tk){if(!c)window.addEventListener('load',wrap);return}
 window.spCollect=function(){var r=c.apply(this,arguments)||{};r.ns_tk=JSON.parse(JSON.stringify(TK));return r};
 window.spApply=function(d){var r=a&&a.apply(this,arguments);try{var n=d&&tkNorm(JSON.parse(JSON.stringify(d.ns_tk||null)));if(n){var have={};n.list.forEach(function(x){have[x.id]=1});TK.list.forEach(function(x){if(!have[x.id])n.list.push(x)});TK=n;tkSave()}}catch(_){}return r};
 for(var k in c)if(Object.prototype.hasOwnProperty.call(c,k))window.spCollect[k]=c[k];window.spCollect._tk=1})();
/* notes: attach → "Photo with name" → existing crop editor → name → inline block {t:'img',ph:[id],nm} shown as icon + name */
window.phPickN=function(files){var list=[].slice.call(files||[]);if(!list.length)return;var n0=fullId&&findN(fullId);if(n0&&n0.lock&&!n0._key){toast(TR('Notiță blocată'));return}
 var caret=mCaret?JSON.parse(JSON.stringify(mCaret)):null;
 cropName(list,0).then(function(out){if(!out.length)return;mCaret=caret;var n=fullId&&findN(fullId);if(!n){var now=new Date().toISOString();n={id:ntUid(),text:$('nfText').value||'',ts:now,createdAt:now,updatedAt:now,tab:noteTab,fd:nFolder||undefined};notes.push(n);fullId=n.id;fullIsNew=true}
  return phStore(n,out.map(function(o){return o.b})).then(function(ids){var m=null;mCaret=caret;ids.forEach(function(id,i){var nb={id:bUid(),t:'img',ph:[id],nm:out[i].nm},r=mInsertB(nb);if(!r)return;m=r;var bi=r.blocks.indexOf(nb),nx=r.blocks[bi+1];mCaret=nx&&nx.t==='text'?{b:nx.id,pos:0}:null});if(!m)return;return phCount(m).then(function(a){mAdopt(m,a);nFlush();mRender()})})}).catch(function(e){console.warn(e);toast(TR('Nu am putut adăuga poza'))})};
window.tkDbg={st:function(){return JSON.parse(JSON.stringify(TK))},set:function(o){TK=tkNorm(o)||{list:[]};tkSave();rr()}};
})();
