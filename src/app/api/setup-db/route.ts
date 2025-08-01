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
      // Drop existing tables if they exist to recreate with correct schema
      await db.$executeRaw`DROP TABLE IF EXISTS payments CASCADE`
      await db.$executeRaw`DROP TABLE IF EXISTS members CASCADE`
      await db.$executeRaw`DROP TABLE IF EXISTS users CASCADE`
      
      // Create users table with correct column names matching Prisma schema
      await db.$executeRaw`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          role TEXT NOT NULL DEFAULT 'MEMBER',
          createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      // Create members table with correct column names
      await db.$executeRaw`
        CREATE TABLE members (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          address TEXT,
          monthlyAmount REAL NOT NULL DEFAULT 0,
          totalPaid REAL NOT NULL DEFAULT 0,
          totalDue REAL NOT NULL DEFAULT 0,
          isActive BOOLEAN NOT NULL DEFAULT true,
          joinDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          userId TEXT UNIQUE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
        )
      `
      
      // Create payments table with correct column names
      await db.$executeRaw`
        CREATE TABLE payments (
          id TEXT PRIMARY KEY,
          amount REAL NOT NULL,
          paymentMethod TEXT NOT NULL,
          transactionId TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'PENDING',
          submittedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          verifiedAt TIMESTAMP WITH TIME ZONE,
          verifiedBy TEXT,
          memberId TEXT NOT NULL,
          submittedBy TEXT NOT NULL,
          FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE,
          FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE CASCADE
        )
      `
      
      console.log('Database tables created successfully with correct schema')
      
      return NextResponse.json({ 
        message: 'Database setup completed successfully. Tables created with correct schema.',
        status: 'success' 
      })
    } catch (tableError) {
      console.log('Table creation error:', tableError)
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