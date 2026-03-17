import { Type } from '@sinclair/typebox'
import { prisma } from '../db/client.js'

function sumAmounts(transactions: ReadonlyArray<{ amount: number }>): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0)
}

export const checkAlertsTool = {
  name: 'finance_check_alerts',
  description:
    'Verifica se ha alertas de gastos excessivos para uma categoria. Chame sempre apos salvar uma EXPENSE.',
  parameters: Type.Object({
    phone: Type.String({ description: 'Numero de telefone do usuario' }),
    category: Type.String({ description: 'Categoria da transacao salva' }),
  }),
  async execute(_id: string, params: Record<string, unknown>) {
    const phone = params.phone as string
    const category = params.category as string

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86_400_000)

    const [currentWeek, previousWeek] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          phone,
          category,
          type: 'EXPENSE',
          date: { gte: sevenDaysAgo },
        },
      }),
      prisma.transaction.findMany({
        where: {
          phone,
          category,
          type: 'EXPENSE',
          date: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
    ])

    if (currentWeek.length < 3 || previousWeek.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'Nenhum alerta de gastos.' }],
      }
    }

    const currentTotal = sumAmounts(currentWeek)
    const previousTotal = sumAmounts(previousWeek)

    if (previousTotal === 0) {
      return {
        content: [{ type: 'text' as const, text: 'Nenhum alerta de gastos.' }],
      }
    }

    const multiplier = currentTotal / previousTotal

    if (multiplier < 3) {
      return {
        content: [{ type: 'text' as const, text: 'Nenhum alerta de gastos.' }],
      }
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `⚠️ Alerta de gastos: voce gastou R$${currentTotal.toFixed(2)} em "${category}" nos ultimos 7 dias — ${multiplier.toFixed(1)}x acima da semana anterior (R$${previousTotal.toFixed(2)}).`,
        },
      ],
    }
  },
}
