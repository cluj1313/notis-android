package ro.cluj1313.notis;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.HashSet;
import java.util.Set;

/** Exact alarms for every note that has an alarm (from snapshot + pending ops). Called after any change and on boot. */
final class Scheduler {
    private Scheduler() {}

    static PendingIntent pi(Context c, String nid, long at, int flags) {
        Intent i = new Intent(c, AlarmReceiver.class).setData(Uri.parse("notis://alarm/" + Uri.encode(nid))).putExtra("n", nid).putExtra("at", at);
        return PendingIntent.getBroadcast(c, 0, i, flags | PendingIntent.FLAG_IMMUTABLE);
    }

    static void exact(Context c, AlarmManager am, long at, PendingIntent p, String id) {
        try {
            if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
            else am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, NotisWidget.openApp(c, 900000 + Math.abs(id.hashCode() % 90000), "?open=" + Uri.encode(id))), p);
        } catch (SecurityException e) { am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p); }
    }
    static PendingIntent snzPi(Context c, String nid, String text, int flags) {
        Intent i = new Intent(c, AlarmReceiver.class).setData(Uri.parse("notis://snz/" + Uri.encode(nid))).putExtra("n", nid).putExtra("t", text).putExtra("snz", true);
        return PendingIntent.getBroadcast(c, 0, i, flags | PendingIntent.FLAG_IMMUTABLE);
    }
    /** one-shot native snooze (stored so it survives reboot) */
    static synchronized void snooze(Context c, String nid, String text, long at) {
        Store.put(c, "snz_" + nid, at + "\n" + text);
        String l = Store.get(c, "snzids"); java.util.LinkedHashSet<String> ids = new java.util.LinkedHashSet<>();
        if (l != null) for (String x : l.split("\n")) if (x.length() > 0) ids.add(x);
        ids.add(nid); Store.put(c, "snzids", String.join("\n", ids));
        exact(c, (AlarmManager) c.getSystemService(Context.ALARM_SERVICE), at, snzPi(c, nid, text, PendingIntent.FLAG_UPDATE_CURRENT), nid);
    }
    private static void reSnooze(Context c, AlarmManager am, long t) {
        String l = Store.get(c, "snzids"); if (l == null) return;
        StringBuilder keep = new StringBuilder();
        for (String id : l.split("\n")) { if (id.length() == 0) continue; String v = Store.get(c, "snz_" + id); if (v == null) continue;
            int k = v.indexOf('\n'); long at; try { at = Long.parseLong(k < 0 ? v : v.substring(0, k)); } catch (Exception e) { continue; }
            String txt = k < 0 ? "" : v.substring(k + 1);
            exact(c, am, Math.max(at, t + 3000), snzPi(c, id, txt, PendingIntent.FLAG_UPDATE_CURRENT), id);
            keep.append(id).append('\n'); }
        Store.put(c, "snzids", keep.toString());
    }

    static synchronized void rescheduleAll(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        JSONArray ns = Store.snapshot(c).optJSONArray("notes");
        Set<String> now = new HashSet<>();
        long t = System.currentTimeMillis();
        if (ns != null) for (int i = 0; i < ns.length(); i++) {
            JSONObject n = ns.optJSONObject(i); if (n == null) continue;
            JSONObject a = n.optJSONObject("alarm"); if (a == null) continue;
            long at = a.optLong("at"), snz = a.optLong("snz", 0);
            if (snz > 0 && snz < at) at = snz;
            if (at <= 0) continue;
            if (at < t) at = t + 3000; /* missed (phone off / app killed): ring right away, the receiver rolls it */
            String id = n.optString("id");
            now.add(id);
            PendingIntent p = pi(c, id, a.optLong("at"), PendingIntent.FLAG_UPDATE_CURRENT);
            exact(c, am, at, p, id);
        }
        String prev = Store.get(c, "sched");
        if (prev != null) for (String id : prev.split("\n")) if (id.length() > 0 && !now.contains(id)) {
            PendingIntent p = pi(c, id, 0, PendingIntent.FLAG_NO_CREATE);
            if (p != null) { am.cancel(p); p.cancel(); }
        }
        Store.put(c, "sched", String.join("\n", now));
        reSnooze(c, am, t);
        /* day-label tick: at local midnight re-render the widget times ("mâine 09:00" → "09:00") */
        PendingIntent tick = PendingIntent.getBroadcast(c, 1, new Intent(c, BootReceiver.class).setAction("ro.cluj1313.notis.TICK"), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        if (now.isEmpty()) am.cancel(tick);
        else {
            java.util.Calendar m = java.util.Calendar.getInstance();
            m.add(java.util.Calendar.DAY_OF_YEAR, 1);
            m.set(java.util.Calendar.HOUR_OF_DAY, 0); m.set(java.util.Calendar.MINUTE, 0); m.set(java.util.Calendar.SECOND, 30); m.set(java.util.Calendar.MILLISECOND, 0);
            am.set(AlarmManager.RTC, m.getTimeInMillis(), tick);
        }
    }
}
