package ro.cluj1313.notis;

import static org.junit.Assert.*;
import android.media.AudioManager;
import org.junit.Test;
import java.nio.file.Files;
import java.nio.file.Paths;

/** 2.18.0: alarm volume curve + silent / vibrate mode decision + single snooze time */
public class AlarmVolSilentTest {
    @Test public void normalRings() { assertEquals(0, AlarmSound.mode(AudioManager.RINGER_MODE_NORMAL, false)); }
    @Test public void vibrateModeVibratesOnly() { assertEquals(1, AlarmSound.mode(AudioManager.RINGER_MODE_VIBRATE, false)); }
    @Test public void silentModeNoSound() { assertEquals(2, AlarmSound.mode(AudioManager.RINGER_MODE_SILENT, false)); }
    @Test public void overrideRingsInSilentAndVibrate() {
        assertEquals(0, AlarmSound.mode(AudioManager.RINGER_MODE_SILENT, true));
        assertEquals(0, AlarmSound.mode(AudioManager.RINGER_MODE_VIBRATE, true)); }
    @Test public void gainCurve() {
        assertEquals(0f, AlarmSound.gain(0), 1e-6); assertEquals(1f, AlarmSound.gain(100), 1e-6);
        assertEquals(0.36f, AlarmSound.gain(60), 1e-4); assertEquals(1f, AlarmSound.gain(250), 1e-6); assertEquals(0f, AlarmSound.gain(-5), 1e-6);
        assertTrue(AlarmSound.gain(60) < AlarmSound.gain(100)); }
    @Test public void snoozeExactlyLater() { long now = 1_000_000L; assertEquals(now + 600000L, AlarmReceiver.snzAt(now, 10)); assertEquals(now + 1800000L, AlarmReceiver.snzAt(now, 30)); }
    static String src(String f) throws Exception { return new String(Files.readAllBytes(Paths.get("src/main/java/ro/cluj1313/notis/" + f)), "UTF-8"); }
    @Test public void wiring() throws Exception {
        String r = src("AlarmReceiver.java"), s = src("AlarmSound.java"), z = src("Scheduler.java");
        assertTrue("snooze fire consumed once", r.contains("if (Store.get(c, \"snz_\" + nid) == null) return;"));
        assertTrue("original occurrence silent while snooze pending", r.contains("!MainActivity.foreground && !snzPending"));
        assertTrue("own player always (volume/silent)", r.indexOf("RingService.start(c, nid.hashCode(), build(c, CH2") > 0 && !r.contains("if (!AlarmSound.isDefault(c) && AlarmSound.readable"));
        assertTrue("volume applied", s.contains("p.setVolume(g, g)"));
        assertTrue("ringer mode checked before playing", s.contains("int md = mode(c); if (md != 0)"));
        assertTrue("old snooze cancelled", z.contains("FLAG_NO_CREATE); if (o != null)"));
    }
}
