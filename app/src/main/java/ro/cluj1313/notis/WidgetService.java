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
        if ((rep > 0 || a.optInt("repM", 0) > 0) && at < now) at = Store.rollAlarm(a, at, now);
        return at;
    }

    static String shortTime(Context c, long ms) {
        Calendar t = Calendar.getInstance(), n = Calendar.getInstance(); t.setTimeInMillis(ms);
        String hm = DateFormat.format("HH:mm", t).toString();
        if (t.get(Calendar.YEAR) == n.get(Calendar.YEAR) && t.get(Calendar.DAY_OF_YEAR) == n.get(Calendar.DAY_OF_YEAR)) return hm;
        n.add(Calendar.DAY_OF_YEAR, 1);
        if (t.get(Calendar.YEAR) == n.get(Calendar.YEAR) && t.get(Calendar.DAY_OF_YEAR) == n.get(Calendar.DAY_OF_YEAR)) return Tr.s(c, R.string.tomorrow_at, hm);
        return DateFormat.format("dd.MM HH:mm", t).toString();
    }

    /* ---- row builders shared by the inline collection (API 31+) and the legacy factory ---- */
    static RemoteViews listRow(Context c, List<JSONObject> rs, String nid, Themes th, int p) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_item);
            v.setTextViewText(R.id.wi_yes, Tr.s(c, R.string.yes)); v.setTextViewText(R.id.wi_no, Tr.s(c, R.string.no));
            v.setContentDescription(R.id.wi_box, Tr.s(c, R.string.cd_tick)); v.setContentDescription(R.id.wi_x, Tr.s(c, R.string.cd_delete));
            if (p >= rs.size()) return v;
            JSONObject x = rs.get(p);
            /* the launcher recycles row views: always set every visibility explicitly */
            v.setViewVisibility(R.id.wi_box, View.VISIBLE); v.setViewVisibility(R.id.wi_x, View.VISIBLE);
            v.setViewVisibility(R.id.wi_yes, View.GONE); v.setViewVisibility(R.id.wi_no, View.GONE);
            try {
            boolean d = x.optBoolean("d");
            String t = x.optString("t");
            if (x.optBoolean("ask")) {
                v.setViewVisibility(R.id.wi_box, View.GONE); v.setViewVisibility(R.id.wi_x, View.GONE);
                v.setViewVisibility(R.id.wi_yes, View.VISIBLE); v.setViewVisibility(R.id.wi_no, View.VISIBLE);
                v.setTextViewText(R.id.wi_text, Tr.s(c, R.string.ask_del_named, t)); v.setTextColor(R.id.wi_text, th.text);
                v.setTextColor(R.id.wi_yes, th.danger); v.setTextColor(R.id.wi_no, th.acc);
                Intent base = new Intent().putExtra("n", nid).putExtra("i", x.optString("i")).putExtra("b", x.optString("b", ""));
                v.setOnClickFillInIntent(R.id.wi_row, new Intent(base).putExtra("act", "no"));
                v.setOnClickFillInIntent(R.id.wi_no, new Intent(base).putExtra("act", "no"));
                v.setOnClickFillInIntent(R.id.wi_yes, new Intent(base).putExtra("act", "yes"));
                return v;
            }
            if (x.optBoolean("undo")) {
                v.setViewVisibility(R.id.wi_box, View.GONE); v.setViewVisibility(R.id.wi_x, View.GONE);
                v.setTextViewText(R.id.wi_text, Tr.s(c, R.string.deleted_named_undo, t)); v.setTextColor(R.id.wi_text, th.acc);
                v.setOnClickFillInIntent(R.id.wi_row, new Intent().putExtra("n", nid).putExtra("i", x.optString("i")).putExtra("act", "undo"));
                return v;
            }
            if (d && t.length() > 0) { SpannableString s = new SpannableString(t); s.setSpan(new StrikethroughSpan(), 0, t.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE); v.setTextViewText(R.id.wi_text, s); v.setTextColor(R.id.wi_text, th.mut); }
            else { v.setTextViewText(R.id.wi_text, t); v.setTextColor(R.id.wi_text, th.text); }
            v.setImageViewResource(R.id.wi_box, d ? R.drawable.ic_box_on : R.drawable.ic_box);
            v.setInt(R.id.wi_box, "setColorFilter", d ? th.mut : th.acc);
            v.setImageViewResource(R.id.wi_x, R.drawable.ic_x);
            v.setInt(R.id.wi_x, "setColorFilter", th.mut);
            Intent f = new Intent().putExtra("n", nid).putExtra("i", x.optString("i")).putExtra("b", x.optString("b", "")).putExtra("d", d).putExtra("act", "toggle");
            v.setOnClickFillInIntent(R.id.wi_row, f);
            Intent g = new Intent().putExtra("n", nid).putExtra("i", x.optString("i")).putExtra("b", x.optString("b", "")).putExtra("t", t).putExtra("d", d).putExtra("p", p).putExtra("act", "del");
            v.setOnClickFillInIntent(R.id.wi_x, g);
            } catch (Exception e) { v.setTextViewText(R.id.wi_text, x.optString("t")); }
            return v;
        }
    static RemoteViews noteRow(Context c, int wid, List<JSONObject> rs, Themes th, int p) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.note_item);
            v.setTextViewText(R.id.ni_yes, Tr.s(c, R.string.yes)); v.setTextViewText(R.id.ni_no, Tr.s(c, R.string.no)); v.setContentDescription(R.id.ni_ic, Tr.s(c, R.string.cd_alarm));
            if (p >= rs.size()) return v;
            JSONObject n = rs.get(p);
            v.setViewVisibility(R.id.ni_al, View.VISIBLE); /* recycled row views: reset */
            v.setViewVisibility(R.id.ni_yes, View.GONE); v.setViewVisibility(R.id.ni_no, View.GONE);
            String id = n.optString("id"), txt = n.optString("text").trim();
            if (n.optBoolean("ask")) {
                String tt = txt.split("\n", 2)[0]; if (tt.length() > 40) tt = tt.substring(0, 40) + "…";
                v.setTextViewText(R.id.ni_text, (tt.length() > 0 ? Tr.s(c, R.string.ask_del_named, tt) : Tr.s(c, R.string.ask_del)));
                v.setInt(R.id.ni_text, "setMaxLines", 2); v.setTextColor(R.id.ni_text, th.text);
                v.setViewVisibility(R.id.ni_al, View.GONE); v.setViewVisibility(R.id.ni_del, View.GONE);
                v.setViewVisibility(R.id.ni_yes, View.VISIBLE); v.setViewVisibility(R.id.ni_no, View.VISIBLE);
                v.setTextColor(R.id.ni_yes, th.danger); v.setTextColor(R.id.ni_no, th.acc);
                v.setOnClickFillInIntent(R.id.ni_text, new Intent().putExtra("n", id).putExtra("act", "no"));
                v.setOnClickFillInIntent(R.id.ni_no, new Intent().putExtra("n", id).putExtra("act", "no"));
                v.setOnClickFillInIntent(R.id.ni_yes, new Intent().putExtra("n", id).putExtra("act", "yes"));
                return v;
            }
            if (n.optBoolean("undo")) {
                String tt = n.optString("title"); if (tt.length() > 40) tt = tt.substring(0, 40) + "…";
                v.setTextViewText(R.id.ni_text, (tt.length() > 0 ? Tr.s(c, R.string.trashed_named_undo, tt) : Tr.s(c, R.string.trashed_undo)));
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
                v.setTextViewText(R.id.ni_del, Tr.s(c, R.string.del_btn));
                v.setTextColor(R.id.ni_del, th.mut);
                v.setOnClickFillInIntent(R.id.ni_del, new Intent().putExtra("n", id).putExtra("p", p).putExtra("act", "del"));
            } else v.setViewVisibility(R.id.ni_del, View.GONE);
            v.setOnClickFillInIntent(R.id.ni_text, new Intent().putExtra("n", id).putExtra("act", "expand"));
            v.setOnClickFillInIntent(R.id.ni_al, new Intent().putExtra("n", id).putExtra("act", "alarm"));
            return v;
        }

    static long listId(JSONObject x) { return ((x.optBoolean("undo") ? "undo:" : "") + x.optString("b", "") + x.optString("i")).hashCode(); }
    static long noteId(JSONObject x) { return ((x.optBoolean("undo") ? "undo:" : "") + x.optString("id")).hashCode(); }

    /** 1.6.0: rows travel inside the widget update itself — no service, no factory, nothing to unbind/cache. */
    @android.annotation.TargetApi(31)
    static RemoteViews.RemoteCollectionItems listItems(Context c, int wid) {
        RemoteViews.RemoteCollectionItems.Builder b = new RemoteViews.RemoteCollectionItems.Builder().setHasStableIds(true).setViewTypeCount(1);
        try {
            Themes th = Themes.forWidget(c, wid);
            JSONObject l = Store.listFor(c, wid);
            if (l != null) { List<JSONObject> rs = Store.markAsk(Store.listRows(l, null), Store.getAsk(c, wid), l.optString("id"), false); String nid = l.optString("id");
                java.util.Set<Long> seen = new java.util.HashSet<>();
                for (int p = 0; p < rs.size(); p++) { long id = listId(rs.get(p)); while (!seen.add(id)) id++; b.addItem(id, listRow(c, rs, nid, th, p)); } }
        } catch (Exception ignored) {}
        return b.build();
    }
    @android.annotation.TargetApi(31)
    static RemoteViews.RemoteCollectionItems noteItems(Context c, int wid) {
        RemoteViews.RemoteCollectionItems.Builder b = new RemoteViews.RemoteCollectionItems.Builder().setHasStableIds(true).setViewTypeCount(1);
        try {
            Themes th = Themes.forWidget(c, wid);
            JSONObject s = Store.snapshot(c);
            List<JSONObject> rs = Store.markAsk(Store.noteRows(s, Store.notesTab(c, wid, s), null), Store.getAsk(c, wid), null, true);
            java.util.Set<Long> seen = new java.util.HashSet<>();
            for (int p = 0; p < rs.size(); p++) { long id = noteId(rs.get(p)); while (!seen.add(id)) id++; b.addItem(id, noteRow(c, wid, rs, th, p)); }
        } catch (Exception ignored) {}
        return b.build();
    }

    static final class F implements RemoteViewsFactory {
        private final Context c; private final int wid;
        private volatile List<JSONObject> rows = new ArrayList<>(); private volatile String nid = ""; private volatile Themes th;
        F(Context c, int wid) { this.c = c; this.wid = wid; }
        @Override public void onCreate() {}
        @Override public void onDestroy() { rows.clear(); }
        @Override public void onDataSetChanged() {
            /* build a new list and swap it in: getViewAt() never sees a half-filled list */
            List<JSONObject> r = new ArrayList<>(); String id = "";
            try {
                th = Themes.forWidget(c, wid);
                JSONObject l = Store.listFor(c, wid);
                if (l != null) { id = l.optString("id"); r = Store.markAsk(Store.listRows(l, null), Store.getAsk(c, wid), l.optString("id"), false); }
            } catch (Exception e) { r = new ArrayList<>(); }
            nid = id; rows = r;
        }
        @Override public int getCount() { return rows.size(); }
        @Override public RemoteViews getViewAt(int p) { return listRow(c, rows, nid, th != null ? th : Themes.of("gold"), p); }
        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int p) { List<JSONObject> rs = rows; return p < rs.size() ? ((rs.get(p).optBoolean("undo") ? "undo:" : "") + rs.get(p).optString("b", "") + rs.get(p).optString("i")).hashCode() : p; }
        @Override public boolean hasStableIds() { return true; }
    }

    static final class NotesF implements RemoteViewsFactory {
        private final Context c; private final int wid;
        private volatile List<JSONObject> rows = new ArrayList<>(); private volatile Themes th;
        NotesF(Context c, int wid) { this.c = c; this.wid = wid; }
        @Override public void onCreate() {}
        @Override public void onDestroy() { rows.clear(); }
        @Override public void onDataSetChanged() {
            List<JSONObject> r;
            try {
                th = Themes.forWidget(c, wid);
                JSONObject s = Store.snapshot(c);
                r = Store.markAsk(Store.noteRows(s, Store.notesTab(c, wid, s), null), Store.getAsk(c, wid), null, true);
            } catch (Exception e) { r = new ArrayList<>(); }
            rows = r;
        }
        @Override public int getCount() { return rows.size(); }
        @Override public RemoteViews getViewAt(int p) { return noteRow(c, wid, rows, th != null ? th : Themes.of("gold"), p); }
        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int p) { List<JSONObject> rs = rows; return p < rs.size() ? ((rs.get(p).optBoolean("undo") ? "undo:" : "") + rs.get(p).optString("id")).hashCode() : p; }
        @Override public boolean hasStableIds() { return true; }
    }
}
