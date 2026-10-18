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
            if ("alarm".equals(i.getStringExtra("act"))) {
                startActivity(new Intent(this, AlarmActivity.class).putExtra("n", nid));
            } else {
                Store.toggleExpanded(this, wid, nid);
                AppWidgetManager.getInstance(this).notifyAppWidgetViewDataChanged(new int[]{wid}, R.id.w_list);
            }
        }
        finish();
        overridePendingTransition(0, 0);
    }
}
