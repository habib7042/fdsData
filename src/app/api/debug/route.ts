import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Just return environment info for debugging
    const dbUrl = process.env.DATABASE_URL || 'Not set'
    
    // Mask the password for security
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':***@')
    
    return NextResponse.json({ 
      message: 'Database configuration check',
      database_url: maskedUrl,
      node_env: process.env.NODE_ENV,
      vercel: process.env.VERCEL ? 'Yes' : 'No'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Configuration check failed',
      details: error.message 
    }, { status: 500 })
  }
}