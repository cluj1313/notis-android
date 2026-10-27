package ro.cluj1313.notis;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.LinkedHashMap;
import java.util.Map;

/** CRM import: reads name + phones + emails + postal address on the device only (nothing is uploaded). */
final class Contacts {
    static String readAll(Context ctx) {
        Map<String, JSONObject> m = new LinkedHashMap<>();
        ContentResolver cr = ctx.getContentResolver();
        try (Cursor c = cr.query(ContactsContract.Data.CONTENT_URI,
                new String[]{ ContactsContract.Data.CONTACT_ID, ContactsContract.Data.MIMETYPE, ContactsContract.Data.DISPLAY_NAME, ContactsContract.Data.DATA1 },
                ContactsContract.Data.MIMETYPE + " IN (?,?,?)",
                new String[]{ ContactsContract.CommonDataKinds.Phone.CONTENT_ITEM_TYPE, ContactsContract.CommonDataKinds.Email.CONTENT_ITEM_TYPE, ContactsContract.CommonDataKinds.StructuredPostal.CONTENT_ITEM_TYPE },
                ContactsContract.Data.DISPLAY_NAME + " COLLATE NOCASE ASC")) {
            if (c == null) return "[]";
            while (c.moveToNext()) {
                String id = c.getString(0), mt = c.getString(1), nm = c.getString(2), v = c.getString(3);
                if (id == null || v == null || v.trim().isEmpty()) continue;
                JSONObject o = m.get(id);
                if (o == null) { o = new JSONObject(); o.put("name", nm == null ? "" : nm); o.put("tel", new JSONArray()); o.put("email", new JSONArray()); o.put("addr", ""); m.put(id, o); }
                if (ContactsContract.CommonDataKinds.Phone.CONTENT_ITEM_TYPE.equals(mt)) o.getJSONArray("tel").put(v.trim());
                else if (ContactsContract.CommonDataKinds.Email.CONTENT_ITEM_TYPE.equals(mt)) o.getJSONArray("email").put(v.trim());
                else if (o.optString("addr").isEmpty()) o.put("addr", v.trim().replace('\n', ' '));
            }
        } catch (Exception e) { return "[]"; }
        JSONArray a = new JSONArray();
        for (JSONObject o : m.values()) a.put(o);
        return a.toString();
    }

    /** agenda search (no import): Phone filter matches display name and number; groups numbers per contact, max lim contacts */
    static String search(Context ctx, String q, int lim) {
        JSONArray a = new JSONArray();
        if (q == null) return "[]"; q = q.trim(); if (q.isEmpty()) return "[]"; if (q.length() > 60) q = q.substring(0, 60);
        if (lim < 1 || lim > 50) lim = 20;
        Map<String, JSONObject> m = new LinkedHashMap<>();
        Uri u = Uri.withAppendedPath(ContactsContract.CommonDataKinds.Phone.CONTENT_FILTER_URI, Uri.encode(q));
        try (Cursor c = ctx.getContentResolver().query(u,
                new String[]{ ContactsContract.CommonDataKinds.Phone.CONTACT_ID, ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME, ContactsContract.CommonDataKinds.Phone.NUMBER },
                null, null, ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " COLLATE NOCASE ASC")) {
            if (c == null) return "[]";
            while (c.moveToNext()) {
                String id = c.getString(0), nm = c.getString(1), v = c.getString(2);
                if (id == null || v == null || v.trim().isEmpty()) continue;
                JSONObject o = m.get(id);
                if (o == null) { if (m.size() >= lim) continue; o = new JSONObject(); o.put("name", nm == null ? "" : nm); o.put("tel", new JSONArray()); m.put(id, o); }
                JSONArray t = o.getJSONArray("tel"); String tv = v.trim(); boolean have = false;
                for (int i = 0; i < t.length(); i++) if (t.optString(i).replaceAll("\\D", "").equals(tv.replaceAll("\\D", ""))) have = true;
                if (!have && t.length() < 3) t.put(tv);
            }
        } catch (Exception e) { return "[]"; }
        for (JSONObject o : m.values()) a.put(o);
        return a.toString();
    }
}
