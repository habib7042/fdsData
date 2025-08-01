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
      .select(`
        *,
        member:members(*)
      `)
      .eq('id', userId)
      .single()

    if (error || !user || user.role !== 'MEMBER' || !user.member) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: payments, error: paymentsError } = await supabaseServer
      .from('payments')
      .select('*')
      .eq('member_id', user.member.id)
      .order('submitted_at', { ascending: false })

    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError)
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      payments: payments || []
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

    const { data: user, error } = await supabaseServer
      .from('users')
      .select(`
        *,
        member:members(*)
      `)
      .eq('id', userId)
      .single()

    if (error || !user || user.role !== 'MEMBER' || !user.member) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, paymentMethod, transactionId, notes } = await request.json()

    const { data: payment, error: paymentError } = await supabaseServer
      .from('payments')
      .insert({
        id: uuidv4(),
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        transaction_id: transactionId,
        notes,
        member_id: user.member.id,
        submitted_by: userId,
        status: 'PENDING'
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment submission error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to submit payment' },
        { status: 500 }
      )
    }

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