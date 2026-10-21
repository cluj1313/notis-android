# App signing key (Play App Signing) – Notis
Decision: **"Use existing app signing key"**. Google Play signs Notis with the **same key as the GitHub APKs**, so the Play version installs **over** the GitHub version (and GitHub updates over Play) — **no uninstall, no data loss**.

### One-time enrollment (before the very first upload!)
The choice can only be made when the app is created / before the first release. Once Google generates its own key it cannot be switched back.
1. Play Console → Notis → **Test and release → App integrity → App signing → Choose signing key → "Use existing app signing key from Java keystore"** (option *Export and upload a key from Java keystore*).
2. Download **encryption_public_key.pem** from that page (it is specific to this app).
3. On the box: `play/export-signing-key.sh /path/to/encryption_public_key.pem`
   → writes `/workspace/notis-android/keystore/notis-play-key-export.zip` (encrypted for Google with the .pem; contains the encrypted private key + certificate). **Never commit it**; delete it after upload.
4. Upload that zip on the same page → **Save**. Play then shows the app signing certificate: its SHA-256 must be `28:2C:B6:E6:…:A1:18` (table below).
5. Upload key: keep using the same keystore (Play accepts the app signing key as upload key). Optionally register a separate upload key later; it never changes what users get.

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

## GitHub ↔ Play
Same signature ⇒ Android treats both as the same app. Rules:
- Each release uses **one versionCode for both channels** (Play AAB and GitHub APK built from the same commit). Android refuses downgrades, so never publish a GitHub APK with a lower versionCode than the Play one.
- The Play build (`-Pplay=true`) has the GitHub self-updater turned off; updates come from Play.
- Notis also makes an automatic full backup on the first start of every new version (Settings → Automatic backups), so even an unexpected problem is recoverable.

## Rebuild
```
cd /workspace/notis-android-src && source ../notis-android/tools/env.sh && ./sync-web.sh /workspace/notis \
 && gradle --offline -Pplay=true testReleaseUnitTest bundleRelease
# -> app/build/outputs/bundle/release/app-release.aab
```
Next Play upload must use a **higher versionCode** than the last one uploaded (current: 20 / 2.2.1). GitHub APK builds (without `-Pplay`) keep the updater.
