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

    // Format member data
    const formattedMember = {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      monthlyAmount: Number(member.monthly_amount) || 0,
      totalPaid: Number(member.total_paid) || 0,
      totalDue: Number(member.total_due) || 0,
      isActive: Boolean(member.is_active),
      joinDate: member.join_date
    }

    return NextResponse.json({
      member: formattedMember
    })
  } catch (error) {
    console.error('Member profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}