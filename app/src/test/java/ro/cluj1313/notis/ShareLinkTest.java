package ro.cluj1313.notis;

import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class ShareLinkTest {
    @Test public void sharedText() {
        assertEquals("?ni=eyJ0Ijo_-x&nia=1", ShareLink.query("Piață\n☐ Roșii\n\nhttps://cluj1313.github.io/notis/?ni=eyJ0Ijo_-x"));
    }
    @Test public void viewUrlWithOtherParams() {
        assertEquals("?ni=abc&nia=1", ShareLink.query("https://cluj1313.github.io/notis/?x=1&ni=abc&nia=1"));
        assertEquals("?ni=abc&nia=1", ShareLink.query("https://cluj1313.github.io/notis?ni=abc"));
    }
    @Test public void rejectsOthers() {
        assertEquals("", ShareLink.query("https://evil.example/notis/?ni=abc"));
        assertEquals("", ShareLink.query("https://cluj1313.github.io/notis/"));
        assertEquals("", ShareLink.query(null));
    }
}
