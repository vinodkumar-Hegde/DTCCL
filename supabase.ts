
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Use placeholder values to prevent the "supabaseUrl is required" crash if env vars are missing.
// This allows the app to load and show warnings instead of a white screen.
const finalUrl = supabaseUrl || 'https://your-project.supabase.co';
const finalKey = supabaseAnonKey || 'your-anon-key';

export const supabase = createClient(finalUrl, finalKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. The app will fallback to mock data. ' +
    'To enable the cloud registry, please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
    'to your environment variables in the Settings menu.'
  );
}
