package ro.cluj1313.notis;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** medicine-widget checkbox taps; not exported, only our own PendingIntents reach it */
public class SecActReceiver extends BroadcastReceiver {
    static final String TOGGLE = "ro.cluj1313.notis.SEC_TOGGLE";

    @Override public void onReceive(Context c, Intent i) {
        if (i == null || !TOGGLE.equals(i.getAction())) return;
        String mid = i.getStringExtra("m");
        int slot = i.getIntExtra("i", -1);
        boolean on = i.getBooleanExtra("d", false);
        String day = i.getStringExtra("day");
        if (mid == null || mid.length() == 0 || slot < 0) return;
        Store.medToggle(c, mid, slot, !on, day);
        NotisWidget.refreshAll(c);
    }
}
