import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import KerdoivKitolto from '@/components/KerdoivKitolto'
import ExtensiveSurveyForm from '@/components/ExtensiveSurveyForm'
import IntensiveSurveyForm from '@/components/IntensiveSurveyForm'

export default async function KerdoivDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const survey = await prisma.survey.findUnique({
    where: { id: parseInt(id) },
    include: { partner: true, feltolto: true, telephelyek: { orderBy: { sorszam: 'asc' } } },
  })

  if (!survey) notFound()

  if (survey.tipus === 'EXTENSIV') return <ExtensiveSurveyForm survey={survey} />
  if (survey.tipus === 'INTENZIV') return <IntensiveSurveyForm survey={survey} />
  return <KerdoivKitolto surveyId={survey.id} />
}
