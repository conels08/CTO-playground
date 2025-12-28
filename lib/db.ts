import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pgPool: Pool | undefined
}
let prismaClient = globalForPrisma.prisma

if (!prismaClient) {
  const pool = globalForPrisma.pgPool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  prismaClient = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pgPool = pool
  }
}

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
