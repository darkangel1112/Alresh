import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/partnerek/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: parseInt(id) },
      include: { surveys: { include: { feltolto: true }, orderBy: { ev: 'desc' } } },
    })
    if (!partner) return NextResponse.json({ error: 'Partner nem található' }, { status: 404 })
    return NextResponse.json(partner)
  } catch {
    return NextResponse.json({ error: 'Hiba' }, { status: 500 })
  }
}

// PUT /api/partnerek/[id] – frissítés
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const partnerId = Number(id)
  if (!Number.isInteger(partnerId) || partnerId <= 0) {
    return NextResponse.json({ error: 'Érvénytelen partner-azonosító' }, { status: 400 })
  }
  try {
    const body = await req.json()
    if (typeof body.nev !== 'string' || !body.nev.trim()) {
      return NextResponse.json({ error: 'A partner neve kötelező' }, { status: 400 })
    }
    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        nev: body.nev.trim(),
        szekhely: body.szekhely?.trim() || null,
        telefonszam: body.telefonszam?.trim() || null,
        email: body.email?.trim() || null,
        statisztikai_szamjel: body.statisztikai_szamjel?.trim() || null,
        mak_azonosito: body.mak_azonosito?.trim() || null,
        megjegyzes: body.megjegyzes?.trim() || null,
      },
    })
    return NextResponse.json(partner)
  } catch {
    return NextResponse.json({ error: 'Hiba a frissítésnél' }, { status: 500 })
  }
}

// DELETE /api/partnerek/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const partnerId = Number(id)
    if (!Number.isInteger(partnerId) || partnerId <= 0) {
      return NextResponse.json({ error: 'Érvénytelen partner-azonosító' }, { status: 400 })
    }
    const surveys = await prisma.survey.count({ where: { partnerId } })
    if (surveys > 0) {
      return NextResponse.json({ error: 'A partner nem törölhető, mert kérdőívek tartoznak hozzá.' }, { status: 409 })
    }
    await prisma.partner.delete({ where: { id: partnerId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Hiba a törlésnél' }, { status: 500 })
  }
}
