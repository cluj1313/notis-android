# Upload key (Play App Signing) – Notis
The AAB is signed with the **existing** release keystore. In Play App Signing this key becomes the **upload key**; Google generates and keeps the **app signing key** (default, recommended option "Let Google manage and protect your app signing key").

| | |
|---|---|
| Keystore file | `/workspace/notis-android/keystore/notis-release.jks` (box only – **never committed**) |
| Passwords | `/workspace/notis-android/keystore/signing.properties` (box only – **never committed**) |
| Key alias | `notis` |
| Owner | CN=Iosif Cioban, O=Notis, C=RO |
| Algorithm | RSA 4096, SHA384withRSA |
| Valid | 2026-10-18 → 2054-03-05 |
| SHA-256 | `28:2C:B6:E6:0A:FB:6F:22:3E:B1:03:99:BB:0B:F9:71:12:D9:28:D0:62:96:18:07:A7:EE:01:61:CF:4C:A1:18` |
| SHA-1 | `24:01:82:B6:04:2C:A1:09:65:5E:7A:5E:EB:5E:37:4C:78:35:51:AD` |

**Back up the .jks + passwords offline** (USB stick / password manager). If the upload key is lost, Google can reset it (Play Console → App integrity → "Request upload key reset"), unlike the old pre-App-Signing model.

## Consequence for people who installed the GitHub APK
Play will deliver Notis signed with **Google's** app signing key, which differs from the GitHub APK key. Android will not install the Play version over the GitHub version ("app not installed / conflicts"). Those users must: **Settings → Backup (export) → uninstall the GitHub APK → install from Play → import the backup.** Uninstalling wipes local notes, so the backup step is essential.
(Alternative: in Play Console choose "Use my own key" and upload the existing key with Google's PEPK tool – then GitHub and Play builds share a signature. More complex; not recommended unless keeping both channels matters.)

## Rebuild
```
cd /workspace/notis-android/src && source ../tools/env.sh && ./sync-web.sh /workspace/notis \
 && ./gradlew --offline -Pplay=true testReleaseUnitTest bundleRelease
# -> app/build/outputs/bundle/release/app-release.aab
```
Next Play upload must use **versionCode ≥ 19**. GitHub APK builds (without `-Pplay`) keep the updater.
