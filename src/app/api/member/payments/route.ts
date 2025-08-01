import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Decode token to get user ID (simple demo)
    const decoded = Buffer.from(token, 'base64').toString()
    const [userId] = decoded.split(':')

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        member: true
      }
    })

    if (!user || user.role !== 'MEMBER' || !user.member) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payments = await db.payment.findMany({
      where: { memberId: user.member.id },
      orderBy: { submittedAt: 'desc' }
    })

    return NextResponse.json({
      payments
    })
  } catch (error) {
    console.error('Payments fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Decode token to get user ID (simple demo)
    const decoded = Buffer.from(token, 'base64').toString()
    const [userId] = decoded.split(':')

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        member: true
      }
    })

    if (!user || user.role !== 'MEMBER' || !user.member) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, paymentMethod, transactionId, notes } = await request.json()

    const payment = await db.payment.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod,
        transactionId,
        notes,
        memberId: user.member.id,
        submittedBy: userId,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Payment submitted successfully',
      payment
    })
  } catch (error) {
    console.error('Payment submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}