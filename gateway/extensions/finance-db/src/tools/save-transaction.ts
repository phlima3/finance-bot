import { Type } from '@sinclair/typebox'
import { prisma } from '../db/client.js'
import { CATEGORIES, SaveTransactionSchema } from '../schemas/transaction.js'

function normalizePhone(phone: string): string {
  return phone.replace(/[@a-zA-Z.]/g, '').replace(/\D/g, '')
}

export const saveTransactionTool = {
  name: 'finance_save_transaction',
  description:
    'Salva uma transacao financeira (despesa ou receita) no banco de dados. Use apos extrair os dados da mensagem do usuario.',
  parameters: Type.Object({
    amount: Type.Number({ description: 'Valor da transacao (positivo)', minimum: 0.01 }),
    type: Type.Union([Type.Literal('EXPENSE'), Type.Literal('INCOME')], {
      description: 'Tipo: EXPENSE para despesa, INCOME para receita',
    }),
    category: Type.Union(
      CATEGORIES.map((c) => Type.Literal(c)),
      {
        description:
          'Categoria: alimentacao, transporte, moradia, lazer, saude, educacao, vestuario, servicos, salario, freelance, investimento, outros',
      }
    ),
    description: Type.String({ description: 'Descricao curta da transacao' }),
    date: Type.String({ description: 'Data no formato YYYY-MM-DD' }),
    phone: Type.String({ description: 'Numero de telefone do usuario' }),
    rawMessage: Type.Optional(Type.String({ description: 'Mensagem original do usuario' })),
  }),
  async execute(_id: string, params: Record<string, unknown>) {
    const parsed = SaveTransactionSchema.safeParse(params)

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

    const { amount, type, category, description, date, rawMessage } = parsed.data
    const phone = normalizePhone(parsed.data.phone)

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        category,
        description,
        date: new Date(date),
        phone,
        rawMessage: rawMessage ?? null,
      },
    })

    const emoji = type === 'EXPENSE' ? '💸' : '💰'
    const label = type === 'EXPENSE' ? 'Despesa' : 'Receita'

    return {
      content: [
        {
          type: 'text' as const,
          text: `${emoji} ${label} registrada!\nValor: R$${amount.toFixed(2)}\nCategoria: ${category}\nDescricao: ${description}\nData: ${date}\nID: ${transaction.id}`,
        },
      ],
    }
  },
}
