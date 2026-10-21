const fs=require('fs');const L=process.argv.slice(2);let tot=0;
const ok=new Set(['Notis','NOTIS','Internet','Auto','Normal','Gaz','PIN','OK','Ok','Pro','JARVIS','Wi-Fi','URL','Email','E-mail','Total','Simplu']);
for(const l of L){const ctx={};new Function('ctx',fs.readFileSync('i18n/'+l+'.js','utf8').replace('NOTIS_I18N=','ctx.D=').replace(/NOTIS_I18N_RX=/,'ctx.R='))(ctx);
 const bad=Object.entries(ctx.D).filter(([k,v])=>{if(l==='ro')return false;const t=v.replace(/<[^>]*>/g,'');if(/[ăâîșțşţĂÂÎȘȚ]/.test(t)&&!['ro'].includes(l))return true;
  return k===v&&/\p{L}{4}/u.test(k)&&!ok.has(k.trim())&&!/^[\W\d]*[A-Z][\w-]*[\W\d]*$/.test(k)});
 console.log(l,Object.keys(ctx.D).length,'suspect',bad.length);if(process.env.V)bad.slice(0,+process.env.V).forEach(b=>console.log('  ',JSON.stringify(b).slice(0,160)));tot+=bad.length}
