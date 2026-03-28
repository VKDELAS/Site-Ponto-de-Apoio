import { createClient } from "@/lib/supabase/server"
import { format, subDays, isAfter, isBefore, startOfDay } from "date-fns"
import { DAILY_RATE } from "@/lib/types"

/**
 * Aplica crédito automático de R$50 para o dia atual e recupera dias perdidos
 * 
 * Funciona em 2 modos:
 * 1. Modo Noturno: Marca o dia que está começando (à meia-noite)
 * 2. Modo Recuperação: Quando o usuário faz login, verifica se há dias não creditados e os marca retroativamente
 */
export async function applyAutomaticDailyCredit(userId: string, options?: { includeBackfill?: boolean }) {
  const supabase = await createClient()
  const today = format(new Date(), "yyyy-MM-dd")
  const includeBackfill = options?.includeBackfill !== false // true por padrão

  try {
    if (includeBackfill) {
      // Modo Recuperação: Buscar o último dia creditado
      const { data: lastCreditedDay, error: lastDayError } = await supabase
        .from("worked_days")
        .select("date")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(1)
        .single()

      if (lastDayError && lastDayError.code !== "PGRST116") {
        console.error("[automatic-daily] Error fetching last credited day:", lastDayError)
        return { error: lastDayError.message }
      }

      // Se existe um último dia creditado, processar dias entre ele e hoje
      if (lastCreditedDay) {
        const lastDate = new Date(lastCreditedDay.date)
        const currentDate = new Date(today)
        const daysDifference = Math.floor(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Se há dias não creditados, marcá-los retroativamente
        if (daysDifference > 0) {
          console.log(`[automatic-daily] Backfilling ${daysDifference} days for user ${userId}`)
          const result = await backfillMissingDays(userId, lastDate, currentDate, daysDifference)
          return result
        }
      } else {
        // Nenhum dia creditado ainda, marcar apenas hoje
        console.log("[automatic-daily] No previous days found, marking today")
        return await markSingleDay(userId, today)
      }
    } else {
      // Modo Noturno: Marcar apenas o dia atual
      return await markSingleDay(userId, today)
    }

    return { success: true, action: "already_credited" }
  } catch (error) {
    console.error("[automatic-daily] Unexpected error:", error)
    return { error: "Erro ao aplicar crédito automático" }
  }
}

/**
 * Marca um único dia como trabalhado
 */
async function markSingleDay(userId: string, dateStr: string) {
  const supabase = await createClient()

  try {
    // Verificar se o dia já existe
    const { data: existingDay, error: checkError } = await supabase
      .from("worked_days")
      .select("id")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[automatic-daily] Error checking existing day:", checkError)
      return { error: checkError.message }
    }

    if (existingDay) {
      console.log(`[automatic-daily] Day ${dateStr} already marked`)
      return { success: true, action: "already_marked" }
    }

    // Verificar se já existe transação automática
    const { data: existingTransaction, error: txError } = await supabase
      .from("transactions")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "automatic_daily")
      .eq("date", dateStr)
      .single()

    if (txError && txError.code !== "PGRST116") {
      console.error("[automatic-daily] Error checking existing transaction:", txError)
      return { error: txError.message }
    }

    if (existingTransaction) {
      console.log(`[automatic-daily] Transaction for ${dateStr} already exists`)
      return { success: true, action: "already_credited" }
    }

    // Inserir novo dia trabalhado
    const { error: insertDayError } = await supabase
      .from("worked_days")
      .insert({
        user_id: userId,
        date: dateStr,
      })

    if (insertDayError) {
      console.error("[automatic-daily] Error inserting worked day:", insertDayError)
      return { error: insertDayError.message }
    }

    // Inserir transação automática
    const { error: insertTxError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "automatic_daily",
        description: `Crédito automático de R$${DAILY_RATE} - ${dateStr}`,
        amount: DAILY_RATE,
        date: dateStr,
      })

    if (insertTxError) {
      console.error("[automatic-daily] Error inserting transaction:", insertTxError)
      // Remover o dia trabalhado para manter consistência
      await supabase
        .from("worked_days")
        .delete()
        .eq("user_id", userId)
        .eq("date", dateStr)
      return { error: insertTxError.message }
    }

    // Inserir log de ação
    await supabase
      .from("action_logs")
      .insert({
        user_id: userId,
        action_type: "automatic_daily",
        description: `Crédito automático de R$${DAILY_RATE} adicionado para ${dateStr}`,
        amount: DAILY_RATE,
      })

    console.log(`[automatic-daily] Day ${dateStr} marked successfully`)
    return { success: true, action: "credited", daysMarked: 1 }
  } catch (error) {
    console.error("[automatic-daily] Error in markSingleDay:", error)
    return { error: "Erro ao marcar dia" }
  }
}

/**
 * Marca múltiplos dias retroativamente (dias que o usuário não acessou)
 */
async function backfillMissingDays(
  userId: string,
  lastDate: Date,
  currentDate: Date,
  daysDifference: number
) {
  const supabase = await createClient()
  const daysToMark: string[] = []

  try {
    // Gerar lista de dias a marcar (do dia após o último até hoje)
    for (let i = 1; i <= daysDifference; i++) {
      const dateToMark = subDays(currentDate, daysDifference - i)
      const dateStr = format(dateToMark, "yyyy-MM-dd")
      daysToMark.push(dateStr)
    }

    console.log(`[automatic-daily] Backfilling days: ${daysToMark.join(", ")}`)

    // Buscar dias que já foram marcados
    const { data: alreadyMarked, error: checkError } = await supabase
      .from("worked_days")
      .select("date")
      .eq("user_id", userId)
      .in("date", daysToMark)

    if (checkError) {
      console.error("[automatic-daily] Error checking already marked days:", checkError)
      return { error: checkError.message }
    }

    const alreadyMarkedSet = new Set((alreadyMarked || []).map(d => d.date))
    const daysToInsert = daysToMark.filter(d => !alreadyMarkedSet.has(d))

    if (daysToInsert.length === 0) {
      console.log("[automatic-daily] All days already marked")
      return { success: true, action: "already_credited", daysMarked: 0 }
    }

    // Inserir dias trabalhados
    const workedDaysData = daysToInsert.map(date => ({
      user_id: userId,
      date: date,
    }))

    const { error: insertDaysError } = await supabase
      .from("worked_days")
      .insert(workedDaysData)

    if (insertDaysError) {
      console.error("[automatic-daily] Error inserting worked days:", insertDaysError)
      return { error: insertDaysError.message }
    }

    // Inserir transações automáticas
    const transactionsData = daysToInsert.map(date => ({
      user_id: userId,
      type: "automatic_daily",
      description: `Crédito automático de R$${DAILY_RATE} - ${date}`,
      amount: DAILY_RATE,
      date: date,
    }))

    const { error: insertTxError } = await supabase
      .from("transactions")
      .insert(transactionsData)

    if (insertTxError) {
      console.error("[automatic-daily] Error inserting transactions:", insertTxError)
      // Remover os dias trabalhados para manter consistência
      await supabase
        .from("worked_days")
        .delete()
        .in("date", daysToInsert)
        .eq("user_id", userId)
      return { error: insertTxError.message }
    }

    // Inserir log de ação consolidado
    const totalAmount = daysToInsert.length * DAILY_RATE
    await supabase
      .from("action_logs")
      .insert({
        user_id: userId,
        action_type: "automatic_daily_backfill",
        description: `Crédito automático retroativo: ${daysToInsert.length} dia(s) marcado(s) (${daysToInsert.join(", ")}) = R$${totalAmount}`,
        amount: totalAmount,
      })

    console.log(`[automatic-daily] Backfilled ${daysToInsert.length} days successfully`)
    return {
      success: true,
      action: "credited",
      daysMarked: daysToInsert.length,
      totalAmount: totalAmount,
      days: daysToInsert,
    }
  } catch (error) {
    console.error("[automatic-daily] Error in backfillMissingDays:", error)
    return { error: "Erro ao recuperar dias perdidos" }
  }
}
