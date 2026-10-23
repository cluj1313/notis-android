package ro.cluj1313.notis;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import org.json.JSONArray;
import org.json.JSONObject;

/** 2.4.9: chosen alarm sound. Key: "default" | "b:<id>" (bundled res/raw/al_<id>) | "u:<uri>" (phone sound or picked file). Playback never stays silent: chosen → phone default alarm → bundled bell. */
final class AlarmSound {
    static final String[] BUILTIN = {"clopotel", "marimba", "digital", "dimineata", "harpa", "urgent"};
    static final String K = "al_snd", N = "al_snd_name";
    private static MediaPlayer mp;
    private static final android.os.Handler H = new android.os.Handler(android.os.Looper.getMainLooper());
    private static final Runnable STOP = AlarmSound::stop;

    static String key(Context c) { String k = Store.get(c, K); return k == null || k.isEmpty() ? "default" : k; }
    static String name(Context c) { String n = Store.get(c, N); return n == null ? "" : n; }
    static void set(Context c, String k, String n) { Store.put(c, K, k == null || k.isEmpty() ? "default" : k); Store.put(c, N, n); }
    static boolean isDefault(Context c) { return "default".equals(key(c)); }

    static int raw(Context c, String id) { return c.getResources().getIdentifier("al_" + id, "raw", c.getPackageName()); }

    static Uri uriFor(Context c, String k) {
        if (k == null || "default".equals(k)) return null;
        if (k.startsWith("b:")) { int r = raw(c, k.substring(2)); return r == 0 ? null : Uri.parse("android.resource://" + c.getPackageName() + "/" + r); }
        if (k.startsWith("u:")) try { return Uri.parse(k.substring(2)); } catch (Exception e) { return null; }
        return null;
    }

    static String title(Context c, Uri u) {
        try { Ringtone r = RingtoneManager.getRingtone(c, u); if (r != null) { String t = r.getTitle(c); if (t != null && !t.isEmpty()) return t; } } catch (Exception ignored) {}
        try (android.database.Cursor q = c.getContentResolver().query(u, new String[]{android.provider.OpenableColumns.DISPLAY_NAME}, null, null, null)) { if (q != null && q.moveToFirst()) return q.getString(0); } catch (Exception ignored) {}
        return "";
    }

    static String list(Context c) {
        JSONObject o = new JSONObject();
        try { JSONArray a = new JSONArray(); for (String b : BUILTIN) a.put(b); o.put("builtin", a); o.put("cur", key(c)); o.put("name", name(c)); } catch (Exception ignored) {}
        return o.toString();
    }

    /** true when the URI can actually be opened right now (deleted file / lost permission → false) */
    static boolean readable(Context c, Uri u) {
        if (u == null) return false;
        try (java.io.InputStream in = c.getContentResolver().openInputStream(u)) { return in != null; } catch (Exception e) { return false; }
    }

    private static MediaPlayer open(Context c, Uri u, boolean loop) throws Exception {
        MediaPlayer p = new MediaPlayer();
        p.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
        p.setDataSource(c, u); p.setLooping(loop); p.prepare(); return p;
    }

    /** play key k (null = saved choice); loop for ringing; maxMs auto-stop. Falls back so it is never silent. */
    static synchronized void play(Context c, String k, boolean loop, long maxMs) {
        stop();
        c = c.getApplicationContext();
        if (k == null) k = key(c);
        Uri[] tries = {uriFor(c, k), RingtoneManager.getActualDefaultRingtoneUri(c, RingtoneManager.TYPE_ALARM), RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM),
            Uri.parse("android.resource://" + c.getPackageName() + "/" + raw(c, "clopotel"))};
        for (Uri u : tries) {
            if (u == null) continue;
            try {
                final Context cc = c; final MediaPlayer p = open(c, u, loop);
                p.setOnErrorListener((pl, w, e) -> { if (mp == pl) { stop(); if (loop) fallbackRing(cc); } return true; });
                if (!loop) p.setOnCompletionListener(pl -> { if (mp == pl) stop(); });
                p.start(); mp = p;
                H.postDelayed(STOP, maxMs);
                return;
            } catch (Exception ignored) {}
        }
    }
    private static void fallbackRing(Context c) { play(c, "b:clopotel", true, 180000); }
    static synchronized void stop() {
        H.removeCallbacks(STOP);
        if (mp != null) { try { mp.stop(); } catch (Exception ignored) {} try { mp.release(); } catch (Exception ignored) {} mp = null; }
        RingService.quit();
    }
    static boolean playing() { return mp != null; }
}
