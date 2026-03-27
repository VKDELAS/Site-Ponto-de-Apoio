"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CreditCard, Plus, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Transaction } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onAddNew: () => void
}

export function TransactionList({ transactions, onEdit, onAddNew }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Transações
        </CardTitle>
        <Button size="sm" variant="outline" onClick={onAddNew}>
          <Plus className="mr-1 h-4 w-4" />
          Nova
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CreditCard className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma transação neste mês
            </p>
            <Button size="sm" variant="link" onClick={onAddNew}>
              Adicionar primeira transação
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {transactions.map((transaction) => (
                <button
                  key={transaction.id}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
                  onClick={() => onEdit(transaction)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        transaction.type === "income"
                          ? "bg-green-500/10"
                          : "bg-red-500/10"
                      )}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.description || "Sem descrição"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "dd MMM", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      transaction.type === "income"
                        ? "text-green-500"
                        : "text-red-500"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
