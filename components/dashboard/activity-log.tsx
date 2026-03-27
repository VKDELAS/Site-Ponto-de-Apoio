"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Plus, Pencil, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ActionLog } from "@/lib/types"
import { getActionLogs } from "@/lib/actions"
import { cn } from "@/lib/utils"

export function ActivityLog() {
  const [logs, setLogs] = useState<ActionLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      const data = await getActionLogs(15)
      setLogs(data)
      setLoading(false)
    }
    fetchLogs()
  }, [])

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "create":
        return Plus
      case "update":
        return Pencil
      case "delete":
        return Trash2
      default:
        return History
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "create":
        return "text-primary bg-primary/10"
      case "update":
        return "text-primary bg-primary/10"
      case "delete":
        return "text-red-500 bg-red-500/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <History className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade recente
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="divide-y">
              {logs.map((log) => {
                const Icon = getActionIcon(log.action_type)
                const colorClass = getActionColor(log.action_type)

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-4"
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        colorClass
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-tight">
                        {log.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
