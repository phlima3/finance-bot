import { formatCurrency, formatDate, formatCategory } from '@/lib/formatters'

interface Transaction {
  readonly id: string
  readonly amount: number
  readonly type: 'EXPENSE' | 'INCOME'
  readonly category: string
  readonly description: string
  readonly date: string
}

interface TransactionListProps {
  readonly transactions: ReadonlyArray<Transaction>
}

function getBadgeClass(category: string): string {
  const BADGE_MAP: Record<string, string> = {
    alimentacao: 'badge-alimentacao',
    transporte: 'badge-transporte',
    moradia: 'badge-moradia',
    lazer: 'badge-lazer',
    saude: 'badge-saude',
    educacao: 'badge-educacao',
    vestuario: 'badge-vestuario',
    servicos: 'badge-servicos',
    salario: 'badge-salario',
    freelance: 'badge-freelance',
    investimento: 'badge-investimento',
    outros: 'badge-outros',
  }
  return BADGE_MAP[category] ?? 'badge-outros'
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="card-dark animate-fade-in-up animate-stagger-5 flex h-32 items-center justify-center p-6">
        <p className="text-text-muted">Nenhuma transação encontrada</p>
      </div>
    )
  }

  return (
    <div className="card-dark animate-fade-in-up animate-stagger-5 overflow-hidden">
      <h2 className="border-b border-border-subtle px-6 py-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        Transações Recentes
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-secondary text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3">Descrição</th>
              <th className="px-6 py-3">Categoria</th>
              <th className="px-6 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="transition-colors hover:bg-bg-card-hover"
              >
                <td className="whitespace-nowrap px-6 py-3.5 text-sm text-text-secondary">
                  {formatDate(t.date)}
                </td>
                <td className="px-6 py-3.5 text-sm text-text-primary">
                  {t.description}
                </td>
                <td className="px-6 py-3.5 text-sm">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeClass(t.category)}`}
                  >
                    {formatCategory(t.category)}
                  </span>
                </td>
                <td
                  className={`whitespace-nowrap px-6 py-3.5 text-right font-mono text-sm font-semibold ${
                    t.type === 'EXPENSE' ? 'text-expense' : 'text-income'
                  }`}
                >
                  {t.type === 'EXPENSE' ? '-' : '+'}
                  {formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
