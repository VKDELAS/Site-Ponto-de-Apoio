"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { addPamonhaSabor } from "@/lib/pamonha-actions"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  categoria: z.enum(["SALGADA", "DOCE"], {
    errorMap: () => ({ message: "Categoria é obrigatória" }),
  }),
  barbante_cor: z.string().min(1, "Cor do barbante é obrigatória"),
  quantidade: z.coerce
    .number()
    .min(0, "Quantidade não pode ser negativa")
    .int("Quantidade deve ser um número inteiro"),
})

type FormValues = z.infer<typeof formSchema>

const BARBANTE_COLORS = [
  { label: "Verde", value: "#22c55e" },
  { label: "Branco", value: "#ffffff" },
  { label: "Laranja", value: "#fb923c" },
  { label: "Branco x Verde", value: "linear-gradient(45deg, #ffffff 50%, #22c55e 50%)" },
  { label: "Verde x Laranja", value: "linear-gradient(45deg, #22c55e 50%, #fb923c 50%)" },
  { label: "Branco x Laranja", value: "linear-gradient(45deg, #ffffff 50%, #fb923c 50%)" },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddSaborDialog({ open, onOpenChange, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      categoria: "DOCE",
      barbante_cor: "#22c55e",
      quantidade: 0,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await addPamonhaSabor({
        nome: values.nome,
        categoria: values.categoria,
        barbante_cor: values.barbante_cor,
        quantidade: values.quantidade,
      })

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success("Sabor adicionado com sucesso")
        form.reset()
        onSuccess()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao adicionar sabor"
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
          <DialogTitle>Adicionar Novo Sabor</DialogTitle>
          <DialogDescription>
            Cadastre um novo sabor de pamonha no seu estoque
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
                  <FormLabel>Nome do Sabor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Doce Tradicional"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SALGADA">Salgada</SelectItem>
                      <SelectItem value="DOCE">Doce</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Barbante Cor */}
            <FormField
              control={form.control}
              name="barbante_cor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor do Barbante</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BARBANTE_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border border-gray-300"
                              style={{
                                background: color.value,
                              }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantidade */}
            <FormField
              control={form.control}
              name="quantidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade Inicial</FormLabel>
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
