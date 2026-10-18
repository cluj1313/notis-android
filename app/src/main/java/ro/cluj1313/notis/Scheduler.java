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
            try {
                if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
                else am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, NotisWidget.openApp(c, 900000 + Math.abs(id.hashCode() % 90000), "?open=" + Uri.encode(id))), p);
            } catch (SecurityException e) { am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p); }
        }
        String prev = Store.get(c, "sched");
        if (prev != null) for (String id : prev.split("\n")) if (id.length() > 0 && !now.contains(id)) {
            PendingIntent p = pi(c, id, 0, PendingIntent.FLAG_NO_CREATE);
            if (p != null) { am.cancel(p); p.cancel(); }
        }
        Store.put(c, "sched", String.join("\n", now));
    }
}
