package ro.cluj1313.notis;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
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

    static final String SNOOZE = "ro.cluj1313.notis.SNOOZE";
    static final String STOPA = "ro.cluj1313.notis.ALARM_STOP";

    @Override public void onReceive(Context c, Intent i) {
        String nid = i.getStringExtra("n");
        if (nid == null) return;
        /* 2.2.3: "Amână 10 min" from the notification — a native one-shot alarm, independent of the web snapshot (notes and medicines) */
        /* 2.6.6: "Stop" from the notification — silence and dismiss only; the alarm data / next occurrence stay untouched */
        if (STOPA.equals(i.getAction())) {
            AlarmSound.stop();
            try { c.getSystemService(NotificationManager.class).cancel(nid.hashCode()); } catch (Exception ignored) {}
            return;
        }
        if (SNOOZE.equals(i.getAction())) {
            String txt = i.getStringExtra("t"); if (txt == null) txt = "";
            AlarmSound.stop();
            try { c.getSystemService(NotificationManager.class).cancel(nid.hashCode()); } catch (Exception ignored) {}
            Scheduler.snooze(c, nid, txt, System.currentTimeMillis() + 600000L);
            return;
        }
        if (i.getBooleanExtra("snz", false)) { Store.put(c, "snz_" + nid, null); show(c, nid, String.valueOf(i.getStringExtra("t"))); return; }
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

    static PendingIntent snoozePi(Context c, String nid, String text) {
        Intent s = new Intent(c, AlarmReceiver.class).setAction(SNOOZE).setData(Uri.parse("notis://snooze/" + Uri.encode(nid))).putExtra("n", nid).putExtra("t", text);
        return PendingIntent.getBroadcast(c, 0, s, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static PendingIntent stopPi(Context c, String nid) {
        Intent s = new Intent(c, AlarmReceiver.class).setAction(STOPA).setData(Uri.parse("notis://stop/" + Uri.encode(nid))).putExtra("n", nid);
        return PendingIntent.getBroadcast(c, 0, s, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
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

    static final String CH2 = "notis_alarms_custom";
    /** 2.4.9: silent channel for alarms whose sound Notis plays itself (RingService); vibration stays on */
    static void channel2(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        NotificationChannel old = nm.getNotificationChannel(CH2); String nm2 = Tr.s(c, R.string.ch_alarms);
        if (old != null) { if (!nm2.contentEquals(old.getName())) { old.setName(nm2); nm.createNotificationChannel(old); } return; }
        NotificationChannel ch = new NotificationChannel(CH2, nm2, NotificationManager.IMPORTANCE_HIGH);
        ch.enableVibration(true); ch.setVibrationPattern(new long[]{0, 600, 400, 600, 400, 600});
        ch.setSound(null, null);
        nm.createNotificationChannel(ch);
    }

    static Notification build(Context c, String ch, String nid, String text) {
        String first = text.split("\n")[0];
        Notification.Builder b = new Notification.Builder(c, ch)
            .setSmallIcon(R.drawable.ic_stat_alarm)
            .setContentTitle("⏰ " + (first.length() > 0 ? first : "Notis"))
            .setContentText(text)
            .setStyle(new Notification.BigTextStyle().bigText(text))
            .setCategory(Notification.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(NotisWidget.openApp(c, 800000 + Math.abs(nid.hashCode() % 90000), "?open=" + Uri.encode(nid)))
            .setFullScreenIntent(NotisWidget.openApp(c, 700000 + Math.abs(nid.hashCode() % 90000), "?open=" + Uri.encode(nid)), true)
            .setPriority(Notification.PRIORITY_MAX)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .addAction(new Notification.Action.Builder(null, Tr.s(c, R.string.snooze10), snoozePi(c, nid, text)).build())
            .addAction(new Notification.Action.Builder(null, Tr.s(c, R.string.alarm_stop), stopPi(c, nid)).build());
        if (CH2.equals(ch)) b.setDeleteIntent(PendingIntent.getService(c, 0, new Intent(c, RingService.class).setAction(RingService.STOP), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        Notification n = b.build();
        if (CH.equals(ch)) n.flags |= Notification.FLAG_INSISTENT; /* sound repeats until opened / dismissed, like an alarm clock */
        return n;
    }

    static void show(Context c, String nid, String text) {
        /* 2.4.9: a chosen sound is played by Notis itself; if it cannot be opened (file deleted / permission lost) or the service cannot start, the default ringing channel is used, so an alarm is never silent */
        if (!AlarmSound.isDefault(c) && AlarmSound.readable(c, AlarmSound.uriFor(c, AlarmSound.key(c)))) {
            try { channel2(c); if (RingService.start(c, nid.hashCode(), build(c, CH2, nid, text))) return; } catch (Exception ignored) {}
        }
        channel(c);
        try { c.getSystemService(NotificationManager.class).notify(nid.hashCode(), build(c, CH, nid, text)); } catch (SecurityException ignored) {}
    }

    /** RingService could not go foreground: post the same alarm on the loud default channel instead */
    static void loudFallback(Context c, int id, Notification n) {
        channel(c);
        try {
            Notification m = new Notification.Builder(c, CH).setSmallIcon(R.drawable.ic_stat_alarm).setContentTitle(n.extras.getCharSequence(Notification.EXTRA_TITLE)).setContentText(n.extras.getCharSequence(Notification.EXTRA_TEXT))
                .setStyle(new Notification.BigTextStyle().bigText(n.extras.getCharSequence(Notification.EXTRA_TEXT))).setCategory(Notification.CATEGORY_ALARM).setAutoCancel(true)
                .setContentIntent(n.contentIntent).setFullScreenIntent(n.fullScreenIntent, true).setPriority(Notification.PRIORITY_MAX).setVisibility(Notification.VISIBILITY_PUBLIC).setActions(n.actions == null ? new Notification.Action[0] : n.actions).build();
            m.flags |= Notification.FLAG_INSISTENT;
            c.getSystemService(NotificationManager.class).notify(id, m);
        } catch (Exception ignored) {}
    }
}
