# Generates privacy/index.html (7 languages, one page). Run: python3 gen.py OUTDIR
import sys, html
DATE = "2026-10-21"
L = {
"ro": ("Română", "Politica de confidențialitate – Notis", "Ultima actualizare", [
 ("Pe scurt", "Notis este o aplicație de notițe, liste și mementouri. Notițele tale rămân pe telefonul tău. Nu există conturi, reclame, analiză (analytics) sau urmărire. Nu colectăm, nu vindem și nu împărtășim datele tale personale."),
 ("Unde sunt păstrate datele", "Notițele, listele, mementourile, fotografiile, înregistrările vocale și setările sunt salvate doar local, în memoria aplicației de pe dispozitivul tău. Nu sunt trimise către noi sau către vreun server al nostru – nu avem un astfel de server."),
 ("Microfon", "Permisiunea pentru microfon (RECORD_AUDIO) este folosită doar când apeși butonul de înregistrare pentru o notiță vocală. Înregistrarea se salvează local, ca fișier audio atașat notiței. Nu ascultăm în fundal și nu trimitem sunetul nicăieri."),
 ("Cameră", "Fotografiile se fac doar când alegi să atașezi o poză, folosind aplicația de cameră a telefonului. Poza rămâne pe dispozitiv, în notiță."),
 ("Notificări și alarme", "Notificările și alarmele exacte sunt folosite doar pentru mementourile pe care le setezi tu. Sunt programate local pe telefon."),
 ("Conexiuni la internet", "Pentru a fi mereu la zi, aplicația își încarcă interfața de pe GitHub Pages (cluj1313.github.io); GitHub, ca gazdă, poate înregistra tehnic adresa IP, conform politicii GitHub. Funcții opționale contactează servicii externe numai când le folosești: vremea (Open-Meteo – primește coordonatele orașului ales), căutarea orașului (Open-Meteo Geocoding), fonturi (Google Fonts) și vocea opțională de citire (fișiere de la jsDelivr și Hugging Face). Conținutul notițelor tale nu este trimis niciodată acestor servicii."),
 ("Export și partajare", "Backup-ul, exportul sau partajarea unei notițe au loc doar când le alegi tu, iar fișierul ajunge unde decizi tu."),
 ("Ștergerea datelor", "Poți șterge orice notiță din aplicație. Dezinstalarea aplicației sau „Șterge datele” din setările Android elimină definitiv toate datele. Fă un backup înainte, dacă vrei să le păstrezi."),
 ("Copii", "Aplicația nu se adresează în mod special copiilor și nu colectează date despre nimeni."),
 ("Modificări și contact", "Dacă politica se schimbă, versiunea nouă va fi publicată pe această pagină. Întrebări: deschide un tichet la github.com/cluj1313/notis-android/issues sau scrie la adresa de e-mail din pagina aplicației din Google Play."),
]),
"en": ("English", "Privacy Policy – Notis", "Last updated", [
 ("In short", "Notis is a notes, lists and reminders app. Your notes stay on your phone. There are no accounts, no ads, no analytics and no tracking. We do not collect, sell or share your personal data."),
 ("Where your data is stored", "Notes, lists, reminders, photos, voice recordings and settings are stored only locally, in the app's storage on your device. They are not sent to us or to any server of ours – we do not run one."),
 ("Microphone", "The microphone permission (RECORD_AUDIO) is used only when you tap the record button to make a voice note. The recording is saved locally as an audio file attached to the note. Nothing is recorded in the background and audio is never uploaded."),
 ("Camera", "Photos are taken only when you choose to attach one, using your phone's camera app. The photo stays on your device, inside the note."),
 ("Notifications and alarms", "Notifications and exact alarms are used only for the reminders you set. They are scheduled locally on the phone."),
 ("Internet connections", "To stay up to date, the app loads its interface from GitHub Pages (cluj1313.github.io); as the host, GitHub may technically log your IP address under GitHub's own policy. Optional features contact external services only when you use them: weather (Open-Meteo – receives the coordinates of the city you picked), city search (Open-Meteo Geocoding), fonts (Google Fonts) and the optional read-aloud voice (files from jsDelivr and Hugging Face). The content of your notes is never sent to these services."),
 ("Export and sharing", "Backup, export or sharing of a note happens only when you choose it, and the file goes where you decide."),
 ("Deleting your data", "You can delete any note in the app. Uninstalling the app or using \"Clear data\" in Android settings permanently removes all data. Make a backup first if you want to keep it."),
 ("Children", "The app is not specifically directed at children and does not collect data about anyone."),
 ("Changes and contact", "If this policy changes, the new version will be published on this page. Questions: open an issue at github.com/cluj1313/notis-android/issues or write to the e-mail address shown on the app's Google Play page."),
]),
"fr": ("Français", "Politique de confidentialité – Notis", "Dernière mise à jour", [
 ("En bref", "Notis est une application de notes, de listes et de rappels. Vos notes restent sur votre téléphone. Pas de compte, pas de publicité, pas d'analyse d'audience, pas de pistage. Nous ne collectons, ne vendons et ne partageons aucune donnée personnelle."),
 ("Où sont stockées vos données", "Notes, listes, rappels, photos, enregistrements vocaux et réglages sont stockés uniquement en local, dans l'espace de l'application sur votre appareil. Ils ne nous sont pas envoyés – nous n'avons aucun serveur."),
 ("Microphone", "L'autorisation micro (RECORD_AUDIO) n'est utilisée que lorsque vous appuyez sur le bouton d'enregistrement d'une note vocale. L'enregistrement est sauvegardé localement, joint à la note. Rien n'est enregistré en arrière-plan ni envoyé en ligne."),
 ("Appareil photo", "Une photo n'est prise que si vous choisissez d'en joindre une, via l'application photo du téléphone. Elle reste sur l'appareil, dans la note."),
 ("Notifications et alarmes", "Les notifications et alarmes exactes servent uniquement aux rappels que vous créez. Elles sont programmées localement."),
 ("Connexions Internet", "Pour rester à jour, l'application charge son interface depuis GitHub Pages (cluj1313.github.io) ; en tant qu'hébergeur, GitHub peut enregistrer techniquement votre adresse IP selon sa propre politique. Des fonctions facultatives contactent des services externes seulement quand vous les utilisez : météo (Open-Meteo – reçoit les coordonnées de la ville choisie), recherche de ville (Open-Meteo Geocoding), polices (Google Fonts) et voix de lecture facultative (fichiers jsDelivr et Hugging Face). Le contenu de vos notes n'est jamais envoyé à ces services."),
 ("Export et partage", "La sauvegarde, l'export ou le partage d'une note n'ont lieu que si vous le décidez, vers l'endroit que vous choisissez."),
 ("Suppression des données", "Vous pouvez supprimer toute note dans l'application. Désinstaller l'application ou « Effacer les données » dans les réglages Android supprime définitivement tout. Faites une sauvegarde avant si besoin."),
 ("Enfants", "L'application ne s'adresse pas spécifiquement aux enfants et ne collecte de données sur personne."),
 ("Modifications et contact", "Toute nouvelle version de cette politique sera publiée sur cette page. Questions : github.com/cluj1313/notis-android/issues ou l'adresse e-mail indiquée sur la fiche Google Play."),
]),
"de": ("Deutsch", "Datenschutzerklärung – Notis", "Zuletzt aktualisiert", [
 ("Kurz gesagt", "Notis ist eine App für Notizen, Listen und Erinnerungen. Deine Notizen bleiben auf deinem Telefon. Keine Konten, keine Werbung, keine Analyse, kein Tracking. Wir erheben, verkaufen oder teilen keine personenbezogenen Daten."),
 ("Wo deine Daten gespeichert werden", "Notizen, Listen, Erinnerungen, Fotos, Sprachaufnahmen und Einstellungen werden nur lokal im App-Speicher auf deinem Gerät gespeichert. Sie werden nicht an uns gesendet – wir betreiben keinen Server."),
 ("Mikrofon", "Die Mikrofonberechtigung (RECORD_AUDIO) wird nur genutzt, wenn du für eine Sprachnotiz auf Aufnehmen tippst. Die Aufnahme wird lokal als Audiodatei an der Notiz gespeichert. Es wird nichts im Hintergrund aufgenommen oder hochgeladen."),
 ("Kamera", "Fotos werden nur aufgenommen, wenn du eines anhängen möchtest – über die Kamera-App des Telefons. Das Foto bleibt auf dem Gerät in der Notiz."),
 ("Benachrichtigungen und Alarme", "Benachrichtigungen und exakte Alarme dienen nur den Erinnerungen, die du einstellst. Sie werden lokal geplant."),
 ("Internetverbindungen", "Um aktuell zu bleiben, lädt die App ihre Oberfläche von GitHub Pages (cluj1313.github.io); als Host kann GitHub technisch deine IP-Adresse gemäß eigener Richtlinie protokollieren. Optionale Funktionen kontaktieren externe Dienste nur bei Nutzung: Wetter (Open-Meteo – erhält die Koordinaten der gewählten Stadt), Ortssuche (Open-Meteo Geocoding), Schriftarten (Google Fonts) und die optionale Vorlesestimme (Dateien von jsDelivr und Hugging Face). Der Inhalt deiner Notizen wird nie an diese Dienste gesendet."),
 ("Export und Teilen", "Sicherung, Export oder Teilen einer Notiz erfolgt nur, wenn du es wählst, und die Datei landet dort, wo du willst."),
 ("Daten löschen", "Du kannst jede Notiz in der App löschen. Deinstallieren oder „Daten löschen“ in den Android-Einstellungen entfernt alle Daten endgültig. Mach vorher ein Backup, wenn du sie behalten willst."),
 ("Kinder", "Die App richtet sich nicht speziell an Kinder und erhebt über niemanden Daten."),
 ("Änderungen und Kontakt", "Änderungen werden auf dieser Seite veröffentlicht. Fragen: github.com/cluj1313/notis-android/issues oder die E-Mail-Adresse auf der Google-Play-Seite der App."),
]),
"it": ("Italiano", "Informativa sulla privacy – Notis", "Ultimo aggiornamento", [
 ("In breve", "Notis è un'app per note, liste e promemoria. Le tue note restano sul telefono. Nessun account, nessuna pubblicità, nessuna analisi, nessun tracciamento. Non raccogliamo, vendiamo né condividiamo dati personali."),
 ("Dove sono conservati i dati", "Note, liste, promemoria, foto, registrazioni vocali e impostazioni sono salvati solo in locale, nella memoria dell'app sul tuo dispositivo. Non vengono inviati a noi – non abbiamo alcun server."),
 ("Microfono", "Il permesso del microfono (RECORD_AUDIO) è usato solo quando tocchi il pulsante di registrazione per una nota vocale. La registrazione è salvata in locale, allegata alla nota. Nulla viene registrato in background o caricato online."),
 ("Fotocamera", "Le foto vengono scattate solo se scegli di allegarne una, tramite l'app fotocamera del telefono. La foto resta sul dispositivo, nella nota."),
 ("Notifiche e sveglie", "Notifiche e sveglie esatte servono solo per i promemoria che imposti. Sono programmate in locale."),
 ("Connessioni Internet", "Per restare aggiornata, l'app carica l'interfaccia da GitHub Pages (cluj1313.github.io); come host, GitHub può registrare tecnicamente il tuo indirizzo IP secondo la propria policy. Funzioni facoltative contattano servizi esterni solo quando le usi: meteo (Open-Meteo – riceve le coordinate della città scelta), ricerca città (Open-Meteo Geocoding), caratteri (Google Fonts) e la voce di lettura facoltativa (file da jsDelivr e Hugging Face). Il contenuto delle note non viene mai inviato a questi servizi."),
 ("Esportazione e condivisione", "Backup, esportazione o condivisione di una nota avvengono solo quando lo scegli tu, e il file va dove decidi."),
 ("Eliminazione dei dati", "Puoi eliminare qualsiasi nota nell'app. Disinstallare l'app o «Cancella dati» nelle impostazioni Android rimuove definitivamente tutto. Fai prima un backup se vuoi conservarli."),
 ("Bambini", "L'app non è rivolta specificamente ai bambini e non raccoglie dati su nessuno."),
 ("Modifiche e contatti", "Eventuali modifiche saranno pubblicate su questa pagina. Domande: github.com/cluj1313/notis-android/issues o l'indirizzo e-mail indicato nella pagina Google Play dell'app."),
]),
"hu": ("Magyar", "Adatvédelmi irányelvek – Notis", "Utolsó frissítés", [
 ("Röviden", "A Notis jegyzet-, lista- és emlékeztető alkalmazás. A jegyzeteid a telefonodon maradnak. Nincs fiók, nincs reklám, nincs analitika, nincs követés. Nem gyűjtünk, nem adunk el és nem osztunk meg személyes adatot."),
 ("Hol tárolódnak az adatok", "A jegyzetek, listák, emlékeztetők, fotók, hangfelvételek és beállítások kizárólag helyben, az alkalmazás tárhelyén maradnak az eszközödön. Nem küldjük el őket nekünk – nincs is szerverünk."),
 ("Mikrofon", "A mikrofon engedélyt (RECORD_AUDIO) csak akkor használjuk, amikor hangjegyzethez megnyomod a felvétel gombot. A felvétel helyben, a jegyzethez csatolt hangfájlként mentődik. Háttérben semmi nem rögzül, és semmi nem kerül feltöltésre."),
 ("Kamera", "Fotó csak akkor készül, ha csatolni szeretnél egyet, a telefon kamera alkalmazásával. A kép az eszközön, a jegyzetben marad."),
 ("Értesítések és ébresztők", "Az értesítéseket és pontos ébresztőket csak az általad beállított emlékeztetőkhöz használjuk, helyben ütemezve."),
 ("Internetkapcsolatok", "Hogy mindig naprakész legyen, az alkalmazás a felületét a GitHub Pages-ről (cluj1313.github.io) tölti be; tárhelyszolgáltatóként a GitHub technikailag naplózhatja az IP-címedet a saját irányelvei szerint. Opcionális funkciók csak használatkor érnek el külső szolgáltatásokat: időjárás (Open-Meteo – a kiválasztott város koordinátáit kapja meg), városkeresés (Open-Meteo Geocoding), betűtípusok (Google Fonts) és az opcionális felolvasó hang (fájlok a jsDelivr-ről és a Hugging Face-ről). A jegyzeteid tartalma soha nem jut el ezekhez a szolgáltatásokhoz."),
 ("Exportálás és megosztás", "Biztonsági mentés, exportálás vagy megosztás csak akkor történik, ha te választod, és a fájl oda kerül, ahová te döntöd."),
 ("Adatok törlése", "Bármely jegyzetet törölheted az alkalmazásban. Az eltávolítás vagy az Android-beállítások „Adatok törlése” opciója végleg mindent töröl. Előtte készíts mentést, ha meg akarod tartani."),
 ("Gyermekek", "Az alkalmazás nem kifejezetten gyermekeknek szól, és senkiről nem gyűjt adatot."),
 ("Változások és kapcsolat", "A módosításokat ezen az oldalon tesszük közzé. Kérdések: github.com/cluj1313/notis-android/issues vagy az alkalmazás Google Play-oldalán szereplő e-mail-cím."),
]),
"ru": ("Русский", "Политика конфиденциальности – Notis", "Последнее обновление", [
 ("Коротко", "Notis — приложение для заметок, списков и напоминаний. Ваши заметки остаются на телефоне. Нет аккаунтов, рекламы, аналитики и отслеживания. Мы не собираем, не продаём и не передаём ваши персональные данные."),
 ("Где хранятся данные", "Заметки, списки, напоминания, фото, голосовые записи и настройки хранятся только локально, в памяти приложения на вашем устройстве. Они не отправляются нам — у нас нет сервера."),
 ("Микрофон", "Разрешение на микрофон (RECORD_AUDIO) используется только когда вы нажимаете кнопку записи голосовой заметки. Запись сохраняется локально как аудиофайл в заметке. Ничего не записывается в фоне и не загружается в сеть."),
 ("Камера", "Фото делается только если вы решите прикрепить снимок — через приложение камеры телефона. Фото остаётся на устройстве, в заметке."),
 ("Уведомления и будильники", "Уведомления и точные будильники используются только для напоминаний, которые вы задаёте. Они планируются локально."),
 ("Подключения к интернету", "Чтобы всегда быть актуальным, приложение загружает интерфейс с GitHub Pages (cluj1313.github.io); как хостинг, GitHub может технически записывать ваш IP-адрес согласно своей политике. Необязательные функции обращаются к внешним сервисам только при использовании: погода (Open-Meteo — получает координаты выбранного города), поиск города (Open-Meteo Geocoding), шрифты (Google Fonts) и необязательный голос для чтения вслух (файлы с jsDelivr и Hugging Face). Содержимое заметок никогда не передаётся этим сервисам."),
 ("Экспорт и отправка", "Резервная копия, экспорт или отправка заметки происходят только по вашему выбору, и файл попадает туда, куда решите вы."),
 ("Удаление данных", "Любую заметку можно удалить в приложении. Удаление приложения или «Очистить данные» в настройках Android безвозвратно удаляет все данные. Сначала сделайте резервную копию, если хотите их сохранить."),
 ("Дети", "Приложение не предназначено специально для детей и ни о ком не собирает данные."),
 ("Изменения и контакты", "Изменения политики публикуются на этой странице. Вопросы: github.com/cluj1313/notis-android/issues или адрес e-mail на странице приложения в Google Play."),
]),
}
e = html.escape
nav = " ".join(f'<a href="#{k}" data-l="{k}">{e(v[0])}</a>' for k, v in L.items())
secs = []
for k, (nm, title, upd, items) in L.items():
    body = "".join(f"<h2>{e(h)}</h2><p>{e(p)}</p>" for h, p in items)
    secs.append(f'<section id="{k}" lang="{k}"><h1>{e(title)}</h1><p class="d">{e(upd)}: {DATE}</p>{body}</section>')
page = f"""<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Notis – Privacy Policy / Politica de confidențialitate</title>
<style>body{{font:16px/1.6 system-ui,sans-serif;max-width:760px;margin:0 auto;padding:16px;color:#1d1b18;background:#faf7f0}}
nav{{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}}nav a{{padding:4px 10px;border:1px solid #c9a227;border-radius:14px;color:#6b5410;text-decoration:none}}
nav a.on{{background:#c9a227;color:#fff}}h1{{font-size:1.5em}}h2{{font-size:1.1em;margin-top:1.4em}}.d{{color:#777}}
section{{display:none}}section.on{{display:block}}@media print{{section{{display:block}}}}</style></head><body>
<nav>{nav}</nav>{''.join(secs)}
<noscript><style>section{{display:block;border-top:1px solid #ccc}}</style></noscript>
<script>(function(){{var ks={list(L)!r};function sh(k){{if(ks.indexOf(k)<0)k='ro';ks.forEach(function(x){{document.getElementById(x).className=x===k?'on':'';document.querySelector('[data-l='+x+']').className=x===k?'on':''}});document.documentElement.lang=k}}
function pick(){{var h=location.hash.slice(1);if(ks.indexOf(h)>=0)return h;var n=(navigator.language||'ro').slice(0,2).toLowerCase();return ks.indexOf(n)>=0?n:(n==='mo'?'ro':'en')}}
addEventListener('hashchange',function(){{sh(pick())}});sh(pick())}})()</script></body></html>"""
open(sys.argv[1] + "/index.html", "w").write(page)
