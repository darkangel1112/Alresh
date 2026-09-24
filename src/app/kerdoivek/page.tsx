import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function KerdoivekPage() {
  const [surveys, partnerCount] = await Promise.all([
    prisma.survey.findMany({
      orderBy: [{ ev: 'desc' }, { letrehozva: 'desc' }],
      include: { partner: true, feltolto: true },
    }),
    prisma.partner.count(),
  ])

  const extensiv = surveys.filter(s => s.tipus === 'EXTENSIV').length
  const intenziv = surveys.filter(s => s.tipus === 'INTENZIV').length
  const folyamatban = surveys.filter(s => s.allapot === 'FOLYAMATBAN').length

  return (
    <>
      <div className="page-header">
        <h2>Kitöltések</h2>
        <div className="header-actions">
          <span className="header-clock">{surveys.length} kitöltés</span>
          <Link href="/kerdoivek/uj?tipus=EXTENSIV" className="btn btn-secondary btn-sm">
            🌿 Új extenzív
          </Link>
          <Link href="/kerdoivek/uj?tipus=INTENZIV" className="btn btn-primary btn-sm">
            🐠 Új intenzív
          </Link>
        </div>
      </div>

      <div className="page-body">
        {/* Statisztika */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Extenzív kitöltés</div>
            <div className="stat-value blue">{extensiv}</div>
            <div className="stat-change">Tógazdálkodás</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Intenzív kitöltés</div>
            <div className="stat-value green">{intenziv}</div>
            <div className="stat-change">Afrikai harcsa</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Folyamatban</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{folyamatban}</div>
            <div className="stat-change">Befejezetlen</div>
          </div>
        </div>

        {/* Lista */}
        <div className="card">
          {surveys.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Még nincs kitöltés</h3>
              <p>
                {partnerCount === 0
                  ? 'Először adj hozzá partnert, majd kezdj kitöltést.'
                  : 'Indíts egy új kitöltést egy partner kiválasztásával.'}
              </p>
              {partnerCount === 0 ? (
                <Link href="/partnerek" className="btn btn-primary">Partnerek kezelése</Link>
              ) : (
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Link href="/kerdoivek/uj?tipus=EXTENSIV" className="btn btn-secondary">🌿 Extenzív kitöltés</Link>
                  <Link href="/kerdoivek/uj?tipus=INTENZIV" className="btn btn-primary">🐠 Intenzív kitöltés</Link>
                </div>
              )}
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>Év</th>
                    <th>Típus</th>
                    <th>Állapot</th>
                    <th>Feltöltő</th>
                    <th>Módosítva</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.partner.nev}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.ev}</td>
                      <td>
                        <span className={`badge badge-${s.tipus === 'EXTENSIV' ? 'ext' : 'int'}`}>
                          {s.tipus === 'EXTENSIV' ? '🌿 Extenzív' : '🐠 Intenzív'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          s.allapot === 'KESZ' ? 'badge-success' :
                          s.allapot === 'FOLYAMATBAN' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {s.allapot === 'KESZ' ? '✓ Kész' :
                           s.allapot === 'FOLYAMATBAN' ? '⏳ Folyamatban' : '📁 Archivált'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{s.feltolto.nev}</td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {new Date(s.modositva).toLocaleDateString('hu-HU')}
                      </td>
                      <td>
                        <Link href={`/kerdoivek/${s.id}`} className="btn btn-ghost btn-sm">
                          Megnyitás →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
