package ro.cluj1313.notis;

import android.Manifest;
import android.app.Activity;
import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.os.Build;
import android.os.Bundle;
import android.text.InputType;
import android.text.format.DateFormat;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Calendar;

/** ⏰ on a note row: once / hourly / daily / weekly / every N min|h|days, at a date+time. Writes the note's alarm (same format as the web app). */
@android.annotation.SuppressLint("ResourceType")
public class AlarmActivity extends Activity {
    private final Calendar when = Calendar.getInstance();
    private Button bDate, bTime;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        final String nid = getIntent().getStringExtra("n");
        JSONObject note = null;
        JSONArray ns = Store.snapshot(this).optJSONArray("notes");
        if (ns != null) for (int i = 0; i < ns.length(); i++) if (ns.optJSONObject(i).optString("id").equals(nid)) note = ns.optJSONObject(i);
        if (note == null) { finish(); return; }
        JSONObject a = note.optJSONObject("alarm");
        long cur = a != null ? WidgetService.nextAlarm(note) : 0;
        int rep = a != null ? a.optInt("rep") : 0;
        if (cur > 0) when.setTimeInMillis(cur); else { when.add(Calendar.HOUR_OF_DAY, 1); when.set(Calendar.MINUTE, 0); }
        when.set(Calendar.SECOND, 0); when.set(Calendar.MILLISECOND, 0);

        LinearLayout c = Ui.col(this);
        c.addView(Ui.title(this, Tr.s(this, R.string.alarm_title)));
        TextView nt = Ui.text(this, note.optString("text").trim(), Ui.TXT, 14); nt.setMaxLines(3); nt.setEllipsize(android.text.TextUtils.TruncateAt.END);
        c.addView(nt);
        final RadioGroup g = new RadioGroup(this);
        String[] L = {Tr.s(this, R.string.rep_once), Tr.s(this, R.string.rep_hourly), Tr.s(this, R.string.rep_daily), Tr.s(this, R.string.rep_weekly), Tr.s(this, R.string.rep_custom)};
        int[] ids = {1, 2, 3, 4, 5};
        ColorStateList tint = ColorStateList.valueOf(Ui.GOLD);
        for (int i = 0; i < L.length; i++) { RadioButton r = new RadioButton(this); r.setId(ids[i]); r.setText(L[i]); r.setTextColor(Ui.TXT); r.setButtonTintList(tint); g.addView(r); }
        c.addView(g, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 8)));
        final LinearLayout custom = Ui.row(this);
        custom.addView(Ui.text(this, Tr.s(this, R.string.every), Ui.MUT, 14));
        final EditText num = Ui.field(this, "N", false); num.setInputType(InputType.TYPE_CLASS_NUMBER); num.setText("2"); num.setMinWidth(Ui.dp(this, 64));
        custom.addView(num, new LinearLayout.LayoutParams(Ui.dp(this, 72), Ui.WC));
        final Spinner unit = new Spinner(this);
        ArrayAdapter<String> ua = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, new String[]{Tr.s(this, R.string.u_min), Tr.s(this, R.string.u_hours), Tr.s(this, R.string.u_days)}) {
            @Override public View getView(int p, View cv, ViewGroup pa) { TextView t = (TextView) super.getView(p, cv, pa); t.setTextColor(Ui.GOLD); return t; }
        };
        ua.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item); unit.setAdapter(ua); unit.setSelection(1);
        custom.addView(unit);
        c.addView(custom, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 4)));
        int sel = rep == 0 ? 1 : rep == 60 ? 2 : rep == 1440 ? 3 : rep == 10080 ? 4 : 5;
        if (sel == 5) { if (rep % 1440 == 0) { num.setText(String.valueOf(rep / 1440)); unit.setSelection(2); } else if (rep % 60 == 0) { num.setText(String.valueOf(rep / 60)); unit.setSelection(1); } else { num.setText(String.valueOf(rep)); unit.setSelection(0); } }
        g.check(sel);
        custom.setVisibility(sel == 5 ? View.VISIBLE : View.GONE);
        g.setOnCheckedChangeListener((gr, id) -> custom.setVisibility(id == 5 ? View.VISIBLE : View.GONE));

        LinearLayout dt = Ui.row(this);
        bDate = Ui.btn(this, "", false); bTime = Ui.btn(this, "", false);
        dt.addView(bDate); LinearLayout.LayoutParams p2 = new LinearLayout.LayoutParams(Ui.WC, Ui.WC); p2.leftMargin = Ui.dp(this, 10); dt.addView(bTime, p2);
        c.addView(Ui.text(this, Tr.s(this, R.string.first_at), Ui.MUT, 13), Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 10)));
        c.addView(dt, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 4)));
        label();
        bDate.setOnClickListener(v -> new DatePickerDialog(this, (dp, y, m, d) -> { when.set(y, m, d); label(); }, when.get(Calendar.YEAR), when.get(Calendar.MONTH), when.get(Calendar.DAY_OF_MONTH)).show());
        bTime.setOnClickListener(v -> new TimePickerDialog(this, (tp, h, mi) -> { when.set(Calendar.HOUR_OF_DAY, h); when.set(Calendar.MINUTE, mi); label(); }, when.get(Calendar.HOUR_OF_DAY), when.get(Calendar.MINUTE), true).show());

        LinearLayout r = Ui.row(this); r.setGravity(android.view.Gravity.END);
        Button del = Ui.btn(this, Tr.s(this, R.string.alarm_cancel), false), close = Ui.btn(this, Tr.s(this, R.string.close), false), ok = Ui.btn(this, Tr.s(this, R.string.save), true);
        if (a != null) r.addView(del);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(Ui.WC, Ui.WC); p.leftMargin = Ui.dp(this, 8);
        r.addView(close, a != null ? p : new LinearLayout.LayoutParams(Ui.WC, Ui.WC));
        LinearLayout.LayoutParams p3 = new LinearLayout.LayoutParams(Ui.WC, Ui.WC); p3.leftMargin = Ui.dp(this, 8); r.addView(ok, p3);
        c.addView(r, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 16)));
        ScrollView sv = new ScrollView(this); sv.addView(c); setContentView(sv); setTitle("");

        close.setOnClickListener(v -> finish());
        del.setOnClickListener(v -> { Store.setAlarm(this, nid, 0, 0); Scheduler.rescheduleAll(this); NotisWidget.refreshAll(this); Toast.makeText(this, Tr.s(this, R.string.alarm_cancelled), Toast.LENGTH_SHORT).show(); finish(); });
        ok.setOnClickListener(v -> {
            int id = g.getCheckedRadioButtonId(), rp = 0;
            if (id == 2) rp = 60; else if (id == 3) rp = 1440; else if (id == 4) rp = 10080;
            else if (id == 5) { int n; try { n = Integer.parseInt(num.getText().toString().trim()); } catch (Exception e) { n = 0; }
                if (n <= 0) { Toast.makeText(this, Tr.s(this, R.string.pick_interval), Toast.LENGTH_SHORT).show(); return; }
                rp = n * (unit.getSelectedItemPosition() == 0 ? 1 : unit.getSelectedItemPosition() == 1 ? 60 : 1440); }
            long at = when.getTimeInMillis(), now = System.currentTimeMillis();
            if (rp > 0 && at < now) at = Store.roll(at, rp, now);
            if (rp == 0 && at < now - 30000) { Toast.makeText(this, Tr.s(this, R.string.time_passed), Toast.LENGTH_SHORT).show(); return; }
            Store.setAlarm(this, nid, at, rp);
            Scheduler.rescheduleAll(this);
            NotisWidget.refreshAll(this);
            Toast.makeText(this, Tr.s(this, R.string.alarm_set, WidgetService.shortTime(this, at)), Toast.LENGTH_SHORT).show();
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED)
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 7);
            else finish();
        });
    }

    @Override public void onRequestPermissionsResult(int rc, String[] p, int[] r) { finish(); }

    private void label() {
        bDate.setText(DateFormat.format("EEE, dd.MM.yyyy", when));
        bTime.setText(DateFormat.format("HH:mm", when));
    }
}
