"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { PamonhaSabor, MovimentacaoEstoque } from "@/lib/types"

export async function getPamonhaSabores() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado", sabores: [] }
  }

  const { data, error } = await supabase
    .from("pamonha_sabores")
    .select(`
      *,
      barbante:barbante_id(id, nome, cor_principal, cor_secundaria, is_especial)
    `)
    .eq("user_id", user.id)
    .order("categoria", { ascending: true })
    .order("nome", { ascending: true })

  if (error) {
    console.error("Erro ao buscar sabores:", error)
    return { error: error.message, sabores: [] }
  }

  return { error: null, sabores: (data as PamonhaSabor[]) || [] }
}

export async function addPamonhaSabor(params: {
  nome: string
  categoria: "SALGADA" | "DOCE"
  barbante_id: string | null
  quantidade: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado", sabor: null }
  }

  const { data, error } = await supabase
    .from("pamonha_sabores")
    .insert([
      {
        user_id: user.id,
        nome: params.nome,
        categoria: params.categoria,
        barbante_id: params.barbante_id,
        quantidade: params.quantidade,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select(`
      *,
      barbante:barbante_id(id, nome, cor_principal, cor_secundaria, is_especial)
    `)
    .single()

  if (error) {
    console.error("Erro ao adicionar sabor:", error)
    return { error: error.message, sabor: null }
  }

  // Log action
  await logPamonhaAction({
    action_type: "add_sabor",
    description: `Adicionado sabor: ${params.nome}`,
    sabor_id: data.id,
  })

  revalidatePath("/pamonhas")
  return { error: null, sabor: data as PamonhaSabor }
}

export async function registrarMovimentacao(params: {
  pamonha_id: string
  tipo: "entrada" | "saida"
  quantidade: number
  observacao?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado", movimentacao: null }
  }

  // Get current sabor
  const { data: sabor, error: sabor_error } = await supabase
    .from("pamonha_sabores")
    .select("*")
    .eq("id", params.pamonha_id)
    .eq("user_id", user.id)
    .single()

  if (sabor_error || !sabor) {
    return { error: "Sabor não encontrado", movimentacao: null }
  }

  // Calculate new quantity
  const novaQuantidade =
    params.tipo === "entrada"
      ? sabor.quantidade + params.quantidade
      : sabor.quantidade - params.quantidade

  // Prevent negative stock
  if (novaQuantidade < 0) {
    return { error: "Estoque insuficiente", movimentacao: null }
  }

  // Update quantity
  const { error: update_error } = await supabase
    .from("pamonha_sabores")
    .update({
      quantidade: novaQuantidade,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.pamonha_id)
    .eq("user_id", user.id)

  if (update_error) {
    console.error("Erro ao atualizar quantidade:", update_error)
    return { error: update_error.message, movimentacao: null }
  }

  // Record movement
  const { data: movimentacao, error: mov_error } = await supabase
    .from("movimentacoes_estoque")
    .insert([
      {
        user_id: user.id,
        pamonha_id: params.pamonha_id,
        tipo: params.tipo,
        quantidade: params.quantidade,
        observacao: params.observacao || null,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (mov_error) {
    console.error("Erro ao registrar movimentação:", mov_error)
    return { error: mov_error.message, movimentacao: null }
  }

  // Log action
  await logPamonhaAction({
    action_type: params.tipo === "entrada" ? "entrada_estoque" : "saida_estoque",
    description: `${params.tipo === "entrada" ? "Entrada" : "Saída"} de ${params.quantidade} ${sabor.nome}`,
    sabor_id: params.pamonha_id,
  })

  revalidatePath("/pamonhas")
  return { error: null, movimentacao: movimentacao as MovimentacaoEstoque }
}

export async function getMovimentacoes(limit: number = 50) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado", movimentacoes: [] }
  }

  const { data, error } = await supabase
    .from("movimentacoes_estoque")
    .select(
      `
      *,
      pamonha:pamonha_id(id, nome, categoria, barbante_cor)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Erro ao buscar movimentações:", error)
    return { error: error.message, movimentacoes: [] }
  }

  return { error: null, movimentacoes: (data as MovimentacaoEstoque[]) || [] }
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: "Não autenticado",
      stats: {
        totalPamonhas: 0,
        totalSalgadas: 0,
        totalDoces: 0,
        saboresAcabando: 0,
        saboresZerados: 0,
      },
    }
  }

  const { data: sabores, error } = await supabase
    .from("pamonha_sabores")
    .select("*")
    .eq("user_id", user.id)

  if (error) {
    console.error("Erro ao buscar stats:", error)
    return { error: error.message, stats: null }
  }

  const saboresArray = sabores as PamonhaSabor[]
  const totalPamonhas = saboresArray.reduce((acc, s) => acc + s.quantidade, 0)
  const totalSalgadas = saboresArray
    .filter((s) => s.categoria === "SALGADA")
    .reduce((acc, s) => acc + s.quantidade, 0)
  const totalDoces = saboresArray
    .filter((s) => s.categoria === "DOCE")
    .reduce((acc, s) => acc + s.quantidade, 0)
  const saboresAcabando = saboresArray.filter(
    (s) => s.quantidade > 0 && s.quantidade <= 5
  ).length
  const saboresZerados = saboresArray.filter((s) => s.quantidade === 0).length

  return {
    error: null,
    stats: {
      totalPamonhas,
      totalSalgadas,
      totalDoces,
      saboresAcabando,
      saboresZerados,
    },
  }
}

export async function deletePamonhaSabor(sabor_id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Delete related movements first
  await supabase
    .from("movimentacoes_estoque")
    .delete()
    .eq("pamonha_id", sabor_id)
    .eq("user_id", user.id)

  // Delete sabor
  const { error } = await supabase
    .from("pamonha_sabores")
    .delete()
    .eq("id", sabor_id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Erro ao deletar sabor:", error)
    return { error: error.message }
  }

  await logPamonhaAction({
    action_type: "delete_sabor",
    description: `Sabor deletado: ${sabor_id}`,
    sabor_id,
  })

  revalidatePath("/pamonhas")
  return { error: null }
}

async function logPamonhaAction(params: {
  action_type: string
  description: string
  sabor_id: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from("pamonha_action_logs").insert([
    {
      user_id: user.id,
      action_type: params.action_type,
      description: params.description,
      sabor_id: params.sabor_id,
      created_at: new Date().toISOString(),
    },
  ])
}
