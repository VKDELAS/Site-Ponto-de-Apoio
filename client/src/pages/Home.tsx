import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, DollarSign, TrendingUp, TrendingDown, Calendar as CalendarIcon, ChevronDown, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useContas } from '@/hooks/useContas';
import { toast } from 'sonner';

/**
 * PONTO DE APOIO - Controle de Contas
 * Design: Industrial Moderno com Preto e Amarelo
 */

export default function Home() {
  const {
    data,
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
  } = useContas();

  const { signOut, user } = useAuth();
  const [dialogAberto, setDialogAberto] = useState<'pagamento' | 'gasto' | 'dinheiro' | null>(null);
  const [novoValor, setNovoValor] = useState('');
  
  const getHojeStr = () => {
    const agora = new Date();
    return agora.getFullYear() + '-' + 
           String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
           String(agora.getDate()).padStart(2, '0');
  };

  const [novaData, setNovaData] = useState(getHojeStr());
  const [descricaoGasto, setDescricaoGasto] = useState('');
  const [descricaoDinheiro, setDescricaoDinheiro] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(true);

  // Gerar últimos 30 dias para o calendário (ordenados do mais recente para o mais antigo)
  const diasCalendario = useMemo(() => {
    const dias = [];
    const hoje = new Date();
    for (let i = 0; i < 30; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - i);
      const dataStr = data.getFullYear() + '-' + 
                      String(data.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(data.getDate()).padStart(2, '0');
      dias.push(dataStr);
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

  const formatarDataExibicao = (dataStr: string) => {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const handleAdicionarPagamento = () => {
    const valor = parseFloat(novoValor);
    if (!valor || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }
    adicionarPagamento(valor, novaData);
    toast.success(`✓ Pagamento de R$ ${valor.toFixed(2)} registrado`);
    setNovoValor('');
    setNovaData(getHojeStr());
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
    setNovaData(getHojeStr());
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

  const handleAlternarDia = (dia: string) => {
    alternarDiaTrabalhado(dia);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center relative overflow-hidden">
        {/* Background Decorativo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.08, 0.03],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#FFD700] rounded-full blur-[150px]" 
          />
        </div>
        
        <div className="text-center z-10">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 bg-[#FFD700] rounded-2xl mb-6 shadow-[0_0_30px_rgba(255,215,0,0.3)]"
          >
            <Loader2 className="w-10 h-10 text-black animate-spin" />
          </motion.div>
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg font-bold text-[#FFD700] uppercase tracking-widest"
          >
            Carregando suas contas...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Header */}
      <header className="bg-card border-b-2 border-accent sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-accent tracking-tighter">PONTO DE APOIO</h1>
                <p className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-widest mt-1">Controle de Contas • {user?.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => signOut()}
                className="text-muted-foreground hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
            <div className="text-center md:text-right bg-accent/10 p-4 rounded-xl border border-accent/20 min-w-[200px]">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Saldo Devedor</p>
              <p className="text-4xl md:text-5xl font-black text-accent">
                R$ {saldo.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Ganhos */}
          <Card className="bg-card border-accent border-2 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Acumulado</h3>
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-black text-accent">R$ {totalGanhos.toFixed(2)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold bg-accent/20 text-accent px-2 py-0.5 rounded">
                {Math.floor(totalGanhos / 50)} dias
              </span>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Trabalhados</p>
            </div>
          </Card>

          {/* Pagamentos */}
          <Card className="bg-card border-border border-2 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pagamentos Recebidos</h3>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-black text-green-500">R$ {totalPagamentos.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-medium mt-2">
              {data.transacoes.filter(t => t.tipo === 'pagamento').length} transações
            </p>
          </Card>

          {/* Gastos */}
          <Card className="bg-card border-border border-2 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gastos Descontados</h3>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-black text-red-500">R$ {totalGastos.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-medium mt-2">
              {data.transacoes.filter(t => t.tipo === 'gasto').length} registros
            </p>
          </Card>
        </div>

        {/* Seção de Calendário de Dias */}
        <Card className="bg-card border-accent/30 border-2 p-6 mb-10 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Presença (Últimos 30 Dias)</h2>
            </div>
            <button
              onClick={() => setMostrarCalendario(!mostrarCalendario)}
              className="flex items-center gap-1 text-xs font-bold text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest"
            >
              {mostrarCalendario ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {mostrarCalendario ? 'Recolher' : 'Expandir'}
            </button>
          </div>
          
          {mostrarCalendario && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-10 gap-3">
              {diasCalendario.map((dia) => {
                const temGanho = diasComGanho.has(dia);
                const [ano, mes, diaNum] = dia.split('-');
                const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(diaNum));
                const ehHoje = dia === getHojeStr();
                
                return (
                  <button
                    key={dia}
                    onClick={() => handleAlternarDia(dia)}
                    className={`relative p-3 rounded-xl text-center transition-all group ${
                      temGanho
                        ? 'bg-accent text-accent-foreground hover:scale-105 shadow-sm hover:shadow-md'
                        : 'bg-secondary/50 text-muted-foreground border border-dashed border-border hover:bg-secondary'
                    } ${ehHoje ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}`}
                    title={temGanho ? `Remover dia trabalhado de ${formatarDataExibicao(dia)}` : `Marcar dia trabalhado em ${formatarDataExibicao(dia)} (+R$50)`}
                  >
                    <div className={`text-[10px] font-black uppercase mb-1 ${temGanho ? 'text-accent-foreground/70' : 'text-muted-foreground/50'}`}>
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dataObj.getDay()]}
                    </div>
                    <div className="text-lg font-black leading-none">{diaNum}</div>
                    <div className={`text-[9px] font-bold mt-1 ${temGanho ? 'text-accent-foreground/60' : 'text-muted-foreground/40'}`}>
                      {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][dataObj.getMonth()]}
                    </div>
                    {temGanho && (
                      <div className="absolute -top-1 -right-1 bg-white text-accent rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-sm">
                        ✓
                      </div>
                    )}
                    {ehHoje && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] font-black px-1.5 rounded-full uppercase">
                        Hoje
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-2 mt-6 p-3 bg-secondary/30 rounded-lg border border-border/50">
            <span className="text-lg">💡</span>
            <p className="text-xs text-muted-foreground font-medium">
              Os dias em <span className="text-accent font-bold">amarelo</span> indicam que você trabalhou. Clique neles para remover caso tenha faltado.
            </p>
          </div>
        </Card>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Dialog open={dialogAberto === 'dinheiro'} onOpenChange={(open) => setDialogAberto(open ? 'dinheiro' : null)}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-yellow-500 h-14 text-sm font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Saldo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-accent font-black uppercase tracking-tight">Adicionar Saldo Inicial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="valor-dinheiro" className="text-xs font-bold uppercase text-muted-foreground">Valor (R$)</Label>
                  <Input
                    id="valor-dinheiro"
                    type="number"
                    placeholder="0.00"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    className="bg-secondary border-border h-12 font-bold text-lg"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao-dinheiro" className="text-xs font-bold uppercase text-muted-foreground">Descrição</Label>
                  <Input
                    id="descricao-dinheiro"
                    type="text"
                    placeholder="Ex: Dívida antiga..."
                    value={descricaoDinheiro}
                    onChange={(e) => setDescricaoDinheiro(e.target.value)}
                    className="bg-secondary border-border h-12"
                  />
                </div>
                <Button
                  onClick={handleAdicionarDinheiro}
                  className="w-full bg-accent text-accent-foreground hover:bg-yellow-500 h-12 font-black uppercase tracking-widest mt-2"
                >
                  Confirmar Adição
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogAberto === 'pagamento'} onOpenChange={(open) => setDialogAberto(open ? 'pagamento' : null)}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 text-white hover:bg-green-500 h-14 text-sm font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all">
                <DollarSign className="w-5 h-5 mr-2" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-green-500 font-black uppercase tracking-tight">Pagamento Recebido</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="valor-pagamento" className="text-xs font-bold uppercase text-muted-foreground">Valor Recebido (R$)</Label>
                  <Input
                    id="valor-pagamento"
                    type="number"
                    placeholder="0.00"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    className="bg-secondary border-border h-12 font-bold text-lg"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-pagamento" className="text-xs font-bold uppercase text-muted-foreground">Data do Recebimento</Label>
                  <Input
                    id="data-pagamento"
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    className="bg-secondary border-border h-12 font-bold"
                  />
                </div>
                <Button
                  onClick={handleAdicionarPagamento}
                  className="w-full bg-green-600 text-white hover:bg-green-500 h-12 font-black uppercase tracking-widest mt-2"
                >
                  Confirmar Recebimento
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogAberto === 'gasto'} onOpenChange={(open) => setDialogAberto(open ? 'gasto' : null)}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 text-white hover:bg-red-500 h-14 text-sm font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all">
                <TrendingDown className="w-5 h-5 mr-2" />
                Adicionar Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-red-500 font-black uppercase tracking-tight">Gasto Descontado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="valor-gasto" className="text-xs font-bold uppercase text-muted-foreground">Valor do Gasto (R$)</Label>
                  <Input
                    id="valor-gasto"
                    type="number"
                    placeholder="0.00"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    className="bg-secondary border-border h-12 font-bold text-lg"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao-gasto" className="text-xs font-bold uppercase text-muted-foreground">O que foi comprado?</Label>
                  <Input
                    id="descricao-gasto"
                    type="text"
                    placeholder="Ex: Almoço, Passagem..."
                    value={descricaoGasto}
                    onChange={(e) => setDescricaoGasto(e.target.value)}
                    className="bg-secondary border-border h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-gasto" className="text-xs font-bold uppercase text-muted-foreground">Data do Gasto</Label>
                  <Input
                    id="data-gasto"
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    className="bg-secondary border-border h-12 font-bold"
                  />
                </div>
                <Button
                  onClick={handleAdicionarGasto}
                  className="w-full bg-red-600 text-white hover:bg-red-500 h-12 font-black uppercase tracking-widest mt-2"
                >
                  Confirmar Gasto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Histórico de Transações */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-border pb-2">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Histórico Recente</h2>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-2 py-1 rounded">
              {data.transacoes.length} Registros
            </span>
          </div>
          
          {data.transacoes.length === 0 ? (
            <Card className="bg-card border-border border-2 border-dashed p-12 text-center rounded-2xl">
              <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Nenhuma transação registrada</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {data.transacoes.map((transacao) => (
                <Card
                  key={transacao.id}
                  className={`bg-card border-l-4 p-4 flex items-center justify-between transition-all hover:translate-x-1 shadow-sm hover:shadow-md ${
                    transacao.tipo === 'ganho'
                      ? 'border-l-accent'
                      : transacao.tipo === 'pagamento'
                      ? 'border-l-green-600'
                      : 'border-l-red-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        transacao.tipo === 'ganho'
                          ? 'bg-accent/10 text-accent'
                          : transacao.tipo === 'pagamento'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {transacao.tipo === 'ganho' ? <TrendingUp className="w-5 h-5" /> : 
                       transacao.tipo === 'pagamento' ? <DollarSign className="w-5 h-5" /> : 
                       <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-sm uppercase tracking-tight text-foreground">
                          {transacao.tipo === 'ganho' ? 'Ganho Diário' : 
                           transacao.tipo === 'pagamento' ? 'Pagamento' : 'Gasto'}
                        </p>
                        {transacao.autoAdicionado && (
                          <span className="text-[8px] font-black bg-accent text-accent-foreground px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            Auto
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium line-clamp-1">{transacao.descricao}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p
                        className={`text-lg font-black tracking-tighter ${
                          transacao.tipo === 'ganho'
                            ? 'text-accent'
                            : transacao.tipo === 'pagamento'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {transacao.tipo === 'ganho' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{formatarDataExibicao(transacao.data)}</p>
                    </div>
                    <button
                      onClick={() => {
                        deletarTransacao(transacao.id);
                        toast.success('Registro removido');
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground/40 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">PONTO DE APOIO © 2026</p>
            <p className="text-[9px] font-medium uppercase tracking-widest mt-1">Sistema de Gestão de Créditos e Débitos</p>
          </div>
          <div className="bg-secondary/50 px-4 py-2 rounded-full border border-border">
            <p className="text-[9px] font-bold uppercase tracking-widest">R$50,00 adicionados automaticamente todo dia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
