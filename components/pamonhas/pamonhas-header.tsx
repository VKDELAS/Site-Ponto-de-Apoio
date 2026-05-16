"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, LogOut, LayoutDashboard, Wheat, Settings, DollarSign } from "lucide-react"
import type { PamonhaBarbante } from "@/lib/types"

type Props = {
  user: User
  onAddSabor: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  barbantes?: PamonhaBarbante[]
}

export function PamonhasHeader({
  user,
  onAddSabor,
  searchTerm,
  onSearchChange,
}: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
            <Wheat className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">Pamonhas</h1>
            <p className="text-xs text-muted-foreground">Gerenciamento de Estoque</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sabor ou barbante..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            onClick={onAddSabor}
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold shadow-sm gap-2 border-none"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Sabor</span>
          </Button>

          <div className="hidden h-8 w-[1px] bg-border md:block" />

          <div className="hidden items-center gap-1 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="gap-2 font-medium hover:bg-yellow-500/10 hover:text-yellow-600"
            >
              <DollarSign className="h-4 w-4" />
              Financeiro
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/pamonhas/configuracoes")}
              className="gap-2 font-medium hover:bg-yellow-500/10 hover:text-yellow-600"
            >
              <Settings className="h-4 w-4" />
              Barbantes
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border bg-muted/30 hover:bg-yellow-500/10">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push("/dashboard")} className="md:hidden">
                <DollarSign className="mr-2 h-4 w-4" />
                Financeiro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/pamonhas/configuracoes")} className="md:hidden">
                <Settings className="mr-2 h-4 w-4" />
                Barbantes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard Geral
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} disabled={isLoading} className="text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t px-4 py-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sabor ou barbante..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
    </header>
  )
}
