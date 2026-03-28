import { useEffect, useRef } from "react"

/**
 * Hook que verifica se chegou à meia-noite e aplica o crédito automático
 * Também monitora mudanças de data para aplicar crédito quando o dia muda
 */
export function useAutomaticDaily(onApply: () => Promise<void>) {
  const lastDateRef = useRef<string>(new Date().toDateString())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function checkAndApplyCredit() {
        const now = new Date()
        const currentDate = now.toDateString()

      // Se a data mudou (meia-noite passou), aplicar crédito
      if (currentDate !== lastDateRef.current) {
        console.log("[useAutomaticDaily] Date changed, applying credit")
        lastDateRef.current = currentDate
        await onApply()
      }
    }

    // Verificar imediatamente
    checkAndApplyCredit()

    // Configurar verificação periódica a cada minuto
    const interval = setInterval(checkAndApplyCredit, 60000)

    // Também configurar um timeout para a próxima meia-noite
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const timeUntilMidnight = tomorrow.getTime() - now.getTime()
    timeoutRef.current = setTimeout(() => {
      console.log("[useAutomaticDaily] Midnight reached, applying credit")
      checkAndApplyCredit()
    }, timeUntilMidnight)

    return () => {
      clearInterval(interval)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [onApply])
}
