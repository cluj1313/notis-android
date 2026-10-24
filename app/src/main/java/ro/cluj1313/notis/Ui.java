package ro.cluj1313.notis;

import android.app.Activity;
import android.graphics.drawable.GradientDrawable;
import android.text.InputType;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

/** tiny helpers for the native dialogs (dark/gold, matches the widget) */
final class Ui {
    static final int BG = 0xFF1D1A16;
    /** 2.5.5: palette follows the widget that opened the dialog (same as Themes / widget). Defaults = Dark-Gold. */
    static int TXT = 0xFFF2EAD8, MUT = 0xFF9A9183, GOLD = 0xFFE8C98A, FIELD = 0xFF2A251F, TITLE = 0xFFE8C98A, LINE = 0x73C9A45C, ONACC = 0xFF1E1A16;
    private static Activity themed;
    private static void defaults() { TXT = 0xFFF2EAD8; MUT = 0xFF9A9183; GOLD = 0xFFE8C98A; FIELD = 0xFF2A251F; TITLE = 0xFFE8C98A; LINE = 0x73C9A45C; ONACC = 0xFF1E1A16; }
    /** use the widget's theme for this dialog: same background drawable (color, opacity, border, radius), text colors and accent */
    static void useWidget(Activity a, int wid) {
        Themes t = wid > 0 ? Themes.forWidget(a, wid) : Themes.of(Themes.fromApp(Store.snapshot(a).optString("theme", "")));
        TXT = t.text; MUT = t.mut; GOLD = t.acc; TITLE = t.title; LINE = (t.line & 0x00FFFFFF) | 0x80000000;
        FIELD = (t.text & 0x00FFFFFF) | 0x14000000;
        ONACC = lum(t.acc) > 0.45 ? 0xFF15130F : 0xFFFFFFFF;
        a.getWindow().setBackgroundDrawableResource(t.bg);
        themed = a;
    }
    private static double lum(int c) { return (0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255)) / 255.0; }
    private Ui() {}
    static int dp(Activity a, float v) { return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, a.getResources().getDisplayMetrics()); }
    static LinearLayout col(Activity a) {
        if (themed != a) defaults();
        LinearLayout l = new LinearLayout(a); l.setOrientation(LinearLayout.VERTICAL);
        int p = dp(a, 18); l.setPadding(p, p, p, dp(a, 12)); return l;
    }
    static LinearLayout row(Activity a) {
        LinearLayout l = new LinearLayout(a); l.setOrientation(LinearLayout.HORIZONTAL); l.setGravity(Gravity.CENTER_VERTICAL); return l;
    }
    static TextView title(Activity a, String s) {
        TextView t = new TextView(a); t.setText(s); t.setTextColor(TITLE); t.setTextSize(18); t.setTypeface(t.getTypeface(), android.graphics.Typeface.BOLD);
        t.setPadding(0, 0, 0, dp(a, 10)); return t;
    }
    static TextView text(Activity a, String s, int color, float size) {
        TextView t = new TextView(a); t.setText(s); t.setTextColor(color); t.setTextSize(size); return t;
    }
    static EditText field(Activity a, String hint, boolean multi) {
        EditText e = new EditText(a); e.setHint(hint); e.setTextColor(TXT); e.setHintTextColor(MUT); e.setTextSize(16);
        GradientDrawable g = new GradientDrawable(); g.setColor(FIELD); g.setCornerRadius(dp(a, 12)); g.setStroke(dp(a, 1), LINE);
        e.setBackground(g); int p = dp(a, 12); e.setPadding(p, p, p, p);
        if (multi) { e.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_MULTI_LINE | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES); e.setMinLines(3); e.setMaxLines(8); e.setGravity(Gravity.TOP); }
        else e.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        return e;
    }
    static Button btn(Activity a, String s, boolean primary) {
        Button b = new Button(a); b.setText(s); b.setAllCaps(false); b.setTextSize(15);
        GradientDrawable g = new GradientDrawable(); g.setCornerRadius(dp(a, 20));
        if (primary) { g.setColor(GOLD); b.setTextColor(ONACC); } else { g.setColor(0x00000000); g.setStroke(dp(a, 1), (GOLD & 0x00FFFFFF) | 0xB3000000); b.setTextColor(GOLD); }
        b.setSingleLine(true); b.setMaxLines(1); b.setEllipsize(android.text.TextUtils.TruncateAt.END); b.setStateListAnimator(null);
        b.setAutoSizeTextTypeUniformWithConfiguration(11, 15, 1, TypedValue.COMPLEX_UNIT_SP);
        b.setBackground(g); b.setMinHeight(dp(a, 40)); b.setMinimumHeight(dp(a, 40)); b.setPadding(dp(a, 18), 0, dp(a, 18), 0);
        return b;
    }
    static LinearLayout.LayoutParams lp(int w, int h, int top) { LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(w, h); p.topMargin = top; return p; }
    static final int MP = ViewGroup.LayoutParams.MATCH_PARENT, WC = ViewGroup.LayoutParams.WRAP_CONTENT;
}
