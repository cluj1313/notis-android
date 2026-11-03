package ro.cluj1313.notis;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

/** v189: shortcuts widget: 5 tiles (Pastile, Plăți, CRM, Cumpărături, Urgențe) that open the matching tab (?tk=<kind>). No data read, nothing stored. */
public class HubWidget extends AppWidgetProvider {
    static final int[] IDS = { R.id.h_med, R.id.h_util, R.id.h_crm, R.id.h_shop, R.id.h_urg };
    static final String[] KINDS = { "med", "util", "crm", "shop", "urg" };
    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.hub_widget);
            for (int i = 0; i < IDS.length; i++) v.setOnClickPendingIntent(IDS[i], NotisWidget.openApp(c, 700000 + id * 10 + i, "?tk=" + KINDS[i]));
            m.updateAppWidget(id, v);
        }
    }
}
