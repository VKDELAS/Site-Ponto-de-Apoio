import { useState, useEffect } from 'react';

export interface Transacao {
  id: string;
  tipo: 'ganho' | 'pagamento' | 'gasto';
  valor: number;
  data: string;
  descricao: string;
  autoAdicionado?: boolean;
}

export interface ContasData {
  transacoes: Transacao[];
  ultimaAdicaoAutomatica?: string;
}

const STORAGE_KEY = 'ponto-de-apoio-contas';
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
  const [data, setData] = useState<ContasData>({ transacoes: [], ultimaAdicaoAutomatica: undefined });
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar dados do localStorage e verificar se precisa adicionar ganho automático retroativo
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let dadosCarregados: ContasData = { transacoes: [], ultimaAdicaoAutomatica: undefined };
    
    if (stored) {
      try {
        dadosCarregados = JSON.parse(stored);
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      }
    }
    
    // Obter a data de hoje (ajustada para o fuso horário local para evitar problemas de "dia seguinte" precoce)
    const agora = new Date();
    const hoje = agora.getFullYear() + '-' + 
                 String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(agora.getDate()).padStart(2, '0');
                 
    const ultimaAdicao = dadosCarregados.ultimaAdicaoAutomatica;
    
    // Se é a primeira vez ou se há dias pendentes
    if (ultimaAdicao !== hoje) {
      const novasTransacoes: Transacao[] = [];
      
      if (!ultimaAdicao) {
        // Primeira execução: adicionar apenas para hoje
        const novaTransacao: Transacao = {
          id: Date.now().toString(),
          tipo: 'ganho',
          valor: VALOR_DIARIO,
          data: hoje,
          descricao: `Ganho automático do dia ${hoje}`,
          autoAdicionado: true,
        };
        novasTransacoes.push(novaTransacao);
      } else {
        // Há dias pendentes: calcular quantos dias se passaram
        const diasPendentes = calcularDiasEntreDatas(ultimaAdicao, hoje);
        
        // Adicionar transações para cada dia pendente (do mais antigo para o mais recente)
        // Começamos de i = diasPendentes - 1 para não repetir a ultimaAdicao e chegar até hoje (i=0)
        for (let i = diasPendentes - 1; i >= 0; i--) {
          const dataPendente = obterDataAnterior(hoje, i);
          
          // Evitar duplicatas se o dia já existir (segurança extra)
          const jaExiste = dadosCarregados.transacoes.some(t => t.tipo === 'ganho' && t.data === dataPendente && t.autoAdicionado);
          
          if (!jaExiste) {
            const novaTransacao: Transacao = {
              id: (Date.now() + i).toString(),
              tipo: 'ganho',
              valor: VALOR_DIARIO,
              data: dataPendente,
              descricao: `Ganho automático do dia ${dataPendente}`,
              autoAdicionado: true,
            };
            novasTransacoes.push(novaTransacao);
          }
        }
      }
      
      // Adicionar as novas transações
      dadosCarregados.transacoes = [...novasTransacoes, ...dadosCarregados.transacoes];
      dadosCarregados.ultimaAdicaoAutomatica = hoje;
    }
    
    setData(dadosCarregados);
    setIsLoaded(true);
  }, []);

  // Salvar dados no localStorage sempre que mudar
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  // Verificar a cada minuto se mudou o dia
  useEffect(() => {
    const intervalo = setInterval(() => {
      const agora = new Date();
      const hoje = agora.getFullYear() + '-' + 
                   String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(agora.getDate()).padStart(2, '0');

      setData(prev => {
        if (prev.ultimaAdicaoAutomatica && prev.ultimaAdicaoAutomatica !== hoje) {
          const novaTransacao: Transacao = {
            id: Date.now().toString(),
            tipo: 'ganho',
            valor: VALOR_DIARIO,
            data: hoje,
            descricao: `Ganho automático do dia ${hoje}`,
            autoAdicionado: true,
          };
          return {
            ...prev,
            transacoes: [novaTransacao, ...prev.transacoes],
            ultimaAdicaoAutomatica: hoje,
          };
        }
        return prev;
      });
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  const adicionarGanho = (valor: number, data: string) => {
    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      tipo: 'ganho',
      valor,
      data,
      descricao: `Ganho do dia ${data}`,
    };
    setData(prev => ({
      ...prev,
      transacoes: [novaTransacao, ...prev.transacoes],
    }));
  };

  const adicionarPagamento = (valor: number, data: string) => {
    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      tipo: 'pagamento',
      valor,
      data,
      descricao: `Pagamento recebido em ${data}`,
    };
    setData(prev => ({
      ...prev,
      transacoes: [novaTransacao, ...prev.transacoes],
    }));
  };

  const adicionarGasto = (valor: number, data: string, descricao: string) => {
    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      tipo: 'gasto',
      valor,
      data,
      descricao,
    };
    setData(prev => ({
      ...prev,
      transacoes: [novaTransacao, ...prev.transacoes],
    }));
  };

  const deletarTransacao = (id: string) => {
    setData(prev => ({
      ...prev,
      transacoes: prev.transacoes.filter(t => t.id !== id),
    }));
  };

  const removerGanhoDia = (data: string) => {
    setData(prev => ({
      ...prev,
      transacoes: prev.transacoes.filter(t => !(t.tipo === 'ganho' && t.data === data && t.autoAdicionado)),
    }));
  };

  const obterGanhoDia = (dataStr: string) => {
    return data.transacoes.find((t: Transacao) => t.tipo === 'ganho' && t.data === dataStr && t.autoAdicionado);
  };

  const adicionarDinheiroInicial = (valor: number, descricao: string) => {
    const agora = new Date();
    const hoje = agora.getFullYear() + '-' + 
                 String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(agora.getDate()).padStart(2, '0');
    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      tipo: 'ganho',
      valor,
      data: hoje,
      descricao: descricao || 'Dinheiro inicial adicionado',
    };
    setData(prev => ({
      ...prev,
      transacoes: [novaTransacao, ...prev.transacoes],
    }));
  };

  // Calcular totais
  const totalGanhos = data.transacoes
    .filter(t => t.tipo === 'ganho')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalPagamentos = data.transacoes
    .filter(t => t.tipo === 'pagamento')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalGastos = data.transacoes
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.valor, 0);

  const saldo = totalGanhos - totalPagamentos - totalGastos;

  // Ordenar transações: Mais recentes primeiro
  const transacoesOrdenadas = [...data.transacoes].sort((a, b) => {
    // Primeiro por data
    if (a.data !== b.data) {
      return b.data.localeCompare(a.data);
    }
    // Se for a mesma data, por ID (que é timestamp)
    return b.id.localeCompare(a.id);
  });

  return {
    data: { ...data, transacoes: transacoesOrdenadas },
    isLoaded,
    adicionarGanho,
    adicionarPagamento,
    adicionarGasto,
    adicionarDinheiroInicial,
    deletarTransacao,
    removerGanhoDia,
    obterGanhoDia,
    totalGanhos,
    totalPagamentos,
    totalGastos,
    saldo,
  };
}
