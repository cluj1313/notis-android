// Play Store phone screenshots 1080x1920 (360x640 @3x) from demo mode, per language
const p=require('puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const w=ms=>new Promise(r=>setTimeout(r,ms));const OUT=process.argv[3];
for(const lang of (process.argv[2]||'ro,en').split(',')){
 const scene=async(n,theme,fn)=>{const ctx=await b.createBrowserContext();const pg=await ctx.newPage();
  await pg.emulate({viewport:{width:360,height:640,deviceScaleFactor:3,isMobile:true,hasTouch:true},userAgent:'Mozilla/5.0 (Linux; Android 14) Mobile'});
  await pg.evaluateOnNewDocument((l,t)=>{Object.defineProperty(navigator,'language',{get:()=>l});localStorage.setItem('notis_lang',l);localStorage.setItem('notis_demo','1');localStorage.setItem('notis_demo_offered','1');localStorage.setItem('ns_theme',JSON.stringify(t))},lang,theme);
  await pg.goto('http://localhost:8766/',{waitUntil:'networkidle0'});await w(1200);
  await pg.addStyleTag({content:'#demoBan{display:none!important}'});
  if(theme!=='color'){await pg.evaluate(()=>document.querySelector('.ntop h2').click());await w(700);await pg.evaluate(t=>document.querySelector('#thRow .thc[data-th="'+t+'"]').click(),theme);await w(400);await pg.evaluate(()=>document.getElementById('sCancel').click());await w(700)}
  const click=async s=>{await pg.evaluate(s=>{const e=document.querySelector(s);e&&e.click()},s);await w(600)};
  if(fn)await fn(pg,click);
  await pg.screenshot({path:`${OUT}/${lang}-${n}.png`});await ctx.close()};
 await scene('1-notes','color');
 await scene('2-checklist','color',async(pg,c)=>{const tabs=await pg.evaluate(()=>document.querySelectorAll('#noteTabs .ntab:not(.nadd1)').length);
  for(let i=0;i<tabs;i++){const hit=await pg.evaluate(i=>{[...document.querySelectorAll('#noteTabs .ntab:not(.nadd1)')][i].click();return true},i);await w(600);
   const ok=await pg.evaluate(()=>{const li=[...document.querySelectorAll('#notesList li.note')].find(x=>/☑/.test(x.textContent));if(li){li.click();return true}return false});if(ok){await w(700);break}}});
 await scene('3-reminder','color',async(pg,c)=>{await c('#notesList li.note');await c('#nfAlarm')});
 await scene('4-vip','vip');
 await scene('5-light','light');
 await scene('6-settings','dark',async(pg,c)=>{await c('.ntop h2')});
}
await b.close()})();
