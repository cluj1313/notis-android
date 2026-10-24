package ro.cluj1313.notis;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONObject;

/** 2.5.1: opt-in "messages from the creator". Polls news.json ~every 6h (inexact alarm), notifies unseen ids. Off by default. */
public class NewsReceiver extends BroadcastReceiver {
    static final String URLS = "https://cluj1313.github.io/notis/creator.json", CH = "news";
    static SharedPreferences p(Context c) { return c.getSharedPreferences("news", Context.MODE_PRIVATE); }
    static PendingIntent pi(Context c) { return PendingIntent.getBroadcast(c, 77, new Intent(c, NewsReceiver.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE); }

    static void set(Context c, boolean on, String lang) {
        p(c).edit().putBoolean("on", on).putString("lang", lang == null ? "ro" : lang).commit();
        arm(c);
        if (on) poll(c, null);
    }
    static void arm(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE); if (am == null) return;
        am.cancel(pi(c));
        if (p(c).getBoolean("on", false)) am.setInexactRepeating(AlarmManager.ELAPSED_REALTIME, android.os.SystemClock.elapsedRealtime() + AlarmManager.INTERVAL_HOUR, 6 * AlarmManager.INTERVAL_HOUR, pi(c));
    }
    /** web marks ids seen in-app so they are not notified again */
    static void seen(Context c, String id) { if (id == null) return; Set<String> s = new HashSet<>(p(c).getStringSet("seen", new HashSet<>())); s.add(id); p(c).edit().putStringSet("seen", s).apply(); }

    @Override public void onReceive(Context c, Intent i) { final PendingResult r = goAsync(); poll(c.getApplicationContext(), r); }

    static void poll(final Context c, final PendingResult r) {
        new Thread(() -> {
            try {
                if (!p(c).getBoolean("on", false)) return;
                HttpURLConnection h = (HttpURLConnection) new URL(URLS + "?t=" + System.currentTimeMillis()).openConnection();
                h.setConnectTimeout(15000); h.setReadTimeout(15000); h.setUseCaches(false);
                String js; try (InputStream in = h.getInputStream()) { js = new String(Updater.readAll(in), StandardCharsets.UTF_8); }
                JSONArray a = new JSONObject(js).optJSONArray("messages"); if (a == null) return;
                Set<String> seen = new HashSet<>(p(c).getStringSet("seen", new HashSet<>()));
                boolean first = !p(c).getBoolean("primed", false); String lang = p(c).getString("lang", "ro");
                for (int k = 0; k < a.length(); k++) {
                    JSONObject m = a.optJSONObject(k); if (m == null) continue; String id = m.optString("id", ""); if (id.isEmpty() || seen.contains(id)) continue;
                    seen.add(id);
                    String t = m.optString("title", ""), b = m.optString("body", "");
                    JSONObject L = m.optJSONObject("lang"); JSONObject lo = L == null ? null : L.optJSONObject(lang);
                    if (lo != null) { t = lo.optString("title", t); b = lo.optString("body", b); }
                    if (!first) notify(c, id, t, b);
                }
                p(c).edit().putStringSet("seen", seen).putBoolean("primed", true).apply();
            } catch (Exception ignored) {
            } finally { if (r != null) r.finish(); }
        }).start();
    }
    static void notify(Context c, String id, String t, String b) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE); if (nm == null) return;
        if (nm.getNotificationChannel(CH) == null) nm.createNotificationChannel(new NotificationChannel(CH, "Notis", NotificationManager.IMPORTANCE_DEFAULT));
        Intent o = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, id.hashCode(), o, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(c, CH).setSmallIcon(R.drawable.ic_stat_alarm).setContentTitle(t).setContentText(b)
            .setStyle(new Notification.BigTextStyle().bigText(b)).setAutoCancel(true).setContentIntent(pi).build();
        try { nm.notify("news", id.hashCode(), n); } catch (SecurityException ignored) {}
    }
}
