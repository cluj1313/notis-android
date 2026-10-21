package ro.cluj1313.notis;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import org.json.JSONObject;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/** Once an hour (launch + resume): is there a newer GitHub release of cluj1313/notis-android? → dialog → opens the release page in the browser (no in-app download/install). */
final class Updater {
    static final String API = "https://api.github.com/repos/cluj1313/notis-android/releases/latest";
    private Updater() {}

    static int[] ver(String s) {
        String[] p = s.replaceAll("[^0-9.]", "").split("\\.");
        int[] r = new int[3];
        for (int i = 0; i < 3 && i < p.length; i++) try { r[i] = Integer.parseInt(p[i]); } catch (Exception ignored) {}
        return r;
    }
    static boolean newer(String a, String b) {
        int[] x = ver(a), y = ver(b);
        for (int i = 0; i < 3; i++) if (x[i] != y[i]) return x[i] > y[i];
        return false;
    }
    static String mine(Activity a) {
        try { return a.getPackageManager().getPackageInfo(a.getPackageName(), 0).versionName; } catch (Exception e) { return "0"; }
    }

    private static boolean asking;

    /** On launch and on every resume, throttled to once per hour. */
    static void check(final Activity a) {
        if (BuildConfig.PLAY) return; /* Google Play build: updates come only from Play (no self-update) */
        long last = Store.sp(a).getLong("updChk", 0), now = System.currentTimeMillis();
        if (asking || (now - last < 3600L * 1000 && now >= last)) return;
        Store.sp(a).edit().putLong("updChk", now).apply();
        new Thread(() -> {
            try {
                HttpURLConnection h = (HttpURLConnection) new URL(API).openConnection();
                h.setConnectTimeout(8000); h.setReadTimeout(8000); h.setRequestProperty("Accept", "application/vnd.github+json");
                if (h.getResponseCode() != 200) return;
                String body = new String(readAll(h.getInputStream()), "UTF-8");
                JSONObject r = new JSONObject(body);
                final String tag = r.optString("tag_name");
                if (!newer(tag, mine(a))) return;
                String hu = r.optString("html_url", "");
                final String u = hu.startsWith("https://github.com/cluj1313/notis-android/") ? hu : "https://github.com/cluj1313/notis-android/releases/latest";
                new Handler(Looper.getMainLooper()).post(() -> { if (!a.isFinishing() && !asking) ask(a, tag, u); });
            } catch (Exception ignored) {}
        }).start();
    }

    static void ask(final Activity a, String tag, final String page) {
        asking = true;
        new AlertDialog.Builder(a)
            .setOnDismissListener(d -> asking = false)
            .setTitle(Tr.s(a, R.string.upd_title))
            .setMessage(Tr.s(a, R.string.upd_msg, tag.replaceFirst("^v", ""), mine(a)))
            .setPositiveButton(Tr.s(a, R.string.upd_open), (d, w) -> {
                /* v57: full automatic backup BEFORE the download page opens (photos included), then open the link */
                Runnable open = () -> { try { a.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(page))); } catch (Exception ignored) {} };
                if (a instanceof MainActivity) ((MainActivity) a).backupThen("before-update", open, 15000); else open.run();
            })
            .setNegativeButton(Tr.s(a, R.string.upd_later), null)
            .show();
    }

    static byte[] readAll(InputStream in) throws java.io.IOException {
        java.io.ByteArrayOutputStream o = new java.io.ByteArrayOutputStream(); byte[] b = new byte[8192]; int n;
        while ((n = in.read(b)) > 0) o.write(b, 0, n); in.close(); return o.toByteArray();
    }
}
