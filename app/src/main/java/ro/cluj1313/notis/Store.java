package ro.cluj1313.notis;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.Normalizer;
import java.util.Locale;
import java.util.UUID;

/**
 * Snapshot pushed by the web app + a queue of changes made natively (widgets, alarms) that the web app
 * applies on resume (idempotent ops keyed by ids) and then acknowledges. The widgets always display
 * snapshot+queue, so nothing looks reverted while the queue is pending.
 * ops: t (toggle), ai (add item), ri (remove item), an (add note), al (set/cancel alarm), ar (alarm fired/rolled)
 */
final class Store {
    private static final String P = "notis";
    private Store() {}
    static SharedPreferences sp(Context c) { return c.getApplicationContext().getSharedPreferences(P, Context.MODE_PRIVATE); }

    static synchronized void saveSnapshot(Context c, String json) {
        try { new JSONObject(json); } catch (Exception e) { return; }
        sp(c).edit().putString("snap", json).commit();
    }

    static synchronized JSONArray pending(Context c) {
        try { return new JSONArray(sp(c).getString("pending", "[]")); } catch (Exception e) { return new JSONArray(); }
    }
    static synchronized String peekPending(Context c) { return pending(c).toString(); }
    static synchronized void ackPending(Context c, int k) {
        JSONArray a = pending(c), b = new JSONArray();
        for (int i = Math.max(0, k); i < a.length(); i++) b.put(a.opt(i));
        sp(c).edit().putString("pending", b.toString()).commit();
    }
    static synchronized void addOp(Context c, JSONObject o) {
        try { o.put("ts", System.currentTimeMillis()); } catch (Exception ignored) {}
        JSONArray a = pending(c); a.put(o);
        sp(c).edit().putString("pending", a.toString()).commit();
    }
    static String uid() {
        return Long.toString(System.currentTimeMillis(), 36) + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
    }

    static void toggle(Context c, String nid, String bid, String iid, boolean done) {
        try { JSONObject o = new JSONObject().put("op", "t").put("n", nid).put("i", iid).put("d", done); if (bid != null && bid.length() > 0) o.put("b", bid); addOp(c, o); } catch (Exception ignored) {}
    }
    static String addItem(Context c, String nid, String bid, String text) {
        String id = uid();
        try { JSONObject o = new JSONObject().put("op", "ai").put("n", nid).put("i", id).put("t", text); if (bid != null && bid.length() > 0) o.put("b", bid); addOp(c, o); } catch (Exception ignored) {}
        return id;
    }
    /** undo of a widget remove: same id comes back (web "ai" is idempotent by id) */
    static void readdItem(Context c, String nid, String bid, JSONObject item, int k) {
        addOp(c, readdOp(nid, bid, item, k));
    }
    static JSONObject readdOp(String nid, String bid, JSONObject item, int k) {
        JSONObject o = new JSONObject();
        try {
            o.put("op", "ai").put("n", nid).put("i", item.optString("i")).put("t", item.optString("t")).put("d", item.optBoolean("d")).put("x", item);
            if (k >= 0) o.put("k", k);
            if (bid != null && bid.length() > 0) o.put("b", bid);
        } catch (Exception ignored) {}
        return o;
    }
    static void sortLike(java.util.List<JSONObject> a, String mode) {
        final java.text.Collator col = java.text.Collator.getInstance(new java.util.Locale("ro")); col.setStrength(java.text.Collator.PRIMARY);
        a.sort((x, y) -> {
            String tx = x.optString("t").trim(), ty = y.optString("t").trim();
            boolean ex = tx.isEmpty(), ey = ty.isEmpty(); if (ex != ey) return ex ? 1 : -1;
            int r = 0;
            if ("alpha".equals(mode)) r = col.compare(tx, ty);
            else if ("created".equals(mode)) r = y.optString("c").compareTo(x.optString("c"));
            else if ("updated".equals(mode)) r = y.optString("u").compareTo(x.optString("u"));
            r = Integer.signum(r);
            return r != 0 ? r : Integer.compare(x.optInt("o"), y.optInt("o"));
        });
    }
    /** pure: Notes widget rows of a tab (+ undo row) */
    static java.util.List<JSONObject> noteRows(JSONObject s, String tab, JSONObject undo) {
        java.util.List<JSONObject> r = WidgetService.notesOf(s, tab);
        if (undo != null && "n".equals(undo.optString("k"))) {
            boolean back = false; for (JSONObject n : r) if (undo.optString("n").equals(n.optString("id"))) back = true;
            if (!back) try { r.add(Math.max(0, Math.min(r.size(), undo.optInt("p"))), new JSONObject().put("undo", true).put("id", undo.optString("n")).put("title", undo.optString("t"))); } catch (Exception ignored) {}
        }
        return r;
    }
    /** pure: the list widget's rows (open first, then done) with the undo row; skips/repairs bad items */
    static java.util.List<JSONObject> listRows(JSONObject l, JSONObject undo) {
        /* rows in exactly the app's order: per checklist block, open items then done items, each sorted like ciSort() */
        java.util.LinkedHashMap<String, java.util.List<JSONObject>> groups = new java.util.LinkedHashMap<>();
        java.util.Set<String> seen = new java.util.HashSet<>();
        JSONArray it = l == null ? null : l.optJSONArray("items");
        if (it != null) for (int k = 0; k < it.length(); k++) {
            JSONObject x = it.optJSONObject(k); if (x == null) continue;
            String id = x.optString("i", ""); if (id.length() == 0 || x.optBoolean("undo")) continue;
            String b = x.optString("b", "");
            if (!seen.add(b + "|" + id)) continue;
            JSONObject y = new JSONObject();
            try { y.put("i", id).put("t", x.optString("t", "")).put("d", x.optBoolean("d")).put("b", b).put("o", x.optInt("o", k)).put("c", x.optString("c", "")).put("u", x.optString("u", "")).put("k", k); } catch (Exception e) { continue; }
            java.util.List<JSONObject> g = groups.get(b); if (g == null) { g = new java.util.ArrayList<>(); groups.put(b, g); } g.add(y);
        }
        final String srt = l == null ? null : l.optString("srt", null);
        java.util.List<JSONObject> open = new java.util.ArrayList<>();
        for (java.util.List<JSONObject> g : groups.values()) {
            java.util.List<JSONObject> un = new java.util.ArrayList<>(), dn = new java.util.ArrayList<>();
            for (JSONObject y : g) (y.optBoolean("d") ? dn : un).add(y);
            if (srt != null) { sortLike(un, srt); sortLike(dn, srt); }
            else { java.util.Comparator<JSONObject> byK = (p1, p2) -> Integer.compare(p1.optInt("k"), p2.optInt("k")); un.sort(byK); dn.sort(byK); }
            open.addAll(un); open.addAll(dn);
        }
        if (l != null && undo != null && "i".equals(undo.optString("k")) && l.optString("id").equals(undo.optString("n"))
            && !seen.contains(undo.optString("b", "") + "|" + undo.optString("i"))) {
            try { open.add(Math.max(0, Math.min(open.size(), undo.optInt("p"))), new JSONObject().put("undo", true).put("i", undo.optString("i")).put("t", undo.optString("t"))); } catch (Exception ignored) {}
        }
        return open;
    }
    /** undo of "move to trash": web restores it (op "rn"); the copy keeps it visible in the widget until then */
    static void restoreNote(Context c, String nid, JSONObject copy) {
        try { JSONObject o = new JSONObject().put("op", "rn").put("n", nid); if (copy != null) o.put("note", copy); addOp(c, o); } catch (Exception ignored) {}
    }
    /** one-tap delete + 5 s "Anulează" row, per widget */
    /* 1.7.0: delete asks inline "Vrei să ștergi?  Nu  Da" on the row itself (replaces the 5 s ANULEAZĂ undo) */
    /** pure: picker group state — stored "0" = closed, anything else (incl. never set) = open */
    static String groupKey(boolean notes, String title) { return "pg_" + (notes ? "t_" : "l_") + (title == null ? "" : title); }
    static boolean groupOpen(String stored) { return !"0".equals(stored); }
    static final long ASK_MS = 60000;
    static void putAsk(Context c, int wid, JSONObject a) { try { a.put("ts", System.currentTimeMillis()); } catch (Exception ignored) {} put(c, "ask_" + wid, a.toString()); }
    static JSONObject getAsk(Context c, int wid) { String s = get(c, "ask_" + wid); return s == null ? null : askValid(s, System.currentTimeMillis()); }
    static void clearAsk(Context c, int wid) { put(c, "ask_" + wid, null); }
    /** pure: a pending question, or null when absent/garbled/expired */
    static JSONObject askValid(String s, long now) {
        try { JSONObject a = new JSONObject(s); long age = now - a.optLong("ts"); return age >= 0 && age < ASK_MS ? a : null; } catch (Exception e) { return null; }
    }
    /** pure: does this pending question concern this row? (list item: k=i,n,b,i — note: k=n,n) */
    static boolean askMatches(JSONObject a, String nid, String bid, String iid) {
        if (a == null || nid == null || !nid.equals(a.optString("n"))) return false;
        if (iid == null) return "n".equals(a.optString("k"));
        return "i".equals(a.optString("k")) && iid.equals(a.optString("i")) && (bid == null ? "" : bid).equals(a.optString("b", ""));
    }
    /** pure: rows with the asked one flagged "ask" (copies, inputs untouched) */
    static java.util.List<JSONObject> markAsk(java.util.List<JSONObject> rows, JSONObject a, String nid, boolean notes) {
        java.util.List<JSONObject> r = new java.util.ArrayList<>();
        for (JSONObject x : rows) {
            boolean m = notes ? askMatches(a, x.optString("id"), null, null) : askMatches(a, nid, x.optString("b", ""), x.optString("i"));
            if (m) { try { x = new JSONObject(x.toString()).put("ask", true); } catch (Exception ignored) {} }
            r.add(x);
        }
        return r;
    }
    static final long UNDO_MS = 5000;
    static void putUndo(Context c, int wid, JSONObject u) { try { u.put("ts", System.currentTimeMillis()); } catch (Exception ignored) {} put(c, "undo_" + wid, u.toString()); }
    static JSONObject getUndo(Context c, int wid) {
        String s = get(c, "undo_" + wid); if (s == null) return null;
        try { JSONObject u = new JSONObject(s); long age = System.currentTimeMillis() - u.optLong("ts"); return age >= 0 && age < UNDO_MS ? u : null; } catch (Exception e) { return null; }
    }
    static void removeItem(Context c, String nid, String bid, String iid) {
        try { JSONObject o = new JSONObject().put("op", "ri").put("n", nid).put("i", iid); if (bid != null && bid.length() > 0) o.put("b", bid); addOp(c, o); } catch (Exception ignored) {}
    }
    static String addNote(Context c, String tab, String text) {
        String id = uid();
        try { addOp(c, new JSONObject().put("op", "an").put("n", id).put("tab", tab == null ? "" : tab).put("text", text)); } catch (Exception ignored) {}
        return id;
    }
    /** note -> app trash (restorable there); applied by the web app as op "dn" */
    static void deleteNote(Context c, String nid) {
        try { addOp(c, new JSONObject().put("op", "dn").put("n", nid)); } catch (Exception ignored) {}
    }
    static boolean noteArmed(Context c, int wid, String nid) {
        String a = get(c, "narm_" + wid);
        if (a == null || !a.startsWith(nid + "|")) return false;
        try { return System.currentTimeMillis() - Long.parseLong(a.substring(a.indexOf('|') + 1)) < 5000; } catch (Exception e) { return false; }
    }
    static void setAlarm(Context c, String nid, long at, int repMin) {
        try { addOp(c, new JSONObject().put("op", "al").put("n", nid).put("a", at > 0 ? new JSONObject().put("at", at).put("rep", repMin) : JSONObject.NULL)); } catch (Exception ignored) {}
    }
    static void alarmFired(Context c, String nid, long at) {
        try { addOp(c, new JSONObject().put("op", "ar").put("n", nid).put("at", at)); } catch (Exception ignored) {}
    }

    static long roll(long at, int rep, long now) {
        if (rep <= 0 || at > now) return at;
        long st = rep * 60000L;
        return at + ((now - at + 1 + st - 1) / st) * st;
    }

    private static JSONObject byId(JSONArray a, String id) {
        if (a == null || id == null) return null;
        for (int i = 0; i < a.length(); i++) { JSONObject o = a.optJSONObject(i); if (o != null && id.equals(o.optString("id"))) return o; }
        return null;
    }

    /** snapshot with all pending native ops applied on top */
    static synchronized JSONObject snapshot(Context c) {
        JSONObject s;
        try { s = new JSONObject(sp(c).getString("snap", "{}")); } catch (Exception e) { s = new JSONObject(); }
        return overlay(s, pending(c));
    }

    /** pure: snapshot + pending ops (unit-tested on the JVM) */
    static JSONObject overlay(JSONObject s, JSONArray pend) {
        try {
            if (s.optJSONArray("lists") == null) s.put("lists", new JSONArray());
            if (s.optJSONArray("notes") == null) s.put("notes", new JSONArray());
            JSONArray lists = s.getJSONArray("lists"), notes = s.getJSONArray("notes");
            if (pend == null) pend = new JSONArray();
            for (int k = 0; k < pend.length(); k++) {
                JSONObject p = pend.optJSONObject(k); if (p == null) continue;
                String op = p.optString("op", "t"), nid = p.optString("n");
                if (op.equals("an")) {
                    if (byId(notes, nid) == null) {
                        String txt = p.optString("text"), first = txt.trim().split("\n")[0];
                        notes.put(new JSONObject().put("id", nid).put("tab", p.optString("tab")).put("type", "text").put("title", first).put("text", txt).put("upd", "9999-pending-" + p.optLong("ts")));
                    }
                    continue;
                }
                if (op.equals("dn")) { drop(notes, nid); drop(lists, nid); continue; }
                if (op.equals("rn")) { JSONObject cp = p.optJSONObject("note"); if (cp != null && byId(notes, nid) == null) notes.put(new JSONObject(cp.toString())); continue; }
                if (op.equals("al") || op.equals("ar")) {
                    JSONObject n = byId(notes, nid); if (n == null) continue;
                    if (op.equals("al")) { JSONObject a = p.optJSONObject("a"); if (a == null) n.remove("alarm"); else n.put("alarm", a); }
                    else {
                        JSONObject a = n.optJSONObject("alarm"); if (a == null) continue;
                        long at = a.optLong("at"); if (at <= 0 || at > p.optLong("at")) continue;
                        int rep = a.optInt("rep");
                        if (rep > 0) { long nx = roll(at, rep, Math.max(p.optLong("at"), at)); long u = a.optLong("until", 0); if (u > 0 && nx > u) n.remove("alarm"); else { a.put("at", nx); a.remove("snz"); } }
                        else n.remove("alarm");
                    }
                    continue;
                }
                JSONObject l = byId(lists, nid); if (l == null) continue;
                JSONArray it = l.optJSONArray("items"); if (it == null) { it = new JSONArray(); l.put("items", it); }
                String iid = p.optString("i"), bid = p.optString("b", "");
                int at = -1;
                for (int j = 0; j < it.length(); j++) { JSONObject x = it.optJSONObject(j); if (x != null && iid.equals(x.optString("i")) && (bid.length() == 0 || bid.equals(x.optString("b", "")))) { at = j; break; } }
                if (op.equals("ai")) { if (at < 0) {
                    /* undo carries the exact original item ("x") and its index ("k") */
                    JSONObject x = p.optJSONObject("x") != null ? new JSONObject(p.getJSONObject("x").toString()) : new JSONObject();
                    x.put("i", iid); x.put("t", p.optString("t", x.optString("t"))); x.put("d", p.has("d") ? p.optBoolean("d") : x.optBoolean("d"));
                    if (bid.length() > 0) x.put("b", bid);
                    if (!x.has("o")) { /* brand-new item: app appends it at the end, created/updated = now */
                        int mo = -1; for (int j = 0; j < it.length(); j++) { JSONObject y = it.optJSONObject(j); if (y != null && bid.equals(y.optString("b", ""))) mo = Math.max(mo, y.optInt("o", j)); }
                        x.put("o", mo + 1); String ts = iso(p.optLong("ts", System.currentTimeMillis())); x.put("c", ts); x.put("u", ts);
                    }
                    int kk = p.optInt("k", -1);
                    insertAt(it, kk < 0 ? it.length() : Math.min(kk, it.length()), x);
                } }
                else if (op.equals("ri")) { if (at >= 0) it.remove(at); }
                else if (at >= 0) { JSONObject y = it.getJSONObject(at); if (y.optBoolean("d") != p.optBoolean("d")) { y.put("d", p.optBoolean("d")); y.put("u", iso(p.optLong("ts", System.currentTimeMillis()))); } }
            }
        } catch (Exception ignored) {}
        return s;
    }

    static String iso(long ms) {
        java.text.SimpleDateFormat f = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US);
        f.setTimeZone(java.util.TimeZone.getTimeZone("UTC")); return f.format(new java.util.Date(ms));
    }
    static void insertAt(JSONArray a, int k, Object v) throws org.json.JSONException {
        for (int j = a.length(); j > k; j--) a.put(j, a.get(j - 1));
        a.put(k, v);
    }
    private static void drop(JSONArray a, String id) { for (int j = a.length() - 1; j >= 0; j--) { JSONObject x = a.optJSONObject(j); if (x != null && id.equals(x.optString("id"))) a.remove(j); } }

    // ---- per-widget settings ----
    static void put(Context c, String k, String v) { SharedPreferences.Editor e = sp(c).edit(); if (v == null) e.remove(k); else e.putString(k, v); e.commit(); }
    static String get(Context c, String k) { return sp(c).getString(k, null); }
    static void forget(Context c, int wid) { SharedPreferences.Editor e = sp(c).edit(); for (String p : new String[]{"w_", "th_", "tab_", "ex_", "arm_", "narm_", "undo_", "lay_", "rth_", "ask_"}) e.remove(p + wid); e.commit(); }
    /** pure: theme id stored for a radio index (clamped) */
    static String themeAt(int index) { return Themes.IDS[Math.max(0, Math.min(Themes.IDS.length - 1, index))]; }
    static void setChoice(Context c, int wid, String nid) { put(c, "w_" + wid, nid); }
    static String getChoice(Context c, int wid) { return get(c, "w_" + wid); }

    static boolean expanded(Context c, int wid, String nid) {
        try { JSONArray a = new JSONArray(sp(c).getString("ex_" + wid, "[]")); for (int i = 0; i < a.length(); i++) if (nid.equals(a.optString(i))) return true; } catch (Exception ignored) {}
        return false;
    }
    static synchronized void toggleExpanded(Context c, int wid, String nid) {
        try {
            JSONArray a = new JSONArray(sp(c).getString("ex_" + wid, "[]")), b = new JSONArray(); boolean had = false;
            for (int i = 0; i < a.length(); i++) { if (nid.equals(a.optString(i))) had = true; else b.put(a.optString(i)); }
            if (!had) b.put(nid);
            sp(c).edit().putString("ex_" + wid, b.toString()).commit();
        } catch (Exception ignored) {}
    }

    static String fold(String s) {
        if (s == null) return "";
        return Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).trim();
    }

    static String tabByName(JSONObject s, String prefix) {
        JSONArray tabs = s.optJSONArray("tabs");
        if (tabs != null) for (int i = 0; i < tabs.length(); i++) { JSONObject t = tabs.optJSONObject(i); if (t != null && fold(t.optString("name")).startsWith(prefix)) return t.optString("id"); }
        return null;
    }
    static String tabName(JSONObject s, String id) {
        JSONArray tabs = s.optJSONArray("tabs");
        if (tabs != null) for (int i = 0; i < tabs.length(); i++) { JSONObject t = tabs.optJSONObject(i); if (t != null && t.optString("id").equals(id)) return t.optString("name"); }
        return "";
    }
    static String defaultTab(JSONObject s) {
        String g = tabByName(s, "general"); if (g != null) return g;
        JSONArray tabs = s.optJSONArray("tabs"); return tabs != null && tabs.length() > 0 ? tabs.optJSONObject(0).optString("id") : "";
    }

    /** pure: picker entries for the list widget: auto + checklists grouped by tab (tabs in app order) */
    static java.util.List<JSONObject> pickLists(JSONObject s, String choice) {
        java.util.List<JSONObject> out = new java.util.ArrayList<>();
        JSONArray lists = s.optJSONArray("lists"), tabs = s.optJSONArray("tabs");
        boolean chosenExists = choice != null && byId(lists, choice) != null;
        try {
            out.add(new JSONObject().put("kind", "auto").put("title", "Automat · cea mai recentă listă").put("cur", !chosenExists));
            java.util.List<String> order = new java.util.ArrayList<>();
            if (tabs != null) for (int i = 0; i < tabs.length(); i++) { JSONObject t = tabs.optJSONObject(i); if (t != null) order.add(t.optString("id")); }
            if (lists != null) for (int i = 0; i < lists.length(); i++) { JSONObject l = lists.optJSONObject(i); if (l != null && !order.contains(l.optString("tab"))) order.add(l.optString("tab")); }
            for (String tab : order) {
                java.util.List<JSONObject> g = new java.util.ArrayList<>();
                if (lists != null) for (int i = 0; i < lists.length(); i++) {
                    JSONObject l = lists.optJSONObject(i); if (l == null || !tab.equals(l.optString("tab")) || l.optString("id").isEmpty()) continue;
                    JSONArray it = l.optJSONArray("items"); int n = 0, d = 0;
                    if (it != null) for (int k = 0; k < it.length(); k++) { JSONObject x = it.optJSONObject(k); if (x == null) continue; n++; if (x.optBoolean("d")) d++; }
                    g.add(new JSONObject().put("kind", "list").put("id", l.optString("id")).put("title", l.optString("title", "Listă")).put("cnt", "☑ " + d + "/" + n).put("cur", chosenExists && choice.equals(l.optString("id"))));
                }
                if (g.isEmpty()) continue;
                String nm = tabName(s, tab);
                out.add(new JSONObject().put("kind", "hdr").put("title", nm.isEmpty() ? "Alte" : nm));
                out.addAll(g);
            }
        } catch (Exception ignored) {}
        return out;
    }
    /** pure: picker entries for the Notes widget: every tab with its note count, current one marked */
    static java.util.List<JSONObject> pickTabs(JSONObject s, String current) {
        java.util.List<JSONObject> out = new java.util.ArrayList<>();
        JSONArray tabs = s.optJSONArray("tabs");
        if (tabs != null) for (int i = 0; i < tabs.length(); i++) {
            JSONObject t = tabs.optJSONObject(i); if (t == null || t.optString("id").isEmpty()) continue;
            int n = WidgetService.notesOf(s, t.optString("id")).size();
            try { out.add(new JSONObject().put("kind", "tab").put("id", t.optString("id")).put("title", t.optString("name")).put("cnt", n + (n == 1 ? " notiță" : " notițe")).put("cur", t.optString("id").equals(current))); } catch (Exception ignored) {}
        }
        return out;
    }

    /** chosen list, else the most recently updated checklist in the "Cumpărături" tab, else the most recent checklist */
    static JSONObject listFor(Context c, int wid) {
        JSONObject s = snapshot(c);
        JSONArray lists = s.optJSONArray("lists");
        if (lists == null || lists.length() == 0) return null;
        String want = getChoice(c, wid);
        JSONObject w = byId(lists, want); if (w != null) return w;
        String cump = tabByName(s, "cumparaturi");
        JSONObject best = null, bestAny = null;
        for (int i = 0; i < lists.length(); i++) {
            JSONObject l = lists.optJSONObject(i); if (l == null) continue;
            if (bestAny == null || l.optString("upd").compareTo(bestAny.optString("upd")) > 0) bestAny = l;
            if (cump != null && cump.equals(l.optString("tab")) && (best == null || l.optString("upd").compareTo(best.optString("upd")) > 0)) best = l;
        }
        return best != null ? best : bestAny;
    }

    static String notesTab(Context c, int wid, JSONObject s) {
        String t = get(c, "tab_" + wid);
        if (t != null && tabName(s, t).length() > 0) return t;
        return defaultTab(s);
    }
}
