import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { toast } from 'sonner';
import { User, Lock, Mail, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmaSenha, setMostrarConfirmaSenha] = useState(false);

  // Validações
  const senhasIguais = modo === 'cadastro' ? senha === confirmaSenha && senha.length > 0 : true;
  const senhaValida = senha.length >= 6;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValido) {
      toast.error('Email inválido');
      return;
    }

    if (modo === 'cadastro') {
      if (!senhaValida) {
        toast.error('Senha deve ter no mínimo 6 caracteres');
        return;
      }
      if (!senhasIguais) {
        toast.error('As senhas não conferem');
        return;
      }
    }

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
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (signUpError) throw signUpError;
        
        // Fazer login automático após cadastro
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        if (signInError) throw signInError;
        
        toast.success('Cadastro realizado com sucesso! Bem-vindo!');
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      let mensagem = error.message || 'Erro na autenticação';
      
      if (mensagem.includes('placeholder.supabase.co') || mensagem.includes('Failed to fetch')) {
        mensagem = 'Erro de conexão: O Supabase não está configurado corretamente. Verifique seu arquivo .env';
      }
      
      toast.error(mensagem);
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
      if (error) {
        console.error('Erro Google OAuth:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Erro Google OAuth completo:', error);
      let mensagem = error.message || 'Erro ao conectar com Google';
      
      if (mensagem.includes('placeholder.supabase.co') || mensagem.includes('Failed to fetch')) {
        mensagem = 'Erro de conexao: O Supabase nao esta configurado corretamente. Verifique seu arquivo .env';
      } else if (mensagem.includes('validation_failed') || mensagem.includes('Unsupported provider')) {
        mensagem = 'Google nao esta habilitado. Va em: Supabase Dashboard > Authentication > Providers > Google, desative e ative novamente, depois clique em SAVE.';
      }
      
      toast.error(mensagem);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorativo Estático (Melhora Performance) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#FFD700] opacity-[0.05] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#FFD700] opacity-[0.08] rounded-full blur-[150px]" />
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
              {/* Campo Email com Label Flutuante */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <FloatingLabelInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  showCheckmark={false}
                  isValid={emailValido && email.length > 0}
                  autoComplete="email"
                  required
                />
              </motion.div>

              {/* Campo Senha com Label Flutuante */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FloatingLabelInput
                  label="Senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  showVisibilityToggle={true}
                  onVisibilityToggle={() => setMostrarSenha(!mostrarSenha)}
                  isPasswordVisible={mostrarSenha}
                  autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </motion.div>

              {/* Campo Confirmar Senha (apenas em cadastro) */}
              <AnimatePresence>
                {modo === 'cadastro' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FloatingLabelInput
                      label="Confirme a Senha"
                      type="password"
                      value={confirmaSenha}
                      onChange={(e) => setConfirmaSenha(e.target.value)}
                      icon={<Lock className="w-4 h-4" />}
                      showVisibilityToggle={true}
                      onVisibilityToggle={() => setMostrarConfirmaSenha(!mostrarConfirmaSenha)}
                      isPasswordVisible={mostrarConfirmaSenha}
                      autoComplete="new-password"
                      required
                    />
                    {confirmaSenha && !senhasIguais && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs font-bold mt-2 ml-1"
                      >
                        ✗ As senhas não conferem
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botão de Envio */}
              <motion.button
                type="submit"
                disabled={carregando}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#FFD700] text-black h-14 font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-6"
              >
                {carregando ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.span>
                ) : (
                  modo === 'login' ? 'Entrar' : 'Criar Conta'
                )}
              </motion.button>

              {/* Botão Google */}
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={carregando}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/10 text-white h-14 font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 border border-white/20"
              >
                <Chrome className="w-5 h-5" />
                Entrar com Google
              </motion.button>
            </form>

            {/* Alternador de Modo */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {modo === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <motion.button
                  type="button"
                  onClick={() => {
                    setModo(modo === 'login' ? 'cadastro' : 'login');
                    setEmail('');
                    setSenha('');
                    setConfirmaSenha('');
                  }}
                  whileHover={{ scale: 1.05 }}
                  className="text-[#FFD700] font-black ml-2 hover:underline transition-all"
                >
                  {modo === 'login' ? 'Cadastre-se' : 'Faça Login'}
                </motion.button>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
