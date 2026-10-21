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
}
