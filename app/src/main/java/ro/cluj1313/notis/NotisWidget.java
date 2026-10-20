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
        /* row taps are handled only by the private ListActReceiver (this provider must stay exported for the system) */
        if (ACT.equals(i.getAction())) return;
        super.onReceive(c, i);
    }

    static void handleAct(Context c, Intent i) {
        if (ACT.equals(i.getAction())) {
            int wid = i.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0);
            String nid = i.getStringExtra("n"), iid = i.getStringExtra("i"), bid = i.getStringExtra("b"), act = i.getStringExtra("act");
            if (nid != null && iid != null) {
                if ("del".equals(act)) {
                    try { Store.putAsk(c, wid, new JSONObject().put("k", "i").put("n", nid).put("b", bid == null ? "" : bid).put("i", iid)); } catch (Exception ignored) {}
                } else if ("no".equals(act)) {
                    Store.clearAsk(c, wid);
                } else if ("yes".equals(act)) {
                    if (Store.askMatches(Store.getAsk(c, wid), nid, bid, iid)) Store.removeItem(c, nid, bid, iid);
                    Store.clearAsk(c, wid);
                } else if ("olddel".equals(act)) {
                    /* 1.4.0: one tap removes at once; a 5 s "Anulează" row replaces it.
                       (1.3.0's two-tap confirm held the broadcast with goAsync() for 5.2 s, which queued the
                       second tap until the confirm window had already been reset -> it could never delete.) */
                    /* keep the exact item and its index so ANULEAZĂ puts back the same thing in the same place */
                    JSONObject orig = null; int k = -1;
                    JSONObject l0 = Store.listFor(c, wid);
                    JSONArray its = l0 != null && nid.equals(l0.optString("id")) ? l0.optJSONArray("items") : null;
                    String b0 = bid == null ? "" : bid;
                    if (its != null) for (int j = 0; j < its.length(); j++) { JSONObject x = its.optJSONObject(j);
                        if (x != null && iid.equals(x.optString("i")) && (b0.length() == 0 || b0.equals(x.optString("b", "")))) { orig = x; k = j; break; } }
                    if (orig == null) { try { orig = new JSONObject().put("i", iid).put("t", i.getStringExtra("t") == null ? "" : i.getStringExtra("t")).put("d", i.getBooleanExtra("d", false)); if (b0.length() > 0) orig.put("b", b0); } catch (Exception ignored) {} }
                    Store.removeItem(c, nid, bid, iid);
                    try { Store.putUndo(c, wid, new JSONObject().put("k", "i").put("n", nid).put("b", b0).put("i", iid)
                        .put("t", orig.optString("t")).put("x", orig).put("ix", k).put("p", i.getIntExtra("p", 0))); } catch (Exception ignored) {}
                    laterRefresh(c);
                } else if ("undo".equals(act)) {
                    JSONObject u = Store.getUndo(c, wid);
                    if (u != null && "i".equals(u.optString("k")) && iid.equals(u.optString("i"))) {
                        Store.put(c, "undo_" + wid, null);
                        JSONObject x = u.optJSONObject("x");
                        if (x == null) { try { x = new JSONObject().put("i", iid).put("t", u.optString("t")); } catch (Exception ignored) {} }
                        Store.readdItem(c, nid, u.optString("b"), x, u.optInt("ix", -1));
                    }
                } else {
                    Store.clearAsk(c, wid);
                    Store.toggle(c, nid, bid, iid, !i.getBooleanExtra("d", false));
                }
                refreshAll(c);
            }
            return;
        }
    }

    /** redraw once the undo window is over (no goAsync: it would serialize the next taps behind it) */
    static void laterRefresh(Context c) {
        final Context ac = c.getApplicationContext();
        new Handler(Looper.getMainLooper()).postDelayed(() -> refreshAll(ac), Store.UNDO_MS + 300);
    }

    static void refreshAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, NotisWidget.class));
        for (int id : ids) draw(c, m, id);
        if (ids.length > 0 && Build.VERSION.SDK_INT < 31) m.notifyAppWidgetViewDataChanged(ids, R.id.w_list);
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
        v.setInt(R.id.w_pick, "setColorFilter", t.mut);
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
            v.setTextViewText(R.id.w_empty, "Lista e goală — apasă + ca să adaugi.");
            v.setOnClickPendingIntent(R.id.w_head, openApp(c, id * 10 + 1, "?open=" + Uri.encode(l.optString("id"))));
            Intent add = new Intent(c, AddItemActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("n", l.optString("id"));
            add.setData(Uri.parse("notis://additem/" + id));
            v.setOnClickPendingIntent(R.id.w_add, activity(c, id * 10 + 2, add));
        }
        Intent cfg = new Intent(c, WidgetConfigActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("fromWidget", true);
        cfg.setData(Uri.parse("notis://cfg/" + id));
        v.setOnClickPendingIntent(R.id.w_cfg, activity(c, id * 10 + 3, cfg));
        Intent pick = new Intent(c, PickActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("kind", "list");
        pick.setData(Uri.parse("notis://pick/list/" + id));
        v.setOnClickPendingIntent(R.id.w_pick, activity(c, id * 10 + 4, pick));
        Intent svc = new Intent(c, WidgetService.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("kind", "list");
        svc.setData(Uri.parse("notis://widget/list/" + id));
        if (Build.VERSION.SDK_INT >= 31) v.setRemoteAdapter(R.id.w_list, WidgetService.listItems(c, id));
        else v.setRemoteAdapter(R.id.w_list, svc);
        v.setEmptyView(R.id.w_list, R.id.w_empty);
        Intent t = new Intent(c, ListActReceiver.class).setAction(ACT).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        t.setData(Uri.parse("notis://listact/" + id));
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
        v.setPendingIntentTemplate(R.id.w_list, PendingIntent.getBroadcast(c, id, t, fl));
        m.updateAppWidget(id, v);
    }
}
