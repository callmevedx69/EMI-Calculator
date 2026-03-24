// Prevent redeclaration
if (!window.supabaseClient) {
  const SUPABASE_URL = "https://xdtzonhcrznfvvypmvgea.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdHpvbmhjcnpuZnZweW12Z2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTQ2MzIsImV4cCI6MjA4OTkzMDYzMn0.YiCB30614y510ZrluNngR42B-bzMdCjkeTC5dKb1kZk";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bit8qL6Ke2Gz2_ZdyE_ydA_jSzuQvcN";

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  );
}
