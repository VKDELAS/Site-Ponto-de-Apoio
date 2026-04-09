import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import type { WorkedDay, Transaction } from "@/lib/types"
import { startOfMonth, endOfMonth, format } from "date-fns"
import { applyAutomaticDailyCredit } from "@/lib/automatic-daily"

async function getMonthData(userId: string, year: number, month: number) {
  const supabase = await createClient()
  
  const startDate = format(startOfMonth(new Date(year, month)), "yyyy-MM-dd")
  const endDate = format(endOfMonth(new Date(year, month)), "yyyy-MM-dd")

  const [workedDaysResult, transactionsResult, allWorkedDaysResult, allTransactionsResult] = await Promise.all([
    supabase
      .from("worked_days")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true }),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false }),
    supabase
      .from("worked_days")
      .select("*")
      .eq("user_id", userId),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId),
  ])

  return {
    workedDays: (workedDaysResult.data as WorkedDay[]) || [],
    transactions: (transactionsResult.data as Transaction[]) || [],
    allWorkedDays: (allWorkedDaysResult.data as WorkedDay[]) || [],
    allTransactions: (allTransactionsResult.data as Transaction[]) || [],
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const params = await searchParams
  const now = new Date()
  const year = params.year ? parseInt(params.year) : now.getFullYear()
  const month = params.month ? parseInt(params.month) : now.getMonth()

  // Aplicar crédito automático antes de buscar os dados
  await applyAutomaticDailyCredit(user.id)

  const monthData = await getMonthData(user.id, year, month)

  return (
    <DashboardContent
      user={user}
      initialData={monthData}
      initialYear={year}
      initialMonth={month}
    />
  )
}
