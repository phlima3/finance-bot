import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TransactionFiltersSchema } from '@/lib/schemas'

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

function buildPrintHTML(
  transactions: ReadonlyArray<{
    date: Date
    description: string
    category: string
    type: string
    amount: number
  }>,
  dateRange: { start: Date; end: Date }
): string {
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const rows = transactions
    .map(
      (t) => `
      <tr>
        <td>${formatDateBR(t.date)}</td>
        <td>${t.description}</td>
        <td>${CATEGORY_LABELS[t.category] ?? t.category}</td>
        <td class="${t.type === 'INCOME' ? 'income' : 'expense'}">
          ${t.type === 'INCOME' ? 'Receita' : 'Despesa'}
        </td>
        <td class="amount ${t.type === 'INCOME' ? 'income' : 'expense'}">
          ${t.type === 'EXPENSE' ? '-' : '+'}${formatBRL(t.amount)}
        </td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Relatório de Transações</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', -apple-system, sans-serif; color: #1a1a1a; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }
    .summary { display: flex; gap: 24px; margin-bottom: 32px; padding: 20px; background: #f8f8f8; border-radius: 8px; }
    .summary-item { flex: 1; }
    .summary-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-bottom: 4px; }
    .summary-value { font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .income { color: #16a34a; }
    .expense { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 10px 12px; border-bottom: 2px solid #e5e5e5; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    .amount { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
    th:last-child { text-align: right; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #999; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>Relatório de Transações</h1>
  <p class="subtitle">${formatDateBR(dateRange.start)} — ${formatDateBR(dateRange.end)} · ${transactions.length} transações</p>

  <div class="summary">
    <div class="summary-item">
      <div class="summary-label">Receitas</div>
      <div class="summary-value income">${formatBRL(totalIncome)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Despesas</div>
      <div class="summary-value expense">${formatBRL(totalExpense)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Saldo</div>
      <div class="summary-value" style="color: ${totalIncome - totalExpense >= 0 ? '#16a34a' : '#dc2626'}">${formatBRL(totalIncome - totalExpense)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Descrição</th>
        <th>Categoria</th>
        <th>Tipo</th>
        <th>Valor</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <p class="footer">Gerado em ${formatDateBR(new Date())} · Finance Bot Dashboard</p>

  <div class="no-print" style="text-align:center;margin-top:24px;">
    <button onclick="window.print()" style="padding:10px 24px;font-size:14px;cursor:pointer;background:#1a1a1a;color:#fff;border:none;border-radius:6px;">
      Imprimir / Salvar PDF
    </button>
  </div>
</body>
</html>`
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

    const html = buildPrintHTML(transactions, { start: startDate, end: endDate })

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('PDF export failed:', error)
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    )
  }
}
