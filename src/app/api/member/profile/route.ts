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
      .select(`
        *,
        member:members(*)
      `)
      .eq('id', userId)
      .single()

    if (error || !user || user.role !== 'MEMBER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      member: user.member
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}