import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UpdateTransactionSchema } from '@/lib/schemas'

interface RouteParams {
  readonly params: { readonly id: string }
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Failed to fetch transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const existing = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = UpdateTransactionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const updateData = {
      ...parsed.data,
      ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Failed to update transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const existing = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
