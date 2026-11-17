/* v223 (2.26.0): readable text on every theme/background, visible text selection, note editor bottom row (creation date instead of ✓, ↓ centred, 📌 fixed), folder ⋮ menu */
(function(){'use strict';
var $=function(i){return document.getElementById(i)};
/* ---------- 1. contrast guard: text drawn on a background of nearly the same colour gets a readable colour (only those elements; everything else keeps its look) ---------- */
(function(){var R=document.documentElement;
 function rgb(c){var m=String(c).match(/[\d.]+/g);return m&&m.length>=3?[+m[0],+m[1],+m[2],m.length>3?+m[3]:1]:null}
 function L(c){var a=c.slice(0,3).map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*a[0]+.7152*a[1]+.0722*a[2]}
 function CR(a,b){var x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
 function mix(top,base){var a=top[3];return [top[0]*a+base[0]*(1-a),top[1]*a+base[1]*(1-a),top[2]*a+base[2]*(1-a),1]}
 var probe=null;function cssCol(v){if(!probe){probe=document.createElement('i');probe.style.display='none';document.body.appendChild(probe)}probe.style.color='';probe.style.color=v;return rgb(getComputedStyle(probe).color)}
 var pageBg=[0,0,0,1];
 function basePage(){var c=null;if(R.getAttribute('data-bg')==='color')c=cssCol(getComputedStyle(R).getPropertyValue('--bgcol').trim()||'#1b3a5c');if(!c)c=cssCol(getComputedStyle(R).getPropertyValue('--bg').trim()||'#000');pageBg=c||[0,0,0,1]}
 /* gradient layers count as their average colour; an image layer = unknown background → leave the element alone */
 function layer(cs){var bi=cs.backgroundImage,out=[];if(bi&&bi!=='none'){if(/url\(/.test(bi))return false;var parts=[],dp=0,st=0;for(var i=0;i<bi.length;i++){var ch=bi[i];if(ch==='(')dp++;else if(ch===')')dp--;else if(ch===','&&dp===0){parts.push(bi.slice(st,i));st=i+1}}parts.push(bi.slice(st));
  parts.forEach(function(pt){var m=pt.match(/rgba?\([^)]*\)/g);if(m&&m.length){var s=[0,0,0,0];m.forEach(function(x){var c=rgb(x);if(c){s[0]+=c[0];s[1]+=c[1];s[2]+=c[2];s[3]+=c[3]}});var n=m.length;out.push([s[0]/n,s[1]/n,s[2]/n,s[3]/n])}})}
  var bc=rgb(cs.backgroundColor);if(bc&&bc[3]>0)out.push(bc);return out}
 function pseudo(e){var o=[];['::before','::after'].forEach(function(w){var p=getComputedStyle(e,w);if(!p||p.content==='none'||p.display==='none'||!/absolute|fixed/.test(p.position))return;var op=+p.opacity;if(!(op>0))return;var ly=layer(p);if(ly===false){o.push(pageBg.slice(0,3).concat([1]));return} /* wallpaper image: tinted to the theme background */ly.forEach(function(c){o.push([c[0],c[1],c[2],c[3]*op])})});return o}
 function bgOf(el){var ls=[];for(var e=el;e&&e.nodeType===1&&e!==document.body&&e!==R;e=e.parentElement){var cs=getComputedStyle(e),ly=layer(cs);if(ly===false)return null;if(e!==el){var ps=pseudo(e);if(ps.some(function(c){return c[3]>=.99})){for(var k2=0;k2<ps.length;k2++)ls.push(ps[k2]);break}}for(var i=0;i<ly.length;i++)ls.push(ly[i]);if(ly.some(function(c){return c[3]>=.99}))break}
  var b=pageBg;for(var j=ls.length-1;j>=0;j--)b=mix(ls[j],b);return b}
 var SKIP=/^(SCRIPT|STYLE|svg|path|circle|rect|line|g|OPTION|CANVAS|IMG|VIDEO|BR|NOSCRIPT)$/i,FORM=/^(INPUT|TEXTAREA|SELECT)$/;
 function own(e){if(FORM.test(e.tagName))return !/^(checkbox|radio|range|color|file|hidden)$/i.test(e.type||'');for(var n=e.firstChild;n;n=n.nextSibling)if(n.nodeType===3&&/\S/.test(n.nodeValue))return true;return false}
 function fix(e,vh){if(SKIP.test(e.tagName)||!own(e))return;var r=e.getBoundingClientRect();if(!r.width||!r.height||r.bottom<-vh||r.top>2*vh)return;
  if(e.closest('#modal,[data-cg-off],[disabled],.kbar'))return;var cs=getComputedStyle(e);if(cs.visibility==='hidden')return;
  var fc=rgb(cs.webkitTextFillColor||cs.color),c0=rgb(cs.color);if(!c0||(fc&&fc[3]<.05)||c0[3]<.05)return; /* gradient-clipped titles */
  if(/text/.test(cs.backgroundClip||cs.webkitBackgroundClip||''))return;
  var bg=bgOf(e);if(!bg)return;var op=1;for(var x=e;x&&x.nodeType===1;x=x.parentElement){op*=+getComputedStyle(x).opacity;if(op<.06)return}
  var a=c0[3]*op,fg=[c0[0]*a+bg[0]*(1-a),c0[1]*a+bg[1]*(1-a),c0[2]*a+bg[2]*(1-a)];if(CR(fg,bg)>=3)return;
  var to=CR([0,0,0],bg)>CR([255,255,255],bg)?[0,0,0]:[255,255,255],c=to,t;for(t=.2;t<=1.0001;t+=.05){c=c0.slice(0,3).map(function(v,i){return Math.round(v+(to[i]-v)*t)});if(CR(c,bg)>=4.5)break}
  if(!e.hasAttribute('data-cgx')){e.setAttribute('data-cgx',e.style.getPropertyValue('color')||'');e.setAttribute('data-cgo',e.style.getPropertyValue('opacity')||'')}
  e.style.setProperty('color','rgb('+c.join(',')+')','important');if(FORM.test(e.tagName))e.style.setProperty('caret-color','rgb('+c.join(',')+')','important');if(op<.8&&+cs.opacity<1)e.style.setProperty('opacity','1','important')}
 function undo(e){var c=e.getAttribute('data-cgx'),o=e.getAttribute('data-cgo');e.style.removeProperty('color');e.style.removeProperty('caret-color');e.style.removeProperty('opacity');if(c)e.style.setProperty('color',c);if(o)e.style.setProperty('opacity',o);e.removeAttribute('data-cgx');e.removeAttribute('data-cgo')}
 var busy=false;function run(){if(busy)return;busy=true;try{basePage();var vh=innerHeight||800;document.querySelectorAll('[data-cgx]').forEach(undo);
  var all=document.body.getElementsByTagName('*');for(var i=0;i<all.length;i++){try{fix(all[i],vh)}catch(_){}}}finally{busy=false}}
 var T=0;function q(d){clearTimeout(T);T=setTimeout(function(){if(window.requestAnimationFrame)requestAnimationFrame(run);else run()},d||140)}
 window.nsContrast=run;
 function start(){run();new MutationObserver(function(ms){if(busy)return;for(var i=0;i<ms.length;i++){var m=ms[i];var tg=m.target;if(m.type==='attributes'&&tg.classList&&(tg.classList.contains('w')||tg.classList.contains('kbar')||tg.classList.contains('jv-lpon')))continue;if(tg.closest&&tg.closest('#nfView,#ssv,#splash,.kbar'))continue;q();return}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
  new MutationObserver(function(){q(60)}).observe(R,{attributes:true,attributeFilter:['data-theme','data-bg','class','style']});
  document.addEventListener('scroll',function(){q(320)},true);addEventListener('resize',function(){q(200)})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(start,300)});else setTimeout(start,300)})();

/* ---------- 2. note editor: creation date+time where ✓ was, Back = save & close ---------- */
(function(){var d=$('nfDone'),nf=$('noteFull');if(!d||!nf)return;
 function p2(x){return('0'+x).slice(-2)}
 function fmt(v){var t=v?new Date(v):new Date();if(isNaN(t))t=new Date();return '<span class="nfcd">'+p2(t.getDate())+'/'+p2(t.getMonth()+1)+'/'+t.getFullYear()+'</span><span class="nfct">'+p2(t.getHours())+':'+p2(t.getMinutes())+'</span>'}
 function upd(){var n=null;try{n=window.fullId&&findN(fullId)}catch(_){}try{if(!n&&typeof fullId!=='undefined'&&fullId)n=findN(fullId)}catch(_){}
  var v=n?(n.createdAt||n.ts):null;var h=fmt(v);if(d.innerHTML!==h)d.innerHTML=h}
 d.setAttribute('aria-hidden','true');d.tabIndex=-1;d.classList.add('nfdate');upd();
 new MutationObserver(function(){if(nf.classList.contains('show'))upd()}).observe(nf,{attributes:true,attributeFilter:['class']});
 var b=$('nfBack');if(b)b.addEventListener('click',function(){try{var ae=document.activeElement;if(ae&&ae.blur&&ae!==document.body)ae.blur()}catch(_){}},true)})();

/* ---------- 3. folder rows: ⋮ instead of › — Blochează / Deblochează, Șterge (same actions as the long-press menu, delete still asks) ---------- */
(function(){var ul=$('notesList');if(!ul)return;
 var DOTS='<button type="button" class="fdots" aria-label="'+(window.TR?TR('Mai multe'):'Mai multe')+'"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="5" r="1.9" fill="currentColor"/><circle cx="12" cy="12" r="1.9" fill="currentColor"/><circle cx="12" cy="19" r="1.9" fill="currentColor"/></svg></button>';
 function swap(){ul.querySelectorAll('li.nfo .fch').forEach(function(s){var t=document.createElement('span');t.innerHTML=DOTS;s.replaceWith(t.firstChild)})}
 new MutationObserver(swap).observe(ul,{childList:true,subtree:true});swap();
 function stop(e){if(e.target.closest&&e.target.closest('.fdots')){e.stopPropagation()}}
 ['pointerdown','touchstart','mousedown'].forEach(function(t){ul.addEventListener(t,stop,true)});
 ul.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.fdots');if(!b)return;e.stopPropagation();e.preventDefault();var li=b.closest('li.nfo');if(!li)return;
  try{if(typeof selOn==='function'&&selOn())return}catch(_){}
  var f=findF(li.dataset.fid);if(!f||f.del)return;fdMenu(li);
  $('lpBox').innerHTML='<div class="lph">'+FD_IC+' '+esc(f.name)+'</div>'+(f.lk?'<button data-a="funl">'+esc(TR('🔓 Deblochează'))+'</button>':'<button data-a="flock">'+esc(TR('🔒 Blochează'))+'</button>')+'<button data-a="fdel" class="dng">'+esc(TR('🗑 Șterge'))+'</button>';
  try{lpJust=false}catch(_){}lpPos()},true)})();

/* ---------- 4. Design → single-colour background: optional very thin horizontal lines (ns_bglines, in backups) ---------- */
(function(){var R=document.documentElement,cb=$('bgLines');if(!cb||typeof LS==='undefined')return;
 function lum(h){var m=/^#?([0-9a-f]{6})$/i.exec(String(h||'').trim());if(!m)return 0;var n=parseInt(m[1],16),c=[n>>16&255,n>>8&255,n&255].map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
 function col(){var l=lum(getComputedStyle(R).getPropertyValue('--bgcol'));var v=l>.35?'rgba(0,0,0,.085)':'rgba(255,255,255,.075)';if(R.style.getPropertyValue('--bgln')!==v)R.style.setProperty('--bgln',v)}
 function ap(on){if(on)R.setAttribute('data-bglines','');else R.removeAttribute('data-bglines');cb.checked=!!on;col()}
 ap(!!LS.get('ns_bglines',0));cb.addEventListener('change',function(){LS.set('ns_bglines',cb.checked?1:0);ap(cb.checked)});
 new MutationObserver(col).observe(R,{attributes:true,attributeFilter:['style']});
 function wrap(){var c=window.spCollect,a=window.spApply;if(!c||c._v223)return;window.spCollect=function(){var o=c.apply(this,arguments)||{};o.ns_bglines=LS.get('ns_bglines',0);return o};window.spCollect._v223=1;
  window.spApply=function(d){var r=a&&a.apply(this,arguments);try{if(d&&'ns_bglines' in d){LS.set('ns_bglines',d.ns_bglines?1:0);ap(!!d.ns_bglines)}}catch(_){}return r}}
 wrap();if(!window.spCollect||!window.spCollect._v223)addEventListener('load',wrap)})();

/* ---------- 5. Pastile/Glicemie widgets: root cause of stale widgets — ticking a dose in the app (✓ per dose, day check, every-N-hours) wrote ns_med with LS.set only, so no snapshot reached the widget until some other save. Every ns_med / ns_glic write now pushes the widget snapshot (debounced). Widget → app already applies on resume via NotisApp.sync. ---------- */
(function(){if(typeof LS==='undefined'||!LS||LS.__v223)return;var set=LS.set,T=0;
 LS.set=function(k,v){var r=set.apply(this,arguments);if((k==='ns_med'||k==='ns_glic')&&window.NotisNative){clearTimeout(T);T=setTimeout(function(){try{saveNotes(true)}catch(_){}},300)}return r};LS.__v223=1;
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&window.NotisApp&&NotisApp.sync)setTimeout(function(){try{NotisApp.sync()}catch(_){}},120)})})();
})();
