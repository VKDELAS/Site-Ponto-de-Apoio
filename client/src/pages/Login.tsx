

Iniciar teste gratuito

Compartilhar
Estou analisando a estrutura do login atual em Login.tsx para planejar o redesenho com cores amarelo/preto, animações e integração com Supabase.

Analisando o arquivo de configuração do Supabase e o hook de contas, confirmei que as chamadas estão corretas. A próxima etapa é desenhar a tela de login com cores amarelo/preto, animações fluídas usando Framer Motion, e planejar a integração visual com o Supabase.

Identifiquei que o ambiente usa Node e pnpm, então tentei instalar dependências com pnpm sem sudo, mas o comando não foi encontrado. Preciso ajustar o ambiente para continuar.

Resolvi o problema do ambiente, instalando dependências com pnpm sem sudo. Agora posso avançar na implementação da tela de login com animações profissionais e integração ao Supabase.

Lite
Já redesenhei sua tela de login com um visual profissional em amarelo e preto, adicionei animações suaves com Framer Motion e incluí o botão de login com Google.
Agora, para que o login do Google e o isolamento de dados funcionem, preciso que você me envie aquele comando que o Manus anterior pediu. Provavelmente é o comando para configurar as tabelas e as políticas de segurança (RLS) no seu banco de dados Supabase. Pode mandar?
-- 1. Criar a tabela de transações com user_id
CREATE TABLE IF NOT EXISTS transacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('ganho', 'pagamento', 'gasto')),
    valor DECIMAL(12,2) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    auto_adicionado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Criar a tabela de metadados com user_id
CREATE TABLE IF NOT EXISTS metadados (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chave TEXT NOT NULL,
    valor TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, chave)
);

-- 3. Habilitar RLS (Row Level Security) para isolamento total
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadados ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para a tabela de transacoes
DROP POLICY IF EXISTS "Usuários podem ver suas próprias transações" ON transacoes;
CREATE POLICY "Usuários podem ver suas próprias transações" ON transacoes 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias transações" ON transacoes;
CREATE POLICY "Usuários podem inserir suas próprias transações" ON transacoes 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias transações" ON transacoes;
CREATE POLICY "Usuários podem atualizar suas próprias transações" ON transacoes 
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias transações" ON transacoes;
CREATE POLICY "Usuários podem deletar suas próprias transações" ON transacoes 
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Políticas para a tabela de metadados
DROP POLICY IF EXISTS "Usuários podem ver seus próprios metadados" ON metadados;
CREATE POLICY "Usuários podem ver seus próprios metadados" ON metadados 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios metadados" ON metadados;
CREATE POLICY "Usuários podem inserir seus próprios metadados" ON metadados 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios metadados" ON metadados;
CREATE POLICY "Usuários podem atualizar seus próprios metadados" ON metadados 
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo_data_user ON transacoes(tipo, data, user_id);
Lite
Perfeito! Esse script SQL é exatamente o que faltava para garantir que cada usuário tenha seus próprios dados isolados e seguros no Supabase.
Vou agora finalizar a integração no código para que o sistema utilize essas tabelas corretamente e preparar o guia passo a passo para você configurar o Google OAuth no seu painel do Supabase. Segura aí!
Consegui integrar o login com Google e garantir isolamento de dados usando o script SQL adequado. Agora, vou finalizar a implementação e preparar o guia de configuração do OAuth.

ja mandei esse codigo ai, se voce quiser que eu rode outro manda outro pf
Lite
O código que você mandou é perfeito! Ele é exatamente o que precisamos para garantir que cada usuário tenha seus próprios dados isolados e seguros.
Já terminei de atualizar seu projeto. Aqui está o que eu fiz:
Nova Tela de Login Profissional: Redesenhei tudo com as cores Amarelo (#FFD700) e Preto, usando animações modernas com a biblioteca framer-motion.
Integração com Google: Adicionei o botão de login social e configurei a lógica para conectar com o Supabase.
Isolamento de Dados: Atualizei o sistema para que cada usuário veja apenas o seu próprio dinheiro e transações, usando o script SQL que você forneceu.
Correção do "Failed to Fetch": Ajustei a configuração do Supabase para evitar erros de conexão e adicionei redirecionamentos corretos.
Para finalizar, preparei um Guia Passo a Passo em anexo explicando como você configura o Google no painel do Supabase e onde colar aquele código SQL que você me mandou.
Dê uma olhada nos arquivos abaixo! Se precisar de mais alguma coisa, é só falar.
Finalizei a integração do login com Google, garantindo isolamento de dados por usuário via SQL. Preparei o guia de configuração do OAuth no Supabase.

Lite
Seu projeto foi atualizado com sucesso! A tela de login foi redesenhada para um visual profissional em amarelo e preto, com animações e integração para login com Google. Além disso, o sistema agora garante o isolamento de dados por usuário, utilizando o script SQL que você forneceu.
Para que tudo funcione perfeitamente, siga as instruções no arquivo GUIA_SUPABASE_GOOGLE.md para configurar o Google OAuth no seu painel do Supabase e aplicar o script SQL.
Os arquivos modificados e o guia estão anexados. Se tiver mais alguma dúvida ou precisar de ajustes, é só me avisar!
Login.tsx
Código · 9.03 KB
useContas.ts
Código · 6.54 KB
Guia de Configuração: Google OAuth no Supabase
Markdown · 4.91 KB
Ver todos os arquivos nesta tarefa
Tarefa concluída
Como foi este resultado?
Sugestões de acompanhamento




Login.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Lock, Mail, ArrowRight, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      if (modo === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        if (error) throw error;
        toast.success('Bem-vindo de volta!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        toast.success('Cadastro realizado! Verifique seu e-mail para confirmar.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação');
    } finally {
      setCarregando(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Erro ao conectar com Google');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorativo Dinâmico */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#FFD700] rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#FFD700] rounded-full blur-[150px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-[#141414]/90 backdrop-blur-xl border-[#FFD700]/20 border shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-[#FFD700] rounded-2xl mb-6 shadow-[0_0_30px_rgba(255,215,0,0.3)]"
              >
                <User className="w-10 h-10 text-black" />
              </motion.div>
              
              <h1 className="text-4xl font-black text-[#FFD700] tracking-tighter uppercase italic leading-none">
                PONTO DE APOIO
              </h1>
              <div className="h-1.5 w-24 bg-[#FFD700] mx-auto mt-3 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
              
              <AnimatePresence mode="wait">
                <motion.p 
                  key={modo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.4em] mt-6"
                >
                  {modo === 'login' ? 'Gestão de Contas Industrial' : 'Crie sua Credencial de Acesso'}
                </motion.p>
              </AnimatePresence>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">E-mail Corporativo</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-black/40 border-white/5 focus:border-[#FFD700]/50 h-14 pl-12 text-white placeholder:text-gray-700 font-medium transition-all rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Senha de Acesso</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                  <Input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="bg-black/40 border-white/5 focus:border-[#FFD700]/50 h-14 pl-12 text-white placeholder:text-gray-700 font-medium transition-all rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={carregando}
                className="w-full h-14 bg-[#FFD700] text-black font-black uppercase tracking-widest hover:bg-[#FFD700]/90 transition-all shadow-[0_10px_20px_rgba(255,215,0,0.15)] group rounded-xl mt-2"
              >
                {carregando ? (
                  <span className="flex items-center gap-2">
                    <motion.span 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full" 
                    />
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {modo === 'login' ? 'AUTENTICAR' : 'REGISTRAR'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#141414] px-4 text-gray-600 font-bold">Ou continue com</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-14 bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-[#FFD700]/30 transition-all rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-3"
            >
              <Chrome className="w-5 h-5 text-[#FFD700]" />
              Google Account
            </Button>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <button
                onClick={() => setModo(modo === 'login' ? 'cadastro' : 'login')}
                className="text-[11px] font-black text-gray-500 hover:text-[#FFD700] uppercase tracking-widest transition-colors"
              >
                {modo === 'login' ? (
                  <>Não possui credenciais? <span className="text-[#FFD700] ml-1 underline underline-offset-4">Solicite Acesso</span></>
                ) : (
                  <>Já possui credenciais? <span className="text-[#FFD700] ml-1 underline underline-offset-4">Voltar ao Login</span></>
                )}
              </button>
            </div>
          </div>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.6em] pointer-events-none">
            Industrial Management System v3.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
