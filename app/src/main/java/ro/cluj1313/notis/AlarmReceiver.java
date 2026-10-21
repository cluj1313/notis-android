package ro.cluj1313.notis;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import org.json.JSONArray;
import org.json.JSONObject;

/** A note alarm fired: notification with the note text (tap opens the note), then roll/clear it and reschedule. */
public class AlarmReceiver extends BroadcastReceiver {
    static final String CH = "notis_alarms";

    @Override public void onReceive(Context c, Intent i) {
        String nid = i.getStringExtra("n");
        if (nid == null) return;
        JSONObject note = null;
        JSONArray ns = Store.snapshot(c).optJSONArray("notes");
        if (ns != null) for (int k = 0; k < ns.length(); k++) if (nid.equals(ns.optJSONObject(k).optString("id"))) note = ns.optJSONObject(k);
        if (note == null || note.optJSONObject("alarm") == null) { Scheduler.rescheduleAll(c); return; }
        long now = System.currentTimeMillis();
        /* app on screen: the web app rings in-page itself */
        if (!MainActivity.foreground) show(c, nid, note.optString("text").trim());
        Store.alarmFired(c, nid, now);
        Scheduler.rescheduleAll(c);
        NotisWidget.refreshAll(c);
    }

    static void channel(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        NotificationChannel old = nm.getNotificationChannel(CH); String nm2 = Tr.s(c, R.string.ch_alarms);
        if (old != null) { if (!nm2.contentEquals(old.getName())) { old.setName(nm2); nm.createNotificationChannel(old); } return; }
        NotificationChannel ch = new NotificationChannel(CH, nm2, NotificationManager.IMPORTANCE_HIGH);
        ch.enableVibration(true);
        Uri snd = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        ch.setSound(snd, new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
        nm.createNotificationChannel(ch);
    }

    static void show(Context c, String nid, String text) {
        channel(c);
        String first = text.split("\n")[0];
        Notification n = new Notification.Builder(c, CH)
            .setSmallIcon(R.drawable.ic_stat_alarm)
            .setContentTitle("⏰ " + (first.length() > 0 ? first : "Notis"))
            .setContentText(text)
            .setStyle(new Notification.BigTextStyle().bigText(text))
            .setCategory(Notification.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(NotisWidget.openApp(c, 800000 + Math.abs(nid.hashCode() % 90000), "?open=" + Uri.encode(nid)))
            .build();
        try { c.getSystemService(NotificationManager.class).notify(nid.hashCode(), n); } catch (SecurityException ignored) {}
    }
}
