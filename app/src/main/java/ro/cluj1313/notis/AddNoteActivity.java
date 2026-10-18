package ro.cluj1313.notis;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

/** widget "+": new text note into a chosen tab (default General) */
public class AddNoteActivity extends Activity {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE | WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        JSONObject s = Store.snapshot(this);
        final List<String> ids = new ArrayList<>(); List<String> names = new ArrayList<>();
        JSONArray tabs = s.optJSONArray("tabs");
        if (tabs != null) for (int i = 0; i < tabs.length(); i++) { JSONObject t = tabs.optJSONObject(i); if (t != null) { ids.add(t.optString("id")); names.add(t.optString("name")); } }
        if (ids.isEmpty()) { ids.add(""); names.add("General"); }
        String def = Store.defaultTab(s);
        LinearLayout c = Ui.col(this);
        c.addView(Ui.title(this, "Notiță nouă"));
        final EditText e = Ui.field(this, "Scrie notița…", true);
        c.addView(e, Ui.lp(Ui.MP, Ui.WC, 0));
        LinearLayout r0 = Ui.row(this);
        r0.addView(Ui.text(this, "Tab:", Ui.MUT, 14));
        final Spinner sp = new Spinner(this);
        ArrayAdapter<String> ad = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, names) {
            @Override public View getView(int p, View cv, ViewGroup pa) { TextView t = (TextView) super.getView(p, cv, pa); t.setTextColor(Ui.GOLD); t.setTextSize(15); return t; }
        };
        ad.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        sp.setAdapter(ad); sp.setSelection(Math.max(0, ids.indexOf(def)));
        r0.addView(sp, new LinearLayout.LayoutParams(0, Ui.WC, 1));
        c.addView(r0, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 8)));
        LinearLayout r = Ui.row(this); r.setGravity(android.view.Gravity.END);
        Button no = Ui.btn(this, "Renunță", false), ok = Ui.btn(this, "Salvează", true);
        r.addView(no); LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(Ui.WC, Ui.WC); p.leftMargin = Ui.dp(this, 10); r.addView(ok, p);
        c.addView(r, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 14)));
        setContentView(c); setTitle("");
        no.setOnClickListener(v -> finish());
        ok.setOnClickListener(v -> {
            String t = e.getText().toString();
            if (t.trim().length() == 0) { finish(); return; }
            Store.addNote(this, ids.get(Math.max(0, sp.getSelectedItemPosition())), t.trim());
            NotisWidget.refreshAll(this);
            android.widget.Toast.makeText(this, "Notiță salvată", android.widget.Toast.LENGTH_SHORT).show();
            finish();
        });
        e.requestFocus();
    }
}
