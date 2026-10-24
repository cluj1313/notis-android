package ro.cluj1313.notis;

import android.app.Activity;
import android.os.Bundle;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import org.json.JSONArray;
import org.json.JSONObject;

/** 2.5.0: widget ✎ — edit a list item ("k"=i) or a text note ("k"=n) in place (same id, done state, alarm, position) */
public class EditActivity extends Activity {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE | WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        final boolean note = "n".equals(getIntent().getStringExtra("k"));
        final String nid = getIntent().getStringExtra("n"), iid = getIntent().getStringExtra("i"), bid = getIntent().getStringExtra("b");
        JSONObject cur = Store.find(Store.snapshot(this), note, nid, bid, iid);
        if (nid == null || cur == null || (!note && iid == null)) { finish(); return; }
        final String old = note ? cur.optString("text") : cur.optString("t");
        final boolean done = cur.optBoolean("d");
        Ui.useWidget(this, getIntent().getIntExtra("w", 0));
        LinearLayout c = Ui.col(this);
        c.addView(Ui.title(this, Tr.s(this, note ? R.string.edit_note : R.string.edit_item)));
        final EditText e = Ui.field(this, "", note);
        e.setText(old); e.setSelection(e.getText().length());
        c.addView(e, Ui.lp(Ui.MP, Ui.WC, 0));
        LinearLayout r = Ui.row(this); r.setGravity(android.view.Gravity.END);
        Button no = Ui.btn(this, Tr.s(this, R.string.cancel), false), ok = Ui.btn(this, Tr.s(this, R.string.save), true);
        r.addView(no, new LinearLayout.LayoutParams(0, Ui.WC, 1)); LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, Ui.WC, 1); p.leftMargin = Ui.dp(this, 10); r.addView(ok, p);
        c.addView(r, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 14)));
        setContentView(c); setTitle("");
        no.setOnClickListener(v -> finish());
        ok.setOnClickListener(v -> {
            String t = note ? e.getText().toString().trim() : e.getText().toString().replace('\n', ' ').trim();
            if (t.length() > 0 && !t.equals(old.trim())) {
                if (note) Store.editNote(this, nid, t); else Store.editItem(this, nid, bid, iid, t, done);
                NotisWidget.refreshAll(this);
            }
            finish();
        });
        e.requestFocus();
    }
}
