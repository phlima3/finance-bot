'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency, formatCategory } from '@/lib/formatters'

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#64748b', '#14b8a6', '#f43f5e', '#a855f7',
]

interface CategoryData {
  readonly name: string
  readonly value: number
}

interface CategoryChartProps {
  readonly categories: ReadonlyArray<CategoryData>
}

export function CategoryChart({ categories }: CategoryChartProps) {
  if (categories.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-white p-6 shadow">
        <p className="text-gray-400">Sem dados de categorias</p>
      </div>
    )
  }

  const formattedData = categories.map((c) => ({
    ...c,
    displayName: formatCategory(c.name),
  }))

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold">Gastos por Categoria</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={formattedData}
            dataKey="value"
            nameKey="displayName"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ displayName, percent }) =>
              `${displayName} ${(percent * 100).toFixed(0)}%`
            }
          >
            {formattedData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
