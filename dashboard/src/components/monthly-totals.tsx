import { formatCurrency } from '@/lib/formatters'

interface MonthlyTotalsProps {
  readonly totalExpenses: number
  readonly totalIncome: number
}

export function MonthlyTotals({ totalExpenses, totalIncome }: MonthlyTotalsProps) {
  const balance = totalIncome - totalExpenses

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-sm font-medium text-gray-500">Receitas</p>
        <p className="mt-2 text-3xl font-bold text-green-600">
          {formatCurrency(totalIncome)}
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-sm font-medium text-gray-500">Gastos</p>
        <p className="mt-2 text-3xl font-bold text-red-600">
          {formatCurrency(totalExpenses)}
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-sm font-medium text-gray-500">Saldo</p>
        <p className={`mt-2 text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  )
}
