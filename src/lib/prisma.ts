import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // PrismaLibSql egy FACTORY – a createClient configját várja, nem kész klienst!
  // Windows-kompatibilis abszolút SQLite útvonal
  const absPath = path.resolve(process.cwd(), 'prisma', 'dev.db')
  const dbUrl = `file:${absPath.replace(/\\/g, '/')}`

  console.log('[Prisma] Connecting to:', dbUrl)

  // Helyes használat: new PrismaLibSql({ url }) – nem createClient() eredménye!
  const adapter = new PrismaLibSql({ url: dbUrl })

  return new PrismaClient({
    adapter,
    log: ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
