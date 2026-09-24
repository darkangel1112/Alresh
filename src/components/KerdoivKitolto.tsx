'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Típusok ──────────────────────────────────────────────────────────────────
type Survey = {
  id: number
  ev: number
  tipus: 'EXTENSIV' | 'INTENZIV'
  allapot: string
  adatok: Record<string, unknown> | null
  partner: { id: number; nev: string; szekhely: string | null }
  feltolto: { nev: string }
}

// ─── Segéd: zárolt mező ───────────────────────────────────────────────────────
function LockedField({ value, unit }: { value: string | number; unit?: string }) {
  return (
    <div className="form-locked">
      <span className="lock-icon">🔒</span>
      <span>{value !== '' && value !== null && value !== undefined ? value : '—'}</span>
      {unit && <span style={{ marginLeft: 4, opacity: 0.6, fontSize: '0.78rem' }}>{unit}</span>}
    </div>
  )
}

// ─── Szám input ───────────────────────────────────────────────────────────────
function NumInput({
  label, value, onChange, unit, hint, required: req, locked,
}: {
  label: string; value: string; onChange: (v: string) => void
  unit?: string; hint?: string; required?: boolean; locked?: boolean
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{req && <span className="required"> *</span>}</label>
      {locked
        ? <LockedField value={value} unit={unit} />
        : (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="number"
              className="form-input"
              value={value}
              onChange={e => onChange(e.target.value)}
              step="any"
              style={{ textAlign: 'right' }}
            />
            {unit && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{unit}</span>}
          </div>
        )
      }
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  )
}

// ─── Szöveg input ─────────────────────────────────────────────────────────────
function TxtInput({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" value={value} onChange={e => onChange(e.target.value)} />
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  )
}

// ─── Főkomponens ─────────────────────────────────────────────────────────────
export default function KerdoivKitolto({ surveyId }: { surveyId: number }) {
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [tab, setTab] = useState(0)

  // Adatok state-je – JSON blob a DB-ben
  const [adatok, setAdatok] = useState<Record<string, string>>({})

  const set = useCallback((key: string, val: string) => {
    setAdatok(prev => ({ ...prev, [key]: val }))
    setSaved(false)
  }, [])

  const get = (key: string) => adatok[key] ?? ''

  useEffect(() => {
    fetch(`/api/kerdoivek/${surveyId}`)
      .then(r => {
        if (!r.ok) throw new Error('A kérdőív adatai nem tölthetők be.')
        return r.json()
      })
      .then(data => {
        setSurvey(data)
        if (data.adatok) {
          // JSON string → object
          const parsed = typeof data.adatok === 'string' ? JSON.parse(data.adatok) : data.adatok
          setAdatok(parsed ?? {})
        }
        setLoading(false)
      })
      .catch(error => {
        setSaveError(error instanceof Error ? error.message : 'Betöltési hiba.')
        setLoading(false)
      })
  }, [surveyId])

  async function handleSave(allapot?: string) {
    setSaving(true)
    setSaveError('')
    try {
      const body: Record<string, unknown> = { adatok: JSON.stringify(adatok) }
      if (allapot) body.allapot = allapot
      const response = await fetch(`/api/kerdoivek/${surveyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Nem sikerült menteni az adatokat.')
      setSaved(true)
      if (allapot === 'KESZ') router.push('/kerdoivek')
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Hiba történt mentés közben.')
    } finally {
      setSaving(false)
    }
  }

  // Számítások ──────────────────────────────────────────────────────────────
  function szamol_berkoltseg() {
    const brutto = parseFloat(get('berkoltseg_brutto')) || 0
    const jarul = parseFloat(get('berjarulekak')) || 0
    return (brutto + jarul).toFixed(0)
  }

  function szamol_energia() {
    const villany = parseFloat(get('villany')) || 0
    const gaz = parseFloat(get('gaz')) || 0
    const viz = parseFloat(get('viz')) || 0
    const uzemanyag = parseFloat(get('uzemanyag')) || 0
    return (villany + gaz + viz + uzemanyag).toFixed(0)
  }

  function szamol_osszes_koltseg() {
    const tetelek = [
      'halbeszerzés', 'takarmany_koltseg', 'allateg_koltseg',
      'mutokoltseg', 'berkoltseg_brutto', 'berjarulekak',
      'ertcsokk', 'egyeb_koltseg',
      'villany', 'gaz', 'viz', 'uzemanyag',
    ]
    return tetelek.reduce((sum, k) => sum + (parseFloat(get(k)) || 0), 0).toFixed(0)
  }

  function szamol_hozam_ext() {
    const tetelek = ['hozam_ponty', 'hozam_amur', 'hozam_busa', 'hozam_harcsa', 'hozam_sullo', 'hozam_csuka', 'hozam_egyeb']
    return tetelek.reduce((sum, k) => sum + (parseFloat(get(k)) || 0), 0).toFixed(0)
  }

  function szamol_bevetel_ext() {
    const halfajok = ['ponty', 'amur', 'busa', 'harcsa', 'sullo', 'csuka', 'egyeb']
    return halfajok.reduce((sum, f) => {
      const kg = parseFloat(get(`hozam_${f}`)) || 0
      const ar = parseFloat(get(`ar_${f}`)) || 0
      return sum + kg * ar
    }, 0).toFixed(0)
  }

  // ─── Tab definíciók ─────────────────────────────────────────────────────
  const extTabs = [
    { label: 'Törzsadatok', icon: '📋' },
    { label: 'Munkaerő', icon: '👷' },
    { label: 'Takarmányozás', icon: '🌾' },
    { label: 'Haltermelés', icon: '🐟' },
    { label: 'Allományváltoz.', icon: '🔄' },
    { label: 'Költségek', icon: '💰' },
    { label: 'Bevételek', icon: '📈' },
  ]
  const intTabs = [
    { label: 'Törzsadatok', icon: '📋' },
    { label: 'Munkaerő', icon: '👷' },
    { label: 'Termelési adatok', icon: '🐠' },
    { label: 'Állományváltozás', icon: '🔄' },
    { label: 'Takarmányozás', icon: '🌾' },
    { label: 'Költségek', icon: '💰' },
    { label: 'Bevételek', icon: '📈' },
  ]

  const tabs = survey?.tipus === 'EXTENSIV' ? extTabs : intTabs

  if (loading || !survey) {
    return (
      <div className="page-body">
        <div className="empty-state"><p>Betöltés...</p></div>
      </div>
    )
  }

  const isExt = survey.tipus === 'EXTENSIV'

  return (
    <>
      {/* Fejléc */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: '1rem' }}>
            {survey.partner.nev} · {survey.ev}
          </h2>
          <span className={`badge badge-${isExt ? 'ext' : 'int'}`}>
            {isExt ? '🌿 Extenzív' : '🐠 Intenzív'}
          </span>
          <span className={`badge ${
            survey.allapot === 'KESZ' ? 'badge-success' :
            survey.allapot === 'FOLYAMATBAN' ? 'badge-warning' : 'badge-info'
          }`}>
            {survey.allapot === 'KESZ' ? '✓ Kész' : '⏳ Folyamatban'}
          </span>
        </div>
        <div className="header-actions">
          {saved && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>✓ Mentve</span>}
          <button className="btn btn-secondary btn-sm" onClick={() => handleSave()} disabled={saving}>
            {saving ? '⟳' : '💾'} Mentés
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleSave('KESZ')} disabled={saving}>
            ✓ Lezárás
          </button>
          <Link href="/kerdoivek" className="btn btn-ghost btn-sm">← Vissza</Link>
        </div>
      </div>

      {/* Tab navigáció */}
      <div style={{ padding: '0 32px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          {tabs.map((t, i) => (
            <button
              key={i}
              className={`tab-btn ${tab === i ? 'active' : ''}`}
              onClick={() => setTab(i)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tartalom */}
      <div className="page-body">
        {saveError && <div className="alert alert-danger">⚠ {saveError}</div>}
        {isExt ? <ExtTabok tab={tab} get={get} set={set} szamol={{ szamol_berkoltseg, szamol_energia, szamol_osszes_koltseg, szamol_hozam_ext, szamol_bevetel_ext }} /> : <IntTabok tab={tab} get={get} set={set} szamol={{ szamol_berkoltseg, szamol_energia, szamol_osszes_koltseg }} />}

        {/* Mentés gomb alul is */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-secondary" onClick={() => setTab(Math.max(0, tab - 1))} disabled={tab === 0}>← Előző</button>
          <button className="btn btn-secondary" onClick={() => handleSave()} disabled={saving} style={{ marginLeft: 'auto' }}>
            {saving ? '⟳ Mentés...' : '💾 Mentés'}
          </button>
          {tab < tabs.length - 1 && (
            <button className="btn btn-primary" onClick={() => { handleSave(); setTab(tab + 1) }}>
              Következő →
            </button>
          )}
          {tab === tabs.length - 1 && (
            <button className="btn btn-primary" onClick={() => handleSave('KESZ')} disabled={saving}>
              ✓ Kitöltés lezárása
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTENZÍV TABLAPOK
// ═══════════════════════════════════════════════════════════════════════════════
function ExtTabok({ tab, get, set, szamol }: {
  tab: number
  get: (k: string) => string
  set: (k: string, v: string) => void
  szamol: Record<string, () => string>
}) {
  if (tab === 0) return <ExtTorzs get={get} set={set} />
  if (tab === 1) return <ExtMunkaero get={get} set={set} />
  if (tab === 2) return <ExtTakarmany get={get} set={set} />
  if (tab === 3) return <ExtHaltermes get={get} set={set} szamol={szamol} />
  if (tab === 4) return <ExtAllomany get={get} set={set} />
  if (tab === 5) return <ExtKoltsegek get={get} set={set} szamol={szamol} />
  if (tab === 6) return <ExtBevetelek get={get} set={set} szamol={szamol} />
  return null
}

// ─── Ext Tab 0: Törzsadatok ───────────────────────────────────────────────────
function ExtTorzs({ get, set }: { get: (k: string) => string; set: (k: string, v: string) => void }) {
  return (
    <div className="card">
      <div className="card-header"><h3>I. Törzsadatok – Ökonómia</h3></div>
      <div className="card-body">
        <div className="section-title" style={{ marginBottom: 16 }}>
          <span className="section-icon">🏭</span> Telephely adatok
        </div>
        <div className="form-grid form-grid-2">
          <TxtInput label="Telephely neve / azonosítója" value={get('telephely_nev')} onChange={v => set('telephely_nev', v)} />
          <div className="form-group">
            <label className="form-label">Halastó típusa</label>
            <select className="form-select" value={get('to_tipus')} onChange={e => set('to_tipus', e.target.value)}>
              <option value="">— Válassz —</option>
              <option value="kortoltes">Körтöltéses</option>
              <option value="volgyezo">Völgyzárógtátas</option>
              <option value="hossztoltes">Hossztöltéses</option>
              <option value="egyeb">Egyéb</option>
            </select>
          </div>
        </div>
        <div className="form-grid form-grid-3">
          <NumInput label="Teljes tóterület" value={get('to_terulet_teljes')} onChange={v => set('to_terulet_teljes', v)} unit="ha" />
          <NumInput label="Üzemelt tóterület" value={get('to_terulet_uzemelt')} onChange={v => set('to_terulet_uzemelt', v)} unit="ha" />
          <NumInput label="Átlagmélység" value={get('to_melyseg')} onChange={v => set('to_melyseg', v)} unit="m" />
        </div>
        <div className="form-grid form-grid-2">
          <NumInput label="Nádas/sás arány" value={get('nadas_arany')} onChange={v => set('nadas_arany', v)} unit="%" hint="A tóterület %-ában" />
          <NumInput label="Halastói vízfelszín" value={get('vizfelszin')} onChange={v => set('vizfelszin', v)} unit="ha" />
        </div>

        <div className="divider" />
        <div className="section-title" style={{ marginBottom: 16 }}>
          <span className="section-icon">📊</span> Egyéb vállalkozási adatok
        </div>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Kereskedelem</label>
            <select className="form-select" value={get('kereskedelem')} onChange={e => set('kereskedelem', e.target.value)}>
              <option value="">— Válassz —</option>
              <option value="igen">Van</option>
              <option value="nem">Nincs</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Keltetőház</label>
            <select className="form-select" value={get('kelteto')} onChange={e => set('kelteto', e.target.value)}>
              <option value="">— Válassz —</option>
              <option value="igen">Van</option>
              <option value="nem">Nincs</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Megjegyzés</label>
          <textarea className="form-textarea" value={get('torzs_megjegyzes')} onChange={e => set('torzs_megjegyzes', e.target.value)} rows={3} />
        </div>
      </div>
    </div>
  )
}

// ─── Ext Tab 1: Munkaerő ──────────────────────────────────────────────────────
function ExtMunkaero({ get, set }: { get: (k: string) => string; set: (k: string, v: string) => void }) {
  const kategoriák = [
    { key: 'foallass', label: 'Főállású' },
    { key: 'reszmunkado_6h', label: 'Részmunkaidő (6 óra/nap)' },
    { key: 'reszmunkado_4h', label: 'Részmunkaidő (4 óra/nap)' },
    { key: 'segito_csalad', label: 'Segítő családtag' },
  ]
  return (
    <div className="card">
      <div className="card-header"><h3>Munkaerő – Telephely</h3></div>
      <div className="card-body">
        <p className="form-hint" style={{ marginBottom: 20 }}>
          Főállás = 2000 óra/év · Részmunkaidő 6h = 1500 óra/év · Részmunkaidő 4h = 1000 óra/év
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kategória</th>
                <th>Tógazdálkodás (fő)</th>
                <th>Egyéb ágazat (fő)</th>
                <th>Közp. irányítás (%)</th>
              </tr>
            </thead>
            <tbody>
              {kategoriák.map(k => (
                <tr key={k.key}>
                  <td style={{ color: 'var(--text-secondary)' }}>{k.label}</td>
                  <td><input type="number" className="table-input" value={get(`me_${k.key}_togaz`)} onChange={e => set(`me_${k.key}_togaz`, e.target.value)} step="0.1" /></td>
                  <td><input type="number" className="table-input" value={get(`me_${k.key}_egyeb`)} onChange={e => set(`me_${k.key}_egyeb`, e.target.value)} step="0.1" /></td>
                  <td><input type="number" className="table-input" value={get(`me_${k.key}_kozp`)} onChange={e => set(`me_${k.key}_kozp`, e.target.value)} step="1" /></td>
                </tr>
              ))}
              <tr>
                <td style={{ color: 'var(--text-secondary)' }}>Alkalmi (Nap-fő)</td>
                <td><input type="number" className="table-input" value={get('me_alkalmi_togaz')} onChange={e => set('me_alkalmi_togaz', e.target.value)} /></td>
                <td><input type="number" className="table-input" value={get('me_alkalmi_egyeb')} onChange={e => set('me_alkalmi_egyeb', e.target.value)} /></td>
                <td><input type="number" className="table-input" value={get('me_alkalmi_kozp')} onChange={e => set('me_alkalmi_kozp', e.target.value)} /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="form-hint" style={{ marginTop: 12 }}>A % soroknak összesen 100%-ot kell adniuk.</p>
      </div>
    </div>
  )
}

// ─── Ext Tab 2: Takarmányozás ─────────────────────────────────────────────────
function ExtTakarmany({ get, set }: { get: (k: string) => string; set: (k: string, v: string) => void }) {
  const takarmanyok = [
    { key: 'buza', label: 'Búza' },
    { key: 'kukorica', label: 'Kukorica' },
    { key: 'arpa', label: 'Árpa' },
    { key: 'triticale', label: 'Triticale' },
    { key: 'egyeb_gabona', label: 'Egyéb gabona' },
    { key: 'szoja', label: 'Szója' },
    { key: 'takaerme_borsó', label: 'Takarmányborsó' },
    { key: 'egyeb_pillangos', label: 'Egyéb pillangós' },
    { key: 'tak_keverek', label: 'Takarmánykeverék/táp' },
    { key: 'husliszt', label: 'Húsliszt' },
    { key: 'buzakorpa', label: 'Búzakorpa' },
    { key: 'tortszem', label: 'Törtszem/rostalj' },
  ]
  return (
    <div className="card">
      <div className="card-header"><h3>Takarmányozás (Telephely)</h3></div>
      <div className="card-body">
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          ℹ️ Az adatokat ÁFA nélkül töltse ki. Önköltség = saját termesztésű, Beszerzési ár = vásárolt esetén.
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Takarmány</th>
                <th>Saját (kg)</th>
                <th>Vásárolt (kg)</th>
                <th>Önköltség (Ft/kg)</th>
                <th>Bszerz. ár (Ft/kg)</th>
              </tr>
            </thead>
            <tbody>
              {takarmanyok.map(t => (
                <tr key={t.key}>
                  <td style={{ color: 'var(--text-secondary)' }}>{t.label}</td>
                  <td><input type="number" className="table-input" value={get(`tak_${t.key}_sajat`)} onChange={e => set(`tak_${t.key}_sajat`, e.target.value)} /></td>
                  <td><input type="number" className="table-input" value={get(`tak_${t.key}_vasarolt`)} onChange={e => set(`tak_${t.key}_vasarolt`, e.target.value)} /></td>
                  <td><input type="number" className="table-input" value={get(`tak_${t.key}_onk`)} onChange={e => set(`tak_${t.key}_onk`, e.target.value)} step="0.01" /></td>
                  <td><input type="number" className="table-input" value={get(`tak_${t.key}_bsar`)} onChange={e => set(`tak_${t.key}_bsar`, e.target.value)} step="0.01" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Ext Tab 3: Haltermelés ───────────────────────────────────────────────────
function ExtHaltermes({ get, set, szamol }: { get: (k: string) => string; set: (k: string, v: string) => void; szamol: Record<string, () => string> }) {
  const halfajok = [
    { key: 'ponty', label: 'Ponty' },
    { key: 'amur', label: 'Amúr' },
    { key: 'busa', label: 'Busa' },
    { key: 'harcsa', label: 'Harcsa' },
    { key: 'sullo', label: 'Fogassüllő' },
    { key: 'csuka', label: 'Csuka' },
    { key: 'compo', label: 'Compó' },
    { key: 'egyeb', label: 'Egyéb' },
  ]
  return (
    <div className="card">
      <div className="card-header"><h3>Halfajok – lehalászott mennyiség és értékesítési ár</h3></div>
      <div className="card-body">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Halfaj</th>
                <th>Lehalászott (kg)</th>
                <th>Éttk. átlagár (Ft/kg)</th>
                <th>Értékesítési bevétel (Ft)</th>
              </tr>
            </thead>
            <tbody>
              {halfajok.map(f => {
                const kg = parseFloat(get(`hozam_${f.key}`)) || 0
                const ar = parseFloat(get(`ar_${f.key}`)) || 0
                const bev = (kg * ar).toFixed(0)
                return (
                  <tr key={f.key}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</td>
                    <td><input type="number" className="table-input" value={get(`hozam_${f.key}`)} onChange={e => set(`hozam_${f.key}`, e.target.value)} /></td>
                    <td><input type="number" className="table-input" value={get(`ar_${f.key}`)} onChange={e => set(`ar_${f.key}`, e.target.value)} step="1" /></td>
                    <td><input type="number" className="table-input" value={bev} readOnly /></td>
                  </tr>
                )
              })}
              <tr style={{ background: 'rgba(0,247,194,0.05)' }}>
                <td style={{ fontWeight: 700, color: 'var(--accent)' }}>ÖSSZESEN</td>
                <td><input type="number" className="table-input" value={szamol.szamol_hozam_ext()} readOnly /></td>
                <td>—</td>
                <td><input type="number" className="table-input" value={szamol.szamol_bevetel_ext()} readOnly /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="divider" />
        <div className="section-title" style={{ marginBottom: 16 }}>
          <span className="section-icon">💊</span> Egyéb értékesítés
        </div>
        <div className="form-grid form-grid-2">
          <NumInput label="Keltetőházi ikra/lárva értékesítés" value={get('kelteto_bevetel')} onChange={v => set('kelteto_bevetel', v)} unit="Ft" />
          <NumInput label="Sporthorgászat bevétele" value={get('sport_bevetel')} onChange={v => set('sport_bevetel', v)} unit="Ft" />
        </div>
      </div>
    </div>
  )
}

// ─── Ext Tab 4: Állományváltozás ──────────────────────────────────────────────
function ExtAllomany({ get, set }: { get: (k: string) => string; set: (k: string, v: string) => void }) {
  const halfajok = ['Ponty', 'Amúr', 'Busa', 'Harcsa', 'Süllő', 'Csuka', 'Compó', 'Egyéb']
  const korcsoportok = ['Zsenge', 'Előnevelt', 'Egynyaras', 'Kétnyaras', 'Háromnyaras', 'Többnyaras']

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><h3>III/a. Állományváltozás – Kihelyezés (db)</h3></div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Halfaj</th>
                {korcsoportok.map(k => <th key={k}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {halfajok.map(f => (
                <tr key={f}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{f}</td>
                  {korcsoportok.map(k => (
                    <td key={k}>
                      <input type="number" className="table-input" style={{ minWidth: 70 }}
                        value={get(`kihely_${f.toLowerCase()}_${k.toLowerCase()}`)}
                        onChange={e => set(`kihely_${f.toLowerCase()}_${k.toLowerCase()}`, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>III/b. Állományváltozás – Lehalászás (kg)</h3></div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Halfaj</th>
                {['Egynyaras', 'Kétnyaras', 'Háromnyaras', 'Többnyaras', 'Nyári lehalász.'].map(k => <th key={k}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {halfajok.map(f => (
                <tr key={f}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{f}</td>
                  {['Egynyaras', 'Kétnyaras', 'Háromnyaras', 'Többnyaras', 'Nyári lehalász.'].map(k => (
                    <td key={k}>
                      <input type="number" className="table-input" style={{ minWidth: 70 }}
                        value={get(`lehal_${f.toLowerCase()}_${k.toLowerCase()}`)}
                        onChange={e => set(`lehal_${f.toLowerCase()}_${k.toLowerCase()}`, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Ext Tab 5: Költségek ─────────────────────────────────────────────────────
function ExtKoltsegek({ get, set, szamol }: { get: (k: string) => string; set: (k: string, v: string) => void; szamol: Record<string, () => string> }) {
  return (
    <div className="card">
      <div className="card-header"><h3>Vállalkozás költségei (ÁFA nélkül, Ft)</h3></div>
      <div className="card-body">
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          ⚠ KIVA a bérjárulékok közt nem számolható el. 8-as számlaosztály tételei nem szerepelhetnek.
        </div>
        <div className="form-grid form-grid-2">
          <NumInput label="Halbeszerzés (51. számla)" value={get('halbeszerzés')} onChange={v => set('halbeszerzés', v)} unit="Ft" />
          <NumInput label="Takarmányköltség (51. számla)" value={get('takarmany_koltseg')} onChange={v => set('takarmany_koltseg', v)} unit="Ft" />
          <NumInput label="Állategészségügyi költség" value={get('allateg_koltseg')} onChange={v => set('allateg_koltseg', v)} unit="Ft" />
          <NumInput label="Műtrágyaköltség" value={get('mutokoltseg')} onChange={v => set('mutokoltseg', v)} unit="Ft" />
          <NumInput label="Villany (Ft)" value={get('villany')} onChange={v => set('villany', v)} unit="Ft" />
          <NumInput label="Gáz (Ft)" value={get('gaz')} onChange={v => set('gaz', v)} unit="Ft" />
          <NumInput label="Víz (Ft)" value={get('viz')} onChange={v => set('viz', v)} unit="Ft" />
          <NumInput label="Üzem- és kenőanyag (Ft)" value={get('uzemanyag')} onChange={v => set('uzemanyag', v)} unit="Ft" />
        </div>

        <div className="divider" />
        <div className="form-grid form-grid-2">
          <NumInput label="Bérköltség (bruttó bér 85%)" value={get('berkoltseg_brutto')} onChange={v => set('berkoltseg_brutto', v)} unit="Ft" />
          <NumInput label="Bérjárulékok (15%)" value={get('berjarulekak')} onChange={v => set('berjarulekak', v)} unit="Ft" />
          <div className="form-group">
            <label className="form-label">Bér + járulék összesen</label>
            <LockedField value={szamol.szamol_berkoltseg()} unit="Ft" />
          </div>
          <div className="form-group">
            <label className="form-label">Energiaköltség összesen</label>
            <LockedField value={szamol.szamol_energia()} unit="Ft" />
          </div>
        </div>

        <div className="form-grid form-grid-2">
          <NumInput label="Értékcsökkentési leírás" value={get('ertcsokk')} onChange={v => set('ertcsokk', v)} unit="Ft" />
          <NumInput label="Egyéb költség" value={get('egyeb_koltseg')} onChange={v => set('egyeb_koltseg', v)} unit="Ft" />
        </div>

        <div className="divider" />
        <div className="result-row" style={{ background: 'rgba(0,247,194,0.05)', padding: '12px 16px', borderRadius: 'var(--radius)', marginTop: 8 }}>
          <span className="result-label" style={{ fontWeight: 700, fontSize: '1rem' }}>ÖSSZES KÖLTSÉG</span>
          <span className="result-value" style={{ fontSize: '1.25rem' }}>{parseInt(szamol.szamol_osszes_koltseg()).toLocaleString('hu-HU')} Ft</span>
        </div>
      </div>
    </div>
  )
}

// ─── Ext Tab 6: Bevételek ─────────────────────────────────────────────────────
function ExtBevetelek({ get, set, szamol }: { get: (k: string) => string; set: (k: string, v: string) => void; szamol: Record<string, () => string> }) {
  const bevetelTipusok = [
    { key: 'mahop', label: 'MAHOP támogatás' },
    { key: 'de_minimis', label: 'De minimis támogatás' },
    { key: 'valsag_tamogatas', label: 'Válságtámogatás' },
    { key: 'egyeb_tamogatas', label: 'Egyéb támogatás' },
  ]

  const osszesBev = [
    szamol.szamol_bevetel_ext(),
    get('kelteto_bevetel') || '0',
    get('sport_bevetel') || '0',
    ...bevetelTipusok.map(b => get(`bev_${b.key}`) || '0'),
  ].reduce((sum, v) => sum + (parseFloat(v) || 0), 0)

  const osszesKolts = parseFloat(szamol.szamol_osszes_koltseg()) || 0
  const eredmeny = osszesBev - osszesKolts

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><h3>Halértékesítési bevételek</h3></div>
        <div className="card-body">
          <div className="result-row">
            <span className="result-label">Halértékesítés összesen</span>
            <LockedField value={parseInt(szamol.szamol_bevetel_ext()).toLocaleString('hu-HU')} unit="Ft" />
          </div>
          <div className="result-row">
            <span className="result-label">Keltetőházi bevétel</span>
            <LockedField value={parseInt(get('kelteto_bevetel') || '0').toLocaleString('hu-HU')} unit="Ft" />
          </div>
          <div className="result-row">
            <span className="result-label">Sporthorgász bevétel</span>
            <LockedField value={parseInt(get('sport_bevetel') || '0').toLocaleString('hu-HU')} unit="Ft" />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><h3>Egyéb bevételek és támogatások</h3></div>
        <div className="card-body">
          <div className="form-grid form-grid-2">
            {bevetelTipusok.map(b => (
              <NumInput key={b.key} label={b.label} value={get(`bev_${b.key}`)} onChange={v => set(`bev_${b.key}`, v)} unit="Ft" />
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Eredmény összefoglaló</h3></div>
        <div className="card-body">
          <div className="result-row">
            <span className="result-label">Összes bevétel</span>
            <span className="result-value">{osszesBev.toLocaleString('hu-HU')} Ft</span>
          </div>
          <div className="result-row">
            <span className="result-label">Összes költség</span>
            <span className="result-value" style={{ color: 'var(--danger)' }}>{osszesKolts.toLocaleString('hu-HU')} Ft</span>
          </div>
          <div className="result-row" style={{ borderTop: '2px solid var(--border-glow)', paddingTop: 16, marginTop: 8 }}>
            <span className="result-label" style={{ fontWeight: 700, fontSize: '1.1rem' }}>ÜZEMI EREDMÉNY</span>
            <span className="result-value" style={{
              fontSize: '1.5rem',
              color: eredmeny >= 0 ? 'var(--accent-green)' : 'var(--danger)'
            }}>
              {eredmeny >= 0 ? '+' : ''}{eredmeny.toLocaleString('hu-HU')} Ft
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTENZÍV TABLAPOK
// ═══════════════════════════════════════════════════════════════════════════════
function IntTabok({ tab, get, set, szamol }: {
  tab: number
  get: (k: string) => string
  set: (k: string, v: string) => void
  szamol: Record<string, () => string>
}) {
  if (tab === 0) return <IntTorzs get={get} set={set} />
  if (tab === 1) return <IntMunkaero get={get} set={set} />
  if (tab === 2) return <IntTermeles get={get} set={set} />
  if (tab === 3) return <IntAllomany get={get} set={set} />
  if (tab === 4) return <IntTakarmany get={get} set={set} />
  if (tab === 5) return <IntKoltsegek get={get} set={set} szamol={szamol} />
  if (tab === 6) return <IntBevetelek get={get} set={set} szamol={szamol} />
  return null
}

// ─── Int Tab 0: Törzsadatok ───────────────────────────────────────────────────
function IntTorzs({ get, set }: { get: (k: string) => string; set: (k: string, v: string) => void }) {
  return (
    <div className="card">
      <div className="card-header"><h3>I. Törzsadatok – Intenzív telep</h3></div>
      <div className="card-body">
        <div className="form-grid form-grid-2">
          <TxtInput label="Telephely neve / azonosítója" value={get('telephely_nev')} onChange={v => set('telephely_nev', v)} />
          <div className="form-group">
            <label className="form-label">Tartási technológia</label>
            <select className="form-select" value={get('technologia')} onChange={e => set('technologia', e.target.value)}>
              <option value="">— Válassz —</option>
              <option value="ras">RAS (zárt recirkulációs)</option>
              <option value="medences">Medencés tartás</option>
              <option value="egyeb">Egyéb intenzív</option>
            </select>
          </div>
        </div>
        <div className="form-grid form-grid-3">
          <NumInput label="Telepi vízfelszín" value={get('vizfelszin')} onChange={v => set('vizfelszin', v)} unit="m²" />
          <NumInput label="Tartómedencék száma" value={get('medence_szam')} onChange={v => set('medence_szam', v)} unit="db" />
          <NumInput label="Medence kapacitás összesen" value={get('medence_kapacitas')} onChange={v => set('medence_kapacitas', v)} unit="m³" />
        </div>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Kereskedelem</label>
            <select className="form-select" value={get('kereskedelem')} onChange={e => set('kereskedelem', e.target.value)}>
              <option value="">— Válassz —</option>
              <option value="igen">Van</option>
              <option value="nem">Nincs</option>
            </select>
          </div>
          <NumInput label="Átlagos termelési ciklus" value={get('termelesi_ciklus')} onChange={v => set('termelesi_ciklus', v)} unit="hónap" />
        </div>
        <div className="form-group">
          <label className="form-label">Megjegyzés</label>
          <textarea className="form-textarea" value={get('torzs_megjegyzes')} onChange={e => set('torzs_megjegyzes', e.target.value)} rows={3} />
        </div>
      </div>
    </div>
  )
}

// ─── Int Tab 1: Munkaerő ──────────────────────────────────────────────────────
function IntMunkaero({ get, set }: { get: (k: string) => string; set: (k: string, v: string) => void }) {
  const kategoriák = [
    { key: 'foallass', label: 'Főállású' },
    { key: 'reszmunkado_6h', label: 'Részmunkaidő (6h)' },
    { key: 'reszmunkado_4h', label: 'Részmunkaidő (4h)' },
    { key: 'segito_csalad', label: 'Segítő családtag' },
  ]
  return (
    <div className="card">
      <div className="card-header"><h3>Munkaerő – Telephely (Afrikai harcsa)</h3></div>
      <div className="card-body">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kategória</th>
                <th>Af. harcsa (fő)</th>
                <th>Egyéb ágazat (fő)</th>
                <th>Közp. irányítás (%)</th>
              </tr>
            </thead>
            <tbody>
              {kategoriák.map(k => (
                <tr key={k.key}>
                  <td style={{ color: 'var(--text-secondary)' }}>{k.label}</td>
                  <td><input type="number" className="table-input" value={get(`me_${k.key}_harcsa`)} onChange={e => set(`me_${k.key}_harcsa`, e.target.value)} step="0.1" /></td>
                  <td><input type="number" className="table-input" value={get(`me_${k.key}_egyeb`)} onChange={e => set(`me_${k.key}_egyeb`, e.target.value)} step="0.1" /></td>
                  <td><input type="number" className="table-input" value={get(`me_${k.key}_kozp`)} onChange={e => set(`me_${k.key}_kozp`, e.target.value)} step="1" /></td>
                </tr>
              ))}
              <tr>
                <td style={{ color: 'var(--text-secondary)' }}>Alkalmi (Nap-fő)</td>
                <td><input type="number" className="table-input" value={get('me_alkalmi_harcsa')} onChange={e => set('me_alkalmi_harcsa', e.target.value)} /></td>
                <td><input type="number" className="table-input" value={get('me_alkalmi_egyeb')} onChange={e => set('me_alkalmi_egyeb', e.target.value)} /></td>
                <td><input type="number" className="table-input" value={get('me_alkalmi_kozp')} onChange={e => set('me_alkalmi_kozp', e.target.value)} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Int Tab 2: Termelési adatok ──────────────────────────────────────────────
function IntTermeles({ get, set }: { get: (k: string) => string; set: (k: string, v: string) => void }) {
  const kg_termelve = parseFloat(get('int_etkezesi_kg')) || 0
  const ar_kg = parseFloat(get('int_etkezesi_ar')) || 0
  const bevetel = (kg_termelve * ar_kg).toFixed(0)

  return (
    <div className="card">
      <div className="card-header"><h3>Termelési adatok – Afrikai harcsa</h3></div>
      <div className="card-body">
        <div className="form-grid form-grid-2">
          <NumInput label="Megtermelt étkezési hal" value={get('int_etkezesi_kg')} onChange={v => set('int_etkezesi_kg', v)} unit="kg" />
          <NumInput label="Értékesítési átlagár" value={get('int_etkezesi_ar')} onChange={v => set('int_etkezesi_ar', v)} unit="Ft/kg" />
          <NumInput label="Értékesített növendék hal" value={get('int_novendek_kg')} onChange={v => set('int_novendek_kg', v)} unit="kg" />
          <NumInput label="Növendék értékesítési ár" value={get('int_novendek_ar')} onChange={v => set('int_novendek_ar', v)} unit="Ft/kg" />
        </div>
        <div className="divider" />
        <div className="form-grid form-grid-2">
          <NumInput label="Takarmányfelhasználás összesen" value={get('int_takarmany_kg')} onChange={v => set('int_takarmany_kg', v)} unit="kg" />
          <div className="form-group">
            <label className="form-label">Takarmányátalakítási arány (FCR)</label>
            <LockedField
              value={
                kg_termelve > 0
                  ? (parseFloat(get('int_takarmany_kg') || '0') / kg_termelve).toFixed(2)
                  : '—'
              }
              unit="kg tak./kg hal"
            />
          </div>
        </div>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Étkezési hal értékesítési bevétele</label>
            <LockedField value={parseInt(bevetel).toLocaleString('hu-HU')} unit="Ft" />
          </div>
          <NumInput label="Egyéb bevétel (melléktermék, stb.)" value={get('int_egyeb_bevetel')} onChange={v => set('int_egyeb_bevetel', v)} unit="Ft" />
        </div>
      </div>
    </div>
  )
}

// ─── Int Tab 3: Állományváltozás ──────────────────────────────────────────────
function IntAllomany({ get, set }: { get: (k: string) => string; set: (k: string, v: string) => void }) {
  const sorok = [
    { key: 'nyito', label: 'Nyitó állomány (jan. 1.)' },
    { key: 'larva_kihely', label: 'Lárva kihelyezés' },
    { key: 'novendek_kihely', label: 'Növendék kihelyezés' },
    { key: 'ert_novendek', label: 'Értékesített növendék' },
    { key: 'etkezesi_termelve', label: 'Megtermelt étkezési hal' },
    { key: 'zaro', label: 'Záró állomány (dec. 31.)' },
  ]
  return (
    <div className="card">
      <div className="card-header"><h3>III. Állományváltozás – Afrikai harcsa (Telep)</h3></div>
      <div className="card-body">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tétel</th>
                <th>Darab (db)</th>
                <th>Tömeg (kg)</th>
              </tr>
            </thead>
            <tbody>
              {sorok.map(s => (
                <tr key={s.key}>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</td>
                  <td><input type="number" className="table-input" value={get(`all_${s.key}_db`)} onChange={e => set(`all_${s.key}_db`, e.target.value)} /></td>
                  <td><input type="number" className="table-input" value={get(`all_${s.key}_kg`)} onChange={e => set(`all_${s.key}_kg`, e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Int Tab 4: Takarmányozás ─────────────────────────────────────────────────
function IntTakarmany({ get, set }: { get: (k: string) => string; set: (k: string, v: string) => void }) {
  const takarmanyok = [
    { key: 'taplaranyu_tap', label: 'Táplárarányú táp (starter)' },
    { key: 'novekedesi_tap', label: 'Növekedési táp' },
    { key: 'befejező_tap', label: 'Befejező táp' },
    { key: 'egyeb_tak', label: 'Egyéb takarmány' },
  ]
  return (
    <div className="card">
      <div className="card-header"><h3>Takarmányozás – Intenzív rendszer</h3></div>
      <div className="card-body">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Takarmány típus</th>
                <th>Mennyiség (kg)</th>
                <th>Egységár (Ft/kg)</th>
                <th>Érték (Ft)</th>
              </tr>
            </thead>
            <tbody>
              {takarmanyok.map(t => {
                const kg = parseFloat(get(`int_tak_${t.key}_kg`)) || 0
                const ar = parseFloat(get(`int_tak_${t.key}_ar`)) || 0
                return (
                  <tr key={t.key}>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.label}</td>
                    <td><input type="number" className="table-input" value={get(`int_tak_${t.key}_kg`)} onChange={e => set(`int_tak_${t.key}_kg`, e.target.value)} /></td>
                    <td><input type="number" className="table-input" value={get(`int_tak_${t.key}_ar`)} onChange={e => set(`int_tak_${t.key}_ar`, e.target.value)} step="0.01" /></td>
                    <td><input type="number" className="table-input" value={(kg * ar).toFixed(0)} readOnly /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Int Tab 5: Költségek ─────────────────────────────────────────────────────
function IntKoltsegek({ get, set, szamol }: { get: (k: string) => string; set: (k: string, v: string) => void; szamol: Record<string, () => string> }) {
  return (
    <div className="card">
      <div className="card-header"><h3>Vállalkozás költségei – Intenzív (ÁFA nélkül, Ft)</h3></div>
      <div className="card-body">
        <div className="form-grid form-grid-2">
          <NumInput label="Halbeszerzés (lárva/növendék)" value={get('halbeszerzés')} onChange={v => set('halbeszerzés', v)} unit="Ft" />
          <NumInput label="Takarmányköltség összesen" value={get('takarmany_koltseg')} onChange={v => set('takarmany_koltseg', v)} unit="Ft" />
          <NumInput label="Állategészségügyi" value={get('allateg_koltseg')} onChange={v => set('allateg_koltseg', v)} unit="Ft" />
          <NumInput label="Villany (fűtés + szivattyú)" value={get('villany')} onChange={v => set('villany', v)} unit="Ft" />
          <NumInput label="Gáz/fűtőanyag" value={get('gaz')} onChange={v => set('gaz', v)} unit="Ft" />
          <NumInput label="Víz" value={get('viz')} onChange={v => set('viz', v)} unit="Ft" />
          <NumInput label="Üzem- és kenőanyag" value={get('uzemanyag')} onChange={v => set('uzemanyag', v)} unit="Ft" />
          <div className="form-group">
            <label className="form-label">Energiaköltség összesen</label>
            <LockedField value={szamol.szamol_energia()} unit="Ft" />
          </div>
          <NumInput label="Bérköltség (bruttó 85%)" value={get('berkoltseg_brutto')} onChange={v => set('berkoltseg_brutto', v)} unit="Ft" />
          <NumInput label="Bérjárulékok (15%)" value={get('berjarulekak')} onChange={v => set('berjarulekak', v)} unit="Ft" />
          <div className="form-group">
            <label className="form-label">Bér + járulék összesen</label>
            <LockedField value={szamol.szamol_berkoltseg()} unit="Ft" />
          </div>
          <NumInput label="Értékcsökkentési leírás" value={get('ertcsokk')} onChange={v => set('ertcsokk', v)} unit="Ft" />
          <NumInput label="Egyéb költség" value={get('egyeb_koltseg')} onChange={v => set('egyeb_koltseg', v)} unit="Ft" />
        </div>
        <div className="divider" />
        <div className="result-row" style={{ background: 'rgba(0,247,194,0.05)', padding: '12px 16px', borderRadius: 'var(--radius)', marginTop: 8 }}>
          <span className="result-label" style={{ fontWeight: 700, fontSize: '1rem' }}>ÖSSZES KÖLTSÉG</span>
          <span className="result-value" style={{ fontSize: '1.25rem' }}>{parseInt(szamol.szamol_osszes_koltseg()).toLocaleString('hu-HU')} Ft</span>
        </div>
      </div>
    </div>
  )
}

// ─── Int Tab 6: Bevételek ─────────────────────────────────────────────────────
function IntBevetelek({ get, szamol }: { get: (k: string) => string; set: (k: string, v: string) => void; szamol: Record<string, () => string> }) {
  const kg = parseFloat(get('int_etkezesi_kg')) || 0
  const ar = parseFloat(get('int_etkezesi_ar')) || 0
  const halBev = kg * ar
  const egyebBev = parseFloat(get('int_egyeb_bevetel')) || 0
  const novendekBev = (parseFloat(get('int_novendek_kg')) || 0) * (parseFloat(get('int_novendek_ar')) || 0)
  const osszesBev = halBev + egyebBev + novendekBev
  const osszesKolts = parseFloat(szamol.szamol_osszes_koltseg()) || 0
  const eredmeny = osszesBev - osszesKolts

  return (
    <div className="card">
      <div className="card-header"><h3>Bevételek és eredmény – Afrikai harcsa</h3></div>
      <div className="card-body">
        <div className="result-row">
          <span className="result-label">Étkezési hal értékesítés ({kg.toLocaleString('hu-HU')} kg × {ar.toLocaleString('hu-HU')} Ft/kg)</span>
          <span className="result-value">{halBev.toLocaleString('hu-HU')} Ft</span>
        </div>
        <div className="result-row">
          <span className="result-label">Növendék hal értékesítés</span>
          <span className="result-value">{novendekBev.toLocaleString('hu-HU')} Ft</span>
        </div>
        <div className="result-row">
          <span className="result-label">Egyéb bevétel</span>
          <span className="result-value">{egyebBev.toLocaleString('hu-HU')} Ft</span>
        </div>
        <div className="divider" />
        <div className="result-row">
          <span className="result-label" style={{ fontWeight: 700 }}>Összes bevétel</span>
          <span className="result-value">{osszesBev.toLocaleString('hu-HU')} Ft</span>
        </div>
        <div className="result-row">
          <span className="result-label" style={{ fontWeight: 700 }}>Összes költség</span>
          <span className="result-value" style={{ color: 'var(--danger)' }}>{osszesKolts.toLocaleString('hu-HU')} Ft</span>
        </div>
        <div className="result-row" style={{ background: 'rgba(0,247,194,0.05)', padding: '16px', borderRadius: 'var(--radius)', marginTop: 12 }}>
          <span className="result-label" style={{ fontWeight: 700, fontSize: '1.1rem' }}>ÜZEMI EREDMÉNY</span>
          <span className="result-value" style={{
            fontSize: '1.75rem',
            color: eredmeny >= 0 ? 'var(--accent-green)' : 'var(--danger)'
          }}>
            {eredmeny >= 0 ? '+' : ''}{eredmeny.toLocaleString('hu-HU')} Ft
          </span>
        </div>
      </div>
    </div>
  )
}
