package ro.cluj1313.notis;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.Bundle;

/** Invisible trampoline for "Notis · Notițe" rows: expand/collapse, or open the alarm dialog. */
public class RowActivity extends Activity {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Intent i = getIntent();
        int wid = i.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0);
        String nid = i.getStringExtra("n");
        if (nid != null) {
            String act = i.getStringExtra("act");
            if ("alarm".equals(act)) {
                startActivity(new Intent(this, AlarmActivity.class).putExtra("n", nid));
            } else if ("del".equals(act)) {
                if (Store.noteArmed(this, wid, nid)) {
                    Store.put(this, "narm_" + wid, null);
                    Store.deleteNote(this, nid);
                    Scheduler.rescheduleAll(this);
                    NotisWidget.refreshAll(this);
                } else {
                    Store.put(this, "narm_" + wid, nid + "|" + System.currentTimeMillis());
                    AppWidgetManager.getInstance(this).notifyAppWidgetViewDataChanged(new int[]{wid}, R.id.w_list);
                    final android.content.Context ac = getApplicationContext(); final int w = wid;
                    new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() ->
                        AppWidgetManager.getInstance(ac).notifyAppWidgetViewDataChanged(new int[]{w}, R.id.w_list), 5200);
                }
            } else {
                Store.toggleExpanded(this, wid, nid);
                AppWidgetManager.getInstance(this).notifyAppWidgetViewDataChanged(new int[]{wid}, R.id.w_list);
            }
        }
        finish();
        overridePendingTransition(0, 0);
    }
}
