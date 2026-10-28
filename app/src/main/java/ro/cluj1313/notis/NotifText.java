package ro.cluj1313.notis;

/** 2.12.11: notification text = ONE emoji + main thing once in the title, details once in the body.
 *  Pure (JVM-testable). Applied at display time, so alarms scheduled by older versions render the same way.
 *  "💊 Fosfomicină · Seară 00:30 — Gabi" → title "💊 Fosfomicină", body "Seară 00:30 · Gabi". */
final class NotifText {
    private NotifText() {}

    static boolean isMark(int cp) { return cp == 0xFE0F || cp == 0xFE0E || cp == 0x200D || (cp >= 0x1F3FB && cp <= 0x1F3FF) || cp == 0x20E3; }

    /** leading emoji/symbols of s: [firstEmoji, rest]; firstEmoji may be "" */
    static String[] lead(String s) {
        int i = 0, n = s.length(); String first = "";
        while (i < n) {
            int cp = s.codePointAt(i);
            if (Character.isLetterOrDigit(cp) || cp == '(' || cp == '"' || cp == '\'' || cp == '„' || cp == '[' || cp == '#' || cp == '+' || cp == '-') break;
            if ((first.isEmpty() || "⏰".equals(emoji(first))) && !Character.isWhitespace(cp) && !isMark(cp) && cp >= 0x2000) first = new String(Character.toChars(cp));
            i += Character.charCount(cp);
        }
        return new String[]{first, s.substring(i).trim()};
    }

    static String emoji(String e) {
        if (e.isEmpty() || "⏰".equals(e) || "📞".equals(e) || "🔔".equals(e) || "⏱".equals(e)) return "⏰";
        return e;
    }

    /** body without anything that repeats the title */
    static String clean(String core, String body) {
        StringBuilder o = new StringBuilder();
        for (String l : body.split("\n")) {
            String t = lead(l.trim())[1];
            if (t.isEmpty() && l.trim().isEmpty()) { continue; }
            if (!core.isEmpty() && t.equals(core)) continue;
            if (!core.isEmpty() && t.startsWith(core + " ")) { t = t.substring(core.length()).replaceFirst("^\\s*[·—\\-:]?\\s*", ""); if (t.isEmpty()) continue; l = t; }
            if (o.length() > 0) o.append('\n');
            o.append(l.trim());
        }
        return o.toString();
    }

    /** text = the alarm payload (note text / medicine / CRM line) → {title, body} */
    static String[] split(String text) {
        String s = text == null ? "" : text.trim();
        int nl = s.indexOf('\n');
        String first = nl < 0 ? s : s.substring(0, nl).trim(), rest = nl < 0 ? "" : s.substring(nl + 1);
        String[] L = lead(first); String em = emoji(L[0]), core = L[1], det = "";
        int d = core.lastIndexOf(" — "); String who = "";
        if (d > 0) { who = core.substring(d + 3).trim(); core = core.substring(0, d).trim(); }
        int p = core.indexOf(" · ");
        if (p > 0) { det = core.substring(p + 3).trim(); core = core.substring(0, p).trim(); }
        if (!who.isEmpty()) det = det.isEmpty() ? who : det + " · " + who;
        if (core.isEmpty()) core = "Notis";
        String body = clean(core, rest);
        if (!det.isEmpty()) body = body.isEmpty() ? det : det + "\n" + body;
        return new String[]{em + " " + core, body};
    }

    /** news / other already-split texts: keep the title, drop a body that repeats it */
    static String body(String title, String body) {
        String c = lead(title == null ? "" : title.trim())[1];
        return clean(c, body == null ? "" : body);
    }
}
