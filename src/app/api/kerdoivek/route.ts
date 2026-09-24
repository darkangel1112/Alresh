import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/kerdoivek – lista
export async function GET() {
  try {
    const surveys = await prisma.survey.findMany({
      orderBy: [{ ev: 'desc' }, { letrehozva: 'desc' }],
      include: { partner: true, feltolto: true },
    })
    return NextResponse.json(surveys)
  } catch {
    return NextResponse.json({ error: 'Hiba a lekérésénél' }, { status: 500 })
  }
}

// POST /api/kerdoivek – új kitöltés
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { partnerId, ev, tipus } = body
    const userId = body.userId ?? body.feltoltoId
    const parsedPartnerId = Number(partnerId)
    const parsedYear = Number(ev)
    const parsedUserId = Number(userId)

    if (!Number.isInteger(parsedPartnerId) || parsedPartnerId <= 0 || !Number.isInteger(parsedYear) ||
      parsedYear < 1900 || parsedYear > 2200 || !['EXTENSIV', 'INTENZIV'].includes(tipus) ||
      !Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      return NextResponse.json({ error: 'Kötelező mezők hiányoznak' }, { status: 400 })
    }

    // Ellenőrzés: létezik-e már ez az év+partner+típus kombináció
    const meglevo = await prisma.survey.findFirst({
      where: { partnerId: parsedPartnerId, ev: parsedYear, tipus },
    })
    if (meglevo) {
      return NextResponse.json(
        { error: `Már létezik ${ev}. évi ${tipus === 'EXTENSIV' ? 'extenzív' : 'intenzív'} kitöltés ennél a partnernél.` },
        { status: 409 }
      )
    }

    const survey = await prisma.survey.create({
      data: {
        partnerId: parsedPartnerId,
        ev: parsedYear,
        tipus,
        userId: parsedUserId,
        allapot: 'FOLYAMATBAN',
        telephelyek: {
          create: {
            sorszam: 1,
            nev: 'Telephely 1',
          },
        },
      },
      include: { partner: true, telephelyek: true },
    })
    return NextResponse.json(survey, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Hiba a létrehozásnál' }, { status: 500 })
  }
}
