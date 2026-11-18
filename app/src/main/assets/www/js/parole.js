/* Notis module: parole — Parole (seif criptat). See MODULES.md */
'use strict';
(function(){
var IT=600000,RIT=210000,AB='ABCDEFGHJKMNPQRSTUVWXYZ234567890';/* 32 symbols; I/L→1, O→0 on input */
var C=window.crypto&&crypto.subtle,te=new TextEncoder(),td=new TextDecoder();
var K=null,KR=null,D=null,cat='',q='',lastAct=0,tmr=0,catOK={},clipT=0,busy=false,openId='';
function NN(){return window.NotisNative}
function ask(txt,yes){var m=$('cfModal'),cf=m.querySelector('.cftxt'),t0=cf.textContent,ok=$('cfOk'),no=$('cfNo'),o0=ok.textContent,n0=no.textContent;cf.textContent=txt;ok.textContent=TR('Da');no.textContent=TR('Nu');var back=function(){cf.textContent=t0;ok.textContent=o0;no.textContent=n0};ok.onclick=function(){jvClose('cfModal');back();yes()};no.onclick=function(){jvClose('cfModal');back()};m.classList.add('show')}
function b64(u){u=new Uint8Array(u);var s='';for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s)}
function ub(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function rnd(n){var u=new Uint8Array(n);crypto.getRandomValues(u);return u}
function rint(n){var m=Math.floor(4294967296/n)*n,x=new Uint32Array(1);do{crypto.getRandomValues(x)}while(x[0]>=m);return x[0]%n}
function id(){return 'p'+Date.now().toString(36)+b64(rnd(4)).replace(/[^a-z0-9]/gi,'')}
function M(){return LS.get('ns_vault',null)}
function Mset(m){var o=M();if(o)LS.set('ns_vault_bak',o);m.ts=Date.now();LS.set('ns_vault',m)}
function kdf(pw,salt,it){return C.importKey('raw',te.encode(pw),'PBKDF2',false,['deriveKey']).then(function(k){return C.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:salt,iterations:it},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])})}
function enc(key,bytes){var iv=rnd(12);return C.encrypt({name:'AES-GCM',iv:iv},key,bytes).then(function(c){return{iv:b64(iv),ct:b64(c)}})}
function dec(key,o){return C.decrypt({name:'AES-GCM',iv:ub(o.iv)},key,ub(o.ct)).then(function(b){return new Uint8Array(b)})}
function vk(raw){return C.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt'])}
function wrapPw(pw,raw){var s=rnd(16);return kdf(pw,s,IT).then(function(k){return enc(k,raw)}).then(function(o){o.salt=b64(s);o.it=IT;return o})}
function wrapRk(rk,raw){var s=rnd(16);return kdf(rkN(rk),s,RIT).then(function(k){return enc(k,raw)}).then(function(o){o.salt=b64(s);o.it=RIT;return o})}
function unwrap(sec,o){return kdf(sec,ub(o.salt),o.it||IT).then(function(k){return dec(k,o)})}
function rkN(s){return String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'').replace(/O/g,'0').replace(/[IL]/g,'1')}
function rkGen(n){var s='';for(var i=0;i<n;i++)s+=AB[rint(32)];return s}
function grp(s){return s.replace(/(.{4})(?=.)/g,'$1-')}
window.pwTabAct=function(a){if(!K)return false;if(a==='lock')lock();else if(a==='set')sets();return true};window.pwOpen=function(){return !!K};window.pwDbg={kdf:function(){return{it:IT,rit:RIT}},rkN:rkN,state:function(){return{unlocked:!!K,cat:cat,n:D?D.items.length:0}},data:function(){return D},lock:function(){lock()},act:function(t){lastAct=t}};
/* ---- strength ---- */
var COMMON='123456 1234567 12345678 123456789 1234567890 password parola parola123 qwerty qwertyuiop abc123 111111 000000 iloveyou admin welcome letmein monkey dragon football baseball sunshine princess master 123123 654321 qwerty123 password1 1q2w3e4r 1qaz2wsx zaq12wsx azerty asdfgh passw0rd romania bucuresti 112233 121212 666666 777777 888888 999999 aaaaaa'.split(' ');
function str(p){p=String(p||'');if(!p)return{l:0,s:0};var lw=p.toLowerCase();if(COMMON.indexOf(lw)>=0||COMMON.indexOf(lw.replace(/[0-9!@#$.]+$/,''))>=0&&lw.length<12)return{l:1,s:0};
 var v=0;if(/[a-z]/.test(p))v++;if(/[A-Z]/.test(p))v++;if(/[0-9]/.test(p))v++;if(/[^A-Za-z0-9]/.test(p))v++;
 var u={};for(var i=0;i<p.length;i++)u[p[i]]=1;var uq=Object.keys(u).length;var s=p.length*4+v*6+Math.min(uq,12)*2;if(/(.)\1\1/.test(p))s-=10;if(/^(?:\d+|[a-z]+|[A-Z]+)$/.test(p))s-=12;if(uq<5)s-=15;
 return{l:s>=78&&p.length>=12&&v>=3?3:s>=50&&p.length>=8?2:1,s:s}}
function strH(p,part){var r=str(p);if(!r.l)return '';var L=[0,TR('Slabă'),TR('Medie'),TR('Puternică')][r.l];return '<div class="pwm l'+r.l+'"><i style="width:'+[0,33,66,100][r.l]+'%"></i></div><div class="pwml l'+r.l+'">'+esc(L)+(part?' · '+esc(TR('măsoară doar partea salvată')):'')+'</div>'}
function reps(){var m={},r={};(D?D.items:[]).forEach(function(x){if(!x.pw||x.part)return;(m[x.pw]=m[x.pw]||[]).push(x)});Object.keys(m).forEach(function(k){if(m[k].length>1)m[k].forEach(function(x){r[x.id]=m[k].filter(function(y){return y!==x}).map(function(y){return y.name})})});return r}
/* ---- clipboard ---- */
function clip(t,sens){var ms=(D&&D.clip||30)*1000,n=NN(),ok=false;try{if(n&&n.clipSet){ok=!!n.clipSet(String(t),!!sens,sens?ms:0)}}catch(_){}
 if(!ok){try{navigator.clipboard.writeText(String(t))}catch(_){}}
 clearTimeout(clipT);if(sens)clipT=setTimeout(function(){try{if(n&&n.clipClear)n.clipClear();else navigator.clipboard.writeText('')}catch(_){}},ms)}
/* ---- data ---- */
function dflt(){return{v:1,type:'simple',cats:[['soc','Social media'],['bank','Bancă'],['mail','Emailuri']].map(function(a){return{id:a[0],name:TR(a[1]),lock:0}}),items:[],gen:{len:16,l:1,d:1,s:1,nm:0},clip:30}}
function save(){if(!K||!D)return Promise.resolve();var m=M();return enc(K,te.encode(JSON.stringify(D))).then(function(o){m.data=o;Mset(m)})}
function open(raw){return vk(raw).then(function(k){var m=M();return dec(k,m.data).then(function(b){D=JSON.parse(td.decode(b));if(!D.cats||!D.cats.length)D.cats=dflt().cats;D.items=D.items||[];D.gen=D.gen||dflt().gen;D.clip=D.clip||30;K=k;KR=raw;catOK={};xMig();if(D.mode==='complete')xEnsure();if(!cat||!D.cats.some(function(c){return c.id===cat}))cat=D.cats[0].id;touch();return true})})}
function lock(){try{xCvGC()}catch(_){}try{window.NotisNative&&NotisNative.shareClean&&NotisNative.shareClean()}catch(_){}SHX=null;K=null;LKV='';TRM='';XO={};try{xCropX()}catch(_){}PWF=false;BFL=false;BAUTO=false;clearTimeout(BTT);try{xBzGC()}catch(_){}XB=null;try{xFree();xZc();xBigC()}catch(_){}XE=null;if(KR)try{KR.fill(0)}catch(_){}KR=null;D=null;catOK={};q='';openId='';shClose();clearInterval(tmr);tmr=0;sec(false);if(window.spRender&&(findNT(noteTab)||{}).kind==='pw')spRender()}
function touch(){lastAct=Date.now();if(!tmr)tmr=setInterval(function(){var m=M();if(K&&lmode()==='exit'&&Date.now()-lastAct>((m&&m.al)||5)*60000)lock()},5000)}
/* v176: lock mode — 'exit' (leave Parole / background / inactivity timer), 'session' (default: unlocked while the app process lives), 'manual' (🔒 only). The key stays in memory only; a cold start is always locked. */
function lmode(){var m=M();return m&&(m.lm==='exit'||m.lm==='manual')?m.lm:'session'}
var PWF=false,BFL=false,BAUTO=false,BTT=0,BPEND=false;
function pwAuto(){return;/* v183: no automatic fingerprint prompt when Parole opens; only on tap */if(K||BAUTO||document.hidden||!document.querySelector('#spView .pwlk[data-bio]'))return;BAUTO=true;BPEND=true;setTimeout(function(){if(!K&&!document.hidden&&document.querySelector('#spView .pwlk[data-bio]'))bio('open');else{BPEND=false;rer()}},250);clearTimeout(BTT);BTT=setTimeout(function(){if(!K&&!BFL){BFL=true;rer()}},8000)}
function pwFail(){BPEND=false;if(K)return;BFL=true;rer()}
function pwPills(osl){var r=document.querySelector('#spView .pwcats');if(!r)return;if(osl>0)r.scrollLeft=osl;var a=r.querySelector('.ntab.on');if(!a)return;var L=a.offsetLeft-r.offsetLeft,Rt=L+a.offsetWidth,pad=16;if(L-pad<r.scrollLeft)r.scrollLeft=Math.max(0,L-pad);else if(Rt+pad>r.scrollLeft+r.clientWidth)r.scrollLeft=Rt+pad-r.clientWidth}
function sec(on){try{var n=NN();if(n&&n.secure)n.secure(!!on)}catch(_){}}
/* v179: FLAG_SECURE only while Parole is the visible tab (re-evaluated on every tab render, foreground and start) — every other tab allows screenshots */
/* v227: per-device opt-in 'Permite capturi de ecran' (ns_pwshot, default OFF, not in backup) — when ON Parole never sets FLAG_SECURE; encryption/auto-lock unchanged */
function shotOK(){return LS.get('ns_pwshot',0)===1}
window.pwSecSync=function(){var pg=$('notesPg'),t=findNT(noteTab);sec(!shotOK()&&!!(pg&&pg.classList.contains('show')&&t&&t.kind==='pw'))};
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(window.pwSecSync,0)});window.addEventListener('pageshow',function(){setTimeout(window.pwSecSync,0)});sec(false);
/* failures: escalating delay */
function fl(){return LS.get('ns_vault_fail',{n:0,u:0})}
function flWait(){var f=fl();return Math.max(0,f.u-Date.now())}
function flBad(){var f=fl();f.n++;f.u=f.n>=3?Date.now()+Math.min(900000,15000*Math.pow(2,f.n-3)):0;LS.set('ns_vault_fail',f)}
function flOk(){LS.set('ns_vault_fail',{n:0,u:0})}
function tryPw(pw){var w=flWait();if(w)return Promise.reject({wait:w});var m=M();return unwrap(pw,m.wp).then(function(raw){flOk();LS.set('ns_vault_qf',0);return open(raw)},function(){flBad();throw{bad:1,wait:flWait()}})}
function tryRk(rk){var w=flWait();if(w)return Promise.reject({wait:w});var m=M();return unwrap(rkN(rk),m.wr).then(function(raw){flOk();return raw},function(){flBad();throw{bad:1,wait:flWait()}})}
window.pwApi={tryPw:tryPw,tryRk:tryRk,str:str,reps:reps,gen:function(o,nm){return gen(o,nm)},wrapRk:wrapRk};
/* ---- generator ---- */
function gen(o,nm){o=o||{len:16,l:1,d:1,s:1};var L='abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',Dg='23456789',S='!@#$%&*?-_+=.',sets=[];if(o.l!==0)sets.push(L);if(o.d)sets.push(Dg);if(o.s)sets.push(S);if(!sets.length)sets=[L];
 var frag='';if(o.nm&&nm){frag=String(nm).replace(/^https?:\/\//,'').replace(/^www\./,'').split(/[.\s/]/)[0].replace(/[^A-Za-z0-9]/g,'').slice(0,4);if(frag)frag=frag[0].toUpperCase()+frag.slice(1).toLowerCase()}
 var len=Math.max(8,Math.min(64,o.len||16)),n=len-frag.length,a=[],all=sets.join('');sets.forEach(function(s){a.push(s[rint(s.length)])});while(a.length<n)a.push(all[rint(all.length)]);
 for(var i=a.length-1;i>0;i--){var j=rint(i+1),t=a[i];a[i]=a[j];a[j]=t}if(frag){var p=rint(a.length+1);a.splice(p,0,frag)}return a.join('')}
/* ---- render ---- */
/* v172: the untouched default 'Alte conturi' category gets no pill while it is empty (it still exists and is selectable in the entry editor) */
function xIdnHide(c){return c.kind==='idn'&&c.id!==cat&&!(D&&D.items.some(function(y){return y.cat===c.id}))}
function pill(x){if(x.kind&&xMode()!=='complete')return false;if(xIdnHide(x))return false;return !(x.id==='oth'&&(x.name===TR('Alte conturi')||x.name==='Alte conturi')&&x.id!==cat&&!D.items.some(function(y){return y.cat==='oth'}))}
function catOf(id){return D.cats.filter(function(c){return c.id===id})[0]}
function H(){var m=M();if(!C)return '<div class="spv pwv"><p class="pwhint">'+esc(TR('Seiful are nevoie de o conexiune securizată (HTTPS).'))+'</p></div>';
 if(!m)return '<div class="spv pwv"><div class="pwhd"><b>🔑 '+esc(TR('Parole'))+'</b></div><p class="pwhint">'+esc(TR('Păstrează aici parolele tale, criptate doar pe telefon. Alege o parolă principală pe care n-o uiți.'))+'</p><button type="button" class="btn pwbig" data-pa="setup">'+esc(TR('Creează seiful'))+'</button></div>';
 if(!K){var bio=m.bio&&NN()&&NN().bioHas&&NN().bioHas('vault');var qh=qLockH(m,bio);if(qh)return qh;/* v176: fingerprint enabled -> fingerprint only (auto prompt), password only after a failure/cancel; otherwise password only */
 if(0&&bio&&!PWF)return '<div class="spv pwv pwlk pwqt" data-bio="1"><div class="pwhd"><b>🔒 '+esc(TR('Seif blocat'))+'</b></div>'+(0?'':'<button type="button" class="btn pwfp" data-pa="bio" aria-label="'+esc(TR('Amprentă'))+'">☝ '+esc(TR('Amprentă'))+'</button>')+'<div id="pwErr" class="pwerr"></div><button type="button" class="pwlink" data-pa="usepw">'+esc(TR('Folosește parola'))+'</button></div>';/* v183: both options visible (fingerprint button + password), no auto prompt */return '<div class="spv pwv pwlk" data-bio2="'+(bio?1:0)+'"><div class="pwhd"><b>🔒 '+esc(TR('Seif blocat'))+'</b></div><input type="password" id="pwIn" class="pwin" autocomplete="off" data-lpignore="true" placeholder="'+esc(TR('Parola principală'))+'"><div id="pwErr" class="pwerr">'+qOutMsg(m)+'</div><div class="pwrow2"><button type="button" class="btn pwbig" data-pa="unlock">'+esc(TR('Deblochează'))+'</button>'+(bio?'<button type="button" class="btn pwbig" data-pa="bio">☝ '+esc(TR('Amprentă'))+'</button>':'')+'</div><button type="button" class="pwlink" data-pa="forgot">'+esc(TR('Am uitat parola'))+'</button></div>'}
 var R=reps(),srch=q.trim(),c=catOf(cat),h='<div class="spv pwv">';var nw=D.items.filter(function(x){return !x.part&&x.pw&&str(x.pw).l===1}).length,nr=Object.keys(R).length;
 if(c&&c.kind&&xMode()!=='complete'){cat=D.cats.filter(function(y){return !y.kind})[0].id;c=catOf(cat)}
 /* v226: header row (🔑 Parole · 🔒 · ⚙) removed — 🔒 and ⚙ live in the long-press menu of the Parole tab pill; the weak/reused counters stay, in a slim row only when there is something to show */
 if(nw||nr)h+='<div class="pwhd pwhc"><span class="pwcnt">'+(nw?'<i class="pwfw">⚠ '+nw+'</i>':'')+(nr?'<i class="pwfr">⟳ '+nr+'</i>':'')+'</span></div>';
 if(!D.mode&&superClass)h+=xChooser();
 h+='<div class="ntabs pwcats">'+D.cats.filter(pill).map(function(x){return '<button type="button" class="ntab'+(x.id===cat&&!srch?' on':'')+'" data-pc="'+esc(x.id)+'">'+esc(x.name)+(x.lock?' 🔒':'')+'</button>'}).join('')+'<button type="button" class="ntab pwcadd" data-pa="cadd2" aria-label="'+esc(TR('Categorie nouă'))+'" title="'+esc(TR('Categorie nouă'))+'">+</button></div>';
 h+='<input type="search" id="pwQ" class="pwin pwq" autocomplete="off" data-lpignore="true" placeholder="'+esc(TR('Caută'))+'" value="'+esc(q)+'">';
 var list;if(srch){var f=nFold(srch);list=D.items.filter(function(x){var cc=catOf(x.cat);if(cc&&cc.lock&&!catOK[cc.id])return false;if(cc&&cc.kind&&xMode()!=='complete')return false;if(x.t&&x.t!=='acct'&&xMode()!=='complete')return false;return nFold((x.name||'')+' '+(x.user||'')+' '+(x.em||'')+' '+(x.lnk||'')+' '+(x.note||'')).indexOf(f)>=0})}
 else if(c&&c.lock&&!catOK[c.id]){return h+'<div class="pwcl"><p>🔒 '+esc(TR('Categorie protejată'))+'</p><button type="button" class="btn pwbig" data-pa="catun">'+esc(TR('Deblochează'))+'</button></div></div>'}
 else if(xKindCat(c))return h+xList(xKindCat(c))+'</div>';
 else list=D.items.filter(function(x){return x.cat===cat});if(xMode()!=='complete')list=list.filter(function(x){return !x.t||x.t==='acct'});
 var cmpN=function(a,b){return nFold(a.name).localeCompare(nFold(b.name))};list=srch?list.slice().sort(cmpN):ordSort(list.slice(),function(x){return x.id},cmpN);/* v234: manual order (D.ord) when the user has dragged rows */
 h+='<div class="pwbnl">'+(list.length?list.map(function(x){return xEnt(x,R)}).join(''):'<p class="pwhint">'+esc(TR('Nicio parolă aici încă.'))+'</p>')+'</div>';
 /* v176: category-specific add button (Bancă in complete mode adds cards; logins there stay editable) */
 if(!srch)h+=xMode()==='complete'&&c&&c===xBank()?'<button type="button" class="btn pwbig pwadd" data-pa="cnew">💳 + '+esc(TR('Adaugă card'))+'</button>':'<button type="button" class="btn pwbig pwadd" data-pa="new">+ '+esc(TR(c&&c.id==='mail'?'Adaugă email':'Adaugă parolă'))+'</button>';
 return h+'</div>'}
function rer(){if((findNT(noteTab)||{}).kind==='pw'&&window.spRender)spRender()}
function wrapSP(){var o=window.spRender;if(!o||o.__pw)return;window.spRender=function(){var v=$('spView'),t=findNT(noteTab);if(!v||!t||t.kind!=='pw'){var pg=$('notesPg');if(pg)pg.classList.remove('pwtab');if(K){if(lmode()==='exit')lock();else{/* v213: keep category unlocks for the whole session */shClose();try{xZc();xBigC()}catch(_){}}}sec(false);return o.apply(this,arguments)}
 var on=!nTrash&&!nFold(nQ).trim()&&!tbHidden(noteTab)&&!nFolder;$('notesPg').classList.toggle('sptab',on);$('notesPg').classList.toggle('pwtab',on);if(!on){v.innerHTML='';v.hidden=true;return}v.hidden=false;
 var ae=document.activeElement,qf=ae&&ae.id==='pwQ',ss=qf?ae.selectionStart:0,oc=v.querySelector('.pwcats'),osl=oc?oc.scrollLeft:-1;/* v224: keep the height while the encrypted photos are re-filled, so the list does not jump (double tap on a card hit the wrong spot) */if(K&&v.offsetHeight){v.style.minHeight=v.offsetHeight+'px';clearTimeout(window.__pwMH);window.__pwMH=setTimeout(function(){v.style.minHeight=''},900)}else v.style.minHeight='';v.innerHTML=H();xDocs();xBzList();xPLfill();pwPills(osl);pwAuto();if(qf){var nq=$('pwQ');if(nq){nq.focus();try{nq.setSelectionRange(ss,ss)}catch(_){}}}
 window.pwSecSync();$('notesPg').classList.toggle('spnone',!notes.some(function(n){return !n.del&&n.tab===noteTab}))};window.spRender.__pw=1}
/* ---- sheet ---- */
function sh(title,body,btns){var s=$('pwSheet');if(!s){s=document.createElement('div');s.id='pwSheet';s.className='modal pwsh';document.body.appendChild(s)}
 s.innerHTML='<div class="card pwshc" role="dialog"><div class="pwsht"><b>'+esc(title)+'</b><button type="button" class="hb" data-pa="x" aria-label="'+esc(TR('Închide'))+'">×</button></div><div class="pwshb">'+body+'</div><div class="pwshf">'+(btns||'')+'</div></div>';s.classList.remove('pwbank');s.classList.add('show');
 s.querySelectorAll('input,textarea').forEach(function(x){x.setAttribute('autocomplete',x.type==='password'?'new-password':'off');x.setAttribute('data-lpignore','true');x.setAttribute('data-form-type','other');x.setAttribute('spellcheck','false');x.setAttribute('autocapitalize','off')});return s}
function shClose(){try{xCvGC()}catch(_){}var s=$('pwSheet');if(s){s.classList.remove('show');s.innerHTML=''}openId=''}
function B(a,t,cls){return '<button type="button" class="btn '+(cls||'')+'" data-pa="'+a+'">'+esc(t)+'</button>'}
function P(id,ph,v){return '<div class="pwpw"><input type="password" id="'+id+'" class="pwin" placeholder="'+esc(ph)+'" value="'+esc(v||'')+'"><button type="button" class="pweye" data-eye="'+id+'" aria-label="'+esc(TR('Arată'))+'">👁</button></div>'}
function err(m){var e=document.querySelector('#pwSheet .pwerr')||$('pwErr');if(e)e.textContent=m||''}
function waitMsg(w){return TR('Prea multe încercări. Mai așteaptă')+' '+Math.ceil(w/1000)+' s'}
/* setup */
var SU=null;
function setup(){SU={};sh(TR('Creează seiful'),'<p class="pwhint">'+esc(TR('Parola principală deschide seiful. Nu o putem recupera noi; doar cheia de recuperare te mai poate ajuta.'))+'</p>'+P('pwN1',TR('Parola principală'))+'<div id="pwS1"></div>'+P('pwN2',TR('Repetă parola'))+'<div class="pwerr"></div>',B('su1',TR('Continuă'),'pwbig'))}
function su1(){var a=$('pwN1').value,b=$('pwN2').value;if(str(a).l<2||a.length<8){err(TR('Parola e prea slabă (minim 8 caractere, medie).'));return}if(a!==b){err(TR('Parolele nu coincid'));return}SU.pw=a;
 sh(TR('Cheia de recuperare'),'<p class="pwhint">'+esc(TR('Vrei să alegi tu ultimele 4 caractere ale cheii? Pe hârtie treci doar partea generată de algoritm; cele 4 caractere alese de tine nu le treci nicăieri.'))+'</p>',B('su4y',TR('Da'))+B('su4n',TR('Nu')))}
function suKey(own){SU.own=own;SU.rk=rkGen(own?20:24);var g=grp(SU.rk)+(own?'-????':'');sh(TR('Cheia de recuperare'),'<p class="pwhint">'+esc(TR('Trece pe o hârtie cheia generată de algoritm și păstreaz-o în siguranță. Se arată o singură dată.'))+'</p><div class="pwrk" id="pwRk">'+esc(g)+'</div>'+(own?'<p class="pwhint">'+esc(TR('Alege ultimele 4 caractere (litere sau cifre). Nu le trece pe hârtie și nici altundeva: le știi doar tu și nu se mai arată niciodată.'))+'</p><input id="pwO1" class="pwin pwrk4" maxlength="4" placeholder="????"><input id="pwO2" class="pwin pwrk4" maxlength="4" placeholder="'+esc(TR('Repetă'))+'">':'')+'<p class="pwwarn">'+esc(TR('Dacă pierzi și parola principală și cheia de recuperare (inclusiv cele 4 caractere alese de tine, dacă le-ai ales), datele nu mai pot fi recuperate.'))+'</p><label class="pwck"><input type="checkbox" id="pwAck"> '+esc(TR('Am trecut pe hârtie cheia generată'))+'</label><div class="pwerr"></div>',B('su2',TR('Creează seiful'),'pwbig'))}
function own4(){var a=rkN($('pwO1').value),b=rkN($('pwO2').value);if(a.length!==4){err(TR('Scrie exact 4 litere sau cifre'));return null}if(a!==b){err(TR('Cele 4 caractere nu coincid'));return null}return a}
function su2(){if(!$('pwAck').checked){err(TR('Bifează după ce ai scris cheia'));return}var rk=SU.rk;if(SU.own){var o=own4();if(!o)return;rk+=o}if(busy)return;busy=true;err(TR('Se criptează…'));
 var raw=rnd(32),m={v:1,type:'simple',al:5,bio:0,rk4:SU.own?1:0};wrapPw(SU.pw,raw).then(function(w){m.wp=w;return wrapRk(rk,raw)}).then(function(w){m.wr=w;return vk(raw)}).then(function(k){D=dflt();return enc(k,te.encode(JSON.stringify(D))).then(function(o){m.data=o;Mset(m);SU=null;return open(raw)})}).then(function(){busy=false;shClose();toast(TR('Seiful e gata'));rer()},function(){busy=false;err(TR('Eroare'))})}
/* unlock */
function unlock(){var i=$('pwIn');if(!i||busy)return;var w=flWait();if(w){$('pwErr').textContent=waitMsg(w);return}busy=true;$('pwErr').textContent=TR('Se verifică…');tryPw(i.value).then(function(){busy=false;rer()},function(e){busy=false;var x=$('pwErr');if(x)x.textContent=e&&e.wait?(e.bad?TR('Parolă greșită')+'. ':'')+waitMsg(e.wait):TR('Parolă greșită')})}
function bio(why){var n=NN();if(!n||!n.bioAuth)return;BW=why||'open';try{if(!n.bioAuth('vault',TR(why==='en'?'Confirmă amprenta':'Deblochează seiful'),TR('Anulează'))){if(why==='en')bioEnd(false,'nokey');else pwFail()}}catch(_){if(why==='en')bioEnd(false,'ex');else pwFail()}}
var BW='open',BEN=null;
/* v172: readable reason for a fingerprint failure; codes only, never secrets */
function bioMsg(c){c=String(c==null?'':c);if(c==='10'||c==='13'||c==='5')return TR('Anulat');if(c==='11'||c==='w11')return TR('Amprenta nu e configurată pe telefon');if(c==='12'||c==='w12'||c==='w-2'||c==='na')return TR('Nesuportat');if(c==='7'||c==='9')return TR('Prea multe încercări cu amprenta. Încearcă mai târziu.');return TR('Eroare')+': '+(c.replace(/[^A-Za-z0-9:_-]/g,'').slice(0,24)||'?')}
function bioK(v){return C.importKey('raw',ub(String(v).replace(/-/g,'+').replace(/_/g,'/')+'='),'AES-GCM',false,['decrypt'])}
function bioEnd(ok,code){var b=BEN;BEN=null;if(!b)return;var n=NN();if(ok){var m=M();m.wb=b.wb;m.bio=1;Mset(m);toast(TR('Amprenta a fost activată'))}else{try{n&&n.bioDel&&n.bioDel('vault')}catch(_){}var t=bioMsg(code),e=$('pwBioE');if(e)e.textContent=t;toast(t)}var c=$('pwBio');if(c)c.checked=!!ok;b.res(!!ok)}
(function(){var o=window.__bioRes;window.__bioRes=function(k,v,code){if(k!=='vault')return o?o.apply(this,arguments):undefined;
 if(BW==='en'){if(!BEN)return;if(!v){bioEnd(false,code);return}var w=BEN.wb;bioK(v).then(function(k2){return dec(k2,w)}).then(function(){bioEnd(true)},function(){bioEnd(false,'dec')});return}
 if(!v){if(code!=null&&bioMsg(code)!==TR('Anulat'))toast(bioMsg(code));if(BW==='open')pwFail();return}var m=M();if(!m||!m.wb){if(BW==='open')pwFail();return}
 if(BW==='cat'&&K){bioK(v).then(function(k2){return dec(k2,m.wb)}).then(function(){catOK[cat]=1;rer()});return}
 if(BW==='del'&&K){bioK(v).then(function(k2){return dec(k2,m.wb)}).then(delAsk);return}
 if(BW==='shr'&&K){bioK(v).then(function(k2){return dec(k2,m.wb)}).then(function(){var x=SHX;SHX=null;shClose();xShRun(x,1)},function(){toast(TR('Eroare'))});return}
 bioK(v).then(function(k2){return dec(k2,m.wb)}).then(function(raw){flOk();return open(raw)}).then(rer,function(){toast(TR('Amprenta nu a putut debloca seiful'));pwFail()})}})();
function bioOn(on){var n=NN(),m=M(),e=$('pwBioE');if(e)e.textContent='';if(on){
  if(!n||!n.bioSave||!n.bioAuth||!KR){var t0=bioMsg('na');if(e)e.textContent=t0;toast(t0);return Promise.resolve(false)}
  var why=0;try{why=n.bioWhy?+n.bioWhy():(n.bioAvail&&n.bioAvail()?0:-2)}catch(_){why=-2}if(why!==0){var t1=bioMsg('w'+why);if(e)e.textContent=t1;toast(t1);return Promise.resolve(false)}
  var s=b64(rnd(32)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return C.importKey('raw',ub(s.replace(/-/g,'+').replace(/_/g,'/')+'='),'AES-GCM',false,['encrypt']).then(function(k2){return enc(k2,KR)}).then(function(o){
   var r;try{if(n.bioSaveR)r=String(n.bioSaveR('vault',s));else{n.bioSave('vault',s);r=n.bioHas&&n.bioHas('vault')?'ok':'save'}}catch(_){r='ex'}s='';
   if(r!=='ok'){try{n.bioDel&&n.bioDel('vault')}catch(_){}var t2=bioMsg(r);if(e)e.textContent=t2;toast(t2);return false}
   return new Promise(function(res){BEN={wb:o,res:res};bio('en')})})}
 try{n&&n.bioDel&&n.bioDel('vault')}catch(_){}delete m.wb;m.bio=0;Mset(m);return Promise.resolve(true)}
/* forgot */
function forgot(){var m=M();sh(TR('Am uitat parola'),'<p class="pwhint">'+esc(TR('Scrie toată cheia de recuperare (24 de caractere).'))+(m&&m.rk4?' '+esc(TR('La final adaugă cele 4 caractere alese de tine, pe care le știi din memorie.')):'')+'</p><input id="pwRkIn" class="pwin pwrk" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX">'+P('pwN1',TR('Parola principală nouă'))+'<div id="pwS1"></div>'+P('pwN2',TR('Repetă parola'))+'<div class="pwerr"></div>',B('fg',TR('Salvează'),'pwbig'))}
function fg(){var rk=$('pwRkIn').value,a=$('pwN1').value,b=$('pwN2').value;if(rkN(rk).length!==24){err(TR('Cheia are 24 de caractere'));return}if(str(a).l<2||a.length<8){err(TR('Parola e prea slabă (minim 8 caractere, medie).'));return}if(a!==b){err(TR('Parolele nu coincid'));return}
 if(busy)return;busy=true;err(TR('Se verifică…'));tryRk(rk).then(function(raw){return wrapPw(a,raw).then(function(w){var m=M();m.wp=w;Mset(m);return open(raw)})}).then(function(){busy=false;shClose();toast(TR('Parola principală a fost schimbată'));rer()},function(e){busy=false;err(e&&e.wait?TR('Cheie greșită')+'. '+waitMsg(e.wait):TR('Cheie greșită'))})}
/* entry editor (v172): name, separator, two pills Generată / Aleasă de tine */
var EM='gen',EX=null;
var XCV=null;
function edKind(){var e=$('pwEC'),id=e?e.value:cat,c=catOf(id);return id==='mail'?'mail':(c&&xIsSoc(c))?'soc':'gen'}
function edApply(){var s=$('pwSheet');if(!s)return;var k=edKind(),pm=pwPrem();s.querySelectorAll('[data-ek]').forEach(function(el){var ks=el.dataset.ek.split(','),need=(el.dataset.pm||'').split(',');el.hidden=ks.indexOf(k)<0||(need.indexOf(k)>=0&&!pm)||(el.dataset.fo==='1'&&pm)});
 var a=$('pwLN'),u=$('pwUL');if(a)a.textContent=TR(k==='soc'?'Nume aplicație':k==='mail'?'Serviciu email':'Site sau scop');if(u)u.textContent=TR(k==='mail'?'Adresa de email':k==='soc'?'Nume utilizator':'Utilizator / email')}
function edIc(){var b=$('pwIcB'),v=$('pwIC');if(!b||!v)return;var k=v.value,x={name:($('pwEN')||{}).value||'',lnk:($('pwLK')||{}).value||'',cat:($('pwEC')||{}).value,user:($('pwEU')||{}).value||''};if(k==='none')k='';else if(!k)k=icAuto(x);b.innerHTML=k?icSvg(k):'<i class="pwic" aria-hidden="true">🌐</i>';b.classList.toggle('auto',!v.value)}
function xCvT(){var t=$('pwCvT'),rid=XCV&&XCV.cur;if(!t)return;if(!rid){t.innerHTML='';t.hidden=true;return}xGet(rid).then(function(r){if(!r)return;return xOpen(r).then(function(u){var t2=$('pwCvT');if(t2&&XCV&&XCV.cur===rid){t2.hidden=false;t2.innerHTML='<img src="'+u+'" alt="">'}})}).catch(function(){})}
function xCvGC(){var c=XCV;XCV=null;if(!c||!D)return;var keep={};D.items.forEach(function(y){if(y.cv)keep[y.cv]=1});c.pend.forEach(function(r){if(!keep[r])phDel(r).catch(function(){})})}
function xCvAdd(cap){xFile(cap,function(l){if(!l[0])return;xPut(l[0],'pw:cov').then(function(rid){if(!XCV||!K)return phDel(rid);XCV.pend.push(rid);XCV.cur=rid;xCvT()}).catch(function(){toast(TR('Nu am putut adăuga poza'))})})}
function icChips(){var h='<button type="button" class="pwico2" data-pa="icsel" data-k="auto" aria-label="Auto">⟳</button>';Object.keys(window.PW_ICONS||{}).forEach(function(k){h+='<button type="button" class="pwico2" data-pa="icsel" data-k="'+k+'" aria-label="'+esc(PW_ICONS[k].n)+'" title="'+esc(PW_ICONS[k].n)+'">'+icSvg(k)+'</button>'});return h+'<button type="button" class="pwico2" data-pa="icsel" data-k="none" aria-label="'+esc(TR('Fără pictogramă'))+'">✕</button>'}
function edit(x){var nw=!x;x=x||{id:'',name:'',user:'',pw:'',note:'',cat:cat,part:0};openId=x.id;EX=nw?null:x;EM=nw?'gen':'own';var g=D.gen;XCV={cur:x.cv||'',pend:[]};var ek0=xEKind(x);
 sh(nw?TR(ek0==='mail'?'Adaugă email':'Parolă nouă'):TR('Editează'),
 '<div class="pwer" data-ek="soc" data-pm="soc"><button type="button" class="pwico" id="pwIcB" data-pa="icp" aria-label="'+esc(TR('Alege pictograma'))+'"></button><input id="pwLK" class="pwin" inputmode="url" placeholder="'+esc(TR('Link cont'))+'" value="'+esc(x.lnk||'')+'"></div><div data-ek="soc" data-pm="soc"><div class="pwicg" id="pwIcG" hidden>'+icChips()+'</div></div><input type="hidden" id="pwIC" value="'+esc(x.ic||'')+'">'+
 '<div data-ek="soc" data-pm="soc"><label class="pwl">'+esc(TR('Copertă sau poză de profil'))+'</label><div id="pwCvT" class="pwcvt" hidden></div><div class="pwrow2"><button type="button" class="btn" data-pa="cvc">📷 '+esc(TR('Cameră'))+'</button><button type="button" class="btn" data-pa="cvg">🖼 '+esc(TR('Galerie'))+'</button><button type="button" class="btn" data-pa="cvd" aria-label="'+esc(TR('Șterge'))+'">🗑</button></div></div>'+
 '<label class="pwl" id="pwLN"></label><input id="pwEN" class="pwin" value="'+esc(x.name)+'">'+
 '<div data-ek="soc"><label class="pwl">'+esc(TR('Adresa de email'))+'</label><input id="pwEM" class="pwin" inputmode="email" value="'+esc(x.em||'')+'"></div>'+
 '<div data-ek="soc,mail,gen" data-pm="soc"><label class="pwl" id="pwUL"></label><input id="pwEU" class="pwin" value="'+esc(x.user||'')+'"></div><hr class="pwsep">'+
 '<div class="pwseg pwmode" id="pwMode" role="tablist"><button type="button" role="tab" data-m="gen" class="'+(EM==='gen'?'on':'')+'">'+esc(TR('Generată'))+'</button><button type="button" role="tab" data-m="own" class="'+(EM==='own'?'on':'')+'">'+esc(TR('Aleasă de tine'))+'</button></div>'+
 '<div id="pwMG"'+(EM==='gen'?'':' hidden')+'><div class="pwgr"><label>'+esc(TR('Lungime'))+' <input type="number" id="pwGL" min="8" max="64" value="'+(g.len||16)+'"></label><label class="pwck"><input type="checkbox" id="pwGl"'+(g.l!==0?' checked':'')+'> '+esc(TR('Litere'))+'</label><label class="pwck"><input type="checkbox" id="pwGd"'+(g.d?' checked':'')+'> '+esc(TR('Cifre'))+'</label><label class="pwck"><input type="checkbox" id="pwGs"'+(g.s?' checked':'')+'> '+esc(TR('Simboluri'))+'</label><label class="pwck"><input type="checkbox" id="pwGn"'+(g.nm?' checked':'')+'> '+esc(TR('Include o parte din nume'))+'</label><p class="pwhint pwsm" id="pwGnH">'+esc(TR('Te ajută să recunoști parola; partea din nume e ghicibilă, deci restul trebuie să rămână lung și aleatoriu.'))+'</p><div class="pwrk pwgp" id="pwGP"></div>'+B('gen',TR('Generează și copiază'),'pwbig')+'</div><div class="pwrk" id="pwGV" hidden></div><div id="pwGS"></div></div>'+
 '<div id="pwMO"'+(EM==='own'?'':' hidden')+'><label class="pwl">'+esc(TR('Parolă'))+'</label>'+P('pwEP','',x.pw)+P('pwEP2',TR('Repetă parola'),x.pw)+'<div id="pwS1"></div><div id="pwMis" class="pwwarn"></div><div id="pwRep" class="pwwarn"></div>'+
 '<div id="pwPB" hidden><label class="pwck"><input type="checkbox" id="pwEPart"'+(x.part?' checked':'')+'> '+esc(TR('Ascunde o parte din parolă'))+'</label><div id="pwPN" hidden><label class="pwl">'+esc(TR('Caractere vizibile la început'))+'</label><div class="pwstep"><button type="button" class="hb" data-pa="pnm" aria-label="−">−</button><b id="pwPNv">'+(x.part?String(x.pw||'').length:4)+'</b><button type="button" class="hb" data-pa="pnp" aria-label="+">+</button></div><div class="pwprev" id="pwPV"></div><p class="pwhint pwsm">'+esc(TR('Restul îl știi doar tu; aplicația păstrează doar începutul.'))+'</p></div></div></div>'+
 '<div data-ek="soc,mail,gen" data-pm="soc,mail,gen"><p class="pwhint pwtiny">'+esc(TR('Poți nota doar câteva litere din parolă (de ex. începutul), dacă o ții minte pe toată.'))+'</p><p class="pwhint pwtiny">'+esc(TR('Pentru siguranță, adaugă la parola reală 1–3 litere, cifre sau semne INVIZIBILE: nu le scrii aici, le știi doar tu.'))+'</p></div>'+
 '<label class="pwl">'+esc(TR('Categorie'))+'</label><select id="pwEC" class="pwin">'+D.cats.map(function(c){return '<option value="'+esc(c.id)+'"'+(c.id===x.cat?' selected':'')+'>'+esc(c.name)+'</option>'}).join('')+'</select>'+
 '<div data-ek="soc,mail,gen" data-pm="soc,mail,gen"><label class="pwl">'+esc(TR('Notă'))+'</label><textarea id="pwEO" class="pwin" rows="2">'+esc(x.note||'')+'</textarea></div>'+
 '<p class="pwhint pwsm pwup" data-ek="soc,mail,gen" data-fo="1">🔒 '+esc(TR('Cu Premium: pictogramă, link, copertă, nume de utilizator, notă și parolă parțială. Activează un cod în Setări → „Ai un cod?”.'))+'</p>'+(x.mod?'<p class="pwhint pwsm">'+esc(TR('modificat la'))+' '+esc(fDate(new Date(x.mod),1))+'</p>':'')+'<div class="pwerr"></div>',
 B('esave',TR('Salvează'),'pwbig')+(nw?B('x',TR('Anulează')):B('del',TR('Șterge'),'dngb')));edApply();edIc();xCvT();live();prev()}
function setMode(m){EM=m;var s=$('pwSheet');if(!s)return;s.querySelectorAll('#pwMode button').forEach(function(b){b.classList.toggle('on',b.dataset.m===m)});$('pwMG').hidden=m!=='gen';$('pwMO').hidden=m!=='own';err('');live()}
function pnMax(a){return EX&&EX.part&&a===EX.pw?a.length:Math.max(1,a.length-1)}
function pnGet(){var e=$('pwPNv');return e?+e.textContent||4:4}
function pnSet(v){var a=$('pwEP').value;v=Math.max(1,Math.min(pnMax(a),v));$('pwPNv').textContent=v;live()}
function live(){var p=$('pwEP');if(!p)return;var a=p.value,b=$('pwEP2').value;$('pwS1').innerHTML=strH(a,0);var mis=$('pwMis');mis.textContent=b&&a!==b?TR('Parolele nu coincid'):'';
 var match=!!a&&a===b,pb=$('pwPB');pb.hidden=!match||(!pwPrem()&&!(EX&&EX.part));var part=match&&$('pwEPart').checked;$('pwPN').hidden=!part;
 if(part){var n=pnGet(),mx=pnMax(a);if(n>mx){n=mx;$('pwPNv').textContent=n}$('pwPV').textContent=TR('Se salvează:')+' '+a.slice(0,n)+'....?'}
 var r=$('pwRep');if(r){var hit=part||!a?[]:D.items.filter(function(y){return y.id!==openId&&!y.part&&y.pw===a}).map(function(y){return y.name});r.textContent=hit.length?TR('Parola se repetă la:')+' '+hit.join(', '):''}}
function gopt(){return{len:+$('pwGL').value||16,l:$('pwGl').checked?1:0,d:$('pwGd').checked?1:0,s:$('pwGs').checked?1:0,nm:$('pwGn').checked?1:0}}
function prev(){var e=$('pwGP');if(!e)return;var o=gopt();e.hidden=!o.nm;e.textContent=o.nm?TR('Exemplu:')+' '+gen(o,$('pwEN').value):''}
var GV='';
function doGen(){var o=gopt();D.gen=o;var p=gen(o,$('pwEN').value);GV=p;var v=$('pwGV');v.textContent=p;v.hidden=false;$('pwGS').innerHTML=strH(p,0);err('');clip(p,1);toast(TR('Parola a fost copiată. Se șterge din clipboard în')+' '+(D.clip||30)+' s')}
function esave(){var n=$('pwEN').value.trim();if(!n){err(TR('Numele e obligatoriu'));return}var pw,part=0;
 if(EM==='gen'){if(!GV){if(EX){pw=EX.pw;part=EX.part?1:0}else{err(TR('Generează mai întâi o parolă'));return}}else pw=GV}
 else{var a=$('pwEP').value,b=$('pwEP2').value;if(a!==b){err(TR('Parolele nu coincid'));return}pw=a;if(a&&$('pwEPart').checked){var k=Math.max(1,Math.min(pnMax(a),pnGet()));pw=a.slice(0,k);part=1}}
 var x=openId&&D.items.filter(function(y){return y.id===openId})[0];if(!x){x={id:id(),ts:Date.now(),t:'acct'};D.items.push(x)}
 x.name=n;x.user=$('pwEU').value.trim();x.pw=pw;x.part=part;x.note=$('pwEO').value;x.cat=$('pwEC').value;var v1=$('pwEM').value.trim();if(v1)x.em=v1;else delete x.em;v1=$('pwLK').value.trim();if(v1)x.lnk=v1;else delete x.lnk;v1=$('pwIC').value;if(v1)x.ic=v1;else delete x.ic;var oc=x.cv;if(XCV){if(XCV.cur)x.cv=XCV.cur;else delete x.cv}if(oc&&oc!==x.cv)phDel(oc).catch(function(){});x.mod=Date.now();GV='';save().then(function(){shClose();toast(TR('Salvat'));rer()})}
/* delete: master password (or fingerprint) first, then Da/Nu */
var DELX=null;
function delE(){var x=D.items.filter(function(y){return y.id===openId})[0];if(!x)return;DELX=x;var m=M(),bo=m.bio&&NN()&&NN().bioHas&&NN().bioHas('vault');
 sh(TR('Șterge'),'<p class="pwhint">'+esc(TR('Confirmă cu parola principală pentru a șterge.'))+'</p>'+P('pwO',TR('Parola principală'))+'<div class="pwerr"></div>',B('del2',TR('Continuă'),'pwbig')+(bo?B('delb','☝ '+TR('Amprentă')):''))}
function delAsk(){var x=DELX;if(!x||!D)return;shClose();setTimeout(function(){ask(TR(x.t&&x.t!=='acct'?'Ștergi această intrare?':'Ștergi această parolă?'),function(){if(x.ph)phDel(x.ph).catch(function(){});if(x.ph2)phDel(x.ph2).catch(function(){});if(x.cv)phDel(x.cv).catch(function(){});D.items=D.items.filter(function(y){return y!==x});DELX=null;save().then(function(){rer()})})},50)}
function del2(){var w=flWait();if(w){err(waitMsg(w));return}if(busy)return;busy=true;err(TR('Se verifică…'));unwrap($('pwO').value,M().wp).then(function(){flOk();busy=false;delAsk()},function(){flBad();busy=false;var w2=flWait();err(TR('Parolă greșită')+(w2?'. '+waitMsg(w2):''))})}
/* settings */
function sets(){var m=M(),n=NN(),ba=n&&n.bioAvail&&n.bioAvail();var seg=function(idn,arr,cur,suf){return '<div class="pwseg" id="'+idn+'">'+arr.map(function(v){return '<button type="button" class="'+(v===cur?'on':'')+'" data-v="'+v+'">'+v+suf+'</button>'}).join('')+'</div>'};
 var lm=lmode(),LMT={exit:'Se blochează când ieși din Parole, când aplicația trece în fundal și după timpul de inactivitate.',session:'Rămâne deblocat cât timp aplicația e deschisă, inclusiv în alte taburi și în fundal. Se blochează când închizi aplicația.',manual:'Se blochează doar când apeși 🔒 sau când închizi aplicația.'};
 sh(TR('Setări seif'),'<label class="pwl">'+esc(TR('Blocare seif'))+'</label><div class="pwseg" id="pwLM">'+[['exit','La fiecare ieșire'],['session','La închiderea sesiunii'],['manual','Manual']].map(function(o){return '<button type="button" class="'+(o[0]===lm?'on':'')+'" data-lm="'+o[0]+'">'+esc(TR(o[1]))+'</button>'}).join('')+'</div><p class="pwhint pwsm">'+esc(TR(LMT[lm]))+' '+esc(TR('La pornirea aplicației seiful e mereu blocat. Cât timp e deblocat, oricine are telefonul în mână îl poate deschide.'))+'</p>'+(lm==='exit'?'<label class="pwl">'+esc(TR('Blocare automată după'))+'</label>'+seg('pwAL',[1,2,5,15],m.al||5,' min'):'')+'<label class="pwl">'+esc(TR('Șterge clipboard-ul după'))+'</label>'+seg('pwCL',[15,30,60],D.clip||30,' s')+qSetsH(m,n)+(n&&n.bioSave?'<label class="pwck"><input type="checkbox" id="pwBio"'+(m.bio?' checked':'')+'> ☝ '+esc(TR('Deblocare cu amprenta'))+'</label><div id="pwBioE" class="pwerr"></div>':'')+'<label class="pwck"><input type="checkbox" id="pwShot"'+(shotOK()?' checked':'')+'> 📸 '+esc(TR('Permite capturi de ecran'))+'</label><p class="pwhint pwsm">'+esc(TR('Doar pe acest telefon. Capturile pot conține parole: oprește când nu mai ai nevoie.'))+'</p>'+
 '<div class="pwsl">'+(superClass?B('mode',TR('Mod seif')+': '+TR(xMode()==='complete'?'Complet':'Simplu')):'')+B('cats',TR('Categorii'))+B('chpw',TR('Schimbă parola principală'))+B('rgk',TR('Cheie de recuperare nouă'))+B('exp',TR('Exportă seiful criptat'))+B('wipe',TR('Șterge seiful'),'dngb')+'</div><p class="pwhint pwsm">'+esc(TR('Seiful e criptat (AES-256) și rămâne doar pe acest telefon și în backup-urile tale.'))+'</p>','')}
function cats(){var h=D.cats.map(function(c,i){if(c.kind&&xMode()!=='complete'||xIdnHide(c))return '';return '<div class="pwcr" data-ci="'+i+'"><span class="pwch" aria-label="☰">☰</span><b>'+esc(c.name)+'</b><button type="button" class="hb" data-pa="clk" aria-label="'+esc(TR('Blochează'))+'">'+(c.lock?'🔒':'🔓')+'</button><button type="button" class="hb" data-pa="cup" aria-label="↑">↑</button><button type="button" class="hb" data-pa="cdn" aria-label="↓">↓</button><button type="button" class="hb" data-pa="cren" aria-label="'+esc(TR('Redenumește'))+'">✎</button>'+(xIsSoc(c)?'':'<button type="button" class="hb" data-pa="cdel" aria-label="'+esc(TR('Șterge'))+'">🗑</button>')+'</div>'}).join('');
 sh(TR('Categorii'),h+'<p class="pwhint pwsm">'+esc(TR('🔒 = cere parola sau amprenta de fiecare dată când deschizi categoria.'))+'</p>',B('cadd','+ '+TR('Adaugă')))}
/* v179/v233: reorder categories — drag the ☰ handle, OR long-press anywhere on the row (not on a button), then drag up/down; the list auto-scrolls near its edges. ↑/↓ move one step among the VISIBLE categories (hidden ones keep their place). Order = D.cats (encrypted vault, in backups). */
function catVis(c){return !(c.kind&&xMode()!=='complete'||xIdnHide(c))}
function catStep(i,d){var j=i+d;while(j>=0&&j<D.cats.length&&!catVis(D.cats[j]))j+=d;if(j<0||j>=D.cats.length||!catVis(D.cats[i]))return false;var t=D.cats[i];D.cats[i]=D.cats[j];D.cats[j]=t;return true}
(function(){var dr=null,lt=null,raf=0,lastY=0;function rows(){return dr?[].slice.call(dr.box.querySelectorAll('.pwcr[data-ci]')):[]}
 function sc(){return dr.sb?dr.sb.scrollTop:0}
 function begin(r,y){var b=r.getBoundingClientRect();dr={r:r,box:r.parentNode,sb:r.closest('.pwshc'),y0:y,h:b.height,sc0:0};dr.sc0=sc();r.classList.add('pwdrg');try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}}
 function st(e,y){if(!D||dr)return;var t=e.target;if(!t.closest)return;var h=t.closest('.pwch'),r=t.closest('.pwcr');if(!r||!t.closest('#pwSheet'))return;
  if(h){e.preventDefault();begin(r,y);return}
  if(t.closest('button'))return;lastY=y;lt={x:e.touches?e.touches[0].clientX:e.clientX,y:y,t:setTimeout(function(){var q=lt;lt=null;if(q)begin(r,lastY)},420)}}
 function place(){if(!dr)return;var y=lastY,dy=y-dr.y0+(sc()-dr.sc0),rs=rows(),i=rs.indexOf(dr.r);dr.r.style.transform='translateY('+dy+'px)';
  if(dy>dr.h/2&&i<rs.length-1){dr.box.insertBefore(rs[i+1],dr.r);dr.y0+=dr.h;dr.r.style.transform='translateY('+(y-dr.y0+(sc()-dr.sc0))+'px)'}
  else if(dy<-dr.h/2&&i>0){dr.box.insertBefore(dr.r,rs[i-1]);dr.y0-=dr.h;dr.r.style.transform='translateY('+(y-dr.y0+(sc()-dr.sc0))+'px)'}}
 function auto(){raf=0;if(!dr||!dr.sb)return;var r=dr.sb.getBoundingClientRect(),z=44,v=0;if(lastY<r.top+z)v=-Math.ceil((r.top+z-lastY)/4);else if(lastY>r.bottom-z)v=Math.ceil((lastY-(r.bottom-z))/4);if(v){var o=dr.sb.scrollTop;dr.sb.scrollTop=o+Math.max(-14,Math.min(14,v));if(dr.sb.scrollTop!==o)place();raf=requestAnimationFrame(auto)}}
 function mv(e,y){if(lt){if(Math.abs(y-lt.y)>8||(e.touches&&Math.abs(e.touches[0].clientX-lt.x)>8)){clearTimeout(lt.t);lt=null}return}if(!dr)return;e.preventDefault();lastY=y;place();if(!raf)raf=requestAnimationFrame(auto)}
 function en(){if(lt){clearTimeout(lt.t);lt=null}if(!dr)return;var d=dr;dr=null;lastY=0;d.r.classList.remove('pwdrg');d.r.style.transform='';var idx=[].slice.call(d.box.querySelectorAll('.pwcr[data-ci]')).map(function(x){return +x.dataset.ci});
  var pos=idx.slice().sort(function(a,b){return a-b});if(idx.every(function(v,k){return v===pos[k]}))return;var old=D.cats.slice(),nc=D.cats.slice();pos.forEach(function(p,k){nc[p]=old[idx[k]]});D.cats=nc;save().then(function(){cats();rer()})}
 document.addEventListener('touchstart',function(e){if(e.touches.length===1)st(e,e.touches[0].clientY)},{passive:false});
 document.addEventListener('touchmove',function(e){if(e.touches.length)mv(e,e.touches[0].clientY)},{passive:false});
 document.addEventListener('touchend',en);document.addEventListener('touchcancel',en);
 document.addEventListener('mousedown',function(e){if(e.button===0)st(e,e.clientY)});document.addEventListener('mousemove',function(e){mv(e,e.clientY)});document.addEventListener('mouseup',en);
 document.addEventListener('contextmenu',function(e){if(dr||lt&&e.target.closest&&e.target.closest('.pwcr'))e.preventDefault()});
 })();
/* v234: entries inside a Parole section (cards in Bancă, logins in Email / Social media / WiFi…, business cards, store cards, ID photos) — long-press a row (~0.5 s, vibrates), then drag up/down; the page auto-scrolls near its edges. A short tap still opens the row. Order = D.ord[categoryId] (list of ids) inside the encrypted vault → in backups; until the first drag the list stays alphabetical. */
(function(){var dr=null,lt=null,raf=0,lastY=0;
 function rid(r){return r.dataset.eid||r.dataset.bid||''}
 function rowsOf(){return dr?[].slice.call(dr.box.children).filter(function(x){return x.classList&&x.classList.contains('pwbn')&&rid(x)}):[]}
 function scroller(el){var n=el.parentNode;while(n&&n!==document.body&&n!==document.documentElement){var o=getComputedStyle(n).overflowY;if((o==='auto'||o==='scroll')&&n.scrollHeight>n.clientHeight+2)return n;n=n.parentNode}return null}
 function sY(){return dr.sc?dr.sc.scrollTop:(window.pageYOffset||0)}
 function tr(){var d=lastY-dr.y0+(sY()-dr.s0);dr.el.style.transform='translateY('+d+'px)';return d}
 function begin(el){dr={el:el,box:el.parentNode,sc:scroller(el),y0:lastY,s0:0};dr.s0=sY();window.__pwPD=1;el.classList.add('pwrdrg');dr.box.classList.add('pwrdon');try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}}
 function place(){if(!dr)return;var d=tr(),L=rowsOf(),i=L.indexOf(dr.el),nx=L[i+1],pv=L[i-1];
  if(d>0&&nx&&d>nx.offsetHeight/2){var o=dr.el.offsetTop;dr.box.insertBefore(nx,dr.el);dr.y0+=dr.el.offsetTop-o;tr()}
  else if(d<0&&pv&&-d>pv.offsetHeight/2){var o2=dr.el.offsetTop;dr.box.insertBefore(dr.el,pv);dr.y0+=dr.el.offsetTop-o2;tr()}}
 function auto(){raf=0;if(!dr)return;var top=dr.sc?dr.sc.getBoundingClientRect().top:0,bot=dr.sc?dr.sc.getBoundingClientRect().bottom:window.innerHeight,z=70,v=0;
  if(lastY<top+z+60&&lastY<top+z)v=-Math.ceil((top+z-lastY)/4);else if(lastY>bot-z)v=Math.ceil((lastY-(bot-z))/4);
  if(v){v=Math.max(-16,Math.min(16,v));var o=sY();if(dr.sc)dr.sc.scrollTop=o+v;else window.scrollBy(0,v);if(sY()!==o)place();raf=requestAnimationFrame(auto)}}
 function st(e,y){if(!D||dr||!K)return;var t=e.target;if(!t.closest||t.closest('button,a,input,textarea,select,#pwSheet,.modal.show'))return;var el=t.closest('#spView .pwbnl > .pwbn');if(!el||!rid(el))return;try{if(q&&q.trim())return}catch(_){}lastY=y;lt={x:e.touches?e.touches[0].clientX:e.clientX,y:y,t:setTimeout(function(){var z=lt;lt=null;if(z)begin(el)},500)}}
 function mv(e,x,y){if(lt){if(Math.abs(x-lt.x)>8||Math.abs(y-lt.y)>8){clearTimeout(lt.t);lt=null}return}if(!dr)return;e.preventDefault();lastY=y;place();if(!raf)raf=requestAnimationFrame(auto)}
 function en(){if(lt){clearTimeout(lt.t);lt=null}if(!dr)return;var d=dr;dr=null;window.__pwPD=0;window.__pwPDT=Date.now();window.__pwRDT=Date.now();d.el.classList.remove('pwrdrg');d.box.classList.remove('pwrdon');d.el.style.transform='';
  var ids=[].slice.call(d.box.children).filter(function(x){return x.classList&&x.classList.contains('pwbn')&&rid(x)}).map(rid);if(!ids.length||!D)return;
  var was=(D.ord&&D.ord[cat])||[];if(was.length===ids.length&&was.every(function(v,k){return v===ids[k]}))return;
  D.ord=D.ord||{};D.ord[cat]=ids;save().then(function(){rer()})}
 document.addEventListener('touchstart',function(e){if(e.touches.length===1)st(e,e.touches[0].clientY)},{passive:true});
 document.addEventListener('touchmove',function(e){if(e.touches.length)mv(e,e.touches[0].clientX,e.touches[0].clientY)},{passive:false});
 document.addEventListener('touchend',en);document.addEventListener('touchcancel',en);
 document.addEventListener('mousedown',function(e){if(e.button===0)st(e,e.clientY)});document.addEventListener('mousemove',function(e){mv(e,e.clientX,e.clientY)});document.addEventListener('mouseup',en);
 document.addEventListener('contextmenu',function(e){if((dr||lt)&&e.target.closest&&e.target.closest('#spView .pwbnl'))e.preventDefault()});
 document.addEventListener('click',function(e){if(Date.now()-(window.__pwRDT||0)<500&&e.target.closest&&e.target.closest('#spView .pwbnl')){e.stopPropagation();e.preventDefault()}},true)})();
/* v233: sub-tabs (Bancă, WiFi, Cărți de vizită, Poze acte, Emailuri, Social media …) — long-press a pill, then drag it left/right (the row auto-scrolls near its edges). A short tap still opens the category. The order is D.cats (encrypted vault → included in the backup); hidden categories keep their place. */
(function(){var dr=null,lt=null,raf=0,lastX=0;
 function pills(){return dr?[].slice.call(dr.row.querySelectorAll('.ntab[data-pc]')):[]}
 function tr(){var d=lastX-dr.x0+(dr.row.scrollLeft-dr.sc0);dr.el.style.transform='translateX('+d+'px)';return d}
 function begin(el){var row=el.closest('.pwcats');dr={el:el,row:row,x0:lastX,sc0:row.scrollLeft};window.__pwPD=1;el.classList.add('pwpdrg');row.classList.add('pwpdon');try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}}
 function place(){if(!dr)return;var d=tr(),L=pills(),i=L.indexOf(dr.el),nx=L[i+1],pv=L[i-1],g=8;
  if(d>0&&nx&&d>nx.offsetWidth/2+g/2){var o=dr.el.offsetLeft;dr.row.insertBefore(nx,dr.el);dr.x0+=dr.el.offsetLeft-o;tr()}
  else if(d<0&&pv&&-d>pv.offsetWidth/2+g/2){var o2=dr.el.offsetLeft;dr.row.insertBefore(dr.el,pv);dr.x0+=dr.el.offsetLeft-o2;tr()}}
 function auto(){raf=0;if(!dr)return;var r=dr.row.getBoundingClientRect(),z=44,v=0;if(lastX<r.left+z)v=-Math.ceil((r.left+z-lastX)/3);else if(lastX>r.right-z)v=Math.ceil((lastX-(r.right-z))/3);if(v){var o=dr.row.scrollLeft;dr.row.scrollLeft=o+Math.max(-14,Math.min(14,v));if(dr.row.scrollLeft!==o)place();raf=requestAnimationFrame(auto)}}
 function st(e,x,y){if(!D||dr)return;var t=e.target;if(!t.closest)return;var el=t.closest('#spView .pwcats .ntab[data-pc]');if(!el)return;lastX=x;lt={x:x,y:y,t:setTimeout(function(){var q=lt;lt=null;if(q)begin(el)},450)}}
 function mv(e,x,y){if(lt){if(Math.abs(x-lt.x)>8||Math.abs(y-lt.y)>8){clearTimeout(lt.t);lt=null}return}if(!dr)return;e.preventDefault();lastX=x;place();if(!raf)raf=requestAnimationFrame(auto)}
 function en(){if(lt){clearTimeout(lt.t);lt=null}if(!dr)return;var d=dr;dr=null;window.__pwPD=0;window.__pwPDT=Date.now();d.el.classList.remove('pwpdrg');d.row.classList.remove('pwpdon');d.el.style.transform='';
  var ids=[].slice.call(d.row.querySelectorAll('.ntab[data-pc]')).map(function(x){return x.dataset.pc}),pos=[];D.cats.forEach(function(c,i){if(pill(c))pos.push(i)});
  var byId={};D.cats.forEach(function(c){byId[c.id]=c});var cur=pos.map(function(i){return D.cats[i].id});if(ids.length!==pos.length||ids.every(function(v,k){return v===cur[k]}))return;
  var nc=D.cats.slice();pos.forEach(function(p,k){nc[p]=byId[ids[k]]});D.cats=nc;save().then(function(){rer()})}
 document.addEventListener('touchstart',function(e){if(e.touches.length===1)st(e,e.touches[0].clientX,e.touches[0].clientY)},{passive:true});
 document.addEventListener('touchmove',function(e){if(e.touches.length)mv(e,e.touches[0].clientX,e.touches[0].clientY)},{passive:false});
 document.addEventListener('touchend',en);document.addEventListener('touchcancel',en);
 document.addEventListener('mousedown',function(e){if(e.button===0)st(e,e.clientX,e.clientY)});document.addEventListener('mousemove',function(e){mv(e,e.clientX,e.clientY)});document.addEventListener('mouseup',en);
 document.addEventListener('contextmenu',function(e){if((dr||lt)&&e.target.closest&&e.target.closest('.pwcats'))e.preventDefault()});
 document.addEventListener('click',function(e){if(Date.now()-(window.__pwPDT||0)<500&&e.target.closest&&e.target.closest('#spView .pwcats .ntab')){e.stopPropagation();e.preventDefault()}},true)})();
function chpw(){sh(TR('Schimbă parola principală'),P('pwO',TR('Parola actuală'))+P('pwN1',TR('Parola principală nouă'))+'<div id="pwS1"></div>'+P('pwN2',TR('Repetă parola'))+'<div class="pwerr"></div>',B('chpw2',TR('Salvează'),'pwbig'))}
function chpw2(){var o=$('pwO').value,a=$('pwN1').value,b=$('pwN2').value;if(str(a).l<2||a.length<8){err(TR('Parola e prea slabă (minim 8 caractere, medie).'));return}if(a!==b){err(TR('Parolele nu coincid'));return}if(busy)return;busy=true;err(TR('Se verifică…'));var m=M();
 unwrap(o,m.wp).then(function(raw){return wrapPw(a,raw)},function(){throw 1}).then(function(w){m.wp=w;Mset(m);busy=false;shClose();toast(TR('Parola principală a fost schimbată'))},function(){busy=false;err(TR('Parolă greșită'))})}
function rgk(){ask(TR('Faci o cheie de recuperare nouă? Cea veche nu va mai funcționa.'),function(){setTimeout(function(){SU={};sh(TR('Cheia de recuperare'),'<p class="pwhint">'+esc(TR('Vrei să alegi tu ultimele 4 caractere ale cheii? Pe hârtie treci doar partea generată de algoritm; cele 4 caractere alese de tine nu le treci nicăieri.'))+'</p>',B('rk4y',TR('Da'))+B('rk4n',TR('Nu')))},50)})}
function rkSave(){if(!$('pwAck').checked){err(TR('Bifează după ce ai scris cheia'));return}var rk=SU.rk;if(SU.own){var o=own4();if(!o)return;rk+=o}var m=M();wrapRk(rk,KR).then(function(w){m.wr=w;m.rk4=SU.own?1:0;Mset(m);SU=null;shClose();toast(TR('Salvat'))})}
function exp(){var m=M(),j=JSON.stringify({notis_vault:1,vault:m},null,1),nm='notis-seif-'+new Date().toISOString().slice(0,10)+'.json',n=NN();try{if(n&&n.saveFile){n.saveFile(nm,j);return}}catch(_){}var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([j],{type:'application/json'}));a.download=nm;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},800)}
function wipe(){ask(TR('Ștergi seiful cu toate parolele?'),function(){setTimeout(function(){ask(TR('Sigur? Parolele nu mai pot fi recuperate.'),function(){try{var n=NN();n&&n.bioDel&&n.bioDel('vault')}catch(_){}try{localStorage.removeItem(PFX+'ns_vault');localStorage.removeItem(PFX+'ns_vault_bak')}catch(_){}try{phAll().then(function(a){a.forEach(function(r){if(/^pw:/.test(String(r.note)))phDel(r.id)})}).catch(function(){})}catch(_){}lock();toast(TR('Seiful a fost șters'));rer()})},60)})}
function catUn(){var c=catOf(cat),m=M();if(m.bio&&NN()&&NN().bioHas&&NN().bioHas('vault')){bio('cat');return}
 sh(TR('Categorie protejată'),P('pwO',TR('Parola principală'))+'<div class="pwerr"></div>',B('cun2',TR('Deblochează'),'pwbig'))}
function cun2(){var w=flWait();if(w){err(waitMsg(w));return}if(busy)return;busy=true;err(TR('Se verifică…'));unwrap($('pwO').value,M().wp).then(function(){flOk();busy=false;catOK[cat]=1;shClose();rer()},function(){flBad();busy=false;var w2=flWait();err(TR('Parolă greșită')+(w2?'. '+waitMsg(w2):''))})}
function goCat(d){if(!D)return;var V=D.cats.filter(function(c){return (!c.kind||xMode()==='complete')&&!xIdnHide(c)}),i=V.findIndex(function(c){return c.id===cat}),j=i+d;if(j<0||j>=V.length)return 'edge';cat=V[j].id;if(lmode()!=='session')catOK={};q='';rer();return true}
window.pwGoCat=goCat;
/* ---- v174: Parole stage 2 (complete mode): store cards, ID photos, bank cards, identity data. superClass = feature flag (on for everyone, no billing). ---- */
var superClass=true;
var XK=[['loy','Carduri magazin','🏷'],['doc','Poze acte','🪪'],['idn','Date identitate','👤'],['biz','Cărți de vizită','📇']];
function xMode(){return D&&D.mode==='complete'&&superClass?'complete':'simple'}
function xKindCat(c){if(c&&!c.kind&&xMode()!=='complete'&&xBizName(c))return 'biz';return c&&c.kind&&xMode()==='complete'?c.kind:''}
function xBizName(c){return !!c&&!c.kind&&(nFold(c.name)===nFold(TR('Cărți de vizită'))||nFold(c.name)===nFold('Cărți de vizită'))}
function xEnsure(){/* v176: a category the user already named 'Cărți de vizită' becomes the business-card category (same id, name, lock, items) — encrypted snapshot first */var bz=!D.cats.some(function(c){return c.kind==='biz'})&&D.cats.filter(function(c){return !c.kind&&(nFold(c.name)===nFold(TR('Cărți de vizită'))||nFold(c.name)===nFold('Cărți de vizită'))})[0];if(bz){try{if(!LS.get('ns_vault_premig176',null))LS.set('ns_vault_premig176',M())}catch(_){}bz.kind='biz';setTimeout(function(){save()},0)}
 XK.forEach(function(k){if(k[0]==='idn'||(D.kdel||[]).indexOf(k[0])>=0)return;if(!D.cats.some(function(c){return c.kind===k[0]}))D.cats.push({id:'k_'+k[0],name:TR(k[1]),lock:k[0]==='doc'?1:0,kind:k[0]})})}
/* versioned migration v1 -> v2: snapshot of the (still encrypted) vault first, nothing removed */
function xMig(){var v=D.v||1;if(v<2){try{if(!LS.get('ns_vault_premig174',null))LS.set('ns_vault_premig174',M())}catch(_){}D.v=2;if(D.mode!=='complete'&&D.mode!=='simple')D.mode=''}
 if(D.v<3){/* v175: bank-card category merged into 'Bancă' — snapshot first, then move the cards; nothing removed but the empty category */
  var kc=D.cats.filter(function(c){return c.kind==='card'});if(kc.length)try{if(!LS.get('ns_vault_premig175',null))LS.set('ns_vault_premig175',M())}catch(_){}
  if(kc.length||D.items.some(function(x){return x.t==='card'})){var bk=xBank(1);kc.forEach(function(c){if(c.lock)bk.lock=1;D.items.forEach(function(x){if(x.cat===c.id)x.cat=bk.id})});D.items.forEach(function(x){if(x.t==='card'&&!D.cats.some(function(c){return c.id===x.cat&&!c.kind}))x.cat=bk.id})}
  D.cats=D.cats.filter(function(c){return c.kind!=='card'});D.v=3;if(kc.length)save()}
 /* v177: 'Alte conturi' removed — snapshot first, entries move to 'Social media'; a lock on 'Alte conturi' carries over so nothing becomes less protected */
 var isS=function(c){return !c.kind&&(c.id==='soc'||nFold(c.name)===nFold('Social media'))},ch=0;
 if(D.v<4){var oc=D.cats.filter(function(c){return !c.kind&&!isS(c)&&(nFold(c.name)===nFold('Alte conturi')||nFold(c.name)===nFold(TR('Alte conturi')))});
  if(oc.length){try{if(!LS.get('ns_vault_premig177',null))LS.set('ns_vault_premig177',M())}catch(_){}var so=xSoc(1);
   oc.forEach(function(c){if(c.lock&&!so.lock)so.lock=1;D.items.forEach(function(x){if(x.cat===c.id)x.cat=so.id});if(cat===c.id)cat=so.id});D.cats=D.cats.filter(function(c){return oc.indexOf(c)<0});ch=1}D.v=4}
 /* entries without a (known) category go to Social media */
 if(D.items.some(function(x){return !D.cats.some(function(c){return c.id===x.cat})})){var s2=xSoc(1);D.items.forEach(function(x){if(!D.cats.some(function(c){return c.id===x.cat}))x.cat=s2.id});ch=1}
 if(ch)save()}
function xIsSoc(c){return !c.kind&&(c.id==='soc'||nFold(c.name)===nFold('Social media'))}
function xSoc(mk){var s=D.cats.filter(function(c){return !c.kind&&c.id==='soc'})[0]||D.cats.filter(function(c){return !c.kind&&(nFold(c.name)===nFold('Social media'))})[0]||D.cats.filter(function(c){return c.id==='soc'&&!c.kind})[0];if(!s&&mk){s={id:D.cats.some(function(c){return c.id==='soc'})?id():'soc',name:'Social media',lock:0};D.cats.unshift(s)}return s}
function xBank(mk){var b=D.cats.filter(function(c){return c.id==='bank'&&!c.kind})[0]||D.cats.filter(function(c){return !c.kind&&nFold(c.name)===nFold(TR('Bancă'))})[0];if(!b&&mk){b={id:'bank',name:TR('Bancă'),lock:0};var i=D.cats.findIndex(function(c){return c.kind});if(i<0)D.cats.push(b);else D.cats.splice(i,0,b)}return b}
function xSetMode(md){if(!D)return;D.mode=md==='complete'?'complete':'simple';if(D.mode==='complete')xEnsure();var c=catOf(cat);if(D.mode==='simple'&&c&&c.kind)cat=D.cats.filter(function(x){return !x.kind})[0].id;catOK={};shClose();save().then(rer)}
function xChooser(){return '<div class="pwvmode" id="pwVMode"><p class="pwmt">'+esc(TR('Cum vrei să folosești seiful?'))+'</p><button type="button" class="btn pwbig" data-m="simple">'+esc(TR('Simplu'))+'<small>'+esc(TR('Doar parole.'))+'</small></button><button type="button" class="btn pwbig" data-m="complete">'+esc(TR('Complet'))+'<small>'+esc(TR('Parole, carduri de magazin, poze acte, carduri bancare și date de identitate.'))+'</small></button><p class="pwhint pwsm">'+esc(TR('Poți schimba oricând din ⚙ Setări.'))+'</p></div>'}
/* ---- field sets ---- */
var XF={loy:[['name','Magazin'],['code','Număr card']],
 card:[['name','Bancă'],['holder','Titular'],['num','Număr card',1],['exp','Expiră (LL/AA)'],['cvv','CVV',1],['pin','PIN',1],['iban','IBAN',1],['note','Notă']],
 biz:[['name','Nume'],['firm','Firmă'],['tel','Telefon'],['mail','Email'],['note','Notă']],
 idn:[['name','Persoană'],['cnp','CNP',1],['ser','Serie'],['nr','Număr'],['valid','Valabil până la'],['addr','Adresă'],['iban','IBAN',1],['note','Notă']]};
document.addEventListener('input',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.pin){var v=t.value.replace(/\D/g,'').slice(0,8);if(v!==t.value)t.value=v}});
function xLast4(s){s=String(s||'').replace(/\s/g,'');return s?'•••• '+s.slice(-4):''}
function ordSort(arr,gid,cmp,cid){cid=cid||cat;var o=D&&D.ord&&D.ord[cid];if(!o||!o.length)return arr.sort(cmp);var ix={};o.forEach(function(k,i){ix[k]=i});return arr.sort(function(a,b){var ia=ix[gid(a)],ib=ix[gid(b)];if(ia!==undefined&&ib!==undefined)return ia-ib;if(ia!==undefined)return -1;if(ib!==undefined)return 1;return cmp(a,b)})}
function xList(kind){var it=ordSort(D.items.filter(function(x){return x.cat===cat}),function(x){return x.id},function(a,b){return nFold(a.name).localeCompare(nFold(b.name))});
 if(kind==='doc')return xTopN()+'<div class="pwdocs pwbnl" id="pwDocs"></div>';
 if(kind==='biz'||kind==='loy')return xPhL(it,kind);var R=reps();
 return '<div class="pwbnl">'+(it.length?it.map(function(x){return xEnt(x,R)}).join(''):'<p class="pwhint">'+esc(TR('Nimic aici încă.'))+'</p>')+'</div><button type="button" class="btn pwbig pwadd" data-pa="xnew">'+(kind==='idn'?'+ '+esc(TR('Adaugă date')):'+ '+esc(TR('Adaugă')))+'</button>'}
/* v177: photo-first list for Carduri magazin / Poze acte / Cărți de vizită — top: Cameră, Galerie, 🗑; list shows only the photo; tap front = back + actions */
var TRM='',XO={},XOT={id:'',t:0},XCR=null;
/* v229: Premium (Free = minimal fields) + brand icons + compact entry rows for every Parole section.
   Premium = Super Class activation code (ns_super, "Ai un cod?" in Setări / shared-access link) or the creator's phone (Meniu creator set up: ns_crsec). No billing exists in Notis. Data entered under Premium is never removed when Free: it stays stored and readable, only creating/editing the extra fields needs Premium. */
function pwPrem(){try{var q=JSON.parse(localStorage.getItem('ns_super')||'null');if(q&&(!q.exp||q.exp>Date.now()))return true}catch(_){}try{return !!localStorage.getItem('ns_crsec')}catch(_){return false}}
var PIK=[['whatsapp',/whatsapp|wa\.me/],['facebook',/facebook|fb\.com|fb\.me|messenger/],['instagram',/instagram/],['tiktok',/tiktok/],['x',/(^|[^a-z0-9])x\.com|twitter/],['youtube',/youtube|youtu\.be/],['linkedin',/linkedin/],['telegram',/telegram|(^|[^a-z])t\.me/],['snapchat',/snapchat/],['pinterest',/pinterest/],['reddit',/reddit/],['discord',/discord/],['threads',/threads/],['twitch',/twitch/],['github',/github/],['spotify',/spotify/],['netflix',/netflix/],['steam',/steam/],['signal',/^signal/],['viber',/viber/],['wechat',/wechat/],['vk',/vk\.com|vkontakte|^vk$/],['gmail',/gmail|googlemail/],['outlook',/outlook|hotmail|live\.com|msn\./],['yahoo',/yahoo|ymail/],['icloud',/icloud|(^|[^a-z])me\.com/],['proton',/proton/],['aol',/(^|[^a-z])aol(\.|$|[^a-z])/],['gmx',/gmx/],['paypal',/paypal/],['google',/google/],['apple',/apple/]];
function icAuto(x){var nm=String(x.name||'').trim().toLowerCase();if(nm==='x')return 'x';var t=nm+' '+String(x.lnk||'').toLowerCase()+(x.cat==='mail'?' '+String(x.user||'').toLowerCase():'');for(var i=0;i<PIK.length;i++)if(window.PW_ICONS&&PW_ICONS[PIK[i][0]]&&PIK[i][1].test(t))return PIK[i][0];return ''}
function icOf(x){var k=x.ic;if(k==='none')return '';if(k&&window.PW_ICONS&&PW_ICONS[k])return k;return pwPrem()?icAuto(x):''}
function icSvg(k){var o=window.PW_ICONS&&PW_ICONS[k];if(!o)return '';return '<i class="pwic" aria-hidden="true">'+(o.p?'<svg viewBox="0 0 24 24" focusable="false"><path fill="'+o.c+'" d="'+o.p+'"/></svg>':'<b style="color:'+o.c+'">'+esc(o.l)+'</b>')+'</i>'}
function xEKind(x){var c=catOf(x.cat);return x.cat==='mail'?'mail':(c&&xIsSoc(c))?'soc':'gen'}
function xLink(u){u=String(u||'').trim();if(!u)return '';if(!/^[a-z][a-z0-9+.-]*:/i.test(u))u='https://'+u;return /^https?:\/\/[^\s]+$/i.test(u)?u:''}
function xDet(x){var d=[],k=xEKind(x),t=x.t&&x.t!=='acct'?x.t:'acct';
 if(t==='acct'){if(x.em)d.push(['em',TR('Adresa de email'),0]);if(x.user)d.push(['user',TR(k==='mail'?'Adresa de email':k==='soc'?'Nume utilizator':'Utilizator / email'),0]);if(x.pw)d.push(['pw',TR('Parolă'),1]);if(x.note)d.push(['note',TR('Notă'),0,1])}
 else if(XF[t])XF[t].forEach(function(f){if(f[0]==='name'||f[0]==='ph')return;if(x[f[0]])d.push([f[0],TR(f[1]),f[2]?1:0,f[0]==='note'?1:0])});
 return d}
function xEnt(x,R){R=R||{};if((x.t==='biz'||x.t==='loy')&&x.ph)return xNRow(x.id,xBizLab(x),x.ph,'',x.t,x);
 var o=!!XO[x.id],ik=icOf(x),w=(!x.t||x.t==='acct')&&!x.part&&x.pw&&str(x.pw).l===1,lb=x.t==='card'?x.name:xBizLab(x)||x.name;
 return '<div class="pwbn pwen'+(x.t==='card'?' pwcard':'')+(o?' open':'')+'" data-eid="'+esc(x.id)+'"><div class="pwbh">'+(ik?icSvg(ik):'')+'<span class="pwbl'+(o?' on':'')+'">'+esc(lb||TR('Fără nume'))+'</span>'+(w?'<i class="pwfw" title="'+esc(TR('Slabă'))+'">⚠</i>':'')+(R[x.id]?'<i class="pwfr" title="'+esc(TR('Repetată'))+'">⟳</i>':'')+'</div>'+(o?xEBody(x):'')+'</div>'}
function xEBody(x){var h='<div class="pwed">',ik=icOf(x),lk=xLink(x.lnk);
 if(x.cv)h+='<div class="pwpf pwcov" data-pr="'+esc(x.cv)+'"></div>';
 if(x.lnk)h+='<div class="pwdr">'+(ik?icSvg(ik):'')+(lk?'<a class="pwdv pwlk2" href="'+esc(lk)+'" target="_blank" rel="noopener noreferrer">'+esc(lk.replace(/^https?:\/\/(www\.)?/i,'').replace(/\/$/,''))+'</a>':'<span class="pwdv">'+esc(x.lnk)+'</span>')+'</div>';
 xDet(x).forEach(function(r){h+='<div class="pwdr" data-k="'+r[0]+'"><span class="pwdl">'+esc(r[1])+'</span><span class="pwdv'+(r[3]?' pwnote':'')+'">'+(r[2]?'••••••••':esc(x[r[0]]))+'</span>'+(r[2]?'<button type="button" class="pwcp" data-pa="drv" aria-label="'+esc(TR('Arată'))+'">👁</button>':'')+(r[3]?'':'<button type="button" class="pwcp" data-pa="dcp" aria-label="'+esc(TR('Copiază'))+'">📋</button>')+'</div>'});
 return h+'<div class="pwpt"><button type="button" class="btn" data-pa="eed" aria-label="'+esc(TR('Editează'))+'">✏️</button>'+(x.t==='loy'&&x.code?'<button type="button" class="btn" data-pa="eshow" aria-label="'+esc(TR('Arată la casă'))+'">▦</button>':'')+'<button type="button" class="btn" data-pa="esh" aria-label="Share">'+SH_SVG+'</button><button type="button" class="btn" data-pa="edl" aria-label="'+esc(TR('Șterge'))+'">🗑</button></div></div>'}
/* v230: 📤 Trimite — every opened Parole entry. Photos (cărți de vizită, carduri magazin, poze acte) go as an image file (native share sheet via NotisNative.shareImage, else Web Share with files, else download); text entries as text (NotisNative.shareTextChooser, else Web Share, else copied). Secret fields (password, CVV, IBAN, CNP…) are left out unless the user picks "Cu parolă" and re-confirms with the master password (or fingerprint). */
var SHX=null;
function xShHas(x){return xDet(x).some(function(r){return r[2]})}
function xShTxt(x,sec){var L=[xBizLab(x)||x.name||''];if(x.lnk)L.push(TR('Link cont')+': '+x.lnk);xDet(x).forEach(function(r){if(r[2]&&!sec)return;L.push(r[1]+': '+String(x[r[0]]||'')+(r[0]==='pw'&&x.part?'….?':''))});return L.filter(Boolean).join('\n')}
function xJpeg(b){if(b.type==='image/jpeg')return Promise.resolve(b);return new Promise(function(ok){var u=URL.createObjectURL(b),im=new Image();im.onload=function(){var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);URL.revokeObjectURL(u);c.toBlob(function(x){ok(x||b)},'image/jpeg',0.92)};im.onerror=function(){URL.revokeObjectURL(u);ok(b)};im.src=u})}
function xShFail(){toast(TR('Telefonul nu poate trimite'))}
function xShText(text,title,sec){var N=window.NotisNative;try{if(N&&N.shareTextChooser&&N.shareTextChooser(text,title)!==false)return}catch(_){}
 if(navigator.share){navigator.share({title:title,text:text}).catch(function(e){if(!e||e.name!=='AbortError'){clip(text,sec);toast(TR('Copiat.'))}});return}
 clip(text,sec);toast(TR('Copiat.')+(sec?' '+TR('Se șterge din clipboard în')+' '+(D.clip||30)+' s':''))}
function xShImg(rid,title,text){if(!rid){xShFail();return}xGet(rid).then(function(r){return r&&xOpen(r)}).then(function(u){if(!u)throw 0;return fetch(u).then(function(x){return x.blob()})}).then(xJpeg).then(function(b){var N=window.NotisNative,nm=(String(title||'').replace(/[^\w .-]+/g,'_').trim()||'Notis')+'.jpg';
  if(N&&N.shareImage)return b.arrayBuffer().then(function(buf){var ok=false;try{ok=N.shareImage(phAb2b64(buf),title||'',text||'')}catch(_){}if(!ok)xShFail()});
  var f=new File([b],nm,{type:'image/jpeg'}),d={files:[f],title:title||''};if(text)d.text=text;
  try{if(navigator.canShare&&navigator.canShare(d))return navigator.share(d).catch(function(e){if(!e||e.name!=='AbortError')xShFail()})}catch(_){}
  var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=nm;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},800)}).catch(function(){xShFail()})}
function xShRun(x,sec){if(!x||!D)return;var t=xBizLab(x)||x.name||'';if((x.t==='biz'||x.t==='loy')&&x.ph){xShImg(x.ph,t,x.t==='loy'?xShTxt(x,0):'');return}xShText(xShTxt(x,sec),t,sec)}
function xShEnt(x){if(!x)return;if(!xShHas(x)){xShRun(x,0);return}
 nShSheet(TR('Includ și datele secrete (parolă, CVV, IBAN)?'),[{t:TR('Fără parolă'),f:function(){xShRun(x,0)}},{t:TR('Cu parolă'),f:function(){xShAuth(x)}}])}
function xShAuth(x){SHX=x;var m=M(),bo=m.bio&&NN()&&NN().bioHas&&NN().bioHas('vault');sh('Share','<p class="pwhint">'+esc(TR('Confirmă cu parola principală pentru a include datele secrete.'))+'</p>'+P('pwO',TR('Parola principală'))+'<div class="pwerr"></div>',B('shw2',TR('Continuă'),'pwbig')+(bo?B('shwb','☝ '+TR('Amprentă')):''))}
function xShAuth2(){var w=flWait();if(w){err(waitMsg(w));return}if(busy)return;busy=true;err(TR('Se verifică…'));unwrap($('pwO').value,M().wp).then(function(){flOk();busy=false;var x=SHX;SHX=null;shClose();xShRun(x,1)},function(){flBad();busy=false;var w2=flWait();err(TR('Parolă greșită')+(w2?'. '+waitMsg(w2):''))})}
function enTap(en){var p=en.dataset.eid,was=XO[p];XO={};if(!was)XO[p]=1;rer()}
function enOf(e){var r=e.target.closest('.pwen');return r&&xIt(r.dataset.eid)}
/* v228: Cărți de vizită + Poze acte = list of one-line names; tap a name → the photo opens (front only); tap the photo → back to the name. Names are only labels: the old fields (firm, tel, mail, note, back photo) stay stored untouched. Document names live in D.dn {photoId:name}. */
function xTopN(){return '<div class="pwtop"><button type="button" class="btn pwbig" data-pa="pcam">📷 '+esc(TR('Cameră'))+'</button><button type="button" class="btn pwbig" data-pa="pgal">🖼 '+esc(TR('Galerie'))+'</button></div>'}
function xNRow(pid,lb,f,b,kind,x){var o=!!XO[pid],loy=kind==='loy'&&x;return '<div class="pwbn'+(o?' open':'')+'" data-bid="'+esc(pid)+'" data-bk="'+kind+'">'+(o&&f?'<div class="pwpf" data-pr="'+esc(f)+'"></div>'+(b&&kind==='doc'?'<div class="pwpf pwpb" data-pr="'+esc(b)+'"></div>':'')+(loy&&x.code?'<div class="pwdr pwdr1"><span class="pwdl">'+esc(TR('Număr card'))+'</span><span class="pwdv">'+esc(x.code)+'</span></div>':'')+'<div class="pwpt"><button type="button" class="btn" data-pa="nren" aria-label="'+esc(TR(loy?'Editează':'Redenumește'))+'">✏️</button><button type="button" class="btn" data-pa="nadj" aria-label="'+esc(TR('Ajustează'))+'">✂️</button><button type="button" class="btn" data-pa="nzm" aria-label="'+esc(TR('Mărește'))+'">🔍</button>'+(loy&&x.code?'<button type="button" class="btn" data-pa="nshow" aria-label="'+esc(TR('Arată la casă'))+'">▦</button>':'')+'<button type="button" class="btn" data-pa="nsh" aria-label="Share">'+SH_SVG+'</button><button type="button" class="btn" data-pa="ndel" aria-label="'+esc(TR('Șterge'))+'">🗑</button></div>':'<div class="pwbh"><span class="pwbl'+(lb?'':' pwbe')+'">'+esc(lb||TR('Fără nume'))+'</span></div>')+'</div>'}
function xBizLab(x){return x.name||x.firm||x.tel||x.mail||String(x.note||'').split('\n')[0]||x.code||''}
function xPhL(it,kind){var R=reps(),a=ordSort(it.slice(),function(x){return x.id},function(p,q){var l1=xBizLab(p),l2=xBizLab(q);if(!l1!==!l2)return l1?-1:1;return l1?nFold(l1).localeCompare(nFold(l2)):(p.ts||0)-(q.ts||0)});
 return xTopN()+'<div class="pwbnl">'+(a.length?a.map(function(x){return xEnt(x,R)}).join(''):'<p class="pwhint">'+esc(TR('Nimic aici încă.'))+'</p>')+'</div>'+(kind==='loy'?'<button type="button" class="btn pwbig pwadd" data-pa="xnew">+ '+esc(TR('Adaugă card'))+'</button>':'')}
function xNRef(kind){if(kind!=='doc')rer();else xDocs()}
function xNPrompt(kind,pid){setTimeout(function(){jvPrompt(TR('Nume'),'',function(v){if(!K||!D)return;if(kind!=='doc'){var x=xIt(pid);if(!x)return;x.name=v;x.mod=Date.now()}else{D.dn=D.dn||{};D.dn[pid]=v}save().then(function(){xNRef(kind)})})},80)}
/* add: photo → automatic crop (corners found: saved straight away, bar "✂ Decupat automat · Original · Ajustează") or the manual crop editor (drag corners) when nothing is found → ask the name */
function xAddN(kind,cap){xFile(cap,function(l){var f=l[0];if(!f||typeof cropEdit!=='function')return;var c0=null,auto=false;
 phCompress(f).then(function(c){c0=c;return xCrop(c0).catch(function(){return null})}).then(function(a){if(a){auto=true;return a}window.__cropCard=1;return cropEdit(c0,1,1)}).then(function(b){window.__cropCard=0;if(!b||!K||!D)return;
  return xPut(b,'pw:'+kind).then(function(rid){if(!K||!D)return phDel(rid);var n=Date.now(),pid=rid;if(kind!=='doc'){pid=id();D.items.push({id:pid,t:kind,cat:cat,name:'',ph:rid,ts:n,mod:n})}else{D.dn=D.dn||{};D.dn[rid]=''}
   if(auto){XCR={rid:rid,b:c0};xCropBar()}
   return save().then(function(){xNRef(kind);xNPrompt(kind,pid)})})}).catch(function(){window.__cropCard=0;toast(TR('Nu am putut adăuga poza'))})})}
function nbOf(e){var r=e.target.closest('.pwbn');return r&&{pid:r.dataset.bid,kind:r.dataset.bk,el:r}}
function nbTap(r){var p=r.dataset.bid,was=XO[p];XO={};if(!was)XO[p]=1;xNRef(r.dataset.bk)}
function xTop(){return '<div class="pwtop"><button type="button" class="btn pwbig" data-pa="pcam">📷 '+esc(TR('Cameră'))+'</button><button type="button" class="btn pwbig" data-pa="pgal">🖼 '+esc(TR('Galerie'))+'</button><button type="button" class="btn pwbig'+(TRM===cat?' on':'')+'" data-pa="ptr" aria-pressed="'+(TRM===cat)+'" aria-label="'+esc(TR('Șterge'))+'">🗑</button></div>'+(TRM===cat?'<p class="pwhint pwsm" id="pwTrH">'+esc(TR('Atinge ce vrei să ștergi.'))+'</p>':'')}
function xCard(pid,f,b,code,doc){var o=!!XO[pid]&&TRM!==cat;return '<div class="pwpc'+(doc?' pwdoc':'')+(o?' open':'')+'" data-pid="'+esc(pid)+'"'+(doc?' data-did="'+esc(pid)+'"':'')+'><div class="pwpf" data-pr="'+esc(f)+'"></div>'+(code&&TRM!==cat?'<button type="button" class="pwpx" data-pa="pexp" aria-label="'+esc(TR('Spate (opțional)'))+'"><i class="sparr sp19'+(o?' on':'')+'" aria-hidden="true"></i></button>':'')+
 (o?(b?'<div class="pwpf pwpb" data-pr="'+esc(b)+'"></div>':'')+'<div class="pwpt"><button type="button" class="btn" data-pa="pzm" aria-label="'+esc(TR('Mărește'))+'">🔍</button>'+(b?'<button type="button" class="btn" data-pa="pbd" aria-label="'+esc(TR('Ștergi această poză?'))+'">🗑 '+esc(TR('Spate (opțional)').replace(/\s*\(.*\)\s*/,''))+'</button>':'<button type="button" class="btn" data-pa="pbc">📷 '+esc(TR('Adaugă spate'))+'</button><button type="button" class="btn" data-pa="pbg" aria-label="'+esc(TR('Galerie'))+'">🖼</button>')+(doc?'':'<button type="button" class="btn" data-pa="pedit" aria-label="'+esc(TR('Editează'))+'">✏️</button>')+(code?'<button type="button" class="btn" data-pa="pcode" aria-label="'+esc(TR('Arată la casă'))+'">▦</button>':'')+'</div>':'')+'</div>'}
function xPLfill(){if(!K)return;document.querySelectorAll('#spView [data-pr]').forEach(function(el){if(el.firstChild)return;var rid=el.dataset.pr;xGet(rid).then(function(r){if(!r)return;return xOpen(r).then(function(u){if(el.firstChild)return;var im=new Image();im.src=u;im.alt='';im.draggable=false;el.appendChild(im)})}).catch(function(){})})}
function xIt(pid){return D&&D.items.filter(function(y){return y.id===pid})[0]}
function pcOf(e){var c=e.target.closest('.pwpc');return c&&c.dataset.pid}
function xDocDel(fid){phOf('pw:docb:'+fid,1).then(function(a){return Promise.all(a.map(function(r){return phDel(r.id)}))}).then(function(){return phDel(fid)}).then(function(){try{URL.revokeObjectURL(XU[fid])}catch(_){}delete XU[fid];delete XO[fid];if(D&&D.dn&&fid in D.dn){delete D.dn[fid];save()}xDocs()}).catch(function(){})}
function pcTap(el,e){var pid=el.dataset.pid,doc=el.classList.contains('pwdoc'),x=doc?null:xIt(pid);if(!doc&&!x)return;
 if(TRM===cat){if(doc)ask(TR('Ștergi această poză?'),function(){xDocDel(pid)});else{openId=x.id;delE()}return}
 var im=e.target.closest('[data-pr]'),now=Date.now(),dbl=XOT.id===pid&&now-XOT.t<350;XOT={id:pid,t:dbl?0:now};
 if(dbl){if(!(x&&x.code)){if(XO[pid])delete XO[pid];else XO[pid]=1;(doc?xDocs():rer())}var rid=im&&im.dataset.pr;if(rid&&XU[rid])xZoom(rid,1);return}
 if(x&&x.t==='loy'&&x.code){xShow(x);return}
 if(XO[pid])delete XO[pid];else XO[pid]=1;(doc?xDocs():rer())}
function xAddPh(kind,l){var f=l[0];if(!f)return;xPutC(f,'pw:'+kind).then(function(rid){if(!K||!D)return phDel(rid);var n=Date.now();D.items.push({id:id(),t:kind,cat:cat,name:'',ph:rid,ts:n,mod:n});return save().then(rer)}).catch(function(){toast(TR('Nu am putut adăuga poza'))})}
function xAddBack(pid,cap){var x=xIt(pid);xFile(cap,function(l){if(!l[0])return;xPutC(l[0],x?'pw:'+x.t:'pw:docb:'+pid).then(function(rid){if(!K)return;if(x){if(x.ph2)phDel(x.ph2).catch(function(){});x.ph2=rid;x.mod=Date.now();XO[pid]=1;return save().then(rer)}XO[pid]=1;xDocs()}).catch(function(){toast(TR('Nu am putut adăuga poza'))})})}
function xPutB(b,note){return b.arrayBuffer().then(function(buf){if(!K)throw new Error('locked');return xSeal(buf)}).then(function(o){var r={id:'pw'+id(),note:note,ts:Date.now(),iv:o.iv,buf:o.buf};return phPut(r).then(function(){return r.id})})}
function xPutC(file,note){return phCompress(file).then(function(b){return xCrop(b).catch(function(){return null}).then(function(c){return xPutB(c||b,note).then(function(rid){if(c){XCR={rid:rid,b:b};xCropBar()}return rid})})})}
function xCropBar(){var o=$('pwCrop');if(o)o.remove();clearTimeout(xCropBar.t);var z=document.createElement('div');z.id='pwCrop';z.className='pwcrop';z.innerHTML='<span>✂ '+esc(TR('Decupat automat'))+'</span><button type="button" data-co="1">'+esc(TR('Original'))+'</button><button type="button" data-co="2">'+esc(TR('Ajustează'))+'</button>';document.body.appendChild(z);
 z.addEventListener('click',function(e){var b=e.target.closest('[data-co]');if(!b)return;if(b.dataset.co==='2')xCropAdj();else xCropUndo()});xCropBar.t=setTimeout(xCropX,12000)}
function xCropX(){var o=$('pwCrop');if(o)o.remove();XCR=null}
function xCropSwap(rid,blob){return xGet(rid).then(function(r){if(!r)return;return blob.arrayBuffer().then(xSeal).then(function(o){r.iv=o.iv;r.buf=o.buf;return phPut(r)}).then(function(){try{URL.revokeObjectURL(XU[rid])}catch(_){}delete XU[rid];document.querySelectorAll('[data-pr="'+rid+'"]').forEach(function(el){el.innerHTML=''});xPLfill();if(XB)['f','b'].forEach(function(sd){if(XB[sd]===rid)xBzT(sd)});if(XPH===rid)xThumb(rid)})}).catch(function(){})}
function xCropUndo(){var c=XCR;xCropX();if(!c||!K)return;xCropSwap(c.rid,c.b)}
function xCropAdj(){var c=XCR;xCropX();if(!c||!K)return;window.__cropCard=0;cropEdit(c.b,1,1).then(function(b){if(b&&K)return xCropSwap(c.rid,b)})}
/* auto-crop: card/document detection on a downscaled copy (background = border colour, largest foreground blob, holes filled, 4 extreme corners, strict checks); perspective-corrected at full size. Unsure -> null -> original kept. */
function xQuad(d,w,h){var n=w*h,i,x,y,bs=Math.max(2,Math.round(Math.min(w,h)*0.03)),sr=0,sg=0,sb=0,c=0,isB=function(x,y){return x<bs||y<bs||x>=w-bs||y>=h-bs};
 for(y=0;y<h;y++)for(x=0;x<w;x++)if(isB(x,y)){i=(y*w+x)*4;sr+=d[i];sg+=d[i+1];sb+=d[i+2];c++}sr/=c;sg/=c;sb/=c;
 var dist=new Float32Array(n),sd=0;for(i=0;i<n;i++){var dr=d[i*4]-sr,dg=d[i*4+1]-sg,db=d[i*4+2]-sb;dist[i]=Math.sqrt(dr*dr+dg*dg+db*db)}
 for(y=0;y<h;y++)for(x=0;x<w;x++)if(isB(x,y))sd+=dist[y*w+x]*dist[y*w+x];sd=Math.sqrt(sd/c);var T=Math.max(20,sd*3+10);
 var fg=new Uint8Array(n);for(i=0;i<n;i++)fg[i]=dist[i]>T?1:0;
 var er=new Uint8Array(n);for(y=1;y<h-1;y++)for(x=1;x<w-1;x++){i=y*w+x;er[i]=fg[i]&&fg[i-1]&&fg[i+1]&&fg[i-w]&&fg[i+w]?1:0}
 for(y=1;y<h-1;y++)for(x=1;x<w-1;x++){i=y*w+x;fg[i]=er[i]||er[i-1]||er[i+1]||er[i-w]||er[i+w]?1:0}
 var lab=new Int32Array(n),best=0,bn=0,L=0,st=new Int32Array(n);for(i=0;i<n;i++)if(fg[i]&&!lab[i]){L++;var sp=0,cnt=0;st[sp++]=i;lab[i]=L;while(sp){var p=st[--sp];cnt++;var px=p%w;
  if(px>0&&fg[p-1]&&!lab[p-1]){lab[p-1]=L;st[sp++]=p-1}if(px<w-1&&fg[p+1]&&!lab[p+1]){lab[p+1]=L;st[sp++]=p+1}if(p>=w&&fg[p-w]&&!lab[p-w]){lab[p-w]=L;st[sp++]=p-w}if(p<n-w&&fg[p+w]&&!lab[p+w]){lab[p+w]=L;st[sp++]=p+w}}if(cnt>bn){bn=cnt;best=L}}
 if(!best||bn<n*0.08)return null;
 var out=new Uint8Array(n),sp2=0;for(y=0;y<h;y++)for(x=0;x<w;x++)if((x===0||y===0||x===w-1||y===h-1)){i=y*w+x;if(lab[i]!==best&&!out[i]){out[i]=1;st[sp2++]=i}}
 while(sp2){var q=st[--sp2],qx=q%w,nb=[qx>0?q-1:-1,qx<w-1?q+1:-1,q>=w?q-w:-1,q<n-w?q+w:-1];for(var k=0;k<4;k++){var r=nb[k];if(r>=0&&!out[r]&&lab[r]!==best){out[r]=1;st[sp2++]=r}}}
 var N=0,a1=1e9,a2=-1e9,b1=1e9,b2=-1e9,TL,BR,TR,BL;for(y=0;y<h;y++)for(x=0;x<w;x++){if(out[y*w+x])continue;N++;var s1=x+y,s2=x-y;if(s1<a1){a1=s1;TL=[x,y]}if(s1>a2){a2=s1;BR=[x+1,y+1]}if(s2>b2){b2=s2;TR=[x+1,y]}if(s2<b1){b1=s2;BL=[x,y+1]}}
 if(N>n*0.93)return null;var Q=[TL,TR,BR,BL],A=0;for(k=0;k<4;k++){var P0=Q[k],P1=Q[(k+1)%4];A+=P0[0]*P1[1]-P1[0]*P0[1]}A=Math.abs(A)/2;
 if(A<n*0.1||A>n*0.92||N/A<0.9||N/A>1.08)return null;
 var inside=function(px,py){var sg0=0;for(var k=0;k<4;k++){var P0=Q[k],P1=Q[(k+1)%4],cr=(P1[0]-P0[0])*(py-P0[1])-(P1[1]-P0[1])*(px-P0[0]);if(cr<-1.5*Math.hypot(P1[0]-P0[0],P1[1]-P0[1]))return false}return true},inN=0;
 for(y=0;y<h;y++)for(x=0;x<w;x++)if(!out[y*w+x]&&inside(x+.5,y+.5))inN++;if(inN/N<0.97)return null;
 for(k=0;k<4;k++){var Pa=Q[(k+3)%4],Pb=Q[k],Pc=Q[(k+1)%4],v1=[Pa[0]-Pb[0],Pa[1]-Pb[1]],v2=[Pc[0]-Pb[0],Pc[1]-Pb[1]],l1=Math.hypot(v1[0],v1[1]),l2=Math.hypot(v2[0],v2[1]);if(l1<Math.min(w,h)*0.2||l2<Math.min(w,h)*0.2)return null;var an=Math.acos(Math.max(-1,Math.min(1,(v1[0]*v2[0]+v1[1]*v2[1])/(l1*l2))))*180/Math.PI;if(an<65||an>115)return null}
 return Q}
function xWarp(src,W,H,Q){var sw=src.width,sh=src.height,sd=src.data,x0=Q[0][0],y0=Q[0][1],x1=Q[1][0],y1=Q[1][1],x2=Q[2][0],y2=Q[2][1],x3=Q[3][0],y3=Q[3][1],a,b,c,d,e,f,g,hh;
 var dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;if(Math.abs(dx3)<1e-9&&Math.abs(dy3)<1e-9){a=x1-x0;b=x3-x0;c=x0;d=y1-y0;e=y3-y0;f=y0;g=hh=0}else{var den=dx1*dy2-dx2*dy1;g=(dx3*dy2-dx2*dy3)/den;hh=(dx1*dy3-dx3*dy1)/den;a=x1-x0+g*x1;b=x3-x0+hh*x3;c=x0;d=y1-y0+g*y1;e=y3-y0+hh*y3;f=y0}
 var o=new ImageData(W,H),od=o.data;for(var Y=0;Y<H;Y++){var v=(Y+.5)/H;for(var X=0;X<W;X++){var u=(X+.5)/W,z=g*u+hh*v+1,sx=(a*u+b*v+c)/z-.5,sy=(d*u+e*v+f)/z-.5;if(sx<0)sx=0;if(sy<0)sy=0;if(sx>sw-1)sx=sw-1;if(sy>sh-1)sy=sh-1;
  var ix=sx|0,iy=sy|0,fx=sx-ix,fy=sy-iy,ix1=Math.min(ix+1,sw-1),iy1=Math.min(iy+1,sh-1),p00=(iy*sw+ix)*4,p10=(iy*sw+ix1)*4,p01=(iy1*sw+ix)*4,p11=(iy1*sw+ix1)*4,q=(Y*W+X)*4;
  for(var ch=0;ch<3;ch++)od[q+ch]=(sd[p00+ch]*(1-fx)+sd[p10+ch]*fx)*(1-fy)+(sd[p01+ch]*(1-fx)+sd[p11+ch]*fx)*fy;od[q+3]=255}}return o}
/* v226: the new edge detector (js/cardq.js) goes first; the old colour-blob detector stays as a second chance */
function xCrop(blob){if(!window.cardCrop)return xCrop0(blob);return cardCrop(blob).catch(function(){return null}).then(function(b){return b||xCrop0(blob)})}
function xCrop0(blob){return new Promise(function(res){var u=URL.createObjectURL(blob),im=new Image();im.onerror=function(){URL.revokeObjectURL(u);res(null)};im.onload=function(){URL.revokeObjectURL(u);try{
  var w=im.naturalWidth,h=im.naturalHeight,s=Math.min(1,320/Math.max(w,h)),sw=Math.max(1,Math.round(w*s)),shh=Math.max(1,Math.round(h*s)),cv=document.createElement('canvas');cv.width=sw;cv.height=shh;var cx=cv.getContext('2d');cx.drawImage(im,0,0,sw,shh);
  var Q=xQuad(cx.getImageData(0,0,sw,shh).data,sw,shh);if(!Q)return res(null);var k=w/sw,mx=(Q[0][0]+Q[1][0]+Q[2][0]+Q[3][0])/4,my=(Q[0][1]+Q[1][1]+Q[2][1]+Q[3][1])/4;
  Q=Q.map(function(p){return[Math.max(0,Math.min(w,(mx+(p[0]-mx)*1.015)*k)),Math.max(0,Math.min(h,(my+(p[1]-my)*1.015)*k))]});
  var W=Math.max(Math.hypot(Q[1][0]-Q[0][0],Q[1][1]-Q[0][1]),Math.hypot(Q[2][0]-Q[3][0],Q[2][1]-Q[3][1])),H=Math.max(Math.hypot(Q[3][0]-Q[0][0],Q[3][1]-Q[0][1]),Math.hypot(Q[2][0]-Q[1][0],Q[2][1]-Q[1][1])),sc=Math.min(1,1600/Math.max(W,H));W=Math.round(W*sc);H=Math.round(H*sc);
  var fc=document.createElement('canvas');fc.width=w;fc.height=h;var fx=fc.getContext('2d');fx.drawImage(im,0,0);var o=xWarp(fx.getImageData(0,0,w,h),W,H,Q),oc=document.createElement('canvas');oc.width=W;oc.height=H;oc.getContext('2d').putImageData(o,0,0);
  oc.toBlob(function(b){res(b||null)},'image/jpeg',0.85)}catch(_){res(null)}};im.src=u})}
try{window.pwDbg.quad=function(cv){return xQuad(cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height)};window.pwDbg.crop=function(b){return xCrop(b)};window.pwDbg.save=function(){return save()};window.pwDbg.rer=function(){rer()}}catch(_){}
/* ---- editor for the new item types ---- */
var XE=null,XPH=null,XB=null,XBT=[];
function xEdit(x,kind){kind=kind||(x&&x.t);var nw=!x;x=x||{id:'',t:kind,cat:cat};XE=x;XPH=x.ph||null;openId=x.id;
 var b=XF[kind].map(function(f,i){var fid='pwX'+i,v=x[f[0]]||'';var inp=f[2]?P(fid,TR(f[1]),v):'<input type="text" id="'+fid+'" class="pwin" autocomplete="off" data-lpignore="true" placeholder="'+esc(TR(f[1]))+'" value="'+esc(v)+'">';
  if(kind==='card'&&f[0]==='pin')inp=inp.replace('<input ','<input inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" data-pin="1" ');/* v233: card PIN — digits only, up to 8, masked like CVV */
  return '<label class="pwl">'+esc(TR(f[1]))+'</label><div class="pwxr">'+inp+(nw||!v?'':'<button type="button" class="pwcp" data-pa="xcp" data-f="'+i+'" aria-label="'+esc(TR('Copiază'))+'">📋</button>')+'</div>'}).join('');
 if(kind==='loy'){b+='<div class="pwrow2"><button type="button" class="btn" data-pa="lscan">📷 '+esc(TR('Scanează'))+'</button><button type="button" class="btn" data-pa="lgal">🖼 '+esc(TR('Din galerie'))+'</button></div><div id="pwXm" class="pwerr"></div>'+
  '<label class="pwl">'+esc(TR('Tip cod'))+'</label><div class="pwseg" id="pwFmt">'+[['bar','Cod de bare'],['qr','QR']].map(function(o){return '<button type="button" class="'+((x.fmt==='qr_code'?'qr':'bar')===o[0]?'on':'')+'" data-f="'+o[0]+'">'+esc(TR(o[1]))+'</button>'}).join('')+'</div>'+
  '<label class="pwl">'+esc(TR('Poză card (opțional)'))+'</label><div id="pwXph" class="pwxph"></div><button type="button" class="btn" data-pa="lph">📷 '+esc(TR('Poză card'))+'</button>'}
 if(kind==='biz'){XB={f:x.ph||null,b:x.ph2||null};b='<div class="pwbzr">'+[['f','Față'],['b','Spate (opțional)']].map(function(o){return '<div class="pwbzs" data-side="'+o[0]+'"><label class="pwl">'+esc(TR(o[1]))+'</label><div class="pwbzt" id="pwBz'+o[0]+'" data-pa="bzv">📇</div><div class="pwbzb"><button type="button" class="btn" data-pa="bzc" aria-label="'+esc(TR('Cameră'))+'">📷</button><button type="button" class="btn" data-pa="bzg" aria-label="'+esc(TR('Galerie'))+'">🖼</button><button type="button" class="btn" data-pa="bzd" aria-label="'+esc(TR('Șterge'))+'">🗑</button></div></div>'}).join('')+'</div>'+b}
 sh(TR(kind==='card'?'Bancă':XK.filter(function(k){return k[0]===kind})[0][1]),b,(nw?'':B('del',TR('Șterge'),'dngb'))+B('xsave',TR('Salvează'),'pwbig'));if(kind==='card')$('pwSheet').classList.add('pwbank');if(kind==='loy'&&XPH)xThumb(XPH);if(kind==='biz'){xBzT('f');xBzT('b')}}
function xSave(){var x=XE;if(!x||!D)return;var nw=!x.id;XF[x.t].forEach(function(f,i){var e=$('pwX'+i);if(e)x[f[0]]=f[0]==='pin'&&x.t==='card'?e.value.replace(/\D/g,'').slice(0,8):e.value.trim()});
 if(x.t==='loy'){var s=document.querySelector('#pwFmt .on');var fm=s&&s.dataset.f==='qr'?'qr_code':(x.fmt&&x.fmt!=='qr_code'?x.fmt:'auto');x.fmt=fm;if(x.ph&&x.ph!==XPH)phDel(x.ph).catch(function(){});x.ph=XPH||undefined}
 if(!x.name&&!x.ph&&!(x.t==='biz'&&XB&&XB.f)){var e0=$('pwX0');if(e0)e0.focus();return}
 if(x.t==='biz'&&XB){[['ph','f'],['ph2','b']].forEach(function(a){if(x[a[0]]&&x[a[0]]!==XB[a[1]])phDel(x[a[0]]).catch(function(){});if(XB[a[1]])x[a[0]]=XB[a[1]];else delete x[a[0]]});XB=null;XBT=XBT.filter(function(r){return r!==x.ph&&r!==x.ph2});xBzGC()}
 x.mod=Date.now();if(nw){x.id=id();x.ts=Date.now();D.items.push(x)}XE=null;shClose();save().then(rer)}
/* ---- encrypted photos in IndexedDB (same store as note photos, note:'pw:doc' / 'pw:loy'; bytes AES-GCM with the vault key; travel in backups via phDump) ---- */
var XU={};function xFree(){Object.keys(XU).forEach(function(k){try{URL.revokeObjectURL(XU[k])}catch(_){}});XU={}}
function xSeal(buf){var iv=rnd(12);return C.encrypt({name:'AES-GCM',iv:iv},K,buf).then(function(c){return{iv:b64(iv),buf:c}})}
function xOpen(r){if(XU[r.id])return Promise.resolve(XU[r.id]);return C.decrypt({name:'AES-GCM',iv:ub(r.iv)},K,r.buf).then(function(b){if(!K)throw 0;var u=URL.createObjectURL(new Blob([b],{type:'image/jpeg'}));XU[r.id]=u;return u})}
function xPut(file,note){return phCompress(file).then(function(b){return xPutB(b,note)})}
function xGet(rid){return phTx('readonly',function(s){return s.get(rid)})}
function xDocs(){var box=$('pwDocs');if(!box||!K)return;phOf('pw:doc',1).then(function(a){return Promise.all(a.map(function(r){return phOf('pw:docb:'+r.id,1).then(function(b){return[r.id,b.length?b[b.length-1].id:'',r.ts||0] })}))}).then(function(l){var bx=$('pwDocs');if(!bx||!K)return;var dn=(D&&D.dn)||{};
 l=ordSort(l,function(p){return p[0]},function(p,q){var l1=dn[p[0]]||'',l2=dn[q[0]]||'';if(!l1!==!l2)return l1?-1:1;return l1?nFold(l1).localeCompare(nFold(l2)):p[2]-q[2]});
 bx.innerHTML=l.length?l.map(function(p){return xNRow(p[0],dn[p[0]]||'',p[0],p[1],'doc')}).join(''):'<p class="pwhint">'+esc(TR('Nicio poză încă.'))+'</p>';xPLfill()}).catch(function(){})}
function xThumb(rid){xGet(rid).then(function(r){if(!r)return;return xOpen(r).then(function(u){var t=$('pwXph');if(t)t.innerHTML='<img src="'+u+'" alt="">'})}).catch(function(){})}
/* v176: business cards — front/back photos, encrypted like Poze acte (note 'pw:biz'), resized to 1600px by phCompress */
function xBzT(sd){var t=$('pwBz'+sd),rid=XB&&XB[sd];if(!t)return;if(!rid){t.innerHTML='📇';return}xGet(rid).then(function(r){if(!r)return;return xOpen(r).then(function(u){var t2=$('pwBz'+sd);if(t2&&XB&&XB[sd]===rid)t2.innerHTML='<img src="'+u+'" alt="">'})}).catch(function(){})}
function xBzAdd(sd,cap){xFile(cap,function(l){xPutC(l[0],'pw:biz').then(function(rid){if(!XB)return phDel(rid);XBT.push(rid);XB[sd]=rid;xBzT(sd)}).catch(function(){toast(TR('Nu am putut adăuga poza'))})})}
function xBzGC(){var keep={};(D?D.items:[]).forEach(function(x){if(x.ph)keep[x.ph]=1;if(x.ph2)keep[x.ph2]=1});if(XB){if(XB.f)keep[XB.f]=1;if(XB.b)keep[XB.b]=1}var l=XBT;XBT=[];l.forEach(function(r){if(!keep[r])phDel(r).catch(function(){})})}
function xBzList(){if(!K||!D)return;document.querySelectorAll('#spView [data-bz]').forEach(function(sp){var x=D.items.filter(function(y){return y.id===sp.dataset.bz})[0];if(!x)return;[x.ph,x.ph2].filter(Boolean).forEach(function(rid){xGet(rid).then(function(r){if(!r)return;return xOpen(r).then(function(u){var im=new Image();im.src=u;im.alt='';im.dataset.zr=rid;sp.appendChild(im)})}).catch(function(){})})})}
var xPick=null;function xFile(cap,fn){var f=$('pwFile');if(!f){f=document.createElement('input');f.type='file';f.id='pwFile';f.accept='image/*';f.hidden=true;document.body.appendChild(f);f.addEventListener('change',function(){var l=[].slice.call(f.files||[]);f.value='';if(xPick&&l.length)xPick(l)})}
 if(cap)f.setAttribute('capture','environment');else f.removeAttribute('capture');f.multiple=!cap&&fn===xAddDocs;xPick=fn;f.click()}
function xAddDocs(l){l.reduce(function(p,f){return p.then(function(){return xPutC(f,'pw:doc')}).catch(function(){toast(TR('Nu am putut adăuga poza'))})},Promise.resolve()).then(xDocs)}
/* ---- full-screen viewer with pinch zoom ---- */
function xZoom(did,nd){var u=XU[did];if(!u)return;var z=document.createElement('div');z.id='pwZoom';z.className='pwzoom';z.innerHTML='<img src="'+u+'" alt=""><button type="button" class="pwzx" data-z="x" aria-label="'+esc(TR('Închide'))+'">✕</button>'+(nd?'':'<button type="button" class="pwzd" data-z="d" aria-label="'+esc(TR('Șterge'))+'">🗑</button>');document.body.appendChild(z);
 var im=z.querySelector('img'),s=1,tx=0,ty=0,d0=0,s0=1,p0=null,lt=0;function ap(){im.style.transform='translate('+tx+'px,'+ty+'px) scale('+s+')'}
 z.addEventListener('touchstart',function(e){if(e.touches.length===2){d0=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);s0=s}else if(e.touches.length===1){p0=[e.touches[0].clientX-tx,e.touches[0].clientY-ty];var n=Date.now();if(n-lt<300&&e.target===im){s=s>1?1:2.5;tx=ty=0;ap()}lt=n}},{passive:true});
 z.addEventListener('touchmove',function(e){if(e.touches.length===2&&d0){var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);s=Math.max(1,Math.min(6,s0*d/d0));ap();e.preventDefault()}else if(e.touches.length===1&&s>1&&p0){tx=e.touches[0].clientX-p0[0];ty=e.touches[0].clientY-p0[1];ap();e.preventDefault()}},{passive:false});
 z.addEventListener('touchend',function(e){if(e.touches.length<2)d0=0;if(s<=1){s=1;tx=ty=0;ap()}});
 z.addEventListener('click',function(e){var b=e.target.closest('[data-z]');if(!b)return;if(b.dataset.z==='x')xZc();else{xZc();ask(TR('Ștergi această poză?'),function(){phDel(did).then(function(){try{URL.revokeObjectURL(XU[did])}catch(_){}delete XU[did];xDocs()})})}});z.__s=function(){return s}}
function xZc(){var z=$('pwZoom');if(z)z.remove()}
/* ---- barcode / QR for the cashier ---- */
var C128=('212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112').split(' ');
function bC128(t){var v=[],num=/^\d+$/.test(t)&&t.length%2===0&&t.length>=4;if(num){v.push(105);for(var i=0;i<t.length;i+=2)v.push(+t.substr(i,2))}else{v.push(104);for(var j=0;j<t.length;j++){var c=t.charCodeAt(j);if(c<32||c>126)return null;v.push(c-32)}}
 var s=v[0];for(var k=1;k<v.length;k++)s+=v[k]*k;v.push(s%103);v.push(106);var m=[];v.forEach(function(x){var p=C128[x];for(var i=0;i<p.length;i++)for(var n=0;n<+p[i];n++)m.push(i%2===0)});return m}
var EL=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],EP=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
function eR(d){return EL[d].replace(/./g,function(c){return c==='0'?'1':'0'})}function eG(d){return eR(d).split('').reverse().join('')}
function eChk(t){var s=0,n=t.length;for(var i=0;i<n-1;i++)s+=(+t[n-2-i])*(i%2===0?3:1);return (10-s%10)%10===+t[n-1]}
function bEAN(t){if(t.length===12)t='0'+t;var b;if(t.length===13){var p=EP[+t[0]];b='101';for(var i=1;i<7;i++)b+=p[i-1]==='L'?EL[+t[i]]:eG(+t[i]);b+='01010';for(var j=7;j<13;j++)b+=eR(+t[j]);b+='101'}
 else if(t.length===8){b='101';for(var k=0;k<4;k++)b+=EL[+t[k]];b+='01010';for(var l=4;l<8;l++)b+=eR(+t[l]);b+='101'}else return null;return b.split('').map(function(c){return c==='1'})}
/* QR: byte mode, level M, versions 1-10 */
var QV=[0,[26,10,1,16,0,0],[44,16,1,28,0,0],[70,26,1,44,0,0],[100,18,2,32,0,0],[134,24,2,43,0,0],[172,16,4,27,0,0],[196,18,4,31,0,0],[242,22,2,38,2,39],[292,22,3,36,2,37],[346,26,4,43,1,44]],QA=[0,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
var GE=[],GL=[];(function(){var x=1;for(var i=0;i<255;i++){GE[i]=x;GL[x]=i;x<<=1;if(x&256)x^=0x11d}for(var j=255;j<512;j++)GE[j]=GE[j-255]})();
function gm(a,b){return a&&b?GE[GL[a]+GL[b]]:0}
function rsEc(d,n){var g=[1];for(var i=0;i<n;i++){var ng=new Array(g.length+1).fill(0);for(var j=0;j<g.length;j++){ng[j]^=g[j];ng[j+1]^=gm(g[j],GE[i])}g=ng}var r=new Array(n).fill(0);d.forEach(function(b){var f=b^r[0];r.shift();r.push(0);for(var k=0;k<n;k++)r[k]^=gm(g[k+1],f)});return r}
function bQR(t){var by=Array.from(new TextEncoder().encode(t)),ver=0,V;for(var v=1;v<=10;v++){V=QV[v];var cap=V[2]*V[3]+V[4]*V[5];if(4+(v<10?8:16)+by.length*8<=cap*8){ver=v;break}}if(!ver)return null;
 var cap2=V[2]*V[3]+V[4]*V[5],bits=[];function put(x,n){for(var i=n-1;i>=0;i--)bits.push((x>>i)&1)}put(4,4);put(by.length,ver<10?8:16);by.forEach(function(b){put(b,8)});for(var z=0;z<4&&bits.length<cap2*8;z++)bits.push(0);while(bits.length%8)bits.push(0);
 var dw=[];for(var i=0;i<bits.length;i+=8){var b=0;for(var j=0;j<8;j++)b=b<<1|bits[i+j];dw.push(b)}for(var pd=0;dw.length<cap2;pd++)dw.push(pd%2?0x11:0xEC);
 var blocks=[],ecs=[],o=0;for(var g=0;g<2;g++)for(var k=0;k<V[2+g*2];k++){var bl=dw.slice(o,o+V[3+g*2]);o+=V[3+g*2];blocks.push(bl);ecs.push(rsEc(bl,V[1]))}
 var fin=[],mx=Math.max.apply(null,blocks.map(function(b){return b.length}));for(var c=0;c<mx;c++)blocks.forEach(function(b){if(c<b.length)fin.push(b[c])});for(var e=0;e<V[1];e++)ecs.forEach(function(x){fin.push(x[e])});
 var N=17+4*ver,M0=[],F=[];for(var y=0;y<N;y++){M0.push(new Array(N).fill(0));F.push(new Array(N).fill(0))}function sm(x,y,v){if(x<0||y<0||x>=N||y>=N)return;M0[y][x]=v?1:0;F[y][x]=1}
 function finder(x,y){for(var dy=-1;dy<=7;dy++)for(var dx=-1;dx<=7;dx++){var on=dx>=0&&dx<=6&&dy>=0&&dy<=6&&(dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4));sm(x+dx,y+dy,on)}}finder(0,0);finder(N-7,0);finder(0,N-7);
 for(var i2=8;i2<N-8;i2++){sm(i2,6,i2%2===0);sm(6,i2,i2%2===0)}var al=QA[ver],L1=al.length-1;al.forEach(function(ay,ii){al.forEach(function(ax,jj){if((ii===0&&jj===0)||(ii===0&&jj===L1)||(ii===L1&&jj===0))return;for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++)sm(ax+dx,ay+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)})});
 sm(8,N-8,1);for(var r=0;r<9;r++){if(!F[8][r])F[8][r]=1;if(!F[r][8])F[r][8]=1}for(var r2=0;r2<8;r2++){F[8][N-1-r2]=1;F[N-1-r2][8]=1}
 if(ver>=7){var vb=ver;for(var q=0;q<12;q++)vb=(vb<<1)^((vb>>11)*0x1F25);var vi=ver<<12|vb;for(var a=0;a<18;a++){var bit=(vi>>a)&1,xx=Math.floor(a/3),yy=a%3+N-11;sm(xx,yy,bit);sm(yy,xx,bit)}}
 var db=[];fin.forEach(function(w){for(var s2=7;s2>=0;s2--)db.push((w>>s2)&1)});var bi=0,up=true;for(var cx=N-1;cx>0;cx-=2){if(cx===6)cx--;for(var t2=0;t2<N;t2++){var yy2=up?N-1-t2:t2;for(var d=0;d<2;d++){var x2=cx-d;if(F[yy2][x2])continue;M0[yy2][x2]=bi<db.length?db[bi]:0;bi++}}up=!up}
 var MF=[function(x,y){return (x+y)%2===0},function(x,y){return y%2===0},function(x){return x%3===0},function(x,y){return (x+y)%3===0},function(x,y){return (Math.floor(y/2)+Math.floor(x/3))%2===0},function(x,y){return x*y%2+x*y%3===0},function(x,y){return (x*y%2+x*y%3)%2===0},function(x,y){return ((x+y)%2+x*y%3)%2===0}];
 function build(mk){var R=M0.map(function(row){return row.slice()});for(var y=0;y<N;y++)for(var x=0;x<N;x++)if(!F[y][x]&&MF[mk](x,y))R[y][x]^=1;
  var fd=(0<<3)|mk,fb=fd<<10;for(var i=14;i>=10;i--)if(fb>>i&1)fb^=0x537<<(i-10);var fi=((fd<<10)|fb)^0x5412;
  for(var k=0;k<15;k++){var b=(fi>>k)&1;if(k<6)R[k][8]=b;else if(k<8)R[k+1][8]=b;else R[N-15+k][8]=b;if(k<8)R[8][N-1-k]=b;else if(k<9)R[8][7]=b;else R[8][14-k]=b}R[N-8][8]=1;return R}
 function pen(R){var p=0,y,x;for(y=0;y<N;y++){var run=1;for(x=1;x<N;x++){if(R[y][x]===R[y][x-1]){run++;if(run===5)p+=3;else if(run>5)p++}else run=1}}for(x=0;x<N;x++){var rn=1;for(y=1;y<N;y++){if(R[y][x]===R[y-1][x]){rn++;if(rn===5)p+=3;else if(rn>5)p++}else rn=1}}
  for(y=0;y<N-1;y++)for(x=0;x<N-1;x++){var c=R[y][x];if(c===R[y][x+1]&&c===R[y+1][x]&&c===R[y+1][x+1])p+=3}var dk=0;R.forEach(function(r){r.forEach(function(v){dk+=v})});p+=Math.floor(Math.abs(dk*20-N*N*10)/(N*N))*10;return p}
 var best=null,bp=1e9;for(var mk=0;mk<8;mk++){var R=build(mk),pp=pen(R);if(pp<bp){bp=pp;best=R}}return best}
function xCodeSVG(x){var t=String(x.code||'').trim();if(!t)return '';var qr=x.fmt==='qr_code';
 if(qr){var m=bQR(t);if(!m)return '';var N=m.length,Q=4,p='';m.forEach(function(r,y){r.forEach(function(v,xx){if(v)p+='M'+(xx+Q)+' '+(y+Q)+'h1v1h-1z'})});return '<svg class="pwqr" viewBox="0 0 '+(N+2*Q)+' '+(N+2*Q)+'" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="'+p+'" fill="#000"/></svg>'}
 var bars=(/^\d{8}$|^\d{12,13}$/.test(t)&&eChk(t)&&x.fmt!=='code_128')?bEAN(t):bC128(t);if(!bars)return '';var Q2=12,W=bars.length+2*Q2,r='';bars.forEach(function(v,i){if(v)r+='M'+(i+Q2)+' 0h1v60h-1z'});
 return '<svg class="pwbar" viewBox="0 0 '+W+' 60" preserveAspectRatio="none" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="'+r+'" fill="#000"/></svg>'}
function xShow(x){if(!x||!x.code)return;var z=document.createElement('div');z.id='pwBig';z.className='pwbig2';z.innerHTML='<b>'+esc(x.name||'')+'</b>'+xCodeSVG(x)+'<div class="pwnum">'+esc(x.code)+'</div><button type="button" class="btn pwbig" data-z="x">'+esc(TR('Închide'))+'</button>';
 document.body.appendChild(z);try{var n=NN();n&&n.bright&&n.bright(1)}catch(_){}z.addEventListener('click',function(e){if(e.target.closest('[data-z]'))xBigC()})}
function xBigC(){var z=$('pwBig');if(!z)return;z.remove();try{var n=NN();n&&n.bright&&n.bright(-1)}catch(_){}}
/* ---- scan with the camera / from a gallery image: BarcodeDetector (no image is stored) ---- */
function xScan(cap){var msg=function(t){var e=$('pwXm');if(e)e.textContent=t};if(!('BarcodeDetector' in window)){msg(TR('Scanarea nu e disponibilă pe acest telefon. Scrie numărul manual.'));var e0=$('pwX1');if(e0)e0.focus();return}
 xFile(cap,function(l){msg(TR('Se caută codul…'));var bd;Promise.resolve(BarcodeDetector.getSupportedFormats?BarcodeDetector.getSupportedFormats():null).then(function(f){bd=f&&f.length?new BarcodeDetector({formats:f}):new BarcodeDetector();return createImageBitmap(l[0])}).then(function(bm){return bd.detect(bm)}).then(function(r){
  if(!r||!r.length){msg(TR('Nu am găsit niciun cod. Scrie numărul manual.'));return}var c=r[0],e=$('pwX1');if(e)e.value=c.rawValue;if(XE)XE.fmt=c.format;var q=c.format==='qr_code';document.querySelectorAll('#pwFmt button').forEach(function(b){b.classList.toggle('on',(b.dataset.f==='qr')===q)});msg('✓ '+TR('Cod găsit'))}).catch(function(){msg(TR('Nu am găsit niciun cod. Scrie numărul manual.'))})})}
/* ---- actions (merged into the vault click map) ---- */
function xRow(a){var r=a&&a.closest('.pwi');return r&&D.items.filter(function(y){return y.id===r.dataset.id})[0]}
var F2={xnew:function(){var k=xKindCat(catOf(cat));if(k)xEdit(null,k)},cnew:function(){xEdit(null,'card')},xsave:xSave,
 xcp:function(e){var b=e.target.closest('[data-f]'),f=XE&&XF[XE.t][+b.dataset.f];if(!f)return;var v=$('pwX'+b.dataset.f).value;if(!v)return;clip(v,!!f[2]);toast(TR('Copiat.')+(f[2]?' '+TR('Se șterge din clipboard în')+' '+(D.clip||30)+' s':''))},
 cnum:function(e){var x=xRow(e.target);if(x&&x.num){clip(x.num.replace(/\s/g,''),1);toast(TR('Copiat.')+' '+TR('Se șterge din clipboard în')+' '+(D.clip||30)+' s')}},
 lshow:function(e){xShow(xRow(e.target))},lscan:function(){xScan(1)},lgal:function(){xScan(0)},
 lph:function(){xFile(1,function(l){xPutC(l[0],'pw:loy').then(function(rid){if(XPH&&XE&&XPH!==XE.ph)phDel(XPH).catch(function(){});XPH=rid;xThumb(rid)}).catch(function(){toast(TR('Nu am putut adăuga poza'))})})},
 dcam:function(){xFile(1,xAddDocs)},dgal:function(){xFile(0,xAddDocs)},
 bzc:function(e){var s0=e.target.closest('[data-side]');if(s0)xBzAdd(s0.dataset.side,1)},bzg:function(e){var s0=e.target.closest('[data-side]');if(s0)xBzAdd(s0.dataset.side,0)},
 bzv:function(e){var s0=e.target.closest('[data-side]'),rid=s0&&XB&&XB[s0.dataset.side];if(rid&&XU[rid])xZoom(rid,1)},
 bzd:function(e){var s0=e.target.closest('[data-side]'),sd=s0&&s0.dataset.side;if(!sd||!XB||!XB[sd])return;ask(TR('Ștergi această poză?'),function(){if(XB){XB[sd]=null;xBzT(sd)}})},
 pcam:function(){var kd=xKindCat(catOf(cat));if(kd==='doc'||kd==='biz'||kd==='loy')xAddN(kd,1);else xFile(1,function(l){xAddPh(kd,l)})},pgal:function(){var kd=xKindCat(catOf(cat));if(kd==='doc'||kd==='biz'||kd==='loy')xAddN(kd,0);else xFile(0,function(l){xAddPh(kd,l)})},
 ptr:function(){TRM=TRM===cat?'':cat;rer()},pexp:function(e){var p=pcOf(e);if(!p)return;if(XO[p])delete XO[p];else XO[p]=1;rer()},
 pzm:function(e){var c=e.target.closest('.pwpc'),f=c&&c.querySelector('[data-pr]'),rid=f&&f.dataset.pr;if(rid&&XU[rid])xZoom(rid,1)},pbc:function(e){var p=pcOf(e);if(p)xAddBack(p,1)},pbg:function(e){var p=pcOf(e);if(p)xAddBack(p,0)},
 pbd:function(e){var p=pcOf(e);if(!p)return;var x=xIt(p);ask(TR('Ștergi această poză?'),function(){if(x){if(x.ph2)phDel(x.ph2).catch(function(){});delete x.ph2;x.mod=Date.now();save().then(rer)}else phOf('pw:docb:'+p,1).then(function(a){return Promise.all(a.map(function(r){return phDel(r.id)}))}).then(xDocs)})},
 pedit:function(e){var x=xIt(pcOf(e));if(x)xEdit(x)},pcode:function(e){var x=xIt(pcOf(e));if(x)xShow(x)},
 usepw:function(){PWF=true;rer();setTimeout(function(){var i=$('pwIn');if(i)i.focus()},50)},
 mode:function(){sh(TR('Mod seif'),xChooser(),'')}};
/* v224: 📇 Carte de vizită — same flow as in notes: camera → the notes crop editor (cropEdit, card mode); the Parole card detector (xCrop, perspective) pre-cuts the card when it finds one, then you adjust/confirm; saved encrypted like the other business-card photos ('pw:biz') */
/* v226: card found → saved right away, tightly cropped and straightened (bar "✂ Decupat automat · Original" can undo it); not found → the manual crop editor as before */
F2.pbzc=function(){xAddN('biz',1)};
F2.cvc=function(){xCvAdd(1)};F2.cvg=function(){xCvAdd(0)};F2.cvd=function(){if(XCV){XCV.cur='';xCvT()}};
F2.icp=function(){var g=$('pwIcG');if(g)g.hidden=!g.hidden};
F2.icsel=function(e){var b=e.target.closest('[data-k]');if(!b)return;$('pwIC').value=b.dataset.k==='auto'?'':b.dataset.k;var g=$('pwIcG');if(g)g.hidden=true;edIc()};
F2.drv=function(e){var x=enOf(e),r=e.target.closest('.pwdr'),sp=r&&r.querySelector('.pwdv');if(!x||!sp)return;var k=r.dataset.k;if(sp.dataset.s==='1'){sp.textContent='••••••••';sp.dataset.s=''}else{sp.textContent=String(x[k]||'')+(k==='pw'&&x.part?'….?':'');sp.dataset.s='1'}};
F2.dcp=function(e){var x=enOf(e),r=e.target.closest('.pwdr');if(!x||!r)return;var k=r.dataset.k,sec=!!r.querySelector('[data-pa=drv]'),v=String(x[k]||'');if(!v)return;clip(k==='num'?v.replace(/\s/g,''):v,sec);toast((k==='pw'&&x.part?TR('Partea salvată a fost copiată.'):TR('Copiat.'))+(sec?' '+TR('Se șterge din clipboard în')+' '+(D.clip||30)+' s':''))};
F2.eed=function(e){var x=enOf(e);if(!x)return;if(x.t&&x.t!=='acct')xEdit(x);else edit(x)};
F2.edl=function(e){var x=enOf(e);if(!x)return;openId=x.id;delE()};
F2.eshow=function(e){var x=enOf(e);if(x)xShow(x)};
F2.esh=function(e){xShEnt(enOf(e))};F2.shw2=xShAuth2;F2.shwb=function(){bio('shr')};
F2.nsh=function(e){var r=nbOf(e);if(!r)return;if(r.kind==='doc'){xShImg(r.pid,(D.dn||{})[r.pid]||'',''); return}xShEnt(xIt(r.pid))};
F2.pinun=pinUn;F2.pinsv=pinSave;F2.lts=function(){PSET=null;sets()};F2.usepw2=function(){LKV='pw';rer()};
F2.nren=function(e){var r=nbOf(e);if(!r)return;var x0=r.kind!=='doc'&&xIt(r.pid);if(x0&&x0.t==='loy'){xEdit(x0);return}var cur=r.kind!=='doc'?(x0?xBizLab(x0):''):((D.dn||{})[r.pid]||'');jvPrompt(TR('Nume'),cur,function(v){if(!K||!D)return;if(r.kind!=='doc'){var x=xIt(r.pid);if(!x)return;x.name=v;x.mod=Date.now()}else{D.dn=D.dn||{};D.dn[r.pid]=v}save().then(function(){xNRef(r.kind)})})};
F2.nshow=function(e){var r=nbOf(e),x=r&&xIt(r.pid);if(x)xShow(x)};
F2.nzm=function(e){var r=nbOf(e),f=r&&r.el.querySelector('[data-pr]'),rid=f&&f.dataset.pr;if(rid&&XU[rid])xZoom(rid,1)};
F2.nadj=function(e){var r=nbOf(e),f=r&&r.el.querySelector('[data-pr]'),rid=f&&f.dataset.pr,u=rid&&XU[rid];if(!u)return;fetch(u).then(function(x){return x.blob()}).then(function(b){window.__cropCard=0;return cropEdit(b,1,1)}).then(function(b){if(b&&K)return xCropSwap(rid,b)}).catch(function(){})};
F2.ndel=function(e){var r=nbOf(e);if(!r)return;if(r.kind!=='doc'){openId=r.pid;delE()}else ask(TR('Ștergi această poză?'),function(){xDocDel(r.pid)})};
/* v224: lock type — Parolă (default) / Cod PIN / Amprentă / Model 9 puncte (4–6 puncte, ales la configurare).
   PIN and pattern wrap the SAME vault key with PBKDF2-SHA256 (600k) + AES-GCM, each with its own salt (m.wn / m.wq); never stored in clear.
   The master password and the recovery key always keep working ("Folosește parola principală" / "Am uitat parola"), so nobody gets locked out.
   After 5 wrong PIN/pattern tries (plus the existing waiting time) only the master password unlocks until it is used once. */
var QMAX=5,LKV='',PSET=null,PLEN=4;
function qf(){return +LS.get('ns_vault_qf',0)||0}
function lkType(m){m=m||M();if(!m)return 'pw';if(m.lk==='pin'&&m.wn)return 'pin';if(m.lk==='pat'&&m.wq&&m.pl)return 'pat';if(m.lk==='bio'&&m.bio)return 'bio';return 'pw'}
function qOutMsg(m){var t=lkType(m);return (t==='pin'||t==='pat')&&qf()>=QMAX?esc(TR('Prea multe încercări greșite. Folosește parola principală.')):''}
function patH(mode){var d='';for(var i=0;i<9;i++)d+='<div class="pwd" data-d="'+i+'"><i></i></div>';return '<div class="pwpat" data-mode="'+mode+'" role="group" aria-label="'+esc(TR('Model 9 puncte'))+'"><svg viewBox="0 0 300 300" aria-hidden="true"><polyline points=""/></svg>'+d+'</div>'}
function qLockH(m,bio){var t=lkType(m);if((t!=='pin'&&t!=='pat')||LKV==='pw'||qf()>=QMAX)return '';
 var bb=bio?'<button type="button" class="btn pwbig" data-pa="bio">☝ '+esc(TR('Amprentă'))+'</button>':'',lk='<button type="button" class="pwlink" data-pa="usepw2">'+esc(TR('Folosește parola principală'))+'</button>';
 if(t==='pin')return '<div class="spv pwv pwlk"><div class="pwhd"><b>🔒 '+esc(TR('Seif blocat'))+'</b></div><input type="password" id="pwPin" class="pwin pwpin" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" data-lpignore="true" placeholder="'+esc(TR('Cod PIN'))+'"><div id="pwErr" class="pwerr"></div><div class="pwrow2"><button type="button" class="btn pwbig" data-pa="pinun">'+esc(TR('Deblochează'))+'</button>'+bb+'</div>'+lk+'</div>';
 return '<div class="spv pwv pwlk"><div class="pwhd"><b>🔒 '+esc(TR('Seif blocat'))+'</b></div><p class="pwhint pwsm pwpth">'+esc(TR('Desenează modelul'))+' ('+m.pl+')</p>'+patH('un')+'<div id="pwErr" class="pwerr"></div>'+(bb?'<div class="pwrow2">'+bb+'</div>':'')+lk+'</div>'}
function qTry(kind,sec){var w=flWait();if(w)return Promise.reject({wait:w});var m=M(),o=kind==='pin'?m.wn:m.wq;if(!o)return Promise.reject({});return unwrap(kind+':'+sec,o).then(function(raw){flOk();LS.set('ns_vault_qf',0);return open(raw)},function(){flBad();var n=qf()+1;LS.set('ns_vault_qf',n);throw{bad:1,wait:flWait(),out:n>=QMAX}})}
function qErr(e,bad){var x=$('pwErr');if(e&&e.out){rer();return}if(x)x.textContent=e&&e.wait?(e.bad?bad+'. ':'')+waitMsg(e.wait):bad}
function pinUn(){var i=$('pwPin');if(!i||busy)return;var v=i.value.trim();if(!/^\d{4,8}$/.test(v)){$('pwErr').textContent=TR('Codul PIN are 4–8 cifre');return}var w=flWait();if(w){$('pwErr').textContent=waitMsg(w);return}busy=true;$('pwErr').textContent=TR('Se verifică…');qTry('pin',v).then(function(){busy=false;rer()},function(e){busy=false;var j=$('pwPin');if(j)j.value='';qErr(e,TR('Cod PIN greșit'))})}
function patUn(seq,el){var m=M();if(busy)return;if(seq.length<(m.pl||4)){$('pwErr').textContent=TR('Prea puține puncte')+' ('+m.pl+')';patBad(el);return}var w=flWait();if(w){$('pwErr').textContent=waitMsg(w);patBad(el);return}busy=true;$('pwErr').textContent=TR('Se verifică…');qTry('pat',seq.join('')).then(function(){busy=false;rer()},function(e){busy=false;patBad(el);qErr(e,TR('Model greșit'))})}
function qSetsH(m,n){var t=lkType(m),bo=n&&n.bioSave;return '<label class="pwl">'+esc(TR('Tip de blocare'))+'</label><div class="pwseg pwlt" id="pwLT">'+[['pw','Parolă'],['pin','Cod PIN'],['bio','Amprentă'],['pat','Model']].filter(function(o){return o[0]!=='bio'||bo}).map(function(o){return '<button type="button" class="'+(o[0]===t?'on':'')+'" data-lt="'+o[0]+'">'+esc(TR(o[1]))+'</button>'}).join('')+'</div><p class="pwhint pwsm">'+esc(TR('Parola principală și cheia de recuperare funcționează mereu.'))+'</p>'}
function ltSet(t,extra){var m=M();if(t!=='pin')delete m.wn;if(t!=='pat'){delete m.wq;delete m.pl}if(extra)Object.keys(extra).forEach(function(k){m[k]=extra[k]});m.lk=t;Mset(m);LS.set('ns_vault_qf',0)}
function ltPick(t){if(!K||!KR)return;var m=M();if(t==='pw'){ltSet('pw');sets();return}
 if(t==='bio'){(m.bio?Promise.resolve(true):bioOn(true)).then(function(ok){if(ok)ltSet('bio');sets()});return}
 if(t==='pin'){sh(TR('Cod PIN'),'<p class="pwhint">'+esc(TR('Alege un cod PIN de 4–8 cifre.'))+'</p><input type="password" id="pwPn1" class="pwin pwpin" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" data-lpignore="true" placeholder="'+esc(TR('Cod PIN nou'))+'"><input type="password" id="pwPn2" class="pwin pwpin" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" data-lpignore="true" placeholder="'+esc(TR('Repetă codul PIN'))+'"><div class="pwerr"></div>',B('lts',TR('Anulează'))+B('pinsv',TR('Salvează'),'pwbig'));var i=$('pwPn1');if(i)i.focus();return}
 if(t==='pat'){PSET=null;PLEN=(m.lk==='pat'&&m.pl)||4;patSetH()}}
function patSetH(){sh(TR('Model 9 puncte'),'<label class="pwl">'+esc(TR('Număr de puncte'))+'</label><div class="pwseg" id="pwPL">'+[4,5,6].map(function(v){return '<button type="button" class="'+(v===PLEN?'on':'')+'" data-v="'+v+'">'+v+'</button>'}).join('')+'</div><p class="pwhint pwsm" id="pwPtH">'+esc(PSET?TR('Desenează din nou modelul, pentru confirmare.'):TR('Desenează modelul')+' ('+PLEN+')')+'</p>'+patH('set')+'<div class="pwerr"></div>',B('lts',TR('Anulează')))}
function patLen(v){if(v<4||v>6)return;PLEN=v;PSET=null;patSetH()}
function patSet(seq,el){if(!K||!KR)return;if(seq.length!==PLEN){err(TR('Modelul trebuie să aibă exact {n} puncte').replace('{n}',PLEN));patBad(el);return}
 if(!PSET){PSET=seq.join('');err('');var h=$('pwPtH');if(h)h.textContent=TR('Desenează din nou modelul, pentru confirmare.');setTimeout(function(){patClr(el)},350);return}
 if(PSET!==seq.join('')){PSET=null;err(TR('Modelele nu coincid'));patBad(el);var h2=$('pwPtH');if(h2)h2.textContent=TR('Desenează modelul')+' ('+PLEN+')';return}
 if(busy)return;busy=true;err(TR('Se verifică…'));var sec='pat:'+PSET;PSET=null;wrapPw(sec,KR).then(function(o){busy=false;ltSet('pat',{wq:o,pl:PLEN});toast(TR('Modelul a fost activat'));sets()},function(){busy=false;err(TR('Nu s-a putut salva'))})}
function pinSave(){if(!K||!KR||busy)return;var a=($('pwPn1')||{}).value||'',b=($('pwPn2')||{}).value||'';if(!/^\d{4,8}$/.test(a)){err(TR('Codul PIN are 4–8 cifre'));return}if(a!==b){err(TR('Codurile PIN nu coincid'));return}busy=true;err(TR('Se verifică…'));wrapPw('pin:'+a,KR).then(function(o){busy=false;ltSet('pin',{wn:o});toast(TR('Codul PIN a fost activat'));sets()},function(){busy=false;err(TR('Nu s-a putut salva'))})}
/* 3×3 pattern input: pointer drag over dots; a dot passed over between two chosen dots is added (like Android) */
function patClr(el){if(!el)return;el.classList.remove('bad');el.querySelectorAll('.pwd.on').forEach(function(d){d.classList.remove('on')});var pl=el.querySelector('polyline');if(pl)pl.setAttribute('points','')}
function patBad(el){if(!el)return;el.classList.add('bad');setTimeout(function(){patClr(el)},700)}
(function(){var P=null;function cxy(i){return[50+100*(i%3),50+100*Math.floor(i/3)]}
 function at(e){var r=P.el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*300,y=(e.clientY-r.top)/r.height*300;return[x,y]}
 function add(i){if(P.seq.indexOf(i)>=0)return;var l=P.seq[P.seq.length-1];if(l!=null){var a=[l%3,Math.floor(l/3)],b=[i%3,Math.floor(i/3)];if((a[0]+b[0])%2===0&&(a[1]+b[1])%2===0){var mid=(a[1]+b[1])/2*3+(a[0]+b[0])/2;if(P.seq.indexOf(mid)<0){P.seq.push(mid);P.el.querySelector('[data-d="'+mid+'"]').classList.add('on')}}}P.seq.push(i);P.el.querySelector('[data-d="'+i+'"]').classList.add('on');try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}}
 function hit(p){for(var i=0;i<9;i++){var c=cxy(i);if(Math.hypot(p[0]-c[0],p[1]-c[1])<34)return i}return -1}
 function line(p){var pts=P.seq.map(function(i){return cxy(i).join(',')});if(p&&P.seq.length)pts.push(p[0].toFixed(0)+','+p[1].toFixed(0));P.el.querySelector('polyline').setAttribute('points',pts.join(' '))}
 document.addEventListener('pointerdown',function(e){var el=e.target.closest&&e.target.closest('.pwpat');if(!el||busy)return;e.preventDefault();patClr(el);P={el:el,seq:[],id:e.pointerId};try{el.setPointerCapture(e.pointerId)}catch(_){}var p=at(e),i=hit(p);if(i>=0)add(i);line(p)});
 document.addEventListener('pointermove',function(e){if(!P||e.pointerId!==P.id)return;e.preventDefault();var p=at(e),i=hit(p);if(i>=0)add(i);line(p)});
 function end(e){if(!P||e.pointerId!==P.id)return;var p=P;P=null;var pts=p.seq.map(function(i){return cxy(i).join(',')});p.el.querySelector('polyline').setAttribute('points',pts.join(' '));if(!p.seq.length){patClr(p.el);return}if(e.type==='pointercancel'){patClr(p.el);return}if(p.el.dataset.mode==='set')patSet(p.seq,p.el);else patUn(p.seq,p.el);p.seq=[]}
 document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end)})();
/* events */
document.addEventListener('click',function(e){var v=$('spView'),s=$('pwSheet'),inV=v&&v.contains(e.target)&&v.querySelector('.pwv'),inS=s&&s.contains(e.target);if(!inV&&!inS)return;if(K)touch();var lmb=e.target.closest('#pwLM [data-lm]');if(lmb){var mm=M();mm.lm=lmb.dataset.lm;Mset(mm);sets();return}var ltb=e.target.closest('#pwLT [data-lt]');if(ltb){ltPick(ltb.dataset.lt);return}var plb=e.target.closest('#pwPL [data-v]');if(plb){patLen(+plb.dataset.v);return}
 var ey=e.target.closest('[data-eye]');if(ey){var i=$(ey.dataset.eye);if(i)i.type=i.type==='password'?'text':'password';return}
 var pc=e.target.closest('[data-pc]');if(pc){if(pc.dataset.pc!==cat&&lmode()!=='session')catOK={};cat=pc.dataset.pc;q='';rer();return}
 var enr=e.target.closest('.pwen');if(enr&&!e.target.closest('[data-pa]')&&!e.target.closest('.pwed')&&!e.target.closest('a')){enTap(enr);return}
 var cvz=e.target.closest('.pwcov');if(cvz){var cr=cvz.dataset.pr;if(cr&&XU[cr])xZoom(cr,1);return}
 var nbr=e.target.closest('.pwbn');if(nbr&&!nbr.classList.contains('pwen')&&!e.target.closest('[data-pa]')&&!e.target.closest('.pwpt')){nbTap(nbr);return}
 var pcx=e.target.closest('.pwpc');if(pcx&&!e.target.closest('[data-pa]')){pcTap(pcx,e);return}
 var dd=e.target.closest('.pwdoc');if(dd&&!pcx){xZoom(dd.dataset.did);return}
 var zr=e.target.closest('[data-zr]');if(zr){xZoom(zr.dataset.zr,1);return}
 var vmd=e.target.closest('#pwVMode [data-m]');if(vmd){xSetMode(vmd.dataset.m);return}
 var fb=e.target.closest('#pwFmt button');if(fb){fb.parentNode.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b===fb)});if(XE)XE.fmt=fb.dataset.f==='qr'?'qr_code':'auto';return}
 var md=e.target.closest('#pwMode [data-m]');if(md){setMode(md.dataset.m);return}
 var row=e.target.closest('.pwi'),a=e.target.closest('[data-pa]'),k=a&&a.dataset.pa;
 if(row&&(!a)){var x=D.items.filter(function(y){return y.id===row.dataset.id})[0];if(x&&TRM===cat){openId=x.id;delE();return}if(x)(x.t&&x.t!=='acct'?xEdit(x):edit(x));return}
 if(!k)return;var x2=row&&D&&D.items.filter(function(y){return y.id===row.dataset.id})[0];
 if(k==='cu'&&x2){clip(x2.user,0);toast(TR('Utilizator copiat'));return}
 if(k==='cp'&&x2){clip(x2.pw,1);toast((x2.part?TR('Partea salvată a fost copiată.'):TR('Parola a fost copiată.'))+' '+TR('Se șterge din clipboard în')+' '+(D.clip||30)+' s');return}
 var ci=e.target.closest('[data-ci]'),cix=ci?+ci.dataset.ci:-1;
 var F={setup:setup,su1:su1,su4y:function(){suKey(1)},su4n:function(){suKey(0)},su2:su2,unlock:unlock,bio:function(){bio('open')},forgot:forgot,fg:fg,x:shClose,lock:lock,set:sets,'new':function(){edit(null)},esave:esave,del:delE,del2:del2,delb:function(){bio('del')},pnm:function(){pnSet(pnGet()-1)},pnp:function(){pnSet(pnGet()+1)},cadd2:function(){jvPrompt(TR('Categorie nouă'),'',function(nm){nm=String(nm||'').trim();if(!nm)return;var c={id:id(),name:nm,lock:0};D.cats.push(c);cat=c.id;catOK={};save().then(rer)})},gen:doGen,cats:cats,chpw:chpw,chpw2:chpw2,rgk:rgk,
  rk4y:function(){suKey(1);$('pwSheet').querySelector('[data-pa=su2]').dataset.pa='rks'},rk4n:function(){suKey(0);$('pwSheet').querySelector('[data-pa=su2]').dataset.pa='rks'},rks:rkSave,exp:exp,wipe:wipe,catun:catUn,cun2:cun2,
  cadd:function(){jvPrompt(TR('Categorie nouă'),'',function(nm){D.cats.push({id:id(),name:nm,lock:0});save().then(function(){cats();rer()})})},
  cren:function(){var c=D.cats[cix];jvPrompt(TR('Redenumește'),c.name,function(nm){c.name=nm;save().then(function(){cats();rer()})})},
  cdel:function(){var c=D.cats[cix];if(!c||xIsSoc(c))return;var n=D.items.filter(function(y){return y.cat===c.id}).length;ask(TR('Ștergi categoria?')+(n?' '+n+' → Social media':''),function(){/* v179: entries are never lost - they move to Social media (lock carries over) */try{LS.set('ns_vault_precdel179',M())}catch(_){}var so=xSoc(1);if(c.lock&&n&&!so.lock)so.lock=1;if(c.kind){D.kdel=D.kdel||[];if(D.kdel.indexOf(c.kind)<0)D.kdel.push(c.kind)}D.cats=D.cats.filter(function(y){return y!==c});D.items.forEach(function(y){if(y.cat===c.id)y.cat=so.id});if(cat===c.id)cat=so.id;save().then(function(){cats();rer()})})},
  cup:function(){if(catStep(cix,-1))save().then(function(){cats();rer()})},
  cdn:function(){if(catStep(cix,1))save().then(function(){cats();rer()})},
  clk:function(){var c=D.cats[cix];c.lock=c.lock?0:1;delete catOK[c.id];save().then(function(){cats();rer()})}};
 if(!F[k]&&F2[k]){e.preventDefault();F2[k](e);return}
 if(F[k]){e.preventDefault();F[k]()}
 var sg=e.target.closest('.pwseg button');if(sg){var p=sg.parentNode,val=+sg.dataset.v;p.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b===sg)});if(p.id==='pwAL'){var m=M();m.al=val;Mset(m)}else if(p.id==='pwCL'){D.clip=val;save()}}});
document.addEventListener('change',function(e){if(e.target.id==='pwEC'){edApply();edIc()}if(e.target.id==='pwShot'){LS.set('ns_pwshot',e.target.checked?1:0);window.pwSecSync();toast(TR(e.target.checked?'Capturile de ecran sunt permise':'Capturile de ecran sunt blocate'))}if(e.target.id==='pwBio'){var c=e.target;var on=c.checked;bioOn(on).then(function(ok){c.checked=on?!!ok:false})}if(e.target.id==='pwEPart'||e.target.closest&&e.target.closest('.pwgr'))live(),prev()});
document.addEventListener('input',function(e){var t=e.target;if(!t||!t.id)return;if(K)touch();if(t.id==='pwEN'||t.id==='pwLK')edIc();if(t.id==='pwQ'){q=t.value;rer();return}if(t.id==='pwEP'||t.id==='pwEP2')live();if(t.id==='pwEN'||t.closest&&t.closest('.pwgr'))prev();if(t.id==='pwN1')$('pwS1').innerHTML=strH(t.value)});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='pwIn')unlock();if(e.key==='Enter'&&e.target.id==='pwPin')pinUn();if(e.key==='Enter'&&e.target.id==='pwPn2')pinSave()});
['pointerdown','keydown'].forEach(function(n){document.addEventListener(n,function(){if(K)touch()},true)});
document.addEventListener('visibilitychange',function(){if(document.hidden){if(K&&lmode()!=='exit'){catOK={};return}if(K)lock();var v=$('spView');if(v&&v.querySelector('.pwv'))v.innerHTML='';SU=null;shClose()}});
window.addEventListener('pagehide',function(){if(K)lock()});
try{window.pwDbg.xph=phDump;window.pwDbg.xgc=phGC;window.pwDbg.xall=phAll}catch(_){}
/* swipe on content switches category. v175: whole Parole page (pills row included) — the global tab/page swipes are guarded by pwSwOn() */
window.pwSwOn=function(t){var pg=$('notesPg');return !!(pg&&pg.classList.contains('pwtab')&&pg.classList.contains('show')&&t&&t.closest&&t.closest('#notesPg')&&!t.closest('#noteTabs,.ntop'))};
(function(){var S=null;document.addEventListener('touchstart',function(e){S=null;var t=e.target;if(!pwSwOn(t)||e.touches.length!==1||t.closest('input,textarea,select,#pwSheet,#pwZoom,#pwBig,.modal.show,.pwpat'))return;var r=t.closest('.pwcats');S={x:e.touches[0].clientX,y:e.touches[0].clientY,r:r,sl:r?r.scrollLeft:0,t:Date.now()}},{passive:true});
 document.addEventListener('touchmove',function(e){if(S&&e.touches.length!==1)S=null},{passive:true});document.addEventListener('touchcancel',function(){S=null},{passive:true});
 document.addEventListener('touchend',function(e){if(!S)return;if(window.__pwPD||Date.now()-(window.__pwPDT||0)<700){S=null;return}var t=e.changedTouches[0],dx=t.clientX-S.x,dy=t.clientY-S.y,s0=S;S=null;if(s0.r&&Math.abs(s0.r.scrollLeft-s0.sl)>2)return;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5&&Date.now()-s0.t<900){var d=dx<0?1:-1;/* v180: one swipe = one step; at the first/last category (or locked) the swipe moves to the neighbouring main tab, same direction as the global swipe; cat stays remembered for the way back */if(!K||!D){if(window.ntGo)window.ntGo(d);return}if(q.trim())return;if(goCat(d)==='edge'&&window.ntGo)window.ntGo(d)}},{passive:true})})();
/* tab migration */
function mig(){if(LS.get('ns_pwmig1',0))return;if(!noteTabs.some(function(t){return t.kind==='pw'})){var nid='pw';while(findNT(nid))nid='pw'+Math.random().toString(36).slice(2,5);var t={id:nid,name:TR('Parole')+' 🔑',color:'#7cc4ff',kind:'pw'},ci=noteTabs.findIndex(function(x){return x.kind==='crm'});if(ci>=0)noteTabs.splice(ci+1,0,t);else noteTabs.push(t);LS.set('ns_notetabs',noteTabs)}LS.set('ns_pwmig1',1)}
/* backup / restore: ciphertext only */
var oc=window.spCollect;if(oc&&!oc._pw){window.spCollect=function(){var d=oc.apply(this,arguments)||{};var m=M(),b=LS.get('ns_vault_bak',null);if(m)d.ns_vault=m;if(b)d.ns_vault_bak=b;return d};window.spCollect._pw=1}
var oa=window.spApply;if(oa&&!oa._pw){window.spApply=function(d){var r=oa.apply(this,arguments);if(d&&d.ns_vault&&d.ns_vault.wp&&d.ns_vault.data){var cur=M();if(cur)LS.set('ns_vault_bak',cur);LS.set('ns_vault',d.ns_vault);if(K)lock()}return r};window.spApply._pw=1}
mig();wrapSP();try{renderNotes()}catch(_){}
})();
