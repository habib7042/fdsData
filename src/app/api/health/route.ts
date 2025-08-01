import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    await db.get("SELECT 1");
    return NextResponse.json({ message: "Good!", database: "connected" });
  } catch (error) {
    return NextResponse.json({ 
      message: "Database connection failed", 
      error: error.message 
    }, { status: 500 });
  }
}