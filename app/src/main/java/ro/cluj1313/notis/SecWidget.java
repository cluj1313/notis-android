package ro.cluj1313.notis;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.util.TypedValue;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

/** 2.21.0: content widgets for Pastile / Plăți / CRM. Read-only view of the snapshot the app pushes (snapshot.sec.*);
 *  nothing is logged. Settings per widget in "sc_"+wid: f filter, n rows, a opacity %, fs font size, cb show checkboxes. */
public abstract class SecWidget extends AppWidgetProvider {
    abstract String kind();
    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { for (int id : ids) draw(c, m, id, kind()); }
    @Override public void onDeleted(Context c, int[] ids) { for (int id : ids) Store.forget(c, id); }

    public static class Med extends SecWidget { String kind() { return "med"; } }
    public static class Util extends SecWidget { String kind() { return "util"; } }
    public static class Crm extends SecWidget { String kind() { return "crm"; } }
    static final Class<?>[] ALL = {Med.class, Util.class, Crm.class};
    static final String[] KINDS = {"med", "util", "crm"};

    static void refreshAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        for (int k = 0; k < ALL.length; k++) for (int id : m.getAppWidgetIds(new ComponentName(c, ALL[k]))) draw(c, m, id, KINDS[k]);
    }
    static String kindOf(Context c, int wid) {
        android.appwidget.AppWidgetProviderInfo i = AppWidgetManager.getInstance(c).getAppWidgetInfo(wid);
        if (i == null) return null; String n = i.provider.getClassName();
        return n.endsWith("$Med") ? "med" : n.endsWith("$Util") ? "util" : n.endsWith("$Crm") ? "crm" : null;
    }
    static JSONObject cfg(Context c, int wid) {
        try { String s = Store.get(c, "sc_" + wid); if (s != null) return new JSONObject(s); } catch (Exception ignored) {}
        return new JSONObject();
    }
    static int title(String k) { return "med".equals(k) ? R.string.h_med : "util".equals(k) ? R.string.h_util : R.string.h_crm; }
    static String icon(String k) { return "med".equals(k) ? "💊 " : "util".equals(k) ? "💳 " : "👥 "; }
    static int base(String k) { return "med".equals(k) ? 710000 : "util".equals(k) ? 720000 : 730000; }
    static boolean pass(JSONObject r, String k, String f) {
        if (f == null || f.length() == 0) return true;
        if ("med".equals(k)) return f.equals(r.optString("p"));
        if ("util".equals(k)) return f.equals(r.optString("g"));
        return f.equals(r.optString("sub"));
    }
    static String dm(String d) { /* yyyy-mm-dd -> dd.mm */ return d != null && d.length() >= 10 ? d.substring(8, 10) + "." + d.substring(5, 7) : ""; }

    static void draw(Context c, AppWidgetManager m, int id, String k) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.sec_widget);
        JSONObject sc = cfg(c, id);
        Themes th = Store.get(c, "th_" + id) == null ? Themes.of("jad") : Themes.forWidget(c, id);
        int alpha = Math.max(0, Math.min(100, sc.optInt("a", 100)));
        float fs = (float) Math.max(11, Math.min(20, sc.optInt("fs", 14)));
        int max = Math.max(1, Math.min(12, sc.optInt("n", 5)));
        boolean cb = sc.optBoolean("cb", true);
        String f = sc.optString("f", "");
        v.setImageViewResource(R.id.sw_bg, th.bg);
        v.setInt(R.id.sw_bg, "setImageAlpha", Math.round(alpha * 2.55f));
        v.setInt(R.id.sw_line, "setColorFilter", th.line);
        v.setInt(R.id.sw_cfg, "setColorFilter", th.mut);
        v.setTextColor(R.id.sw_title, th.title); v.setTextColor(R.id.sw_cnt, th.mut); v.setTextColor(R.id.sw_empty, th.mut);
        v.setTextViewTextSize(R.id.sw_title, TypedValue.COMPLEX_UNIT_SP, fs + 2);
        String ttl = icon(k) + Tr.s(c, title(k));
        if (f.length() > 0) ttl += " · " + ("home".equals(f) ? Tr.s(c, R.string.sw_home) : "firm".equals(f) ? Tr.s(c, R.string.sw_firm) : f);
        v.setTextViewText(R.id.sw_title, ttl);
        v.setContentDescription(R.id.sw_cfg, Tr.s(c, R.string.cd_settings));
        android.app.PendingIntent open = NotisWidget.openApp(c, base(k) + id, "?tk=" + k);
        v.setOnClickPendingIntent(R.id.sw_head, open);
        v.setOnClickPendingIntent(R.id.sw_rows, open);
        v.setOnClickPendingIntent(R.id.sw_empty, open);
        Intent ci = new Intent(c, SecConfigActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("fromWidget", true);
        ci.setData(Uri.parse("notis://seccfg/" + id));
        v.setOnClickPendingIntent(R.id.sw_cfg, NotisWidget.activity(c, base(k) + 5000 + id, ci));
        v.removeAllViews(R.id.sw_rows);

        JSONObject snap = Store.snapshot(c), sec = snap.optJSONObject("sec"), d = sec == null ? null : sec.optJSONObject(k);
        JSONArray rows = d == null ? null : d.optJSONArray("rows");
        if ("med".equals(k) && d != null && !d.optString("day").equals(new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(new java.util.Date()))) { rows = null; d = null; } /* stale day: wait for the app to push today */
        int tot = 0, done = 0, shown = 0;
        long now = System.currentTimeMillis();
        if (rows != null) for (int i = 0; i < rows.length(); i++) {
            JSONObject r = rows.optJSONObject(i); if (r == null || !pass(r, k, f)) continue;
            tot++; if (r.optBoolean("d")) done++;
            if (shown >= max) continue;
            RemoteViews it = new RemoteViews(c.getPackageName(), R.layout.sec_item);
            String txt = r.optString("t"), meta = "";
            boolean box = false, on = false, warn = false;
            if ("med".equals(k)) { box = cb; on = r.optBoolean("d"); meta = r.optString("tm"); String p = r.optString("p"); if (f.length() == 0 && p.length() > 0 && multiP(rows)) txt += " · " + p; }
            else if ("util".equals(k)) { String due = r.optString("due"); meta = due.length() > 0 ? dm(due) + (r.optString("amt").length() > 0 ? "  " + r.optString("amt") : "") : "—"; warn = r.optInt("late") > 0; }
            else { long at = r.optLong("rem"); if (at > 0) { meta = dm(r.optString("rd")) + " " + r.optString("hm"); warn = at < now; } }
            it.setViewVisibility(R.id.si_box, box ? View.VISIBLE : View.GONE);
            if (box) { it.setImageViewResource(R.id.si_box, on ? R.drawable.ic_box_on : R.drawable.ic_box); it.setInt(R.id.si_box, "setColorFilter", on ? th.acc : th.mut); }
            it.setTextViewText(R.id.si_text, txt); it.setTextColor(R.id.si_text, on ? th.mut : th.text);
            it.setTextViewTextSize(R.id.si_text, TypedValue.COMPLEX_UNIT_SP, fs);
            it.setTextViewText(R.id.si_meta, meta); it.setTextColor(R.id.si_meta, warn ? th.danger : th.mut);
            it.setTextViewTextSize(R.id.si_meta, TypedValue.COMPLEX_UNIT_SP, Math.max(10, fs - 2));
            it.setOnClickPendingIntent(R.id.si_row, open);
            v.addView(R.id.sw_rows, it); shown++;
        }
        v.setTextViewText(R.id.sw_cnt, d == null ? "" : "med".equals(k) ? done + "/" + tot : String.valueOf(tot));
        if (shown == 0) {
            v.setViewVisibility(R.id.sw_empty, View.VISIBLE);
            v.setTextViewText(R.id.sw_empty, d == null ? Tr.s(c, R.string.sw_open_once) : Tr.s(c, "med".equals(k) ? R.string.sw_empty_med : "util".equals(k) ? R.string.sw_empty_util : R.string.sw_empty_crm));
        } else v.setViewVisibility(R.id.sw_empty, View.GONE);
        m.updateAppWidget(id, v);
    }
    private static boolean multiP(JSONArray rows) {
        String a = null; for (int i = 0; i < rows.length(); i++) { JSONObject r = rows.optJSONObject(i); if (r == null) continue; String p = r.optString("p"); if (a == null) a = p; else if (!a.equals(p)) return true; }
        return false;
    }
}
