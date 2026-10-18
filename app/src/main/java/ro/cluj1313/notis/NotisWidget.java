package ro.cluj1313.notis;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

/** "Notis · Listă": one checklist, tap to tick, x to remove (tap twice), + to add items. */
public class NotisWidget extends AppWidgetProvider {
    static final String ACT = "ro.cluj1313.notis.LIST_ACT";

    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { for (int id : ids) draw(c, m, id); }
    @Override public void onDeleted(Context c, int[] ids) { for (int id : ids) Store.forget(c, id); }

    @Override public void onReceive(Context c, Intent i) {
        if (ACT.equals(i.getAction())) {
            int wid = i.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0);
            String nid = i.getStringExtra("n"), iid = i.getStringExtra("i"), bid = i.getStringExtra("b"), act = i.getStringExtra("act");
            if (nid != null && iid != null) {
                if ("del".equals(act)) {
                    String arm = Store.get(c, "arm_" + wid);
                    long now = System.currentTimeMillis();
                    if (arm != null && arm.startsWith(iid + "|") && now - Long.parseLong(arm.substring(arm.indexOf('|') + 1)) < 5000) {
                        Store.put(c, "arm_" + wid, null);
                        Store.removeItem(c, nid, bid, iid);
                    } else {
                        Store.put(c, "arm_" + wid, iid + "|" + now);
                        final PendingResult pr = goAsync(); final Context ac = c.getApplicationContext(); final int w = wid;
                        new Handler(Looper.getMainLooper()).postDelayed(() -> {
                            String a2 = Store.get(ac, "arm_" + w);
                            if (a2 != null && a2.startsWith(iid + "|")) { Store.put(ac, "arm_" + w, null); refreshAll(ac); }
                            pr.finish();
                        }, 5200);
                    }
                } else {
                    Store.put(c, "arm_" + wid, null);
                    Store.toggle(c, nid, bid, iid, !i.getBooleanExtra("d", false));
                }
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
        if (ids.length > 0) m.notifyAppWidgetViewDataChanged(ids, R.id.w_list);
        NotesWidget.refreshAll(c);
    }

    static PendingIntent openApp(Context c, int req, String q) {
        Intent o = new Intent(c, MainActivity.class).putExtra("q", q).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        o.setData(Uri.parse("notis://open/" + req + "/" + Uri.encode(q)));
        return PendingIntent.getActivity(c, req, o, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    static PendingIntent activity(Context c, int req, Intent o) {
        o.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY);
        return PendingIntent.getActivity(c, req, o, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void theme(RemoteViews v, Themes t) {
        v.setInt(R.id.w_root, "setBackgroundResource", t.bg);
        v.setInt(R.id.w_add, "setBackgroundResource", t.add);
        v.setInt(R.id.w_add, "setColorFilter", t.acc);
        v.setInt(R.id.w_cfg, "setColorFilter", t.mut);
        v.setInt(R.id.w_line, "setColorFilter", t.line);
        v.setTextColor(R.id.w_title, t.title);
        v.setTextColor(R.id.w_sub, t.mut);
        v.setTextColor(R.id.w_empty, t.mut);
    }

    static void draw(Context c, AppWidgetManager m, int id) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget);
        Themes th = Themes.forWidget(c, id);
        theme(v, th);
        JSONObject l = Store.listFor(c, id);
        if (l == null) {
            v.setTextViewText(R.id.w_title, "Notis");
            v.setTextViewText(R.id.w_sub, "nicio listă cu bife încă");
            v.setOnClickPendingIntent(R.id.w_head, openApp(c, id * 10 + 1, ""));
            v.setOnClickPendingIntent(R.id.w_add, openApp(c, id * 10 + 2, "?a=new"));
        } else {
            JSONArray it = l.optJSONArray("items");
            int n = it == null ? 0 : it.length(), done = 0;
            for (int k = 0; k < n; k++) if (it.optJSONObject(k).optBoolean("d")) done++;
            v.setTextViewText(R.id.w_title, l.optString("title", "Listă"));
            v.setTextViewText(R.id.w_sub, "☑ " + done + "/" + n);
            v.setOnClickPendingIntent(R.id.w_head, openApp(c, id * 10 + 1, "?open=" + Uri.encode(l.optString("id"))));
            Intent add = new Intent(c, AddItemActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("n", l.optString("id"));
            add.setData(Uri.parse("notis://additem/" + id));
            v.setOnClickPendingIntent(R.id.w_add, activity(c, id * 10 + 2, add));
        }
        Intent cfg = new Intent(c, WidgetConfigActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("fromWidget", true);
        cfg.setData(Uri.parse("notis://cfg/" + id));
        v.setOnClickPendingIntent(R.id.w_cfg, activity(c, id * 10 + 3, cfg));
        Intent svc = new Intent(c, WidgetService.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("kind", "list");
        svc.setData(Uri.parse("notis://widget/list/" + id));
        v.setRemoteAdapter(R.id.w_list, svc);
        v.setEmptyView(R.id.w_list, R.id.w_empty);
        Intent t = new Intent(c, NotisWidget.class).setAction(ACT).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        t.setData(Uri.parse("notis://listact/" + id));
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
        v.setPendingIntentTemplate(R.id.w_list, PendingIntent.getBroadcast(c, id, t, fl));
        m.updateAppWidget(id, v);
    }
}
