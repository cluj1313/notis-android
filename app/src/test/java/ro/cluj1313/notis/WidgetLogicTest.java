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

    @Test public void editKeepsIdDonePositionAndAlarm() throws Exception {
        JSONObject s0 = snap(); s0.getJSONArray("notes").getJSONObject(0).put("alarm", new JSONObject().put("at", 123L).put("rep", 0));
        list(s0).getJSONArray("items").getJSONObject(1).put("d", true);
        JSONArray p = new JSONArray()
            .put(new JSONObject().put("op", "ei").put("n", "L").put("i", "b").put("t", "  Cablu USB-C ").put("d", true).put("ts", 1L))
            .put(new JSONObject().put("op", "ei").put("n", "L").put("i", "a").put("t", "   ").put("d", false))
            .put(new JSONObject().put("op", "en").put("n", "n1").put("text", "Birou nou\ncapse, hârtie"));
        JSONObject s = Store.overlay(s0, p);
        JSONObject b = item(list(s), "b");
        assertEquals("Cablu USB-C", b.optString("t")); assertTrue(b.optBoolean("d")); assertEquals(3, b.optInt("o"));
        assertEquals(1, list(s).getJSONArray("items").toString().split("\"i\":\"b\"").length - 1);
        assertEquals("Apă", item(list(s), "a").optString("t"));
        JSONObject n = s.getJSONArray("notes").getJSONObject(0);
        assertEquals("n1", n.optString("id")); assertEquals("Birou nou\ncapse, hârtie", n.optString("text")); assertEquals("Birou nou", n.optString("title"));
        assertEquals(123L, n.getJSONObject("alarm").optLong("at"));
        assertNotNull(Store.find(s, false, "L", "", "b")); assertNull(Store.find(s, false, "L", "", "zz")); assertEquals("n1", Store.find(s, true, "n1", null, null).optString("id"));
    }

    @Test public void medHiddenAndDayFilter() throws Exception {
        JSONArray rows = new JSONArray()
            .put(new JSONObject("{\"m\":\"a\",\"day\":\"2026-11-03\",\"t\":\"A\",\"p\":\"Ion\",\"d\":true}"))
            .put(new JSONObject("{\"m\":\"b\",\"day\":\"2026-11-03\",\"t\":\"B\",\"p\":\"Ion\",\"d\":false}"))
            .put(new JSONObject("{\"m\":\"a\",\"day\":\"2026-11-04\",\"t\":\"A\",\"p\":\"Ion\",\"d\":false}"))
            .put(new JSONObject("{\"m\":\"c\",\"day\":\"2026-11-03\",\"t\":\"C\",\"p\":\"Ana\",\"d\":false}"));
        JSONArray mh = new JSONArray().put("b");
        java.util.List<JSONObject> d = SecWidget.medDayRows(rows, "", mh, "2026-11-03");
        assertEquals(2, d.size());
        assertEquals("a", d.get(0).optString("m"));
        assertEquals("c", d.get(1).optString("m"));
        java.util.List<JSONObject> ion = SecWidget.medDayRows(rows, "Ion", null, "2026-11-03");
        assertEquals(2, ion.size());
        assertFalse(SecWidget.hidden(rows.getJSONObject(0), null));
        assertTrue(SecWidget.hidden(rows.getJSONObject(1), mh));
        assertFalse(SecWidget.hidden(rows.getJSONObject(0), new JSONArray()));
        assertEquals("", SecWidget.dayLabel(null, "x"));
        assertEquals("", SecWidget.dayLabel(null, null));
    }

    @Test public void alreadyPlacedConfigShowsDays() throws Exception {
        /* 2.25.6: widgets already on the home screen have no mh/lang in sc; that must not hide every row. */
        JSONArray rows = new JSONArray()
            .put(new JSONObject("{\"m\":\"a\",\"day\":\"2026-11-03\",\"t\":\"A\",\"p\":\"Ion\",\"d\":true}"))
            .put(new JSONObject("{\"m\":\"b\",\"day\":\"2026-11-03\",\"t\":\"B\",\"p\":\"Ion\",\"d\":false}"))
            .put(new JSONObject("{\"m\":\"c\",\"day\":\"2026-11-10\",\"t\":\"C\",\"p\":\"Ana\",\"d\":false}"));
        java.util.LinkedHashMap<String, int[]> all = SecWidget.medDayCounts(rows, "", null, "2026-11-10");
        assertEquals("empty person + missing mh must show every day", 2, all.size());
        assertArrayEquals(new int[]{1, 2}, all.get("2026-11-03"));
        assertArrayEquals(new int[]{0, 1}, all.get("2026-11-10"));
        java.util.LinkedHashMap<String, int[]> emptyMh = SecWidget.medDayCounts(rows, "", new JSONArray(), "2026-11-10");
        assertEquals(2, emptyMh.size());
        JSONArray hideAll = new JSONArray().put("a").put("b").put("c");
        assertTrue("only an explicit hidden list may empty the widget", SecWidget.medDayCounts(rows, "", hideAll, "2026-11-10").isEmpty());
    }
    @Test public void todayIndexPrefersTodayThenNext() throws Exception {
        java.util.List<org.json.JSONObject> rows = new java.util.ArrayList<>();
        rows.add(new JSONObject().put("day", "2026-11-08").put("done", 1).put("tot", 1));
        rows.add(new JSONObject().put("day", "2026-11-09").put("done", 0).put("tot", 1));
        rows.add(new JSONObject().put("day", "2026-11-10").put("done", 0).put("tot", 2));
        rows.add(new JSONObject().put("day", "2026-11-11").put("done", 0).put("tot", 1));
        assertEquals(2, SecWidget.todayIndex(rows, "2026-11-10"));
        assertEquals(3, SecWidget.todayIndex(rows, "2026-11-11"));
        /* today missing: first day on or after today */
        java.util.List<org.json.JSONObject> gap = new java.util.ArrayList<>();
        gap.add(new JSONObject().put("day", "2026-11-08"));
        gap.add(new JSONObject().put("day", "2026-11-12"));
        assertEquals(1, SecWidget.todayIndex(gap, "2026-11-10"));
        assertEquals(0, SecWidget.todayIndex(new java.util.ArrayList<>(), "2026-11-10"));
    }


    @Test public void medDayMarksOrderTakenGreenPastRedPendingWhite() throws Exception {
        JSONArray rows = new JSONArray()
            .put(new JSONObject().put("m","a").put("i",0).put("day","2026-11-09").put("tm","16:00").put("d",false).put("p","Gabi").put("t","Hepiflor"))
            .put(new JSONObject().put("m","b").put("i",0).put("day","2026-11-09").put("tm","13:00").put("d",true).put("p","Gabi").put("t","Axtrifiz"))
            .put(new JSONObject().put("m","b").put("i",0).put("day","2026-11-10").put("tm","13:00").put("d",false).put("p","Gabi").put("t","Axtrifiz"))
            .put(new JSONObject().put("m","a").put("i",0).put("day","2026-11-10").put("tm","16:00").put("d",false).put("p","Gabi").put("t","Hepiflor"))
            .put(new JSONObject().put("m","b").put("i",0).put("day","2026-11-11").put("tm","13:00").put("d",true).put("p","Gabi").put("t","Axtrifiz"));
        JSONArray past = SecWidget.medDayMarks(rows, "Gabi", null, "2026-11-09", "2026-11-10");
        /* time order 13:00 taken, 16:00 missed after midnight */
        assertEquals(2, past.length());
        assertEquals(1, past.getInt(0));
        assertEquals(2, past.getInt(1));
        JSONArray today = SecWidget.medDayMarks(rows, "Gabi", null, "2026-11-10", "2026-11-10");
        assertEquals(0, today.getInt(0));
        assertEquals(0, today.getInt(1));
        JSONArray fut = SecWidget.medDayMarks(rows, "Gabi", null, "2026-11-11", "2026-11-10");
        assertEquals(1, fut.getInt(0)); /* taken stays green in the future too */
        assertEquals("13:00", SecWidget.tmKey("13:00"));
        assertEquals("09:05", SecWidget.tmKey("9:05"));
        /* SpannableString is stubbed in JVM unit tests; length/order of marks is what we assert above */
        assertEquals(0, SecWidget.marksSpan(new JSONArray()).length());
    }

    @Test public void launchQueryIgnoresLauncherAndRecents() {
        /* 0x00100000 = FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY; ACTION_MAIN is a launcher/restore open */
        assertFalse(MainActivity.isExplicitLaunch("android.intent.action.MAIN", 0));
        assertFalse(MainActivity.isExplicitLaunch(null, 0x00100000));
        assertTrue(MainActivity.isExplicitLaunch(null, 0));
        assertTrue(MainActivity.isExplicitLaunch("android.intent.action.VIEW", 0));
    }
}
