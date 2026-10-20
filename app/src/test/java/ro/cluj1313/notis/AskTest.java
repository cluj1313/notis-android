package ro.cluj1313.notis;
import org.json.JSONObject;
import org.junit.Test;
import java.util.*;
import static org.junit.Assert.*;
public class AskTest {
    static JSONObject j(String s) { try { return new JSONObject(s); } catch (Exception e) { throw new RuntimeException(e); } }
    @Test public void expiry() {
        assertNotNull(Store.askValid("{\"k\":\"i\",\"n\":\"a\",\"i\":\"x\",\"ts\":1000}", 2000));
        assertNull(Store.askValid("{\"k\":\"i\",\"ts\":1000}", 1000 + Store.ASK_MS));
        assertNull(Store.askValid("garbage", 0));
        assertNull(Store.askValid("{\"ts\":5000}", 1000)); // clock went back
    }
    @Test public void matching() {
        JSONObject a = j("{\"k\":\"i\",\"n\":\"L\",\"b\":\"\",\"i\":\"x\"}");
        assertTrue(Store.askMatches(a, "L", null, "x"));
        assertTrue(Store.askMatches(a, "L", "", "x"));
        assertFalse(Store.askMatches(a, "L", "b2", "x"));
        assertFalse(Store.askMatches(a, "L", "", "y"));
        assertFalse(Store.askMatches(a, "M", "", "x"));
        assertFalse(Store.askMatches(a, "L", null, null)); // item question never deletes a note
        JSONObject n = j("{\"k\":\"n\",\"n\":\"N1\"}");
        assertTrue(Store.askMatches(n, "N1", null, null));
        assertFalse(Store.askMatches(n, "N1", "", "N1"));
        assertFalse(Store.askMatches(null, "N1", null, null));
    }
    @Test public void markAskFlagsOnlyThatRowAndKeepsInput() {
        List<JSONObject> rows = Arrays.asList(j("{\"i\":\"a\",\"t\":\"A\"}"), j("{\"i\":\"b\",\"t\":\"B\"}"));
        List<JSONObject> r = Store.markAsk(rows, j("{\"k\":\"i\",\"n\":\"L\",\"i\":\"b\"}"), "L", false);
        assertEquals(2, r.size());
        assertFalse(r.get(0).optBoolean("ask")); assertTrue(r.get(1).optBoolean("ask"));
        assertEquals("B", r.get(1).optString("t"));
        assertFalse(rows.get(1).has("ask"));
        List<JSONObject> notes = Arrays.asList(j("{\"id\":\"n1\"}"), j("{\"id\":\"n2\"}"));
        List<JSONObject> rn = Store.markAsk(notes, j("{\"k\":\"n\",\"n\":\"n1\"}"), null, true);
        assertTrue(rn.get(0).optBoolean("ask")); assertFalse(rn.get(1).optBoolean("ask"));
        assertFalse(Store.markAsk(rows, null, "L", false).get(1).optBoolean("ask"));
    }
}
