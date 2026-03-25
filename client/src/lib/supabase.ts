import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// O cliente é criado mesmo com placeholders para evitar quebras de runtime, 
// mas as chamadas falharão silenciosamente ou serão tratadas no hook.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
