import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';

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
        });
        if (error) throw error;
        toast.success('Cadastro realizado! Verifique seu e-mail.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-accent/30 border-2 p-8 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4 rotate-3 shadow-lg shadow-accent/20">
            <User className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-black text-accent tracking-tighter uppercase italic">PONTO DE APOIO</h1>
          <div className="h-1 w-20 bg-accent mx-auto mt-2 rounded-full" />
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] mt-4">
            {modo === 'login' ? 'Gestão de Contas Industrial' : 'Crie sua Credencial de Acesso'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail Corporativo</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-secondary/50 border-border focus:border-accent h-12 pl-10 font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Senha de Acesso</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary/50 border-border focus:border-accent h-12 pl-10 font-medium"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={carregando}
            className="w-full h-14 bg-accent text-accent-foreground font-black uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 group"
          >
            {carregando ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {modo === 'login' ? 'AUTENTICAR' : 'REGISTRAR'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <button
            onClick={() => setModo(modo === 'login' ? 'cadastro' : 'login')}
            className="text-[10px] font-black text-muted-foreground hover:text-accent uppercase tracking-widest transition-colors"
          >
            {modo === 'login' ? 'Não possui credenciais? Solicite Acesso' : 'Já possui credenciais? Voltar ao Login'}
          </button>
        </div>
      </Card>
      
      <div className="fixed bottom-4 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.5em] pointer-events-none">
        Industrial Management System v2.0
      </div>
    </div>
  );
}
