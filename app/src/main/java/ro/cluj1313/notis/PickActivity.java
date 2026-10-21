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
    @Override protected void onNewIntent(android.content.Intent i) { super.onNewIntent(i); setIntent(i); recreate(); }
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        final int wid = getIntent().getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0);
        final boolean notes = "notes".equals(getIntent().getStringExtra("kind"));
        JSONObject s = Store.snapshot(this);
        List<JSONObject> rows = notes ? Store.pickTabs(s, Store.notesTab(this, wid, s)) : Store.pickLists(s, Store.getChoice(this, wid));
        LinearLayout c = Ui.col(this);
        c.addView(Ui.title(this, Tr.s(this, notes ? R.string.pick_tab_title : R.string.pick_list_title)));
        LinearLayout box = new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL);
        int n = 0;
        LinearLayout grp = box; /* rows go into the current group's collapsible body */
        for (final JSONObject r : rows) {
            String k = r.optString("kind");
            if (k.equals("hdr")) {
                /* 1.8.0: each tab is a dropdown; open/closed is remembered per tab across openings */
                final String key = Store.groupKey(notes, r.optString("title"));
                final boolean open0 = Store.groupOpen(Store.get(this, key));
                final LinearLayout body = new LinearLayout(this); body.setOrientation(LinearLayout.VERTICAL);
                body.setVisibility(open0 ? android.view.View.VISIBLE : android.view.View.GONE);
                final String title = r.optString("title").toUpperCase();
                final TextView h = Ui.text(this, (open0 ? "▾  " : "▸  ") + title, Ui.MUT, 11);
                h.setPadding(Ui.dp(this, 4), Ui.dp(this, 12), Ui.dp(this, 4), Ui.dp(this, 8)); h.setMinHeight(Ui.dp(this, 40)); h.setGravity(Gravity.CENTER_VERTICAL);
                h.setOnClickListener(v -> {
                    boolean op = body.getVisibility() != android.view.View.VISIBLE;
                    body.setVisibility(op ? android.view.View.VISIBLE : android.view.View.GONE);
                    h.setText((op ? "▾  " : "▸  ") + title);
                    Store.put(this, key, op ? null : "0");
                });
                box.addView(h, Ui.lp(Ui.MP, Ui.WC, 0)); box.addView(body, Ui.lp(Ui.MP, Ui.WC, 0));
                grp = body; continue;
            }
            n++;
            boolean cur = r.optBoolean("cur");
            LinearLayout row = Ui.row(this); int p = Ui.dp(this, 10); row.setPadding(Ui.dp(this, 12), p, Ui.dp(this, 12), p); row.setMinimumHeight(Ui.dp(this, 46));
            GradientDrawable g = new GradientDrawable(); g.setCornerRadius(Ui.dp(this, 12)); g.setColor(cur ? 0x26E8C98A : 0x00000000); if (cur) g.setStroke(Ui.dp(this, 1), 0x99C9A45C); row.setBackground(g);
            TextView t = Ui.text(this, (cur ? "✓  " : "") + ("auto".equals(r.optString("kind")) ? Tr.s(this, R.string.pick_auto) : r.optString("title")), cur ? Ui.GOLD : Ui.TXT, 15); t.setMaxLines(1); t.setEllipsize(android.text.TextUtils.TruncateAt.END);
            row.addView(t, new LinearLayout.LayoutParams(0, Ui.WC, 1));
            if (r.has("cnt")) { TextView ct = Ui.text(this, r.has("n") ? Tr.notes(this, r.optInt("n")) : r.optString("cnt"), Ui.MUT, 12); ct.setGravity(Gravity.END); row.addView(ct); }
            row.setOnClickListener(v -> choose(wid, notes, r));
            grp.addView(row, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 2)));
        }
        if (n == 0 || (!notes && n == 1)) c.addView(Ui.text(this, Tr.s(this, notes ? R.string.open_once_tabs : R.string.no_lists), Ui.MUT, 13));
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
