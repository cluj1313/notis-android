package ro.cluj1313.notis;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.Bundle;
import org.json.JSONArray;
import org.json.JSONObject;

/** Invisible trampoline for "Notis · Notițe" rows: expand/collapse, or open the alarm dialog. */
public class RowActivity extends Activity {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        Intent i = getIntent();
        int wid = i.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 0);
        String nid = i.getStringExtra("n");
        if (nid != null) {
            String act = i.getStringExtra("act");
            if ("alarm".equals(act)) {
                startActivity(new Intent(this, AlarmActivity.class).putExtra("n", nid));
            } else if ("del".equals(act)) {
                try { Store.putAsk(this, wid, new JSONObject().put("k", "n").put("n", nid)); } catch (Exception ignored) {}
                NotisWidget.refreshAll(this);
            } else if ("no".equals(act)) {
                Store.clearAsk(this, wid);
                NotisWidget.refreshAll(this);
            } else if ("yes".equals(act)) {
                /* to the app trash (restorable there), synced through the pending queue */
                if (Store.askMatches(Store.getAsk(this, wid), nid, null, null)) { Store.deleteNote(this, nid); Scheduler.rescheduleAll(this); }
                Store.clearAsk(this, wid);
                NotisWidget.refreshAll(this);
            } else if ("olddel".equals(act)) {
                /* one tap: to the app trash now, "Anulează" row for 5 s */
                JSONObject copy = null; JSONArray ns = Store.snapshot(this).optJSONArray("notes");
                if (ns != null) for (int k = 0; k < ns.length(); k++) { JSONObject x = ns.optJSONObject(k); if (x != null && nid.equals(x.optString("id"))) copy = x; }
                Store.deleteNote(this, nid);
                try { Store.putUndo(this, wid, new JSONObject().put("k", "n").put("n", nid).put("p", i.getIntExtra("p", 0))
                    .put("t", copy == null ? "" : copy.optString("title")).put("note", copy == null ? JSONObject.NULL : copy)); } catch (Exception ignored) {}
                Scheduler.rescheduleAll(this);
                NotisWidget.refreshAll(this);
                NotisWidget.laterRefresh(this);
            } else if ("undo".equals(act)) {
                JSONObject u = Store.getUndo(this, wid);
                if (u != null && "n".equals(u.optString("k")) && nid.equals(u.optString("n"))) {
                    Store.put(this, "undo_" + wid, null);
                    Store.restoreNote(this, nid, u.optJSONObject("note"));
                    Scheduler.rescheduleAll(this);
                    NotisWidget.refreshAll(this);
                }
            } else {
                Store.clearAsk(this, wid);
                Store.toggleExpanded(this, wid, nid);
                if (android.os.Build.VERSION.SDK_INT >= 31) NotesWidget.draw(this, AppWidgetManager.getInstance(this), wid);
                else AppWidgetManager.getInstance(this).notifyAppWidgetViewDataChanged(new int[]{wid}, R.id.w_list);
            }
        }
        finish();
        overridePendingTransition(0, 0);
    }
}
