package ro.cluj1313.notis;

import android.content.Context;
import android.content.res.Configuration;
import java.util.Locale;

/** 2.1.0: native strings follow the language chosen in the app (sent via NotisNative.setLang), else the phone language. */
final class Tr {
    static final String[] LANGS = {"ro", "en", "fr", "de", "it", "hu", "ru"};
    static String lang(Context c) { return Store.sp(c).getString("lang", ""); }
    static boolean setLang(Context c, String l) {
        boolean ok = false; for (String x : LANGS) if (x.equals(l)) ok = true;
        if (!ok || l.equals(lang(c))) return false;
        Store.sp(c).edit().putString("lang", l).commit(); return true;
    }
    static Context ctx(Context c) {
        String l = lang(c); if (l.isEmpty()) return c;
        Configuration cf = new Configuration(c.getResources().getConfiguration()); cf.setLocale(new Locale(l));
        return c.createConfigurationContext(cf);
    }
    static String s(Context c, int id, Object... a) { Context x = ctx(c); return a.length == 0 ? x.getString(id) : x.getString(id, a); }
    static String notes(Context c, int n) { return ctx(c).getResources().getQuantityString(R.plurals.notes_count, n, n); }
}
