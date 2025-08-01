import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const memberId = params.id

    // Get member details first
    const { data: member, error: memberError } = await supabaseServer
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Delete associated payments first
    await supabaseServer
      .from('payments')
      .delete()
      .eq('member_id', memberId)

    // Delete associated user account
    if (member.user_id) {
      await supabaseServer
        .from('users')
        .delete()
        .eq('id', member.user_id)
    }

    // Delete member
    const { data: deletedMember, error: deleteError } = await supabaseServer
      .from('members')
      .delete()
      .eq('id', memberId)
      .select()
      .single()

    if (deleteError) {
      console.error('Member deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Member deleted successfully',
      member: deletedMember
    })
  } catch (error) {
    console.error('Member deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}