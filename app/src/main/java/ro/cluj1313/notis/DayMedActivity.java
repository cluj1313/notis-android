package ro.cluj1313.notis;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.graphics.Paint;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.List;

/** home-screen day sheet: medicines of one day, checkable, no full app */
public class DayMedActivity extends Activity {
    private int wid;
    private String day;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        wid = getIntent().getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0);
        day = getIntent().getStringExtra("day");
        if (day == null || day.length() < 10) { finish(); return; }
        Ui.useWidget(this, wid);
        paint();
    }

    private Context lang() {
        JSONObject sc = SecWidget.cfg(this, wid);
        return Tr.ctx(this, sc.optString("lang", ""));
    }

    private void paint() {
        Context tc = lang();
        JSONObject sc = SecWidget.cfg(this, wid);
        String person = sc.optString("f", "");
        JSONArray mh = sc.optJSONArray("mh");
        JSONObject snap = Store.snapshot(this), sec = snap.optJSONObject("sec"), d = sec == null ? null : sec.optJSONObject("med");
        JSONArray rows = d == null ? null : d.optJSONArray("rows");
        List<JSONObject> list = SecWidget.medDayRows(rows, person, mh, day);

        LinearLayout c = Ui.col(this);
        c.addView(Ui.title(this, SecWidget.dayLabel(tc, day)));
        if (list.isEmpty()) {
            c.addView(Ui.text(this, Tr.s(tc, R.string.sw_empty_med), Ui.MUT, 14), Ui.lp(Ui.MP, Ui.WC, 0));
        } else {
            for (JSONObject r : list) {
                boolean on = r.optBoolean("d");
                LinearLayout row = Ui.row(this);
                row.setPadding(0, Ui.dp(this, 6), 0, Ui.dp(this, 6));
                row.setMinimumHeight(Ui.dp(this, 44));
                CheckBox cb = new CheckBox(this);
                cb.setChecked(on);
                cb.setButtonTintList(android.content.res.ColorStateList.valueOf(Ui.GOLD));
                cb.setClickable(false); cb.setFocusable(false);
                TextView t = new TextView(this);
                String name = r.optString("t");
                String p = r.optString("p");
                if (person.length() == 0 && p.length() > 0 && SecWidget.multiP(rows)) name += " · " + p;
                t.setText(name);
                t.setTextColor(on ? Ui.MUT : Ui.TXT);
                t.setTextSize(16);
                t.setMaxLines(2);
                if (on) t.setPaintFlags(t.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
                else t.setPaintFlags(t.getPaintFlags() & ~Paint.STRIKE_THRU_TEXT_FLAG);
                TextView tm = new TextView(this);
                tm.setText(r.optString("tm"));
                tm.setTextColor(Ui.MUT);
                tm.setTextSize(13);
                tm.setPadding(Ui.dp(this, 8), 0, 0, 0);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, Ui.WC, 1);
                lp.gravity = Gravity.CENTER_VERTICAL;
                row.addView(cb, new LinearLayout.LayoutParams(Ui.WC, Ui.WC));
                row.addView(t, lp);
                row.addView(tm, new LinearLayout.LayoutParams(Ui.WC, Ui.WC));
                final String mid = r.optString("m");
                final int slot = r.optInt("i");
                final boolean was = on;
                row.setOnClickListener(v -> {
                    Store.medToggle(this, mid, slot, !was, day);
                    NotisWidget.refreshAll(this);
                    paint();
                });
                c.addView(row);
            }
        }
        LinearLayout r = Ui.row(this); r.setGravity(Gravity.END);
        android.widget.Button cl = Ui.btn(this, Tr.s(tc, R.string.close), false);
        cl.setOnClickListener(v -> finish());
        r.addView(cl);
        c.addView(r, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 12)));
        ScrollView sv = new ScrollView(this); sv.addView(c); setContentView(sv); setTitle("");
    }
}
