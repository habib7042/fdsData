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

    if (error || !user || user.role !== 'ACCOUNTANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: members, error: membersError } = await supabaseServer
      .from('members')
      .select('*')
      .order('name', { ascending: true })

    if (membersError) {
      console.error('Members fetch error:', membersError)
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      members: members || []
    })
  } catch (error) {
    console.error('Members fetch error:', error)
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

    if (error || !user || user.role !== 'ACCOUNTANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, email, phone, address, monthlyAmount } = await request.json()

    // Check if member with this email already exists
    const { data: existingMember, error: checkError } = await supabaseServer
      .from('members')
      .select('*')
      .eq('email', email)
      .single()

    if (!checkError && existingMember) {
      return NextResponse.json(
        { error: 'Member with this email already exists' },
        { status: 400 }
      )
    }

    // Create member
    const memberId = uuidv4()
    const { data: member, error: createError } = await supabaseServer
      .from('members')
      .insert({
        id: memberId,
        name,
        email,
        phone,
        address,
        monthly_amount: parseFloat(monthlyAmount),
        total_due: parseFloat(monthlyAmount) // Initial due amount
      })
      .select()
      .single()

    if (createError) {
      console.error('Member creation error:', createError)
      return NextResponse.json(
        { error: 'Failed to create member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Member created successfully',
      member
    })
  } catch (error) {
    console.error('Member creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}