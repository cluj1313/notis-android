package ro.cluj1313.notis;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Extracts a shared-note query ("?ni=...&nia=1") from a Notis link or from shared text. */
final class ShareLink {
    private static final Pattern P = Pattern.compile("https://cluj1313\\.github\\.io/notis/?\\?(?:\\S*?[?&])?ni=([A-Za-z0-9_\\-]+)");
    private ShareLink() {}
    static String query(String s) {
        if (s == null) return "";
        Matcher m = P.matcher(s);
        return m.find() ? "?ni=" + m.group(1) + "&nia=1" : "";
    }
}
