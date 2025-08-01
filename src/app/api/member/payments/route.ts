import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

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

    const { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user || user.role !== 'MEMBER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get member data
    const { data: member, error: memberError } = await supabaseServer
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (memberError) {
      console.error('Member fetch error:', memberError)
      return NextResponse.json(
        { error: 'Failed to fetch member data' },
        { status: 500 }
      )
    }

    // Get member's payments
    const { data: payments, error: paymentsError } = await supabaseServer
      .from('payments')
      .select('*')
      .eq('member_id', member.id)
      .order('submitted_at', { ascending: false })

    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError)
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    // Format payments data
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      amount: Number(payment.amount) || 0,
      paymentMethod: payment.payment_method,
      transactionId: payment.transaction_id,
      notes: payment.notes,
      status: payment.status,
      submittedAt: payment.submitted_at,
      verifiedAt: payment.verified_at
    }))

    return NextResponse.json({
      payments: formattedPayments
    })
  } catch (error) {
    console.error('Member payments fetch error:', error)
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

    const { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user || user.role !== 'MEMBER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get member data
    const { data: member, error: memberError } = await supabaseServer
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (memberError) {
      console.error('Member fetch error:', memberError)
      return NextResponse.json(
        { error: 'Failed to fetch member data' },
        { status: 500 }
      )
    }

    const { amount, paymentMethod, transactionId, notes } = await request.json()

    // Create payment
    const paymentId = uuidv4()
    const amountNum = parseFloat(amount) || 0
    const { data: payment, error: createError } = await supabaseServer
      .from('payments')
      .insert({
        id: paymentId,
        amount: amountNum,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        notes: notes,
        status: 'PENDING',
        member_id: member.id,
        submitted_by: userId
      })
      .select()
      .single()

    if (createError) {
      console.error('Payment creation error:', createError)
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Payment submitted successfully',
      payment: {
        ...payment,
        amount: Number(payment.amount) || 0,
        paymentMethod: payment.payment_method,
        transactionId: payment.transaction_id,
        status: payment.status,
        submittedAt: payment.submitted_at,
        verifiedAt: payment.verified_at
      }
    })
  } catch (error) {
    console.error('Payment submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}