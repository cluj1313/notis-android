package ro.cluj1313.notis;

import android.content.Intent;
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

    @JavascriptInterface public void shareText(String text, String title) { if (!MainActivity.trusted || text == null) return;
        final android.app.Activity a = MainActivity.cur; final Context c = a != null ? a : ctx;
        Intent s = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text);
        if (title != null && title.length() > 0) s.putExtra(Intent.EXTRA_SUBJECT, title);
        Intent go = null;
        for (String pk : new String[]{"com.whatsapp", "com.whatsapp.w4b"}) {
            Intent w = new Intent(s).setPackage(pk);
            if (w.resolveActivity(ctx.getPackageManager()) != null) { go = w; break; }
        }
        if (go == null) go = Intent.createChooser(s, title);
        if (a == null) go.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        final Intent fin = go;
        Runnable r = () -> { try { c.startActivity(fin); } catch (Exception e) { try { Intent ch = Intent.createChooser(s, title); if (a == null) ch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); c.startActivity(ch); } catch (Exception ignored) {} } };
        if (a != null) a.runOnUiThread(r); else r.run();
    }
    /* 2.3.3: launcher icon choice via activity-alias (one enabled at a time) */
    /* 2.4.9: Setări › Sunet alarmă */
    @JavascriptInterface public String listAlarmSounds() { if (!MainActivity.trusted) return "{}"; return AlarmSound.list(ctx); }
    @JavascriptInterface public void setAlarmSound(String k, String name) { if (!MainActivity.trusted || k == null) return; if (!(k.equals("default") || k.startsWith("b:") || k.startsWith("u:"))) return; AlarmSound.set(ctx, k, name == null ? "" : name); }
    @JavascriptInterface public void previewAlarmSound(String k) { if (!MainActivity.trusted) return; if (k == null || k.isEmpty()) AlarmSound.stop(); else AlarmSound.play(ctx, k, false, 8000); }
    @JavascriptInterface public void ringStart() { if (!MainActivity.trusted) return; AlarmSound.play(ctx, null, true, 180000); }
    @JavascriptInterface public void ringStop() { if (!MainActivity.trusted) return; AlarmSound.stop(); }
    @JavascriptInterface public boolean pickPhoneAlarmSound() { MainActivity m = MainActivity.cur; if (!MainActivity.trusted || m == null) return false; m.runOnUiThread(m::pickAlarmSound); return true; }
    @JavascriptInterface public boolean pickAlarmFile() { MainActivity m = MainActivity.cur; if (!MainActivity.trusted || m == null) return false; m.runOnUiThread(m::pickAlarmFile); return true; }
    @JavascriptInterface public String iconGet() { if (!MainActivity.trusted) return ""; return IconSwitch.get(ctx); }
    @JavascriptInterface public boolean iconSet(String k) { if (!MainActivity.trusted) return false; return IconSwitch.set(ctx, k); }
    @JavascriptInterface public boolean isNative() { if (!MainActivity.trusted) return false; return true; }
    @JavascriptInterface public String version() { if (!MainActivity.trusted) return ""; try { return ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0).versionName; } catch (Exception e) { return ""; } }

    /* 2.5.0: display settings mirrored in native prefs (committed to disk at once) so app updates can't roll them back */
    private static final java.util.Set<String> UIK = new java.util.HashSet<>(java.util.Arrays.asList("ns_nrowpad", "ns_sidemg", "ns_bgk", "ns_cardop", "ns_cardcol", "ns_bg", "ns_bgcol", "ns_theme", "ns_tabst", "ns_newssize", "ns_tabcol"));
    private android.content.SharedPreferences ui() { return ctx.getApplicationContext().getSharedPreferences("notis_ui", Context.MODE_PRIVATE); }
    @JavascriptInterface public void prefSet(String k, String v) { if (!MainActivity.trusted || k == null || !UIK.contains(k)) return; if (v != null && v.length() > 20000) return;
        android.content.SharedPreferences.Editor e = ui().edit(); if (v == null) e.remove(k); else e.putString(k, v); e.commit(); }
    @JavascriptInterface public String prefGetAll() { if (!MainActivity.trusted) return "{}";
        org.json.JSONObject o = new org.json.JSONObject(); for (java.util.Map.Entry<String, ?> en : ui().getAll().entrySet()) if (UIK.contains(en.getKey()) && en.getValue() instanceof String) try { o.put(en.getKey(), en.getValue()); } catch (Exception ignored) {}
        return o.toString(); }
    @JavascriptInterface public void saveSnapshot(String json) { if (!MainActivity.trusted) return;
        Store.saveSnapshot(ctx, json);
        NotisWidget.refreshAll(ctx);
        Scheduler.rescheduleAll(ctx);
    }
    /** 2.2.3: alarm permissions. ask=true: request notifications / open the exact-alarm or notification settings when missing.
     *  returns "ok", "notif" (notifications blocked) or "exact" (exact alarms denied) */
    @JavascriptInterface public String alarmPerms(boolean ask) { if (!MainActivity.trusted) return "";
        String st = MainActivity.alarmState(ctx);
        if (ask && !st.equals("ok") && MainActivity.cur != null) MainActivity.cur.fixAlarmPerms(st);
        return st;
    }
    @JavascriptInterface public boolean isXiaomi() { String m = (android.os.Build.MANUFACTURER + " " + android.os.Build.BRAND).toLowerCase(); return m.contains("xiaomi") || m.contains("redmi") || m.contains("poco"); }
    /** Xiaomi/HyperOS "Autostart" screen (alarms of apps without it may be dropped when the app is closed); falls back to app details */
    @JavascriptInterface public boolean openAutostart() { if (!MainActivity.trusted) return false;
        android.content.Intent i = new android.content.Intent().setClassName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity").addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
        try { ctx.startActivity(i); return true; } catch (Exception e) {
            try { ctx.startActivity(new android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS, android.net.Uri.parse("package:" + ctx.getPackageName())).addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)); return true; } catch (Exception e2) { return false; } }
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
