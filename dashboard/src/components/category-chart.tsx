'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency, formatCategory } from '@/lib/formatters'

const NEON_COLORS = [
  '#d4af37', '#22c55e', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4',
  '#f97316', '#14b8a6', '#6366f1', '#e11d48',
]

interface CategoryData {
  readonly name: string
  readonly value: number
}

interface CategoryChartProps {
  readonly categories: ReadonlyArray<CategoryData>
}

interface TooltipPayloadEntry {
  readonly name: string
  readonly value: number
  readonly payload: {
    readonly fill: string
  }
}

interface CustomTooltipProps {
  readonly active?: boolean
  readonly payload?: ReadonlyArray<TooltipPayloadEntry>
}

function ChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const entry = payload[0]
  return (
    <div className="rounded-lg border border-border-gold bg-bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-text-primary">{entry.name}</p>
      <p className="mt-0.5 font-mono text-sm font-bold" style={{ color: entry.payload.fill }}>
        {formatCurrency(entry.value)}
      </p>
    </div>
  )
}

interface LegendPayloadEntry {
  readonly value: string
  readonly color: string
}

interface CustomLegendProps {
  readonly payload?: ReadonlyArray<LegendPayloadEntry>
}

function ChartLegend({ payload }: CustomLegendProps) {
  if (!payload) return null

  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-text-secondary">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function CategoryChart({ categories }: CategoryChartProps) {
  if (categories.length === 0) {
    return (
      <div className="card-dark animate-fade-in-up animate-stagger-4 flex h-64 items-center justify-center p-6">
        <p className="text-text-muted">Sem dados de categorias</p>
      </div>
    )
  }

  const formattedData = categories.map((c) => ({
    ...c,
    displayName: formatCategory(c.name),
  }))

  return (
    <div className="card-dark animate-fade-in-up animate-stagger-4 p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        Gastos por Categoria
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={formattedData}
            dataKey="value"
            nameKey="displayName"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={100}
            paddingAngle={2}
            cornerRadius={3}
            stroke="none"
          >
            {formattedData.map((_, index) => (
              <Cell key={index} fill={NEON_COLORS[index % NEON_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend content={<ChartLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
