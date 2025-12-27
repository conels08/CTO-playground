import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  adapter: PrismaBetterSqlite3 | undefined
}

const databaseUrl = process.env.DATABASE_URL
const shouldUseSqlite = !databaseUrl || databaseUrl.startsWith('file:')
const sqliteUrl = databaseUrl ?? 'file:./prisma/dev.db'
let prismaClient = globalForPrisma.prisma

if (!prismaClient) {
  if (shouldUseSqlite) {
    const adapter = globalForPrisma.adapter ?? new PrismaBetterSqlite3({ url: sqliteUrl })
    prismaClient = new PrismaClient({ adapter })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.adapter = adapter
    }
  } else {
    prismaClient = new PrismaClient()
  }
}

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
