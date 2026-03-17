import { z } from 'zod'
import { CATEGORIES } from './transaction.js'

export const QuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Formato esperado: YYYY-MM')
    .optional(),
  type: z.enum(['EXPENSE', 'INCOME']).optional(),
  category: z.enum(CATEGORIES).optional(),
  phone: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
})

export type QueryInput = z.infer<typeof QuerySchema>
