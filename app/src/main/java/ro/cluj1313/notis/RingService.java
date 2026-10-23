package ro.cluj1313.notis;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

/** 2.4.9: keeps the custom alarm sound ringing (looped, ALARM stream) while the alarm notification is up. Stops on open / dismiss / snooze / 3 min. */
public class RingService extends Service {
    static final String STOP = "ro.cluj1313.notis.RING_STOP";
    static volatile Notification pending; static volatile int pendingId;
    private static volatile RingService me;

    static boolean start(Context c, int id, Notification n) {
        pending = n; pendingId = id;
        try { Intent i = new Intent(c, RingService.class);
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i); return true;
        } catch (Exception e) { pending = null; return false; }
    }
    static boolean active() { return me != null; }
    static void quit() { RingService s = me; me = null; if (s != null) { try { s.stopForeground(STOP_FOREGROUND_DETACH); } catch (Exception ignored) {} s.stopSelf(); } }

    @Override public int onStartCommand(Intent i, int f, int sid) {
        if (i != null && STOP.equals(i.getAction())) { AlarmSound.stop(); stopSelf(); return START_NOT_STICKY; }
        Notification n = pending; int id = pendingId; pending = null;
        if (n == null) { stopSelf(); return START_NOT_STICKY; }
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(id, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK); else startForeground(id, n);
        } catch (Exception e) { AlarmReceiver.loudFallback(this, id, n); stopSelf(); return START_NOT_STICKY; }
        AlarmSound.play(this, null, true, 180000);
        me = this;
        return START_NOT_STICKY;
    }
    @Override public void onDestroy() { if (me == this) me = null; super.onDestroy(); }
    @Override public IBinder onBind(Intent i) { return null; }
}
