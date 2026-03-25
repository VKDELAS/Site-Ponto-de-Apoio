import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error('ERRO: Variáveis de ambiente do Supabase não configuradas!');
  if (typeof window !== 'undefined') {
    // Apenas um alerta no console para desenvolvedores, o erro de rede será capturado pelo catch no Login.tsx
    console.warn('Por favor, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu arquivo .env');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
