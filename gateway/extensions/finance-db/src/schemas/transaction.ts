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

export const SaveTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['EXPENSE', 'INCOME']),
  category: z.enum(CATEGORIES),
  description: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD'),
  phone: z.string().min(1),
  rawMessage: z.string().optional(),
})

export type SaveTransactionInput = z.infer<typeof SaveTransactionSchema>
