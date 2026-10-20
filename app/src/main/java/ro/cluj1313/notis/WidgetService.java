package ro.cluj1313.notis;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.format.DateFormat;
import android.text.style.StrikethroughSpan;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;

public class WidgetService extends RemoteViewsService {
    @Override public RemoteViewsFactory onGetViewFactory(Intent i) {
        int wid = i.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0);
        return "notes".equals(i.getStringExtra("kind")) ? new NotesF(getApplicationContext(), wid) : new F(getApplicationContext(), wid);
    }

    /** text notes of a tab, newest first (checklists have their own widget) */
    static List<JSONObject> notesOf(JSONObject s, String tab) {
        List<JSONObject> r = new ArrayList<>();
        JSONArray a = s.optJSONArray("notes");
        if (a != null) for (int k = 0; k < a.length(); k++) {
            JSONObject n = a.optJSONObject(k);
            if (n == null || "check".equals(n.optString("type")) || !tab.equals(n.optString("tab"))) continue;
            if (n.optString("text").trim().length() == 0) continue;
            r.add(n);
        }
        Collections.sort(r, (x, y) -> y.optString("upd").compareTo(x.optString("upd")));
        return r;
    }

    static long nextAlarm(JSONObject n) {
        JSONObject a = n.optJSONObject("alarm"); if (a == null) return 0;
        long at = a.optLong("at"), snz = a.optLong("snz", 0);
        if (snz > 0 && snz < at) at = snz;
        if (at <= 0) return 0;
        int rep = a.optInt("rep");
        long now = System.currentTimeMillis();
        if (rep > 0 && at < now) at = Store.roll(at, rep, now);
        return at;
    }

    static String shortTime(Context c, long ms) {
        Calendar t = Calendar.getInstance(), n = Calendar.getInstance(); t.setTimeInMillis(ms);
        String hm = DateFormat.format("HH:mm", t).toString();
        if (t.get(Calendar.YEAR) == n.get(Calendar.YEAR) && t.get(Calendar.DAY_OF_YEAR) == n.get(Calendar.DAY_OF_YEAR)) return hm;
        n.add(Calendar.DAY_OF_YEAR, 1);
        if (t.get(Calendar.YEAR) == n.get(Calendar.YEAR) && t.get(Calendar.DAY_OF_YEAR) == n.get(Calendar.DAY_OF_YEAR)) return "mâine " + hm;
        return DateFormat.format("dd.MM HH:mm", t).toString();
    }

    static final class F implements RemoteViewsFactory {
        private final Context c; private final int wid;
        private final List<JSONObject> rows = new ArrayList<>(); private String nid = ""; private JSONObject undo; private Themes th;
        F(Context c, int wid) { this.c = c; this.wid = wid; }
        @Override public void onCreate() {}
        @Override public void onDestroy() { rows.clear(); }
        @Override public void onDataSetChanged() {
            rows.clear();
            th = Themes.forWidget(c, wid);
            undo = Store.getUndo(c, wid);
            JSONObject l = Store.listFor(c, wid);
            if (l == null) return;
            nid = l.optString("id");
            JSONArray it = l.optJSONArray("items");
            if (it == null) return;
            List<JSONObject> done = new ArrayList<>();
            for (int k = 0; k < it.length(); k++) { JSONObject x = it.optJSONObject(k); if (x == null) continue; if (x.optBoolean("d")) done.add(x); else rows.add(x); }
            rows.addAll(done);
            if (undo != null && "i".equals(undo.optString("k")) && nid.equals(undo.optString("n"))) {
                try { rows.add(Math.max(0, Math.min(rows.size(), undo.optInt("p"))), new JSONObject().put("undo", true).put("i", undo.optString("i")).put("t", undo.optString("t"))); } catch (Exception ignored) {}
            }
        }
        @Override public int getCount() { return rows.size(); }
        @Override public RemoteViews getViewAt(int p) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_item);
            if (p >= rows.size()) return v;
            JSONObject x = rows.get(p);
            boolean d = x.optBoolean("d");
            String t = x.optString("t");
            if (x.optBoolean("undo")) {
                v.setViewVisibility(R.id.wi_box, View.GONE); v.setViewVisibility(R.id.wi_x, View.GONE);
                v.setTextViewText(R.id.wi_text, "Șters „" + t + "” · ANULEAZĂ"); v.setTextColor(R.id.wi_text, th.acc);
                v.setOnClickFillInIntent(R.id.wi_row, new Intent().putExtra("n", nid).putExtra("i", x.optString("i")).putExtra("act", "undo"));
                return v;
            }
            if (d) { SpannableString s = new SpannableString(t); s.setSpan(new StrikethroughSpan(), 0, t.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE); v.setTextViewText(R.id.wi_text, s); v.setTextColor(R.id.wi_text, th.mut); }
            else { v.setTextViewText(R.id.wi_text, t); v.setTextColor(R.id.wi_text, th.text); }
            v.setImageViewResource(R.id.wi_box, d ? R.drawable.ic_box_on : R.drawable.ic_box);
            v.setInt(R.id.wi_box, "setColorFilter", d ? th.mut : th.acc);
            v.setImageViewResource(R.id.wi_x, R.drawable.ic_x);
            v.setInt(R.id.wi_x, "setColorFilter", th.mut);
            Intent f = new Intent().putExtra("n", nid).putExtra("i", x.optString("i")).putExtra("b", x.optString("b", "")).putExtra("d", d).putExtra("act", "toggle");
            v.setOnClickFillInIntent(R.id.wi_row, f);
            Intent g = new Intent().putExtra("n", nid).putExtra("i", x.optString("i")).putExtra("b", x.optString("b", "")).putExtra("t", t).putExtra("d", d).putExtra("p", p).putExtra("act", "del");
            v.setOnClickFillInIntent(R.id.wi_x, g);
            return v;
        }
        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int p) { return p < rows.size() ? ((rows.get(p).optBoolean("undo") ? "undo:" : "") + rows.get(p).optString("b", "") + rows.get(p).optString("i")).hashCode() : p; }
        @Override public boolean hasStableIds() { return true; }
    }

    static final class NotesF implements RemoteViewsFactory {
        private final Context c; private final int wid;
        private List<JSONObject> rows = new ArrayList<>(); private Themes th;
        NotesF(Context c, int wid) { this.c = c; this.wid = wid; }
        @Override public void onCreate() {}
        @Override public void onDestroy() { rows.clear(); }
        @Override public void onDataSetChanged() {
            th = Themes.forWidget(c, wid);
            JSONObject s = Store.snapshot(c);
            rows = notesOf(s, Store.notesTab(c, wid, s));
            JSONObject u = Store.getUndo(c, wid);
            if (u != null && "n".equals(u.optString("k"))) {
                try { rows.add(Math.max(0, Math.min(rows.size(), u.optInt("p"))), new JSONObject().put("undo", true).put("id", u.optString("n")).put("title", u.optString("t"))); } catch (Exception ignored) {}
            }
        }
        @Override public int getCount() { return rows.size(); }
        @Override public RemoteViews getViewAt(int p) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.note_item);
            if (p >= rows.size()) return v;
            JSONObject n = rows.get(p);
            String id = n.optString("id"), txt = n.optString("text").trim();
            if (n.optBoolean("undo")) {
                String tt = n.optString("title"); if (tt.length() > 40) tt = tt.substring(0, 40) + "…";
                v.setTextViewText(R.id.ni_text, "Mutată în coș" + (tt.length() > 0 ? " „" + tt + "”" : "") + " · ANULEAZĂ");
                v.setTextColor(R.id.ni_text, th.acc);
                v.setViewVisibility(R.id.ni_al, View.GONE); v.setViewVisibility(R.id.ni_del, View.GONE);
                v.setOnClickFillInIntent(R.id.ni_text, new Intent().putExtra("n", id).putExtra("act", "undo"));
                return v;
            }
            boolean ex = Store.expanded(c, wid, id);
            v.setTextViewText(R.id.ni_text, txt);
            v.setInt(R.id.ni_text, "setMaxLines", ex ? 40 : 1);
            v.setTextColor(R.id.ni_text, th.text);
            long at = nextAlarm(n);
            if (at > 0) {
                /* alarm set: only the (next) time, no clock icon; ↻ for repeating */
                JSONObject al = n.optJSONObject("alarm");
                boolean rep = al != null && al.optInt("rep") > 0;
                v.setViewVisibility(R.id.ni_ic, View.GONE);
                v.setViewVisibility(R.id.ni_time, View.VISIBLE);
                v.setTextViewText(R.id.ni_time, shortTime(c, at) + (rep ? " ↻" : ""));
                v.setTextColor(R.id.ni_time, th.acc);
            } else {
                /* no alarm: only the clock icon */
                v.setViewVisibility(R.id.ni_time, View.GONE);
                v.setViewVisibility(R.id.ni_ic, View.VISIBLE);
                v.setImageViewResource(R.id.ni_ic, R.drawable.ic_alarm);
                v.setInt(R.id.ni_ic, "setColorFilter", th.mut);
            }
            /* expanded row only: "Mută în coș" (two taps within 5 s) */
            if (ex) {
                v.setViewVisibility(R.id.ni_del, View.VISIBLE);
                v.setTextViewText(R.id.ni_del, "✕  Mută în coș");
                v.setTextColor(R.id.ni_del, th.mut);
                v.setOnClickFillInIntent(R.id.ni_del, new Intent().putExtra("n", id).putExtra("p", p).putExtra("act", "del"));
            } else v.setViewVisibility(R.id.ni_del, View.GONE);
            v.setOnClickFillInIntent(R.id.ni_text, new Intent().putExtra("n", id).putExtra("act", "expand"));
            v.setOnClickFillInIntent(R.id.ni_al, new Intent().putExtra("n", id).putExtra("act", "alarm"));
            return v;
        }
        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int p) { return p < rows.size() ? ((rows.get(p).optBoolean("undo") ? "undo:" : "") + rows.get(p).optString("id")).hashCode() : p; }
        @Override public boolean hasStableIds() { return true; }
    }
}
