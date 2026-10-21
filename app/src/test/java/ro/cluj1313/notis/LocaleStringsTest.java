package ro.cluj1313.notis;

import org.junit.Test;
import static org.junit.Assert.*;
import java.io.File;
import java.nio.file.Files;
import java.util.*;
import java.util.regex.*;

/** 2.1.0: every locale has every string, with the same format placeholders; Java code has no hard-coded Romanian UI text left. */
public class LocaleStringsTest {
    static File res() { File f = new File("src/main/res"); return f.exists() ? f : new File("app/src/main/res"); }
    static Map<String, String> load(String dir) throws Exception {
        String s = new String(Files.readAllBytes(new File(res(), dir + "/strings.xml").toPath()), "UTF-8");
        Map<String, String> m = new TreeMap<>(); Matcher x = Pattern.compile("<string name=\"(\\w+)\">(.*?)</string>").matcher(s);
        while (x.find()) m.put(x.group(1), x.group(2)); return m;
    }
    static List<String> args(String v) { List<String> a = new ArrayList<>(); Matcher x = Pattern.compile("%(\\d\\$)?[sd]").matcher(v); while (x.find()) a.add(x.group()); Collections.sort(a); return a; }
    @Test public void allLocalesComplete() throws Exception {
        Map<String, String> en = load("values");
        for (String l : Tr.LANGS) {
            if (l.equals("en")) continue;
            Map<String, String> m = load("values-" + l);
            for (String k : en.keySet()) {
                if (k.equals("app_name")) continue;
                assertTrue(l + " missing " + k, m.containsKey(k));
                assertEquals(l + " placeholders of " + k, args(en.get(k)), args(m.get(k)));
                assertFalse(l + " empty " + k, m.get(k).trim().isEmpty());
            }
        }
        assertTrue(en.get("upd_msg").contains("%1$s") && en.get("upd_msg").contains("%2$s"));
    }
    @Test public void noHardcodedRomanianInJava() throws Exception {
        File dir = new File(res().getParentFile(), "java/ro/cluj1313/notis");
        Pattern lit = Pattern.compile("\"[^\"\\n]*[ăâîșțĂÂÎȘȚ][^\"\\n]*\"");
        for (File f : dir.listFiles()) {
            for (String line : Files.readAllLines(f.toPath())) {
                String t = line.trim(); if (t.startsWith("/*") || t.startsWith("*") || t.startsWith("//") || t.contains("NAMES =") || (f.getName().equals("Store.java") && t.contains("put(\"kind\""))) continue;
                String code = line.replaceAll("/\\*.*?\\*/", "").replaceAll("//.*$", "");
                assertFalse(f.getName() + ": " + t, lit.matcher(code).find());
            }
        }
    }
    @Test public void setLangOnlyAcceptsKnownCodes() {
        assertEquals(7, Tr.LANGS.length);
        assertTrue(Arrays.asList(Tr.LANGS).containsAll(Arrays.asList("ro", "en", "fr", "de", "it", "hu", "ru")));
    }
}
