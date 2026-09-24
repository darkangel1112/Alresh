'use client'

import { useState, useEffect } from 'react'
import { appPath } from '@/lib/app-path'

type User = { id: number; nev: string; email: string; szerepkor: string; letrehozva: string }

export default function FelhasznalokPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nev: '', email: '', szerepkor: 'munkatars' })
  const [err, setErr] = useState('')

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch(appPath('/api/felhasznalok'))
    setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr('')
    try {
      const res = await fetch(appPath('/api/felhasznalok'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error); return }
      setModal(false)
      setForm({ nev: '', email: '', szerepkor: 'munkatars' })
      fetchUsers()
    } finally {
      setSaving(false)
    }
  }

  const szerepkorLabel = (r: string) => r === 'admin' ? 'Adminisztrátor' : 'Munkatárs'

  return (
    <>
      <div className="page-header">
        <h2>Felhasználók</h2>
        <div className="header-actions">
          <span className="header-clock">{users.length} felhasználó</span>
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
            + Új felhasználó
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          ℹ️ Jelszavas védelem nincs aktiválva. A felhasználókat névválasztással azonosítja a rendszer.
          A jelszó mező készen áll a jövőbeli aktiválásra.
        </div>

        <div className="card">
          {loading ? (
            <div className="empty-state"><p>Betöltés...</p></div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Még nincs felhasználó</h3>
              <p>Hozz létre felhasználókat a kitöltések nyomon követéséhez.</p>
              <button className="btn btn-primary" onClick={() => setModal(true)}>+ Első felhasználó</button>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Név</th>
                    <th>E-mail</th>
                    <th>Szerepkör</th>
                    <th>Létrehozva</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                            {u.nev.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.nev}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.szerepkor === 'admin' ? 'badge-success' : 'badge-info'}`}>
                          {szerepkorLabel(u.szerepkor)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {new Date(u.letrehozva).toLocaleDateString('hu-HU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Új felhasználó</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {err && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠ {err}</div>}
                <div className="form-group">
                  <label className="form-label">Teljes név <span className="required">*</span></label>
                  <input className="form-input" value={form.nev} onChange={e => setForm(f => ({...f, nev: e.target.value}))} placeholder="pl. Kiss János" required />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail <span className="required">*</span></label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="nev@aki.gov.hu" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Szerepkör</label>
                  <select className="form-select" value={form.szerepkor} onChange={e => setForm(f => ({...f, szerepkor: e.target.value}))}>
                    <option value="munkatars">Munkatárs</option>
                    <option value="admin">Adminisztrátor</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Mégse</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⟳' : '✓'} Létrehozás
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
