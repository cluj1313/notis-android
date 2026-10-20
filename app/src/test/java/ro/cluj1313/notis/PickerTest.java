package ro.cluj1313.notis;

import static org.junit.Assert.*;
import java.util.List;
import org.json.JSONObject;
import org.junit.Test;

public class PickerTest {
    static JSONObject snap() throws Exception {
        return new JSONObject("{\"tabs\":[{\"id\":\"g\",\"name\":\"General\"},{\"id\":\"c\",\"name\":\"Cumpărături\"},{\"id\":\"e\",\"name\":\"Gol\"}],"
            + "\"lists\":[{\"id\":\"K\",\"tab\":\"c\",\"title\":\"KAUFLAND\",\"items\":[{\"i\":\"1\",\"d\":true},{\"i\":\"2\"},{\"i\":\"3\"}]},"
            + "{\"id\":\"R\",\"tab\":\"g\",\"title\":\"Listă rapidă\",\"items\":[{\"i\":\"a\"},{\"i\":\"b\"},\"bad\"]},"
            + "{\"id\":\"X\",\"tab\":\"zz\",\"title\":\"Orfană\",\"items\":[]},{\"tab\":\"g\",\"title\":\"fără id\"}],"
            + "\"notes\":[{\"id\":\"n1\",\"tab\":\"g\",\"type\":\"text\",\"text\":\"a\"},{\"id\":\"n2\",\"tab\":\"g\",\"type\":\"text\",\"text\":\"b\"},"
            + "{\"id\":\"n3\",\"tab\":\"c\",\"type\":\"text\",\"text\":\"c\"},{\"id\":\"K\",\"tab\":\"c\",\"type\":\"check\",\"text\":\"k\"}]}");
    }
    static String dump(List<JSONObject> r) { StringBuilder b = new StringBuilder(); for (JSONObject x : r) b.append(x.optString("kind")).append(':').append(x.optString("title")).append(x.has("cnt") ? "(" + x.optString("cnt") + ")" : "").append(x.optBoolean("cur") ? "*" : "").append(" | "); return b.toString(); }

    @Test public void listsGroupedByTabInAppOrder_autoCurrentByDefault() throws Exception {
        assertEquals("auto:Automat · cea mai recentă listă* | hdr:General | list:Listă rapidă(☑ 0/2) | hdr:Cumpărături | list:KAUFLAND(☑ 1/3) | hdr:Alte | list:Orfană(☑ 0/0) | ",
            dump(Store.pickLists(snap(), null)));
    }
    @Test public void chosenListMarked() throws Exception {
        String d = dump(Store.pickLists(snap(), "K"));
        assertTrue(d.contains("list:KAUFLAND(☑ 1/3)*")); assertFalse(d.contains("recentă listă*"));
    }
    @Test public void deletedChoiceFallsBackToAuto() throws Exception {
        assertTrue(dump(Store.pickLists(snap(), "gone")).startsWith("auto:Automat · cea mai recentă listă*"));
    }
    @Test public void emptySnapshotOnlyAuto() throws Exception {
        assertEquals("auto:Automat · cea mai recentă listă* | ", dump(Store.pickLists(new JSONObject(), null)));
    }
    @Test public void tabsWithNoteCounts() throws Exception {
        assertEquals("tab:General(2 notițe)* | tab:Cumpărături(1 notiță) | tab:Gol(0 notițe) | ", dump(Store.pickTabs(snap(), "g")));
        assertTrue(Store.pickTabs(new JSONObject(), "g").isEmpty());
    }
}
