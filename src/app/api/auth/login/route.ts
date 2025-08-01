import { NextRequest, NextResponse } from 'next/server'
import { getDb, get } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()
    
    const db = await getDb()

    // Find user by email and role
    const user = await get(`
      SELECT u.*, m.* 
      FROM users u 
      LEFT JOIN members m ON u.id = m.user_id 
      WHERE u.email = ? AND u.role = ?
    `, [email, role])

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // For demo purposes, check accountant with simple password
    if (role === 'ACCOUNTANT') {
      const isValidPassword = password === 'accountant123' // Simple demo password for accountant
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }
    } else {
      // For members, check hashed password
      if (!user.password) {
        return NextResponse.json(
          { error: 'No password set for this user' },
          { status: 401 }
        )
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }
    }

    // Create a simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    // Format member data
    const memberData = user.id ? {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      monthlyAmount: Number(user.monthly_amount) || 0,
      totalPaid: Number(user.total_paid) || 0,
      totalDue: Number(user.total_due) || 0,
      isActive: Boolean(user.is_active),
      joinDate: user.join_date
    } : null

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        member: memberData
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}