// Supabase Configuration
const SUPABASE_URL = 'https://giibaipwfspznegckkld.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpaWJhaXB3ZnNwem5lZ2Nra2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODc1NDAsImV4cCI6MjA4NjU2MzU0MH0.oiDHHhVbl1M7KuYQAthrhUlQWPKOqTW3x7utTYrEQcI';

// Initialize Supabase client using the global supabase object from CDN
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Also expose globally for other scripts
window.supabaseClient = supabaseClient;
