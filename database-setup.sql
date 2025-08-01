-- FDS Database Setup Script
-- Run this script manually in your database admin tool (like Supabase SQL Editor)

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'MEMBER',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create members table
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
);

-- Create payments table
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
);

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'members', 'payments');

-- Setup complete!