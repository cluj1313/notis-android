package ro.cluj1313.notis;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

/** Pick which checklist the widget shows (optional on Android 12+, also reachable by long-press → reconfigure). */
public class WidgetConfigActivity extends Activity {
    private int wid = AppWidgetManager.INVALID_APPWIDGET_ID;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Bundle ex = getIntent().getExtras();
        if (ex != null) wid = ex.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, wid);
        setResult(RESULT_CANCELED, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, wid));
        if (wid == AppWidgetManager.INVALID_APPWIDGET_ID) { finish(); return; }
        final List<String> ids = new ArrayList<>(); final List<String> names = new ArrayList<>();
        ids.add(null); names.add("Automat · Cumpărături / cea mai recentă");
        JSONObject s = Store.snapshot(this);
        JSONArray lists = s.optJSONArray("lists"), tabs = s.optJSONArray("tabs");
        if (lists != null) for (int i = 0; i < lists.length(); i++) {
            JSONObject l = lists.optJSONObject(i); if (l == null) continue;
            String tn = "";
            if (tabs != null) for (int k = 0; k < tabs.length(); k++) { JSONObject t = tabs.optJSONObject(k); if (t != null && t.optString("id").equals(l.optString("tab"))) tn = t.optString("name"); }
            ids.add(l.optString("id")); names.add(l.optString("title") + (tn.length() > 0 ? "  ·  " + tn : ""));
        }
        ListView lv = new ListView(this);
        lv.setPadding(12, 24, 12, 24);
        lv.setDividerHeight(0);
        lv.setAdapter(new ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, names) {
            @Override public View getView(int p, View cv, ViewGroup parent) {
                TextView t = (TextView) super.getView(p, cv, parent);
                t.setTextColor(p == 0 ? 0xFFE8C98A : 0xFFF2EAD8); t.setTextSize(16); t.setPadding(36, 26, 36, 26);
                return t;
            }
        });
        lv.setOnItemClickListener((parent, view, p, id) -> {
            Store.setChoice(this, wid, ids.get(p));
            NotisWidget.draw(this, AppWidgetManager.getInstance(this), wid);
            AppWidgetManager.getInstance(this).notifyAppWidgetViewDataChanged(new int[]{wid}, R.id.w_list);
            setResult(RESULT_OK, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, wid));
            finish();
        });
        setTitle(lists == null || lists.length() == 0 ? "Deschide Notis întâi" : "Ce listă arată widgetul?");
        setContentView(lv);
    }
}
