package ro.cluj1313.notis;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** 2.5.6: PINs the user already typed correctly are kept encrypted with an Android Keystore key
 *  and released to the web layer only after a successful BiometricPrompt. The PIN itself is never removed. */
final class BioLock {
    private static final String ALIAS = "notis_bio_v1", SP = "notis_bio";
    static final int AUTH = BiometricManager.Authenticators.BIOMETRIC_STRONG | BiometricManager.Authenticators.BIOMETRIC_WEAK;
    private BioLock() {}

    static boolean avail(Context c) {
        try { return BiometricManager.from(c).canAuthenticate(AUTH) == BiometricManager.BIOMETRIC_SUCCESS; } catch (Throwable t) { return false; }
    }
    private static SharedPreferences sp(Context c) { return c.getSharedPreferences(SP, Context.MODE_PRIVATE); }
    private static boolean ok(String k) { return k != null && k.length() > 0 && k.length() < 200; }
    static boolean has(Context c, String k) { return ok(k) && sp(c).contains("k_" + k); }
    static void del(Context c, String k) { if (ok(k)) sp(c).edit().remove("k_" + k).apply(); }
    static void clear(Context c) { sp(c).edit().clear().apply(); }

    private static SecretKey key() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore"); ks.load(null);
        if (ks.containsAlias(ALIAS)) return (SecretKey) ks.getKey(ALIAS, null);
        KeyGenerator g = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        g.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).setKeySize(256).build());
        return g.generateKey();
    }
    static void save(Context c, String k, String pin) {
        if (!ok(k) || pin == null || !(pin.matches("\\d{4,6}") || ("vault".equals(k) && pin.matches("[A-Za-z0-9_-]{43}")))) return;
        try {
            Cipher ci = Cipher.getInstance("AES/GCM/NoPadding"); ci.init(Cipher.ENCRYPT_MODE, key());
            byte[] ct = ci.doFinal(pin.getBytes(StandardCharsets.UTF_8));
            sp(c).edit().putString("k_" + k, Base64.encodeToString(ci.getIV(), Base64.NO_WRAP) + ":" + Base64.encodeToString(ct, Base64.NO_WRAP)).apply();
        } catch (Throwable t) { del(c, k); }
    }
    private static String load(Context c, String k) {
        try {
            String v = sp(c).getString("k_" + k, null); if (v == null) return null; String[] p = v.split(":");
            Cipher ci = Cipher.getInstance("AES/GCM/NoPadding");
            ci.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, Base64.decode(p[0], Base64.NO_WRAP)));
            return new String(ci.doFinal(Base64.decode(p[1], Base64.NO_WRAP)), StandardCharsets.UTF_8);
        } catch (Throwable t) { del(c, k); return null; }
    }
    static void auth(MainActivity m, String k, String title, String neg) {
        if (!avail(m) || !has(m, k)) { m.bioJs(k, null); return; }
        try {
            BiometricPrompt bp = new BiometricPrompt(m, ContextCompat.getMainExecutor(m), new BiometricPrompt.AuthenticationCallback() {
                @Override public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult r) { m.bioJs(k, load(m, k)); }
                @Override public void onAuthenticationError(int code, CharSequence s) { m.bioJs(k, null); }
                /* onAuthenticationFailed: the system prompt lets the user retry; errors/cancel end in onAuthenticationError */
            });
            bp.authenticate(new BiometricPrompt.PromptInfo.Builder()
                    .setTitle(title == null || title.isEmpty() ? "Notis" : title)
                    .setNegativeButtonText(neg == null || neg.isEmpty() ? "PIN" : neg)
                    .setAllowedAuthenticators(AUTH).setConfirmationRequired(false).build());
        } catch (Throwable t) { m.bioJs(k, null); }
    }
}
