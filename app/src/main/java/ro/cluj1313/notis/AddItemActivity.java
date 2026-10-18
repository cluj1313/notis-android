package ro.cluj1313.notis;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import org.json.JSONObject;

/** widget "+": add items to the widget's checklist; Enter adds and keeps the dialog open */
public class AddItemActivity extends Activity {
    private String nid; private int wid; private TextView added; private int count = 0;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        wid = getIntent().getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0);
        JSONObject l = Store.listFor(this, wid);
        nid = l != null ? l.optString("id") : getIntent().getStringExtra("n");
        if (nid == null) { finish(); return; }
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE | WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        LinearLayout c = Ui.col(this);
        c.addView(Ui.title(this, "Adaugă în „" + (l != null ? l.optString("title") : "listă") + "”"));
        final EditText e = Ui.field(this, "ex. lapte", false);
        e.setImeOptions(EditorInfo.IME_ACTION_NEXT | EditorInfo.IME_FLAG_NO_EXTRACT_UI);
        c.addView(e, Ui.lp(Ui.MP, Ui.WC, 0));
        added = Ui.text(this, "Enter = adaugă și continuă", Ui.MUT, 12);
        c.addView(added, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 8)));
        LinearLayout r = Ui.row(this); r.setGravity(android.view.Gravity.END);
        Button add = Ui.btn(this, "Adaugă", false), done = Ui.btn(this, "Gata", true);
        r.addView(add); LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(Ui.WC, Ui.WC); p.leftMargin = Ui.dp(this, 10); r.addView(done, p);
        c.addView(r, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 14)));
        setContentView(c);
        setTitle("");
        e.setOnEditorActionListener((v, id, ev) -> {
            if (id == EditorInfo.IME_ACTION_NEXT || id == EditorInfo.IME_ACTION_DONE || (ev != null && ev.getKeyCode() == KeyEvent.KEYCODE_ENTER && ev.getAction() == KeyEvent.ACTION_DOWN)) { addNow(e); return true; }
            return false;
        });
        add.setOnClickListener(v -> addNow(e));
        done.setOnClickListener(v -> { addNow(e); finish(); });
        e.requestFocus();
    }

    private void addNow(EditText e) {
        String t = e.getText().toString().trim();
        if (t.length() == 0) return;
        for (String part : t.split("\n")) { if (part.trim().length() > 0) { Store.addItem(this, nid, null, part.trim()); count++; } }
        e.setText("");
        added.setText("✓ Adăugat: " + t + (count > 1 ? "   (" + count + " în total)" : ""));
        added.setTextColor(Ui.GOLD);
        NotisWidget.refreshAll(this);
    }
}
