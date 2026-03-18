import { z } from 'zod'

export const CATEGORIES = [
  'alimentacao',
  'transporte',
  'moradia',
  'lazer',
  'saude',
  'educacao',
  'vestuario',
  'servicos',
  'salario',
  'freelance',
  'investimento',
  'outros',
] as const

export type Category = (typeof CATEGORIES)[number]

export const CreateTransactionSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  type: z.enum(['EXPENSE', 'INCOME'], {
    message: 'Tipo deve ser EXPENSE ou INCOME',
  }),
  category: z.enum(CATEGORIES, {
    message: 'Categoria inválida',
  }),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, 'Formato esperado: YYYY-MM-DD'),
  phone: z.string().optional().default('5515998601308'),
  rawMessage: z.string().optional(),
})

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>

export const UpdateTransactionSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo').optional(),
  type: z
    .enum(['EXPENSE', 'INCOME'], {
      message: 'Tipo deve ser EXPENSE ou INCOME',
    })
    .optional(),
  category: z
    .enum(CATEGORIES, {
      message: 'Categoria inválida',
    })
    .optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, 'Formato esperado: YYYY-MM-DD')
    .optional(),
  rawMessage: z.string().optional(),
})

export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>

export const TransactionFiltersSchema = z.object({
  startDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .optional(),
  endDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .optional(),
  category: z.enum(CATEGORIES).optional(),
  type: z.enum(['EXPENSE', 'INCOME']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>
