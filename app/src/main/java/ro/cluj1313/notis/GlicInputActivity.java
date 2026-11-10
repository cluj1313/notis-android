package ro.cluj1313.notis;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.os.Bundle;
import android.text.InputType;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

/** home-screen glucose entry: one slot, number only; does not open the full app */
public class GlicInputActivity extends Activity {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        final int wid = getIntent().getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0);
        final String day = getIntent().getStringExtra("day");
        final int slot = getIntent().getIntExtra("i", -1);
        final String lbl = getIntent().getStringExtra("lbl");
        final String tm = getIntent().getStringExtra("tm");
        if (day == null || slot < 0) { finish(); return; }
        Ui.useWidget(this, wid);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE | WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        LinearLayout c = Ui.col(this);
        String title = (lbl != null && lbl.length() > 0) ? lbl : Tr.s(this, R.string.h_glic);
        c.addView(Ui.title(this, title));
        final EditText e = Ui.field(this, Tr.s(this, R.string.glic_hint), false);
        e.setInputType(InputType.TYPE_CLASS_NUMBER);
        e.setImeOptions(EditorInfo.IME_ACTION_DONE | EditorInfo.IME_FLAG_NO_EXTRACT_UI);
        int cur = getIntent().getIntExtra("v", -1);
        if (cur > 0) e.setText(String.valueOf(cur));
        e.setSelection(e.getText().length());
        c.addView(e, Ui.lp(Ui.MP, Ui.WC, 0));
        TextView u = Ui.text(this, Tr.s(this, R.string.glic_hint), Ui.MUT, 12);
        c.addView(u, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 6)));

        LinearLayout r = Ui.row(this); r.setGravity(android.view.Gravity.END);
        Button no = Ui.btn(this, Tr.s(this, R.string.cancel), false);
        Button ok = Ui.btn(this, Tr.s(this, R.string.save), true);
        r.addView(no);
        if (cur > 0) {
            Button cl = Ui.btn(this, Tr.s(this, R.string.glic_clear), false);
            LinearLayout.LayoutParams pc = new LinearLayout.LayoutParams(Ui.WC, Ui.WC); pc.leftMargin = Ui.dp(this, 10);
            r.addView(cl, pc);
            cl.setOnClickListener(v -> { Store.glicVal(this, day, slot, null, title, tm); NotisWidget.refreshAll(this); finish(); });
        }
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(Ui.WC, Ui.WC); p.leftMargin = Ui.dp(this, 10);
        r.addView(ok, p);
        c.addView(r, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 14)));
        setContentView(c);
        setTitle("");

        Runnable save = () -> {
            String t = e.getText().toString().trim();
            if (t.length() == 0) { Store.glicVal(this, day, slot, null, title, tm); NotisWidget.refreshAll(this); finish(); return; }
            int v;
            try { v = Integer.parseInt(t); } catch (Exception ex) { return; }
            if (v < 1 || v > 999) return;
            Store.glicVal(this, day, slot, v, title, tm);
            NotisWidget.refreshAll(this);
            finish();
        };
        no.setOnClickListener(v -> finish());
        ok.setOnClickListener(v -> save.run());
        e.setOnEditorActionListener((v, id, ev) -> {
            if (id == EditorInfo.IME_ACTION_DONE || (ev != null && ev.getKeyCode() == KeyEvent.KEYCODE_ENTER && ev.getAction() == KeyEvent.ACTION_DOWN)) { save.run(); return true; }
            return false;
        });
        e.requestFocus();
    }
}
