package ro.cluj1313.notis;

import static org.junit.Assert.*;
import org.junit.Test;
import java.io.File;
import java.nio.file.Files;

/** 2.17.7: snooze 10 / 20 / 30 min math + notification wiring */
public class SnoozeTest {
    @Test public void minutes() {
        assertEquals(10, AlarmReceiver.snzMin(10)); assertEquals(20, AlarmReceiver.snzMin(20)); assertEquals(30, AlarmReceiver.snzMin(30));
        assertEquals(10, AlarmReceiver.snzMin(0)); assertEquals(10, AlarmReceiver.snzMin(-5)); assertEquals(10, AlarmReceiver.snzMin(999));
    }
    @Test public void exactFromNow() {
        long now = 1_790_000_123_456L;
        assertEquals(now + 600_000L, AlarmReceiver.snzAt(now, 10));
        assertEquals(now + 1_200_000L, AlarmReceiver.snzAt(now, 20));
        assertEquals(now + 1_800_000L, AlarmReceiver.snzAt(now, 30));
    }
    private static String src(String f) throws Exception { return new String(Files.readAllBytes(new File("src/main/java/ro/cluj1313/notis/" + f).toPath()), "UTF-8"); }
    @Test public void wiring() throws Exception {
        String a = src("AlarmReceiver.java");
        for (int m : new int[]{10, 20, 30}) assertTrue(a.contains("snoozePi(c, nid, text, " + m + ")"));
        assertEquals(0, a.split("\\.addAction\\(").length - 1); /* pills replace actions */
        assertTrue(a.contains("setOnClickPendingIntent(R.id.pstop, stopPi(c, nid))") && a.contains("DecoratedCustomViewStyle") && a.contains("setCustomHeadsUpContentView"));
        for (String l : new String[]{"notif_alarm", "notif_alarm_big"}) { String x = new String(Files.readAllBytes(new File("src/main/res/layout/" + l + ".xml").toPath()), "UTF-8");
            int i10 = x.indexOf("text=\"10\""), i20 = x.indexOf("text=\"20\""), i30 = x.indexOf("text=\"30\""), is = x.indexOf("text=\"STOP\"");
            assertTrue(i10 > 0 && i10 < i20 && i20 < i30 && i30 < is); assertTrue(x.indexOf("ntitle") < 0 || x.indexOf("ntitle") > is); }
        assertTrue(a.contains(".setDeleteIntent(stopPi(c, nid))"));
        assertTrue(a.contains("\"notis://snooze/\" + m + \"/\"")); /* distinct PendingIntents per choice */
        assertTrue(a.contains("AlarmSound.stop(); RingService.quit();"));
        String r = src("RingActivity.java");
        assertTrue(r.contains("R.string.snooze10") && r.contains("R.string.snooze20") && r.contains("R.string.snooze30") && r.contains("R.string.alarm_stop"));
    }
}
