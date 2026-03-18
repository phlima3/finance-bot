'use client'

import { useEffect, useCallback } from 'react'
import { formatCurrency } from '@/lib/formatters'

interface ConfirmDialogProps {
  readonly description: string
  readonly amount: number
  readonly type: 'EXPENSE' | 'INCOME'
  readonly loading: boolean
  readonly onConfirm: () => void
  readonly onClose: () => void
}

export function ConfirmDialog({
  description,
  amount,
  type,
  loading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose()
      }
    },
    [onClose, loading]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={loading ? undefined : onClose}
      />

      <div className="relative w-full max-w-sm animate-fade-in-up rounded-xl border border-border-subtle bg-bg-card p-6 shadow-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-expense/10">
          <svg
            className="h-6 w-6 text-expense"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h3 className="text-center text-lg font-semibold text-text-primary">
          Excluir transação?
        </h3>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Tem certeza que deseja excluir esta transação? Essa ação não pode ser
          desfeita.
        </p>

        <div className="mt-4 rounded-lg border border-border-subtle bg-bg-secondary p-3">
          <p className="text-sm text-text-primary">{description}</p>
          <p
            className={`mt-1 font-mono text-sm font-semibold ${
              type === 'EXPENSE' ? 'text-expense' : 'text-income'
            }`}
          >
            {type === 'EXPENSE' ? '-' : '+'}
            {formatCurrency(amount)}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 rounded-lg border border-border-subtle bg-bg-card px-4 py-2.5 text-sm font-medium text-text-primary transition-theme hover:border-border-gold hover:text-accent-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-expense px-4 py-2.5 text-sm font-semibold text-white transition-theme hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
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
                Excluindo...
              </span>
            ) : (
              'Excluir'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
