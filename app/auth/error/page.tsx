import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive">
            <AlertCircle className="h-6 w-6 text-destructive-foreground" />
          </div>
          <CardTitle className="text-2xl">Erro de autenticação</CardTitle>
          <CardDescription>
            Ocorreu um problema durante a autenticação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            O link pode ter expirado ou já foi utilizado. Por favor, tente novamente.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Voltar para o login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/sign-up">Criar nova conta</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
