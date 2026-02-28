// IMPORTANT: Update these with your Supabase credentials
// Get from: Supabase Dashboard -> Settings -> API

const SUPABASE_URL = 'https://jbrwphlrmuaiyslfldwd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicndwaGxybXVhaXlzbGZsZHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxOTc3NDIsImV4cCI6MjA4Nzc3Mzc0Mn0.8CqzPYItp7H_YF-CdmHT2zxZtOJ3w3ufj44Ny76NOh8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
