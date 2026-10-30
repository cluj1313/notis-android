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

    /* v178: compare like with like. The release tag is the web build (v177) and versionName is 2.17.x, so comparing tag vs
       versionName always looked "newer" (177 > 2). Now: remote versionCode (apk/version.json) vs installed versionCode;
       fallback: versionName from the release title ("Notis 2.17.4") vs installed versionName. Tag numbers are never compared. */
    static final String VJ = "https://cluj1313.github.io/notis/apk/version.json";
    static long code(Activity a) {
        try { android.content.pm.PackageInfo p = a.getPackageManager().getPackageInfo(a.getPackageName(), 0);
              return android.os.Build.VERSION.SDK_INT >= 28 ? p.getLongVersionCode() : p.versionCode; } catch (Exception e) { return 0; }
    }
    static String nameIn(String s) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+\\.\\d+\\.\\d+)").matcher(s == null ? "" : s);
        return m.find() ? m.group(1) : "";
    }
    /** true = show the dialog. key = remote version identity; dismissed (Mai târziu) for the same key → quiet for 24 h. */
    static boolean should(long rc, String rn, long myc, String myn, String skipKey, long skipT, long now) {
        boolean nw;
        if (rc > 0 && myc > 0) nw = rc > myc;
        else if (!rn.isEmpty()) nw = newer(rn, myn);
        else return false;
        if (!nw) return false;
        String key = rc > 0 ? "c" + rc : "n" + rn;
        return !(key.equals(skipKey) && now - skipT < 24L * 3600 * 1000 && now >= skipT);
    }
    static String get(String url) throws Exception {
        HttpURLConnection h = (HttpURLConnection) new URL(url).openConnection();
        h.setConnectTimeout(8000); h.setReadTimeout(8000); h.setRequestProperty("Accept", "application/vnd.github+json"); h.setUseCaches(false);
        if (h.getResponseCode() != 200) return null;
        return new String(readAll(h.getInputStream()), "UTF-8");
    }

    /** On launch and on every resume, throttled to once per hour. */
    static void check(final Activity a) {
        if (BuildConfig.PLAY) return; /* Google Play build: updates come only from Play (no self-update) */
        long last = Store.sp(a).getLong("updChk", 0), now = System.currentTimeMillis();
        if (asking || (now - last < 3600L * 1000 && now >= last)) return;
        Store.sp(a).edit().putLong("updChk", now).apply();
        new Thread(() -> {
            try {
                long rc = 0; String rn = "", u = "https://github.com/cluj1313/notis-android/releases/latest";
                try { String vj = get(VJ + "?t=" + now); if (vj != null) { JSONObject v = new JSONObject(vj); rc = v.optLong("versionCode", 0); rn = nameIn(v.optString("versionName")); String pg = v.optString("page", ""); if (pg.startsWith("https://github.com/cluj1313/notis-android/")) u = pg; } } catch (Exception ignored) {}
                if (rc <= 0 && rn.isEmpty()) {
                    String body = get(API); if (body == null) return;
                    JSONObject r = new JSONObject(body);
                    rn = nameIn(r.optString("name"));
                    String hu = r.optString("html_url", "");
                    if (hu.startsWith("https://github.com/cluj1313/notis-android/")) u = hu;
                }
                final String fn = rn.isEmpty() ? "?" : rn, fu = u, key = rc > 0 ? "c" + rc : "n" + rn;
                if (!should(rc, rn, code(a), mine(a), Store.sp(a).getString("updSkip", ""), Store.sp(a).getLong("updSkipT", 0), System.currentTimeMillis())) return;
                new Handler(Looper.getMainLooper()).post(() -> { if (!a.isFinishing() && !asking) ask(a, fn, fu, key); });
            } catch (Exception ignored) {}
        }).start();
    }

    static void ask(final Activity a, String tag, final String page, final String key) {
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
            .setNegativeButton(Tr.s(a, R.string.upd_later), (d, w) -> Store.sp(a).edit().putString("updSkip", key).putLong("updSkipT", System.currentTimeMillis()).apply())
            .show();
    }

    static byte[] readAll(InputStream in) throws java.io.IOException {
        java.io.ByteArrayOutputStream o = new java.io.ByteArrayOutputStream(); byte[] b = new byte[8192]; int n;
        while ((n = in.read(b)) > 0) o.write(b, 0, n); in.close(); return o.toByteArray();
    }
}
