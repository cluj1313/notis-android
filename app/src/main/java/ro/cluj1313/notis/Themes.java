package ro.cluj1313.notis;

import android.content.Context;
import org.json.JSONObject;

/** Widget palettes. "auto" follows the theme picked inside Notis (from the snapshot). */
final class Themes {
    static final String[] IDS = {"auto", "gold", "salon", "exc", "light", "dark", "jad", "lac"};
    static final String[] NAMES = {"Ca în aplicație", "Dark-Gold", "Salon Auriu", "Excalibur", "Light", "Dark (argintiu)", "Jad", "Lac Roșu"};

    final String id; final int bg, add, title, text, mut, acc, line, danger;
    private Themes(String id, int bg, int add, int title, int text, int mut, int acc, int line, int danger) {
        this.id = id; this.bg = bg; this.add = add; this.title = title; this.text = text; this.mut = mut; this.acc = acc; this.line = line; this.danger = danger;
    }

    static Themes of(String id) {
        switch (id) {
            case "salon": return new Themes(id, R.drawable.w_bg_salon, R.drawable.w_add_salon, 0xFF7A4F12, 0xFF1E1A16, 0xFF6B6157, 0xFF8A5A17, 0x40B8862B, 0xFFB3261E);
            case "exc":   return new Themes(id, R.drawable.w_bg_exc, R.drawable.w_add_exc, 0xFFC6F21A, 0xFFF2F4F0, 0xFFA7ADB3, 0xFFC6F21A, 0x40C6F21A, 0xFFFF6B6B);
            case "light": return new Themes(id, R.drawable.w_bg_light, R.drawable.w_add_light, 0xFF2F5372, 0xFF1A2633, 0xFF5B6B7A, 0xFF2F5372, 0x337D98AD, 0xFFB3261E);
            case "dark":  return new Themes(id, R.drawable.w_bg_dark, R.drawable.w_add_dark, 0xFFE6E8EA, 0xFFF2F2F2, 0xFF9A9A9A, 0xFFC9CDD1, 0x40C9CDD1, 0xFFFF6B6B);
            case "jad":   return new Themes(id, R.drawable.w_bg_jad, R.drawable.w_add_jad, 0xFF8FDCBC, 0xFFEAF5EF, 0xFF9FBFB2, 0xFF8FDCBC, 0x408FDCBC, 0xFFFF8A80);
            case "lac":   return new Themes(id, R.drawable.w_bg_lac, R.drawable.w_add_lac, 0xFFF0C27A, 0xFFFFEFF4, 0xFFD6A7B6, 0xFFF0C27A, 0x40F0C27A, 0xFFFFB4A8);
            case "color": return new Themes(id, R.drawable.w_bg_color, R.drawable.w_add_color, 0xFF3FD8FF, 0xFFEAF6FF, 0xFF8FB0C8, 0xFF3FD8FF, 0x403FD8FF, 0xFFFF6B6B);
            default:      return new Themes("gold", R.drawable.w_bg_gold, R.drawable.w_add_gold, 0xFFE8C98A, 0xFFF2EAD8, 0xFF8C8476, 0xFFE8C98A, 0x40C9A45C, 0xFFFF8A80);
        }
    }

    /** map Notis app theme -> widget palette */
    static String fromApp(String t) {
        if (t == null) return "color";
        switch (t) {
            case "dark": return "dark";
            case "light": return "light";
            case "vip": return "gold";
            case "jad": return "jad";
            case "lac": return "lac";
            case "exc": return "exc";
            case "salon": case "pap": case "cleo": case "tus": return "salon";
            default: return "color";
        }
    }

    static String nameOf(String id) { if ("color".equals(id)) return "Color (albastru)"; return nameOf0(id); }
    static String nameOf0(String id) { for (int i = 0; i < IDS.length; i++) if (IDS[i].equals(id)) return NAMES[i]; return NAMES[0]; }

    static Themes forWidget(Context c, int wid) {
        String t = Store.get(c, "th_" + wid);
        if (t == null) return of("gold");
        if (t.equals("auto")) return of(fromApp(Store.snapshot(c).optString("theme", "")));
        return of(t);
    }
}
