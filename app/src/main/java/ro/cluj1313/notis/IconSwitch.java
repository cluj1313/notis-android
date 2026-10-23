package ro.cluj1313.notis;

import android.content.ComponentName;
import android.content.Context;
import android.content.pm.PackageManager;

/** Switches the launcher icon between activity-aliases. Data is untouched: the aliases all target MainActivity. */
final class IconSwitch {
    static final String NEW = ".LauncherNew", CLASSIC = ".LauncherClassic";
    private IconSwitch() {}
    static ComponentName cn(Context c, String a) { return new ComponentName(c.getPackageName(), "ro.cluj1313.notis" + a); }
    static boolean on(PackageManager pm, ComponentName n, boolean def) {
        int st = pm.getComponentEnabledSetting(n);
        return st == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT ? def : st == PackageManager.COMPONENT_ENABLED_STATE_ENABLED;
    }
    static String get(Context c) {
        PackageManager pm = c.getPackageManager();
        return on(pm, cn(c, CLASSIC), false) && !on(pm, cn(c, NEW), true) ? "classic" : "new";
    }
    static boolean set(Context c, String k) {
        boolean classic = "classic".equals(k);
        if (get(c).equals(classic ? "classic" : "new")) return true;
        try {
            PackageManager pm = c.getPackageManager();
            // enable the target first, so there is never a moment with no launcher entry
            pm.setComponentEnabledSetting(cn(c, classic ? CLASSIC : NEW), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
            pm.setComponentEnabledSetting(cn(c, classic ? NEW : CLASSIC), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
            return true;
        } catch (Exception e) { return false; }
    }
}
