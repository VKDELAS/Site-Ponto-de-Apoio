import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PamonhasContent } from "@/components/pamonhas/pamonhas-content"
import type { PamonhaSabor, MovimentacaoEstoque } from "@/lib/types"

async function getPamonhasData(userId: string) {
  const supabase = await createClient()

  const [saboresResult, movimentacoesResult] = await Promise.all([
    supabase
      .from("pamonha_sabores")
      .select(`
        *,
        barbante:barbante_id(id, nome, cor_principal, cor_secundaria, is_especial)
      `)
      .eq("user_id", userId)
      .order("categoria", { ascending: true })
      .order("nome", { ascending: true }),
    supabase
      .from("movimentacoes_estoque")
      .select(
        `
        *,
        pamonha:pamonha_id(
          id, 
          nome, 
          categoria,
          barbante:barbante_id(id, nome, cor_principal, cor_secundaria, is_especial)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  return {
    sabores: (saboresResult.data as PamonhaSabor[]) || [],
    movimentacoes: (movimentacoesResult.data as MovimentacaoEstoque[]) || [],
  }
}

export default async function PamonhasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const data = await getPamonhasData(user.id)

  return (
    <PamonhasContent user={user} initialData={data} />
  )
}
