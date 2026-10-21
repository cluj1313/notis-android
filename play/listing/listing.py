# Store listing texts. Run: python3 listing.py  -> checks limits, writes listing-<lang>.txt + LISTING.md
import json
T = {
"ro-RO": dict(name="Notis – Notițe și mementouri", short="Notițe, liste și mementouri pe telefon. Fără cont, fără reclame, fără urmărire.", full="""Notis este carnetul tău de notițe simplu și elegant – totul rămâne pe telefonul tău.

✍️ NOTIȚE ȘI LISTE
• Scrie notițe rapide sau liste cu bifă (cumpărături, sarcini, bagaje)
• Organizează-le pe categorii și caută instant
• Atașează fotografii și notițe vocale

⏰ MEMENTOURI
• Setează mementouri la ora exactă, cu notificare și alarmă
• Mementourile funcționează și după repornirea telefonului

📱 WIDGETURI
• Vezi listele și notițele direct pe ecranul principal
• Bifează elemente fără să deschizi aplicația

🎨 ARATĂ CUM ÎȚI PLACE
• Mai multe teme: luminoasă, întunecată, VIP aurie, hârtie și altele
• Citire cu voce tare a notițelor (opțional)
• Vremea pentru orașul tău, direct în aplicație (opțional)

🔒 CONFIDENȚIALITATE ÎNAINTE DE TOATE
• Fără cont și fără înregistrare
• Fără reclame, fără analiză, fără urmărire
• Notițele sunt salvate doar local, pe dispozitiv
• Microfonul și camera se folosesc doar când apeși tu butonul
• Backup și export oricând, într-un fișier al tău

🌍 7 LIMBI
Română, English, Français, Deutsch, Italiano, Magyar, Русский.

Notis este creat în România, cu grijă pentru detalii. Simplu de folosit, frumos de privit."""),
"en-US": dict(name="Notis – Notes & Reminders", short="Notes, lists and reminders on your phone. No account, no ads, no tracking.", full="""Notis is your simple, elegant notebook – everything stays on your phone.

✍️ NOTES AND LISTS
• Write quick notes or checklists (shopping, tasks, packing)
• Organise them by category and search instantly
• Attach photos and voice notes

⏰ REMINDERS
• Set reminders for an exact time, with notification and alarm
• Reminders keep working after your phone restarts

📱 WIDGETS
• See your lists and notes right on the home screen
• Tick off items without opening the app

🎨 MAKE IT YOURS
• Several themes: light, dark, gold VIP, paper and more
• Read your notes aloud (optional)
• Weather for your city, right in the app (optional)

🔒 PRIVACY FIRST
• No account, no sign-up
• No ads, no analytics, no tracking
• Notes are stored only locally, on your device
• Microphone and camera are used only when you tap the button
• Backup and export any time, to a file you own

🌍 7 LANGUAGES
Română, English, Français, Deutsch, Italiano, Magyar, Русский.

Made in Romania with care for detail. Simple to use, beautiful to look at."""),
"fr-FR": dict(name="Notis – Notes et rappels", short="Notes, listes et rappels sur votre téléphone. Sans compte, ni pub, ni pistage.", full="""Notis est votre carnet de notes simple et élégant – tout reste sur votre téléphone.

✍️ NOTES ET LISTES
• Notes rapides ou listes à cocher (courses, tâches, valise)
• Classement par catégories et recherche instantanée
• Photos et notes vocales en pièce jointe

⏰ RAPPELS
• Rappels à l'heure exacte, avec notification et alarme
• Ils continuent de fonctionner après un redémarrage

📱 WIDGETS
• Vos listes et notes directement sur l'écran d'accueil
• Cochez des éléments sans ouvrir l'application

🎨 À VOTRE GOÛT
• Plusieurs thèmes : clair, sombre, VIP doré, papier et plus
• Lecture à voix haute des notes (facultatif)
• La météo de votre ville dans l'application (facultatif)

🔒 LA CONFIDENTIALITÉ D'ABORD
• Aucun compte, aucune inscription
• Ni publicité, ni analyse, ni pistage
• Notes stockées uniquement sur votre appareil
• Micro et appareil photo utilisés seulement quand vous appuyez sur le bouton
• Sauvegarde et export à tout moment, dans votre propre fichier

🌍 7 LANGUES
Română, English, Français, Deutsch, Italiano, Magyar, Русский.

Conçu en Roumanie avec le souci du détail. Simple à utiliser, agréable à regarder."""),
"de-DE": dict(name="Notis – Notizen & Erinnerungen", short="Notizen, Listen und Erinnerungen auf dem Handy. Ohne Konto, Werbung, Tracking.", full="""Notis ist dein einfaches, elegantes Notizbuch – alles bleibt auf deinem Telefon.

✍️ NOTIZEN UND LISTEN
• Schnelle Notizen oder Checklisten (Einkauf, Aufgaben, Packliste)
• Nach Kategorien ordnen und sofort suchen
• Fotos und Sprachnotizen anhängen

⏰ ERINNERUNGEN
• Erinnerungen zur exakten Uhrzeit, mit Benachrichtigung und Alarm
• Funktionieren auch nach einem Neustart weiter

📱 WIDGETS
• Listen und Notizen direkt auf dem Startbildschirm
• Einträge abhaken, ohne die App zu öffnen

🎨 GANZ NACH DEINEM GESCHMACK
• Mehrere Designs: hell, dunkel, Gold-VIP, Papier und mehr
• Notizen vorlesen lassen (optional)
• Wetter für deine Stadt direkt in der App (optional)

🔒 DATENSCHUTZ ZUERST
• Kein Konto, keine Anmeldung
• Keine Werbung, keine Analyse, kein Tracking
• Notizen werden nur lokal auf dem Gerät gespeichert
• Mikrofon und Kamera nur, wenn du auf die Taste tippst
• Sicherung und Export jederzeit in deine eigene Datei

🌍 7 SPRACHEN
Română, English, Français, Deutsch, Italiano, Magyar, Русский.

Mit Liebe zum Detail in Rumänien entwickelt. Einfach zu bedienen, schön anzusehen."""),
"it-IT": dict(name="Notis – Note e promemoria", short="Note, liste e promemoria sul telefono. Senza account, pubblicità o tracciamento.", full="""Notis è il tuo taccuino semplice ed elegante – tutto resta sul telefono.

✍️ NOTE E LISTE
• Note veloci o liste di spunta (spesa, attività, valigia)
• Organizzale per categoria e cerca all'istante
• Allega foto e note vocali

⏰ PROMEMORIA
• Promemoria all'ora esatta, con notifica e sveglia
• Funzionano anche dopo il riavvio del telefono

📱 WIDGET
• Liste e note direttamente nella schermata Home
• Spunta gli elementi senza aprire l'app

🎨 COME PIACE A TE
• Diversi temi: chiaro, scuro, VIP oro, carta e altri
• Lettura ad alta voce delle note (facoltativa)
• Il meteo della tua città nell'app (facoltativo)

🔒 PRIMA DI TUTTO LA PRIVACY
• Nessun account, nessuna registrazione
• Niente pubblicità, analisi o tracciamento
• Note salvate solo in locale, sul dispositivo
• Microfono e fotocamera usati solo quando tocchi il pulsante
• Backup ed esportazione in qualsiasi momento, in un tuo file

🌍 7 LINGUE
Română, English, Français, Deutsch, Italiano, Magyar, Русский.

Creata in Romania con cura per i dettagli. Semplice da usare, bella da vedere."""),
"hu-HU": dict(name="Notis – Jegyzet, emlékeztető", short="Jegyzetek, listák és emlékeztetők a telefonodon. Fiók, reklám és követés nélkül.", full="""A Notis egyszerű, elegáns jegyzetfüzeted – minden a telefonodon marad.

✍️ JEGYZETEK ÉS LISTÁK
• Gyors jegyzetek vagy pipálható listák (bevásárlás, teendők, csomagolás)
• Kategóriákba rendezés és azonnali keresés
• Fotók és hangjegyzetek csatolása

⏰ EMLÉKEZTETŐK
• Emlékeztetők pontos időre, értesítéssel és ébresztővel
• Újraindítás után is működnek

📱 MODULOK
• Listák és jegyzetek közvetlenül a kezdőképernyőn
• Pipálj ki tételeket az alkalmazás megnyitása nélkül

🎨 A TE STÍLUSOD
• Több téma: világos, sötét, arany VIP, papír és még több
• Jegyzetek felolvasása (opcionális)
• A városod időjárása az alkalmazásban (opcionális)

🔒 AZ ADATVÉDELEM AZ ELSŐ
• Nincs fiók, nincs regisztráció
• Nincs reklám, analitika vagy követés
• A jegyzetek csak helyben, az eszközön tárolódnak
• Mikrofon és kamera csak akkor, ha megnyomod a gombot
• Mentés és exportálás bármikor, a saját fájlodba

🌍 7 NYELV
Română, English, Français, Deutsch, Italiano, Magyar, Русский.

Romániában készült, a részletekre figyelve. Egyszerű használni, szép ránézni."""),
"ru-RU": dict(name="Notis – Заметки и напоминания", short="Заметки, списки и напоминания на телефоне. Без аккаунта, рекламы и слежки.", full="""Notis — ваш простой и элегантный блокнот: всё остаётся на телефоне.

✍️ ЗАМЕТКИ И СПИСКИ
• Быстрые заметки или списки с галочками (покупки, дела, вещи в дорогу)
• Категории и мгновенный поиск
• Фото и голосовые заметки во вложениях

⏰ НАПОМИНАНИЯ
• Напоминания точно в срок, с уведомлением и будильником
• Работают и после перезагрузки телефона

📱 ВИДЖЕТЫ
• Списки и заметки прямо на главном экране
• Отмечайте пункты, не открывая приложение

🎨 НА ВАШ ВКУС
• Несколько тем: светлая, тёмная, золотая VIP, бумага и другие
• Чтение заметок вслух (по желанию)
• Погода в вашем городе прямо в приложении (по желанию)

🔒 КОНФИДЕНЦИАЛЬНОСТЬ ПРЕЖДЕ ВСЕГО
• Без аккаунта и регистрации
• Без рекламы, аналитики и отслеживания
• Заметки хранятся только на устройстве
• Микрофон и камера — только когда вы нажимаете кнопку
• Резервная копия и экспорт в любой момент, в ваш собственный файл

🌍 7 ЯЗЫКОВ
Română, English, Français, Deutsch, Italiano, Magyar, Русский.

Создано в Румынии с вниманием к деталям. Просто пользоваться, приятно смотреть."""),
}
LIM = dict(name=30, short=80, full=4000)
md = ["# Notis – Google Play store listing (7 languages)\n", "Limits: name ≤30, short ≤80, full ≤4000 characters (checked automatically).\n"]
ok = True
for loc, d in T.items():
    md.append(f"\n## {loc}\n")
    for k in ("name", "short", "full"):
        n = len(d[k]); bad = n > LIM[k]; ok &= not bad
        print(loc, k, n, "TOO LONG" if bad else "ok")
        md.append(f"\n**{k}** ({n}/{LIM[k]})\n\n```\n{d[k]}\n```\n")
    open(f"listing-{loc}.txt", "w").write(f"APP NAME:\n{d['name']}\n\nSHORT DESCRIPTION:\n{d['short']}\n\nFULL DESCRIPTION:\n{d['full']}\n")
open("LISTING.md", "w").write("".join(md)); json.dump(T, open("listing.json", "w"), ensure_ascii=False, indent=1)
assert ok
