interface PaginationProps {
  readonly page: number
  readonly totalPages: number
  readonly onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const isFirst = page <= 1
  const isLast = page >= totalPages

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-text-secondary">
        Página <span className="font-medium text-text-primary">{page}</span> de{' '}
        <span className="font-medium text-text-primary">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onPageChange(page - 1)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-theme ${
            isFirst
              ? 'cursor-not-allowed border-border-subtle bg-bg-card text-text-muted'
              : 'border-border-subtle bg-bg-card text-text-primary hover:border-border-gold hover:text-accent-gold'
          }`}
        >
          ← Anterior
        </button>

        <button
          type="button"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-theme ${
            isLast
              ? 'cursor-not-allowed border-border-subtle bg-bg-card text-text-muted'
              : 'border-border-subtle bg-bg-card text-text-primary hover:border-border-gold hover:text-accent-gold'
          }`}
        >
          Próxima →
        </button>
      </div>
    </div>
  )
}
