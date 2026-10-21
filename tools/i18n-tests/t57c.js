// 2.2.0 "Citește" speaks the app language via native system TTS; Mihai only for RO; missing voice -> translated dialog + install button
const p=require('puppeteer-core');const w=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
async function run(b,lang,voices){const ctx=await b.createBrowserContext();const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.emulate({viewport:{width:360,height:740,deviceScaleFactor:1,isMobile:true,hasTouch:false},userAgent:'Mozilla/5.0 (Linux; Android 14) Mobile'});
 await pg.evaluateOnNewDocument((l,vs)=>{localStorage.setItem('notis_lang',l);localStorage.setItem('notis_demo_offered','1');window.__log=[];
  window.NotisNative={isNative:()=>true,saveSnapshot:()=>{},setLang:()=>{},peekPending:()=>'[]',ackPending:()=>{},version:()=>'2.2.0',
   ttsState:()=>2,ttsVoices:x=>{__log.push(['voices',x]);return JSON.stringify(vs)},ttsSpeak:(t,v,x,r,pi,id)=>{__log.push(['speak',t,v,x]);setTimeout(()=>{notisTtsEv(id,'start',0,0);setTimeout(()=>notisTtsEv(id,'done',0,0),50)},20);return true},
   ttsStop:()=>__log.push(['stop']),ttsInstall:()=>{__log.push(['install']);return true}}},lang,voices);
 await pg.goto('http://localhost:8766/',{waitUntil:'networkidle0'});await w(1500);
 await pg.evaluate(()=>document.getElementById('bRead').click());await w(1500);
 const r=await pg.evaluate(()=>({log:__log,cf:document.getElementById('cfModal').classList.contains('show'),txt:document.querySelector('#cfModal .cftxt').textContent,okb:document.getElementById('cfOk').textContent}));
 let r2=null;if(r.cf){await pg.evaluate(()=>document.getElementById('cfOk').click());await w(300);r2=await pg.evaluate(()=>__log.slice())}
 await pg.evaluate(()=>{document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));document.querySelector('.ntop h2')&&document.querySelector('.ntop h2').click()});await w(800);
 const st=await pg.evaluate(()=>({eng:[...document.querySelectorAll('#sEngine option')].map(o=>o.value),vo:[...document.querySelectorAll('#sVoice option')].map(o=>o.textContent),hint:(document.getElementById('vHint')||{}).textContent,dl:document.getElementById('sVoiceDl').textContent,fv:getComputedStyle(document.getElementById('fVoice')).display}));
 await pg.evaluate(()=>document.getElementById('sVoiceDl').click());await w(200);const inst=await pg.evaluate(()=>__log.some(x=>x[0]==='install'));
 await ctx.close();return {r,r2,st,inst,errs}}
(async()=>{const b=await p.launch({protocolTimeout:600000,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 let x=await run(b,'fr',[{name:'fr-fr-x-frc-local',lang:'fr-FR',net:false,installed:true,quality:400},{name:'de-de-x-deb-local',lang:'de-DE',net:false,installed:true,quality:400}]);
 const sp=x.r.log.filter(l=>l[0]==='speak');
 ok(sp.length>0&&sp.every(l=>l[3]==='fr'&&l[2]==='fr-fr-x-frc-local'),'fr: read aloud uses native TTS, lang fr, French voice ('+(sp[0]||[]).slice(1,4).join(' | ').slice(0,90)+')');
 ok(!x.r.cf,'fr: no missing-voice dialog when a French voice exists');
 ok(x.st.eng.join()==='browser','fr: Mihai (Piper) not offered outside Romanian — engines: '+x.st.eng.join());
 ok(x.st.vo.length===2&&/fr-fr-x-frc/.test(x.st.vo[1])&&!x.st.vo.some(v=>/de-de/.test(v)),'fr: Setări → Voix lists only French voices: '+x.st.vo.join(' / '));
 ok(x.st.fv!=='none'&&/1/.test(x.st.hint),'fr: voice list visible, hint "'+x.st.hint+'", button "'+x.st.dl+'"');
 ok(x.inst,'fr: "'+x.st.dl+'" opens the native install-voice intent');ok(!x.errs.length,'fr: no page errors '+x.errs.join(';'));
 x=await run(b,'ja',[{name:'fr-fr-x-frc-local',lang:'fr-FR',net:false,installed:true}]);
 ok(x.r.cf&&!x.r.log.some(l=>l[0]==='speak'),'ja (no Japanese voice): dialog shown, nothing spoken: "'+x.r.txt+'" ['+x.r.okb+']');
 ok(x.r2&&x.r2.some(l=>l[0]==='install'),'ja: dialog button opens install-voice intent');ok(/[\u3040-\u30ff\u4e00-\u9fff]/.test(x.r.txt)&&!/[A-Za-z]{4,}/.test(x.r.txt+x.r.okb),'ja: dialog text is Japanese');
 x=await run(b,'ro',[{name:'ro-ro-x-vfv-local',lang:'ro-RO',net:false,installed:true}]);
 ok(x.st.eng.includes('mihai')&&x.st.eng.includes('browser'),'ro: Mihai (Piper) still offered for Romanian: '+x.st.eng.join());
 x=await run(b,'he',[{name:'iw-il-x-heb-local',lang:'iw-IL',net:false,installed:true}]);
 ok(x.r.log.some(l=>l[0]==='speak'&&l[3]==='he'),'he: legacy iw-IL voice matched for Hebrew');
 x=await run(b,'zh-Hant',[{name:'cmn-cn',lang:'zh-CN',net:false,installed:true},{name:'yue-hk',lang:'zh-HK',net:false,installed:true}]);
 ok(x.r.log.filter(l=>l[0]==='speak').every(l=>l[2]==='yue-hk')&&x.r.log.some(l=>l[0]==='speak'),'zh-Hant: Traditional (HK/TW) voice chosen, not zh-CN');
 console.log(fails?'FAILED '+fails:'ALL PASS');await b.close();process.exit(fails?1:0)})();
