import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Seeding database...')
    
    // Create accountant user
    const accountant = await db.user.create({
      data: {
        id: 'accountant-' + Date.now(),
        email: 'accountant@fds.com',
        name: 'Accountant',
        role: 'ACCOUNTANT'
      }
    })

    // Create some sample members
    const member1 = await db.member.create({
      data: {
        id: 'member1-' + Date.now(),
        name: 'আব্দুল করিম',
        email: 'karim@email.com',
        phone: '01712345678',
        address: 'ঢাকা, বাংলাদেশ',
        monthlyAmount: 1000,
        totalDue: 1000
      }
    })

    const member2 = await db.member.create({
      data: {
        id: 'member2-' + Date.now(),
        name: 'রহিম উদ্দিন',
        email: 'rahim@email.com',
        phone: '01812345678',
        address: 'চট্টগ্রাম, বাংলাদেশ',
        monthlyAmount: 1500,
        totalDue: 1500
      }
    })

    const member3 = await db.member.create({
      data: {
        id: 'member3-' + Date.now(),
        name: 'সালমা খাতুন',
        email: 'salma@email.com',
        phone: '01912345678',
        address: 'রাজশাহী, বাংলাদেশ',
        monthlyAmount: 1200,
        totalDue: 1200
      }
    })

    // Create users for members
    await db.user.create({
      data: {
        id: 'user1-' + Date.now(),
        email: 'karim@email.com',
        name: 'আব্দুল করিম',
        role: 'MEMBER',
        member: {
          connect: { id: member1.id }
        }
      }
    })

    await db.user.create({
      data: {
        id: 'user2-' + Date.now(),
        email: 'rahim@email.com',
        name: 'রহিম উদ্দিন',
        role: 'MEMBER',
        member: {
          connect: { id: member2.id }
        }
      }
    })

    await db.user.create({
      data: {
        id: 'user3-' + Date.now(),
        email: 'salma@email.com',
        name: 'সালমা খাতুন',
        role: 'MEMBER',
        member: {
          connect: { id: member3.id }
        }
      }
    })

    // Create some sample payments
    const user1 = await db.user.findFirst({ where: { email: 'karim@email.com' } })
    const user2 = await db.user.findFirst({ where: { email: 'rahim@email.com' } })

    if (user1) {
      await db.payment.create({
        data: {
          id: 'payment1-' + Date.now(),
          amount: 1000,
          paymentMethod: 'BKASH',
          transactionId: 'TXN123456',
          notes: 'January payment',
          memberId: member1.id,
          submittedBy: user1.id,
          status: 'PENDING'
        }
      })
    }

    if (user2) {
      await db.payment.create({
        data: {
          id: 'payment2-' + Date.now(),
          amount: 1500,
          paymentMethod: 'NAGAD',
          transactionId: 'TXN789012',
          notes: 'January payment',
          memberId: member2.id,
          submittedBy: user2.id,
          status: 'PENDING'
        }
      })
    }

    console.log('Sample data created successfully!')
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      data: {
        accountant: 'accountant@fds.com / password123',
        members: [
          'karim@email.com / password123',
          'rahim@email.com / password123',
          'salma@email.com / password123'
        ]
      }
    })
  } catch (error) {
    console.error('Seeding failed:', error)
    return NextResponse.json({ 
      error: 'Seeding failed',
      details: error.message 
    }, { status: 500 })
  }
}