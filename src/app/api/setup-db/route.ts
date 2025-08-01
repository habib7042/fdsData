import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Setting up database...')
    
    // Test database connection
    await db.$executeRaw`SELECT 1`
    console.log('Database connection successful')
    
    // For PostgreSQL, we don't need to create tables manually
    // Prisma will handle the schema migration
    // Just test the connection and return success
    
    return NextResponse.json({ 
      message: 'Database connection successful. Schema will be managed by Prisma migrations.',
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