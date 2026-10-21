#!/bin/bash
# Export the EXISTING release key for Play App Signing ("Use existing app signing key" → "Export and upload a key from Java keystore").
# Usage: play/export-signing-key.sh /path/to/encryption_public_key.pem   (the .pem is downloaded from Play Console, per app)
# Output: /workspace/notis-android/keystore/notis-play-key-export.zip  — encrypted for Google; NEVER commit it.
set -euo pipefail
PEM=${1:?usage: $0 encryption_public_key.pem}
KS_DIR=/workspace/notis-android/keystore; SP=$KS_DIR/signing.properties
PEPK=${PEPK:-/workspace/notis-android/tools/pepk/pepk.jar}; OUT=${OUT:-$KS_DIR/notis-play-key-export.zip}
JAVA=${JAVA_HOME:-/workspace/notis-android/tools/jdk-17.0.20.1+1}/bin/java
get(){ grep -E "^$1=" "$SP" | head -1 | cut -d= -f2-; }
"$JAVA" -jar "$PEPK" --keystore="$(get storeFile)" --alias="$(get keyAlias)" \
  --keystore-pass="$(get storePassword)" --key-pass="$(get keyPassword)" \
  --output="$OUT" --include-cert --rsa-aes-encryption --encryption-key-path="$PEM"
chmod 600 "$OUT"; echo "Encrypted key export: $OUT  (upload it in Play Console; do not commit)"
