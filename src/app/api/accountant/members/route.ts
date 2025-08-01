import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

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

    // Ensure numeric values are properly formatted
    const formattedMembers = members.map(member => ({
      ...member,
      monthlyAmount: Number(member.monthly_amount) || 0,
      totalPaid: Number(member.total_paid) || 0,
      totalDue: Number(member.total_due) || 0,
      isActive: Boolean(member.is_active),
      joinDate: member.join_date
    }))

    return NextResponse.json({
      members: formattedMembers
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

    const { name, email, phone, address, monthlyAmount, password } = await request.json()

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

    // Generate password if not provided
    const finalPassword = password || Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(finalPassword, 10)

    // Create user account first
    const userId = uuidv4()
    const { data: userResult, error: userError } = await supabaseServer
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        role: 'MEMBER',
        password: hashedPassword
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create member
    const memberId = uuidv4()
    const monthlyAmountNum = parseFloat(monthlyAmount) || 0
    const { data: member, error: createError } = await supabaseServer
      .from('members')
      .insert({
        id: memberId,
        name,
        email,
        phone,
        address,
        monthly_amount: monthlyAmountNum,
        total_paid: 0,
        total_due: monthlyAmountNum, // Initial due amount
        user_id: userId
      })
      .select()
      .single()

    if (createError) {
      // Rollback user creation if member creation fails
      await supabaseServer.from('users').delete().eq('id', userId)
      console.error('Member creation error:', createError)
      return NextResponse.json(
        { error: 'Failed to create member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Member created successfully',
      member: {
        ...member,
        monthlyAmount: Number(member.monthly_amount) || 0,
        totalPaid: Number(member.total_paid) || 0,
        totalDue: Number(member.total_due) || 0,
        isActive: Boolean(member.is_active),
        joinDate: member.join_date
      },
      tempPassword: password ? undefined : finalPassword, // Only show temp password if auto-generated
      credentials: {
        email,
        password: finalPassword
      }
    })
  } catch (error) {
    console.error('Member creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}