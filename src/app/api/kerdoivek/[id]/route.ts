import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function asJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === null) return Prisma.JsonNull
  return value as Prisma.InputJsonValue
}

// GET /api/kerdoivek/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const survey = await prisma.survey.findUnique({
      where: { id: parseInt(id) },
      include: { partner: true, feltolto: true, telephelyek: { orderBy: { sorszam: 'asc' } } },
    })
    if (!survey) return NextResponse.json({ error: 'Nem található' }, { status: 404 })
    return NextResponse.json({ ...survey, adatok: survey.torzs })
  } catch {
    return NextResponse.json({ error: 'Hiba' }, { status: 500 })
  }
}

// PATCH /api/kerdoivek/[id] – adatok mentése
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const surveyId = Number(id)
  if (!Number.isInteger(surveyId) || surveyId <= 0) {
    return NextResponse.json({ error: 'Érvénytelen kérdőív-azonosító' }, { status: 400 })
  }
  try {
    const body = await req.json()
    const current = await prisma.survey.findUnique({
      where: { id: surveyId },
      select: { id: true, tipus: true },
    })
    if (!current) return NextResponse.json({ error: 'Nem található' }, { status: 404 })

    const data: Prisma.SurveyUpdateInput = { modositva: new Date() }
    if (body.allapot !== undefined) {
      if (!['FOLYAMATBAN', 'KESZ', 'ARCHIVALT'].includes(body.allapot)) {
        return NextResponse.json({ error: 'Érvénytelen állapot' }, { status: 400 })
      }
      data.allapot = body.allapot
    }
    if (body.torzs !== undefined) data.torzs = asJson(body.torzs)
    else if (body.adatok !== undefined) {
      let legacyData: unknown = body.adatok
      if (typeof legacyData === 'string') {
        try { legacyData = JSON.parse(legacyData) as unknown } catch {
          return NextResponse.json({ error: 'A mentendő adat hibás JSON formátumú' }, { status: 400 })
        }
      }
      data.torzs = asJson(legacyData)
    }
    if (body.lehalaszasVallalkozas !== undefined) data.lehalaszasVallalkozas = asJson(body.lehalaszasVallalkozas)

    if (body.telephelyek !== undefined) {
      if (!Array.isArray(body.telephelyek) || body.telephelyek.length === 0) {
        return NextResponse.json({ error: 'Legalább egy telephely szükséges' }, { status: 400 })
      }
      const incoming = body.telephelyek as Array<Record<string, unknown>>
      const normalized = incoming.map((site, index) => {
        const siteId = site.id === undefined ? undefined : Number(site.id)
        const name = typeof site.nev === 'string' ? site.nev.trim() : ''
        if ((siteId !== undefined && (!Number.isInteger(siteId) || siteId <= 0)) || !name) {
          throw new Error(`A(z) ${index + 1}. telephely adatai érvénytelenek.`)
        }
        return {
          id: siteId,
          sorszam: index + 1,
          nev: name,
          telepiAdat: site.telepiAdat === undefined ? undefined : asJson(site.telepiAdat),
          allomanyvaltozas: site.allomanyvaltozas === undefined ? undefined : asJson(site.allomanyvaltozas),
        }
      })
      const ids = normalized.flatMap(site => site.id === undefined ? [] : [site.id])
      if (new Set(ids).size !== ids.length) {
        return NextResponse.json({ error: 'Ugyanaz a telephely többször szerepel.' }, { status: 400 })
      }
      const existing = await prisma.telephely.findMany({
        where: { surveyId },
        select: { id: true },
      })
      const existingIds = new Set(existing.map(site => site.id))
      if (ids.some(siteId => !existingIds.has(siteId))) {
        return NextResponse.json({ error: 'A telephely nem ehhez a kérdőívhez tartozik.' }, { status: 400 })
      }

      const savedSurvey = await prisma.$transaction(async tx => {
        await tx.survey.update({ where: { id: surveyId }, data })
        await tx.telephely.deleteMany({
          where: { surveyId, ...(ids.length ? { id: { notIn: ids } } : {}) },
        })
        const retained = normalized.filter(site => site.id !== undefined)
        for (const site of retained) {
          await tx.telephely.update({ where: { id: site.id }, data: { sorszam: -site.id! } })
        }
        for (const site of normalized) {
          const siteData = {
            sorszam: site.sorszam,
            nev: site.nev,
            ...(site.telepiAdat !== undefined ? { telepiAdat: site.telepiAdat } : {}),
            ...(site.allomanyvaltozas !== undefined ? { allomanyvaltozas: site.allomanyvaltozas } : {}),
          }
          if (site.id !== undefined) {
            await tx.telephely.update({ where: { id: site.id }, data: siteData })
          } else {
            await tx.telephely.create({ data: { surveyId, ...siteData } })
          }
        }
        return tx.survey.findUniqueOrThrow({
          where: { id: surveyId },
          include: { telephelyek: { orderBy: { sorszam: 'asc' } } },
        })
      })
      return NextResponse.json(savedSurvey)
    }

    const survey = await prisma.survey.update({ where: { id: surveyId }, data })
    return NextResponse.json(survey)
  } catch (error) {
    if (error instanceof Error && !('code' in error)) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Hiba a mentésnél' }, { status: 500 })
  }
}

// DELETE /api/kerdoivek/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.survey.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Hiba' }, { status: 500 })
  }
}
