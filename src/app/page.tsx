import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function Dashboard() {
  // Adatok lekérése
  const [partnerCount, surveyCount, surveys] = await Promise.all([
    prisma.partner.count(),
    prisma.survey.count(),
    prisma.survey.findMany({
      take: 8,
      orderBy: { modositva: 'desc' },
      include: { partner: true, feltolto: true },
    }),
  ])

  const folyamatban = await prisma.survey.count({ where: { allapot: 'FOLYAMATBAN' } })
  const kesz = await prisma.survey.count({ where: { allapot: 'KESZ' } })

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <div className="header-actions">
          <span className="header-clock">2024 · DCF3</span>
          <Link href="/kerdoivek/uj" className="btn btn-primary btn-sm">
            + Új kitöltés
          </Link>
        </div>
      </div>

      <div className="page-body">
        {/* Stat kártyák */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Partnerek</div>
            <div className="stat-value accent">{partnerCount}</div>
            <div className="stat-change">Regisztrált gazdaság</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Összes kitöltés</div>
            <div className="stat-value blue">{surveyCount}</div>
            <div className="stat-change">Minden év, minden típus</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Folyamatban</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{folyamatban}</div>
            <div className="stat-change">Befejezetlen kitöltés</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Lezárt</div>
            <div className="stat-value green">{kesz}</div>
            <div className="stat-change">Kész, PDF exportálható</div>
          </div>
        </div>

        {/* Legutóbbi kitöltések */}
        <div className="card">
          <div className="card-header">
            <h3>Legutóbbi kitöltések</h3>
            <Link href="/kerdoivek" className="btn btn-ghost btn-sm">
              Összes megtekintése →
            </Link>
          </div>

          {surveys.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Még nincs kitöltés</h3>
              <p>Hozz létre egy új kitöltést egy partner kiválasztásával és az adatok megadásával.</p>
              <Link href="/kerdoivek/uj" className="btn btn-primary">
                + Első kitöltés létrehozása
              </Link>
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
                  {surveys.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {s.partner.nev}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{s.ev}</td>
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
                          {s.allapot === 'KESZ' ? 'Kész' :
                           s.allapot === 'FOLYAMATBAN' ? 'Folyamatban' : 'Archivált'}
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

        {/* Gyors műveletek */}
        <div className="form-grid form-grid-2" style={{ marginTop: 16 }}>
          <Link href="/kerdoivek/uj?tipus=EXTENSIV" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44,
                  background: 'var(--ext-bg)',
                  border: '1px solid var(--ext-border)',
                  borderRadius: 'var(--radius)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0
                }}>🌿</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                    Új extenzív kitöltés
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Tógazdálkodás – ponty + társhalak
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/kerdoivek/uj?tipus=INTENZIV" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44,
                  background: 'var(--int-bg)',
                  border: '1px solid var(--int-border)',
                  borderRadius: 'var(--radius)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0
                }}>🐠</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                    Új intenzív kitöltés
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Afrikai harcsa – zárt rendszerű termelés
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}
