'use client'

import { useCallback } from 'react'
import { CATEGORIES } from '@/lib/schemas'
import { formatCategory } from '@/lib/formatters'

export interface FilterValues {
  readonly startDate: string
  readonly endDate: string
  readonly category: string
  readonly type: string
}

interface FiltersProps {
  readonly filters: FilterValues
  readonly onFilterChange: (filters: FilterValues) => void
}

const EMPTY_FILTERS: FilterValues = {
  startDate: '',
  endDate: '',
  category: '',
  type: '',
}

const INPUT_BASE =
  'rounded-lg border border-border-subtle bg-bg-card px-3 py-2 text-sm text-text-primary transition-theme placeholder:text-text-muted focus:border-border-gold focus:outline-none focus:ring-1 focus:ring-accent-gold/30'

const SELECT_BASE =
  'rounded-lg border border-border-subtle bg-bg-card px-3 py-2 text-sm text-text-primary transition-theme focus:border-border-gold focus:outline-none focus:ring-1 focus:ring-accent-gold/30 appearance-none cursor-pointer'

export function Filters({ filters, onFilterChange }: FiltersProps) {
  const updateFilter = useCallback(
    (key: keyof FilterValues, value: string) => {
      onFilterChange({ ...filters, [key]: value })
    },
    [filters, onFilterChange]
  )

  const hasActiveFilters =
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.category !== '' ||
    filters.type !== ''

  return (
    <div className="card-dark p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Data início
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilter('startDate', e.target.value)}
            className={`${INPUT_BASE} w-[150px]`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Data fim
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => updateFilter('endDate', e.target.value)}
            className={`${INPUT_BASE} w-[150px]`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Categoria
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className={`${SELECT_BASE} w-[160px]`}
          >
            <option value="">Todas</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {formatCategory(cat)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Tipo
          </label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className={`${SELECT_BASE} w-[140px]`}
          >
            <option value="">Todos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Despesas</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onFilterChange(EMPTY_FILTERS)}
            className="rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:border-expense/40 hover:text-expense"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
