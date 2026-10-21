const acorn=require('acorn'),walk=require('acorn-walk'),fs=require('fs');
const html=fs.readFileSync('/workspace/notis/index.html','utf8');
const src=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).reduce((a,b)=>b.length>a.length?b:a,'');const ast=acorn.parse(src,{ecmaVersion:2022});
const d0s=src.indexOf('var D0='),d0e=src.indexOf('D0.notes.forEach');const out=new Map();
walk.fullAncestor(ast,(n,anc)=>{if(n.type!=='Literal'||typeof n.value!=='string')return;if(n.start>d0s&&n.start<d0e)return;
 if(anc.some(a=>a.type==='CallExpression'&&a.callee.type==='Identifier'&&a.callee.name==='TR'))return;
 const p=anc[anc.length-2];if(p.type==='Property'&&p.key===n)return;if(p.type==='BinaryExpression'&&/[=!]=/.test(p.operator))return;if(p.type==='SwitchCase')return;
 if(p.type==='CallExpression'&&/^(console\.|localStorage|LS\.|document\.(querySelector|getElementById|createElement)|\$|.*addEventListener|.*setAttribute|.*getItem|.*setItem|.*closest|.*querySelector(All)?|.*classList\.|.*matches)$/.test(src.slice(p.callee.start,p.callee.end)))return;
 let v=n.value;// visible text pieces
 const pieces=/</.test(v)?[...v.matchAll(/>([^<>]*)</g)].map(m=>m[1]).concat(v.replace(/<[^>]*>/g,'\u0001').split('\u0001').slice(0,1)).concat([v.replace(/^[^<]*</,'<').replace(/<[^>]*>/g,'\u0001').split('\u0001').pop()]):[v];
 for(const t of pieces){if(!/\p{Lu}?\p{Ll}{2,}|\p{Lu}{3,}/u.test(t))continue;if(/^[a-z][\w-]*( [a-z][\w-]*)*$/.test(t))continue;if(/[{};]|=>|px\b|rgba?\(|var\(|^\.|^#|https?:|\.(js|json|webp|png|m4a)\b|^[\w.-]+$/.test(t)&&!/[ăâîșț]/.test(t))continue;
  out.set(t,(src.slice(Math.max(0,n.start-40),n.start)).replace(/\s+/g,' '))}});
if(process.env.L){const vm=require('vm');const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);const core=blocks[1].split('/* DOM pass')[0].replace("document.documentElement.lang=NL;","").replace("document.documentElement.dir=NOTIS_RTL[NL]?'rtl':'ltr';","").replace(/if\(NL!=='ro'\)document\.write[^\n]*/,'').replace('var NOTIS_I18N={},NOTIS_I18N_RX=[];','');
 const ctx={navigator:{language:process.env.L},localStorage:{getItem:()=>process.env.L},document:{}};vm.createContext(ctx);vm.runInContext(core+';'+fs.readFileSync('/workspace/notis/i18n/'+process.env.L+'.js','utf8'),ctx);
 const IGN=new Set(JSON.parse(fs.readFileSync(__dirname+'/i18n/rawignore.json','utf8')));let n=0;
 [...out].sort().forEach(([t,c])=>{const v=t.replace(/&amp;/g,'&');if(IGN.has(t)||/["=(){}<>\/:]|#|\bpx\b/.test(v)&&!/^[^"=(){}<>]*: *$/.test(v))return;if(ctx.TR.x(v)==null){n++;console.log('UNTR',JSON.stringify(t),'  ←',c.slice(-40))}});console.log(n?'RAW FAIL '+n:'RAW OK');process.exit(n?1:0)}
else [...out].sort().forEach(([t,c])=>console.log(JSON.stringify(t),'   ←',c.slice(-40)));
