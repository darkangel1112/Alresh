import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/partnerek – lista
export async function GET() {
  try {
    const partnerek = await prisma.partner.findMany({
      orderBy: { nev: 'asc' },
      include: { _count: { select: { surveys: true } } },
    })
    return NextResponse.json(partnerek)
  } catch (e) {
    return NextResponse.json({ error: 'Hiba a partnerek lekérésénél' }, { status: 500 })
  }
}

// POST /api/partnerek – új partner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nev, szekhely, telefonszam, email, statisztikai_szamjel, mak_azonosito, megjegyzes } = body

    if (!nev?.trim()) {
      return NextResponse.json({ error: 'A partner neve kötelező' }, { status: 400 })
    }

    const partner = await prisma.partner.create({
      data: { nev: nev.trim(), szekhely, telefonszam, email, statisztikai_szamjel, mak_azonosito, megjegyzes },
    })
    return NextResponse.json(partner, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Hiba a partner létrehozásánál' }, { status: 500 })
  }
}
