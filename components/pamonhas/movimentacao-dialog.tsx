"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { registrarMovimentacao } from "@/lib/pamonha-actions"
import type { PamonhaSabor } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  quantidade: z.coerce
    .number()
    .min(1, "Quantidade deve ser maior que 0")
    .int("Quantidade deve ser um número inteiro"),
  observacao: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sabor: PamonhaSabor
  tipo: "entrada" | "saida"
  onSuccess: () => void
}

export function MovimentacaoDialog({
  open,
  onOpenChange,
  sabor,
  tipo,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantidade: 1,
      observacao: "",
    },
  })

  const isEntrada = tipo === "entrada"
  const title = isEntrada ? "Entrada de Estoque" : "Saída de Estoque"
  const description = isEntrada
    ? `Registrar entrada de ${sabor.nome}`
    : `Registrar saída de ${sabor.nome}`

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await registrarMovimentacao({
        pamonha_id: sabor.id,
        tipo,
        quantidade: values.quantidade,
        observacao: values.observacao,
      })

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        const action = isEntrada ? "Entrada" : "Saída"
        toast.success(`${action} registrada com sucesso`)
        form.reset()
        onSuccess()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao registrar movimentação"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Sabor Info */}
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full border-2 border-gray-300"
              style={{ background: sabor.barbante_cor }}
            />
            <div>
              <p className="font-medium">{sabor.nome}</p>
              <p className="text-sm text-muted-foreground">
                Estoque atual: {sabor.quantidade}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Quantidade */}
            <FormField
              control={form.control}
              name="quantidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observacao */}
            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Venda, devolução, etc"
                      {...field}
                      disabled={isLoading}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Registrando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
