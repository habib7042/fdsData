import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Setting up database...')
    
    // Test database connection
    await db.$executeRaw`SELECT 1`
    console.log('Database connection successful')
    
    // Push schema (this will create tables if they don't exist)
    // Note: In production, you might want to use migrations instead
    try {
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          role TEXT NOT NULL DEFAULT 'MEMBER',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS members (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          address TEXT,
          monthly_amount REAL NOT NULL DEFAULT 0,
          total_paid REAL NOT NULL DEFAULT 0,
          total_due REAL NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT 1,
          join_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          user_id TEXT UNIQUE,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `
      
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          amount REAL NOT NULL,
          payment_method TEXT NOT NULL,
          transaction_id TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'PENDING',
          submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          verified_at DATETIME,
          verified_by TEXT,
          member_id TEXT NOT NULL,
          submitted_by TEXT NOT NULL,
          FOREIGN KEY (member_id) REFERENCES members(id),
          FOREIGN KEY (submitted_by) REFERENCES users(id)
        )
      `
      
      console.log('Database tables created successfully')
      
    } catch (error) {
      console.log('Tables might already exist:', error)
    }
    
    return NextResponse.json({ 
      message: 'Database setup completed successfully',
      status: 'success' 
    })
  } catch (error) {
    console.error('Database setup failed:', error)
    return NextResponse.json({ 
      error: 'Database setup failed',
      details: error.message 
    }, { status: 500 })
  }
}