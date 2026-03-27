"use client"

import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  DollarSign,
  LogOut,
} from "lucide-react"

type Props = {
  user: User
  monthName: string
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
  onAddTransaction: () => void
}

export function DashboardHeader({
  user,
  monthName,
  year,
  month,
  onMonthChange,
  onAddTransaction,
}: Props) {
  const router = useRouter()

  function handlePrevMonth() {
    if (month === 0) {
      onMonthChange(year - 1, 11)
    } else {
      onMonthChange(year, month - 1)
    }
  }

  function handleNextMonth() {
    if (month === 11) {
      onMonthChange(year + 1, 0)
    } else {
      onMonthChange(year, month + 1)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U"

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <DollarSign className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-semibold sm:inline-block">
            Controle Financeiro
          </span>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[180px] text-center font-medium capitalize">
            {monthName}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1" onClick={onAddTransaction}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Transação</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
