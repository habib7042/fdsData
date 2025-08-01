import { NextRequest, NextResponse } from 'next/server'
import { getDb, run, get } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('Seeding database with sample data...')
    
    const db = await getDb()
    
    // Check if tables exist first
    try {
      await db.get("SELECT 1 FROM users LIMIT 1")
      await db.get("SELECT 1 FROM members LIMIT 1")
      await db.get("SELECT 1 FROM payments LIMIT 1")
    } catch (error) {
      return NextResponse.json({ 
        error: 'Database tables not found',
        details: 'Please run /api/setup-db first to create the database tables'
      }, { status: 400 })
    }
    
    // Check if data already exists
    const existingUsers = await get("SELECT * FROM users LIMIT 1")
    if (existingUsers) {
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
    await run(`
      INSERT INTO users (id, email, name, role, password) 
      VALUES (?, ?, ?, ?, ?)
    `, [accountantUserId, 'accountant@fds.com', 'System Accountant', 'ACCOUNTANT', accountantPassword])
    
    await run(`
      INSERT INTO users (id, email, name, role, password) 
      VALUES (?, ?, ?, ?, ?)
    `, [member1UserId, 'john@fds.com', 'John Doe', 'MEMBER', member1Password])
    
    await run(`
      INSERT INTO users (id, email, name, role, password) 
      VALUES (?, ?, ?, ?, ?)
    `, [member2UserId, 'jane@fds.com', 'Jane Smith', 'MEMBER', member2Password])
    
    await run(`
      INSERT INTO users (id, email, name, role, password) 
      VALUES (?, ?, ?, ?, ?)
    `, [member3UserId, 'bob@fds.com', 'Bob Johnson', 'MEMBER', member3Password])
    
    // Create members
    await run(`
      INSERT INTO members (id, name, email, monthly_amount, total_paid, total_due, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [accountantMemberId, 'System Accountant', 'accountant@fds.com', 0, 0, 0, accountantUserId])
    
    await run(`
      INSERT INTO members (id, name, email, phone, address, monthly_amount, total_paid, total_due, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [member1Id, 'John Doe', 'john@fds.com', '+8801712345678', 'Dhaka, Bangladesh', 1000, 500, 500, member1UserId])
    
    await run(`
      INSERT INTO members (id, name, email, phone, address, monthly_amount, total_paid, total_due, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [member2Id, 'Jane Smith', 'jane@fds.com', '+8801812345678', 'Chittagong, Bangladesh', 1500, 1500, 0, member2UserId])
    
    await run(`
      INSERT INTO members (id, name, email, phone, address, monthly_amount, total_paid, total_due, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [member3Id, 'Bob Johnson', 'bob@fds.com', '+8801912345678', 'Rajshahi, Bangladesh', 2000, 1000, 1000, member3UserId])
    
    // Create sample payments
    await run(`
      INSERT INTO payments (id, amount, payment_method, transaction_id, status, member_id, submitted_by, verified_by, verified_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['pay-001', 500, 'BKASH', 'BKASH123456', 'APPROVED', member1Id, member1UserId, accountantUserId, new Date().toISOString()])
    
    await run(`
      INSERT INTO payments (id, amount, payment_method, transaction_id, status, member_id, submitted_by, verified_by, verified_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['pay-002', 1500, 'NAGAD', 'NAGAD789012', 'APPROVED', member2Id, member2UserId, accountantUserId, new Date().toISOString()])
    
    await run(`
      INSERT INTO payments (id, amount, payment_method, status, member_id, submitted_by) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['pay-003', 1000, 'CASH', 'PENDING', member3Id, member3UserId])
    
    console.log('Database seeded successfully')
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      users: 4,
      members: 4,
      payments: 3,
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