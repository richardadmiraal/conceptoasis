// Supabase project settings for the private reports page.
// The anon key is meant to be public: the database rules (supabase/schema.sql) decide who sees what.
// Richard: paste the Project URL and anon public key from Supabase > Project Settings > API.
window.REPORTS_CONFIG = {
  url: '',      // e.g. 'https://abcd1234.supabase.co'
  anonKey: ''   // the long "anon public" key
};
