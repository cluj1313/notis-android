package ro.cluj1313.notis;

import static org.junit.Assert.*;
import org.junit.Test;

public class MicOriginTest {
    @Test public void onlyNotisOrigin() {
        assertTrue(MainActivity.micOriginOk("https://cluj1313.github.io/"));
        assertTrue(MainActivity.micOriginOk("https://cluj1313.github.io"));
        assertFalse(MainActivity.micOriginOk("https://cluj1313.github.io.evil.com/"));
        assertFalse(MainActivity.micOriginOk("http://cluj1313.github.io/"));
        assertFalse(MainActivity.micOriginOk("https://evil.com/"));
        assertFalse(MainActivity.micOriginOk(null));
    }
}
