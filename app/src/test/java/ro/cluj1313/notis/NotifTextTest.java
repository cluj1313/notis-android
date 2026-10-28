package ro.cluj1313.notis;
import org.junit.Test;
import static org.junit.Assert.*;
public class NotifTextTest {
    static void eq(String in, String t, String b) { String[] r = NotifText.split(in); assertEquals(in, t, r[0]); assertEquals(in, b, r[1]); }
    @Test public void med() {
        eq("💊 Fosfomicină · Seară 00:30 — Gabi", "💊 Fosfomicină", "Seară 00:30 · Gabi");
        eq("💊 Fosfomicină · Seară 00:30", "💊 Fosfomicină", "Seară 00:30");
        eq("💊 Paracetamol — Gabi", "💊 Paracetamol", "Gabi");
        eq("💊 Paracetamol", "💊 Paracetamol", "");
        eq("⏰ 💊 Fosfomicină · Seară 00:30 — Gabi", "💊 Fosfomicină", "Seară 00:30 · Gabi");
    }
    @Test public void crm() {
        eq("📞 Ana Rus · Reamintire · 14:30", "⏰ Ana Rus", "Reamintire · 14:30");
        eq("📞 Ana Rus · 0722 111 222", "⏰ Ana Rus", "0722 111 222"); /* payload scheduled by 2.12.10 */
    }
    @Test public void task() {
        eq("Cumpără lapte", "⏰ Cumpără lapte", "");
        eq("Cumpără lapte\nși pâine", "⏰ Cumpără lapte", "și pâine");
        eq("Cumpără lapte\nCumpără lapte\nși pâine", "⏰ Cumpără lapte", "și pâine");
        eq("🚨 ⚠️ Sună la bancă", "🚨 Sună la bancă", "");
        eq("💳 Enel — plată", "💳 Enel", "plată");
        eq("", "⏰ Notis", "");
        eq("12 mai: dentist", "⏰ 12 mai: dentist", "");
    }
    @Test public void news() {
        assertEquals("", NotifText.body("🎉 Notis 2.12", "Notis 2.12"));
        assertEquals("Ce e nou", NotifText.body("Notis 2.12", "Ce e nou"));
    }
}
