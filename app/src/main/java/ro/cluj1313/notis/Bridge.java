package ro.cluj1313.notis;

import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** window.NotisNative inside the WebView */
final class Bridge {
    private final Context ctx;
    Bridge(Context c) { ctx = c.getApplicationContext(); }

    @JavascriptInterface public boolean isNative() { if (!MainActivity.trusted) return false; return true; }
    @JavascriptInterface public String version() { if (!MainActivity.trusted) return ""; try { return ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0).versionName; } catch (Exception e) { return ""; } }

    @JavascriptInterface public void saveSnapshot(String json) { if (!MainActivity.trusted) return;
        Store.saveSnapshot(ctx, json);
        NotisWidget.refreshAll(ctx);
        Scheduler.rescheduleAll(ctx);
    }
    @JavascriptInterface public void setLang(String l) { if (!MainActivity.trusted) return;
        if (Tr.setLang(ctx, l)) { AlarmReceiver.channel(ctx); NotisWidget.refreshAll(ctx); }
    }
    /* native recorder fallback (when WebView getUserMedia fails): "ok" | "perm" | "err:..." ; stop returns base64 AAC/m4a */
    @JavascriptInterface public String recStart() { if (!MainActivity.trusted) return "err:untrusted";
        if (ctx.checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            MainActivity a = MainActivity.cur; if (a == null) return "err:noactivity"; a.askMicForBridge(); return "perm"; }
        return NativeRec.start(new File(ctx.getCacheDir(), "rec.m4a"));
    }
    @JavascriptInterface public String recStop() { if (!MainActivity.trusted) return ""; return NativeRec.stop(); }
    @JavascriptInterface public void recCancel() { if (!MainActivity.trusted) return; NativeRec.cancel(); }
    /* 2.2.0 system TTS in the app language */
    @JavascriptInterface public int ttsState() { if (!MainActivity.trusted) return -1; return NativeTts.state(ctx); }
    @JavascriptInterface public String ttsVoices(String lang) { if (!MainActivity.trusted) return "[]"; return NativeTts.voices(ctx, lang); }
    @JavascriptInterface public boolean ttsSpeak(String text, String voice, String lang, float rate, float pitch, String id) { if (!MainActivity.trusted) return false; return NativeTts.speak(ctx, text, voice, lang, rate, pitch, id); }
    @JavascriptInterface public void ttsStop() { if (!MainActivity.trusted) return; NativeTts.stop(); }
    @JavascriptInterface public boolean ttsInstall() { if (!MainActivity.trusted) return false; return NativeTts.openInstall(ctx); }
    @JavascriptInterface public String peekPending() { if (!MainActivity.trusted) return ""; return Store.peekPending(ctx); }
    @JavascriptInterface public void ackPending(int k) { if (!MainActivity.trusted) return; Store.ackPending(ctx, k); NotisWidget.refreshAll(ctx); Scheduler.rescheduleAll(ctx); }

    /* v57 automatic backups (before updates / migrations), private storage that survives app updates */
    @JavascriptInterface public boolean autoBackup(String id, String json) { if (!MainActivity.trusted) return false; return AutoBackup.write(ctx.getFilesDir(), id, json); }
    @JavascriptInterface public void autoBackupDone() { if (MainActivity.trusted) MainActivity.backupDone(); }
    @JavascriptInterface public String autoBackups() { if (!MainActivity.trusted) return "[]"; return AutoBackup.index(ctx.getFilesDir()); }
    @JavascriptInterface public String autoBackupGet(String id) { if (!MainActivity.trusted) return ""; return AutoBackup.read(ctx.getFilesDir(), id); }

    /** backup export: writes the JSON file into Downloads */
    @JavascriptInterface public boolean saveFile(String name, String content) { if (!MainActivity.trusted) return false;
        try {
            String safe = name.replaceAll("[^A-Za-z0-9._ -]", "_");
            byte[] data = content.getBytes(StandardCharsets.UTF_8);
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.Downloads.DISPLAY_NAME, safe);
                v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri u = ctx.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (u == null) return false;
                try (OutputStream o = ctx.getContentResolver().openOutputStream(u)) { if (o == null) return false; o.write(data); }
                return true;
            } else {
                File d = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!d.exists() && !d.mkdirs()) d = ctx.getExternalFilesDir(null);
                try (FileOutputStream o = new FileOutputStream(new File(d, safe))) { o.write(data); }
                return true;
            }
        } catch (Exception e) { return false; }
    }
}
