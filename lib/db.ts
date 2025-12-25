import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import type { Database as DatabaseType } from 'better-sqlite3'
import path from 'node:path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  sqlite: DatabaseType | undefined
  adapter: PrismaBetterSqlite3 | undefined
}

const databaseUrl = process.env.DATABASE_URL
const shouldUseSqlite = !databaseUrl || databaseUrl.startsWith('file:')

let prismaClient = globalForPrisma.prisma

if (!prismaClient) {
  if (shouldUseSqlite) {
    const dbFile = path.join(process.cwd(), 'prisma', 'dev.db')
    const sqlite = globalForPrisma.sqlite ?? new Database(dbFile)
    const adapter = globalForPrisma.adapter ?? new PrismaBetterSqlite3(sqlite)
    prismaClient = new PrismaClient({ adapter })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.sqlite = sqlite
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
