import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      where: { id: userId }
    })

    if (!user || user.role !== 'ACCOUNTANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action } = await request.json()

    // Get the payment with member details
    const payment = await db.payment.findUnique({
      where: { id: params.id },
      include: {
        member: true
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update payment status
    const updatedPayment = await db.payment.update({
      where: { id: params.id },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        verifiedAt: new Date(),
        verifiedBy: userId
      }
    })

    // If approved, update member's total paid and due
    if (action === 'APPROVE') {
      await db.member.update({
        where: { id: payment.memberId },
        data: {
          totalPaid: {
            increment: payment.amount
          },
          totalDue: {
            decrement: payment.amount
          }
        }
      })
    }

    return NextResponse.json({
      message: `Payment ${action.toLowerCase()}d successfully`,
      payment: updatedPayment
    })
  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}