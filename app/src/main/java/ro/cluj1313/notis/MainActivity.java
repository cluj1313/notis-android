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
    private static final int FILE_REQ = 41;
    static volatile boolean foreground = false;
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
            @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) { return offline(r); }
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
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                Intent i;
                try { i = p.createIntent(); } catch (Exception e) { i = new Intent(Intent.ACTION_GET_CONTENT).setType("*/*"); }
                i.addCategory(Intent.CATEGORY_OPENABLE);
                if (p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try { startActivityForResult(i, FILE_REQ); } catch (Exception e) { fileCb = null; return false; }
                return true;
            }
        });
        Scheduler.rescheduleAll(this);
        Updater.checkDaily(this);
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
        if (req == FILE_REQ && fileCb != null) {
            fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCb = null; return;
        }
        super.onActivityResult(req, res, data);
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
