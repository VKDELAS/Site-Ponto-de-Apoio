import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Transacao {
  id: string;
  tipo: 'ganho' | 'pagamento' | 'gasto';
  valor: number;
  data: string;
  descricao: string;
  autoAdicionado?: boolean;
}

const STORAGE_KEY = 'ponto-de-apoio-contas-backup';
const VALOR_DIARIO = 50;

// Mensagem de erro personalizada conforme solicitado
const ERROR_MESSAGE = "Ops! Ocorreu um erro ao salvar os dados. Verifique sua conexão ou tente novamente mais tarde.";

export function useContas() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  async function carregarDados() {
    if (!user) return;

    try {
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('userid', user.id)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });

      if (transacoesError) {
        console.error('Erro ao carregar:', transacoesError);
        throw transacoesError;
      }

      const transacoesAtuais = transacoesData?.map(t => ({
        id: t.id,
        tipo: t.tipo,
        valor: typeof t.valor === 'string' ? parseFloat(t.valor) : t.valor,
        data: t.data,
        descricao: t.descricao,
        autoAdicionado: t.auto_adicionado
      })) || [];

      setTransacoes(transacoesAtuais);
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(transacoesAtuais));
    } catch (e) {
      console.error('Erro no Supabase ao carregar:', e);
      const backup = localStorage.getItem(`${STORAGE_KEY}_${user?.id}`);
      if (backup) setTransacoes(JSON.parse(backup));
      toast.error("Não foi possível carregar os dados do servidor. Usando backup local.");
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [user?.id]);

  const alternarDiaTrabalhado = async (data: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    const diaExistente = transacoes.find(
      t => t.tipo === 'ganho' && t.data === data && t.autoAdicionado
    );

    if (diaExistente) {
      try {
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .eq('id', diaExistente.id);

        if (error) throw error;
        
        setTransacoes(prev => prev.filter(t => t.id !== diaExistente.id));
        toast.success(`Dia ${data.split('-').reverse().join('/')} removido`);
      } catch (e: any) {
        console.error('Erro ao remover dia:', e);
        toast.error(ERROR_MESSAGE);
      }
    } else {
      try {
        const { data: inserido, error } = await supabase
          .from('transacoes')
          .insert([{
            userid: user.id,
            tipo: 'ganho',
            valor: VALOR_DIARIO,
            data: data,
            descricao: `Ganho automático do dia ${data}`,
            auto_adicionado: true,
          }])
          .select()
          .single();

        if (error) throw error;
        
        if (inserido) {
          setTransacoes(prev => [{
            id: inserido.id,
            tipo: 'ganho',
            valor: typeof inserido.valor === 'string' ? parseFloat(inserido.valor) : inserido.valor,
            data: inserido.data,
            descricao: inserido.descricao,
            autoAdicionado: true
          }, ...prev]);
          toast.success(`Dia ${data.split('-').reverse().join('/')} marcado como trabalhado (+R$50)`);
        }
      } catch (e: any) {
        console.error('Erro ao marcar dia:', e);
        toast.error(ERROR_MESSAGE);
      }
    }
  };

  const adicionarPagamento = async (valor: number, data: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }
    try {
      const { data: inserido, error } = await supabase.from('transacoes').insert([{
        userid: user.id,
        tipo: 'pagamento',
        valor,
        data,
        descricao: `Pagamento recebido em ${data}`,
      }]).select().single();

      if (error) throw error;
      
      if (inserido) {
        setTransacoes(prev => [{
          id: inserido.id,
          tipo: 'pagamento',
          valor: typeof inserido.valor === 'string' ? parseFloat(inserido.valor) : inserido.valor,
          data: inserido.data,
          descricao: inserido.descricao,
        }, ...prev]);
        toast.success(`Pagamento de R$ ${valor.toFixed(2)} registrado`);
      }
    } catch (e: any) {
      console.error('Erro ao salvar pagamento:', e);
      toast.error(ERROR_MESSAGE);
    }
  };

  const adicionarGasto = async (valor: number, data: string, descricao: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }
    try {
      const { data: inserido, error } = await supabase.from('transacoes').insert([{
        userid: user.id,
        tipo: 'gasto',
        valor,
        data,
        descricao,
      }]).select().single();

      if (error) throw error;
      
      if (inserido) {
        setTransacoes(prev => [{
          id: inserido.id,
          tipo: 'gasto',
          valor: typeof inserido.valor === 'string' ? parseFloat(inserido.valor) : inserido.valor,
          data: inserido.data,
          descricao: inserido.descricao,
        }, ...prev]);
        toast.success(`Gasto de R$ ${valor.toFixed(2)} registrado`);
      }
    } catch (e: any) {
      console.error('Erro ao salvar gasto:', e);
      toast.error(ERROR_MESSAGE);
    }
  };

  const deletarTransacao = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTransacoes(prev => prev.filter(t => t.id !== id));
      toast.success('Transação removida com sucesso');
    } catch (e) {
      console.error('Erro ao deletar transação:', e);
      toast.error(ERROR_MESSAGE);
    }
  };

  const adicionarDinheiroInicial = async (valor: number, descricao: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }
    const agora = new Date();
    const hoje = agora.getFullYear() + '-' + 
                 String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(agora.getDate()).padStart(2, '0');

    try {
      const { data: inserido, error } = await supabase.from('transacoes').insert([{
        userid: user.id,
        tipo: 'ganho',
        valor,
        data: hoje,
        descricao: descricao || 'Dinheiro inicial adicionado',
        auto_adicionado: false,
      }]).select().single();

      if (error) throw error;
      
      if (inserido) {
        setTransacoes(prev => [{
          id: inserido.id,
          tipo: 'ganho',
          valor: typeof inserido.valor === 'string' ? parseFloat(inserido.valor) : inserido.valor,
          data: inserido.data,
          descricao: inserido.descricao,
        }, ...prev]);
        toast.success(`R$ ${valor.toFixed(2)} adicionado ao saldo`);
      }
    } catch (e: any) {
      console.error('Erro ao adicionar saldo:', e);
      toast.error(ERROR_MESSAGE);
    }
  };

  const totalGanhos = transacoes.filter(t => t.tipo === 'ganho').reduce((sum, t) => sum + t.valor, 0);
  const totalPagamentos = transacoes.filter(t => t.tipo === 'pagamento').reduce((sum, t) => sum + t.valor, 0);
  const totalGastos = transacoes.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + t.valor, 0);
  const saldo = totalGanhos - totalPagamentos - totalGastos;

  return {
    data: { transacoes },
    isLoaded,
    adicionarPagamento,
    adicionarGasto,
    adicionarDinheiroInicial,
    deletarTransacao,
    alternarDiaTrabalhado,
    totalGanhos,
    totalPagamentos,
    totalGastos,
    saldo,
    recarregar: carregarDados
  };
}
