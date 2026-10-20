package ro.cluj1313.notis;
import org.junit.Test;
import static org.junit.Assert.*;
public class PickGroupTest {
    @Test public void defaultsOpenAndClosedPersists() {
        assertTrue(Store.groupOpen(null));
        assertFalse(Store.groupOpen("0"));
        assertTrue(Store.groupOpen("1"));
    }
    @Test public void keysSeparatePerWidgetKindAndTab() {
        assertEquals("pg_l_Cumpărături", Store.groupKey(false, "Cumpărături"));
        assertNotEquals(Store.groupKey(false, "General"), Store.groupKey(true, "General"));
        assertNotEquals(Store.groupKey(false, "General"), Store.groupKey(false, "Listă rapidă ⚡"));
        assertEquals("pg_l_", Store.groupKey(false, null));
    }
}
