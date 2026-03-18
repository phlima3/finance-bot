import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TransactionFiltersSchema, CATEGORIES } from '@/lib/schemas'

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

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDateBR(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function getDefaultDateRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  try {
    const filters = TransactionFiltersSchema.parse({
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      page: 1,
      limit: 100,
    })

    const defaultRange = getDefaultDateRange()
    const startDate = filters.startDate ? new Date(filters.startDate) : defaultRange.start
    const endDate = filters.endDate ? new Date(filters.endDate) : defaultRange.end

    const where = {
      date: { gte: startDate, lte: endDate },
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.type ? { type: filters.type } : {}),
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 10000,
    })

    const CSV_HEADER = 'Data,Descrição,Categoria,Tipo,Valor'

    const rows = transactions.map((t) => {
      const date = formatDateBR(t.date)
      const description = escapeCSV(t.description)
      const category = CATEGORY_LABELS[t.category] ?? t.category
      const type = t.type === 'INCOME' ? 'Receita' : 'Despesa'
      const amount = formatBRL(t.amount)
      return `${date},${description},${category},${type},${amount}`
    })

    const csv = [CSV_HEADER, ...rows].join('\n')

    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const filename = `transacoes-${yyyy}-${mm}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('CSV export failed:', error)
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    )
  }
}
