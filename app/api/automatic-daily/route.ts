import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { applyAutomaticDailyCredit } from "@/lib/automatic-daily"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const result = await applyAutomaticDailyCredit(user.id)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    if (result.action === "credited") {
      const message = result.daysMarked && result.daysMarked > 1 
        ? `Recuperamos ${result.daysMarked} dias não marcados! +R$${result.totalAmount}`
        : `Dia de hoje marcado automaticamente! +R$50`
      
      return NextResponse.json({ 
        success: true, 
        action: "credited", 
        message 
      })
    }

    return NextResponse.json({ 
      success: true, 
      action: "already_credited", 
      message: "Tudo em dia!" 
    })
  } catch (error) {
    console.error("[API] Error in automatic-daily:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
