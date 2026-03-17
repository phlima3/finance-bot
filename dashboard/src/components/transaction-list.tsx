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

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg bg-white p-6 shadow">
        <p className="text-gray-400">Nenhuma transacao encontrada</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <h2 className="border-b px-6 py-4 text-lg font-semibold">Transacoes Recentes</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3">Descricao</th>
              <th className="px-6 py-3">Categoria</th>
              <th className="px-6 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {formatDate(t.date)}
                </td>
                <td className="px-6 py-4 text-sm">{t.description}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                    {formatCategory(t.category)}
                  </span>
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium ${
                  t.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {t.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
