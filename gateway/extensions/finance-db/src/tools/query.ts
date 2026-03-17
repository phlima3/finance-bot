import { Type } from '@sinclair/typebox'
import { prisma } from '../db/client.js'
import { QuerySchema } from '../schemas/query.js'
import { CATEGORIES } from '../schemas/transaction.js'

export const queryTool = {
  name: 'finance_query',
  description:
    'Consulta transacoes financeiras com filtros opcionais. Use para responder perguntas como "quanto gastei este mes" ou "listar receitas de janeiro".',
  parameters: Type.Object({
    month: Type.Optional(Type.String({ description: 'Mes no formato YYYY-MM (ex: 2026-03)' })),
    type: Type.Optional(
      Type.Union([Type.Literal('EXPENSE'), Type.Literal('INCOME')], {
        description: 'Filtrar por tipo: EXPENSE ou INCOME',
      })
    ),
    category: Type.Optional(
      Type.Union(
        CATEGORIES.map((c) => Type.Literal(c)),
        { description: 'Filtrar por categoria' }
      )
    ),
    phone: Type.Optional(Type.String({ description: 'Filtrar por telefone' })),
    limit: Type.Optional(
      Type.Number({ description: 'Limite de resultados (padrao: 50, max: 100)', default: 50 })
    ),
  }),
  async execute(_id: string, params: Record<string, unknown>) {
    const parsed = QuerySchema.safeParse(params)

    if (!parsed.success) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Erro de validacao: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
          },
        ],
      }
    }

    const { month, type, category, phone, limit } = parsed.data
    const where: Record<string, unknown> = {}

    if (month) {
      const [year, m] = month.split('-').map(Number)
      const start = new Date(year, m - 1, 1)
      const end = new Date(year, m, 1)
      where.date = { gte: start, lt: end }
    }

    if (type) where.type = type
    if (category) where.category = category
    if (phone) where.phone = phone

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    })

    if (transactions.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'Nenhuma transacao encontrada com esses filtros.' }],
      }
    }

    const totalExpenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const byCategory: Record<string, number> = {}
    for (const t of transactions) {
      const key = `${t.type}:${t.category}`
      byCategory[key] = (byCategory[key] ?? 0) + t.amount
    }

    const categoryBreakdown = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([key, total]) => {
        const [txType, cat] = key.split(':')
        const emoji = txType === 'EXPENSE' ? '💸' : '💰'
        return `  ${emoji} ${cat}: R$${total.toFixed(2)}`
      })
      .join('\n')

    const listing = transactions
      .slice(0, 10)
      .map((t) => {
        const emoji = t.type === 'EXPENSE' ? '💸' : '💰'
        const dateStr = t.date.toISOString().split('T')[0]
        return `  ${emoji} ${dateStr} | ${t.category} | ${t.description} | R$${t.amount.toFixed(2)}`
      })
      .join('\n')

    const summary = [
      `📊 ${transactions.length} transacao(es) encontrada(s)`,
      totalExpenses > 0 ? `💸 Total despesas: R$${totalExpenses.toFixed(2)}` : null,
      totalIncome > 0 ? `💰 Total receitas: R$${totalIncome.toFixed(2)}` : null,
      '',
      'Por categoria:',
      categoryBreakdown,
      '',
      `Ultimas ${Math.min(10, transactions.length)}:`,
      listing,
    ]
      .filter((line) => line !== null)
      .join('\n')

    return {
      content: [{ type: 'text' as const, text: summary }],
    }
  },
}
