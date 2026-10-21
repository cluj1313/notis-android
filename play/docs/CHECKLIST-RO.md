# Notis pe Google Play – pașii pentru Iosif
Tot ce trebuie încărcat e în folderul **notis-play/** (și în repo: `notis-android/play/`).
⚠️ Eu (asistentul) **nu** am creat cont și **nu** am trimis nimic – pașii de mai jos îi faci tu.

## 1. Contul de dezvoltator (o singură dată)
1. Intră pe **play.google.com/console** cu contul tău Google (ideal unul dedicat, ex. notis.dev@gmail.com).
2. Alege tip cont **„Personal” (Yourself)**.
3. Completează numele legal, adresa, telefonul și un **e-mail de contact public** (apare în Play).
4. Plătește taxa unică de **25 USD** cu cardul.
5. **Verificarea identității**: încarci buletinul/pașaportul (numele trebuie să fie identic cu cel din cont). Durează de obicei 1–3 zile, uneori mai mult.
6. Verifică telefonul și e-mailul (cod prin SMS / e-mail).
7. Instalează aplicația **Google Play Console** pe telefonul Android și confirmă că ai un dispozitiv Android (cerință nouă de verificare).

## 2. Creezi aplicația
1. Play Console → **Create app** → Nume: `Notis – Notițe și mementouri` · Limba implicită: **Română (ro-RO)** · Tip: **App** · **Free** → bifezi declarațiile.
2. **Setup → App integrity → App signing**: lași varianta implicită **„Google manages the app signing key”**. (Cheia ta existentă devine „upload key” – vezi `docs/UPLOAD-KEY.md`.)

## 3. „App content” (Policy → App content) – răspunsurile sunt gata în `docs/PLAY-CONSOLE-ANSWERS.md`
- **Privacy policy**: `https://cluj1313.github.io/notis/privacy/`
- **Ads**: Nu · **App access**: fără restricții · **Target audience**: 18+
- **Content rating**: completezi chestionarul exact ca în document → PEGI 3
- **Data safety**: ca în document (doar „Approximate location”, opțional, pentru vreme)
- **Exact alarm (USE_EXACT_ALARM)**: textul de declarație e în document
- Government / Financial / Health / News: Nu

## 4. „Store listing” (Grow → Store presence → Main store listing)
- Texte: `listing/listing-ro-RO.txt` (nume, descriere scurtă, descriere lungă). Pentru celelalte limbi: **Manage translations → Add your own translations** → en-US, fr-FR, de-DE, it-IT, hu-HU, ru-RU, cu fișierele `listing/listing-<limba>.txt`.
- **App icon** 512×512: `graphics/icon-512.png`
- **Feature graphic** 1024×500: `graphics/feature-1024x500.png` (RO) / `feature-1024x500-en.png` (pentru EN și celelalte)
- **Phone screenshots** (minim 2, max 8): `graphics/screenshots/ro-*.png` pentru română, `en-*.png` pentru engleză (și pentru restul limbilor).
- Categorie: **Productivity** · E-mail de contact · (site opțional: https://cluj1313.github.io/notis/)

## 5. Testul închis – OBLIGATORIU pentru conturile personale noi
Regula Google: **minim 12 testeri** care s-au înscris și **au rămas înscriși 14 zile la rând** într-un test închis, înainte să poți cere publicarea în Production.
1. **Testing → Closed testing → Create track** (sau folosești „Alpha”).
2. **Testers**: alegi **Email list** → creezi o listă (ex. „Prieteni Notis”) și adaugi adresele Gmail ale celor ≥12 persoane (pune 15–20, unii uită să se înscrie). Alternativ, un **Google Group** și adaugi adresa grupului.
3. **Create new release** → încarci **`build/Notis-2.1.1-play.aab`** → la „Release notes” scrii ex. `Prima versiune pe Google Play.` → **Review release → Start rollout to Closed testing**.
4. Trimiți la verificare (**Send for review** în „Publishing overview”): prima versiune intră la verificare Google (câteva ore – câteva zile).
5. După aprobare, copiezi **linkul de înscriere (opt-in URL)** din pagina track-ului și îl trimiți testerilor (WhatsApp/e-mail). Fiecare: deschide linkul cu contul Gmail din listă → **„Become a tester”** → apoi instalează Notis din Play.
   - Cine are deja Notis din GitHub: întâi **Setări → Backup/Export**, apoi dezinstalează versiunea GitHub, instalează din Play și importă backup-ul (semnăturile diferă).
6. Ține testul activ **14 zile**; roagă testerii să deschidă aplicația din când în când și să lase feedback (Google se uită și la implicare).
7. După 14 zile: **Dashboard → Apply for production** → răspunzi la câteva întrebări despre test (cum ai găsit testeri, ce feedback ai primit, ce ai schimbat).
8. Când primești acces: **Production → Create new release** → **promovezi** același AAB sau încarci unul nou (versionCode mai mare) → trimiți la review.

## 6. Unde încarci fiecare lucru (rezumat)
| Ce | Fișier | Unde în Play Console |
|---|---|---|
| Aplicația | `build/Notis-2.1.1-play.aab` | Testing → Closed testing → Create release |
| Politica de confidențialitate | URL-ul de mai sus | Policy → App content → Privacy policy |
| Data safety, rating, permisiuni | `docs/PLAY-CONSOLE-ANSWERS.md` | Policy → App content |
| Texte magazin (7 limbi) | `listing/*.txt`, `listing/LISTING.md` | Store presence → Main store listing (+ translations) |
| Iconiță 512 | `graphics/icon-512.png` | Main store listing → Graphics |
| Feature graphic | `graphics/feature-1024x500*.png` | Main store listing → Graphics |
| Capturi telefon | `graphics/screenshots/*.png` | Main store listing → Phone screenshots |

## 7. De reținut
- Numele pachetului `ro.cluj1313.notis` e definitiv.
- Fiecare versiune nouă pentru Play cere **versionCode mai mare** (următoarea: 19). Spune-mi și îți fac AAB-ul.
- Păstrează **notis-release.jks + parolele** într-un loc sigur (stick + manager de parole).
- Varianta din Play **nu** mai are actualizarea automată din GitHub – se actualizează doar prin Play.
