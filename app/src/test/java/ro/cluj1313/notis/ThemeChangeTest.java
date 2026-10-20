package ro.cluj1313.notis;
import org.junit.Test;
import static org.junit.Assert.*;
public class ThemeChangeTest {
    @Test public void flipsOnEveryPaletteChange() {
        assertFalse(Store.needsFlip(null, "gold"));      // first draw
        assertFalse(Store.needsFlip("gold", "gold"));    // ordinary refresh keeps layout (scroll kept)
        assertTrue(Store.needsFlip("gold", "salon"));    // 1st change
        assertTrue(Store.needsFlip("salon", "dark"));    // 2nd change — the reported bug
        assertTrue(Store.needsFlip("dark", "gold"));     // 3rd change
    }
    @Test public void themeIndexClamped() {
        assertEquals(Themes.IDS[0], Store.themeAt(-1001));
        assertEquals(Themes.IDS[Themes.IDS.length - 1], Store.themeAt(99));
        for (int i = 0; i < Themes.IDS.length; i++) assertEquals(Themes.IDS[i], Store.themeAt(i));
    }
}
