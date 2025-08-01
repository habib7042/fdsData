import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  withAccelerate(
    new PrismaClient({
      log: ['query'],
    })
  )

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db