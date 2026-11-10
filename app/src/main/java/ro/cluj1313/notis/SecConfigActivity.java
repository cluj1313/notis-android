package ro.cluj1313.notis;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.os.Bundle;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

/** 2.21.0: settings for the Pastile / Plăți / CRM widgets (on add, long-press → Reconfigure, or ⚙). */
public class SecConfigActivity extends Activity {
    @Override protected void onNewIntent(Intent i) { super.onNewIntent(i); setIntent(i); recreate(); }
    private int wid = AppWidgetManager.INVALID_APPWIDGET_ID;
    private RadioGroup group(LinearLayout c, String label, String[] names, int sel, int base) {
        c.addView(Ui.text(this, label, Ui.MUT, 13), Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 12)));
        RadioGroup g = new RadioGroup(this); g.setOrientation(names.length <= 4 ? RadioGroup.HORIZONTAL : RadioGroup.VERTICAL);
        ColorStateList tint = ColorStateList.valueOf(Ui.GOLD);
        for (int i = 0; i < names.length; i++) { RadioButton r = new RadioButton(this); r.setId(base + i); r.setText(names[i]); r.setTextColor(Ui.TXT); r.setButtonTintList(tint); g.addView(r); }
        g.check(base + Math.max(0, Math.min(names.length - 1, sel))); c.addView(g); return g;
    }

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Bundle ex = getIntent().getExtras();
        if (ex != null) wid = ex.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, wid);
        setResult(RESULT_CANCELED, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, wid));
        final String k = wid == AppWidgetManager.INVALID_APPWIDGET_ID ? null : SecWidget.kindOf(this, wid);
        if (k == null) { finish(); return; }
        final JSONObject sc = SecWidget.cfg(this, wid);
        JSONObject sec = Store.snapshot(this).optJSONObject("sec"), d = sec == null ? null : sec.optJSONObject(k);

        LinearLayout c = Ui.col(this);
        c.addView(Ui.title(this, SecWidget.icon(k) + Tr.s(this, SecWidget.title(k))));
        /* filter: person (med) / group (util) / home-firm (crm) */
        final List<String> fv = new ArrayList<>(); fv.add("");
        if ("crm".equals(k)) { fv.add("home"); fv.add("firm"); }
        else if (d != null) {
            LinkedHashSet<String> set = new LinkedHashSet<>();
            if ("util".equals(k)) { JSONArray g = d.optJSONArray("groups"); if (g != null) for (int i = 0; i < g.length(); i++) if (g.optString(i).length() > 0) set.add(g.optString(i)); }
            JSONArray rows = d.optJSONArray("rows");
            if (rows != null) for (int i = 0; i < rows.length(); i++) { JSONObject r = rows.optJSONObject(i); String x = r == null ? "" : r.optString("med".equals(k) ? "p" : "g"); if (x.length() > 0) set.add(x); }
            fv.addAll(set);
        }
        final RadioGroup fg;
        if ("glic".equals(k)) {
            fg = null;
        } else {
            String[] fn = new String[fv.size()]; int fsel = 0;
            for (int i = 0; i < fv.size(); i++) { String x = fv.get(i); fn[i] = x.length() == 0 ? Tr.s(this, R.string.sw_all) : "home".equals(x) && "crm".equals(k) ? Tr.s(this, R.string.sw_home) : "firm".equals(x) && "crm".equals(k) ? Tr.s(this, R.string.sw_firm) : x; if (x.equals(sc.optString("f", ""))) fsel = i; }
            fg = group(c, Tr.s(this, "med".equals(k) ? R.string.sw_person : "util".equals(k) ? R.string.sw_group : R.string.sw_show), fn, fsel, 3000);
        }
        final CheckBox[] slotCb = new CheckBox[7];
        if ("glic".equals(k)) {
            String[] labs = SecWidget.glicLabs(this);
            String vis = sc.optString("vis", "1111111");
            if (vis.length() < 7) vis = (vis + "1111111").substring(0, 7);
            c.addView(Ui.text(this, Tr.s(this, R.string.sw_slots), Ui.MUT, 13), Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 12)));
            for (int i = 0; i < 7; i++) {
                CheckBox x = new CheckBox(this);
                x.setText(i < labs.length ? labs[i] : String.valueOf(i + 1));
                x.setTextColor(Ui.TXT);
                x.setButtonTintList(ColorStateList.valueOf(Ui.GOLD));
                x.setChecked(vis.charAt(i) != '0');
                c.addView(x, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 4)));
                slotCb[i] = x;
            }
        }
        /* theme */
        String[] tn = new String[Themes.IDS.length]; int tsel = 6; String curT = Store.get(this, "th_" + wid);
        for (int i = 0; i < tn.length; i++) { tn[i] = Themes.name(this, i); if (Themes.IDS[i].equals(curT)) tsel = i; }
        final RadioGroup tg = group(c, Tr.s(this, R.string.theme), tn, tsel, 1000);
        /* rows */
        final int[] NR = {3, 5, 8, 12, 20}; int defN = "glic".equals(k) ? 7 : "med".equals(k) ? 12 : 5;
        int nsel = 1; for (int i = 0; i < NR.length; i++) if (NR[i] == sc.optInt("n", defN)) nsel = i;
        final RadioGroup ng = group(c, Tr.s(this, R.string.sw_rows), new String[]{"3", "5", "8", "12", "20"}, nsel, 4000);
        /* font size */
        final int[] FS = {12, 14, 17}; int ssel = 1; for (int i = 0; i < FS.length; i++) if (FS[i] == sc.optInt("fs", 14)) ssel = i;
        final RadioGroup sg = group(c, Tr.s(this, R.string.sw_font), new String[]{Tr.s(this, R.string.sw_small), Tr.s(this, R.string.sw_medium), Tr.s(this, R.string.sw_large)}, ssel, 5000);
        /* opacity */
        final TextView al = Ui.text(this, "", Ui.MUT, 13);
        c.addView(al, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 12)));
        final SeekBar sb = new SeekBar(this); sb.setMax(100); sb.setProgress(Math.max(0, Math.min(100, sc.optInt("a", 100))));
        sb.setProgressTintList(ColorStateList.valueOf(Ui.GOLD)); sb.setThumbTintList(ColorStateList.valueOf(Ui.GOLD));
        final String alT = Tr.s(this, R.string.sw_opacity);
        al.setText(alT + "  " + sb.getProgress() + "%");
        sb.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            public void onProgressChanged(SeekBar s, int p, boolean u) { al.setText(alT + "  " + p + "%"); }
            public void onStartTrackingTouch(SeekBar s) {} public void onStopTrackingTouch(SeekBar s) {} });
        c.addView(sb);
        final CheckBox cbx = new CheckBox(this);
        if ("med".equals(k)) { cbx.setText(Tr.s(this, R.string.sw_checks)); cbx.setTextColor(Ui.TXT); cbx.setButtonTintList(ColorStateList.valueOf(Ui.GOLD)); cbx.setChecked(sc.optBoolean("cb", true)); c.addView(cbx, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 10))); }
        if (d == null && !"glic".equals(k)) c.addView(Ui.text(this, Tr.s(this, R.string.sw_open_once), Ui.MUT, 13), Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 10)));

        LinearLayout r = Ui.row(this); r.setGravity(android.view.Gravity.END);
        Button ok = Ui.btn(this, Tr.s(this, R.string.save), true); r.addView(ok);
        c.addView(r, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 14)));
        ScrollView sv = new ScrollView(this); sv.addView(c); setContentView(sv); setTitle("");

        ok.setOnClickListener(v -> {
            try {
                JSONObject o = new JSONObject();
                if (fg != null) { int fi = fg.getCheckedRadioButtonId() - 3000; o.put("f", fi >= 0 && fi < fv.size() ? fv.get(fi) : ""); }
                else o.put("f", "");
                int ni = ng.getCheckedRadioButtonId() - 4000; o.put("n", NR[Math.max(0, Math.min(NR.length - 1, ni))]);
                int si = sg.getCheckedRadioButtonId() - 5000; o.put("fs", FS[Math.max(0, Math.min(FS.length - 1, si))]);
                o.put("a", sb.getProgress()); o.put("cb", !"med".equals(k) || cbx.isChecked());
                if ("glic".equals(k)) {
                    StringBuilder vis = new StringBuilder();
                    for (int i = 0; i < 7; i++) vis.append(slotCb[i] != null && slotCb[i].isChecked() ? '1' : '0');
                    o.put("vis", vis.toString());
                }
                Store.put(this, "sc_" + wid, o.toString());
            } catch (Exception ignored) {}
            int ti = tg.getCheckedRadioButtonId() - 1000;
            Store.put(this, "th_" + wid, Themes.IDS[Math.max(0, Math.min(Themes.IDS.length - 1, ti))]);
            SecWidget.refreshAll(this);
            setResult(RESULT_OK, new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, wid));
            finish();
        });
    }
}
