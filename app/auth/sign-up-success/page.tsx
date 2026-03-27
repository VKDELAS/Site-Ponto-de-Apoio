import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Mail className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Verifique seu e-mail</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para o seu e-mail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Clique no link enviado para confirmar sua conta e começar a usar o sistema de controle financeiro.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/login">Voltar para o login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
