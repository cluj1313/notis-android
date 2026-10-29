# Notis – Google Play kit (v2.1.1, versionCode 18)
- `build/Notis-2.1.1-play.aab` – signed release bundle (upload key, targetSdk 36, Play build: no self-updater, no test hook)
- `privacy/` – privacy policy (7 languages), live at https://cluj1313.github.io/notis/privacy/
- `docs/PLAY-CONSOLE-ANSWERS.md` – data safety, content rating, permissions, declarations
- `docs/UPLOAD-KEY.md` – upload key details (no secrets)
- `docs/CHECKLIST-RO.md` – pașii pentru Iosif
- `listing/` – store texts in 7 languages (limits checked by listing.py)
- `graphics/` – icon 512, feature graphic 1024×500 (RO/EN), 12 phone screenshots 1080×1920 (RO/EN)


## Note v2.16.0 – Parole (password manager)
Vault is AES-256-GCM encrypted on the device (PBKDF2 600k for the master password), never sent over the network, never logged. Data safety answers unchanged (nothing collected). Privacy policy has a "Passwords" section in all 7 languages. FLAG_SECURE is set while the vault tab is visible.
