'use client'

import { useState, useEffect } from 'react'
import { useConfirmDialog } from '@/components/ConfirmDialog'
import { appPath } from '@/lib/app-path'

type Partner = {
  id: number
  nev: string
  szekhely: string | null
  telefonszam: string | null
  email: string | null
  statisztikai_szamjel: string | null
  mak_azonosito: string | null
  megjegyzes: string | null
  _count?: { surveys: number }
}

export default function PartnerekPage() {
  const { requestConfirmation, dialog } = useConfirmDialog()
  const [partnerek, setPartnerek] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [keres, setKeres] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nev: '', szekhely: '', telefonszam: '', email: '',
    statisztikai_szamjel: '', mak_azonosito: '', megjegyzes: '',
  })

  async function fetchPartnerek() {
    setLoading(true)
    const res = await fetch(appPath('/api/partnerek'))
    const data = await res.json()
    setPartnerek(data)
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    fetch(appPath('/api/partnerek'))
      .then(response => {
        if (!response.ok) throw new Error('A partnerek nem tölthetők be.')
        return response.json()
      })
      .then(data => { if (active) setPartnerek(data) })
      .catch(caught => { if (active) setError(caught instanceof Error ? caught.message : 'Betöltési hiba.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(appPath(editId === null ? '/api/partnerek' : `/api/partnerek/${editId}`), {
        method: editId === null ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Nem sikerült menteni a partnert.')
      setModal(false)
      setEditId(null)
      setForm({ nev: '', szekhely: '', telefonszam: '', email: '', statisztikai_szamjel: '', mak_azonosito: '', megjegyzes: '' })
      await fetchPartnerek()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Hiba történt a partner mentésekor.')
    } finally {
      setSaving(false)
    }
  }

  function openCreate() {
    setError('')
    setEditId(null)
    setForm({ nev: '', szekhely: '', telefonszam: '', email: '', statisztikai_szamjel: '', mak_azonosito: '', megjegyzes: '' })
    setModal(true)
  }

  function openEdit(partner: Partner) {
    setError('')
    setEditId(partner.id)
    setForm({
      nev: partner.nev,
      szekhely: partner.szekhely ?? '',
      telefonszam: partner.telefonszam ?? '',
      email: partner.email ?? '',
      statisztikai_szamjel: partner.statisztikai_szamjel ?? '',
      mak_azonosito: partner.mak_azonosito ?? '',
      megjegyzes: partner.megjegyzes ?? '',
    })
    setModal(true)
  }

  async function handleDelete(id: number, nev: string) {
    setError('')
    const confirmed = await requestConfirmation({
      title: 'Partner törlése',
      message: `Biztosan törlöd ezt a partnert: ${nev}?`,
      detail: 'A művelet nem vonható vissza.',
      confirmLabel: 'Partner törlése',
    })
    if (!confirmed) return
    const response = await fetch(appPath(`/api/partnerek/${id}`), { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error ?? 'Nem sikerült törölni a partnert.')
      return
    }
    await fetchPartnerek()
  }

  const szurt = partnerek.filter(p =>
    p.nev.toLowerCase().includes(keres.toLowerCase()) ||
    (p.szekhely ?? '').toLowerCase().includes(keres.toLowerCase())
  )

  return (
    <>
      {dialog}
      <div className="page-header">
        <h2>Partnerek</h2>
        <div className="header-actions">
          <span className="header-clock">{partnerek.length} partner</span>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            + Új partner
          </button>
        </div>
      </div>

      <div className="page-body">
        {error && <div className="alert alert-danger">⚠ {error}</div>}
        {/* Keresés */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍  Keresés név, székhely alapján..."
            value={keres}
            onChange={e => setKeres(e.target.value)}
          />
        </div>

        <div className="card">
          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⟳</div>
              <p>Betöltés...</p>
            </div>
          ) : szurt.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <h3>{keres ? 'Nincs találat' : 'Még nincs partner'}</h3>
              <p>{keres ? 'Próbálj más keresési feltételt.' : 'Adj hozzá egy partnert az adatgyűjtés megkezdéséhez.'}</p>
              {!keres && <button className="btn btn-primary" onClick={openCreate}>+ Első partner hozzáadása</button>}
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cégnév</th>
                    <th>Székhely</th>
                    <th>E-mail</th>
                    <th>Stat. számjel</th>
                    <th>MÁK azonosító</th>
                    <th>Kitöltések</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {szurt.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.nev}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.szekhely ?? '–'}</td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {p.email ?? '–'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.statisztikai_szamjel ?? '–'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.mak_azonosito ?? '–'}
                      </td>
                      <td>
                        <span className="badge badge-info">{p._count?.surveys ?? 0} db</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Partner adatainak módosítása"
                            onClick={() => openEdit(p)}
                          >
                            ✎
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            title={p._count?.surveys ? 'A partnerhez kitöltések tartoznak, ezért nem törölhető.' : 'Partner törlése'}
                            onClick={() => handleDelete(p.id, p.nev)}
                            disabled={(p._count?.surveys ?? 0) > 0}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Új partner modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId === null ? 'Új partner hozzáadása' : 'Partner adatainak módosítása'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => { setModal(false); setError('') }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">⚠ {error}</div>}
                <div className="form-group">
                  <label className="form-label">Cégnév / Termelő neve <span className="required">*</span></label>
                  <input
                    className="form-input"
                    value={form.nev}
                    onChange={e => setForm(f => ({ ...f, nev: e.target.value }))}
                    placeholder="pl. Hortobágyi Halgazdaság Kft."
                    required
                  />
                </div>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Székhely</label>
                    <input className="form-input" value={form.szekhely} onChange={e => setForm(f => ({ ...f, szekhely: e.target.value }))} placeholder="Város, utca" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefon</label>
                    <input className="form-input" value={form.telefonszam} onChange={e => setForm(f => ({ ...f, telefonszam: e.target.value }))} placeholder="+36 ..." />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ceg@example.hu" />
                </div>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Statisztikai számjel</label>
                    <input className="form-input" value={form.statisztikai_szamjel} onChange={e => setForm(f => ({ ...f, statisztikai_szamjel: e.target.value }))} placeholder="8 jegy" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MÁK azonosító</label>
                    <input className="form-input" value={form.mak_azonosito} onChange={e => setForm(f => ({ ...f, mak_azonosito: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Megjegyzés</label>
                  <textarea className="form-textarea" value={form.megjegyzes} onChange={e => setForm(f => ({ ...f, megjegyzes: e.target.value }))} rows={2} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setModal(false); setError('') }}>Mégse</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⟳ Mentés...' : editId === null ? '✓ Partner létrehozása' : '✓ Partner módosításainak mentése'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
