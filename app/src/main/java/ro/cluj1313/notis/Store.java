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
    static void readdItem(Context c, String nid, String bid, String iid, String text, boolean done) {
        try { JSONObject o = new JSONObject().put("op", "ai").put("n", nid).put("i", iid).put("t", text); if (bid != null && bid.length() > 0) o.put("b", bid); addOp(c, o);
            if (done) toggle(c, nid, bid, iid, true); } catch (Exception ignored) {}
    }
    /** undo of "move to trash": web restores it (op "rn"); the copy keeps it visible in the widget until then */
    static void restoreNote(Context c, String nid, JSONObject copy) {
        try { JSONObject o = new JSONObject().put("op", "rn").put("n", nid); if (copy != null) o.put("note", copy); addOp(c, o); } catch (Exception ignored) {}
    }
    /** one-tap delete + 5 s "Anulează" row, per widget */
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
        try {
            if (s.optJSONArray("lists") == null) s.put("lists", new JSONArray());
            if (s.optJSONArray("notes") == null) s.put("notes", new JSONArray());
            JSONArray lists = s.getJSONArray("lists"), notes = s.getJSONArray("notes"), pend = pending(c);
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
                if (op.equals("ai")) { if (at < 0) { JSONObject x = new JSONObject().put("i", iid).put("t", p.optString("t")).put("d", false); if (bid.length() > 0) x.put("b", bid); it.put(x); } }
                else if (op.equals("ri")) { if (at >= 0) it.remove(at); }
                else if (at >= 0) it.getJSONObject(at).put("d", p.optBoolean("d"));
            }
        } catch (Exception ignored) {}
        return s;
    }

    private static void drop(JSONArray a, String id) { for (int j = a.length() - 1; j >= 0; j--) { JSONObject x = a.optJSONObject(j); if (x != null && id.equals(x.optString("id"))) a.remove(j); } }

    // ---- per-widget settings ----
    static void put(Context c, String k, String v) { SharedPreferences.Editor e = sp(c).edit(); if (v == null) e.remove(k); else e.putString(k, v); e.commit(); }
    static String get(Context c, String k) { return sp(c).getString(k, null); }
    static void forget(Context c, int wid) { SharedPreferences.Editor e = sp(c).edit(); for (String p : new String[]{"w_", "th_", "tab_", "ex_", "arm_", "narm_", "undo_"}) e.remove(p + wid); e.commit(); }
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
