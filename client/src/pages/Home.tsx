import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useContas } from '@/hooks/useContas';
import { toast } from 'sonner';

/**
 * PONTO DE APOIO - Controle de Contas
 * Design: Industrial Moderno com Preto e Amarelo
 * 
 * Funcionalidades:
 * - Adição automática de R$50 todo dia à meia-noite
 * - Adicionar dinheiro inicial (para débitos antigos)
 * - Remover dias quando não trabalhou
 * - Registrar pagamentos recebidos
 * - Registrar gastos descontados
 * - Visualizar saldo total devido
 * - Histórico de transações
 */

export default function Home() {
  const {
    data,
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
  } = useContas();

  const [dialogAberto, setDialogAberto] = useState<'pagamento' | 'gasto' | 'dinheiro' | null>(null);
  const [novoValor, setNovoValor] = useState('');
  const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);
  const [descricaoGasto, setDescricaoGasto] = useState('');
  const [descricaoDinheiro, setDescricaoDinheiro] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  // Gerar últimos 30 dias para o calendário
  const diasCalendario = useMemo(() => {
    const dias = [];
    for (let i = 29; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      dias.push(data.toISOString().split('T')[0]);
    }
    return dias;
  }, []);

  // Verificar quais dias têm ganho automático
  const diasComGanho = useMemo(() => {
    return new Set(
      data.transacoes
        .filter(t => t.tipo === 'ganho' && t.autoAdicionado)
        .map(t => t.data)
    );
  }, [data.transacoes]);

  const handleAdicionarPagamento = () => {
    const valor = parseFloat(novoValor);
    if (!valor || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }
    adicionarPagamento(valor, novaData);
    toast.success(`✓ Pagamento de R$ ${valor.toFixed(2)} registrado`);
    setNovoValor('');
    setNovaData(new Date().toISOString().split('T')[0]);
    setDialogAberto(null);
  };

  const handleAdicionarGasto = () => {
    const valor = parseFloat(novoValor);
    if (!valor || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }
    if (!descricaoGasto.trim()) {
      toast.error('Descrição do gasto é obrigatória');
      return;
    }
    adicionarGasto(valor, novaData, descricaoGasto);
    toast.success(`✓ Gasto de R$ ${valor.toFixed(2)} registrado`);
    setNovoValor('');
    setNovaData(new Date().toISOString().split('T')[0]);
    setDescricaoGasto('');
    setDialogAberto(null);
  };

  const handleAdicionarDinheiro = () => {
    const valor = parseFloat(novoValor);
    if (!valor || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }
    adicionarDinheiroInicial(valor, descricaoDinheiro);
    toast.success(`✓ R$ ${valor.toFixed(2)} adicionado ao saldo`);
    setNovoValor('');
    setDescricaoDinheiro('');
    setDialogAberto(null);
  };

  const handleRemoverDia = (dia: string) => {
    removerGanhoDia(dia);
    toast.success(`✓ Dia ${dia} removido`);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 text-4xl">⏳</div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b-2 border-accent sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-accent">PONTO DE APOIO</h1>
              <p className="text-muted-foreground text-sm mt-1">Controle de Contas • Adição Automática</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Ela te deve</p>
              <p className="text-5xl font-bold text-accent">
                R$ {saldo.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Ganhos */}
          <Card className="bg-card border-accent border-2 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">Total de Ganhos</h3>
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold text-accent">R$ {totalGanhos.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.floor(totalGanhos / 50)} dias trabalhados
            </p>
          </Card>

          {/* Pagamentos */}
          <Card className="bg-card border-border border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">Pagamentos Recebidos</h3>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-500">R$ {totalPagamentos.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {data.transacoes.filter(t => t.tipo === 'pagamento').length} pagamentos
            </p>
          </Card>

          {/* Gastos */}
          <Card className="bg-card border-border border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">Gastos Descontados</h3>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-500">R$ {totalGastos.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {data.transacoes.filter(t => t.tipo === 'gasto').length} gastos registrados
            </p>
          </Card>
        </div>

        {/* Seção de Calendário de Dias */}
        <Card className="bg-card border-accent border-2 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Últimos 30 Dias</h2>
            <button
              onClick={() => setMostrarCalendario(!mostrarCalendario)}
              className="text-accent hover:text-yellow-400 transition-colors"
            >
              {mostrarCalendario ? '▼' : '▶'} {mostrarCalendario ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          {mostrarCalendario && (
            <div className="grid grid-cols-7 gap-2">
              {diasCalendario.map((dia) => {
                const temGanho = diasComGanho.has(dia);
                const dataObj = new Date(dia);
                const diaDoMes = dataObj.getDate();
                const ehHoje = dia === new Date().toISOString().split('T')[0];
                
                return (
                  <button
                    key={dia}
                    onClick={() => temGanho && handleRemoverDia(dia)}
                    className={`p-3 rounded text-center text-sm font-semibold transition-all ${
                      temGanho
                        ? 'bg-accent text-accent-foreground hover:bg-yellow-600 cursor-pointer border-2 border-accent'
                        : 'bg-secondary text-muted-foreground border-2 border-border'
                    } ${ehHoje ? 'ring-2 ring-accent' : ''}`}
                    title={temGanho ? `Clique para remover o ganho de ${dia}` : `Sem ganho em ${dia}`}
                  >
                    <div className="text-xs opacity-75">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][dataObj.getDay()]}</div>
                    <div>{diaDoMes}</div>
                    {temGanho && <div className="text-xs mt-1">✓</div>}
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            💡 Clique nos dias amarelos para remover o ganho (quando não trabalhou)
          </p>
        </Card>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Dialog open={dialogAberto === 'dinheiro'} onOpenChange={(open) => setDialogAberto(open ? 'dinheiro' : null)}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-yellow-600 h-12 text-base font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Dinheiro
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-accent">Adicionar Dinheiro Inicial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="valor-dinheiro" className="text-foreground">Valor (R$)</Label>
                  <Input
                    id="valor-dinheiro"
                    type="number"
                    placeholder="0.00"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao-dinheiro" className="text-foreground">Descrição (opcional)</Label>
                  <Input
                    id="descricao-dinheiro"
                    type="text"
                    placeholder="Ex: Dinheiro que já estava devendo..."
                    value={descricaoDinheiro}
                    onChange={(e) => setDescricaoDinheiro(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <Button
                  onClick={handleAdicionarDinheiro}
                  className="w-full bg-accent text-accent-foreground hover:bg-yellow-600"
                >
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogAberto === 'pagamento'} onOpenChange={(open) => setDialogAberto(open ? 'pagamento' : null)}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 text-white hover:bg-green-700 h-12 text-base font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-green-500">Registrar Pagamento Recebido</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="valor-pagamento" className="text-foreground">Valor (R$)</Label>
                  <Input
                    id="valor-pagamento"
                    type="number"
                    placeholder="0.00"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="data-pagamento" className="text-foreground">Data</Label>
                  <Input
                    id="data-pagamento"
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <Button
                  onClick={handleAdicionarPagamento}
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                >
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogAberto === 'gasto'} onOpenChange={(open) => setDialogAberto(open ? 'gasto' : null)}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 text-white hover:bg-red-700 h-12 text-base font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-red-500">Adicionar Gasto Descontado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="valor-gasto" className="text-foreground">Valor (R$)</Label>
                  <Input
                    id="valor-gasto"
                    type="number"
                    placeholder="0.00"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao-gasto" className="text-foreground">Descrição</Label>
                  <Input
                    id="descricao-gasto"
                    type="text"
                    placeholder="Ex: Uniforme, Transporte..."
                    value={descricaoGasto}
                    onChange={(e) => setDescricaoGasto(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="data-gasto" className="text-foreground">Data</Label>
                  <Input
                    id="data-gasto"
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <Button
                  onClick={handleAdicionarGasto}
                  className="w-full bg-red-600 text-white hover:bg-red-700"
                >
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Histórico de Transações */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Histórico de Transações</h2>
          {data.transacoes.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center">
              <p className="text-muted-foreground">Nenhuma transação registrada ainda</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.transacoes.map((transacao) => (
                <Card
                  key={transacao.id}
                  className={`bg-card border-2 p-4 flex items-center justify-between transition-all hover:shadow-lg ${
                    transacao.tipo === 'ganho'
                      ? 'border-accent'
                      : transacao.tipo === 'pagamento'
                      ? 'border-green-600'
                      : 'border-red-600'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          transacao.tipo === 'ganho'
                            ? 'bg-accent'
                            : transacao.tipo === 'pagamento'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {transacao.tipo === 'ganho'
                              ? '📈 Ganho'
                              : transacao.tipo === 'pagamento'
                              ? '💰 Pagamento'
                              : '📉 Gasto'}
                          </p>
                          {transacao.autoAdicionado && (
                            <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                              Automático
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{transacao.descricao}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p
                      className={`text-lg font-bold ${
                        transacao.tipo === 'ganho'
                          ? 'text-accent'
                          : transacao.tipo === 'pagamento'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {transacao.tipo === 'ganho' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{transacao.data}</p>
                  </div>
                  <button
                    onClick={() => {
                      deletarTransacao(transacao.id);
                      toast.success('Transação deletada');
                    }}
                    className="ml-2 p-2 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>PONTO DE APOIO © 2026 - Controle de Contas com Adição Automática</p>
          <p className="text-xs mt-2">R$50 adicionados automaticamente todo dia à meia-noite</p>
        </div>
      </footer>
    </div>
  );
}
