import type { PamonhaBarbante } from "@/lib/types"

export function getBarbanteCSSStyle(barbante: PamonhaBarbante | null | undefined): string {
  if (!barbante) return "#cccccc"

  // Se é especial (como "Branco com Palha"), retorna a cor principal
  if (barbante.is_especial) {
    return barbante.cor_principal
  }

  // Se tem cor secundária, cria um gradiente meio a meio
  if (barbante.cor_secundaria) {
    return `linear-gradient(45deg, ${barbante.cor_principal} 50%, ${barbante.cor_secundaria} 50%)`
  }

  // Caso contrário, retorna apenas a cor principal
  return barbante.cor_principal
}

export function getBarbanteName(barbante: PamonhaBarbante | null | undefined): string {
  return barbante?.nome || "Sem barbante"
}

export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}
