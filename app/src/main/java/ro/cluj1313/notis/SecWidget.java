package ro.cluj1313.notis;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.util.TypedValue;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;

/** 2.25.1: Pastile / Glicemie widgets are usable on the home screen (checkbox / add reading).
 *  Only the header opens the app. Plăți / CRM stay a read-only view of snapshot.sec.*. */
public abstract class SecWidget extends AppWidgetProvider {
    abstract String kind();
    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { for (int id : ids) draw(c, m, id, kind()); }
    @Override public void onDeleted(Context c, int[] ids) { for (int id : ids) Store.forget(c, id); }

    public static class Med extends SecWidget { String kind() { return "med"; } }
    public static class MedGlic extends SecWidget { String kind() { return "glic"; } }
    public static class Util extends SecWidget { String kind() { return "util"; } }
    public static class Crm extends SecWidget { String kind() { return "crm"; } }
    static final Class<?>[] ALL = {Med.class, MedGlic.class, Util.class, Crm.class};
    static final String[] KINDS = {"med", "glic", "util", "crm"};

    static void refreshAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        for (int k = 0; k < ALL.length; k++) {
            int[] ids = m.getAppWidgetIds(new ComponentName(c, ALL[k]));
            for (int id : ids) draw(c, m, id, KINDS[k]);
            if (ids.length > 0 && Build.VERSION.SDK_INT < 31) m.notifyAppWidgetViewDataChanged(ids, R.id.sw_list);
        }
    }
    static String kindOf(Context c, int wid) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        android.appwidget.AppWidgetProviderInfo i = m.getAppWidgetInfo(wid);
        String n = (i != null && i.provider != null) ? i.provider.getClassName() : null;
        if (n == null) {
            for (int k = 0; k < ALL.length; k++) {
                for (int id : m.getAppWidgetIds(new ComponentName(c, ALL[k]))) if (id == wid) { n = ALL[k].getName(); break; }
                if (n != null) break;
            }
        }
        if (n == null) return null;
        return n.endsWith("$MedGlic") ? "glic" : n.endsWith("$Med") ? "med" : n.endsWith("$Util") ? "util" : n.endsWith("$Crm") ? "crm" : null;
    }
    static JSONObject cfg(Context c, int wid) {
        try { String s = Store.get(c, "sc_" + wid); if (s != null) return new JSONObject(s); } catch (Exception ignored) {}
        return new JSONObject();
    }
    static int title(String k) { return "med".equals(k) ? R.string.h_med : "glic".equals(k) ? R.string.h_glic : "util".equals(k) ? R.string.h_util : R.string.h_crm; }
    static String icon(String k) { return "med".equals(k) ? "💊 " : "glic".equals(k) ? "🩸 " : "util".equals(k) ? "💳 " : "👥 "; }
    static int base(String k) { return "med".equals(k) ? 710000 : "glic".equals(k) ? 711000 : "util".equals(k) ? 720000 : 730000; }
    static boolean pass(JSONObject r, String k, String f) {
        if (f == null || f.length() == 0) return true;
        if ("med".equals(k)) return f.equals(r.optString("p"));
        if ("util".equals(k)) return f.equals(r.optString("g"));
        return f.equals(r.optString("sub"));
    }
    static String dm(String d) { /* yyyy-mm-dd -> dd/mm */ return d != null && d.length() >= 10 ? d.substring(8, 10) + "/" + d.substring(5, 7) : ""; }
    static String today() { return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date()); }

    static PendingIntent togglePi(Context c, int req, String mid, int slot, boolean on, String day) {
        Intent i = new Intent(c, SecActReceiver.class).setAction(SecActReceiver.TOGGLE)
            .putExtra("m", mid).putExtra("i", slot).putExtra("d", on).putExtra("day", day)
            .setData(Uri.parse("notis://sectog/" + Uri.encode(mid) + "/" + slot + "/" + Uri.encode(day == null ? "" : day)));
        return PendingIntent.getBroadcast(c, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    static PendingIntent glicPi(Context c, int req, int wid, String day, int slot, int val, String lbl, String tm) {
        Intent i = new Intent(c, GlicInputActivity.class)
            .putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, wid)
            .putExtra("day", day).putExtra("i", slot).putExtra("v", val)
            .putExtra("lbl", lbl).putExtra("tm", tm)
            .setData(Uri.parse("notis://glicin/" + wid + "/" + slot))
            .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : PendingIntent.FLAG_IMMUTABLE);
        /* IMMUTABLE is fine: extras are set here, no fill-in */
        return PendingIntent.getActivity(c, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static String[] glicLabs(Context c) {
        try { return Tr.ctx(c).getResources().getStringArray(R.array.glic_slots); } catch (Exception e) { return new String[]{"1","2","3","4","5","6","7"}; }
    }

    /** 7 slots for today: snapshot rows (if same day) plus any overlay values already in snapshot() */
    static JSONObject[] glicToday(Context c, JSONObject d, String day) {
        JSONObject[] slots = new JSONObject[7];
        String[] labs = glicLabs(c);
        boolean same = d != null && day.equals(d.optString("day"));
        JSONArray rows = same && d != null ? d.optJSONArray("rows") : null;
        if (rows != null) for (int i = 0; i < rows.length(); i++) {
            JSONObject r = rows.optJSONObject(i); if (r == null) continue;
            int j = r.optInt("i", -1); if (j >= 0 && j < 7 && slots[j] == null) slots[j] = r;
        }
        for (int i = 0; i < 7; i++) if (slots[i] == null) {
            try { slots[i] = new JSONObject().put("m", "g" + i).put("i", i).put("t", labs[i]).put("tm", labs[i]).put("d", false).put("v", JSONObject.NULL); } catch (Exception ignored) {}
        }
        return slots;
    }

    static void draw(Context c, AppWidgetManager m, int id, String k) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.sec_widget);
        try {
        JSONObject sc = cfg(c, id);
        Themes th = Store.get(c, "th_" + id) == null ? Themes.of("jad") : Themes.forWidget(c, id);
        int alpha = Math.max(0, Math.min(100, sc.optInt("a", 100)));
        float fs = (float) Math.max(11, Math.min(20, sc.optInt("fs", 14)));
        int max = Math.max(1, Math.min(20, sc.optInt("n", "glic".equals(k) ? 7 : "med".equals(k) ? 12 : 5)));
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
        /* title (not the whole header) opens the app so ⚙ stays clickable */
        v.setOnClickPendingIntent(R.id.sw_title, open);
        Intent ci = new Intent(c, SecConfigActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("fromWidget", true);
        ci.setData(Uri.parse("notis://seccfg/" + id));
        v.setOnClickPendingIntent(R.id.sw_cfg, NotisWidget.activity(c, base(k) + 5000 + id, ci));
        List<JSONObject> items = listRows(c, id, k);
        String day = today();
        int tot = 0, done = 0, filled = 0;
        JSONObject snap = Store.snapshot(c), sec = snap == null ? null : snap.optJSONObject("sec"), d = sec == null ? null : sec.optJSONObject(k);
        if ("med".equals(k)) {
            for (JSONObject r : items) { tot += r.optInt("tot"); done += r.optInt("done"); }
            v.setTextViewText(R.id.sw_cnt, d == null ? "" : done + "/" + tot);
            v.setTextViewText(R.id.sw_empty, Tr.s(Tr.ctx(c, sc.optString("lang", "")), d == null ? R.string.sw_open_once : R.string.sw_empty_med));
        } else if ("glic".equals(k)) {
            for (JSONObject r : items) if (r.has("v") && !r.isNull("v") && r.optInt("v") > 0) filled++;
            if (filled == 0 && d != null) {
                JSONObject last = d.optJSONObject("last");
                if (last != null && last.optInt("v") > 0) {
                    String lastTxt = dm(last.optString("day")) + "  " + last.optString("tm") + "  " + last.optInt("v") + " mg/dl";
                    v.setTextViewText(R.id.sw_cnt, Tr.s(c, R.string.glic_last, lastTxt));
                } else v.setTextViewText(R.id.sw_cnt, "0/7");
            } else v.setTextViewText(R.id.sw_cnt, filled + "/7");
            v.setTextViewText(R.id.sw_empty, Tr.s(c, R.string.sw_open_once));
        } else {
            tot = items.size();
            v.setTextViewText(R.id.sw_cnt, d == null ? "" : String.valueOf(tot));
            int emptyId = d == null ? R.string.sw_open_once : "util".equals(k) ? R.string.sw_empty_util : R.string.sw_empty_crm;
            v.setTextViewText(R.id.sw_empty, Tr.s(c, emptyId));
        }
        Intent svc = new Intent(c, WidgetService.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("kind", "sec").putExtra("sk", k);
        svc.setData(Uri.parse("notis://widget/sec/" + k + "/" + id));
        if (Build.VERSION.SDK_INT >= 31) v.setRemoteAdapter(R.id.sw_list, WidgetService.secItems(c, id, k));
        else v.setRemoteAdapter(R.id.sw_list, svc);
        v.setEmptyView(R.id.sw_list, R.id.sw_empty);
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
        if ("med".equals(k)) {
            Intent t = new Intent(c, DayMedActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)
                .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY)
                .setData(Uri.parse("notis://daymed/" + id));
            v.setPendingIntentTemplate(R.id.sw_list, PendingIntent.getActivity(c, base(k) + 8000 + id, t, fl));
        } else if ("glic".equals(k)) {
            Intent t = new Intent(c, GlicInputActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)
                .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY)
                .setData(Uri.parse("notis://glicin/" + id));
            v.setPendingIntentTemplate(R.id.sw_list, PendingIntent.getActivity(c, base(k) + 8000 + id, t, fl));
        }
        int todayAt = todayIndex(items, day);
        if (todayAt >= 0) v.setScrollPosition(R.id.sw_list, todayAt);
        } catch (Exception e) {
            try {
                v.setTextViewText(R.id.sw_title, icon(k) + Tr.s(c, title(k)));
                v.setTextViewText(R.id.sw_empty, Tr.s(c, R.string.sw_open_once));
                v.setEmptyView(R.id.sw_list, R.id.sw_empty);
            } catch (Exception ignored) {}
        } finally {
            try { m.updateAppWidget(id, v); if (Build.VERSION.SDK_INT < 31) m.notifyAppWidgetViewDataChanged(id, R.id.sw_list); } catch (Exception ignored) {}
        }
    }
    /** every visible day/slot/row, no cap — already-placed widgets with empty config show all */
    static List<JSONObject> listRows(Context c, int id, String k) {
        List<JSONObject> o = new ArrayList<>();
        try {
            JSONObject sc = cfg(c, id);
            String f = sc.optString("f", ""), day = today();
            JSONObject snap = Store.snapshot(c), sec = snap == null ? null : snap.optJSONObject("sec"), d = sec == null ? null : sec.optJSONObject(k);
            if ("glic".equals(k)) {
                JSONObject[] slots = glicToday(c, d, day);
                String vis = sc.optString("vis", "1111111");
                if (vis.length() < 7) vis = (vis + "1111111").substring(0, 7);
                for (int i = 0; i < slots.length; i++) {
                    if (i < vis.length() && vis.charAt(i) == '0') continue;
                    JSONObject r = slots[i]; if (r == null) continue;
                    JSONObject x = new JSONObject(r.toString());
                    x.put("day", day);
                    o.add(x);
                }
                return o;
            }
            JSONArray rows = d == null ? null : d.optJSONArray("rows");
            if ("med".equals(k)) {
                LinkedHashMap<String, int[]> days = medDayCounts(rows, f, sc.optJSONArray("mh"), day);
                List<String> keys = new ArrayList<>(days.keySet());
                Collections.sort(keys);
                for (String rd : keys) {
                    int[] ct = days.get(rd);
                    o.add(new JSONObject().put("day", rd).put("done", ct[0]).put("tot", ct[1]).put("mk", medDayMarks(rows, f, sc.optJSONArray("mh"), rd, day)));
                }
                return o;
            }
            if (rows != null) for (int i = 0; i < rows.length(); i++) {
                JSONObject r = rows.optJSONObject(i); if (r == null || !pass(r, k, f)) continue;
                o.add(r);
            }
        } catch (Exception ignored) {}
        return o;
    }
    static int todayIndex(List<JSONObject> items, String today) {
        if (items == null || today == null) return 0;
        int next = -1;
        for (int i = 0; i < items.size(); i++) {
            String d = items.get(i).optString("day");
            if (today.equals(d)) return i;
            if (next < 0 && d.compareTo(today) >= 0) next = i;
        }
        return next >= 0 ? next : 0;
    }
    static long itemId(String k, JSONObject r, int p) {
        if (r == null) return p;
        if ("med".equals(k)) return ("d:" + r.optString("day")).hashCode();
        if ("glic".equals(k)) return ("g:" + r.optInt("i")).hashCode();
        String id = r.optString("m"); if (id.length() == 0) id = r.optString("u"); if (id.length() == 0) id = r.optString("c");
        return (k + ":" + id + ":" + r.optString("t") + ":" + p).hashCode();
    }
    static RemoteViews itemView(Context c, int wid, String k, List<JSONObject> rows, int p) {
        RemoteViews it = new RemoteViews(c.getPackageName(), R.layout.sec_item);
        if (p < 0 || p >= rows.size()) return it;
        JSONObject r = rows.get(p), sc = cfg(c, wid);
        Themes th = Store.get(c, "th_" + wid) == null ? Themes.of("jad") : Themes.forWidget(c, wid);
        float fs = (float) Math.max(11, Math.min(20, sc.optInt("fs", 14)));
        String day = today();
        try {
            if ("med".equals(k)) {
                Context tc = Tr.ctx(c, sc.optString("lang", ""));
                String rd = r.optString("day");
                boolean isToday = day.equals(rd);
                it.setViewVisibility(R.id.si_box, View.GONE);
                it.setTextViewText(R.id.si_text, dayLabel(tc, rd));
                it.setTextColor(R.id.si_text, isToday ? th.acc : th.text);
                it.setTextViewTextSize(R.id.si_text, TypedValue.COMPLEX_UNIT_SP, fs);
                CharSequence dots = marksSpan(r.optJSONArray("mk"));
                it.setTextViewText(R.id.si_meta, dots);
                if (dots.length() == 0) {
                    it.setTextViewText(R.id.si_meta, r.optInt("done") + "/" + r.optInt("tot"));
                    it.setTextColor(R.id.si_meta, isToday ? th.acc : th.mut);
                }
                int nmk = r.optJSONArray("mk") == null ? 0 : r.optJSONArray("mk").length();
                it.setTextViewTextSize(R.id.si_meta, TypedValue.COMPLEX_UNIT_SP, nmk > 10 ? 10 : nmk > 6 ? 11 : Math.max(11, fs - 1));
                it.setOnClickFillInIntent(R.id.si_row, new Intent().putExtra("day", rd));
                return it;
            }
            if ("glic".equals(k)) {
                boolean has = r.has("v") && !r.isNull("v") && r.optInt("v") > 0;
                String tm = r.optString("tm"); if (tm.length() == 0) tm = r.optString("t");
                String lbl = tm; int colon = lbl.indexOf(':'); if (colon > 0) lbl = lbl.substring(0, colon).trim();
                it.setViewVisibility(R.id.si_box, View.GONE);
                it.setTextViewText(R.id.si_text, lbl); it.setTextColor(R.id.si_text, th.text);
                it.setTextViewTextSize(R.id.si_text, TypedValue.COMPLEX_UNIT_SP, fs);
                it.setTextViewText(R.id.si_meta, has ? (r.optInt("v") + " mg/dl") : "—");
                it.setTextColor(R.id.si_meta, has ? th.acc : th.mut);
                it.setTextViewTextSize(R.id.si_meta, TypedValue.COMPLEX_UNIT_SP, Math.max(10, fs - 2));
                int val = has ? r.optInt("v") : -1;
                it.setOnClickFillInIntent(R.id.si_row, new Intent().putExtra("day", r.optString("day", day)).putExtra("i", r.optInt("i")).putExtra("v", val).putExtra("lbl", lbl).putExtra("tm", tm));
                return it;
            }
            String txt = r.optString("t"), meta = "";
            boolean warn = false;
            if ("util".equals(k)) {
                String due = r.optString("due");
                meta = due.length() > 0 ? dm(due) + (r.optString("amt").length() > 0 ? "  " + r.optString("amt") : "") : "—";
                warn = r.optInt("late") > 0;
            } else {
                long at = r.optLong("rem");
                if (at > 0) { meta = dm(r.optString("rd")) + " " + r.optString("hm"); warn = at < System.currentTimeMillis(); }
            }
            it.setViewVisibility(R.id.si_box, View.GONE);
            it.setTextViewText(R.id.si_text, txt); it.setTextColor(R.id.si_text, th.text);
            it.setTextViewTextSize(R.id.si_text, TypedValue.COMPLEX_UNIT_SP, fs);
            it.setTextViewText(R.id.si_meta, meta); it.setTextColor(R.id.si_meta, warn ? th.danger : th.mut);
            it.setTextViewTextSize(R.id.si_meta, TypedValue.COMPLEX_UNIT_SP, Math.max(10, fs - 2));
        } catch (Exception e) {
            it.setTextViewText(R.id.si_text, r.optString("t"));
        }
        return it;
    }

    /** day -> [done, total] for visible medicines. Missing mh / empty person = show all (already-placed widgets). */
    static LinkedHashMap<String, int[]> medDayCounts(JSONArray rows, String person, JSONArray mh, String today) {
        LinkedHashMap<String, int[]> days = new LinkedHashMap<>();
        if (rows == null) return days;
        for (int i = 0; i < rows.length(); i++) {
            JSONObject r = rows.optJSONObject(i); if (r == null || !pass(r, "med", person) || hidden(r, mh)) continue;
            String rd = r.optString("day"); if (rd.length() == 0) rd = today;
            int[] ct = days.get(rd); if (ct == null) { ct = new int[]{0, 0}; days.put(rd, ct); }
            ct[1]++; if (r.optBoolean("d")) ct[0]++;
        }
        return days;
    }
    static boolean hidden(JSONObject r, JSONArray mh) {
        if (mh == null || mh.length() == 0) return false;
        String id = r.optString("m");
        for (int i = 0; i < mh.length(); i++) if (id.equals(mh.optString(i))) return true;
        return false;
    }
    static List<JSONObject> medDayRows(JSONArray rows, String person, JSONArray mh, String day) {
        List<JSONObject> o = new ArrayList<>();
        if (rows == null) return o;
        for (int i = 0; i < rows.length(); i++) {
            JSONObject r = rows.optJSONObject(i); if (r == null) continue;
            if (!pass(r, "med", person) || hidden(r, mh)) continue;
            String rd = r.optString("day"); if (rd.length() == 0) rd = today();
            if (day != null && !day.equals(rd)) continue;
            o.add(r);
        }
        return o;
    }
    /** 0 pending (white outline), 1 taken (green), 2 missed after that day's midnight (red). Time order. */
    static JSONArray medDayMarks(JSONArray rows, String person, JSONArray mh, String day, String today) {
        JSONArray o = new JSONArray();
        if (rows == null || day == null) return o;
        List<JSONObject> list = medDayRows(rows, person, mh, day);
        Collections.sort(list, (a, b) -> tmKey(a.optString("tm")).compareTo(tmKey(b.optString("tm"))));
        boolean past = today != null && day.compareTo(today) < 0;
        try {
            for (JSONObject r : list) o.put(r.optBoolean("d") ? 1 : (past ? 2 : 0));
        } catch (Exception ignored) {}
        return o;
    }
    static String tmKey(String tm) {
        if (tm == null) return "99:99";
        int h = 99, m = 99;
        for (int i = 0; i < tm.length(); i++) {
            if (tm.charAt(i) >= '0' && tm.charAt(i) <= '9') {
                int a = i; while (i < tm.length() && tm.charAt(i) >= '0' && tm.charAt(i) <= '9') i++;
                int n = 0; try { n = Integer.parseInt(tm.substring(a, i)); } catch (Exception ignored) {}
                if (i < tm.length() && tm.charAt(i) == ':') { h = n; i++;
                    int b = i; while (i < tm.length() && tm.charAt(i) >= '0' && tm.charAt(i) <= '9') i++;
                    try { m = Integer.parseInt(tm.substring(b, i)); } catch (Exception ignored) {}
                }
                break;
            }
        }
        return String.format(Locale.US, "%02d:%02d", h, m);
    }
    static final int MK_GREEN = 0xFF22A447, MK_RED = 0xFFFF5350, MK_WHITE = 0xFFFFFFFF;
    static CharSequence marksSpan(JSONArray mk) {
        if (mk == null || mk.length() == 0) return "";
        StringBuilder b = new StringBuilder();
        int n = mk.length();
        int[] st = new int[n];
        for (int i = 0; i < n; i++) {
            if (i > 0) b.append('\u2009');
            st[i] = mk.optInt(i);
            b.append(st[i] == 0 ? '\u25CB' : '\u25CF');
        }
        SpannableString s = new SpannableString(b);
        int pos = 0;
        for (int i = 0; i < n; i++) {
            if (i > 0) pos++;
            int col = st[i] == 1 ? MK_GREEN : st[i] == 2 ? MK_RED : MK_WHITE;
            s.setSpan(new ForegroundColorSpan(col), pos, pos + 1, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            pos++;
        }
        return s;
    }
        /** DD/MM/YYYY + weekday in the widget language */
    static String dayLabel(Context c, String day) {
        if (day == null || day.length() < 10) return "";
        String dm = day.substring(8, 10) + "/" + day.substring(5, 7) + "/" + day.substring(0, 4);
        try {
            Date d = new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(day);
            android.os.LocaleList ll = c.getResources().getConfiguration().getLocales();
            Locale loc = (ll != null && !ll.isEmpty()) ? ll.get(0) : Locale.getDefault();
            String w = new SimpleDateFormat("EEEE", loc).format(d);
            if (w.length() > 0) w = w.substring(0, 1).toUpperCase(loc) + w.substring(1);
            return dm + " · " + w;
        } catch (Exception e) { return dm; }
    }
    static boolean multiP(JSONArray rows) {
        String a = null; for (int i = 0; i < rows.length(); i++) { JSONObject r = rows.optJSONObject(i); if (r == null) continue; String p = r.optString("p"); if (a == null) a = p; else if (!a.equals(p)) return true; }
        return false;
    }
}
