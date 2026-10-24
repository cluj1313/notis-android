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

    private static ComponentName googleSvc(MainActivity a) {
        try {
            List<ResolveInfo> l = a.getPackageManager().queryIntentServices(new Intent(RecognitionService.SERVICE_INTERFACE), 0);
            for (ResolveInfo r : l) if (r.serviceInfo != null && r.serviceInfo.packageName.startsWith("com.google.android"))
                return new ComponentName(r.serviceInfo.packageName, r.serviceInfo.name);
        } catch (Exception ignored) {}
        return null;
    }

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
        lastPart = ""; gotFinal = false;
        if (!anyService(a)) { if (!dialog(a, lang)) a.sttJs("err", "noservice"); return; }
        try {
            ComponentName g = googleSvc(a);
            sr = g != null ? SpeechRecognizer.createSpeechRecognizer(a, g) : SpeechRecognizer.createSpeechRecognizer(a);
            a.sttJs("dbg", "svc " + (g != null ? g.flattenToShortString() : "default"));
            sr.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle b) { a.sttJs("dbg", "ready"); }
                @Override public void onBeginningOfSpeech() { a.sttJs("dbg", "begin"); }
                @Override public void onRmsChanged(float v) {}
                @Override public void onBufferReceived(byte[] b) {}
                @Override public void onEndOfSpeech() { a.sttJs("dbg", "eos"); }
                @Override public void onPartialResults(Bundle b) {
                    String t = first(b);
                    if (t != null && t.length() > 0) { lastPart = t; a.sttJs("part", t); }
                }
                @Override public void onEvent(int t, Bundle b) {}
                @Override public void onError(int e) {
                    a.sttJs("dbg", "error " + e);
                    if (lastPart.length() > 0 && !gotFinal) { gotFinal = true; a.sttJs("final", lastPart); a.sttJs("end", ""); release(); return; }
                    String k;
                    switch (e) {
                        case SpeechRecognizer.ERROR_NO_MATCH: case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: k = "nomatch"; break;
                        case SpeechRecognizer.ERROR_NETWORK: case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: k = "network"; break;
                        case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: k = "perm"; break;
                        case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: case 10 /* TOO_MANY_REQUESTS */: k = "busy"; break;
                        case 12 /* LANGUAGE_NOT_SUPPORTED */: case 13 /* LANGUAGE_UNAVAILABLE */: k = "lang"; break;
                        default: k = "e" + e;
                    }
                    release();
                    // Service-level failures: let the Google dialog try instead.
                    if ((k.equals("lang") || e == SpeechRecognizer.ERROR_CLIENT || e == SpeechRecognizer.ERROR_SERVER || e == 11) && dialog(a, lang)) return;
                    a.sttJs("err", k);
                }
                @Override public void onResults(Bundle b) {
                    String t = first(b);
                    if (t == null || t.length() == 0) t = lastPart;
                    a.sttJs("dbg", "results " + (t == null ? 0 : t.length()));
                    if (t != null && t.length() > 0) { gotFinal = true; a.sttJs("final", t); a.sttJs("end", ""); }
                    else a.sttJs("err", "nomatch");
                    release();
                }
            });
            sr.startListening(intent(lang));
        } catch (Exception ex) {
            a.sttJs("dbg", "ex " + ex);
            release();
            if (!dialog(a, lang)) a.sttJs("err", "noservice");
        }
    }

    private static String first(Bundle b) {
        ArrayList<String> r = b == null ? null : b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        return r != null && !r.isEmpty() ? r.get(0) : null;
    }

    /** Result of the RecognizerIntent dialog. */
    static void dialogResult(MainActivity a, int res, Intent data) {
        ArrayList<String> r = data == null ? null : data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
        if (res == MainActivity.RESULT_OK && r != null && !r.isEmpty() && r.get(0).length() > 0) { a.sttJs("final", r.get(0)); a.sttJs("end", ""); }
        else if (res == MainActivity.RESULT_OK) a.sttJs("err", "nomatch");
        else a.sttJs("end", "");
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
