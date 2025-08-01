import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.role !== 'ACCOUNTANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const members = await db.member.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      members
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

    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.role !== 'ACCOUNTANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, email, phone, address, monthlyAmount } = await request.json()

    // Check if member with this email already exists
    const existingMember = await db.member.findUnique({
      where: { email }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'Member with this email already exists' },
        { status: 400 }
      )
    }

    // Create member
    const member = await db.member.create({
      data: {
        name,
        email,
        phone,
        address,
        monthlyAmount: parseFloat(monthlyAmount),
        totalDue: parseFloat(monthlyAmount) // Initial due amount
      }
    })

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