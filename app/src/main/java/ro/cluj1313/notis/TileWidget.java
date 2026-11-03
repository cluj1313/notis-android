package ro.cluj1313.notis;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

/** v190: one small 1x1 widget per section (round 3D button + label) that opens ?tk=<kind>. No data read, nothing stored. */
public abstract class TileWidget extends AppWidgetProvider {
    abstract String kind(); abstract String icon(); abstract int label(); abstract int base();
    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.tile_widget);
            v.setTextViewText(R.id.tw_ic, icon());
            v.setTextViewText(R.id.tw_lb, c.getString(label()));
            v.setOnClickPendingIntent(R.id.tw_root, NotisWidget.openApp(c, base() + id, "?tk=" + kind()));
            m.updateAppWidget(id, v);
        }
    }
    public static class Med extends TileWidget { String kind(){return "med";} String icon(){return "💊";} int label(){return R.string.h_med;} int base(){return 710000;} }
    public static class Util extends TileWidget { String kind(){return "util";} String icon(){return "💳";} int label(){return R.string.h_util;} int base(){return 720000;} }
    public static class Crm extends TileWidget { String kind(){return "crm";} String icon(){return "👥";} int label(){return R.string.h_crm;} int base(){return 730000;} }
    public static class Shop extends TileWidget { String kind(){return "shop";} String icon(){return "🛒";} int label(){return R.string.h_shop;} int base(){return 740000;} }
    public static class Urg extends TileWidget { String kind(){return "urg";} String icon(){return "🚨";} int label(){return R.string.h_urg;} int base(){return 750000;} }
}
