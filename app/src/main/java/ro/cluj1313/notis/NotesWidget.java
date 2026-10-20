package ro.cluj1313.notis;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;
import org.json.JSONObject;

/** "Notis · Notițe": text notes of one tab, tap to expand/collapse, ⏰ per note, + new note. */
public class NotesWidget extends AppWidgetProvider {

    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { for (int id : ids) draw(c, m, id); }
    @Override public void onDeleted(Context c, int[] ids) { for (int id : ids) Store.forget(c, id); }

    static void refreshAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, NotesWidget.class));
        for (int id : ids) draw(c, m, id);
        if (ids.length > 0 && Build.VERSION.SDK_INT < 31) m.notifyAppWidgetViewDataChanged(ids, R.id.w_list);
    }

    static void draw(Context c, AppWidgetManager m, int id) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.notes_widget);
        NotisWidget.theme(v, Themes.forWidget(c, id));
        JSONObject s = Store.snapshot(c);
        String tab = Store.notesTab(c, id, s), tn = Store.tabName(s, tab);
        int count = WidgetService.notesOf(s, tab).size();
        v.setTextViewText(R.id.w_title, tn.length() > 0 ? tn : "Notis · Notițe");
        v.setTextViewText(R.id.w_sub, tn.length() > 0 ? count + (count == 1 ? " notiță" : " notițe") : "deschide Notis o dată");
        v.setOnClickPendingIntent(R.id.w_head, NotisWidget.openApp(c, id * 10 + 1, tn.length() > 0 ? "?tab=" + Uri.encode(tn) : ""));
        Intent add = new Intent(c, AddNoteActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        add.setData(Uri.parse("notis://addnote/" + id));
        v.setOnClickPendingIntent(R.id.w_add, NotisWidget.activity(c, id * 10 + 2, add));
        Intent cfg = new Intent(c, WidgetConfigActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("fromWidget", true);
        cfg.setData(Uri.parse("notis://cfg/" + id));
        v.setOnClickPendingIntent(R.id.w_cfg, NotisWidget.activity(c, id * 10 + 3, cfg));
        Intent pick = new Intent(c, PickActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("kind", "notes");
        pick.setData(Uri.parse("notis://pick/notes/" + id));
        v.setOnClickPendingIntent(R.id.w_pick, NotisWidget.activity(c, id * 10 + 4, pick));
        Intent svc = new Intent(c, WidgetService.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id).putExtra("kind", "notes");
        svc.setData(Uri.parse("notis://widget/notes/" + id));
        if (Build.VERSION.SDK_INT >= 31) v.setRemoteAdapter(R.id.w_list, WidgetService.noteItems(c, id));
        else v.setRemoteAdapter(R.id.w_list, svc);
        v.setEmptyView(R.id.w_list, R.id.w_empty);
        /* rows go through a no-UI activity: expanding needs no UI, the ⏰ opens the alarm dialog (activity starts from a broadcast are blocked on Android 10+) */
        Intent t = new Intent(c, RowActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id)
            .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_ANIMATION | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
        t.setData(Uri.parse("notis://notesact/" + id));
        int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
        v.setPendingIntentTemplate(R.id.w_list, PendingIntent.getActivity(c, id + 100000, t, fl));
        m.updateAppWidget(id, v);
    }
}
