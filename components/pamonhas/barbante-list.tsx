"use client"

import { useState } from "react"
import type { PamonhaBarbante } from "@/lib/types"
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
import { Trash2 } from "lucide-react"
import { deleteBarbante } from "@/lib/barbante-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getBarbanteCSSStyle } from "@/lib/barbante-utils"

type Props = {
  barbantes: PamonhaBarbante[]
}

export function BarbantList({ barbantes }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (barbante_id: string) => {
    setIsDeleting(true)
    try {
      const result = await deleteBarbante(barbante_id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Barbante deletado com sucesso")
        router.refresh()
      }
    } catch (error) {
      toast.error("Erro ao deletar barbante")
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  if (barbantes.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-sm text-muted-foreground">
          Nenhum barbante configurado
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">Barbantes Configurados</h2>

      <div className="grid gap-3">
        {barbantes.map((barbante) => (
          <div
            key={barbante.id}
            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Color Preview */}
              <div
                className="h-8 w-8 rounded-lg border-2 border-gray-300 flex-shrink-0"
                style={{
                  background: getBarbanteCSSStyle(barbante),
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{barbante.nome}</p>
                <div className="flex gap-2 mt-1">
                  {barbante.cor_secundaria && (
                    <Badge variant="secondary" className="text-xs">
                      Meio a Meio
                    </Badge>
                  )}
                  {barbante.is_especial && (
                    <Badge variant="outline" className="text-xs">
                      Especial
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeletingId(barbante.id)}
              className="text-destructive hover:text-destructive ml-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar barbante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O barbante será removido da configuração.
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
