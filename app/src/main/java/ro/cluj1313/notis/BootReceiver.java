package ro.cluj1313.notis;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** re-arm note alarms after reboot, app update, or time/zone change */
public class BootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) { Scheduler.rescheduleAll(c); NotisWidget.refreshAll(c); }
}
