"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message)
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row items-center justify-center bg-[#f0f2f5] dark:bg-background p-6 md:p-12">
      {/* Lado Esquerdo - Branding */}
      <div className="flex flex-col items-center lg:items-start lg:mr-12 mb-8 lg:mb-0 max-w-[500px] text-center lg:text-left">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-4xl shadow-md mb-4">
          P
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter leading-tight mb-4">
          Ponto de Apoio
        </h1>
        <p className="text-lg md:text-xl font-medium text-muted-foreground leading-relaxed">
          O controle financeiro profissional feito sob medida para o seu dia a dia.
        </p>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full max-w-[400px]">
        <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-white dark:bg-card">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="rounded-lg">
                  <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="E-mail"
                  className="h-12 text-base rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  className="h-12 text-base rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-transform active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>

              <div className="text-center">
                <Link href="#" className="text-sm font-medium text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>

              <div className="border-t border-gray-100 my-6"></div>

              <div className="text-center">
                <Link href="/auth/sign-up">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 px-8 text-base font-bold border-2 border-secondary hover:bg-secondary hover:text-secondary-foreground rounded-lg transition-colors"
                  >
                    Criar nova conta
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          <b>Ponto de Apoio</b> ajuda você a gerenciar seus ganhos e despesas com facilidade.
        </p>
      </div>
    </div>
  )
}
