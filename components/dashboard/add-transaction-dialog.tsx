"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TrendingUp, TrendingDown, HandCoins } from "lucide-react"
import { format } from "date-fns"
import { addTransaction } from "@/lib/actions"
import type { TransactionType } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddTransactionDialog({ open, onOpenChange, onSuccess }: Props) {
  const [type, setType] = useState<TransactionType>("expense")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await addTransaction({
      type,
      description,
      amount: parseFloat(amount),
      date,
    })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // Reset form
    setType("expense")
    setDescription("")
    setAmount("")
    setDate(format(new Date(), "yyyy-MM-dd"))
    setIsLoading(false)
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione uma entrada, despesa ou pagamento recebido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Tipo de Transação</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex flex-col h-auto py-2 gap-1",
                    type === "income" && "border-primary bg-primary/10 text-primary"
                  )}
                  onClick={() => {
                    setType("income")
                    if (!description) setDescription("Entrada Extra")
                  }}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px]">Entrada</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex flex-col h-auto py-2 gap-1",
                    type === "expense" && "border-red-500 bg-red-500/10 text-red-500"
                  )}
                  onClick={() => {
                    setType("expense")
                  }}
                >
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-[10px]">Despesa</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex flex-col h-auto py-2 gap-1",
                    type === "payment_received" && "border-yellow-500 bg-yellow-500/10 text-yellow-600"
                  )}
                  onClick={() => {
                    setType("payment_received")
                    if (!description) setDescription("Pagamento da Mãe")
                  }}
                >
                  <HandCoins className="h-4 w-4" />
                  <span className="text-[10px]">Pagamento</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Almoço, Salário mensal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Transação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
