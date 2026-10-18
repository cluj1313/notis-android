package ro.cluj1313.notis;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.Normalizer;

/** Snapshot of the web app's checklists + a queue of widget toggles not yet applied by the web app. */
final class Store {
    private static final String P = "notis";
    private Store() {}
    private static SharedPreferences sp(Context c) { return c.getApplicationContext().getSharedPreferences(P, Context.MODE_PRIVATE); }

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

    static synchronized void toggle(Context c, String nid, String bid, String iid, boolean done) {
        try {
            JSONArray a = pending(c);
            JSONObject o = new JSONObject();
            o.put("n", nid); if (bid != null && bid.length() > 0) o.put("b", bid); o.put("i", iid); o.put("d", done); o.put("ts", System.currentTimeMillis());
            a.put(o);
            sp(c).edit().putString("pending", a.toString()).commit();
        } catch (Exception ignored) {}
    }

    /** snapshot with the pending widget toggles applied on top, so the widget never shows a stale state */
    static synchronized JSONObject snapshot(Context c) {
        JSONObject s;
        try { s = new JSONObject(sp(c).getString("snap", "{}")); } catch (Exception e) { s = new JSONObject(); }
        JSONArray pend = pending(c), lists = s.optJSONArray("lists");
        if (lists == null) return s;
        for (int k = 0; k < pend.length(); k++) {
            JSONObject p = pend.optJSONObject(k); if (p == null) continue;
            for (int i = 0; i < lists.length(); i++) {
                JSONObject l = lists.optJSONObject(i);
                if (l == null || !p.optString("n").equals(l.optString("id"))) continue;
                JSONArray it = l.optJSONArray("items"); if (it == null) continue;
                for (int j = 0; j < it.length(); j++) {
                    JSONObject x = it.optJSONObject(j);
                    if (x != null && p.optString("i").equals(x.optString("i")) && p.optString("b", "").equals(x.optString("b", "")))
                        try { x.put("d", p.optBoolean("d")); } catch (Exception ignored) {}
                }
            }
        }
        return s;
    }

    static void setChoice(Context c, int wid, String nid) {
        SharedPreferences.Editor e = sp(c).edit();
        if (nid == null) e.remove("w_" + wid); else e.putString("w_" + wid, nid);
        e.commit();
    }
    static String getChoice(Context c, int wid) { return sp(c).getString("w_" + wid, null); }

    static String fold(String s) {
        if (s == null) return "";
        return Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase().trim();
    }

    /** chosen list, else the most recently updated checklist in the "Cumpărături" tab, else the most recent checklist */
    static JSONObject listFor(Context c, int wid) {
        JSONObject s = snapshot(c);
        JSONArray lists = s.optJSONArray("lists"), tabs = s.optJSONArray("tabs");
        if (lists == null || lists.length() == 0) return null;
        String want = getChoice(c, wid);
        if (want != null) for (int i = 0; i < lists.length(); i++) { JSONObject l = lists.optJSONObject(i); if (l != null && want.equals(l.optString("id"))) return l; }
        String cump = null;
        if (tabs != null) for (int i = 0; i < tabs.length(); i++) { JSONObject t = tabs.optJSONObject(i); if (t != null && fold(t.optString("name")).startsWith("cumparaturi")) { cump = t.optString("id"); break; } }
        JSONObject best = null, bestAny = null;
        for (int i = 0; i < lists.length(); i++) {
            JSONObject l = lists.optJSONObject(i); if (l == null) continue;
            if (bestAny == null || l.optString("upd").compareTo(bestAny.optString("upd")) > 0) bestAny = l;
            if (cump != null && cump.equals(l.optString("tab")) && (best == null || l.optString("upd").compareTo(best.optString("upd")) > 0)) best = l;
        }
        return best != null ? best : bestAny;
    }
}
