// static i18n audit: every TR literal + every static HTML text/attr must translate in every language; list unwrapped UI-looking literals
const acorn=require('acorn'),walk=require('acorn-walk'),fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('/workspace/notis/index.html','utf8');
const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const core=blocks[1].split('/* DOM pass')[0].replace("document.documentElement.lang=NL;","").replace("document.documentElement.dir=NOTIS_RTL[NL]?'rtl':'ltr';","").replace(/if\(NL!=='ro'\)document\.write[^\n]*/,'');
const LANGS=(process.argv[2]||'en,fr,de,it,hu,ru').split(',');const ALLOW=new Set(JSON.parse(fs.readFileSync(__dirname+'/i18n/allow.json','utf8')));
const src=blocks.reduce((a,b)=>b.length>a.length?b:a,'');const ast=acorn.parse(src,{ecmaVersion:2022});
const d0s=src.indexOf('var D0='),d0e=src.indexOf('D0.notes.forEach');
const trLits=new Set(),raw=new Map();
walk.fullAncestor(ast,(n,anc)=>{if(n.type!=='Literal'||typeof n.value!=='string')return;if(n.start>d0s&&n.start<d0e)return;const p=anc[anc.length-2];
 if(p.type==='CallExpression'&&p.callee.type==='Identifier'&&p.callee.name==='TR'){trLits.add(n.value);return}
 raw.set(n.value,(raw.get(n.value)||0)+1)});
// static HTML (outside scripts/styles)
const body=html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g,'');
const stat=new Set();for(const m of body.matchAll(/>([^<>]+)</g)){const v=m[1].replace(/&amp;/g,'&').replace(/&nbsp;/g,'\u00a0').replace(/&#39;/g,"'").replace(/&quot;/g,'"');if(/\p{L}{2}/u.test(v))stat.add(v)}
for(const m of body.matchAll(/(?:aria-label|title|placeholder|alt)="([^"]+)"/g))if(/\p{L}{2}/u.test(m[1]))stat.add(m[1].replace(/&amp;/g,'&'));
// html fragments inside JS literals: text between tags
const un=x=>x.replace(/&amp;/g,'&').replace(/&nbsp;/g,'\u00a0');const frag=new Set();for(const v of [...raw.keys(),...trLits])if(/</.test(v)){for(const m of v.matchAll(/>([^<>]+)</g))if(/\p{L}{2}/u.test(m[1]))frag.add(un(m[1]));for(const m of v.matchAll(/(?:aria-label|title|placeholder|alt)="([^"]+)"/g))if(/\p{L}{2}/u.test(m[1]))frag.add(m[1])}
let bad=0;
for(const l of LANGS){const ctx={navigator:{language:l},localStorage:{getItem:()=>l},document:{}};vm.createContext(ctx);vm.runInContext(core.replace('var NOTIS_I18N={},NOTIS_I18N_RX=[];','')+'\n;'+fs.readFileSync(`/workspace/notis/i18n/${l}.js`,'utf8')+';var NOTIS_I18N_RX=typeof NOTIS_I18N_RX!=="undefined"?NOTIS_I18N_RX:[];',ctx);
 const miss=[],missK=[];const chk=(v,why)=>{const t=v.trim();if(!/\p{L}{2}/u.test(t)||ALLOW.has(t))return;const r=ctx.TR.x(v);if(r==null){missK.push(v);}if(r==null)miss.push(why+' '+JSON.stringify(v).slice(0,110))};
 trLits.forEach(v=>{if(!/</.test(v))chk(v,'TR')});stat.forEach(v=>chk(v,'HTML'));frag.forEach(v=>chk(v,'FRAG'));
 console.log(l+': missing '+miss.length);if(process.env.DUMP)fs.writeFileSync(process.env.DUMP,JSON.stringify(missK,null,0));miss.forEach(x=>console.log('   '+x));bad+=miss.length}
if(process.argv[3]==='raw'){// unwrapped literals that look like UI text
 const X=/^[\w$.#\-\[\]=:'" ,>*()%\/]+$/;
 [...raw.keys()].filter(v=>!/</.test(v)&&/\p{L}{3}/u.test(v)&&(/[ăâîșțĂÂÎȘȚ]/.test(v)||/^[A-ZĂÂÎȘȚ][a-zăâîșț]+( [a-zăâîșț]+)*[.!…]?$/.test(v)||/\p{L}{3,} \p{L}{2,}/u.test(v))&&!/[{};=]|=>|\(|px|rgba|var\(/.test(v)).sort().forEach(v=>console.log('RAW',JSON.stringify(v)))}
console.log(bad?'FAIL '+bad:'STATIC OK');process.exit(bad?1:0)
