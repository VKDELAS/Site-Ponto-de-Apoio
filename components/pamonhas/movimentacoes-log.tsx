"use client"

import type { MovimentacaoEstoque } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

type Props = {
  movimentacoes: MovimentacaoEstoque[]
}

export function MovimentacoesLog({ movimentacoes }: Props) {
  if (movimentacoes.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Histórico</h2>
        <p className="text-center text-sm text-muted-foreground">
          Nenhuma movimentação registrada
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">Histórico Recente</h2>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          {movimentacoes.map((mov) => {
            const isEntrada = mov.tipo === "entrada"
            const pamonha = mov.pamonha as any

            return (
              <div
                key={mov.id}
                className="flex items-start gap-3 rounded-lg border p-3 text-sm"
              >
                {/* Icon */}
                <div
                  className={`mt-0.5 rounded-full p-2 ${
                    isEntrada
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-red-100 dark:bg-red-900"
                  }`}
                >
                  {isEntrada ? (
                    <ArrowUp className={`h-4 w-4 text-green-600 dark:text-green-400`} />
                  ) : (
                    <ArrowDown className={`h-4 w-4 text-red-600 dark:text-red-400`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {pamonha?.nome || "Sabor desconhecido"}
                    </p>
                    <Badge
                      variant={isEntrada ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {isEntrada ? "+" : "-"}{mov.quantidade}
                    </Badge>
                  </div>

                  {/* Barbante Color */}
                  {pamonha?.barbante_cor && (
                    <div className="mt-1 flex items-center gap-1">
                      <div
                        className="h-3 w-3 rounded-full border border-gray-300"
                        style={{ background: pamonha.barbante_cor }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {pamonha.barbante_cor}
                      </span>
                    </div>
                  )}

                  {/* Time */}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(mov.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>

                  {/* Observacao */}
                  {mov.observacao && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {mov.observacao}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </Card>
  )
}
