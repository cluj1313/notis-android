// v57 auto-backup: (1) version change -> backup before migration, data intact; (2) simulated failing migration -> auto-restore, data intact;
const CUR=require('fs').readFileSync('/workspace/notis/index.html','utf8').match(/NOTIS_WEBV='(\d+)'/)[1]+'|2.2.0';
// (3) Settings list shows automatic backups, restore works; (4) same version -> no new backup.
const p=require('puppeteer-core');const w=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;const ok=(c,m)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const now=new Date().toISOString();
 const NOTES=JSON.stringify([{id:'A',tab:'t1',text:'Notița mea importantă\ncu detalii',ts:1,createdAt:now,updatedAt:now},{id:'B',tab:'t1',text:'A doua',ts:2,createdAt:now,updatedAt:now}]);
 const sig=j=>{try{return JSON.parse(j).map(n=>n.id+':'+n.text).sort().join('|')}catch(e){return 'ERR'}};
 const TABS=JSON.stringify([{id:'t1',name:'Ale mele'}]);
 async function page(seed){const ctx=await b.createBrowserContext();const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.evaluateOnNewDocument((seed,NOTES,TABS)=>{Object.defineProperty(navigator,'language',{get:()=>'ro-RO'});
   window.__nat=JSON.parse(sessionStorage.getItem('__nat')||'{}');
   window.NotisNative={isNative:()=>true,version:()=>'2.2.0',saveSnapshot:()=>{},setLang:()=>{},peekPending:()=>'[]',ackPending:()=>{},
    autoBackup:(id,j)=>{__nat[id]=j;const ks=Object.keys(__nat).sort().reverse();ks.slice(5).forEach(k=>delete __nat[k]);sessionStorage.setItem('__nat',JSON.stringify(__nat));return true},
    autoBackups:()=>JSON.stringify(Object.keys(__nat).map(k=>{const r=JSON.parse(__nat[k]);return {id:k,ts:r.ts,reason:r.reason,from:r.from,to:r.to}})),
    autoBackupGet:id=>__nat[id]||''};
   if(!sessionStorage.getItem('__seeded')&&seed){sessionStorage.setItem('__seeded','1');localStorage.clear();localStorage.setItem('ns_notes',NOTES);localStorage.setItem('ns_notetabs',TABS);localStorage.setItem('ns_notetab','"t1"');localStorage.setItem('notis_demo_offered','1');
    if(seed.last)localStorage.setItem('ns_lastver',seed.last);if(seed.fail)localStorage.setItem('ns_test_failmig','1')}},seed,NOTES,TABS);
  return {ctx,pg,errs}}
 // 1) update 56 -> 57: backup made before migration, data intact
 {const {ctx,pg}=await page({last:'56|2.1.1'});await pg.goto('http://localhost:8766/?nt_test=1',{waitUntil:'networkidle0'});await w(1500);
  const r=await pg.evaluate(()=>({nat:Object.keys(__nat),rec:Object.values(__nat).map(j=>JSON.parse(j)),notes:localStorage.getItem('ns_notes'),last:localStorage.getItem('ns_lastver'),pre:!!localStorage.getItem('ns_premig'),shown:document.getElementById('notesList').textContent}));
  ok(r.nat.length===1,'update: one native auto-backup written ('+r.nat+')');
  ok(r.rec[0]&&r.rec[0].raw.ns_notes===NOTES&&r.rec[0].from==='56|2.1.1'&&r.rec[0].to===CUR,'update: backup holds the exact pre-update notes, from 56 → 57');
  ok(r.rec[0]&&Array.isArray(r.rec[0].photos),'update: backup completed with photos/recordings array');
  ok(sig(r.notes)===sig(NOTES)&&r.shown.includes('Notița mea importantă'),'update: user notes intact and shown');
  ok(r.last===CUR&&r.pre,'update: last-good version recorded, pre-migration copy kept');
  await pg.reload({waitUntil:'networkidle0'});await w(1000);
  ok((await pg.evaluate(()=>Object.keys(__nat).length))===1,'same version again: no extra backup');
  // settings list + restore
  await pg.evaluate(()=>{const n=JSON.parse(localStorage.getItem('ns_notes'));n[0].text='MODIFICAT';localStorage.setItem('ns_notes',JSON.stringify(n))});await pg.reload({waitUntil:'networkidle0'});await w(900);
  await pg.evaluate(()=>document.querySelector('.ntop h2').click());await w(800);
  const rows=await pg.evaluate(()=>[...document.querySelectorAll('#abList .bkrow')].map(r=>r.textContent));ok(rows.length>=1&&/actualizare/.test(rows[0]),'settings: "Backup-uri automate" lists it: '+rows[0]);
  pg.on('dialog',d=>d.accept());await pg.evaluate(()=>{const r=[...document.querySelectorAll('#abList .bkrow')].pop();r.querySelector('button').click()});await w(2500);
  const after=await pg.evaluate(()=>({notes:localStorage.getItem('ns_notes'),n:Object.keys(__nat).length}));
  ok(sig(after.notes)===sig(NOTES),'restore: notes back to the pre-update state');ok(after.n===2,'restore: safety backup of the current state made first ('+after.n+')');
  await ctx.close()}
 // 2) failing migration -> auto-restore
 {const {ctx,pg,errs}=await page({last:'56|2.1.1',fail:true});await pg.goto('http://localhost:8766/?nt_test=1',{waitUntil:'networkidle0'}).catch(()=>{});await w(3000);
  const r=await pg.evaluate(()=>({notes:localStorage.getItem('ns_notes'),tabs:localStorage.getItem('ns_notetabs'),fail:localStorage.getItem('ns_migfail'),last:localStorage.getItem('ns_lastver'),nat:Object.keys(__nat).length}));
  ok(errs.some(e=>/simulated migration failure/.test(e)),'fail: migration really threw');
  ok(r.notes===NOTES&&r.tabs===TABS,'fail: notes + tabs restored byte-for-byte after the failed migration');
  ok(!!r.fail&&r.last==='56|2.1.1','fail: failure recorded, version NOT marked good (will retry safely)');
  ok(r.nat===1,'fail: pre-migration native backup exists (no duplicate on retry)');
  // migration fixed -> next start works with the data
  await pg.evaluate(()=>{localStorage.removeItem('ns_test_failmig');sessionStorage.removeItem('ns_abreload')});await pg.reload({waitUntil:'networkidle0'});await w(1200);
  const r2=await pg.evaluate(()=>({shown:document.getElementById('notesList').textContent,last:localStorage.getItem('ns_lastver')}));
  ok(r2.shown.includes('Notița mea importantă')&&r2.last===CUR,'fail: after the fix the app boots with the original notes');
  await ctx.close()}
 console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0)})();
