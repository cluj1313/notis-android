// v2.2.0 runtime i18n audit: in each language, demo mode, collect visible text of main view, settings, tab/folder/note menus, all modals; flag Romanian leftovers.
const p=require('puppeteer-core');const w=ms=>new Promise(r=>setTimeout(r,ms));
const LANGS=(process.argv[2]||'ro,en,fr,de,it,hu,ru').split(',');const SHOT=new Set((process.env.SHOT||'en,de,ru').split(','));
const RO=/[ăâîșțşţĂÂÎȘȚ]|\b(și|sau|pentru|notiț|Setări|Salvează|Anulează|Șterge|Mută|Adaugă|Închide|Caută|Taburi?|Coș|Blochează|Redenumește|Culoare|Ieși|Fundal|Temă|Limbă|Exemple|Înregistr|Desen|Vocea)\b/i;
const KEEP=/^(Română — .*|Română|Notis|NOTIS|DEMO.*|Mihai.*|Emil.*|Romanian.*)$/;
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});let fails=0;
for(const l of LANGS){const ctx=await b.createBrowserContext();const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.emulate({viewport:{width:360,height:740,deviceScaleFactor:2,isMobile:true,hasTouch:false},userAgent:'Mozilla/5.0 (Linux; Android 14) Mobile'});
 await pg.evaluateOnNewDocument(l=>{localStorage.setItem('notis_lang',l);localStorage.setItem('notis_demo_offered','1')},l);
 await pg.goto('http://localhost:8766/?demo=1',{waitUntil:'networkidle0'});await w(1500);
 const grab=async tag=>{const t=await pg.evaluate(()=>{const o=[];const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=tw.nextNode()){const e=n.parentElement;if(!e||!n.textContent.trim())continue;const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(r.width&&r.height&&s.visibility!=='hidden'&&s.display!=='none')o.push(n.textContent.trim())}
   document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(e=>{if(e.offsetParent)['placeholder','aria-label','title'].forEach(a=>e.getAttribute(a)&&o.push(e.getAttribute(a)))});
   document.querySelectorAll('option').forEach(x=>o.push(x.textContent.trim()));return o});
  const bad=[...new Set(t)].filter(x=>l!=='ro'&&RO.test(l==='fr'?x.replace(/[âî]/g,''):x)&&!KEEP.test(x));bad.forEach(x=>console.log(`  ${l} ${tag} RO? ${JSON.stringify(x).slice(0,120)}`));fails+=bad.length;
  if(SHOT.has(l))await pg.screenshot({path:`/workspace/notis-tools/shots22/${l}-${tag}.png`});};
 await grab('main');
 await pg.evaluate(()=>document.getElementById('bSettings').click());await w(700);
 await pg.evaluate(()=>{const m=document.querySelector('#modal .card');m&&(m.scrollTop=0)});await grab('settings');
 await pg.evaluate(()=>{document.querySelectorAll('#modal details').forEach(d=>d.open=true)});await w(200);
 for(let i=1;i<6;i++){const more=await pg.evaluate(i=>{const c=document.querySelector('#modal .card');if(!c)return false;const before=c.scrollTop;c.scrollTop+=c.clientHeight*0.9;return c.scrollTop!==before},i);if(!more)break;await w(150);await grab('settings'+i)}
 await pg.evaluate(()=>document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show')));await w(200);

 const hold=async sel=>{const r=await pg.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();return {x:b.x+Math.min(20,b.width/2),y:b.y+b.height/2}},sel);if(!r)return false;await pg.mouse.move(r.x,r.y);await pg.mouse.down();await w(1000);await pg.mouse.up();await w(500);return true};
 const close=async()=>{await pg.evaluate(()=>{try{lpCancel()}catch(e){};document.querySelectorAll('.modal.show,#lpMenu.show').forEach(m=>m.classList.remove('show'))});await w(300)};
 const th=await hold('.ntab:not(.nadd1)');await grab('tabmenu');await close();
 await pg.evaluate(()=>{const t=[...document.querySelectorAll('.ntab')][3];t&&t.click()});await w(600);
 const fd=await hold('.nfo');await grab('foldermenu');await close();
 await pg.evaluate(()=>{const t=[...document.querySelectorAll('.ntab')][0];t&&t.click()});await w(600);
 const nm=await hold('#notesList li, .nlist li, li[data-id]');await grab('notemenu');await close();
 console.log(l,'notemenu:',nm);
 for(const id of ['tabModal','pinModal','alModal','voiceModal','recModal','prModal']){await pg.evaluate(id=>{document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));const m=document.getElementById(id);m&&m.classList.add('show')},id);await w(200);await grab(id)}
 console.log(l,'tabmenu:',th,'foldermenu:',fd,'errors:',errs.length?errs:'none');if(errs.length)fails++;await ctx.close()}
await b.close();console.log(fails?'RUNTIME FAIL '+fails:'RUNTIME OK');process.exit(fails?1:0)})();
