"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { MonthData, Transaction } from "@/lib/types"
import { DAILY_RATE } from "@/lib/types"
import { DashboardHeader } from "./dashboard-header"
import { FinancialSummary } from "./financial-summary"
import { WorkCalendar } from "./work-calendar"
import { TransactionList } from "./transaction-list"
import { ActivityLog } from "./activity-log"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type Props = {
  user: User
  initialData: MonthData
  initialYear: number
  initialMonth: number
}

export function DashboardContent({ user, initialData, initialYear, initialMonth }: Props) {
  const router = useRouter()
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [data, setData] = useState(initialData)
  
  // Sync data when initialData changes (after router.refresh())
  useEffect(() => {
    setData(initialData)
  }, [initialData])
  
  // Dialog states
  const [addTransactionOpen, setAddTransactionOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  // Calculate summaries
  const summary = useMemo(() => {
    const workedDaysCount = data.workedDays.length
    const totalEarnings = workedDaysCount * DAILY_RATE
    
    const totalIncome = data.transactions
      .filter(t => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0)
      
    const totalExpenses = data.transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0)

    const totalPaymentsReceived = data.transactions
      .filter(t => t.type === "payment_received")
      .reduce((acc, t) => acc + t.amount, 0)

    // O saldo do mês é o que resta a receber (Ganhos + Outras Entradas - Despesas - O que já foi pago)
    const balance = totalEarnings + totalIncome - totalExpenses - totalPaymentsReceived

    return {
      workedDays: workedDaysCount,
      totalEarnings,
      totalIncome,
      totalExpenses,
      totalPaymentsReceived,
      balance,
    }
  }, [data])

  // Handle month change
  function handleMonthChange(newYear: number, newMonth: number) {
    setYear(newYear)
    setMonth(newMonth)
    router.push(`/dashboard?year=${newYear}&month=${newMonth}`)
  }

  // Refresh data after mutations
  function refreshData() {
    router.refresh()
  }

  const monthName = format(new Date(year, month), "MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        user={user}
        monthName={monthName}
        year={year}
        month={month}
        onMonthChange={handleMonthChange}
        onAddTransaction={() => setAddTransactionOpen(true)}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Calendar and Summary */}
          <div className="space-y-6 lg:col-span-2">
            <FinancialSummary summary={summary} />
            
            <WorkCalendar
              year={year}
              month={month}
              workedDays={data.workedDays}
              onRefresh={refreshData}
            />
          </div>

          {/* Right Column - Transactions and Activity */}
          <div className="space-y-6">
            <TransactionList
              transactions={data.transactions}
              onEdit={setEditingTransaction}
              onAddNew={() => setAddTransactionOpen(true)}
            />

            <ActivityLog />
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddTransactionDialog
        open={addTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        onSuccess={refreshData}
      />

      {editingTransaction && (
        <EditTransactionDialog
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          transaction={editingTransaction}
          onSuccess={refreshData}
        />
      )}
    </div>
  )
}
