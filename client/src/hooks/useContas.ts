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

const VALOR_DIARIO = 50;

// Função auxiliar para calcular a diferença de dias entre duas datas
function calcularDiasEntreDatas(dataInicio: string, dataFim: string): number {
  const inicio = new Date(dataInicio + 'T00:00:00Z');
  const fim = new Date(dataFim + 'T00:00:00Z');
  const diferenca = fim.getTime() - inicio.getTime();
  return Math.floor(diferenca / (1000 * 60 * 60 * 24));
}

// Função auxiliar para obter a data anterior em formato YYYY-MM-DD
function obterDataAnterior(data: string, diasAntes: number): string {
  const d = new Date(data + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - diasAntes);
  return d.toISOString().split('T')[0];
}

export function useContas() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar dados do Supabase e verificar se precisa adicionar ganho automático retroativo
  useEffect(() => {
    async function carregarDados() {
      try {
        // 1. Buscar transações
        const { data: transacoesData, error: transacoesError } = await supabase
          .from('transacoes')
          .select('*')
          .order('data', { ascending: false })
          .order('created_at', { ascending: false });

        if (transacoesError) throw transacoesError;

        // 2. Buscar última adição automática
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

        // 3. Verificar se há dias pendentes
        if (ultimaAdicao !== hoje) {
          const novasTransacoes: any[] = [];
          
          if (!ultimaAdicao) {
            // Primeira execução: adicionar apenas para hoje
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

            if (insertError) throw insertError;

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

          // Atualizar metadados
          await supabase
            .from('metadados')
            .upsert({ chave: 'ultima_adicao_automatica', valor: hoje });
        }

        setTransacoes(transacoesAtuais);
      } catch (e) {
        console.error('Erro ao carregar dados do Supabase:', e);
      } finally {
        setIsLoaded(true);
      }
    }

    carregarDados();
  }, []);

  const adicionarPagamento = async (valor: number, data: string) => {
    const { data: inserida, error } = await supabase
      .from('transacoes')
      .insert([{
        tipo: 'pagamento',
        valor,
        data,
        descricao: `Pagamento recebido em ${data}`,
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar pagamento:', error);
      return;
    }

    setTransacoes(prev => [{
      id: inserida.id,
      tipo: inserida.tipo,
      valor: parseFloat(inserida.valor),
      data: inserida.data,
      descricao: inserida.descricao,
    }, ...prev]);
  };

  const adicionarGasto = async (valor: number, data: string, descricao: string) => {
    const { data: inserida, error } = await supabase
      .from('transacoes')
      .insert([{
        tipo: 'gasto',
        valor,
        data,
        descricao,
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar gasto:', error);
      return;
    }

    setTransacoes(prev => [{
      id: inserida.id,
      tipo: inserida.tipo,
      valor: parseFloat(inserida.valor),
      data: inserida.data,
      descricao: inserida.descricao,
    }, ...prev]);
  };

  const deletarTransacao = async (id: string) => {
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar transação:', error);
      return;
    }

    setTransacoes(prev => prev.filter(t => t.id !== id));
  };

  const removerGanhoDia = async (data: string) => {
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('tipo', 'ganho')
      .eq('data', data)
      .eq('auto_adicionado', true);

    if (error) {
      console.error('Erro ao remover ganho do dia:', error);
      return;
    }

    setTransacoes(prev => prev.filter(t => !(t.tipo === 'ganho' && t.data === data && t.autoAdicionado)));
  };

  const adicionarDinheiroInicial = async (valor: number, descricao: string) => {
    const agora = new Date();
    const hoje = agora.getFullYear() + '-' + 
                 String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(agora.getDate()).padStart(2, '0');

    const { data: inserida, error } = await supabase
      .from('transacoes')
      .insert([{
        tipo: 'ganho',
        valor,
        data: hoje,
        descricao: descricao || 'Dinheiro inicial adicionado',
        auto_adicionado: false,
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar dinheiro inicial:', error);
      return;
    }

    setTransacoes(prev => [{
      id: inserida.id,
      tipo: inserida.tipo,
      valor: parseFloat(inserida.valor),
      data: inserida.data,
      descricao: inserida.descricao,
    }, ...prev]);
  };

  // Calcular totais
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
