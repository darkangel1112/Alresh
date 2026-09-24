'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useConfirmDialog } from '@/components/ConfirmDialog'
import { appPath } from '@/lib/app-path'
import {
  createEmptyIntensiveBusiness,
  createEmptyIntensiveBusinessReport,
  createEmptyIntensiveSiteData,
  createEmptyIntensiveSiteStock,
  intensiveSiteCost,
  INTENSIVE_AGES,
  INTENSIVE_COSTS,
  INTENSIVE_FEEDS,
  INTENSIVE_SPECIES,
  INTENSIVE_TECHNOLOGIES,
  mergeIntensiveDefaults,
  type IntensiveBusinessData,
  type IntensiveBusinessReport,
  type IntensiveNumber,
  type IntensiveSiteRecord,
  type IntensiveSiteStock,
} from '@/lib/intensive-survey'

type Props = {
  survey: {
    id: number
    ev: number
    allapot: string
    torzs: unknown
    lehalaszasVallalkozas: unknown
    partner: { nev: string; szekhely: string | null }
    feltolto: { nev: string }
    telephelyek: Array<{
      id: number
      sorszam: number
      nev: string
      telepiAdat: unknown
      allomanyvaltozas: unknown
    }>
  }
}

type MainTab = 'vallalkozas' | 'telephelyek' | 'allomany' | 'lehalaszas'
type SiteTab = 'alapadatok' | 'munkaero' | 'takarmany' | 'arak' | 'koltsegek'

const mainTabs: Array<{ id: MainTab; label: string; icon: string }> = [
  { id: 'vallalkozas', label: 'Vállalkozás', icon: '🏢' },
  { id: 'telephelyek', label: 'Telephelyek', icon: '📍' },
  { id: 'allomany', label: 'III/a Állomány – telep', icon: '🔄' },
  { id: 'lehalaszas', label: 'III/b Lehalászás – vállalkozás', icon: '🐟' },
]

const siteTabs: Array<{ id: SiteTab; label: string }> = [
  { id: 'alapadatok', label: 'Alapadatok' },
  { id: 'munkaero', label: 'Munkaerő' },
  { id: 'takarmany', label: 'Takarmány' },
  { id: 'arak', label: 'Halárak' },
  { id: 'koltsegek', label: 'Költségek' },
]

const businessLaborRows = [
  { key: 'fullTime', label: 'Főállásban foglalkoztatottak' },
  { key: 'partTime6h', label: 'Részmunkaidőben foglalkoztatottak (6 óra)' },
  { key: 'partTime4h', label: 'Részmunkaidőben foglalkoztatottak (4 óra)' },
] as const

const inventoryRows: Array<{ key: keyof IntensiveSiteStock['species']['afrikaiHarcsa']; label: string }> = [
  { key: 'openingStock', label: 'Nyitó állomány (01.01.) – növendék és étkezési együtt' },
  { key: 'larvaeStocked', label: 'Lárva kihelyezés' },
  { key: 'juvenilesStocked', label: 'Növendék kihelyezés – a vizsgált termelési fázis kezdete' },
  { key: 'producedJuvenilesSold', label: 'Termelt mennyiségből értékesített növendék hal' },
  { key: 'foodSizeFishProduced', label: 'Év során megtermelt étkezési méretű hal' },
  { key: 'closingStock', label: 'Záró állomány (12.31.) – növendék és étkezési együtt' },
]

const reportRows: Array<{ key: keyof IntensiveBusinessReport['rows']; label: string; kind: 'quantity' | 'million' }> = [
  { key: 'totalFishProduced', label: 'Év során termelt összes hal', kind: 'quantity' },
  { key: 'foodSizeFishProduced', label: 'Év során termelt étkezési méretű hal', kind: 'quantity' },
  { key: 'producedFoodFishSold', label: 'Termelt mennyiségből értékesített étkezési hal', kind: 'quantity' },
  { key: 'producedJuvenilesSold', label: 'Termelt mennyiségből értékesített növendék hal', kind: 'quantity' },
  { key: 'ownProcessorFish', label: 'Saját feldolgozóba került hal (saját és/vagy vásárolt termelésből)', kind: 'quantity' },
  { key: 'broodstockAtYearEnd', label: 'Anyaállomány december 31-én', kind: 'quantity' },
  { key: 'juvenilesAtYearEnd', label: 'Növendék állomány december 31-én', kind: 'quantity' },
  { key: 'fertilizedEggsMillion', label: 'Termékenyített ikra produkció', kind: 'million' },
  { key: 'furtherRaisedLarvaeMillion', label: 'Továbbnevelt lárva', kind: 'million' },
]

function readJson(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) as unknown } catch { return null }
}

function setAtPath<T>(source: T, path: string, value: unknown): T {
  const parts = path.split('.')
  const clone = Array.isArray(source) ? [...source] : { ...(source as Record<string, unknown>) }
  let target = clone as Record<string, unknown>
  let original = source as Record<string, unknown>
  for (const part of parts.slice(0, -1)) {
    const previous = original?.[part]
    const next = Array.isArray(previous) ? [...previous] : { ...((previous ?? {}) as Record<string, unknown>) }
    target[part] = next
    target = next as Record<string, unknown>
    original = (previous ?? {}) as Record<string, unknown>
  }
  target[parts[parts.length - 1]] = value
  return clone as T
}

function parseNumber(value: string): IntensiveNumber {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function numberText(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : ''
}

function NumberField({ label, value, onChange, unit, step = 'any', hint }: {
  label: string
  value: number | null | undefined
  onChange: (value: IntensiveNumber) => void
  unit?: string
  step?: string
  hint?: string
}) {
  return <div className="form-group">
    <label className="form-label">{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <input type="number" className="form-input" value={numberText(value)} onChange={event => onChange(parseNumber(event.target.value))} step={step} style={{ textAlign: 'right' }} />
      {unit && <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '.78rem' }}>{unit}</span>}
    </div>
    {hint && <p className="form-hint">{hint}</p>}
  </div>
}

function CellNumber({ value, onChange, step = 'any' }: {
  value: number | null | undefined
  onChange: (value: IntensiveNumber) => void
  step?: string
}) {
  return <input type="number" className="table-input" value={numberText(value)} onChange={event => onChange(parseNumber(event.target.value))} step={step} />
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="form-group">
    <label className="form-label">{label}</label>
    <input className="form-input" value={value} onChange={event => onChange(event.target.value)} />
  </div>
}

function TechnologyField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="form-group">
    <label className="form-label">{label}</label>
    <select className="form-select" value={value} onChange={event => onChange(event.target.value)}>
      <option value="">— Válassz technológiát —</option>
      {INTENSIVE_TECHNOLOGIES.map(item => <option value={item.key} key={item.key}>{item.label}</option>)}
    </select>
  </div>
}

function YesNoField({ label, value, onChange }: { label: string; value: boolean | null; onChange: (value: boolean | null) => void }) {
  return <div className="form-group">
    <label className="form-label">{label}</label>
    <select className="form-select" value={value === null ? '' : value ? 'igen' : 'nem'} onChange={event => onChange(event.target.value === '' ? null : event.target.value === 'igen')}>
      <option value="">— Nincs megadva —</option><option value="igen">Van</option><option value="nem">Nincs</option>
    </select>
  </div>
}

function TableCard({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return <section className="card" style={{ marginBottom: 20 }}>
    <div className="card-header"><h3>{title}</h3></div>
    <div className="card-body">
      {note && <p style={{ marginBottom: 14, fontSize: '.82rem' }}>{note}</p>}
      {children}
    </div>
  </section>
}

export default function IntensiveSurveyForm({ survey: initialSurvey }: Props) {
  const router = useRouter()
  const { requestConfirmation, dialog } = useConfirmDialog()
  const [survey, setSurvey] = useState(initialSurvey)
  const [business, setBusiness] = useState<IntensiveBusinessData>(() => mergeIntensiveDefaults(createEmptyIntensiveBusiness(), readJson(initialSurvey.torzs)))
  const [report, setReport] = useState<IntensiveBusinessReport>(() => mergeIntensiveDefaults(createEmptyIntensiveBusinessReport(), readJson(initialSurvey.lehalaszasVallalkozas)))
  const [sites, setSites] = useState<IntensiveSiteRecord[]>(() => {
    const existing = initialSurvey.telephelyek.slice().sort((a, b) => a.sorszam - b.sorszam).map(site => ({
      id: site.id,
      sorszam: site.sorszam,
      nev: site.nev,
      telepiAdat: mergeIntensiveDefaults(createEmptyIntensiveSiteData(), readJson(site.telepiAdat)),
      allomanyvaltozas: mergeIntensiveDefaults(createEmptyIntensiveSiteStock(), readJson(site.allomanyvaltozas)),
    }))
    return existing.length ? existing : [{ sorszam: 1, nev: 'Telephely 1', telepiAdat: createEmptyIntensiveSiteData(), allomanyvaltozas: createEmptyIntensiveSiteStock() }]
  })
  const [mainTab, setMainTab] = useState<MainTab>('vallalkozas')
  const [siteTab, setSiteTab] = useState<SiteTab>('alapadatok')
  const [activeSite, setActiveSite] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function updateBusiness(path: string, value: unknown) {
    setBusiness(previous => setAtPath(previous, path, value))
    setSaved(false)
  }
  function updateReport(path: string, value: unknown) {
    setReport(previous => setAtPath(previous, path, value))
    setSaved(false)
  }
  function updateSite(path: string, value: unknown) {
    setSites(previous => previous.map((site, index) => index === activeSite ? setAtPath(site, path, value) : site))
    setSaved(false)
  }
  function addSite() {
    const nextIndex = sites.length + 1
    setSites(previous => [...previous, { sorszam: nextIndex, nev: `Telephely ${nextIndex}`, telepiAdat: createEmptyIntensiveSiteData(), allomanyvaltozas: createEmptyIntensiveSiteStock() }])
    setActiveSite(sites.length)
    setMainTab('telephelyek')
    setSaved(false)
  }
  async function removeSite(index: number) {
    if (sites.length === 1) return
    const confirmed = await requestConfirmation({
      title: 'Telephely törlése',
      message: `Biztosan törlöd ezt a telephelyet: ${sites[index].nev}?`,
      detail: 'A telephely még nem mentett adatai is elvesznek.',
      confirmLabel: 'Telephely törlése',
    })
    if (!confirmed) return
    const next = sites.filter((_, siteIndex) => siteIndex !== index).map((site, siteIndex) => ({ ...site, sorszam: siteIndex + 1 }))
    setSites(next)
    setActiveSite(Math.min(activeSite, next.length - 1))
    setSaved(false)
  }

  async function handleSave(status?: 'KESZ') {
    setError('')
    const emptyNameIndex = sites.findIndex(site => !site.nev.trim())
    if (emptyNameIndex >= 0) {
      setMainTab('telephelyek')
      setActiveSite(emptyNameIndex)
      setError(`A(z) ${emptyNameIndex + 1}. telephely neve kötelező.`)
      return false
    }
    if (status === 'KESZ') {
      const invalidCost = INTENSIVE_COSTS.find(cost => {
        const line = business.costs[cost.key]
        const entered = line.amountFt !== null || [line.catfishPercent, line.otherSectorPercent, line.centralManagementPercent].some(value => value !== null)
        return entered && Math.abs((line.catfishPercent ?? 0) + (line.otherSectorPercent ?? 0) + (line.centralManagementPercent ?? 0) - 100) > 0.01
      })
      if (invalidCost) {
        setMainTab('vallalkozas')
        setError(`A(z) „${invalidCost.label}” költségfelosztásának 100%-ra kell kijönnie.`)
        return false
      }
    }
    setSaving(true)
    try {
      const response = await fetch(appPath(`/api/kerdoivek/${survey.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          torzs: business,
          lehalaszasVallalkozas: report,
          telephelyek: sites.map((site, index) => ({
            ...(site.id ? { id: site.id } : {}),
            sorszam: index + 1,
            nev: site.nev.trim(),
            telepiAdat: site.telepiAdat,
            allomanyvaltozas: site.allomanyvaltozas,
          })),
          ...(status ? { allapot: status } : {}),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Nem sikerült menteni az adatokat.')
      setSurvey(previous => ({ ...previous, allapot: result.allapot ?? previous.allapot }))
      setSites((result.telephelyek as Array<{ id: number; sorszam: number; nev: string; telepiAdat: unknown; allomanyvaltozas: unknown }>).slice().sort((a, b) => a.sorszam - b.sorszam).map(site => ({
        id: site.id,
        sorszam: site.sorszam,
        nev: site.nev,
        telepiAdat: mergeIntensiveDefaults(createEmptyIntensiveSiteData(), site.telepiAdat),
        allomanyvaltozas: mergeIntensiveDefaults(createEmptyIntensiveSiteStock(), site.allomanyvaltozas),
      })))
      setSaved(true)
      if (status === 'KESZ') router.push('/kerdoivek')
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Hiba történt mentés közben.')
      return false
    } finally {
      setSaving(false)
    }
  }

  const currentSite = sites[activeSite]
  if (!currentSite) return null

  return <>
    {dialog}
    <div className="page-header">
      <div>
        <h2>Intenzív adatlap · {survey.ev}</h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '.76rem' }}>{survey.partner.nev}{survey.partner.szekhely ? ` · ${survey.partner.szekhely}` : ''}</div>
      </div>
      <div className="header-actions">
        {saved && <span style={{ color: 'var(--accent)', fontSize: '.8rem' }}>✓ Mentve</span>}
        <span className={`badge ${survey.allapot === 'KESZ' ? 'badge-success' : 'badge-warning'}`}>{survey.allapot === 'KESZ' ? 'Kész' : 'Folyamatban'}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => void handleSave()} disabled={saving}>{saving ? '⟳ Mentés…' : '💾 Mentés'}</button>
        <button className="btn btn-primary btn-sm" onClick={() => void handleSave('KESZ')} disabled={saving}>✓ Lezárás</button>
        <Link href="/kerdoivek" className="btn btn-ghost btn-sm">← Vissza</Link>
      </div>
    </div>

    <div style={{ padding: '0 32px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
      <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
        {mainTabs.map(tab => <button key={tab.id} className={`tab-btn ${mainTab === tab.id ? 'active' : ''}`} onClick={() => setMainTab(tab.id)}>{tab.icon} {tab.label}{tab.id === 'telephelyek' ? ` (${sites.length})` : ''}</button>)}
      </div>
    </div>

    <div className="page-body">
      {error && <div className="alert alert-danger">⚠ {error}</div>}
      {mainTab === 'vallalkozas' && <BusinessTab data={business} update={updateBusiness} />}
      {mainTab === 'telephelyek' && <>
        <div className="telephely-selector" role="tablist" aria-label="Telephely választó">
          {sites.map((site, index) => <button key={site.id ?? `new-${index}`} className={`telephely-chip ${activeSite === index ? 'active' : ''}`} onClick={() => setActiveSite(index)}>📍 {site.nev || `Telephely ${index + 1}`}</button>)}
          <button className="btn btn-secondary btn-sm" onClick={addSite}>＋ Telephely hozzáadása</button>
        </div>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header" style={{ gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <h3>{currentSite.nev || `Telephely ${activeSite + 1}`}</h3>
              <input className="form-input" aria-label="Telephely neve" value={currentSite.nev} onChange={event => updateSite('nev', event.target.value)} style={{ maxWidth: 300 }} />
            </div>
            {sites.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => removeSite(activeSite)}>Telephely törlése</button>}
          </div>
          <div className="card-body" style={{ paddingBottom: 4 }}>
            <div className="tabs" style={{ marginBottom: 16 }}>{siteTabs.map(tab => <button key={tab.id} className={`tab-btn ${siteTab === tab.id ? 'active' : ''}`} onClick={() => setSiteTab(tab.id)}>{tab.label}</button>)}</div>
            {siteTab === 'alapadatok' && <SiteBasics site={currentSite} update={updateSite} />}
            {siteTab === 'munkaero' && <WorkforceTable workforce={currentSite.telepiAdat.workforce} prefix="telepiAdat.workforce" update={updateSite} title="Munkaerő – telephely" />}
            {siteTab === 'takarmany' && <SiteFeed site={currentSite} update={updateSite} />}
            {siteTab === 'arak' && <SiteFishPrices site={currentSite} update={updateSite} />}
            {siteTab === 'koltsegek' && <SiteCosts site={currentSite} business={business} update={updateSite} />}
          </div>
        </div>
      </>}
      {mainTab === 'allomany' && <SiteInventory site={currentSite} update={updateSite} />}
      {mainTab === 'lehalaszas' && <BusinessReport report={report} update={updateReport} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>Felelős: {survey.feltolto.nev}</span>
        <button className="btn btn-secondary" onClick={() => void handleSave()} disabled={saving} style={{ marginLeft: 'auto' }}>{saving ? '⟳ Mentés…' : '💾 Mentés'}</button>
        <button className="btn btn-primary" onClick={() => void handleSave('KESZ')} disabled={saving}>✓ Lezárás</button>
      </div>
    </div>
  </>
}

function BusinessTab({ data, update }: { data: IntensiveBusinessData; update: (path: string, value: unknown) => void }) {
  return <>
    <TableCard title="I. Törzsadatok – intenzív termelés">
      <div className="form-grid form-grid-2">
        <TechnologyField label="Intenzív technológia típusa" value={data.technologyType} onChange={value => update('technologyType', value)} />
        <NumberField label="Összes medence térfogata" value={data.basins.totalVolumeM3} onChange={value => update('basins.totalVolumeM3', value)} unit="m³" />
        <NumberField label="Termelő medencék víztérfogata" value={data.basins.productionWaterVolumeM3} onChange={value => update('basins.productionWaterVolumeM3', value)} unit="m³" />
      </div>
    </TableCard>

    <TableCard title="Munkaerő – vállalkozás" note="A teljes létszám az afrikai harcsa, egyéb ágazat és központi irányítás létszámának összege. Az éves óraszám alapértékei módosíthatók.">
      <LaborTable workforce={data.workforce} prefix="workforce" update={update} enterprise />
    </TableCard>

    <TableCard title="Egyéb bevételek és kereskedelem" note="A támogatási és kártérítési összegeket forintban rögzítsd; a beruházási támogatást ne vedd fel működési bevételként.">
      <div className="form-grid form-grid-3">
        <NumberField label="De minimis támogatás" value={data.revenues.deMinimisFt} onChange={value => update('revenues.deMinimisFt', value)} unit="Ft" step="1" />
        <NumberField label="Krízishelyzeti támogatás" value={data.revenues.crisisSupportFt} onChange={value => update('revenues.crisisSupportFt', value)} unit="Ft" step="1" />
        <NumberField label="Egyéb, harcsatermeléshez kapcsolódó támogatás" value={data.revenues.otherSupportFt} onChange={value => update('revenues.otherSupportFt', value)} unit="Ft" step="1" />
        <NumberField label="Kártérítések" value={data.revenues.indemnitiesFt} onChange={value => update('revenues.indemnitiesFt', value)} unit="Ft" step="1" />
        <YesNoField label="Kereskedelmi tevékenység (nettó árbevétel >10%)" value={data.revenues.trade} onChange={value => update('revenues.trade', value)} />
      </div>
      <TextField label="Egyéb támogatás megnevezése" value={data.revenues.otherSupportDescription} onChange={value => update('revenues.otherSupportDescription', value)} />
    </TableCard>

    <TableCard title="Költségek – vállalkozás (ÁFA nélkül, Ft)" note="A megoszlási arányok az afrikai harcsa termelés, egyéb ágazat és központi irányítás részesedését adják meg. A lezáráskor az érintett sorok összege 100% kell legyen.">
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>Költségtétel</th><th>Vállalkozás összesen (Ft)</th><th>Afrikai harcsa (%)</th><th>Egyéb ágazat (%)</th><th>Központi irányítás (%)</th><th>Ellenőrzés</th></tr></thead>
        <tbody>{INTENSIVE_COSTS.map(cost => {
          const line = data.costs[cost.key]
          const sum = (line.catfishPercent ?? 0) + (line.otherSectorPercent ?? 0) + (line.centralManagementPercent ?? 0)
          const hasSplit = [line.catfishPercent, line.otherSectorPercent, line.centralManagementPercent].some(value => value !== null)
          return <tr key={cost.key}>
            <td>{cost.label}</td>
            <td><CellNumber value={line.amountFt} onChange={value => update(`costs.${cost.key}.amountFt`, value)} step="1" /></td>
            <td><CellNumber value={line.catfishPercent} onChange={value => update(`costs.${cost.key}.catfishPercent`, value)} step="0.1" /></td>
            <td><CellNumber value={line.otherSectorPercent} onChange={value => update(`costs.${cost.key}.otherSectorPercent`, value)} step="0.1" /></td>
            <td><CellNumber value={line.centralManagementPercent} onChange={value => update(`costs.${cost.key}.centralManagementPercent`, value)} step="0.1" /></td>
            <td style={{ color: !hasSplit || Math.abs(sum - 100) < 0.01 ? 'var(--success)' : 'var(--warning)' }}>{hasSplit ? `${sum.toFixed(1)}%` : '–'}</td>
          </tr>
        })}</tbody>
      </table></div>
    </TableCard>

    <TableCard title="Vállalkozási megjegyzés">
      <textarea className="form-textarea" value={data.notes} onChange={event => update('notes', event.target.value)} rows={3} />
    </TableCard>
  </>
}

function LaborTable({ workforce, prefix, update, enterprise, title }: {
  workforce: IntensiveBusinessData['workforce'] | IntensiveBusinessData['workforce']
  prefix: string
  update: (path: string, value: unknown) => void
  enterprise: boolean
  title?: string
}) {
  return <div>
    {title && <h3 style={{ marginBottom: 14 }}>{title}</h3>}
    <div className="table-wrap"><table className="data-table">
      <thead><tr><th>Kategória</th><th>Összes fő</th><th>Óra/év/fő</th><th>Afrikai harcsa (fő)</th><th>Egyéb ágazat (fő)</th><th>Központi irányítás (fő)</th></tr></thead>
      <tbody>
        {businessLaborRows.map(rowDef => {
          const line = workforce[rowDef.key]
          const total = (line.catfishCount ?? 0) + (line.otherSectorCount ?? 0) + (line.centralManagementCount ?? 0)
          return <tr key={rowDef.key}>
            <td>{rowDef.label}</td><td style={{ color: 'var(--accent-blue)' }}>{total || '—'}</td>
            <td><CellNumber value={line.hoursPerPerson} onChange={value => update(`${prefix}.${rowDef.key}.hoursPerPerson`, value)} step="1" /></td>
            <td><CellNumber value={line.catfishCount} onChange={value => update(`${prefix}.${rowDef.key}.catfishCount`, value)} step="0.1" /></td>
            <td><CellNumber value={line.otherSectorCount} onChange={value => update(`${prefix}.${rowDef.key}.otherSectorCount`, value)} step="0.1" /></td>
            <td><CellNumber value={line.centralManagementCount} onChange={value => update(`${prefix}.${rowDef.key}.centralManagementCount`, value)} step="0.1" /></td>
          </tr>
        })}
        <tr><td>Segítő családtag (afrikai harcsa)</td><td style={{ color: 'var(--accent-blue)' }}>{workforce.familyHelpers.count ?? '—'}</td><td><CellNumber value={workforce.familyHelpers.hoursPerPerson} onChange={value => update(`${prefix}.familyHelpers.hoursPerPerson`, value)} step="1" /></td><td><CellNumber value={workforce.familyHelpers.count} onChange={value => update(`${prefix}.familyHelpers.count`, value)} step="0.1" /></td><td>–</td><td>–</td></tr>
        <tr><td>Alkalmi foglalkoztatás (Nap-fő)</td><td>–</td><td>Nap-fő</td><td><CellNumber value={workforce.casualCatfishDays} onChange={value => update(`${prefix}.casualCatfishDays`, value)} step="1" /></td><td>–</td><td>–</td></tr>
      </tbody>
    </table></div>
    {!enterprise && <p className="form-hint" style={{ marginTop: 10 }}>Az óraszám/fő alapértékei: főállás 2 000, 6 órás részmunkaidő 1 500, 4 órás részmunkaidő 1 000 óra/év.</p>}
  </div>
}

function SiteBasics({ site, update }: { site: IntensiveSiteRecord; update: (path: string, value: unknown) => void }) {
  const data = site.telepiAdat
  return <>
    <TextField label="Telephely címe" value={data.address} onChange={value => update('telepiAdat.address', value)} />
    <TechnologyField label="Telephely technológiája" value={data.technologyType} onChange={value => update('telepiAdat.technologyType', value)} />
    <div className="form-grid form-grid-2">
      <NumberField label="Összes medence térfogata" value={data.basins.totalVolumeM3} onChange={value => update('telepiAdat.basins.totalVolumeM3', value)} unit="m³" />
      <NumberField label="Termelő medencék víztérfogata" value={data.basins.productionWaterVolumeM3} onChange={value => update('telepiAdat.basins.productionWaterVolumeM3', value)} unit="m³" />
    </div>
    <div className="form-group" style={{ marginTop: 16 }}>
      <label className="form-label">Telepi megjegyzés</label>
      <textarea className="form-textarea" value={data.notes} onChange={event => update('telepiAdat.notes', event.target.value)} rows={3} />
    </div>
  </>
}

function WorkforceTable({ workforce, prefix, update, title }: {
  workforce: IntensiveBusinessData['workforce'] | IntensiveBusinessData['workforce']
  prefix: string
  update: (path: string, value: unknown) => void
  title: string
}) {
  return <TableCard title={title} note="A létszám az afrikai harcsa termelés, egyéb ágazat és központi irányítás bontásában rögzíthető.">
    <LaborTable workforce={workforce} prefix={prefix} update={update} enterprise={false} />
  </TableCard>
}

function SiteFeed({ site, update }: { site: IntensiveSiteRecord; update: (path: string, value: unknown) => void }) {
  return <TableCard title="Takarmány mennyisége és ára" note="A tárgyévben ténylegesen feletetett mennyiséget rögzítsd. A saját takarmány ára önköltség, a vásárolté beszerzési ár (ÁFA nélkül).">
    <div className="table-wrap"><table className="data-table">
      <thead><tr><th>Takarmány</th><th>Saját mennyiség (kg)</th><th>Vásárolt mennyiség (kg)</th><th>Saját önköltség (Ft/kg)</th><th>Vásárolt beszerzési ár (Ft/kg)</th><th>Takarmányköltség (Ft)</th></tr></thead>
      <tbody>{INTENSIVE_FEEDS.map(item => {
        const line = site.telepiAdat.feed[item.key]
        const ownCost = (line.ownKg ?? 0) * (line.ownFtPerKg ?? 0)
        const boughtCost = (line.purchasedKg ?? 0) * (line.purchasedFtPerKg ?? 0)
        const hasValue = [line.ownKg, line.purchasedKg, line.ownFtPerKg, line.purchasedFtPerKg].some(value => value !== null)
        return <tr key={item.key}>
          <td>{item.label}</td>
          <td><CellNumber value={line.ownKg} onChange={value => update(`telepiAdat.feed.${item.key}.ownKg`, value)} step="1" /></td>
          <td><CellNumber value={line.purchasedKg} onChange={value => update(`telepiAdat.feed.${item.key}.purchasedKg`, value)} step="1" /></td>
          <td><CellNumber value={line.ownFtPerKg} onChange={value => update(`telepiAdat.feed.${item.key}.ownFtPerKg`, value)} /></td>
          <td><CellNumber value={line.purchasedFtPerKg} onChange={value => update(`telepiAdat.feed.${item.key}.purchasedFtPerKg`, value)} /></td>
          <td style={{ color: 'var(--accent-blue)' }}>{hasValue ? Math.round(ownCost + boughtCost).toLocaleString('hu-HU') : '—'}</td>
        </tr>
      })}</tbody>
    </table></div>
  </TableCard>
}

function SiteFishPrices({ site, update }: { site: IntensiveSiteRecord; update: (path: string, value: unknown) => void }) {
  return <TableCard title="Beszerzési és értékesítési árak" note="Az árakat Ft/kg-ban, a vásárolt arányt az összes kihelyezett darabszám arányában add meg. Becslést csak akkor adj meg, ha nem volt tényleges beszerzés vagy értékesítés: különben hagyd üresen.">
    {INTENSIVE_SPECIES.map(species => <div key={species.key} style={{ marginBottom: 20 }}>
      <h4 style={{ marginBottom: 8 }}>{species.label}</h4>
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>Korcsoport</th><th>Beszerzési ár (Ft/kg)</th><th>Vásárolt arány (%)</th><th>Éves értékesítési átlagár (Ft/kg)</th></tr></thead>
        <tbody>{INTENSIVE_AGES.map(age => {
          const line = site.telepiAdat.fishPrices[species.key][age.key]
          return <tr key={age.key}>
            <td>{age.label}</td>
            <td><CellNumber value={line.purchasePriceFtPerKg} onChange={value => update(`telepiAdat.fishPrices.${species.key}.${age.key}.purchasePriceFtPerKg`, value)} /></td>
            <td><CellNumber value={line.purchasedSharePercent} onChange={value => update(`telepiAdat.fishPrices.${species.key}.${age.key}.purchasedSharePercent`, value)} step="0.1" /></td>
            <td><CellNumber value={line.annualSalePriceFtPerKg} onChange={value => update(`telepiAdat.fishPrices.${species.key}.${age.key}.annualSalePriceFtPerKg`, value)} /></td>
          </tr>
        })}</tbody>
      </table></div>
    </div>)}
  </TableCard>
}

function SiteCosts({ site, business, update }: { site: IntensiveSiteRecord; business: IntensiveBusinessData; update: (path: string, value: unknown) => void }) {
  return <TableCard title="Költségek – telephely" note="A közvetlen telepi adat felülírja az AKI becslést, ha pozitív. Az automatikus felosztás a termelő víztérfogatot vagy a munkaórát használja; hiányzó osztó esetén üresen marad.">
    <div className="table-wrap"><table className="data-table">
      <thead><tr><th>Költségtétel</th><th>Közvetlen telepi adat (Ft)</th><th>Felosztási arány</th><th>AKI becslés (Ft)</th><th>Felhasznált érték (Ft)</th></tr></thead>
      <tbody>{INTENSIVE_COSTS.map(cost => {
        const calculated = intensiveSiteCost(cost.key, site, business)
        return <tr key={cost.key}>
          <td>{cost.label}</td>
          <td><CellNumber value={site.telepiAdat.siteCosts[cost.key]?.directAmountFt} onChange={value => update(`telepiAdat.siteCosts.${cost.key}.directAmountFt`, value)} step="1" /></td>
          <td>{calculated.share === null ? (calculated.basis === 'direct' ? 'Közvetlen adat' : '—') : `${(calculated.share * 100).toFixed(1)}%`}</td>
          <td>{calculated.allocatedFt === null ? '—' : Math.round(calculated.allocatedFt).toLocaleString('hu-HU')}</td>
          <td style={{ color: 'var(--accent-blue)' }}>{calculated.usedFt === null ? '—' : Math.round(calculated.usedFt).toLocaleString('hu-HU')}</td>
        </tr>
      })}</tbody>
    </table></div>
  </TableCard>
}

function SiteInventory({ site, update }: { site: IntensiveSiteRecord; update: (path: string, value: unknown) => void }) {
  return <>
    <div className="alert alert-info">III/a telepi állományváltozás · {site.nev}. A munkalap elsősorban az afrikai harcsa adatait követi; az „Egyéb hal” sor opcionálisan rögzíthető.</div>
    <TableCard title="Lárvától növendék és étkezési méretig" note="Az egyedszámot db-ban, a tömeget kg-ban rögzítsd. A nyitó és záró sorban a növendék és étkezési állomány együtt szerepel.">
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>Halfaj</th>{inventoryRows.map(row => <th key={row.key} colSpan={2}>{row.label}</th>)}</tr><tr><th></th>{inventoryRows.flatMap(row => [<th key={`${row.key}-db`}>db</th>, <th key={`${row.key}-kg`}>kg</th>])}</tr></thead>
        <tbody>{INTENSIVE_SPECIES.map(species => <tr key={species.key}>
          <td>{species.label}</td>
          {inventoryRows.flatMap(row => {
            const amount = site.allomanyvaltozas.species[species.key][row.key]
            return [
              <td key={`${row.key}-count`}><CellNumber value={amount.count} onChange={value => update(`allomanyvaltozas.species.${species.key}.${row.key}.count`, value)} step="1" /></td>,
              <td key={`${row.key}-kg`}><CellNumber value={amount.kg} onChange={value => update(`allomanyvaltozas.species.${species.key}.${row.key}.kg`, value)} step="1" /></td>,
            ]
          })}
        </tr>)}</tbody>
      </table></div>
      <div className="form-grid form-grid-2" style={{ marginTop: 18 }}>
        <NumberField label="AKI mellékszámításhoz használt halbeszerzési alapár (opcionális)" value={site.allomanyvaltozas.originalFishPriceFtPerKg} onChange={value => update('allomanyvaltozas.originalFishPriceFtPerKg', value)} unit="Ft/kg" />
      </div>
    </TableCard>
  </>
}

function BusinessReport({ report, update }: { report: IntensiveBusinessReport; update: (path: string, value: unknown) => void }) {
  return <TableCard title="III/b Állományváltozás – vállalkozás" note="A lehalászási jelentés kategóriái alapján add meg az afrikai harcsa vállalkozási adatait. A telepi III/a adatokkal egyeztesd a kihelyezést, értékesítést, termelést és záró állományt.">
    <div className="table-wrap"><table className="data-table">
      <thead><tr><th>Lehalászási jelentés kategóriája</th><th>Darab (db / millió)</th><th>Tömeg (kg)</th><th>Termelő térfogat (m³)</th></tr></thead>
      <tbody>{reportRows.map(row => {
        if (row.kind === 'million') {
          const value = report.rows[row.key] as IntensiveNumber
          return <tr key={row.key}>
            <td>{row.label}</td><td><CellNumber value={value} onChange={next => update(`rows.${row.key}`, next)} /></td><td>–</td><td>–</td>
          </tr>
        }
        const value = report.rows[row.key] as { count: IntensiveNumber; kg: IntensiveNumber; productionVolumeM3: IntensiveNumber }
        return <tr key={row.key}>
          <td>{row.label}</td>
          <td><CellNumber value={value.count} onChange={next => update(`rows.${row.key}.count`, next)} step="1" /></td>
          <td><CellNumber value={value.kg} onChange={next => update(`rows.${row.key}.kg`, next)} step="1" /></td>
          <td><CellNumber value={value.productionVolumeM3} onChange={next => update(`rows.${row.key}.productionVolumeM3`, next)} /></td>
        </tr>
      })}</tbody>
    </table></div>
  </TableCard>
}
