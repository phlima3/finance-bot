import { Suspense } from 'react'
import { TransactionsContent } from './transactions-content'

function LoadingSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-7 w-32 animate-pulse rounded bg-bg-card-hover" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-bg-card-hover" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-16 animate-pulse rounded-lg bg-bg-card-hover" />
          <div className="h-9 w-16 animate-pulse rounded-lg bg-bg-card-hover" />
          <div className="h-9 w-36 animate-pulse rounded-lg bg-bg-card-hover" />
        </div>
      </div>
      <div className="mb-4 h-16 animate-pulse rounded-xl bg-bg-card" />
      <div className="h-96 animate-pulse rounded-xl bg-bg-card" />
    </main>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TransactionsContent />
    </Suspense>
  )
}
