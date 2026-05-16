"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { PamonhaBarbante } from "@/lib/types"

export async function getBarbantes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado", barbantes: [] }
  }

  const { data, error } = await supabase
    .from("pamonha_barbantes")
    .select("*")
    .eq("user_id", user.id)
    .order("nome", { ascending: true })

  if (error) {
    console.error("Erro ao buscar barbantes:", error)
    return { error: error.message, barbantes: [] }
  }

  return { error: null, barbantes: (data as PamonhaBarbante[]) || [] }
}

export async function addBarbante(params: {
  nome: string
  cor_principal: string
  cor_secundaria?: string
  is_especial?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado", barbante: null }
  }

  const { data, error } = await supabase
    .from("pamonha_barbantes")
    .insert([
      {
        user_id: user.id,
        nome: params.nome,
        cor_principal: params.cor_principal,
        cor_secundaria: params.cor_secundaria || null,
        is_especial: params.is_especial || false,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Erro ao adicionar barbante:", error)
    return { error: error.message, barbante: null }
  }

  revalidatePath("/pamonhas")
  return { error: null, barbante: data as PamonhaBarbante }
}

export async function deleteBarbante(barbante_id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Check if barbante is in use
  const { data: saboresUsing } = await supabase
    .from("pamonha_sabores")
    .select("id")
    .eq("barbante_id", barbante_id)
    .eq("user_id", user.id)

  if (saboresUsing && saboresUsing.length > 0) {
    return { error: "Este barbante está sendo usado em sabores e não pode ser deletado" }
  }

  const { error } = await supabase
    .from("pamonha_barbantes")
    .delete()
    .eq("id", barbante_id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Erro ao deletar barbante:", error)
    return { error: error.message }
  }

  revalidatePath("/pamonhas")
  return { error: null }
}
