'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkData {
  readonly href: string
  readonly label: string
}

const NAV_LINKS: ReadonlyArray<NavLinkData> = [
  { href: '/', label: 'Dashboard' },
  { href: '/transactions', label: 'Transações' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-text-primary transition-colors hover:text-accent-gold"
        >
          <span className="text-accent-gold">$</span>
          <span>Finance Bot</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-accent-gold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-accent-gold" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
