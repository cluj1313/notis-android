package ro.cluj1313.notis;

import android.content.Context;
import android.content.res.Configuration;
import java.util.Locale;

/** 2.1.0: native strings follow the language chosen in the app (sent via NotisNative.setLang), else the phone language. */
final class Tr {
    static final String[] LANGS = {"ro", "en", "fr", "de", "it", "hu", "ru", "es", "pt", "pt-BR", "pl", "tr", "uk", "ar", "he", "fa", "zh-Hans", "zh-Hant",
        "ja", "ko", "hi", "bn", "id", "ms", "vi", "th", "nl", "sv", "no", "da", "fi", "et", "lv", "lt", "cs", "sk", "sl", "hr", "sr", "bg", "mk", "sq", "el", "ca"};
    static String lang(Context c) { return Store.sp(c).getString("lang", ""); }
    static boolean setLang(Context c, String l) {
        boolean ok = false; for (String x : LANGS) if (x.equals(l)) ok = true;
        if (!ok || l.equals(lang(c))) return false;
        Store.sp(c).edit().putString("lang", l).commit(); return true;
    }
    static Context ctx(Context c) {
        String l = lang(c); if (l.isEmpty()) return c;
        Configuration cf = new Configuration(c.getResources().getConfiguration()); cf.setLocale(loc(l));
        return c.createConfigurationContext(cf);
    }
    /** app language code -> res/values-* directory */
    static String resDir(String l) {
        switch (l) { case "pt-BR": return "values-pt-rBR"; case "zh-Hans": return "values-b+zh+Hans"; case "zh-Hant": return "values-b+zh+Hant";
            case "no": return "values-nb"; case "he": return "values-iw"; case "id": return "values-in"; default: return "values-" + l; }
    }
    /** app language code -> Locale (zh-Hans/zh-Hant scripts, pt-BR region, no -> nb) */
    static Locale loc(String l) { return Locale.forLanguageTag("no".equals(l) ? "nb" : l); }
    static String s(Context c, int id, Object... a) { Context x = ctx(c); return a.length == 0 ? x.getString(id) : x.getString(id, a); }
    static String notes(Context c, int n) { return ctx(c).getResources().getQuantityString(R.plurals.notes_count, n, n); }
}
