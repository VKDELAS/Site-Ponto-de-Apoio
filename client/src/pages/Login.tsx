import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Lock, Mail, ArrowRight, Chrome, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
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
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro Google OAuth:', error);
      let mensagem = error.message || 'Erro ao conectar com Google';
      
      if (mensagem.includes('placeholder.supabase.co') || mensagem.includes('Failed to fetch')) {
        mensagem = 'Erro de conexão: O Supabase não está configurado corretamente. Verifique seu arquivo .env';
      }
      
      toast.error(mensagem);
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
              {/* Campo Email */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">E-mail Corporativo</Label>
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-all duration-300" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-black/40 border-white/5 focus:border-[#FFD700]/50 h-14 pl-12 text-white placeholder:text-gray-700 font-medium transition-all duration-300 rounded-xl hover:bg-black/50 hover:border-white/10 focus:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:shadow-[inset_0_2px_8px_rgba(255,215,0,0.1),0_0_20px_rgba(255,215,0,0.1)]"
                    required
                  />
                  {email && emailValido && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>

              {/* Campo Senha */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Senha de Acesso</Label>
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-all duration-300" />
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="bg-black/40 border-white/5 focus:border-[#FFD700]/50 h-14 pl-12 pr-12 text-white placeholder:text-gray-700 font-medium transition-all duration-300 rounded-xl hover:bg-black/50 hover:border-white/10 focus:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:shadow-[inset_0_2px_8px_rgba(255,215,0,0.1),0_0_20px_rgba(255,215,0,0.1)]"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    whileHover={{ scale: 1.1 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FFD700] transition-colors duration-300"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Campo Confirmar Senha (apenas em cadastro) */}
              <AnimatePresence>
                {modo === 'cadastro' && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Confirme a Senha</Label>
                    <motion.div 
                      className="relative group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-all duration-300" />
                      <Input
                        type={mostrarConfirmaSenha ? "text" : "password"}
                        value={confirmaSenha}
                        onChange={(e) => setConfirmaSenha(e.target.value)}
                        placeholder="••••••••"
                        className={`bg-black/40 border-white/5 focus:border-[#FFD700]/50 h-14 pl-12 pr-12 text-white placeholder:text-gray-700 font-medium transition-all duration-300 rounded-xl hover:bg-black/50 hover:border-white/10 focus:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:shadow-[inset_0_2px_8px_rgba(255,215,0,0.1),0_0_20px_rgba(255,215,0,0.1)] ${
                          confirmaSenha && !senhasIguais ? 'border-red-500/50 focus:border-red-500' : ''
                        }`}
                        required
                      />
                      <motion.button
                        type="button"
                        onClick={() => setMostrarConfirmaSenha(!mostrarConfirmaSenha)}
                        whileHover={{ scale: 1.1 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FFD700] transition-colors duration-300"
                      >
                        {mostrarConfirmaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.button>
                    </motion.div>
                    {confirmaSenha && !senhasIguais && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-red-500 text-[10px] font-bold"
                      >
                        <AlertCircle className="w-3 h-3" />
                        As senhas não conferem
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  type="submit"
                  disabled={carregando || (modo === 'cadastro' && !senhasIguais)}
                  className="w-full h-14 bg-[#FFD700] text-black font-black uppercase tracking-widest hover:bg-[#FFD700]/90 transition-all shadow-[0_10px_20px_rgba(255,215,0,0.15)] group rounded-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </motion.div>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#141414] px-4 text-gray-600 font-bold">Ou continue com</span>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-14 bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-[#FFD700]/30 transition-all rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_0_20px_rgba(255,215,0,0.1)]"
              >
                <Chrome className="w-5 h-5 text-[#FFD700]" />
                Google Account
              </Button>
            </motion.div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <motion.button
                onClick={() => {
                  setModo(modo === 'login' ? 'cadastro' : 'login');
                  setEmail('');
                  setSenha('');
                  setConfirmaSenha('');
                }}
                whileHover={{ scale: 1.05 }}
                className="text-[11px] font-black text-gray-500 hover:text-[#FFD700] uppercase tracking-widest transition-colors"
              >
                {modo === 'login' ? (
                  <>Não possui credenciais? <span className="text-[#FFD700] ml-1 underline underline-offset-4">Solicite Acesso</span></>
                ) : (
                  <>Já possui credenciais? <span className="text-[#FFD700] ml-1 underline underline-offset-4">Voltar ao Login</span></>
                )}
              </motion.button>
            </div>
          </div>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.6em] pointer-events-none">
            Industrial Management System v3.1
          </p>
        </div>
      </motion.div>
    </div>
  );
}
