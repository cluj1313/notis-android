package ro.cluj1313.notis;

import static org.junit.Assert.*;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.Test;

/** 2.25.8: picker preview must stay a static RemoteViews layout (no collection). A ListView in previewLayout is why 2.25.7 could not be placed. */
public class WidgetProviderXmlTest {
    static final String[] PROVIDERS = {"sw_med_info.xml", "sw_glic_info.xml", "sw_util_info.xml", "sw_crm_info.xml"};
    static final Pattern ATTR = Pattern.compile("android:(\\w+)=\"([^\"]+)\"");
    static final Pattern COLLECTION = Pattern.compile("<(ListView|GridView|StackView|AdapterView|GridLayout)\\b");

    static File res() {
        String[] c = {"src/main/res", "app/src/main/res", "../src/main/res", "notis-android-src/app/src/main/res"};
        for (String p : c) {
            File f = new File(p);
            if (new File(f, "xml/sw_med_info.xml").isFile()) return f;
        }
        fail("could not find app/src/main/res (cwd=" + new File(".").getAbsolutePath() + ")");
        return null;
    }
    static String read(File f) throws Exception {
        assertTrue("missing " + f, f.isFile());
        return new String(Files.readAllBytes(f.toPath()), StandardCharsets.UTF_8);
    }
    static String attr(String xml, String name) {
        Matcher m = ATTR.matcher(xml);
        while (m.find()) if (name.equals(m.group(1))) return m.group(2);
        return null;
    }

    @Test public void secPreviewHasNoCollectionAndIsNotTheLiveLayout() throws Exception {
        File res = res();
        String live = read(new File(res, "layout/sec_widget.xml"));
        assertTrue("live body must stay a scrollable ListView", live.contains("android:id=\"@+id/sw_list\"") && live.contains("<ListView"));
        for (String p : PROVIDERS) {
            String xml = read(new File(res, "xml/" + p));
            assertTrue(p + " should stay optional-config like List/Notes", String.valueOf(attr(xml, "widgetFeatures")).contains("configuration_optional"));
            assertEquals("@layout/sec_widget", attr(xml, "initialLayout"));
            String prev = attr(xml, "previewLayout");
            assertNotNull(p, prev);
            assertFalse(p + " preview must not be the live ListView layout", "@layout/sec_widget".equals(prev));
            assertTrue(p + " preview " + prev, prev.startsWith("@layout/sec_preview_"));
            String body = read(new File(res, "layout/" + prev.substring("@layout/".length()) + ".xml"));
            assertFalse(p + " preview contains a collection view the launcher may refuse", COLLECTION.matcher(body).find());
        }
        /* working List/Notes already follow this: static preview, ListView only in initialLayout */
        assertFalse(COLLECTION.matcher(read(new File(res, "layout/widget_preview.xml"))).find());
        assertFalse(COLLECTION.matcher(read(new File(res, "layout/notes_preview.xml"))).find());
        assertTrue(read(new File(res, "layout/widget.xml")).contains("<ListView"));
    }
}
