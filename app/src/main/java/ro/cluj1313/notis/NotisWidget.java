package ro.cluj1313.notis;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

public class NotisWidget extends AppWidgetProvider {
    static final String ACT_TOGGLE = "ro.cluj1313.notis.TOGGLE";

    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { for (int id : ids) draw(c, m, id); }
    @Override public void onDeleted(Context c, int[] ids) { for (int id : ids) Store.setChoice(c, id, null); }

    @Override public void onReceive(Context c, Intent i) {
        if (ACT_TOGGLE.equals(i.getAction())) {
            String nid = i.getStringExtra("n"), iid = i.getStringExtra("i");
            if (nid != null && iid != null) {
                Store.toggle(c, nid, i.getStringExtra("b"), iid, !i.getBooleanExtra("d", false));
                refreshAll(c);
            }
            return;
        }
        super.onReceive(c, i);
    }

    static void refreshAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, NotisWidget.class));
        for (int id : ids) draw(c, m, id);
        m.notifyAppWidgetViewDataChanged(ids, R.id.w_list);
    }

    static PendingIntent openApp(Context c, int req, String q) {
        Intent o = new Intent(c, MainActivity.class).putExtra("q", q).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        o.setData(Uri.parse("notis://open/" + req + "/" + Uri.encode(q)));
        return PendingIntent.getActivity(c, req, o, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void draw(Context c, AppWidgetManager m, int id) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget);
        JSONObject l = Store.listFor(c, id);
        if (l == null) {
            v.setTextViewText(R.id.w_title, "Notis");
            v.setTextViewText(R.id.w_sub, "nicio listă cu bife încă");
            v.setOnClickPendingIntent(R.id.w_head, openApp(c, id * 10 + 1, ""));
        } else {
            JSONArray it = l.optJSONArray("items");
            int n = it == null ? 0 : it.length(), done = 0;
            for (int k = 0; k < n; k++) if (it.optJSONObject(k).optBoolean("d")) done++;
            v.setTextViewText(R.id.w_title, l.optString("title", "Listă"));
            v.setTextViewText(R.id.w_sub, "☑ " + done + "/" + n);
            v.setOnClickPendingIntent(R.id.w_head, openApp(c, id * 10 + 1, "?open=" + Uri.encode(l.optString("id"))));
        }
        v.setOnClickPendingIntent(R.id.w_add, openApp(c, id * 10 + 2, "?a=new"));
        Intent svc = new Intent(c, WidgetService.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        svc.setData(Uri.parse("notis://widget/" + id));
        v.setRemoteAdapter(R.id.w_list, svc);
        v.setEmptyView(R.id.w_list, R.id.w_empty);
        Intent t = new Intent(c, NotisWidget.class).setAction(ACT_TOGGLE);
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
        v.setPendingIntentTemplate(R.id.w_list, PendingIntent.getBroadcast(c, id, t, fl));
        m.updateAppWidget(id, v);
    }
}
