#!/bin/bash
# v2.10.0: bundled offline voices (not committed: ~156 MB). Mihai (ro, CC0) + Joe (en-US, CC0) + shared Piper/ONNX runtime.
set -e; D=app/src/main/assets/vb; mkdir -p "$D"; cd "$D"
HF=https://huggingface.co/rhasspy/piper-voices/resolve/main
JD=https://cdn.jsdelivr.net/npm
g(){ [ -s "$2" ] || curl -sfL "$1" -o "$2.part" && mv -f "$2.part" "$2" 2>/dev/null || true; [ -s "$2" ] || { echo "FAIL $2"; exit 1; }; }
g $HF/ro/ro_RO/mihai/medium/ro_RO-mihai-medium.onnx ro_RO-mihai-medium.onnx
g $HF/ro/ro_RO/mihai/medium/ro_RO-mihai-medium.onnx.json ro_RO-mihai-medium.onnx.json
g $HF/en/en_US/joe/medium/en_US-joe-medium.onnx en_US-joe-medium.onnx
g $HF/en/en_US/joe/medium/en_US-joe-medium.onnx.json en_US-joe-medium.onnx.json
g $JD/onnxruntime-web@1.18.0/dist/ort.wasm.min.js ort.wasm.min.js
g $JD/onnxruntime-web@1.18.0/dist/ort-wasm-simd.wasm ort-wasm-simd.wasm
g $JD/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.js piper_phonemize.js
g $JD/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm piper_phonemize.wasm
g $JD/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data piper_phonemize.data
ls -l
