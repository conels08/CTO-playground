import { PrismaClient } from '@prisma/client'
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import path from 'node:path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  sqlite: Database | undefined
  adapter: PrismaBetterSQLite3 | undefined
}

const dbFile = path.join(process.cwd(), 'prisma', 'dev.db')
const sqlite = globalForPrisma.sqlite ?? new Database(dbFile)
const adapter = globalForPrisma.adapter ?? new PrismaBetterSQLite3(sqlite)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.sqlite = sqlite
  globalForPrisma.adapter = adapter
}
