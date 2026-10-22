package ro.cluj1313.notis;

import static org.junit.Assert.*;
import java.util.Calendar;
import java.util.TimeZone;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;

/** 2.2.5: payment reminders repeat by months (repM, same day-of-month, clamped) or by days (rep = X*1440). */
public class PayReminderTest {
    static final TimeZone TZ = TimeZone.getTimeZone("Europe/Bucharest");
    static long t(int y, int m, int d, int h) { Calendar c = Calendar.getInstance(TZ); c.clear(); c.set(y, m - 1, d, h, 0, 0); return c.getTimeInMillis(); }
    @Test public void quarterlyKeepsDay() { assertEquals(t(2027, 1, 22, 9), Store.rollMonths(t(2026, 10, 22, 9), 3, 22, t(2026, 10, 22, 9) + 1, TZ)); }
    @Test public void clampsToMonthEndThenRecovers() {
        long feb = Store.rollMonths(t(2027, 1, 31, 9), 1, 31, t(2027, 1, 31, 10), TZ);
        assertEquals(t(2027, 2, 28, 9), feb);
        assertEquals(t(2027, 3, 31, 9), Store.rollMonths(feb, 1, 31, feb + 1, TZ));
    }
    @Test public void yearlyLeap() { assertEquals(t(2029, 2, 28, 9), Store.rollMonths(t(2028, 2, 29, 9), 12, 29, t(2028, 2, 29, 10), TZ)); }
    @Test public void skipsMissedPeriods() { assertEquals(t(2027, 4, 5, 9), Store.rollMonths(t(2026, 10, 5, 9), 1, 5, t(2027, 3, 20, 9), TZ)); }
    @Test public void futureUnchanged() { long a = t(2030, 1, 1, 9); assertEquals(a, Store.rollMonths(a, 1, 1, a - 5, TZ)); }
    @Test public void overlayRollsMonthly() throws Exception {
        long at = 1_800_000_000_000L;
        JSONObject s = new JSONObject().put("notes", new JSONArray().put(new JSONObject().put("id", "pay-x").put("alarm", new JSONObject().put("at", at).put("rep", 0).put("repM", 2))));
        JSONObject o = Store.overlay(s, new JSONArray().put(new JSONObject().put("op", "ar").put("n", "pay-x").put("at", at + 1000)));
        long nx = o.getJSONArray("notes").getJSONObject(0).getJSONObject("alarm").getLong("at");
        assertTrue(nx > at + 55L * 86_400_000L && nx < at + 63L * 86_400_000L);
    }
    @Test public void everyXDays() { long at = 1_800_000_000_000L; assertEquals(at + 45L * 86_400_000L, Store.roll(at, 45 * 1440, at + 1)); }
}
