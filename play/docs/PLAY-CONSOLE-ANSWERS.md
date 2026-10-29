# Notis – answers ready to paste into Play Console
App: **Notis** · package `ro.cluj1313.notis` · version **2.1.1 (versionCode 18)** · targetSdk **36** · minSdk 26
Privacy policy URL: **https://cluj1313.github.io/notis/privacy/** (7 languages; `#en`, `#fr`… pick a language)

---------------------------------------------------------------------------
## 1. App content → Privacy policy
`https://cluj1313.github.io/notis/privacy/`

## 2. App content → Ads
**No, my app does not contain ads.**

## 3. App content → App access
**All functionality is available without any access restrictions.** (no login, no account)

## 4. App content → Target audience and content
- Target age groups: **18 and over** (recommended: keeps the app out of the Families policy; nothing changes for younger users who install it anyway).
- "Could your store listing unintentionally appeal to children?" **No.**

## 5. Government apps: **No** · Financial features: **None** · Health apps: **None** · News app: **No** · COVID-19 apps: **No**

---------------------------------------------------------------------------
## 6. Data safety form
**Data collection and security**
| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** (only because of the optional weather card – see below) |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS only) |
| Do you provide a way for users to request that their data is deleted? | **No** – nothing is stored by the developer. (If the form forces a choice, note: "Data is only on the device; users delete it in the app or by uninstalling.") |

**Data types** – tick only:
- **Location → Approximate location**
  - Collected: **Yes** · Shared: **No** (Open-Meteo acts as a service provider for the weather feature; transfers to service providers are not "sharing" in Play's definition)
  - Processed ephemerally: **Yes**
  - Required or optional: **Optional** (users can turn the weather card off / never pick a city)
  - Purpose: **App functionality**

Everything else: **not collected** (Personal info, Financial, Health, Messages, Photos & videos, Audio, Files & docs, Calendar, Contacts, App activity, Web browsing, App info & performance, Device IDs).
Why photos/audio are NOT "collected": they never leave the device (Play only counts data transmitted off the device).

> Alternative (less conservative): answer **"No"** to collection – the app never reads the device location (no location permission in the Android app); only the coordinates of a city the user typed are sent to Open-Meteo. The "Approximate location" answer above is the safe choice that cannot be called inaccurate.

**Passwords tab (v2.16.0):** saved passwords are encrypted on-device (AES-256-GCM, PBKDF2 600k) and never leave the phone → still **not collected** (no "Personal info / Passwords" tick needed). Mention in review notes if asked.

**Security practices summary that Play will show:** "No data shared with third parties · Data is encrypted in transit".

---------------------------------------------------------------------------
## 7. Content rating (IARC questionnaire)
- E-mail: Iosif's contact e-mail · Category: **"All Other App Types"** (utility / productivity)
- Violence: **No** to all · Sexuality/nudity: **No** · Language (profanity): **No** · Controlled substances: **No** · Crude humour: **No** · Fear/horror: **No**
- Gambling / simulated gambling: **No**
- Does the app allow users to interact or exchange content with other users? **No** (sharing a note only goes through Android's own share sheet to apps the user chooses)
- Does the app share the user's current physical location with other users? **No**
- Does the app allow purchases of digital goods? **No**
- Is the app a web browser or search engine / unrestricted internet access? **No**
- Expected result: **PEGI 3 / ESRB Everyone / USK 0 / IARC 3+**

---------------------------------------------------------------------------
## 8. Permissions – justification (for review questions / declarations)
| Permission | Why Notis needs it | When it is used |
|---|---|---|
| `INTERNET`, `ACCESS_NETWORK_STATE` | Loads the app interface (always up to date) from GitHub Pages, falls back to the built-in copy offline; optional weather and read-aloud voice files | App start / when the user uses weather or read-aloud |
| `RECORD_AUDIO` | Record **voice notes** that the user attaches to a note, and **quick recordings** (🔴, RECORDINGS tab) | **Only after the user taps the record button**; runtime permission dialog; audio saved locally, never uploaded; nothing in background |
| `MODIFY_AUDIO_SETTINGS` | Needed by the WebView/MediaRecorder audio pipeline during a voice-note recording | Only during a user-started recording |
| `POST_NOTIFICATIONS` | Show the reminders the user sets | Android 13+ runtime permission dialog (the user can refuse; reminders then cannot show) |
| `SCHEDULE_EXACT_ALARM` (≤ Android 12L) / `USE_EXACT_ALARM` (Android 13+) | Reminders must fire at the exact minute the user chose (the user's own alarms) | Only for reminders the user created |
| `RECEIVE_BOOT_COMPLETED` | Re-schedule the user's reminders after the phone restarts | At boot, local only |
| `VIBRATE` | Vibration for reminder notifications | When a reminder fires |
| `WRITE_EXTERNAL_STORAGE` (maxSdk 28 only) | Save backup/export files on Android 8–9 | Only when the user exports a backup |
| Camera | **No camera permission** – photos are taken by the system camera app via an intent; the image is returned into the note | Only when the user taps "photo" |

### ⚠️ USE_EXACT_ALARM declaration (important)
Google restricts `USE_EXACT_ALARM` to apps whose **core function** is an alarm clock, timer or calendar/reminder with exact times. Play Console will show an **"Exact alarm permission" declaration** in App content. Suggested answer:
> "Notis is a notes and reminders app. Users create reminders for a specific date and time (e.g. 'take medicine at 08:00'); the reminder alarm must fire at the exact minute the user chose, also when the phone is idle (Doze). Exact alarms are only scheduled for reminders explicitly created by the user."
Choose the core-functionality option "**Calendar / reminder app**" (or "Alarm clock" if that is the only fitting option).
**Risk:** a reviewer may decide reminders are not "core" enough and reject. Fallback (needs a small code change, not done yet): remove `USE_EXACT_ALARM` from the Play build and rely on `SCHEDULE_EXACT_ALARM` (user grants it in "Alarms & reminders" settings on Android 14+) – ask me to do it if Google rejects.

---------------------------------------------------------------------------
## 9. Policy notes about the Play build
- The **built-in GitHub updater is disabled** in the Play AAB (`BuildConfig.PLAY=true`, built with `-Pplay=true`) – Play forbids self-updating apps. Updates come only from Play.
- The `?nt_test=1` test hook is **removed from the bundled copy** and is **inert on the live site** (only works on localhost).
- The interface is loaded from `https://cluj1313.github.io/notis/` in a WebView (HTML/JS only, no downloaded executable code) – allowed by Play policy; keep the live site consistent with the listing.
