'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { appPath } from '@/lib/app-path'

type Partner = { id: number; nev: string; szekhely: string | null }
type User = { id: number; nev: string; szerepkor: string }

const AKTUALIS_EV = new Date().getFullYear()
const EVEK = Array.from({ length: 10 }, (_, i) => AKTUALIS_EV - i)

function UjKerdoivForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipusParam = searchParams.get('tipus') as 'EXTENSIV' | 'INTENZIV' | null

  const [partnerek, setPartnerek] = useState<Partner[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const [form, setForm] = useState({
    partnerId: '',
    ev: String(AKTUALIS_EV - 1),  // jellemzően az előző év adata
    tipus: tipusParam ?? 'EXTENSIV',
    feltoltoId: '',
  })

  useEffect(() => {
    Promise.all([
      fetch(appPath('/api/partnerek')).then(r => r.json()),
      fetch(appPath('/api/felhasznalok')).then(r => r.json()),
    ]).then(([p, u]) => {
      setPartnerek(p)
      setUsers(u)
      if (u.length === 1) setForm(f => ({ ...f, feltoltoId: String(u[0].id) }))
      setLoading(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!form.partnerId) { setErr('Válassz partnert!'); return }
    if (!form.feltoltoId) { setErr('Válassz feltöltőt!'); return }

    setSaving(true)
    try {
      const res = await fetch(appPath('/api/kerdoivek'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: parseInt(form.partnerId),
          ev: parseInt(form.ev),
          tipus: form.tipus,
          feltoltoId: parseInt(form.feltoltoId),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error); return }
      router.push(`/kerdoivek/${data.id}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-icon" style={{ animation: 'spin 1s linear infinite' }}>⟳</div>
        <p>Betöltés...</p>
      </div>
    )
  }

  if (partnerek.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏢</div>
        <h3>Nincs partner</h3>
        <p>Először regisztrálj legalább egy partnert, majd térj vissza ide.</p>
        <Link href="/partnerek" className="btn btn-primary">Partnerek kezelése</Link>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👤</div>
        <h3>Nincs felhasználó</h3>
        <p>Először hozz létre legalább egy felhasználót (feltöltő).</p>
        <Link href="/felhasznalok" className="btn btn-primary">Felhasználók kezelése</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="page-body" style={{ maxWidth: 680 }}>
        {err && <div className="alert alert-danger" style={{ marginBottom: 20 }}>⚠ {err}</div>}

        {/* Típus választó */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3>Kérdőív típusa</h3></div>
          <div className="card-body">
            <div className="form-grid form-grid-2">
              {(['EXTENSIV', 'INTENZIV'] as const).map(t => (
                <label
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '16px',
                    borderRadius: 'var(--radius)',
                    border: `2px solid ${form.tipus === t
                      ? (t === 'EXTENSIV' ? 'var(--ext-color)' : 'var(--int-color)')
                      : 'var(--border)'}`,
                    background: form.tipus === t
                      ? (t === 'EXTENSIV' ? 'var(--ext-bg)' : 'var(--int-bg)')
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                  }}
                >
                  <input
                    type="radio"
                    name="tipus"
                    value={t}
                    checked={form.tipus === t}
                    onChange={() => setForm(f => ({ ...f, tipus: t }))}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: 28 }}>{t === 'EXTENSIV' ? '🌿' : '🐠'}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {t === 'EXTENSIV' ? 'Extenzív – Tógazdálkodás' : 'Intenzív – Afrikai harcsa'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {t === 'EXTENSIV'
                        ? 'Ponty, dévérkeszeg, csuka, fogassüllő, amúr, busa'
                        : 'Intenzív rendszer – zárt tartás, takarmányozás'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Partner és év */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3>Partner és referencia év</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Partner <span className="required">*</span></label>
              <select
                className="form-select"
                value={form.partnerId}
                onChange={e => setForm(f => ({ ...f, partnerId: e.target.value }))}
                required
              >
                <option value="">— Válassz partnert —</option>
                {partnerek.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nev}{p.szekhely ? ` – ${p.szekhely}` : ''}
                  </option>
                ))}
              </select>
              <p className="form-hint">
                Nincs a listán? <Link href="/partnerek">Hozz létre új partnert →</Link>
              </p>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Referencia év <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={form.ev}
                  onChange={e => setForm(f => ({ ...f, ev: e.target.value }))}
                >
                  {EVEK.map(ev => (
                    <option key={ev} value={ev}>{ev}</option>
                  ))}
                </select>
                <p className="form-hint">Az adatgyűjtés melyik évre vonatkozik?</p>
              </div>
              <div className="form-group">
                <label className="form-label">Feltöltő <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={form.feltoltoId}
                  onChange={e => setForm(f => ({ ...f, feltoltoId: e.target.value }))}
                  required
                >
                  <option value="">— Válassz —</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.nev}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Összefoglaló + Mentés */}
        {form.partnerId && form.feltoltoId && (
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            📋 Létrehozás után megnyílik a kitöltő felület:{' '}
            <strong>
              {partnerek.find(p => p.id === parseInt(form.partnerId))?.nev} · {form.ev} · {form.tipus === 'EXTENSIV' ? 'Extenzív' : 'Intenzív'}
            </strong>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/kerdoivek" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            ← Vissza
          </Link>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ flex: 2 }}>
            {saving ? '⟳ Létrehozás...' : '✓ Kitöltés megkezdése'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default function UjKerdoivPage() {
  return (
    <>
      <div className="page-header">
        <h2>Új kitöltés</h2>
        <div className="header-actions">
          <Link href="/kerdoivek" className="btn btn-ghost btn-sm">← Vissza</Link>
        </div>
      </div>
      <Suspense fallback={<div className="page-body"><p>Betöltés...</p></div>}>
        <UjKerdoivForm />
      </Suspense>
    </>
  )
}
