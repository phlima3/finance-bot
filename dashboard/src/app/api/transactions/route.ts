import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { CreateTransactionSchema, TransactionFiltersSchema } from '@/lib/schemas'
import { randomUUID } from 'crypto'

function getDefaultDateRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  try {
    const filters = TransactionFiltersSchema.parse({
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 20,
    })

    const defaultRange = getDefaultDateRange()
    const startDate = filters.startDate ? new Date(filters.startDate) : defaultRange.start
    const endDate = filters.endDate ? new Date(filters.endDate) : defaultRange.end

    const where = {
      date: { gte: startDate, lte: endDate },
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.type ? { type: filters.type } : {}),
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.transaction.count({ where }),
    ])

    const totalPages = Math.ceil(total / filters.limit)

    return NextResponse.json({
      data: transactions,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages,
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Failed to fetch transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateTransactionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { amount, type, category, description, date, phone, rawMessage } = parsed.data

    const transaction = await prisma.transaction.create({
      data: {
        id: randomUUID(),
        amount,
        type,
        category,
        description,
        date: new Date(date),
        phone,
        rawMessage: rawMessage ?? null,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Failed to create transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
