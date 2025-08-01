import { NextRequest, NextResponse } from 'next/server'
import { getDb, run } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('Setting up SQLite database...')
    
    const db = await getDb()
    
    // Test database connection
    try {
      await db.get("SELECT 1")
      console.log('Database connection successful')
    } catch (error) {
      console.log('Database connection test failed:', error.message)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: error.message 
      }, { status: 500 })
    }
    
    try {
      // Check if tables exist
      const usersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
      const membersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='members'")
      const paymentsTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='payments'")
      
      if (usersTable && membersTable && paymentsTable) {
        console.log('All tables already exist')
        return NextResponse.json({ 
          message: 'Database tables already exist. Setup complete.',
          status: 'success' 
        })
      }
      
      // Create tables
      console.log('Creating tables...')
      
      // Create users table
      await run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ACCOUNTANT', 'MEMBER')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // Create members table
      await run(`
        CREATE TABLE IF NOT EXISTS members (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          address TEXT,
          monthly_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          total_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          total_due DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          is_active BOOLEAN NOT NULL DEFAULT 1,
          join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          user_id TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `)
      
      // Create payments table
      await run(`
        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          amount DECIMAL(10,2) NOT NULL,
          payment_method TEXT NOT NULL CHECK (payment_method IN ('BKASH', 'NAGAD', 'CASH')),
          transaction_id TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          verified_at DATETIME,
          verified_by TEXT,
          member_id TEXT NOT NULL,
          submitted_by TEXT NOT NULL,
          FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
          FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `)
      
      // Create indexes
      await run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
      await run('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)')
      await run('CREATE INDEX IF NOT EXISTS idx_members_email ON members(email)')
      await run('CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id)')
      await run('CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id)')
      await run('CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)')
      await run('CREATE INDEX IF NOT EXISTS idx_payments_submitted_by ON payments(submitted_by)')
      
      console.log('Database setup completed successfully')
      
      return NextResponse.json({ 
        message: 'Database setup completed successfully',
        status: 'success' 
      })
      
    } catch (tableError) {
      console.log('Table setup error:', tableError)
      return NextResponse.json({ 
        error: 'Database setup failed',
        details: tableError.message 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Database setup failed:', error)
    return NextResponse.json({ 
      error: 'Database setup failed',
      details: error.message 
    }, { status: 500 })
  }
}