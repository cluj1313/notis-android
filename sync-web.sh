#!/bin/bash
# copy the built Notis web app (offline fallback, same origin) into the APK assets
set -e
SRC=${1:-/workspace/notis}; D=app/src/main/assets/www
rm -rf "$D"; mkdir -p "$D/icons" "$D/art"
cp "$SRC/index.html" "$SRC/sw.js" "$SRC/manifest.webmanifest" "$D/"
cp "$SRC"/icons/*.png "$D/icons/"; cp "$SRC"/art/*.svg "$SRC"/art/*.webp "$SRC"/art/*.m4a "$D/art/" 2>/dev/null || true
[ -f "$SRC/blank.html" ] && cp "$SRC/blank.html" "$D/" || true
du -sh "$D"
