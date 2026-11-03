/* Notis module: stats — v194 anonymous install counter + free codes (Super Class) + creator-only admin view. See MODULES.md
   Privacy: sends only a random install id (hashed server-side), app version, source apk|play. No name, notes, IP or device ids. Opt-out in Settings. Never blocks; silent on failure. */
'use strict';
(function(){var W='https://notis-stats.cluj1313.workers.dev';
 var ls=function(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(_){return null}};
 function iid(){var i=ls('ns_iid');if(!i||!/^[A-Za-z0-9_-]{16,64}$/.test(i)){var b=crypto.getRandomValues(new Uint8Array(18));i=btoa(String.fromCharCode.apply(null,b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');ls('ns_iid',i)}return i}
 function ver(){try{if(window.NotisNative&&NotisNative.version)return String(NotisNative.version()||'')}catch(_){}return 'web-'+NOTIS_WEB_REL}
 function src(){try{if(window.NotisNative&&NotisNative.isPlay&&NotisNative.isPlay())return 'play'}catch(_){}return 'apk'}
 function post(p,b,tok){var c=window.AbortController?new AbortController():null,t=setTimeout(function(){c&&c.abort()},9000),h={'content-type':'application/json'};if(tok)h.authorization='Bearer '+tok;
  return fetch(W+p,{method:'POST',headers:h,body:JSON.stringify(b||{}),signal:c&&c.signal,cache:'no-store'}).then(function(r){clearTimeout(t);return r.json()})}
 function get(p,tok){return fetch(W+p,{headers:tok?{authorization:'Bearer '+tok}:{},cache:'no-store'}).then(function(r){return r.json()})}
 /* ---- counter: first launch counts the install; at most one ping per day for "active per day" ---- */
 function today(){return new Date().toISOString().slice(0,10)}
 function ping(){if(ls('ns_stat_off')==='1'||ls('ns_ping_day')===today()||navigator.onLine===false||/nt_test=1/.test(location.search))return;
  try{post('/ping',{id:iid(),v:ver(),src:src()}).then(function(r){if(r&&r.ok)ls('ns_ping_day',today())}).catch(function(){})}catch(_){}}
 setTimeout(ping,5000);window.addEventListener('online',function(){setTimeout(ping,3000)});
 /* ---- Super Class (harmless local flag) ---- */
 function sup(){try{var s=JSON.parse(ls('ns_super')||'null');return s&&(!s.exp||s.exp>Date.now())?s:null}catch(_){return null}}
 window.NOTIS_SUPER=!!sup();
 function supTxt(){var s=sup();if(!s)return '';return s.exp?TR('Super Class activ până la')+' '+new Date(s.exp).toLocaleDateString():TR('Super Class activ pe viață')}
 /* ---- Settings: opt-out toggle + "Ai un cod?" ---- */
 var css=document.createElement('style');css.textContent='#fStat .hint{font-size:12px;opacity:.75;line-height:1.35}#fCode .crow{display:flex;gap:6px;margin-top:6px}#fCode input{flex:1;min-width:0;text-transform:uppercase;letter-spacing:.5px}#fCode .cst{font-size:12.5px;margin-top:5px;opacity:.85}#fCode .cst.ok{color:var(--cyan)}'+
  '#crx .adg{display:grid;grid-template-columns:1fr auto;gap:2px 10px;font-size:13px;font-weight:300}#crx .adg b{font-weight:500}#crx .adt{font-size:26px;font-weight:300}#crx select,#crx .adn{padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:#0c0c0e;color:#fff;font-size:14px}#crx .adl{font-family:monospace;font-size:12px;max-height:220px;overflow:auto;white-space:pre;background:#0c0c0e;border-radius:8px;padding:6px;user-select:all}#crx .ads{font-size:11px;opacity:.6;text-transform:uppercase;letter-spacing:.6px;margin-top:4px}';
 document.head.appendChild(css);
 (function(){var anchor=$('secMsg');if(!anchor)return;var d=document.createElement('div');
  d.innerHTML='<div class="field" id="fStat"><label style="display:flex;align-items:center;gap:10px;margin:0 0 4px"><span id="sStatL" style="flex:1;min-width:0;color:var(--txt);font-size:15px"></span><input type="checkbox" id="sStat" style="flex:none;width:20px;height:20px;margin:0;padding:0;accent-color:var(--cyan)"></label><div class="hint" id="sStatH"></div></div>'+
   '<div class="field" id="fCode"><button type="button" class="btn" id="cdOpen"></button><div id="cdBox" hidden><div class="crow"><input id="cdIn" class="ux" maxlength="20" autocomplete="off" autocapitalize="characters" spellcheck="false"><button type="button" class="btn" id="cdGo"></button></div></div><div class="cst" id="cdSt"></div></div>';
  while(d.firstChild)anchor.parentNode.insertBefore(d.firstChild,anchor);
  var cb=$('sStat');cb.checked=ls('ns_stat_off')!=='1';cb.addEventListener('change',function(){ls('ns_stat_off',cb.checked?null:'1');if(cb.checked)ping()});
  function lbl(){$('sStatL').textContent=TR('Contor anonim de instalări');$('sStatH').textContent=TR('Trimite doar o numărătoare anonimă (țara, versiunea aplicației). Fără nume, notițe sau IP.');$('cdOpen').textContent=TR('Ai un cod?');$('cdGo').textContent=TR('Activează');$('cdIn').placeholder=TR('Introdu codul');var st=$('cdSt');st.textContent=supTxt();st.className='cst'+(sup()?' ok':'')}
  lbl();document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#bSettings'))setTimeout(lbl,0)},true);
  $('cdOpen').onclick=function(){var b=$('cdBox');b.hidden=!b.hidden;if(!b.hidden)$('cdIn').focus()};
  $('cdGo').onclick=function(){var c=$('cdIn').value.trim().toUpperCase(),st=$('cdSt'),go=$('cdGo');if(c.length<6){st.textContent=TR('Cod invalid');st.className='cst';return}
   go.disabled=true;st.textContent='…';st.className='cst';
   post('/redeem',{code:c,id:iid()}).then(function(r){go.disabled=false;if(r&&r.ok){ls('ns_super',JSON.stringify({exp:r.exp||0,code:c}));window.NOTIS_SUPER=true;toast(TR('Cod activat: Super Class'));$('cdIn').value='';$('cdBox').hidden=true;lbl();return}
    var e=r&&r.e;st.textContent=TR(e==='used'?'Codul a fost deja folosit':e==='expired'?'Codul a expirat':'Cod invalid')}).catch(function(){go.disabled=false;st.textContent=TR('Fără conexiune la internet')})};
 })();
 /* ---- Admin (opened only from the creator menu). Romanian only; session token kept in memory only. ---- */
 var tok=null;
 function box(h){var o=$('crx');if(!o){o=document.createElement('div');o.id='crx';document.body.appendChild(o)}o.innerHTML='<div class="crc"><h3><span>📊 Statistici și coduri</span><button type="button" id="adX" aria-label="×">×</button></h3>'+h+'<div class="cre" id="adE"></div></div>';$('adX').onclick=function(){o.remove()}}
 function er(t){var e=$('adE');if(e)e.textContent=t||''}
 function pw(id,ph){return '<div class="crf"><input id="'+id+'" type="password" placeholder="'+ph+'" autocomplete="off" autocapitalize="off" spellcheck="false"></div>'}
 function open(){box('<div class="hint">…</div>');get('/admin/state').then(function(s){if(tok)return dash();s&&s.claimed?login():claim()}).catch(function(){er('Fără conexiune la internet')})}
 function claim(){box('<div class="hint">Prima dată: alege parola de admin (minim 10 caractere). Se salvează doar un hash pe server. O poate seta o singură dată.</div>'+pw('adP1','Parolă admin')+pw('adP2','Repetă parola')+'<div class="crb"><button type="button" id="adGo">Setează</button></div>');
  $('adGo').onclick=function(){var a=$('adP1').value,b=$('adP2').value;if(a.length<10)return er('Minim 10 caractere');if(a!==b)return er('Parolele nu coincid');er('…');
   post('/admin/claim',{pass:a}).then(function(r){if(!r.ok)return er(r.e==='claimed'?'Parola e deja setată':'Eroare');return doLogin(a)}).catch(function(){er('Fără conexiune la internet')})}}
 function doLogin(a){return post('/admin/login',{pass:a}).then(function(r){if(r.ok){tok=r.t;dash()}else er(r.e==='rate'?'Prea multe încercări. Încearcă peste o oră.':'Parolă greșită')})}
 function login(){box(pw('adP1','Parolă admin')+'<div class="crb"><button type="button" id="adGo">Intră</button></div>');$('adGo').onclick=function(){er('…');doLogin($('adP1').value).catch(function(){er('Fără conexiune la internet')})}}
 function rows(a){return (a||[]).map(function(x){return '<span>'+esc(x.k||'—')+'</span><b>'+x.n+'</b>'}).join('')}
 var codes=[];
 function dash(){box('<div class="hint">…</div>');Promise.all([get('/admin/stats',tok),get('/admin/codes',tok)]).then(function(v){var s=v[0],c=v[1];if(!s.ok||!c.ok){tok=null;return login()}codes=c.codes||[];
  var used=codes.filter(function(x){return x.used}).length;
  box('<div class="ads">Instalări (total)</div><div class="adt">'+s.total+'</div><div class="hint">Dezinstalările nu pot fi măsurate de aplicație — le vezi în Google Play Console. Numărul de mai sus include doar cei cu contorul pornit.</div>'+
   '<div class="ads">Activi pe zi</div><div class="adg">'+rows(s.active)+'</div><div class="ads">Pe țări</div><div class="adg">'+rows(s.country)+'</div><div class="ads">Pe versiuni</div><div class="adg">'+rows(s.ver)+'</div><div class="ads">Sursă</div><div class="adg">'+rows(s.src)+'</div>'+
   '<div class="ads">Generează coduri</div><div class="crb" style="justify-content:flex-start"><input id="adN" class="adn" type="number" min="1" max="500" value="10" style="width:80px"><select id="adD"><option value="0">Pe viață</option><option value="30">30 zile</option><option value="90">90 zile</option><option value="365">365 zile</option></select><button type="button" id="adGen">Generează</button></div>'+
   '<div class="ads">Coduri: '+codes.length+' · folosite '+used+' · nefolosite '+(codes.length-used)+'</div><div class="adl" id="adL">'+esc(list())+'</div>'+
   '<div class="crb"><button type="button" class="alt" id="adOut">Ieși</button><button type="button" class="alt" id="adCp">Copiază nefolosite</button><button type="button" id="adCsv">Export CSV</button></div>');
  $('adGen').onclick=function(){var n=Math.max(1,Math.min(500,parseInt($('adN').value,10)||0));if(!n)return er('1–500');$('adGen').disabled=true;er('…');
   post('/admin/gen',{n:n,days:+$('adD').value},tok).then(function(r){if(!r.ok)return er('Eroare');toast(r.codes.length+' coduri');dash()}).catch(function(){er('Fără conexiune la internet')})};
  $('adCp').onclick=function(){var t=codes.filter(function(x){return !x.used}).map(function(x){return x.code}).join('\n');try{navigator.clipboard.writeText(t).then(function(){toast(TR('Copiat'))})}catch(_){}};
  $('adCsv').onclick=function(){var t='code,type,status,used,expires\n'+codes.map(function(x){var e=x.used&&x.days?new Date(x.used+x.days*864e5).toISOString().slice(0,10):'';return [x.code,x.days?x.days+'d':'lifetime',x.used?'used':'unused',x.used?new Date(x.used).toISOString().slice(0,10):'',e].join(',')}).join('\n')+'\n',n='notis-coduri-'+new Date().toISOString().slice(0,10)+'.csv';
   try{if(window.NotisNative&&NotisNative.shareFile&&NotisNative.shareFile(n,t,n))return}catch(_){}var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=n;document.body.appendChild(a);a.click();a.remove()};
  $('adOut').onclick=function(){post('/admin/logout',{},tok).catch(function(){});tok=null;var o=$('crx');if(o)o.remove()}}).catch(function(){er('Fără conexiune la internet')})}
 function list(){return codes.slice(0,300).map(function(x){var ty=x.days?x.days+'z':'viață',st=x.used?('folosit '+new Date(x.used).toISOString().slice(0,10)+(x.days?' → exp '+new Date(x.used+x.days*864e5).toISOString().slice(0,10):'')):'nefolosit';return x.code+'  '+ty+'  '+st}).join('\n')}
 window.NotisAdmin={open:open};
})();
