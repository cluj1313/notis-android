package ro.cluj1313.notis;

import static org.junit.Assert.*;
import java.nio.file.*;
import java.util.regex.*;
import org.junit.Test;

/** 2.3.3: icon choice uses activity-aliases; exactly one launcher entry by default, MainActivity keeps working for explicit intents. */
public class IconAliasTest {
    static Path P(String p) { Path a = Paths.get(p); return Files.exists(a) ? a : Paths.get("app/" + p); }
    static String mf() throws Exception { return new String(Files.readAllBytes(P("src/main/AndroidManifest.xml")), "UTF-8"); }
    @Test public void oneLauncherAliasEnabledByDefault() throws Exception {
        String s = mf(); Matcher m = Pattern.compile("<activity-alias([^>]*)>([\\s\\S]*?)</activity-alias>").matcher(s);
        int n = 0, en = 0; boolean newOn = false;
        while (m.find()) { n++; String a = m.group(1);
            assertTrue(a.contains("android:targetActivity=\".MainActivity\""));
            assertTrue(m.group(2).contains("category.LAUNCHER"));
            if (a.contains("android:enabled=\"true\"")) { en++; newOn = a.contains(".LauncherNew"); } }
        assertEquals(2, n); assertEquals(1, en); assertTrue(newOn);
    }
    @Test public void mainActivityNotALauncherAndNotDisabled() throws Exception {
        String s = mf(); int i = s.indexOf("android:name=\".MainActivity\""); int j = s.indexOf("</activity>", i);
        String act = s.substring(i, j);
        assertFalse(act.contains("category.LAUNCHER")); assertFalse(act.contains("android:enabled=\"false\""));
        assertTrue(act.contains("action.VIEW")); assertTrue(act.contains("action.SEND"));
    }
    @Test public void bothIconSetsExist() {
        for (String d : new String[]{"mdpi","hdpi","xhdpi","xxhdpi","xxxhdpi"})
            for (String f : new String[]{"ic_launcher","ic_launcher_round","ic_fg","ic_bg","ic_mono","icc_launcher","icc_launcher_round","icc_fg","icc_bg","icc_mono"})
                assertTrue(d + "/" + f, Files.exists(P("src/main/res/mipmap-" + d + "/" + f + ".png")));
    }
}
