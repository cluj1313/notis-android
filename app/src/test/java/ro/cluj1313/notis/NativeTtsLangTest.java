package ro.cluj1313.notis;

import static org.junit.Assert.*;
import java.util.Locale;
import org.junit.Test;

public class NativeTtsLangTest {
    @Test public void matchesVoicesToAppLanguage() {
        assertTrue(NativeTts.sameLang(new Locale("fr", "FR"), NativeTts.loc("fr")));
        assertFalse(NativeTts.sameLang(new Locale("ro", "RO"), NativeTts.loc("en")));
        assertTrue(NativeTts.sameLang(new Locale("iw", "IL"), NativeTts.loc("he")));   // legacy Hebrew code
        assertTrue(NativeTts.sameLang(new Locale("in", "ID"), NativeTts.loc("id")));   // legacy Indonesian code
        assertTrue(NativeTts.sameLang(new Locale("zh", "TW"), NativeTts.loc("zh-Hant")));
        assertFalse(NativeTts.sameLang(new Locale("zh", "CN"), NativeTts.loc("zh-Hant")));
        assertEquals("ro", NativeTts.loc("").getLanguage());                            // default Romanian
    }
}
