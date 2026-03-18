import { formatCurrency } from '@/lib/formatters'

interface MonthlyTotalsProps {
  readonly totalExpenses: number
  readonly totalIncome: number
}

interface CardConfig {
  readonly label: string
  readonly emoji: string
  readonly getValue: (income: number, expenses: number) => number
  readonly colorClass: string
  readonly stagger: string
}

const CARDS: ReadonlyArray<CardConfig> = [
  {
    label: 'Receitas',
    emoji: '\u{1F4B0}',
    getValue: (income) => income,
    colorClass: 'text-income',
    stagger: 'animate-stagger-1',
  },
  {
    label: 'Gastos',
    emoji: '\u{1F4B8}',
    getValue: (_, expenses) => expenses,
    colorClass: 'text-expense',
    stagger: 'animate-stagger-2',
  },
  {
    label: 'Saldo',
    emoji: '\u{1F4CA}',
    getValue: (income, expenses) => income - expenses,
    colorClass: '',
    stagger: 'animate-stagger-3',
  },
]

export function MonthlyTotals({ totalExpenses, totalIncome }: MonthlyTotalsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {CARDS.map((card) => {
        const value = card.getValue(totalIncome, totalExpenses)
        const dynamicColor =
          card.label === 'Saldo'
            ? value >= 0
              ? 'text-income'
              : 'text-expense'
            : card.colorClass

        return (
          <div
            key={card.label}
            className={`card-dark animate-fade-in-up ${card.stagger} p-6`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{card.emoji}</span>
              <p className="text-sm font-medium text-text-secondary">
                {card.label}
              </p>
            </div>
            <p className={`mt-3 text-2xl font-bold font-mono tracking-tight ${dynamicColor}`}>
              {formatCurrency(value)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
