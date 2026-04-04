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
  LogOut,
  User as UserIcon
} from "lucide-react"
import Image from "next/image"

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

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary overflow-hidden shadow-sm">
            <Image 
              src="/favicon.png" 
              alt="Logo" 
              width={40} 
              height={40} 
              className="object-cover"
            />
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-black uppercase tracking-tighter leading-none">Ponto de</span>
            <span className="text-sm font-black uppercase tracking-tighter leading-none">Apoio</span>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[120px] text-center text-xs font-bold uppercase tracking-widest px-2">
            {monthName}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={onAddTransaction} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Nova Transação</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 overflow-hidden border bg-muted/30">
                <Avatar className="h-10 w-10 rounded-none">
                  <AvatarFallback className="bg-transparent">
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-bold leading-none">Minha Conta</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
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
