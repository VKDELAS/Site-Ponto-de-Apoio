"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { TransactionType } from "@/lib/types"
import { DAILY_RATE } from "@/lib/types"

// Toggle worked day - clicar marca/desmarca e adiciona/remove R$50
export async function toggleWorkedDay(date: string) {
  console.log("[v0] toggleWorkedDay called with date:", date)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log("[v0] User:", user?.id)
  
  if (!user) {
    console.log("[v0] No user found")
    return { error: "Não autenticado" }
  }

  // Check if day already exists
  const { data: existingDay, error: checkError } = await supabase
    .from("worked_days")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .single()
  
  console.log("[v0] Existing day check:", existingDay, "Error:", checkError)

  if (existingDay) {
    // Remove worked day
    const { error } = await supabase
      .from("worked_days")
      .delete()
      .eq("id", existingDay.id)
      .eq("user_id", user.id)

    if (error) {
      return { error: error.message }
    }

    // Também remover transação automática se existir para esse dia
    await supabase
      .from("transactions")
      .delete()
      .eq("user_id", user.id)
      .eq("date", date)
      .eq("type", "automatic_daily")

    await logAction({
      action_type: "delete",
      description: `Removeu dia trabalhado: ${date}`,
      amount: -DAILY_RATE,
    })

    revalidatePath("/dashboard", "max")
    return { success: true, action: "removed" }
  } else {
    // Add worked day
    console.log("[v0] Inserting new worked day for user:", user.id, "date:", date)
    
    const { data: insertedData, error } = await supabase.from("worked_days").insert({
      user_id: user.id,
      date: date,
    }).select()

    console.log("[v0] Insert result - Data:", insertedData, "Error:", error)

    if (error) {
      console.log("[v0] Insert error:", error)
      return { error: error.message }
    }

    await logAction({
      action_type: "create",
      description: `Marcou dia trabalhado: ${date} (+R$${DAILY_RATE})`,
      amount: DAILY_RATE,
    })

    revalidatePath("/dashboard", "max")
    return { success: true, action: "added" }
  }
}

export async function deleteWorkedDay(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Não autenticado" }
  }

  // Buscar a data antes de deletar para poder remover a transação automática
  const { data: dayData } = await supabase
    .from("worked_days")
    .select("date")
    .eq("id", id)
    .single()

  const { error } = await supabase
    .from("worked_days")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  if (dayData) {
    await supabase
      .from("transactions")
      .delete()
      .eq("user_id", user.id)
      .eq("date", dayData.date)
      .eq("type", "automatic_daily")
  }

  await logAction({
    action_type: "delete",
    description: `Removeu dia trabalhado`,
    amount: -DAILY_RATE,
  })

  revalidatePath("/dashboard", "max")
  return { success: true }
}

// Transaction Actions
export async function addTransaction(data: {
  type: TransactionType
  description: string
  amount: number
  date: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Não autenticado" }
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: data.type,
    description: data.description,
    amount: data.amount,
    date: data.date,
  })

  if (error) {
    return { error: error.message }
  }

  const typeLabel = data.type === "income" ? "Receita" : "Despesa"
  await logAction({
    action_type: "create",
    description: `${typeLabel}: ${data.description} - R$ ${data.amount.toFixed(2)}`,
    amount: data.type === "income" ? data.amount : -data.amount,
  })

  revalidatePath("/dashboard", "max")
  return { success: true }
}

export async function updateTransaction(id: string, data: {
  type?: TransactionType
  description?: string
  amount?: number
  date?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Não autenticado" }
  }

  const { error } = await supabase
    .from("transactions")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  await logAction({
    action_type: "update",
    description: `Atualizou transação`,
    amount: null,
  })

  revalidatePath("/dashboard", "max")
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Não autenticado" }
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  await logAction({
    action_type: "delete",
    description: `Removeu transação`,
    amount: null,
  })

  revalidatePath("/dashboard", "max")
  return { success: true }
}

// Action Logs
async function logAction(data: {
  action_type: string
  description: string
  amount: number | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return
  
  await supabase.from("action_logs").insert({
    user_id: user.id,
    action_type: data.action_type,
    description: data.description,
    amount: data.amount,
  })
}

export async function getActionLogs(limit = 10) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  const { data } = await supabase
    .from("action_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  return data || []
}
