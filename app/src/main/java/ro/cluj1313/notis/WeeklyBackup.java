package ro.cluj1313.notis;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** v208: silent weekly backup files "notis-autobackup-YYYY-MM-DD.json".
 *  Android 10+: public Downloads/Notis/ via MediaStore (no permission; survives uninstall / clear data).
 *  Android 8–9: app-specific external dir Android/data/<pkg>/files/Notis (no runtime prompt; removed on uninstall).
 *  Only files created by this feature (name pattern + owned by this install) are ever listed or deleted; newest KEEP kept. */
final class WeeklyBackup {
    static final int KEEP = 4;
    static final String SUB = "Notis";
    static boolean validName(String n) { return n != null && n.matches("notis-autobackup-[0-9]{4}-[0-9]{2}-[0-9]{2}\\.json"); }
    /** listing/pruning also accepts the " (1)" suffix MediaStore adds when a file of a previous install has the same name (only files owned by this install are visible) */
    static boolean ours(String n) { return n != null && n.matches("notis-autobackup-[0-9]{4}-[0-9]{2}-[0-9]{2}( \\([0-9]{1,3}\\))?\\.json"); }
    static boolean pub() { return Build.VERSION.SDK_INT >= 29; }
    static String where(Context c) { return pub() ? Environment.DIRECTORY_DOWNLOADS + "/" + SUB + "/" : dir(c).getAbsolutePath() + "/"; }
    static File dir(Context c) { File b = c.getExternalFilesDir(null); if (b == null) b = c.getFilesDir(); File d = new File(b, SUB); if (!d.isDirectory()) d.mkdirs(); return d; }

    /** pure rotation helper (unit-testable): names to delete so that only the newest keep remain */
    static List<String> toDelete(List<String> names, int keep) {
        List<String> v = new ArrayList<>(); for (String n : names) if (ours(n)) v.add(n);
        Collections.sort(v, Collections.reverseOrder());
        return v.size() > keep ? new ArrayList<>(v.subList(keep, v.size())) : new ArrayList<>();
    }

    static final class Item { String name; long id; long size; Item(String n, long i, long s) { name = n; id = i; size = s; } }

    static List<Item> items(Context c) {
        List<Item> out = new ArrayList<>();
        if (pub()) {
            ContentResolver r = c.getContentResolver();
            String[] pr = { MediaStore.Downloads._ID, MediaStore.Downloads.DISPLAY_NAME, MediaStore.Downloads.SIZE };
            try (Cursor q = r.query(MediaStore.Downloads.EXTERNAL_CONTENT_URI, pr,
                    MediaStore.Downloads.RELATIVE_PATH + "=? AND " + MediaStore.Downloads.DISPLAY_NAME + " LIKE ?",
                    new String[]{ Environment.DIRECTORY_DOWNLOADS + "/" + SUB + "/", "notis-autobackup-%.json" }, null)) {
                while (q != null && q.moveToNext()) { String n = q.getString(1); if (ours(n)) out.add(new Item(n, q.getLong(0), q.getLong(2))); }
            } catch (Exception ignored) {}
        } else {
            File[] f = dir(c).listFiles((x, n) -> ours(n));
            if (f != null) for (File x : f) out.add(new Item(x.getName(), -1, x.length()));
        }
        Collections.sort(out, (a, b) -> b.name.compareTo(a.name));
        return out;
    }

    static synchronized boolean write(Context c, String name, String json) {
        if (!validName(name) || json == null || json.isEmpty()) return false;
        byte[] data = json.getBytes(StandardCharsets.UTF_8);
        boolean ok = false;
        try {
            if (pub()) {
                ContentResolver r = c.getContentResolver();
                Uri u = null;
                for (Item it : items(c)) if (it.name.equals(name)) u = ContentUris.withAppendedId(MediaStore.Downloads.EXTERNAL_CONTENT_URI, it.id);
                boolean fresh = u == null;
                if (fresh) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                    v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
                    v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + SUB);
                    v.put(MediaStore.Downloads.IS_PENDING, 1);
                    u = r.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                }
                if (u == null) return false;
                try (OutputStream o = r.openOutputStream(u, "wt")) { if (o == null) throw new Exception("no stream"); o.write(data); }
                catch (Exception e) { if (fresh) r.delete(u, null, null); return false; }
                if (fresh) { ContentValues v = new ContentValues(); v.put(MediaStore.Downloads.IS_PENDING, 0); r.update(u, v, null, null); }
                ok = true;
            } else {
                File d = dir(c), tmp = new File(d, name + ".tmp"), out = new File(d, name);
                try (FileOutputStream o = new FileOutputStream(tmp)) { o.write(data); o.getFD().sync(); }
                if (out.exists() && !out.delete()) { tmp.delete(); return false; }
                ok = tmp.renameTo(out); if (!ok) tmp.delete();
            }
        } catch (Exception e) { return false; }
        if (ok) prune(c);
        return ok;
    }

    static void prune(Context c) {
        List<Item> all = items(c); List<String> n = new ArrayList<>(); for (Item i : all) n.add(i.name);
        List<String> del = toDelete(n, KEEP);
        for (Item i : all) if (del.contains(i.name)) {
            try { if (pub()) c.getContentResolver().delete(ContentUris.withAppendedId(MediaStore.Downloads.EXTERNAL_CONTENT_URI, i.id), null, null); else new File(dir(c), i.name).delete(); } catch (Exception ignored) {}
        }
    }

    static String index(Context c) {
        StringBuilder sb = new StringBuilder("{\"where\":").append(AutoBackup.q(where(c))).append(",\"files\":[");
        boolean f = true; for (Item i : items(c)) { if (!f) sb.append(','); f = false; sb.append("{\"name\":").append(AutoBackup.q(i.name)).append(",\"size\":").append(i.size).append('}'); }
        return sb.append("]}").toString();
    }

    static String read(Context c, String name) {
        if (!ours(name)) return "";
        for (Item i : items(c)) if (i.name.equals(name)) {
            try (InputStream in = pub() ? c.getContentResolver().openInputStream(ContentUris.withAppendedId(MediaStore.Downloads.EXTERNAL_CONTENT_URI, i.id)) : new FileInputStream(new File(dir(c), name))) {
                return in == null ? "" : new String(Updater.readAll(in), StandardCharsets.UTF_8);
            } catch (Exception e) { return ""; }
        }
        return "";
    }
}
