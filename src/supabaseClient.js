import { createClient } from '@supabase/supabase-js';

// Lê das variáveis de ambiente da Vercel ou usa fallback seguro
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://edluuvfivrykzfgvsmgi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
