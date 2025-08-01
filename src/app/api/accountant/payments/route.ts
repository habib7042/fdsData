import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

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

    if (error || !user || user.role !== 'ACCOUNTANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: payments, error: paymentsError } = await supabaseServer
      .from('payments')
      .select(`
        *,
        member:members(name, email)
      `)
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