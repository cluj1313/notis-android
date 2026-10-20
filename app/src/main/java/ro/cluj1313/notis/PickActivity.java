package ro.cluj1313.notis;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import java.util.List;
import org.json.JSONObject;

/** widget header ☰: which checklist (list widget) or which tab (Notes widget) this widget shows */
public class PickActivity extends Activity {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        final int wid = getIntent().getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0);
        final boolean notes = "notes".equals(getIntent().getStringExtra("kind"));
        JSONObject s = Store.snapshot(this);
        List<JSONObject> rows = notes ? Store.pickTabs(s, Store.notesTab(this, wid, s)) : Store.pickLists(s, Store.getChoice(this, wid));
        LinearLayout c = Ui.col(this);
        c.addView(Ui.title(this, notes ? "Ce tab arată widgetul" : "Ce listă arată widgetul"));
        LinearLayout box = new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL);
        int n = 0;
        for (final JSONObject r : rows) {
            String k = r.optString("kind");
            if (k.equals("hdr")) { TextView h = Ui.text(this, r.optString("title").toUpperCase(), Ui.MUT, 11); h.setPadding(Ui.dp(this, 4), Ui.dp(this, 12), 0, Ui.dp(this, 4)); box.addView(h); continue; }
            n++;
            boolean cur = r.optBoolean("cur");
            LinearLayout row = Ui.row(this); int p = Ui.dp(this, 10); row.setPadding(Ui.dp(this, 12), p, Ui.dp(this, 12), p); row.setMinimumHeight(Ui.dp(this, 46));
            GradientDrawable g = new GradientDrawable(); g.setCornerRadius(Ui.dp(this, 12)); g.setColor(cur ? 0x26E8C98A : 0x00000000); if (cur) g.setStroke(Ui.dp(this, 1), 0x99C9A45C); row.setBackground(g);
            TextView t = Ui.text(this, (cur ? "✓  " : "") + r.optString("title"), cur ? Ui.GOLD : Ui.TXT, 15); t.setMaxLines(1); t.setEllipsize(android.text.TextUtils.TruncateAt.END);
            row.addView(t, new LinearLayout.LayoutParams(0, Ui.WC, 1));
            if (r.has("cnt")) { TextView ct = Ui.text(this, r.optString("cnt"), Ui.MUT, 12); ct.setGravity(Gravity.END); row.addView(ct); }
            row.setOnClickListener(v -> choose(wid, notes, r));
            box.addView(row, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 2)));
        }
        if (n == 0 || (!notes && n == 1)) c.addView(Ui.text(this, notes ? "Deschide aplicația Notis o dată ca să apară taburile." : "Nu am găsit liste cu bife. Creează una în Notis.", Ui.MUT, 13));
        ScrollView sv = new ScrollView(this); sv.addView(box);
        c.addView(sv, new LinearLayout.LayoutParams(Ui.MP, Ui.WC, 1));
        setContentView(c);
        setTitle("");
    }

    private void choose(int wid, boolean notes, JSONObject r) {
        if (notes) Store.put(this, "tab_" + wid, r.optString("id"));
        else Store.setChoice(this, wid, "auto".equals(r.optString("kind")) ? null : r.optString("id"));
        NotisWidget.refreshAll(this);
        finish();
    }
}
