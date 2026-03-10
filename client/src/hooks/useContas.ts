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

export function useContas() {
  const [data, setData] = useState<ContasData>({ transacoes: [], ultimaAdicaoAutomatica: undefined });
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar dados do localStorage e verificar se precisa adicionar ganho automático
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
    
    // Verificar se precisa adicionar ganho automático
    const hoje = new Date().toISOString().split('T')[0];
    const ultimaAdicao = dadosCarregados.ultimaAdicaoAutomatica;
    
    if (ultimaAdicao !== hoje) {
      // Adicionar R$50 automático para hoje
      const novaTransacao: Transacao = {
        id: Date.now().toString(),
        tipo: 'ganho',
        valor: VALOR_DIARIO,
        data: hoje,
        descricao: `Ganho automático do dia ${hoje}`,
        autoAdicionado: true,
      };
      dadosCarregados.transacoes = [novaTransacao, ...dadosCarregados.transacoes];
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

  // Verificar a cada minuto se é meia-noite (para sincronizar com novo dia)
  useEffect(() => {
    const intervalo = setInterval(() => {
      const hoje = new Date().toISOString().split('T')[0];
      setData(prev => {
        if (prev.ultimaAdicaoAutomatica !== hoje) {
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
    }, 60000); // Verifica a cada 1 minuto

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
    const hoje = new Date().toISOString().split('T')[0];
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

  return {
    data,
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
