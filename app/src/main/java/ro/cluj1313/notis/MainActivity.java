package ro.cluj1313.notis;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;
import java.io.InputStream;

public class MainActivity extends Activity {
    static final String BASE = "https://cluj1313.github.io/notis/";
    private static final int FILE_REQ = 41, MIC_REQ = 42, CAM_REQ = 43;
    private android.webkit.PermissionRequest micReq;
    private Uri camUri;
    static volatile boolean foreground = false;
    /** true only while the top document is Notis itself (checked by every bridge call) */
    static volatile boolean trusted = false;
    private WebView web;
    private ValueCallback<Uri[]> fileCb;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        if ((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) WebView.setWebContentsDebuggingEnabled(true);
        web = new WebView(this);
        web.setBackgroundColor(0xFF0B0A08);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " NotisAndroid/" + Updater.mine(this));
        web.addJavascriptInterface(new Bridge(this), "NotisNative");
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                /* no foreign frames: the NotisNative bridge must only ever be reachable from https://cluj1313.github.io/notis/ */
                if (!r.isForMainFrame()) {
                    String acc = r.getRequestHeaders() == null ? null : r.getRequestHeaders().get("Accept");
                    if (acc != null && acc.contains("text/html") && !r.getUrl().toString().startsWith(BASE))
                        return new WebResourceResponse("text/plain", "utf-8", 403, "Forbidden", null, new java.io.ByteArrayInputStream(new byte[0]));
                }
                return offline(r);
            }
            @Override public void onPageStarted(WebView v, String url, android.graphics.Bitmap f) { trusted = url != null && url.startsWith(BASE); super.onPageStarted(v, url, f); }
            @Override public void doUpdateVisitedHistory(WebView v, String url, boolean reload) { trusted = url != null && url.startsWith(BASE); super.doUpdateVisitedHistory(v, url, reload); }
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (u.toString().startsWith(BASE)) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
                return true;
            }
        });
        if (Build.VERSION.SDK_INT >= 24) {
            ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient() {
                @Override public WebResourceResponse shouldInterceptRequest(WebResourceRequest r) { return offline(r); }
            });
        }
        web.setWebChromeClient(new WebChromeClient() {
            /* microphone for in-note voice recordings: only for Notis itself, only audio, after the Android runtime permission */
            @Override public void onPermissionRequest(final android.webkit.PermissionRequest r) {
                runOnUiThread(() -> {
                    String o = r.getOrigin() == null ? "" : r.getOrigin().toString();
                    boolean audio = false;
                    for (String x : r.getResources()) if (android.webkit.PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(x)) audio = true;
                    if (!audio || !(BASE.startsWith(o) || o.startsWith("https://cluj1313.github.io"))) { r.deny(); return; }
                    String[] res = { android.webkit.PermissionRequest.RESOURCE_AUDIO_CAPTURE };
                    if (Build.VERSION.SDK_INT < 23 || checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) == android.content.pm.PackageManager.PERMISSION_GRANTED) { r.grant(res); return; }
                    if (micReq != null) micReq.deny();
                    micReq = r;
                    requestPermissions(new String[]{ android.Manifest.permission.RECORD_AUDIO }, MIC_REQ);
                });
            }
            @Override public void onPermissionRequestCanceled(android.webkit.PermissionRequest r) { if (micReq == r) micReq = null; }
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                /* <input capture>: system camera app writes into our private cache via CamProvider (no CAMERA permission needed) */
                if (p.isCaptureEnabled()) {
                    try {
                        java.io.File d = new java.io.File(getCacheDir(), "cam"); d.mkdirs();
                        java.io.File[] old = d.listFiles(); if (old != null) for (java.io.File f : old) f.delete();
                        String name = "photo-" + System.currentTimeMillis() + ".jpg";
                        new java.io.File(d, name).createNewFile();
                        camUri = Uri.parse("content://" + getPackageName() + ".cam/" + name);
                        Intent ci = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE).putExtra(android.provider.MediaStore.EXTRA_OUTPUT, camUri)
                            .addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        ci.setClipData(android.content.ClipData.newRawUri("", camUri));
                        startActivityForResult(ci, CAM_REQ);
                        return true;
                    } catch (Exception e) { camUri = null; /* no camera app: fall back to the picker */ }
                }
                /* explicit GET_CONTENT with the page's accept types (image/* for photos, json for backups) */
                java.util.ArrayList<String> types = new java.util.ArrayList<>();
                String[] acc = p.getAcceptTypes();
                if (acc != null) for (String t : acc) for (String x : t.split(",")) { x = x.trim(); if (x.length() == 0) continue;
                    if (x.startsWith(".")) { String m = android.webkit.MimeTypeMap.getSingleton().getMimeTypeFromExtension(x.substring(1)); if (m != null) x = m; else continue; }
                    if (!types.contains(x)) types.add(x); }
                Intent i = new Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE);
                if (types.size() == 1) i.setType(types.get(0));
                else { i.setType(types.isEmpty() ? "*/*" : (allImages(types) ? "image/*" : "*/*")); if (types.size() > 1) i.putExtra(Intent.EXTRA_MIME_TYPES, types.toArray(new String[0])); }
                if (p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try { startActivityForResult(i, FILE_REQ); } catch (Exception e) { fileCb = null; return false; }
                return true;
            }
        });
        Scheduler.rescheduleAll(this);
        Updater.check(this);
        if (b != null) web.restoreState(b);
        else web.loadUrl(BASE + query(getIntent()));
    }

    private static String query(Intent i) {
        String q = i == null ? null : i.getStringExtra("q");
        return q == null ? "" : q;
    }

    @Override protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        String q = query(i);
        if (q.length() == 0) return;
        String js = "(function(u){if(window.NotisApp)NotisApp.launch(u);else location.href=u})(" + JSONObject.quote(BASE + q) + ")";
        web.evaluateJavascript(js, null);
    }

    @Override protected void onResume() {
        super.onResume();
        foreground = true;
        Updater.check(this);
        if (web != null) { web.onResume(); web.evaluateJavascript("window.NotisApp&&NotisApp.sync()", null); }
    }
    @Override protected void onPause() {
        foreground = false;
        if (web != null) { web.evaluateJavascript("window.NotisApp&&document.dispatchEvent(new Event('visibilitychange'))", null); web.onPause(); }
        super.onPause();
    }
    @Override protected void onSaveInstanceState(Bundle o) { super.onSaveInstanceState(o); if (web != null) web.saveState(o); }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    @Override protected void onActivityResult(int req, int res, Intent data) {
        if (req == CAM_REQ && fileCb != null) {
            Uri u = camUri; camUri = null;
            java.io.File f = u == null ? null : new java.io.File(new java.io.File(getCacheDir(), "cam"), u.getLastPathSegment());
            fileCb.onReceiveValue(res == RESULT_OK && f != null && f.length() > 0 ? new Uri[]{ u } : null);
            fileCb = null; return;
        }
        if (req == FILE_REQ && fileCb != null) {
            fileCb.onReceiveValue(pickResult(res, data));
            fileCb = null; return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override public void onRequestPermissionsResult(int req, String[] perms, int[] res) {
        if (req == MIC_REQ && micReq != null) {
            android.webkit.PermissionRequest r = micReq; micReq = null;
            if (res.length > 0 && res[0] == android.content.pm.PackageManager.PERMISSION_GRANTED) r.grant(new String[]{ android.webkit.PermissionRequest.RESOURCE_AUDIO_CAPTURE });
            else r.deny();
            return;
        }
        super.onRequestPermissionsResult(req, perms, res);
    }

    private static boolean allImages(java.util.List<String> t) { for (String x : t) if (!x.startsWith("image/")) return false; return true; }

    /** FileChooserParams.parseResult() only reads getData(): a multi-select (and some single picks from
     *  Photos/Files) come back as ClipData only, which it drops -> the page got no files at all. */
    static Uri[] pickResult(int res, Intent data) {
        if (res != RESULT_OK || data == null) return null;
        java.util.LinkedHashSet<Uri> out = new java.util.LinkedHashSet<>();
        android.content.ClipData cd = data.getClipData();
        if (cd != null) for (int k = 0; k < cd.getItemCount(); k++) { Uri u = cd.getItemAt(k).getUri(); if (u != null) out.add(u); }
        if (data.getData() != null) out.add(data.getData());
        return out.isEmpty() ? null : out.toArray(new Uri[0]);
    }

    /** No network: serve the bundled copy of Notis under the same origin (same storage). Online: let the web/service worker handle it. */
    private WebResourceResponse offline(WebResourceRequest r) {
        try {
            String url = r.getUrl().toString();
            if (!"GET".equals(r.getMethod()) || !url.startsWith(BASE) || online()) return null;
            String path = r.getUrl().getPath();
            if (path == null) return null;
            if (path.startsWith("/notis/")) path = path.substring(7); else return null;
            if (path.length() == 0 || path.endsWith("/")) path += "index.html";
            InputStream in;
            try { in = getAssets().open("www/" + path); } catch (Exception e) { return null; }
            return new WebResourceResponse(mime(path), mime(path).startsWith("text") || path.endsWith(".js") || path.endsWith(".json") || path.endsWith(".webmanifest") ? "utf-8" : null, in);
        } catch (Exception e) { return null; }
    }

    private static String mime(String p) {
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".webp")) return "image/webp";
        if (p.endsWith(".m4a")) return "audio/mp4";
        if (p.endsWith(".json") || p.endsWith(".webmanifest")) return "application/json";
        return "application/octet-stream";
    }

    private boolean online() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            NetworkCapabilities nc = cm.getNetworkCapabilities(cm.getActiveNetwork());
            return nc != null && nc.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
        } catch (Exception e) { return true; }
    }
}
