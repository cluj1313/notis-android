package ro.cluj1313.notis;

import static org.junit.Assert.*;
import org.junit.Test;

public class UpdaterTest {
    static final long H = 3600L * 1000, NOW = 1_800_000_000_000L;
    @Test public void sameVersionNoDialog() { assertFalse(Updater.should(132, "2.17.4", 132, "2.17.4", "", 0, NOW)); }
    @Test public void olderRemoteNoDialog() { assertFalse(Updater.should(131, "2.17.3", 132, "2.17.4", "", 0, NOW)); }
    @Test public void newerRemoteDialog() { assertTrue(Updater.should(133, "2.17.5", 132, "2.17.4", "", 0, NOW)); }
    @Test public void dismissedQuiet24h() {
        assertFalse(Updater.should(133, "2.17.5", 132, "2.17.4", "c133", NOW - 23 * H, NOW));
        assertTrue(Updater.should(133, "2.17.5", 132, "2.17.4", "c133", NOW - 25 * H, NOW));
        assertTrue(Updater.should(134, "2.17.6", 132, "2.17.4", "c133", NOW - H, NOW)); // next version asks again
    }
    @Test public void webBuildNumberNeverComparedWithVersionName() {
        // old bug: tag "v177" vs "2.17.3" looked newer. Fallback only uses a x.y.z name.
        assertEquals("", Updater.nameIn("v177"));
        assertFalse(Updater.should(0, Updater.nameIn("v177"), 0, "2.17.3", "", 0, NOW));
        assertFalse(Updater.should(0, Updater.nameIn("Notis 2.17.3"), 0, "2.17.3", "", 0, NOW));
        assertTrue(Updater.should(0, Updater.nameIn("Notis 2.17.4"), 0, "2.17.3", "", 0, NOW));
        assertFalse(Updater.should(0, Updater.nameIn("Notis 2.17.4"), 0, "2.17.4", "", 0, NOW));
    }
    @Test public void dismissedByNameFallback() { assertFalse(Updater.should(0, "2.17.5", 0, "2.17.4", "n2.17.5", NOW - H, NOW)); }
}
