package ro.cluj1313.notis;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

/** 2.17.7: tapping a ringing alarm notification → Snooze 10 / 20 / 30 min, Stop, Open (Android shows max 3 notification actions). */
public class RingActivity extends Activity {
    static PendingIntent pi(Context c, String nid, String text) {
        Intent i = new Intent(c, RingActivity.class).putExtra("n", nid).putExtra("t", text).setData(Uri.parse("notis://ring/" + Uri.encode(nid)))
            .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(c, 800000 + Math.abs(nid.hashCode() % 90000), i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        final String nid = getIntent().getStringExtra("n"); final String text = getIntent().getStringExtra("t");
        if (nid == null) { finish(); return; }
        LinearLayout c = Ui.col(this);
        c.addView(Ui.title(this, Tr.s(this, R.string.alarm_title)));
        TextView nt = Ui.text(this, text == null ? "" : text.trim(), Ui.TXT, 15); nt.setMaxLines(4); nt.setEllipsize(android.text.TextUtils.TruncateAt.END);
        c.addView(nt);
        int[] M = {10, 20, 30}; int[] S = {R.string.snooze10, R.string.snooze20, R.string.snooze30};
        for (int k = 0; k < 3; k++) { final int m = M[k]; Button s = Ui.btn(this, Tr.s(this, S[k]), false);
            s.setOnClickListener(v -> { AlarmReceiver.act(this, nid, text, m); finish(); });
            c.addView(s, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, k == 0 ? 14 : 8))); }
        Button stop = Ui.btn(this, Tr.s(this, R.string.alarm_stop), true);
        stop.setOnClickListener(v -> { AlarmReceiver.act(this, nid, null, 0); finish(); });
        c.addView(stop, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 14)));
        Button open = Ui.btn(this, Tr.s(this, R.string.upd_open), false);
        open.setOnClickListener(v -> { AlarmReceiver.act(this, nid, null, 0);
            try { NotisWidget.openApp(this, 700000 + Math.abs(nid.hashCode() % 90000), "?open=" + Uri.encode(nid)).send(); } catch (Exception ignored) {} finish(); });
        c.addView(open, Ui.lp(Ui.MP, Ui.WC, Ui.dp(this, 8)));
        ScrollView sv = new ScrollView(this); sv.addView(c); setContentView(sv); setTitle("");
        setFinishOnTouchOutside(false);
    }
}
