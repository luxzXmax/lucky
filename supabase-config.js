// Konfigurasi koneksi ke Supabase
// anon/publishable key ini AMAN untuk ditaruh di kode publik —
// akses tulis/hapus data tetap dikontrol oleh Row Level Security (RLS) di database.

const SUPABASE_URL = "https://jsilydrkfkldgistczgo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-q8N89PT_am7fJDrgJ-7og_nxf42diB";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
