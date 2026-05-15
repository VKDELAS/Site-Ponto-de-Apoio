"use client"

import { useMemo } from "react"
import type { PamonhaSabor } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { AlertCircle, TrendingUp, Wheat, AlertTriangle } from "lucide-react"

type Props = {
  sabores: PamonhaSabor[]
}

export function PamonhasDashboard({ sabores }: Props) {
  const stats = useMemo(() => {
    const totalPamonhas = sabores.reduce((acc, s) => acc + s.quantidade, 0)
    const totalSalgadas = sabores
      .filter((s) => s.categoria === "SALGADA")
      .reduce((acc, s) => acc + s.quantidade, 0)
    const totalDoces = sabores
      .filter((s) => s.categoria === "DOCE")
      .reduce((acc, s) => acc + s.quantidade, 0)
    const saboresAcabando = sabores.filter(
      (s) => s.quantidade > 0 && s.quantidade <= 5
    ).length
    const saboresZerados = sabores.filter((s) => s.quantidade === 0).length

    return {
      totalPamonhas,
      totalSalgadas,
      totalDoces,
      saboresAcabando,
      saboresZerados,
    }
  }, [sabores])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Pamonhas */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total de Pamonhas
            </p>
            <p className="text-3xl font-bold">{stats.totalPamonhas}</p>
          </div>
          <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
            <Wheat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card>

      {/* Salgadas */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Salgadas
            </p>
            <p className="text-3xl font-bold">{stats.totalSalgadas}</p>
          </div>
          <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900">
            <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </Card>

      {/* Doces */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Doces
            </p>
            <p className="text-3xl font-bold">{stats.totalDoces}</p>
          </div>
          <div className="rounded-lg bg-pink-100 p-3 dark:bg-pink-900">
            <TrendingUp className="h-6 w-6 text-pink-600 dark:text-pink-400" />
          </div>
        </div>
      </Card>

      {/* Sabores Acabando */}
      {stats.saboresAcabando > 0 && (
        <Card className="p-6 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                Acabando
              </p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.saboresAcabando}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-200 p-3 dark:bg-yellow-800">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
      )}

      {/* Sabores Zerados */}
      {stats.saboresZerados > 0 && (
        <Card className="p-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                Zerados
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.saboresZerados}
              </p>
            </div>
            <div className="rounded-lg bg-red-200 p-3 dark:bg-red-800">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
