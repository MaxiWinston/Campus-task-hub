import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://CampuSTaskHubBackend.co'; // Make sure this is the correct project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Ym15dWJ4ZmptdmFlZWVzaXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDk4ODYsImV4cCI6MjA2OTU4NTg4Nn0.Ll14_X9herw-zha0dNumz4xJqLtQxubFgd9rfiY2zHE'; //anon public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
