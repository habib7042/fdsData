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

    // Get the payment with member details
    const { data: payment, error: paymentError } = await supabaseServer
      .from('payments')
      .select(`
        *,
        member:members(*)
      `)
      .eq('id', params.id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update payment status
    const { data: updatedPayment, error: updateError } = await supabaseServer
      .from('payments')
      .update({
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        verified_at: new Date().toISOString(),
        verified_by: userId
      })
      .eq('id', params.id)
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
      const { error: memberUpdateError } = await supabaseServer
        .from('members')
        .update({
          total_paid: payment.member.total_paid + payment.amount,
          total_due: payment.member.total_due - payment.amount
        })
        .eq('id', payment.member.id)

      if (memberUpdateError) {
        console.error('Member update error:', memberUpdateError)
        return NextResponse.json(
          { error: 'Failed to update member totals' },
          { status: 500 }
        )
      }
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