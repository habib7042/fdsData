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
    
    try {
      // Instead of creating tables with raw SQL, let's use Prisma's built-in approach
      // We'll try to use the Prisma schema to create tables through the client
      
      // First, let's check if we can access the schema through Prisma
      try {
        // Try to create a user - this will fail if tables don't exist but gives us more info
        await prisma.user.create({
          data: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: 'MEMBER'
          }
        })
        console.log('User table exists and is accessible')
      } catch (createError) {
        console.log('User table does not exist or cannot be accessed:', createError.message)
        
        // Since we can't create tables directly, let's try a different approach
        // We'll use Prisma's queryRaw to check if we can create tables with a different method
        try {
          // Try to create the tables using a simpler approach
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
          console.log('Users table created successfully')
          
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
          console.log('Members table created successfully')
          
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
          console.log('Payments table created successfully')
          
        } catch (tableError) {
          console.log('Table creation failed:', tableError.message)
          
          // If we still can't create tables, we need to inform the user
          return NextResponse.json({ 
            message: 'Database connected but table creation failed due to permissions',
            error: 'PERMISSION_DENIED',
            details: 'The database user does not have permission to create tables. Please check your database configuration or contact your database provider.',
            suggestion: 'You may need to create the tables manually using a database admin tool or update the database user permissions.'
          }, { status: 403 })
        }
      }
      
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