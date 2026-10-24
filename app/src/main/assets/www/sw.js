/* Notis service worker: app shell cache. HTML = network-first (updates arrive), static = cache-first.
   Voice model files (Mihai, own cache "jarvis-piper-v1") and weather (Open-Meteo) are NOT touched: passed straight to the network. */
var VERSION='notis-shell-v114';
var SHELL=['./','index.html','manifest.webmanifest?v=86','icons/sc-new-96.png','icons/sc-search-96.png','icons/sc-cart-96.png',
 'icons/favicon.png?v=86','icons/icon-192.png?v=86','icons/classic-icon-192.png?v=86','icons/icon-512.png?v=86','icons/apple-touch-icon.png?v=86','icons/notis-96.png','icons/jarvis-96.png','art/jad-t.svg','art/jad-b.svg','art/lac-t.svg','art/lac-b.svg','art/tus-t.svg','art/tus-b.svg','art/paper.svg','art/neon-b.svg','art/papyrus.svg','art/pap-t.svg','art/pap-b.svg','art/m-sakura.svg','art/lup-d.webp','art/lup-l.webp','art/salon-marble.svg','art/cleo-q.svg','art/cleo-b.svg','art/cleo-l.svg','art/cleo-pap.svg','art/bg-lup-t.webp','art/bg-mist-t.webp','art/bg-forest-t.webp','art/bg-lake-t.webp','art/bg-sea-t.webp','art/bg-snow-t.webp','art/bg-night-t.webp','art/spl-new.webp','art/spl-classic.webp','art/hdr-new@1x.webp','art/hdr-new@2x.webp','art/hdr-new@3x.webp','art/hdr-classic@1x.webp','art/hdr-classic@2x.webp','art/hdr-classic@3x.webp','art/ic-ren@1x.webp','art/ic-ren@2x.webp','art/ic-ren@3x.webp','art/ic-mv@1x.webp','art/ic-mv@2x.webp','art/ic-mv@3x.webp','art/demo-draw.webp','art/demo-rec.m4a','snd/clopotel.mp3','snd/marimba.mp3','snd/digital.mp3','snd/dimineata.mp3','snd/harpa.mp3','snd/urgent.mp3','fonts/cinzel-latin-ext.woff2','fonts/oswald-500-cyrillic-ext.woff2','fonts/oswald-500-cyrillic.woff2','fonts/oswald-500-latin-ext.woff2','fonts/oswald-500-latin.woff2','fonts/oswald-500-vietnamese.woff2','fonts/barlowcondensed-400-latin-ext.woff2','fonts/barlowcondensed-400-latin.woff2','fonts/inter-400-cyrillic.woff2','fonts/inter-400-greek.woff2','fonts/inter-400-latin-ext.woff2','fonts/inter-400-latin.woff2','fonts/lora-400-cyrillic.woff2','fonts/lora-400-latin-ext.woff2','fonts/lora-400-latin.woff2','fonts/nunito-400-cyrillic.woff2','fonts/nunito-400-latin-ext.woff2','fonts/nunito-400-latin.woff2','i18n/en.js','i18n/fr.js','i18n/de.js','i18n/it.js','i18n/hu.js','i18n/ru.js','manifest-en.webmanifest','manifest-fr.webmanifest','manifest-de.webmanifest','manifest-it.webmanifest','manifest-hu.webmanifest','manifest-ru.webmanifest'];
var FONT_HOSTS=/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//,DSEG=/^https:\/\/cdn\.jsdelivr\.net\/npm\/dseg@/;
self.addEventListener('install',function(e){e.waitUntil(caches.open(VERSION).then(function(c){
 return Promise.all(SHELL.map(function(u){return c.add(new Request(u,{cache:'reload'})).catch(function(){})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){
 return Promise.all(ks.filter(function(k){return /^notis-shell-/.test(k)&&k!==VERSION}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
function strip(u){var x=new URL(u);x.search='';x.hash='';return x.href}
self.addEventListener('fetch',function(e){var r=e.request;var url=r.url;
 if(r.method!=='GET')return;var same=url.indexOf(self.registration.scope)===0;
 if(same){var path=new URL(url).pathname;
  if(r.mode==='navigate'||/\.html$|\/$/.test(path)){ /* network-first */
   e.respondWith(fetch(r).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(VERSION).then(function(c){c.put(strip(url),cp)})}return res}).catch(function(){
    return caches.open(VERSION).then(function(c){return c.match(strip(url)).then(function(h){return h||c.match(/blank\.html$/.test(path)?'blank.html':'index.html',{ignoreSearch:true})})})}));return}
  if(/\.js$/.test(path)&&/sw\.js$/.test(path))return;
  if(/(news|creator)\.json$/.test(path)){ /* network-first — never sticky-stale */
   var fresh=/[?&]fresh=/.test(url); /* manual refresh: no cache fallback, so the app can report the failure */
   e.respondWith(fetch(r,fresh?{cache:'no-store'}:undefined).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(VERSION).then(function(c){c.put(strip(url),cp)})}return res}).catch(function(err){
    if(fresh)throw err;return caches.open(VERSION).then(function(c){return c.match(strip(url))})}));return}
  e.respondWith(caches.open(VERSION).then(function(c){return c.match(strip(url)).then(function(h){return h||fetch(r).then(function(res){if(res&&res.ok)c.put(strip(url),res.clone());return res})})}));return}
 if(FONT_HOSTS.test(url)||DSEG.test(url)){ /* fonts: cache-first */
  e.respondWith(caches.open(VERSION).then(function(c){return c.match(url).then(function(h){return h||fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque'))c.put(url,res.clone());return res})})}));return}
 /* everything else (Mihai voice files, onnxruntime, Open-Meteo, geocoding…) -> untouched network */
});
self.addEventListener('notificationclick',function(e){e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){for(var i=0;i<cs.length;i++)if('focus' in cs[i])return cs[i].focus();return self.clients.openWindow('./')}))});
