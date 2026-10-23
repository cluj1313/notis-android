#!/bin/bash
# copy the built Notis web app (offline fallback, same origin) into the APK assets
set -e
SRC=${1:-/workspace/notis}; D=app/src/main/assets/www
rm -rf "$D"; mkdir -p "$D/icons" "$D/art"
cp "$SRC/index.html" "$SRC/sw.js" "$SRC"/manifest*.webmanifest "$D/"
cp "$SRC"/icons/*.png "$D/icons/"; cp "$SRC"/art/*.svg "$SRC"/art/*.webp "$SRC"/art/*.m4a "$D/art/" 2>/dev/null || true
mkdir -p "$D/snd"; cp "$SRC"/snd/*.mp3 "$D/snd/" 2>/dev/null || true
mkdir -p "$D/fonts"; cp "$SRC"/fonts/* "$D/fonts/"
mkdir -p "$D/i18n"; cp "$SRC"/i18n/*.js "$D/i18n/"
[ -f "$SRC/blank.html" ] && cp "$SRC/blank.html" "$D/" || true
sed -i "/nt_test=1/d" "$D/index.html"  # no test hook in the shipped bundle
du -sh "$D"
