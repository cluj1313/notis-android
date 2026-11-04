package ro.cluj1313.notis;

import static org.junit.Assert.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.Test;

public class WeeklyBackupTest {
    @Test public void names() {
        assertTrue(WeeklyBackup.validName("notis-autobackup-2026-11-04.json"));
        assertFalse(WeeklyBackup.validName("notis-backup-2026-11-04.json"));
        assertFalse(WeeklyBackup.validName("../notis-autobackup-2026-11-04.json"));
        assertFalse(WeeklyBackup.validName("notis-autobackup-2026-11-04 (1).json"));
        assertTrue(WeeklyBackup.ours("notis-autobackup-2026-11-04 (1).json"));
        assertFalse(WeeklyBackup.ours("notis-autobackup-2026-11-04.json.bak"));
    }
    @Test public void keepsLastFour() {
        List<String> n = new ArrayList<>();
        for (String d : new String[]{"2026-10-07", "2026-10-14", "2026-10-21", "2026-10-28"}) n.add("notis-autobackup-" + d + ".json");
        assertTrue(WeeklyBackup.toDelete(n, 4).isEmpty());
        n.add("notis-autobackup-2026-11-04.json");
        assertEquals(Arrays.asList("notis-autobackup-2026-10-07.json"), WeeklyBackup.toDelete(n, 4));
    }
    @Test public void neverTouchesUserFiles() {
        List<String> n = new ArrayList<>(Arrays.asList("notis-backup-2020-01-01T00-00-00.json", "my.json", "notis-seif-2020-01-01.json",
            "notis-autobackup-2026-10-01.json", "notis-autobackup-2026-10-08.json", "notis-autobackup-2026-10-15.json", "notis-autobackup-2026-10-22.json", "notis-autobackup-2026-10-29.json", "notis-autobackup-2026-11-05.json"));
        List<String> d = WeeklyBackup.toDelete(n, 4);
        assertEquals(Arrays.asList("notis-autobackup-2026-10-08.json", "notis-autobackup-2026-10-01.json"), d);
    }
}
