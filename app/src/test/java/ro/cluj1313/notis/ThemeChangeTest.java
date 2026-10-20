package ro.cluj1313.notis;
import org.json.JSONObject;
import org.junit.Test;
import java.util.List;
import static org.junit.Assert.*;
public class ThemeChangeTest {
    @Test public void themeIndexClamped() {
        assertEquals(Themes.IDS[0], Store.themeAt(-1001));
        assertEquals(Themes.IDS[Themes.IDS.length - 1], Store.themeAt(99));
        for (int i = 0; i < Themes.IDS.length; i++) assertEquals(Themes.IDS[i], Store.themeAt(i));
    }
    /** 10 consecutive theme changes: palette follows each pick, and the rows the widget renders never change/empty */
    @Test public void tenThemeChangesKeepRows() throws Exception {
        JSONObject l = new JSONObject("{\"id\":\"n1\",\"title\":\"Listă rapidă\",\"items\":[{\"i\":\"a\",\"t\":\"Buletin\"},{\"i\":\"b\",\"t\":\"Cablu + incarcator\"},{\"i\":\"c\",\"t\":\"De uns rotița la hamster\"},{\"i\":\"d\",\"t\":\"Trusă de prim ajutor\"}]}");
        List<JSONObject> first = Store.listRows(l, null);
        assertEquals(4, first.size());
        for (int k = 0; k < 10; k++) {
            String id = Themes.IDS[1 + k % (Themes.IDS.length - 1)];
            Themes t = Themes.of(id);
            assertEquals(id, t.id);
            List<JSONObject> rs = Store.listRows(l, null);
            assertEquals(4, rs.size());
            for (int p = 0; p < 4; p++) { assertEquals(first.get(p).optString("i"), rs.get(p).optString("i")); assertEquals(WidgetService.listId(first.get(p)), WidgetService.listId(rs.get(p))); }
        }
    }
}
