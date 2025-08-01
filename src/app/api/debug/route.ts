import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Just return environment info for debugging
    const dbUrl = process.env.DATABASE_URL || 'Not set'
    
    // Mask the password for security
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':***@')
    
    const result = {
      message: 'Database configuration check',
      database_url: maskedUrl,
      node_env: process.env.NODE_ENV,
      vercel: process.env.VERCEL ? 'Yes' : 'No',
      connection_test: null,
      permissions_test: null,
      tables_exist: null
    }
    
    // Test database connection
    try {
      const prisma = new PrismaClient()
      await prisma.$executeRaw`SELECT 1`
      result.connection_test = 'Success'
      
      // Test table creation permissions
      try {
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS test_table (id TEXT PRIMARY KEY)`
        await prisma.$executeRaw`DROP TABLE IF EXISTS test_table`
        result.permissions_test = 'Can create tables'
      } catch (permError) {
        result.permissions_test = `Permission error: ${permError.message}`
      }
      
      // Check if our tables exist
      try {
        const userTable = await prisma.$queryRaw`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')`
        const memberTable = await prisma.$queryRaw`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'members')`
        const paymentTable = await prisma.$queryRaw`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments')`
        
        result.tables_exist = {
          users: userTable[0].exists,
          members: memberTable[0].exists,
          payments: paymentTable[0].exists
        }
      } catch (tableError) {
        result.tables_exist = `Error checking tables: ${tableError.message}`
      }
      
      await prisma.$disconnect()
    } catch (connError) {
      result.connection_test = `Failed: ${connError.message}`
    }
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Configuration check failed',
      details: error.message 
    }, { status: 500 })
  }
}