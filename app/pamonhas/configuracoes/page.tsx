import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BarbantesSettingsContent } from "@/components/pamonhas/barbantes-settings-content"
import type { PamonhaBarbante } from "@/lib/types"

async function getBarbantes(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pamonha_barbantes")
    .select("*")
    .eq("user_id", userId)
    .order("nome", { ascending: true })

  if (error) {
    console.error("Erro ao buscar barbantes:", error)
    return []
  }

  return (data as PamonhaBarbante[]) || []
}

export default async function BarbantesSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const barbantes = await getBarbantes(user.id)

  return (
    <BarbantesSettingsContent user={user} initialBarbantes={barbantes} />
  )
}
