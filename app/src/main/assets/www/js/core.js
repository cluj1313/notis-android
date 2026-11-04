/* Notis module: core — Nucleu: stocare (LS), i18n TR, notițe, taburi, editor, liste, cumpărături, urgențe, medicamente/alarme, voce, backup. See MODULES.md */
'use strict';
if(/[?&]nt_test=1/.test(location.search)&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&localStorage.getItem('ns_test_failmig')==='1'&&NOTIS_AB.changed){localStorage.removeItem('ns_notes');localStorage.setItem('ns_notetabs','[]');throw new Error('simulated migration failure')}
var $=function(id){return document.getElementById(id)};
var BLANK=false,PFX='';
/* v51: MOD DEMO — examples live in their own namespace ("demo:" keys + own photo DB); real data is never read or written while active */
/* shareable link: ?demo=1 opens straight in demo mode (?demo=0 leaves it) */
try{var qd=new URLSearchParams(location.search).get('demo');if(qd==='1'){localStorage.setItem('notis_demo','1');localStorage.setItem('notis_demo_offered','1')}else if(qd==='0')localStorage.removeItem('notis_demo');if(qd!==null){var u0=new URL(location.href);u0.searchParams.delete('demo');history.replaceState(null,'',u0.pathname+u0.search+u0.hash)}}catch(_){}
var DEMO=false;try{DEMO=localStorage.getItem('notis_demo')==='1'}catch(_){}
/* new users never inherit the owner's name: personal default only for an install that already has settings */
var NS_HASCFG=false;try{NS_HASCFG=!DEMO&&!!localStorage.getItem('ns_cfg')}catch(_){}
var DEMOV='10'+(NL==='ro'?'':':'+NL);
if(DEMO){PFX='demo:';try{if(localStorage.getItem('demo:ns_demov')!==DEMOV){Object.keys(localStorage).filter(function(k){return k.indexOf('demo:')===0}).forEach(function(k){localStorage.removeItem(k)});var D0={"tabs": [{"id": "u", "name": "URGENȚE", "color": "#ff6b6b"}, {"id": "c", "name": "Cumpărături", "color": "#ff9fd0"}, {"id": "conf", "name": "Plăți", "color": "#e0b84f", "lk": "{\"v\":1,\"salt\":\"v7KMoquGEUgz622Wl8OmoA==\",\"iv\":\"1zPx4v/HAr/BrxGx\",\"ct\":\"jM9BQkem8ZX2ZwKOPmX7HdyVlDpdaX27DhES/ZrM\"}"}, {"id": "d", "name": "Diverse", "color": "#9b8cff"}, {"id": "auto", "name": "Auto", "color": "#5fb8ff"}, {"id": "set", "name": "Setări", "color": "#7fd4ff"}, {"id": "ut", "name": "Utilități", "color": "#5fd38d"}, {"id": "med", "name": "Medicamente", "color": "#ff8a65", "kind": "med"}, {"id": "crm", "name": "CRM", "color": "#f5d76e", "kind": "crm"}], "notes": [{"id": "ch1", "tab": "crm", "text": "📇 Cum funcționează CRM\nDouă părți separate: Firmă și Acasă. Atinge + ca să adaugi un client sau 👥 ca să imporți din contacte.\nAtinge un telefon ca să suni: apelul se notează singur, iar la întoarcere poți scrie o notiță și o reamintire.\nStările (Nou, În discuție, Client, Inactiv) se pot redenumi, colora și reordona din ⚙. Poți pune și 🔒 PIN pe fiecare parte.", "pin": true}, {"id": "d1", "tab": "u", "text": "👋 Bun venit în Notis!\nAcesta e MODUL DEMO: notițele de aici sunt doar exemple, separate de ale tale. Ieși oricând din bannerul de sus sau din Setări → Mod demo.\nApasă pe o notiță ca s-o deschizi; ✔ (dreapta jos) salvează și închide.", "pin": true, "color": "#14304a"}, {"id": "d2", "tab": "u", "text": "📌 Fixează\nȚine apăsat pe o notiță sau pe un folder → 📌 Fixează (sau selectează mai multe și atinge 📌). Cele fixate stau primele în tab, despărțite de restul printr-o linie.", "pin": true}, {"id": "dn2", "tab": "u", "text": "💊 Medicamente\nÎn tabul Medicamente, dozele zilei sunt cercuri mici: le bifezi cu o atingere. Un tratament terminat apare cu roșu. „Toate” deschide biblioteca: Folosite, Nefolosite încă și Tratamente alternative, fiecare cu Simptome, Cum se administrează și Atenție. Ordine A–Z sau ↕ (ține apăsat ~1,5 s și trage)."}, {"id": "d26", "tab": "d", "text": "➕ Taburi: adaugă, redenumește, șterge\nAdaugă: atinge „+” de la capătul rândului de taburi (sus) → scrie numele → Salvează.\nRedenumește: ține apăsat pe tab → ✎ Redenumește.\nOrdine și culoare: ține apăsat pe tab → ✥ Mută, apoi trage taburile unde vrei; sau 🎨 Culoare.\nȘterge: ține apăsat pe tab → 🗑 Șterge tabul → confirmă. Atenție: notițele din tab se șterg odată cu el, așa că mută-le înainte (selecție → 📁)."}, {"id": "d27", "tab": "d", "text": "📁 Foldere în taburi\nÎn orice tab: butonul 📁 de sus (între Căutare și Listă) → Folder nou. Atinge un folder ca să intri; sus apare calea (ex. Diverse › Clienți › 2026): atinge un nume ca să urci, sau ‹ / butonul Înapoi al telefonului.\nȚine apăsat pe folder: Redenumește, 📌 Fixează, Mută, 🔒 Blochează, 🗑 Șterge (merge în coș și se poate reface). Folder în folder: intră în folder și atinge butonul de folder de sus. Notițele noi create într-un folder rămân în el. Vezi exemplele din tabul Diverse."}, {"id": "dt1", "tab": "d", "text": "🔒 Tab blocat (date confidențiale)\nȚine apăsat pe un tab → 🔒 Blochează → alegi un PIN de 4 cifre. Tabul cere PIN când îl deschizi (atingere sau glisare) și se blochează din nou când pleci din el sau ieși din aplicație. În căutare, notițele lui apar doar după PIN; în widgeturi nu apar. Încearcă tabul „Plăți” — PIN demo: 1234."}, {"id": "d3", "tab": "c", "text": "✅ Selecție multiplă\nȚine apăsat pe o notiță, apoi atinge altele. Sus apare bara cu: ← ieșire, număr, 🎨 culoare, 📁 mută în alt tab, 📌 fixează, 🗑 coș, ⋮ (alarmă, editează, trimite, blochează, selectează tot)."}, {"id": "d4", "tab": "c", "text": "🎨 Culori\nSelectează notița → 🎨. Ai 16 culori care se adaptează temei (pastel pe Light, discrete pe temele închise). Și în editor: butonul 🎨 din bara de jos.", "color": "#3e2812"}, {"id": "d5", "tab": "d", "text": "🔍 Căutare\nLupa de sus caută peste tot: notițe, liste și foldere din toate taburile. Rezultatele arată rândul potrivit, cu cuvântul subliniat, și tabul de unde vine. Ce e blocat 🔒 apare și el, după ce introduci PIN-ul."}, {"id": "d6", "tab": "d", "text": "↕ Sortare\nButonul ≡ de sus: Alfabetic, Manual (trage cu degetul), Data creării, Data modificării — separat pentru fiecare tab. Tot acolo: 🗑 Coș de gunoi."}, {"id": "d7", "tab": "d", "text": "🗑 Coș de gunoi\nȘtergerea mută notița în coș (≡ → Coș de gunoi, sau din notiță: ≡ → Mută notița în coș). Din coș: ține apăsat → Reface. Coșul se golește singur după 30 de zile."}, {"id": "d8", "tab": "set", "text": "⚙ Setări\nAtinge NOTIS (sus stânga) → Setări: Limbă, Voce, Taburi, Design, Backup, Sunet alarmă, Comunică cu creatorul aplicației și Versiune. Notițele din acest tab explică fiecare parte."}, {"id": "d9", "tab": "set", "text": "🔊 Citește\nÎn notiță, butonul „Citește” (jos dreapta) citește textul cu voce. Ține apăsat pe el ca să alegi limba; apar doar vocile bifate în Setări → Voce. Viteza și tonul se reglează tot acolo."}, {"id": "d10", "tab": "set", "text": "↶ ↷ Anulează / Refă\nSăgețile din stânga jos (pe ecranul principal și în editor) anulează sau refac ultima modificare: ștergere, mutare, culoare, text."}, {"id": "d11", "tab": "c", "type": "check", "title": "Kaufland 🛒", "items": [{"id": "di11_0", "text": "Lapte", "done": false}, {"id": "di11_1", "text": "Pâine", "done": false}, {"id": "di11_2", "text": "Ouă", "done": false}, {"id": "di11_3", "text": "Roșii", "done": false}, {"id": "di11_4", "text": "Cafea", "done": true}, {"id": "di11_5", "text": "Detergent", "done": true}], "text": "Kaufland 🛒\nLapte\nPâine\nOuă\nRoșii\nCafea\nDetergent"}, {"id": "d12", "tab": "c", "type": "check", "title": "Lidl 🛒", "items": [{"id": "di12_0", "text": "Iaurt grecesc", "done": false}, {"id": "di12_1", "text": "Banane", "done": false}, {"id": "di12_2", "text": "Apă plată", "done": true}], "text": "Lidl 🛒\nIaurt grecesc\nBanane\nApă plată"}, {"id": "d13", "tab": "c", "type": "check", "title": "☑ Cum merg listele", "items": [{"id": "di13_0", "text": "Bifează un element → coboară automat jos, tăiat", "done": false}, {"id": "di13_1", "text": "Ține apăsat și trage ca să schimbi ordinea", "done": false}, {"id": "di13_2", "text": "Scrie pe ultimul rând gol ca să adaugi", "done": false}, {"id": "di13_3", "text": "Element bifat (îl debifezi cu o atingere)", "done": true}], "text": "☑ Cum merg listele\nBifează un element → coboară automat jos, tăiat\nȚine apăsat și trage ca să schimbi ordinea\nScrie pe ultimul rând gol ca să adaugi\nElement bifat (îl debifezi cu o atingere)"}, {"id": "d14", "tab": "u", "text": "⏰ Alarme și mementouri\nÎn notiță → butonul ⏰ (bara de jos): alegi ora, repetarea (zilnic/săptămânal…) și snooze. Alarma sună și cu aplicația închisă; ora apare în dreapta rândului.", "alarm": {"at": 0, "rep": 0}, "color": "#3d1a1c"}, {"id": "d15", "tab": "u", "text": "⚠️ Tab de urgențe\nUn tab cu nume și culoare proprie pentru ce e important. Creezi taburi cu „+”, le redenumești / colorezi / muți ținând apăsat pe tab."}, {"id": "d16", "tab": "u", "text": "🔒 Blocare\nȚine apăsat pe notiță → ⋮ → Blochează. Notița (și pozele ei) se criptează cu PIN; în listă apare doar titlul cu 🔒."}, {"id": "d17", "tab": "d", "type": "check", "title": "Listă rapidă", "items": [{"id": "di17_0", "text": "Buletin", "done": false}, {"id": "di17_1", "text": "Cablu + încărcător", "done": false}, {"id": "di17_2", "text": "Trusă de prim ajutor", "done": false}, {"id": "di17_3", "text": "Ochelari de soare", "done": false}], "text": "Listă rapidă\nBuletin\nCablu + încărcător\nTrusă de prim ajutor\nOchelari de soare"}, {"id": "d18", "tab": "set", "text": "📱 Widget Listă\nPe ecranul telefonului: ține apăsat → Widgeturi → Notis · Listă. Bifezi direct, „+” adaugă, ✕ întreabă „Vrei să ștergi?” Nu / Da. ⚙ = temă, ☰ = alegi lista (grupată pe taburi, se deschid/închid cu ▾)."}, {"id": "d19", "tab": "set", "text": "🗒 Widget Notițe\nNotis · Notițe arată un tab: atingi un rând ca să-l desfaci/strângi, ⏰ pune alarmă, „+” notiță nouă, ✕ Șterge (cu confirmare). ☰ alege tabul."}, {"id": "d20", "tab": "c", "text": "🚀 Scurtături pe iconiță\nȚine apăsat pe iconița Notis: Notiță nouă, Caută, Cumpărături — deschid direct acolo."}, {"id": "d21", "tab": "d", "type": "mix", "blocks": [{"t": "text", "v": "📷 Poze în notiță\nO singură poză apare pe toată lățimea:"}, {"t": "img", "ph": ["dp1"]}, {"t": "text", "v": "Mai multe poze apar ca miniaturi. Atinge una ca s-o mărești; ciupește cu două degete pentru zoom, glisează pentru următoarea:"}, {"t": "img", "ph": ["dp2", "dp3", "dp4"]}, {"t": "text", "v": "Ține apăsat pe o poză ca s-o ștergi. Butonul 🖼 din bara de jos adaugă poze (și decupare)."}], "text": "📷 Poze în notiță\nO singură poză apare pe toată lățimea:\nMai multe poze apar ca miniaturi. Atinge una ca s-o mărești; ciupește cu două degete pentru zoom, glisează pentru următoarea:\nȚine apăsat pe o poză ca s-o ștergi. Butonul 🖼 din bara de jos adaugă poze (și decupare).", "color": "#0f3a33"}, {"id": "d22", "tab": "d", "type": "mix", "blocks": [{"t": "text", "v": "🛠 Notiță mixtă: text + listă + poze"}, {"t": "chk", "items": [{"id": "di22_0", "text": "Comandă stofă", "done": false}, {"id": "di22_1", "text": "Sună clientul", "done": false}, {"id": "di22_2", "text": "Măsurători făcute", "done": true}]}, {"t": "text", "v": "Bara de jos stă deasupra tastaturii: ↶ ↷, 📎 atașează (imagine, poză, desen, înregistrare), ☑ listă, 🎨 culoare, 📁 mută, ⏰ alarmă, Citește."}], "text": "🛠 Notiță mixtă: text + listă + poze\nBara de jos stă deasupra tastaturii: ↶ ↷, 📎 atașează (imagine, poză, desen, înregistrare), ☑ listă, 🎨 culoare, 📁 mută, ⏰ alarmă, Citește."}, {"id": "d23", "tab": "d", "text": "📁 Mută între taburi și foldere\nSelectează una sau mai multe notițe → 📁 → alege tabul sau folderul (folderele apar sub tabul lor, cu subfolderele indentate). Tot acolo: ＋ Folder nou. Sau din editor: butonul 📁."}, {"id": "d24", "tab": "set", "text": "Notis – aplicația ta de notițe\nMerge offline, se instalează ca aplicație (Android sau din browser) și ține totul pe telefon. Fă backup din Setări → Backup."}, {"id": "d25", "tab": "set", "text": "Rânduri mai compacte\nSetări → Spațiu între notițe: de la 0 (foarte compact) la 14 px."}, {"id": "d28", "tab": "d", "text": "✏️ Desen și 🎙 Înregistrare\nÎn notiță → 📎 (bara de jos) → Desen: desenezi cu degetul (culori, 3 grosimi, radieră, ↶ anulează), Salvează → apare ca imagine în notiță.\n📎 → Înregistrare: pornește imediat, ■ Stop salvează. Se redă direct din notiță cu ▶; × o șterge. Exemple: folderul Proiecte."}, {"id": "d29", "tab": "d", "text": "🔒 Folderul „Privat”\nE un folder blocat: cere PIN la deschidere, iar în căutare notițele lui apar doar după PIN. În demo, PIN-ul este 1234."}, {"id": "d30", "tab": "d", "text": "Maria P. – rochie de seară\nProbă: joi, 17:00\nStofă: satin bleumarin, 3 m", "fd": "df_cli", "color": "#2a1838"}, {"id": "d31", "tab": "d", "text": "Ion D. – costum\nMăsuri luate. De comandat căptușeala.", "fd": "df_cli"}, {"id": "d32", "tab": "d", "text": "📁 Foldere în foldere\nEști în Diverse › Clienți › 2026. Poți face oricâte niveluri: intră într-un folder și atinge butonul de folder de sus. 📌 Fixează: ține apăsat pe un folder sau selectează notițe și atinge 📌.", "fd": "df_26"}, {"id": "d33", "tab": "d", "type": "check", "title": "Comenzi octombrie", "items": [{"id": "di33_0", "text": "Rochie Maria – probă", "done": false}, {"id": "di33_1", "text": "Costum Ion – căptușeală", "done": false}, {"id": "di33_2", "text": "Fustă plisată – gata", "done": true}], "text": "Comenzi octombrie\nRochie Maria – probă\nCostum Ion – căptușeală\nFustă plisată – gata", "fd": "df_oct"}, {"id": "d34", "tab": "d", "type": "mix", "blocks": [{"t": "text", "v": "🎨 Desen în notiță\nDesenat cu degetul în Notis (📎 → Desen):"}, {"t": "img", "ph": ["dp5"]}, {"t": "text", "v": "Atinge desenul ca să-l mărești."}], "text": "🎨 Desen în notiță\nDesenat cu degetul în Notis (📎 → Desen):\nAtinge desenul ca să-l mărești.", "fd": "df_proj"}, {"id": "d35", "tab": "d", "type": "mix", "blocks": [{"t": "text", "v": "🎙 Înregistrare în notiță\nApasă ▶ ca s-o asculți (exemplu: un clopoțel). Înregistrările tale se fac din 📎 → Înregistrare."}, {"t": "aud", "a": "da1", "dur": 4}, {"t": "text", "v": "Poți avea text, liste, poze și înregistrări în aceeași notiță."}], "text": "🎙 Înregistrare în notiță\nApasă ▶ ca s-o asculți (exemplu: un clopoțel). Înregistrările tale se fac din 📎 → Înregistrare.\nPoți avea text, liste, poze și înregistrări în aceeași notiță.", "fd": "df_proj"}, {"id": "d36", "tab": "d", "text": "🔓 Ai intrat în folderul blocat\nBlochezi orice folder: ține apăsat → 🔒 Blochează → alegi un PIN de 4 cifre. La ieșire, folderul se blochează din nou.", "fd": "df_priv"}, {"id": "dt2", "tab": "conf", "text": "🔓 Ai deschis tabul blocat\nAici ții date confidențiale: coduri, contracte, adrese. Deblocare definitivă: ține apăsat pe tab → 🔓 Deblochează (cere PIN)."}, {"id": "dt3", "tab": "conf", "type": "check", "title": "Acte de reînnoit", "items": [{"id": "dti1", "text": "Pașaport", "done": false}, {"id": "dti2", "text": "Asigurare mașină", "done": false}], "text": "Acte de reînnoit\nPașaport\nAsigurare mașină"}, {"id": "da1", "tab": "auto", "type": "check", "title": "🚗 Acte mașină", "items": [{"id": "da1_0", "text": "ITP – expiră pe 12 martie", "done": false}, {"id": "da1_1", "text": "RCA – reînnoit", "done": true}, {"id": "da1_2", "text": "Rovinietă", "done": false}], "text": "🚗 Acte mașină\nITP – expiră pe 12 martie\nRCA – reînnoit\nRovinietă"}, {"id": "da2", "tab": "auto", "text": "🔧 Revizie\nSchimb ulei și filtre la 15.000 km. Verifică plăcuțele de frână și presiunea în roți."}, {"id": "dp1", "tab": "conf", "type": "check", "title": "💡 Facturi lunare", "items": [{"id": "dp1_0", "text": "Curent", "done": true}, {"id": "dp1_1", "text": "Gaz", "done": false}, {"id": "dp1_2", "text": "Apă", "done": false}, {"id": "dp1_3", "text": "Internet", "done": true}], "text": "💡 Facturi lunare\nCurent\nGaz\nApă\nInternet"}, {"id": "dn1", "tab": "d", "text": "📤 Trimite o notiță\nÎn notiță, butonul de distribuire trimite un link scurt: mai întâi Notis, apoi WhatsApp, apoi orice altă aplicație. Cine are Notis o importă cu o atingere."}, {"id": "dn3", "tab": "d", "text": "🖼 Fundal și carduri\nSetări → Fundal: o imagine din listă, Culoare simplă (alegi orice culoare) sau Imagine din galerie (poza ta, salvată și în backup). Opacitate carduri: de la 0 (transparent) la 100 (opac)."}, {"id": "dn4", "tab": "d", "text": "👁 Previzualizare\nCât timp tragi un glisor în Setări, panoul devine transparent ca să vezi efectul. Butonul 👁 Previzualizare ascunde panoul de tot."}, {"id": "dn6", "tab": "d", "text": "📲 Distribuie\nÎn Setări: Distribuie aplicația trimite linkul de descărcare Notis, iar Distribuie Jarvis trimite linkul aplicației Jarvis."}, {"id": "mh1", "tab": "med", "text": "💊 Cum funcționează Medicamente\nCercurile 1 – 0 – 1 = dimineață, amiază, seară: atinge „1” când ai luat doza. Lista e ordonată după oră.\nAtinge numele medicamentului pentru fișă: Medicament, Mod de administrare, Program (zilnic, la X zile, la X ore, zile din săptămână) și Observații; ↗ Trimite o distribuie.\n„+” adaugă medicamente sau persoane; „Toate” deschide biblioteca.", "pin": true}, {"id": "uh1", "tab": "ut", "text": "📊 Cum funcționează Utilități\nAtinge o utilitate ca să-i vezi istoricul.\nCu index (Curent, Gaz, Apă): „+ Adaugă citire” cu indexul anterior și cel actual; Notis calculează consumul.\nDoar plată (Gunoi, Internet, Media): „+ Adaugă plată” cu sumă, notă și ⏰ Reamintire (lunar, la 2, 3 sau 6 luni, anual sau la X zile).\n⚙ = nume, unitate, monedă sau ștergere. Atinge un rând din istoric ca să-l corectezi sau să-l ștergi. „+ Utilitate nouă” adaugă alta.\nUtilități și Medicamente se arată sau se ascund din Setări → Taburi.\nAcasă / Firmă: sus alegi grupul; fiecare utilitate stă într-unul, pe care îl schimbi din ⚙.", "pin": true}, {"id": "ds1", "tab": "set", "text": "🗂 Setări → Taburi\nBiblioteca arată toate taburile, plus Utilități și Medicamente. Bifa = tabul apare sau nu pe pagina principală (nimic nu se șterge). Trage de ≡ ca să schimbi ordinea. Opțional, pui un PIN de 4 sau 6 cifre pe Bibliotecă, ca să nu se vadă taburile ascunse.\nTaburile precreate (Utilități, Medicamente) se mută cu ≡ și se ascund cu bifa, la fel ca celelalte."}, {"id": "ds2", "tab": "set", "text": "🚨 Iconiță urgență\nÎn Setări → Taburi, butonul de lângă tabul URGENȚE alege iconița pusă în fața notițelor urgente (🚨, ⚡, ❗, 📢 și altele)."}, {"id": "ds3", "tab": "set", "text": "🎨 Setări → Design\nAtinge un titlu ca să-l deschizi sau închizi: Teme, Stil taburi (Pilule sau Căsuțe), Fundal, Setări fine (intensitate fundal, spațiu între notițe, margine laterală, opacitate carduri) și Iconiță (Nouă sau Clasică). Notis ține minte ce ai lăsat deschis."}, {"id": "ds4", "tab": "set", "text": "🔔 Sunet alarmă\nSetări → Sunet alarmă: alege sunetul pentru alarme și mementouri. ▶ îl asculți înainte. În aplicația Android poți alege și un sunet din telefon sau un fișier audio."}, {"id": "ds5", "tab": "set", "text": "📣 Mesaje de la creator\nSetări → Comunică cu creatorul aplicației: cu bifa „Doresc să primesc mesaje de la creator” primești din când în când anunțuri scurte: noutăți, sfaturi și actualizări. O pornești sau o oprești oricând."}, {"id": "ds6", "tab": "set", "text": "✉️ Comunică cu creatorul aplicației\nÎn Setări scrii ce ai vrea schimbat sau adăugat, apoi atingi „Trimite mesajul”: se deschide aplicația de email. Fiecare utilizator primește un răspuns."}, {"id": "ds7", "tab": "set", "text": "ℹ️ Versiune\nUltimul rând din Setări arată versiunea. Atinge-l ca să verifici: ✓ Ultima versiune sau 🆕 Update nou. Dacă e un update, atinge-l din nou ca să-l instalezi."}, {"id": "ds8", "tab": "set", "text": "✎ Editează din widget\nÎn widgetul Listă, ✎ de pe un rând schimbă textul elementului. În widgetul Notițe, desfă o notiță și atinge ✎ Editează ca s-o modifici fără să deschizi aplicația."}], "folders": [{"id": "df_cli", "tab": "d", "parent": "", "name": "Clienți"}, {"id": "df_26", "tab": "d", "parent": "df_cli", "name": "2026"}, {"id": "df_oct", "tab": "d", "parent": "df_26", "name": "Octombrie"}, {"id": "df_proj", "tab": "d", "parent": "", "name": "Proiecte"}, {"id": "df_priv", "tab": "d", "parent": "", "name": "Privat", "lk": "{\"v\":1,\"salt\":\"qkMCQOyXgzFSQwNDgwlTew==\",\"iv\":\"E2/zYrrWT19qLhWh\",\"ct\":\"uiKBvaOof146xJ7oyJWLUeJGoR81ngZ+JSm/XWcqeLu338tT\"}"}]},t0=Date.now(),iso=new Date().toISOString(),tm=new Date();tm.setDate(tm.getDate()+1);tm.setHours(9,0,0,0);
 if(NL!=='ro')(function tw(o){for(var k in o){var v=o[k];if(typeof v==='string'){if(/^(name|text|title|v)$/.test(k))o[k]=TR(v)}else if(v&&typeof v==='object')tw(v)}})(D0);
 D0.notes.forEach(function(n,i){n.ts=t0-i*36e5;n.createdAt=iso;n.updatedAt=iso;if(n.alarm)n.alarm={at:tm.getTime(),rep:0}});
 localStorage.setItem('demo:ns_notes',JSON.stringify(D0.notes));localStorage.setItem('demo:ns_notetabs',JSON.stringify(D0.tabs));localStorage.setItem('demo:ns_notetab','"u"');localStorage.setItem('demo:ns_notesort1','1');localStorage.setItem('demo:ns_cfg',JSON.stringify({name:''}));localStorage.setItem('demo:ns_folders',JSON.stringify(D0.folders||[]));(function(){function T(x){return NL==='ro'?x:TR(x)}function ds(o){var d=new Date();d.setDate(d.getDate()-o);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}localStorage.setItem('demo:ns_crm',JSON.stringify({v:1,sub:'firm',list:[{id:'dc1',grp:'firm',name:'Ana Rus',tel:['0722 111 222'],addr:'Cluj-Napoca',email:'ana@exemplu.ro',firm:'Rus Design SRL',cui:'RO123456',st:'nou',nt:T('Vrea ofertă pentru site.'),cf:{},hist:[],work:[{id:'w1',d:ds(3),n:T('Logo nou'),pr:600},{id:'w2',d:ds(12),n:T('Site prezentare'),pr:2500},{id:'w3',d:ds(13),n:T('Domeniu și găzduire'),pr:350},{id:'w4',d:ds(380),n:T('Cărți de vizită'),pr:200}],rem:{on:1,d:ds(0),hm:'17:00'}},{id:'dc2',grp:'firm',name:'Mihai Pop',tel:['0744 333 444'],addr:'Turda',email:'',firm:'Pop Construct',cui:'',st:'disc',nt:'',cf:{},hist:[{id:'h1',ts:Date.now()-864e5*2,ty:'call',nt:T('A cerut prețuri.')}],rem:{on:1,d:ds(1),hm:'10:00'}},{id:'dc3',grp:'firm',name:'Elena Ilie',tel:['0755 555 666'],addr:'Dej',email:'',firm:'Ilie Market',cui:'',st:'cli',nt:'',cf:{},hist:[{id:'h2',ts:Date.now()-864e5*7,ty:'meet',nt:T('Contract semnat.')}],rem:{on:0,d:'',hm:''}},{id:'dc4',grp:'home',name:'Vasile (instalator)',tel:['0766 777 888'],addr:'Florești',email:'',firm:'',cui:'',st:'cli',nt:'',cf:{},hist:[],rem:{on:0,d:'',hm:''}}]}));localStorage.setItem('demo:ns_med',JSON.stringify({persons:[{id:'me',k:'me'}],open:{me:1},list:[{id:'dm1',name:'Paracetamol',p:'me',pat:[1,0,1],n:2,t:['08:00','','20:00'],al:[0,0,0],days:5,d0:ds(1)},{id:'dm2',name:'Amoxicilină',p:'me',pat:[1,1,1],n:3,t:['','',''],al:[0,0,0],days:3,d0:ds(6)}],info:{paracetamol:{s:T('Febră, dureri de cap'),h:T('1 comprimat după masă, la 8 ore'),w:T('Maximum 4 comprimate pe zi')}},lib:[{name:'Ibuprofen'}],alt:[{id:'dalt1',name:T('Ceai de tei'),info:{s:T('Răceală, tuse')}}],lopen:{u:1,n:1,a:1}}))})();localStorage.setItem('demo:ns_demov',DEMOV)}}catch(_){}}
function demoSet(on){try{if(on)localStorage.setItem('notis_demo','1');else localStorage.removeItem('notis_demo');localStorage.setItem('notis_demo_offered','1')}catch(_){}location.reload()}
function demoReset(){try{Object.keys(localStorage).filter(function(k){return k.indexOf('demo:')===0}).forEach(function(k){localStorage.removeItem(k)})}catch(_){}try{indexedDB.deleteDatabase('notis-photos-demo')}catch(_){}}
document.documentElement.classList.add('notis');
/* Notis: one-time copy of Jarvis notes (same origin), Jarvis data untouched */
var NS_IMPORTED=false;
var LS={get:function(k,d){try{var v=localStorage.getItem(PFX+k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem(PFX+k,JSON.stringify(v));if(!PFX&&NSP_KEYS.indexOf(k)>=0)nspPush(k)}catch(e){}}};
/* v21: drop AI/search keys */
(function(){['ns_gkey','ns_skey','ns_chat','ns_gmodel','ns_gauto','ns_gnosearch'].forEach(function(k){try{localStorage.removeItem(PFX+k)}catch(e){}})})();
var ZILE=[TR('Duminică'),TR('Luni'),TR('Marți'),TR('Miercuri'),TR('Joi'),TR('Vineri'),TR('Sâmbătă')];
var ZILE_S=[TR('Dum'),TR('Lun'),TR('Mar'),TR('Mie'),TR('Joi'),TR('Vin'),TR('Sâm')];
var LUNI=['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
var LUNI_S=['ian','feb','mar','apr','mai','iun','iul','aug','sept','oct','nov','dec'];
if(NL!=='ro')try{(function(){var f=function(o,set){var r=[];for(var i=0;i<12;i++)r.push(new Intl.DateTimeFormat(NL,o).format(new Date(2026,i,15)).replace(/\.$/,''));return r};LUNI=f({month:'long'});LUNI_S=f({month:'short'});for(var d=0;d<7;d++){var x=new Date(2026,0,4+d);ZILE[d]=new Intl.DateTimeFormat(NL,{weekday:'long'}).format(x);ZILE_S[d]=new Intl.DateTimeFormat(NL,{weekday:'short'}).format(x).replace(/\.$/,'')}ZILE=ZILE.map(function(z){return z.charAt(0).toUpperCase()+z.slice(1)})})()}catch(_){}
function pad(n){return (n<10?'0':'')+n}
function dkey(d){d=d||new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
/* v161: ONE display format for every date in the app: dd/mm/yyyy - Weekday (v200: '/' separator)[, hh:mm]. Display only; stored formats never change. */
var FDW={};function fDate(x,hm){var d;if(x instanceof Date)d=x;else if(typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)){var q=x.split('-');d=new Date(+q[0],+q[1]-1,+q[2])}else if(x==null||x==='')return '';else d=new Date(x);if(isNaN(d.getTime()))return String(x);
 var L=(typeof NL==='string'&&NL)||'ro',lc=L==='ro'?'ro-RO':L,wd=d.getDay(),ck=lc+wd,w=FDW[ck];if(w==null){try{w=new Intl.DateTimeFormat(lc,{weekday:'long'}).format(d)}catch(_){w=(typeof ZILE!=='undefined'&&ZILE[wd])||''}w=w?w.charAt(0).toLocaleUpperCase(lc)+w.slice(1):'';FDW[ck]=w}
 var r=pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+(w?' - '+w:'');if(hm)r+=', '+pad(d.getHours())+':'+pad(d.getMinutes());return r}
window.fDate=fDate;
function toast(m){var t=$('toast');t.textContent=TR(m);t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove('show')},3000)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var DEFAULT_STATUS=TR('Agent local. Doar vreme și taskuri.');
function setStatus(m,err){var s=$('vstatus');s.textContent=m||(cfg&&!cfg.name?TR('Setează-ți numele în Setări.'):DEFAULT_STATUS);s.className='status'+(err?' err':'')}

/* ---------- settings ---------- */
var cfg=null;cfg=Object.assign({name:(BLANK||!NS_HASCFG)?'':'Iosif',city:'Gherla',lat:47.03,lon:23.91,tz:'Europe/Bucharest',engine:'piper',rate:1.25,pitch:null,voiceURI:null,
 clockFont:'condensed',clockColor:'#3fd8ff',clockSize:56},LS.get('ns_cfg',{}));
if(cfg.engine==='piper'||!cfg.engine||(cfg.engine!=='browser'&&!TTS.voice(cfg.engine)))cfg.engine='mihai';if(cfg.tone==null)cfg.tone=1;if(cfg.remindUrgent==null)cfg.remindUrgent=true;
if(!LS.get('ns_v4',false)){cfg.clockFont='condensed';cfg.clockSize=56;cfg.clockColor='#3fd8ff';LS.set('ns_v4',true);LS.set('ns_cfg',cfg)}
if(!LS.get('ns_v3',false)){cfg.engine='mihai';if(cfg.rate==null||cfg.rate===1.3)cfg.rate=1.25;LS.set('ns_v3',true);LS.set('ns_cfg',cfg)}
function saveCfg(){LS.set('ns_cfg',cfg)}

/* ---------- clock ---------- */
var FONTS=[
 {id:'condensed',name:TR('Condensat (implicit)'),css:'"Roboto Condensed",Oswald,"Arial Narrow",sans-serif-condensed,sans-serif',w:700,k:1},
 {id:'orbitron',name:'Orbitron',css:'Orbitron,monospace',w:700,k:1},
 {id:'rajdhani',name:'Rajdhani',css:'Rajdhani,sans-serif',w:700,k:1.25},
 {id:'sharetech',name:'Share Tech Mono',css:'"Share Tech Mono",monospace',w:400,k:1.2},
 {id:'audiowide',name:'Audiowide',css:'Audiowide,sans-serif',w:400,k:1},
 {id:'teko',name:'Teko',css:'Teko,sans-serif',w:500,k:1.45},
 {id:'oxanium',name:'Oxanium',css:'Oxanium,sans-serif',w:700,k:1.1},
 {id:'dseg7',name:TR('DSEG7 (7 segmente)'),css:'"DSEG7 Classic",monospace',w:700,k:.9,seg:'88.88'},
 {id:'dseg14',name:TR('DSEG14 (14 segm.)'),css:'"DSEG14 Classic",monospace',w:700,k:.9,seg:'~~.~~'},
 {id:'mono',name:TR('Monospace sistem'),css:'ui-monospace,"Roboto Mono","Droid Sans Mono",Menlo,Consolas,monospace',w:700,k:1.15}];
function fontById(id){return FONTS.filter(function(f){return f.id===id})[0]||FONTS[0]}
function applyClock(c){c=c||cfg;var f=fontById(c.clockFont),el=$('clock');
 el.style.fontFamily=f.css;el.style.fontWeight=f.w;el.style.fontSize=Math.round(c.clockSize*f.k)+'px';
 document.documentElement.style.setProperty('--clock',c.clockColor);
 el.classList.toggle('seg',!!f.seg);if(f.seg)el.setAttribute('data-ghost',f.seg)}
applyClock();
var newsScale=+LS.get('ns_newssize',100)||100;
function applyNewsSize(p){p=Math.max(80,Math.min(160,+p||100));var s=String(p/100);var c=$('cNews');if(c)c.style.setProperty('--ns',s);var pv=$('newsSizePrev');if(pv)pv.style.setProperty('--ns',s)}
applyNewsSize(newsScale);

/* ---------- greeting ---------- */
function greeting(){var h=new Date().getHours();var g=h>=5&&h<12?TR('Bună dimineața'):h>=12&&h<18?TR('Bună ziua'):TR('Bună seara');return cfg.name?g+', '+cfg.name+'.':g+'!'}
function greetFull(){return greeting()+TR(' Sunt Notis, asistentul tău. Cu ce te pot ajuta?')}
var greetBusy=false,greetRestoreT=null;
function renderGreet(force){if(greetBusy&&!force)return;greetBusy=false;
 var seg=prepSeg($('greet'),greetFull());var i=seg.words.length-1;
 greetStatic={seg:seg,span:seg.words[i]&&seg.words[i].span};
 requestAnimationFrame(function(){moveBar(seg,greetStatic.span,true)})} /* static underline under "ajuta" */
var greetStatic=null;
function reflowBars(){if(activeSeg&&activeSeg.cur>=0&&activeSeg.words[activeSeg.cur].span)moveBar(activeSeg,activeSeg.words[activeSeg.cur].span,true);
 if(greetStatic&&greetStatic.span&&greetStatic.span.isConnected&&activeSeg!==greetStatic.seg)moveBar(greetStatic.seg,greetStatic.span,true)}
if(document.fonts){if(document.fonts.ready)document.fonts.ready.then(reflowBars);if(document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',reflowBars)}
var lastDay=dkey();
function dayCheck(){if(dkey()===lastDay)return;lastDay=dkey();rollTasks();renderTasks();renderShop();renderTabs()}
document.addEventListener('visibilitychange',function(){if(!document.hidden)dayCheck()});window.addEventListener('focus',dayCheck);
(function midnight(){var n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,0,0,2);setTimeout(function(){dayCheck();midnight()},Math.max(1000,m-n))})();
function tick(){var d=new Date();$('clock').textContent=pad(d.getHours())+'.'+pad(d.getMinutes());
 if(d.getSeconds()===0||!tick.done){if(!speaking)renderGreet();tick.done=1}
 dayCheck()}

/* ---------- karaoke core ---------- */
/* A segment = a piece of text shown in a DOM element; every word becomes a span, and the element gets its own glowing bar. */
function prepSeg(el,text){var seg={el:el,text:text,words:[],bar:null,cur:-1};
 var re=/\S+/g,m,last=0,html='';
 while((m=re.exec(text))){seg.words.push({s:m.index,e:m.index+m[0].length,w:m[0]});
  if(el)html+=esc(text.slice(last,m.index))+'<span class="w">'+esc(m[0])+'</span>';last=re.lastIndex}
 if(el){el.innerHTML=html+esc(text.slice(last))+'<span class="kbar"></span>';el.classList.add('kw');
  var sp=el.querySelectorAll('.w');seg.words.forEach(function(w,i){w.span=sp[i]});seg.bar=el.querySelector('.kbar')}
 return seg}
function moveBar(seg,span,instant){var b=seg&&seg.bar;if(!b)return;if(!span){b.classList.remove('show');return}
 if(instant)b.style.transition='none';
 b.style.width=span.offsetWidth+'px';b.style.transform='translate('+span.offsetLeft+'px,'+(span.offsetTop+span.offsetHeight)+'px)';b.classList.add('show');
 if(instant){void b.offsetWidth;b.style.transition=''}}
var activeSeg=null;
function hl(seg,i){if(!seg)return;
 if(activeSeg!==seg){if(activeSeg)clearSeg(activeSeg);activeSeg=seg;seg.cur=-1;
  if(seg.el&&!seg.el.classList.contains('nrMir')&&!seg.el.classList.contains('nrHost')&&seg.el.scrollIntoView&&seg.el.isConnected){var r=seg.el.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight-110)seg.el.scrollIntoView({block:'center',behavior:'smooth'})}}
 if(i===seg.cur||i<0||i>=seg.words.length)return;seg.cur=i;
 if(!seg.el)return;
 seg.words.forEach(function(w,j){if(w.span){w.span.classList.toggle('cur',j===i);w.span.classList.toggle('past',j<i)}});
 moveBar(seg,seg.words[i].span,false);var sp=seg.words[i].span;if(sp&&(seg.el.classList.contains('nrMir')||seg.el.classList.contains('nrHost'))){var q=sp.getBoundingClientRect();if(q.top<80||q.bottom>innerHeight-120)sp.scrollIntoView({block:'center',behavior:'smooth'})}}
function clearSeg(seg){if(!seg)return;seg.words.forEach(function(w){if(w.span)w.span.classList.remove('cur','past')});moveBar(seg,null)}
function clearActive(){if(activeSeg)clearSeg(activeSeg);activeSeg=null}
addEventListener('resize',reflowBars);

/* ---------- weather ---------- */
var WMO={0:[TR('Cer senin'),'clear',TR('Senin')],1:[TR('Predominant senin'),'clear',TR('Senin')],2:[TR('Parțial noros'),'partly',TR('Parțial noros')],3:[TR('Cer acoperit'),'cloud',TR('Acoperit')],45:[TR('Ceață'),'fog',TR('Ceață')],48:[TR('Ceață cu chiciură'),'fog',TR('Chiciură')],
51:[TR('Burniță slabă'),'drizzle',TR('Burniță')],53:[TR('Burniță'),'drizzle',TR('Burniță')],55:[TR('Burniță densă'),'drizzle',TR('Burniță')],56:[TR('Burniță înghețată'),'drizzle',TR('Burniță')],57:[TR('Burniță înghețată'),'drizzle',TR('Burniță')],
61:[TR('Ploaie slabă'),'rain',TR('Ploaie')],63:[TR('Ploaie'),'rain',TR('Ploaie')],65:[TR('Ploaie puternică'),'rain',TR('Ploaie')],66:[TR('Ploaie înghețată'),'rain',TR('Ploaie')],67:[TR('Ploaie înghețată'),'rain',TR('Ploaie')],
71:[TR('Ninsoare slabă'),'snow',TR('Ninsoare')],73:[TR('Ninsoare'),'snow',TR('Ninsoare')],75:[TR('Ninsoare abundentă'),'snow',TR('Ninsoare')],77:[TR('Fulgi de zăpadă'),'snow',TR('Ninsoare')],
80:[TR('Averse slabe'),'rain',TR('Averse')],81:[TR('Averse de ploaie'),'rain',TR('Averse')],82:[TR('Averse puternice'),'rain',TR('Averse')],85:[TR('Averse de ninsoare'),'snow',TR('Ninsoare')],86:[TR('Averse de ninsoare'),'snow',TR('Ninsoare')],
95:[TR('Furtună'),'storm',TR('Furtună')],96:[TR('Furtună cu grindină'),'storm',TR('Furtună')],99:[TR('Furtună cu grindină'),'storm',TR('Furtună')]};
var _iconN=0;
function iconDefs(u){return '<defs>'+
 '<radialGradient id="'+u+'sg" cx="38%" cy="35%" r="60%"><stop offset="0%" stop-color="#fff6c8"/><stop offset="45%" stop-color="#ffd24a"/><stop offset="100%" stop-color="#ff8a1a"/></radialGradient>'+
 '<radialGradient id="'+u+'sg2" cx="40%" cy="35%" r="55%"><stop offset="0%" stop-color="#ffe9a0"/><stop offset="100%" stop-color="#ffb020" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="'+u+'mg" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#f0f6ff"/><stop offset="55%" stop-color="#c5d4ea"/><stop offset="100%" stop-color="#7a90b0"/></radialGradient>'+
 '<linearGradient id="'+u+'cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#e8eef5"/><stop offset="100%" stop-color="#9aafc0"/></linearGradient>'+
 '<linearGradient id="'+u+'cgd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d8e0ea"/><stop offset="50%" stop-color="#a8b8c8"/><stop offset="100%" stop-color="#6a7f92"/></linearGradient>'+
 '<linearGradient id="'+u+'cgs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5a6a7c"/><stop offset="100%" stop-color="#2a3544"/></linearGradient>'+
 '<linearGradient id="'+u+'rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7ad4ff"/><stop offset="100%" stop-color="#2a8fd4"/></linearGradient>'+
 '<linearGradient id="'+u+'lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff6a0"/><stop offset="50%" stop-color="#ffd020"/><stop offset="100%" stop-color="#ff8a00"/></linearGradient>'+
 '<filter id="'+u+'glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'+
 '<filter id="'+u+'soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.1"/></filter>'+
 '<filter id="'+u+'fluff" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".6"/></filter>'+
 '</defs>'}
function sunBody(u,cx,cy,r){return '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*1.55)+'" fill="url(#'+u+'sg2)" opacity=".55"/>'+
 '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="url(#'+u+'sg)" filter="url(#'+u+'glow)"/>'+
 '<circle cx="'+(cx-r*.28)+'" cy="'+(cy-r*.32)+'" r="'+(r*.28)+'" fill="#fff" opacity=".35"/>'}
function moonBody(u,cx,cy,r){return '<g filter="url(#'+u+'glow)"><path d="M'+(cx+r*.15)+' '+(cy-r)+'a'+r+' '+r+' 0 1 0 '+(r*.2)+' '+(r*1.85)+'a'+(r*.72)+' '+(r*.72)+' 0 1 1 -'+(r*.2)+' -'+(r*1.85)+'z" fill="url(#'+u+'mg)"/></g>'+
 '<circle cx="'+(cx+r*.35)+'" cy="'+(cy-r*.2)+'" r="'+(r*.12)+'" fill="#9eb0c8" opacity=".35"/>'+
 '<circle cx="'+(cx+r*.1)+'" cy="'+(cy+r*.25)+'" r="'+(r*.08)+'" fill="#9eb0c8" opacity=".28"/>'}
function cloudBody(u,x,y,sc,dark){sc=sc||1;var g=dark?(dark===2?u+'cgs':u+'cgd'):u+'cg';
 return '<g transform="translate('+x+' '+y+') scale('+sc+')" filter="url(#'+u+'fluff)">'+
 '<ellipse cx="22" cy="28" rx="14" ry="10" fill="url(#'+g+')"/><ellipse cx="36" cy="24" rx="16" ry="12" fill="url(#'+g+')"/>'+
 '<ellipse cx="50" cy="30" rx="12" ry="9" fill="url(#'+g+')"/><ellipse cx="36" cy="34" rx="22" ry="11" fill="url(#'+g+')"/>'+
 (dark?'':'<ellipse cx="30" cy="22" rx="10" ry="6" fill="#fff" opacity=".45"/>')+'</g>'}
function rainDrops(u,y){y=y||46;return '<g fill="url(#'+u+'rg)" opacity=".9">'+
 '<path d="M20 '+y+'q1.2 3 0 6q-1.2-3 0-6z"/><path d="M28 '+(y+3)+'q1.4 3.5 0 7q-1.4-3.5 0-7z"/><path d="M36 '+y+'q1.2 3 0 6q-1.2-3 0-6z"/>'+
 '<path d="M44 '+(y+4)+'q1.3 3.2 0 6.5q-1.3-3.3 0-6.5z"/><path d="M24 '+(y+8)+'q1 2.5 0 5q-1-2.5 0-5z"/><path d="M40 '+(y+9)+'q1 2.5 0 5q-1-2.5 0-5z"/></g>'}
function snowFlakes(y){y=y||48;return '<g fill="#eef6ff" opacity=".95">'+
 '<circle cx="22" cy="'+y+'" r="2.2"/><circle cx="32" cy="'+(y+4)+'" r="2.6"/><circle cx="42" cy="'+y+'" r="2.2"/>'+
 '<circle cx="27" cy="'+(y+10)+'" r="1.8"/><circle cx="37" cy="'+(y+11)+'" r="1.9"/>'+
 '<g stroke="#eef6ff" stroke-width="1.2" stroke-linecap="round" opacity=".7"><path d="M22 '+(y-3)+'v6M19 '+y+'h6"/><path d="M42 '+(y-3)+'v6M39 '+y+'h6"/></g></g>'}
function fogBands(u){return '<g stroke="#c8d6e4" stroke-width="3.2" stroke-linecap="round" opacity=".75" filter="url(#'+u+'soft)"><path d="M12 40h40"/><path d="M16 48h32" opacity=".85"/><path d="M14 56h36" opacity=".65"/></g>'}
function bolt(u){return '<path d="M36 34l-9 12h6.5l-4.5 12 13-16h-7l5.5-8z" fill="url(#'+u+'lg)" filter="url(#'+u+'glow)"/>'}
function icon(kind,day){var u='i'+(_iconN++),body='';
 if(kind==='clear')body=day?sunBody(u,32,32,14):moonBody(u,34,32,16);
 else if(kind==='partly')body=(day?sunBody(u,22,20,10):moonBody(u,22,18,11))+cloudBody(u,4,18,.95);
 else if(kind==='cloud')body=cloudBody(u,-2,8,1.05,1)+cloudBody(u,6,16,1);
 else if(kind==='fog')body=cloudBody(u,2,2,.9)+fogBands(u);
 else if(kind==='drizzle')body=cloudBody(u,2,4)+'<g opacity=".7">'+rainDrops(u,48)+'</g>';
 else if(kind==='rain')body=cloudBody(u,2,2,1,1)+rainDrops(u,46);
 else if(kind==='snow')body=cloudBody(u,2,2)+snowFlakes(48);
 else if(kind==='storm')body=cloudBody(u,0,0,1.05,2)+bolt(u)+'<g opacity=".55">'+rainDrops(u,50)+'</g>';
 else body=cloudBody(u,2,10);
 return '<svg viewBox="0 0 64 64" aria-hidden="true">'+iconDefs(u)+body+'</svg>'}
function windTxt(k){return k<6?TR('Vânt calm'):k<20?TR('Vânt slab'):k<39?TR('Vânt moderat'):k<62?TR('Vânt puternic'):TR('Vânt foarte puternic')}
var wx=LS.get('ns_wx',null);
function wxSentence(w){if(!w)return TR('Nu am date despre vreme.');var d=WMO[w.code]||[TR('Vreme variabilă'),'cloud',TR('Variabil')];
 var s=d[0]+TR('. Acum ')+Math.round(w.temp)+TR(' grade. Maxima ')+Math.round(w.max)+TR(', minima ')+Math.round(w.min)+TR('. Șanse de ploaie: ')+w.pp+'%. '+windTxt(w.wind)+'.';
 var rainy=/rain|storm|drizzle/.test(d[1]);s+=(w.pp>=40||rainy)?TR(' Ia umbrela cu tine.'):TR(' Nu ai nevoie de umbrelă.');return s}
function wxDayLabel(iso){var p=String(iso||'').split('-');if(p.length<3)return'—';
 var d=new Date(+p[0],+p[1]-1,+p[2]);return ZILE_S[d.getDay()]+' '+d.getDate()}
function renderWxDays(){var el=$('wxdays');if(!el)return;el.innerHTML='';
 var days=(wx&&wx.days)||[];if(!days.length){el.hidden=true;return}el.hidden=false;
 days.slice(0,5).forEach(function(day){var d=WMO[day.code]||[TR('Vreme variabilă'),'cloud',TR('Variabil')];
  var cell=document.createElement('div');cell.className='wxday';
  var lab=document.createElement('div');lab.className='wd';lab.textContent=wxDayLabel(day.date);cell.appendChild(lab);
  var ic=document.createElement('div');ic.className='wi';ic.innerHTML=icon(d[1],1);cell.appendChild(ic);
  el.appendChild(cell)})}
function renderWx(){$('wxlbl').textContent=TR('Vremea · ')+cfg.city;if($('wxcity'))$('wxcity').textContent=cfg.city;
 if(!wx){$('wxicon').innerHTML=icon('cloud',1);$('wxtemp').textContent='—°';if($('wxtempmini'))$('wxtempmini').textContent='—°';if($('wxiconmini'))$('wxiconmini').innerHTML=icon('cloud',1);$('wxcond').textContent=TR('Se încarcă…');$('wxfeel').textContent='';$('wxline').textContent='';$('wxhi').textContent='';$('wxmeta').textContent='';renderWxDays();return}
 var d=WMO[wx.code]||[TR('Vreme variabilă'),'cloud',TR('Variabil')];$('wxicon').innerHTML=icon(d[1],wx.day);if($('wxiconmini'))$('wxiconmini').innerHTML=icon(d[1],wx.day);
 $('wxtemp').textContent=Math.round(wx.temp)+'°';if($('wxtempmini'))$('wxtempmini').textContent=Math.round(wx.temp)+'°';
 $('wxcond').textContent=d[2]||d[0];
 $('wxfeel').textContent=wx.feel!=null?TR('Se simte ca: ')+Math.round(wx.feel)+'°C':'';
 $('wxhi').textContent=Math.round(wx.max)+'°/'+Math.round(wx.min)+'°';
 $('wxline').textContent='Ploaie '+wx.pp+'% · '+windTxt(wx.wind);
 if(!(speaking&&activeSeg&&activeSeg.el===$('wxtxt')))$('wxtxt').textContent=wxSentence(wx);
 var t=new Date(wx.ts),n=new Date();
 var when=dkey(t)===dkey(n)?TR('azi la ')+pad(t.getHours())+':'+pad(t.getMinutes()):fDate(t,1);
 $('wxmeta').textContent=TR('Actualizat ')+when+(wx.stale?' (offline)':'');
 renderWxDays()}
function loadWx(){
 var u='https://api.open-meteo.com/v1/forecast?latitude='+cfg.lat+'&longitude='+cfg.lon+'&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone='+encodeURIComponent(cfg.tz||'Europe/Bucharest')+'&forecast_days=5';
 return fetch(u).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(j){
  var days=[],time=(j.daily&&j.daily.time)||[],codes=(j.daily&&j.daily.weather_code)||[];
  for(var i=0;i<Math.min(5,time.length);i++)days.push({date:time[i],code:codes[i]});
  wx={temp:j.current.temperature_2m,feel:j.current.apparent_temperature,code:j.current.weather_code,wind:j.current.wind_speed_10m,day:j.current.is_day===1,
   max:j.daily.temperature_2m_max[0],min:j.daily.temperature_2m_min[0],pp:j.daily.precipitation_probability_max[0]||0,days:days,ts:Date.now(),city:cfg.city,lat:cfg.lat,lon:cfg.lon};
  LS.set('ns_wx',wx);renderWx()}).catch(function(){if(wx){wx.stale=true;renderWx()}else{$('wxcond').textContent=TR('Fără date');$('wxtxt').textContent=TR('Nu pot încărca vremea (fără internet?).');renderWx()}})}

/* ---------- tasks (never lost: open tasks carry over; done/deleted kept as history) ---------- */
var tasks=LS.get('ns_tasks',null);
if(!tasks&&BLANK)tasks=[];
if(!tasks){ /* first visit of the owner's page only; the shared blank copy never seeds */var y=new Date();y.setDate(y.getDate()-1);var yk=dkey(y),tk0=dkey(),i0=0;
 tasks=[[TR('De comandat ață gri de 20. De vorbit cu Grig ori cu Alex'),yk],[TR('De curățat uleiul de sub mașina de cusut'),yk],[TR('Scaune Sorin'),tk0],[TR('Burete pat Leia, strada Dejului, de sunat'),tk0],[TR('Contor apă'),tk0]]
  .map(function(a){return{id:Date.now()+'_'+(i0++),text:a[0],date:a[1],done:false,doneDate:null}});LS.set('ns_tasks',tasks)} /* (v15 migrate() below gives them dueDay) */
function save(){LS.set('ns_tasks',tasks);histPush()}
function live(t){return !t.deleted}
function visible(t){return live(t)&&(!t.done||t.doneDate===dkey())} /* done tasks stay visible until the end of the day they were completed */
function dayOff(n){var d=new Date();d.setDate(d.getDate()+n);return dkey(d)}
function shortDate(k){return TR('din ')+fDate(k)}
/* v15: Azi / Mâine. Each task has dueDay. Azi = dueDay <= today (open, or done today); Mâine = dueDay >= tomorrow.
   Open tasks whose dueDay passed roll to today (fromDay keeps the first day they were due -> "din 3 oct" note). */
function inList(t,which){var tk=dkey();return which==='maine'?t.dueDay>tk:t.dueDay<=tk}
function listFor(which){return tasks.filter(function(t){return visible(t)&&inList(t,which)}).sort(urgOrd(which==='maine'?'maine':'azi'))}
/* v14: explicit order set by drag & drop (ord + ordK = list it was ordered in); unordered items keep the old date order, after the ordered ones */
function ordCmp(k){return function(a,b){var oa=a.ord!=null&&a.ordK===k,ob=b.ord!=null&&b.ordK===k;
 if(oa&&ob)return a.ord-b.ord;if(oa!==ob)return oa?-1:1;return a.date<b.date?-1:a.date>b.date?1:0}}
function isDoneItem(x){return !!(x.done||x.bought)} /* v28: done/bought sink below open items */
function alphaCmp(a,b){return String(a.text||'').localeCompare(String(b.text||''),NL,{sensitivity:'base'})} /* v40: alphabetical (ro, case/diacritics-insensitive) */
function urgOrd(k){return function(a,b){var da=!!a.done,db=!!b.done;if(da!==db)return da?1:-1;if(!!a.urgent!==!!b.urgent)return a.urgent?-1:1;return alphaCmp(a,b)}}
function urgAlpha(a,b){return urgSort(a,b)||alphaCmp(a,b)}
function urgSort(a,b){var da=isDoneItem(a),db=isDoneItem(b);if(da!==db)return da?1:-1;if(!!a.urgent!==!!b.urgent)return a.urgent?-1:1;return 0}
(function migrate(){var tk=dkey(),need=tasks.filter(function(t){return !t.dueDay});if(!need.length)return;
 /* keep what v14 showed: old "ieri" list, then "noi", in their on-screen order -> all open ones go to Azi */
 var vis=function(t){return !t.dueDay&&visible(t)},seen=tasks.filter(function(t){return vis(t)&&t.date<tk}).sort(ordCmp('old'))
  .concat(tasks.filter(function(t){return vis(t)&&!(t.date<tk)}).sort(ordCmp('new@'+tk)));
 need.forEach(function(t){if(live(t)&&!t.done){t.dueDay=tk;if(t.date&&t.date<tk)t.fromDay=t.date}else t.dueDay=t.date||tk;delete t.ord;delete t.ordK});
 seen.forEach(function(t,i){t.ord=i;t.ordK='azi'});LS.set('ns_tasks',tasks)})();
function rollTasks(){var tk=dkey(),ch=false;tasks.forEach(function(t){if(live(t)&&!t.done&&t.dueDay<tk){if(!t.fromDay)t.fromDay=t.dueDay;t.dueDay=tk;ch=true}});
 if(ch){LS.set('ns_tasks',tasks);if(typeof hCur!=='undefined'&&hCur!==null)hCur=snap()}return ch}
(function(){var ch=false;tasks.forEach(function(t){if(t.urgent==null){t.urgent=false;ch=true}});if(ch)LS.set('ns_tasks',tasks)})();
rollTasks();
function alBtn(t){var nx=alNext(t);return '<button class="al'+(nx?' on':'')+'" aria-label="Alarmă"><i>⏰</i>'+(nx?'<small>'+alShort(nx)+(t.alarm&&t.alarm.rep?' 🔁':'')+'</small>':'')+'</button>'}
function renderItem(t,stHtml,alarm){var li=document.createElement('li');li.className='task'+(t.done?' done':'')+(t.urgent?' urgent':'');li.dataset.id=t.id;
 var al=alarm?alBtn(t):'';
 li.innerHTML='<span class="dot"></span><span class="t kw">'+esc(t.text)+'</span>'+(stHtml?'<span class="st">'+stHtml+'</span>':'')+al+'<button class="ed" aria-label="Editează">✎</button><button class="x" aria-label="Șterge">×</button>';return li}
function fillList(ul,list,emptyTxt,makeLi){ul.innerHTML=list.length?'':'<li class="empty">'+emptyTxt+'</li>';if(!list.length)return;
 list.filter(function(x){return x.urgent&&!isDoneItem(x)}).forEach(function(x){ul.appendChild(makeLi(x))});
 var sep=document.createElement('li');sep.className='jv-sep';sep.setAttribute('aria-hidden','true');sep.innerHTML='<span>'+TR('URGENT ↑')+'</span>';ul.appendChild(sep);
 list.filter(function(x){return !x.urgent&&!isDoneItem(x)}).forEach(function(x){ul.appendChild(makeLi(x))});
 list.filter(isDoneItem).forEach(function(x){ul.appendChild(makeLi(x))})}
function placeBeforeDone(arr,item,doneFn){var i=arr.indexOf(item);if(i>=0)arr.splice(i,1);
 if(doneFn(item)){arr.push(item);return}
 var at=-1;for(var j=0;j<arr.length;j++)if(doneFn(arr[j])){at=j;break}
 if(at<0)arr.push(item);else arr.splice(at,0,item)}
function bumpOpenOrd(t){var which=inList(t,'maine')?'maine':'azi',kU=which+':u',kN=which+':n';
 delete t.ord;delete t.ordK;
 var peers=listFor(which).filter(function(x){return !x.done&&x!==t}),uI=0,nI=0;
 peers.forEach(function(x){if(x.urgent){x.ord=uI++;x.ordK=kU}else{x.ord=nI++;x.ordK=kN}});
 if(t.urgent){t.ord=uI;t.ordK=kU}else{t.ord=nI;t.ordK=kN}}
function renderTasks(){
 [['lAzi','azi'],['lMaine','maine']].forEach(function(p){
  var ul=$(p[0]),list=listFor(p[1]);
  fillList(ul,list,TR('Niciun task.'),function(t){return renderItem(t,'',true)})});updCardCount('azi');updCardCount('maine')}
function findT(id){for(var i=0;i<tasks.length;i++)if(tasks[i].id===id)return i;return -1}
function delTask(id){var i=findT(id);if(i<0)return;jvConfirm(function(){tasks[i].deleted=new Date().toISOString();save();renderTasks()})}
function addTask(txt,which){txt=(txt||'').trim();if(!txt)return false;txt=txt.charAt(0).toUpperCase()+txt.slice(1);
 tasks.push({id:Date.now()+'_'+Math.random().toString(36).slice(2,6),text:txt,date:dkey(),dueDay:which==='maine'?dayOff(1):dkey(),done:false,doneDate:null,urgent:false,created:new Date().toISOString()});save();renderTasks();return true}
['lAzi','lMaine'].forEach(function(id){var ul=$(id);
 ul.addEventListener('click',function(e){var li=e.target.closest('.task');if(!li||li.classList.contains('editing'))return;
  if(e.target.closest('.ed')){var i=findT(li.dataset.id);if(i>=0)startEdit(li,tasks[i],save,renderTasks);return}
  if(e.target.classList.contains('x')){delTask(li.dataset.id);return}
  if(e.target.closest('.al')){openAlarm({k:'t',id:li.dataset.id});return}
  if(dndEat())return
  var i=findT(li.dataset.id);if(i<0)return;var t=tasks[i];t.done=!t.done;t.doneDate=t.done?dkey():null;t.doneAt=t.done?new Date().toISOString():null;if(!t.done)bumpOpenOrd(t);save();renderTasks()});
 ul.addEventListener('contextmenu',function(e){if(e.target.closest('.task'))e.preventDefault()})});
$('fAdd').addEventListener('submit',function(e){e.preventDefault();if(addTask($('iTask').value,'azi')){$('iTask').value='';toast(TR('Task adăugat pentru azi'))}});
$('fAddM').addEventListener('submit',function(e){e.preventDefault();if(addTask($('iTaskM').value,'maine')){$('iTaskM').value='';toast(TR('Task adăugat pentru mâine'))}});

/* ---------- inline edit (tasks + shopping): keeps id/date/done, records editedAt ---------- */
var editing=null;
function startEdit(li,item,saveFn,rerender){if(editing&&editing!==li&&editing.isConnected)return;
 if(speaking)stopSpeaking();editing=li;li.classList.add('editing');var t=li.querySelector('.t');t.classList.remove('kw');
 t.innerHTML='<textarea class="edin" rows="1" enterkeyhint="done" aria-label="Editează textul"></textarea><span class="edb"><button type="button" class="btn eok" aria-label="Salvează">✓</button><button type="button" class="btn eno" aria-label="Anulează">✕</button></span>';
 var ta=t.querySelector('textarea');ta.value=item.text;
 function grow(){ta.style.height='auto';ta.style.height=ta.scrollHeight+'px'}
 function close(){editing=null;rerender()}
 function ok(e){if(e){e.preventDefault();e.stopPropagation()}var v=saveFn===saveNotes?ta.value.replace(/[ \t]+\n/g,'\n').trim():ta.value.replace(/\s+/g,' ').trim();
  if(!v){toast(TR('Textul nu poate fi gol'));ta.focus();return}
  if(v!==item.text){item.text=v;item.editedAt=new Date().toISOString();saveFn();toast(TR('Salvat'))}close()}
 function no(e){if(e){e.preventDefault();e.stopPropagation()}close()}
 ta.addEventListener('input',grow);
 ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){ok(e)}else if(e.key==='Escape'){no(e)}});
 t.querySelector('.eok').addEventListener('click',ok);t.querySelector('.eno').addEventListener('click',no);
 ['click','pointerdown'].forEach(function(ev){t.addEventListener(ev,function(e){e.stopPropagation()})});
 grow();ta.focus();try{ta.setSelectionRange(ta.value.length,ta.value.length)}catch(_){}}

/* ---------- shopping list (unbought items carry over forever; bought ones vanish after their day; hidden = kept in storage) ---------- */
var shop=LS.get('ns_shop',[]);
function saveShop(){LS.set('ns_shop',shop);histPush()}
function shopVisible(s){return !s.hidden&&(!s.bought||s.boughtDate===dkey())}
function shopList(){return shop.filter(shopVisible).sort(urgSort)}
(function(){var ch=false;shop.forEach(function(s){if(s.urgent==null){s.urgent=false;ch=true}});if(ch)LS.set('ns_shop',shop)})();
function renderShop(){renderShop0();updCardCount('shop')}
function renderShop0(){var ul=$('lShop'),list=shopList();
 fillList(ul,list,TR('Lista e goală.'),function(s){var li=document.createElement('li');li.className='task'+(s.bought?' done':'')+(s.urgent?' urgent':'');li.dataset.id=s.id;
  li.innerHTML='<span class="dot"></span><span class="t kw">'+esc(s.text)+'</span>'+alBtn(s)+'<button class="ed" aria-label="Editează">✎</button><button class="x" aria-label="Ascunde">×</button>';return li})}
function findS(id){for(var i=0;i<shop.length;i++)if(shop[i].id===id)return shop[i];return null}
function hideShop(id){var s=findS(id);if(!s)return;jvConfirm(function(){s.hidden=new Date().toISOString();saveShop();renderShop()})}
function addShop(txt){txt=(txt||'').trim();if(!txt)return false;txt=txt.charAt(0).toUpperCase()+txt.slice(1);
 shop.push({id:Date.now()+'_'+Math.random().toString(36).slice(2,6),text:txt,date:dkey(),bought:false,boughtDate:null,urgent:false,created:new Date().toISOString()});saveShop();renderShop();return true}
(function(){var ul=$('lShop');
 ul.addEventListener('click',function(e){var li=e.target.closest('.task');if(!li||li.classList.contains('editing'))return;
  if(e.target.closest('.ed')){var s=findS(li.dataset.id);if(s)startEdit(li,s,saveShop,renderShop);return}
  if(e.target.classList.contains('x')){hideShop(li.dataset.id);return}
  if(e.target.closest('.al')){openAlarm({k:'s',id:li.dataset.id});return}
  if(dndEat())return
  var s=findS(li.dataset.id);if(!s)return;s.bought=!s.bought;s.boughtDate=s.bought?dkey():null;s.boughtAt=s.bought?new Date().toISOString():null;placeBeforeDone(shop,s,function(x){return x.bought});saveShop();renderShop()});
 ul.addEventListener('contextmenu',function(e){if(e.target.closest('.task'))e.preventDefault()})})();
$('fShop').addEventListener('submit',function(e){e.preventDefault();if(addShop($('iShop').value)){$('iShop').value='';toast(TR('Produs adăugat'))}});
$('bMicShop').onclick=function(){var i=$('iShop');i.focus();try{i.click()}catch(e){}};


/* ---------- custom tabs (list cards like Cumpărături; open items carry over, done ones vanish after their day; deleted tab/items = hidden, kept in storage) ---------- */
var tabs=LS.get('ns_tabs',[]),TCOL=['#3fd8ff','#4ade80','#facc15','#ffb547','#ff6b6b','#f472b6','#c084fc','#94a3b8'];
var MIC_SVG='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>';
var SPK_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
var TRASH_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>';
function uid(){return Date.now()+'_'+Math.random().toString(36).slice(2,6)}
function saveTabs(){LS.set('ns_tabs',tabs);histPush()}
function visTabs(){return tabs.filter(function(t){return !t.hidden})}
function findTab(id){for(var i=0;i<tabs.length;i++)if(tabs[i].id===id)return tabs[i];return null}
function findTI(tab,id){for(var i=0;i<tab.items.length;i++)if(tab.items[i].id===id)return tab.items[i];return null}
function tiVisible(x){return !x.hidden&&(!x.done||x.doneDate===dkey())}
function tabList(tab){return tab.items.filter(tiVisible).sort(urgAlpha)}
(function(){var ch=false;tabs.forEach(function(tab){(tab.items||[]).forEach(function(s){if(s.urgent==null){s.urgent=false;ch=true}})});if(ch)LS.set('ns_tabs',tabs)})();
var tabCol=LS.get('ns_tabcol',{});if(!tabCol||typeof tabCol!=='object')tabCol={}; /* v25: collapsed custom tabs (not in undo history) */
function tabOpenCount(tab){return tabList(tab).filter(function(x){return !x.done}).length}
function updTabCount(tab){var n=document.querySelector('#ct_'+tab.id+' .tcnt');if(n)n.textContent='· '+tabOpenCount(tab)}
function toggleTabCol(tab){var c=$('ct_'+tab.id);if(!c)return;var col=!c.classList.contains('col');c.classList.toggle('col',col);
 if(col)tabCol[tab.id]=1;else delete tabCol[tab.id];LS.set('ns_tabcol',tabCol);
 var b=c.querySelector('.tcol');if(b){b.setAttribute('aria-expanded',col?'false':'true');b.setAttribute('aria-label',col?TR('Extinde tabul'):TR('Restrânge tabul'))}updTabCount(tab)}
function renderTabItems(tab){var ul=document.querySelector('#ct_'+tab.id+' ul');if(!ul)return;updTabCount(tab);
 fillList(ul,tabList(tab),TR('Lista e goală.'),function(s){return renderItem(s,'',true)})}
function renderTabs(){var box=$('customCards');if(!box)return;box.innerHTML='';
 visTabs().forEach(function(tab){var c=document.createElement('section');c.className='card ctab'+(tabCol[tab.id]?' col':'');c.id='ct_'+tab.id;c.dataset.tab=tab.id;
  if(tab.color)c.style.setProperty('--tc',tab.color);
  c.innerHTML='<div class="lbl"><span class="lt kw">'+esc(tab.name)+'</span><span class="tcnt" aria-hidden="true"></span><span class="hgrp"><button class="hb ren" aria-label="Redenumește tabul">✎</button><button class="hb del" aria-label="Șterge tabul">'+TRASH_SVG+'</button><button class="spk" data-read="tab:'+tab.id+TR('" aria-label="Citește">')+SPK_SVG+'</button><button type="button" class="hb tcol" aria-expanded="'+(tabCol[tab.id]?'false':'true')+'" aria-label="'+(tabCol[tab.id]?TR('Extinde tabul'):TR('Restrânge tabul'))+'"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.2 8.1a1.5 1.5 0 0 1 2.1 0L12 13.8l5.7-5.7a1.5 1.5 0 1 1 2.1 2.1l-6.75 6.75a1.5 1.5 0 0 1-2.1 0L4.2 10.2a1.5 1.5 0 0 1 0-2.1z"/></svg></button></span></div><ul class="tasks ctl"></ul>'+
   '<form class="add"><input placeholder="Scrie un element" autocomplete="off" aria-label="Element nou"><button type="button" class="btn mic tmic" title="Scrie sau dictează cu tastatura" aria-label="Deschide tastatura">'+MIC_SVG+'</button><button class="btn" type="submit">Adaugă</button></form>';
  box.appendChild(c);renderTabItems(tab)});
 if(typeof updEq==='function')updEq()}
function hideTI(tab,id){var s=findTI(tab,id);if(!s)return;jvConfirm(function(){s.hidden=new Date().toISOString();saveTabs();renderTabItems(tab)})}
function addTI(tab,txt){txt=(txt||'').trim();if(!txt)return false;txt=txt.charAt(0).toUpperCase()+txt.slice(1);
 tab.items.push({id:uid(),text:txt,date:dkey(),done:false,doneDate:null,urgent:false,created:new Date().toISOString()});saveTabs();renderTabItems(tab);return true}
function delTab(tab){jvConfirm(function(){
 if(speaking&&speakKey==='tab:'+tab.id)stopSpeaking();tab.hidden=new Date().toISOString();saveTabs();renderTabs();toast(TR('Tab șters'))})}
(function(){var box=$('customCards');
 function ctx(e){var c=e.target.closest('.ctab');return c?findTab(c.dataset.tab):null}
 box.addEventListener('click',function(e){var tab=ctx(e);if(!tab)return;
  if(e.target.closest('.spk')){readCard('tab:'+tab.id);return}
  if(e.target.closest('.ren')){openTabModal(tab);return}
  if(e.target.closest('.del')){delTab(tab);return}
  if(e.target.closest('.lbl')){toggleTabCol(tab);return}
  if(e.target.closest('.tmic')){var i=e.target.closest('form').querySelector('input');i.focus();try{i.click()}catch(_){}return}
  var li=e.target.closest('.task');if(!li||li.classList.contains('editing')||!li.dataset.id)return;
  if(e.target.closest('.ed')){var s=findTI(tab,li.dataset.id);if(s)startEdit(li,s,saveTabs,function(){renderTabItems(tab)});return}
  if(e.target.classList.contains('x')){hideTI(tab,li.dataset.id);return}
  if(e.target.closest('.al')){openAlarm({k:'b',tab:tab.id,id:li.dataset.id});return}
  if(dndEat())return
  var s=findTI(tab,li.dataset.id);if(!s)return;s.done=!s.done;s.doneDate=s.done?dkey():null;s.doneAt=s.done?new Date().toISOString():null;placeBeforeDone(tab.items,s,function(x){return x.done});saveTabs();renderTabItems(tab)});
 box.addEventListener('submit',function(e){e.preventDefault();var tab=ctx(e);if(!tab)return;var i=e.target.querySelector('input');if(addTI(tab,i.value)){i.value='';toast(TR('Adăugat în ')+tab.name)}});
 box.addEventListener('contextmenu',function(e){if(e.target.closest('.task'))e.preventDefault()})})();
/* v27: collapsible built-in cards (Taskuri azi/mâine, Cumpărături, Știri); state in ns_cardcol, not in undo history */
var cardCol=LS.get('ns_cardcol',{});if(!cardCol||typeof cardCol!=='object')cardCol={};
function ccEl(k){return $({voice:'cVoice',wx:'cWx',azi:'cAzi',maine:'cMaine',shop:'cShop',news:'cNews'}[k])}
function cardCount(k){if(k==='azi'||k==='maine')return listFor(k).filter(function(t){return !t.done}).length;
 if(k==='shop')return shopList().filter(function(x){return !x.bought}).length;var n=0;document.querySelectorAll('#newsBody .news-item').forEach(function(a){if(a.style.display!=='none')n++});return n}
function updCardCount(k){var c=ccEl(k),n=c&&c.querySelector('.tcnt');if(n)n.textContent='· '+cardCount(k)}
function setCardCol(k,col){var c=ccEl(k);if(!c)return;c.classList.toggle('col',col);
 var b=c.querySelector('.tcol');if(b){b.setAttribute('aria-expanded',col?'false':'true');b.setAttribute('aria-label',col?TR('Extinde cardul'):TR('Restrânge cardul'))}}
['voice','wx','azi','maine','shop','news'].forEach(function(k){var c=ccEl(k);if(!c)return;setCardCol(k,!!cardCol[k]);
 c.querySelector('.lbl').addEventListener('click',function(e){if(e.target.closest('.spk,.nrf,.hb.ren,.hb.del'))return;
  var col=!c.classList.contains('col');setCardCol(k,col);if(col)cardCol[k]=1;else delete cardCol[k];LS.set('ns_cardcol',cardCol);updCardCount(k)})});
/* create / rename modal */
var tmTab=null,tmColor='';
function buildTabColors(){var row=$('tmColors');row.innerHTML='';
 [''].concat(TCOL).forEach(function(c){var b=document.createElement('button');b.type='button';b.className='sw'+(c?'':' none')+(c===tmColor?' sel':'');
  if(c)b.style.background=c;else b.textContent='—';b.setAttribute('aria-label',c?TR('Culoare ')+c:TR('Fără culoare'));b.dataset.c=c;
  b.onclick=function(){tmColor=c;buildTabColors()};row.appendChild(b)})}
function openTabModal(tab){tmTab=tab||null;tmColor=tab?(tab.color||''):'';$('tmTitle').textContent=tab?TR('Redenumește tabul'):TR('Tab nou');$('tmSave').textContent=tab?TR('Salvează'):TR('Creează');
 $('tmName').value=tab?tab.name:'';buildTabColors();$('tabModal').classList.add('show');setTimeout(function(){$('tmName').focus()},30)}
function closeTabModal(){$('tabModal').classList.remove('show');tmTab=null}
$('bNewTab').onclick=function(){openTabModal(null)};
$('tmCancel').onclick=closeTabModal;
$('tabModal').addEventListener('click',function(e){if(e.target===this)closeTabModal()});
$('tmName').addEventListener('keydown',function(e){if(e.key==='Escape')closeTabModal()});
$('tmForm').addEventListener('submit',function(e){e.preventDefault();var n=$('tmName').value.replace(/\s+/g,' ').trim();
 if(!n){toast(TR('Numele tabului e obligatoriu'));$('tmName').focus();return}
 if(tmTab){tmTab.name=n;tmTab.color=tmColor;tmTab.editedAt=new Date().toISOString();saveTabs();renderTabs();closeTabModal();toast(TR('Tab redenumit'));return}
 var t={id:uid(),name:n,color:tmColor,created:new Date().toISOString(),items:[]};tabs.push(t);saveTabs();renderTabs();closeTabModal();
 var c=$('ct_'+t.id);if(c){c.scrollIntoView({behavior:'smooth',block:'center'})}toast(TR('Tab „')+n+TR('” creat'))});

/* ---------- undo / redo: snapshot history of tasks + shopping + tabs (session only, max 50 steps) ---------- */
var HMAX=50,hUndo=[],hRedo=[],hCur=null;
function snap(){return JSON.stringify({tasks:tasks,shop:shop,tabs:tabs})}
function histBtns(){var u=$('bUndo'),r=$('bRedo');if(u)u.disabled=!hUndo.length;if(r)r.disabled=!hRedo.length}
function histPush(){if(hCur===null)return;var s=snap();if(s===hCur)return;hUndo.push(hCur);if(hUndo.length>HMAX)hUndo.shift();hRedo=[];hCur=s;histBtns()}
function histApply(s){var d=JSON.parse(s);if(speaking)stopSpeaking();editing=null;if($('tabModal').classList.contains('show'))closeTabModal();
 tasks=d.tasks;shop=d.shop;tabs=d.tabs;LS.set('ns_tasks',tasks);LS.set('ns_shop',shop);LS.set('ns_tabs',tabs);hCur=s;
 renderTasks();renderShop();renderTabs();histBtns()}
function undo(){if(!hUndo.length)return;hRedo.push(hCur);histApply(hUndo.pop());toast(TR('Anulat'))}
function redo(){if(!hRedo.length)return;hUndo.push(hCur);histApply(hRedo.pop());toast(TR('Refăcut'))}
$('bUndo').onclick=undo;$('bRedo').onclick=redo;
document.addEventListener('keydown',function(e){if(!(e.ctrlKey||e.metaKey)||e.altKey)return;var t=e.target,tag=t&&t.tagName;
 if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable)||document.querySelector('.modal.show'))return;
 var k=e.key.toLowerCase();if(k==='z'&&!e.shiftKey){e.preventDefault();undo()}else if(k==='y'||(k==='z'&&e.shiftKey)){e.preventDefault();redo()}});
/* ---------- v14: drag & drop for list items (Pointer Events: touch + mouse; nothing new visible unless a drag is in progress)
   long-press ~480 ms arms the drag (haptic + lift); moving then = drag; holding still >= 900 ms and releasing = old delete/hide confirm;
   a move before arming cancels (page scrolls normally); short tap still toggles. Each drop = one undo step. ---------- */
var DND_ARM=480,DND_DEL=900,DND_SLOP=10,DND_EDGE=70;
var dnd=null,dndEatClick=false;
function dndEat(){if(dndEatClick){dndEatClick=false;return true}return false}
function dndListOf(ul){if(!ul)return null;
 if(ul.id==='lAzi')return{kind:'azi',key:'azi'};if(ul.id==='lMaine')return{kind:'maine',key:'maine'};if(ul.id==='lShop')return{kind:'shop',key:'shop'};
 var c=ul.closest&&ul.closest('.ctab');if(c&&ul.classList.contains('ctl')){var tb=findTab(c.dataset.tab);if(tb)return{kind:'tab',key:'tab:'+tb.id,tab:tb}}return null}
function dndUL(el){if(!el||!el.closest)return null;var ul=el.closest('#lAzi,#lMaine,#lShop,.ctab ul.ctl');if(ul)return ul;
 var c=el.closest('#cAzi,#cMaine,#cShop,.ctab');return c&&!c.classList.contains('col')?c.querySelector('#lAzi,#lMaine,#lShop,ul.ctl'):null}
function dndYest(){var y=new Date();y.setDate(y.getDate()-1);return dkey(y)}
function dndClasses(on){var r=document.documentElement;r.classList.toggle('jv-press',!!on);if(!on)r.classList.remove('jv-dragging')}
function dndReset(){if(!dnd)return;clearTimeout(dnd.armT);clearTimeout(dnd.delT);if(dnd.raf)cancelAnimationFrame(dnd.raf);
 if(dnd.li)dnd.li.classList.remove('jv-lift','jv-hide');if(dnd.ghost&&dnd.ghost.parentNode)dnd.ghost.parentNode.removeChild(dnd.ghost);
 if(dnd.ph&&dnd.ph.parentNode)dnd.ph.parentNode.removeChild(dnd.ph);if(dnd.over){dnd.over.classList.remove('jv-over');var c=dnd.over.closest('.card');if(c)c.classList.remove('jv-tgt')}
 dnd=null;dndClasses(false)}
function dndArm(){if(!dnd)return;if(editing&&editing.isConnected){dndReset();return}dnd.armed=true;if(navigator.vibrate)try{navigator.vibrate(15)}catch(_){}
 dnd.li.classList.add('jv-lift');dnd.delT=setTimeout(function(){if(dnd&&dnd.armed&&!dnd.drag&&navigator.vibrate)try{navigator.vibrate(30)}catch(_){}},DND_DEL-DND_ARM)}
function dndStart(){var d=dnd,li=d.li,r=li.getBoundingClientRect();d.drag=true;clearTimeout(d.delT);d.ox=d.sx-r.left+12;d.oy=d.sy-r.top;
 var g=document.createElement('ul');g.className=d.ul.className+(d.src.kind==='tab'?' ctab':'')+' jv-ghost';g.setAttribute('aria-hidden','true');
 var tc=getComputedStyle(d.ul).getPropertyValue('--tc');if(tc&&tc.trim())g.style.setProperty('--tc',tc.trim());
 g.style.width=(r.width+24)+'px';var c=li.cloneNode(true);c.classList.remove('jv-lift');g.appendChild(c);document.body.appendChild(g);d.ghost=g;
 var ph=document.createElement('li');ph.className='jv-ph';ph.style.height=r.height+'px';d.ph=ph;li.parentNode.insertBefore(ph,li);
 li.classList.remove('jv-lift');li.classList.add('jv-hide');document.documentElement.classList.add('jv-dragging');
 dndPlace();d.raf=requestAnimationFrame(dndTick)}
function dndNextSlot(n,skip){n=n.nextSibling;while(n&&(n===skip||!(n.classList&&((n.classList.contains('task')&&n.dataset.id)||n.classList.contains('jv-sep')))))n=n.nextSibling;return n}
function dndPlace(){var d=dnd;if(!d||!d.drag)return;d.ghost.style.transform='translate('+(d.x-d.ox)+'px,'+(d.y-d.oy)+'px) scale(1.03)';
 var ul=dndUL(document.elementFromPoint(d.x,d.y));if(!ul||!dndListOf(ul))return;
 if(d.over!==ul){if(d.over){d.over.classList.remove('jv-over');var oc=d.over.closest('.card');if(oc)oc.classList.remove('jv-tgt')}
  d.over=ul;ul.classList.add('jv-over');var nc=ul.closest('.card');if(nc)nc.classList.add('jv-tgt')}
 var before=null,ch=ul.children;
 for(var i=0;i<ch.length;i++){var n=ch[i];if(n===d.li||n===d.ph)continue;
  if(n.classList.contains('jv-sep')){var rs=n.getBoundingClientRect();if(d.y<rs.top+rs.height/2){before=n;break}continue}
  if(!n.classList.contains('task')||!n.dataset.id)continue;var r=n.getBoundingClientRect();if(d.y<r.top+r.height/2){before=n;break}}
 if(d.ph.parentNode===ul&&dndNextSlot(d.ph,d.li)===before)return;
 if(before)ul.insertBefore(d.ph,before);else ul.appendChild(d.ph)}
function dndTick(){var d=dnd;if(!d||!d.drag)return;var h=window.innerHeight,v=0;
 if(d.y<DND_EDGE)v=-Math.ceil((DND_EDGE-d.y)/4);else if(d.y>h-DND_EDGE)v=Math.ceil((d.y-(h-DND_EDGE))/4);
 if(v){var y0=window.scrollY;window.scrollBy(0,v);if(window.scrollY!==y0)dndPlace()}d.raf=requestAnimationFrame(dndTick)}
function dndObj(L,id){if(L.kind==='azi'||L.kind==='maine'){var i=findT(id);return i<0?null:tasks[i]}return L.kind==='shop'?findS(id):findTI(L.tab,id)}
function dndArr(L){return L.kind==='shop'?shop:L.kind==='tab'?L.tab.items:tasks}
function dndConv(o,toShop,date){var done=o.done!=null?!!o.done:!!o.bought,dd=done?(o.doneDate||o.boughtDate||dkey()):null,da=done?(o.doneAt||o.boughtAt||null):null,n={};
 for(var k in o)if(['done','doneDate','doneAt','bought','boughtDate','boughtAt','ord','ordK'].indexOf(k)<0)n[k]=o[k];
 n.date=date;if(toShop){n.bought=done;n.boughtDate=dd;n.boughtAt=da}else{n.done=done;n.doneDate=dd;n.doneAt=da}n.movedAt=new Date().toISOString();return n}
function dndApply(S,T,id,ids,urgMap){var o=dndObj(S,id);if(!o)return;var isT=function(L){return L.kind==='azi'||L.kind==='maine'},today=dkey();
 if(S.key===T.key){var cur=(isT(S)?listFor(S.kind):S.kind==='shop'?shopList():tabList(S.tab)).map(function(x){return x.id});
  if(cur.join('|')===ids.join('|')&&cur.every(function(x){var it=dndObj(S,x);return !!it.urgent===!!urgMap[x]}))return}
 var date=isT(T)?(isT(S)?o.date:(o.date||today)):(isT(S)?(o.fromDay||o.date||today):(o.date||today)),due=T.kind==='maine'?dayOff(1):today;
 if(isT(S)&&isT(T)){if(T.kind!==S.kind){o.dueDay=due;if(T.kind==='maine')delete o.fromDay}}
 else{var sa=dndArr(S),si=sa.indexOf(o);if(si<0)return;sa.splice(si,1);
  var n=(isT(S)===isT(T)&&(S.kind==='shop')===(T.kind==='shop'))?o:dndConv(o,T.kind==='shop',date);if(n===o){o.date=date;o.movedAt=new Date().toISOString()}
  if(isT(T)){n.dueDay=due;delete n.fromDay;if(T.kind==='azi'&&n.date<today)n.fromDay=n.date}else{delete n.dueDay;delete n.fromDay}
  var ta=dndArr(T);if(isT(T))ta.push(n);else{var p=ids.indexOf(id),at=-1,j;
   for(j=p+1;j<ids.length&&at<0;j++)at=ta.findIndex(function(x){return x.id===ids[j]});
   if(at<0){for(j=p-1;j>=0&&at<0;j--){at=ta.findIndex(function(x){return x.id===ids[j]});if(at>=0)at++}}
   if(at<0)ta.push(n);else ta.splice(at,0,n)}}
 if(isT(T)){var k=T.kind,uI=0,nI=0;ids.forEach(function(x){var t=tasks[findT(x)];if(!t)return;t.urgent=!!urgMap[x];if(t.urgent){t.ord=uI++;t.ordK=k+':u'}else{t.ord=nI++;t.ordK=k+':n'}})}
 else ids.forEach(function(x){var it=dndObj(T,x);if(it)it.urgent=!!urgMap[x]});
 LS.set('ns_tasks',tasks);LS.set('ns_shop',shop);LS.set('ns_tabs',tabs);histPush();
 [S,T].forEach(function(L){if(isT(L))renderTasks();else if(L.kind==='shop')renderShop();else renderTabItems(L.tab)})}
function dndDrop(){var d=dnd,ul=d.ph&&d.ph.parentNode,T=ul&&dndListOf(ul),id=d.li.dataset.id,ids=[],urgMap={},S=d.src,sec=true;
 if(ul)[].forEach.call(ul.children,function(n){if(n.classList&&n.classList.contains('jv-sep')){sec=false;return}
  if(n===d.ph){ids.push(id);urgMap[id]=sec}else if(n!==d.li&&n.classList.contains('task')&&n.dataset.id){ids.push(n.dataset.id);urgMap[n.dataset.id]=sec}});
 dndReset();if(T)dndApply(S,T,id,ids,urgMap)}
/* v42: long-press (~450 ms) opens an item menu (Alarmă / Editează / Mută / Șterge); replaces drag. Movement/scroll cancels. */
var lp=null,LP_MS=450,lpJust=false;
function lpUnsel(){try{var sl=window.getSelection();if(sl)sl.removeAllRanges()}catch(_){}}
function lpNoSel(e){var t=e.target;if(t.nodeType!==1)t=t.parentNode;if(!t||!t.closest||t.closest('input,textarea,[contenteditable]'))return;if(t.closest('.task,.lbl,#lpMenu,.note,.nfo'))e.preventDefault()}
document.addEventListener('selectstart',lpNoSel);document.addEventListener('contextmenu',lpNoSel);
function lpCancel(){if(lp){clearTimeout(lp.t);lp=null}}
document.addEventListener('pointerdown',function(e){dndEatClick=false;lpJust=false;lpCancel();if(ndrag||Date.now()-ndragT<400)return;
 if(e.pointerType==='mouse'&&e.button!==0)return;
 var hd=e.target.closest&&e.target.closest('.ctab .lbl');if(hd&&!e.target.closest('.spk,.tcol')&&!document.querySelector('.modal.show')&&!$('lpMenu').classList.contains('show')){
  lp={id:e.pointerId,x:e.clientX,y:e.clientY,t:setTimeout(function(){lp=null;try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}lpJust=true;lpUnsel();lpTabOpen(hd)},LP_MS)};return}
 var np=e.target.closest&&e.target.closest('#noteTabs .ntab:not(.nadd1)');if(np){lp={id:e.pointerId,x:e.clientX,y:e.clientY,t:setTimeout(function(){lp=null;try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}lpJust=true;lpUnsel();lpNTOpen(np)},LP_MS)};return}
 var fo=e.target.closest&&e.target.closest('#notesList .nfo');if(fo&&!selOn()){lp={id:e.pointerId,x:e.clientX,y:e.clientY,t:setTimeout(function(){lp=null;try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}lpJust=true;lpUnsel();fdMenu(fo)},LP_MS)};return}
 var nl=e.target.closest&&e.target.closest('#notesList .note');if(nl&&!nl.classList.contains('editing')&&!e.target.closest('textarea,.edb')){
  lp={id:e.pointerId,x:e.clientX,y:e.clientY,t:setTimeout(function(){lp=null;try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}lpJust=true;lpUnsel();if(nTrash||(findN(nl.dataset.id)||{}).del)lpNoteOpen(nl);else selToggle(nl.dataset.id)},LP_MS)};return}var li=e.target.closest&&e.target.closest('.task');
 if(!li||!li.dataset.id||li.classList.contains('editing')||e.target.closest('textarea,.edb'))return;
 var S=dndListOf(li.parentNode);if(!S||(editing&&editing.isConnected)||document.querySelector('.modal.show')||$('lpMenu').classList.contains('show'))return;
 lp={id:e.pointerId,li:li,S:S,x:e.clientX,y:e.clientY,t:setTimeout(function(){var d=lp;lp=null;if(!d)return;dndEatClick=true;try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}lpJust=true;lpUnsel();lpOpen(d.li,d.S)},LP_MS)}});
window.addEventListener('pointermove',function(e){if(lp&&e.pointerId===lp.id&&(Math.abs(e.clientX-lp.x)>10||Math.abs(e.clientY-lp.y)>10))lpCancel()});
window.addEventListener('pointerup',function(e){if(lp&&e.pointerId===lp.id)lpCancel()});
window.addEventListener('scroll',lpCancel,{passive:true});
window.addEventListener('pointercancel',lpCancel);
var lpCur=null;
function lpLists(){var a=[{kind:'azi',key:'azi',n:TR('Taskuri azi')},{kind:'maine',key:'maine',n:TR('Taskuri mâine')},{kind:'shop',key:'shop',n:TR('Cumpărături')}];
 tabs.forEach(function(tb){a.push({kind:'tab',key:'tab:'+tb.id,tab:tb,n:tb.name})});return a}
function lpIds(T){var ul=T.kind==='azi'?$('lAzi'):T.kind==='maine'?$('lMaine'):T.kind==='shop'?$('lShop'):document.querySelector('#ct_'+T.tab.id+' ul.ctl'),ids=[],u={},sec=true;
 if(ul)[].forEach.call(ul.children,function(n){if(n.classList.contains('jv-sep')){sec=false;return}if(n.classList.contains('task')&&n.dataset.id){ids.push(n.dataset.id);u[n.dataset.id]=sec}});return{ids:ids,u:u}}
function lpMove(T,urg){var c=lpCur;lpClose();if(!c)return;var o=dndObj(c.S,c.id);if(!o)return;var U=urg==null?!!o.urgent:urg,r=lpIds(T);
 if(T.key===c.S.key){r.u[c.id]=U}else{if(U)r.ids.unshift(c.id);else r.ids.push(c.id);r.u[c.id]=U}
 dndApply(c.S,T,c.id,r.ids,r.u);toast(urg==null?TR('Mutat în ')+(T.n||''):(U?TR('Marcat urgent'):TR('Marcat normal')))}
function lpOpen(li,S){var o=dndObj(S,li.dataset.id);if(!o)return;lpCur={li:li,S:S,id:li.dataset.id};var m=$('lpMenu'),box=$('lpBox');
 box.innerHTML='<button data-a="al">⏰ Alarmă</button><button data-a="ed">✎ Editează</button><button data-a="mv">📦 Mută</button><button data-a="x" class="dng">× Șterge</button>';
 m.classList.add('show');li.classList.add('jv-lpon');lpPos()}
function lpPos(){var c=lpCur;if(!c)return;var r=c.li.getBoundingClientRect(),box=$('lpBox'),h=box.offsetHeight,w=box.offsetWidth,vh=window.innerHeight;
 var top=r.bottom+6;if(top+h>vh-10)top=Math.max(10,r.top-h-6);box.style.top=top+'px';box.style.left=Math.max(12,Math.min(window.innerWidth-w-12,r.left+24))+'px'}
function lpMoveMenu(){var c=lpCur,o=dndObj(c.S,c.id),box=$('lpBox'),h='<div class="lph">Mută în</div>';
 lpLists().forEach(function(L,i){h+='<button data-mv="'+i+'"'+(L.key===c.S.key?' class="cur"':'')+'>'+esc(L.n)+(L.key===c.S.key?' ✓':'')+'</button>'});
 h+='<button data-a="urg">'+(o.urgent?TR('● Normal'):TR('● Urgent'))+'</button>';box.innerHTML=h;lpPos()}
function lpTabOpen(hd){lpCur={li:hd,tabHd:true};$('lpBox').innerHTML='<button data-a="ren">📛 Redenumește</button><button data-a="tdel" class="dng">🗑 Șterge tabul</button>';$('lpMenu').classList.add('show');hd.classList.add('jv-lpon');lpPos()}
function lpNTOpen(b){lpCur={li:b,nt:b.dataset.id};$('lpBox').innerHTML='<button data-a="ntren">📛 Redenumește</button><button data-a="ntmv">📦 Mută</button><button data-a="ntcol">🎨 Culoare</button>'+((findNT(b.dataset.id)||{}).lk?'<button data-a="ntunl">🔓 Deblochează</button>':'<button data-a="ntlock">🔒 Blochează</button>')+'<button data-a="ntdel" class="dng">🗑 Șterge tabul</button>';$('lpMenu').classList.add('show');b.classList.add('jv-lpon');lpPos()}
function lpNoteOpen(li){if((findN(li.dataset.id)||{}).del){lpCur={li:li,note:true};$('lpBox').innerHTML='<button data-a="nrest">↩ Reface</button><button data-a="npurge" class="dng">× Șterge definitiv</button>';$('lpMenu').classList.add('show');lpPos();return}lpCur={li:li,note:true};try{var _sn=findN(li.dataset.id);nShP=_sn&&!(_sn.lock&&!_sn._key)?nSharePrep(_sn):null}catch(_){nShP=null}$('lpBox').innerHTML='<button data-a="nal">⏰ Alarmă</button><button data-a="ned">✎ Editează</button><button data-a="nshr">📤 Trimite</button><button data-a="ndrag">✥ Mută (drag &amp; drop)</button><button data-a="nmv">📦 Mută în alt tab</button><button data-a="nlbl">🏷 Etichete</button>'+((findN(li.dataset.id)||{}).pin?'<button data-a="npin">📌 Anulează fixarea</button>':'<button data-a="npin">📌 Fixează</button>')+''+((findN(li.dataset.id)||{}).lock?'<button data-a="nunl">🔓 Deblochează</button>':'<button data-a="nlock">🔒 Blochează</button>')+'<button data-a="ndel" class="dng">× Șterge</button>';$('lpMenu').classList.add('show');li.classList.add('jv-lpon');lpPos()}
function lpClose(){$('lpMenu').classList.remove('show');if(lpCur&&lpCur.li)lpCur.li.classList.remove('jv-lpon');lpCur=null}
$('lpMenu').addEventListener('click',function(e){if(lpJust){lpJust=false;return}var c=lpCur;if(!c){lpClose();return}var b=e.target.closest('button');if(!b){lpClose();return}if(c.sel){selPop(b);return}if(c.fd){fdAct(b,c);return}if(b.dataset.a&&/^at(img|imn|cam|drw|rec)$/.test(b.dataset.a)){var aa=b.dataset.a;lpClose();atDo(aa);return}if(b.dataset.a==='fnew'){lpClose();fdNew(noteTab,nFolder);return}
 if(b.dataset.mv!=null){var T=lpLists()[+b.dataset.mv];if(T.key===c.S.key){lpClose();return}lpMove(T);return}
 var a=b.dataset.a;
 if(a==='npin'){var pn=findN(c.li.dataset.id);lpClose();if(pn){saveNotes();if(pn.pin)delete pn.pin;else pn.pin=true;nFlush();renderNotes();toast(pn.pin?TR('Fixată sus'):TR('Nu mai e fixată'))}return}
 if(b.dataset.ncl!=null){var cn3=edNote(true);lpClose();if(cn3){nHistPush&&saveNotes();if(b.dataset.ncl)cn3.color=b.dataset.ncl;else delete cn3.color;cn3.updatedAt=new Date().toISOString();nFlush();edState()}return}
 if(b.dataset.nmt!=null){var cn4=edNote(true);lpClose();var k4=b.dataset.nmt;if(cn4&&k4!==cn4.tab+'|'+(cn4.fd||'')){saveNotes();var p4=k4.split('|');cn4.tab=p4[0];if(p4[1])cn4.fd=p4[1];else delete cn4.fd;if(!fullIsNew)nInsertAlpha(cn4);noteTab=cn4.tab;nFolder=(p4[1]&&!fdHidden(p4[1]))?p4[1]:'';nFlush();renderNotes();toast(TR('Mutat în ')+fdKeyName(k4))}return}
 if(b.dataset.isrt!=null){var cn2=chkNote();lpClose();if(cn2){if(b.dataset.isrt==='alpha')delete cn2.isort;else cn2.isort=b.dataset.isrt;cn2.updatedAt=new Date().toISOString();nFlush();if(cn2.type==='mix')mRender();else chkRender()}return}
 if(b.dataset.srt!=null){var tS=findNT(noteTab);lpClose();if(tS){if(b.dataset.srt==='manual')delete tS.sort;else tS.sort=b.dataset.srt;saveNotes();renderNotes()}return}
 if(b.dataset.ntc!=null){var tt=findNT(c.nt);lpClose();if(tt){tt.color=b.dataset.ntc==='#3fd8ff'?null:b.dataset.ntc;if(!tt.color)delete tt.color;saveNotes();renderNotes()}return}
 if(b.dataset.nt!=null){var nn=findN(c.li.dataset.id),kk=b.dataset.nt;lpClose();if(nn&&kk!==nn.tab+'|'+(nn.fd||'')){fdPlace(nn,kk);saveNotes();renderNotes();toast(TR('Mutat în ')+fdKeyName(kk))}return}
 if(a==='nmv'){var nX=findN(c.li.dataset.id)||{};$('lpBox').innerHTML=fdTargets('data-nt',nX.tab+'|'+(nX.fd||''));lpPos();return}
 if(a==='nlock'||a==='nunl'){var id5=c.li.dataset.id;lpClose();if(a==='nlock')lkLock(id5);else lkUnlock(id5);return}
 if(a==='ndrag'){var li2=c.li;lpClose();if(ntSortOf()!=='manual'){var tM=findNT(noteTab);if(tM)delete tM.sort;saveNotes();renderNotes();toast(TR('Sortare')+': '+TR('Manual'));setTimeout(function(){var l3=document.querySelector('#notesList .note[data-id="'+li2.dataset.id+'"]');if(l3)ndArm(l3)},700)}else ndArm(li2);return}
 if(a==='nrest'||a==='npurge'){var id9=c.li.dataset.id;lpClose();if(a==='nrest')nRestore(id9);else nPurge(id9);return}if(a==='trash'){lpClose();nTrashOpen(true);return}if(a==='lbman'){lpClose();lbOpen(null);return}if(a==='nlbl'){var idL=c.li.dataset.id;lpClose();lbOpen(idL);return}if(a==='ftrash'){lpClose();fullClose(false);setTimeout(function(){nTrashOpen(true)},50);return}if(a==='fdel'){var fid=fullId;lpClose();if(!fid)return;noteDel(fid);var o9=$('cfOk').onclick;$('cfOk').onclick=function(){o9&&o9();if((findN(fid)||{}).del)fullClose(false)};return}if(a==='nal'){var id0=c.li.dataset.id;lpClose();openAlarm({k:'n',id:id0});return}
 if(a==='ntcol'){var ct=findNT(c.nt)||{},hh='<div class="lph">Culoare</div><div class="npal">';NT_COLORS.forEach(function(k){hh+='<button data-ntc="'+k[0]+'" class="'+((ct.color||'#3fd8ff')===k[0]?'cur':'')+'" style="--nc:'+k[0]+'" aria-label="'+k[1]+'"><i></i></button>'});$('lpBox').innerHTML=hh+'</div>';lpPos();return}
 if(a==='ntmv'){var tmid=c.nt;lpClose();tmArm(tmid);return}
 if(a==='ntlock'||a==='ntunl'){var tl=c.nt;lpClose();if(a==='ntlock')tbLock(tl);else tbUnlock(tl);return}if(a==='ntl'||a==='ntr'||a==='ntren'||a==='ntdel'){var tid=c.nt;lpClose();if(a==='ntl')ntShift(tid,-1);else if(a==='ntr')ntShift(tid,1);else if(a==='ntren')ntRename(tid);else ntDelete(tid);return}
 if(a==='nshr'){var sli=c.li;lpClose();nShare(sli.dataset.id);return}if(a==='ned'||a==='ndel'){var nli=c.li;lpClose();if(a==='ned')noteEdit(nli);else noteDel(nli.dataset.id);return}if(a==='ren'||a==='tdel'){var hd=c.li;lpClose();var hb=hd.querySelector(a==='ren'?'.hb.ren':'.hb.del');if(hb)hb.click();return}if(a==='mv'){lpMoveMenu();return}if(a==='urg'){var o=dndObj(c.S,c.id);lpMove(c.S,!(o&&o.urgent));return}
 var li=c.li;lpClose();var btn=li.querySelector(a==='al'?'.al':a==='ed'?'.ed':'.x');if(btn){dndEatClick=false;btn.click()}});
document.addEventListener('touchmove',function(e){if(dnd&&dnd.armed&&e.cancelable)e.preventDefault()},{passive:false});
['contextmenu','selectstart','dragstart'].forEach(function(ev){document.addEventListener(ev,function(e){if(dnd)e.preventDefault()})});
window.addEventListener('blur',dndReset);document.addEventListener('visibilitychange',function(){if(document.hidden)dndReset()});
/* ---------- speech output ---------- */
var speaking=false,listening=false,kGen=0,speakKey=null;
function updEq(){$('eq').classList.toggle('on',speaking||listening);$('orb').classList.toggle('active',speaking||listening);
 document.querySelectorAll('.spk').forEach(function(b){b.classList.toggle('on',speaking&&b.dataset.read===speakKey)});
 $('bRead').classList.toggle('on',speaking&&speakKey==='all');if($('nfRead')){var nr=speaking&&speakKey==='note';if(!nr&&!nrBusy&&nrMir&&nrMir.length)nrClear();$('nfRead').classList.toggle('on',nr);$('nfRead').textContent=nr?(nrCode()?'🔊 '+nrCode():TR('🔊 Citește…')):TR('Citește');window.nfReadFit&&nfReadFit()}$('bReadAll').classList.toggle('on',speaking&&speakKey==='below');ttsLd(ttsWait&&speaking)}
var actx=null,sources=[];
/* v143: loading state until the first sound */
var ttsWait=false;function ttsLd(on){ttsWait=!!on;var b=$('nfRead');if(b)b.classList.toggle('ld',ttsWait&&speaking&&speakKey==='note');document.querySelectorAll('.spk').forEach(function(x){x.classList.toggle('ld',ttsWait&&speaking&&x.dataset.read===speakKey)})}
window.__ttsLd=function(){return ttsWait};window.__chunks=function(t){return buildChunks([prepSeg(null,t)]).map(function(c){return c.text})};window.__spkOn=function(){return speaking};
function unlockAudio(){try{if(!actx){var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;actx=new AC()}
 if(actx.state==='suspended')actx.resume();
 if(!unlockAudio.done){var b=actx.createBuffer(1,1,22050),s=actx.createBufferSource();s.buffer=b;s.connect(actx.destination);s.start(0);unlockAudio.done=1}}catch(e){}}
document.addEventListener('pointerdown',unlockAudio,true);
function curRate(){return cfg.rate!=null?+cfg.rate:1.25}

/* browser voices (fallback engine) */
var roVoice=null,autoMale=false,allVoices=[];
var MALE_RE=/\bmale\b|barbat|bărbat|masculin|emil|andrei|ion\b|ioan|mihai|alexandru|bogdan|adrian|marius/i;
function maleScore(v){var n=(v.name+' '+v.voiceURI).toLowerCase(),s=0;
 if(/female|femeie|feminin|ioana|alina|carmen|maria|elena|andreea|irina/.test(n))return -10;
 if(MALE_RE.test(n))s+=10;if(/-x-/.test(n))s+=2;if(!v.default)s+=1;if(/local/.test(n))s+=.5;return s}
/* 2.2.0: "Citește" speaks the app language (Automat = phone language). Android: native system TTS via NotisNative; browser: speechSynthesis */
var NTTS=(function(){try{return window.NotisNative&&NotisNative.isNative&&NotisNative.isNative()&&NotisNative.ttsVoices?NotisNative:null}catch(_){return null}})();
var TTS_TAG={'zh-Hans':'zh-CN','zh-Hant':'zh-TW','no':'nb-NO','pt':'pt-PT','pt-BR':'pt-BR','ro':'ro-RO'};
function ttsTag(){return TTS_TAG[NL]||NL}
function langMatch(vl){vl=String(vl||'').replace(/_/g,'-').toLowerCase();var al={iw:'he','in':'id',no:'nb',nn:'nb'};var b=vl.split('-')[0];b=al[b]||b;var w=NL.toLowerCase().split('-')[0];w=al[w]||w;
 if(b!==w)return false;if(w==='zh')return /hant|-tw|-hk|-mo/.test(vl)===(NL==='zh-Hant');return true}
var langVoices=[],voicesReady=false,_vTry=0;
function loadVoices(){
 if(NTTS){var j=null;try{j=JSON.parse(NTTS.ttsVoices(NL)||'[]')}catch(_){j=[]}
  if(j===null){allVoices=[];voicesReady=true}else{allVoices=j.map(function(v){return {name:v.name,voiceURI:v.name,lang:v.lang,'default':false,net:v.net,installed:v.installed,quality:v.quality,nat:true}});
   var st=-1;try{st=NTTS.ttsState()}catch(_){};voicesReady=st===2||st===-1;if(!voicesReady&&_vTry++<20)setTimeout(loadVoices,600)}}
 else{if(!window.speechSynthesis)return;allVoices=speechSynthesis.getVoices()||[];voicesReady=allVoices.length>0||_vTry++>3}
 langVoices=allVoices.filter(function(v){return v.installed!==false&&langMatch(v.lang)});roVoice=null;autoMale=false;
 if(cfg.voiceURI)roVoice=langVoices.filter(function(v){return v.voiceURI===cfg.voiceURI})[0]||null;
 if(!roVoice&&langVoices.length){roVoice=langVoices.slice().sort(function(a,b){return NL==='ro'?maleScore(b)-maleScore(a):((a.net?1:0)-(b.net?1:0))||((b.quality||0)-(a.quality||0))||((b['default']?1:0)-(a['default']?1:0))})[0];autoMale=NL==='ro'&&MALE_RE.test(roVoice.name+' '+roVoice.voiceURI)&&!/female/i.test(roVoice.name)}
 if($('modal').classList.contains('show'))fillVoiceSelect()}
function installVoice(){var ok=false;try{ok=NTTS&&NTTS.ttsInstall&&NTTS.ttsInstall()}catch(_){}
 if(!ok)toast(TR('Instalează o voce din setările telefonului: Setări → Sistem → Limbi → Transformare text în vorbire.'))}
function voiceMissing(){var cf=$('cfModal').querySelector('.cftxt'),t0=cf.textContent,ok=$('cfOk'),no=$('cfNo'),o0=ok.textContent,n0=no.textContent;
 var ln='';try{ln=new Intl.DisplayNames([NL==='no'?'nb':NL],{type:'language'}).of(NL==='no'?'nb':NL)}catch(_){}
 cf.textContent=TR('Nu e instalată nicio voce pentru limba aplicației')+(ln?' ('+ln+')':'')+'. '+TR('Instalează una ca să pot citi cu voce tare.');ok.textContent=TR('Instalează o voce');no.textContent=TR('Închide');ok.classList.remove('dngb');
 function back(){cf.textContent=t0;ok.textContent=o0;no.textContent=n0;ok.classList.add('dngb')}
 $('cfOk').onclick=function(){jvClose('cfModal');back();installVoice()};$('cfNo').onclick=function(){jvClose('cfModal');back()};$('cfModal').classList.add('show')}
function curPitch(){return cfg.pitch!=null?+cfg.pitch:(autoMale||NL!=='ro'?1:.75)}
if(NTTS){loadVoices();setTimeout(loadVoices,1500)}
else if(window.speechSynthesis){loadVoices();if(speechSynthesis.addEventListener)speechSynthesis.addEventListener('voiceschanged',loadVoices);else speechSynthesis.onvoiceschanged=loadVoices;setTimeout(loadVoices,500);setTimeout(loadVoices,2000)}

/* word weight ≈ how long it takes to say (used for timing inside a known-duration chunk) */
function spokenLen(w){var core=w.replace(/[^0-9a-zăâîșțşţáéíóúàèìòùäëïöü%]/gi,'');var n=0;
 core.replace(/\d+/g,function(d){n+=d.length*4.5+1;return ''}).replace(/%/g,function(){n+=6;return ''}).replace(/[a-zăâîșțşţáéíóúàèìòùäëïöü]/gi,function(){n+=1;return ''});
 return Math.max(1,n)}
function pauseW(w){return /[.!?…]$/.test(w)?5:/[,;:]$/.test(w)?3:0}
function wordMs(w,rate){return (110+52*spokenLen(w)+pauseW(w)*65)/rate}

/* --- Piper engine: sentence chunks, exact duration per chunk, words placed proportionally, driven by AudioContext clock --- */
/* v143: streaming chunks — the first chunk is tiny (fast first audio), the second short, then sentences; abbreviations/URLs don't split */
var CH_ABBR=/^(dr|nr|str|pag|ex|etc|mr|mrs|ms|prof|ing|sf|art|al|ap|bl|sc|et|jud|tel|vs|e\.g|i\.e|z\.b|bzw|ca|st|sr|jr|no|fig|vol|min|max|aprox|resp|dl|dna|dnul)\.$/i;
function chEnd(w,nx){if(!/[.!?;…]$/.test(w))return false;if(/[!?;…]$/.test(w))return true;var b=w.replace(/^[(\["'„“«]+/,'');if(CH_ABBR.test(b)||/^[A-ZĂÂÎȘȚ]\.$/.test(b)||/^([A-Za-z]\.){2,}$/.test(b)||/^\d+\.$/.test(b)&&nx&&/^\d/.test(nx))return false;return true}
function buildChunks(segs){var out=[];
 segs.forEach(function(seg){var n=seg.words.length,a=0;
  for(var i=0;i<n;i++){var w=seg.words[i].w,len=i-a+1,k=out.length,soft=k===0?3:k===1?6:14,hard=k===0?6:k===1?12:22,
   chars=seg.words[i].e-seg.words[a].s,nx=i+1<n?seg.words[i+1].w:'';
   if(chEnd(w,nx)||i===n-1||(len>=soft&&/[,:]$/.test(w))||len>=hard||chars>=(k<2?90:180)){
    var txt=seg.text.slice(seg.words[a].s,seg.words[i].e);if(!/[.!?…,;:]$/.test(txt))txt+=(i===n-1?'.':',');
    out.push({seg:seg,a:a,b:i+1,text:txt});a=i+1}}});
 return out}
function chunkTimes(ch,pcm,sr){var win=Math.max(1,Math.round(sr*.01)),n=Math.floor(pcm.length/win),en=new Float32Array(n),peak=0;
 for(var i=0;i<n;i++){var s=0;for(var j=i*win,e=j+win;j<e;j++)s+=pcm[j]*pcm[j];en[i]=Math.sqrt(s/win);if(en[i]>peak)peak=en[i]}
 var thr=peak*.08,f=0,l=n-1;while(f<n&&en[f]<thr)f++;while(l>f&&en[l]<thr)l--;
 var t0=f*win/sr,t1=(l+1)*win/sr;if(t1-t0<.1){t0=0;t1=pcm.length/sr}
 var ws=[],tot=0;for(var k=ch.a;k<ch.b;k++){var w=ch.seg.words[k].w,x=spokenLen(w)+1.5+(k<ch.b-1?pauseW(w):0);ws.push(x);tot+=x}
 var times=[],c=0;ws.forEach(function(x){times.push(t0+(t1-t0)*c/tot);c+=x});return times}
function waitUntil(t,gen){return new Promise(function(res){(function chk(){if(gen!==kGen||!actx||actx.currentTime>=t)res();else setTimeout(chk,40)})()})}
function selVoice(){return (cfg.engine==='browser'||NL!=='ro')?null:(TTS.voice(cfg.engine)||TTS.voice('mihai'))}
function speakNeural(segs,gen,v){
 var chunks=buildChunks(segs);if(!chunks.length)return Promise.resolve();
 unlockAudio();if(!actx)return Promise.reject(new Error('AudioContext indisponibil'));
 var rate=curRate(),tone=+cfg.tone||1,proms=[],timeline=[],cursor=0;
 var nat=rate,post=1;
 function get(i){if(!proms[i]){proms[i]=TTS.synth(v.id,chunks[i].text,{speed:nat}).then(function(r){return {pcm:TTS.fx(r.pcm,r.sr,post,tone),sr:r.sr}});proms[i].catch(function(){})}return proms[i]}
 function lat(){return (actx.outputLatency||0)+(actx.baseLatency||0)}
 (function anim(){if(gen!==kGen)return;var now=actx.currentTime-lat();
  for(var j=timeline.length-1;j>=0;j--){var e=timeline[j];if(now>=e.start){var rel=now-e.start,k=0;while(k+1<e.times.length&&rel>=e.times[k+1])k++;hl(e.c.seg,e.c.a+k);break}}
  requestAnimationFrame(anim)})();
 var i=0;
 function step(){if(gen!==kGen)return;if(i>=chunks.length)return waitUntil(cursor,gen);
  get(i);if(i+1<chunks.length)get(i+1);if(i+2<chunks.length)get(i+2);  /* v143: 2 chunks of lookahead */
  return get(i).then(function(r){if(gen!==kGen)return;
   var ch=chunks[i],buf=actx.createBuffer(1,r.pcm.length,r.sr);
   if(buf.copyToChannel)buf.copyToChannel(r.pcm,0);else buf.getChannelData(0).set(r.pcm);
   var src=actx.createBufferSource();src.buffer=buf;src.connect(actx.destination);
   var start=Math.max(actx.currentTime+.04,cursor);src.start(start);sources.push(src);ttsLd(false);
   var dur=r.pcm.length/r.sr;timeline.push({c:ch,start:start,times:chunkTimes(ch,r.pcm,r.sr)});
   var nextSame=chunks[i+1]&&chunks[i+1].seg===ch.seg;cursor=start+dur+(nextSame?0:.12);
   i++;return waitUntil(start,gen).then(step)})}
 return step()}

/* --- phone voice engine (speechSynthesis): boundary events or timer estimate --- */
var ttsCb={},ttsN=0;window.notisTtsEv=function(id,t,s,e){var h=ttsCb[id];if(!h)return;if(t==='start')h.onstart&&h.onstart();else if(t==='range')h.onboundary&&h.onboundary({name:'word',charIndex:s});else{delete ttsCb[id];h.onend&&h.onend()}};
function speakBrowserSeg(seg,gen){ttsLd(false);return new Promise(function(resolve){
 if((!NTTS&&!window.speechSynthesis)||gen!==kGen){resolve();return}
 var sl=seg.lang&&ldBase(seg.lang)!==ldBase(NL)?seg.lang:null,stx=sl?ldClean0(seg.text):seg.text;
  var u=NTTS?{}:new SpeechSynthesisUtterance(stx);if(!NTTS){if(sl){u.lang=TTS_TAG[sl]||sl;try{var ov=speechSynthesis.getVoices().filter(function(x){return ldBase(String(x.lang).replace(/_/g,'-'))===ldBase(sl)});if(ov.length)u.voice=ov.filter(function(x){return x.localService})[0]||ov[0]}catch(_){}}else{u.lang=ttsTag();if(roVoice&&!roVoice.nat){u.voice=roVoice;u.lang=roVoice.lang}}}
 var rate=curRate();u.rate=rate;u.pitch=curPitch();
 var got=false,started=false,done=false,timer=null,est=0;seg.words.forEach(function(w){est+=wordMs(w.w,rate)});
 function fin(){if(done)return;done=true;clearTimeout(timer);clearTimeout(safety);resolve()}
 function run(i){if(gen!==kGen||got||done||i>=seg.words.length)return;hl(seg,i);timer=setTimeout(function(){run(i+1)},wordMs(seg.words[i].w,rate))}
 function onStart(){if(started||gen!==kGen)return;started=true;hl(seg,0);setTimeout(function(){if(!got&&!done&&gen===kGen)run(Math.max(0,seg.cur))},700)}
 u.onstart=onStart;
 u.onboundary=function(e){if(gen!==kGen||(e.name&&e.name!=='word'))return;if(!got){got=true;clearTimeout(timer)}
  var ci=e.charIndex||0,k=0;while(k<seg.words.length-1&&ci>=seg.words[k].e)k++;hl(seg,k)};
 u.onend=u.onerror=fin;
 if(NTTS){var id='u'+(++ttsN);ttsCb[id]=u;if(!NTTS.ttsSpeak(stx,sl?'':(roVoice?roVoice.name:''),sl?(TTS_TAG[sl]||sl):NL,rate,u.pitch,id)&&!(sl&&NTTS.ttsSpeak(stx,roVoice?roVoice.name:'',NL,rate,u.pitch,id))){delete ttsCb[id];fin();return}
  setTimeout(function(){if(!started&&!done&&gen===kGen)onStart()},1200)}
 else{speechSynthesis.speak(u);
 setTimeout(function(){if(!started&&!done&&gen===kGen&&speechSynthesis.speaking)onStart()},1200)}
 var safety=setTimeout(fin,est*2.5+8000)})}
function speakBrowser(segs,gen,mx){
 if(!NTTS&&!window.speechSynthesis){toast(TR('Sinteza vocală nu e disponibilă'));return Promise.resolve()}
 if(!mx&&voicesReady&&!langVoices.length&&(NTTS||allVoices.length)){voiceMissing();return Promise.resolve()}
 var p=Promise.resolve();segs.forEach(function(s){p=p.then(function(){if(gen===kGen)return speakBrowserSeg(s,gen)})});return p}

function stopSpeaking(){kGen++;try{TTS.flush()}catch(_){}sources.forEach(function(s){try{s.stop()}catch(e){}});sources=[];
 if(window.speechSynthesis)speechSynthesis.cancel();if(NTTS)try{NTTS.ttsStop();ttsCb={}}catch(_){}clearActive();speaking=false;speakKey=null;updEq()}
/* v138: per-segment language detection (offline heuristic) for read-aloud */
var LD_SW={ro:'și si în in este sunt să sa nu cu pe la de care pentru mai dar sau ce un o ale lui am ai au fost acest această aceasta fi poate doar foarte unde când cand trebuie face',
 en:'the and is are to of in it you that this for with on be not have has had can will would your from or at as by an was were we they all if do does our about please no yes what which who there their them been my me he she his her its any shall may must should could into than then only also',
 fr:'le la les et est sont des une un pour pas que qui dans sur avec vous nous ce cette mais ou au du',
 de:'der die das und ist sind nicht ein eine zu mit für auf ich sie wir den dem des auch oder aber',
 es:'el la los las y es son de que en un una para con no por del se lo como pero muy',
 it:'il lo la gli le e è sono di che in un una per con non del della si come ma molto',
 pt:'o a os as e é são de que em um uma para com não do da se como mas muito você',
 nl:'de het een en is zijn van dat niet met voor op ik je we ook maar of',
 pl:'i w na nie jest się z do że to jak ale czy tak już',
 tr:'ve bir bu da de için ile çok ne var değil gibi daha',
 hu:'a az és egy hogy nem is van meg de ez csak',sv:'och att det är en som på med för inte jag till av',id:'yang dan di ini itu dengan untuk tidak dari ke ada akan'};
var LD_M={};Object.keys(LD_SW).forEach(function(k){var o={};LD_SW[k].split(' ').forEach(function(w){o[w]=1});LD_M[k]=o});
function ldClean0(t){try{return String(t).replace(/[\p{Extended_Pictographic}\u200d\ufe0f]/gu,'')}catch(_){return t}}
function ldBase(l){return String(l||'').split('-')[0].toLowerCase()}
function ldClean(t){t=String(t||'');try{t=t.replace(/[\p{Extended_Pictographic}\u200d\ufe0f]/gu,' ')}catch(_){}
 try{lnkFind(t).slice().reverse().forEach(function(x){t=t.slice(0,x.i)+' '+t.slice(x.i+x.v.length)})}catch(_){}return t.replace(/https?:\/\/\S+|www\.\S+|\S+@\S+\.\S+/gi,' ')}
function ldDetect(t){t=ldClean(t);var n=ldBase(NL);
 var sc=[[/[\u0400-\u04FF]/g,/[іїєґ]/i.test(t)?'uk':/[ѓќѕљњџ]/i.test(t)?'mk':n==='bg'||n==='sr'||n==='uk'||n==='mk'?n:'ru'],[/[\u0600-\u06FF]/g,/[پچژگک]/.test(t)?'fa':'ar'],[/[\u0590-\u05FF]/g,'he'],[/[\u0370-\u03FF]/g,'el'],[/[\u0E00-\u0E7F]/g,'th'],[/[\u0900-\u097F]/g,'hi'],[/[\u0980-\u09FF]/g,'bn'],[/[\u3040-\u30FF]/g,'ja'],[/[\uAC00-\uD7AF]/g,'ko'],[/[\u4E00-\u9FFF]/g,n==='ja'?'ja':NL==='zh-Hant'?'zh-Hant':'zh-Hans']];
 var letters=(t.match(/\p{L}/gu)||[]).length;if(!letters)return null;
 for(var i=0;i<sc.length;i++){var c=(t.match(sc[i][0])||[]).length;if(c>=letters*.4)return sc[i][1]}
 var ws=t.toLowerCase().match(/[\p{L}']+/gu)||[];if(!ws.length)return null;var best=null,bs=0,sco={};
 Object.keys(LD_M).forEach(function(k){var m=LD_M[k],x=0;ws.forEach(function(w){if(m[w])x++});if(k==='ro')x+=((t.match(/[ăâîșşțţ]/gi)||[]).length)*1.5;sco[k]=x;if(x>bs){bs=x;best=k}});
 if(/[ăîșşțţ]/i.test(t))return 'ro';
 if(!best||bs<(ws.length<4?1:2))return null;if(sco[n]!=null&&sco[n]>=bs)return n;return best}
function ldMark(segs){var prev=null;segs.forEach(function(s){var d=ldDetect(s.text),w=(ldClean(s.text).match(/\p{L}+/gu)||[]).length;
  if(d&&(w>=3||!prev))prev=d;else if(d&&w<3&&prev&&d!==prev)d=prev;s.lang=d||prev||NL});
 var any=segs.some(function(s){return ldBase(s.lang)!==ldBase(NL)});if(!any)segs.forEach(function(s){delete s.lang});return segs}
window.ldDetect=ldDetect;window.ldMark=ldMark;
/* v140: per-line voice routing: ro -> Mihai, en -> Joe (downloaded on demand since v142; nothing bundled), other languages -> their downloaded Piper voice, else the phone voice */
var nrLang=null,vForce=null,vHinted=false;
/* v143: warm start — load the installed+enabled voices a note will need (max 2, the engine keeps 2 sessions) before the tap */
var vWarmT=0;function vWarmIds(ids){var seen={};ids.filter(function(v){if(!v||seen[v.engine])return false;seen[v.engine]=1;return vOn(v.id)&&TTS.has(v.engine)}).slice(0,2).reduce(function(p,v){return p.then(function(){return TTS.init(v.engine).catch(function(){})})},Promise.resolve())}
function vWarmNote(){clearTimeout(vWarmT);vWarmT=setTimeout(function(){try{if(cfg.engine==='browser')return;var fs=$('noteFull');if(!fs||!fs.classList.contains('show'))return;
 var t=[].map.call(fs.querySelectorAll('#nfTitle,#nfText,.nbt,.cit'),function(e){return e.value!=null?e.value:e.textContent}).join('\n');
 var vs=[];if(nrLang)vs.push(TTS.voice(nrLang));t.split(/\n+/).filter(function(x){return x.trim().length>2}).slice(0,40).forEach(function(l){vs.push(vRoute(ldBase(ldDetect(l)||NL)))});
 if(vs.length===0)vs.push(vRoute(NL));vWarmIds(vs)}catch(_){}},350)}
window.__vWarm=vWarmNote;
(function(){var fs=document.getElementById('noteFull');if(fs)new MutationObserver(function(){if(fs.classList.contains('show'))vWarmNote()}).observe(fs,{attributes:true,attributeFilter:['class']});
 document.addEventListener('pointerdown',function(e){var li=e.target.closest&&e.target.closest('#nrLM .nrli');if(li){var v=li.getAttribute('data-v');if(v)vWarmIds([TTS.voice(v)]);return}
  if(e.target.closest&&e.target.closest('#nfRead'))vWarmNote()},true)})();
function vcBusy(){if(document.querySelector('.modal.show,#noteFull.show,#vcCard'))return true;return ['nwOb','nwCard','nsSS','crRing','shModal','lbModal','cPick','dsgn','demoBan'].some(function(id){var e=$(id);return e&&e.getClientRects().length&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'})}
function vcMaybe(){try{if(localStorage.getItem('ns_vcard'))return;if(TTS.ALL.some(function(v){return TTS.has(v.engine)})){localStorage.setItem('ns_vcard','1');return}}catch(_){return}
 var n=0;(function tryShow(){if(localStorage.getItem('ns_vcard'))return;if(vcBusy()){if(++n<200)setTimeout(tryShow,3000);return}vcShow()})()}
function vcClose(){var c=$('vcCard');if(c)c.remove();try{localStorage.setItem('ns_vcard','1')}catch(_){}}
function vcShow(){if($('vcCard'))return;var c=document.createElement('div');c.id='vcCard';c.setAttribute('role','dialog');
 c.innerHTML='<div class="vcb"><div class="vct">'+esc(TR('Intră în meniul VOCE din Setări dacă vrei ca textele să ți fie citite.'))+'</div><div class="vcr"><button type="button" class="btn" id="vcOpen">'+esc(TR('Deschide Voce'))+'</button><button type="button" class="btn" id="vcOk">OK</button></div></div>';
 document.body.appendChild(c);c.addEventListener('click',function(e){if(e.target===c){vcClose();return}if(e.target.id==='vcOk')vcClose();else if(e.target.id==='vcOpen'){vcClose();vcOpenVoice()}})}
function vcOpenVoice(){try{$('bSettings').click();setTimeout(function(){var f=$('fVoices');if(!f)return;var b=f.closest('.secb'),h=b&&b.previousElementSibling;if(h&&h.classList.contains('sect')&&!h.classList.contains('open'))h.click();setTimeout(function(){f.scrollIntoView({block:'start'})},60)},250)}catch(_){}}
window.__vc={show:vcShow,maybe:vcMaybe,busy:vcBusy};
function vOn(id){return !(cfg.vOn&&cfg.vOn[id]===false)}
function vAvail(v){return !!v&&(v.bundled||TTS.has(v.engine)||TTS.state(v.engine)==='ready')}
function vMenuL(){return TTS.ALL.filter(function(v){return vAvail(v)&&vOn(v.id)})}
window.vMenu=function(){return vMenuL().map(function(v){return v.id})};
function vRoute(l){try{if(vForce){var vf=TTS.voice(vForce);if(vf&&vAvail(vf))return vf}if(cfg.engine==='browser')return null;l=ldBase(l||NL);
 var mv=cfg.mainVoice;if(mv&&mv!=='auto'&&l===ldBase(NL)){if(mv==='browser')return null;var v0=TTS.voice(mv);if(v0&&vAvail(v0)&&vOn(v0.id))return v0}
 var e=TTS.forLang(l);if(!e)return null;var v=TTS.voice(e);if(v&&vAvail(v)&&vOn(v.id))return v}catch(_){}return null}
window.__ttsCfg=function(k,v){var o=cfg[k];if(arguments.length>1)cfg[k]=v;return o};
window.ttsRoute=function(segs){return segs.map(function(s){var v=vRoute(s.lang||NL);return v?v.id:'phone'})};
function ttsGroupsL(segs){var gr=[];segs.forEach(function(s){var l=ldBase(s.lang||NL),v=vRoute(l),k=v?v.id:'@'+l,g=gr[gr.length-1];if(g&&g.k===k)g.s.push(s);else gr.push({k:k,v:v,l:l,s:[s]})});return gr}
window.ttsGroups=function(segs){return ttsGroupsL(segs).map(function(g){return g.k+':'+g.s.length})};
function speak(segs,key){
 stopSpeaking();var gen=++kGen;speaking=true;speakKey=key||null;ttsWait=true;updEq();unlockAudio();
 var v=selVoice(),e=v&&v.engine,useN=!!v&&(TTS.state(e)==='ready'||TTS.has(e));
 if(v&&!useN&&false){
  toast(TTS.state(e)==='loading'?TR('Vocea ')+v.short+TR(' se pregătește (')+Math.round(TTS.progress(e)*100)+TR('%). Până atunci folosesc vocea telefonului.'):TR('Vocea ')+v.short+TR(' nu e disponibilă. Folosesc vocea telefonului.'))}
 var gr=ttsGroupsL(segs),p,anyN=gr.some(function(g){return g.v});
 setStatus(anyN?TR('Vorbesc (')+gr.filter(function(g){return g.v}).map(function(g){return g.v.short}).filter(function(x,i,a){return a.indexOf(x)===i}).join(', ')+')…':TR('Vorbesc…'));
 if(gr.length===1&&!gr[0].v)p=speakBrowser(segs,gen);
 else{var multi=gr.length>1;p=Promise.resolve();gr.forEach(function(g){p=p.then(function(){if(gen!==kGen)return;
   if(g.v)return speakNeural(g.s,gen,g.v).catch(function(err){console.warn(err);if(gen!==kGen)return;if(!multi)setStatus(TR('Eroare voce ')+g.v.short+': '+(err&&err.message||err)+TR('. Folosesc vocea telefonului.'),true);return speakBrowser(g.s,gen,1)});
   return speakBrowser(g.s,gen,multi?1:undefined)})})}
 function fin(){if(gen!==kGen)return;ttsWait=false;speaking=false;speakKey=null;updEq();clearActive();setStatus();if(!greetBusy)renderGreet(true)}
 return p.then(fin,fin)}

/* what each card says */
function segsVoice(){greetBusy=false;return [prepSeg($('greet'),greetFull())]}
function segsWx(){var s=[prepSeg(null,TR('Vremea în ')+cfg.city+'.')];if(wx)s.push(prepSeg($('wxtxt'),wxSentence(wx)));else s.push(prepSeg(null,TR('Nu am date despre vreme.')));return s}
function segsUrg(open,getEl,emptyMsg){var s=[],urg=open.filter(function(x){return x.urgent}),norm=open.filter(function(x){return !x.urgent});
 if(!open.length){s.push(prepSeg(null,emptyMsg));return s}
 if(urg.length){s.push(prepSeg(null,TR('Urgent:')));urg.forEach(function(x){s.push(prepSeg(getEl(x),x.text))})}
 norm.forEach(function(x){s.push(prepSeg(getEl(x),x.text))});return s}
function segsTasks(which){var lt=which==='maine'?$('ltMaine'):$('ltAzi'),title=which==='maine'?TR('Taskuri pentru mâine'):TR('Taskuri pentru azi'),ul=which==='maine'?'lMaine':'lAzi';
 return [prepSeg(lt,title)].concat(segsUrg(listFor(which).filter(function(t){return !t.done}),function(t){return document.querySelector('#'+ul+' li[data-id="'+t.id+'"] .t')},TR('Niciun task deschis.')))}
function segsShop(){return [prepSeg($('ltShop'),TR('Cumpărături'))].concat(segsUrg(shopList().filter(function(x){return !x.bought}),function(x){return document.querySelector('#lShop li[data-id="'+x.id+'"] .t')},TR('Lista de cumpărături e goală.')))}
function segsTab(tab){var c=$('ct_'+tab.id);return [prepSeg(c&&c.querySelector('.lt'),tab.name)].concat(segsUrg(tabList(tab).filter(function(x){return !x.done}),function(x){return document.querySelector('#ct_'+tab.id+' li[data-id="'+x.id+'"] .t')},TR('Lista e goală.')))}
function readCard(key){if(speaking&&speakKey===key){stopSpeaking();return}
 if(/^tab:/.test(key)){var tb=findTab(key.slice(4));if(!tb)return;return speak(segsTab(tb),key)}
 if(key==='below')return speak(segsTasks('azi').concat(segsTasks('maine'),segsShop(),[].concat.apply([],visTabs().map(segsTab))),key);
 var segs=key==='voice'?segsVoice():key==='wx'?segsWx():key==='azi'?segsTasks('azi'):key==='maine'?segsTasks('maine'):key==='shop'?segsShop():
  segsWx().concat(segsTasks('azi'),segsTasks('maine'),segsShop(),[].concat.apply([],visTabs().map(segsTab))); /* bottom Citește: weather + tasks only */
 return speak(segs,key)}
function say(text){greetBusy=true;clearTimeout(greetRestoreT);var seg=prepSeg($('greet'),text);
 return speak([seg],'voice').then(function(){greetRestoreT=setTimeout(function(){greetBusy=false;if(!speaking)renderGreet()},10000)})}
document.querySelectorAll('.spk').forEach(function(b){b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
 b.addEventListener('click',function(){readCard(b.dataset.read)})});
$('bRead').onclick=function(){readCard('all')};
$('bReadAll').querySelector('.rai').innerHTML=SPK_SVG;$('bReadAll').onclick=function(){readCard('below')};
function openVoice(){$('cVoice').classList.remove('col');$('voiceModal').classList.add('show')}function closeVoice(){$('voiceModal').classList.remove('show')}
$('cVoice').addEventListener('click',function(e){if(e.target.closest('.lbl')&&!e.target.closest('.spk,.vclose'))e.stopPropagation()},true);
$('voiceClose').addEventListener('click',function(e){e.stopPropagation();closeVoice()});$('voiceModal').addEventListener('click',function(e){if(e.target===this)closeVoice()});
$('bHi').onclick=function(){openVoice();if(speaking&&speakKey==='voice'){stopSpeaking();return}readCard('voice')};

/* ---------- neural voice download / init with progress in the voice card ---------- */
function showProg(frac,phase,v){var p=$('vprog');
 if(phase==='ready'||frac>=1){p.classList.remove('show');return}
 p.classList.add('show');var mb=TTS.sizeMB(v.engine);
 $('vprogTxt').textContent=phase==='init'?TR('Pregătesc vocea ')+v.short+'…':TR('Descarc vocea ')+v.short+'… '+Math.round(frac*100)+'% ('+Math.round(frac*mb)+'/'+mb+' MB)';
 $('vprogBar').style.width=Math.round(frac*100)+'%';if($('modal').classList.contains('show'))updVoiceRow()}
function ensureVoice(id){var v=TTS.voice(id||cfg.engine)||TTS.voice('mihai'),e=v.engine;
 if(TTS.state(e)==='ready'||TTS.state(e)==='loading')return TTS.init(e);
 return TTS.init(e,function(f,ph){showProg(f,ph,v)}).then(function(){showProg(1,'ready',v);if(!speaking){setStatus(TR('Vocea ')+v.short+TR(' e gata (funcționează și offline).'));setTimeout(function(){if(!speaking)setStatus()},4000)}updVoiceRow()},
  function(err){$('vprog').classList.remove('show');console.warn(err);if(!speaking)setStatus(TR('Nu am putut încărca vocea ')+v.short+' ('+(err&&err.message||err)+TR('). Folosesc vocea telefonului.'),true);updVoiceRow();throw err})}
/* v140: re-detect installed voices (cache / APK bundle) — nothing about voices is stored in backups */
function vDetect(){return Promise.all(TTS.ALL.map(function(v){return TTS.isDownloaded(v.engine)})).then(function(){try{if($('modal').classList.contains('show'))vlRender()}catch(_){}})}
window.vDetect=vDetect;
function bootVoice(){vDetect().then(function(){if(cfg.engine==='browser')return;
  /* web: the two included voices (Mihai + Joe) are fetched once in the background and cached, like Mihai before */
  vcMaybe()});
 var v=selVoice();if(!v)return;
 TTS.isDownloaded(v.engine).then(function(have){var c=navigator.connection;
  if(have)ensureVoice().catch(function(){})})}

/* ---------- v140: voices list (Settings → Voce): Mihai + English included, other languages downloadable ---------- */
var vlOpen=false;
function vlLang(l){try{var n=new Intl.DisplayNames([NL],{type:'language'}).of(l);return n.charAt(0).toUpperCase()+n.slice(1)}catch(_){return l}}
function vlName(v){return vlLang(v.lang)+' — '+v.short}
function vlNet(){var c=navigator.connection;return c&&(c.type==='cellular'||/2g|3g/.test(c.effectiveType||'')&&c.type!=='wifi')?TR(' Ești pe date mobile: se consumă date.'):TR(' Recomandat pe Wi-Fi.')}
function vlRow(v){var e=v.engine,d=TTS.dlState(e),inc=v.bundled;if(d.st!=='loading'&&TTS.has(e))d={st:'done',f:1};var h='<div class="vlr" data-e="'+e+'"><span class="vln">'+esc(vlName(v))+'</span>';
 var ck=(inc||d.st==='done')?'<input type="checkbox" class="vlc" aria-label="'+esc(TR('Arată la apăsare lungă pe 🔊'))+'"'+(vOn(v.id)?' checked':'')+'>':'';
 if(inc&&d.st!=='done')return h+'<span class="vlm vlok">✓ '+esc(TR('(inclus)'))+'</span>'+ck+'</div>';
 if(d.st==='loading')h+='<span class="vlp"><i style="width:'+Math.round(d.f*100)+'%"></i></span><span class="vlm">'+Math.round(d.f*100)+'%</span><button type="button" class="btn vlb" data-a="x">'+esc(TR('Anulează'))+'</button>';
 else if(d.st==='done')h+='<span class="vlm vlok">✓'+(inc?' '+esc(TR('(inclus)')):'')+'</span>'+(inc?'':'<button type="button" class="btn vlb" data-a="del">'+esc(TR('Șterge'))+'</button>')+ck;
 else h+='<span class="vlm">'+TTS.modelMB(e)+' MB</span><button type="button" class="btn vlb" data-a="dl">'+esc(TR('Descarcă'))+'</button>';
 return h+'</div>'}
function vlRender(){var box=$('fVoices');if(!box)return;var all=TTS.ALL,inc=all.filter(function(v){return v.top}),oth=all.filter(function(v){return !v.top});
 oth.sort(function(a,b){return vlName(a).localeCompare(vlName(b))});
 var mv=cfg.mainVoice||'auto',opts='<option value="auto">'+esc(TR('Automat (limba aplicației)'))+'</option>';
 all.forEach(function(v){if(vAvail(v))opts+='<option value="'+v.id+'"'+(mv===v.id?' selected':'')+'>'+esc(vlName(v))+'</option>'});
 opts+='<option value="browser"'+(mv==='browser'?' selected':'')+'>'+esc(TR('Vocea telefonului'))+'</option>';
 box.innerHTML='<label>'+esc(TR('Voci de citire'))+'</label><div class="vll">'+inc.map(vlRow).join('')+
  '<button type="button" class="vlr vlmore" id="vlMore" aria-expanded="'+vlOpen+'"><span class="vln">'+esc(TR('Alte limbi'))+'</span><span class="vlm">'+oth.filter(function(v){return TTS.has(v.engine)}).length+'/'+oth.length+' <i class="sparr sp19'+(vlOpen?' on':'')+'"></i></span></button>'+
  (vlOpen?'<div class="vlo">'+oth.map(vlRow).join('')+'</div>':'')+'</div>'+
  '<label for="sMainV" class="vlml">'+esc(TR('Vocea principală'))+'</label><select id="sMainV">'+opts+'</select>'+
  '<div class="hint">'+esc(TR('Ține apăsat pe 🔊 ca să alegi limba'))+'</div><div class="hint">'+esc(TR('Descarcă doar vocile de care ai nevoie (recomandat pe Wi-Fi); apoi merg offline. Fără voce descărcată se citește cu vocea telefonului.'))+'</div>';
 if(mv!=='auto'&&!$('sMainV').value)$('sMainV').value='auto';}
function vlSetMain(id){cfg.mainVoice=id;try{if(draft)draft.mainVoice=id}catch(_){}saveCfg()}
var vlT=0;function vlTick(){var t=Date.now();if(t-vlT<250)return;vlT=t;vlRender()}
function vlDl(e){var v=TTS.voice(e);if(!v)return;
 lbAsk(TR('Descarci vocea ')+vlName(v)+' ('+TTS.modelMB(e)+' MB)?'+vlNet(),TR('Da'),function(){
  TTS.download(e,function(f,ph){if(ph==='done'||ph==='cancel'||ph==='error')vlRender();else vlTick()}).then(function(ok){if(ok){cfg.vOn=cfg.vOn||{};cfg.vOn[v.id]=true;saveCfg()}vlRender();toast(ok?TR('Vocea e gata')+': '+vlName(v):TR('Descărcare anulată'))},
   function(err){vlRender();toast(TR('Nu am putut descărca vocea')+' ('+(err&&err.message||err)+')')});setTimeout(vlRender,30)})}
document.addEventListener('click',function(ev){var t=ev.target;if(!t.closest)return;
 if(t.closest('#vlMore')){vlOpen=!vlOpen;vlRender();return}
 var b=t.closest('#fVoices .vlb');if(!b)return;var e=b.closest('.vlr').getAttribute('data-e'),a=b.getAttribute('data-a'),v=TTS.voice(e);
 if(a==='dl')vlDl(e);else if(a==='x'){TTS.cancel(e);setTimeout(vlRender,30)}
 else if(a==='del')lbAsk(TR('Ștergi vocea ')+vlName(v)+TR(' descărcată? (se poate descărca din nou)'),TR('Da'),function(){TTS.remove(e).then(function(){if(cfg.mainVoice===v.id)vlSetMain('auto');vlRender();toast(TR('Vocea a fost ștearsă'))})})});
document.addEventListener('change',function(ev){var t=ev.target;if(t&&t.id==='sMainV')vlSetMain(t.value);
 if(t&&t.classList&&t.classList.contains('vlc')){var v=TTS.voice(t.closest('.vlr').getAttribute('data-e'));if(!v)return;cfg.vOn=Object.assign({},cfg.vOn||{});cfg.vOn[v.id]=t.checked;try{if(draft)draft.vOn=cfg.vOn}catch(_){}saveCfg();if(!t.checked&&nrLang===v.id)nrLang=null}});

/* ---------- task input: just open the keyboard (dictate with the keyboard's own mic) ---------- */
$('bMic').onclick=function(){var i=$('iTask');i.focus();try{i.click()}catch(e){}};
$('bMicM').onclick=function(){var i=$('iTaskM');i.focus();try{i.click()}catch(e){}};

/* ---------- settings modal ---------- */
var pending=null,draft=null;
function fillVoiceSelect(){var sel=$('sVoice'),cur=sel.value||cfg.voiceURI||'';sel.innerHTML='';
 var o=document.createElement('option');o.value='';o.textContent=TR('Automat')+(roVoice&&!cfg.voiceURI?' ('+roVoice.name+')':'');sel.appendChild(o);
 langVoices.forEach(function(v){var op=document.createElement('option');op.value=v.voiceURI;op.setAttribute('data-u','');op.textContent=v.name+' ('+v.lang+')'+(v.net?' ☁':'')+(v['default']?' ★':'');sel.appendChild(op)});
 sel.value=cur;if(sel.value!==cur)sel.value='';
 var h=$('vHint');if(h)h.textContent=langVoices.length?TR('Voci instalate pentru limba aplicației: ')+langVoices.length:TR('Nu e instalată nicio voce pentru limba aplicației.')}
function fillEngineSelect(){var sel=$('sEngine');if(sel.options.length)return;
 if(NL==='ro')TTS.VOICES.forEach(function(v){var o=document.createElement('option');o.value=v.id;o.textContent=v.label+' · ~'+TTS.sizeMB(v.engine)+' MB';sel.appendChild(o)});
 var o=document.createElement('option');o.value='browser';o.textContent=TR('Vocea telefonului');sel.appendChild(o)}
var NOTES={piper:TTS.opaque?TR('Fișier deschis local: vocea poate fi descărcată la fiecare deschidere. Deschide linkul online ca să rămână salvată.'):TR('Rapidă. Se descarcă o singură dată și merge offline.')};
function updVoiceRow(){var id=$('sEngine').value;if(id==='browser')return;var v=TTS.voice(id),e=v.engine,s=TTS.state(e),el=$('pState');
 $('pMB').textContent=TTS.sizeMB(e);$('pNote').textContent=NOTES[e];
 if(s==='ready'){el.textContent='✓ '+TTS.engineName(e)+TR(' e descărcată și gata.');$('pDl').style.display='none';$('pDel').style.display=''}
 else if(s==='loading'){el.textContent=TR('Se descarcă… ')+Math.round(TTS.progress(e)*100)+'%';$('pDl').style.display='none';$('pDel').style.display='none'}
 else TTS.isDownloaded(e).then(function(h){if($('sEngine').value!==id)return;el.textContent=h?TR('Descărcată (se încarcă la nevoie).'):(s==='error'?TR('Eroare la descărcare. Reîncearcă.'):TR('Nedescărcată.'));
  $('pDl').style.display='';$('pDl').textContent=h?TR('Încarcă'):TR('Descarcă');$('pDel').style.display=h?'':'none'})}
function updEngineUI(){try{vlRender()}catch(_){}var b=$('sEngine').value==='browser';$('fVoice').style.display=b?'':'none';$('fPitch').style.display=b?'':'none';$('fPiper').style.display=b?'none':'';$('fTone').style.display=b?'none':''}
function showVals(){$('vRate').textContent=(+$('sRate').value).toFixed(2)+'×';$('vPitch').textContent=(+$('sPitch').value).toFixed(2);$('vSize').textContent=$('sSize').value+' px';$('vNewsSize').textContent=$('sNewsSize').value+'%';$('vTone').textContent=(+$('sTone').value).toFixed(2)+((+$('sTone').value)<.99?TR(' (mai grav)'):(+$('sTone').value)>1.01?TR(' (mai subțire)'):TR(' (natural)'))}
function buildFontGrid(){var g=$('fontGrid'),d=new Date(),t=pad(d.getHours())+'.'+pad(d.getMinutes());g.innerHTML='';
 FONTS.forEach(function(f){var b=document.createElement('button');b.type='button';b.className='fopt'+(draft.clockFont===f.id?' sel':'');
  b.innerHTML='<b style="font-family:'+esc(f.css)+';font-weight:'+f.w+';font-size:'+Math.round(26*f.k)+'px">'+t+'</b><span>'+esc(f.name)+'</span>';
  b.onclick=function(){draft.clockFont=f.id;applyClock(draft);g.querySelectorAll('.fopt').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel')};g.appendChild(b)})}
var COLORS=['#3fd8ff','#4ade80','#f5b84a','#ff6b6b','#c084fc','#ffffff'];
function buildColors(){var r=$('colorRow');r.innerHTML='';
 COLORS.forEach(function(c){var b=document.createElement('button');b.type='button';b.className='sw'+(draft.clockColor.toLowerCase()===c?' sel':'');b.style.background=c;b.setAttribute('aria-label',c);
  b.onclick=function(){draft.clockColor=c;$('cPick').value=c;applyClock(draft);buildColors()};r.appendChild(b)});
 var p=document.createElement('input');p.type='color';p.id='cPick';p.value=draft.clockColor;p.oninput=function(){draft.clockColor=p.value;applyClock(draft);r.querySelectorAll('.sw').forEach(function(x){x.classList.remove('sel')})};r.appendChild(p)}
$('sRate').oninput=$('sPitch').oninput=$('sTone').oninput=showVals;
$('sSize').oninput=function(){showVals();draft.clockSize=+this.value;applyClock(draft)};
$('sNewsSize').oninput=function(){showVals();draft.newsSize=+this.value;applyNewsSize(draft.newsSize)};
$('sEngine').onchange=function(){updEngineUI();updVoiceRow()};
$('sVoiceDl').onclick=installVoice;
$('pDl').onclick=function(){ensureVoice($('sEngine').value).catch(function(){});setTimeout(updVoiceRow,50)};
$('pDel').onclick=function(){var v=TTS.voice($('sEngine').value);if(!v||!confirm(TR('Ștergi vocea ')+TTS.engineName(v.engine)+TR(' descărcată? (se poate descărca din nou)')))return;TTS.remove(v.engine).then(function(){toast(TR('Vocea a fost ștearsă'));updVoiceRow()})};
$('sTest').onclick=function(){var old={engine:cfg.engine,rate:cfg.rate,pitch:cfg.pitch,voiceURI:cfg.voiceURI,tone:cfg.tone};
 cfg.tone=+$('sTone').value;if(NL==='ro')cfg.engine=$('sEngine').value;cfg.rate=+$('sRate').value;cfg.pitch=+$('sPitch').value;cfg.voiceURI=$('sVoice').value||null;loadVoices();
 greetBusy=true;clearTimeout(greetRestoreT);var seg=prepSeg($('greet'),TR('Salut, ')+($('sName').value.trim()||cfg.name)+TR('. Așa sună vocea mea acum.'));
 speak([seg],'voice').then(function(){greetBusy=false});setTimeout(function(){Object.assign(cfg,old);loadVoices()},0)};
$('bSettings').onclick=function(){draft={clockFont:cfg.clockFont,clockColor:cfg.clockColor,clockSize:cfg.clockSize,newsSize:newsScale,newsCats:newsCats.slice()};
 $('sName').value=cfg.name;$('sCity').value=cfg.city;$('cityList').innerHTML='';pending=null;$('citySel').textContent='';
 fillEngineSelect();$('sEngine').value=NL==='ro'?cfg.engine:'browser';$('sTone').value=cfg.tone;loadVoices();fillVoiceSelect();$('sVoice').value=cfg.voiceURI||'';$('sRate').value=curRate();$('sPitch').value=curPitch();$('sSize').value=cfg.clockSize;$('sNewsSize').value=newsScale;buildNewsCats(draft.newsCats);
 $('sRemindUrg').checked=cfg.remindUrgent!==false;showVals();updEngineUI();updVoiceRow();buildFontGrid();buildColors();renderBkList();$('modal').classList.add('show')};
function closeModal(){applyClock(cfg);applyNewsSize(newsScale);renderNews(newsCats);$('modal').classList.remove('show')}
$('sCancel').onclick=closeModal;
$('modal').addEventListener('click',function(e){if(e.target===this)closeModal()});
function geocode(q){return fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(q)+'&count=5&language=ro&format=json').then(function(r){return r.json()}).then(function(j){return j.results||[]})}
var gT=null;
function citySel(p,sub){pending=p;$('sCity').value=p.city;$('cityList').innerHTML='';$('citySel').textContent='✓ '+p.city+(sub?' · '+sub:'')+TR(' — apasă Salvează')}
$('sCity').addEventListener('input',function(){pending=null;$('citySel').textContent='';clearTimeout(gT);var q=this.value.trim();if(q.length<2){$('cityList').innerHTML='';return}
 gT=setTimeout(function(){geocode(q).then(function(res){var cl=$('cityList');cl.innerHTML='';
  if(!res.length){cl.innerHTML='<div class="hint">Niciun rezultat.</div>';return}
  res.forEach(function(c){var b=document.createElement('button');b.type='button';b.className='btn';var sub=[c.admin1,c.country].filter(Boolean).join(', ');
   b.innerHTML='<b>'+esc(c.name)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'');
   b.onclick=function(){citySel({city:c.name,lat:c.latitude,lon:c.longitude,tz:c.timezone||'auto'},sub)};cl.appendChild(b)})}).catch(function(){$('cityList').innerHTML='<div class="hint">Fără internet: nu pot căuta orașul.</div>'})},400)});
$('sGeo').onclick=function(){if(!navigator.geolocation){toast(TR('Locația nu e disponibilă pe acest dispozitiv'));return}
 var b=this;b.disabled=true;$('citySel').textContent=TR('Caut locația…');
 navigator.geolocation.getCurrentPosition(function(pos){var lat=+pos.coords.latitude.toFixed(4),lon=+pos.coords.longitude.toFixed(4);
  fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+lat+'&longitude='+lon+'&localityLanguage=ro').then(function(r){return r.json()}).catch(function(){return{}}).then(function(j){
   var nm=(j&&(j.city||j.locality))||TR('Locația mea'),sub=[j&&j.principalSubdivision,j&&j.countryName].filter(Boolean).join(', ');
   b.disabled=false;citySel({city:nm,lat:lat,lon:lon,tz:'auto'},sub)})},
  function(){b.disabled=false;$('citySel').textContent='';toast(TR('Nu am acces la locație (permisiune refuzată)'))},{enableHighAccuracy:false,timeout:12000,maximumAge:600000})};
$('sSave').onclick=function(){var name=$('sName').value.trim()||cfg.name,city=$('sCity').value.trim();
 function done(){saveCfg();$('modal').classList.remove('show');applyClock();renderGreet(true);renderWx();loadWx();toast(TR('Setări salvate'));if(cfg.engine!=='browser'&&NL==='ro'&&TTS.has((TTS.voice(cfg.engine)||TTS.voice('mihai')).engine))ensureVoice().catch(function(){})}
 cfg.name=name;if(NL==='ro')cfg.engine=$('sEngine').value;cfg.tone=+$('sTone').value;cfg.voiceURI=$('sVoice').value||null;cfg.rate=+$('sRate').value;cfg.pitch=+$('sPitch').value;
 cfg.remindUrgent=!!$('sRemindUrg').checked;cfg.clockFont=draft.clockFont;cfg.clockColor=draft.clockColor;cfg.clockSize=draft.clockSize;newsScale=draft.newsSize||100;LS.set('ns_newssize',newsScale);applyNewsSize(newsScale);newsCats=draft.newsCats.slice();LS.set('ns_newscats',newsCats);renderNews(newsCats);loadVoices();
 if(pending){var chg=pending.lat!==cfg.lat||pending.lon!==cfg.lon||pending.city!==cfg.city;cfg.city=pending.city;cfg.lat=pending.lat;cfg.lon=pending.lon;cfg.tz=pending.tz;if(chg){wx=null;LS.set('ns_wx',null)}done()}
 else if(city&&city!==cfg.city){geocode(city).then(function(r){if(!r.length){toast(TR('Orașul nu a fost găsit'));return}
   cfg.city=r[0].name;cfg.lat=r[0].latitude;cfg.lon=r[0].longitude;cfg.tz=r[0].timezone||'auto';wx=null;LS.set('ns_wx',null);done()}).catch(function(){toast(TR('Fără internet: nu pot căuta orașul'))})}
 else done()};



/* ---------- urgent reminder (v36) ---------- */
function urgentAzi(){return listFor('azi').filter(function(t){return !t.done&&t.urgent})}
function maybeRemindUrgent(){
 if(cfg.remindUrgent===false||document.querySelector('.modal.show'))return;
 var u=urgentAzi();if(!u.length)return;
 var day=dkey();if(LS.get('ns_urgday',null)===day)return;LS.set('ns_urgday',day);
 var n=u.length,tit=u.slice(0,2).map(function(t){return t.text}).join(' · ');
 var msg=(n===1?TR('Ai 1 task urgent azi: '):TR('Ai ')+n+TR(' taskuri urgente azi: '))+tit+(n>2?'…':'');
 toast(msg);clearTimeout(toast._t);toast._t=setTimeout(function(){$('toast').classList.remove('show')},5500)}
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(maybeRemindUrgent,600)});
window.addEventListener('focus',function(){setTimeout(maybeRemindUrgent,600)});
/* ---------- backups (v32) ---------- */
var BK_KEYS=['ns_notes','ns_notetabs','ns_notetab','ns_cfg','ns_tasks','ns_shop','ns_tabs','ns_tabcol','ns_cardcol','ns_newscats','ns_newssize','ns_folders'],BK_MAX=20;
var BK_CFG_DEF={name:(BLANK||!NS_HASCFG)?'':'Iosif',city:'Gherla',lat:47.03,lon:23.91,tz:'Europe/Bucharest',engine:'mihai',rate:1.25,pitch:null,voiceURI:null,tone:1,clockFont:'condensed',clockColor:'#3fd8ff',clockSize:56,remindUrgent:true};
function bkLabel(d){return fDate(d||new Date(),1)}
function bkList(){var a=LS.get('ns_backups',[]);return Array.isArray(a)?a:[]}
function bkSaveList(a){LS.set('ns_backups',a)}
function bkCollect(){return Object.assign({ns_cfg:JSON.parse(JSON.stringify(cfg)),ns_tasks:JSON.parse(JSON.stringify(tasks)),ns_shop:JSON.parse(JSON.stringify(shop)),ns_tabs:JSON.parse(JSON.stringify(tabs)),ns_tabcol:JSON.parse(JSON.stringify(tabCol||{})),ns_cardcol:JSON.parse(JSON.stringify(cardCol||{})),ns_newscats:(newsCats||[]).slice(),ns_newssize:newsScale,ns_notes:JSON.parse(JSON.stringify(notes.map(nStore))),ns_notetabs:JSON.parse(JSON.stringify(noteTabs)),ns_notetab:noteTab,ns_folders:JSON.parse(JSON.stringify(noteFolders))},typeof spCollect==='function'?spCollect():{})}
function bkUid(){return Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
function bkCreate(){var now=new Date(),entry={id:bkUid(),ts:now.toISOString(),label:bkLabel(now),data:bkCollect()};
 var a=bkList();a.unshift(entry);if(a.length>BK_MAX)a=a.slice(0,BK_MAX);bkSaveList(a);renderBkList();toast(TR('Backup salvat · ')+entry.label);return entry}
function bkFind(id){var a=bkList();for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
function bkDelete(id){var e=bkFind(id);if(!e)return;if(!confirm(TR('Ștergi backup-ul din ')+e.label+'?'))return;bkSaveList(bkList().filter(function(x){return x.id!==id}));renderBkList();toast(TR('Backup șters'))}
var bkPhTmp=null;function bkExportPayload(e){return{jarvisBackup:1,version:1,exportedAt:new Date().toISOString(),id:e.id,ts:e.ts,label:e.label,data:bkPhTmp?Object.assign({},e.data,{ns_photos:bkPhTmp}):e.data}}
function bkFilename(e){var t=(e.ts||'').replace(/[:.]/g,'-').slice(0,19)||'backup';return 'notis-backup-'+t+'.json'}
function bkShare(id){if(!bkFind(id))return;phDump().then(function(p){bkPhTmp=p;try{bkShare0(id)}finally{bkPhTmp=null}if(window.__qrSkip)setTimeout(function(){toast(TR('Unele înregistrări nu au încăput în backup (prea mari); rămân pe telefon.'))},3200)})}
function bkShare0(id){var e=bkFind(id);if(!e)return;var json=JSON.stringify(bkExportPayload(e),null,2),file=new File([json],bkFilename(e),{type:'application/json'});
 function dl(){if(window.NotisNative&&NotisNative.saveFile){var ok0=false;try{ok0=NotisNative.saveFile(bkFilename(e),json)}catch(_){}toast(ok0?TR('Backup salvat în Descărcări: ')+bkFilename(e):TR('Nu am putut salva backupul'));return}var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download=bkFilename(e);document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},800);toast(TR('Backup descărcat'))}
 if(window.NotisNative&&NotisNative.shareFile){var ok1=false;try{ok1=NotisNative.shareFile(bkFilename(e),json,TR('Backup Notis · ')+e.label)}catch(_){}if(ok1)return;}
 if(navigator.share){var p={title:TR('Backup Notis · ')+e.label,text:TR('Backup Notis din ')+e.label,files:[file]};
  if(!navigator.canShare||navigator.canShare(p))return navigator.share(p).then(function(){toast(TR('Backup trimis'))}).catch(function(err){if(err&&err.name==='AbortError')return;dl()})}
 dl()}
function bkParseImport(raw){var j=typeof raw==='string'?JSON.parse(raw):raw;if(!j||typeof j!=='object')throw new Error('invalid');
 var data=j.data;if(!data||typeof data!=='object'){if(j.ns_tasks!=null||j.ns_cfg!=null)data=j;else throw new Error('no data')}
 if(data.ns_photos){phLoad(data.ns_photos).then(function(c){if(c&&fullId)phRender()}).catch(function(e){console.warn(e)});data=Object.assign({},data);delete data.ns_photos}
 var ts=j.ts||j.exportedAt||new Date().toISOString(),label=j.label||bkLabel(new Date(ts));
 return{id:bkUid(),ts:ts,label:label+(j.jarvisBackup||j.data?'':' (import)'),data:data,importedAt:new Date().toISOString()}}
function bkImportFile(file){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){try{res(bkParseImport(r.result))}catch(e){rej(e)}};r.onerror=function(){rej(r.error)};r.readAsText(file)})}
function bkApply(data){if(!data||typeof data!=='object')throw new Error('empty');
 if(speaking)stopSpeaking();editing=null;if($('tabModal').classList.contains('show'))closeTabModal();
 var next=Object.assign({},BK_CFG_DEF,data.ns_cfg&&typeof data.ns_cfg==='object'?data.ns_cfg:{});
 Object.keys(cfg).forEach(function(k){delete cfg[k]});Object.assign(cfg,next);
 if(cfg.engine==='piper'||!cfg.engine||(cfg.engine!=='browser'&&!TTS.voice(cfg.engine)))cfg.engine='mihai';
 if(cfg.tone==null)cfg.tone=1;LS.set('ns_cfg',cfg);
 tasks=Array.isArray(data.ns_tasks)?JSON.parse(JSON.stringify(data.ns_tasks)):[];
 shop=Array.isArray(data.ns_shop)?JSON.parse(JSON.stringify(data.ns_shop)):[];
 tabs=Array.isArray(data.ns_tabs)?JSON.parse(JSON.stringify(data.ns_tabs)):[];
 tabCol=data.ns_tabcol&&typeof data.ns_tabcol==='object'?JSON.parse(JSON.stringify(data.ns_tabcol)):{};
 cardCol=data.ns_cardcol&&typeof data.ns_cardcol==='object'?JSON.parse(JSON.stringify(data.ns_cardcol)):{};
 newsCats=Array.isArray(data.ns_newscats)?data.ns_newscats.slice():(BLANK?['general','ai']:['ai']);
 notes=Array.isArray(data.ns_notes)?JSON.parse(JSON.stringify(data.ns_notes)):[];noteTabs=Array.isArray(data.ns_notetabs)?JSON.parse(JSON.stringify(data.ns_notetabs)):null;noteTab=data.ns_notetab||null;noteFolders=Array.isArray(data.ns_folders)?JSON.parse(JSON.stringify(data.ns_folders)):[];nFolder='';ntMigrate();ntLocalize();fdMigrate();if(typeof spApply==='function')spApply(data);LS.set('ns_folders',noteFolders);renderNotes();newsScale=+data.ns_newssize||100;if(!(newsScale>=80&&newsScale<=160))newsScale=100;
 LS.set('ns_tasks',tasks);LS.set('ns_shop',shop);LS.set('ns_tabs',tabs);LS.set('ns_tabcol',tabCol);LS.set('ns_cardcol',cardCol);LS.set('ns_newscats',newsCats);LS.set('ns_newssize',newsScale);
 hUndo=[];hRedo=[];hCur=snap();histBtns();
 applyClock();applyNewsSize(newsScale);renderGreet(true);renderTasks();renderShop();renderTabs();
 ['voice','wx','azi','maine','shop','news'].forEach(function(k){setCardCol(k,!!cardCol[k]);updCardCount(k)});
 renderNews(newsCats);loadVoices();
 if($('modal').classList.contains('show')){draft={clockFont:cfg.clockFont,clockColor:cfg.clockColor,clockSize:cfg.clockSize,newsSize:newsScale,newsCats:newsCats.slice()};
  $('sName').value=cfg.name;$('sCity').value=cfg.city;$('cityList').innerHTML='';pending=null;
  fillEngineSelect();$('sEngine').value=NL==='ro'?cfg.engine:'browser';$('sTone').value=cfg.tone;fillVoiceSelect();$('sVoice').value=cfg.voiceURI||'';$('sRate').value=curRate();$('sPitch').value=curPitch();$('sSize').value=cfg.clockSize;$('sNewsSize').value=newsScale;buildNewsCats(draft.newsCats);
  showVals();updEngineUI();updVoiceRow();buildFontGrid();buildColors()}
 if(!wx||wx.city!==cfg.city||(wx.lat!=null&&(wx.lat!==cfg.lat||wx.lon!==cfg.lon))){wx=null;LS.set('ns_wx',null);renderWx();loadWx()}else renderWx()}
function bkRestore(id){var e=bkFind(id);if(!e)return;if(!confirm(TR('Se înlocuiește tot ce e acum în aplicație cu backup-ul din ')+e.label+'?'))return;
 try{bkApply(e.data);toast(TR('Restaurat · ')+e.label)}catch(err){console.warn(err);toast(TR('Nu am putut restaura backup-ul'))}}
function renderBkList(){var box=$('bkList');if(!box)return;var a=bkList();
 if(!a.length){box.innerHTML='<div class="bkempty">Niciun backup încă.</div>';return}
 box.innerHTML='';a.forEach(function(e){var row=document.createElement('div');row.className='bkrow';row.dataset.id=e.id;
  var lbl=document.createElement('div');lbl.className='bklbl';lbl.textContent=e.label+(e.importedAt?TR(' · importat'):'');row.appendChild(lbl);
  var acts=document.createElement('div');acts.className='bkacts';
  [[TR('Refă'),function(){bkRestore(e.id)}],[TR('Trimite'),function(){bkShare(e.id)}],[TR('Șterge'),function(){bkDelete(e.id)}]].forEach(function(x){
   var b=document.createElement('button');b.type='button';b.className='btn';b.textContent=x[0];b.onclick=x[1];acts.appendChild(b)});
  row.appendChild(acts);box.appendChild(row)})}
$('bBkSave').onclick=function(){bkCreate()};
$('bBkImport').onclick=function(){$('bBkFile').value='';$('bBkFile').click()};
$('bBkFile').onchange=function(){var f=this.files&&this.files[0];if(!f)return;
 bkImportFile(f).then(function(entry){var a=bkList();a.unshift(entry);if(a.length>BK_MAX)a=a.slice(0,BK_MAX);bkSaveList(a);renderBkList();toast(TR('Backup importat · ')+entry.label);
  if(confirm(TR('Backup importat (')+entry.label+TR('). Restaurezi acum?'))){try{bkApply(entry.data);toast(TR('Restaurat · ')+entry.label)}catch(err){console.warn(err);toast(TR('Nu am putut restaura backup-ul'))}}
 }).catch(function(err){console.warn(err);toast(TR('Fișier invalid — nu e un backup Notis sau Jarvis'))})};

/* ---------- share ---------- */
function summary(){var d=new Date(),tk=dkey(),o=tasks.filter(function(t){return live(t)&&!t.done});
 var L=[TR('Notis · ')+fDate(d,1),'',TR('Vremea · ')+cfg.city+': '+wxSentence(wx),''];
 var az=listFor('azi').filter(function(t){return !t.done}),mn=listFor('maine').filter(function(t){return !t.done});
 if(az.length){L.push(TR('Taskuri pentru azi:'));az.forEach(function(t){L.push('• '+t.text+(t.fromDay&&t.fromDay<tk?' ('+shortDate(t.fromDay)+')':''))});L.push('')}
 if(mn.length){L.push(TR('Taskuri pentru mâine:'));mn.forEach(function(t){L.push('• '+t.text)})}
 if(!o.length)L.push(TR('Nu ai taskuri deschise.'));return L.join('\n')}
function copy(text){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);
 return new Promise(function(res,rej){var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
  try{document.execCommand('copy')?res():rej()}catch(e){rej(e)}document.body.removeChild(ta)})}


/* ---------- PWA: service worker + install helper ---------- */
(function(){
 var standalone=function(){try{return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: minimal-ui)').matches||navigator.standalone===true}catch(e){return false}};
 if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')&&!TTS.opaque)
  window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(reg){var up=function(){try{reg.update()}catch(_){}};up();document.addEventListener('visibilitychange',function(){if(!document.hidden)up()});setInterval(up,30*60*1000)}).catch(function(e){console.warn('SW',e)});var hadC=!!navigator.serviceWorker.controller,rl=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(!hadC){hadC=true;return}if(rl)return;rl=true;try{if(typeof nFlushAll==='function')nFlushAll()}catch(_){}location.reload()})});
 var deferred=null;
 function upd(){var f=$('fInstall');if(!f)return;f.style.display=(standalone()||window.NotisNative)?'none':'';
  $('sInstall').style.display=deferred?'':'none';$('installHint').style.display=deferred?'none':''}
 window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;upd();
  if(!standalone()&&!LS.get('ns_installTip',false)){LS.set('ns_installTip',true);setTimeout(function(){toast(TR('Poți instala Notis ca aplicație: Setări → Instalează aplicația'))},2500)}});
 window.addEventListener('appinstalled',function(){deferred=null;upd();toast(TR('Notis a fost instalat'))});
 $('sInstall').onclick=function(){if(!deferred){upd();return}var d=deferred;d.prompt();
  (d.userChoice||Promise.resolve()).then(function(){deferred=null;upd()})};
 $('bSettings').addEventListener('click',upd);upd();
})();
/* ---------- boot ---------- */
if(wx&&(wx.city!==cfg.city||(wx.lat!=null&&(wx.lat!==cfg.lat||wx.lon!==cfg.lon))))wx=null;
(function(){if(!TTS.opaque)return;var u='https://cluj1313.github.io/jarvis/'+(BLANK?'blank.html':''),n=$('offNote');if(!n)return;
 n.innerHTML='Pentru cea mai bună experiență deschide <a href="'+u+'" target="_blank" rel="noopener">'+u.replace('https://','')+'</a> (vocea rămâne salvată, merge și offline).';n.hidden=false})();

/* ---------- AI news (news.json from GitHub Actions; same-origin) ---------- */
var NEWS_CATS=[{id:'ai',name:'AI'},{id:'general',name:TR('Știri generale')},{id:'economie',name:TR('Economie')},{id:'tech',name:TR('Tehnologie')},{id:'sport',name:TR('Sport')},{id:'stiinta',name:TR('Științe / Sănătate')}];
var newsCats=LS.get('ns_newscats',null);if(!Array.isArray(newsCats))newsCats=BLANK?['general','ai']:['ai'];
var newsData=LS.get('ns_news',null);
function newsNorm(j){if(!j)return null;var cats=j.categories;
 if(!Array.isArray(cats)||!cats.length)cats=(j.sources&&j.sources.length)?[{id:'ai',name:'AI',sources:j.sources}]:[];
 return{updated:j.updated,categories:cats,stale:!!j.stale}}
newsData=newsNorm(newsData);
function newsRelTime(iso){if(!iso)return'';
 var t=Date.parse(iso);if(!isFinite(t))return'';
 var s=Math.max(0,Math.round((Date.now()-t)/1000));
 if(s<60)return TR('acum');if(s<3600)return Math.floor(s/60)+TR(' min');if(s<86400)return Math.floor(s/3600)+TR(' h');
 var d=Math.floor(s/86400);return d===1?TR('1 zi'):d+TR(' zile')}
function newsFmtUpdated(iso){var t=iso?new Date(iso):null;if(!t||!isFinite(t.getTime()))t=new Date();
 return TR('Actualizat la ')+pad(t.getHours())+':'+pad(t.getMinutes())}
/* v38: in-card news search (titles+snippets; not persisted) */
var newsQ='';
function newsFold(s){try{return String(s||'').toLocaleLowerCase('ro')}catch(e){return String(s||'').toLowerCase()}}
function applyNewsFilter(){var body=$('newsBody');if(!body)return;
 var q=newsFold(newsQ).trim();
 var prev=body.querySelector('.news-empty.ns-none');if(prev)prev.remove();
 var items=body.querySelectorAll('.news-item'),any=false;
 items.forEach(function(a){var tt=a.querySelector('.news-t'),ss=a.querySelector('.news-s');
  var hay=newsFold(((tt&&tt.textContent)||'')+' '+((ss&&ss.textContent)||''));
  var ok=!q||hay.indexOf(q)>=0;a.style.display=ok?'':'none';if(ok)any=true});
 body.querySelectorAll('.news-src').forEach(function(sec){var has=false;sec.querySelectorAll('.news-item').forEach(function(a){if(a.style.display!=='none')has=true});sec.style.display=has?'':'none'});
 body.querySelectorAll('.news-catblk').forEach(function(blk){var has=false;blk.querySelectorAll('.news-src').forEach(function(sec){if(sec.style.display!=='none')has=true});blk.style.display=has?'':'none'});
 if(q&&items.length&&!any){var e=document.createElement('div');e.className='news-empty ns-none';e.textContent=TR('Niciun rezultat');body.appendChild(e)}
 updCardCount('news')}
function bindNewsSearch(){var inp=$('newsSearch'),clr=$('newsSearchClear');if(!inp||inp._nsBound)return;inp._nsBound=1;
 var web=$('newsWebSearch'),webTxt=$('newsWebSearchTxt');
 function webUrl(){return 'https://www.google.com/search?q='+encodeURIComponent(String(newsQ).trim())}
 function sync(){newsQ=inp.value||'';if(clr)clr.hidden=!String(newsQ).length;
  if(web){var q=String(newsQ).trim();web.hidden=!q;web.href=q?webUrl():'#';if(webTxt)webTxt.textContent=q?TR('Caută pe web: \u201E')+q+'\u201D':''}
  applyNewsFilter()}
 if(web)web.addEventListener('click',function(ev){ev.preventDefault();if(!String(newsQ).trim())return;window.open(webUrl(),'_blank','noopener')});
 inp.addEventListener('input',sync);
 if(clr)clr.addEventListener('click',function(ev){ev.preventDefault();inp.value='';inp.focus();sync()})}
function renderNews(sel){renderNews0(sel);updCardCount('news')}
function renderNews0(sel){sel=sel||newsCats;var card=$('cNews'),body=$('newsBody'),meta=$('newsMeta');if(!body)return;
 if(card)card.style.display=sel.length?'':'none';if(!sel.length)return;
 var cats=(newsData&&newsData.categories)||[];
 var show=NEWS_CATS.filter(function(c){return sel.indexOf(c.id)>=0}).map(function(c){var d=cats.filter(function(x){return x.id===c.id})[0];return{id:c.id,name:c.name,sources:(d&&d.sources)||[]}}).filter(function(c){return c.sources.length});
 if(!show.length){if(meta)meta.textContent=newsData?newsFmtUpdated(newsData.updated):TR('Fără știri încă');body.innerHTML='<div class="news-empty">'+(newsData?TR('Nu am încă știri pentru categoriile alese.'):TR('Știrile apar aici când news.json e disponibil.'))+'</div>';applyNewsFilter();return}
 if(meta)meta.textContent=newsFmtUpdated(newsData.updated)+(newsData.stale?' (offline)':'');
 body.innerHTML='';
 show.forEach(function(cat){var blk=document.createElement('div');blk.className='news-catblk';blk.dataset.cat=cat.id;
  var cl=document.createElement('div');cl.className='news-cat';cl.textContent=cat.name;blk.appendChild(cl);
  cat.sources.forEach(function(src){
   var sec=document.createElement('div');sec.className='news-src';
   var h=document.createElement('div');h.className='news-ch';h.textContent=(src.name||src.id||TR('Canal')).toUpperCase();sec.appendChild(h);
   (src.items||[]).forEach(function(it){
    var a=document.createElement('a');a.className='news-item';a.href=it.url;a.target='_blank';a.rel='noopener noreferrer';
    var t=document.createElement('div');t.className='news-t';t.textContent=it.title||'';a.appendChild(t);
    if(it.snippet){var s=document.createElement('div');s.className='news-s';s.textContent=it.snippet;a.appendChild(s)}
    var w=newsRelTime(it.published);if(w){var m=document.createElement('div');m.className='news-when';m.textContent=w;a.appendChild(m)}
    sec.appendChild(a)});
   blk.appendChild(sec)});
  body.appendChild(blk)});applyNewsFilter()}
function buildNewsCats(sel){var box=$('newsCats');if(!box)return;box.innerHTML='';
 NEWS_CATS.forEach(function(c){var l=document.createElement('label');l.className='ncat'+(sel.indexOf(c.id)>=0?' on':'');
  var i=document.createElement('input');i.type='checkbox';i.value=c.id;i.checked=sel.indexOf(c.id)>=0;
  i.onchange=function(){var k=sel.indexOf(c.id);if(i.checked&&k<0)sel.push(c.id);if(!i.checked&&k>=0)sel.splice(k,1);l.classList.toggle('on',i.checked);renderNews(sel)};
  l.appendChild(i);l.appendChild(document.createTextNode(c.name));box.appendChild(l)})}
function loadNews(manual){return (manual&&navigator.onLine===false?Promise.reject(new Error('offline')):fetch('news.json?'+(manual?'fresh=':'t=')+Date.now(),{cache:'no-store'})).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(j){
  var n=newsNorm(j);if(!n||!n.categories.length)throw new Error('bad news.json');
  newsData=n;LS.set('ns_news',newsData);renderNews(draft&&$('modal').classList.contains('show')?draft.newsCats:newsCats)
 }).catch(function(){if(newsData){newsData.stale=true;renderNews()}else{renderNews()}if(manual)toast(navigator.onLine?TR('Nu am putut actualiza știrile'):TR('Ești offline — nu pot actualiza știrile'))})}
var newsBusy=false;
$('newsRefresh').onclick=function(){if(newsBusy)return;newsBusy=true;var b=this;b.classList.add('spin');
 var t0=Date.now();loadNews(true).then(function(){setTimeout(function(){b.classList.remove('spin');newsBusy=false},Math.max(0,500-(Date.now()-t0)))})};
bindNewsSearch();

renderTasks();renderShop();renderTabs();hCur=snap();histBtns();renderWx();renderNews();tick();setInterval(tick,1000);
setTimeout(maybeRemindUrgent,3200);


document.addEventListener('visibilitychange',function(){if(!document.hidden){if(!wx||Date.now()-wx.ts>15*60*1000)loadWx();loadNews()}});
bootVoice();

/* test/preview hooks */
window.JARVIS={readCard:readCard,stop:stopSpeaking,say:say,get speaking(){return speaking},get activeWord(){return activeSeg&&activeSeg.cur>=0?activeSeg.words[activeSeg.cur].w:null},
 get activeEl(){return activeSeg&&activeSeg.el?activeSeg.el.id||activeSeg.el.className:null},ensureVoice:ensureVoice,TTS:TTS};
var dm=location.hash.match(/demo-karaoke(?:=(\d+))?/);
if(dm)loadWx().then(function(){speaking=true;speakKey='wx';updEq();setStatus(NL==='ro'?'Vorbesc (Mihai)…':TR('Vorbesc…'));var s=prepSeg($('wxtxt'),wxSentence(wx));setTimeout(function(){hl(s,+(dm[1]||6))},80)});
if(/demo-settings/.test(location.hash))setTimeout(function(){$('bSettings').click()},300);
/* ---------- v40: per-task alarms (t.alarm={at:ms,rep:min|0,until:ms|null,snz:ms|null}; stored in ns_tasks -> included in Backup) ---------- */
function alNext(t){var a=t&&t.alarm;if(!a||!a.at)return 0;return a.snz&&a.snz<a.at?a.snz:a.at}
function alShort(ms){var d=new Date(ms),n=new Date(),hm=pad(d.getHours())+':'+pad(d.getMinutes());return dkey(d)===dkey(n)?hm:fDate(d,1)}
function alLocal(ms){var d=new Date(ms);return{d:dkey(d),t:pad(d.getHours())+':'+pad(d.getMinutes())}}
function alParse(d,t){if(!d||!t)return 0;var p=d.split('-'),q=t.split(':');return new Date(+p[0],+p[1]-1,+p[2],+q[0],+q[1],0,0).getTime()}
var alId=null,alRep=120;
function alGet(r){if(!r)return null;if(r.k==='t'){var i=findT(r.id);return i<0?null:tasks[i]}if(r.k==='s')return findS(r.id);if(r.k==='n')return findN(r.id);var tb=findTab(r.tab);return tb?findTI(tb,r.id):null}
function alPersist(r,quiet){if(r.k==='t'){quiet?LS.set('ns_tasks',tasks):save();renderTasks()}else if(r.k==='s'){quiet?LS.set('ns_shop',shop):saveShop();renderShop()}else if(r.k==='n'){saveNotes();renderNotes()}else{quiet?LS.set('ns_tabs',tabs):saveTabs();var tb=findTab(r.tab);if(tb)renderTabItems(tb)}}
function alAll(){var a=[];tasks.forEach(function(t){if(!t.deleted)a.push({r:{k:'t',id:t.id},o:t,off:t.done})});
 shop.forEach(function(s){if(!s.hidden)a.push({r:{k:'s',id:s.id},o:s,off:s.bought})});
 tabs.forEach(function(tb){(tb.items||[]).forEach(function(s){if(!s.hidden)a.push({r:{k:'b',tab:tb.id,id:s.id},o:s,off:s.done})})});
 if(typeof notes!=='undefined'&&notes)notes.forEach(function(n){if(!n.del)a.push({r:{k:'n',id:n.id},o:n,off:false})});return a}
function alChips(){var box=$('alChips');box.innerHTML='';[[30,TR('30 min')],[60,TR('1 oră')],[120,TR('2 ore')],[240,TR('4 ore')],[360,TR('6 ore')],[480,TR('8 ore')],[720,TR('12 ore')],[1440,TR('24 ore')]].forEach(function(c){
 var b=document.createElement('button');b.type='button';b.className='alc'+(alRep===c[0]?' on':'');b.textContent=c[1];b.onclick=function(){alRep=c[0];$('alMin').value='';alChips()};box.appendChild(b)})}
var alWdM=0,alMode=0;
function alType(m){m=m===true?1:m||0;alMode=m;$('alT1').classList.toggle('on',!m);$('alT2').classList.toggle('on',m===1);$('alT3').classList.toggle('on',m===2);$('alT4').classList.toggle('on',m===3);$('alRepBox').style.display=m===1?'':'none';$('alDayBox').style.display=m===2?'':'none';$('alCuBox').style.display=m===3?'':'none';$('alEndBox').style.display=m?'':'none'}
function alWdUI(){var box=$('alWd');box.innerHTML='';[1,2,3,4,5,6,0].forEach(function(d){var b=document.createElement('button');b.type='button';b.className='alc'+(alWdM&(1<<d)?' on':'');b.textContent=ZILE_S[d];b.onclick=function(){alWdM^=(1<<d);alWdUI()};box.appendChild(b)});$('alDays').disabled=!!alWdM;$('alDays').style.opacity=alWdM?.4:1}
/* v118: day repeats keep the local clock time (DST-safe): a.rd = every N days, a.wd = weekday bitmask (bit0 = Sunday); a.rep stays as minutes for older readers */
/* v198: custom repeat a.cu={n,u} (u: mi|h|d|w|mo); months use a.repM + a.dom (same as payments, native rollMonths) */
function alRollM(at,M,dom,now){if(at>now)return at;var d=new Date(at),h=d.getHours(),mi=d.getMinutes(),y=d.getFullYear(),m=d.getMonth();dom=dom||d.getDate();for(var k=0;k<2400;k++){m+=M;var x=new Date(y,m,1,h,mi,0,0),ml=new Date(y,m+1,0).getDate();x.setDate(Math.min(dom,ml));if(x.getTime()>now)return x.getTime()}return at}
var AL_CU={mi:['X minute','1 minut'],h:['X ore','1 oră'],d:['X zile','1 zi'],w:['X săptămâni','1 săptămână'],mo:['X luni','1 lună']};
function alCuTxt(c){var k=AL_CU[c.u]||AL_CU.d,n=Math.max(1,c.n|0);return n===1?TR(k[1]):TR(k[0]).replace('X',n)}
function alRollA(a,at,now){if(!a)return at;now=now||Date.now();if(a.repM>0)return alRollM(at,a.repM|0,a.dom|0,now);if(at>now&&!(a.wd&&!(a.wd&(1<<new Date(at).getDay()))))return at;
 if(a.wd||a.rd){var d=new Date(at),h=d.getHours(),mi=d.getMinutes(),st=a.wd?1:Math.max(1,a.rd|0);for(var k=0;k<4000;k++){d.setDate(d.getDate()+st);d.setHours(h,mi,0,0);var x=d.getTime();if(x>now&&(!a.wd||a.wd&(1<<d.getDay())))return x}return at}
 return a.rep?alRoll(at,a.rep):at}
function alRepTxt(a){if(!a||!a.rep)return '';if(a.cu&&a.cu.n)return TR('Custom')+': '+alCuTxt(a.cu);if(a.wd){var L=[];[1,2,3,4,5,6,0].forEach(function(d){if(a.wd&(1<<d))L.push(ZILE_S[d])});return TR('Repetiție zile')+': '+L.join(' ')}if(a.rd)return TR('Repetiție zile')+': '+a.rd;return TR('Repetiție oră')+': '+(Math.round(a.rep/6)/10)+'h'}
/* v198: date shown DD/MM/YYYY whatever the phone locale; the input value stays YYYY-MM-DD */
function alDmy(v){var p=String(v||'').split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:''}
function alDtUI(){$('alDateTx').textContent=alDmy($('alDate').value);$('alUDateTx').textContent=alDmy($('alUDate').value)}
function alCuOpts(){var S=$('alCuU'),v=S.value;S.innerHTML='';['mi','h','d','w','mo'].forEach(function(u){var o=document.createElement('option');o.value=u;o.setAttribute('data-u','1');o.textContent=TR(AL_CU[u][0]).replace('X','').trim();S.appendChild(o)});if(v)S.value=v}
function alFull(ms){return fDate(new Date(ms),1)}
function alEndUI(){$('alUntilBox').style.display=$('alEnd').value==='until'?'':'none'}
function openAlarm(r){var t=alGet(r);if(!t)return;var a=t.alarm||{};alId=r;$('alTask').textContent=t.lock?(t.ltitle||TR('Notiță blocată')):t.text;
 var at=a.at||(Date.now()+3600000-Date.now()%60000),L=alLocal(at);$('alDate').value=L.d;$('alTime').value=L.t;
 var dm=!!(a.rep&&(a.rd||a.wd));alRep=a.rep&&!dm?a.rep:120;var pre=[30,60,120,240,360,480,720,1440].indexOf(alRep)>=0;$('alMin').value=pre?'':Math.round(alRep/6)/10;alChips();alWdM=a.wd||0;$('alDays').value=a.rd||1;alWdUI();var cu=a.rep&&a.cu&&AL_CU[a.cu.u]?a.cu:null;$('alCuN').value=cu?cu.n:3;$('alCuU').value=cu?cu.u:'d';alType(cu?3:!a.rep?0:dm?2:1);alDtUI();
 $('alEnd').value=a.until?'until':'none';var U=alLocal(a.until||at+86400000);$('alUDate').value=U.d;$('alUTime').value=U.t;alEndUI();alDtUI();alCuOpts();
 $('alDel').style.display=t.alarm?'':'none';$('alModal').classList.add('show')}
function closeAlarm(){$('alModal').classList.remove('show');alId=null}
function alSave(){var t=alGet(alId);if(!t)return closeAlarm();var at=alParse($('alDate').value,$('alTime').value);if(!at){toast(TR('Alege data și ora'));return}
 var hv=parseFloat(String($('alMin').value).replace(',','.')),rd=0,wd=0,rep=alMode===1?(hv>0?Math.round(hv*60):alRep):0;if(alMode===2){wd=alWdM;rd=wd?0:Math.max(0,Math.round(+$('alDays').value));if(!wd&&!rd){toast(TR('Interval invalid'));return}rep=wd?1440:rd*1440}if(alMode===1&&!(rep>=1)){toast(TR('Interval invalid'));return}
 var cu=null,repM=0;if(alMode===3){var cn=Math.round(+$('alCuN').value),cuU=$('alCuU').value;if(!(cn>=1&&cn<=999)||!AL_CU[cuU]){toast(TR('Interval invalid'));return}cu={n:cn,u:cuU};
  if(cuU==='mi')rep=cn;else if(cuU==='h')rep=cn*60;else if(cuU==='d'){rd=cn;rep=cn*1440}else if(cuU==='w'){rd=cn*7;rep=rd*1440}else{repM=cn;rep=cn*43200}}
 var until=rep&&$('alEnd').value==='until'?alParse($('alUDate').value,$('alUTime').value):null;
 var na={at:at,rep:rep,until:until||null,snz:null};if(rd)na.rd=rd;if(wd)na.wd=wd;if(repM){na.repM=repM;na.dom=new Date(at).getDate()}if(cu)na.cu=cu;if(rep)at=na.at=alRollA(na,at,Date.now());if(!rep&&at<Date.now()-30000){toast(TR('Ora a trecut deja'));return}
 t.alarm=na;alPersist(alId);closeAlarm();toast(TR('Alarmă setată · ')+alShort(at));
 alPerm();alSchedule(t)}
function alRoll(at,rep){var now=Date.now(),st=rep*60000;if(at>now)return at;return at+Math.ceil((now-at+1)/st)*st}
function alPerm(){var N=window.NotisNative;if(N&&N.alarmPerms&&!DEMO){try{var st=N.alarmPerms(true);if(st&&st!=='ok'){toast(TR('Permite notificările și alarmele pentru Notis, ca să sune la timp'));return}
  if(N.isXiaomi&&N.isXiaomi()&&N.openAutostart&&!LS.get('ns_xmhint',0)){LS.set('ns_xmhint',1);setTimeout(function(){var cf=$('cfModal').querySelector('.cftxt'),t0=cf.textContent,ok=$('cfOk'),no=$('cfNo'),o0=ok.textContent,n0=no.textContent,back=function(){cf.textContent=t0;ok.textContent=o0;no.textContent=n0};
   cf.textContent=TR('Pe Xiaomi, permite „Pornire automată” pentru Notis, ca alarmele să sune cu aplicația închisă. Deschid setările?');ok.textContent=TR('Da');no.textContent=TR('Nu');
   ok.onclick=function(){jvClose('cfModal');back();try{N.openAutostart()}catch(_){}};no.onclick=function(){jvClose('cfModal');back()};$('cfModal').classList.add('show')},400)}}catch(_){}return}
 try{if(window.Notification&&Notification.permission==='default')Notification.requestPermission().catch(function(){})}catch(_){}}
function alSchedule(t){ /* Notification Triggers where supported (feature-detected) */
 try{if(!('showTrigger' in Notification.prototype)||typeof TimestampTrigger==='undefined'||Notification.permission!=='granted'||!navigator.serviceWorker)return;
  navigator.serviceWorker.ready.then(function(r){var nx=alNext(t);if(nx>Date.now())r.showNotification('⏰ Notis',{body:t.text,tag:'jv-al-'+t.id,showTrigger:new TimestampTrigger(nx),requireInteraction:true})})}catch(_){}}
function alDelete(){var t=alGet(alId);if(t){delete t.alarm;alPersist(alId);toast(TR('Alarmă ștearsă'))}closeAlarm()}
var alQueue=[],alCur=null,alBeepT=null;
var alRingA=null;function alRing(on){var k=(cfg.alSnd&&cfg.alSnd.k)||'default';try{if(alRingA){alRingA.pause();alRingA=null}}catch(_){}try{if(window.NotisNative&&NotisNative.ringStop)NotisNative.ringStop()}catch(_){}if(!on||k==='default')return false;
 try{if(window.NotisNative&&NotisNative.ringStart){NotisNative.ringStart();return true}}catch(_){}
 if(k.indexOf('b:')===0){try{alRingA=new Audio('snd/'+k.slice(2)+'.mp3');alRingA.loop=true;try{alRingA.volume=window.alG?alG():.36}catch(_){}var pr=alRingA.play();if(pr&&pr.catch)pr.catch(function(){});return true}catch(_){}}return false}
function alBeep(on){clearInterval(alBeepT);alBeepT=null;if(on&&window.NotisNative&&window.alNatMode&&alNatMode()!==0){alRing(false);/* v183: phone on silent/vibrate (and no 'Sună și în modul silențios'): no sound; vibrate only on vibrate */if(alNatMode()===1){var vb=function(){try{navigator.vibrate&&navigator.vibrate([400,200,400])}catch(_){}};vb();alBeepT=setInterval(vb,1500);setTimeout(function(){clearInterval(alBeepT)},60000)}return}var cus=alRing(on);if(!on)return;var one=function(){try{if(cus)throw 0;unlockAudio();if(!actx)return;var t0=actx.currentTime;[0,.25,.5].forEach(function(o){var g=actx.createGain(),os=actx.createOscillator();os.type='square';os.frequency.value=880;g.gain.setValueAtTime(.0001,t0+o);g.gain.exponentialRampToValueAtTime(Math.max(.0002,.25*(window.alG?alG():.36)),t0+o+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+o+.18);os.connect(g);g.connect(actx.destination);os.start(t0+o);os.stop(t0+o+.2)})}catch(_){}
 try{if(navigator.vibrate)navigator.vibrate([400,200,400])}catch(_){}};one();alBeepT=setInterval(one,1500)}
function alShow(){if(alCur||!alQueue.length)return;alCur=alQueue.shift();$('alfTask').textContent=alCur.text;$('alFire').classList.add('show');alBeep(true)}
function alFire(t,r){if(t.lock)t={id:t.id,text:t.ltitle||TR('Notiță blocată')};alQueue.push({r:r,text:t.text,med:t.med?t.id:null});alShow();
 var _nt=window.ntSplit?ntSplit(t.text):{t:'⏰ Notis',b:String(t.text||'')};/* v181: alarm due at app start fired before ntSplit existed → threw, alarm never cleared → re-rang every 15 s */try{if(window.Notification&&Notification.permission==='granted'&&navigator.serviceWorker)navigator.serviceWorker.getRegistration().then(function(r){if(r)r.showNotification(_nt.t,{body:_nt.b,tag:'jv-al-'+t.id,renotify:true,requireInteraction:true,vibrate:[400,200,400],icon:'icons/icon-192.png'});else new Notification(_nt.t,{body:_nt.b})}).catch(function(){})}catch(_){}}
/* v181: snooze 10 / 20 / 30 min (true = 10, legacy) */
function alStop(snooze){alBeep(false);$('alFire').classList.remove('show');var c=alCur;alCur=null;var mn=snooze===20||snooze===30?snooze:10,ms=mn*60000,tm=mn===20?TR('Amânat 20 min'):mn===30?TR('Amânat 30 min'):TR('Amânat 10 min');
 if(c&&snooze&&c.med&&window.medSnooze){medSnooze(c.med,c.text,mn);toast(tm)}
 else if(c&&snooze){var t=alGet(c.r);if(t){var at=Date.now()+ms;if(!t.alarm)t.alarm={at:at,rep:0,until:null};t.alarm.snz=at;alPersist(c.r);alSchedule(t);toast(tm)}}
 setTimeout(alShow,300)}
/* v183: in the Android app the native alarm rings when Notis is in the background; the in-page check must not ring the same occurrence again (after a snooze from the notification it rang a 2nd time on app open) */
function alNatDone(t,nx,now){try{if(!(window.NotisNative&&NotisNative.alarmHandled))return false;if(document.hidden)return true;var h=JSON.parse(NotisNative.alarmHandled(String(t.id))||'{}');if(h.snz&&h.snz>now)return true;if(h.fired&&h.fired>=nx-120000)return true}catch(_){}return false}
function alCheck(){var now=Date.now(),chg=[];alAll().forEach(function(e){var t=e.o,a=t.alarm;if(!a||!a.at)return;
 var nx=alNext(t);if(nx>now)return;
 if(!e.off&&!alNatDone(t,nx,now))alFire(t,e.r);chg.push(e.r);
 if(a.snz&&a.snz<=now){a.snz=null;if(a.at>now)return}
 if(a.rep){a.at=alRollA(a,a.at,now);if(a.until&&a.at>a.until)delete t.alarm;else alSchedule(t)}else delete t.alarm});
 var ks={};chg.forEach(function(r){var key=r.k+(r.tab||'');if(!ks[key]){ks[key]=1;alPersist(r,true)}})}
function alInit(){$('alT1').onclick=function(){alType(0)};$('alT2').onclick=function(){alType(1)};$('alT3').onclick=function(){alType(2)};$('alT4').onclick=function(){alType(3)};$('alDate').oninput=$('alDate').onchange=$('alUDate').oninput=$('alUDate').onchange=alDtUI;alCuOpts();$('alEnd').onchange=alEndUI;
 $('alMin').oninput=function(){var v=parseFloat(String(this.value).replace(',','.'));if(v>0){alRep=Math.round(v*60);alChips()}};
 $('alSave').onclick=alSave;$('alDel').onclick=alDelete;$('alCancel').onclick=closeAlarm;
 $('alOff').onclick=function(){alStop(false)};$('alSnz').onclick=function(){alStop(10)};$('alSnz20').onclick=function(){alStop(20)};$('alSnz30').onclick=function(){alStop(30)};
 alCheck();setInterval(alCheck,15000);document.addEventListener('visibilitychange',function(){if(!document.hidden)alCheck()});window.addEventListener('focus',alCheck)}
alInit();
var NT_COLORS=[['#3fd8ff',TR('Cyan')],['#4ade80',TR('Verde')],['#facc15',TR('Galben')],['#fb923c',TR('Portocaliu')],['#ff6b6b',TR('Roșu')],['#f472b6',TR('Roz')],['#a78bfa',TR('Mov')],['#cbd5e1',TR('Gri')]];
/* v49: in-app confirm / prompt (replace browser dialogs) */
var jvDlgCb=null;
function jvConfirm(yes){$('cfOk').onclick=function(){jvClose('cfModal');yes()};$('cfNo').onclick=function(){jvClose('cfModal')};$('cfModal').classList.add('show')}
function jvClose(id){$(id).classList.remove('show')}
function jvPrompt(title,val,ok){$('prTitle').textContent=title;var i=$('prIn');i.value=val||'';$('prModal').classList.add('show');setTimeout(function(){try{i.focus();i.select()}catch(_){}},30);
 function done(){var v=i.value.trim();if(!v){i.focus();return}jvClose('prModal');ok(v)}
 $('prOk').onclick=done;$('prNo').onclick=function(){jvClose('prModal')};i.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();done()}}}
$('cfModal').addEventListener('click',function(e){if(e.target===this)jvClose('cfModal')});$('prModal').addEventListener('click',function(e){if(e.target===this)jvClose('prModal')});
/* ---------- v48: Notițe page with note tabs, one-line list, full-note editor, autosave ---------- */
var notes=LS.get('ns_notes',[]);if(!Array.isArray(notes))notes=[];
var noteTabs=LS.get('ns_notetabs',null),noteTab=LS.get('ns_notetab',null);
var noteFolders=LS.get('ns_folders',[]);if(!Array.isArray(noteFolders))noteFolders=[];var nFolder='',fdOpen={};
function findF(id){if(!id)return null;for(var i=0;i<noteFolders.length;i++)if(noteFolders[i].id===id)return noteFolders[i];return null}
function fdChain(id){var a=[],f=findF(id),g=0;while(f&&g++<64){a.unshift(f);f=f.parent?findF(f.parent):null}return a}
function fdAlive(id){if(!id)return true;var c=fdChain(id);return c.length>0&&!c[0].parent&&c.every(function(f){return !f.del})}
function fdLocked(id){return !!id&&fdChain(id).some(function(f){return !!f.lk})}
function fdHidden(id){return !!id&&fdChain(id).some(function(f){return f.lk&&!fdOpen[f.id]})}
function fdKids(tab,pid){return noteFolders.filter(function(f){return !f.del&&f.tab===tab&&(f.parent||'')===(pid||'')}).sort(function(a,b){return a.name.localeCompare(b.name,'ro',{sensitivity:'base'})})}
function fdDesc(id){var out=[id],i=0;while(i<out.length){var p=out[i++];noteFolders.forEach(function(f){if(f.parent===p&&out.indexOf(f.id)<0)out.push(f.id)})}return out}
function fdCount(f){var M={};fdDesc(f.id).forEach(function(x){M[x]=1});return notes.filter(function(n){return !n.del&&M[n.fd]}).length}
function fdMigrate(){var ch=false,lim=Date.now()-30*864e5;
 noteFolders=noteFolders.filter(function(f){return f&&f.id});
 noteFolders.forEach(function(f){if(f.parent&&(!findF(f.parent)||f.parent===f.id)){f.parent='';ch=true}});
 noteFolders.forEach(function(f){var c=fdChain(f.id);if(c[0]&&c[0].parent){c[0].parent='';ch=true}if(!findNT(c[0].tab)){c[0].tab=noteTabs[0].id;ch=true}if(f.tab!==c[0].tab){f.tab=c[0].tab;ch=true}});
 var old=noteFolders.filter(function(f){return f.del&&new Date(f.del).getTime()<lim});if(old.length){var ids=[];old.forEach(function(f){ids=ids.concat(fdDesc(f.id))});var M={};ids.forEach(function(x){M[x]=1});notes=notes.filter(function(n){return !M[n.fd]});noteFolders=noteFolders.filter(function(f){return !M[f.id]});ch=true}
 notes.forEach(function(n){if(!n.fd)return;var f=findF(n.fd);if(!f){delete n.fd;ch=true}else if(f.tab!==n.tab){n.tab=f.tab;ch=true}});
 if(ch){LS.set('ns_folders',noteFolders);LS.set('ns_notes',notes.map(nStore))}}

function nTitle0(n){if(n.type==='check'){var t=(n.title||'').trim();if(t)return t;var f=(n.items||[]).filter(function(x){return x.text.trim()})[0];return f?f.text.trim():''}return String(n.text||'').trim().split('\n')[0]}
function nFirst(n){if(n.lock)return n.ltitle||'';return String(n.text||'').trim().split('\n')[0]}
function nCmp(a,b){return nFirst(a).localeCompare(nFirst(b),'ro',{sensitivity:'base'})}
function nInsertAlpha(n){var i=notes.indexOf(n);if(i>=0)notes.splice(i,1);var at=-1,last=-1;
 for(var j=0;j<notes.length;j++){if(notes[j].tab!==n.tab)continue;last=j;if(at<0&&nCmp(n,notes[j])<0)at=j}
 if(at>=0)notes.splice(at,0,n);else if(last>=0)notes.splice(last+1,0,n);else notes.push(n)}
function nShift(id,d){var n=findN(id);if(!n)return;var i=notes.indexOf(n),j=i+d;while(j>=0&&j<notes.length&&(notes[j].tab!==n.tab||!notes[j].text.trim()))j+=d;
 if(j<0||j>=notes.length)return;notes[i]=notes[j];notes[j]=n;saveNotes();renderNotes()}
function ntUid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
/* v57: default tabs for brand-new users only (no tabs stored AND no notes) — existing data is never touched */
function NT_DEFAULTS(){return [['u','URGENȚE','#ff6b6b'],['c','Cumpărături','#ff9fd0'],['d','Diverse','#9b8cff'],['auto','Auto','#5fb8ff'],['ut','Plăți','#5fd38d']].map(function(x){return {id:x[0],name:TR(x[1]),color:x[2]}})}
function ntMigrate(){if(noteTabs==null&&!notes.length)noteTabs=NT_DEFAULTS();if(!Array.isArray(noteTabs)||!noteTabs.length)noteTabs=[{id:'general',name:TR('General')}];
 notes.forEach(function(n){if(!n.createdAt)n.createdAt=n.ts||new Date().toISOString();if(!n.updatedAt)n.updatedAt=n.editedAt||n.createdAt});
 notes.forEach(function(n){if(!n.tab||!noteTabs.some(function(t){return t.id===n.tab}))n.tab=noteTabs[0].id});
 if(!noteTabs.some(function(t){return t.id===noteTab}))noteTab=noteTabs[0].id;LS.set('ns_notes',notes);LS.set('ns_notetabs',noteTabs);LS.set('ns_notetab',noteTab)}
/* v189: default tab names follow the app language (only names that are an untranslated default in some language; user-renamed tabs untouched) */
var NT_LOC={"URGENȚE":"urgente|عاجل|спешно|জরুরি|urgent|nalehave|haster|dringend|επειγον|kiire|فوری|kiireellinen|דחוף|ज़रूरी|hitno|surgos|mendesak|urgenze|緊急|긴급|skubu|steidzami|итно|segera|pilne|срочно|naliehave|nujno|urgjente|хитно|bradskande|ด่วน|acil|терміново|khan cap|紧急","Cumpărături":"cumparaturi|التسوق|пазаруване|কেনাকাটা|compres|nakupy|indkøb|einkaufen|ψωνια|shopping|compras|ostud|خرید|ostokset|courses|קניות|ख़रीदारी|kupovina|bevasarlas|belanja|spesa|買い物|쇼핑|pirkiniai|iepirkumi|купување|membeli-belah|boodschappen|innkjøp|zakupy|покупки|nakupi|blerje|куповина|inkop|ช้อปปิ้ง|alısveris|mua sam|购物|購物","Diverse":"diverse|متفرقات|разни|বিবিধ|diversos|ruzne|sonstiges|διαφορα|misc|varios|muu|متفرقه|sekalaista|divers|שונות|विविध|razno|egyeb|lain-lain|varie|その他|기타|ivairus|dazadi|разно|pelbagai|diversen|rozne|разное|te ndryshme|ovrigt|เบ็ดเตล็ด|cesitli|різне|khac|杂项|雜項","Auto":"auto|السيارة|кола|গাড়ি|cotxe|bil|αυτοκινητο|car|coche|خودرو|voiture|רכב|कार|mobil|車|자동차|automobilis|автомобил|kereta|samochod|carro|авто|avto|makina|ауто|รถยนต์|araba|o to|汽车|汽車","Plăți":"plati|المدفوعات|плащания|পেমেন্ট|pagaments|platby|betalinger|zahlungen|πληρωμες|payments|pagos|maksed|پرداخت‌ها|maksut|paiements|תשלומים|भुगतान|placanja|fizetesek|pembayaran|pagamenti|支払い|결제|mokejimai|maksajumi|плакања|bayaran|betalingen|płatnosci|pagamentos|платежи|placila|pagesa|плаћања|betalningar|การชำระเงิน|odemeler|платежі|thanh toan|付款","Medicamente":"medicamente|الأدوية|лекарства|ওষুধসমূহ|medicaments|leky|medicin|medikamente|φαρμακα|medicines|medicamentos|ravimid|داروها|laakkeet|תרופות|दवाइयाँ|lijekovi|gyogyszerek|obat|farmaci|薬|약|vaistai|zales|лекови|ubat-ubatan|medicijnen|medisiner|leki|remedios|lieky|zdravila|ilace|lekovi|lakemedel|ยา|ilaclar|ліки|thuoc|药品|藥品","Parole":"parole|كلمات المرور|пароли|পাসওয়ার্ড|contrasenyes|hesla|adgangskoder|passworter|κωδικοι|passwords|contrasenas|paroolid|رمزها|salasanat|mots de passe|סיסמאות|पासवर्ड|lozinke|jelszavak|kata sandi|password|パスワード|비밀번호|slaptazodziai|paroles|лозинки|kata laluan|wachtwoorden|passord|hasła|senhas|palavras-passe|gesla|fjalekalimet|лозинке|losenord|รหัสผ่าน|sifreler|паролі|mat khau|密码|密碼","General":"general|عامة|общо|সাধারণ|vseobecne|generelt|allgemein|γενικο|en general|uldine|عمومی|yleinen|כללי|सामान्य|glavni|altalanos|umum|generale|一般的な|일반|bendras|visparigs|генерално|algemeen|ogolne|- geral|общее|splosno|gjeneral|allmant|ทั่วไป|genel|загальнии|tong quat|总体|其他國家"};
function ntLocalize(){if(!Array.isArray(noteTabs))return;var fo=function(x){return String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()},ch=false;
 noteTabs.forEach(function(t){if(!t||typeof t.name!=='string')return;var m=/^([\s\S]*?\S)(\s*[^\p{L}\p{N}\s][^\p{L}\p{N}]*)?$/u.exec(t.name);if(!m)return;var b=fo(m[1]),sf=m[2]||'';
  for(var k in NT_LOC){if(NT_LOC[k].split('|').indexOf(b)>=0){var nn=TR(k)+sf;if(nn!==t.name){t.name=nn;ch=true}break}}});
 if(ch)LS.set('ns_notetabs',noteTabs)}
ntMigrate();ntLocalize();fdMigrate();
if(!LS.get('ns_notesort1',0)){notes.sort(nCmp);LS.set('ns_notes',notes);LS.set('ns_notesort1',1)} /* v52: one-time alphabetical sort */
function nStore(n){if(!n.lock)return n;var o={};['id','tab','fd','ts','createdAt','updatedAt','editedAt','alarm','lock','ltitle','color','ph','isort','pin','del','delTab','lb'].forEach(function(k){if(n[k]!=null)o[k]=n[k]});o.text='';return o}
(function(){var lim=Date.now()-30*864e5,n0=notes.length;notes=notes.filter(function(n){return !n.del||new Date(n.del).getTime()>lim});if(notes.length!==n0)LS.set('ns_notes',notes)})();
var nTrash=false;
function saveNotes(soft){/* v173: keep the previous full copy if a save would shrink the list a lot (additive, never deletes) */try{var o0=localStorage.getItem('ns_notes'),c0=o0?JSON.parse(o0).length:0;if(c0>=5&&notes.length<c0/2)localStorage.setItem('ns_notes_guard',JSON.stringify({ts:new Date().toISOString(),n:c0,v:o0}))}catch(_){}LS.set('ns_notes',notes.map(nStore));if(noteFolders.length||LS.get('ns_folders',null))LS.set('ns_folders',noteFolders);if(!soft&&typeof nHistPush==='function')nHistPush();LS.set('ns_notetabs',noteTabs);LS.set('ns_notetab',noteTab)}
function findN(id){for(var i=0;i<notes.length;i++)if(notes[i].id===id)return notes[i];return null}
function findNT(id){for(var i=0;i<noteTabs.length;i++)if(noteTabs[i].id===id)return noteTabs[i];return null}
function nDate(n){return fDate(new Date(n.ts))}
function setHTML(el,h){if(el.innerHTML!==h)el.innerHTML=h} /* v48: no rebuild when unchanged, so a tap that blurs the input still lands */
function renderNoteTabs(){var box=$('noteTabs');if(!box)return;var h='';
 if(window.ntFixCur)ntFixCur();/* v179: cold start never opens on Parole (no fingerprint prompt at launch) — open on the last non-Parole tab; last tab is persisted on every change */try{var _ct=findNT(noteTab),_np=function(x){return x&&!x.off&&x.kind!=='pw'};if(!window.__cs179){window.__cs179=1;if(_ct&&_ct.kind==='pw'){var _l=findNT(LS.get('ns_lastnp',null));if(!_np(_l))_l=noteTabs.filter(_np)[0];if(_l){noteTab=_l.id;_ct=_l}}}if(_np(_ct))LS.set('ns_lastnp',noteTab);LS.set('ns_notetab',noteTab)}catch(_){}setTimeout(function(){try{window.pwSecSync&&pwSecSync()}catch(_){}},0);noteTabs.forEach(function(t){if(t.off)return;h+='<button type="button" class="ntab'+(t.id===noteTab?' on':'')+'" data-id="'+esc(t.id)+'"'+(t.color?' style="--nc:'+esc(t.color)+'"':'')+'>'+esc(t.name)+(t.lk?'<i class="tbl" aria-label="blocat">'+FD_LK+'</i>':'')+'</button>'});
 setHTML(box,h+'<button type="button" class="ntab nadd1" aria-label="Tab nou">+</button>')}
function ntSortOf(id){var t=findNT(id||noteTab);return (t&&t.sort)||'manual'}
var nQ='';function nFold(x){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function nHay(n){if(n.lock){var c=typeof SX!=='undefined'&&SX.n[n.id];return nFold((n.ltitle||'')+(c?'\n'+c:''))}var t=[n.title||'',n.text||''];(n.items||[]).forEach(function(x){t.push(x.text||'')});(n.blocks||[]).forEach(function(b){if(b.t==='text')t.push(b.v||'');(b.items||[]).forEach(function(x){t.push(x.text||'')})});return nFold(t.join('\n'))}
function ul0(){return $('notesList')}
/* v189 (4): row date hidden off to the right; swipe the row left to reveal. dd.mm.yyyy - Weekday · HH:MM (modified date when sorted by modification) */
function nDateL(n,m){var u=(m==='updated'&&n.updatedAt&&n.updatedAt!==n.createdAt)?n.updatedAt:(n.createdAt||n.ts),d=new Date(u);if(isNaN(d))return '';var p=function(x){return('0'+x).slice(-2)},w='';try{w=d.toLocaleDateString(NL==='ro'?'ro-RO':NL,{weekday:'long'})}catch(_){w=d.toLocaleDateString('ro-RO',{weekday:'long'})}w=w.charAt(0).toLocaleUpperCase()+w.slice(1);return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' - '+w+' · '+p(d.getHours())+':'+p(d.getMinutes())}
/* v189 (2): 1st tap = peek (up to 5 written lines), 2nd = open for reading, tap in text = edit; tap outside collapses */
function nPeekL(n){var U=[],tl=function(v){String(v||'').split('\n').forEach(function(l){if(l.trim())U.push(l.trim())})},it=function(x){if((x.text||'').trim())U.push((x.done?'☑ ':'☐ ')+x.text.trim())};
 if(n.type==='mix')(n.blocks||[]).forEach(function(b){if(b.t==='text')tl(b.v);else if(b.t==='chk')(b.items||[]).forEach(it)});else if(n.type==='check'){tl(n.title);(n.items||[]).forEach(it)}else tl(n.text);return U}
/* v190: peek also for one long line (wraps); card fits the text, max 5 lines in total */
function nPeekCan(li){var n=findN(li.dataset.id);/* v191: tap 1 ALWAYS expands to the card first (also single-line notes); tap 2 opens */return !(!n||n.lock||n.del)}
function nPeekFit(li){var t=li.querySelector('.t'),k=li.querySelector('.npk');if(!t)return;var lh=parseFloat(getComputedStyle(t).lineHeight)||20,tl=Math.max(1,Math.round(t.getBoundingClientRect().height/lh));if(k){var r=Math.max(0,5-tl);var pl=k.querySelector('.npl'),ph=pl?parseFloat(getComputedStyle(pl).lineHeight)||lh:lh;k.style.maxHeight=r?Math.floor(r*ph)+'px':'0px';k.style.display=r?'':'none'}}
function nPeekH(n){if(n.lock||n.del)return '';var U=nPeekL(n).slice(1,6);return U.length?'<span class="npk">'+U.map(function(l){return '<span class="npl">'+esc(l)+'</span>'}).join('')+'</span>':''}
function nPeekOff(x){document.querySelectorAll('#notesList .note.npeek').forEach(function(l){if(l!==x)l.classList.remove('npeek')})}
document.addEventListener('click',function(e){var li=e.target.closest&&e.target.closest('#notesList .note.npeek');nPeekOff(li||null)},true);
function renderNotes(){renderNoteTabs();if(nFolder){var fC=findF(nFolder);if(!fC||!fdAlive(nFolder)||fC.tab!==noteTab||fdHidden(nFolder))nFolder=''}$('notesPg').classList.toggle('infd',!!nFolder);Object.keys(tabOpen).forEach(function(k){if(k!==noteTab)delete tabOpen[k]});if(lbF&&!lbFind(lbF))lbF='';lbBarRender();var tLk=!nTrash&&!nFold(nQ).trim()&&!lbF&&tbHidden(noteTab);$('notesPg').classList.toggle('tlkd',tLk);if(tLk){nFolder='';var tL=findNT(noteTab);setHTML(ul0(),'<li class="tlk"><div class="tlkic">'+FD_LK+'</div><div class="tlkt">'+esc(TR('{name} e blocat')).replace('{name}',function(){return esc(tL.name)})+'</div><button type="button" class="btn" id="tlkGo">🔓 Deblochează</button></li>');return}var ul=$('notesList');if(!ul)return;var q=nFold(nQ).trim(),srch=!!q||!!lbF;var list=notes.filter(function(n){return(srch||(nTrash?n.del:(!n.del&&n.tab===noteTab&&(n.fd||'')===nFolder)))&&(n.lock||n.text.trim()||n.del)}),h='',m=ntSortOf();if(nTrash&&!srch){list.sort(function(a,b){return String(b.del).localeCompare(String(a.del))});m='trash';h='<li class="trbar"><span>🗑 Coș de gunoi · se golește după 30 de zile</span>'+(list.length||fdTrashed().length?'<button type="button" class="btn pill" id="trEmpty">Golește</button>':'')+'<button type="button" class="hb" id="trX" aria-label="Închide coșul">×</button></li>'}
 if(srch){var qs=q.split(/\s+/);list=list.filter(function(n){var hy=nHay(n);return qs.every(function(w){return hy.indexOf(w)>=0})}).sort(nCmp);list=list.filter(function(n){return n.del?!xTabHid(n.tab):(fdAlive(n.fd)&&!xFdHid(n.fd)&&!xTabHid(n.tab))});if(lbF)list=list.filter(function(n){return !n.del&&(n.lb||[]).indexOf(lbF)>=0});m='search'}
 if(m==='alpha')list=list.slice().sort(nCmp);else if(m==='created'||m==='updated'){var k=m==='created'?'createdAt':'updatedAt';list=list.slice().sort(function(a,b){return String(b[k]||'').localeCompare(String(a[k]||''))})}
 if(!nTrash&&!srch){var P=list.filter(function(n){return n.pin});if(P.length)list=P.concat(list.filter(function(n){return !n.pin}))}
 fdRest='';fdPinN=0;h+=fdHead(srch);var pgOn=!nTrash&&!srch,pgDone=!pgOn,pgAny=fdPinN>0||list.some(function(n){return n.pin});function pgFlush(){if(pgDone)return;pgDone=true;if(pgAny&&(fdRest||list.some(function(n){return !n.pin})))h+='<li class="pdiv" aria-hidden="true"></li>';h+=fdRest}
 list.forEach(function(n){if(!n.pin)pgFlush();var pr='';if(n.type==='check'){var it=(n.items||[]).filter(function(x){return x.text.trim()});pr='☑ '+it.filter(function(x){return x.done}).length+'/'+it.length+' · '}else if(n.type==='mix'){var it2=[];(n.blocks||[]).forEach(function(b){if(b.t==='chk')it2=it2.concat((b.items||[]).filter(function(x){return x.text.trim()}))});if(it2.length)pr='☑ '+it2.filter(function(x){return x.done}).length+'/'+it2.length+' · ';if((n.blocks||[]).some(function(b){return b.t==='aud'}))pr='🎙 '+pr}
  if(n.lock)pr='';h+='<li class="note'+(n.lock&&!n.ltitle?' nlocked':'')+(n.color?' ncol':'')+(n.del?' ndel':'')+(selIds[n.id]?' nsel':'')+'" data-id="'+esc(n.id)+'"'+(n.color?' style="--nc:'+esc(ncT(n.color))+'"':'')+'><span class="t">'+(window.urgPre?urgPre(n):'')+(n.lock?esc(n.ltitle||TR('Notiță blocată')):q?(nSnipHL(n.text.trim().split('\n')[0],q.split(/\s+/))||esc(n.text.trim().split('\n')[0])):esc(n.text.trim().split('\n')[0]))+'</span><small class="nts">'+(n.pin&&!n.del?'<span class="npin">📌</span> ':'')+(alNext(n)?'⏰ ':'')+(n.lock?'🔒 ':'')+pr+(n.del&&nTrash&&!srch?TR('șters ')+nDateOf(n.del):'')+(alNext(n)&&!n.del?'<span class="nalt">'+alShort(alNext(n))+(n.alarm.rep?' 🔁':'')+'</span>':'')+(srch&&n.del?' · <span class="nstab">🗑 Coș</span>':'')+(srch&&!n.del?(function(){var tb=findNT(n.tab);return tb?' · <span class="nstab"'+(tb.color?' style="--nc:'+esc(tb.color)+'"':'')+'>'+esc(tb.name)+(n.fd?' › '+esc(fdNames(n.fd).join(' › ')):'')+'</span>':''})():'')+lbChips(n)+'</small>'+(q?(n.lock?xLkSnip(n,q):nSnips(n,q)):'')+(q?'':nPeekH(n))+'<i class="nck" aria-hidden="true"></i>'+(n.del&&nTrash&&!srch?'':'<span class="ndt">'+esc(nDateL(n,m))+'</span>')+'</li>'});
 pgFlush();if(q)h+=xRows(q);setHTML(ul,h&&(h.indexOf('class="note')>=0||h.indexOf('class="nfo')>=0||h.indexOf('class="nxr')>=0)?h:(h||'')+'<li class="empty">'+(srch?TR('Niciun rezultat.'):nTrash?TR('Coșul e gol.'):TR('Nicio notiță.'))+'</li>')}
function nDateOf(iso){return fDate(new Date(iso))}
/* v21: search snippets — matching lines in context, matches underlined */
function nSnipHL(line,qs){var F=nHlFold(line),R=[];qs.forEach(function(w){var i=0;while((i=F.f.indexOf(w,i))>=0){R.push([F.map[i],F.map[i+w.length-1]+1]);i+=w.length}});if(!R.length)return null;
 R.sort(function(a,b){return a[0]-b[0]});var a0=Math.max(0,R[0][0]-40),cut=a0>0?line.lastIndexOf(' ',a0)+1||a0:0,end=Math.min(line.length,cut+150),h=cut>0?'…':'',last=cut;
 R.forEach(function(r){if(r[0]<last||r[1]>end)return;h+=esc(line.slice(last,r[0]))+'<span class="nhm">'+esc(line.slice(r[0],r[1]))+'</span>';last=r[1]});return h+esc(line.slice(last,end))+(end<line.length?'…':'')}
function nSnips(n,q){var qs=q.split(/\s+/).filter(Boolean),U=[],it=function(x){if((x.text||'').trim())U.push((x.done?'☑ ':'☐ ')+x.text.trim())},tl=function(v){String(v||'').split('\n').forEach(function(l){if(l.trim())U.push(l.trim())})};
 if(n.type==='mix')(n.blocks||[]).forEach(function(b){if(b.t==='text')tl(b.v);else if(b.t==='chk')(b.items||[]).forEach(it)});else if(n.type==='check'){tl(n.title);(n.items||[]).forEach(it)}else tl(n.text);
 var first=nTitle0(n).trim(),out=[];U.forEach(function(u,i){if(out.length>=3)return;if(i===0&&u===first)return;var h=nSnipHL(u,qs);if(h)out.push('<span class="nsl">'+h+'</span>')});
 return out.length?'<span class="nsnip">'+out.join('')+'</span>':''}
function nSearchOpen(){$('notesPg').classList.add('nsrch');var i=$('nSearchIn');i.value=nQ;i.focus()}
function nSearchClose(){nQ='';lbF='';$('nSearchIn').value='';$('notesPg').classList.remove('nsrch');try{$('nSearchIn').blur()}catch(_){}renderNotes()}
$('nSearch').addEventListener('click',nSearchOpen);$('nSearchX').addEventListener('click',nSearchClose);
$('nSearchIn').addEventListener('input',function(){nQ=this.value;renderNotes()});
/* v74: search everywhere — tabs, folders, Utilități, Medicamente + library; locked content only after PIN (session) */
var SX={t:{},f:{},n:{}},XR=[];
function xTabHid(id){return tbHidden(id)&&!SX.t[id]}
function xFdHid(id){return !!id&&fdChain(id).some(function(f){return f.lk&&!fdOpen[f.id]&&!SX.f[f.id]})}
function xM(t,qs){var f=nFold(t);return qs.every(function(w){return f.indexOf(w)>=0})}
function xSnip(t,qs){var ls=String(t||'').split('\n'),l=ls.filter(function(x){var f=nFold(x);return qs.some(function(w){return f.indexOf(w)>=0})})[0]||ls[0];return nSnipHL(l,qs)||esc(l)}
function xPlain(o){var L=[o.title||'',o.text||''];(o.items||[]).forEach(function(x){L.push(x.text||'')});(o.blocks||[]).forEach(function(b){if(b.t==='text')L.push(b.v||'');(b.items||[]).forEach(function(x){L.push(x.text||'')})});return L.join('\n')}
function xLkSnip(n,q){var c=SX.n[n.id];if(!c)return '';var qs=q.split(/\s+/).filter(Boolean),out=[];c.split('\n').forEach(function(l){if(out.length<3&&l.trim()){var h=nSnipHL(l,qs);if(h)out.push('<span class="nsl">'+h+'</span>')}});return out.length?'<span class="nsnip">'+out.join('')+'</span>':''}
function xTabName(id){var t=findNT(id);return t?t.name:''}
function xRows(q){var qs=q.split(/\s+/).filter(Boolean),R=[],lk=0,enc=0;XR=[];
 noteTabs.forEach(function(t){if(xM(t.name,qs))R.push({path:[TR('Tab')],text:t.name,tab:t.id})});
 noteFolders.forEach(function(f){if(f.del||!fdAlive(f.id)||!xM(f.name,qs))return;if(xTabHid(f.tab)||(f.parent&&xFdHid(f.parent))){lk++;return}R.push({path:[xTabName(f.tab)].concat(f.parent?fdNames(f.parent):[]),text:f.name,tab:f.tab,fd:f.id})});
 if(window.spSearch)try{spSearch(qs,nFold).forEach(function(r){if(xTabHid(r.tab)){lk++;return}R.push(r)})}catch(e){console.warn(e)}
 notes.forEach(function(n){if(n.del)return;var hid=xTabHid(n.tab)||xFdHid(n.fd);if(n.lock&&!SX.n[n.id]){enc++;return}if(hid&&xM(nHay(n),qs))lk++});
 var h='';R.forEach(function(r,i){XR.push(r);h+='<li class="nxr" data-x="'+i+'"><span class="t ux">'+xSnip(r.text,qs)+'</span><small class="nts"><span class="nstab ux">'+r.path.filter(Boolean).map(esc).join(' › ')+'</span></small></li>'});
 if(lk||enc)h+='<li class="nxl"><span class="nxlt">🔒 '+(lk?lk+' '+esc(TR('rezultate în notițe blocate')):esc(TR('Caută și în notițele blocate')))+'</span><button type="button" class="btn pill">'+esc(TR('🔓 Deblochează'))+'</button></li>';
 return h}
function xTab(id){if(draftId)draftFinish();if(SX.t[id])tabOpen[id]=1;noteTab=id;nFolder='';saveNotes();nSearchClose()}
function xUnlock(){pinShow({bio:'x',title:TR('Introdu PIN-ul'),done:function(pin){var P=[];
 noteTabs.forEach(function(t){if(t.lk&&!SX.t[t.id])P.push(tbTry(t,pin).then(function(ok){if(ok)SX.t[t.id]=1;return ok}))});
 noteFolders.forEach(function(f){if(f.lk&&!f.del&&!SX.f[f.id])P.push(fdTry(f,pin).then(function(ok){if(ok)SX.f[f.id]=1;return ok}))});
 notes.forEach(function(n){if(n.lock&&!n.del&&!SX.n[n.id])P.push(lkTry(n,pin).then(function(r){if(r){SX.n[n.id]=xPlain(r.o);return true}return false}))});
 return Promise.all(P).then(function(a){if(!a.some(Boolean))return TR('PIN greșit');setTimeout(renderNotes,0);return true})}})}
$('notesList').addEventListener('click',function(e){var l=e.target.closest('.nxl');if(l){e.stopPropagation();xUnlock();return}var x=e.target.closest('.nxr');if(!x)return;e.stopPropagation();var r=XR[+x.dataset.x];if(!r)return;
 xTab(r.tab);if(r.fd){if(SX.f[r.fd])fdOpen[r.fd]=1;fdChain(r.fd).forEach(function(f){if(SX.f[f.id])fdOpen[f.id]=1});fdGo(r.fd);return}
 if(r.act&&window.spGo){var sel=spGo(r.act);setTimeout(function(){var el=sel&&document.querySelector('#spView '+sel);if(el){try{el.scrollIntoView({block:'center'})}catch(_){}el.classList.add('xflash');setTimeout(function(){el.classList.remove('xflash')},1800)}},80)}},true);
$('nSearchIn').addEventListener('keydown',function(e){if(e.key==='Escape')nSearchClose();else if(e.key==='Enter'){e.preventDefault();this.blur()}});
var nSaveT=null;
function nSaveSoon(){clearTimeout(nSaveT);nSaveT=setTimeout(function(){nSaveT=null;saveNotes(true);var on=fullId&&findN(fullId);if(on&&on.lock&&on._key)lkReseal(on)},300)}

/* v115: colored labels — ns_labels=[{id,name,color}], note.lb=[ids] */
var LB_PAL=['#e5484d','#f76b15','#f5b400','#30a46c','#12a594','#0090ff','#6e56cf','#d6409f','#8d8d8d','#a0522d'],lbF='',lbNewCol=LB_PAL[5];
function lbAll(){var a=LS.get('ns_labels',[]);return Array.isArray(a)?a:[]}
function lbSave(a){LS.set('ns_labels',a);try{nspPush('ns_labels')}catch(_){}}
function lbFind(id){return lbAll().filter(function(x){return x.id===id})[0]||null}
function lbChips(n){if(!n.lb||!n.lb.length)return '';var A=lbAll(),h='';n.lb.forEach(function(id){A.forEach(function(l){if(l.id===id)h+='<i class="nlb" style="--lc:'+esc(l.color)+'">'+esc(l.name)+'</i>'})});return h?'<span class="nlbs">'+h+'</span>':''}
function lbBarRender(){var b=$('lbBar');if(!b)return;var A=lbAll();b.classList.toggle('has',A.length>0);b.innerHTML=A.map(function(l){return '<button type="button" class="nlb'+(lbF===l.id?' on':'')+'" data-lb="'+esc(l.id)+'" style="--lc:'+esc(l.color)+'">'+esc(l.name)+'</button>'}).join('')}
document.addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('#lbBar [data-lb]');if(!c)return;e.preventDefault();lbF=lbF===c.dataset.lb?'':c.dataset.lb;renderNotes()});
function lbAsk(msg,okT,yes){var cf=$('cfModal').querySelector('.cftxt'),ok=$('cfOk'),t0=cf.textContent,o0=ok.textContent;cf.textContent=msg;ok.textContent=okT;var back=function(){cf.textContent=t0;ok.textContent=o0};jvConfirm(function(){back();yes()});var no=$('cfNo').onclick;$('cfNo').onclick=function(){back();no&&no()}}
/* nid: assign labels to that note; null: manage */
function lbOpen(nid){var m=$('lbModal');if(!m){m=document.createElement('div');m.className='modal';m.id='lbModal';m.innerHTML='<div class="card jvdlg"></div>';document.body.appendChild(m);
  m.addEventListener('click',function(e){if(e.target===m){lbClose();return}var t=e.target.closest('button');if(!t)return;var A=lbAll(),id=t.dataset.id,NS=lbNs(),n=NS[0];
   if(t.dataset.tg&&n){var all=NS.every(function(x){return (x.lb||[]).indexOf(id)>=0});NS.forEach(function(x){var L=(x.lb||[]).filter(function(y){return y!==id});if(!all)L.push(id);if(L.length)x.lb=L;else delete x.lb});saveNotes();renderNotes();lbDraw();return}
   if(t.dataset.del){var l=lbFind(id);if(!l)return;m.classList.remove('show');lbAsk(TR('Ștergi eticheta')+' „'+l.name+'”? '+TR('Notițele rămân.'),TR('Șterge'),function(){lbSave(lbAll().filter(function(x){return x.id!==id}));notes.forEach(function(x){if(x.lb){x.lb=x.lb.filter(function(y){return y!==id});if(!x.lb.length)delete x.lb}});if(lbF===id)lbF='';saveNotes();renderNotes();lbDraw();m.classList.add('show')});setTimeout(function(){var no=$('cfNo').onclick;$('cfNo').onclick=function(){no&&no();m.classList.add('show')}},0);return}
   if(t.dataset.col){lbNewCol=t.dataset.col;lbDraw();return}
   if(t.id==='lbAddB'){var v=($('lbAddIn').value||'').trim().slice(0,24);if(!v){$('lbAddIn').focus();return}if(A.some(function(x){return x.name.toLowerCase()===v.toLowerCase()})){toast(TR('Eticheta există deja'));return}var nl={id:'l'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:v,color:lbNewCol};A.push(nl);lbSave(A);if(NS.length){NS.forEach(function(x){x.lb=(x.lb||[]).concat(nl.id)});saveNotes()}lbNewCol=LB_PAL[(LB_PAL.indexOf(lbNewCol)+1)%LB_PAL.length];renderNotes();lbDraw();return}
   if(t.id==='lbDone')lbClose()});
  m.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='lbAddIn'){e.preventDefault();$('lbAddB').click()}})}
 m._ids=nid?(Array.isArray(nid)?nid:[nid]):[];lbDraw();m.classList.add('show')}
function lbNs(){var m=$('lbModal');return ((m&&m._ids)||[]).map(findN).filter(Boolean)}
function lbClose(){var m=$('lbModal');if(m)m.classList.remove('show')}
function lbDraw(){var m=$('lbModal');if(!m)return;var A=lbAll(),NS=lbNs(),n=NS[0],h='<div class="lbh">🏷 '+esc(TR('Etichete'))+'</div>';
 if(!A.length)h+='<div class="lbe">'+esc(TR('Nicio etichetă încă. Creează una mai jos.'))+'</div>';
 A.forEach(function(l){var on=NS.length&&NS.every(function(x){return (x.lb||[]).indexOf(l.id)>=0});h+='<div class="lbr"><button type="button" class="nlb'+(n?(on?' on':' off'):'')+'" '+(n?'data-tg="1" ':'')+'data-id="'+esc(l.id)+'" style="--lc:'+esc(l.color)+'">'+esc(l.name)+'</button><button type="button" class="lbx" data-del="1" data-id="'+esc(l.id)+'" aria-label="'+esc(TR('Șterge'))+'">×</button></div>'});
 h+='<div class="lbpal">'+LB_PAL.map(function(c){return '<button type="button" data-col="'+c+'" class="'+(c===lbNewCol?'cur':'')+'" style="background:'+c+'" aria-label="'+c+'"></button>'}).join('')+'</div>';
 h+='<div class="lbadd"><input id="lbAddIn" maxlength="24" placeholder="'+esc(TR('Etichetă nouă'))+'" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-form-type="other"><button type="button" class="btn pill" id="lbAddB">'+esc(TR('Adaugă'))+'</button></div>';
 h+='<div class="mrow"><button type="button" class="btn" id="lbDone">'+esc(TR('Gata'))+'</button></div>';
 m.querySelector('.card').innerHTML=h}
/* labels travel with backups and the native prefs mirror */
(function wrap(){var c=window.spCollect,ap=window.spApply;if(!c){window.addEventListener('load',wrap);return}if(c._v115)return;window.spCollect=function(){var o=c.apply(this,arguments)||{};o.ns_labels=lbAll();return o};window.spCollect._v115=1;for(var q in c)if(!(q in window.spCollect))window.spCollect[q]=c[q];
 window.spApply=function(d){var r=ap&&ap.apply(this,arguments);try{if(d&&Array.isArray(d.ns_labels)){lbSave(d.ns_labels);renderNotes()}}catch(_){}return r}})();
/* v115: drag a note onto a tab chip to move it there */
function ndTabAt(x,y){var el=document.elementFromPoint(x,y),t=el&&el.closest&&el.closest('#noteTabs .ntab[data-id]');return t&&!t.classList.contains('nadd1')?t:null}
document.addEventListener('pointermove',function(e){var d=ndrag;if(!d||!d.on||e.pointerId!==d.pid)return;var t=ndTabAt(e.clientX,e.clientY);if(t!==d.tt){if(d.tt)d.tt.classList.remove('ndtgt');d.tt=t;if(t&&t.dataset.id!==noteTab)t.classList.add('ndtgt');else d.tt=null}},true);
document.addEventListener('pointerup',function(e){var d=ndrag;if(!d||!d.on||e.pointerId!==d.pid||!d.tt)return;var t=d.tt,tid=t.dataset.id,n=findN(d.id);t.classList.remove('ndtgt');e.stopImmediatePropagation();e.preventDefault();ndEnd(false);if(!n||tid===noteTab)return;
 n.tab=tid;if(n.fd){var f=findF(n.fd);if(!f||f.tab!==tid)delete n.fd}saveNotes();renderNotes();var tb=findNT(tid);toast(TR('Mutat în ')+(tb?tb.name:''));try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}},true);
/* v115: dictation into the note — Web Speech, or native SpeechRecognizer on Android */
var dict={on:false,rec:null,el:null,s:0,e:0};
document.addEventListener('focusout',function(e){var t=e.target;if(t&&t.closest&&t.closest('#noteFull')&&(t.tagName==='TEXTAREA'||(t.tagName==='INPUT'&&/^(text|search)?$/.test(t.type||''))||t.isContentEditable)){dict.el=t;try{dict.s=t.selectionStart;dict.e=t.selectionEnd}catch(_){}}},true);
function dictLang(){return NL==='ro'?'ro-RO':(NL||'ro-RO')}
function dictIns(txt){txt=String(txt||'').trim();if(!txt)return;var el=dict.el;if(!el||!document.contains(el)||!el.closest('#noteFull'))el=$('nfText');if(!el||el.offsetParent===null){el=$('nfText');if(el.offsetParent===null){var c=[].filter.call($('noteFull').querySelectorAll('textarea,input[type=text],[contenteditable=true]'),function(x){return x.offsetParent!==null&&x.id!=='nfTitle'});el=c[c.length-1]||$('nfText')}}
 if(el.isContentEditable){el.focus();try{document.execCommand('insertText',false,txt+' ')}catch(_){el.textContent+=' '+txt}return}
 var v=el.value||'',s=dict.el===el&&dict.s!=null?Math.min(dict.s,v.length):v.length,en=dict.el===el&&dict.e!=null?Math.min(dict.e,v.length):s;
 var pre=v.slice(0,s),ins=(pre&&!/\s$/.test(pre)?' ':'')+txt+' ';el.value=pre+ins+v.slice(en);var p=s+ins.length;dict.el=el;dict.s=dict.e=p;try{el.setSelectionRange(p,p)}catch(_){}
 el.dispatchEvent(new Event('input',{bubbles:true}))}
function dictUi(on){dict.on=on;var b=$('nfMic');if(b){b.classList.toggle('rec',on);b.setAttribute('aria-pressed',on?'true':'false')}}
function dictNative(){try{return !!(window.NotisNative&&NotisNative.sttStart)}catch(_){return false}}
window.__sttLog=[];
function dictLive(t){var d=$('dictLive');if(!t){if(d)d.remove();return}if(!d){d=document.createElement('div');d.id='dictLive';$('noteFull').appendChild(d)}d.textContent=t}
var DICT_ERR={nomatch:'Nu am auzit nimic',timeout:'Nu am auzit nimic',noservice:'Lipsește serviciul de recunoaștere vocală Google',network:'Fără internet pentru dictare',busy:'Recunoașterea vocală e ocupată, încearcă din nou',lang:'Limba nu e disponibilă pentru dictare',perm:'Fără acces la microfon'};
function dictSave(){try{fullFlush()}catch(_){}try{nFlush()}catch(_){}}
window.__stt=function(k,t){try{__sttLog.push(new Date().toISOString().slice(11,19)+' '+k+':'+t);if(__sttLog.length>40)__sttLog.shift();localStorage.setItem('ns_sttlog',JSON.stringify(__sttLog))}catch(_){}
 if(k==='part'){dict.part=t;dictLive(t)}
 else if(k==='final'){dict.part='';dictLive('');dictIns(t);dict.got=1;dictSave()}
 else if(k==='err'){var p=dict.part;dict.part='';dictLive('');if(p&&!dict.got){dictIns(p);dictUi(false);return}dictUi(false);toast(DICT_ERR[t]?TR(DICT_ERR[t]):TR('Dictarea nu a mers')+(t?' ('+t+')':''))}
 else if(k==='end'){if(dict.part&&!dict.got)dictIns(dict.part);dict.part='';dictLive('');dictUi(false)}};
window.__sttPerm=function(ok){if(ok)dictStart();else{dictUi(false);toast(TR('Fără acces la microfon'))}};
window.__sttDeliver=function(kind,t){try{window.__stt('dbg','deliver '+kind+' '+String(t||'').length)}catch(_){}dictLive('');dict.part='';
 if(kind==='final'&&t){var open=$('noteFull').classList.contains('show');if(open&&(!dict.nid||fullId===dict.nid||!fullId)){dictIns(t);dict.got=1;dictSave()}
  else{var n=dict.nid&&findN(dict.nid);if(n&&!n.lock&&n.type!=='check'&&n.type!=='mix'){n.text=String(n.text||'').replace(/\s*$/,n.text?' ':'')+String(t).trim();n.updatedAt=new Date().toISOString();try{saveNotes()}catch(_){}try{nFlush()}catch(_){}try{renderNotes()}catch(_){}toast(TR('Salvat'))}}}
 else if(kind==='nomatch')toast(TR('Nu am auzit nimic'));dictUi(false);return 'ok'};
function dictStart(){dict.got=0;dict.part='';dict.nid=fullId||null;if(dictNative()){var r='';try{r=NotisNative.sttStart(dictLang())}catch(e){r='err:'+e}if(r==='ok'){dictUi(true);toast(TR('Vorbește acum…'))}else if(r==='perm'){}else{dictUi(false);toast(r==='err:noservice'?TR(DICT_ERR.noservice):TR('Dictarea nu e disponibilă pe acest telefon'))}return}
 var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){toast(TR('Dictarea nu e disponibilă în acest browser'));return}
 try{var rc=new SR();rc.lang=dictLang();rc.continuous=true;rc.interimResults=false;rc.onresult=function(ev){for(var i=ev.resultIndex;i<ev.results.length;i++)if(ev.results[i].isFinal)dictIns(ev.results[i][0].transcript)};
  rc.onerror=function(ev){window.__stt('err',ev.error==='not-allowed'?'':(ev.error==='no-speech'?'nomatch':ev.error));if(ev.error==='not-allowed')toast(TR('Fără acces la microfon'))};rc.onend=function(){dict.rec=null;dictUi(false)};rc.start();dict.rec=rc;dictUi(true);toast(TR('Vorbește acum…'))}catch(e){dictUi(false);toast(TR('Dictarea nu a mers'))}}
function dictStop(){if(dictNative()){try{NotisNative.sttStop()}catch(_){}}else if(dict.rec){try{dict.rec.stop()}catch(_){}}dictUi(false)}
document.addEventListener('pointerdown',function(e){if(e.target.closest&&e.target.closest('#nfMic'))e.preventDefault()},true);
document.addEventListener('pointerdown',function(e){if(!(e.target.closest&&e.target.closest('#nfMic')))return;var a=document.activeElement;if(a&&a.closest&&a.closest('#noteFull')&&(a.tagName==='TEXTAREA'||a.tagName==='INPUT'||a.isContentEditable)){dict.el=a;try{dict.s=a.selectionStart;dict.e=a.selectionEnd}catch(_){}}},true);
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#nfMic');if(!b)return;e.preventDefault();e.stopPropagation();if(dict.on)dictStop();else dictStart()});

function nFlush(){clearTimeout(nSaveT);nSaveT=null;saveNotes();var on=fullId&&findN(fullId);if(on&&on.lock&&on._key)lkReseal(on)}
var draftId=null;
function draftInput(){var v=$('iNote').value,n=draftId&&findN(draftId);
 if(v.trim()){if(!n){n={id:ntUid(),text:v,ts:new Date().toISOString(),tab:noteTab,fd:nFolder||undefined};notes.push(n);draftId=n.id}else{n.text=v;n.editedAt=new Date().toISOString()}}
 else if(n){notes=notes.filter(function(x){return x!==n});draftId=null}
 nSaveSoon();renderNotes()}
function draftFinish(){if(!$('iNote')){draftId=null;return}var n=draftId&&findN(draftId);if(n){n.text=n.text.replace(/\s+$/,'');if(!n.text.trim())notes=notes.filter(function(x){return x!==n})}
 draftId=null;$('iNote').value='';noteGrow();nFlush();renderNotes()}
function noteGrow(){var i=$('iNote');if(!i)return;i.style.height='auto';i.style.height=i.scrollHeight+'px'}
/* v50: top input removed; new notes start from the + button in the full editor */
var fullId=null;
function fullOpen(id){if(draftId)draftFinish();var n=findN(id);if(!n)return;if(n.lock&&!n._key){lkOpen(id);return}$('noteFull').classList.toggle('nro',!!n.del);nHlClear();var hp=nHlPend&&nHlPend.id===id?nHlPend:null;nHlPend=null;if(hp)setTimeout(function(){if(fullId===id)nHlApply(hp.q)},250);fullId=id;fullIsNew=false;var ta=$('nfText');ta.value=n.text;mShow(n);$('noteFull').classList.toggle('chk',n.type==='check');phClear();if(n.type==='mix')mRender();edState();setTimeout(phRender,0);if(n.type==='check')chkRender();$('noteFull').classList.add('show');setTimeout(function(){window.nfReadFit&&nfReadFit()},0);document.documentElement.classList.add('jv-nfull');try{history.pushState({jvNote:1},'')}catch(_){}}
function fullInput(){var n=fullId&&findN(fullId);if(!n){var v=$('nfText').value;if(!v.trim())return;var now=new Date().toISOString();n={id:ntUid(),text:v,ts:now,createdAt:now,updatedAt:now,tab:noteTab,fd:nFolder||undefined};notes.push(n);fullId=n.id;fullIsNew=true;nSaveSoon();return}if(n.type==='check'||n.type==='mix')return;n.text=$('nfText').value;n.editedAt=n.updatedAt=new Date().toISOString();nSaveSoon()}
function fullFlush(){if(!fullId)return;var n=findN(fullId);if(n){if(n.type==='check')chkSync(n);else if(n.type==='mix')mSync(n);else n.text=$('nfText').value;if(!n.text.trim()&&!n.ph)notes=notes.filter(function(x){return x!==n})}nFlush()}
var fullIsNew=false;
function fullNew(){var ta=$('nfText');ta.value='';$('noteFull').classList.remove('mix');ncApply(null);$('nfAlarm').classList.remove('on');phGen++;phClear();phFit();fullId=null;fullIsNew=false;$('noteFull').classList.remove('chk');$('noteFull').classList.add('show');setTimeout(function(){window.nfReadFit&&nfReadFit()},0);document.documentElement.classList.add('jv-nfull');try{history.pushState({jvNote:1},'')}catch(_){}try{ta.focus()}catch(_){}}
$('noteFab').addEventListener('click',fullNew);
/* v57: separate undo/redo for Notițe (snapshots never hold more plaintext than storage; ciphertext comes from a cache) */
var nLockCache={},nH={u:[],r:[],cur:null},NH_MAX=60;
function nSnap(){notes.forEach(function(n){if(n.lock)nLockCache[n.id]=n.lock});return JSON.stringify({notes:notes.map(nStore),tabs:noteTabs,tab:noteTab,fds:noteFolders},function(k,v){return k==='iv'||k==='ct'||k==='salt'?undefined:v})}
function nHistPush(){if(nH.cur===null)return;var s=nSnap();if(s===nH.cur)return;nH.u.push(nH.cur);if(nH.u.length>NH_MAX)nH.u.shift();nH.r=[];nH.cur=s;nHistBtns()}
function nHistReset(){nH.u=[];nH.r=[];nH.cur=nSnap();nHistBtns()}
function nHistBtns(){['nUndo'].forEach(function(i){var b=$(i);if(b)b.disabled=!nH.u.length});['nRedo'].forEach(function(i){var b=$(i);if(b)b.disabled=!nH.r.length});if(typeof eBtns==='function')eBtns()}
function nHistApply(s){var d=JSON.parse(s);d.notes.forEach(function(n){if(n.lock){var live=findN(n.id);n.lock=(live&&live.lock)||nLockCache[n.id];if(!n.lock){delete n.lock}}});
 var openId=fullId;notes=d.notes;noteTabs=d.tabs;noteTab=d.tab;if(d.fds){noteFolders=d.fds;LS.set('ns_folders',noteFolders)}LS.set('ns_notes',notes.map(nStore));LS.set('ns_notetabs',noteTabs);LS.set('ns_notetab',noteTab);
 if(openId){var n=findN(openId);if(!n){fullId=null;fullIsNew=false;$('noteFull').classList.remove('show');document.documentElement.classList.remove('jv-nfull');if(history.state&&history.state.jvNote)try{nIgnorePop=true;history.back()}catch(_){nIgnorePop=false}}
  else{mShow(n);$('noteFull').classList.toggle('chk',n.type==='check');if(n.type==='check')chkRender();else if(n.type==='mix')mRender();else $('nfText').value=n.text;edState()}}
 renderNotes();nHistBtns()}
function nStep(dir){var on=fullId&&findN(fullId);if(on&&on.lock){toast(TR('Nu se poate într-o notiță blocată'));return}
 if(nSaveT){clearTimeout(nSaveT);nSaveT=null}if(on){if(on.type==='check')chkSync(on);else on.text=$('nfText').value}saveNotes();
 var from=dir<0?nH.u:nH.r,to=dir<0?nH.r:nH.u;if(!from.length)return;to.push(nH.cur);nH.cur=from.pop();nHistApply(nH.cur);toast(dir<0?TR('Anulat'):TR('Refăcut'))}
$('nUndo').addEventListener('click',function(){nStep(-1)});$('nRedo').addEventListener('click',function(){nStep(1)});
/* v29: granular per-session editor undo/redo (typing bursts, word boundaries, deletions, paste, structural edits); discarded on close */
var eH={u:[],r:[],cur:null,sel:null,id:null,on:false},eLast=null,eLastSel=null,eT=null,eKind='',eMoved=false,eEl=null,eBusy=false,eSt=null,eTxtAt=0,eWasF=null,eWs=false,eWd=false,EH_MAX=200;
function eNote(){return fullId?findN(fullId):null}
function eSnap(){var n=eNote();if(!n)return 'null';if(n.type==='check')chkSync(n);else if(n.type==='mix')mSync(n);else n.text=$('nfText').value;
 return JSON.stringify(n,function(k,v){return k==='updatedAt'||k==='editedAt'||k==='_key'||k==='iv'||k==='ct'||k==='salt'?undefined:v})}
function eEds(){return [].slice.call($('noteFull').querySelectorAll('.nfcard textarea,.nfcard input[type=text],.nfcard [contenteditable=true]')).filter(function(x){return x.offsetParent!==null})}
function eSelGet(){var a=document.activeElement,L=eEds(),i=L.indexOf(a);if(i<0)return eLastSel;var o={i:i};try{o.s=a.selectionStart;o.e=a.selectionEnd}catch(_){}return o}
function eBtns(){var nr=$('noteFull').classList.contains('nro'),u=$('nfUndo'),r=$('nfRedo');if(u)u.disabled=!eH.on||!eH.u.length;if(r)r.disabled=!eH.on||!eH.r.length}
function eReset(){clearTimeout(eT);eT=null;var n=eNote();eH={u:[],r:[],cur:null,sel:null,id:fullId,on:true};if(n&&n.lock){eH.on=false}eH.cur=eSnap();eH.sel=null;eLast=eH.cur;eLastSel=null;eKind='';eMoved=false;eEl=null;eBtns()}
function eClear(){clearTimeout(eT);eT=null;eH={u:[],r:[],cur:null,sel:null,id:null,on:false};eLast=null;eLastSel=null;eBtns()}
function eCommit(st,sel){if(!eH.on||st==null||st===eH.cur)return;eH.u.push({s:eH.cur,sel:eH.sel});if(eH.u.length>EH_MAX)eH.u.shift();eH.r=[];eH.cur=st;eH.sel=sel;eBtns()}
function eFlush(){clearTimeout(eT);eT=null;eWd=false;eWs=false;if(eLast!==eH.cur)eCommit(eLast,eLastSel)}
function eSync(){if(!$('noteFull').classList.contains('show'))return false;if(eH.id&&fullId&&eH.id!==fullId)eReset();if(!eH.id&&fullId)eH.id=fullId;return eH.on}
function eTxt(t){return !!(t&&t.closest&&t.closest('.nfcard')&&(t.tagName==='TEXTAREA'||(t.tagName==='INPUT'&&t.type==='text')||t.isContentEditable))}
function eInput(e){if(eBusy||!eSync())return;var t=e.target;if(!eTxt(t))return;
 var it=e.inputType||'',k=/^delete/.test(it)?'del':/Paste|Drop/.test(it)?'paste':'ins';
 var st=eSnap(),sel=eSelGet(),ch='';try{ch=(t.value||'').charAt((t.selectionStart||0)-1)}catch(_){}var ws=/\s/.test(ch);
 if(k==='paste'||k!==eKind||eMoved||t!==eEl||(k==='ins'&&!ws&&eWs)){if(eLast!==eH.cur)eCommit(eLast,eLastSel);eWd=false}
 eKind=k;eMoved=false;eEl=t;eLast=st;eLastSel=sel;if(k==='ins'&&!ws)eWd=true;eWs=k==='ins'&&ws&&eWd;clearTimeout(eT);
 if(k==='paste'){eCommit(st,sel);eKind=''}else eT=setTimeout(eFlush,800)}
function eStruct(){if(eBusy||!eSync())return;clearTimeout(eSt);eSt=setTimeout(function(){eSt=null;if(eBusy||!eSync())return;var st=eSnap();if(st===eLast)return;eFlush();eLast=st;eLastSel=eSelGet();eCommit(st,eLastSel);eKind=''},0)}
(function(){var F=$('noteFull');F.addEventListener('input',function(e){if(eTxt(e.target))eTxtAt=Date.now()},true);F.addEventListener('input',eInput);
 F.addEventListener('pointerdown',function(e){if(e.target.closest&&e.target.closest('.nfcard'))eMoved=true},true);
 F.addEventListener('keydown',function(e){if(/^(Arrow|Home|End|PageUp|PageDown)/.test(e.key||''))eMoved=true},true);
 var _ss=nSaveSoon;nSaveSoon=function(){_ss.apply(this,arguments);if(Date.now()-eTxtAt>40)eStruct()};
 var _sn=saveNotes;saveNotes=function(soft){_sn.apply(this,arguments);if(Date.now()-eTxtAt>40)eStruct()};
 new MutationObserver(function(){var sh=F.classList.contains('show');if(sh&&!eH.on&&eH.id===null&&eH.cur===null)setTimeout(function(){if(F.classList.contains('show'))eReset()},0);else if(!sh&&(eH.on||eH.cur!==null))eClear()}).observe(F,{attributes:true,attributeFilter:['class']})})();
function eApply(st,sel,refocus){var n=eNote();eBusy=true;try{
 if(st==='null'||st==null){if(n){if(n.type==='check'){n.title='';n.items=[]}else n.text=''}}
 else{var d=JSON.parse(st),i=notes.indexOf(n);if(i<0&&d.id)i=notes.findIndex(function(x){return x.id===d.id});var now=new Date().toISOString();d.updatedAt=d.editedAt=now;
  if(i>=0){notes[i]=d}else{notes.push(d);fullId=d.id}n=d}
 if(n){mShow(n);$('noteFull').classList.toggle('chk',n.type==='check');if(n.type==='check')chkRender();else if(n.type==='mix')mRender();else $('nfText').value=n.text||'';edState()}
 nSaveT&&clearTimeout(nSaveT);nSaveT=null;LS.set('ns_notes',notes.map(nStore));renderNotes();
 if(sel){var L=eEds(),el=L[sel.i]||L[L.length-1];if(el){try{if(refocus)el.focus({preventScroll:true});if(sel.s!=null)el.setSelectionRange(Math.min(sel.s,el.value.length),Math.min(sel.e,el.value.length))}catch(_){}}}
 }finally{eBusy=false}eLast=eH.cur;eLastSel=eH.sel;eKind='';eEl=null;eBtns()}
function eStep(dir){var n=eNote();if(n&&n.lock){toast(TR('Nu se poate într-o notiță blocată'));return}if(!eH.on){return}eFlush();
 var from=dir<0?eH.u:eH.r,to=dir<0?eH.r:eH.u;if(!from.length)return;var cs=eSelGet();to.push({s:eH.cur,sel:dir<0?(eH.sel||cs):eH.sel});var x=from.pop();eH.cur=x.s;eH.sel=x.sel;
 var rf=eWasF&&eWasF.closest&&eWasF.closest('.nfcard');eApply(eH.cur,eH.sel||(dir<0?null:cs),rf);toast(dir<0?TR('Anulat'):TR('Refăcut'))}
['nfUndo','nfRedo'].forEach(function(id,j){var b=$(id);b.addEventListener('pointerdown',function(){eWasF=document.activeElement},true);b.addEventListener('mousedown',function(e){e.preventDefault()});b.addEventListener('click',function(){eStep(j?1:-1);eWasF=null})});
/* v55: per-note PIN lock (PBKDF2-SHA256 150k -> AES-GCM); plaintext never stored for locked notes */
function b64e(u){var s='';u=new Uint8Array(u);for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s)}
function b64d(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function lkDerive(pin,salt){var c=crypto.subtle;return c.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveKey']).then(function(k){return c.deriveKey({name:'PBKDF2',salt:salt,iterations:150000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])})}
function lkPayload(n){return JSON.stringify({type:n.type||null,text:n.text||'',title:n.title||'',items:n.items||null,blocks:n.blocks||null})}
function lkEnc(key,salt,n){var iv=crypto.getRandomValues(new Uint8Array(12));return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,new TextEncoder().encode(lkPayload(n))).then(function(ct){return{v:1,salt:b64e(salt),iv:b64e(iv),ct:b64e(ct)}})}
function lkDec(key,lock){return crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(lock.iv)},key,b64d(lock.ct)).then(function(b){return JSON.parse(new TextDecoder().decode(b))})}
function lkApply(n,o){if(o.type)n.type=o.type;else delete n.type;n.text=o.text||'';if(o.title)n.title=o.title;else delete n.title;if(o.items)n.items=o.items;else delete n.items;if(o.blocks)n.blocks=o.blocks;else delete n.blocks}
function lkStrip(n){delete n._key;delete n.title;delete n.items;delete n.blocks;delete n.type;n.text='';renderNotes()}
function lkReseal(n){var key=n._key;if(!key||!n.lock)return Promise.resolve();n.ltitle=nTitle0(n);return lkEnc(key,b64d(n.lock.salt),n).then(function(l){n.lock=l;saveNotes(true);nLockCache[n.id]=l})}
var pinSt=null;
function pinShow(o){if(o.bio&&!o._bp){o._bp=1;o.bio=(typeof PFX==='string'?PFX:'')+o.bio}pinSt=o;var pl=o.len===6?6:4,pd=$('pinDots');while(pd.children.length<pl)pd.appendChild(document.createElement('i'));while(pd.children.length>pl)pd.removeChild(pd.lastChild);$('pinIn').maxLength=pl;$('pinTitle').textContent=o.title;$('pinWarn').style.display=o.warn?'':'none';$('pinMsg').textContent=o.msg||'';var i=$('pinIn');i.value='';pinDots();$('pinModal').classList.add('show');if(bioCan(o)){o.bioW=true;try{if(!NotisNative.bioAuth(o.bio,o.title,TR('Folosește PIN-ul')))o.bioW=false}catch(_){o.bioW=false}}if(!o.bioW)setTimeout(function(){try{i.focus()}catch(_){}},50)}
/* 2.5.6: fingerprint for 🔒 PIN prompts (Android). Only prompts that pass o.bio use it. */
function bioNat(){try{return !!(window.NotisNative&&NotisNative.bioAvail&&NotisNative.bioAvail())}catch(_){return false}}
function bioOnG(){var v=localStorage.getItem('ns_bio');return v===null?true:v==='1'}
function bioCan(o){if(!o||!o.bio||!bioOnG()||!bioNat())return false;try{return NotisNative.bioHas(o.bio)}catch(_){return false}}
function bioSv(k,p){if(!k||!bioOnG()||!bioNat())return;try{NotisNative.bioSave(k,p)}catch(_){}}
function bioRm(k){k=(typeof PFX==='string'?PFX:'')+k;try{if(window.NotisNative&&NotisNative.bioDel)NotisNative.bioDel(k)}catch(_){}}
(function(){var f=$('fBio'),c=$('bioOn');if(!f||!c||!bioNat())return;f.style.display='';c.checked=bioOnG();c.addEventListener('change',function(){localStorage.setItem('ns_bio',c.checked?'1':'0');if(!c.checked){try{NotisNative.bioClear()}catch(_){}}})})();
window.__bioRes=function(k,pin){var o=pinSt;if(!o||o.bio!==k||!o.bioW)return;o.bioW=false;var i=$('pinIn');function man(){if(pinSt===o){$('pinMsg').textContent='';setTimeout(function(){try{i.focus()}catch(_){}},50)}}
 if(pin==null){man();return}o.busy=true;$('pinMsg').textContent='…';Promise.resolve(o.done(pin)).then(function(r){o.busy=false;if(r===true){if(pinSt===o)pinHide()}else{bioDk(k);man()}},function(){o.busy=false;bioDk(k);man()})};
function bioDk(k){try{NotisNative.bioDel(k)}catch(_){}}
function pinDots(){var v=$('pinIn').value;[].forEach.call($('pinDots').children,function(d,k){d.classList.toggle('on',k<v.length)})}
function pinHide(){$('pinModal').classList.remove('show');pinSt=null;try{$('pinIn').blur()}catch(_){}}
function pinErr(m){$('pinMsg').textContent=m;var b=$('pinBox');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');try{if(navigator.vibrate)navigator.vibrate(120)}catch(_){}$('pinIn').value='';pinDots()}
$('pinIn').addEventListener('input',function(){var pl=pinSt&&pinSt.len===6?6:4;this.value=this.value.replace(/\D/g,'').slice(0,pl);pinDots();if(this.value.length===pl&&pinSt&&!pinSt.busy){var o=pinSt,v=this.value;o.busy=true;$('pinMsg').textContent='…';Promise.resolve(o.done(v)).then(function(r){o.busy=false;if(r===true){if(o.bio)bioSv(o.bio,v);if(pinSt===o)pinHide()}else if(pinSt===o)pinErr(r||TR('PIN greșit'))},function(){o.busy=false;if(pinSt===o)pinErr(TR('PIN greșit'))})}});
$('pinDots').addEventListener('click',function(){try{$('pinIn').focus()}catch(_){}});
$('pinCancel').addEventListener('click',pinHide);$('pinModal').addEventListener('click',function(e){if(e.target===this)pinHide()});
function lkLock(id){var n=findN(id);if(!n||n.lock)return;if(!window.crypto||!crypto.subtle){toast(TR('Criptarea nu e disponibilă aici'));return}
 function step1(msg){pinShow({title:TR('Alege un PIN de 4 cifre'),warn:true,msg:msg,done:function(p1){setTimeout(function(){step2(p1)},0);return true}})}
 function step2(p1){pinShow({title:TR('Confirmă PIN-ul'),warn:true,done:function(p2){if(p2!==p1){setTimeout(function(){step1(TR('PIN-urile nu se potrivesc'))},0);return true}
  var salt=crypto.getRandomValues(new Uint8Array(16));var tt=nTitle0(n);var lkK=null;return lkDerive(p2,salt).then(function(k){lkK=k;return lkEnc(k,salt,n)}).then(function(l){var kk=l;return phLockAll(n.id,lkK).then(function(){return kk})}).then(function(l){n.lock=l;n.ltitle=tt;nHistReset();lkStrip(n);saveNotes();toast(TR('Notiță blocată'));return true})}})}
 step1()}
function lkTry(n,pin){return lkDerive(pin,b64d(n.lock.salt)).then(function(k){return lkDec(k,n.lock).then(function(o){return{k:k,o:o}})}).catch(function(){return null})}
/* share a note: text + photos via Web Share */
function nShareText(o){var L=[],it=function(x){if((x.text||'').trim())L.push((x.done?'☑ ':'☐ ')+x.text.trim())};
 if(o.type==='mix')(o.blocks||[]).forEach(function(b){if(b.t==='text'){if((b.v||'').trim())L.push(b.v.replace(/\s+$/,''))}else if(b.t==='chk')mOrder(o,b).forEach(it)});
 else if(o.type==='check'){if((o.title||'').trim())L.push(o.title.trim());chkOrder(o).forEach(it)}
 else if((o.text||'').trim())L.push(o.text.replace(/\s+$/,''));
 return L.join('\n')}
/* payload is prepared ahead (menu open) so navigator.share runs synchronously inside the tap; photos re-encoded small and split in batches */
var nShP=null,SH_MAXN=10,SH_MAXB=8e6;
function nShSmall(b,i){return (window.createImageBitmap?createImageBitmap(b):Promise.reject()).catch(function(){return new Promise(function(ok,no){var u=URL.createObjectURL(b),im=new Image();im.onload=function(){ok(im);setTimeout(function(){URL.revokeObjectURL(u)},0)};im.onerror=function(){URL.revokeObjectURL(u);no()};im.src=u})}).then(function(src){
 var w=src.width||src.naturalWidth,h=src.height||src.naturalHeight,k=Math.min(1,1280/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));c.getContext('2d').drawImage(src,0,0,c.width,c.height);try{src.close&&src.close()}catch(_){}
 return new Promise(function(r){c.toBlob(function(x){r(x&&x.size<b.size?x:b)},'image/jpeg',0.75)})}).catch(function(){return b}).then(function(x){return new File([x],'notis-'+(i+1)+'.jpg',{type:'image/jpeg'})})}
function nSharePrep(o){var txt=nShareText(o),P={id:o.id,txt:txt,files:null,batches:[],ready:false};
 var ord=o.type==='mix'?[].concat.apply([],(o.blocks||[]).filter(function(b){return b.t==='img'}).map(function(b){return b.ph||[]})):null;
 P.p=phOf(o.id).then(function(a){if(ord)a=a.filter(function(r){return ord.indexOf(r.id)>=0}).sort(function(x,y){return ord.indexOf(x.id)-ord.indexOf(y.id)});
  return a.reduce(function(q,r,i){return q.then(function(acc){return phBlob(o,r).then(function(b){return nShSmall(b,i)},function(){return null}).then(function(f){if(f)acc.push(f);return acc})})},Promise.resolve([]))},function(){return[]}).then(function(fs){
  P.files=fs||[];var cur=[],sz=0;P.files.forEach(function(f){if(cur.length&&(cur.length>=SH_MAXN||sz+f.size>SH_MAXB)){P.batches.push(cur);cur=[];sz=0}cur.push(f);sz+=f.size});if(cur.length)P.batches.push(cur);P.ready=true;return P});
 return P}
function nCopySync(txt){var ok=false;try{var t=document.createElement('textarea');t.value=txt;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove()}catch(_){}
 if(!ok)try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).catch(function(){});ok=true}}catch(_){}toast(ok?TR('Copiat'):TR('Nu am putut copia'))}
/* in-app sheet with several choices; always closes on any tap */
function nShSheet(msg,opts){var m=$('shModal');if(!m){m=document.createElement('div');m.id='shModal';m.className='modal';m.style.zIndex='90';document.body.appendChild(m)}
 m.innerHTML='<div class="card jvdlg"><div class="cftxt">'+esc(msg)+'</div><div class="shcol"></div></div>';var col=m.querySelector('.shcol');
 opts.concat([{t:TR('Renunță'),f:null}]).forEach(function(o){var b=document.createElement('button');b.type='button';b.className='btn'+(o.f?'':' shno');b.textContent=o.t;b.onclick=function(){m.classList.remove('show');m.innerHTML='';if(o.f)try{o.f()}catch(e){console.warn(e);toast(TR('Telefonul a refuzat trimiterea'))}};col.appendChild(b)});
 m.onclick=function(e){if(e.target===m){m.classList.remove('show');m.innerHTML=''}};m.classList.add('show')}
function nShRange(P,bi){var a=0;for(var k=0;k<bi;k++)a+=P.batches[k].length;return (a+1)+'–'+(a+P.batches[bi].length)}
function nShSend(d,ok,bad){var t=setTimeout(function(){t=null},60000);
 try{navigator.share(d).then(function(){if(t)clearTimeout(t);ok&&ok()},function(e){if(t)clearTimeout(t);if(e&&e.name==='AbortError')return;console.warn(e);toast(TR('Telefonul a refuzat trimiterea')+(e&&e.name&&e.name!=='Error'?' ('+e.name+')':''));bad&&bad(e)})}catch(e){console.warn(e);toast(TR('Telefonul a refuzat trimiterea'));bad&&bad(e)}}
function nShBatch(P,bi){var fs=P.batches[bi],withTxt=bi===0&&P.txt,d={files:fs};if(withTxt)d.text=P.txt;
 var can=true;try{can=!navigator.canShare||navigator.canShare(d)}catch(_){can=false}
 if(!can){toast(TR('Telefonul a refuzat trimiterea pozelor'));return nShMenu(P,bi)}
 nShSend(d,function(){if(bi+1<P.batches.length)nShMenu(P,bi+1)},function(){nShMenu(P,bi)})}
function nShMenu(P,bi){var o=[{t:TR('📤 Trimite pozele ')+nShRange(P,bi)+TR(' din ')+P.files.length+(bi===0&&P.txt?TR(' + text'):''),f:function(){nShBatch(P,bi)}}];
 if(P.txt)o.push({t:TR('Doar text'),f:function(){nShSend({text:P.txt},null,function(){nCopySync(P.txt)})}});
 nShSheet(P.files.length>SH_MAXN&&bi===0?TR('Notița are ')+P.files.length+TR(' poze — le trimit pe rând, câte ')+SH_MAXN+'.':TR('Trimite notița'),o)}
function nShareNow(P){var txt=P.txt;if(!P.ready){if(txt&&navigator.share){nShSend({text:txt},null,function(){nCopySync(txt)});return}toast(TR('Pregătesc pozele…'));return}
 if(!txt&&!P.files.length){toast(TR('Notița e goală'));return}
 if(!navigator.share){if(txt)nCopySync(txt);else toast(TR('Telefonul nu poate trimite'));return}
 if(!P.files.length){nShSend({text:txt},null,function(){nCopySync(txt)});return}
 if(P.batches.length===1)return nShBatch(P,0);
 nShMenu(P,0)}
function nShareAsk(P){nShMenu(P,0)}
function nShare(id){var n=findN(id);if(!n)return;
 if(n.lock&&!n._key){pinShow({bio:'n:'+n.id,title:TR('Introdu PIN-ul'),done:function(pin){return lkTry(n,pin).then(function(r){if(!r)return TR('PIN greșit');var o={id:n.id,_key:r.k,isort:n.isort,createdAt:n.createdAt,ts:n.ts};lkApply(o,r.o);var P=nSharePrep(o);P.p.then(function(){setTimeout(function(){if(P.files.length)nShMenu(P,0);else if(P.txt)nShSheet(TR('Trimite notița'),[{t:'📤 Trimite',f:function(){nShSend({text:P.txt},null,function(){nCopySync(P.txt)})}}]);else toast(TR('Notița e goală'))},0)});return true})}});return}
 var P=nShP&&nShP.id===id?nShP:null;if(!P||P.txt!==nShareText(n))P=nSharePrep(n);nShareNow(P)}
function lkOpen(id){var n=findN(id);if(!n||!n.lock)return;pinShow({bio:'n:'+id,title:TR('Introdu PIN-ul'),done:function(pin){return lkTry(n,pin).then(function(r){if(!r)return TR('PIN greșit');lkApply(n,r.o);n._key=r.k;setTimeout(function(){fullOpen(id)},0);return true})}})}
function lkUnlock(id){var n=findN(id);if(!n||!n.lock)return;pinShow({bio:'n:'+id,title:TR('Introdu PIN-ul'),done:function(pin){return lkTry(n,pin).then(function(r){if(!r)return TR('PIN greșit');phUnlockAll(n.id,r.k).catch(function(e){console.warn(e)});lkApply(n,r.o);delete n.lock;delete n._key;delete n.ltitle;nHistReset();saveNotes();renderNotes();bioRm('n:'+n.id);toast(TR('Notiță deblocată'));return true})}})}
/* v54: checklist notes */
function chkSync(n){n.text=[(n.title||'').trim()].concat((n.items||[]).map(function(x){return x.text.trim()})).filter(Boolean).join('\n')}
function ciNew(done){var now=new Date().toISOString();return{id:ntUid(),text:'',done:!!done,createdAt:now,updatedAt:now}}
function ciSort(n,list){var m=n.isort||'alpha',base=n.createdAt||n.ts||'';list=list.slice();var idx={};(n.items||[]).forEach(function(x,i){idx[x.id]=i});
 function ca(x){return x.createdAt||base}function ua(x){return x.updatedAt||x.createdAt||base}
 return list.sort(function(a,b){var ea=!a.text.trim(),eb=!b.text.trim();if(ea!==eb)return ea?1:-1;
  var r=0;if(m==='alpha')r=a.text.trim().localeCompare(b.text.trim(),'ro',{sensitivity:'base'});else if(m==='created')r=String(ca(b)).localeCompare(String(ca(a)));else if(m==='updated')r=String(ua(b)).localeCompare(String(ua(a)));
  return r||idx[a.id]-idx[b.id]})}
function chkOrder(n){var a=n.items||[];return ciSort(n,a.filter(function(x){return !x.done})).concat(ciSort(n,a.filter(function(x){return x.done})))}
function chkTouch(n){n.updatedAt=n.editedAt=new Date().toISOString();chkSync(n);nSaveSoon()}
function chkNote(){return fullId&&findN(fullId)}
function chkRow(x){return '<div class="ci'+(x.done?' done':'')+'" data-id="'+x.id+'"><input type="checkbox"'+(x.done?' checked':'')+' aria-label="Bifează"><textarea class="cit" enterkeyhint="next" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-form-type="other" rows="1" wrap="off">'+esc(x.text)+'</textarea><button type="button" class="cix" aria-label="Șterge rândul">×</button></div>'}
function chkRender(focusId,atEnd){var n=chkNote();if(!n)return;$('nfTitle').value=n.title||'';var a=n.items||[],un=ciSort(n,a.filter(function(x){return !x.done})),dn=ciSort(n,a.filter(function(x){return x.done}));if(!focusId){var ae=document.activeElement,ar=ae&&ae.closest&&ae.closest('#nfItems .ci');if(ar&&ae.classList.contains('cit')){focusId=ar.dataset.id;atEnd=true}}
 $('nfItems').innerHTML=un.map(chkRow).join('')+'<button type="button" class="ciadd" aria-label="Adaugă element"></button>'+(dn.length?'<div class="cisep"></div>'+dn.map(chkRow).join(''):'');
 if(focusId){var el=document.querySelector('#nfItems .ci[data-id="'+focusId+'"] .cit');if(el){el.focus();var L=atEnd?el.value.length:0;try{el.setSelectionRange(L,L)}catch(_){}}}}
function chkNew(){if(draftId)draftFinish();var now=new Date().toISOString(),it=ciNew(false);
 var n={id:ntUid(),type:'check',title:'',items:[it],text:'',ts:now,createdAt:now,updatedAt:now,tab:noteTab,fd:nFolder||undefined};notes.push(n);fullId=n.id;fullIsNew=true;
 $('nfText').value='';$('noteFull').classList.remove('mix');ncApply(null);$('nfAlarm').classList.remove('on');$('noteFull').classList.add('show','chk');setTimeout(function(){window.nfReadFit&&nfReadFit()},0);document.documentElement.classList.add('jv-nfull');try{history.pushState({jvNote:1},'')}catch(_){}chkRender();setTimeout(function(){try{$('nfTitle').focus()}catch(_){}},60)}
$('nChkNew').addEventListener('click',chkNew);
$('nfTitle').addEventListener('input',function(){var n=chkNote();if(!n)return;n.title=this.value;chkTouch(n)});
$('nfTitle').addEventListener('keydown',function(e){if(e.key!=='Enter')return;e.preventDefault();var n=chkNote();if(!n)return;var f=chkOrder(n)[0];if(!f){f=ciNew(false);n.items.push(f);chkRender()}chkRender(f.id,true)});
function chkItem(el){var n=chkNote(),row=el.closest('.ci');if(!n||!row)return{};for(var i=0;i<n.items.length;i++)if(n.items[i].id===row.dataset.id)return{n:n,x:n.items[i],i:i};return{n:n}}
$('nfItems').addEventListener('input',function(e){if(!e.target.classList.contains('cit'))return;var r=chkItem(e.target);if(!r.x)return;r.x.text=e.target.value;r.x.updatedAt=new Date().toISOString();chkTouch(r.n)});
$('nfItems').addEventListener('focusout',function(e){if(!e.target.classList.contains('cit'))return;clearTimeout(chkResortT);chkResortT=setTimeout(function(){var ae=document.activeElement;if(imeOn||(ae&&ae.closest&&ae.closest('#nfItems')&&ae.classList.contains('cit')))return;if($('noteFull').classList.contains('chk'))chkRender()},250)});
var chkResortT=null;
$('nfItems').addEventListener('change',function(e){if(e.target.type!=='checkbox')return;var r=chkItem(e.target);if(!r.x)return;chkPre(r.n);r.x.done=e.target.checked;chkTouch(r.n);nFlush();chkRender()});
function chkPre(n){if(nSaveT){clearTimeout(nSaveT);nSaveT=null}chkSync(n);saveNotes()}
function chkAdd(){var n=chkNote();if(!n)return;chkPre(n);n.items=n.items||[];var un=n.items.filter(function(x){return !x.done}),last=un[un.length-1];
 var emp=un.filter(function(x){return !x.text.trim()})[0];if(emp){chkRender(emp.id,true);return}var it=ciNew(false),at=last?n.items.indexOf(last)+1:0;n.items.splice(at,0,it);chkTouch(n);nFlush();chkRender(it.id)}
$('nfChk').addEventListener('click',function(e){if(e.target.closest('.ciadd')){e.preventDefault();chkAdd();return}if(e.target===this||e.target.id==='nfItems')chkAdd()});
$('noteFull').addEventListener('click',function(e){if($('noteFull').classList.contains('chk')&&e.target.classList&&e.target.classList.contains('nfcard'))chkAdd()});
$('nfItems').addEventListener('click',function(e){if(!e.target.classList.contains('cix'))return;var r=chkItem(e.target);if(!r.x)return;chkPre(r.n);r.n.items.splice(r.i,1);chkTouch(r.n);nFlush();chkRender()});
function chkEnter(el,rest){var r=chkItem(el);if(!r.x)return;chkPre(r.n);var it=ciNew(r.x.done);if(rest){it.text=rest}r.n.items.splice(r.i+1,0,it);chkTouch(r.n);nFlush();chkRender(it.id,!!rest)}
function chkBack(el){var r=chkItem(el);if(!r.x)return;chkPre(r.n);var ord=chkOrder(r.n),k=ord.indexOf(r.x),prev=ord[k-1];r.n.items.splice(r.i,1);chkTouch(r.n);nFlush();chkRender(prev&&prev.id,true);if(!prev)try{$('nfTitle').focus()}catch(_){}}
/* v54: per-tab sort */
$('nfSort').addEventListener('click',function(){var n=chkNote();if(!n)return;var b=this,cur=n.isort||'alpha',h='';if(n.type==='check'||n.type==='mix'){h='<div class="lph">Sortare</div>';[['alpha',TR('Alfabetic')],['manual',TR('Manual')],['created',TR('Data creării')],['updated',TR('Data modificării')]].forEach(function(k){h+='<button data-isrt="'+k[0]+'"'+(k[0]===cur?' class="cur"':'')+'>'+k[1]+(k[0]===cur?' ✓':'')+'</button>'})}
 /* v50: trash also from inside a note */var nt0=nTrashed().length;if(!n.del)h+='<button data-a="fdel" class="dng">🗑 Mută notița în coș</button>';
 lpCur={li:b,sortMenu:true};$('lpBox').innerHTML=h;$('lpMenu').classList.add('show');lpPos();var bx=$('lpBox'),r=b.getBoundingClientRect();bx.style.left=Math.max(12,r.right-bx.offsetWidth)+'px'});
var NT_SORTS=[['alpha',TR('Alfabetic')],['manual',TR('Manual')],['created',TR('Data creării')],['updated',TR('Data modificării')]];
$('nFdNew').addEventListener('click',function(){fdNew(noteTab,nFolder)});$('nSort').addEventListener('click',function(){var b=this,cur=ntSortOf(),h='<div class="lph">Sortare</div>';NT_SORTS.forEach(function(k){h+='<button data-srt="'+k[0]+'"'+(k[0]===cur?' class="cur"':'')+'>'+k[1]+(k[0]===cur?' ✓':'')+'</button>'});var nt=nTrashed().length;h='<button data-a="trash" class="trmi trtop">🗑 '+TR('Coș de gunoi')+' ('+nt+')</button><button data-a="lbman" class="trmi">🏷 '+TR('Etichete')+'</button>'+h;
 lpCur={li:b,sortMenu:true};$('lpBox').innerHTML=h;$('lpMenu').classList.add('show');lpPos();var bx=$('lpBox'),r=b.getBoundingClientRect();bx.style.left=Math.max(12,r.right-bx.offsetWidth)+'px'});
/* v53: note drag & drop (armed from the long-press menu) */
var ndrag=null,ndragT=0;
function ndArm(li){li=document.querySelector('#notesList .note[data-id="'+li.dataset.id+'"]')||li;ndrag={li:li,id:li.dataset.id,on:false,pid:null,y:0,raf:0};li.classList.add('ndrag');try{if(navigator.vibrate)navigator.vibrate(15)}catch(_){}toast(TR('Trage notița unde vrei'))}
function ndEnd(save){var d=ndrag;if(!d)return;ndrag=null;ndragT=Date.now();cancelAnimationFrame(d.raf);d.li.classList.remove('ndrag','ndon');
 if(save){var ids=[].map.call($('notesList').querySelectorAll('.note'),function(x){return x.dataset.id}),slots=[];
  notes.forEach(function(n,i){if(ids.indexOf(n.id)>=0)slots.push(i)});var sorted=ids.map(findN).filter(Boolean);
  if(sorted.length===slots.length){slots.forEach(function(si,k){notes[si]=sorted[k]});saveNotes()}lpJust=true}
 renderNotes()}
function ndPlace(y){var d=ndrag,ul=$('notesList'),items=[].filter.call(ul.querySelectorAll('.note'),function(x){return x!==d.li&&!!(findN(x.dataset.id)||{}).pin===!!(findN(d.id)||{}).pin});
 var before=null;for(var i=0;i<items.length;i++){var r=items[i].getBoundingClientRect();if(y<r.top+r.height/2){before=items[i];break}}
 if(!before&&items.length){var la=items[items.length-1];before=la.nextSibling;if(before===d.li)before=d.li.nextSibling}if(before){if(d.li.nextSibling!==before&&before!==d.li)ul.insertBefore(d.li,before)}else if(ul.lastElementChild!==d.li)ul.appendChild(d.li)}
function ndTick(){var d=ndrag;if(!d||!d.on)return;var pg=$('notesPg'),h=window.innerHeight,v=0;if(d.y<90)v=-Math.ceil((90-d.y)/6);else if(d.y>h-90)v=Math.ceil((d.y-(h-90))/6);
 if(v){var t0=pg.scrollTop;pg.scrollTop+=v;if(pg.scrollTop!==t0)ndPlace(d.y)}d.raf=requestAnimationFrame(ndTick)}
document.addEventListener('pointerdown',function(e){var d=ndrag;if(!d)return;var li=e.target.closest&&e.target.closest('.note');
 if(li!==d.li){e.preventDefault();e.stopPropagation();ndEnd(false);return}
 e.preventDefault();d.on=true;d.pid=e.pointerId;d.y=e.clientY;d.li.classList.add('ndon');try{d.li.setPointerCapture&&d.li.setPointerCapture(e.pointerId)}catch(_){}d.raf=requestAnimationFrame(ndTick)},true);
document.addEventListener('pointermove',function(e){var d=ndrag;if(!d||!d.on||e.pointerId!==d.pid)return;e.preventDefault();d.y=e.clientY;ndPlace(e.clientY)},{capture:true,passive:false});
document.addEventListener('pointerup',function(e){var d=ndrag;if(!d||!d.on||e.pointerId!==d.pid)return;ndEnd(true)},true);
document.addEventListener('pointercancel',function(e){var d=ndrag;if(d&&d.on&&e.pointerId===d.pid)ndEnd(true)},true);
document.addEventListener('touchmove',function(e){if(ndrag&&ndrag.on&&e.cancelable)e.preventDefault()},{passive:false});
document.addEventListener('click',function(e){if(Date.now()-ndragT<400&&e.target.closest&&e.target.closest('#notesPg')){e.stopPropagation();e.preventDefault()}},true);
/* read-aloud word bar over editor fields: mirror overlays, inputs untouched (read-only while reading) */
var nrMir=[],nrBusy=false;window.__nr={read:function(){noteRead()},stop:function(){stopSpeaking()},seg:function(){return activeSeg}};
function nrClear(){nrMir.forEach(function(m){if(m.d&&m.own&&m.d.parentNode)m.d.parentNode.removeChild(m.d);if(m.bar&&m.bar.parentNode)m.bar.parentNode.removeChild(m.bar);if(m.host)m.host.classList.remove('nrHost');m.ta.readOnly=m.ro});nrMir=[];
 if(window.nrViewOn){window.nrViewOn=false;try{window.nvSync&&nvSync()}catch(_){}}}
/* v140: read-aloud highlight WITHOUT duplicated text: only an empty bar under the current word.
   Main note text: measured on the rendered view (#nfView) with Range rects. Other fields: measured once with a throw-away clone (removed synchronously). */
function nrFake(host,bar,rectFn){var o={classList:{toggle:function(){},remove:function(){},add:function(){}},_r:null};
 function R(){var q=rectFn();return q}
 Object.defineProperty(o,'offsetLeft',{get:function(){return R().l}});Object.defineProperty(o,'offsetTop',{get:function(){return R().t}});
 Object.defineProperty(o,'offsetWidth',{get:function(){return R().w}});Object.defineProperty(o,'offsetHeight',{get:function(){return R().h}});
 o.getBoundingClientRect=function(){var q=R(),hr=host.getBoundingClientRect();return {left:hr.left+q.l,top:hr.top+q.t,right:hr.left+q.l+q.w,bottom:hr.top+q.t+q.h,width:q.w,height:q.h}};
 o.scrollIntoView=function(op){try{bar.scrollIntoView(op)}catch(_){}};return o}
function nrMirror(ta){if(!ta||!ta.offsetParent&&ta.id!=='nfText')return null;for(var q=0;q<nrMir.length;q++)if(nrMir[q].ta===ta)return nrMir[q];
 var v=ta.value,re=/\S+/g,m,ws=[];while((m=re.exec(v)))ws.push({s:m.index,e:m.index+m[0].length});
 var bar=document.createElement('span');bar.className='kbar';bar.setAttribute('aria-hidden','true');var o;
 if(ta.id==='nfText'&&window.nvSync){window.nrViewOn=true;try{nvSync()}catch(_){}var vw=$('nfView');
  if($('noteFull').classList.contains('nview')&&vw.textContent===v){vw.classList.add('nrHost');vw.appendChild(bar);
   function pos(off){var tw=document.createTreeWalker(vw,NodeFilter.SHOW_TEXT),n,a=0;while((n=tw.nextNode())){var L=n.nodeValue.length;if(off<=a+L)return [n,off-a];a+=L}return null}
   ws.forEach(function(w){var cache=null,key='';w.span=nrFake(vw,bar,function(){var hr=vw.getBoundingClientRect(),k=hr.left+','+hr.top+','+vw.offsetWidth;if(cache&&key===k)return cache;
     var A=pos(w.s),B=pos(w.e),rg=document.createRange();try{rg.setStart(A[0],A[1]);rg.setEnd(B[0],B[1])}catch(_){return {l:0,t:0,w:0,h:0}}
     var rs=[].filter.call(rg.getClientRects(),function(x){return x.width>0}),r=rs[0]||rg.getBoundingClientRect();key=k;cache={l:r.left-hr.left-vw.clientLeft,t:r.top-hr.top-vw.clientTop,w:r.width,h:r.height};return cache})});
   o={ta:ta,d:vw,host:vw,ws:ws,bar:bar,ro:ta.readOnly,own:false};ta.readOnly=true;nrMir.push(o);return o}
  window.nrViewOn=false;try{nvSync()}catch(_){}if(!ta.offsetParent)return null}
 var cs=getComputedStyle(ta),d=document.createElement('div'),op=ta.offsetParent;d.className='nrMir';d.setAttribute('data-fz','1');d.setAttribute('aria-hidden','true');
 var r=ta.getBoundingClientRect(),pr=op.getBoundingClientRect();
 d.style.left=(r.left-pr.left-op.clientLeft+op.scrollLeft)+'px';d.style.top=(r.top-pr.top-op.clientTop+op.scrollTop)+'px';d.style.width=r.width+'px';d.style.height=r.height+'px';d.style.overflow='hidden';d.style.borderWidth='0';
 /* throw-away measuring clone: same metrics as the field, never painted (removed in the same task) */
 var c=document.createElement('div');c.setAttribute('data-fz','1');
 ['fontFamily','fontSize','fontWeight','fontStyle','letterSpacing','lineHeight','whiteSpace','wordSpacing','overflowWrap','wordBreak','textAlign','tabSize','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','boxSizing','textTransform','textIndent','direction'].forEach(function(k){c.style[k]=cs[k]});
 if(cs.whiteSpace==='normal')c.style.whiteSpace='pre-wrap';c.style.position='absolute';c.style.visibility='hidden';c.style.left='0';c.style.top='0';c.style.width=ta.clientWidth+'px';c.style.borderStyle='solid';c.style.borderColor='transparent';
 c.textContent=v+'\u200b';op.appendChild(c);var tn=c.firstChild,cr=c.getBoundingClientRect(),st=ta.scrollTop,bl=parseFloat(cs.borderLeftWidth)||0,bt=parseFloat(cs.borderTopWidth)||0;
 ws.forEach(function(w){var rg=document.createRange(),q={l:0,t:0,w:0,h:0};try{rg.setStart(tn,w.s);rg.setEnd(tn,w.e);var rs=[].filter.call(rg.getClientRects(),function(x){return x.width>0}),x=rs[0]||rg.getBoundingClientRect();q={l:x.left-cr.left,t:x.top-cr.top-st,w:x.width,h:x.height}}catch(_){}
  w.span=nrFake(d,bar,function(){return q})});
 op.removeChild(c);d.appendChild(bar);op.appendChild(d);
 o={ta:ta,d:d,ws:ws,bar:bar,ro:ta.readOnly,own:true};ta.readOnly=true;nrMir.push(o);return o}
/* seg for one line of a field: spoken text = trimmed line (+extra), words mapped onto the mirror's spans */
function nrSeg(ta,ls,le,extra){var v=ta?ta.value:'',line=v.slice(ls,le),tr=line.trim();if(!tr)return null;var seg=prepSeg(null,tr+(extra||''));var mo=nrMirror(ta);
 if(mo){var lw=mo.ws.filter(function(w){return w.s>=ls&&w.e<=le});seg.el=mo.d;seg.bar=mo.bar;seg.words.forEach(function(w,k){if(lw[k])w.span=lw[k].span})}return seg}
function nrField(ta,text,out,extra){if(!ta||ta.value!==text){text.split('\n').forEach(function(l){if(l.trim())out.push(prepSeg(null,l.trim()+(extra||'')))});return}
 var a=0;text.split('\n').forEach(function(l){var sg=nrSeg(ta,a,a+l.length,extra);if(sg)out.push(sg);a+=l.length+1})}
function noteRead(){if(speaking&&speakKey==='note'){stopSpeaking();return}nrClear();var cn=fullId&&findN(fullId),sg=[];
 try{var ae=document.activeElement;if(ae&&ae.blur&&$('noteFull').contains(ae))ae.blur()}catch(_){}
 var Q=function(sel){return document.querySelector('#noteFull '+sel)};
 if(cn&&cn.type==='mix'){(cn.blocks||[]).forEach(function(b){if(b.t==='text')nrField(Q('.nbw[data-b="'+b.id+'"] .nbt'),b.v||'',sg);else if(b.t==='chk')mOrder(cn,b).forEach(function(x){if(x.text.trim())nrField(Q('[data-b="'+b.id+'"] .ci[data-id="'+x.id+'"] .cit'),x.text,sg,x.done?TR(', bifat'):'')})})}
 else if(cn&&cn.type==='check'){if((cn.title||'').trim())nrField($('nfTitle'),cn.title,sg);chkOrder(cn).forEach(function(x){if(x.text.trim())nrField(Q('#nfChk .ci[data-id="'+x.id+'"] .cit'),x.text,sg,x.done?TR(', bifat'):'')})}
 else nrField($('nfText'),$('nfText').value,sg);
 if(!sg.length){nrClear();toast(TR('Notița e goală'));return}try{ldMark(sg)}catch(_){}
 var fv=nrLang&&TTS.voice(nrLang);if(fv&&(!vAvail(fv)||!vOn(fv.id))){nrLang=null;fv=null}
 if(fv){sg.forEach(function(x){x.lang=fv.lang});vForce=fv.id}
 try{if(!vHinted&&cfg.engine!=='browser'&&ttsGroupsL(sg).some(function(g){return !g.v})){vHinted=true;setTimeout(function(){toast(TR('Descarcă vocea din Setări → Voce pentru o voce mai bună'))},400)}}catch(_){}
 nrBusy=true;try{return speak(sg,'note')}finally{nrBusy=false;vForce=null}}
window.__nr2={get lang(){return nrLang},set lang(x){nrLang=x},menu:function(){nrLMOpen()}};
function nrCode(){var v=nrLang&&TTS.voice(nrLang);return v?String(v.lang).toUpperCase():''}
function nrLMClose(){var m=$('nrLM');if(m)m.remove();document.removeEventListener('pointerdown',nrLMOut,true)}
function nrLMOut(ev){var m=$('nrLM');if(m&&!m.contains(ev.target)){ev.stopPropagation();nrLMClose()}}
function nrLMOpen(){nrLMClose();var b=$('nfRead');if(!b)return;var m=document.createElement('div');m.id='nrLM';m.className='card';m.setAttribute('role','menu');
 var h='<button type="button" class="nrli'+(nrLang?'':' on')+'" data-v="">'+esc(TR('Automat'))+'</button>';
 var vm=vMenuL();if(!vm.length)h='';vm.forEach(function(v){h+='<button type="button" class="nrli'+(nrLang===v.id?' on':'')+'" data-v="'+v.id+'">'+esc(vlName(v))+'</button>'});
 if(typeof qrCan==='function'&&qrCan())h+=(h?'<hr class="nrsep">':'')+'<button type="button" class="nrrc'+(QR?' on':'')+'" role="menuitem">'+qrMH()+'</button>';if(!h)return;
 m.innerHTML=h;document.body.appendChild(m);var r=b.getBoundingClientRect(),mr=m.getBoundingClientRect();
 m.style.left=Math.max(8,Math.min(innerWidth-mr.width-8,r.right-mr.width))+'px';m.style.top=Math.max(8,r.top-mr.height-6)+'px';
 setTimeout(function(){document.addEventListener('pointerdown',nrLMOut,true)},0)}
document.addEventListener('click',function(ev){var t=ev.target.closest&&ev.target.closest('#nrLM .nrli');if(!t)return;var id=t.getAttribute('data-v')||null;nrLang=id;nrLMClose();if(speaking&&speakKey==='note')stopSpeaking();noteRead()});
(function(){var b=$('nfRead'),T=0,sx=0,sy=0,fired=false;if(!b)return;
 b.addEventListener('pointerdown',function(e){fired=false;sx=e.clientX;sy=e.clientY;clearTimeout(T);T=setTimeout(function(){fired=true;try{navigator.vibrate&&navigator.vibrate(20)}catch(_){}nrLMOpen()},450)});
 b.addEventListener('pointermove',function(e){if(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10)clearTimeout(T)});
 ['pointerup','pointercancel','pointerleave'].forEach(function(k){b.addEventListener(k,function(){clearTimeout(T)})});
 b.addEventListener('contextmenu',function(e){e.preventDefault()});
 b.addEventListener('click',function(e){if(fired){fired=false;e.preventDefault();e.stopImmediatePropagation()}},true)})();
$('nfRead').addEventListener('click',function(e){e.preventDefault();noteRead()});
function fullClose(fromPop){try{if(dict.on)dictStop()}catch(_){}if(typeof auStop==='function')auStop();if(!$('noteFull').classList.contains('show'))return;if($('noteFull').classList.contains('nro')){$('noteFull').classList.remove('nro');var rn=fullId&&findN(fullId);if(rn&&rn.del){if(rn.lock&&rn._key){lkStrip(rn)}fullId=null;phGen++;phClear();phCacheClear();phViewClose(false);$('noteFull').classList.remove('show','mix','chk');ncApply(null);document.documentElement.classList.remove('jv-nfull');renderNotes();if(!fromPop&&history.state&&history.state.jvNote)try{nIgnorePop=true;history.back()}catch(_){nIgnorePop=false}return}}nHlClear();var cq=fullId&&findN(fullId);if(cq&&cq.type==='mix')mClean(cq);if(cq&&cq.type==='check'&&cq.items){cq.items=cq.items.filter(function(x){return x.text.trim()});chkSync(cq)}if(speaking&&speakKey==='note')stopSpeaking();fullFlush();if(fullIsNew){var nn=findN(fullId);if(nn){nInsertAlpha(nn);nFlush()}fullIsNew=false}var ln=fullId&&findN(fullId);if(ln&&ln.lock&&ln._key){var kk=ln._key;lkReseal(ln).then(function(){lkStrip(ln)});lkStrip(ln)}fullId=null;phGen++;phClear();phCacheClear();phViewClose(false);$('noteFull').classList.remove('show','mix');ncApply(null);document.documentElement.classList.remove('jv-nfull');try{$('nfText').blur()}catch(_){}renderNotes();
 if(!fromPop&&history.state&&history.state.jvNote)try{nIgnorePop=true;history.back()}catch(_){nIgnorePop=false}}
var nIgnorePop=false;
$('nfText').addEventListener('input',fullInput);$('nfText').addEventListener('blur',fullFlush);
$('nfBack').addEventListener('click',function(){fullClose()});
$('nfDone').addEventListener('click',function(){try{var ae=document.activeElement;if(ae&&ae.blur)ae.blur()}catch(_){}fullClose()});
/* v38: keep the editor toolbar + ✔ directly above the on-screen keyboard (visualViewport), whether or not the layout viewport resizes */
(function(){var vv=window.visualViewport,b=$('nfDone'),nf=$('noteFull');if(!vv||!b||!nf)return;var last=-1,raf=0,until=0;
 function f(){var k=Math.max(0,Math.round(innerHeight-vv.height-vv.offsetTop));if(k===last)return;last=k;
  if(k>60){nf.style.setProperty('--kbo',k+'px');b.style.setProperty('--kbo',k+'px');nf.classList.add('kb');b.classList.add('kb')}
  else{nf.classList.remove('kb');b.classList.remove('kb');nf.style.removeProperty('--kbo');b.style.removeProperty('--kbo')}}
 function loop(){f();if(performance.now()<until)raf=requestAnimationFrame(loop);else raf=0}
 function burst(ms){until=Math.max(until,performance.now()+(ms||700));if(!raf)raf=requestAnimationFrame(loop)}
 vv.addEventListener('resize',function(){f();burst(400)});vv.addEventListener('scroll',f);addEventListener('resize',function(){f();burst(400)});addEventListener('orientationchange',function(){burst(1200)});
 nf.addEventListener('focusin',function(){burst(900)});nf.addEventListener('focusout',function(){burst(900)});nf.addEventListener('input',f);f();
 /* buttons that don't need a picker keep the keyboard open */
 ['nfUndo','nfRedo','nfChkIns','nfRead'].forEach(function(id){var e=$(id);if(!e)return;function keep(ev){var a=document.activeElement;if(a&&a!==document.body&&nf.contains(a)&&/^(TEXTAREA|INPUT)$/.test(a.tagName))ev.preventDefault()}e.addEventListener('pointerdown',keep);e.addEventListener('mousedown',keep)})})();
function nFlushAll(){if(fullId)fullFlush();if(draftId){var n=findN(draftId);if(n)n.text=$('iNote').value}nFlush()}
document.addEventListener('visibilitychange',function(){if(document.hidden)nFlushAll()});
window.addEventListener('pagehide',nFlushAll);window.addEventListener('beforeunload',nFlushAll);
$('notesList').addEventListener('click',function(e){if(e.target.closest('#trX')){nTrashOpen(false);return}if(e.target.closest('#trEmpty')){nTrashEmpty();return}if(lpJust)return;if(e.target.closest('#tlkGo')){tbOpenLocked(noteTab);return}var fg=e.target.closest('[data-fgo]');if(fg){fdGo(fg.dataset.fgo);return}var fo=e.target.closest('.nfo');if(fo){if(selOn()){if(!nTrash&&!(findF(fo.dataset.fid)||{}).del)selToggle('F:'+fo.dataset.fid);return}if(nTrash||(findF(fo.dataset.fid)||{}).del)fdMenu(fo);else fdEnter(fo.dataset.fid);return}var li=e.target.closest('.note');if(li&&selOn()){selToggle(li.dataset.id);return}if(li){if(li.classList.contains('nswp')){li.classList.remove('nswp');return}if(!nQ&&!li.classList.contains('npeek')&&nPeekCan(li)){nPeekOff(li);li.classList.add('npeek');nPeekFit(li);return}if(li.classList.contains('npeek')){var pk=li.querySelector('.npk');if(pk&&pk.style.display!=='none'&&!e.target.closest('.npk')){li.classList.remove('npeek');return}}/* v192: expanded card — title row collapses, text lines open */li.classList.remove('npeek');nHlPend=nQ&&nQ.trim()?{id:li.dataset.id,q:nQ}:null;fullOpen(li.dataset.id)}});
/* v20: search matches in the editor — mirror overlays (inputs untouched), cyan bar under each match, jump to the first */
var nHlPend=null,nHlM=[];
function nHlClear(){nHlM.forEach(function(d){if(d._un)d._un();if(d.parentNode)d.parentNode.removeChild(d)});nHlM=[]}
function nHlFold(v){var f='',map=[];for(var i=0;i<v.length;i++){var c=nFold(v[i]);for(var k=0;k<c.length;k++){f+=c[k];map.push(i)}}return{f:f,map:map}}
function nHlField(ta,qs){if(!ta||!ta.offsetParent||!ta.value)return null;var v=ta.value,F=nHlFold(v),R=[];
 qs.forEach(function(w){var i=0;while((i=F.f.indexOf(w,i))>=0){R.push([F.map[i],F.map[i+w.length-1]+1]);i+=w.length}});if(!R.length)return null;
 R.sort(function(a,b){return a[0]-b[0]});var M=[];R.forEach(function(r){var l=M[M.length-1];if(l&&r[0]<=l[1])l[1]=Math.max(l[1],r[1]);else M.push(r.slice())});
 var cs=getComputedStyle(ta),d=document.createElement('div'),op=ta.offsetParent;d.className='nrMir nhlMir';
 ['fontFamily','fontSize','fontWeight','fontStyle','letterSpacing','lineHeight','whiteSpace','wordSpacing','overflowWrap','wordBreak','textAlign','tabSize','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','boxSizing','textTransform','textIndent'].forEach(function(k){d.style[k]=cs[k]});
 if(cs.whiteSpace==='normal')d.style.whiteSpace='pre-wrap';
 var r=ta.getBoundingClientRect(),pr=op.getBoundingClientRect();d.style.left=(r.left-pr.left-op.clientLeft+op.scrollLeft)+'px';d.style.top=(r.top-pr.top-op.clientTop+op.scrollTop)+'px';d.style.width=r.width+'px';d.style.height=r.height+'px';
 var h='',last=0;M.forEach(function(m){h+=esc(v.slice(last,m[0]))+'<span class="nhm">'+esc(v.slice(m[0],m[1]))+'</span>';last=m[1]});d.innerHTML=h+esc(v.slice(last))+'\u200b';op.appendChild(d);nHlM.push(d);d._ta=ta;if(ta.scrollHeight>ta.clientHeight+2){d.style.overflow='hidden';d.scrollTop=ta.scrollTop;var sy=function(){d.scrollTop=ta.scrollTop};ta.addEventListener('scroll',sy);d._un=function(){ta.removeEventListener('scroll',sy)}}var f1=d.querySelector('.nhm');if(f1)f1._d=d;return f1}
function nHlApply(q){nHlClear();var qs=nFold(q).trim().split(/\s+/).filter(Boolean);if(!qs.length)return;var n=fullId&&findN(fullId);if(!n)return;
 var fs=n.type==='mix'?[].slice.call(document.querySelectorAll('#nfBlocks .nbt,#nfBlocks .cit')):n.type==='check'?[$('nfTitle')].concat([].slice.call(document.querySelectorAll('#nfChk .cit'))):[$('nfText')];
 var first=null;fs.forEach(function(ta){var s1=nHlField(ta,qs);if(s1&&!first)first=s1});
 if(first){var d=first._d,ta=d._ta;if(d.style.overflow==='hidden'){ta.scrollTop=Math.max(0,first.offsetTop-ta.clientHeight/2);d.scrollTop=ta.scrollTop;var r=ta.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight-80)ta.scrollIntoView({block:'nearest'})}else first.scrollIntoView({block:'center'})}}
['input','keydown','focusin','click'].forEach(function(ev){$('noteFull').addEventListener(ev,function(){if(nHlM.length)nHlClear()},true)});
window.addEventListener('resize',function(){if(nHlM.length)nHlClear()});
$('noteTabs').addEventListener('click',function(e){var b=e.target.closest('.ntab');if(!b)return;if(draftId)draftFinish();
 if(b.classList.contains('nadd1')){jvPrompt(TR('Tab nou'),'',function(nm){var t={id:ntUid(),name:nm};noteTabs.push(t);noteTab=t.id;saveNotes();renderNotes()});return}
 if(nFolder||fdHist)fdGo('');noteTab=b.dataset.id;saveNotes();renderNotes()});
/* v22: horizontal swipe on the list switches tabs */
function ntChipShow(){var c=document.querySelector('#noteTabs .ntab.on');if(c)try{/* v162: horizontal only — scrollIntoView also scrolled the page up, undoing the Medicamente centre-on-today */var sc=c.parentElement;while(sc&&sc.scrollWidth<=sc.clientWidth+1)sc=sc.parentElement;if(sc&&sc!==document.body&&sc!==document.documentElement){var q=c.getBoundingClientRect(),w=sc.getBoundingClientRect();if(q.left<w.left)sc.scrollLeft-=w.left-q.left;else if(q.right>w.right)sc.scrollLeft+=q.right-w.right}}catch(_){}}
function ntGo(d){var VT=noteTabs.filter(function(t){return !t.off}),i=VT.findIndex(function(t){return t.id===noteTab}),j=i+d;if(i<0||j<0||j>=VT.length)return false;if(draftId)draftFinish();noteTab=VT[j].id;saveNotes();renderNotes();ntChipShow();
 var ul=$('notesList');ul.classList.remove('nsw-l','nsw-r');void ul.offsetWidth;ul.classList.add(d>0?'nsw-l':'nsw-r');setTimeout(function(){ul.classList.remove('nsw-l','nsw-r')},200);return true}
window.ntGo=ntGo;
/* v196: a swipe starting inside a horizontally scrollable area (Glicemie table etc.) scrolls it, never switches tabs */
function nHScr(t){for(var e=t;e&&e.nodeType===1&&e!==document.body;e=e.parentElement){if(e.id==='notesPg')return false;if(e.scrollWidth>e.clientWidth+2){var o=getComputedStyle(e).overflowX;if(o==='auto'||o==='scroll')return true}}return false}
window.nHScr=nHScr;
(function(){var pg=$('notesPg'),S=null;
 function blocked(t){return nHScr(t)||nQ||nTrash||pg.classList.contains('nsrch')||ndrag||$('noteFull').classList.contains('show')||document.querySelector('.modal.show')||$('lpMenu').classList.contains('show')||(t.closest&&t.closest('#noteTabs,input,textarea,select,.ntop,#shModal,#crop,#phView,.pwv'))||(window.pwSwOn&&pwSwOn(t))}
 pg.addEventListener('touchstart',function(e){S=null;if(e.touches.length!==1)return;var t=e.touches[0];if(t.clientX<24||t.clientX>innerWidth-24||blocked(e.target))return;S={x:t.clientX,y:t.clientY,t:Date.now(),li:e.target.closest&&e.target.closest('#notesList .note')}},{passive:true});
 pg.addEventListener('touchmove',function(e){if(!S)return;var t=e.touches[0];if(Math.abs(t.clientY-S.y)>40&&Math.abs(t.clientY-S.y)>Math.abs(t.clientX-S.x))S=null},{passive:true});
 pg.addEventListener('touchend',function(e){if(!S)return;var t=e.changedTouches[0],dx=t.clientX-S.x,dy=t.clientY-S.y,s0=S;S=null;if(Date.now()-s0.t>800||lpJust||ndrag)return;if(Math.abs(dx)>=40&&Math.abs(dx)>1.5*Math.abs(dy)&&s0.li&&s0.li.querySelector('.ndt')){var L0=s0.li,on=L0.classList.contains('nswp');if(dx<0&&!on){document.querySelectorAll('#notesList .note.nswp').forEach(function(x){x.classList.remove('nswp')});L0.style.setProperty('--ndw',(L0.querySelector('.ndt').offsetWidth+14)+'px');L0.classList.add('nswp');window.__nswpT=Date.now();return}if(dx>0&&on){L0.classList.remove('nswp');window.__nswpT=Date.now();return}}
 if(Math.abs(dx)>=60&&Math.abs(dx)>1.5*Math.abs(dy))ntGo(dx<0?1:-1)},{passive:true});
 pg.addEventListener('touchcancel',function(){S=null},{passive:true});
 setTimeout(ntChipShow,300)})();
function noteDel(id){var n=findN(id);if(!n)return;var cf=$('cfModal').querySelector('.cftxt'),t0=cf.textContent,ok=$('cfOk'),o0=ok.textContent;cf.textContent=TR('Mută notița în coș?');ok.textContent=TR('Mută în coș');var back=function(){cf.textContent=t0;ok.textContent=o0};
 jvConfirm(function(){back();saveNotes();n.del=new Date().toISOString();n.delTab=n.tab;nFlush();renderNotes();toast(TR('Mutată în coș'))});var no=$('cfNo').onclick;$('cfNo').onclick=function(){back();no&&no()}}
/* v45: multi-select of notes */
var selIds={};
function selOn(){return $('notesPg').classList.contains('selm')}
function selFds(){return Object.keys(selIds).filter(function(k){return k.indexOf('F:')===0}).map(function(k){return findF(k.slice(2))}).filter(function(f){return f&&!f.del})}
function selList(){return Object.keys(selIds).map(findN).filter(function(n){return n&&!n.del})}
function selToggle(id){var was=selOn();if(selIds[id])delete selIds[id];else selIds[id]=1;var k=Object.keys(selIds).length;
 if(!k){selExit();return}if(!was){$('notesPg').classList.add('selm');try{history.pushState({sel:1},'')}catch(_){}}selUpd()}
function selUpd(){var L=selList(),FL=selFds(),A=L.concat(FL);$('selN').textContent=A.length;$('selPin').classList.toggle('on',A.length>0&&A.every(function(n){return n.pin}));document.querySelectorAll('#notesList .nfo').forEach(function(li){li.classList.toggle('nsel',!!selIds['F:'+li.dataset.fid])});
 document.querySelectorAll('#notesList .note').forEach(function(li){li.classList.toggle('nsel',!!selIds[li.dataset.id])})}
function selExit(fromPop){var was=selOn();selIds={};$('notesPg').classList.remove('selm');selUpd();if(was&&!fromPop){nIgnorePop=true;try{history.back()}catch(_){nIgnorePop=false}}}
function selDone(msg){selExit();renderNotes();if(msg)toast(msg)}
function selSave(){var t=new Date().toISOString();selList().forEach(function(n){n.updatedAt=t});nFlush()}
$('selX').addEventListener('click',function(){selExit()});
$('nSelBar').addEventListener('click',function(e){var b=e.target.closest('[data-sa]');if(!b)return;var a=b.dataset.sa,L=selList(),FL=selFds(),A=L.concat(FL);
 if(a==='pin'&&A.length){var on=!A.every(function(n){return n.pin});saveNotes();A.forEach(function(n){if(on)n.pin=true;else delete n.pin});selSave();if(!L.length)saveNotes(true);selDone(on?(A.length>1?TR('Fixate sus'):TR('Fixată sus')):TR('Nu mai e fixată'));return}
 if(!L.length){selExit();return}
 if(a==='del'){var cf=$('cfModal').querySelector('.cftxt'),t0=cf.textContent,ok=$('cfOk'),o0=ok.textContent;cf.textContent=L.length>1?TR('Muți ')+L.length+TR(' notițe în coș?'):TR('Mută notița în coș?');ok.textContent=TR('Mută în coș');var back=function(){cf.textContent=t0;ok.textContent=o0};
  jvConfirm(function(){back();saveNotes();var t=new Date().toISOString();L.forEach(function(n){n.del=t;n.delTab=n.tab});nFlush();selDone(L.length>1?L.length+TR(' notițe mutate în coș'):TR('Mutată în coș'))});var no=$('cfNo').onclick;$('cfNo').onclick=function(){back();no&&no()};return}
 var h='';
 if(a==='col'){var cur=L.length===1?(L[0].color||''):null;h='<div class="lph">Culoare</div><div class="npal">';NC.forEach(function(k){h+='<button data-scl="'+k[0]+'" class="'+(cur===k[0]?'cur':'')+'" style="--nc:'+(ncT(k[0])||'#0a1d30')+'" aria-label="'+k[1]+'"><i'+(k[0]?'':' class="ncdef"')+'></i></button>'});h+='</div>'}
 else if(a==='mv'){var k0=L[0].tab+'|'+(L[0].fd||'');if(!L.every(function(n){return n.tab+'|'+(n.fd||'')===k0}))k0=null;h=fdTargets('data-stab',k0)+'<button type="button" data-snew="1" class="fnewb">＋ Folder nou aici</button>'}
 else if(a==='more'){var one=L.length===1,n0=L[0];if(one)h='<button data-sx="nal">⏰ Alarmă</button><button data-sx="ned">✎ Editează</button><button data-sx="nshr">📤 Trimite</button><button data-sx="ndrag">✥ Mută (drag &amp; drop)</button>'+(n0.lock?'<button data-sx="nunl">🔓 Deblochează</button>':'<button data-sx="nlock">🔒 Blochează</button>');
  h+='<button data-sx="lbl">🏷 '+TR('Etichete')+'</button><button data-sx="all">☑ Selectează tot</button>'}
 lpCur={li:b,sel:a};$('lpBox').innerHTML=h;$('lpMenu').classList.add('show');var bx=$('lpBox'),r=b.getBoundingClientRect();bx.style.left=Math.max(10,Math.min(window.innerWidth-bx.offsetWidth-10,r.right-bx.offsetWidth))+'px';bx.style.top=(r.bottom+6)+'px';bx.style.bottom='auto';bx.style.right='auto'});
function selPop(b){var L=selList();lpClose();if(!L.length)return;
 if(b.dataset.scl!=null){saveNotes();L.forEach(function(n){if(b.dataset.scl)n.color=b.dataset.scl;else delete n.color});selSave();selDone();return}
 if(b.dataset.stab!=null){var t=b.dataset.stab;saveNotes();L.forEach(function(n){fdPlace(n,t)});selSave();selDone((L.length>1?L.length+TR(' notițe mutate în '):TR('Mutată în '))+fdKeyName(t));return}
 if(b.dataset.snew){var LL=L;fdNew(noteTab,nFolder,function(f){LL.forEach(function(n){fdPlace(n,f.tab+'|'+f.id)});selSave();selDone((LL.length>1?LL.length+TR(' notițe mutate în '):TR('Mutată în '))+f.name)});return}
 var x=b.dataset.sx;if(!x)return;
 if(x==='all'){document.querySelectorAll('#notesList .note:not(.ndel)').forEach(function(li){selIds[li.dataset.id]=1});selUpd();return}
 if(x==='lbl'){var ids=L.map(function(n){return n.id});selExit();lbOpen(ids);return}
 var id=L[0].id;selExit();
 if(x==='nal')openAlarm({k:'n',id:id});else if(x==='nshr')nShare(id);else if(x==='nlock')lkLock(id);else if(x==='nunl')lkUnlock(id);
 else{var li=document.querySelector('#notesList .note[data-id="'+id+'"]');if(!li)return;if(x==='ned')noteEdit(li);else if(x==='ndrag'){if(ntSortOf()!=='manual'){var tM=findNT(noteTab);if(tM)delete tM.sort;saveNotes();renderNotes();toast(TR('Sortare')+': '+TR('Manual'));setTimeout(function(){var l3=document.querySelector('#notesList .note[data-id="'+id+'"]');if(l3)ndArm(l3)},700)}else ndArm(li)}}}
function nTrashed(){return notes.filter(function(n){return n.del})}
function nRestore(id){var n=findN(id);if(!n||!n.del)return;saveNotes();var t=n.delTab||n.tab;if(!findNT(t))t=(findNT('general')||noteTabs[0]).id;n.tab=t;if(n.fd&&(!fdAlive(n.fd)||(findF(n.fd)||{}).tab!==t))delete n.fd;delete n.del;delete n.delTab;nFlush();renderNotes();toast(TR('Refăcută în ')+findNT(t).name)}
function nPurge(id){jvConfirm(function(){notes=notes.filter(function(x){return x.id!==id});saveNotes();renderNotes();phGC();toast(TR('Ștearsă definitiv'))})}
function nTrashEmpty(){if(!nTrashed().length&&!fdTrashed().length)return;var cf=$('cfModal').querySelector('.cftxt'),t0=cf.textContent;cf.textContent=TR('Golești coșul? Notițele se șterg definitiv.');jvConfirm(function(){cf.textContent=t0;var fi=[];fdTrashed().forEach(function(f){fi=fi.concat(fdDesc(f.id))});fdPurgeIds(fi);notes=notes.filter(function(x){return !x.del});saveNotes();renderNotes();phGC();toast(TR('Coș golit'))});var no=$('cfNo').onclick;$('cfNo').onclick=function(){cf.textContent=t0;no&&no()}}
function nTrashOpen(on){nTrash=on;if(on&&nQ)nSearchClose();$('notesPg').classList.toggle('ntrash',on);renderNotes()}
function noteEdit(li){fullOpen(li.dataset.id)}
function ntRename(id){var t=findNT(id);if(!t)return;jvPrompt(TR('Redenumește tabul'),t.name,function(nm){t.name=nm;saveNotes();renderNotes()})}
function ntDelete(id){var t=findNT(id);if(!t)return;var cnt=notes.filter(function(n){return n.tab===id&&!n.del}).length;
 jvConfirm(function(){
 notes=notes.filter(function(n){return n.tab!==id||n.del});noteFolders=noteFolders.filter(function(f){return f.tab!==id});noteTabs=noteTabs.filter(function(x){return x.id!==id});if(!noteTabs.length)noteTabs=[{id:'general',name:TR('General')}];
 if(noteTab===id)noteTab=noteTabs[0].id;saveNotes();renderNotes();toast(TR('Tab șters'))})}
var TM=null,TMt=0;
function tmEl(){return TM&&$('noteTabs').querySelector('.ntab[data-id="'+(window.CSS&&CSS.escape?CSS.escape(TM.id):TM.id)+'"]')}
function tmArm(id){TM={id:id,pid:null,on:0};var b=tmEl();if(!b){TM=null;return}b.classList.add('tmv');$('noteTabs').classList.add('tmon');try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}toast(TR('Trage tabul unde vrei'))}
function tmEnd(save){var d=TM;if(!d)return;TM=null;TMt=Date.now();var box=$('noteTabs');box.classList.remove('tmon');var b=box.querySelector('.tmv');if(b)b.classList.remove('tmv');
 if(save){var ids=[].map.call(box.querySelectorAll('.ntab[data-id]'),function(x){return x.dataset.id});var VT=noteTabs.filter(function(t){return !t.off});if(ids.length===VT.length&&ids.join()!==VT.map(function(t){return t.id}).join()){ntApplyOrder(ids);saveNotes()}}renderNotes()}
function tmMove(x){var b=tmEl(),box=$('noteTabs');if(!b)return;var r0=box.getBoundingClientRect();if(x<r0.left+30)box.scrollLeft-=10;else if(x>r0.right-30)box.scrollLeft+=10;
 var ts=[].filter.call(box.querySelectorAll('.ntab[data-id]'),function(t){return t!==b});for(var i=0;i<ts.length;i++){var r=ts[i].getBoundingClientRect();if(x<r.left+r.width/2){if(b.nextSibling!==ts[i])box.insertBefore(b,ts[i]);return}}var add=box.querySelector('.nadd1');if(b.nextSibling!==add)box.insertBefore(b,add)}
window.addEventListener('pointerdown',function(e){if(!TM)return;var b=e.target.closest&&e.target.closest('.ntab.tmv');e.stopImmediatePropagation();if(!b){e.preventDefault();tmEnd(false);return}TM.on=1;TM.pid=e.pointerId;b.classList.add('tmdn')},true);
window.addEventListener('pointermove',function(e){if(!TM||!TM.on||e.pointerId!==TM.pid)return;e.preventDefault();e.stopImmediatePropagation();tmMove(e.clientX)},{capture:true,passive:false});
window.addEventListener('pointerup',function(e){if(TM&&TM.on&&e.pointerId===TM.pid){e.stopImmediatePropagation();tmEnd(true)}},true);
window.addEventListener('pointercancel',function(e){if(TM&&TM.on&&e.pointerId===TM.pid&&e.pointerType!=='touch')tmEnd(true)},true);
window.addEventListener('touchmove',function(e){if(!TM||!TM.on)return;if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();var p=e.touches[0];if(p)tmMove(p.clientX)},{capture:true,passive:false});
window.addEventListener('touchend',function(e){if(TM&&TM.on&&!e.touches.length)tmEnd(true)},true);
window.addEventListener('touchcancel',function(e){if(TM&&TM.on&&!e.touches.length)tmEnd(true)},true);
window.addEventListener('click',function(e){if(TM||Date.now()-TMt<400){e.stopImmediatePropagation();e.preventDefault()}},true);
window.addEventListener('contextmenu',function(e){if(TM)e.preventDefault()},true);
function ntShift(id,d){var i=noteTabs.findIndex(function(t){return t.id===id}),j=i+d;if(i<0||j<0||j>=noteTabs.length)return;var x=noteTabs[i];noteTabs[i]=noteTabs[j];noteTabs[j]=x;saveNotes();renderNotes()}
/* v52: folders inside tabs (nested), optional PIN gate; trash-restorable */
var FD_IC='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/></svg>',
 FD_LK='<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
function fdNames(id){return fdChain(id).map(function(f){return f.name})}
function fdKeyName(k){var p=String(k).split('|'),t=findNT(p[0]),f=p[1]&&findF(p[1]);return f?f.name:(t?t.name:'')}
function fdTargets(attr,cur,ex){var h='<div class="lph">Mută în</div>',X={};(ex||[]).forEach(function(x){X[x]=1});
 function btn(k,lbl,d){var on=k===cur;return '<button type="button" '+attr+'="'+esc(k)+'"'+(on?' class="cur"':'')+(d?' style="padding-left:'+(12+d*16)+'px"':'')+'>'+lbl+(on?' ✓':'')+'</button>'}
 noteTabs.forEach(function(t){h+=btn(t.id+'|',esc(t.name),0);(function rec(pid,d){fdKids(t.id,pid).forEach(function(f){if(X[f.id])return;h+=btn(t.id+'|'+f.id,'<span class="fmi">'+(f.lk?'🔒':'📁')+'</span> '+esc(f.name),d);rec(f.id,d+1)})})('',1)});return h}
function fdPlace(n,k){var p=String(k).split('|');if(!findNT(p[0]))return;var ch=n.tab!==p[0]||(n.fd||'')!==(p[1]||'');n.tab=p[0];if(p[1])n.fd=p[1];else delete n.fd;if(ch)nInsertAlpha(n)}
function fdRow(f,tr){var c=fdCount(f),k=fdKids(f.tab,f.id).length,meta=tr?TR('șters ')+nDateOf(f.del)+(c?' · '+c+TR(' notițe'):''):f.lk&&!fdOpen[f.id]?'':((k?k+' '+(k===1?TR('folder'):TR('foldere'))+' · ':'')+c);
 return '<li class="nfo'+(f.lk?' flk':'')+(tr?' ndel':'')+(selIds['F:'+f.id]?' nsel':'')+'" data-fid="'+esc(f.id)+'"><span class="fic">'+FD_IC+'</span><span class="t">'+esc(f.name)+(f.lk?' <i class="fil" aria-label="blocat">'+FD_LK+'</i>':'')+'</span><small class="nts">'+(f.pin&&!tr?'<span class="npin">📌</span> ':'')+meta+'</small>'+(tr?'':'<span class="fch" aria-hidden="true">›</span>')+'</li>'}
function fdCrumb(){var t=findNT(noteTab),c=fdChain(nFolder),up=c.length>1?c[c.length-2].id:'',h='<li class="fcrumb"><button type="button" class="fcb" data-fgo="'+esc(up)+'" aria-label="Înapoi">‹</button><span class="fcp"><button type="button" data-fgo="">'+esc(t?t.name:'')+'</button>';
 c.forEach(function(f,i){h+='<span class="fcs">›</span>'+(i===c.length-1?'<b>'+(f.lk?'🔒 ':'')+esc(f.name)+'</b>':'<button type="button" data-fgo="'+esc(f.id)+'">'+esc(f.name)+'</button>')});return h+'</span></li>'}
function fdHead(srch){if(srch)return '';if(nTrash){return fdTrashed().map(function(f){return fdRow(f,true)}).join('')}var h=nFolder?fdCrumb():'';fdRest='';fdPinN=0;fdKids(noteTab,nFolder).forEach(function(f){if(f.pin){fdPinN++;h+=fdRow(f)}else fdRest+=fdRow(f)});return h}
var fdRest='',fdPinN=0;
function fdTrashed(){return noteFolders.filter(function(f){return f.del&&!(f.parent&&fdChain(f.parent).some(function(x){return x.del}))}).sort(function(a,b){return String(b.del).localeCompare(String(a.del))})}
var fdHist=false;
function fdGo(id){id=id||'';var c=fdChain(id).map(function(f){return f.id});Object.keys(fdOpen).forEach(function(k){if(c.indexOf(k)<0)delete fdOpen[k]});nFolder=id;
 if(nFolder&&!fdHist){try{history.pushState({fd:1},'');fdHist=true}catch(_){}}else if(!nFolder&&fdHist){fdHist=false;nIgnorePop=true;try{history.back()}catch(_){nIgnorePop=false}}
 renderNotes();try{window.scrollTo(0,0)}catch(_){}}
function fdEnter(id){var f=findF(id);if(!f)return;if(f.lk&&!fdOpen[id]){fdPin(f,function(){fdOpen[id]=1;fdGo(id)});return}fdGo(id)}
function fdUp(){var c=fdChain(nFolder);fdGo(c.length>1?c[c.length-2].id:'')}
function fdNew(tab,pid,then){jvPrompt(pid?TR('Subfolder nou'):TR('Folder nou'),'',function(nm){nm=String(nm||'').trim();if(!nm)return;var f={id:'f'+ntUid(),tab:tab,parent:pid||'',name:nm.slice(0,40),ts:new Date().toISOString()};noteFolders.push(f);saveNotes();renderNotes();if(then)then(f);else toast(TR('Folder creat'))})}
function fdRename(f){jvPrompt(TR('Redenumește folderul'),f.name,function(nm){nm=String(nm||'').trim();if(!nm)return;f.name=nm.slice(0,40);saveNotes();renderNotes()})}
function fdMove(f,k){var p=String(k).split('|');if(!findNT(p[0]))return;if(p[1]&&fdDesc(f.id).indexOf(p[1])>=0)return;f.parent=p[1]||'';var ids=fdDesc(f.id),M={};ids.forEach(function(x){M[x]=1});
 noteFolders.forEach(function(x){if(M[x.id])x.tab=p[0]});notes.forEach(function(n){if(M[n.fd])n.tab=p[0]});saveNotes();renderNotes();toast(TR('Mutat în ')+fdKeyName(k))}
function fdDel(f){var c=fdCount(f),cf=$('cfModal').querySelector('.cftxt'),t0=cf.textContent,ok=$('cfOk'),o0=ok.textContent;cf.textContent=TR('Muți folderul „')+f.name+'”'+(c?TR(' (cu ')+c+(c===1?TR(' notiță'):TR(' notițe'))+')':'')+TR(' în coș?');ok.textContent=TR('Mută în coș');var back=function(){cf.textContent=t0;ok.textContent=o0};
 jvConfirm(function(){back();f.del=new Date().toISOString();saveNotes();renderNotes();toast(TR('Folder mutat în coș'))});var no=$('cfNo').onclick;$('cfNo').onclick=function(){back();no&&no()}}
function fdRestore(f){delete f.del;if(f.parent&&(!findF(f.parent)||!fdAlive(f.parent)))f.parent='';if(!findNT(f.tab)){var t=(findNT('general')||noteTabs[0]).id,M={};fdDesc(f.id).forEach(function(x){M[x]=1});noteFolders.forEach(function(x){if(M[x.id])x.tab=t});notes.forEach(function(n){if(M[n.fd])n.tab=t})}
 saveNotes();renderNotes();toast(TR('Folder refăcut în ')+(findNT(f.tab)||{}).name)}
function fdPurgeIds(ids){var M={};ids.forEach(function(x){M[x]=1});notes=notes.filter(function(n){return !M[n.fd]});noteFolders=noteFolders.filter(function(f){return !M[f.id]})}
function fdPurge(f){jvConfirm(function(){fdPurgeIds(fdDesc(f.id));saveNotes();renderNotes();phGC();toast(TR('Șters definitiv'))})}
function fdLock(f){if(!window.crypto||!crypto.subtle){toast(TR('Criptarea nu e disponibilă aici'));return}
 function s1(msg){pinShow({title:TR('PIN pentru folderul „')+f.name+'”',msg:msg,done:function(p1){setTimeout(function(){s2(p1)},0);return true}})}
 function s2(p1){pinShow({title:TR('Confirmă PIN-ul'),done:function(p2){if(p2!==p1){setTimeout(function(){s1(TR('PIN-urile nu se potrivesc'))},0);return true}
  var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));return lkDerive(p2,salt).then(function(k){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode('notis-folder:'+f.id))}).then(function(ct){f.lk=JSON.stringify({v:1,salt:b64e(salt),iv:b64e(iv),ct:b64e(ct)});delete fdOpen[f.id];if(fdChain(nFolder).some(function(x){return x.id===f.id}))fdGo(f.parent||'');saveNotes();renderNotes();toast(TR('Folder blocat'));return true})}})}
 s1()}
function fdTry(f,pin){try{var L=JSON.parse(f.lk)}catch(_){return Promise.resolve(false)}return lkDerive(pin,b64d(L.salt)).then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(L.iv)},k,b64d(L.ct))}).then(function(b){return new TextDecoder().decode(b)==='notis-folder:'+f.id}).catch(function(){return false})}
function fdPin(f,ok){pinShow({bio:'f:'+f.id,title:'🔒 '+f.name+TR(' · introdu PIN-ul'),done:function(p){return fdTry(f,p).then(function(r){if(!r)return TR('PIN greșit');setTimeout(ok,0);return true})}})}
function fdUnlock(f){fdPin(f,function(){delete f.lk;delete fdOpen[f.id];saveNotes();renderNotes();toast(TR('Folder deblocat'))})}
function fdMenu(li){var f=findF(li.dataset.fid);if(!f)return;lpCur={li:li,fd:f.id};var h;
 if(f.del)h='<button data-a="frest">↩ Reface</button><button data-a="fpurge" class="dng">× Șterge definitiv</button>';
 else h='<div class="lph">'+FD_IC+' '+esc(f.name)+'</div><button data-a="fren">📛 Redenumește</button>'+(f.pin?'<button data-a="fpin">📌 Anulează fixarea</button>':'<button data-a="fpin">📌 Fixează</button>')+'<button data-a="fmv">📦 Mută</button>'+(f.lk?'<button data-a="funl">🔓 Deblochează</button>':'<button data-a="flock">🔒 Blochează</button>')+'<button data-a="fdel" class="dng">🗑 Șterge</button>';
 $('lpBox').innerHTML=h;$('lpMenu').classList.add('show');li.classList.add('jv-lpon');lpPos()}
function fdAct(b,c){var f=findF(c.fd);if(!f){lpClose();return}
 if(b.dataset.ffd!=null){var k=b.dataset.ffd;lpClose();fdMove(f,k);return}
 var a=b.dataset.a;if(a==='fmv'){var ex=fdDesc(f.id);$('lpBox').innerHTML=fdTargets('data-ffd',f.tab+'|'+(f.parent||''),ex);lpPos();return}
 lpClose();if(a==='fren')fdRename(f);else if(a==='fpin'){saveNotes();if(f.pin)delete f.pin;else f.pin=true;saveNotes(true);renderNotes();toast(f.pin?TR('Fixată sus'):TR('Nu mai e fixată'))}else if(a==='flock')fdLock(f);else if(a==='funl')fdUnlock(f);else if(a==='fdel')fdDel(f);else if(a==='frest')fdRestore(f);else if(a==='fpurge')fdPurge(f)}
document.addEventListener('visibilitychange',function(){if(document.hidden&&Object.keys(fdOpen).length&&!$('noteFull').classList.contains('show')){fdOpen={};setTimeout(function(){try{renderNotes()}catch(_){}},0)}});

/* v52: 📎 attach menu (image / camera / drawing / recording) */
function phInsert(out,caret){if(!out.length)return Promise.resolve();mCaret=caret;var n=fullId&&findN(fullId);if(!n){var now=new Date().toISOString();n={id:ntUid(),text:$('nfText').value||'',ts:now,createdAt:now,updatedAt:now,tab:noteTab,fd:nFolder||undefined};notes.push(n);fullId=n.id;fullIsNew=true}
 return phStore(n,out).then(function(ids){mCaret=caret;var nb={id:bUid(),t:'img',ph:ids},m=mInsertB(nb);if(!m)return;var bi=m.blocks.indexOf(nb),nx=m.blocks[bi+1];mCaret=nx&&nx.t==='text'?{b:nx.id,pos:0}:null;return phCount(m).then(function(a){mAdopt(m,a);nFlush()})})}
function atLocked(){var n0=fullId&&findN(fullId);if(n0&&n0.lock&&!n0._key){toast(TR('Notiță blocată'));return true}return false}
$('nfPhoto').addEventListener('click',function(){var I=function(p){return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'};
 edPop(this,'<button data-a="atimg" class="atm">'+I('<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="M21 16l-5-5-8 8"/>')+'Alege imagine</button><button data-a="atimn" class="atm">'+I('<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="M21 16l-5-5-8 8"/><path d="M7 22h10"/>')+'Foto cu nume</button><button data-a="atcam" class="atm">'+I('<path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>')+'Fă o poză</button><button data-a="atdrw" class="atm">'+I('<path d="M4 20c2.5 0 3.5-1.2 3.5-3a2.5 2.5 0 0 1 5 0"/><path d="M10 14.5L19.5 5a1.8 1.8 0 0 1 2.5 2.5L12.5 17"/>')+'Desen</button><button data-a="atrec" class="atm">'+I('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>')+'Înregistrare</button>','att')});
function atDo(a){if(atLocked())return;if(a==='atimg'){var i=$('nfPhIn');i.value='';i.click()}else if(a==='atimn'){if(window.tkPick)tkPick(false,function(f){phPickN(f)})}else if(a==='atcam'){var c=$('nfCamIn');c.value='';c.click()}else if(a==='atdrw')drOpen();else if(a==='atrec')recOpen()}
$('nfCamIn').addEventListener('change',function(){phPick(this.files)});
/* drawing */
var DR={st:[],cur:null,col:'#1d1d1f',w:6,er:false,dpr:1,caret:null};
var DR_COLS=['#1d1d1f','#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#8e24aa','#ec407a'];
function drOpen(){if(DR.saving)return;DR.caret=mCaret?JSON.parse(JSON.stringify(mCaret)):null;DR.st=[];DR.cur=null;DR.er=false;var P=$('drPg');
 $('drCols').innerHTML=DR_COLS.map(function(c){return '<button type="button" data-dc="'+c+'" style="--dc:'+c+'"'+(c===DR.col?' class="on"':'')+' aria-label="Culoare"></button>'}).join('');drUi();P.classList.add('show');
 try{history.pushState({dr:1},'')}catch(_){}requestAnimationFrame(drSize)}
function drSize(){var cv=$('drCv'),r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1;DR.dpr=d;cv.width=Math.max(1,Math.round(r.width*d));cv.height=Math.max(1,Math.round(r.height*d));drRedraw()}
function drUi(){[].forEach.call($('drCols').children,function(b){b.classList.toggle('on',!DR.er&&b.dataset.dc===DR.col)});[].forEach.call(document.querySelectorAll('#drPg [data-ds]'),function(b){b.classList.toggle('on',+b.dataset.ds===DR.w)});$('drEr').classList.toggle('on',DR.er);$('drUndo').disabled=!DR.st.length}
function drStroke(x,s){var d=DR.dpr;x.strokeStyle=s.er?'#ffffff':s.c;x.lineWidth=s.w*(s.er?3:1)*d;x.lineCap='round';x.lineJoin='round';x.beginPath();var p=s.p;x.moveTo(p[0][0]*d,p[0][1]*d);if(p.length===1)x.lineTo(p[0][0]*d+.01,p[0][1]*d);for(var i=1;i<p.length;i++){var m=p[i-1],q=p[i];x.quadraticCurveTo(m[0]*d,m[1]*d,(m[0]+q[0])/2*d,(m[1]+q[1])/2*d)}x.stroke()}
function drRedraw(){var cv=$('drCv'),x=cv.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,cv.width,cv.height);DR.st.forEach(function(s){drStroke(x,s)});if(DR.cur)drStroke(x,DR.cur)}
(function(){var cv=$('drCv'),pid=null;function pt(e){var r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
 cv.addEventListener('pointerdown',function(e){if(pid!==null)return;pid=e.pointerId;try{cv.setPointerCapture(pid)}catch(_){}DR.cur={c:DR.col,w:DR.w,er:DR.er,p:[pt(e)]};drRedraw();e.preventDefault()});
 cv.addEventListener('pointermove',function(e){if(e.pointerId!==pid||!DR.cur)return;var ev=e.getCoalescedEvents?e.getCoalescedEvents():[e];ev.forEach(function(q){DR.cur.p.push(pt(q))});drRedraw()});
 function end(e){if(e.pointerId!==pid)return;pid=null;if(DR.cur){DR.st.push(DR.cur);DR.cur=null;drRedraw();drUi()}}
 cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
 $('drCols').addEventListener('click',function(e){var b=e.target.closest('[data-dc]');if(!b)return;DR.col=b.dataset.dc;DR.er=false;drUi()});
 document.querySelectorAll('#drPg [data-ds]').forEach(function(b){b.addEventListener('click',function(){DR.w=+b.dataset.ds;drUi()})});
 $('drEr').addEventListener('click',function(){DR.er=!DR.er;drUi()});
 $('drUndo').addEventListener('click',function(){DR.st.pop();drRedraw();drUi()});
 $('drX').addEventListener('click',function(){drClose()});
 $('drOk').addEventListener('click',drSave);
 window.addEventListener('resize',function(){if($('drPg').classList.contains('show'))drSize()})})();
function drClose(fromPop){var P=$('drPg');if(!P.classList.contains('show'))return;P.classList.remove('show');setTimeout(function(){DR.saving=false;var o=$('drOk');o.disabled=false;o.textContent=TR('Salvează')},0);DR.st=[];DR.cur=null;if(!fromPop&&history.state&&history.state.dr){nIgnorePop=true;try{history.back()}catch(_){nIgnorePop=false}}}
/* v53: one save per drawing session; snapshot (downscaled) synchronously, close at once, encode in background */
var drSaveQ=Promise.resolve();
function drSave(){var ok=$('drOk');if(DR.saving||!$('drPg').classList.contains('show'))return;DR.saving=true;ok.disabled=true;ok.textContent=TR('Se salvează…');
 if(!DR.st.length){drClose();return}
 var cv=$('drCv'),caret=DR.caret,k=Math.min(1,1080/Math.max(cv.width,1)),c2=document.createElement('canvas');c2.width=Math.max(1,Math.round(cv.width*k));c2.height=Math.max(1,Math.round(cv.height*k));
 var x=c2.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c2.width,c2.height);x.drawImage(cv,0,0,c2.width,c2.height);
 drClose();toast(TR('Se salvează desenul…'));
 drSaveQ=drSaveQ.then(function(){return new Promise(function(res){c2.toBlob(function(b){res(b)},'image/jpeg',0.85)})}).then(function(b){if(!b)throw new Error('blob');return phInsert([b],caret)}).then(function(){toast(TR('Desen adăugat'))}).catch(function(e){console.warn(e);toast(TR('Nu am putut salva desenul'))})}
/* recording */
var REC=null;
function recMime(){var c=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg;codecs=opus'];if(!window.MediaRecorder)return null;for(var i=0;i<c.length;i++)try{if(MediaRecorder.isTypeSupported(c[i]))return c[i]}catch(_){}return ''}
function recFmt(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
function recNat(){var N=window.NotisNative;try{return N&&N.recStart&&N.isNative()?N:null}catch(_){return null}}
function recNative(caret,why){var N=recNat();if(!N)return false;var r='';try{r=N.recStart()}catch(e){r='err:'+e.message}
 if(r==='perm'){window.__recPerm=function(ok){window.__recPerm=null;if(ok)recNative(caret,why);else toast(TR('Fără permisiunea Microfon nu pot înregistra'))};return true}
 if(r!=='ok'){toast(TR('Microfon indisponibil (')+(why||'-')+' · '+r+')');return true}
 $('recT').textContent='0:00';$('recModal').classList.add('show','on');$('recMsg').textContent=TR('Înregistrez… vorbește acum');
 REC={nat:N,t0:Date.now(),caret:caret,keep:false};REC.iv=setInterval(function(){if(!REC)return;var s=(Date.now()-REC.t0)/1000;$('recT').textContent=recFmt(s);if(s>=600)recStop(true)},250);return true}
function recOpen(){var mt=recMime(),caret0=mCaret?JSON.parse(JSON.stringify(mCaret)):null;if(mt===null||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){if(!recNative(caret0,!window.isSecureContext?'insecure':'no getUserMedia'))toast(TR('Înregistrarea nu e disponibilă aici')+(window.isSecureContext?'':TR(' (context nesigur)')));return}
 var caret=mCaret?JSON.parse(JSON.stringify(mCaret)):null;$('recT').textContent='0:00';$('recMsg').textContent=TR('Pornesc microfonul…');$('recModal').classList.add('show');$('recModal').classList.remove('on');
 navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){if(!$('recModal').classList.contains('show')){st.getTracks().forEach(function(t){t.stop()});return}
  var mr=mt?new MediaRecorder(st,{mimeType:mt}):new MediaRecorder(st),ch=[];REC={mr:mr,st:st,ch:ch,t0:Date.now(),caret:caret,keep:false};
  mr.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data)};
  mr.onstop=function(){var R=REC;REC=null;st.getTracks().forEach(function(t){t.stop()});clearInterval(R&&R.iv);$('recModal').classList.remove('show','on');if(!R||!R.keep||!ch.length)return;var dur=(Date.now()-R.t0)/1000,blob=new Blob(ch,{type:(mr.mimeType||mt||'audio/webm').split(';')[0]});recStore(blob,dur,R.caret)};
  mr.start(250);$('recModal').classList.add('on');$('recMsg').textContent=TR('Înregistrez… vorbește acum');
  REC.iv=setInterval(function(){if(!REC)return;var s=(Date.now()-REC.t0)/1000;$('recT').textContent=recFmt(s);if(s>=600)recStop(true)},250)})
 .catch(function(e){console.warn(e);$('recModal').classList.remove('show');var nm=(e&&e.name)||'Error';if(recNative(caret,nm))return;toast(nm==='NotAllowedError'?TR('Permite accesul la microfon ca să înregistrezi (NotAllowedError)'):TR('Microfonul nu e disponibil (')+nm+(e&&e.message?': '+String(e.message).slice(0,60):'')+')')})}
function recStop(keep){if(REC&&REC.nat){var R0=REC;REC=null;clearInterval(R0.iv);$('recModal').classList.remove('show','on');var b64='';try{b64=keep?R0.nat.recStop():(R0.nat.recCancel(),'')}catch(_){}if(!keep)return;if(!b64||b64.indexOf('err:')===0){toast(TR('Nu am putut salva înregistrarea')+(b64?' ('+b64+')':''));return}var bin=atob(b64),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);recStore(new Blob([u],{type:'audio/mp4'}),(Date.now()-R0.t0)/1000,R0.caret);return}if(!REC){$('recModal').classList.remove('show','on');return}REC.keep=keep;try{REC.mr.stop()}catch(_){$('recModal').classList.remove('show','on');REC=null}}
$('recStop').addEventListener('click',function(){recStop(true)});$('recCancel').addEventListener('click',function(){recStop(false)});
function recStore(blob,dur,caret){var n=fullId&&findN(fullId);if(!n){var now=new Date().toISOString();n={id:ntUid(),text:$('nfText').value||'',ts:now,createdAt:now,updatedAt:now,tab:noteTab,fd:nFolder||undefined};notes.push(n);fullId=n.id;fullIsNew=true}
 var key=n.lock?n._key:null,id='a'+ntUid();return blob.arrayBuffer().then(function(buf){return key?phSeal(key,buf):{buf:buf}}).then(function(x){var r={id:id,note:n.id,ts:Date.now(),buf:x.buf,k:'a',mt:blob.type||'audio/webm',dur:Math.round(dur)};if(x.iv)r.iv=x.iv;return phPut(r)})
  .then(function(){mCaret=caret;mInsertB({id:bUid(),t:'aud',a:id,dur:Math.round(dur)});toast(TR('Înregistrare salvată'))}).catch(function(e){console.warn(e);toast(TR('Nu am putut salva înregistrarea'))})}
/* inline player */
var auP=null;
function auStop(){if(auP){try{auP.a.pause()}catch(_){}var w=auP.w;if(w&&w.isConnected){w.classList.remove('play')}auP=null}}
function auToggle(w){var r=mBlk(w.dataset.b);if(!r.b)return;if(auP&&auP.w===w){if(auP.a.paused){auP.a.play();w.classList.add('play')}else{auP.a.pause();w.classList.remove('play')}return}auStop();var n=r.n;
 phGet(r.b.a).then(function(rec){if(!rec){toast(TR('Înregistrarea lipsește'));return}return phBlob(n,rec).then(function(b){var u=URL.createObjectURL(b),a=new Audio(u);auP={a:a,w:w,u:u};w.classList.add('play');
  a.ontimeupdate=function(){var d=a.duration&&isFinite(a.duration)?a.duration:(r.b.dur||1);w.querySelector('.abar i').style.width=Math.min(100,a.currentTime/d*100)+'%';w.querySelector('.atm').textContent=recFmt(a.currentTime)+' / '+recFmt(r.b.dur||d)};
  a.onended=function(){w.classList.remove('play');w.querySelector('.abar i').style.width='0';w.querySelector('.atm').textContent=recFmt(r.b.dur||0);URL.revokeObjectURL(u);if(auP&&auP.a===a)auP=null};
  return a.play()})}).catch(function(e){console.warn(e);w.classList.remove('play');toast(TR('Nu pot reda înregistrarea'))})}
function auDel(w){var r=mBlk(w.dataset.b);if(!r.b)return;var cf=$('cfModal').querySelector('.cftxt'),t0=cf.textContent;cf.textContent=TR('Ștergi înregistrarea?');
 jvConfirm(function(){cf.textContent=t0;auStop();var id=r.b.a;mPre(r.n);r.n.blocks.splice(r.n.blocks.indexOf(r.b),1);mTouch(r.n);nFlush();mRender();phDel(id).catch(function(){})});var no=$('cfNo').onclick;$('cfNo').onclick=function(){cf.textContent=t0;no&&no()}}
$('nfBlocks').addEventListener('click',function(e){var w=e.target.closest('.nba');if(!w)return;e.preventDefault();e.stopPropagation();if(e.target.closest('.abx'))auDel(w);else auToggle(w)},true);

/* v53: lock a whole tab (PIN gate, same mechanism as folders) */
var tabOpen={};
function tbHidden(id){var t=findNT(id);return !!(t&&t.lk&&!tabOpen[id])}
function tbTry(t,pin){try{var L=JSON.parse(t.lk)}catch(_){return Promise.resolve(false)}return lkDerive(pin,b64d(L.salt)).then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(L.iv)},k,b64d(L.ct))}).then(function(b){return new TextDecoder().decode(b)==='notis-tab:'+t.id}).catch(function(){return false})}
function tbPin(t,ok){pinShow({bio:'t:'+t.id,title:'🔒 '+t.name+TR(' · introdu PIN-ul'),done:function(p){return tbTry(t,p).then(function(r){if(!r)return TR('PIN greșit');setTimeout(ok,0);return true})}})}
function tbOpenLocked(id){var t=findNT(id);if(!t)return;tbPin(t,function(){tabOpen[id]=1;renderNotes()})}
function tbLock(id){var t=findNT(id);if(!t||t.lk)return;if(!window.crypto||!crypto.subtle){toast(TR('Criptarea nu e disponibilă aici'));return}
 function s1(msg){pinShow({title:TR('PIN pentru tabul „')+t.name+'”',msg:msg,done:function(p1){setTimeout(function(){s2(p1)},0);return true}})}
 function s2(p1){pinShow({title:TR('Confirmă PIN-ul'),done:function(p2){if(p2!==p1){setTimeout(function(){s1(TR('PIN-urile nu se potrivesc'))},0);return true}
  var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));return lkDerive(p2,salt).then(function(k){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode('notis-tab:'+t.id))}).then(function(ct){t.lk=JSON.stringify({v:1,salt:b64e(salt),iv:b64e(iv),ct:b64e(ct)});delete tabOpen[t.id];saveNotes();renderNotes();toast(TR('Tab blocat'));return true})}})}
 s1()}
function tbUnlock(id){var t=findNT(id);if(!t||!t.lk)return;tbPin(t,function(){delete t.lk;delete tabOpen[id];saveNotes();renderNotes();toast(TR('Tab deblocat'))})}
document.addEventListener('visibilitychange',function(){if(document.hidden&&Object.keys(tabOpen).length&&!$('noteFull').classList.contains('show')){tabOpen={};setTimeout(function(){try{renderNotes()}catch(_){}},0)}});

/* v54: a long-press that opens a dialog/menu must not turn into a text selection on the opened element */
(function(){function ed(t){t=t&&t.nodeType===1?t:t&&t.parentNode;return !!(t&&t.closest&&t.closest('input,textarea,[contenteditable]'))}
 document.addEventListener('contextmenu',function(e){if(!ed(e.target))e.preventDefault()},true);
 document.addEventListener('selectstart',function(e){if(!ed(e.target))e.preventDefault()},true);
 document.addEventListener('selectionchange',function(){var a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable))return;try{var sl=getSelection();if(sl&&sl.rangeCount&&!sl.isCollapsed&&!ed(sl.anchorNode))sl.removeAllRanges()}catch(_){}});
 if(window.MutationObserver)new MutationObserver(function(){var a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable))return;try{var sl=getSelection();if(sl&&!sl.isCollapsed)sl.removeAllRanges()}catch(_){}}).observe(document.body,{attributes:true,attributeFilter:['class'],subtree:false,childList:false});
 [].forEach.call(document.querySelectorAll('.modal,#lpMenu'),function(m){new MutationObserver(function(){if(m.classList.contains('show'))try{var a=document.activeElement;if(!(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA')))getSelection().removeAllRanges()}catch(_){}}).observe(m,{attributes:true,attributeFilter:['class']})})})();


/* v55: language picker (Setări → Limbă). Stored globally (not per demo); reload applies it everywhere. */
(function(){var sel=$('sLang');if(!sel)return;var cur='auto';try{cur=localStorage.getItem('notis_lang')||'auto'}catch(_){}
 var nm={};NOTIS_LANGS.forEach(function(x){nm[x[0]]=x[1]});
 var DN=null;try{DN=new Intl.DisplayNames([NL==='no'?'nb':NL],{type:'language'})}catch(_){}
 function dn(c){try{return DN?DN.of(c==='no'?'nb':c):''}catch(_){return ''}}
 function fold(x){return String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
 function fill(q){q=fold(q).trim();sel.innerHTML='';
  var o=document.createElement('option');o.value='auto';o.setAttribute('data-u','1');o.textContent=TR('Automat (limba telefonului)')+' · '+nm[NL];if(!q)sel.appendChild(o);
  NOTIS_LANGS.forEach(function(x){if(q&&!(fold(x[1]+' '+x[2]+' '+x[3]+' '+x[0]).indexOf(q)>=0||(NL!=='en'&&NL!=='ro'&&fold(dn(x[0])).indexOf(q)>=0)))return;var e=document.createElement('option');e.value=x[0];e.setAttribute('data-u','1');var ln=dn(x[0]);e.setAttribute('data-u','');e.textContent=x[1]+(ln&&fold(ln)!==fold(x[1])?' — '+ln:'');sel.appendChild(e)});
  if(q&&!sel.options.length){var z=document.createElement('option');z.disabled=true;z.textContent=TR('Nicio limbă găsită');sel.appendChild(z)}
  sel.size=q?Math.min(8,Math.max(2,sel.options.length)):0;sel.value=nm[cur]?cur:'auto';if(q&&sel.selectedIndex<0)sel.selectedIndex=-1}
 fill('');var qi=$('sLangQ');if(qi)qi.addEventListener('input',function(){fill(qi.value)});
 sel.value=nm[cur]?cur:'auto';
 sel.onchange=function(){try{if(sel.value==='auto')localStorage.removeItem('notis_lang');else localStorage.setItem('notis_lang',sel.value)}catch(_){}location.reload()}})();
try{if(window.NotisNative&&NotisNative.setLang)NotisNative.setLang(NL)}catch(_){}
if(/[?&]nt_test=1/.test(location.search)&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname))window.__T=function(c){return eval(c)};
function notesOpen(){var pg=$('notesPg');if(pg.classList.contains('show'))return;renderNotes();pg.classList.add('show');document.documentElement.classList.add('jv-notes');}
function notesClose(fromPop){return;var pg=$('notesPg');if(!pg.classList.contains('show'))return;if(draftId)draftFinish();nFlushAll();pg.classList.remove('show');document.documentElement.classList.remove('jv-notes');
 if(!fromPop&&history.state&&history.state.jvNotes)try{history.back()}catch(_){}}
window.notisHandleBack=function(){try{var S=function(id){var e=$(id);return e&&e.classList.contains('show')},C=function(id){var e=$(id);if(e)e.click()};
if($('lpMenu').classList.contains('show')){lpClose();return true}
if(S('crop')){C('cropNo');return true}
var mm={modal:'sCancel',tabModal:'tmCancel',alModal:'alCancel',alFire:'alOff',cfModal:'cfNo',prModal:'prNo',pinModal:'pinCancel',recModal:'recStop',voiceModal:'voiceClose'};
var ms=document.querySelectorAll('.modal.show,.show .shno');for(var i=ms.length-1;i>=0;i--){var m=ms[i];if(m.classList.contains('shno')){m.click();return true}if(mm[m.id]&&$(mm[m.id])){C(mm[m.id]);if(m.classList.contains('show')&&m.id!=='recModal')m.classList.remove('show');return true}m.classList.remove('show');return true}
var sh=document.querySelector('.show > .card.jvdlg .shno');if(sh){sh.click();return true}
if(S('phView')){phViewClose(false);if(history.state&&history.state.jvPh){nIgnorePop=true;try{history.back()}catch(_){nIgnorePop=false}}return true}
if(S('drPg')){drClose(false);return true}
if(S('noteFull')){fullClose(false);return true}
if(selOn()){selExit(false);return true}
var pg=$('notesPg');if(pg.classList.contains('nsrch')||nQ){nSearchClose();return true}
if(nTrash){nTrashOpen(false);return true}
if(nFolder){var fc=fdChain(nFolder);fdGo(fc.length>1?fc[fc.length-2].id:'');return true}
}catch(e){console.warn(e)}return false};
window.addEventListener('popstate',function(){if(selOn()&&!nIgnorePop){selExit(true);return}if($('phView').classList.contains('show')){phViewClose(false);return}if($('drPg').classList.contains('show')&&!nIgnorePop){drClose(true);return}if(fdHist&&!nIgnorePop&&!$('noteFull').classList.contains('show')&&!nTrash){fdHist=false;if(nFolder){var fc=fdChain(nFolder);fdGo(fc.length>1?fc[fc.length-2].id:'')}return}if(nIgnorePop){nIgnorePop=false;return}if($('noteFull').classList.contains('show'))fullClose(true);else notesClose(true)});
$('notesBack').addEventListener('click',function(){notesClose()});
var sw=null;
document.addEventListener('touchstart',function(e){sw=null;if(e.touches.length!==1)return;var t=e.target;
 if(t.closest&&t.closest('input,textarea,select,.modal.show,#lpMenu,.news-search,#noteTabs'))return;if(window.pwSwOn&&pwSwOn(t))return;if(nHScr(t))return;if(document.querySelector('.modal.show')||$('lpMenu').classList.contains('show'))return;
 sw={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}},{passive:true});
document.addEventListener('touchend',function(e){var d=sw;sw=null;if(Date.now()-(window.__nswpT||0)<500)return;if(!d||lpJust||lpCur||ndrag||Date.now()-ndragT<600)return;var c=e.changedTouches[0],dx=c.clientX-d.x,dy=c.clientY-d.y;
 if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.6)return;var open=$('notesPg').classList.contains('show');
 if(dx>0&&$('noteFull').classList.contains('show')){fullClose();return}
 if(dx<0&&!open)notesOpen();else if(dx>0&&open)notesClose()},{passive:true});
renderNotes();
nH.cur=nSnap();nHistBtns();
/* ---------- Notis v2: import notes from Jarvis (same-origin localStorage, Jarvis backups in jv_backups, Jarvis backup .json files) ---------- */
function nsReal(){return notes.filter(function(n){return n.lock||n.ph||(n.text||'').trim()||(n.title||'').trim()||(n.items||[]).some(function(x){return (x.text||'').trim()})}).length}
function nsJSON(v){if(v==null)return null;if(typeof v!=='string')return v;try{return JSON.parse(v)}catch(_){return null}}
function nsMerge(src){var ns=Array.isArray(src&&src.notes)?src.notes:[],ts=Array.isArray(src&&src.tabs)?src.tabs:[];if(!ns.length)return 0;
 if(draftId)try{draftFinish()}catch(_){}
 ts.forEach(function(t){if(t&&t.id&&!noteTabs.some(function(x){return x.id===t.id}))noteTabs.push(JSON.parse(JSON.stringify(t)))});
 var add=0;ns.forEach(function(n){if(!n||!n.id||findN(n.id))return;notes.push(JSON.parse(JSON.stringify(n)));add++});
 if(add){ntMigrate();saveNotes();renderNotes()}return add}
function nsFromData(d){d=d&&typeof d==='object'?(d.data&&typeof d.data==='object'?d.data:d):null;if(!d)return null;
 var p=['jv_','jvb_'].filter(function(x){return Array.isArray(nsJSON(d[x+'notes']))})[0];if(!p)return null;
 return{notes:nsJSON(d[p+'notes']),tabs:nsJSON(d[p+'notetabs'])||[]}}
function nsFromLS(){var out={notes:[],tabs:[]};['jv_','jvb_'].forEach(function(p){var n=nsJSON(localStorage.getItem(p+'notes')),t=nsJSON(localStorage.getItem(p+'notetabs'));
 if(Array.isArray(n))out.notes=out.notes.concat(n);if(Array.isArray(t))out.tabs=out.tabs.concat(t)});return out}
function nsJvBackups(){var a=[];['jv_','jvb_'].forEach(function(p){var l=nsJSON(localStorage.getItem(p+'backups'));if(Array.isArray(l))l.forEach(function(e){var s=e&&nsFromData(e.data);if(s&&s.notes.length)a.push({e:e,s:s})})});return a}
function nsMsg(add,found){toast(add?TR('Am importat ')+add+(add===1?TR(' notiță'):TR(' notițe'))+TR(' din Jarvis'):found?TR('Notițele din Jarvis sunt deja aici'):TR('Nu am găsit notițe Jarvis'))}
function nsImportJarvis(){var s=nsFromLS(),add=nsMerge(s),found=s.notes.length;
 if(!found){var b=nsJvBackups()[0];if(b){add=nsMerge(b.s);found=b.s.notes.length}}
 if(found){try{localStorage.setItem('ns_impban','off')}catch(_){}}nsBanner();nsMsg(add,found);return found}
function nsRenderJv(){var box=$('jvBkList');if(!box)return;var a=nsJvBackups();box.innerHTML='';
 a.forEach(function(x){var row=document.createElement('div');row.className='bkrow';var l=document.createElement('div');l.className='bklbl';l.textContent=TR('Backup Jarvis din ')+(x.e.label||x.e.ts||'')+' · '+x.s.notes.length+TR(' notițe');row.appendChild(l);
  var ac=document.createElement('div');ac.className='bkacts';var b=document.createElement('button');b.type='button';b.className='btn';b.textContent=TR('Importă');b.onclick=function(){var n=nsMerge(x.s);try{localStorage.setItem('ns_impban','off')}catch(_){}nsBanner();nsMsg(n,1)};ac.appendChild(b);row.appendChild(ac);box.appendChild(row)})}
function nsBanner(){var el=$('nsImp');if(!el)return;var off=false;try{off=localStorage.getItem('ns_impban')==='off'}catch(_){}el.hidden=off||nsReal()>0}
/* v88: Setări → Distribuie aplicația (same order as note Share: native/WhatsApp → share sheet → wa.me → clipboard) */
$('sShareApp').onclick=function(){var U='https://cluj1313.github.io/notis/apk/',ti='Notis',all=TR('Notis – notițe, liste și memento-uri')+'\n'+U;
 function cp(){var ok=function(){toast(TR('Link copiat'))};try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(all).then(ok,leg)}catch(_){}leg();
  function leg(){var ta=document.createElement('textarea');ta.value=all;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(_){}ta.remove();ok()}}
 function fb(){var w=null;try{w=window.open('https://wa.me/?text='+encodeURIComponent(all),'_blank')}catch(_){}if(!w)cp()}
 try{if(window.NotisNative&&NotisNative.shareText){NotisNative.shareText(all,ti);return}}catch(_){}
 if(navigator.share){navigator.share({title:ti,text:all}).catch(function(e){if(!e||e.name!=='AbortError')fb()});return}fb()};
$('sShareApp').addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();this.click()}});
['N','J'].forEach(function(k){var r=$('shRow'+k),bx=$('shBox'+k);r.onclick=function(){var o=bx.hidden;bx.hidden=!o;r.classList.toggle('open',o);r.setAttribute('aria-expanded',o?'true':'false')};r.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();r.click()}})});
/* v132: Setări – readable text contrast per theme (lighter on dark, darker on light, never pure white/black) */
(function(){var M=$('modal');if(!M)return;
 function rgb(c){var m=String(c).match(/[\d.]+/g);return m?[+m[0],+m[1],+m[2],m.length>3?+m[3]:1]:[0,0,0,0]}
 function L(c){var a=c.slice(0,3).map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*a[0]+.7152*a[1]+.0722*a[2]}
 function CR(a,b){var x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
 function bgOf(el){var ls=[];for(var e=el;e&&e.nodeType===1;e=e.parentElement){var c=rgb(getComputedStyle(e).backgroundColor);if(c[3]>0){ls.push(c);if(c[3]>=.99)break}}
  var base=ls.length&&ls[ls.length-1][3]>=.99?ls.pop():[0,0,0,0];
  if(base[3]<.99){var t=document.createElement('i');t.style.color=getComputedStyle(document.documentElement).getPropertyValue('--bg');document.body.appendChild(t);base=rgb(getComputedStyle(t).color);t.remove()}
  for(var i=ls.length-1;i>=0;i--){var c=ls[i],a=c[3];base=[c[0]*a+base[0]*(1-a),c[1]*a+base[1]*(1-a),c[2]*a+base[2]*(1-a),1]}return base}
 var BIG='.sec,label,.lbl,.shL,.lbfh,b,strong,h2,h3';
 window.nsSetCR=function(){M.querySelectorAll('[data-crx]').forEach(function(e){e.style.removeProperty('color');e.style.removeProperty('opacity');e.removeAttribute('data-crx')});
  if(!M.classList.contains('show'))return;
  M.querySelectorAll('*').forEach(function(e){if(/^(INPUT|TEXTAREA|SELECT|OPTION|SCRIPT|STYLE|svg|path|circle)$/i.test(e.tagName)||e.matches('.sect.open,#dsgn .dsh,#dsgn .dsh>span,#modal .shRow,#modal .shRow *,#modal .ccRow,#modal .ccRow *'))return;
   var has=false;for(var n=e.firstChild;n;n=n.nextSibling)if(n.nodeType===3&&n.nodeValue.trim()){has=true;break}if(!has||!e.getClientRects().length)return;
   var cs=getComputedStyle(e),fg=rgb(cs.color),bg=bgOf(e),op=+cs.opacity;if(fg[3]<.99||op<1){var a=fg[3]*op;fg=[fg[0]*a+bg[0]*(1-a),fg[1]*a+bg[1]*(1-a),fg[2]*a+bg[2]*(1-a)]}
   var dark=L(bg)<.18,goal=e.closest(BIG)?9:7,to=dark?[255,255,255]:[0,0,0],mx=dark?.92:.9,t=.16,c;
   for(;t<=mx+1e-9;t+=.02){c=fg.slice(0,3).map(function(v,i){return Math.round(v+(to[i]-v)*t)});if(CR(c,bg)>=goal)break}
   if(t>mx)c=fg.slice(0,3).map(function(v,i){return Math.round(v+(to[i]-v)*mx)});
   e.style.setProperty('color','rgb('+c.join(',')+')','important');if(op<1)e.style.setProperty('opacity','1','important');e.setAttribute('data-crx','1')});
  /* v164: open section headers use the SETĂRI title colour as shown */var ts=M.querySelector('.card>.lbl>span');if(ts)M.style.setProperty('--sttl',getComputedStyle(ts).color);
  /* v165: Design sub-menus take the closed main-section grey */var sg=[].filter.call(M.querySelectorAll('.sect:not(.open)'),function(x){return x.getClientRects().length})[0];if(sg)M.style.setProperty('--sgry',getComputedStyle(sg).color)};
 var T;function q(){clearTimeout(T);T=setTimeout(nsSetCR,60)}
 new MutationObserver(q).observe(M,{attributes:true,attributeFilter:['class']});new MutationObserver(q).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});
 M.addEventListener('click',q,true);M.addEventListener('change',q,true)})();
/* v133: Setări – fonts ~12% larger (also for content rendered later); only elements with their own size, inherited ones follow */
(function(){var M=$('modal');if(!M)return;var F=1.12;
 function fz(root){if(root.nodeType!==1||!M.contains(root))return;var L=[root].concat([].slice.call(root.querySelectorAll('*'))),W=[];
  L.forEach(function(e){if(e.hasAttribute('data-fz')||/^(OPTION|SCRIPT|STYLE|svg|path|circle|rect|line|g|INPUT)$/i.test(e.tagName))return;
   var px=parseFloat(getComputedStyle(e).fontSize),pp=e.parentElement?parseFloat(getComputedStyle(e.parentElement).fontSize):0;if(!(px>0))return;
   e.setAttribute('data-fz',px);if(px>18||(e!==M&&Math.abs(px-pp)<.01&&e.parentElement&&e.parentElement!==M&&M.contains(e.parentElement)))return;W.push([e,px])});
  W.forEach(function(x){x[0].style.setProperty('font-size',(Math.round(x[1]*F*2)/2)+'px','important')})}
 window.nsFz=function(){fz(M)};
 new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(fz)})}).observe(M,{childList:true,subtree:true});
 fz(M.querySelector('.card')||M)})();
var JARVIS_SHARE_URL='https://cluj1313.github.io/jarvis/';
$('sShareJarvis').onclick=function(){var U=JARVIS_SHARE_URL,ti='Jarvis',all=TR('Jarvis – asistentul tău zilnic')+'\n'+U;
 function cp(){var ok=function(){toast(TR('Link copiat'))};try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(all).then(ok,leg)}catch(_){}leg();
  function leg(){var ta=document.createElement('textarea');ta.value=all;document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(_){}ta.remove();ok()}}
 function fb(){var w=null;try{w=window.open('https://wa.me/?text='+encodeURIComponent(all),'_blank')}catch(_){}if(!w)cp()}
 try{if(window.NotisNative&&NotisNative.shareText){NotisNative.shareText(all,ti);return}}catch(_){}
 if(navigator.share){navigator.share({title:ti,text:all}).catch(function(e){if(!e||e.name!=='AbortError')fb()});return}fb()};
$('sShareJarvis').addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();this.click()}});
/* v94: alarm sound picker. cfg.alSnd={k:'default'|'b:<id>'|'u:<uri>',n:name}; native rings it (RingService), browser previews bundled snd/<id>.mp3 */
var ALS=[['clopotel','Clopoțel'],['marimba','Marimba'],['digital','Digital'],['dimineata','Dimineață'],['harpa','Harpă'],['urgent','Urgent']];
function alsNat(){try{return !!(window.NotisNative&&NotisNative.listAlarmSounds)}catch(_){return false}}
if(!cfg.alSnd||!cfg.alSnd.k)cfg.alSnd={k:'default',n:''};
var alsAud=null,alsPlay='';
function alsStop(){try{if(alsAud){alsAud.pause();alsAud=null}}catch(_){}try{if(alsNat())NotisNative.previewAlarmSound('')}catch(_){}alsPlay='';alsRender()}
function alsPreview(k){if(alsPlay===k){alsStop();return}alsStop();alsPlay=k;
 if(alsNat()){try{NotisNative.previewAlarmSound(k)}catch(_){}setTimeout(function(){if(alsPlay===k){alsPlay='';alsRender()}},7000)}
 else if(k.indexOf('b:')===0){try{alsAud=new Audio('snd/'+k.slice(2)+'.mp3');alsAud.onended=function(){alsPlay='';alsAud=null;alsRender()};alsAud.play().catch(function(){})}catch(_){}}
 alsRender()}
function alsSet(k,n){cfg.alSnd={k:k,n:n||''};saveCfg();try{if(alsNat())NotisNative.setAlarmSound(k,n||'')}catch(_){}alsRender()}
window.notisAlSnd=function(j){try{var o=typeof j==='string'?JSON.parse(j):j;if(o&&o.cur){cfg.alSnd={k:o.cur,n:o.name||''};saveCfg()}}catch(_){}alsRender()};
function alsRender(){var L=$('alsList');if(!L)return;L.innerHTML='';var cur=cfg.alSnd.k,nat=alsNat();
 function row(k,label,sub,pv,act){var r=document.createElement('div');r.className='alsr'+(k&&cur===k||(k==='u:'&&cur.indexOf('u:')===0)?' on':'');
  var b=document.createElement('button');b.type='button';b.className='alsn';b.textContent=label;if(sub){var sm=document.createElement('small');sm.textContent=sub;b.appendChild(sm)}
  b.onclick=act;r.appendChild(b);
  if(pv){var p=document.createElement('button');p.type='button';p.className='alsp'+(alsPlay===pv?' pl':'');p.textContent=alsPlay===pv?'■':'▶';p.setAttribute('aria-label',TR('Ascultă'));p.onclick=function(){alsPreview(pv)};r.appendChild(p)}
  L.appendChild(r)}
 if(nat)row('default',TR('Implicit (telefon)'),'', 'default',function(){alsSet('default','')});
 ALS.forEach(function(x){var k='b:'+x[0];row(k,TR(x[1]),'',k,function(){alsSet(k,'');})});
 if(nat){if(cur.indexOf('u:')===0)row('u:','📱 '+(cfg.alSnd.n||TR('Sunet din telefon')),'',cur,function(){});
  row('_p',TR('Alege din telefon…'),'',null,function(){alsStop();try{NotisNative.pickPhoneAlarmSound()}catch(_){}});
  row('_f',TR('Fișier audio…'),'',null,function(){alsStop();try{NotisNative.pickAlarmFile()}catch(_){}})}
 var h=$('alsHint');if(h)h.textContent=nat?TR('Sună la alarme cât timp notificarea e deschisă. Dacă sunetul ales nu mai poate fi redat, Notis folosește sunetul de alarmă al telefonului.'):TR('Poți asculta sunetele aici. Sunetele din telefon se aleg în aplicația Android.')}
try{new MutationObserver(function(){if(alsPlay&&!$('modal').classList.contains('show'))alsStop()}).observe($('modal'),{attributes:true,attributeFilter:['class']})}catch(_){}
try{if(alsNat()){var _o=JSON.parse(NotisNative.listAlarmSounds()||'{}');if(_o.cur&&_o.cur!=='default'&&cfg.alSnd.k==='default')cfg.alSnd={k:_o.cur,n:_o.name||''};else NotisNative.setAlarmSound(cfg.alSnd.k,cfg.alSnd.n||'')}}catch(_){}
alsRender();
/* v183: Volum alarmă (cfg.alVol 0..100, default 60) + Sună și în modul silențios (cfg.alSil, default off); native plays at this volume and respects silent/vibrate */
if(typeof cfg.alVol!=='number')cfg.alVol=60;if(typeof cfg.alSil!=='boolean')cfg.alSil=false;
function alG(){var f=Math.max(0,Math.min(100,+cfg.alVol||0))/100;return f*f}window.alG=alG;
function alNatMode(){try{if(window.NotisNative&&NotisNative.ringMode)return NotisNative.ringMode()|0}catch(_){}return 0}window.alNatMode=alNatMode;
function alVolSync(){try{if(window.NotisNative&&NotisNative.setAlarmVol){NotisNative.setAlarmVol(cfg.alVol|0);NotisNative.setAlarmSilent(!!cfg.alSil)}}catch(_){}}
function alVolUI(){var r=$('alVol');if(!r)return;r.value=cfg.alVol;$('alVolV').textContent=(cfg.alVol|0)+'%';$('alSil').checked=!!cfg.alSil;$('alVolL').textContent=TR('Volum alarmă');$('alVolT').textContent=TR('Test');$('alSilL').textContent=TR('Sună și în modul silențios');$('alSilH').textContent=TR('Implicit: pe silențios alarma nu sună, pe vibrații doar vibrează. Notificarea apare mereu.')}
var alTestA=null;function alTest(){try{if(window.NotisNative&&NotisNative.testAlarm){NotisNative.testAlarm();return}}catch(_){}
 var k=(cfg.alSnd&&cfg.alSnd.k)||'default';try{if(alTestA){alTestA.pause();alTestA=null}}catch(_){}
 if(k.indexOf('b:')===0){try{alTestA=new Audio('snd/'+k.slice(2)+'.mp3');alTestA.volume=alG();var pr=alTestA.play();if(pr&&pr.catch)pr.catch(function(){});setTimeout(function(){try{alTestA&&alTestA.pause()}catch(_){}},6000)}catch(_){}return}
 try{unlockAudio();if(!actx)return;var t0=actx.currentTime,gg=Math.max(.0002,.25*alG());[0,.25,.5].forEach(function(o){var g=actx.createGain(),os=actx.createOscillator();os.type='square';os.frequency.value=880;g.gain.setValueAtTime(.0001,t0+o);g.gain.exponentialRampToValueAtTime(gg,t0+o+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+o+.18);os.connect(g);g.connect(actx.destination);os.start(t0+o);os.stop(t0+o+.2)})}catch(_){}}
try{$('alVol').addEventListener('input',function(){cfg.alVol=Math.max(0,Math.min(100,parseInt(this.value,10)||0));$('alVolV').textContent=cfg.alVol+'%';alVolSync()});
 $('alVol').addEventListener('change',function(){try{saveCfg()}catch(_){try{saveNotes(true)}catch(_){}}});
 $('alSil').addEventListener('change',function(){cfg.alSil=!!this.checked;alVolSync();try{saveCfg()}catch(_){try{saveNotes(true)}catch(_){}}});
 $('alVolT').addEventListener('click',alTest)}catch(_){}
alVolUI();alVolSync();
/* v10: IME-safe single-line fields. Never rewrite values while composing; a newline in a checklist item = Enter (Android IMEs send keyCode 229, no reliable keydown) */
var imeOn=false,imeEnter=null,lastKeyAct=0;
document.addEventListener('compositionstart',function(){imeOn=true},true);
document.addEventListener('compositionend',function(e){imeOn=false;var t=e.target;setTimeout(function(){if(imeEnter&&imeEnter===t){imeEnter=null;itemEnter(t)}else if(t&&(isItem(t)||t.id==='nfTitle'||t.id==='prIn')&&/[\r\n]/.test(t.value||''))nlFix(t)},0)},true);
function isItem(t){return t&&t.classList&&t.classList.contains('cit')}
function itemEnter(t,rest){if(!document.contains(t))return;if(t.closest('#nfBlocks'))mEnter(t,rest);else if(t.closest('#nfItems'))chkEnter(t,rest)}
function itemBack(t){if(Date.now()-lastKeyAct<120)return;lastKeyAct=Date.now();if(t.closest('#nfBlocks'))mBack(t);else if(t.closest('#nfItems'))chkBack(t)}
function nlFix(t){var v=t.value;if(!/[\r\n]/.test(v))return;var k=v.search(/[\r\n]/),bf=v.slice(0,k),af=v.slice(k).replace(/^[\r\n]+/,'').replace(/[\r\n]+/g,' ');
 if(isItem(t)){t.value=bf;t.dispatchEvent(new Event('input',{bubbles:true}));itemEnter(t,af);return}
 var p=t.selectionStart;t.value=v.replace(/[\r\n]+/g,' ');try{t.setSelectionRange(p,p)}catch(_){}
 if(t.id==='nfTitle'){t.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))}}
document.addEventListener('beforeinput',function(e){var t=e.target;if(!t||!(isItem(t)||t.id==='nfTitle'||t.id==='prIn'))return;
 if(e.inputType==='insertLineBreak'||e.inputType==='insertParagraph'){e.preventDefault();if(isItem(t)){if(imeOn||e.isComposing)imeEnter=t;else{lastKeyAct=Date.now();itemEnter(t)}}else t.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return}
 if(e.inputType==='deleteContentBackward'&&isItem(t)&&!t.value&&!imeOn){e.preventDefault();itemBack(t)}},true);
document.addEventListener('keydown',function(e){var t=e.target;if(!isItem(t))return;if(e.isComposing||e.keyCode===229)return;
 if(e.key==='Enter'){e.preventDefault();e.stopPropagation();if(Date.now()-lastKeyAct<120)return;lastKeyAct=Date.now();itemEnter(t);return}
 if(e.key==='Backspace'&&!t.value){e.preventDefault();e.stopPropagation();itemBack(t)}},true);
document.addEventListener('input',function(e){var t=e.target;if(!t||!(isItem(t)||t.id==='nfTitle'||t.id==='prIn'))return;if(imeOn||e.isComposing)return;if(/[\r\n]/.test(t.value))nlFix(t)},true);
function fitSoon(t){if(t._fitq)return;t._fitq=1;requestAnimationFrame(function(){t._fitq=0;mFit(t)})}
/* ---------- v8: photos on notes (IndexedDB 'notis-photos'; locked notes: bytes AES-GCM encrypted with the note key) ---------- */
var phDB=null;function phOpen(){if(phDB)return phDB;phDB=new Promise(function(res,rej){var r=indexedDB.open(DEMO?'notis-photos-demo':'notis-photos',1);r.onupgradeneeded=function(){var s=r.result.createObjectStore('p',{keyPath:'id'});s.createIndex('note','note')};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}});return phDB}
function phTx(mode,fn){return phOpen().then(function(db){return new Promise(function(res,rej){var t=db.transaction('p',mode),s=t.objectStore('p'),out=fn(s);t.oncomplete=function(){res(out&&out.result!==undefined?out.result:out)};t.onerror=function(){rej(t.error)}})})}
function phAll(){return phTx('readonly',function(s){return s.getAll()})}
function phOf(nid,all){return phTx('readonly',function(s){return s.index('note').getAll(nid)}).then(function(a){return(a||[]).filter(function(r){return all||r.k!=='a'}).sort(function(x,y){return x.ts-y.ts})})}
function phPut(r){return phTx('readwrite',function(s){s.put(r)})}
function phDel(id){return phTx('readwrite',function(s){s.delete(id)})}
function phCount(n){return phOf(n.id).then(function(a){var c=a.length;if((n.ph||0)!==c){if(c)n.ph=c;else delete n.ph;nFlush()}return a})}
function phCompress(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var w=im.naturalWidth,h=im.naturalHeight,s=Math.min(1,1600/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.round(w*s);c.height=Math.round(h*s);
 c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){b?res(b):rej(new Error('blob'))},'image/jpeg',0.8)};im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('img'))};im.src=u})}
function phSeal(key,buf){var iv=crypto.getRandomValues(new Uint8Array(12));return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,buf).then(function(ct){return{iv:b64e(iv),buf:ct}})}
function phBlob(n,r){if(!r.iv)return Promise.resolve(new Blob([r.buf],{type:r.mt||'image/jpeg'}));if(!n._key)return Promise.reject(new Error('locked'));
 return crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(r.iv)},n._key,r.buf).then(function(b){return new Blob([b],{type:r.mt||'image/jpeg'})})}
function phLockAll(nid,key){return phOf(nid,1).then(function(a){return Promise.all(a.filter(function(r){return !r.iv}).map(function(r){return phSeal(key,r.buf).then(function(x){r.iv=x.iv;r.buf=x.buf;return phPut(r)})}))})}
function phUnlockAll(nid,key){return phOf(nid,1).then(function(a){return Promise.all(a.filter(function(r){return r.iv}).map(function(r){return crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(r.iv)},key,r.buf).then(function(b){delete r.iv;r.buf=b;return phPut(r)})}))})}
var phURLs=[],phGen=0;
function phClear(){if(!fullId)phCacheClear();phURLs.forEach(function(u){URL.revokeObjectURL(u)});phURLs=[];$('nfPh').innerHTML='';$('noteFull').classList.remove('hasph')}
function phFit(){var ta=$('nfText');if($('noteFull').classList.contains('hasph')){ta.style.height='auto';ta.style.height=ta.scrollHeight+'px'}else ta.style.height=''}
function phRender(){var g=++phGen,n=fullId&&findN(fullId);if(!n){phClear();phFit();return Promise.resolve()}if(n.type==='mix'){phClear();phFit();return phCount(n).then(function(a){if(g===phGen)mAdopt(n,a)})}
 return phCount(n).then(function(a){if(g!==phGen)return;return Promise.all(a.map(function(r){return phBlob(n,r).then(function(b){return{r:r,b:b}},function(){return null})})).then(function(xs){if(g!==phGen)return;phClear();var box=$('nfPh');
  xs.forEach(function(x){if(!x)return;var u=URL.createObjectURL(x.b);phURLs.push(u);var d=document.createElement('div');d.className='phi';d.dataset.id=x.r.id;d.dataset.u=u;d.style.backgroundImage='url('+u+')';box.appendChild(d)});
  $('noteFull').classList.toggle('hasph',box.children.length>0);phFit()})})}
function phAdd(files){var n=fullId&&findN(fullId);
 if(!n){var now=new Date().toISOString();n={id:ntUid(),text:$('nfText').value||'',ts:now,createdAt:now,updatedAt:now,tab:noteTab,fd:nFolder||undefined};notes.push(n);fullId=n.id;fullIsNew=true}
 var nid=n.id,key=n.lock?n._key:null;if(n.lock&&!key){toast(TR('Notiță blocată'));return}
 var list=[].slice.call(files||[]);if(!list.length)return;
 list.reduce(function(p,f,i){return p.then(function(){return phCompress(f).then(function(b){return b.arrayBuffer()}).then(function(buf){return key?phSeal(key,buf):{buf:buf}}).then(function(x){var r={id:ntUid(),note:nid,ts:Date.now()+i,buf:x.buf};if(x.iv)r.iv=x.iv;return phPut(r)}).catch(function(e){console.warn(e);toast(TR('Nu am putut adăuga poza'))})})},Promise.resolve())
  .then(function(){var m=findN(nid);if(m){m.updatedAt=new Date().toISOString();return phCount(m)}}).then(function(){nFlush();if(fullId===nid)phRender()})}
function phGC(){return phAll().then(function(a){var ids={};notes.forEach(function(n){ids[n.id]=1});return Promise.all(a.filter(function(r){return !ids[r.note]&&String(r.note).indexOf('rec:')!==0&&String(r.note).indexOf('pw:')!==0&&String(r.note).indexOf('tk:')!==0}).map(function(r){return phDel(r.id)}))}).catch(function(){})}
function phAb2b64(buf){var u=new Uint8Array(buf),s='',C=0x8000;for(var i=0;i<u.length;i+=C)s+=String.fromCharCode.apply(null,u.subarray(i,i+C));return btoa(s)}
function phB642ab(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer}
function phDump(){return phAll().then(function(a){var ids={};notes.forEach(function(n){ids[n.id]=1});var used=0,skip=0;window.__qrSkip=0;
 var q=a.filter(function(r){return String(r.note).indexOf('rec:')===0}).sort(function(x,y){return y.ts-x.ts}),qs={};q.forEach(function(r){var b=r.buf&&r.buf.byteLength||0;if(used+b>QR_CAP){qs[r.id]=1;skip++}else used+=b});window.__qrSkip=skip;
 return a.filter(function(r){return ids[r.note]||String(r.note).indexOf('rec:')===0||String(r.note).indexOf('pw:')===0||String(r.note).indexOf('tk:')===0}).map(function(r){if(qs[r.id])return{id:r.id,note:r.note,ts:r.ts,k:r.k,mt:r.mt,dur:r.dur,noAudio:1};var o={id:r.id,note:r.note,ts:r.ts,data:phAb2b64(r.buf)};if(r.iv)o.iv=r.iv;if(r.k){o.k=r.k;o.mt=r.mt;o.dur=r.dur}return o})}).catch(function(){return []})}
function phLoad(list){if(!Array.isArray(list)||!list.length)return Promise.resolve(0);return Promise.all(list.map(function(o){if(!o||!o.id||!o.note||!o.data)return null;var r={id:o.id,note:o.note,ts:o.ts||Date.now(),buf:phB642ab(o.data)};if(o.iv)r.iv=o.iv;if(o.k){r.k=o.k;r.mt=o.mt;r.dur=o.dur}return phPut(r)})).then(function(){return list.length})}
/* v156: quick record 🔴 (editor toolbar) → RECORDINGS tab (kind 'rec'). Audio stays on the device: blobs in the same IndexedDB store as note recordings (note:'rec:'+id, never garbage-collected), metadata in ns_rec (+ns_rec_bak = previous copy). Export backup carries the audio as base64 up to QR_CAP; anything above is listed as noAudio and the user is told. */
var QR=null,qrP=null,QR_CAP=25*1048576,QR_MAX=1800;
function qrNorm(r){if(!r||typeof r!=='object'||!Array.isArray(r.list))return null;r.list=r.list.filter(function(x){return x&&x.id&&x.aid});if(r.vis!==0&&r.vis!==1)r.vis=null;return r}
function qrLoad(){return qrNorm(LS.get('ns_rec',null))||qrNorm(LS.get('ns_rec_bak',null))||{list:[],vis:null,ask:null}}
var RECS=qrLoad();
function qrSave(){try{var o=LS.get('ns_rec',null);if(o)LS.set('ns_rec_bak',o)}catch(_){}LS.set('ns_rec',RECS)}
function qrD(ts){return fDate(new Date(ts),1)}
function qrFind(id){for(var i=0;i<RECS.list.length;i++)if(RECS.list[i].id===id)return RECS.list[i];return null}
function qrTab(make){var t=noteTabs.filter(function(x){return x.kind==='rec'})[0];if(t||!make)return t||null;var id='rec';while(findNT(id))id='rec'+Math.random().toString(36).slice(2,5);
 t={id:id,name:'RECORDINGS 🔴',color:'#ffffff',kind:'rec'};if(RECS.vis===0)t.off=1;noteTabs.push(t);saveNotes();return t}
function qrCan(){return !!(recNat()||(recMime()!==null&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia))}
function qrMH(){return QR?'<i class="qrdot"></i> '+esc(TR('Oprește'))+' ⏹ '+recFmt(QR.t0?(Date.now()-QR.t0)/1000:0):esc(TR('Record'))+' 🔴'}
function qrMI(){var e=document.querySelector('#nrLM .nrrc');if(e){e.innerHTML=qrMH();e.classList.toggle('on',!!QR)}var b=$('nfRead');if(b)b.classList.toggle('qron',!!QR)}
function qrUi(){var on=!!QR;qrMI();var r=$('qrBar');if(!r){r=document.createElement('div');r.id='qrBar';r.setAttribute('role','status');r.innerHTML='<i class="qrdot"></i><span class="qrtm">0:00</span><button type="button" class="btn pill qrst"></button>';document.body.appendChild(r);r.querySelector('.qrst').addEventListener('click',function(){qrStop(true)})}
 r.querySelector('.qrst').textContent='■ '+TR('Oprește');r.classList.toggle('show',on);if(!on)r.querySelector('.qrtm').textContent='0:00'}
function qrTick(){if(!QR||!QR.t0)return;var s=(Date.now()-QR.t0)/1000,t=$('qrBar');if(t)t.querySelector('.qrtm').textContent=recFmt(s);qrMI();if(s>=QR_MAX)qrStop(true)}
function qrOthers(){try{if(dict.on)dictStop()}catch(_){}try{if(speaking)stopSpeaking()}catch(_){}qrPStop()}
function qrStart(){if(QR){qrStop(true);return}if(REC)return;qrOthers();
 var mt=recMime();if(mt!==null&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){QR={wait:1};qrUi();
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){if(!QR||!QR.wait){st.getTracks().forEach(function(t){t.stop()});return}
   var mr=mt?new MediaRecorder(st,{mimeType:mt}):new MediaRecorder(st),ch=[],q={mr:mr,st:st,ch:ch,t0:Date.now(),mt:mt};QR=q;
   mr.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data)};
   mr.onstop=function(){st.getTracks().forEach(function(t){t.stop()});clearInterval(q.iv);if(q.keep&&ch.length)qrStore(new Blob(ch,{type:(mr.mimeType||mt||'audio/webm').split(';')[0]}),(Date.now()-q.t0)/1000)};
   mr.start(1000);q.iv=setInterval(qrTick,250);qrUi();toast(TR('Înregistrez… vorbește acum'))}).catch(function(e){QR=null;qrUi();var n=e&&e.name||'';toast(n==='NotAllowedError'||n==='SecurityError'||n==='PermissionDeniedError'?TR('Fără permisiunea Microfon nu pot înregistra'):TR('Microfonul nu este disponibil'))});return}
 var N=recNat();if(!N){toast(TR('Microfonul nu este disponibil'));return}var r='';try{r=N.recStart()}catch(e){r='err:'+e.message}
 if(r==='perm'){window.__recPerm=function(ok){window.__recPerm=null;if(ok)qrStart();else toast(TR('Fără permisiunea Microfon nu pot înregistra'))};return}
 if(r!=='ok'){toast(TR('Microfonul nu este disponibil')+' ('+r+')');return}
 QR={nat:N,t0:Date.now()};QR.iv=setInterval(qrTick,250);qrUi();toast(TR('Înregistrez… vorbește acum'))}
function qrStop(keep){var q=QR;if(!q)return;QR=null;clearInterval(q.iv);qrUi();if(q.wait)return;
 if(q.nat){var b64='';try{b64=keep?q.nat.recStop():(q.nat.recCancel(),'')}catch(_){}if(!keep)return;if(!b64||b64.indexOf('err:')===0){toast(TR('Nu am putut salva înregistrarea'));return}
  var bin=atob(b64),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);qrStore(new Blob([u],{type:'audio/mp4'}),(Date.now()-q.t0)/1000);return}
 q.keep=keep;try{q.mr.stop()}catch(_){}}
function qrStore(blob,dur){var ts=Date.now(),id='r'+ts.toString(36)+Math.random().toString(36).slice(2,6),aid='a'+id,mt=blob.type||'audio/webm';
 return blob.arrayBuffer().then(function(buf){return phPut({id:aid,note:'rec:'+id,ts:ts,buf:buf,k:'a',mt:mt,dur:Math.round(dur)})}).then(function(){
  RECS.list.unshift({id:id,aid:aid,ts:ts,dur:Math.round(dur),mt:mt,name:TR('Înregistrare')+' '+qrD(ts),sz:blob.size});RECS.ask=id;qrSave();
  var t=qrTab(true);if(RECS.vis===0)t.off=1;saveNotes();renderNotes();qrAsk(id)}).catch(function(e){console.warn(e);toast(TR('Nu am putut salva înregistrarea'))})}
function qrQ(){return '<div class="qrq"><span>'+esc(TR('Vrei să fie tabul cu înregistrări vizibil?'))+'</span><span class="qrqb"><button type="button" class="btn pill'+(RECS.vis===1?' cur':'')+'" data-qv="1">'+esc(TR('Da'))+'</button><button type="button" class="btn pill'+(RECS.vis===0?' cur':'')+'" data-qv="0">'+esc(TR('Nu'))+'</button></span></div>'}
function qrAsk(id){var r=qrFind(id),c=$('qrAsk');if(!r)return;if(!c){c=document.createElement('div');c.id='qrAsk';c.setAttribute('role','dialog');document.body.appendChild(c);
  c.addEventListener('click',function(e){var v=e.target.closest('[data-qv]');if(v){qrVis(+v.dataset.qv);return}if(e.target.closest('.qrgo')){c.classList.remove('show');qrGo();return}if(e.target.closest('.qrx'))c.classList.remove('show')})}
 c.innerHTML='<div class="qrah"><i class="qrdot"></i><b class="ux">'+esc(TR('Înregistrare salvată'))+'</b><button type="button" class="qrx" aria-label="'+esc(TR('Închide'))+'">×</button></div><div class="qran"><span class="ux">'+esc(r.name)+'</span><span class="qrd">'+esc(qrD(r.ts))+'</span></div>'+qrQ()+'<div class="qrh"'+(RECS.vis===0?'':' hidden')+'>'+esc(TR('Se găsesc în Setări → Taburi'))+'</div>'+(RECS.vis===0?'':'<button type="button" class="lk qrgo">'+esc(TR('Deschide'))+' →</button>');
 c.classList.add('show');clearTimeout(qrAsk.t);qrAsk.t=setTimeout(function(){c.classList.remove('show')},15000)}
function qrVis(v){RECS.vis=v?1:0;RECS.ask=null;qrSave();var t=qrTab(true);if(v)delete t.off;else t.off=1;saveNotes();renderNotes();var c=$('qrAsk');if(c&&c.classList.contains('show')){var r=RECS.list[0];if(r){qrAsk(r.id)}}if(!v)toast(TR('Se găsesc în Setări → Taburi'))}
function qrGo(){var t=qrTab(false);if(!t||t.off)return;try{if($('noteFull').classList.contains('show'))fullClose()}catch(_){}notesOpen();noteTab=t.id;nFolder='';saveNotes(true);renderNotes()}
function qrRender(){var h='<div class="qrv"><button type="button" class="btn pill qrnew" data-qa="new"><i class="qrdot"></i> '+esc(TR('Înregistrare rapidă'))+'</button>';
 if(!RECS.list.length)h+='<div class="qremp">'+esc(TR('Încă nu ai înregistrări. Atinge 🔴 din bara de jos a unei notițe.'))+'</div>';
 RECS.list.slice().sort(function(a,b){return b.ts-a.ts}).forEach(function(r){if(RECS.ask===r.id)h+=qrQ();var pl=qrP&&qrP.id===r.id;
  h+='<div class="qri'+(pl&&!qrP.a.paused?' play':'')+'" data-id="'+esc(r.id)+'"><div class="qr1"><button type="button" class="qrpb" data-qa="play" aria-label="▶"></button><button type="button" class="qrn ux" data-qa="ren">'+esc(r.name||TR('Înregistrare'))+'</button><span class="qrd">'+esc(qrD(r.ts))+'</span></div>'+
  '<div class="qr2"><span class="qrbar"><i></i></span><span class="qrt">'+(pl?recFmt(qrP.a.currentTime)+' / ':'')+recFmt(r.dur||0)+'</span><button type="button" class="qrb shGo qrsh" data-qa="sh" aria-label="'+esc(TR('Distribuie'))+'"><svg class="shI" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/></svg></button><button type="button" class="qrb" data-qa="del" aria-label="'+esc(TR('Șterge'))+'">🗑</button></div></div>'});
 return h+'</div>'}
function qrBlob(r){return phGet(r.aid).then(function(x){if(!x||!x.buf)throw new Error('missing');return new Blob([x.buf],{type:x.mt||r.mt||'audio/webm'})})}
function qrPStop(){if(!qrP)return;try{qrP.a.pause()}catch(_){}try{URL.revokeObjectURL(qrP.u)}catch(_){}var w=document.querySelector('.qri[data-id="'+qrP.id+'"]');qrP=null;if(w){w.classList.remove('play');w.querySelector('.qrbar i').style.width='0'}}
function qrPlay(id){var r=qrFind(id);if(!r)return;if(QR){toast(TR('Înregistrez… vorbește acum'));return}var w=function(){return document.querySelector('.qri[data-id="'+id+'"]')};
 if(qrP&&qrP.id===id){var e=w();if(qrP.a.paused){qrP.a.play();e&&e.classList.add('play')}else{qrP.a.pause();e&&e.classList.remove('play')}return}qrPStop();try{auStop()}catch(_){}
 qrBlob(r).then(function(b){var u=URL.createObjectURL(b),a=new Audio(u);qrP={id:id,a:a,u:u};var e=w();if(e)e.classList.add('play');
  a.ontimeupdate=function(){var e=w();if(!e)return;var d=a.duration&&isFinite(a.duration)?a.duration:(r.dur||1);e.querySelector('.qrbar i').style.width=Math.min(100,a.currentTime/d*100)+'%';e.querySelector('.qrt').textContent=recFmt(a.currentTime)+' / '+recFmt(r.dur||d)};
  a.onended=function(){qrPStop();var e=w();if(e)e.querySelector('.qrt').textContent=recFmt(r.dur||0)};var p=a.play();if(p&&p.catch)p.catch(function(){})}).catch(function(){toast(TR('Înregistrarea lipsește'))})}
function qrRen(id){var r=qrFind(id);if(!r)return;jvPrompt(TR('Redenumește'),r.name||'',function(v){r.name=v.slice(0,80);qrSave();renderNotes()})}
function qrDel(id){var r=qrFind(id);if(!r)return;var cf=$('cfModal').querySelector('.cftxt'),ok=$('cfOk'),no=$('cfNo'),t0=cf.textContent,o0=ok.textContent,n0=no.textContent;cf.textContent=TR('Ștergi înregistrarea?')+' '+(r.name||'');ok.textContent=TR('Da');no.textContent=TR('Nu');
 function back(){cf.textContent=t0;ok.textContent=o0;no.textContent=n0}
 jvConfirm(function(){back();if(qrP&&qrP.id===id)qrPStop();RECS.list=RECS.list.filter(function(x){return x.id!==id});if(RECS.ask===id)RECS.ask=null;qrSave();phDel(r.aid).catch(function(){});renderNotes()});var nf=no.onclick;no.onclick=function(){back();nf&&nf()}}
function qrExt(mt){return /mp4|m4a|aac/.test(mt)?'m4a':/ogg/.test(mt)?'ogg':'webm'}
function qrShare(id){var r=qrFind(id);if(!r)return;qrBlob(r).then(function(b){var nm=(r.name||'rec').replace(/[^\w .-]+/g,'_').trim()+'.'+qrExt(b.type);
  try{var f=new File([b],nm,{type:b.type});if(navigator.canShare&&navigator.canShare({files:[f]}))return navigator.share({files:[f],title:r.name}).catch(function(){})}catch(_){}
  if(window.NotisNative&&NotisNative.shareAudio)return b.arrayBuffer().then(function(buf){var ok=false;try{ok=NotisNative.shareAudio(phAb2b64(buf),qrExt(b.type),r.name||'')}catch(_){}if(!ok)toast(TR('Nu am putut salva înregistrarea'))});
  var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=nm;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},800)}).catch(function(){toast(TR('Înregistrarea lipsește'))})}
/* tab view: spView for kind 'rec' */
function qrWrapSP(){var o=window.spRender;if(o.__qr)return;window.spRender=function(){var v=$('spView'),t=findNT(noteTab);if(!v||!t||t.kind!=='rec')return o.apply(this,arguments);
 var on=!nTrash&&!nFold(nQ).trim()&&!tbHidden(noteTab)&&!nFolder;$('notesPg').classList.toggle('sptab',on);if(!on){v.innerHTML='';v.hidden=true;return}v.hidden=false;v.innerHTML=qrRender();
 var has=notes.some(function(n){return !n.del&&n.tab===noteTab&&(n.fd||'')===''&&(n.lock||String(n.text||'').trim())})||noteFolders.some(function(f){return f.tab===noteTab&&!f.del});$('notesPg').classList.toggle('spnone',!has)};window.spRender.__qr=1}
document.addEventListener('click',function(e){var v=$('spView');if(!v||!v.contains(e.target))return;var q=e.target.closest('[data-qv]');if(q){qrVis(+q.dataset.qv);return}var a=e.target.closest('[data-qa]');if(!a)return;var it=a.closest('.qri'),id=it&&it.dataset.id,k=a.dataset.qa;
 if(k==='new')qrStart();else if(k==='play')qrPlay(id);else if(k==='ren')qrRen(id);else if(k==='del')qrDel(id);else if(k==='sh')qrShare(id)});
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('#nrLM .nrrc');if(t){e.preventDefault();e.stopPropagation();nrLMClose();qrStart()}},true);
document.addEventListener('visibilitychange',function(){if(document.hidden&&QR)qrStop(true)});window.addEventListener('pagehide',function(){if(QR)qrStop(true)});
/* one mic user at a time: dictation / read-aloud / note recorder stop a running quick recording (saved) */
(function(){function wrapStop(){if(QR){qrStop(true);setTimeout(function(){toast(TR('Înregistrarea s-a oprit și s-a salvat'))},1600);return true}return false}
 var d0=dictStart;dictStart=function(){wrapStop();return d0.apply(this,arguments)};var r0=noteRead;noteRead=function(){wrapStop();return r0.apply(this,arguments)};var o0=recOpen;recOpen=function(){wrapStop();qrPStop();return o0.apply(this,arguments)}})();

/* backup: metadata via spCollect/spApply; audio via phDump (capped) */
(function wrap(){var c=window.spCollect,a=window.spApply;if(!c||c._qr){if(!c)window.addEventListener('load',wrap);return}window.spCollect=function(){var r=c?c.apply(this,arguments):{};r.ns_rec=JSON.parse(JSON.stringify(RECS));return r};
 window.spApply=function(d){var r=a&&a.apply(this,arguments);try{var n=d&&qrNorm(JSON.parse(JSON.stringify(d.ns_rec||null)));if(n){var keep={};RECS.list.forEach(function(x){keep[x.id]=x});n.list.forEach(function(x){delete keep[x.id]});for(var k in keep)n.list.push(keep[k]);n.list.sort(function(x,y){return y.ts-x.ts});RECS=n;qrSave()}}catch(_){}return r};window.spCollect._qr=1})();
window.qrDbg={st:function(){return {QR:!!QR,wait:!!(QR&&QR.wait),RECS:JSON.parse(JSON.stringify(RECS)),tab:qrTab(false)}},start:qrStart,stop:qrStop,can:qrCan,dump:function(){return phDump()},cap:function(v){QR_CAP=v}};
/* no orphan audio: a rec: blob without metadata (e.g. restored from an older snapshot) gets its row back */
function qrHeal(){return phAll().then(function(a){var have={},ch=0;RECS.list.forEach(function(x){have[x.aid]=1});(a||[]).forEach(function(r){if(String(r.note).indexOf('rec:')!==0||have[r.id])return;var id=r.note.slice(4);RECS.list.push({id:id,aid:r.id,ts:r.ts||Date.now(),dur:r.dur||0,mt:r.mt||'audio/webm',name:TR('Înregistrare')+' '+qrD(r.ts||Date.now())});ch=1});
 if(ch){RECS.list.sort(function(x,y){return y.ts-x.ts});qrSave();qrTab(true);saveNotes();renderNotes()}}).catch(function(){})}
setTimeout(qrHeal,1500);
/* viewer */
var pvL=[],pvI=0,pvZ=1,pvX=0,pvY=0,pvP={},pvG=null,pvTap=null,pvTapT=null,pvMoved=false;
function pvApply(anim){var im=$('phImg');im.style.transition=anim?'transform .2s ease':'none';im.style.transform='translate('+pvX+'px,'+pvY+'px) scale('+pvZ+')'}
function pvShow(i){pvI=i;pvZ=1;pvX=0;pvY=0;$('phImg').src=pvL[i];pvApply();$('pvCount').textContent=pvL.length>1?(i+1)+' / '+pvL.length:''}
function phView(u,list){pvL=(list&&list.length?list:[u]).filter(Boolean);var i=pvL.indexOf(u);var v=$('phView');v.classList.add('show');pvShow(i<0?0:i);try{history.pushState({jvPh:1},'')}catch(_){}}
function phViewClose(back){var v=$('phView');if(!v.classList.contains('show'))return;v.classList.remove('show');clearTimeout(pvTapT);pvP={};$('phImg').removeAttribute('src');if(back){nIgnorePop=false;try{history.back()}catch(_){}}}
function pvClamp(){var r=$('phImg').getBoundingClientRect(),W=innerWidth,H=innerHeight;if(pvZ<=1){pvZ=1;pvX=0;pvY=0;return}
 var bw=r.width/((parseFloat(($('phImg').style.transform.match(/scale\(([^)]+)\)/)||[0,1])[1]))||1)*pvZ,bh=r.height/((parseFloat(($('phImg').style.transform.match(/scale\(([^)]+)\)/)||[0,1])[1]))||1)*pvZ,mx=Math.max(0,(bw-W)/2),my=Math.max(0,(bh-H)/2);pvX=Math.max(-mx,Math.min(mx,pvX));pvY=Math.max(-my,Math.min(my,pvY))}
(function(){var v=$('phView');
 v.addEventListener('pointerdown',function(e){e.preventDefault();try{v.setPointerCapture(e.pointerId)}catch(_){}pvP[e.pointerId]={x:e.clientX,y:e.clientY};var ids=Object.keys(pvP);pvMoved=false;
  if(ids.length===2){var a=pvP[ids[0]],b=pvP[ids[1]];pvG={pinch:1,d:Math.hypot(a.x-b.x,a.y-b.y)||1,m:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},z:pvZ,x:pvX,y:pvY}}else pvG={x0:e.clientX,y0:e.clientY,x:pvX,y:pvY}});
 v.addEventListener('pointermove',function(e){if(!pvP[e.pointerId]||!pvG)return;pvP[e.pointerId]={x:e.clientX,y:e.clientY};var ids=Object.keys(pvP);
  if(pvG.pinch&&ids.length>=2){var a=pvP[ids[0]],b=pvP[ids[1]],d=Math.hypot(a.x-b.x,a.y-b.y),m={x:(a.x+b.x)/2,y:(a.y+b.y)/2},cx=innerWidth/2,cy=innerHeight/2,nz=Math.max(1,Math.min(6,pvG.z*d/pvG.d)),k=nz/pvG.z;
   pvX=(m.x-cx)-((pvG.m.x-cx)-pvG.x)*k;pvY=(m.y-cy)-((pvG.m.y-cy)-pvG.y)*k;pvZ=nz;pvMoved=true;pvApply();return}
  var dx=e.clientX-pvG.x0,dy=e.clientY-pvG.y0;if(Math.abs(dx)>8||Math.abs(dy)>8)pvMoved=true;
  if(pvZ>1){pvX=pvG.x+dx;pvY=pvG.y+dy;pvApply()}else if(pvL.length>1){pvX=dx;pvApply()}});
 function up(e){if(!pvP[e.pointerId])return;delete pvP[e.pointerId];var ids=Object.keys(pvP);
  if(ids.length){var q=pvP[ids[0]];pvG={x0:q.x,y0:q.y,x:pvX,y:pvY};return}
  var g=pvG;pvG=null;if(!g)return;
  if(g.pinch||pvZ>1){if(pvZ<1.05){pvZ=1}pvClamp();pvApply(true);if(!pvMoved)tap(e);return}
  var dx=e.clientX-g.x0;
  if(pvL.length>1&&Math.abs(dx)>60){var n=pvI+(dx<0?1:-1);if(n>=0&&n<pvL.length){pvShow(n);return}}
  pvX=0;pvApply(true);if(!pvMoved)tap(e)}
 function tap(e){var now=Date.now();if(pvTap&&now-pvTap.t<300&&Math.hypot(e.clientX-pvTap.x,e.clientY-pvTap.y)<40){clearTimeout(pvTapT);pvTap=null;
   if(pvZ>1){pvZ=1;pvX=0;pvY=0}else{var cx=innerWidth/2,cy=innerHeight/2;pvZ=2.5;pvX=-(e.clientX-cx)*1.5;pvY=-(e.clientY-cy)*1.5;pvClamp()}pvApply(true);return}
  pvTap={t:now,x:e.clientX,y:e.clientY};clearTimeout(pvTapT);if(pvZ<=1)pvTapT=setTimeout(function(){pvTap=null;if(pvZ<=1)try{history.back()}catch(_){phViewClose(false)}},300)}
 v.addEventListener('pointerup',up);v.addEventListener('pointercancel',function(e){delete pvP[e.pointerId];if(!Object.keys(pvP).length){pvG=null;if(pvZ<=1){pvX=0;pvApply(true)}}});
 v.addEventListener('contextmenu',function(e){e.preventDefault()})})();

[['nfPh',1],['nfBlocks',0]].forEach(function(BX){var box=$(BX[0]),t=null,sx=0,sy=0,fired=false,tgt=null;
 function cancel(){clearTimeout(t);t=null}
 box.addEventListener('pointerdown',function(e){var d=e.target.closest('.phi');if(!d)return;tgt=d;fired=false;sx=e.clientX;sy=e.clientY;cancel();t=setTimeout(function(){t=null;fired=true;try{if(navigator.vibrate)navigator.vibrate(20)}catch(_){}
  var id=d.dataset.id;jvConfirm(function(){phDel(id).then(function(){var n=fullId&&findN(fullId);if(n){n.updatedAt=new Date().toISOString();return phCount(n)}}).then(function(){var m=fullId&&findN(fullId);if(m&&m.type==='mix'){(m.blocks||[]).forEach(function(b){if(b.t==='img')b.ph=(b.ph||[]).filter(function(x){return x!==id})});mNorm(m);mSync(m);nFlush();mRender()}else{nFlush();phRender()}})})},450)});
 box.addEventListener('pointermove',function(e){if(t&&(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10))cancel()});
 box.addEventListener('pointerup',function(e){var d=e.target.closest('.phi');if(t){cancel();if(d&&d===tgt&&!fired)phView(d.dataset.u,[].map.call(d.parentNode.querySelectorAll('.phi'),function(x){return x.dataset.u}))}});
 box.addEventListener('pointercancel',cancel);box.addEventListener('contextmenu',function(e){if(e.target.closest('.phi')&&!e.target.closest('textarea,input,[contenteditable]'))e.preventDefault()});
 if(BX[1])box.addEventListener('click',function(e){e.stopPropagation()})});
$('nfPhIn').addEventListener('change',function(){phPick(this.files)});$('nfPhoto').addEventListener('mousedown',function(e){e.preventDefault()});
$('nfText').addEventListener('input',function(){if($('noteFull').classList.contains('hasph')&&!phFit._q){phFit._q=1;requestAnimationFrame(function(){phFit._q=0;phFit()})}});
setTimeout(phGC,3000);
/* ---------- v9: mixed notes (type 'mix': blocks text/checklist), note color, editor move/alarm ---------- */
var NC=[['',TR('Implicit')],['#103a3d',TR('Turcoaz')],['#163a22',TR('Verde')],['#3a3514',TR('Galben')],['#3e2812',TR('Portocaliu')],['#3d1a1c',TR('Roșu')],['#3a1832',TR('Roz')],['#291c48',TR('Mov')],['#2b313b',TR('Gri')],['#14304a',TR('Albastru')],['#1f2550',TR('Indigo')],['#0f3a33',TR('Smarald')],['#2c3a12',TR('Lime')],['#3a2a1e',TR('Maro')],['#3d1226',TR('Vișiniu')],['#1e2a33',TR('Ardezie')]];
function bUid(){return 'b'+ntUid()}
function mOrder(n,b){var a=b.items||[],P={isort:n.isort,items:a,createdAt:n.createdAt,ts:n.ts};return ciSort(P,a.filter(function(x){return !x.done})).concat(ciSort(P,a.filter(function(x){return x.done})))}
function mSync(n){if(n.type!=='mix')return;var L=[];(n.blocks||[]).forEach(function(b){if(b.t==='text')L.push(b.v||'');else mOrder(n,b).forEach(function(x){if(x.text.trim())L.push(x.text.trim())})});n.text=L.join('\n').replace(/^\s*\n/,'').replace(/\n{3,}/g,'\n\n')}
function mNorm(n){var a=[];(n.blocks||[]).forEach(function(b){if(b.t==='chk'&&!(b.items||[]).length)return;if(b.t==='img'&&!(b.ph||[]).length)return;var q=a[a.length-1];if(b.t!=='text'&&q&&q.t!=='text')a.push({id:bUid(),t:'text',v:''});var p=a[a.length-1];if(b.t==='text'&&p&&p.t==='text'){p.v=(p.v||'')+((p.v&&b.v)?'\n':'')+(b.v||'');return}a.push(b)});
 if(!a.length||a[a.length-1].t!=='text')a.push({id:bUid(),t:'text',v:''});n.blocks=a}
function mTouch(n){n.updatedAt=n.editedAt=new Date().toISOString();mSync(n);nSaveSoon()}
function mPre(n){if(nSaveT){clearTimeout(nSaveT);nSaveT=null}mSync(n);saveNotes()}
function mBlk(id){var n=fullId&&findN(fullId);if(!n||!n.blocks)return{};for(var i=0;i<n.blocks.length;i++)if(n.blocks[i].id===id)return{n:n,b:n.blocks[i],i:i};return{n:n}}
function mFit(t){if(!t.isConnected)return;t.style.height='auto';var h=t.scrollHeight;if(!h||!t.offsetWidth){t.style.height='';mRefit();return}t.style.height=h+'px'}
/* v43: re-measure the text blocks after anything that moves/resizes them (photo decode, aspect-ratio change, keyboard/viewport, return from the picker) */
var mRefT=null;function mRefitNow(){var B0=$('nfBlocks');if(!B0)return;B0.querySelectorAll('.nbt').forEach(function(t){if(!t.isConnected||!t.offsetWidth)return;t.style.height='auto';var h=t.scrollHeight;if(h)t.style.height=h+'px'})}
function mRefit(){clearTimeout(mRefT);requestAnimationFrame(mRefitNow);mRefT=setTimeout(function(){mRefitNow();setTimeout(mRefitNow,400)},120)}
function mRender(focus){var n=fullId&&findN(fullId);if(!n||n.type!=='mix')return;mNorm(n);var box=$('nfBlocks');
 if(!focus){var ae=document.activeElement;if(ae&&box.contains(ae)){var bb=ae.closest('[data-b]');if(ae.classList.contains('cit'))focus={b:bb.dataset.b,item:ae.closest('.ci').dataset.id,end:true};else if(ae.classList.contains('nbt'))focus={b:bb.dataset.b,pos:ae.selectionStart}}}
 var h='';n.blocks.forEach(function(b){h+=b.t==='img'&&b.nm?'<div class="nbi nbn" data-b="'+b.id+'">'+(b.ph||[]).map(function(id){return '<div class="phi phn" data-id="'+esc(id)+'"'+(phCache[id]?' data-u="'+phCache[id]+'"':'')+'>'+(window.tkIcon||'')+'<span>'+esc(b.nm)+'</span></div>'}).join('')+'</div>':b.t==='img'?'<div class="nbi'+((b.ph||[]).length===1?' one':'')+'" data-b="'+b.id+'">'+(b.ph||[]).map(function(id){return '<div class="phi" data-id="'+esc(id)+'"'+(phCache[id]?' data-u="'+phCache[id]+'" style="background-image:url('+phCache[id]+')'+(phRatio[id]?';aspect-ratio:'+phRatio[id]:'')+'"':'')+'></div>'}).join('')+'</div>':'';if(b.t==='img');else if(b.t==='aud')h+='<div class="nba" data-b="'+b.id+'"><button type="button" class="abt" aria-label="Redă / pauză"><i></i></button><div class="abar"><i></i></div><span class="atm">'+recFmt(b.dur||0)+'</span><button type="button" class="abx" aria-label="Șterge înregistrarea">×</button></div>';else if(b.t==='text')h+='<div class="nbw" data-b="'+b.id+'"><textarea class="nbt" rows="1" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-form-type="other" aria-label="Text">'+esc(b.v||'')+'</textarea></div>';
  else{var a=b.items||[],P={isort:n.isort,items:a,createdAt:n.createdAt,ts:n.ts},un=ciSort(P,a.filter(function(x){return !x.done})),dn=ciSort(P,a.filter(function(x){return x.done}));
   h+='<div class="nbc" data-b="'+b.id+'">'+un.map(chkRow).join('')+'<button type="button" class="ciadd" aria-label="Adaugă element"></button>'+(dn.length?'<div class="cisep"></div>'+dn.map(chkRow).join(''):'')+'</div>'}});
 box.innerHTML=h;box.querySelectorAll('.nbt').forEach(mFit);phFill();mRefit();
 if(focus){var w=box.querySelector('[data-b="'+focus.b+'"]'),el=w&&(focus.item?w.querySelector('.ci[data-id="'+focus.item+'"] .cit'):w.querySelector('.nbt'));if(el){el.focus();var L=focus.pos!=null?focus.pos:(focus.end?el.value.length:0);try{el.setSelectionRange(L,L)}catch(_){}}}}
function mItem(el){var w=el.closest('.nbc'),row=el.closest('.ci');if(!w||!row)return{};var r=mBlk(w.dataset.b);if(!r.b)return{};for(var i=0;i<r.b.items.length;i++)if(r.b.items[i].id===row.dataset.id){r.x=r.b.items[i];r.xi=i;return r}return r}
(function(){var rf=function(){if($('noteFull').classList.contains('mix'))mRefit()};window.addEventListener('resize',rf);if(window.visualViewport)visualViewport.addEventListener('resize',rf);document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')rf()});if(window.ResizeObserver)new ResizeObserver(rf).observe($('nfBlocks'))})();
var mCaret=null;/* last caret: {b:blockId,pos} or {plain:pos} or {chkb:blockId} */
document.addEventListener('focusin',function(e){var t=e.target;if(t===$('nfText'))mCaret={plain:1};else if(t.classList&&t.classList.contains('nbt'))mCaret={b:t.closest('[data-b]').dataset.b};else if(t.closest&&t.closest('.nbc'))mCaret={chkb:t.closest('.nbc').dataset.b};else if(t.closest&&t.closest('#nfChk'))mCaret={chk:1}});
document.addEventListener('selectionchange',function(){var t=document.activeElement;if(!mCaret||!t)return;if(t===$('nfText')||(t.classList&&t.classList.contains('nbt')))mCaret.pos=t.selectionStart});
function mInsert(){mInsertB({id:bUid(),t:'chk',items:[ciNew(false)]})}
function mInsertB(nb){var n=fullId&&findN(fullId);if(n&&n.lock&&!n._key)return;
 if(!n){var now=new Date().toISOString();n={id:ntUid(),text:'',ts:now,createdAt:now,updatedAt:now,tab:noteTab,fd:nFolder||undefined};notes.push(n);fullId=n.id;fullIsNew=true}
 else mPre(n);
 var it=nb.items?nb.items[0]:null;
 if(n.type!=='mix'){var bl=[];if(n.type==='check'){if((n.title||'').trim())bl.push({id:bUid(),t:'text',v:n.title.trim()});if((n.items||[]).length)bl.push({id:bUid(),t:'chk',items:n.items},{id:bUid(),t:'text',v:''});bl.push(nb)}
  else{var v=$('nfText').value||n.text||'',p=(mCaret&&mCaret.plain&&mCaret.pos!=null)?mCaret.pos:v.length;var bf=v.slice(0,p).replace(/\n$/,''),af=v.slice(p).replace(/^\n/,'');if(bf)bl.push({id:bUid(),t:'text',v:bf});bl.push(nb);bl.push({id:bUid(),t:'text',v:af})}
  n.type='mix';n.blocks=bl;delete n.title;delete n.items}
 else{var at=n.blocks.length,c=mCaret;
  if(c&&c.b){var r=mBlk(c.b);if(r.b){var v2=r.b.v||'',p2=c.pos!=null?c.pos:v2.length,bf2=v2.slice(0,p2).replace(/\n$/,''),af2=v2.slice(p2).replace(/^\n/,'');r.b.v=bf2;n.blocks.splice(r.i+1,0,nb,{id:bUid(),t:'text',v:af2});at=-1}}
  else if(c&&c.chkb){var r2=mBlk(c.chkb);if(r2.b){n.blocks.splice(r2.i+1,0,{id:bUid(),t:'text',v:''},nb);at=-1}}
  if(at>=0){var last=n.blocks[n.blocks.length-1];if(last&&last.t==='text'&&!(last.v||'').trim())n.blocks.splice(n.blocks.length-1,0,nb);else n.blocks.push(nb)}}
 mTouch(n);nFlush();mShow(n);mRender(it?{b:nb.id,item:it.id}:null);return n}
function mShow(n){var F=$('noteFull');F.classList.remove('chk');F.classList.toggle('mix',n.type==='mix')}
var B=$('nfBlocks');
B.addEventListener('input',function(e){var t=e.target;if(t.classList.contains('nbt')){var r=mBlk(t.closest('[data-b]').dataset.b);if(!r.b)return;r.b.v=t.value;fitSoon(t);mTouch(r.n);return}
 if(t.classList.contains('cit')){var q=mItem(t);if(!q.x)return;q.x.text=t.value;q.x.updatedAt=new Date().toISOString();mTouch(q.n)}});
var mResT=null;B.addEventListener('focusout',function(e){if(!e.target.classList.contains('cit'))return;clearTimeout(mResT);mResT=setTimeout(function(){var ae=document.activeElement;if(imeOn||(ae&&B.contains(ae)&&(ae.classList.contains('cit')||ae.classList.contains('nbt'))))return;if($('noteFull').classList.contains('mix'))mRender()},250)});
B.addEventListener('change',function(e){if(e.target.type!=='checkbox')return;var q=mItem(e.target);if(!q.x)return;mPre(q.n);q.x.done=e.target.checked;q.x.updatedAt=new Date().toISOString();mTouch(q.n);nFlush();mRender()});
function mAdd(w){var r=mBlk(w.dataset.b);if(!r.b)return;mPre(r.n);var un=r.b.items.filter(function(x){return !x.done}),emp=un.filter(function(x){return !x.text.trim()})[0];if(emp){mRender({b:r.b.id,item:emp.id,end:true});return}
 var last=un[un.length-1],it=ciNew(false),at=last?r.b.items.indexOf(last)+1:0;r.b.items.splice(at,0,it);mTouch(r.n);nFlush();mRender({b:r.b.id,item:it.id})}
B.addEventListener('click',function(e){var t=e.target;if(t.closest('.ciadd')){e.preventDefault();mAdd(t.closest('.nbc'));return}
 if(t.classList.contains('cix')){var q=mItem(t);if(!q.x)return;mPre(q.n);q.b.items.splice(q.xi,1);mTouch(q.n);nFlush();mRender();return}
 if(t===B){var tl=B.querySelectorAll('.nbt'),l=tl[tl.length-1];if(l){l.focus();try{l.setSelectionRange(l.value.length,l.value.length)}catch(_){}}}});
function mEnter(t,rest){var q=mItem(t);if(!q.x)return;mPre(q.n);var it=ciNew(q.x.done);if(rest)it.text=rest;q.b.items.splice(q.xi+1,0,it);mTouch(q.n);nFlush();mRender({b:q.b.id,item:it.id,end:!!rest})}
function mBack(t){var q=mItem(t);if(!q.x)return;mPre(q.n);var ord=mOrder(q.n,q.b),k=ord.indexOf(q.x),prev=ord[k-1];q.b.items.splice(q.xi,1);mTouch(q.n);nFlush();
 if(prev){mRender({b:q.b.id,item:prev.id,end:true});return}if(q.b.items.length){mRender({b:q.b.id,item:mOrder(q.n,q.b)[0].id});return}
 var pb=q.n.blocks[q.i-1];if(pb&&pb.t==='text'){mRender({b:pb.id,pos:(pb.v||'').length});return}mRender()}
$('noteFull').addEventListener('click',function(e){if($('noteFull').classList.contains('mix')&&e.target.classList&&e.target.classList.contains('nfcard')){var tl=B.querySelectorAll('.nbt'),l=tl[tl.length-1];if(l){l.focus();try{l.setSelectionRange(l.value.length,l.value.length)}catch(_){}}}});
function mClean(n){if(!n||n.type!=='mix')return;(n.blocks||[]).forEach(function(b){if(b.t==='chk')b.items=(b.items||[]).filter(function(x){return x.text.trim()})});mNorm(n);mSync(n)}
/* color */
function ncApply(n){var c=n&&n.color||'';c=ncT(c);var fc=$('noteFull').querySelector('.nfcard');/* v190 (3): !important inline — card-opacity rule (#noteFull .nfcard{background-image:..!important}) was overriding the colour */if(c){fc.style.setProperty('background-image','linear-gradient(180deg,'+c+'f2,'+c+'d9)','important');fc.style.setProperty('background-color',c,'important')}else{fc.style.removeProperty('background-image');fc.style.removeProperty('background-color');fc.style.background=''}$('nfColor').classList.toggle('on',!!c)}
function edNote(create){var n=fullId&&findN(fullId);if(!n&&create){var now=new Date().toISOString();n={id:ntUid(),text:$('nfText').value||'',ts:now,createdAt:now,updatedAt:now,tab:noteTab,fd:nFolder||undefined};notes.push(n);fullId=n.id;fullIsNew=true}return n}
/* v189 (3): keep editor popups (colour, move) anchored when the keyboard closes and the toolbar moves */
function edPopPos(){if(!lpCur||!lpCur.edPop||!$('lpMenu').classList.contains('show'))return;var bx=$('lpBox'),r=lpCur.li.getBoundingClientRect();bx.style.left=Math.max(10,Math.min(window.innerWidth-bx.offsetWidth-10,r.left))+'px';bx.style.top=Math.max(10,r.top-bx.offsetHeight-8)+'px'}
window.addEventListener('resize',function(){setTimeout(edPopPos,60)});if(window.visualViewport)visualViewport.addEventListener('resize',function(){setTimeout(edPopPos,60)});
function edPop(btn,html,tag){lpCur={li:btn,edPop:tag};$('lpBox').innerHTML=html;$('lpMenu').classList.add('show');var bx=$('lpBox'),r=btn.getBoundingClientRect();bx.style.left=Math.max(10,Math.min(window.innerWidth-bx.offsetWidth-10,r.left))+'px';bx.style.top=Math.max(10,r.top-bx.offsetHeight-8)+'px';bx.style.bottom='auto';bx.style.right='auto'}
$('nfColor').addEventListener('click',function(){var n=fullId&&findN(fullId),cur=n&&n.color||'',h='<div class="lph">Culoare</div><div class="npal">';NC.forEach(function(k){h+='<button data-ncl="'+k[0]+'" class="'+(cur===k[0]?'cur':'')+'" style="--nc:'+(ncT(k[0])||'#0a1d30')+'" aria-label="'+k[1]+'"><i'+(k[0]?'':' class="ncdef"')+'></i></button>'});edPop(this,h+'</div>','col')});
$('nfMove').addEventListener('click',function(){var n=fullId&&findN(fullId),cur=n?n.tab+'|'+(n.fd||''):noteTab+'|'+(nFolder||'');edPop(this,fdTargets('data-nmt',cur),'mv')});
$('nfAlarm').addEventListener('click',function(){var n=edNote(true);if(!n)return;nFlush();openAlarm({k:'n',id:n.id})});
$('nfChkIns').addEventListener('mousedown',function(e){e.preventDefault()});$('nfChkIns').addEventListener('click',mInsert);
function edState(){var n=fullId&&findN(fullId);$('nfAlarm').classList.toggle('on',!!(n&&alNext(n)));var ai=$('nfAlInfo'),nx=n&&alNext(n);ai.textContent=nx?'⏰ '+alFull(nx)+(n.alarm.rep?' · 🔁 '+alRepTxt(n.alarm):''):'';ai.style.display=nx?'':'none';alPos();ncApply(n)}
function alPos(){var ai=$('nfAlInfo');if(!ai||ai.style.display==='none')return;var vv=window.visualViewport,kb=vv?Math.max(0,innerHeight-vv.height-vv.offsetTop):0,h=document.querySelector('#noteFull .nfhist'),b=58;if(h&&h.offsetWidth){var r=h.getBoundingClientRect();if(r.top<innerHeight)b=innerHeight-r.top+4}ai.style.bottom=(kb>80?kb+8:b)+'px';var d=$('nfDone');if(d&&d.offsetWidth){var q=d.getBoundingClientRect(),y=innerHeight-(kb>80?kb+8:b);ai.style.right=(q.bottom>y-18&&q.top<y)?(innerWidth-q.left+6)+'px':'14px'}}
if(window.visualViewport)visualViewport.addEventListener('resize',function(){try{alPos()}catch(e){}});addEventListener('resize',function(){try{alPos()}catch(e){}});
new MutationObserver(function(){if(!$('alModal').classList.contains('show'))setTimeout(edState,50)}).observe($('alModal'),{attributes:true,attributeFilter:['class']});
/* ---------- v11: inline photo blocks (t:'img', ph:[photo ids]) + crop editor ---------- */
var phCache={},phRatio={};
function phAR(d,id,u){if(!d.closest('.nbi.one'))return;if(phRatio[id]){d.style.aspectRatio=phRatio[id];return}var im=new Image();im.onload=function(){var w=im.naturalWidth,h=Math.max(im.naturalHeight,im.naturalWidth/4);phRatio[id]=w+' / '+h;d.style.aspectRatio=phRatio[id];mRefit()};im.src=u}
function phCacheClear(){for(var k in phCache)try{URL.revokeObjectURL(phCache[k])}catch(_){}phCache={}}
function phGet(id){return phTx('readonly',function(s){return s.get(id)})}
function phFill(){var n=fullId&&findN(fullId);if(!n)return;$('nfBlocks').querySelectorAll('.phi[data-id]').forEach(function(d){var id=d.dataset.id;
 if(phCache[id]){d.style.backgroundImage='url('+phCache[id]+')';d.dataset.u=phCache[id];phAR(d,id,phCache[id]);return}
 phGet(id).then(function(r){if(!r){d.remove();return}return phBlob(n,r).then(function(b){var u=URL.createObjectURL(b);phCache[id]=u;if(document.contains(d)){d.style.backgroundImage='url('+u+')';d.dataset.u=u;phAR(d,id,u)}})}).catch(function(){})})}
function mAdopt(n,list){if(!n||n.type!=='mix')return;var ref={};(n.blocks||[]).forEach(function(b){if(b.t==='img')(b.ph||[]).forEach(function(i){ref[i]=1})});
 var un=list.filter(function(r){return !ref[r.id]}).map(function(r){return r.id});if(!un.length){phFill();return}
 var bl=n.blocks,last=bl[bl.length-1],nb={id:bUid(),t:'img',ph:un};if(last&&last.t==='text'&&!(last.v||'').trim())bl.splice(bl.length-1,0,nb);else bl.push(nb);mNorm(n);mSync(n);saveNotes(true);mRender()}
function phStore(n,blobs){var key=n.lock?n._key:null,ids=[];return blobs.reduce(function(p,b,i){return p.then(function(){return b.arrayBuffer().then(function(buf){return key?phSeal(key,buf):{buf:buf}}).then(function(x){var r={id:ntUid(),note:n.id,ts:Date.now()+i,buf:x.buf};if(x.iv)r.iv=x.iv;ids.push(r.id);return phPut(r)})})},Promise.resolve()).then(function(){return ids})}
function phPick(files){var list=[].slice.call(files||[]);try{$('nfPhIn').value=''}catch(_){}if(!list.length)return;var n0=fullId&&findN(fullId);if(n0&&n0.lock&&!n0._key){toast(TR('Notiță blocată'));return}
 var caret=mCaret?JSON.parse(JSON.stringify(mCaret)):null,out=[];
 list.reduce(function(p,f,i){return p.then(function(){return cropEdit(f,i+1,list.length).then(function(b){if(b)out.push(b)},function(e){console.warn(e)})})},Promise.resolve()).then(function(){if(!out.length)return;
  mCaret=caret;var n=fullId&&findN(fullId);if(!n){var now=new Date().toISOString();n={id:ntUid(),text:$('nfText').value||'',ts:now,createdAt:now,updatedAt:now,tab:noteTab,fd:nFolder||undefined};notes.push(n);fullId=n.id;fullIsNew=true}
  return phStore(n,out).then(function(ids){mCaret=caret;var nb={id:bUid(),t:'img',ph:ids},m=mInsertB(nb);if(!m)return;var bi=m.blocks.indexOf(nb),nx=m.blocks[bi+1];mCaret=nx&&nx.t==='text'?{b:nx.id,pos:0}:null;return phCount(m).then(function(a){mAdopt(m,a);nFlush()})})}).catch(function(e){console.warn(e);toast(TR('Nu am putut adăuga poza'))})}
/* crop editor */
function cropSrc(file){var MX=2048;function fin2(bm){var c;if(window.OffscreenCanvas){c=new OffscreenCanvas(bm.width,bm.height);c.getContext('2d').drawImage(bm,0,0);try{bm.close()}catch(_){}return c.convertToBlob({type:'image/jpeg',quality:0.88})}c=document.createElement('canvas');c.width=bm.width;c.height=bm.height;c.getContext('2d').drawImage(bm,0,0);try{bm.close()}catch(_){}return new Promise(function(r){c.toBlob(function(b){r(b)},'image/jpeg',0.88)})}function fin(src,w,h){var k=Math.min(1,MX/Math.max(w,h));if(k===1&&src.tagName==='IMG')return Promise.resolve(null);var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));c.getContext('2d').drawImage(src,0,0,c.width,c.height);try{src.close&&src.close()}catch(_){}return new Promise(function(r){c.toBlob(function(b){r(b)},'image/jpeg',0.88)})}
 function viaImg(){return new Promise(function(ok,no){var u=URL.createObjectURL(file),i=new Image();i.onload=function(){var w=i.naturalWidth,h=i.naturalHeight;fin(i,w,h).then(function(b){URL.revokeObjectURL(u);ok(b||file)},function(){URL.revokeObjectURL(u);ok(file)})};i.onerror=function(){URL.revokeObjectURL(u);no(new Error('decode'))};i.src=u})}
 var p=(window.createImageBitmap?createImageBitmap(file,{imageOrientation:'from-image'}).then(function(bm){var w=bm.width,h=bm.height,k=Math.min(1,MX/Math.max(w,h));if(k===1)return fin(bm,w,h);var W=Math.round(w*k),H=Math.round(h*k);return createImageBitmap(bm,{resizeWidth:W,resizeHeight:H,resizeQuality:'medium'}).then(function(b2){try{bm.close()}catch(_){}return fin2(b2)},function(){return fin(bm,w,h)})}).then(function(b){if(!b)throw 0;return b}):Promise.reject()).catch(viaImg);
 return Promise.race([p,new Promise(function(_,no){setTimeout(function(){no(new Error('timeout'))},20000)})])}
function cropBusy(on){var o=$('crop');o.classList.toggle('ld',!!on);if(on){o.classList.add('show');nsKick()}}
window.nsKick=function(){try{void document.body.offsetHeight;requestAnimationFrame(function(){requestAnimationFrame(function(){var y=scrollY;scrollTo(0,y+1);scrollTo(0,y);void document.body.offsetHeight})})}catch(_){}};
function cropEdit(file0,idx,tot){try{var ae=document.activeElement;if(ae&&ae.blur&&ae!==document.body)ae.blur()}catch(_){}$('cropImg').removeAttribute('src');$('cropFrame').style.width='0px';cropBusy(1);return cropSrc(file0).then(function(file){return cropEdit1(file,idx,tot)},function(e){console.warn(e);cropBusy(0);$('crop').classList.remove('show');toast(TR('Nu pot deschide poza ')+(tot>1?idx+'/'+tot:''));return null})}
function cropEdit1(file,idx,tot){try{var ae=document.activeElement;if(ae&&ae.blur&&ae!==document.body)ae.blur()}catch(_){}return new Promise(function(done){var ov=$('crop'),st=$('cropStage'),im=$('cropImg'),fr=$('cropFrame'),u=URL.createObjectURL(file);
 var W=0,H=0,rot=0,s0=1,z=1,tx=0,ty=0,C={x:0,y:0,w:0,h:0},ptr={},mode=null,h0=null,c0=null,p0=null,g0=null;
 $('cropCount').textContent=tot>1?idx+' / '+tot:TR('Trage de colțuri sau mută chenarul');
 function dims(){return rot%180?{w:H,h:W}:{w:W,h:H}}
 function sb(){return st.getBoundingClientRect()}
 var dead=false,tries=0;function reset(){if(dead)return;var r=sb(),d=dims();if(r.width<50||r.height<50||!d.w||!d.h){if(++tries<40)setTimeout(reset,120);return}s0=(r.width-32)/d.w;z=1;tx=r.width/2;ty=r.height/2;var s=s0*z,iw=d.w*s,ih=d.h*s,x1=Math.max(16,tx-iw/2),y1=Math.max(16,ty-ih/2),x2=Math.min(r.width-16,tx+iw/2),y2=Math.min(r.height-16,ty+ih/2),ix=Math.min(24,(x2-x1)*.06),iy=Math.min(24,(y2-y1)*.06);x1+=ix;x2-=ix;y1+=iy;y2-=iy;C={x:x1,y:y1,w:x2-x1,h:y2-y1};draw()}
 function draw(){var s=s0*z;im.style.width=W+'px';im.style.height=H+'px';im.style.transform='translate('+(tx-W/2)+'px,'+(ty-H/2)+'px) rotate('+rot+'deg) scale('+s+')';
  fr.style.left=C.x+'px';fr.style.top=C.y+'px';fr.style.width=C.w+'px';fr.style.height=C.h+'px'}
 function pt(e){var r=sb();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 function down(e){e.preventDefault();used=true;try{st.setPointerCapture(e.pointerId)}catch(_){}ptr[e.pointerId]=pt(e);var ids=Object.keys(ptr);
  if(ids.length===2){var a=ptr[ids[0]],b=ptr[ids[1]];mode='pinch';g0={d:Math.hypot(a.x-b.x,a.y-b.y)||1,m:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},z:z,tx:tx,ty:ty};return}
  var hd=e.target.closest('.ch');if(hd){mode='h';h0=hd.dataset.h;c0={x:C.x,y:C.y,w:C.w,h:C.h};p0=ptr[e.pointerId];fr.classList.add('act');return}
  var q0=ptr[e.pointerId];if(q0.x>C.x+8&&q0.x<C.x+C.w-8&&q0.y>C.y+8&&q0.y<C.y+C.h-8){mode='mv';c0={x:C.x,y:C.y,w:C.w,h:C.h};p0=q0;fr.classList.add('act');return}
  mode='pan';p0=ptr[e.pointerId];g0={tx:tx,ty:ty}}
 function move(e){if(!ptr[e.pointerId])return;e.preventDefault();ptr[e.pointerId]=pt(e);var ids=Object.keys(ptr);
  if(mode==='pinch'&&ids.length>=2){var a=ptr[ids[0]],b=ptr[ids[1]],d=Math.hypot(a.x-b.x,a.y-b.y),m={x:(a.x+b.x)/2,y:(a.y+b.y)/2},nz=Math.max(0.3,Math.min(8,g0.z*d/g0.d)),k=nz/g0.z;
   z=nz;tx=m.x-(g0.m.x-g0.tx)*k;ty=m.y-(g0.m.y-g0.ty)*k;draw();return}
  var q=ptr[e.pointerId],dx=q.x-p0.x,dy=q.y-p0.y;
  if(mode==='pan'){tx=g0.tx+dx;ty=g0.ty+dy;draw();return}
  if(mode==='mv'){var r2=sb();C={x:Math.max(0,Math.min(r2.width-c0.w,c0.x+dx)),y:Math.max(0,Math.min(r2.height-c0.h,c0.y+dy)),w:c0.w,h:c0.h};draw();return}
  if(mode==='h'){var M=40,r=sb(),x1=c0.x,y1=c0.y,x2=c0.x+c0.w,y2=c0.y+c0.h;if(/l/.test(h0))x1=Math.min(x2-M,Math.max(0,c0.x+dx));if(/r/.test(h0))x2=Math.max(x1+M,Math.min(r.width,x2+dx));if(/t/.test(h0))y1=Math.min(y2-M,Math.max(0,c0.y+dy));if(/b/.test(h0))y2=Math.max(y1+M,Math.min(r.height,y2+dy));
   C={x:x1,y:y1,w:x2-x1,h:y2-y1};draw()}}
 function up(e){delete ptr[e.pointerId];var ids=Object.keys(ptr);if(!ids.length){mode=null;fr.classList.remove('act')}else if(mode==='pinch'){mode='pan';p0=ptr[ids[0]];g0={tx:tx,ty:ty}}}
 function out(){if(!(C.w>=20&&C.h>=20)){used=false;reset()}var s=s0*z,cw=C.w/s,chh=C.h/s,k=Math.min(1,1600/Math.max(cw,chh)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(cw*k));c.height=Math.max(1,Math.round(chh*k));var x=c.getContext('2d');
  x.fillStyle='#06121f';x.fillRect(0,0,c.width,c.height);x.scale(k,k);x.translate(-(C.x-tx)/s,-(C.y-ty)/s);x.rotate(rot*Math.PI/180);x.drawImage(im,-W/2,-H/2);
  return new Promise(function(r){c.toBlob(function(b){r(b)},'image/jpeg',0.8)})}
 var closed=false;function close(v){if(closed)return;closed=dead=true;st.removeEventListener('pointerdown',down);st.removeEventListener('pointermove',move);st.removeEventListener('pointerup',up);st.removeEventListener('pointercancel',up);
  $('cropOk').onclick=$('cropNo').onclick=$('cropRot').onclick=null;window.removeEventListener('resize',onRs);ov.classList.remove('show');ov.classList.remove('ld');im.removeAttribute('src');URL.revokeObjectURL(u);done(v)}
 var used=false;im.onload=function(){W=im.naturalWidth;H=im.naturalHeight;ov.classList.add('show');cropBusy(0);nsKick();requestAnimationFrame(function(){requestAnimationFrame(reset)});setTimeout(function(){if(!used)reset()},350)};im.onerror=function(){toast(TR('Nu pot deschide poza'));close(null)};im.src=u;
 st.addEventListener('pointerdown',down);st.addEventListener('pointermove',move);st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);var onRs=function(){if(!used)reset()};window.addEventListener('resize',onRs);
 $('cropRot').onclick=function(){rot=(rot+90)%360;used=false;reset()};$('cropNo').onclick=function(){close(null)};var busy=false;$('cropOk').onclick=function(){if(busy)return;busy=true;out().then(function(b){busy=false;if(!b||b.size<200){toast(TR('Nu am putut decupa poza'));return}close(b)},function(){busy=false;toast(TR('Nu am putut decupa poza'))})}})}
$('bJvImport').onclick=function(){nsImportJarvis();nsRenderJv()};
$('nsImpGo').onclick=function(){if(!nsImportJarvis()){toast(TR('Alege fișierul de backup Jarvis (.json)'));$('bBkFile').value='';$('bBkFile').click()}};
$('nsImpX').onclick=function(){try{localStorage.setItem('ns_impban','off')}catch(_){}nsBanner()};
(function(){var orig=$('bBkFile').onchange;$('bBkFile').onchange=function(){var self=this,f=this.files&&this.files[0];if(!f)return;var r=new FileReader();
 r.onload=function(){var s=null;try{s=nsFromData(JSON.parse(r.result))}catch(_){}
  if(s){var n=nsMerge(s);try{localStorage.setItem('ns_impban','off')}catch(_){}nsBanner();nsMsg(n,s.notes.length||0);return}orig.call(self)};r.readAsText(f)}})();
(function(){var ob=$('bSettings').onclick;$('bSettings').onclick=function(){ob.apply(this,arguments);nsRenderJv()}})();
(function(){var _rn=renderNotes;renderNotes=function(){_rn.apply(this,arguments);nsBanner()}})();
/* auto-import: whenever Notis has no real notes yet and Jarvis notes exist on this origin */
if(!DEMO&&!nsReal()){var s0=nsFromLS();if(s0.notes.length&&nsMerge(s0)){NS_IMPORTED=true;try{localStorage.setItem('ns_impban','off')}catch(_){}}}
nsBanner();
/* v51: demo banner, demo photos, first-launch offer */
if(DEMO){var db0=document.createElement('div');db0.id='demoBan';db0.innerHTML='<b>DEMO</b><span>exemple · datele tale sunt neatinse</span><button type="button" id="demoOut">Ieși</button>';document.body.appendChild(db0);$('demoOut').onclick=function(){demoSet(false)};
 if(LS.get('ns_demoph',0)<2){var DM={dp1:'art/bg-mist.webp',dp2:'art/bg-lake.webp',dp3:'art/bg-forest.webp',dp4:'art/bg-sea.webp',dp5:'art/demo-draw.webp',da1:'art/demo-rec.m4a'},jobs=[];notes.forEach(function(n){(n.blocks||[]).forEach(function(b){var ids=b.t==='img'?(b.ph||[]):b.t==='aud'?[b.a]:[];ids.forEach(function(id,k){if(DM[id])jobs.push(fetch(DM[id]).then(function(r){if(!r.ok)throw new Error('demo');return r.arrayBuffer()}).then(function(buf){var r={id:id,note:n.id,ts:Date.now()+k,buf:buf};if(b.t==='aud'){r.k='a';r.mt='audio/mp4';r.dur=b.dur||0}return phPut(r)}))})})});Promise.all(jobs).then(function(){LS.set('ns_demoph',2);try{renderNotes()}catch(_){}}).catch(function(){})}}
else if(!nsReal()&&!NS_IMPORTED){var off0=null;try{off0=localStorage.getItem('notis_demo_offered')}catch(_){}if(!off0)setTimeout(function(){try{localStorage.setItem('notis_demo_offered','1')}catch(_){}var cf=$('cfModal').querySelector('.cftxt'),t0=cf.textContent,ok=$('cfOk'),o0=ok.textContent;cf.textContent=TR('Bun venit! Vrei să vezi exemple care arată ce poate face Notis? (Sunt separate; ieși oricând.)');ok.textContent=TR('Arată exemple');var back=function(){cf.textContent=t0;ok.textContent=o0};jvConfirm(function(){back();demoSet(true)});var no=$('cfNo').onclick;$('cfNo').onclick=function(){back();no&&no()}},900)}
notesOpen();if(NS_IMPORTED)setTimeout(function(){toast(TR('Am importat notițele din Jarvis'))},400);
/* Notis v37: tap on the NOTIS title opens Setări (the only entry point) */
(function(){[document.querySelector('#notesPg .ntop h2'),document.getElementById('hdrIco')].forEach(function(h){if(!h)return;var x0=0,y0=0,mv=false;
 h.addEventListener('pointerdown',function(e){x0=e.clientX;y0=e.clientY;mv=false});h.addEventListener('pointermove',function(e){if(Math.abs(e.clientX-x0)>10||Math.abs(e.clientY-y0)>10)mv=true});
 h.addEventListener('click',function(){if(mv)return;$('bSettings').onclick()});h.addEventListener('contextmenu',function(e){e.preventDefault()})})})();
/* v23: themes */
var TH_META={color:'#06111f',dark:'#000000',light:'#f3f5f8',vip:'#121110'};
function thHex(r,g,b){return '#'+[r,g,b].map(function(x){return ('0'+Math.round(x).toString(16)).slice(-2)}).join('')}
function vipMix(v){var k=v/100,lo=[20,19,18],hi=[244,242,238],c=lo.map(function(x,i){return x+(hi[i]-x)*k}),c2=c.map(function(x){return x*.9}),warm=k>.5?[(k-.5)*2*14,(k-.5)*2*6,-(k-.5)*2*6]:[0,0,0];
 c=[c[0]+warm[0]*.4,c[1]+warm[1]*.4,c[2]+warm[2]*.4].map(function(x){return Math.max(0,Math.min(255,x))});var L=(.2126*c[0]+.7152*c[1]+.0722*c[2])/255;
 return{bg:thHex(c[0],c[1],c[2]),bg2:thHex(c2[0],c2[1],c2[2]),out:L>.5?'#1d1b18':'#f6ead2',glow:L>.5?'rgba(255,255,255,.7)':'rgba(232,201,138,.14)'}}
/* v24: note colours per theme (stored value = Color-theme tint) */
var NC_TH={light:{'#103a3d':'#d3eff1','#163a22':'#dbf2e1','#3a3514':'#f8f0c4','#3e2812':'#fde3c8','#3d1a1c':'#fcdcdc','#3a1832':'#f9dcef','#291c48':'#e5ddfa','#2b313b':'#e3e7ec','#14304a':'#d6e6f8','#1f2550':'#dde0f8','#0f3a33':'#cff0ea','#2c3a12':'#ebf4cf','#3a2a1e':'#efe2d6','#3d1226':'#f6d6e2','#1e2a33':'#dbe3ea'},
 vip:{'#103a3d':'#14302f','#163a22':'#1b3123','#3a3514':'#3a3116','#3e2812':'#3d2916','#3d1a1c':'#3b1c1d','#3a1832':'#371b2e','#291c48':'#2a2140','#2b313b':'#2d2b29','#14304a':'#1d2b3a','#1f2550':'#23243a','#0f3a33':'#14302b','#2c3a12':'#2c3119','#3a2a1e':'#36291f','#3d1226':'#381a26','#1e2a33':'#232a2e'}};
function ncT(c){var m=typeof NC_TH!=='undefined'&&NC_TH[thCur];return c&&m&&m[c.toLowerCase()]||c}
Object.assign(TH_META,{"jad": "#0f2a24", "lac": "#470e25", "tus": "#efe0b0", "neon": "#0a0a14", "pap": "#d6bf91", "cleo": "#e6cf98", "salon": "#f6ead8", "exc": "#07090c"});var TH_LIGHT={light:1,tus:1,pap:1,cleo:1,salon:1};
Object.assign(NC_TH,{"exc": {"#103a3d": "#0c3238", "#163a22": "#1e3a12", "#3a3514": "#383a0e", "#3e2812": "#3c2a10", "#3d1a1c": "#3d1518", "#3a1832": "#36152f", "#291c48": "#24204a", "#2b313b": "#262c32"}, "jad": {"#103a3d": "#0f3d3c", "#163a22": "#1d4a30", "#3a3514": "#4a4318", "#3e2812": "#4d3217", "#3d1a1c": "#4b1f22", "#3a1832": "#47203b", "#291c48": "#2f2752", "#2b313b": "#2c3a37"}, "lac": {"#103a3d": "#14302f", "#163a22": "#1c3122", "#3a3514": "#3d3013", "#3e2812": "#44240f", "#3d1a1c": "#4a0f1e", "#3a1832": "#4a1434", "#291c48": "#2e1640", "#2b313b": "#33222a"}, "tus": {"#103a3d": "#d9e8dc", "#163a22": "#e0e8c4", "#3a3514": "#f5e7b2", "#3e2812": "#f2d4ad", "#3d1a1c": "#f0cbbf", "#3a1832": "#eed2d6", "#291c48": "#ddd5e3", "#2b313b": "#e6dfca"}, "neon": {"#103a3d": "#0b3340", "#163a22": "#0f3a2a", "#3a3514": "#3a3410", "#3e2812": "#40250f", "#3d1a1c": "#40101f", "#3a1832": "#3d0f33", "#291c48": "#2a1550", "#2b313b": "#22243a"}, "pap": {"#103a3d": "#d3e6df", "#163a22": "#dde6c8", "#3a3514": "#f1e1a8", "#3e2812": "#f0d2ae", "#3d1a1c": "#eecbbd", "#3a1832": "#ecd1d4", "#291c48": "#dad1e2", "#2b313b": "#e3d9c6"}, "cleo": {"#103a3d": "#cfe8e6", "#163a22": "#dbe6c4", "#3a3514": "#f3e1a0", "#3e2812": "#f1cfa4", "#3d1a1c": "#efc6b6", "#3a1832": "#ecccd2", "#291c48": "#d6d2ea", "#2b313b": "#e7dbc0"}, "salon": {"#103a3d": "#e3eee7", "#163a22": "#e7edd9", "#3a3514": "#f6e6b6", "#3e2812": "#f4dcc0", "#3d1a1c": "#f1d5cc", "#3a1832": "#efd9dd", "#291c48": "#e3ddec", "#2b313b": "#eee5d7"}});
var thCur='color';
function thApply(t){if(!TH_META[t])t='color';thCur=t;var R0=document.documentElement;if(t==='color')R0.removeAttribute('data-theme');else R0.setAttribute('data-theme',t);
 var meta=TH_META[t];['--vbg','--vbg2','--vout','--vglow'].forEach(function(k){R0.style.removeProperty(k)});
 if(t==='vip'){var v=+LS.get('ns_vipint',85),x=vipMix(v);R0.style.setProperty('--vbg',x.bg);R0.style.setProperty('--vbg2',x.bg2);R0.style.setProperty('--vout',x.out);R0.style.setProperty('--vglow',x.glow);meta=x.bg;$('vipInt').value=v}
 var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',meta);var cs=document.querySelector('meta[name=color-scheme]');if(!cs&&t!=='color'){cs=document.createElement('meta');cs.name='color-scheme';document.head.appendChild(cs)}if(cs&&t==='color'){cs.remove();cs=null}if(cs)cs.setAttribute('content',(typeof TH_LIGHT!=='undefined'&&TH_LIGHT[t])||(t==='vip'&&+LS.get('ns_vipint',85)>50)?'light':'dark');
 document.querySelectorAll('#thRow .thc').forEach(function(b){b.classList.toggle('on',b.dataset.th===t)})}
thApply(LS.get('ns_theme','color'));if(thCur!=='color')try{renderNotes()}catch(_){}
var BG_IDS=['none','lup','mist','forest','lake','sea','snow','night','color','photo'];function bgApply(b){if(BG_IDS.indexOf(b)<0)b='lup';var R=document.documentElement;if(b==='lup')R.removeAttribute('data-bg');else R.setAttribute('data-bg',b);document.querySelectorAll('#bgRow .bgc').forEach(function(x){x.classList.toggle('on',x.dataset.bg===b)})}
$('bDemo').textContent=DEMO?TR('Ieși din Mod demo'):TR('Mod demo (exemple)');$('demoHint').textContent=DEMO?TR('Ești în Mod demo. Datele tale reale sunt păstrate separat.'):TR('Deschide exemplele într-un spațiu separat; datele tale nu sunt atinse.');$('bDemoReset').style.display=DEMO?'':'none';$('bDemo').onclick=function(){demoSet(!DEMO)};$('bDemoReset').onclick=function(){demoReset();location.reload()};
bgApply(LS.get('ns_bg','lup'));
/* v48: background intensity: -10 very faded … 0 default … +10 much darker / vivid */
function bgkApply(v){v=Math.max(-10,Math.min(10,+v||0));var m=v<0?1+v*0.07:1+v*0.28;document.documentElement.style.setProperty('--bgm',m.toFixed(2));$('vBgk').textContent=v===0?TR('implicit'):(v>0?'+':'')+v;$('sBgk').value=v}
bgkApply(LS.get('ns_bgk',0));$('sBgk').addEventListener('input',function(){bgkApply(this.value)});$('sBgk').addEventListener('change',function(){LS.set('ns_bgk',+this.value)});$('bgRow').addEventListener('click',function(e){var b=e.target.closest('.bgc');if(!b)return;if(b.dataset.bg==='photo')return;LS.set('ns_bg',b.dataset.bg);bgApply(b.dataset.bg)});
/* v80: solid colour background (native picker + built-in palette/hue) */
(function(){var R=document.documentElement,SW=['#0b1a2b','#1b3a5c','#0f3d3a','#2d1b45','#4a1430','#3a2a14','#1c1c1c','#f2efe8','#dce8f2','#e8f0e0'];
 function hx(h,s,l){s/=100;l/=100;var k=function(n){return(n+h/30)%12},a=s*Math.min(l,1-l),f=function(n){return l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)))};return'#'+[0,8,4].map(function(n){return('0'+Math.round(f(n)*255).toString(16)).slice(-2)}).join('')}
 function hsl(c){var r=parseInt(c.substr(1,2),16)/255,g=parseInt(c.substr(3,2),16)/255,b=parseInt(c.substr(5,2),16)/255,M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2,h=0,s=0,d=M-m;if(d){s=d/(1-Math.abs(2*l-1));h=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}return[h,s*100,l*100]}
 var sw=$('bgSw');SW.forEach(function(c){var b=document.createElement('button');b.type='button';b.style.background=c;b.dataset.c=c;b.setAttribute('aria-label',c);sw.appendChild(b)});
 function set(c,save){if(!/^#[0-9a-f]{6}$/i.test(c||''))c='#1b3a5c';c=c.toLowerCase();R.style.setProperty('--bgcol',c);$('bgColor').value=c;var h=hsl(c);$('bgHue').value=Math.round(h[0]);$('bgLum').value=Math.max(4,Math.min(96,Math.round(h[2])));sw.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.c===c)});if(save){LS.set('ns_bgcol',c);if(LS.get('ns_bg','lup')!=='color'){LS.set('ns_bg','color');bgApply('color')}}}
 set(LS.get('ns_bgcol','#1b3a5c'));window.bgColSet=set;
 sw.addEventListener('click',function(e){var b=e.target.closest('button');if(b)set(b.dataset.c,1)});
 $('bgColor').addEventListener('input',function(){set(this.value,1)});
 function hl(){var c=hsl($('bgColor').value);set(hx(+$('bgHue').value,Math.max(c[1],45),+$('bgLum').value),1)}
 $('bgHue').addEventListener('input',hl);$('bgLum').addEventListener('input',hl)})();
/* v80: card opacity 0..100; default (unset) = theme look */
(function(){var R=document.documentElement,st=document.createElement('style');st.id='cdoSt';document.head.appendChild(st);
 var SEL=[['#notesPg .card:not(.modal .card)','#notesPg .card'],['#noteFull .nfcard','#noteFull .nfcard']];
 function alphaOf(str){var m,mx=0,re=/rgba?\(([^)]+)\)/g;while(m=re.exec(str)){var p=m[1].split(',');mx=Math.max(mx,p.length>3?+p[3]:1)}return mx}
 function map(x,s,base){if(s<=base)return base>0?x*s/base:0;return x+(1-x)*(s-base)/(100-base||1)}
 function scale(str,s,base){return str.replace(/rgba?\(([^)]+)\)/g,function(_,a){var p=a.split(',').map(function(v){return v.trim()});var x=p.length>3?+p[3]:1;return'rgba('+p[0]+','+p[1]+','+p[2]+','+Math.max(0,Math.min(1,map(x,s,base))).toFixed(3)+')'})}
 function base(){st.textContent='';var e=document.querySelector(SEL[0][1]);if(!e)return 55;var c=getComputedStyle(e);return Math.round(Math.max(alphaOf(c.backgroundColor),alphaOf(c.backgroundImage))*100)||55}
 function apply(){var v=LS.get('ns_cardop',null),b=base(),s=(v===null||v===''||isNaN(+v))?b:Math.max(0,Math.min(100,+v));$('sCdo').value=s;$('vCdo').textContent=s+(v===null?' · '+TR('implicit'):'');
  R.classList.toggle('cdo-low',s<35);R.classList.toggle('cdo-lt',!!((typeof TH_LIGHT!=='undefined'&&TH_LIGHT[thCur])||(thCur==='vip'&&+LS.get('ns_vipint',85)>50)));
  if(v===null||s===b){st.textContent='';return}
  var css='';SEL.forEach(function(q){var e=document.querySelector(q[1]);if(!e)return;var c=getComputedStyle(e),bc=c.backgroundColor,bi=c.backgroundImage,bl=parseFloat((c.backdropFilter||c.webkitBackdropFilter||'').replace(/[^0-9.]/g,''))||0;
   css+=q[0]+'{background-color:'+scale(bc,s,b)+'!important;background-image:'+(bi==='none'?'none':scale(bi,s,b))+'!important'+(bl?';backdrop-filter:blur('+(bl*Math.min(1,s/b)).toFixed(1)+'px)!important;-webkit-backdrop-filter:blur('+(bl*Math.min(1,s/b)).toFixed(1)+'px)!important':'')+(s===0?';box-shadow:none!important':'')+'}'});
  var p=Math.min(100,Math.round(s/b*100));/* v190 (3): note colour no longer fades with card opacity */
  st.textContent=css}
 window.cdoApply=apply;apply();
 $('sCdo').addEventListener('input',function(){LS.set('ns_cardop',+this.value);apply()});
 var _th=thApply;thApply=function(t){_th(t);apply()}})();
/* v80: backup carries card opacity + solid colour background */
(function(){function wrap(){var c=window.spCollect,a=window.spApply;if(!c||c._v80)return;window.spCollect=function(){var o=c.apply(this,arguments)||{};o.ns_cardop=LS.get('ns_cardop',null);o.ns_bgcol=LS.get('ns_bgcol',null);o.ns_bg=LS.get('ns_bg','lup');return o};window.spCollect._v80=1;
 window.spApply=function(d){var r=a&&a.apply(this,arguments);try{if(d&&'ns_cardop' in d){if(d.ns_cardop===null){localStorage.removeItem(PFX+'ns_cardop');if(!PFX)nspPush('ns_cardop')}else LS.set('ns_cardop',d.ns_cardop)}if(d&&d.ns_bgcol)bgColSet(d.ns_bgcol);if(d&&d.ns_bg){LS.set('ns_bg',d.ns_bg);bgApply(d.ns_bg)}cdoApply()}catch(_){}return r}}
 wrap();if(!window.spCollect||!window.spCollect._v80)window.addEventListener('load',wrap)})();
/* v90: tab style (Pilule / Căsuțe) */
(function(){var R=document.documentElement;function ap(v){v=v==='box'?'box':'pill';if(v==='box')R.setAttribute('data-tabst','box');else R.removeAttribute('data-tabst');document.querySelectorAll('#tstRow .tsc').forEach(function(b){b.classList.toggle('on',b.dataset.ts===v)})}
 window.tstApply=ap;ap(LS.get('ns_tabst','pill'));
 $('tstRow').addEventListener('click',function(e){var b=e.target.closest('.tsc');if(!b)return;LS.set('ns_tabst',b.dataset.ts);ap(b.dataset.ts)});
 function wrap(){var c=window.spCollect,a=window.spApply;if(!c||c._v90)return;window.spCollect=function(){var o=c.apply(this,arguments)||{};o.ns_tabst=LS.get('ns_tabst','pill');return o};window.spCollect._v90=1;
 window.spApply=function(d){var r=a&&a.apply(this,arguments);try{if(d&&d.ns_tabst){LS.set('ns_tabst',d.ns_tabst);ap(d.ns_tabst)}}catch(_){}return r}}
 wrap();if(!window.spCollect||!window.spCollect._v90)window.addEventListener('load',wrap)})();
/* v100: Setări → Design → Font (bundled OFL woff2 in fonts/, offline; scripts a font lacks fall back to the phone font). Key ns_font: mirrored to native prefs, included in backups. */
(function(){var R=document.documentElement,FN=[['sys','Fontul telefonului',''],['oswald','Oswald','"Oswald"'],['barlow','Barlow Condensed','"Barlow Condensed"'],['inter','Inter','"Inter"'],['nunito','Nunito','"Nunito"'],['lora','Lora','"Lora"']];
 var PV='Notis — Aa Bb 123 · ăâîșț ĂÂÎȘȚ · Жж Щщ · Ωω';
 function f(v){for(var i=0;i<FN.length;i++)if(FN[i][0]===v)return FN[i];return FN[0]}
 function ap(v){var x=f(v);if(x[0]==='sys'){R.removeAttribute('data-font');R.style.removeProperty('--uifont')}else{R.setAttribute('data-font',x[0]);R.style.setProperty('--uifont',x[2])}
  var row=document.getElementById('fontRow');if(row)[].forEach.call(row.children,function(b){b.classList.toggle('on',b.dataset.f===x[0])});var pv=document.getElementById('fontPv');if(pv)pv.style.fontFamily=(x[2]?x[2]+',':'')+'Roboto,system-ui,sans-serif'}
 var row=document.getElementById('fontRow');if(row){row.innerHTML=FN.map(function(x){var st=' style="font-family:'+(x[2]?x[2].replace(/"/g,"'")+',':'')+'Roboto,system-ui,sans-serif"';return '<button type="button" class="fnc" data-f="'+x[0]+'"'+st+'><span class="ux">'+(x[0]==='sys'?TR(x[1]):x[1])+'</span><small class="ux">Aa ăâîșț Жж</small></button>'}).join('');
  document.getElementById('fontPv').textContent=PV;
  row.addEventListener('click',function(e){var b=e.target.closest('.fnc');if(!b)return;LS.set('ns_font',b.dataset.f);ap(b.dataset.f)})}
 window.fontApply=ap;ap(LS.get('ns_font','sys'));
 function wrap(){var c=window.spCollect,a=window.spApply;if(!c||c._v100)return;window.spCollect=function(){var o=c.apply(this,arguments)||{};o.ns_font=LS.get('ns_font','sys');return o};window.spCollect._v100=1;
  window.spApply=function(d){var r=a&&a.apply(this,arguments);try{if(d&&d.ns_font){LS.set('ns_font',d.ns_font);ap(d.ns_font)}}catch(_){}return r}}
 wrap();if(!window.spCollect||!window.spCollect._v100)window.addEventListener('load',wrap)})();
/* v86: gallery background + live preview */
(function(){var R=document.documentElement,M=document.getElementById('modal'),row=document.getElementById('bgRow'),fi=document.getElementById('bgFile');if(!M||!row||!fi)return;
var KEY=function(){return (typeof PFX==='string'?PFX:'')+'bgphoto'},cur=null,curB64=null;
function db(){return new Promise(function(res,rej){var q=indexedDB.open('notis-bg',1);q.onupgradeneeded=function(){q.result.createObjectStore('b')};q.onsuccess=function(){res(q.result)};q.onerror=function(){rej(q.error)}})}
function tx(m,f){return db().then(function(d){return new Promise(function(res,rej){var t=d.transaction('b',m),o=f(t.objectStore('b'));t.oncomplete=function(){res(o&&o.result)};t.onerror=function(){rej(t.error)}})})}
function show(blob){if(cur)URL.revokeObjectURL(cur);cur=blob?URL.createObjectURL(blob):null;var v=cur?'url("'+cur+'")':'none';R.style.setProperty('--bgphoto',v);R.style.setProperty('--bgphoto-t',v);row.querySelector('.bgph').classList.toggle('has',!!cur);curB64=null;if(blob){var fr=new FileReader();fr.onload=function(){curB64=String(fr.result).split(',')[1]};fr.readAsDataURL(blob)}}
function store(blob){return tx('readwrite',function(o){blob?o.put(blob,KEY()):o.delete(KEY())})}
tx('readonly',function(o){return o.get(KEY())}).then(function(b){show(b||null);if(!b&&LS.get('ns_bg','lup')==='photo'){LS.set('ns_bg','lup');bgApply('lup')}}).catch(function(){});
function use(){LS.set('ns_bg','photo');bgApply('photo')}
row.querySelector('.bgph').addEventListener('click',function(){if(cur&&LS.get('ns_bg','lup')!=='photo'){use();peek(row,1500);return}fi.value='';fi.click()});
fi.addEventListener('change',function(){var f=fi.files&&fi.files[0];if(!f)return;toast(TR('Se încarcă imaginea…'));nsKick();phCompress(f).then(function(b){return store(b).then(function(){show(b);use();nsKick();peek(row,2000)})}).catch(function(){toast(TR('Nu s-a putut încărca imaginea'))})});
/* backups: bundle the photo into exported files, restore it on import */
var d0=phDump,l0=phLoad;
if(d0)phDump=function(){return d0.apply(this,arguments).then(function(a){if(curB64)a=(a||[]).concat([{id:'bgphoto',note:'__bg',ts:Date.now(),data:curB64}]);return a})};
if(l0)phLoad=function(list){var bg=null;if(Array.isArray(list)){list=list.filter(function(o){if(o&&o.note==='__bg'){bg=o;return false}return true})}
 if(bg&&bg.data){try{var u=atob(bg.data),a=new Uint8Array(u.length);for(var i=0;i<u.length;i++)a[i]=u.charCodeAt(i);var b=new Blob([a],{type:'image/jpeg'});store(b).then(function(){show(b)})}catch(e){}}
 return l0.call(this,list)};
/* live preview */
var secs=[],on=false;(function(){var a=[].slice.call(document.querySelectorAll('.pvsec'));a.forEach(function(h){var n=h.nextElementSibling;while(n&&!(n.classList.contains('sec')&&!n.classList.contains('pvsec'))){if(n.classList.contains('pvsec')){n=n.nextElementSibling;continue}secs.push(n);n=n.nextElementSibling}})})();
function inS(el){for(var i=0;i<secs.length;i++)if(secs[i].contains(el))return true;return false}
var pt=null,pvEl=null;function clr(){if(pvEl)pvEl.classList.remove('pvon');pvEl=null;M.classList.remove('peek')}
function peek(el,ms){clearTimeout(pt);if(pvEl&&pvEl!==el)pvEl.classList.remove('pvon');pvEl=el;el.classList.add('pvon');M.classList.add('peek');if(ms)pt=setTimeout(clr,ms)}
function ctl(t){return t.closest('label.bghue,#vipRow,.field')||t}
var drag=false;M.addEventListener('pointerdown',function(e){var t=e.target;if(t.type==='range'&&inS(t)){drag=true;peek(ctl(t))}},true);
M.addEventListener('input',function(e){var t=e.target;if(!inS(t))return;if(t.type==='range'){peek(ctl(t),drag?0:900)}else if(t.type==='color')peek(ctl(t),1500)},true);
function up(){if(drag){drag=false;clearTimeout(pt);pt=setTimeout(clr,350)}}
['pointerup','pointercancel','touchend','touchcancel'].forEach(function(ev){document.addEventListener(ev,up,true)});
M.addEventListener('change',function(e){if(e.target.type==='range'&&inS(e.target))up()},true);
M.addEventListener('click',function(e){var t=e.target.closest('.bgc,.thc,.bgsw *,.bgsw');if(t&&inS(t)&&!t.classList.contains('bgph'))peek(t.closest('.field')||t,1500)},true);
/* 👁: hold = hide while held; tap = toggle */
var hold=null,t0=0,tog=false,who=null;function all(b,v){M.classList.toggle('peekall',v);document.querySelectorAll('.peekb').forEach(function(x){x.classList.remove('act','on')});if(v&&b)b.classList.add('act');if(v)clr()}
document.querySelectorAll('.peekb').forEach(function(b){b.addEventListener('pointerdown',function(e){e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}t0=Date.now();who=b;if(!tog)all(b,true)});
 b.addEventListener('pointerup',function(e){if(who!==b)return;who=null;var tap=Date.now()-t0<300;if(tog){tog=false;all(b,false)}else if(tap){tog=true;b.classList.add('on')}else all(b,false)});
 b.addEventListener('pointercancel',function(){if(who===b){who=null;if(!tog)all(b,false)}});
 b.addEventListener('contextmenu',function(e){e.preventDefault()});b.addEventListener('click',function(e){e.stopPropagation()})});
M.addEventListener('click',function(e){if(tog&&!e.target.closest('.peekb')){e.stopPropagation();e.preventDefault();tog=false;all(null,false)}},true);
new MutationObserver(function(){if(!M.classList.contains('show')&&(tog||/\bpeek/.test(M.className)||document.querySelector('.pvon,.peekb.act,.peekb.on'))){tog=false;all(null,false);clr()}}).observe(M,{attributes:true,attributeFilter:['class']});
})();


$('thRow').addEventListener('click',function(e){var b=e.target.closest('.thc');if(!b)return;LS.set('ns_theme',b.dataset.th);thApply(b.dataset.th);try{renderNotes();edState()}catch(_){}});
$('vipInt').addEventListener('input',function(){LS.set('ns_vipint',+this.value);thApply('vip')});
alCheck(); /* notes are loaded after alInit: run the alarm catch-up again so note alarms fire on open */
/* v21: trashed note = read-only */
(function(){var nf=$('noteFull'),ro=function(){return nf.classList.contains('nro')};
 nf.addEventListener('focusin',function(e){if(ro()&&e.target.matches&&e.target.matches('textarea,input'))e.target.readOnly=true},true);
 nf.addEventListener('beforeinput',function(e){if(ro())e.preventDefault()},true);
 nf.addEventListener('click',function(e){if(!ro())return;if(e.target.closest('#nfRestore')){var id=fullId;fullClose();nRestore(id);return}if(e.target.closest('input[type=checkbox],.cix,.ciadd,.nbi .phx'))e.preventDefault(),e.stopPropagation()},true);
 var b=document.createElement('button');b.type='button';b.id='nfRestore';b.className='btn pill';b.textContent='↩ Reface';nf.appendChild(b)})();
/* v35: note row spacing slider */
function nrpApply(){var v=+LS.get('ns_nrowpad',8);if(!(v>=0&&v<=14))v=8;var R=document.documentElement.style;R.setProperty('--nrp',v+'px');/* v49: below 4px also shrink row height + line height (4..14 unchanged) */if(v<4){R.setProperty('--nrmh',(24+v*3)+'px');R.setProperty('--nrlh',(1.3+v*0.05).toFixed(2))}else{R.removeProperty('--nrmh');R.removeProperty('--nrlh')}var s=$('sNrp');if(s){s.value=v;$('vNrp').textContent=v+'px'}}
function smgApply(){var v=+LS.get('ns_sidemg',4);if(!(v>=0&&v<=24))v=4;document.documentElement.style.setProperty('--smg',v+'px');var s=$('sSmg');if(s){s.value=v;$('vSmg').textContent=v+'px'}} /* v66: side margin for Utilități/Medicamente cards */
smgApply();$('sSmg').addEventListener('input',function(){LS.set('ns_sidemg',+this.value);smgApply()});
nrpApply();$('sNrp').addEventListener('input',function(){LS.set('ns_nrowpad',+this.value);nrpApply()});
/* v95: row spacing, side margin and background intensity also travel in manual backups */
(function(){function wrap(){var c=window.spCollect,a=window.spApply;if(!c||c._v95)return;window.spCollect=function(){var o=c.apply(this,arguments)||{};o.ns_nrowpad=LS.get('ns_nrowpad',8);o.ns_sidemg=LS.get('ns_sidemg',4);o.ns_bgk=LS.get('ns_bgk',0);return o};window.spCollect._v95=1;
 window.spApply=function(d){var r=a&&a.apply(this,arguments);try{if(d&&typeof d.ns_nrowpad==='number'){LS.set('ns_nrowpad',d.ns_nrowpad);nrpApply()}if(d&&typeof d.ns_sidemg==='number'){LS.set('ns_sidemg',d.ns_sidemg);smgApply()}if(d&&typeof d.ns_bgk==='number'){LS.set('ns_bgk',d.ns_bgk);if(window.bgkApply)bgkApply(d.ns_bgk)}}catch(_){}return r}}
 wrap();if(!window.spCollect||!window.spCollect._v95)window.addEventListener('load',wrap)})();
/* v39: app shortcuts (manifest) -> ?a=new | ?a=search | ?tab=<name>; on load and via launchQueue when already open */
var nsLaunchAt=0,nsLaunchU='';
function nsLaunch(u){var U;try{U=new URL(u,location.href)}catch(_){return}var q=U.searchParams,a=q.get('a'),tb=q.get('tab'),op=q.get('open'),tk=q.get('tk');if(!a&&tb==null&&!op&&!tk)return;
 var key=(a||'')+'|'+(tb||'')+'|'+(op||'')+'|'+(tk||'');if(key===nsLaunchU&&Date.now()-nsLaunchAt<2000)return;nsLaunchU=key;nsLaunchAt=Date.now();
 try{if(/[?&](a|tab|open|tk)=/.test(location.search))history.replaceState(history.state,'',location.pathname+location.hash)}catch(_){}
 try{if($('modal').classList.contains('show'))$('modal').classList.remove('show')}catch(_){}
 if($('noteFull').classList.contains('show'))fullClose();if(nTrash)nTrashOpen(false);notesOpen();
 if(tb!=null){var f=nFold(tb).trim(),t=noteTabs.filter(function(x){return nFold(x.name).trim()===f})[0]||noteTabs.filter(function(x){return f&&nFold(x.name).indexOf(f)>=0})[0]||noteTabs[0];if(t&&t.id!==noteTab){noteTab=t.id;saveNotes()}renderNotes()}
 if(tk){var tt=noteTabs.filter(function(x){return tk==='urg'?isUrgTab(x):x.kind===tk})[0];if(!tt&&tk==='shop')tt=noteTabs.filter(function(x){var f=nFold(x.name).trim();return f==='cumparaturi'||f===nFold(TR('Cumpărături')).trim()})[0];if(tt&&tt.id!==noteTab){noteTab=tt.id;saveNotes()}renderNotes()}
 if(op){var on=findN(op);if(on&&!on.del){if(on.tab&&on.tab!==noteTab&&findNT(on.tab)){noteTab=on.tab;saveNotes();renderNotes()}setTimeout(function(){fullOpen(op)},60)}}
 if(a==='new')setTimeout(fullNew,60);else if(a==='search')setTimeout(nSearchOpen,60)}
setTimeout(function(){nsLaunch(location.href)},30);
/* v72: share the open note — link https://…/notis/?ni=<base64url JSON> imports into Notis; text = title + ☐ items + link */
(function(){var SH='https://cluj1313.github.io/notis/';
function u8b(b){var t='';for(var i=0;i<b.length;i++)t+=String.fromCharCode(b[i]);return btoa(t).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function bu8(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var t=atob(s),b=new Uint8Array(t.length);for(var i=0;i<t.length;i++)b[i]=t.charCodeAt(i);return b}
function zs(b,c){var S=new (c?CompressionStream:DecompressionStream)('deflate-raw');return new Response(new Blob([b]).stream().pipeThrough(S)).arrayBuffer().then(function(a){return new Uint8Array(a)})}
/* v73 compact payload: c<title>US<0|1 item>RS…  |  x<text>  |  m(x<text>|i<items>)US… ; ni = 'z'+b64(deflate-raw) or 'r'+b64(utf8); old 'ey…' = b64 JSON */
var US='\x1f',RS='\x1e';function cl(v){return String(v==null?'':v).replace(/[\x1e\x1f]/g,' ')}
function cI(I){return I.map(function(x){return (x[1]?'1':'0')+cl(x[0])}).join(RS)}function dI(s){return s?s.split(RS).map(function(x){return[x.slice(1),x[0]==='1'?1:0]}):[]}
function cEnc(p){if(p.i)return 'c'+cl(p.t)+US+cI(p.i);if(p.m)return 'm'+p.m.map(function(b){return b.i?'i'+cI(b.i):'x'+cl(b.x)}).join(US);return 'x'+String(p.x||'')}
function cDec(s){var k=s[0],r=s.slice(1);if(k==='c'){var j=r.indexOf(US);return j<0?{t:r,i:[]}:{t:r.slice(0,j),i:dI(r.slice(j+1))}}
 if(k==='m')return{m:r.split(US).map(function(b){return b[0]==='i'?{i:dI(b.slice(1))}:{x:b.slice(1)}})};if(k==='x')return{x:r};throw 0}
function niEnc(p){var raw=new TextEncoder().encode(cEnc(p)),r='r'+u8b(raw);if(!window.CompressionStream)return Promise.resolve(r);
 return zs(raw,1).then(function(z){var c='z'+u8b(z);return c.length<r.length?c:r},function(){return r})}
function niDec(ni){try{if(ni[0]==='z')return zs(bu8(ni.slice(1)),0).then(function(b){return cDec(new TextDecoder().decode(b))});
 if(ni[0]==='r')return Promise.resolve(cDec(new TextDecoder().decode(bu8(ni.slice(1)))));return Promise.resolve(JSON.parse(b64d(ni)))}catch(e){return Promise.reject(e)}}
window.__niEnc=niEnc;window.__niDec=niDec;
function b64e(s){var b=new TextEncoder().encode(s),t='';for(var i=0;i<b.length;i++)t+=String.fromCharCode(b[i]);return btoa(t).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function b64d(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var t=atob(s),b=new Uint8Array(t.length);for(var i=0;i<t.length;i++)b[i]=t.charCodeAt(i);return new TextDecoder().decode(b)}
function its(a){return (a||[]).filter(function(x){return String(x.text||'').trim()}).map(function(x){return[String(x.text).trim(),x.done?1:0]})}
function pack(n){if(n.type==='check')return{t:String(n.title||'').trim(),i:its(chkOrder(n))};
 if(n.type==='mix'){var B=[];(n.blocks||[]).forEach(function(b){if(b.t==='text'&&String(b.v||'').trim())B.push({x:b.v});else if(b.t==='chk'){var I=its(mOrder(n,b));if(I.length)B.push({i:I})}});return{m:B}}
 return{x:String(n.text||'')}}
function plain(p){var L=[],ck=function(I){I.forEach(function(x){L.push((x[1]?'☑ ':'☐ ')+x[0])})};if(p.t)L.push(p.t);if(p.x!=null)L.push(p.x.trim());if(p.i)ck(p.i);(p.m||[]).forEach(function(b){if(b.x!=null)L.push(b.x.trim());else ck(b.i)});return L.join('\n').trim()}
window.nsShareNote=function(n){var p=pack(n);return niEnc(p).then(function(ni){go(p,SH+'?ni='+ni)})};
function go(p,u){var txt=plain(p),all=(txt?txt+'\n\n':'')+u,ti=p.t||txt.split('\n')[0]||'Notis';
 try{if(window.NotisNative&&NotisNative.shareText){NotisNative.shareText(all,ti);return 'native'}}catch(_){}
 if(navigator.share){navigator.share({title:ti,text:all}).catch(function(e){if(!e||e.name!=='AbortError')fb()});return 'share'}fb();return 'fb';
 function fb(){var w=null;try{w=window.open('https://wa.me/?text='+encodeURIComponent(all),'_blank')}catch(_){}if(!w){try{navigator.clipboard.writeText(all).then(function(){toast('Link copiat')},function(){toast('Link copiat')})}catch(_){}}}};
$('nfShare').addEventListener('click',function(){var n=fullId&&findN(fullId);if(!n){toast('Notița e goală');return}nsShareNote(n)});
function imp(p){var now=new Date().toISOString(),n={id:ntUid(),ts:now,createdAt:now,updatedAt:now,tab:noteTab,text:''};
 var ci=function(I){return (I||[]).map(function(x){var c=ciNew(!!x[1]);c.text=String(x[0]||'');return c})};
 if(p.i){n.type='check';n.title=String(p.t||'');n.items=ci(p.i);chkSync(n)}
 else if(p.m){n.type='mix';n.blocks=p.m.map(function(b){return b.i?{id:bUid(),t:'chk',items:ci(b.i)}:{id:bUid(),t:'text',v:String(b.x||'')}});mSync(n)}
 else n.text=String(p.x||'');
 if(!String(n.text).trim()&&!(n.items||[]).length)return;notes.push(n);saveNotes();renderNotes();toast('Notiță importată');setTimeout(function(){fullOpen(n.id)},50)}
var nl=nsLaunch,lastNi='';nsLaunch=function(u){var U;try{U=new URL(u,location.href)}catch(_){return nl.apply(this,arguments)}var ni=U.searchParams.get('ni');if(!ni)return nl.apply(this,arguments);
 try{history.replaceState(history.state,'',location.pathname+location.hash)}catch(_){}if(ni===lastNi)return;lastNi=ni;niDec(ni).then(function(p){if(p&&typeof p==='object')offer(p,U,ni)},function(){})};
function offer(p,U,ni){
 if(U.searchParams.get('nia')){imp(p);return}
 var inApp=!!(window.NotisNative&&NotisNative.isNative&&NotisNative.isNative());
 var cf=$('cfModal').querySelector('.cftxt'),ok=$('cfOk'),no=$('cfNo'),t0=cf.textContent,o0=ok.textContent,n0=no.textContent,back=function(){cf.textContent=t0;ok.textContent=o0;no.textContent=n0;cf.style.whiteSpace=''};
 var pv=plain(p).split('\n').slice(0,6).join('\n');cf.style.whiteSpace='pre-line';cf.textContent=TR('Importă notița')+'?\n\n'+pv;ok.textContent=TR('Da');no.textContent=TR('Nu');
 ok.onclick=function(){jvClose('cfModal');back();
  if(!inApp&&/Android/i.test(navigator.userAgent)&&!window.matchMedia('(display-mode: standalone)').matches){var q='?ni='+ni+'&nia=1',fbk=SH+q;location.href='intent://cluj1313.github.io/notis/'+q+'#Intent;scheme=https;package=ro.cluj1313.notis;S.browser_fallback_url='+encodeURIComponent(fbk)+';end';return}
  imp(p)};
 no.onclick=function(){jvClose('cfModal');back()};$('cfModal').classList.add('show')}
})();
if(window.launchQueue&&launchQueue.setConsumer)launchQueue.setConsumer(function(p){if(p&&p.targetURL)nsLaunch(p.targetURL)});
/* v40/v41: bridge to the native Android app (home-screen widgets). Only active when window.NotisNative exists. */
(function(){var N=window.NotisNative;if(!N||!N.saveSnapshot||DEMO)return; /* demo never reaches widgets/alarms */var T=null;
 function title(n){var t=n.type==='check'?(n.title||''):'';if(!t.trim())t=String(n.text||'').split('\n').filter(function(x){return x.trim()})[0]||'';return t.trim().slice(0,80)}
 function al(n){var a=n.alarm;return a&&a.at?{at:a.at,rep:a.rep||0,until:a.until||null,snz:a.snz||null,rd:a.rd||0,wd:a.wd||0,repM:a.repM||0,dom:a.dom||0}:null}
 function snap(){var L=[],NS=[];notes.forEach(function(n){if(n.del||n.lock||(n.fd&&(!fdAlive(n.fd)||fdLocked(n.fd)))||(findNT(n.tab)||{}).lk)return;var it=[];
   var base=n.createdAt||n.ts||'';function W(x,raw,b){var o={i:x.id,t:String(x.text||'').trim(),d:!!x.done,o:raw.indexOf(x),c:x.createdAt||base,u:x.updatedAt||x.createdAt||base};if(b)o.b=b;return o}
   if(n.type==='check')chkOrder(n).forEach(function(x){if(String(x.text||'').trim())it.push(W(x,n.items||[]))});
   else if(n.type==='mix')(n.blocks||[]).forEach(function(b){if(b.t==='chk')mOrder(n,b).forEach(function(x){if(String(x.text||'').trim())it.push(W(x,b.items||[],b.id))})});
   if(it.length||n.type==='check')L.push({id:n.id,tab:n.tab||'',title:title(n)||TR('Listă'),upd:n.updatedAt||n.ts||'',srt:n.isort||'alpha',base:base,items:it});
   NS.push({id:n.id,tab:n.tab||'',type:n.type||'text',title:title(n),text:String(n.text||'').slice(0,4000),upd:n.updatedAt||n.ts||'',alarm:al(n)})});
  if(typeof medSnap==='function')try{NS=NS.concat(medSnap())}catch(_){}
  return JSON.stringify({v:2,ts:new Date().toISOString(),theme:typeof thCur!=='undefined'?thCur:'color',lang:NL,tabs:noteTabs.filter(function(t){return !t.lk}).map(function(t){return{id:t.id,name:t.name}}),lists:L,notes:NS,sec:secAll()})}
 function secAll(){var o={};[['med','secSnapMed'],['util','secSnapUtil'],['crm','secSnapCrm']].forEach(function(x){try{var f=window[x[1]];var v=typeof f==='function'?f():null;if(v)o[x[0]]=v}catch(_){}});return o} /* v191: Pastile/Plăți/CRM widgets */
 function push(){T=null;try{N.saveSnapshot(snap())}catch(_){}}
 function pushSoon(){clearTimeout(T);T=setTimeout(push,250)}
 var sv=saveNotes;saveNotes=function(){var r=sv.apply(this,arguments);pushSoon();return r};
 function chkArr(n,bid,make){if(n.type==='check'){n.items=n.items||[];return n.items}if(n.type!=='mix')return null;var B=null;(n.blocks||[]).forEach(function(b){if(b.t==='chk'&&(!bid||b.id===bid))B=b});if(!B&&make){B={id:bUid(),t:'chk',items:[]};n.blocks=n.blocks||[];n.blocks.push(B)}return B?(B.items=B.items||[]):null}
 function touch(n){n.updatedAt=n.editedAt=new Date().toISOString();if(n.type==='check')chkSync(n);else if(n.type==='mix')mSync(n)}
 var wri={};try{wri=JSON.parse(localStorage.getItem('ns_wri')||'{}')||{}}catch(_){wri={}}
 function wriSave(){var lim=Date.now()-864e5;for(var k in wri)if(!wri[k]||wri[k].ts<lim)delete wri[k];try{localStorage.setItem('ns_wri',JSON.stringify(wri))}catch(_){}}
 function apply(c){var op=c.op||'t',n=findN(c.n),now=new Date().toISOString();
  if(op==='an'){if(n||!String(c.text||'').trim())return false;var tb=findNT(c.tab)?c.tab:(noteTabs.filter(function(t){return nFold(t.name)==='general'})[0]||noteTabs[0]).id;
   var ts=c.ts?new Date(c.ts).toISOString():now;notes.push({id:c.n,text:String(c.text),tab:tb,ts:ts,createdAt:ts,updatedAt:ts});return true}
  if(op==='rn'){if(!n||!n.del)return false;var t9=n.delTab||n.tab;if(!findNT(t9))t9=(findNT('general')||noteTabs[0]).id;n.tab=t9;delete n.del;delete n.delTab;return true}
  if(!n||n.lock||n.del)return false;
  if(op==='dn'){n.del=now;n.delTab=n.tab;return true}
  /* v95: widget edit — text note (en) / list item (ei), same id, alarm, done state and position */
  if(op==='en'){var tx=String(c.text||'');if((n.type&&n.type!=='text')||!tx.trim()||n.text===tx)return false;n.text=tx;n.updatedAt=n.editedAt=now;return true}
  if(op==='al'){if(c.a&&c.a.at){var o0=n.alarm;n.alarm={at:+c.a.at,rep:+c.a.rep||0,until:c.a.until||null,snz:null};if(o0&&o0.rep&&o0.rep===n.alarm.rep){if(o0.rd)n.alarm.rd=o0.rd;if(o0.wd)n.alarm.wd=o0.wd;if(o0.repM){n.alarm.repM=o0.repM;n.alarm.dom=o0.dom}if(o0.cu)n.alarm.cu=o0.cu}}else if(n.alarm)delete n.alarm;else return false;try{alSchedule(n)}catch(_){}return true}
  if(op==='ar'){var A=n.alarm;if(!A||!A.at||A.at>c.at)return false;if(A.snz&&A.snz<=c.at)A.snz=null;if(A.rep){A.at=alRollA(A,A.at,Math.max(c.at,A.at));if(A.at<Date.now())A.at=alRollA(A,A.at,Date.now());if(A.until&&A.at>A.until)delete n.alarm}else delete n.alarm;return true}
  var arr=chkArr(n,c.b,op==='ai');if(!arr)return false;
  if(op==='ei'){var et=String(c.t||'').trim(),eh=false;if(!et)return false;arr.forEach(function(x){if(x.id===c.i&&String(x.text||'').trim()!==et){x.text=et;x.updatedAt=now;eh=true}});if(eh)touch(n);return eh}
  if(op==='ai'){if(arr.some(function(x){return x.id===c.i})||!String(c.t||'').trim())return false;
   var st=wri[c.n+'|'+c.i],X=c.x||null,obj,at=arr.length;
   if(st&&st.it){obj=st.it;at=st.k}else if(X){obj={id:c.i,text:String(X.t||c.t).trim(),done:!!X.d,createdAt:X.c||now,updatedAt:X.u||X.c||now};if(X.o>=0)at=X.o}
   else obj={id:c.i,text:String(c.t).trim(),done:!!c.d,createdAt:now,updatedAt:now};
   delete wri[c.n+'|'+c.i];wriSave();arr.splice(Math.max(0,Math.min(at,arr.length)),0,obj);n.updatedAt=n.editedAt=now;if(n.type==='check')chkSync(n);else if(n.type==='mix')mSync(n);return true}
  if(op==='ri'){var k=-1;arr.forEach(function(x,ix){if(x.id===c.i)k=ix});if(k<0)return false;wri[c.n+'|'+c.i]={k:k,it:arr[k],ts:Date.now()};wriSave();arr.splice(k,1);touch(n);return true}
  var ch=false;arr.forEach(function(x){if(x.id===c.i&&!!x.done!==!!c.d){x.done=!!c.d;x.updatedAt=now;ch=true}});if(ch)touch(n);return ch}
 function sync(){var p=[];try{p=JSON.parse(N.peekPending()||'[]')}catch(_){p=[]}if(!p.length){push();return}var ch=false,open=fullId&&findN(fullId);
  p.forEach(function(c){try{if(apply(c))ch=true}catch(e){console.warn(e)}});
  if(ch){saveNotes();renderNotes();open=fullId&&findN(fullId);if(open){if(open.type==='check')chkRender();else if(open.type==='mix')mRender();try{edState()}catch(_){}}}
  push();try{N.ackPending(p.length)}catch(_){}}
 /* native alarms ring via Android notifications; the in-page ring only while the app is on screen */
 var af=alFire;alFire=function(){if(document.visibilityState==='hidden')return;return af.apply(this,arguments)};
 var ac=alCheck;alCheck=function(){try{sync()}catch(_){}return ac.apply(this,arguments)};
 window.NotisApp={launch:function(u){nsLaunch(u)},sync:sync};
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')sync();else push()});
 var th=thApply;thApply=function(){var r=th.apply(this,arguments);pushSoon();return r};
 setTimeout(sync,400)})();
/* ---------- v57: automatic backups (see NOTIS_AB in the pre-script) ---------- */
var AB_MAX=5;
function abIdb(){return new Promise(function(res,rej){var r=indexedDB.open('notis-autobk',1);r.onupgradeneeded=function(){r.result.createObjectStore('b',{keyPath:'id'})};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})}
function abIdbTx(mode,fn){return abIdb().then(function(db){return new Promise(function(res,rej){var t=db.transaction('b',mode),s=t.objectStore('b'),q=fn(s);t.oncomplete=function(){res(q&&q.result)};t.onerror=t.onabort=function(){rej(t.error)}})})}
function abIdbAll(){return abIdbTx('readonly',function(s){return s.getAll()}).then(function(a){return (a||[]).sort(function(x,y){return y.id<x.id?-1:1})}).catch(function(){return []})}
function abIdbPut(rec){return abIdbTx('readwrite',function(s){s.put(rec)}).then(abIdbAll).then(function(a){var x=a.slice(AB_MAX);if(!x.length)return;return abIdbTx('readwrite',function(s){x.forEach(function(r){s.delete(r.id)})})}).catch(function(e){console.warn('autobk idb',e)})}
function abNative(){return !!(window.NotisNative&&NotisNative.autoBackup)}
function abStore(rec){var json=JSON.stringify(rec),ok=false;if(abNative()){try{ok=!!NotisNative.autoBackup(rec.id,json)}catch(e){console.warn(e)}}return abIdbPut(rec).then(function(){return ok})}
/* full snapshot now (raw localStorage + photos/recordings/drawings) */
function abNow(reason){if(DEMO)return Promise.resolve(null);var rec={notisAuto:1,id:'auto-'+Date.now(),ts:new Date().toISOString(),reason:reason||'manual',from:NOTIS_AB.cur,to:NOTIS_AB.cur,raw:NOTIS_ABraw()};
 return phDump().then(function(p){rec.photos=p;return abStore(rec)}).then(function(){renderAbList();return rec})}
window.notisAutoBackupNow=abNow;
function abList(){var out={};return abIdbAll().then(function(a){a.forEach(function(r){out[r.id]={id:r.id,ts:r.ts,reason:r.reason,from:r.from,to:r.to,src:'idb'}});
 if(abNative()&&NotisNative.autoBackups){try{JSON.parse(NotisNative.autoBackups()||'[]').forEach(function(m){if(!out[m.id])out[m.id]=Object.assign({src:'native'},m);else out[m.id].nat=1})}catch(e){}}
 return Object.keys(out).map(function(k){return out[k]}).sort(function(x,y){return y.id<x.id?-1:1})})}
function abGet(id){return abIdbTx('readonly',function(s){return s.get(id)}).then(function(r){if(r)return r;if(abNative()&&NotisNative.autoBackupGet){var j=NotisNative.autoBackupGet(id);return j?JSON.parse(j):null}return null}).catch(function(){if(abNative()&&NotisNative.autoBackupGet){var j=NotisNative.autoBackupGet(id);return j?JSON.parse(j):null}return null})}
/* v179: one-time ADDITIVE tab recovery — tabs (incl. Urgențe/Medicamente/Utilități/CRM) present in an automatic pre-update snapshot but missing now are put back at their old place with their notes/folders; nothing is ever removed; snapshot first */
window.tabFix179=function(){if(DEMO||LS.get('ns_tabfix179',null))return Promise.resolve(null);var snaps=[];var pj=function(x){try{return typeof x==='string'?JSON.parse(x):x}catch(_){return null}};
 ['ns_premig','ns_premig_prev'].forEach(function(k){var r=pj(localStorage.getItem(k));if(r&&r.raw)snaps.push(r)});
 return abList().catch(function(){return []}).then(function(a){a=(a||[]).slice().sort(function(x,y){return String(y.ts).localeCompare(String(x.ts))}).slice(0,12);return Promise.all(a.map(function(m){return abGet(m.id).catch(function(){return null})}))}).then(function(rs){(rs||[]).forEach(function(r){if(r&&r.raw)snaps.push(r)});snaps.sort(function(x,y){return String(y.ts||'').localeCompare(String(x.ts||''))});
  var add=[],un=[],has=function(t){return findNT(t.id)||(t.kind&&noteTabs.some(function(x){return x.kind===t.kind}))};
  snaps.forEach(function(r){var st=pj(r.raw.ns_notetabs);if(!Array.isArray(st))return;var sn=pj(r.raw.ns_notes)||[],sf=pj(r.raw.ns_folders)||[];
   st.forEach(function(t,ix){if(!t||!t.id||has(t)||add.some(function(a){return a.t.id===t.id||(t.kind&&a.t.kind===t.kind)}))return;add.push({t:t,prev:st.slice(0,ix).map(function(x){return x.id}).reverse(),n:sn.filter(function(n){return n&&n.tab===t.id}),f:sf.filter(function(f){return f&&f.tab===t.id})})})});
  var s0=snaps[0]&&pj(snaps[0].raw.ns_notetabs);if(Array.isArray(s0))s0.forEach(function(t){if(t&&!t.off&&t.kind&&t.kind!=='rec'){var c=noteTabs.filter(function(x){return x.kind===t.kind})[0];if(c&&c.off)un.push(c)}});
  if(!add.length&&!un.length){LS.set('ns_tabfix179',{ts:Date.now(),tabs:[]});return null}
  return abNow('before-tabfix179').catch(function(){}).then(function(){var names=[],nn=0;
   add.forEach(function(a){var t=JSON.parse(JSON.stringify(a.t));var p=-1;a.prev.some(function(id){var k=noteTabs.findIndex(function(x){return x.id===id});if(k>=0){p=k;return true}});noteTabs.splice(p+1,0,t);names.push(t.name);
    a.f.forEach(function(f){if(!noteFolders.some(function(x){return x.id===f.id}))noteFolders.push(f)});a.n.forEach(function(n){if(!notes.some(function(x){return x.id===n.id})){notes.push(n);nn++}})});
   un.forEach(function(c){c.off=false;names.push(c.name)});
   LS.set('ns_tabfix179',{ts:Date.now(),tabs:names,notes:nn,unhid:un.map(function(c){return c.id})});LS.set('ns_folders',noteFolders);saveNotes(true);try{renderNotes()}catch(_){}try{toast(TR('Tab activat')+': '+names.join(', '))}catch(_){}return names})})};
function abWhy(m){return m.reason==='update'?TR('înainte de actualizare')+(m.from?' ('+String(m.from).split('|').filter(Boolean).join(' / ')+' → '+String(m.to).split('|').filter(Boolean).join(' / ')+')':''):m.reason==='before-update'?TR('înainte de descărcarea actualizării'):m.reason==='before-restore'?TR('înainte de restaurare'):TR('manual')}
function renderAbList(){var box=$('abList');if(!box)return;abList().then(function(a){box.innerHTML='';if(!a.length){var e=document.createElement('div');e.className='bkempty';e.textContent=TR('Niciun backup automat încă.');box.appendChild(e);return}
 a.forEach(function(m){var row=document.createElement('div');row.className='bkrow';var l=document.createElement('div');l.className='bklbl';l.setAttribute('data-u','');l.textContent=bkLabel(new Date(m.ts))+' · '+abWhy(m);row.appendChild(l);
  var acts=document.createElement('div');acts.className='bkacts';var b=document.createElement('button');b.type='button';b.className='btn';b.textContent=TR('Restaurează');b.onclick=function(){abRestore(m.id)};acts.appendChild(b);row.appendChild(acts);box.appendChild(row)})})}
function abRestore(id){abGet(id).then(function(rec){if(!rec||!rec.raw){toast(TR('Nu am putut restaura backup-ul'));return}
 if(!confirm(TR('Se înlocuiește tot ce e acum în aplicație cu backup-ul din ')+bkLabel(new Date(rec.ts))+'?'))return;
 /* safety first: snapshot of the current state, then restore */
 return abNow('before-restore').then(function(){NOTIS_ABput(rec.raw);return rec.photos&&rec.photos.length?phLoad(rec.photos):0}).then(function(){toast(TR('Restaurat · ')+bkLabel(new Date(rec.ts)));setTimeout(function(){location.reload()},700)})}).catch(function(e){console.warn(e);toast(TR('Nu am putut restaura backup-ul'))})}
/* boot finished: this version is now the last good one; complete the pre-update backup with photos */
/* v58: "Read aloud" label must never cover the editor toolbar in long languages: cap width to the free space, shrink font to fit */
function nfReadFit(){var r=$('nfRead');if(!r||!r.getClientRects().length)return;var tb=document.querySelector('#noteFull .nfhist');var free=78;
 if(tb&&tb.getBoundingClientRect().width){free=Math.max(48,Math.floor(innerWidth-14-tb.getBoundingClientRect().right-6))}
 var lbl=r.classList.contains('on')?(nrCode()?'🔊 '+nrCode():TR('🔊 Citește…')):TR('Citește');r.setAttribute('aria-label',lbl);r.title=lbl;
 if(r.textContent!==lbl)r.textContent=lbl;
 document.documentElement.style.setProperty('--rdmax',free+'px');r.style.paddingLeft=r.style.paddingRight='';r.style.fontSize='';
 if(r.scrollWidth>r.clientWidth){r.style.paddingLeft=r.style.paddingRight='10px'}
 for(var f=14;f>12&&r.scrollWidth>r.clientWidth;f--)r.style.fontSize=f-1+'px';
 if(r.scrollWidth>r.clientWidth){r.style.fontSize='';r.textContent=r.classList.contains('on')?(nrCode()?'🔊'+nrCode():'🔊…'):'🔊'}}
window.addEventListener('resize',function(){setTimeout(nfReadFit,50)});
window.nfReadFit=nfReadFit;setTimeout(nfReadFit,300);

/* v119: tap-able phones / addresses / links in the note view (detected at render time only; stored text never changes) */
var LK_RE=(function(){
 var url="(?:https?:\\/\\/|www\\.)[^\\s<>\"'`]+[^\\s<>\"'`.,;:!?)\\]}»”]";
 var tel="(?:\\+|00)\\d[\\d \\t().\\/-]{5,20}\\d|\\(?0\\d[\\d \\t().\\/-]{6,16}\\d";
 var ro="(?:Str\\.|Strada|Bd\\.|B-dul|Bdul\\.?|Bulevardul|Calea|Aleea|Șos\\.|Sos\\.|Șoseaua|Soseaua|Piața|Splaiul|Intrarea|Str)\\s+[A-ZĂÂÎȘȚŞŢ0-9][^\\n,;]{1,40}?(?:,?\\s*(?:nr\\.?|numărul|no\\.?)\\s*\\d+[A-Za-z]?|\\s\\d+[A-Za-z]?\\b)(?:,\\s*(?:bl\\.?|sc\\.?|et\\.?|ap\\.?)\\s*[\\w-]+)*(?:,\\s*[A-ZĂÂÎȘȚ][\\wăâîșțĂÂÎȘȚ-]+(?:[ -][A-ZĂÂÎȘȚ][\\wăâîșț-]+)?)?";
 var intl="\\b\\d{1,5}[A-Za-z]?\\s+(?:[A-Z][\\w'.-]+\\s+){1,3}(?:Street|St\\.|Avenue|Ave\\.|Road|Rd\\.|Boulevard|Blvd\\.|Lane|Ln\\.|Drive|Dr\\.|Way|Place|Pl\\.)|\\b(?:rue|avenue|boulevard|via|viale|calle|avenida|rua)\\s+[^\\n,;]{2,40}?\\s\\d+|\\d{1,4},?\\s+(?:rue|avenue|boulevard|via|calle|rua)\\s+[^\\n,;.]{2,40}|\\b[A-ZÄÖÜ][a-zäöüß]+(?:straße|strasse|gasse|weg|platz|allee)\\s+\\d+[a-z]?";
 var pre="(?:Adresa|Adresă|Address|Adresse|Dirección|Indirizzo|Adres|Cím)\\s*:\\s*[^\\n]{4,120}";
 return new RegExp('('+url+')|('+pre+')|('+ro+')|('+intl+')|('+tel+')','gi')})();
function lnkFind(t){var out=[],m;LK_RE.lastIndex=0;while((m=LK_RE.exec(t))){var v=m[0],k=m[1]?'u':m[2]?'a':m[3]||m[4]?'a':'p';
  if(k==='p'){var d=v.replace(/\D/g,'');var pv=t.charAt(m.index-1),nx=t.slice(m.index+v.length,m.index+v.length+5);
   if(d.length<7||d.length>15||/\d/.test(pv)||/^\d/.test(nx)||/^\s*(lei|ron|eur|€|\$|usd|%)/i.test(nx)||/^\d{1,4}[.\/-]\d{1,2}[.\/-]\d{1,4}$/.test(v.trim())||(!/^(\+|00)/.test(v)&&d.length<9))continue;
   v=v.replace(/[\s.(\/-]+$/,'')}
  if(k==='a'&&m[2])v=v.replace(/\s+$/,'');
  out.push({i:m.index,v:v,k:k});if(!v.length)LK_RE.lastIndex++}return out}
function lnkHtml(t){var L=lnkFind(t),h='',p=0;L.forEach(function(x){h+=esc(t.slice(p,x.i))+'<span class="lk" data-k="'+x.k+'">'+esc(x.v)+'</span>';p=x.i+x.v.length});return h+esc(t.slice(p))}
function lnkOpen(k,v){var u,N=window.NotisNative;
 if(k==='p')u='tel:'+v.replace(/[^\d+]/g,'').replace(/^00/,'+');
 else if(k==='u')u=/^https?:/i.test(v)?v:'https://'+v;
 else{var a=v.replace(/^[^:]{2,12}:\s*/,function(z){return /adres|address|direcc|indirizzo|cím/i.test(z)?'':z});u=N?'geo:0,0?q='+encodeURIComponent(a):'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(a)}
 try{if(N&&N.openUri&&N.openUri(u))return}catch(_){}
 if(k==='u'||/^https:/.test(u)){var w=window.open(u,'_blank','noopener');if(!w)location.href=u}else location.href=u}
function lnkAsk(k,v){var cf=$('cfModal').querySelector('.cftxt'),ok=$('cfOk'),no=$('cfNo'),t0=cf.textContent,o0=ok.textContent,n0=no.textContent,dg=ok.classList.contains('dngb');
 var back=function(){cf.textContent=t0;ok.textContent=o0;no.textContent=n0;if(dg)ok.classList.add('dngb')};
 cf.textContent=(k==='p'?TR('Suni?'):k==='u'?TR('Deschizi linkul?'):TR('Deschizi locația?'))+'\n'+v;cf.style.whiteSpace='pre-line';ok.textContent=TR('Da');no.textContent=TR('Nu');ok.classList.remove('dngb');
 ok.onclick=function(){jvClose('cfModal');back();lnkOpen(k,v)};no.onclick=function(){jvClose('cfModal');back()};$('cfModal').classList.add('show')}
(function(){var ta=$('nfText'),vw=$('nfView'),nf=$('noteFull'),last=null;
 function want(){if(!nf.classList.contains('show')||nf.classList.contains('chk')||nf.classList.contains('mix')||nf.classList.contains('nro')&&false)return false;
  if(window.nrViewOn&&ta.value&&ta.value.length<=60000)return true;
  if(document.activeElement===ta)return false;try{if(speaking)return false}catch(_){}var n=fullId&&findN(fullId);if(n&&n.lock&&!ta.value)return false;
  var v=ta.value;if(!v||v.length>60000)return false;return lnkFind(v).length>0}
 function sync(){var w=want();if(!w){if(nf.classList.contains('nview')){nf.classList.remove('nview');last=null}return}
  if(last!==ta.value){var cs=getComputedStyle(ta);['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','paddingTop','paddingRight','paddingBottom','paddingLeft','color','textAlign','direction'].forEach(function(p){vw.style[p]=cs[p]});
   var c=cs.color.match(/[\d.]+/g)||[255,255,255];vw.classList.toggle('lt',!(c.length>3&&+c[3]<.5)&&(+c[0]*.3+ +c[1]*.59+ +c[2]*.11)<110);vw.innerHTML=lnkHtml(ta.value);last=ta.value}
  nf.classList.add('nview')}
 window.nvSync=sync;
 function offAt(x,y){var r=document.caretRangeFromPoint?document.caretRangeFromPoint(x,y):null;if(!r&&document.caretPositionFromPoint){var q=document.caretPositionFromPoint(x,y);if(q){r={startContainer:q.offsetNode,startOffset:q.offset}}}
  if(!r||!vw.contains(r.startContainer))return ta.value.length;var tw=document.createTreeWalker(vw,NodeFilter.SHOW_TEXT),o=0,n;while((n=tw.nextNode())){if(n===r.startContainer)return o+r.startOffset;o+=n.nodeValue.length}return ta.value.length}
 vw.addEventListener('click',function(e){var sel=window.getSelection&&getSelection();if(sel&&String(sel).length)return;
  var l=e.target.closest&&e.target.closest('.lk');if(l){e.preventDefault();e.stopPropagation();lnkAsk(l.dataset.k,l.textContent);return}
  if(nf.classList.contains('nro'))return;var o=offAt(e.clientX,e.clientY);nf.classList.remove('nview');last=null;try{ta.focus();ta.setSelectionRange(o,o)}catch(_){}});
 ta.addEventListener('blur',function(){setTimeout(sync,120)});ta.addEventListener('focus',function(){if(nf.classList.contains('nview')){nf.classList.remove('nview');last=null}});
 setInterval(function(){if(nf.classList.contains('show')||nf.classList.contains('nview'))sync()},500);
 /* v139: editing mirror layer removed (broke editing in the Android WebView). Flag kept off for safety. */
 window.NOTIS_EDIT_MIRROR=false;try{localStorage.removeItem('ns_editmir')}catch(_){}nf.classList.remove('nmir');
 /* v139: keyboard closed without blur (Android WebView) -> blur so links render blue again */
 function kbHidden(){if(document.activeElement===ta&&nf.classList.contains('show')){try{ta.blur()}catch(_){}setTimeout(sync,140)}}
 window.notisKbHidden=kbHidden;
 var vv=window.visualViewport,vh0=vv?vv.height:0,kbOpen=false;
 if(vv)vv.addEventListener('resize',function(){var h=vv.height,full=Math.max(innerHeight,screen.height*.6);if(h<vh0-150)kbOpen=true;else if(kbOpen&&h>vh0+150){kbOpen=false;kbHidden()}vh0=h});
})();
function ntApplyOrder(ids){var pos=[];noteTabs.forEach(function(t,i){if(ids.indexOf(t.id)>=0)pos.push(i)});var by={};noteTabs.forEach(function(t){by[t.id]=t});var nt=noteTabs.slice();pos.forEach(function(p,k){nt[p]=by[ids[k]]});noteTabs=nt}
function isUrgTab(t){if(!t)return false;var f=nFold(t.name).trim();return t.id==='u'||f==='urgente'||f===nFold(TR('URGENȚE')).trim()}

/* v193: "go to end" round arrow in the note editor/reader — only when the text is longer than the screen and we are not at the bottom; never takes focus */
(function(){var nf=$('noteFull');if(!nf)return;var b=document.createElement('button');b.type='button';b.id='nfEnd';b.tabIndex=-1;b.setAttribute('aria-label',TR('Mergi la final'));b.title=TR('Mergi la final');
 b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v13M6.5 12.5 12 18l5.5-5.5"/></svg>';nf.appendChild(b);
 function vis(e){return e&&e.offsetParent!==null&&getComputedStyle(e).display!=='none'}
 function sc(){var t=$('nfText');if(vis(t)&&t.scrollHeight>t.clientHeight+4)return t;return nf}
 var raf=0;function upd(){raf=0;var on=false;if(nf.classList.contains('show')){var t=$('nfText'),rem=0;if(vis(t)){rem=t.scrollHeight-t.scrollTop-t.clientHeight}else{var c=['nfView','nfChk','nfBlocks'].map($).filter(vis)[0],dn=$('nfDone'),lim=vis(dn)?dn.getBoundingClientRect().top:innerHeight-90;if(c)rem=c.getBoundingClientRect().bottom-lim;rem=Math.min(rem,nf.scrollHeight-nf.scrollTop-nf.clientHeight)}on=rem>40;if(on)b.setAttribute('aria-label',b.title=TR('Mergi la final'));
  var d=$('nfDone'),r=vis(d)?d.getBoundingClientRect():null;if(r&&r.width){b.style.bottom=Math.round(innerHeight-r.bottom+(r.height-36)/2)+'px';b.style.right=Math.round(innerWidth-r.left+12)+'px'}else{b.style.bottom='';b.style.right=''}}
  b.classList.toggle('on',on)}
 function q(){if(!raf)raf=requestAnimationFrame(upd)}
 nf.addEventListener('scroll',q,true);nf.addEventListener('input',q,true);addEventListener('resize',q);if(window.visualViewport)visualViewport.addEventListener('resize',q);
 new MutationObserver(q).observe(nf,{attributes:true,attributeFilter:['class'],subtree:true,childList:true});
 b.addEventListener('pointerdown',function(e){e.preventDefault()});b.addEventListener('mousedown',function(e){e.preventDefault()});
 b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var x=sc();try{x.scrollTo({top:x.scrollHeight,behavior:'smooth'})}catch(_){x.scrollTop=x.scrollHeight}setTimeout(q,450)});
 window.nfEndUpd=q})();
