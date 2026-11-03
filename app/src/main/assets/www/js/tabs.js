/* Notis module: tabs — Constante app + ordinea taburilor, urgențe. See MODULES.md */
'use strict';
var CREATOR_CONTACT='cluj1313@gmail.com';
var NOTIS_TIER='Free',NOTIS_WEB_REL='v198';
var URG_ICONS=['⚡','⚠️','📯','❗','‼️','🚨','🚀','🧨','📢','📣','🪙','⏰','💣','🔴','⭕','❌','🚫','♨️','☣️','☢️'];
window.ntFixCur=function(){var t=findNT(noteTab);if(t&&!t.off)return;var v=noteTabs.filter(function(x){return !x.off})[0];if(v){noteTab=v.id;LS.set('ns_notetab',noteTab)}};
window.urgPre=function(n){if(!n||n.del)return '';var t=findNT(n.tab);if(!isUrgTab(t))return '';return '<span class="upre" aria-hidden="true">'+esc(LS.get('ns_urgico','🚨'))+'</span> '};

