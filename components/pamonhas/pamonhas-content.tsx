"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { PamonhaSabor, MovimentacaoEstoque } from "@/lib/types"
import { toast } from "sonner"
import { PamonhasHeader } from "./pamonhas-header"
import { PamonhasDashboard } from "./pamonhas-dashboard"
import { SaboresList } from "./sabores-list"
import { MovimentacoesLog } from "./movimentacoes-log"
import { AddSaborDialog } from "./add-sabor-dialog"
import { EditSaborDialog } from "./edit-sabor-dialog"
import { MovimentacaoDialog } from "./movimentacao-dialog"

type Props = {
  user: User
  initialData: {
    sabores: PamonhaSabor[]
    movimentacoes: MovimentacaoEstoque[]
  }
}

export function PamonhasContent({ user, initialData }: Props) {
  const router = useRouter()
  const [sabores, setSabores] = useState(initialData.sabores)
  const [movimentacoes, setMovimentacoes] = useState(initialData.movimentacoes)
  const [addSaborOpen, setAddSaborOpen] = useState(false)
  const [editSaborOpen, setEditSaborOpen] = useState(false)
  const [movimentacaoOpen, setMovimentacaoOpen] = useState(false)
  const [selectedSabor, setSelectedSabor] = useState<PamonhaSabor | null>(null)
  const [movimentacaoType, setMovimentacaoType] = useState<"entrada" | "saida">("entrada")
  const [searchTerm, setSearchTerm] = useState("")

  // Refresh data
  function refreshData() {
    router.refresh()
  }

  // Filter sabores by search
  const filteredSabores = sabores.filter((s) =>
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.barbante?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle add sabor
  function handleAddSabor() {
    setAddSaborOpen(true)
  }

  // Handle edit sabor
  function handleEditSabor(sabor: PamonhaSabor) {
    setSelectedSabor(sabor)
    setEditSaborOpen(true)
  }

  // Handle movimentacao
  function handleMovimentacao(sabor: PamonhaSabor, tipo: "entrada" | "saida") {
    setSelectedSabor(sabor)
    setMovimentacaoType(tipo)
    setMovimentacaoOpen(true)
  }

  // Handle success
  function handleSuccess() {
    refreshData()
    setAddSaborOpen(false)
    setEditSaborOpen(false)
    setMovimentacaoOpen(false)
    setSelectedSabor(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <PamonhasHeader
        user={user}
        onAddSabor={handleAddSabor}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Dashboard and Sabores */}
          <div className="space-y-6 lg:col-span-2">
            <PamonhasDashboard sabores={sabores} />

            <SaboresList
              sabores={filteredSabores}
              onMovimentacao={handleMovimentacao}
              onEdit={handleEditSabor}
            />
          </div>

          {/* Right Column - Movimentacoes Log */}
          <div className="space-y-6">
            <MovimentacoesLog movimentacoes={movimentacoes} />
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddSaborDialog
        open={addSaborOpen}
        onOpenChange={setAddSaborOpen}
        onSuccess={handleSuccess}
      />

      {selectedSabor && (
        <>
          <EditSaborDialog
            open={editSaborOpen}
            onOpenChange={(open) => {
              setEditSaborOpen(open)
              if (!open) setSelectedSabor(null)
            }}
            sabor={selectedSabor}
            onSuccess={handleSuccess}
          />
          <MovimentacaoDialog
            open={movimentacaoOpen}
            onOpenChange={(open) => {
              setMovimentacaoOpen(open)
              if (!open) setSelectedSabor(null)
            }}
            sabor={selectedSabor}
            tipo={movimentacaoType}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  )
}
