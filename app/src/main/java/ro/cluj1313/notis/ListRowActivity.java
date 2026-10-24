package ro.cluj1313.notis;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

/** 2.5.0: invisible trampoline for list widget rows (activity starts from a broadcast are blocked on Android 10+, and ✎ opens a dialog) */
public class ListRowActivity extends Activity {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Intent i = getIntent();
        if ("edit".equals(i.getStringExtra("act"))) {
            startActivity(new Intent(this, EditActivity.class).putExtra("w", i.getIntExtra(android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_ID, 0)).putExtra("k", "i").putExtra("n", i.getStringExtra("n")).putExtra("i", i.getStringExtra("i")).putExtra("b", i.getStringExtra("b")));
        } else {
            i.setAction(NotisWidget.ACT);
            NotisWidget.handleAct(this, i);
        }
        finish();
        overridePendingTransition(0, 0);
    }
}
