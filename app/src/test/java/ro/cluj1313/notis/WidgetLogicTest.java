package ro.cluj1313.notis;

import static org.junit.Assert.*;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;

public class WidgetLogicTest {
    /** the user's list as the app sends it (alpha order, raw index o) */
    static JSONObject snap() throws Exception {
        return new JSONObject("{\"v\":2,\"lists\":[{\"id\":\"L\",\"tab\":\"c\",\"title\":\"Listă rapidă\",\"srt\":\"alpha\",\"items\":["
            + "{\"i\":\"a\",\"t\":\"Apă\",\"d\":false,\"o\":0,\"c\":\"2026-10-01T00:00:00.000Z\",\"u\":\"2026-10-01T00:00:00.000Z\"},"
            + "{\"i\":\"b\",\"t\":\"Cablu + incarcator\",\"d\":false,\"o\":3,\"c\":\"2026-10-02T00:00:00.000Z\",\"u\":\"2026-10-02T00:00:00.000Z\"},"
            + "{\"i\":\"c\",\"t\":\"De uns rotița la hamster\",\"d\":false,\"o\":1,\"c\":\"2026-10-03T00:00:00.000Z\",\"u\":\"2026-10-03T00:00:00.000Z\"},"
            + "{\"i\":\"s\",\"t\":\"Servețele umede\",\"d\":false,\"o\":2,\"c\":\"2026-10-04T00:00:00.000Z\",\"u\":\"2026-10-04T00:00:00.000Z\"}]}],"
            + "\"notes\":[{\"id\":\"n1\",\"tab\":\"g\",\"type\":\"text\",\"title\":\"Birou\",\"text\":\"Birou\\ncapse\",\"upd\":\"2026-10-05\"},"
            + "{\"id\":\"n2\",\"tab\":\"g\",\"type\":\"text\",\"title\":\"Service\",\"text\":\"Service\",\"upd\":\"2026-10-06\"}]}");
    }
    static String texts(List<JSONObject> r) { StringBuilder b = new StringBuilder(); for (JSONObject x : r) b.append(x.optBoolean("undo") ? "UNDO:" : "").append(x.optString("t")).append(x.optBoolean("d") ? "[x]" : "").append(" | "); return b.toString(); }
    static JSONObject list(JSONObject s) throws Exception { return s.getJSONArray("lists").getJSONObject(0); }
    static JSONObject item(JSONObject l, String id) { JSONArray a = l.optJSONArray("items"); for (int i = 0; i < a.length(); i++) if (id.equals(a.optJSONObject(i).optString("i"))) return a.optJSONObject(i); return null; }

    @Test public void sameOrderAsApp() throws Exception {
        assertEquals("Apă | Cablu + incarcator | De uns rotița la hamster | Servețele umede | ", texts(Store.listRows(list(snap()), null)));
    }

    @Test public void removeThenUndoRestoresExactItemAndPosition() throws Exception {
        JSONObject l0 = list(snap()); JSONObject orig = new JSONObject(item(l0, "b").toString());
        String before = texts(Store.listRows(l0, null));
        JSONArray pend = new JSONArray().put(new JSONObject().put("op", "ri").put("n", "L").put("i", "b"));
        JSONObject l1 = list(Store.overlay(snap(), pend));
        assertEquals("Apă | De uns rotița la hamster | Servețele umede | ", texts(Store.listRows(l1, null)));
        JSONObject undo = new JSONObject().put("k", "i").put("n", "L").put("i", "b").put("b", "").put("t", "Cablu + incarcator").put("p", 1);
        assertEquals("Apă | UNDO:Cablu + incarcator | De uns rotița la hamster | Servețele umede | ", texts(Store.listRows(l1, undo)));
        pend.put(Store.readdOp("L", "", orig, 1));
        JSONObject l2 = list(Store.overlay(snap(), pend));
        assertEquals(before, texts(Store.listRows(l2, undo)));            /* undo row gone once the item is back */
        JSONObject back = item(l2, "b");
        assertEquals(orig.optString("t"), back.optString("t")); assertEquals(orig.optInt("o"), back.optInt("o"));
        assertEquals(orig.optString("c"), back.optString("c")); assertFalse(back.optBoolean("d"));
        assertEquals(4, l2.getJSONArray("items").length());
    }

    @Test public void undoOfCheckedItemKeepsCheck() throws Exception {
        JSONObject s = snap(); item(list(s), "c").put("d", true);
        JSONObject orig = new JSONObject(item(list(s), "c").toString());
        JSONArray pend = new JSONArray().put(new JSONObject().put("op", "ri").put("n", "L").put("i", "c")).put(Store.readdOp("L", "", orig, 2));
        JSONObject s2 = snap(); item(list(s2), "c").put("d", true);
        assertEquals("Apă | Cablu + incarcator | Servețele umede | De uns rotița la hamster[x] | ", texts(Store.listRows(list(Store.overlay(s2, pend)), null)));
    }

    @Test public void toggleMovesToDoneLikeApp() throws Exception {
        JSONArray pend = new JSONArray().put(new JSONObject().put("op", "t").put("n", "L").put("i", "a").put("d", true).put("ts", 1L));
        assertEquals("Cablu + incarcator | De uns rotița la hamster | Servețele umede | Apă[x] | ", texts(Store.listRows(list(Store.overlay(snap(), pend)), null)));
    }

    @Test public void addedItemSortedAndIdempotent() throws Exception {
        JSONObject op = new JSONObject().put("op", "ai").put("n", "L").put("i", "z").put("t", "Baterii").put("ts", 5L);
        JSONArray pend = new JSONArray().put(op).put(new JSONObject(op.toString()));
        List<JSONObject> r = Store.listRows(list(Store.overlay(snap(), pend)), null);
        assertEquals("Apă | Baterii | Cablu + incarcator | De uns rotița la hamster | Servețele umede | ", texts(r));
    }

    @Test public void badItemsNeverBreakTheList() throws Exception {
        JSONObject s = snap(); JSONArray it = list(s).getJSONArray("items");
        it.put("garbage").put(JSONObject.NULL).put(new JSONObject().put("t", "no id")).put(new JSONObject().put("i", "a").put("t", "dup"))
          .put(new JSONObject().put("i", "q").put("undo", true)).put(new JSONObject().put("i", "e").put("d", true));
        List<JSONObject> r = Store.listRows(list(s), null);
        assertEquals(5, r.size());
        assertEquals("Apă | Cablu + incarcator | De uns rotița la hamster | Servețele umede | [x] | ", texts(r));
        assertTrue(Store.listRows(null, null).isEmpty());
        assertTrue(Store.listRows(new JSONObject(), null).isEmpty());
    }

    @Test public void oldSnapshotWithoutSortKeepsAppOrder() throws Exception {
        JSONObject l = new JSONObject("{\"id\":\"L\",\"items\":[{\"i\":\"2\",\"t\":\"Zebra\"},{\"i\":\"1\",\"t\":\"Apă\",\"d\":true},{\"i\":\"3\",\"t\":\"Bec\"}]}");
        assertEquals("Zebra | Bec | Apă[x] | ", texts(Store.listRows(l, null)));
    }

    @Test public void mixBlocksStayGrouped() throws Exception {
        JSONObject l = new JSONObject("{\"id\":\"M\",\"srt\":\"alpha\",\"items\":[{\"i\":\"1\",\"b\":\"B1\",\"t\":\"Zahăr\",\"o\":0},{\"i\":\"2\",\"b\":\"B1\",\"t\":\"Apă\",\"o\":1},{\"i\":\"3\",\"b\":\"B2\",\"t\":\"Ac\",\"o\":0}]}");
        assertEquals("Apă | Zahăr | Ac | ", texts(Store.listRows(l, null)));
    }

    @Test public void noteTrashAndUndo() throws Exception {
        JSONObject copy = new JSONObject(snap().getJSONArray("notes").getJSONObject(0).toString());
        JSONArray pend = new JSONArray().put(new JSONObject().put("op", "dn").put("n", "n1"));
        JSONObject s1 = Store.overlay(snap(), pend);
        assertEquals(1, s1.getJSONArray("notes").length());
        JSONObject undo = new JSONObject().put("k", "n").put("n", "n1").put("t", "Birou").put("p", 1);
        List<JSONObject> rows = Store.noteRows(s1, "g", undo);
        assertEquals(2, rows.size()); assertTrue(rows.get(1).optBoolean("undo"));
        pend.put(new JSONObject().put("op", "rn").put("n", "n1").put("note", copy));
        JSONObject s2 = Store.overlay(snap(), pend);
        rows = Store.noteRows(s2, "g", undo);
        assertEquals(2, rows.size()); for (JSONObject r : rows) assertFalse(r.optBoolean("undo"));
        assertEquals("Birou\ncapse", rows.get(1).optString("text"));
    }
}
