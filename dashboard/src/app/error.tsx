'use client'

interface ErrorPageProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="animate-fade-in text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-expense/20 bg-expense/10">
          <span className="text-2xl">⚠</span>
        </div>

        <h1 className="text-xl font-bold text-text-primary">
          Algo deu errado
        </h1>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-xs text-text-muted">
            Código: {error.digest}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-accent-gold px-5 py-2.5 text-sm font-semibold text-bg-primary transition-theme hover:bg-accent-gold-dim"
          >
            Tentar novamente
          </button>

          <a
            href="/"
            className="rounded-lg border border-border-subtle px-5 py-2.5 text-sm font-medium text-text-secondary transition-theme hover:border-border-gold hover:text-accent-gold"
          >
            Página inicial
          </a>
        </div>
      </div>
    </main>
  )
}
