

Iniciar teste gratuito

Compartilhar
Estou analisando a estrutura do login atual em Login.tsx para planejar o redesenho com cores amarelo/preto, animações e integração com Supabase.

Analisando o arquivo de configuração do Supabase e o hook de contas, confirmei que as chamadas estão corretas. A próxima etapa é desenhar a tela de login com cores amarelo/preto, animações fluídas usando Framer Motion, e planejar a integração visual com o Supabase.

Identifiquei que o ambiente usa Node e pnpm, então tentei instalar dependências com pnpm sem sudo, mas o comando não foi encontrado. Preciso ajustar o ambiente para continuar.

Resolvi o problema do ambiente, instalando dependências com pnpm sem sudo. Agora posso avançar na implementação da tela de login com animações profissionais e integração ao Supabase.

Lite
Já redesenhei sua tela de login com um visual profissional em amarelo e preto, adicionei animações suaves com Framer Motion e incluí o botão de login com Google.
Agora, para que o login do Google e o isolamento de dados funcionem, preciso que você me envie aquele comando que o Manus anterior pediu. Provavelmente é o comando para configurar as tabelas e as políticas de segurança (RLS) no seu banco de dados Supabase. Pode mandar?
-- 1. Criar a tabela de transações com user_id
CREATE TABLE IF NOT EXISTS transacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('ganho', 'pagamento', 'gasto')),
    valor DECIMAL(12,2) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    auto_adicionado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Criar a tabela de metadados com user_id
CREATE TABLE IF NOT EXISTS metadados (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chave TEXT NOT NULL,
    valor TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (user_id, chave)
);

-- 3. Habilitar RLS (Row Level Security) para isolamento total
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadados ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para a tabela de transacoes
DROP POLICY IF EXISTS "Usuários podem ver suas próprias transações" ON transacoes;
CREATE POLICY "Usuários podem ver suas próprias transações" ON transacoes 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias transações" ON transacoes;
CREATE POLICY "Usuários podem inserir suas próprias transações" ON transacoes 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias transações" ON transacoes;
CREATE POLICY "Usuários podem atualizar suas próprias transações" ON transacoes 
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias transações" ON transacoes;
CREATE POLICY "Usuários podem deletar suas próprias transações" ON transacoes 
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Políticas para a tabela de metadados
DROP POLICY IF EXISTS "Usuários podem ver seus próprios metadados" ON metadados;
CREATE POLICY "Usuários podem ver seus próprios metadados" ON metadados 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios metadados" ON metadados;
CREATE POLICY "Usuários podem inserir seus próprios metadados" ON metadados 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios metadados" ON metadados;
CREATE POLICY "Usuários podem atualizar seus próprios metadados" ON metadados 
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo_data_user ON transacoes(tipo, data, user_id);
Lite
Perfeito! Esse script SQL é exatamente o que faltava para garantir que cada usuário tenha seus próprios dados isolados e seguros no Supabase.
Vou agora finalizar a integração no código para que o sistema utilize essas tabelas corretamente e preparar o guia passo a passo para você configurar o Google OAuth no seu painel do Supabase. Segura aí!
Consegui integrar o login com Google e garantir isolamento de dados usando o script SQL adequado. Agora, vou finalizar a implementação e preparar o guia de configuração do OAuth.

ja mandei esse codigo ai, se voce quiser que eu rode outro manda outro pf
Lite
O código que você mandou é perfeito! Ele é exatamente o que precisamos para garantir que cada usuário tenha seus próprios dados isolados e seguros.
Já terminei de atualizar seu projeto. Aqui está o que eu fiz:
Nova Tela de Login Profissional: Redesenhei tudo com as cores Amarelo (#FFD700) e Preto, usando animações modernas com a biblioteca framer-motion.
Integração com Google: Adicionei o botão de login social e configurei a lógica para conectar com o Supabase.
Isolamento de Dados: Atualizei o sistema para que cada usuário veja apenas o seu próprio dinheiro e transações, usando o script SQL que você forneceu.
Correção do "Failed to Fetch": Ajustei a configuração do Supabase para evitar erros de conexão e adicionei redirecionamentos corretos.
Para finalizar, preparei um Guia Passo a Passo em anexo explicando como você configura o Google no painel do Supabase e onde colar aquele código SQL que você me mandou.
Dê uma olhada nos arquivos abaixo! Se precisar de mais alguma coisa, é só falar.
Finalizei a integração do login com Google, garantindo isolamento de dados por usuário via SQL. Preparei o guia de configuração do OAuth no Supabase.

Lite
Seu projeto foi atualizado com sucesso! A tela de login foi redesenhada para um visual profissional em amarelo e preto, com animações e integração para login com Google. Além disso, o sistema agora garante o isolamento de dados por usuário, utilizando o script SQL que você forneceu.
Para que tudo funcione perfeitamente, siga as instruções no arquivo GUIA_SUPABASE_GOOGLE.md para configurar o Google OAuth no seu painel do Supabase e aplicar o script SQL.
Os arquivos modificados e o guia estão anexados. Se tiver mais alguma dúvida ou precisar de ajustes, é só me avisar!
Login.tsx
Código · 9.03 KB
useContas.ts
Código · 6.54 KB
Guia de Configuração: Google OAuth no Supabase
Markdown · 4.91 KB
Ver todos os arquivos nesta tarefa
Tarefa concluída
Como foi este resultado?
Sugestões de acompanhamento




useContas.ts
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

  async function carregarDados() {
    if (!user) return;

    try {
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });

      if (transacoesError) throw transacoesError;

      const transacoesAtuais = transacoesData?.map(t => ({
        id: t.id,
        tipo: t.tipo,
        valor: parseFloat(t.valor),
        data: t.data,
        descricao: t.descricao,
        autoAdicionado: t.auto_adicionado
      })) || [];

      setTransacoes(transacoesAtuais);
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(transacoesAtuais));
    } catch (e) {
      console.error('Erro no Supabase:', e);
      const backup = localStorage.getItem(`${STORAGE_KEY}_${user?.id}`);
      if (backup) setTransacoes(JSON.parse(backup));
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [user]);

  const alternarDiaTrabalhado = async (data: string) => {
    if (!user) return;

    const diaExistente = transacoes.find(
      t => t.tipo === 'ganho' && t.data === data && t.autoAdicionado
    );

    if (diaExistente) {
      // Remover o dia
      try {
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .eq('id', diaExistente.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setTransacoes(prev => prev.filter(t => t.id !== diaExistente.id));
        toast.success(`Dia ${data.split('-').reverse().join('/')} removido`);
      } catch (e) {
        toast.error('Erro ao remover dia');
      }
    } else {
      // Adicionar o dia
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
          setTransacoes(prev => [{
            id: inserido.id,
            tipo: 'ganho',
            valor: parseFloat(inserido.valor),
            data: inserido.data,
            descricao: inserido.descricao,
            autoAdicionado: true
          }, ...prev]);
          toast.success(`Dia ${data.split('-').reverse().join('/')} marcado como trabalhado (+R$50)`);
        }
      } catch (e) {
        toast.error('Erro ao marcar dia');
      }
    }
  };

  const adicionarPagamento = async (valor: number, data: string) => {
    if (!user) return;
    try {
      const { data: inserido, error } = await supabase.from('transacoes').insert([{
        user_id: user.id,
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
          valor: parseFloat(inserido.valor),
          data: inserido.data,
          descricao: inserido.descricao,
        }, ...prev]);
      }
    } catch (e) {
      toast.error('Erro ao salvar pagamento');
    }
  };

  const adicionarGasto = async (valor: number, data: string, descricao: string) => {
    if (!user) return;
    try {
      const { data: inserido, error } = await supabase.from('transacoes').insert([{
        user_id: user.id,
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
          valor: parseFloat(inserido.valor),
          data: inserido.data,
          descricao: inserido.descricao,
        }, ...prev]);
      }
    } catch (e) {
      toast.error('Erro ao salvar gasto');
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
    } catch (e) {
      toast.error('Erro ao deletar transação');
    }
  };

  const adicionarDinheiroInicial = async (valor: number, descricao: string) => {
    if (!user) return;
    const agora = new Date();
    const hoje = agora.getFullYear() + '-' + 
                 String(agora.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(agora.getDate()).padStart(2, '0');

    try {
      const { data: inserido, error } = await supabase.from('transacoes').insert([{
        user_id: user.id,
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
          valor: parseFloat(inserido.valor),
          data: inserido.data,
          descricao: inserido.descricao,
        }, ...prev]);
      }
    } catch (e) {
      toast.error('Erro ao adicionar saldo');
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
