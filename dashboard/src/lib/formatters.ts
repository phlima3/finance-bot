export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

const CATEGORY_LABELS: Record<string, string> = {
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  moradia: 'Moradia',
  lazer: 'Lazer',
  saude: 'Saúde',
  educacao: 'Educação',
  vestuario: 'Vestuário',
  servicos: 'Serviços',
  salario: 'Salário',
  freelance: 'Freelance',
  investimento: 'Investimento',
  outros: 'Outros',
}

export function formatCategory(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}
