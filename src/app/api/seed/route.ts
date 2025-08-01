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
    const accountantUserId = 'acc-001'
    const member1UserId = 'mem-001'
    const member2UserId = 'mem-002'
    const member3UserId = 'mem-003'
    
    const accountantMemberId = 'acc-mem-001'
    const member1Id = 'mem-001'
    const member2Id = 'mem-002'
    const member3Id = 'mem-003'
    
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
          name: 'System Accountant',
          role: 'ACCOUNTANT',
          password: accountantPassword
        },
        {
          id: member1UserId,
          email: 'john@fds.com',
          name: 'John Doe',
          role: 'MEMBER',
          password: member1Password
        },
        {
          id: member2UserId,
          email: 'jane@fds.com',
          name: 'Jane Smith',
          role: 'MEMBER',
          password: member2Password
        },
        {
          id: member3UserId,
          email: 'bob@fds.com',
          name: 'Bob Johnson',
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
          name: 'System Accountant',
          email: 'accountant@fds.com',
          monthly_amount: 0,
          total_paid: 0,
          total_due: 0,
          user_id: accountantUserId
        },
        {
          id: member1Id,
          name: 'John Doe',
          email: 'john@fds.com',
          phone: '+8801712345678',
          address: 'Dhaka, Bangladesh',
          monthly_amount: 1000,
          total_paid: 500,
          total_due: 500,
          user_id: member1UserId
        },
        {
          id: member2Id,
          name: 'Jane Smith',
          email: 'jane@fds.com',
          phone: '+8801812345678',
          address: 'Chittagong, Bangladesh',
          monthly_amount: 1500,
          total_paid: 1500,
          total_due: 0,
          user_id: member2UserId
        },
        {
          id: member3Id,
          name: 'Bob Johnson',
          email: 'bob@fds.com',
          phone: '+8801912345678',
          address: 'Rajshahi, Bangladesh',
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
          id: 'pay-001',
          amount: 500,
          payment_method: 'BKASH',
          transaction_id: 'BKASH123456',
          status: 'APPROVED',
          member_id: member1Id,
          submitted_by: member1UserId,
          verified_by: accountantUserId,
          verified_at: new Date().toISOString()
        },
        {
          id: 'pay-002',
          amount: 1500,
          payment_method: 'NAGAD',
          transaction_id: 'NAGAD789012',
          status: 'APPROVED',
          member_id: member2Id,
          submitted_by: member2UserId,
          verified_by: accountantUserId,
          verified_at: new Date().toISOString()
        },
        {
          id: 'pay-003',
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
          email: 'john@fds.com',
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