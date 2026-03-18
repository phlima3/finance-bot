'use client'

import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { CATEGORIES } from '@/lib/schemas'
import { formatCategory } from '@/lib/formatters'

interface Transaction {
  readonly id: string
  readonly amount: number
  readonly type: 'EXPENSE' | 'INCOME'
  readonly category: string
  readonly description: string
  readonly date: string
}

interface TransactionFormProps {
  readonly mode: 'create' | 'edit'
  readonly transaction?: Transaction
  readonly onClose: () => void
  readonly onSave: () => void
}

const FormSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  type: z.enum(['EXPENSE', 'INCOME'], { message: 'Selecione o tipo' }),
  category: z.enum(CATEGORIES, { message: 'Selecione a categoria' }),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Formato esperado: YYYY-MM-DD'),
})

type FormErrors = Partial<Record<keyof z.infer<typeof FormSchema>, string>>

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

const INPUT_CLASS =
  'w-full rounded-lg border border-border-subtle bg-bg-secondary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-theme focus:border-border-gold focus:outline-none focus:ring-1 focus:ring-accent-gold/30'

const LABEL_CLASS = 'mb-1.5 block text-sm font-medium text-text-secondary'

export function TransactionForm({
  mode,
  transaction,
  onClose,
  onSave,
}: TransactionFormProps) {
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '')
  const [type, setType] = useState<string>(transaction?.type ?? 'EXPENSE')
  const [category, setCategory] = useState(transaction?.category ?? '')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [date, setDate] = useState(
    transaction?.date ? transaction.date.split('T')[0] : getTodayISO()
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose()
      }
    },
    [onClose, submitting]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setApiError('')

    const parsed = FormSchema.safeParse({
      amount: Number(amount),
      type,
      category,
      description: description.trim(),
      date,
    })

    if (!parsed.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormErrors
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)

    try {
      const url =
        mode === 'create'
          ? '/api/transactions'
          : `/api/transactions/${transaction?.id}`

      const method = mode === 'create' ? 'POST' : 'PATCH'

      const body =
        mode === 'create'
          ? { ...parsed.data, phone: '5515998601308' }
          : parsed.data

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Erro ao salvar transação')
      }

      onSave()
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Erro ao salvar transação'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={submitting ? undefined : onClose}
      />

      <div className="relative w-full max-w-lg animate-fade-in-up rounded-xl border border-border-subtle bg-bg-card shadow-2xl sm:max-h-[90vh] sm:overflow-y-auto max-sm:fixed max-sm:inset-0 max-sm:rounded-none max-sm:border-0 max-sm:overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-subtle bg-bg-card px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {mode === 'create' ? 'Nova Transação' : 'Editar Transação'}
          </h2>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-card-hover hover:text-text-primary disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {apiError && (
            <div className="rounded-lg border border-expense/30 bg-expense/10 px-4 py-3 text-sm text-expense">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="form-amount" className={LABEL_CLASS}>
                Valor (R$)
              </label>
              <input
                id="form-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${INPUT_CLASS} font-mono ${errors.amount ? 'border-expense' : ''}`}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-expense">{errors.amount}</p>
              )}
            </div>

            <div>
              <label htmlFor="form-type" className={LABEL_CLASS}>
                Tipo
              </label>
              <select
                id="form-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={`${INPUT_CLASS} ${errors.type ? 'border-expense' : ''}`}
              >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-xs text-expense">{errors.type}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="form-category" className={LABEL_CLASS}>
              Categoria
            </label>
            <select
              id="form-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${INPUT_CLASS} ${errors.category ? 'border-expense' : ''}`}
            >
              <option value="">Selecione uma categoria</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {formatCategory(cat)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-expense">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="form-description" className={LABEL_CLASS}>
              Descrição
            </label>
            <input
              id="form-description"
              type="text"
              placeholder="Ex: Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${INPUT_CLASS} ${errors.description ? 'border-expense' : ''}`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-expense">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="form-date" className={LABEL_CLASS}>
              Data
            </label>
            <input
              id="form-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${INPUT_CLASS} ${errors.date ? 'border-expense' : ''}`}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-expense">{errors.date}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="flex-1 rounded-lg border border-border-subtle bg-bg-card px-4 py-2.5 text-sm font-medium text-text-primary transition-theme hover:border-border-gold hover:text-accent-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-accent-gold px-4 py-2.5 text-sm font-semibold text-bg-primary transition-theme hover:bg-accent-gold-dim disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Salvando...
                </span>
              ) : mode === 'create' ? (
                'Criar Transação'
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
