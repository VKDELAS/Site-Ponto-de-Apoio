"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { addBarbante } from "@/lib/barbante-actions"
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
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cor_principal: z.string().min(7, "Cor principal é obrigatória (formato: #RRGGBB)"),
  cor_secundaria: z.string().optional(),
  is_especial: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BarbantConfigDialog({ open, onOpenChange, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cor_principal: "#22c55e",
      cor_secundaria: "",
      is_especial: false,
    },
  })

  const isEspecial = form.watch("is_especial")

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await addBarbante({
        nome: values.nome,
        cor_principal: values.cor_principal,
        cor_secundaria: values.cor_secundaria || undefined,
        is_especial: values.is_especial,
      })

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success("Barbante adicionado com sucesso")
        form.reset()
        onSuccess()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao adicionar barbante"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Barbante</DialogTitle>
          <DialogDescription>
            Configure um novo tipo de barbante. Você pode criar cores simples, combinações meio a meio ou tipos especiais.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Barbante</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Verde, Branco com Palha, Verde x Laranja"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Use nomes descritivos para facilitar a identificação
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cor Principal */}
            <FormField
              control={form.control}
              name="cor_principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor Principal</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="color"
                        {...field}
                        disabled={isLoading}
                        className="h-10 w-20 cursor-pointer"
                      />
                    </FormControl>
                    <FormControl>
                      <Input
                        placeholder="#22c55e"
                        {...field}
                        disabled={isLoading}
                        className="flex-1"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cor Secundária (para meio a meio) */}
            {!isEspecial && (
              <FormField
                control={form.control}
                name="cor_secundaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Secundária (opcional)</FormLabel>
                    <FormDescription>
                      Se preenchida, o sistema criará um gradiente meio a meio automaticamente
                    </FormDescription>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          disabled={isLoading}
                          className="h-10 w-20 cursor-pointer"
                        />
                      </FormControl>
                      <FormControl>
                        <Input
                          placeholder="#fb923c"
                          {...field}
                          disabled={isLoading}
                          className="flex-1"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Especial */}
            <FormField
              control={form.control}
              name="is_especial"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tipo Especial</FormLabel>
                    <FormDescription>
                      Marque para tipos especiais como "Branco com Palha"
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Preview */}
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-sm font-medium mb-2">Prévia:</p>
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-lg border-2 border-gray-300"
                  style={{
                    background: form.watch("cor_secundaria")
                      ? `linear-gradient(45deg, ${form.watch("cor_principal")} 50%, ${form.watch("cor_secundaria")} 50%)`
                      : form.watch("cor_principal"),
                  }}
                />
                <div>
                  <p className="font-medium">{form.watch("nome") || "Novo Barbante"}</p>
                  {isEspecial && (
                    <p className="text-xs text-muted-foreground">Tipo Especial</p>
                  )}
                </div>
              </div>
            </div>

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
                {isLoading ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
