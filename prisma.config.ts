import { defineConfig } from 'prisma/config'
import fs from 'node:fs'
import path from 'node:path'

function loadEnvFile(fileName: string) {
  const filePath = path.resolve(process.cwd(), fileName)
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (!key || process.env[key]) continue
    process.env[key] = value
  }
}

if (!process.env.DATABASE_URL) {
  loadEnvFile('.env')
  loadEnvFile('.env.local')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },

  // Prisma v7: connection URLs live in prisma.config.ts, not schema.prisma
  datasource: {
    url: process.env.DATABASE_URL!,
  },

  // Use DIRECT_URL for migrate when available (recommended for Supabase)
  migrate: {
    datasourceUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
})
