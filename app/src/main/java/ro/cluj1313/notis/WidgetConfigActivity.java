package ro.cluj1313.notis;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProviderInfo;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

/** Widget settings (on add, long-press → Reconfigurează, or the ⚙ in the widget header): theme + which list / tab. */
@android.annotation.SuppressLint("ResourceType")
public class WidgetConfigActivity extends Activity {
    /** a re-tap on ⚙ while the dialog exists: rebuild it for the new intent instead of showing stale state */
    @Override protected void onNewIntent(Intent i) { super.onNewIntent(i); setIntent(i); recreate(); }
    private int wid = AppWidgetManager.INVALID_APPWIDGET_ID;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Bundle ex = getIntent().getExtras();
        if (ex != null) wid = ex.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, wid);
        setResult(RESULT_CANCELED, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, wid));
        if (wid == AppWidgetManager.INVALID_APPWIDGET_ID) { finish(); return; }
        AppWidgetProviderInfo info = AppWidgetManager.getInstance(this).getAppWidgetInfo(wid);
        final boolean notesW = info != null && info.provider.getClassName().endsWith("NotesWidget");
        JSONObject s = Store.snapshot(this);
        ColorStateList tint = ColorStateList.valueOf(Ui.GOLD);

        LinearLayout c = Ui.col(this);
        c.addView(Ui.title(this, notesW ? "Widget Notițe" : "Widget Listă"));
        c.addView(Ui.text(this, "Temă", Ui.MUT, 13));
        final RadioGroup tg = new RadioGroup(this);
        String curT = Store.get(this, "th_" + wid); if (curT == null) curT = getIntent().getBooleanExtra("fromWidget", false) ? "gold" : "auto";
        for (int i = 0; i < Themes.IDS.length; i++) {
            RadioButton r = new RadioButton(this); r.setId(1000 + i); r.setText(Themes.NAMES[i] + (i == 0 ? "  (" + Themes.nameOf(Themes.fromApp(s.optString("theme", ""))) + ")" : ""));
            r.setTextColor(Ui.TXT); r.setButtonTintList(tint); tg.addView(r);
            if (Themes.IDS[i].equals(curT)) tg.check(1000 + i);
        }
        if (tg.getCheckedRadioButtonId() == -1) tg.check(1000);
        c.addView(tg);

        final List<String> ids = new ArrayList<>();
        final RadioGroup lg = new RadioGroup(this);
        c.addView(Ui.text(this, notesW ? "Tab" : "Listă", Ui.MUT, 13), Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 14)));
        if (notesW) {
            JSONArray tabs = s.optJSONArray("tabs");
            String cur = Store.notesTab(this, wid, s);
            if (tabs != null) for (int i = 0; i < tabs.length(); i++) {
                JSONObject t = tabs.optJSONObject(i); if (t == null) continue;
                ids.add(t.optString("id"));
                RadioButton r = new RadioButton(this); r.setId(2000 + ids.size() - 1); r.setText(t.optString("name")); r.setTextColor(Ui.TXT); r.setButtonTintList(tint); lg.addView(r);
                if (t.optString("id").equals(cur)) lg.check(r.getId());
            }
        } else {
            ids.add(null);
            RadioButton r0 = new RadioButton(this); r0.setId(2000); r0.setText("Automat · Cumpărături / cea mai recentă"); r0.setTextColor(Ui.GOLD); r0.setButtonTintList(tint); lg.addView(r0);
            String cur = Store.getChoice(this, wid);
            JSONArray lists = s.optJSONArray("lists");
            if (lists != null) for (int i = 0; i < lists.length(); i++) {
                JSONObject l = lists.optJSONObject(i); if (l == null) continue;
                ids.add(l.optString("id"));
                String tn = Store.tabName(s, l.optString("tab"));
                RadioButton r = new RadioButton(this); r.setId(2000 + ids.size() - 1); r.setText(l.optString("title") + (tn.length() > 0 ? "  ·  " + tn : "")); r.setTextColor(Ui.TXT); r.setButtonTintList(tint); lg.addView(r);
                if (l.optString("id").equals(cur)) lg.check(r.getId());
            }
            if (lg.getCheckedRadioButtonId() == -1) lg.check(2000);
        }
        if (ids.isEmpty()) c.addView(Ui.text(this, "Deschide aplicația Notis o dată ca să apară listele/taburile.", Ui.MUT, 13));
        c.addView(lg);

        LinearLayout r = Ui.row(this); r.setGravity(android.view.Gravity.END);
        Button ok = Ui.btn(this, "Salvează", true);
        r.addView(ok);
        c.addView(r, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 14)));
        ScrollView sv = new ScrollView(this); sv.addView(c); setContentView(sv); setTitle("");

        ok.setOnClickListener(v -> {
            int ti = tg.getCheckedRadioButtonId() - 1000;
            Store.put(this, "th_" + wid, Store.themeAt(ti));
            int li = lg.getCheckedRadioButtonId() - 2000;
            if (li >= 0 && li < ids.size()) { if (notesW) Store.put(this, "tab_" + wid, ids.get(li)); else Store.setChoice(this, wid, ids.get(li)); }
            Store.put(this, "arm_" + wid, null);
            NotisWidget.refreshAll(this);   /* full updateAppWidget (header + background) + list data for every widget */
            setResult(RESULT_OK, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, wid));
            finish();
        });
    }
}
