package ro.cluj1313.notis;

import static org.junit.Assert.*;
import java.io.File;
import java.nio.file.Files;
import org.junit.Test;

public class AutoBackupTest {
    @Test public void writesRotatesReadsAndIndexes() throws Exception {
        File d = Files.createTempDirectory("ab").toFile();
        for (int i = 0; i < 8; i++) assertTrue(AutoBackup.write(d, "auto-17925528" + (10000 + i), "{\"notisAuto\":1,\"id\":\"x\",\"ts\":\"2026-10-21T0" + i + ":00\",\"reason\":\"update\",\"from\":\"56|2.1.1\",\"to\":\"57|2.2.0\",\"raw\":{\"ns_notes\":\"[" + i + "]\"}}"));
        File[] l = AutoBackup.list(d);
        assertEquals(5, l.length);                                  // only the newest 5 kept
        assertEquals("auto-1792552810007.json", l[0].getName());
        assertTrue(AutoBackup.read(d, "auto-1792552810007").contains("[7]"));
        assertEquals("", AutoBackup.read(d, "auto-1792552810000"));  // rotated out
        String idx = AutoBackup.index(d);
        assertTrue(idx.startsWith("[{\"id\":\"auto-1792552810007\",\"ts\":\"2026-10-21T07:00\",\"reason\":\"update\",\"from\":\"56|2.1.1\",\"to\":\"57|2.2.0\""));
        assertFalse(AutoBackup.write(d, "../evil", "{}"));            // path traversal refused
        assertEquals("", AutoBackup.read(d, "../../x"));
        assertEquals(0, new File(d, "autobackup").listFiles((x, n) -> n.endsWith(".tmp")).length);
    }
}
