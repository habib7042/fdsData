import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

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

    const { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user || user.role !== 'ACCOUNTANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action } = await request.json()
    const paymentId = params.id

    // Get payment details first
    const { data: payment, error: paymentError } = await supabaseServer
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Payment has already been processed' },
        { status: 400 }
      )
    }

    // Update payment status
    const updateData: any = {
      status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      verified_by: userId,
      verified_at: new Date().toISOString()
    }

    const { data: updatedPayment, error: updateError } = await supabaseServer
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single()

    if (updateError) {
      console.error('Payment update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      )
    }

    // If approved, update member's total paid and due
    if (action === 'APPROVE') {
      const { data: member, error: memberError } = await supabaseServer
        .from('members')
        .select('*')
        .eq('id', payment.member_id)
        .single()

      if (memberError) {
        console.error('Member fetch error:', memberError)
        return NextResponse.json(
          { error: 'Failed to fetch member data' },
          { status: 500 }
        )
      }

      const newTotalPaid = Number(member.total_paid) + Number(payment.amount)
      const newTotalDue = Math.max(0, Number(member.total_due) - Number(payment.amount))

      await supabaseServer
        .from('members')
        .update({
          total_paid: newTotalPaid,
          total_due: newTotalDue
        })
        .eq('id', member.id)
    }

    return NextResponse.json({
      message: `Payment ${action.toLowerCase()}d successfully`,
      payment: {
        ...updatedPayment,
        amount: Number(updatedPayment.amount) || 0,
        paymentMethod: updatedPayment.payment_method,
        transactionId: updatedPayment.transaction_id,
        status: updatedPayment.status,
        submittedAt: updatedPayment.submitted_at,
        verifiedAt: updatedPayment.verified_at
      }
    })
  } catch (error) {
    console.error('Payment action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}