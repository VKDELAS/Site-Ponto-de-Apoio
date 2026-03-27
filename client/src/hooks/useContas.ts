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

export function useContas() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function carregarDados() {
    if (!user) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transacoesFormatadas: Transacao[] = (data || []).map(t => ({
        id: t.id,
        tipo: t.tipo as 'ganho' | 'pagamento' | 'gasto',
        valor: Number(t.valor),
        data: t.data,
        descricao: t.descricao || '',
        autoAdicionado: t.auto_adicionado
      }));

      setTransacoes(transacoesFormatadas);
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(transacoesFormatadas));
    } catch (e: any) {
      console.error('[Erro ao carregar dados]', e);
      
      const backup = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (backup) {
        setTransacoes(JSON.parse(backup));
        toast.warning('Exibindo dados em cache (offline).');
      } else {
        toast.error('Erro ao carregar dados do servidor.');
      }
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [user?.id]);

  const alternarDiaTrabalhado = async (data: string) => {
    if (!user) return;

    const diaExistente = transacoes.find(
      t => t.tipo === 'ganho' && t.data === data && t.autoAdicionado
    );

    if (diaExistente) {
      try {
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .eq('id', diaExistente.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setTransacoes(prev => prev.filter(t => t.id !== diaExistente.id));
        toast.success(`Dia ${data.split('-').reverse().join('/')} removido`);
      } catch (e: any) {
        toast.error('Erro ao remover dia trabalhado.');
      }
    } else {
      try {
        const { data: inserido, error } = await supabase
          .from('transacoes')
          .insert([{
            user_id: user.id,
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
          const novaTransacao: Transacao = {
            id: inserido.id,
            tipo: 'ganho',
            valor: Number(inserido.valor),
            data: inserido.data,
            descricao: inserido.descricao,
            autoAdicionado: true
          };
          setTransacoes(prev => [novaTransacao, ...prev]);
          toast.success(`Dia ${data.split('-').reverse().join('/')} marcado (+R$50)`);
        }
      } catch (e: any) {
        toast.error('Erro ao marcar dia trabalhado.');
      }
    }
  };

  const adicionarPagamento = async (valor: number, data: string) => {
    if (!user) return;

    try {
      const { data: inserido, error } = await supabase
        .from('transacoes')
        .insert([{
          user_id: user.id,
          tipo: 'pagamento',
          valor,
          data,
          descricao: `Pagamento recebido em ${data}`,
        }])
        .select()
        .single();

      if (error) throw error;

      if (inserido) {
        const novaTransacao: Transacao = {
          id: inserido.id,
          tipo: 'pagamento',
          valor: Number(inserido.valor),
          data: inserido.data,
          descricao: inserido.descricao,
        };
        setTransacoes(prev => [novaTransacao, ...prev]);
        toast.success(`Pagamento de R$ ${valor.toFixed(2)} registrado`);
      }
    } catch (e: any) {
      toast.error('Erro ao salvar pagamento.');
    }
  };

  const adicionarGasto = async (valor: number, data: string, descricao: string) => {
    if (!user) return;

    try {
      const { data: inserido, error } = await supabase
        .from('transacoes')
        .insert([{
          user_id: user.id,
          tipo: 'gasto',
          valor,
          data,
          descricao,
        }])
        .select()
        .single();

      if (error) throw error;

      if (inserido) {
        const novaTransacao: Transacao = {
          id: inserido.id,
          tipo: 'gasto',
          valor: Number(inserido.valor),
          data: inserido.data,
          descricao: inserido.descricao,
        };
        setTransacoes(prev => [novaTransacao, ...prev]);
        toast.success(`Gasto de R$ ${valor.toFixed(2)} registrado`);
      }
    } catch (e: any) {
      toast.error('Erro ao salvar gasto.');
    }
  };

  const deletarTransacao = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransacoes(prev => prev.filter(t => t.id !== id));
      toast.success('Transação removida com sucesso');
    } catch (e: any) {
      toast.error('Erro ao deletar transação.');
    }
  };

  const adicionarDinheiroInicial = async (valor: number, descricao: string) => {
    if (!user) return;

    const hoje = new Date().toISOString().split('T')[0];

    try {
      const { data: inserido, error } = await supabase
        .from('transacoes')
        .insert([{
          user_id: user.id,
          tipo: 'ganho',
          valor,
          data: hoje,
          descricao: descricao || 'Dinheiro inicial adicionado',
          auto_adicionado: false,
        }])
        .select()
        .single();

      if (error) throw error;

      if (inserido) {
        const novaTransacao: Transacao = {
          id: inserido.id,
          tipo: 'ganho',
          valor: Number(inserido.valor),
          data: inserido.data,
          descricao: inserido.descricao,
        };
        setTransacoes(prev => [novaTransacao, ...prev]);
        toast.success(`R$ ${valor.toFixed(2)} adicionado ao saldo`);
      }
    } catch (e: any) {
      toast.error('Erro ao adicionar saldo inicial.');
    }
  };

  const totalGanhos = transacoes.filter(t => t.tipo === 'ganho').reduce((sum, t) => sum + t.valor, 0);
  const totalPagamentos = transacoes.filter(t => t.tipo === 'pagamento').reduce((sum, t) => sum + t.valor, 0);
  const totalGastos = transacoes.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + t.valor, 0);
  const saldo = totalGanhos - totalPagamentos - totalGastos;

  return {
    data: { transacoes },
    isLoaded,
    isLoading,
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
