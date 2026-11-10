/* Notis module: news — Mesaje / noutăți. See MODULES.md */
'use strict';
var NEWS_URL='https://cluj1313.github.io/notis-news/creator.json';
(function(){var K='ns_news',KS='ns_newsSeen',KB='ns_newsBox',N=window.NotisNative,nat=!!(N&&N.newsSet);
 var get=function(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(_){return d}},put=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
 var css=document.createElement('style');css.textContent='#fNews .chk{display:flex;align-items:center;gap:10px;flex-direction:row}#fNews .chk input{width:20px;height:20px;margin:0;flex:none}#nwList{margin-top:6px}#nwList .nwi{padding:7px 0;border-top:1px solid rgba(255,255,255,.08)}#nwList .nwd{font-size:11px;opacity:.6}#nwList .nwt{font-weight:600}#nwList .nwb{font-size:13px;opacity:.85;white-space:pre-wrap}#nwList .nwxdel{float:right;font-size:12px;opacity:.7;border:0;background:transparent;color:inherit;padding:2px 6px;cursor:pointer}#nwList .nwxdel{float:right;font-size:12px;opacity:.7;border:0;background:transparent;color:inherit;padding:2px 6px;cursor:pointer}#nwCard{position:fixed;left:12px;right:12px;top:12px;z-index:9999;background:rgba(20,20,22,.97);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:12px 40px 12px 14px;box-shadow:0 8px 30px rgba(0,0,0,.5);color:#fff}#nwCard .nwx{position:absolute;right:8px;top:6px;background:none;border:0;color:#fff;font-size:20px}#nwCard .nwh{font-size:11px;opacity:.6;margin-bottom:3px}#nwOb{position:fixed;inset:0;z-index:13;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:18px}#nwOb .obc{background:#18181b;border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:16px;max-width:380px;color:#fff;display:flex;flex-direction:column;gap:12px}#nwOb .obh{font-family:Oswald,sans-serif;font-size:20px}#nwOb .obt{font-size:14px;opacity:.9;line-height:1.4}#nwOb .obk{display:flex;align-items:center;gap:10px;font-weight:600}#nwOb .obk input{width:22px;height:22px;margin:0}#nwOb button{align-self:flex-end;padding:9px 18px;border-radius:10px;border:0;background:#3fd8ff;color:#000;font-weight:700}';document.head.appendChild(css);
 var loc=function(m){var o=m.lang&&m.lang[NL];return{t:(o&&o.title)||m.title||'',b:(o&&o.body)||m.body||''}};
 function render(){var L=$('nwList');if(!L)return;var B=get(KB,[]);L.innerHTML=B.length?B.slice().reverse().map(function(m){var x=loc(m);return '<div class="nwi" data-nid="'+esc(m.id||m.date||'')+'"><button type="button" class="nwxdel" data-ndel="1" aria-label="'+esc(TR('Șterge'))+'">🗑</button><div class="nwd">'+esc(fDate(m.date||''))+'</div><div class="nwt ux">'+esc(x.t)+'</div><div class="nwb ux">'+esc(x.b)+'</div></div>'}).join(''):'<div class="hint">'+esc(TR('Niciun mesaj încă'))+'</div>';
  if(!L._ndel){L._ndel=1;L.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-ndel]');if(!b)return;var row=b.closest('.nwi'),id=row&&row.dataset.nid;if(!id)return;
   var go=function(){var A=get(KB,[]).filter(function(m){return String(m.id||m.date||'')!==id});put(KB,A);paint()};
   if(typeof ask==='function')ask(TR('Ștergi mesajul?'),go);else if(confirm(TR('Ștergi mesajul?')))go()})}}
 function card(list){if(!list.length)return;var m=list[0],x=loc(m),c=document.createElement('div');c.id='nwCard';c.innerHTML='<div class="nwh">'+esc(TR('Mesaj nou de la creator'))+'</div><div class="ux" style="font-weight:600">'+esc(x.t)+'</div><div class="ux" style="font-size:13px;opacity:.85;white-space:pre-wrap">'+esc(x.b)+'</div><button type="button" class="nwx" aria-label="x">×</button>';
  c.querySelector('.nwx').onclick=function(){c.remove();card(list.slice(1))};document.body.appendChild(c)}
 function poll(){if(!get(K,false))return;fetch(NEWS_URL+'?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){var a=(j&&j.messages)||[],S=get(KS,[]),B=get(KB,[]),first=!get('ns_newsPrimed',false),fresh=[];
  a.forEach(function(m){if(!m||!m.id||S.indexOf(m.id)>=0)return;S.push(m.id);B.push(m);if(!first)fresh.push(m);if(nat&&N.newsSeen)try{N.newsSeen(String(m.id))}catch(_){}});
  B=B.slice(-50);put(KS,S);put(KB,B);put('ns_newsPrimed',true);render();card(fresh);
  if(!nat&&fresh.length&&window.Notification&&Notification.permission==='granted')fresh.forEach(function(m){var x=loc(m);try{new Notification(x.t,{body:ntClean(ntLead(String(x.t||''))[1],x.b),icon:'icon-192.png'})}catch(_){}})}).catch(function(){})}
 var cb=$('nwOn');cb.checked=!!get(K,false);
 cb.addEventListener('change',function(){put(K,cb.checked);if(nat)try{N.newsSet(cb.checked,NL)}catch(_){}
  if(cb.checked){if(!nat&&window.Notification&&Notification.permission==='default')try{Notification.requestPermission()}catch(_){}poll()}});
 if(nat&&get(K,false))try{N.newsSet(true,NL)}catch(_){}

 /* v97: onboarding step – new users get creator messages ON by default, can switch off here or anytime in Setari. Existing users keep their setting. */
 (function(){if(get('ns_newsOb',false))return;var fresh=get('ns_newsObPend',false);
  if(!fresh){var off=null;try{off=localStorage.getItem('notis_demo_offered')}catch(_){}fresh=!off&&!nsReal()}
  if(!fresh){put('ns_newsOb',true);return}
  put('ns_newsObPend',true);if(localStorage.getItem(K)===null){put(K,true);cb.checked=true;if(nat)try{N.newsSet(true,NL)}catch(_){}}
  var t0=Date.now();(function wait(){var cf=$('cfModal');if(Date.now()-t0<1800||(cf&&cf.classList.contains('show'))||document.querySelector('#nwOb')){if(!document.querySelector('#nwOb'))setTimeout(wait,500);return}
   var o=document.createElement('div');o.id='nwOb';o.innerHTML='<div class="obc"><div class="obh">📣 '+esc(TR('Mesaje de la creator'))+'</div><div class="obt">'+esc(TR('Din când în când creatorul aplicației trimite anunțuri scurte: noutăți, sfaturi și actualizări. Le poți opri aici sau oricând din Setări.'))+'</div><label class="obk"><input type="checkbox" id="obOn"'+(get(K,true)?' checked':'')+'> <span>'+esc(TR('Doresc să primesc mesaje de la creator'))+'</span></label><button type="button" id="obGo">'+esc(TR('Continuă'))+'</button></div>';
   document.body.appendChild(o);$('obGo').onclick=function(){var v=$('obOn').checked;put(K,v);cb.checked=v;if(nat)try{N.newsSet(v,NL)}catch(_){}put('ns_newsOb',true);try{localStorage.removeItem('ns_newsObPend')}catch(_){}o.remove();if(v)poll()}})()})();
 render();setTimeout(poll,2500);document.addEventListener('visibilitychange',function(){if(!document.hidden)poll()});
})();

