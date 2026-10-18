package ro.cluj1313.notis;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/** Once a day: is there a newer GitHub release of cluj1313/notis-android? → dialog → download → system installer. */
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

    static void checkDaily(final Activity a) {
        long last = Store.sp(a).getLong("updChk", 0), now = System.currentTimeMillis();
        if (now - last < 20L * 3600 * 1000) return;
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
                String url = null; JSONArray as = r.optJSONArray("assets");
                if (as != null) for (int i = 0; i < as.length(); i++) { JSONObject o = as.optJSONObject(i); if (o != null && o.optString("name").endsWith(".apk")) { url = o.optString("browser_download_url"); break; } }
                if (url == null) return;
                final String u = url;
                new Handler(Looper.getMainLooper()).post(() -> { if (!a.isFinishing()) ask(a, tag, u); });
            } catch (Exception ignored) {}
        }).start();
    }

    static void ask(final Activity a, String tag, final String url) {
        new AlertDialog.Builder(a)
            .setTitle("Versiune nouă disponibilă")
            .setMessage("Notis " + tag.replaceFirst("^v", "") + " (ai " + mine(a) + "). Notițele rămân.")
            .setPositiveButton("Instalează", (d, w) -> download(a, url))
            .setNegativeButton("Mai târziu", null)
            .show();
    }

    static void download(final Activity a, final String url) {
        if (Build.VERSION.SDK_INT >= 26 && !a.getPackageManager().canRequestPackageInstalls()) {
            new AlertDialog.Builder(a).setTitle("Permite instalarea")
                .setMessage("Activează „Permite din această sursă” pentru Notis, apoi revino și apasă din nou Instalează.")
                .setPositiveButton("Deschide setările", (d, w) -> { try { a.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + a.getPackageName()))); } catch (Exception ignored) {} Store.sp(a).edit().putLong("updChk", 0).apply(); })
                .setNegativeButton("Renunță", null).show();
            return;
        }
        final AlertDialog prog = new AlertDialog.Builder(a).setTitle("Se descarcă…").setMessage("0%").setCancelable(false).show();
        new Thread(() -> {
            File f = new File(a.getCacheDir(), "update.apk");
            boolean ok = false;
            try {
                HttpURLConnection h = (HttpURLConnection) new URL(url).openConnection();
                h.setInstanceFollowRedirects(true); h.setConnectTimeout(10000); h.setReadTimeout(20000);
                int code = h.getResponseCode();
                for (int k = 0; k < 5 && code / 100 == 3; k++) { String loc = h.getHeaderField("Location"); h.disconnect(); h = (HttpURLConnection) new URL(loc).openConnection(); code = h.getResponseCode(); }
                long len = h.getContentLengthLong(), got = 0; int last = -1;
                try (InputStream in = h.getInputStream(); OutputStream out = new FileOutputStream(f)) {
                    byte[] buf = new byte[32768]; int n;
                    while ((n = in.read(buf)) > 0) { out.write(buf, 0, n); got += n;
                        final int pc = len > 0 ? (int) (got * 100 / len) : -1;
                        if (pc != last) { last = pc; a.runOnUiThread(() -> prog.setMessage(pc >= 0 ? pc + "%" : "…")); } }
                }
                ok = len <= 0 || got == len;
            } catch (Exception ignored) {}
            final boolean fin = ok;
            a.runOnUiThread(() -> {
                prog.dismiss();
                if (!fin) { new AlertDialog.Builder(a).setMessage("Descărcarea a eșuat. Încearcă mai târziu.").setPositiveButton("OK", null).show(); Store.sp(a).edit().putLong("updChk", 0).apply(); return; }
                Intent i = new Intent(Intent.ACTION_VIEW).setDataAndType(ApkProvider.uri(a), "application/vnd.android.package-archive")
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                try { a.startActivity(i); } catch (Exception e) { new AlertDialog.Builder(a).setMessage("Nu pot deschide instalatorul.").setPositiveButton("OK", null).show(); }
            });
        }).start();
    }

    static byte[] readAll(InputStream in) throws java.io.IOException {
        java.io.ByteArrayOutputStream o = new java.io.ByteArrayOutputStream(); byte[] b = new byte[8192]; int n;
        while ((n = in.read(b)) > 0) o.write(b, 0, n); in.close(); return o.toByteArray();
    }
}
