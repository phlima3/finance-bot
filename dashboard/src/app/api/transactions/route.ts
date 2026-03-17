import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')

  const now = new Date()
  const year = month ? Number(month.split('-')[0]) : now.getFullYear()
  const monthNum = month ? Number(month.split('-')[1]) : now.getMonth() + 1

  const start = new Date(year, monthNum - 1, 1)
  const end = new Date(year, monthNum, 1)

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        date: { gte: start, lt: end },
      },
      orderBy: { date: 'desc' },
    })

    const totalExpenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const categoryTotals = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce<Record<string, number>>((acc, t) => {
        return { ...acc, [t.category]: (acc[t.category] ?? 0) + t.amount }
      }, {})

    const categories = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }))

    return NextResponse.json({
      transactions,
      summary: { totalExpenses, totalIncome },
      categories,
    })
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
