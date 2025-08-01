import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Setting up database...')
    
    // Test database connection
    await db.$executeRaw`SELECT 1`
    console.log('Database connection successful')
    
    // Use Prisma to push the schema and create tables
    try {
      // This will create all tables based on the schema
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          role TEXT NOT NULL DEFAULT 'MEMBER',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
          is_active BOOLEAN NOT NULL DEFAULT true,
          join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          user_id TEXT UNIQUE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          verified_at TIMESTAMP WITH TIME ZONE,
          verified_by TEXT,
          member_id TEXT NOT NULL,
          submitted_by TEXT NOT NULL,
          FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
          FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
      `
      
      console.log('Database tables created successfully')
      
      return NextResponse.json({ 
        message: 'Database setup completed successfully. Tables created.',
        status: 'success' 
      })
    } catch (tableError) {
      console.log('Table creation error:', tableError)
      // If tables already exist, that's okay
      if (tableError.message?.includes('already exists') || tableError.code === '42P07') {
        return NextResponse.json({ 
          message: 'Database tables already exist',
          status: 'success' 
        })
      }
      throw tableError
    }
    
  } catch (error) {
    console.error('Database setup failed:', error)
    return NextResponse.json({ 
      error: 'Database setup failed',
      details: error.message 
    }, { status: 500 })
  }
}