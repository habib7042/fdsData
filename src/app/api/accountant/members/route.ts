import { NextRequest, NextResponse } from 'next/server'
import { getDb, query, get, run } from '@/lib/db'
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

    const db = await getDb()
    const user = await get('SELECT * FROM users WHERE id = ?', [userId])

    if (!user || user.role !== 'ACCOUNTANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const members = await query('SELECT * FROM members ORDER BY name ASC')

    if (!members) {
      console.error('Members fetch error: No members found')
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

    const db = await getDb()
    const user = await get('SELECT * FROM users WHERE id = ?', [userId])

    if (!user || user.role !== 'ACCOUNTANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, email, phone, address, monthlyAmount, password } = await request.json()

    // Check if member with this email already exists
    const existingMember = await get('SELECT * FROM members WHERE email = ?', [email])

    if (existingMember) {
      return NextResponse.json(
        { error: 'Member with this email already exists' },
        { status: 400 }
      )
    }

    // Generate password if not provided
    const finalPassword = password || Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(finalPassword, 10)

    // Create user account first
    const newUserId = uuidv4()
    try {
      await run(`
        INSERT INTO users (id, email, name, role, password) 
        VALUES (?, ?, ?, ?, ?)
      `, [newUserId, email, name, 'MEMBER', hashedPassword])
    } catch (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create member
    const memberId = uuidv4()
    const monthlyAmountNum = parseFloat(monthlyAmount) || 0
    try {
      await run(`
        INSERT INTO members (id, name, email, phone, address, monthly_amount, total_paid, total_due, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [memberId, name, email, phone, address, monthlyAmountNum, 0, monthlyAmountNum, newUserId])
    } catch (createError) {
      // Rollback user creation if member creation fails
      await run('DELETE FROM users WHERE id = ?', [newUserId])
      console.error('Member creation error:', createError)
      return NextResponse.json(
        { error: 'Failed to create member' },
        { status: 500 }
      )
    }

    // Get the created member
    const member = await get('SELECT * FROM members WHERE id = ?', [memberId])

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