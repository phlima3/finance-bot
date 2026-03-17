import { prisma } from '@/lib/db'
import { MonthlyTotals } from '@/components/monthly-totals'
import { CategoryChart } from '@/components/category-chart'
import { TransactionList } from '@/components/transaction-list'

export const dynamic = 'force-dynamic'

async function getData() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: 'desc' },
  })

  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryMap = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce<Record<string, number>>((acc, t) => {
      return { ...acc, [t.category]: (acc[t.category] ?? 0) + t.amount }
    }, {})

  const categories = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }))

  return {
    transactions: transactions.map((t) => ({
      ...t,
      date: t.date.toISOString(),
    })),
    totalExpenses,
    totalIncome,
    categories,
  }
}

export default async function DashboardPage() {
  const { transactions, totalExpenses, totalIncome, categories } = await getData()

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Finance Bot</h1>

      <div className="space-y-8">
        <MonthlyTotals totalExpenses={totalExpenses} totalIncome={totalIncome} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <CategoryChart categories={categories} />
          <TransactionList transactions={transactions.slice(0, 20)} />
        </div>
      </div>
    </main>
  )
}
