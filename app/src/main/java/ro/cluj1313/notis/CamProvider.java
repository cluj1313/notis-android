package ro.cluj1313.notis;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

/** Minimal private provider: lets the system camera app write one photo into cache/cam (EXTRA_OUTPUT) and the WebView read it back; also serves a quick-record audio file (rec-<ts>.<ext>) to the app the user picks in the share sheet.
 *  Not exported; access only through the per-intent URI grant. No CAMERA permission is declared or needed. */
public class CamProvider extends ContentProvider {
    @Override public boolean onCreate() { return true; }
    static String safe(String n) { return n != null && (n.matches("photo-\\d+\\.jpg") || n.matches("rec-\\d+\\.(m4a|webm|ogg)")) ? n : null; }
    static String type(String n) { if (n == null) return "image/jpeg"; if (n.endsWith(".m4a")) return "audio/mp4"; if (n.endsWith(".webm")) return "audio/webm"; if (n.endsWith(".ogg")) return "audio/ogg"; return "image/jpeg"; }
    private File file(Uri u) throws FileNotFoundException {
        String n = safe(u.getLastPathSegment());
        if (n == null) throw new FileNotFoundException();
        return new File(new File(getContext().getCacheDir(), "cam"), n);
    }
    @Override public ParcelFileDescriptor openFile(Uri u, String mode) throws FileNotFoundException {
        File f = file(u);
        int m = mode.contains("w") ? ParcelFileDescriptor.MODE_READ_WRITE | ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_TRUNCATE : ParcelFileDescriptor.MODE_READ_ONLY;
        return ParcelFileDescriptor.open(f, m);
    }
    @Override public String getType(Uri u) { return type(safe(u.getLastPathSegment())); }
    @Override public Cursor query(Uri u, String[] proj, String sel, String[] args, String sort) {
        MatrixCursor c = new MatrixCursor(new String[]{ OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE });
        try { File f = file(u); c.addRow(new Object[]{ f.getName(), f.length() }); } catch (Exception ignored) {}
        return c;
    }
    @Override public Uri insert(Uri u, ContentValues v) { return null; }
    @Override public int delete(Uri u, String s, String[] a) { return 0; }
    @Override public int update(Uri u, ContentValues v, String s, String[] a) { return 0; }
}
