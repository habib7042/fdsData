import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseServer } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get environment info for debugging
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Not set'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'Not set'
    
    // Mask the keys for security
    const maskedAnonKey = supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'Not set'
    const maskedServiceKey = supabaseServiceKey ? supabaseServiceKey.substring(0, 10) + '...' : 'Not set'
    
    const result = {
      message: 'Supabase configuration check',
      supabase_url: supabaseUrl,
      supabase_anon_key: maskedAnonKey,
      supabase_service_key: maskedServiceKey,
      node_env: process.env.NODE_ENV,
      vercel: process.env.VERCEL ? 'Yes' : 'No',
      connection_test: null,
      tables_exist: null,
      rls_test: null
    }
    
    // Test database connection
    try {
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
      
      if (error) {
        result.connection_test = `Failed: ${error.message}`
      } else {
        result.connection_test = 'Success'
      }
      
      // Check if our tables exist
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(1)
        
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .limit(1)
        
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .limit(1)
        
        result.tables_exist = {
          users: !usersError,
          members: !membersError,
          payments: !paymentsError,
          errors: {
            users: usersError?.message,
            members: membersError?.message,
            payments: paymentsError?.message
          }
        }
      } catch (tableError) {
        result.tables_exist = `Error checking tables: ${tableError.message}`
      }
      
      // Test RLS (Row Level Security) permissions
      try {
        const { data: testData, error: testError } = await supabaseServer
          .from('users')
          .select('*')
          .limit(1)
        
        result.rls_test = testError ? `RLS Error: ${testError.message}` : 'RLS working correctly'
      } catch (rlsError) {
        result.rls_test = `RLS Test Error: ${rlsError.message}`
      }
      
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