import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    console.log('Setting up database...')
    
    // Create a new Prisma client instance for this operation
    const prisma = new PrismaClient({
      log: ['query'],
    })
    
    // Test database connection
    await prisma.$executeRaw`SELECT 1`
    console.log('Database connection successful')
    
    // Use Prisma to push the schema - this is the recommended approach
    try {
      // Try to create tables using Prisma's schema pushing
      // First, let's check if tables already exist
      try {
        await prisma.user.findFirst()
        console.log('Users table already exists')
      } catch (error) {
        console.log('Users table does not exist, will be created by Prisma')
      }
      
      // For Supabase, we need to use Prisma's built-in migrations
      // Let's try to create the schema using Prisma's executeRaw with proper permissions
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          role TEXT NOT NULL DEFAULT 'MEMBER',
          createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS members (
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
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS payments (
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
      
      console.log('Database tables created successfully')
      
      await prisma.$disconnect()
      
      return NextResponse.json({ 
        message: 'Database setup completed successfully. Tables created.',
        status: 'success' 
      })
    } catch (tableError) {
      console.log('Table creation error:', tableError)
      await prisma.$disconnect()
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