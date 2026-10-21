package ro.cluj1313.notis;

import android.media.MediaRecorder;
import android.util.Base64;
import java.io.File;
import java.io.FileInputStream;

/** Fallback microphone recorder (AAC in MP4/m4a) for when the WebView's getUserMedia is unavailable. One recording at a time. */
final class NativeRec {
    private static MediaRecorder mr;
    private static File out;
    static final long MAX_BYTES = 20L * 1024 * 1024;

    static synchronized String start(File f) {
        cancel();
        try {
            MediaRecorder r = new MediaRecorder();
            r.setAudioSource(MediaRecorder.AudioSource.MIC);
            r.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            r.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            r.setAudioEncodingBitRate(64000);
            r.setAudioSamplingRate(44100);
            r.setAudioChannels(1);
            r.setMaxDuration(10 * 60 * 1000);
            r.setOutputFile(f.getAbsolutePath());
            r.prepare();
            r.start();
            mr = r; out = f;
            return "ok";
        } catch (Exception e) { cancel(); return "err:" + e.getClass().getSimpleName(); }
    }

    static synchronized String stop() {
        if (mr == null) return "err:notrecording";
        File f = out;
        try { mr.stop(); } catch (Exception e) { release(); if (f != null) f.delete(); return "err:tooshort"; }
        release();
        try { return encode(f); } catch (Exception e) { return "err:" + e.getClass().getSimpleName(); } finally { f.delete(); }
    }

    static String encode(File f) throws Exception {
        long n = f.length();
        if (n <= 0) return "err:empty";
        if (n > MAX_BYTES) return "err:toolarge";
        byte[] buf = new byte[(int) n];
        try (FileInputStream in = new FileInputStream(f)) { int o = 0, k; while (o < buf.length && (k = in.read(buf, o, buf.length - o)) > 0) o += k; }
        return Base64.encodeToString(buf, Base64.NO_WRAP);
    }

    static synchronized void cancel() {
        if (mr != null) { try { mr.stop(); } catch (Exception ignored) {} }
        release();
        if (out != null) { out.delete(); out = null; }
    }
    private static void release() { if (mr != null) { try { mr.release(); } catch (Exception ignored) {} mr = null; } }
}
