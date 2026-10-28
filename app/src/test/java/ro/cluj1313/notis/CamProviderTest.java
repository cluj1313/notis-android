package ro.cluj1313.notis;

import static org.junit.Assert.*;
import org.junit.Test;

public class CamProviderTest {
    @Test public void onlyOwnPhotoNames() {
        assertEquals("photo-123.jpg", CamProvider.safe("photo-123.jpg"));
        assertNull(CamProvider.safe("../shared_prefs/x.xml"));
        assertNull(CamProvider.safe("photo-1.jpg/../../a"));
        assertNull(CamProvider.safe(null));
    }
    @Test public void quickRecordAudioNames() {
        assertEquals("rec-1700000000000.m4a", CamProvider.safe("rec-1700000000000.m4a"));
        assertEquals("rec-1.webm", CamProvider.safe("rec-1.webm"));
        assertNull(CamProvider.safe("rec-1.mp3"));
        assertNull(CamProvider.safe("rec-1.m4a/../../x"));
        assertNull(CamProvider.safe("rec-a.m4a"));
        assertEquals("audio/mp4", CamProvider.type("rec-1.m4a"));
        assertEquals("audio/webm", CamProvider.type("rec-1.webm"));
        assertEquals("image/jpeg", CamProvider.type("photo-1.jpg"));
    }
}
