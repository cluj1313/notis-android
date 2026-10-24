package ro.cluj1313.notis;

import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import java.util.ArrayList;

/** Speech-to-text for note dictation. Runs on the UI thread; results go to window.__stt(kind, text). */
final class NativeStt {
    private static SpeechRecognizer sr;

    static void start(final MainActivity a, final String lang) {
        stop();
        try {
            sr = SpeechRecognizer.createSpeechRecognizer(a);
            sr.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle b) {}
                @Override public void onBeginningOfSpeech() {}
                @Override public void onRmsChanged(float v) {}
                @Override public void onBufferReceived(byte[] b) {}
                @Override public void onEndOfSpeech() {}
                @Override public void onPartialResults(Bundle b) {}
                @Override public void onEvent(int t, Bundle b) {}
                @Override public void onError(int e) {
                    String k = e == SpeechRecognizer.ERROR_NO_MATCH ? "nomatch" : e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT ? "timeout"
                        : e == SpeechRecognizer.ERROR_NETWORK || e == SpeechRecognizer.ERROR_NETWORK_TIMEOUT ? "network"
                        : e == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS ? "perm" : "e" + e;
                    a.sttJs("err", k); release();
                }
                @Override public void onResults(Bundle b) {
                    ArrayList<String> r = b == null ? null : b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (r != null && !r.isEmpty()) a.sttJs("final", r.get(0));
                    a.sttJs("end", ""); release();
                }
            });
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            if (lang != null && lang.length() > 0) { i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang); i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang); }
            i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
            i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2500L);
            sr.startListening(i);
        } catch (Exception ex) { a.sttJs("err", ex.getClass().getSimpleName()); release(); }
    }

    static void stop() {
        if (sr == null) return;
        try { sr.stopListening(); } catch (Exception ignored) {}
        release();
    }

    private static void release() { if (sr != null) { try { sr.destroy(); } catch (Exception ignored) {} sr = null; } }
}
