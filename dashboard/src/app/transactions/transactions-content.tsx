'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { TransactionsTable } from '@/components/transactions-table'
import { TransactionForm } from '@/components/transaction-form'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Pagination } from '@/components/pagination'
import { Filters, type FilterValues } from '@/components/filters'

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

function buildFilterParams(filters: FilterValues): string {
  const params = new URLSearchParams()
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.category) params.set('category', filters.category)
  if (filters.type) params.set('type', filters.type)
  return params.toString()
}

function buildExportUrl(base: string, filters: FilterValues): string {
  const filterStr = buildFilterParams(filters)
  return filterStr ? `${base}?${filterStr}` : base
}

export function TransactionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const [filters, setFilters] = useState<FilterValues>({
    startDate: searchParams.get('startDate') ?? '',
    endDate: searchParams.get('endDate') ?? '',
    category: searchParams.get('category') ?? '',
    type: searchParams.get('type') ?? '',
  })

  const fetchTransactions = useCallback(
    async (page: number, currentFilters: FilterValues) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(ITEMS_PER_PAGE))
        if (currentFilters.startDate) params.set('startDate', currentFilters.startDate)
        if (currentFilters.endDate) params.set('endDate', currentFilters.endDate)
        if (currentFilters.category) params.set('category', currentFilters.category)
        if (currentFilters.type) params.set('type', currentFilters.type)

        const response = await fetch(`/api/transactions?${params.toString()}`)
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
    },
    []
  )

  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1
    fetchTransactions(page, filters)
  }, [fetchTransactions, filters, searchParams])

  function syncSearchParams(newFilters: FilterValues, page: number) {
    const params = new URLSearchParams()
    if (newFilters.startDate) params.set('startDate', newFilters.startDate)
    if (newFilters.endDate) params.set('endDate', newFilters.endDate)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.type) params.set('type', newFilters.type)
    if (page > 1) params.set('page', String(page))

    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '/transactions', { scroll: false })
  }

  function handleFilterChange(newFilters: FilterValues) {
    setFilters(newFilters)
    syncSearchParams(newFilters, 1)
  }

  function handlePageChange(page: number) {
    syncSearchParams(filters, page)
  }

  function handleEdit(transaction: Transaction) {
    setModal({ kind: 'edit', transaction })
  }

  function handleDeleteRequest(transaction: Transaction) {
    setModal({ kind: 'delete', transaction })
  }

  function handleFormSave() {
    setModal({ kind: 'closed' })
    fetchTransactions(meta.page, filters)
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
      fetchTransactions(shouldGoBack ? meta.page - 1 : meta.page, filters)
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Transações
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            <span className="text-accent-gold">{meta.total}</span>{' '}
            {meta.total === 1 ? 'transação encontrada' : 'transações encontradas'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={buildExportUrl('/api/export/csv', filters)}
            download
            className="rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:border-border-gold hover:text-accent-gold"
          >
            ↓ CSV
          </a>
          <a
            href={buildExportUrl('/api/export/pdf', filters)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:border-border-gold hover:text-accent-gold"
          >
            ↓ PDF
          </a>
          <button
            type="button"
            onClick={() => setModal({ kind: 'create' })}
            className="rounded-lg bg-accent-gold px-4 py-2 text-sm font-semibold text-bg-primary transition-theme hover:bg-accent-gold-dim"
          >
            + Nova Transação
          </button>
        </div>
      </div>

      <div className="mb-4 animate-fade-in-up animate-stagger-1">
        <Filters filters={filters} onFilterChange={handleFilterChange} />
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
