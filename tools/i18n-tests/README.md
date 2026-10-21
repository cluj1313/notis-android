Translation tests (run with node; expect /workspace/notis checkout + local server on :8766 for t22.js):
- a57.js [langs]: every TR()/HTML string translated
- raw57.js (L=xx): unwrapped UI literals
- strict.js langs: values left in Romanian
- t22.js: runtime DOM scan + screenshots in demo mode
- t57b.js: auto-backup (version change, simulated failing migration -> auto-restore, Settings list + restore)
- t57c.js: read aloud in app language, install-voice intent
