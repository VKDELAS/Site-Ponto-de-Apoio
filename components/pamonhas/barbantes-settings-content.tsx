"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { PamonhaBarbante } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import { BarbantConfigDialog } from "./barbante-config-dialog"
import { BarbantList } from "./barbante-list"

type Props = {
  user: User
  initialBarbantes: PamonhaBarbante[]
}

export function BarbantesSettingsContent({ user, initialBarbantes }: Props) {
  const router = useRouter()
  const [barbantes, setBarbantes] = useState(initialBarbantes)
  const [configOpen, setConfigOpen] = useState(false)

  function refreshData() {
    router.refresh()
  }

  function handleSuccess() {
    setConfigOpen(false)
    refreshData()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/pamonhas")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Configuração de Barbantes</h1>
              <p className="text-xs text-muted-foreground">Gerencie os tipos de barbante disponíveis</p>
            </div>
          </div>

          <Button
            onClick={() => setConfigOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Barbante</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Configure aqui todos os tipos de barbante que você utiliza. Você pode criar cores simples, 
              combinações meio a meio (que serão renderizadas automaticamente) ou tipos especiais como "Branco com Palha".
            </p>
          </div>

          <BarbantList barbantes={barbantes} />
        </div>
      </main>

      {/* Dialog */}
      <BarbantConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
