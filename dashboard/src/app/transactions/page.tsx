'use client'

import { useState, useEffect, useCallback } from 'react'
import { TransactionsTable } from '@/components/transactions-table'
import { TransactionForm } from '@/components/transaction-form'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Pagination } from '@/components/pagination'

interface Transaction {
  readonly id: string
  readonly amount: number
  readonly type: 'EXPENSE' | 'INCOME'
  readonly category: string
  readonly description: string
  readonly date: string
}

interface PaginationMeta {
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly totalPages: number
}

type ModalState =
  | { readonly kind: 'closed' }
  | { readonly kind: 'create' }
  | { readonly kind: 'edit'; readonly transaction: Transaction }
  | { readonly kind: 'delete'; readonly transaction: Transaction }

const ITEMS_PER_PAGE = 20

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ReadonlyArray<Transaction>>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [modal, setModal] = useState<ModalState>({ kind: 'closed' })

  const fetchTransactions = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/transactions?page=${page}&limit=${ITEMS_PER_PAGE}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const json = await response.json()
      setTransactions(json.data)
      setMeta(json.meta)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions(1)
  }, [fetchTransactions])

  function handlePageChange(page: number) {
    fetchTransactions(page)
  }

  function handleEdit(transaction: Transaction) {
    setModal({ kind: 'edit', transaction })
  }

  function handleDeleteRequest(transaction: Transaction) {
    setModal({ kind: 'delete', transaction })
  }

  function handleFormSave() {
    setModal({ kind: 'closed' })
    fetchTransactions(meta.page)
  }

  async function handleDeleteConfirm() {
    if (modal.kind !== 'delete') return

    setDeleting(true)
    try {
      const response = await fetch(
        `/api/transactions/${modal.transaction.id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      setModal({ kind: 'closed' })

      const shouldGoBack = transactions.length === 1 && meta.page > 1
      fetchTransactions(shouldGoBack ? meta.page - 1 : meta.page)
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Transações
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            <span className="text-accent-gold">{meta.total}</span>{' '}
            {meta.total === 1 ? 'transação encontrada' : 'transações encontradas'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModal({ kind: 'create' })}
          className="rounded-lg bg-accent-gold px-4 py-2.5 text-sm font-semibold text-bg-primary transition-theme hover:bg-accent-gold-dim"
        >
          + Nova Transação
        </button>
      </div>

      <div className="animate-fade-in-up animate-stagger-2">
        <TransactionsTable
          transactions={transactions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      </div>

      <div className="animate-fade-in-up animate-stagger-3">
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {(modal.kind === 'create' || modal.kind === 'edit') && (
        <TransactionForm
          mode={modal.kind}
          transaction={modal.kind === 'edit' ? modal.transaction : undefined}
          onClose={() => setModal({ kind: 'closed' })}
          onSave={handleFormSave}
        />
      )}

      {modal.kind === 'delete' && (
        <ConfirmDialog
          description={modal.transaction.description}
          amount={modal.transaction.amount}
          type={modal.transaction.type}
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setModal({ kind: 'closed' })}
        />
      )}
    </main>
  )
}
