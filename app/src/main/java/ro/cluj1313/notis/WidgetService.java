package ro.cluj1313.notis;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.StrikethroughSpan;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

public class WidgetService extends RemoteViewsService {
    @Override public RemoteViewsFactory onGetViewFactory(Intent i) {
        return new F(getApplicationContext(), i.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0));
    }

    static final class F implements RemoteViewsFactory {
        private final Context c; private final int wid;
        private final List<JSONObject> rows = new ArrayList<>(); private String nid = "";
        F(Context c, int wid) { this.c = c; this.wid = wid; }
        @Override public void onCreate() {}
        @Override public void onDestroy() { rows.clear(); }
        @Override public void onDataSetChanged() {
            rows.clear();
            JSONObject l = Store.listFor(c, wid);
            if (l == null) return;
            nid = l.optString("id");
            JSONArray it = l.optJSONArray("items");
            if (it == null) return;
            List<JSONObject> done = new ArrayList<>();
            for (int k = 0; k < it.length(); k++) { JSONObject x = it.optJSONObject(k); if (x == null) continue; if (x.optBoolean("d")) done.add(x); else rows.add(x); }
            rows.addAll(done);
        }
        @Override public int getCount() { return rows.size(); }
        @Override public RemoteViews getViewAt(int p) {
            RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_item);
            if (p >= rows.size()) return v;
            JSONObject x = rows.get(p);
            boolean d = x.optBoolean("d");
            String t = x.optString("t");
            if (d) { SpannableString s = new SpannableString(t); s.setSpan(new StrikethroughSpan(), 0, t.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE); v.setTextViewText(R.id.wi_text, s); v.setTextColor(R.id.wi_text, 0xFF8C8476); }
            else { v.setTextViewText(R.id.wi_text, t); v.setTextColor(R.id.wi_text, 0xFFF2EAD8); }
            v.setImageViewResource(R.id.wi_box, d ? R.drawable.ic_box_on : R.drawable.ic_box);
            Intent f = new Intent().putExtra("n", nid).putExtra("i", x.optString("i")).putExtra("b", x.optString("b", "")).putExtra("d", d);
            v.setOnClickFillInIntent(R.id.wi_row, f);
            return v;
        }
        @Override public RemoteViews getLoadingView() { return null; }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int p) { return p < rows.size() ? (rows.get(p).optString("b", "") + rows.get(p).optString("i")).hashCode() : p; }
        @Override public boolean hasStableIds() { return true; }
    }
}
