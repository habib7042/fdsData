import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('Seeding database with sample data...')
    
    // Check if tables exist first
    const { error: usersError } = await supabaseServer.from('users').select('*').limit(1)
    const { error: membersError } = await supabaseServer.from('members').select('*').limit(1)
    const { error: paymentsError } = await supabaseServer.from('payments').select('*').limit(1)
    
    if (usersError || membersError || paymentsError) {
      return NextResponse.json({ 
        error: 'Database tables not found',
        details: 'Please run /api/setup-db first to create the database tables',
        errors: {
          users: usersError?.message,
          members: membersError?.message,
          payments: paymentsError?.message
        }
      }, { status: 400 })
    }
    
    // Check if data already exists
    const { data: existingUsers, error: checkError } = await supabaseServer
      .from('users')
      .select('*')
      .limit(1)
    
    if (checkError) {
      console.log('Error checking existing data:', checkError.message)
    } else if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ 
        message: 'Database already contains data. Skipping seeding.',
        status: 'skipped' 
      })
    }
    
    // Generate UUIDs for the records
    const accountantUserId = uuidv4()
    const member1UserId = uuidv4()
    const member2UserId = uuidv4()
    const member3UserId = uuidv4()
    
    const accountantMemberId = uuidv4()
    const member1Id = uuidv4()
    const member2Id = uuidv4()
    const member3Id = uuidv4()
    
    // Hash passwords
    const accountantPassword = await bcrypt.hash('accountant123', 10)
    const member1Password = await bcrypt.hash('member123', 10)
    const member2Password = await bcrypt.hash('member123', 10)
    const member3Password = await bcrypt.hash('member123', 10)
    
    // Create users
    const { data: users, error: usersCreateError } = await supabaseServer
      .from('users')
      .insert([
        {
          id: accountantUserId,
          email: 'accountant@fds.com',
          name: 'Accountant User',
          role: 'ACCOUNTANT',
          password: accountantPassword
        },
        {
          id: member1UserId,
          email: 'member1@fds.com',
          name: 'Member 1',
          role: 'MEMBER',
          password: member1Password
        },
        {
          id: member2UserId,
          email: 'member2@fds.com',
          name: 'Member 2',
          role: 'MEMBER',
          password: member2Password
        },
        {
          id: member3UserId,
          email: 'member3@fds.com',
          name: 'Member 3',
          role: 'MEMBER',
          password: member3Password
        }
      ])
      .select()
    
    if (usersCreateError) {
      console.error('Error creating users:', usersCreateError)
      return NextResponse.json({ 
        error: 'Failed to create users',
        details: usersCreateError.message 
      }, { status: 500 })
    }
    
    // Create members
    const { data: members, error: membersCreateError } = await supabaseServer
      .from('members')
      .insert([
        {
          id: accountantMemberId,
          name: 'Accountant',
          email: 'accountant@fds.com',
          monthly_amount: 0,
          total_paid: 0,
          total_due: 0,
          user_id: accountantUserId
        },
        {
          id: member1Id,
          name: 'Member One',
          email: 'member1@fds.com',
          monthly_amount: 1000,
          total_paid: 500,
          total_due: 500,
          user_id: member1UserId
        },
        {
          id: member2Id,
          name: 'Member Two',
          email: 'member2@fds.com',
          monthly_amount: 1500,
          total_paid: 1500,
          total_due: 0,
          user_id: member2UserId
        },
        {
          id: member3Id,
          name: 'Member Three',
          email: 'member3@fds.com',
          monthly_amount: 2000,
          total_paid: 1000,
          total_due: 1000,
          user_id: member3UserId
        }
      ])
      .select()
    
    if (membersCreateError) {
      console.error('Error creating members:', membersCreateError)
      return NextResponse.json({ 
        error: 'Failed to create members',
        details: membersCreateError.message 
      }, { status: 500 })
    }
    
    // Create sample payments
    const { data: payments, error: paymentsCreateError } = await supabaseServer
      .from('payments')
      .insert([
        {
          id: uuidv4(),
          amount: 500,
          payment_method: 'BKASH',
          transaction_id: 'BKASH123',
          status: 'APPROVED',
          member_id: member1Id,
          submitted_by: member1UserId,
          verified_by: accountantUserId,
          verified_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          amount: 1500,
          payment_method: 'NAGAD',
          transaction_id: 'NAGAD456',
          status: 'APPROVED',
          member_id: member2Id,
          submitted_by: member2UserId,
          verified_by: accountantUserId,
          verified_at: new Date().toISOString()
        },
        {
          id: uuidv4(),
          amount: 1000,
          payment_method: 'CASH',
          status: 'PENDING',
          member_id: member3Id,
          submitted_by: member3UserId
        }
      ])
      .select()
    
    if (paymentsCreateError) {
      console.error('Error creating payments:', paymentsCreateError)
      return NextResponse.json({ 
        error: 'Failed to create payments',
        details: paymentsCreateError.message 
      }, { status: 500 })
    }
    
    console.log('Database seeded successfully')
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      users: users?.length || 0,
      members: members?.length || 0,
      payments: payments?.length || 0,
      credentials: {
        accountant: {
          email: 'accountant@fds.com',
          password: 'accountant123'
        },
        member: {
          email: 'member1@fds.com',
          password: 'member123'
        }
      }
    })
    
  } catch (error) {
    console.error('Seeding failed:', error)
    return NextResponse.json({ 
      error: 'Seeding failed',
      details: error.message 
    }, { status: 500 })
  }
}