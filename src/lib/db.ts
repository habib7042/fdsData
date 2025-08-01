import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'

// Use the database file that was created
const dbPath = path.join(process.cwd(), 'fds_new.db')

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null

export async function getDb() {
  if (db) return db
  
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON')
    
    return db
  } catch (error) {
    console.error('Database connection error:', error)
    throw new Error('Failed to connect to database')
  }
}

// Helper function to run queries
export async function query(sql: string, params: any[] = []) {
  const db = await getDb()
  try {
    return await db.all(sql, params)
  } catch (error) {
    console.error('Query error:', error)
    throw error
  }
}

// Helper function to run a single query
export async function run(sql: string, params: any[] = []) {
  const db = await getDb()
  try {
    const result = await db.run(sql, params)
    return result
  } catch (error) {
    console.error('Run error:', error)
    throw error
  }
}

// Helper function to get a single row
export async function get(sql: string, params: any[] = []) {
  const db = await getDb()
  try {
    return await db.get(sql, params)
  } catch (error) {
    console.error('Get error:', error)
    throw error
  }
}