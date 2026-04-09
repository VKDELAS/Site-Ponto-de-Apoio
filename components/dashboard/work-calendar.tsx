"use client"

import { useMemo, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday,
  isFuture,
} from "date-fns"
import type { WorkedDay } from "@/lib/types"
import { DAILY_RATE } from "@/lib/types"
import { CalendarDays, Loader2 } from "lucide-react"

type Props = {
  year: number
  month: number
  workedDays: WorkedDay[]
  onToggle: (dateStr: string) => Promise<void>
}

export function WorkCalendar({ year, month, workedDays, onToggle }: Props) {
  const [isPending, startTransition] = useTransition()
  const monthDate = new Date(year, month)
  
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [monthDate])

  const workedDaysSet = useMemo(() => {
    return new Set(workedDays.map(day => day.date))
  }, [workedDays])

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  async function handleDayClick(date: Date) {
    const dateStr = format(date, "yyyy-MM-dd")
    
    startTransition(async () => {
      await onToggle(dateStr)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Calendário de Trabalho
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            R${DAILY_RATE}/dia
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Week days header */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const isWorked = workedDaysSet.has(dateStr)
            const isCurrentMonth = isSameMonth(day, monthDate)
            const isCurrentDay = isToday(day)
            const isFutureDay = isFuture(day) && !isCurrentDay

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPending || !isCurrentMonth || isFutureDay}
                className={cn(
                  "relative flex h-14 w-full flex-col items-center justify-center rounded-lg transition-all",
                  !isCurrentMonth && "text-muted-foreground/30 opacity-30",
                  isCurrentMonth && !isWorked && !isFutureDay && "hover:bg-muted cursor-pointer",
                  isFutureDay && "cursor-not-allowed opacity-40",
                  isPending && "opacity-50"
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                  isWorked && "bg-primary text-primary-foreground font-bold",
                  isCurrentDay && !isWorked && "ring-2 ring-primary",
                  isCurrentDay && isWorked && "ring-2 ring-primary-foreground"
                )}>
                  <span className="text-sm">
                    {format(day, "d")}
                  </span>
                </div>
                {isWorked && (
                  <span className="absolute -bottom-0.5 text-[9px] font-bold text-primary">
                    +R$50
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-primary" />
            <span>Dia trabalhado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded ring-2 ring-primary" />
            <span>Hoje</span>
          </div>
          {isPending && (
            <div className="ml-auto flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Salvando...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
