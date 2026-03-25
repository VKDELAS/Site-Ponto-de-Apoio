import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

function calcularDiasEntreDatas(dataInicio: string, dataFim: string): number {
  const inicio = new Date(dataInicio + 'T00:00:00Z');
  const fim = new Date(dataFim + 'T00:00:00Z');
  const diferenca = fim.getTime() - inicio.getTime();
  return Math.floor(diferenca / (1000 * 60 * 60 * 24));
}

function obterDataAnterior(data: string, diasAntes: number): string {
  const d = new Date(data + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - diasAntes);
  return d.toISOString().split('T')[0];
}

export function useContas() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        // Tentar carregar do Supabase
        const { data: transacoesData, error: transacoesError } = await supabase
          .from('transacoes')
          .select('*')
          .order('data', { ascending: false })
          .order('created_at', { ascending: false });

        if (transacoesError) throw transacoesError;

        const { data: metaData, error: metaError } = await supabase
          .from('metadados')
          .select('valor')
          .eq('chave', 'ultima_adicao_automatica')
          .single();

        if (metaError && metaError.code !== 'PGRST116') throw metaError;

        const agora = new Date();
        const hoje = agora.getFullYear() + '-' + 
                     String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(agora.getDate()).padStart(2, '0');
                     
        const ultimaAdicao = metaData?.valor;
        let transacoesAtuais = transacoesData?.map(t => ({
          id: t.id,
          tipo: t.tipo,
          valor: parseFloat(t.valor),
          data: t.data,
          descricao: t.descricao,
          autoAdicionado: t.auto_adicionado
        })) || [];

        if (ultimaAdicao !== hoje) {
          const novasTransacoes: any[] = [];
          if (!ultimaAdicao) {
            novasTransacoes.push({
              tipo: 'ganho',
              valor: VALOR_DIARIO,
              data: hoje,
              descricao: `Ganho automático do dia ${hoje}`,
              auto_adicionado: true,
            });
          } else {
            const diasPendentes = calcularDiasEntreDatas(ultimaAdicao, hoje);
            for (let i = diasPendentes - 1; i >= 0; i--) {
              const dataPendente = obterDataAnterior(hoje, i);
              const jaExiste = transacoesAtuais.some(t => t.tipo === 'ganho' && t.data === dataPendente && t.autoAdicionado);
              if (!jaExiste) {
                novasTransacoes.push({
                  tipo: 'ganho',
                  valor: VALOR_DIARIO,
                  data: dataPendente,
                  descricao: `Ganho automático do dia ${dataPendente}`,
                  auto_adicionado: true,
                });
              }
            }
          }

          if (novasTransacoes.length > 0) {
            const { data: inseridas, error: insertError } = await supabase
              .from('transacoes')
              .insert(novasTransacoes)
              .select();

            if (!insertError && inseridas) {
              const formatadas = inseridas.map(t => ({
                id: t.id,
                tipo: t.tipo,
                valor: parseFloat(t.valor),
                data: t.data,
                descricao: t.descricao,
                autoAdicionado: t.auto_adicionado
              }));
              transacoesAtuais = [...formatadas, ...transacoesAtuais];
            }
          }

          await supabase
            .from('metadados')
            .upsert({ chave: 'ultima_adicao_automatica', valor: hoje });
        }

        setTransacoes(transacoesAtuais);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transacoesAtuais));
      } catch (e) {
        console.warn('Supabase não disponível, usando backup local:', e);
        const backup = localStorage.getItem(STORAGE_KEY);
        if (backup) {
          setTransacoes(JSON.parse(backup));
        }
      } finally {
        setIsLoaded(true);
      }
    }

    carregarDados();
  }, []);

  const adicionarPagamento = async (valor: number, data: string) => {
    const novaTransacaoLocal: Transacao = {
      id: Date.now().toString(),
      tipo: 'pagamento',
      valor,
      data,
      descricao: `Pagamento recebido em ${data}`,
    };

    setTransacoes(prev => [novaTransacaoLocal, ...prev]);

    try {
      await supabase.from('transacoes').insert([{
        tipo: 'pagamento',
        valor,
        data,
        descricao: `Pagamento recebido em ${data}`,
      }]);
    } catch (e) {
      console.error('Erro ao salvar no Supabase:', e);
    }
  };

  const adicionarGasto = async (valor: number, data: string, descricao: string) => {
    const novaTransacaoLocal: Transacao = {
      id: Date.now().toString(),
      tipo: 'gasto',
      valor,
      data,
      descricao,
    };

    setTransacoes(prev => [novaTransacaoLocal, ...prev]);

    try {
      await supabase.from('transacoes').insert([{
        tipo: 'gasto',
        valor,
        data,
        descricao,
      }]);
    } catch (e) {
      console.error('Erro ao salvar no Supabase:', e);
    }
  };

  const deletarTransacao = async (id: string) => {
    setTransacoes(prev => prev.filter(t => t.id !== id));
    try {
      await supabase.from('transacoes').delete().eq('id', id);
    } catch (e) {
      console.error('Erro ao deletar no Supabase:', e);
    }
  };

  const removerGanhoDia = async (data: string) => {
    setTransacoes(prev => prev.filter(t => !(t.tipo === 'ganho' && t.data === data && t.autoAdicionado)));
    try {
      await supabase.from('transacoes').delete().eq('tipo', 'ganho').eq('data', data).eq('auto_adicionado', true);
    } catch (e) {
      console.error('Erro ao remover no Supabase:', e);
    }
  };

  const adicionarDinheiroInicial = async (valor: number, descricao: string) => {
    const agora = new Date();
    const hoje = agora.getFullYear() + '-' + 
                 String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(agora.getDate()).padStart(2, '0');

    const novaTransacaoLocal: Transacao = {
      id: Date.now().toString(),
      tipo: 'ganho',
      valor,
      data: hoje,
      descricao: descricao || 'Dinheiro inicial adicionado',
    };

    setTransacoes(prev => [novaTransacaoLocal, ...prev]);

    try {
      await supabase.from('transacoes').insert([{
        tipo: 'ganho',
        valor,
        data: hoje,
        descricao: descricao || 'Dinheiro inicial adicionado',
        auto_adicionado: false,
      }]);
    } catch (e) {
      console.error('Erro ao salvar no Supabase:', e);
    }
  };

  const totalGanhos = transacoes
    .filter(t => t.tipo === 'ganho')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalPagamentos = transacoes
    .filter(t => t.tipo === 'pagamento')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalGastos = transacoes
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.valor, 0);

  const saldo = totalGanhos - totalPagamentos - totalGastos;

  return {
    data: { transacoes },
    isLoaded,
    adicionarPagamento,
    adicionarGasto,
    adicionarDinheiroInicial,
    deletarTransacao,
    removerGanhoDia,
    totalGanhos,
    totalPagamentos,
    totalGastos,
    saldo,
  };
}
