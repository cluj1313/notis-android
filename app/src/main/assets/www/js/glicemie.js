/* Notis v187 – Medicamente: categorii (Pastile / Glicemie / Naturiste / proprii) + Glicemie.
   Modul separat. Interfața cu aplicația: window.__medX (expus din index.html). Pastilele (ns_med) NU sunt modificate aici.
   Chei noi: ns_medcat (categorii, ordine, afișare), ns_glic (măsurători). Ambele intră în backup/restore. */
(function(){'use strict';
var X=function(){return window.__medX||null};
var T=function(s){return typeof TR==='function'?TR(s):s};
var E=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var LSG=function(k,d){var x=X();if(x&&x.LS)return x.LS.get(k,d);try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
var LSS=function(k,v){var x=X();if(x&&x.LS)return x.LS.set(k,v);try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var COLS=['Dimineață (pe nemâncate)','La 2 ore după micul dejun','Înainte de prânz','La 2 ore după prânz','Înainte de cină','La 2 ore după cină','Înainte de culcare'];
var SH=['Dim.','+2h mic dej.','Înt. prânz','+2h prânz','Înt. cină','+2h cină','Culcare'];
var ZI=['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'],LU=['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
var GI=[['Avocado',10],['Vânătă',20],['Banane coapte',60],['Banane necoapte',45],['Fasole albă',35],['Făină albă',85],['Orez alb',70],['Pandișpan',70],['Afine',25],['Bob fiert',80],['Bob necopt',40],['Zahăr brun',70],['Piersici',35],['Piersici conservă',55],['Chifle',70],['Sfeclă roșie crudă',30],['Ceapă',15],['Pâine secară albă',50],['Pâine integrală',65],['Pâine integrală cu făină albă',65],['Măr',35],['Suc de mere neîndulcit',50],['Mure',25],['Orz boabe',45],['Orez expandat',60],['Iaurt degresat',35],['Pâine de orez',70],['Pâine din făină albă',90],['Pâine de secară cu făină albă',65],['Năut fiert',30],['Năut conservat',35],['Zahăr',70],['Dovlecei',15],['Andive',15],['Fasole neagră',35],['Coacăze negre',15],['Ciocolată amăruie >70%',25],['Ciocolată amăruie >80%',20],['Cireșe',20],['Coacăze roșii',25],['Sfeclă roșie',30],['Orez roșu',55],['Usturoi',30],['Curmale uscate',70],['Pâine crocantă',70],['Macaroane chinezești',30],['Paste făinoase din făină albă',70],['Drojdie',35],['Dovleac',75],['Orez sălbatic',35],['Fasole albă/roșie/neagră',35],['Fasole mung/flageolet',25],['Fasole conservată',40],['Fasole verde',15],['Smochine uscate',40],['Smochine proaspete',35],['Fructoză',20],['Glucoză',100],['Rodie',35],['Grepfruit',30],['Mazăre verde',35],['Pară',30],['Hrișcă',40],['Ciuperci',15],['Humus',25],['Mere coapte',35],['Mere uscate',35],['Caise conservate',60],['Muesli neîndulcit',50],['Semințe in/susan/mac',35],['Nectarine',35],['Castraveți',15],['Măsline',15]];
GI=GI.map(function(g,i){return[g[0],g[1],i]}).sort(function(a,b){return a[1]-b[1]||a[2]-b[2]});
var BUILT={p:'Pastile 💊',g:'Glicemie',n:'Naturiste'};
/* ---------- state ---------- */
function catLoad(){var c=LSG('ns_medcat',null);if(!c||typeof c!=='object')c={};
 if(!Array.isArray(c.cats))c.cats=[];if(!Array.isArray(c.ord))c.ord=['p','g','n'];if(!Array.isArray(c.act)||!c.act.length)c.act=['p'];
 if(!c.items||typeof c.items!=='object')c.items={};if(['a','t','b'].indexOf(c.ps)<0)c.ps='a';
 var all=['p','g','n'].concat(c.cats.map(function(x){return x.id}));all.forEach(function(id){if(c.ord.indexOf(id)<0)c.ord.push(id)});
 c.ord=c.ord.filter(function(id,i,a){return all.indexOf(id)>=0&&a.indexOf(id)===i});c.act=c.ord.filter(function(id){return c.act.indexOf(id)>=0});if(!c.act.length)c.act=['p'];return c}
var C=catLoad();function cSave(){LSS('ns_medcat',C)}
function gLoad(){var g=LSG('ns_glic',null);if(!g||typeof g!=='object')g={};if(!g.d||typeof g.d!=='object')g.d={};return g}
var G=gLoad();function gSave(){LSS('ns_glic',G)}
var OPEN={},PER=7,LASTV=null;
function cname(id){if(BUILT[id])return T(BUILT[id]);var c=C.cats.filter(function(x){return x.id===id})[0];return c?c.name:'?'}
/* ---------- pure helpers (tested) ---------- */
function p2(n){return(n<10?'0':'')+n}
function key(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
function cl(v){return v==null?'':v<70?'y':v>250?'r':v>140?'o':'g'}
function pc(v){return(Math.max(40,Math.min(300,v))-40)/260*100}
function giC(n){return n>=70?'r':n>=56?'y':'g'}
function fmt(d){return p2(d.getDate())+'.'+p2(d.getMonth()+1)+'.'+d.getFullYear()+' - '+T(ZI[d.getDay()])}
function mk(m){return m.getFullYear()+'-'+p2(m.getMonth()+1)}
function mname(m){return T(LU[m.getMonth()])+' '+m.getFullYear()}
function nrm(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function today(){var t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())}
function vals(k){var v=G.d[k];return Array.isArray(v)?v:[null,null,null,null,null,null,null]}
function first(){var ks=Object.keys(G.d).filter(function(k){return vals(k).some(function(x){return x!=null})}).sort();var t=today();if(!ks.length)return new Date(t.getFullYear(),t.getMonth(),1);var p=ks[0].split('-');var f=new Date(+p[0],p[1]-1,+p[2]);return f<t?f:t}
function months(){var f=first(),t=today(),o=[];for(var m=new Date(f.getFullYear(),f.getMonth(),1);m<=t;m=new Date(m.getFullYear(),m.getMonth()+1,1))o.push(m);o.push(new Date(t.getFullYear(),t.getMonth()+1,1));return o}
function days(m){var f=first(),t=today(),o=[],e=new Date(m.getFullYear(),m.getMonth()+1,0),fut=m>t;for(var d=new Date(m);d<=e;d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)){if(!fut&&d<f)continue;if(!fut&&d>t)break;o.push(d)}return o}
function csv(ms){var q=function(x){return'"'+String(x).replace(/"/g,'""')+'"'};var L=[[T('Data')].concat(COLS.map(T)).map(q).join(';')];ms.forEach(function(m){days(m).forEach(function(d){L.push([fmt(d)].concat(vals(key(d)).map(function(x){return x==null?'':x})).map(q).join(';'))})});return'\ufeff'+L.join('\r\n')}
function ttl(ms){return T('Monitorizare Glicemie')+' - '+(ms.length===1?mname(ms[0]):mname(ms[0])+' – '+mname(ms[ms.length-1]))}
function fname(ms,ext){return'Glicemie_'+(ms.length===1?mk(ms[0]):mk(ms[0])+'_'+mk(ms[ms.length-1]))+'.'+ext}
function html(ms,pr){var b='';ms.forEach(function(m){b+='<h1>'+E(T('Monitorizare Glicemie')+' - '+mname(m))+'</h1><table><tr><th>'+E(T('Data'))+'</th>'+COLS.map(function(c){return'<th>'+E(T(c))+'</th>'}).join('')+'</tr>';days(m).forEach(function(d){b+='<tr><td>'+E(fmt(d))+'</td>'+vals(key(d)).map(function(x){return'<td>'+(x==null?'':x)+'</td>'}).join('')+'</tr>'});b+='</table>'});
 return'<!doctype html><html><head><meta charset="utf-8"><title>'+E(ttl(ms))+'</title><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300&display=swap" rel="stylesheet"><style>@page{size:A4 landscape;margin:10mm}body{font-family:Oswald,"Arial Narrow",sans-serif;font-weight:300;color:#000}h1{font-weight:300;text-align:center;font-size:20px;margin:6px 0 8px}h1:not(:first-child){page-break-before:always}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #000;padding:4px 5px;text-align:center;font-weight:300}th{background:#eee}td:first-child{text-align:left;white-space:nowrap}</style></head><body>'+b+(pr?'<script>onload=function(){setTimeout(print,400)}<\/script>':'')+'</body></html>'}
/* chart points: returns {pts:[{X,v}],W} for a period (1=today's 7 slots, 7/30/90 days, 0=total) */
function chart(per,cw){var pad=30,pts=[],xl=[],W,t=today();cw=Math.max(300,cw||300);
 if(per===1){var v=vals(key(t));W=cw;var st=(W-pad-14)/6;v.forEach(function(x,j){if(x!=null)pts.push({X:pad+8+j*st,v:x})});SH.forEach(function(s,j){xl.push([pad+8+j*st,T(s),1])})}
 else{var dd=[];months().forEach(function(m){if(m<=t)days(m).forEach(function(d){if(!per||(t-d)/864e5<per)dd.push(d)})});var step=per===7?Math.max(44,(cw-pad-20)/7):per===30?40:per===90?16:Math.max(16,Math.min(44,(cw-pad-20)/Math.max(1,dd.length)));W=Math.max(cw,pad+dd.length*step+20);
  var lab=step<30?7:1;dd.forEach(function(d,di){vals(key(d)).forEach(function(x,j){if(x!=null)pts.push({X:pad+(di+j/7)*step,v:x})});xl.push([pad+di*step,di%lab?'':p2(d.getDate())+'.'+p2(d.getMonth()+1),0])});pts.days=dd.length}
 return{pts:pts,xl:xl,W:W,pad:pad}}
/* ---------- render ---------- */
function cell(x,f){if(f)return'';if(x==null)return'<span class="n ngdash">–</span><div class="ngbar e"></div>';return'<span class="n">'+x+'<u>mg/dl</u></span><div class="ngbar"><i style="left:'+pc(x).toFixed(1)+'%"></i></div>'}
function gTable(){var t=today(),h='',ms=months();if(!Object.keys(OPEN).length)OPEN[mk(t)]=1;
 ms.forEach(function(m){var k=mk(m),op=!!OPEN[k],ds=days(m),fut=m>t;
  h+='<div class="ngmon'+(op?' open':'')+'" data-m="'+k+'"><div class="ngmh" data-g="mtog">'+E(mname(m))+'<span><small>'+(fut?E(T('viitoare'))+' · ':'')+ds.length+' '+E(T('zile'))+'</small> <span class="ngcv">⌄</span></span></div>';
  if(op){h+='<div class="ngtw"><table class="ngtb"><tr><th>'+E(T('Data'))+'</th>'+COLS.map(function(c){return'<th>'+E(T(c))+'</th>'}).join('')+'</tr>';
   ds.forEach(function(d){var kk=key(d),v=vals(kk),f=d>t;h+='<tr'+(+d===+t?' class="ngtoday"':'')+'><td>'+E(fmt(d))+'</td>'+v.map(function(x,j){return'<td class="v '+(f?'':cl(x))+'"'+(f?'':' data-g="val" data-k="'+kk+'" data-j="'+j+'"')+'>'+cell(x,f)+'</td>'}).join('')+'</tr>'});h+='</table></div>'}
  h+='</div>'});return h}
function gChart(cw){var c=chart(PER,cw),H=220,pad=c.pad,y=function(v){return H-22-(Math.max(40,Math.min(v,320))-40)/(280)*(H-40)},CC={g:'#4ade80',y:'#facc15',o:'#fb923c',r:'#f87171'},s='',W=c.W;
 [[40,70,'#ca8a04'],[70,140,'#16a34a'],[140,250,'#ea580c'],[250,320,'#dc2626']].forEach(function(b){s+='<rect x="'+pad+'" y="'+y(b[1])+'" width="'+(W-pad)+'" height="'+(y(b[0])-y(b[1]))+'" fill="'+b[2]+'" opacity=".22"/>'});
 [70,140,250].forEach(function(v){s+='<text x="4" y="'+(y(v)+4)+'" fill="currentColor" opacity=".6" font-size="10">'+v+'</text>'});
 c.xl.forEach(function(l){s+='<line x1="'+l[0]+'" x2="'+l[0]+'" y1="14" y2="'+(H-22)+'" stroke="currentColor" stroke-opacity=".07"/>'+(l[1]?'<text x="'+l[0]+'" y="'+(H-7)+'" fill="currentColor" opacity=".6" font-size="'+(l[2]?9:10)+'" text-anchor="'+(l[2]?'middle':'start')+'">'+E(l[1])+'</text>':'')});
 if(c.pts.length>1)s+='<polyline fill="none" stroke="#2dd4bf" stroke-width="1.2" points="'+c.pts.map(function(p){return p.X.toFixed(1)+','+y(p.v).toFixed(1)}).join(' ')+'"/>';
 c.pts.forEach(function(p){s+='<circle cx="'+p.X.toFixed(1)+'" cy="'+y(p.v).toFixed(1)+'" r="3.2" fill="'+CC[cl(p.v)]+'" stroke="rgba(0,0,0,.5)" stroke-width="1"/>'});
 if(!c.pts.length)s+='<text x="'+(W/2)+'" y="'+(H/2)+'" fill="currentColor" opacity=".6" font-size="13" text-anchor="middle">'+E(T('Fără măsurători'))+'</text>';
 return'<svg class="ngch" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+s+'</svg>'}
function gRender(){var P=[[1,'1 zi'],[7,'1 săptămână'],[30,'1 lună'],[90,'3 luni'],[0,'Tot istoricul']];
 return'<div class="ngcard ngglic"><div class="nghd"><span class="ngh2">'+E(T('Glicemie'))+' <small>mg/dl · '+E(T('atinge o valoare'))+'</small></span><button type="button" class="ngpill" data-g="exp">'+E(T('Exportă'))+' ⤓</button></div>'
 +'<div class="ngexm" hidden><div class="ngexr"><label><input type="radio" name="ngsc" value="cur" checked> '+E(T('Luna curentă'))+'</label><label><input type="radio" name="ngsc" value="open"> '+E(T('Lunile deschise'))+'</label><label><input type="radio" name="ngsc" value="all"> '+E(T('Toate lunile'))+'</label></div><div class="ngexr"><button type="button" class="ngpill" data-g="xcsv">CSV</button><button type="button" class="ngpill" data-g="xhtml">'+E(T('Tabel HTML'))+'</button><button type="button" class="ngpill" data-g="xpdf">'+E(T('Printează / PDF'))+'</button><button type="button" class="ngpill" data-g="xsh">'+E(T('Trimite'))+'</button></div><div class="ngmsg"></div></div>'
 +'<div class="ngoc"><a data-g="oall">'+E(T('Deschide toate'))+'</a><a data-g="call">'+E(T('Închide toate'))+'</a></div><div class="ngmonths">'+gTable()+'</div></div>'
 +'<div class="ngcard"><div class="ngh2">'+E(T('Grafic'))+'</div><div class="ngper">'+P.map(function(p){return'<button type="button" class="ngpill'+(PER===p[0]?' on':'')+'" data-g="per" data-p="'+p[0]+'">'+E(T(p[1]))+'</button>'}).join('')+'</div><div class="ngchw">'+gChart(300)+'</div>'
 +'<div class="nglg"><span><i style="background:#ca8a04"></i>&lt;70</span><span><i style="background:#16a34a"></i>70–140</span><span><i style="background:#ea580c"></i>140–250</span><span><i style="background:#dc2626"></i>&gt;250</span></div><div class="ngnote">'+E(T('Benzi orientative, nu sunt sfat medical.'))+'</div></div>'
 +'<details class="ngcard nggi"><summary class="ngh2">'+E(T('Indice glicemic produse'))+' <small>▾</small></summary><input type="search" class="ngq" placeholder="'+E(T('Caută produs…'))+'" autocomplete="off"><div class="ngil">'+giList('')+'</div></details>'}
function giList(q){q=nrm(q||'');var r=GI.filter(function(g){return nrm(g[0]).indexOf(q)>=0||nrm(T(g[0])).indexOf(q)>=0});return r.map(function(g){return'<div class="nggr '+giC(g[1])+'"><span>'+E(T(g[0]))+'</span><b>'+g[1]+'</b></div>'}).join('')||'<div class="nggr">'+E(T('Niciun produs'))+'</div>'}
function listRender(id){var L=C.items[id]||[];var h='<div class="ngcard"><div class="nghd"><span class="ngh2">'+E(cname(id))+'</span><button type="button" class="ngpill" data-g="iadd" data-c="'+E(id)+'">+ '+E(T('Adaugă'))+'</button></div>';
 if(!L.length)h+='<div class="ngempty">'+E(T('Nimic încă'))+'</div>';
 L.forEach(function(it){h+='<div class="ngit" data-g="iedit" data-c="'+E(id)+'" data-i="'+E(it.id)+'"><span class="nginm">'+E(it.name)+'</span>'+(it.t?'<span class="ngit-t">'+E(it.t)+'</span>':'')+(it.note?'<div class="ngit-n">'+E(it.note)+'</div>':'')+'</div>'});return h+'</div>'}
function pastRender(medRender){var x=X(),h='',ps=C.ps;
 h+='<div class="ngsub"><button type="button" class="ngpill'+(ps!=='t'?' on':'')+'" data-g="ps" data-v="a">'+E(T('Actuale'))+'</button><button type="button" class="ngpill'+(ps!=='a'?' on':'')+'" data-g="ps" data-v="t">'+E(T('Toate'))+'</button></div>';
 if(ps==='a')h+=x.sched();else if(ps==='t')h+=x.lib();else h+=x.sched()+x.lib();
 h+='<div class="afrow ngpsaf">'+E(T('Afișează'))+' <select class="afsel" data-g="pssel"><option value="a"'+(ps==='a'?' selected':'')+'>'+E(T('Actuale'))+'</option><option value="t"'+(ps==='t'?' selected':'')+'>'+E(T('Toate'))+'</option><option value="b"'+(ps==='b'?' selected':'')+'>'+E(T('Actuale + Toate'))+'</option></select></div>';return h}
function syncV(){var x=X();if(!x)return;var v=x.getV()?1:0;if(LASTV!==null&&v!==LASTV){if(C.act.indexOf('p')<0){C.act=C.act.length>1?['p'].concat(C.act):['p']}if(v&&C.ps==='a')C.ps='t';if(!v&&C.ps==='t')C.ps='a';cSave()}
 var want=C.ps==='t'?1:0;if(v!==want)x.setV(want);LASTV=want}
function render(medRender){var x=X();if(!x)return medRender();C=catLoad();G=gLoad();syncV();var multi=C.act.length>1;
 var h='<div class="ngwrap"><div class="ngpills">'+C.ord.map(function(id){return'<button type="button" class="ngpill'+(C.act.indexOf(id)>=0?' on':'')+'" data-g="cat" data-c="'+E(id)+'">'+E(cname(id))+'</button>'}).join('')+'<button type="button" class="ngpill ngplus" data-g="cadd" aria-label="'+E(T('Categorie nouă'))+'">+</button></div>';
 C.act.forEach(function(id){h+='<section class="ngsec" data-c="'+E(id)+'">'+(multi?'<div class="ngsecT">'+E(cname(id))+'</div>':'')+(id==='p'?pastRender(medRender):id==='g'?gRender():listRender(id))+'</section>'});
 h+='<div class="afrow ngaf">'+E(T('Afișează'))+' <button type="button" class="ngpill" data-g="afopen">'+E(C.act.map(cname).join(' · '))+' ▾</button></div></div>';
 setTimeout(post,0);return h}
function post(){var v=document.getElementById('spView');if(!v)return;v.querySelectorAll('.ngchw').forEach(function(w){var cw=w.clientWidth-2;if(cw>0){w.innerHTML=gChart(cw)}w.scrollLeft=w.scrollWidth})}
function rr(){if(window.spRender)window.spRender()}
/* ---------- dialogs ---------- */
function editVal(k,j){var x=X(),p=k.split('-'),d=new Date(+p[0],p[1]-1,+p[2]),v=vals(k),cur=v[j];
 var b=x.dOpen(fmt(d),'<div class="field"><label>'+E(T(COLS[j]))+' (mg/dl)</label><input id="ngVal" type="number" inputmode="numeric" min="0" max="600" value="'+(cur==null?'':cur)+'"></div>',function(){var s=String(b.querySelector('#ngVal').value).trim();var nv=v.slice();nv[j]=s===''?null:Math.max(0,Math.min(600,parseInt(s,10)||0));if(nv.every(function(z){return z==null}))delete G.d[k];else G.d[k]=nv;gSave();rr()},cur==null?null:function(){x.ask('Ștergi valoarea?',function(){var nv=v.slice();nv[j]=null;if(nv.every(function(z){return z==null}))delete G.d[k];else G.d[k]=nv;gSave();x.close();rr()})});
 setTimeout(function(){var i=b.querySelector('#ngVal');if(i)i.focus()},80)}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function editItem(cid,iid){var x=X(),L=C.items[cid]=C.items[cid]||[],it=L.filter(function(z){return z.id===iid})[0];
 var b=x.dOpen(it?it.name:T('Adaugă'),'<div class="field"><label>'+E(T('Nume'))+'</label><input id="ngIn" value="'+E(it?it.name:'')+'"></div><div class="field"><label>'+E(T('Notă'))+'</label><textarea id="ngIo" rows="2">'+E(it?it.note:'')+'</textarea></div><div class="field"><label>'+E(T('Ore (opțional)'))+'</label><input id="ngIt" placeholder="08:00, 20:00" value="'+E(it?it.t:'')+'"></div>',function(){var n=b.querySelector('#ngIn').value.trim();if(!n){if(window.toast)toast(T('Scrie un nume'));return false}var o={id:it?it.id:uid(),name:n,note:b.querySelector('#ngIo').value.trim(),t:b.querySelector('#ngIt').value.trim()};if(it)L[L.indexOf(it)]=o;else L.push(o);cSave();rr()},it?function(){x.ask('Ștergi?',function(){C.items[cid]=L.filter(function(z){return z.id!==iid});cSave();x.close();rr()})}:null)}
function editCat(id){var x=X(),c=id&&C.cats.filter(function(z){return z.id===id})[0];
 var b=x.dOpen(c?c.name:T('Categorie nouă'),'<div class="field"><label>'+E(T('Nume'))+'</label><input id="ngCn" value="'+E(c?c.name:'')+'"></div>',function(){var n=b.querySelector('#ngCn').value.trim();if(!n){if(window.toast)toast(T('Scrie un nume'));return false}if(c)c.name=n;else{var nid='c'+uid();C.cats.push({id:nid,name:n});C.ord.push(nid);C.act=C.act.length>1?C.act.concat([nid]):[nid]}cSave();rr()},c?function(){x.ask('Ștergi categoria?',function(){C.cats=C.cats.filter(function(z){return z.id!==id});C.ord=C.ord.filter(function(z){return z!==id});C.act=C.act.filter(function(z){return z!==id});if(!C.act.length)C.act=['p'];delete C.items[id];cSave();x.close();rr()})}:null)}
function afPanel(){var x=X();var row=function(id){return'<div class="ngafr" data-c="'+E(id)+'"><span class="ngdrag" title="↕">☰</span><label><input type="checkbox"'+(C.act.indexOf(id)>=0?' checked':'')+'> '+E(cname(id))+'</label>'+(BUILT[id]?'':'<button type="button" class="ngpill ngced" data-c="'+E(id)+'">✎</button>')+'</div>'};
 var b=x.dOpen(T('Afișează'),'<div class="ngafl">'+C.ord.map(row).join('')+'</div><div class="ngnote">'+E(T('Bifează una, două sau toate; trage ☰ pentru ordine.'))+'</div>',function(){var ord=[].map.call(b.querySelectorAll('.ngafr'),function(r){return r.dataset.c}),act=[].filter.call(b.querySelectorAll('.ngafr'),function(r){return r.querySelector('input').checked}).map(function(r){return r.dataset.c});if(!act.length){if(window.toast)toast(T('Alege cel puțin una'));return false}C.ord=ord;C.act=act;cSave();rr()});
 var l=b.querySelector('.ngafl');l.addEventListener('click',function(e){var q=e.target.closest('.ngced');if(q){x.close();editCat(q.dataset.c)}});
 var drag=null;l.addEventListener('pointerdown',function(e){var h=e.target.closest('.ngdrag');if(!h)return;drag=h.parentNode;drag.classList.add('drag');e.preventDefault();try{h.setPointerCapture(e.pointerId)}catch(_){}});
 l.addEventListener('pointermove',function(e){if(!drag)return;var rs=[].slice.call(l.children);for(var i=0;i<rs.length;i++){var r=rs[i];if(r===drag)continue;var bb=r.getBoundingClientRect();if(e.clientY>bb.top&&e.clientY<bb.bottom){if(e.clientY<bb.top+bb.height/2)l.insertBefore(drag,r);else l.insertBefore(drag,r.nextSibling);break}}});
 var up=function(){if(drag)drag.classList.remove('drag');drag=null};l.addEventListener('pointerup',up);l.addEventListener('pointercancel',up)}
/* ---------- export ---------- */
function selM(root){var sc=(root.querySelector('input[name=ngsc]:checked')||{}).value||'cur',ms=months().filter(function(m){return m<=today()});if(sc==='all')return ms;if(sc==='open'){var o=ms.filter(function(m){return OPEN[mk(m)]});return o.length?o:ms.slice(-1)}return ms.slice(-1)}
function nat(){return window.NotisNative&&typeof NotisNative.saveFile==='function'?NotisNative:null}
function msg(root,t){var m=root.querySelector('.ngmsg');if(m)m.textContent=t}
function save(root,txt,type,fn){var N=nat();if(N){var ok=false;try{ok=N.saveFile(fn,txt)}catch(_){}msg(root,ok?T('Salvat în Descărcări')+': '+fn:T('Nu s-a putut salva'));return}
 var u=URL.createObjectURL(new Blob([txt],{type:type})),a=document.createElement('a');a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);msg(root,T('Descărcat')+': '+fn)}
function doExp(a,root){var ms=selM(root);
 if(a==='xcsv')return save(root,csv(ms),'text/csv;charset=utf-8',fname(ms,'csv'));
 if(a==='xhtml')return save(root,html(ms),'text/html;charset=utf-8',fname(ms,'html'));
 if(a==='xpdf'){if(nat()){save(root,html(ms,1),'text/html',fname(ms,'html'));msg(root,T('Salvat în Descărcări')+': '+fname(ms,'html')+' – '+T('deschide-l și alege Printează / PDF'));return}
  var f=document.createElement('iframe');f.style.cssText='position:fixed;width:0;height:0;border:0;right:0;bottom:0';document.body.appendChild(f);var d=f.contentWindow.document;d.open();d.write(html(ms));d.close();setTimeout(function(){try{f.contentWindow.focus();f.contentWindow.print()}catch(_){}setTimeout(function(){f.remove()},60000)},500);msg(root,T('Alege Salvează ca PDF în dialogul de printare'));return}
 if(a==='xsh'){var N=nat();if(N&&typeof N.shareText==='function'){try{N.shareText(csv(ms).replace(/^\ufeff/,''),ttl(ms))}catch(_){}return}
  try{var fs=[new File([csv(ms)],fname(ms,'csv'),{type:'text/csv'}),new File([html(ms)],fname(ms,'html'),{type:'text/html'})];if(navigator.canShare&&navigator.canShare({files:fs})){navigator.share({files:fs,title:ttl(ms)}).catch(function(){});return}}catch(_){}
  msg(root,T('Trimiterea nu e suportată aici – folosește CSV/HTML'))}}
/* ---------- events (delegated on document; only our data-g elements) ---------- */
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-g]');if(!t||!t.closest('.ngwrap'))return;var a=t.dataset.g,x=X();if(!x)return;
 if(a==='cat'){var id=t.dataset.c;if(C.act.length>1&&C.act.indexOf(id)>=0){var s=document.querySelector('.ngsec[data-c="'+id+'"]');if(s)s.scrollIntoView({block:'start',behavior:'smooth'});return}C.act=[id];cSave();rr();return}
 if(a==='cadd')return editCat(null);if(a==='afopen')return afPanel();
 if(a==='ps'){C.ps=t.dataset.v;cSave();rr();return}
 if(a==='mtog'){var k=t.parentNode.dataset.m;if(OPEN[k])delete OPEN[k];else OPEN[k]=1;if(!Object.keys(OPEN).length)OPEN['_']=1;rr();return}
 if(a==='oall'){months().forEach(function(m){OPEN[mk(m)]=1});rr();return}if(a==='call'){OPEN={_:1};rr();return}
 if(a==='val')return editVal(t.dataset.k,+t.dataset.j);
 if(a==='per'){PER=+t.dataset.p;rr();return}
 if(a==='exp'){var m=t.closest('.ngglic').querySelector('.ngexm');m.hidden=!m.hidden;return}
 if(/^x/.test(a))return doExp(a,t.closest('.ngglic'));
 if(a==='iadd')return editItem(t.dataset.c,null);if(a==='iedit')return editItem(t.dataset.c,t.dataset.i)},false);
document.addEventListener('change',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.g==='pssel'){C.ps=t.value;cSave();rr()}});
document.addEventListener('input',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('ngq')){var l=t.parentNode.querySelector('.ngil');if(l)l.innerHTML=giList(t.value)}});
/* ---------- backup ---------- */
function wrap(){var c=window.spCollect,a=window.spApply;if(!c){setTimeout(wrap,300);return}if(c._v187)return;
 window.spCollect=function(){var o=c.apply(this,arguments)||{};var mc=LSG('ns_medcat',null),gl=LSG('ns_glic',null);if(mc)o.ns_medcat=mc;if(gl)o.ns_glic=gl;return o};window.spCollect._v187=1;
 window.spApply=function(d){var r=a&&a.apply(this,arguments);try{if(d&&d.ns_medcat&&typeof d.ns_medcat==='object')LSS('ns_medcat',d.ns_medcat);if(d&&d.ns_glic&&typeof d.ns_glic==='object'&&d.ns_glic.d)LSS('ns_glic',d.ns_glic);C=catLoad();G=gLoad()}catch(_){}return r}}
wrap();
window.NSG={ok:1,render:render,cl:cl,pc:pc,giC:giC,csv:csv,html:html,months:months,days:days,chart:chart,fmt:fmt,key:key,GI:GI,COLS:COLS,state:function(){return{C:C,G:G,OPEN:OPEN,PER:PER}},reload:function(){C=catLoad();G=gLoad()}};
})();
