import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Setting up Supabase database...')
    
    // Test database connection
    const { data, error } = await supabaseServer.from('users').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('Database connection test failed:', error.message)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: error.message 
      }, { status: 500 })
    }
    
    console.log('Database connection successful')
    
    try {
      // Create tables using Supabase SQL RPC or direct SQL
      // First, let's check if tables exist by trying to query them
      const { error: usersError } = await supabaseServer.from('users').select('*').limit(1)
      const { error: membersError } = await supabaseServer.from('members').select('*').limit(1)
      const { error: paymentsError } = await supabaseServer.from('payments').select('*').limit(1)
      
      if (!usersError && !membersError && !paymentsError) {
        console.log('All tables already exist')
        return NextResponse.json({ 
          message: 'Database tables already exist. Setup complete.',
          status: 'success' 
        })
      }
      
      // If tables don't exist, we need to create them using SQL
      // Since we can't create tables directly via Supabase client without proper permissions,
      // we'll provide the SQL for manual execution
      const setupSQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'MEMBER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create members table
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
);

-- Create payments table
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
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

-- Create policies for members table
CREATE POLICY "Members can be viewed by all" ON members FOR SELECT USING (true);
CREATE POLICY "Members can be inserted by all" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Members can be updated by all" ON members FOR UPDATE USING (true);

-- Create policies for payments table
CREATE POLICY "Payments can be viewed by all" ON payments FOR SELECT USING (true);
CREATE POLICY "Payments can be inserted by all" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Payments can be updated by all" ON payments FOR UPDATE USING (true);
      `
      
      return NextResponse.json({ 
        message: 'Database setup requires manual SQL execution',
        status: 'requires_manual_setup',
        sql: setupSQL,
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Open the SQL Editor',
          '3. Copy and paste the SQL provided in the "sql" field',
          '4. Run the script to create all tables and enable RLS',
          '5. After running the SQL, visit /api/seed to insert sample data'
        ]
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