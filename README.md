# Notis for Android

Native wrapper for [Notis](https://cluj1313.github.io/notis/) with a home-screen checklist widget.

- WebView loads the live app (updates arrive automatically); with no network it serves a bundled copy under the same origin, so storage stays the same.
- `window.NotisNative` bridge: the web app pushes a checklist snapshot on every save; widget ticks are queued natively and applied by the web app on resume (idempotent, acknowledged only after saving).
- Widget: resizable list of one checklist (default: most recent list in the "Cumpărături" tab, else most recent checklist), tap to tick, tap title to open the note, `+` for a new note. Long-press → reconfigure to pick another list.

Build: `./sync-web.sh /path/to/notis && ./gradlew assembleRelease` (signing via an untracked `signing.properties`).
