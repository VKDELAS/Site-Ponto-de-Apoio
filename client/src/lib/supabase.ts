import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação robusta das variáveis de ambiente
function validarConfiguracao() {
  const erros: string[] = [];

  if (!supabaseUrl) {
    erros.push('VITE_SUPABASE_URL não está definida');
  } else if (supabaseUrl.includes('placeholder')) {
    erros.push('VITE_SUPABASE_URL contém "placeholder" - não foi configurada corretamente');
  }

  if (!supabaseAnonKey) {
    erros.push('VITE_SUPABASE_ANON_KEY não está definida');
  } else if (supabaseAnonKey.includes('placeholder')) {
    erros.push('VITE_SUPABASE_ANON_KEY contém "placeholder" - não foi configurada corretamente');
  }

  if (erros.length > 0) {
    console.error('[Supabase Config] Erros de configuração encontrados:');
    erros.forEach(erro => console.error(`  - ${erro}`));
    console.error('[Supabase Config] Verifique seu arquivo .env.local com as seguintes variáveis:');
    console.error('  VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
    console.error('  VITE_SUPABASE_ANON_KEY=sua-chave-anonima');
    return false;
  }

  console.log('[Supabase Config] Configuração validada com sucesso');
  console.log(`[Supabase Config] URL: ${supabaseUrl}`);
  return true;
}

// Validar configuração na inicialização
const isConfigured = validarConfiguracao();

// Criar cliente com URL e chave válidas ou placeholders seguros
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Exportar status de configuração para uso em componentes
export const isSupabaseConfigured = isConfigured;
