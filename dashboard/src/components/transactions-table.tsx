import { formatCurrency, formatDate, formatCategory } from '@/lib/formatters'

interface Transaction {
  readonly id: string
  readonly amount: number
  readonly type: 'EXPENSE' | 'INCOME'
  readonly category: string
  readonly description: string
  readonly date: string
}

interface TransactionsTableProps {
  readonly transactions: ReadonlyArray<Transaction>
  readonly loading: boolean
  readonly onEdit: (transaction: Transaction) => void
  readonly onDelete: (transaction: Transaction) => void
}

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

function getBadgeClass(category: string): string {
  return BADGE_MAP[category] ?? 'badge-outros'
}

const SKELETON_ROWS = 8

function SkeletonRow() {
  return (
    <tr className="border-b border-border-subtle">
      <td className="px-6 py-3.5">
        <div className="h-4 w-20 animate-pulse rounded bg-bg-card-hover" />
      </td>
      <td className="px-6 py-3.5">
        <div className="h-4 w-40 animate-pulse rounded bg-bg-card-hover" />
      </td>
      <td className="px-6 py-3.5">
        <div className="h-5 w-24 animate-pulse rounded-full bg-bg-card-hover" />
      </td>
      <td className="px-6 py-3.5">
        <div className="h-4 w-16 animate-pulse rounded bg-bg-card-hover" />
      </td>
      <td className="px-6 py-3.5 text-right">
        <div className="ml-auto h-4 w-24 animate-pulse rounded bg-bg-card-hover" />
      </td>
      <td className="px-6 py-3.5">
        <div className="flex gap-2">
          <div className="h-8 w-16 animate-pulse rounded-lg bg-bg-card-hover" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-bg-card-hover" />
        </div>
      </td>
    </tr>
  )
}

const HEADER_COLUMNS = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Ações'] as const

export function TransactionsTable({
  transactions,
  loading,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  if (!loading && transactions.length === 0) {
    return (
      <div className="card-dark flex h-48 items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-text-muted">Nenhuma transação encontrada</p>
          <p className="mt-1 text-sm text-text-muted">
            Clique em &quot;Nova Transação&quot; para adicionar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-dark overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-secondary text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              {HEADER_COLUMNS.map((col) => (
                <th
                  key={col}
                  className={`px-6 py-3 ${col === 'Valor' ? 'text-right' : ''}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading
              ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                  <SkeletonRow key={i} />
                ))
              : transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="transition-colors hover:bg-bg-card-hover"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm text-text-secondary">
                      {formatDate(t.date)}
                    </td>
                    <td className="max-w-[240px] truncate px-6 py-3.5 text-sm text-text-primary">
                      {t.description}
                    </td>
                    <td className="px-6 py-3.5 text-sm">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeClass(t.category)}`}
                      >
                        {formatCategory(t.category)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          t.type === 'INCOME'
                            ? 'bg-income/10 text-income'
                            : 'bg-expense/10 text-expense'
                        }`}
                      >
                        {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
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
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(t)}
                          className="rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition-theme hover:border-border-gold hover:text-accent-gold"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(t)}
                          className="rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition-theme hover:border-expense/40 hover:text-expense"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
