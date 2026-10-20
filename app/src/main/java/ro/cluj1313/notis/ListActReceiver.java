package ro.cluj1313.notis;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** list widget row taps (check / ✕ / ANULEAZĂ); not exported, only our own PendingIntents reach it */
public class ListActReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) { NotisWidget.handleAct(c, i); }
}
