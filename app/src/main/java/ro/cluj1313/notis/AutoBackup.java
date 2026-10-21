package ro.cluj1313.notis;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/** v57: automatic backups written by the web app before every update / data migration.
 *  Stored in the app's private files dir (survives app updates, removed only on uninstall / "clear data").
 *  Atomic writes (tmp + rename), newest MAX kept. Pure file logic so it is unit-testable. */
final class AutoBackup {
    static final int MAX = 5;
    static File dir(File filesDir) { File d = new File(filesDir, "autobackup"); if (!d.isDirectory()) d.mkdirs(); return d; }
    static boolean validId(String id) { return id != null && id.matches("auto-[0-9]{10,16}"); }

    static synchronized boolean write(File filesDir, String id, String json) {
        if (!validId(id) || json == null || json.isEmpty()) return false;
        File d = dir(filesDir), tmp = new File(d, id + ".tmp"), out = new File(d, id + ".json");
        try (FileOutputStream o = new FileOutputStream(tmp)) { o.write(json.getBytes(StandardCharsets.UTF_8)); o.getFD().sync(); }
        catch (Exception e) { tmp.delete(); return false; }
        if (out.exists() && !out.delete()) { tmp.delete(); return false; }
        if (!tmp.renameTo(out)) { tmp.delete(); return false; }
        prune(d);
        return true;
    }
    static File[] list(File filesDir) {
        File[] f = dir(filesDir).listFiles((x, n) -> n.startsWith("auto-") && n.endsWith(".json"));
        if (f == null) f = new File[0];
        Arrays.sort(f, (a, b) -> b.getName().compareTo(a.getName()));
        return f;
    }
    static void prune(File d) { File[] f = list(d.getParentFile()); for (int i = MAX; i < f.length; i++) f[i].delete(); }

    static String read(File filesDir, String id) {
        if (!validId(id)) return "";
        File f = new File(dir(filesDir), id + ".json");
        if (!f.isFile()) return "";
        try (FileInputStream in = new FileInputStream(f)) { return new String(Updater.readAll(in), StandardCharsets.UTF_8); } catch (Exception e) { return ""; }
    }
    /** small metadata list for the Settings screen: [{id,ts,reason,from,to,size}] — reads only the head of each file */
    static String index(File filesDir) {
        StringBuilder sb = new StringBuilder("[");
        for (File f : list(filesDir)) {
            String head = "";
            try (FileInputStream in = new FileInputStream(f)) { byte[] b = new byte[600]; int n = in.read(b); if (n > 0) head = new String(b, 0, n, StandardCharsets.UTF_8); } catch (Exception ignored) {}
            if (sb.length() > 1) sb.append(',');
            sb.append("{\"id\":").append(q(f.getName().replace(".json", "")))
              .append(",\"ts\":").append(q(field(head, "ts"))).append(",\"reason\":").append(q(field(head, "reason")))
              .append(",\"from\":").append(q(field(head, "from"))).append(",\"to\":").append(q(field(head, "to")))
              .append(",\"size\":").append(f.length()).append('}');
        }
        return sb.append(']').toString();
    }
    static String field(String head, String k) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"" + k + "\":\"([^\"]*)\"").matcher(head);
        return m.find() ? m.group(1) : "";
    }
    static String q(String s) { return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\""; }
}
