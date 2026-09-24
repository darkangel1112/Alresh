import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/felhasznalok
export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { nev: 'asc' } })
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Hiba' }, { status: 500 })
  }
}

// POST /api/felhasznalok – új felhasználó
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nev, email, szerepkor } = body
    if (!nev?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Név és e-mail kötelező' }, { status: 400 })
    }
    const user = await prisma.user.create({
      data: { nev: nev.trim(), email: email.trim().toLowerCase(), szerepkor: szerepkor ?? 'munkatars' },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Hiba'
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Ez az e-mail cím már foglalt' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Hiba a felhasználó létrehozásánál' }, { status: 500 })
  }
}
