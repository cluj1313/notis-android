package ro.cluj1313.notis;

import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognitionService;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import java.util.ArrayList;
import java.util.List;

/** Speech-to-text for note dictation. Must run on the UI thread; events go to window.__stt(kind, text):
 *  part (live partial), final, end, err (code), dbg (diagnostics). v116: partials, Google service preferred,
 *  last partial used when final is empty, RecognizerIntent dialog fallback. */
final class NativeStt {
    private static SpeechRecognizer sr;
    private static String lastPart = "";
    private static boolean gotFinal;
    static final int INTENT_REQ = 48;

    static boolean anyService(MainActivity a) {
        try { return SpeechRecognizer.isRecognitionAvailable(a); } catch (Exception e) { return false; }
    }

    /** v117: ordered candidates. 2.7.1 picked the first "com.google.android*" service, which on recent phones is
     *  Android System Intelligence (com.google.android.as, on-device only, refuses third-party apps / Romanian) -> error -> dialog.
     *  Now: Google app, then Speech Services by Google, then the system default; never com.google.android.as. */
    private static List<ComponentName> cands(MainActivity a) {
        List<ComponentName> out = new ArrayList<>();
        ComponentName gsa = null, tts = null, other = null;
        try {
            List<ResolveInfo> l = a.getPackageManager().queryIntentServices(new Intent(RecognitionService.SERVICE_INTERFACE), 0);
            for (ResolveInfo r : l) { if (r.serviceInfo == null) continue; String p = r.serviceInfo.packageName; ComponentName c = new ComponentName(p, r.serviceInfo.name);
                if (p.equals("com.google.android.googlequicksearchbox")) gsa = c; else if (p.equals("com.google.android.tts")) tts = c; else if (!p.equals("com.google.android.as") && other == null) other = c; }
        } catch (Exception ignored) {}
        if (gsa != null) out.add(gsa);
        if (tts != null) out.add(tts);
        out.add(null); // system default
        return out;
    }
    private static List<ComponentName> cl; private static int ci; private static String lng;

    static Intent intent(String lang) {
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        if (lang != null && lang.length() > 0) i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        return i;
    }

    /** Google dialog fallback. Returns false if nothing can handle it. */
    static boolean dialog(MainActivity a, String lang) {
        Intent i = intent(lang);
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
        try { a.startActivityForResult(i, INTENT_REQ); a.sttJs("dbg", "dialog"); return true; }
        catch (Exception e) { return false; }
    }

    static void start(final MainActivity a, final String lang) {
        release();
        lastPart = ""; gotFinal = false; lng = lang;
        if (!anyService(a)) { a.sttJs("dbg", "no RecognitionService visible"); if (!dialog(a, lang)) a.sttJs("err", "noservice"); return; }
        cl = cands(a); ci = 0;
        attempt(a);
    }

    private static void next(MainActivity a, String why) {
        a.sttJs("dbg", "fail " + why);
        release();
        if (++ci < cl.size()) { attempt(a); return; }
        if (!dialog(a, lng)) a.sttJs("err", "noservice");
    }

    private static void attempt(final MainActivity a) {
        final ComponentName g = cl.get(ci);
        final int my = ci;
        try {
            sr = g != null ? SpeechRecognizer.createSpeechRecognizer(a, g) : SpeechRecognizer.createSpeechRecognizer(a);
            a.sttJs("dbg", "svc " + (g != null ? g.flattenToShortString() : "default"));
            sr.setRecognitionListener(new RecognitionListener() {
                boolean heard;
                @Override public void onReadyForSpeech(Bundle b) { a.sttJs("dbg", "ready"); }
                @Override public void onBeginningOfSpeech() { heard = true; a.sttJs("dbg", "begin"); }
                @Override public void onRmsChanged(float v) {}
                @Override public void onBufferReceived(byte[] b) {}
                @Override public void onEndOfSpeech() { a.sttJs("dbg", "eos"); }
                @Override public void onPartialResults(Bundle b) {
                    String t = first(b);
                    if (t != null && t.length() > 0) { lastPart = t; a.sttJs("part", t); }
                }
                @Override public void onEvent(int t, Bundle b) {}
                @Override public void onError(int e) {
                    if (my != ci) return;
                    a.sttJs("dbg", "error " + e);
                    if (lastPart.length() > 0 && !gotFinal) { gotFinal = true; a.sttJs("final", lastPart); a.sttJs("end", ""); release(); return; }
                    String k;
                    switch (e) {
                        case SpeechRecognizer.ERROR_NO_MATCH: case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: k = "nomatch"; break;
                        case SpeechRecognizer.ERROR_NETWORK: case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: k = "network"; break;
                        case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: k = "perm"; break;
                        case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: case 10: k = "busy"; break;
                        case 12: case 13: k = "lang"; break;
                        default: k = "e" + e;
                    }
                    // A real "nothing heard" after speech started is a user result, not a service failure.
                    if (k.equals("nomatch") && heard) { release(); a.sttJs("err", k); return; }
                    if (k.equals("perm") || k.equals("network")) { release(); a.sttJs("err", k); return; }
                    next(a, (g != null ? g.getPackageName() : "default") + " e" + e);
                }
                @Override public void onResults(Bundle b) {
                    if (my != ci) return;
                    String t = first(b);
                    if (t == null || t.length() == 0) t = lastPart;
                    a.sttJs("dbg", "results " + (t == null ? 0 : t.length()));
                    if (t != null && t.length() > 0) { gotFinal = true; a.sttJs("final", t); a.sttJs("end", ""); }
                    else a.sttJs("err", "nomatch");
                    release();
                }
            });
            sr.startListening(intent(lng));
        } catch (Exception ex) { next(a, "ex " + ex); }
    }

    private static String first(Bundle b) {
        ArrayList<String> r = b == null ? null : b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        return r != null && !r.isEmpty() ? r.get(0) : null;
    }

    /** Result of the RecognizerIntent dialog. onActivityResult runs BEFORE onResume, while the WebView is still paused,
     *  so the text is queued and delivered by MainActivity.onResume -> deliver(), retried until JS acknowledges. */
    static String pending; static int pendingTries;
    static void dialogResult(MainActivity a, int res, Intent data) {
        ArrayList<String> r = data == null ? null : data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
        String t = r != null && !r.isEmpty() ? r.get(0) : null;
        pending = res == MainActivity.RESULT_OK ? (t != null && t.length() > 0 ? "F" + t : "N") : "C";
        pendingTries = 0;
    }
    static void deliver(final MainActivity a) {
        if (pending == null || a.web == null) return;
        final String p = pending;
        String kind = p.startsWith("F") ? "final" : p.equals("N") ? "nomatch" : "cancel";
        a.web.evaluateJavascript("(function(){try{return window.__sttDeliver?__sttDeliver(" + org.json.JSONObject.quote(kind) + "," + org.json.JSONObject.quote(p.startsWith("F") ? p.substring(1) : "") + "):'no'}catch(e){return 'x'+e}})()", v -> {
            if (v != null && v.contains("ok")) { if (pending == p) pending = null; return; }
            if (++pendingTries < 25) a.web.postDelayed(() -> deliver(a), 400); else pending = null;
        });
    }

    static void stop() {
        if (sr == null) return;
        try { sr.stopListening(); } catch (Exception ignored) {}
        // stopListening normally yields onResults; destroy shortly after if it doesn't.
        final SpeechRecognizer s = sr;
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> { if (sr == s) release(); }, 1500);
    }

    private static void release() { if (sr != null) { try { sr.destroy(); } catch (Exception ignored) {} sr = null; } }
}
