"use client"

import { useState } from "react"
import type { PamonhaSabor } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, Plus, Minus } from "lucide-react"
import { deletePamonhaSabor } from "@/lib/pamonha-actions"
import { getBarbanteCSSStyle } from "@/lib/barbante-utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Props = {
  sabores: PamonhaSabor[]
  onMovimentacao: (sabor: PamonhaSabor, tipo: "entrada" | "saida") => void
}

export function SaboresList({ sabores, onMovimentacao }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (sabor_id: string) => {
    setIsDeleting(true)
    try {
      const result = await deletePamonhaSabor(sabor_id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Sabor deletado com sucesso")
        router.refresh()
      }
    } catch (error) {
      toast.error("Erro ao deletar sabor")
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  const getStockStatus = (quantidade: number) => {
    if (quantidade === 0) return { label: "Zerado", color: "destructive" }
    if (quantidade <= 5) return { label: "Acabando", color: "secondary" }
    return { label: "OK", color: "default" }
  }

  const getCategoryLabel = (categoria: string) => {
    return categoria === "SALGADA" ? "Salgada" : "Doce"
  }

  if (sabores.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhum sabor cadastrado</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-lg font-semibold">Sabores</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {sabores.map((sabor) => {
          const status = getStockStatus(sabor.quantidade)
          const barbante = sabor.barbante as any

          return (
            <div
              key={sabor.id}
              className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{sabor.nome}</h3>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(sabor.categoria)}
                    </Badge>
                    <Badge variant={status.color} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Barbante Color */}
              {barbante && (
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full border-2 border-gray-300"
                    style={{
                      background: getBarbanteCSSStyle(barbante),
                    }}
                    title={barbante.nome}
                  />
                  <span className="text-sm text-muted-foreground">
                    {barbante.nome}
                  </span>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-4 rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">Quantidade</p>
                <p className="text-2xl font-bold">{sabor.quantidade}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => onMovimentacao(sabor, "entrada")}
                >
                  <Plus className="h-4 w-4" />
                  Entrada
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => onMovimentacao(sabor, "saida")}
                  disabled={sabor.quantidade === 0}
                >
                  <Minus className="h-4 w-4" />
                  Saída
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeletingId(sabor.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar sabor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O sabor e todo seu histórico de movimentações serão deletados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
