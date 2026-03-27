"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  // Carregar dados salvos se "Lembrar de mim" estiver ativo
  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (rememberMe) {
      localStorage.setItem("remembered_email", email)
    } else {
      localStorage.removeItem("remembered_email")
    }

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

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validações
    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    
    // Registrar o usuário
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/dashboard`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    // Fazer login automático após o registro
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError("Conta criada com sucesso, mas houve um erro ao fazer login. Por favor, tente fazer login manualmente.")
      setIsLoading(false)
      return
    }

    // Redirecionar para o dashboard
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row items-center justify-center bg-[#f0f2f5] dark:bg-background p-6 md:p-12 overflow-hidden">
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

      {/* Lado Direito - Formulário com Animação Estilo Facebook */}
      <div className="w-full max-w-[400px] relative h-[600px]">
        {/* Container de Animação */}
        <div className="relative w-full h-full">
          {/* Slide de Login */}
          <div
            className={`absolute w-full h-full transition-all duration-500 ease-in-out ${
              isSignUp ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
            }`}
          >
            <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-white dark:bg-card h-full">
              <CardContent className="p-6 md:p-8 h-full flex flex-col justify-between">
                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="rounded-lg">
                      <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Floating Label - Email */}
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(email === "")}
                      required
                      className="peer w-full h-12 px-4 pt-6 pb-2 text-base border border-gray-300 rounded-lg bg-white dark:bg-card dark:border-gray-600 dark:text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-transparent"
                      placeholder="E-mail"
                    />
                    <label
                      htmlFor="email"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
                        emailFocused || email
                          ? "top-2 text-xs text-primary"
                          : "top-3.5 text-base text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      E-mail
                    </label>
                  </div>

                  {/* Floating Label - Senha */}
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(password === "")}
                      required
                      className="peer w-full h-12 px-4 pt-6 pb-2 text-base border border-gray-300 rounded-lg bg-white dark:bg-card dark:border-gray-600 dark:text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-transparent"
                      placeholder="Senha"
                    />
                    <label
                      htmlFor="password"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
                        passwordFocused || password
                          ? "top-2 text-xs text-primary"
                          : "top-3.5 text-base text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Senha
                    </label>
                  </div>

                  {/* Lembrar de mim */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe} 
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer">
                      Lembrar de mim
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-all active:scale-[0.98] hover:shadow-md" 
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

                  <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>

                  <div className="text-center">
                    <Button 
                      type="button" 
                      onClick={() => {
                        setIsSignUp(true)
                        setError(null)
                      }}
                      className="h-12 px-8 text-base font-bold border-2 border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                    >
                      Criar nova conta
                    </Button>
                  </div>
                </form>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  <b>Ponto de Apoio</b> ajuda você a gerenciar seus ganhos e despesas com facilidade.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Slide de Cadastro */}
          <div
            className={`absolute w-full h-full transition-all duration-500 ease-in-out ${
              isSignUp ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-white dark:bg-card h-full">
              <CardContent className="p-6 md:p-8 h-full flex flex-col">
                <div className="flex items-center mb-6">
                  <button 
                    onClick={() => {
                      setIsSignUp(false)
                      setError(null)
                      setConfirmPassword("")
                    }}
                    className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-muted-foreground"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-2xl font-black text-primary ml-2">Criar conta</h2>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-5 flex-1">
                  {error && (
                    <Alert variant="destructive" className="rounded-lg">
                      <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
                    </Alert>
                  )}

                  <p className="text-sm text-muted-foreground">
                    É rápido e fácil. Comece a controlar suas finanças agora mesmo.
                  </p>

                  {/* Floating Label - Email */}
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="peer w-full h-12 px-4 pt-6 pb-2 text-base border border-gray-300 rounded-lg bg-white dark:bg-card dark:border-gray-600 dark:text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-transparent"
                      placeholder="E-mail"
                    />
                    <label
                      className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
                        email
                          ? "top-2 text-xs text-primary"
                          : "top-3.5 text-base text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      E-mail
                    </label>
                  </div>

                  {/* Floating Label - Senha */}
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(password === "")}
                      required
                      className="peer w-full h-12 px-4 pt-6 pb-2 text-base border border-gray-300 rounded-lg bg-white dark:bg-card dark:border-gray-600 dark:text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-transparent"
                      placeholder="Senha"
                    />
                    <label
                      className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
                        passwordFocused || password
                          ? "top-2 text-xs text-primary"
                          : "top-3.5 text-base text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Senha (mínimo 6 caracteres)
                    </label>
                  </div>

                  {/* Floating Label - Confirmar Senha */}
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => setConfirmPasswordFocused(confirmPassword === "")}
                      required
                      className="peer w-full h-12 px-4 pt-6 pb-2 text-base border border-gray-300 rounded-lg bg-white dark:bg-card dark:border-gray-600 dark:text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-transparent"
                      placeholder="Confirmar Senha"
                    />
                    <label
                      className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
                        confirmPasswordFocused || confirmPassword
                          ? "top-2 text-xs text-primary"
                          : "top-3.5 text-base text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Confirmar Senha
                    </label>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-12 text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-all active:scale-[0.98] hover:shadow-md mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Registrar"
                    )}
                  </Button>
                </form>
                
                <div className="mt-auto pt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    Ao clicar em Registrar, você concorda com nossos Termos e Política de Dados.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
