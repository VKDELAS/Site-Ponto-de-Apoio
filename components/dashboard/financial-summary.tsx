"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, DollarSign, TrendingUp, TrendingDown, Wallet, HandCoins } from "lucide-react"
import { cn } from "@/lib/utils"
import { DAILY_RATE } from "@/lib/types"

type Props = {
  summary: {
    workedDays: number
    totalEarnings: number
    totalIncome: number
    totalExpenses: number
    totalPaymentsReceived?: number
    balance: number
  }
}

export function FinancialSummary({ summary }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const cards = [
    {
      title: "Dias Trabalhados",
      value: summary.workedDays.toString(),
      subtitle: `R$${DAILY_RATE}/dia`,
      icon: CalendarDays,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Ganhos (Trabalho)",
      value: formatCurrency(summary.totalEarnings),
      subtitle: `${summary.workedDays} dias marcados`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pagamentos",
      value: formatCurrency(summary.totalPaymentsReceived || 0),
      subtitle: "Recebido da mãe",
      icon: HandCoins,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Despesas",
      value: formatCurrency(summary.totalExpenses),
      subtitle: "Total de gastos",
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "A Receber",
      value: formatCurrency(summary.balance),
      subtitle: summary.balance >= 0 ? "Saldo restante" : "Saldo devedor",
      icon: Wallet,
      color: summary.balance >= 0 ? "text-primary" : "text-red-500",
      bgColor: summary.balance >= 0 ? "bg-primary/10" : "bg-red-500/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={cn("rounded-full p-2 transition-transform group-hover:scale-110", card.bgColor)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-lg font-bold", card.color)}>
              {card.value}
            </div>
            <p className="text-[10px] font-medium text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
