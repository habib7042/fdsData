-- FDS Supabase Database Setup Script
-- Run this script manually in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
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

-- Enable RLS (Row Level Security) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table - allow all operations for now
CREATE POLICY "Enable all access for users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Create policies for members table - allow all operations for now
CREATE POLICY "Enable all access for members" ON members FOR ALL USING (true) WITH CHECK (true);

-- Create policies for payments table - allow all operations for now
CREATE POLICY "Enable all access for payments" ON payments FOR ALL USING (true) WITH CHECK (true);

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'members', 'payments');

-- Setup complete! You can now run the seed API to populate with sample data.