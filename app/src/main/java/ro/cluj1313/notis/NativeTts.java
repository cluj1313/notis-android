package ro.cluj1313.notis;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Locale;

/** 2.2.0: Android system TTS for "Citește" in the app language (WebView speechSynthesis has no/unstable voices on Android). */
final class NativeTts {
    private static TextToSpeech tts; private static volatile int state; // 0 none, 1 init, 2 ready, -1 failed

    static synchronized void init(Context c) {
        if (tts != null) return; state = 1;
        tts = new TextToSpeech(c.getApplicationContext(), s -> state = s == TextToSpeech.SUCCESS ? 2 : -1);
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { ev(id, "start", 0, 0); }
            @Override public void onDone(String id) { ev(id, "done", 0, 0); }
            @Override public void onError(String id) { ev(id, "error", 0, 0); }
            @Override public void onStop(String id, boolean interrupted) { ev(id, "done", 0, 0); }
            @Override public void onRangeStart(String id, int s, int e, int f) { ev(id, "range", s, e); }
        });
    }
    static int state(Context c) { init(c); return state; }

    static String safeId(String id) { return id == null ? "" : id.replaceAll("[^A-Za-z0-9_-]", ""); }
    private static void ev(String id, String type, int s, int e) {
        MainActivity a = MainActivity.cur; if (a == null) return;
        String js = "window.notisTtsEv&&notisTtsEv('" + safeId(id) + "','" + type + "'," + s + "," + e + ")";
        a.runOnUiThread(() -> a.evalJs(js));
    }

    /** app language code -> TTS locale; same mapping as Tr.loc */
    static Locale loc(String l) { return Tr.loc(l == null || l.isEmpty() ? "ro" : l); }
    static boolean sameLang(Locale v, Locale want) {
        String a = norm(v.getLanguage()), b = norm(want.getLanguage()); if (!a.equals(b)) return false;
        if (a.equals("zh")) { boolean wantT = "Hant".equals(want.getScript()) || "TW".equals(want.getCountry()) || "HK".equals(want.getCountry());
            boolean isT = "Hant".equals(v.getScript()) || "TW".equals(v.getCountry()) || "HK".equals(v.getCountry()) || "MO".equals(v.getCountry()); return wantT == isT; }
        return true;
    }
    static String norm(String l) { switch (l) { case "iw": return "he"; case "in": return "id"; case "no": case "nn": return "nb"; case "fil": return "tl"; default: return l; } }

    static String voices(Context c, String lang) {
        JSONArray out = new JSONArray(); if (state(c) != 2) return state == -1 ? "null" : "[]";
        try { Locale want = loc(lang);
            for (Voice v : tts.getVoices()) {
                if (!sameLang(v.getLocale(), want)) continue;
                boolean notInst = v.getFeatures() != null && v.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED);
                JSONObject o = new JSONObject(); o.put("name", v.getName()); o.put("lang", v.getLocale().toLanguageTag());
                o.put("net", v.isNetworkConnectionRequired()); o.put("installed", !notInst); o.put("quality", v.getQuality()); out.put(o);
            }
        } catch (Exception ignored) {}
        return out.toString();
    }
    static boolean speak(Context c, String text, String voice, String lang, float rate, float pitch, String id) {
        if (state(c) != 2) return false;
        try { Voice pick = null; Locale want = loc(lang);
            if (voice != null && !voice.isEmpty()) for (Voice v : tts.getVoices()) if (v.getName().equals(voice) && sameLang(v.getLocale(), want)) pick = v;
            if (pick != null) tts.setVoice(pick); else { int r = tts.setLanguage(want); if (r < TextToSpeech.LANG_AVAILABLE) return false; }
            tts.setSpeechRate(Math.max(.3f, Math.min(3f, rate))); tts.setPitch(Math.max(.3f, Math.min(2f, pitch)));
            return tts.speak(text, TextToSpeech.QUEUE_FLUSH, new Bundle(), safeId(id)) == TextToSpeech.SUCCESS;
        } catch (Exception e) { return false; }
    }
    static void stop() { try { if (tts != null) tts.stop(); } catch (Exception ignored) {} }

    /** "Descarcă altă voce": install-voice-data screen, else system TTS settings, else Settings */
    static boolean openInstall(Context c) {
        String[] acts = { TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA, "com.android.settings.TTS_SETTINGS", android.provider.Settings.ACTION_SETTINGS };
        for (String a : acts) { try { Intent i = new Intent(a); i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (i.resolveActivity(c.getPackageManager()) == null && !a.equals(android.provider.Settings.ACTION_SETTINGS)) continue;
                c.startActivity(i); return true; } catch (Exception ignored) {} }
        return false;
    }
}
