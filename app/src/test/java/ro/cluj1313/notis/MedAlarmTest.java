package ro.cluj1313.notis;

import static org.junit.Assert.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;

/** 2.2.3: medicine doses arrive as snapshot notes with rep=1440 (daily) or rep=X*60; after firing they roll to the next dose. */
public class MedAlarmTest {
    @Test public void dailyDoseRollsToTomorrow() throws Exception {
        long at = 1_800_000_000_000L;
        JSONObject s = new JSONObject().put("notes", new JSONArray().put(new JSONObject().put("id", "med-a1-0").put("alarm", new JSONObject().put("at", at).put("rep", 1440))));
        JSONArray pend = new JSONArray().put(new JSONObject().put("op", "ar").put("n", "med-a1-0").put("at", at + 2000));
        JSONObject o = Store.overlay(s, pend);
        assertEquals(at + 86_400_000L, o.getJSONArray("notes").getJSONObject(0).getJSONObject("alarm").getLong("at"));
    }
    @Test public void every4hRolls() {
        long at = 1_800_000_000_000L;
        assertEquals(at + 4 * 3_600_000L, Store.roll(at, 240, at + 1));
    }
    @Test public void oneShotSnoozeIsDropped() throws Exception {
        long at = 1_800_000_000_000L;
        JSONObject s = new JSONObject().put("notes", new JSONArray().put(new JSONObject().put("id", "med-a1-0-z").put("alarm", new JSONObject().put("at", at).put("rep", 0))));
        JSONObject o = Store.overlay(s, new JSONArray().put(new JSONObject().put("op", "ar").put("n", "med-a1-0-z").put("at", at)));
        assertNull(o.getJSONArray("notes").getJSONObject(0).optJSONObject("alarm"));
    }
}
