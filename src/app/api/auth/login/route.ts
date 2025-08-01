import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    // Find user by email and role
    const { data: user, error } = await supabaseServer
      .from('users')
      .select(`
        *,
        member:members(*)
      `)
      .eq('email', email)
      .eq('role', role)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // For demo purposes, check accountant with simple password
    if (role === 'ACCOUNTANT') {
      const isValidPassword = password === 'password123' // Simple demo password for accountant
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

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        member: user.member
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