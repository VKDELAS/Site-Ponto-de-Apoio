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

// Classe customizada para tratamento de erros
class SupabaseError extends Error {
  constructor(
    public code: string,
    public originalError: any,
    message: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Função para traduzir e tratar erros do Supabase
function tratarErroSupabase(erro: any, contexto: string): string {
  console.error(`[${contexto}] Erro completo:`, erro);

  if (!erro) {
    return 'Erro desconhecido ao processar a solicitação.';
  }

  // Erros de autenticação
  if (erro.message?.includes('401') || erro.message?.includes('Unauthorized')) {
    console.warn('[Auth] Sessão expirada ou inválida');
    return 'Sua sessão expirou. Por favor, faça login novamente.';
  }

  // Erros de permissão RLS
  if (erro.message?.includes('403') || erro.message?.includes('permission denied') || erro.code === 'PGRST301') {
    console.warn('[RLS] Erro de permissão - possível problema com RLS');
    return 'Você não tem permissão para realizar esta ação. Verifique as políticas de segurança do banco de dados.';
  }

  // Erros de schema/coluna
  if (erro.message?.includes('column') || erro.code === 'PGRST204' || erro.message?.includes('schema cache')) {
    console.warn('[Schema] Erro de coluna ou schema não encontrado');
    return 'Erro ao acessar os dados do servidor. Tente novamente em alguns momentos.';
  }

  // Erros de conexão
  if (erro.message?.includes('Failed to fetch') || erro.message?.includes('network') || erro.message?.includes('placeholder')) {
    console.warn('[Network] Erro de conexão com o servidor');
    return 'Erro de conexão com o servidor. Verifique sua internet e as configurações do Supabase.';
  }

  // Erros de validação
  if (erro.message?.includes('violates') || erro.message?.includes('constraint')) {
    console.warn('[Validation] Erro de validação de dados');
    return 'Os dados fornecidos são inválidos. Verifique e tente novamente.';
  }

  // Erro genérico com mensagem do servidor
  if (erro.message) {
    console.warn('[Generic] Mensagem do servidor:', erro.message);
    return `Erro ao processar: ${erro.message}`;
  }

  return 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.';
}

export function useContas() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function carregarDados() {
    if (!user) {
      console.log('[Load] Usuário não autenticado, pulando carregamento');
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    console.log(`[Load] Iniciando carregamento de dados para usuário: ${user.id}`);

    try {
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('userid', user.id)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });

      if (transacoesError) {
        throw new SupabaseError(transacoesError.code || 'UNKNOWN', transacoesError, 'Erro ao carregar transações');
      }

      console.log(`[Load] Carregadas ${transacoesData?.length || 0} transações com sucesso`);

      const transacoesAtuais = transacoesData?.map(t => ({
        id: t.id,
        tipo: t.tipo as 'ganho' | 'pagamento' | 'gasto',
        valor: typeof t.valor === 'string' ? parseFloat(t.valor) : t.valor,
        data: t.data,
        descricao: t.descricao,
        autoAdicionado: t.auto_adicionado
      })) || [];

      setTransacoes(transacoesAtuais);
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(transacoesAtuais));
      console.log('[Load] Dados salvos no localStorage com sucesso');
    } catch (e: any) {
      console.error('[Load] Erro ao carregar do Supabase:', e);
      
      // Tentar carregar do backup local
      const backup = localStorage.getItem(`${STORAGE_KEY}_${user?.id}`);
      if (backup) {
        try {
          const transacoesBackup = JSON.parse(backup);
          setTransacoes(transacoesBackup);
          console.log(`[Load] Carregadas ${transacoesBackup.length} transações do backup local`);
          toast.warning('Usando dados em cache. Verifique sua conexão com o servidor.');
        } catch (parseError) {
          console.error('[Load] Erro ao parsear backup local:', parseError);
          toast.error('Não foi possível carregar os dados. Tente fazer login novamente.');
        }
      } else {
        console.warn('[Load] Nenhum backup local disponível');
        toast.error(tratarErroSupabase(e, 'carregarDados'));
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
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    const diaExistente = transacoes.find(
      t => t.tipo === 'ganho' && t.data === data && t.autoAdicionado
    );

    if (diaExistente) {
      console.log(`[Delete] Removendo dia trabalhado: ${data}`);
      try {
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .eq('id', diaExistente.id)
          .eq('userid', user.id);

        if (error) throw new SupabaseError(error.code || 'UNKNOWN', error, 'Erro ao remover dia');

        setTransacoes(prev => prev.filter(t => t.id !== diaExistente.id));
        console.log('[Delete] Dia removido com sucesso');
        toast.success(`Dia ${data.split('-').reverse().join('/')} removido`);
      } catch (e: any) {
        console.error('[Delete] Erro ao remover dia:', e);
        toast.error(tratarErroSupabase(e, 'alternarDiaTrabalhado-delete'));
      }
    } else {
      console.log(`[Insert] Adicionando dia trabalhado: ${data}`);
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

        if (error) throw new SupabaseError(error.code || 'UNKNOWN', error, 'Erro ao inserir dia');

        if (inserido) {
          const novaTransacao: Transacao = {
            id: inserido.id,
            tipo: 'ganho',
            valor: typeof inserido.valor === 'string' ? parseFloat(inserido.valor) : inserido.valor,
            data: inserido.data,
            descricao: inserido.descricao,
            autoAdicionado: true
          };
          setTransacoes(prev => [novaTransacao, ...prev]);
          console.log('[Insert] Dia adicionado com sucesso');
          toast.success(`Dia ${data.split('-').reverse().join('/')} marcado como trabalhado (+R$50)`);
        }
      } catch (e: any) {
        console.error('[Insert] Erro ao marcar dia:', e);
        toast.error(tratarErroSupabase(e, 'alternarDiaTrabalhado-insert'));
      }
    }
  };

  const adicionarPagamento = async (valor: number, data: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    console.log(`[Insert] Adicionando pagamento: R$ ${valor} em ${data}`);

    try {
      const { data: inserido, error } = await supabase
        .from('transacoes')
        .insert([{
          userid: user.id,
          tipo: 'pagamento',
          valor,
          data,
          descricao: `Pagamento recebido em ${data}`,
        }])
        .select()
        .single();

      if (error) throw new SupabaseError(error.code || 'UNKNOWN', error, 'Erro ao inserir pagamento');

      if (inserido) {
        const novaTransacao: Transacao = {
          id: inserido.id,
          tipo: 'pagamento',
          valor: typeof inserido.valor === 'string' ? parseFloat(inserido.valor) : inserido.valor,
          data: inserido.data,
          descricao: inserido.descricao,
        };
        setTransacoes(prev => [novaTransacao, ...prev]);
        console.log('[Insert] Pagamento adicionado com sucesso');
        toast.success(`Pagamento de R$ ${valor.toFixed(2)} registrado`);
      }
    } catch (e: any) {
      console.error('[Insert] Erro ao salvar pagamento:', e);
      toast.error(tratarErroSupabase(e, 'adicionarPagamento'));
    }
  };

  const adicionarGasto = async (valor: number, data: string, descricao: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    console.log(`[Insert] Adicionando gasto: R$ ${valor} em ${data} - ${descricao}`);

    try {
      const { data: inserido, error } = await supabase
        .from('transacoes')
        .insert([{
          userid: user.id,
          tipo: 'gasto',
          valor,
          data,
          descricao,
        }])
        .select()
        .single();

      if (error) throw new SupabaseError(error.code || 'UNKNOWN', error, 'Erro ao inserir gasto');

      if (inserido) {
        const novaTransacao: Transacao = {
          id: inserido.id,
          tipo: 'gasto',
          valor: typeof inserido.valor === 'string' ? parseFloat(inserido.valor) : inserido.valor,
          data: inserido.data,
          descricao: inserido.descricao,
        };
        setTransacoes(prev => [novaTransacao, ...prev]);
        console.log('[Insert] Gasto adicionado com sucesso');
        toast.success(`Gasto de R$ ${valor.toFixed(2)} registrado`);
      }
    } catch (e: any) {
      console.error('[Insert] Erro ao salvar gasto:', e);
      toast.error(tratarErroSupabase(e, 'adicionarGasto'));
    }
  };

  const deletarTransacao = async (id: string) => {
    if (!user) {
      console.warn('[Delete] Usuário não autenticado');
      return;
    }

    console.log(`[Delete] Deletando transação: ${id}`);

    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)
        .eq('userid', user.id);

      if (error) throw new SupabaseError(error.code || 'UNKNOWN', error, 'Erro ao deletar transação');

      setTransacoes(prev => prev.filter(t => t.id !== id));
      console.log('[Delete] Transação deletada com sucesso');
      toast.success('Transação removida com sucesso');
    } catch (e: any) {
      console.error('[Delete] Erro ao deletar transação:', e);
      toast.error(tratarErroSupabase(e, 'deletarTransacao'));
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

    console.log(`[Insert] Adicionando dinheiro inicial: R$ ${valor} em ${hoje}`);

    try {
      const { data: inserido, error } = await supabase
        .from('transacoes')
        .insert([{
          userid: user.id,
          tipo: 'ganho',
          valor,
          data: hoje,
          descricao: descricao || 'Dinheiro inicial adicionado',
          auto_adicionado: false,
        }])
        .select()
        .single();

      if (error) throw new SupabaseError(error.code || 'UNKNOWN', error, 'Erro ao inserir saldo');

      if (inserido) {
        const novaTransacao: Transacao = {
          id: inserido.id,
          tipo: 'ganho',
          valor: typeof inserido.valor === 'string' ? parseFloat(inserido.valor) : inserido.valor,
          data: inserido.data,
          descricao: inserido.descricao,
        };
        setTransacoes(prev => [novaTransacao, ...prev]);
        console.log('[Insert] Dinheiro inicial adicionado com sucesso');
        toast.success(`R$ ${valor.toFixed(2)} adicionado ao saldo`);
      }
    } catch (e: any) {
      console.error('[Insert] Erro ao adicionar saldo:', e);
      toast.error(tratarErroSupabase(e, 'adicionarDinheiroInicial'));
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
