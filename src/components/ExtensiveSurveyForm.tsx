'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useConfirmDialog } from '@/components/ConfirmDialog'
import {
  calculateSiteCost,
  createEmptyExtensiveBusiness,
  createEmptyExtensiveBusinessHarvest,
  createEmptyExtensiveInventory,
  createEmptyExtensiveTelepiData,
  deepMergeDefaults,
  EXTENSIVE_AGES,
  EXTENSIVE_COSTS,
  EXTENSIVE_FEEDS,
  EXTENSIVE_HARVEST_AGES,
  EXTENSIVE_SPECIES,
  EXTENSIVE_STOCK_SECTIONS,
  EXTENSIVE_WORKFORCE,
  type ExtensiveBusinessData,
  type ExtensiveBusinessHarvest,
  type ExtensiveSiteRecord,
  type ExtensiveTelepiData,
  type NumericValue,
} from '@/lib/extensive-survey'

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
type SiteTab = 'alapadatok' | 'munkaero' | 'takarmany' | 'halfajarak' | 'koltsegek'

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
    const nextOriginal = original?.[part]
    const nextClone = Array.isArray(nextOriginal)
      ? [...nextOriginal]
      : { ...((nextOriginal ?? {}) as Record<string, unknown>) }
    target[part] = nextClone
    target = nextClone as Record<string, unknown>
    original = (nextOriginal ?? {}) as Record<string, unknown>
  }
  target[parts[parts.length - 1]] = value
  return clone as T
}

function numberValue(value: string): NumericValue {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function displayNumber(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : ''
}

function NumberField({
  label, value, onChange, unit, step = 'any', hint,
}: {
  label: string
  value: number | null | undefined
  onChange: (value: NumericValue) => void
  unit?: string
  step?: string
  hint?: string
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <input
          type="number"
          className="form-input"
          value={displayNumber(value)}
          onChange={event => onChange(numberValue(event.target.value))}
          step={step}
          style={{ textAlign: 'right' }}
        />
        {unit && <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '.78rem' }}>{unit}</span>}
      </div>
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  )
}

function CellNumber({ value, onChange, step = 'any' }: {
  value: number | null | undefined
  onChange: (value: NumericValue) => void
  step?: string
}) {
  return (
    <input
      type="number"
      className="table-input"
      value={displayNumber(value)}
      onChange={event => onChange(numberValue(event.target.value))}
      step={step}
    />
  )
}

function TextField({ label, value, onChange, hint }: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" value={value} onChange={event => onChange(event.target.value)} />
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  )
}

function YesNoField({ label, value, onChange }: {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-select" value={value === null ? '' : value ? 'igen' : 'nem'} onChange={event => {
        onChange(event.target.value === '' ? null : event.target.value === 'igen')
      }}>
        <option value="">— Nincs megadva —</option>
        <option value="igen">Igen</option>
        <option value="nem">Nem</option>
      </select>
    </div>
  )
}

function TableCard({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="card" style={{ marginBottom: 20 }}>
      <div className="card-header"><h3>{title}</h3></div>
      <div className="card-body">
        {note && <p style={{ marginBottom: 14, fontSize: '.82rem' }}>{note}</p>}
        {children}
      </div>
    </section>
  )
}

const mainTabs: Array<{ id: MainTab; label: string; icon: string }> = [
  { id: 'vallalkozas', label: 'Vállalkozás', icon: '🏢' },
  { id: 'telephelyek', label: 'Telephelyek', icon: '📍' },
  { id: 'allomany', label: 'III/a Állományváltozás', icon: '🔄' },
  { id: 'lehalaszas', label: 'III/b Lehalászás', icon: '🐟' },
]

const siteTabs: Array<{ id: SiteTab; label: string }> = [
  { id: 'alapadatok', label: 'Alapadatok' },
  { id: 'munkaero', label: 'Munkaerő' },
  { id: 'takarmany', label: 'Takarmány' },
  { id: 'halfajarak', label: 'Halfaj és árak' },
  { id: 'koltsegek', label: 'Költségek' },
]

export default function ExtensiveSurveyForm({ survey: initialSurvey }: Props) {
  const router = useRouter()
  const { requestConfirmation, dialog } = useConfirmDialog()
  const [survey, setSurvey] = useState(initialSurvey)
  const [business, setBusiness] = useState<ExtensiveBusinessData>(() =>
    deepMergeDefaults(createEmptyExtensiveBusiness(), readJson(initialSurvey.torzs)))
  const [harvest, setHarvest] = useState<ExtensiveBusinessHarvest>(() =>
    deepMergeDefaults(createEmptyExtensiveBusinessHarvest(), readJson(initialSurvey.lehalaszasVallalkozas)))
  const [sites, setSites] = useState<ExtensiveSiteRecord[]>(() => {
    const existing = initialSurvey.telephelyek
      .slice().sort((a, b) => a.sorszam - b.sorszam)
      .map(site => ({
        id: site.id,
        sorszam: site.sorszam,
        nev: site.nev,
        telepiAdat: deepMergeDefaults(createEmptyExtensiveTelepiData(), readJson(site.telepiAdat)),
        allomanyvaltozas: deepMergeDefaults(createEmptyExtensiveInventory(), readJson(site.allomanyvaltozas)),
      }))
    return existing.length ? existing : [{
      sorszam: 1, nev: 'Telephely 1',
      telepiAdat: createEmptyExtensiveTelepiData(),
      allomanyvaltozas: createEmptyExtensiveInventory(),
    }]
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

  function updateHarvest(path: string, value: unknown) {
    setHarvest(previous => setAtPath(previous, path, value))
    setSaved(false)
  }

  function updateSite(path: string, value: unknown) {
    setSites(previous => previous.map((site, index) => index === activeSite
      ? setAtPath(site, path, value)
      : site))
    setSaved(false)
  }

  function addSite() {
    const nextIndex = sites.length + 1
    setSites(previous => [...previous, {
      sorszam: nextIndex,
      nev: `Telephely ${nextIndex}`,
      telepiAdat: createEmptyExtensiveTelepiData(),
      allomanyvaltozas: createEmptyExtensiveInventory(),
    }])
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
    const next = sites.filter((_, itemIndex) => itemIndex !== index)
      .map((site, itemIndex) => ({ ...site, sorszam: itemIndex + 1 }))
    setSites(next)
    setActiveSite(Math.min(activeSite, next.length - 1))
    setSaved(false)
  }

  async function handleSave(status?: 'KESZ') {
    setError('')
    const invalidName = sites.findIndex(site => !site.nev.trim())
    if (invalidName >= 0) {
      setMainTab('telephelyek')
      setActiveSite(invalidName)
      setError(`A ${invalidName + 1}. telephely neve kötelező.`)
      return false
    }
    if (status === 'KESZ') {
      const invalidCost = EXTENSIVE_COSTS.find(cost => {
        const row = business.costs[cost.key]
        const entered = [row?.pondPercent, row?.otherSectorPercent, row?.centralManagementPercent]
          .some(value => value !== null && value !== undefined)
        return entered && Math.abs((row.pondPercent ?? 0) + (row.otherSectorPercent ?? 0) + (row.centralManagementPercent ?? 0) - 100) > 0.01
      })
      if (invalidCost) {
        setMainTab('vallalkozas')
        setError(`A(z) „${invalidCost.label}” költségfelosztásának 100%-ra kell kijönnie.`)
        return false
      }
    }
    setSaving(true)
    try {
      const response = await fetch(`/api/kerdoivek/${survey.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          torzs: business,
          lehalaszasVallalkozas: harvest,
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
      setSites((result.telephelyek as Array<{
        id: number; sorszam: number; nev: string; telepiAdat: unknown; allomanyvaltozas: unknown
      }>).slice().sort((a, b) => a.sorszam - b.sorszam).map(site => ({
        id: site.id,
        sorszam: site.sorszam,
        nev: site.nev,
        telepiAdat: deepMergeDefaults(createEmptyExtensiveTelepiData(), site.telepiAdat),
        allomanyvaltozas: deepMergeDefaults(createEmptyExtensiveInventory(), site.allomanyvaltozas),
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

  return (
    <>
      {dialog}
      <div className="page-header">
        <div>
          <h2>Extenzív adatlap · {survey.ev}</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '.76rem' }}>
            {survey.partner.nev}{survey.partner.szekhely ? ` · ${survey.partner.szekhely}` : ''}
          </div>
        </div>
        <div className="header-actions">
          {saved && <span style={{ color: 'var(--accent)', fontSize: '.8rem' }}>✓ Mentve</span>}
          <span className={`badge ${survey.allapot === 'KESZ' ? 'badge-success' : 'badge-warning'}`}>
            {survey.allapot === 'KESZ' ? 'Kész' : 'Folyamatban'}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => void handleSave()} disabled={saving}>
            {saving ? '⟳ Mentés…' : '💾 Mentés'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => void handleSave('KESZ')} disabled={saving}>
            ✓ Lezárás
          </button>
          <Link href="/kerdoivek" className="btn btn-ghost btn-sm">← Vissza</Link>
        </div>
      </div>

      <div style={{ padding: '0 32px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          {mainTabs.map(tab => (
            <button key={tab.id} className={`tab-btn ${mainTab === tab.id ? 'active' : ''}`} onClick={() => setMainTab(tab.id)}>
              {tab.icon} {tab.label}
              {tab.id === 'telephelyek' ? ` (${sites.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">
        {error && <div className="alert alert-danger">⚠ {error}</div>}
        {mainTab === 'vallalkozas' && <BusinessTab data={business} update={updateBusiness} />}
        {mainTab === 'telephelyek' && (
          <>
            <div className="telephely-selector" role="tablist" aria-label="Telephely választó">
              {sites.map((site, index) => (
                <button
                  key={site.id ?? `new-${index}`}
                  className={`telephely-chip ${activeSite === index ? 'active' : ''}`}
                  onClick={() => setActiveSite(index)}
                >
                  📍 {site.nev || `Telephely ${index + 1}`}
                </button>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={addSite}>＋ Telephely hozzáadása</button>
            </div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header" style={{ gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <h3>{currentSite.nev || `Telephely ${activeSite + 1}`}</h3>
                  <input
                    className="form-input"
                    aria-label="Telephely neve"
                    value={currentSite.nev}
                    onChange={event => updateSite('nev', event.target.value)}
                    style={{ maxWidth: 300 }}
                  />
                </div>
                {sites.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => removeSite(activeSite)}>Telephely törlése</button>}
              </div>
              <div className="card-body" style={{ paddingBottom: 4 }}>
                <div className="tabs" style={{ marginBottom: 16 }}>
                  {siteTabs.map(tab => (
                    <button key={tab.id} className={`tab-btn ${siteTab === tab.id ? 'active' : ''}`} onClick={() => setSiteTab(tab.id)}>{tab.label}</button>
                  ))}
                </div>
                {siteTab === 'alapadatok' && <SiteBasics site={currentSite} update={updateSite} />}
                {siteTab === 'munkaero' && <SiteWorkforce site={currentSite} update={updateSite} />}
                {siteTab === 'takarmany' && <SiteFeed site={currentSite} update={updateSite} />}
                {siteTab === 'halfajarak' && <SiteFishPrices site={currentSite} update={updateSite} />}
                {siteTab === 'koltsegek' && <SiteCosts site={currentSite} business={business} harvest={harvest} update={updateSite} />}
              </div>
            </div>
          </>
        )}
        {mainTab === 'allomany' && <SiteInventory site={currentSite} species={EXTENSIVE_SPECIES} update={updateSite} />}
        {mainTab === 'lehalaszas' && <BusinessHarvest harvest={harvest} update={updateHarvest} />}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>Felelős: {survey.feltolto.nev}</span>
          <button className="btn btn-secondary" onClick={() => void handleSave()} disabled={saving} style={{ marginLeft: 'auto' }}>
            {saving ? '⟳ Mentés…' : '💾 Mentés'}
          </button>
          <button className="btn btn-primary" onClick={() => void handleSave('KESZ')} disabled={saving}>✓ Lezárás</button>
        </div>
      </div>
    </>
  )
}

function BusinessTab({ data, update }: { data: ExtensiveBusinessData; update: (path: string, value: unknown) => void }) {
  return (
    <>
      <TableCard title="I. Törzsadatok – vállalkozás">
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Halastó típusa</label>
            <select className="form-select" value={data.pond.pondType} onChange={event => update('pond.pondType', event.target.value)}>
              <option value="">— Válassz —</option>
              <option value="kortoltes">Körtöltéses</option>
              <option value="volgyezo">Völgyzárógátas</option>
              <option value="hossztoltes">Hossztöltéses</option>
              <option value="egyeb">Egyéb</option>
            </select>
          </div>
          <NumberField label="Átlagos tó-mélység" value={data.pond.averageDepthM} onChange={value => update('pond.averageDepthM', value)} unit="m" />
        </div>
        <div className="form-grid form-grid-3">
          <NumberField label="Tóterület összesen" value={data.pond.totalAreaHa} onChange={value => update('pond.totalAreaHa', value)} unit="ha" />
          <NumberField label="Üzemeltetett tóterület" value={data.pond.operatedAreaHa} onChange={value => update('pond.operatedAreaHa', value)} unit="ha" />
          <NumberField label="Nádas aránya" value={data.pond.reedSharePercent} onChange={value => update('pond.reedSharePercent', value)} unit="%" />
        </div>
      </TableCard>

      <TableCard title="Vállalkozási munkaerő" note="Az éves óraszám/fő a telepi és egyéb tevékenység, valamint a központi irányítás bontására szolgál.">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Foglalkoztatás</th><th>Összes fő</th><th>Éves óra/fő</th><th>Tógazdaság (fő)</th><th>Egyéb ágazat (fő)</th><th>Központi irányítás (fő)</th></tr></thead>
            <tbody>
              {EXTENSIVE_WORKFORCE.map(item => {
                const key = item.key === 'foallas' ? 'fullTime' : item.key === 'reszmunkaido6' ? 'partTime6h' : 'partTime4h'
                const row = data.workforce[key]
                return <tr key={key}>
                  <td>{item.label}</td>
                  <td><CellNumber value={row.totalCount} onChange={value => update(`workforce.${key}.totalCount`, value)} step="1" /></td>
                  <td><CellNumber value={row.hoursPerPerson} onChange={value => update(`workforce.${key}.hoursPerPerson`, value)} step="1" /></td>
                  <td><CellNumber value={row.pondCount} onChange={value => update(`workforce.${key}.pondCount`, value)} step="1" /></td>
                  <td><CellNumber value={row.otherSectorCount} onChange={value => update(`workforce.${key}.otherSectorCount`, value)} step="1" /></td>
                  <td><CellNumber value={row.centralManagementCount} onChange={value => update(`workforce.${key}.centralManagementCount`, value)} step="1" /></td>
                </tr>
              })}
              <tr><td>Segítő családtag</td><td><CellNumber value={data.workforce.familyHelpers.count} onChange={value => update('workforce.familyHelpers.count', value)} step="1" /></td><td><CellNumber value={data.workforce.familyHelpers.hoursPerPerson} onChange={value => update('workforce.familyHelpers.hoursPerPerson', value)} step="1" /></td><td colSpan={3}>–</td></tr>
              <tr><td>Alkalmi foglalkoztatás a tógazdaságban</td><td colSpan={2}>Nap-fő</td><td><CellNumber value={data.workforce.casualPondDays} onChange={value => update('workforce.casualPondDays', value)} step="1" /></td><td colSpan={2}>–</td></tr>
            </tbody>
          </table>
        </div>
      </TableCard>

      <TableCard title="Támogatások, kártérítés és tevékenységek">
        <div className="form-grid form-grid-3">
          <NumberField label="MAHOP támogatás" value={data.revenues.mahopSupportFt} onChange={value => update('revenues.mahopSupportFt', value)} unit="Ft" step="1" />
          <NumberField label="De minimis támogatás" value={data.revenues.deMinimisSupportFt} onChange={value => update('revenues.deMinimisSupportFt', value)} unit="Ft" step="1" />
          <NumberField label="Válságkezelő támogatás" value={data.revenues.crisisSupportFt} onChange={value => update('revenues.crisisSupportFt', value)} unit="Ft" step="1" />
          <NumberField label="Egyéb tógazdasági támogatás" value={data.revenues.otherPondSupportFt} onChange={value => update('revenues.otherPondSupportFt', value)} unit="Ft" step="1" />
          <NumberField label="Kártérítés" value={data.revenues.indemnitiesFt} onChange={value => update('revenues.indemnitiesFt', value)} unit="Ft" step="1" />
          <YesNoField label="Kereskedelmi tevékenység" value={data.revenues.trade} onChange={value => update('revenues.trade', value)} />
          <YesNoField label="Keltetőüzem működtetése" value={data.revenues.hatchery} onChange={value => update('revenues.hatchery', value)} />
          <NumberField label="Keltetőüzemi árbevétel" value={data.revenues.hatcherySalesFt} onChange={value => update('revenues.hatcherySalesFt', value)} unit="Ft" step="1" />
          <NumberField label="Horgásztatás árbevétele" value={data.revenues.sportFishingSalesFt} onChange={value => update('revenues.sportFishingSalesFt', value)} unit="Ft" step="1" />
        </div>
        <TextField label="Egyéb tógazdasági támogatás megnevezése" value={data.revenues.otherPondSupportDescription} onChange={value => update('revenues.otherPondSupportDescription', value)} />
      </TableCard>

      <TableCard title="Vállalkozási költségek (ÁFA nélkül, Ft)" note="Az ágazati megoszlás százalékos. A lezárásnál a megadott százalékoknak 100%-ot kell adniuk.">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Költségtétel</th><th>Összesen (Ft)</th><th>Tógazdaság (%)</th><th>Egyéb ágazat (%)</th><th>Központi irányítás (%)</th><th>Ellenőrzés</th></tr></thead>
            <tbody>
              {EXTENSIVE_COSTS.map(cost => {
                const row = data.costs[cost.key]
                const sum = (row?.pondPercent ?? 0) + (row?.otherSectorPercent ?? 0) + (row?.centralManagementPercent ?? 0)
                const hasSplit = [row?.pondPercent, row?.otherSectorPercent, row?.centralManagementPercent].some(value => value !== null && value !== undefined)
                return <tr key={cost.key}>
                  <td>{cost.label}</td>
                  <td><CellNumber value={row?.amountFt} onChange={value => update(`costs.${cost.key}.amountFt`, value)} step="1" /></td>
                  <td><CellNumber value={row?.pondPercent} onChange={value => update(`costs.${cost.key}.pondPercent`, value)} step="0.1" /></td>
                  <td><CellNumber value={row?.otherSectorPercent} onChange={value => update(`costs.${cost.key}.otherSectorPercent`, value)} step="0.1" /></td>
                  <td><CellNumber value={row?.centralManagementPercent} onChange={value => update(`costs.${cost.key}.centralManagementPercent`, value)} step="0.1" /></td>
                  <td style={{ color: !hasSplit || Math.abs(sum - 100) < 0.01 ? 'var(--success)' : 'var(--warning)' }}>{hasSplit ? `${sum.toFixed(1)}%` : '–'}</td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      </TableCard>

      <TableCard title="Vállalkozási megjegyzés">
        <textarea className="form-textarea" value={data.notes} onChange={event => update('notes', event.target.value)} rows={3} />
      </TableCard>
    </>
  )
}

function SiteBasics({ site, update }: { site: ExtensiveSiteRecord; update: (path: string, value: unknown) => void }) {
  const data = site.telepiAdat
  return (
    <>
      <TextField label="Telephely címe" value={data.address} onChange={value => update('telepiAdat.address', value)} />
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Halastó típusa</label>
          <select className="form-select" value={data.pond.pondType} onChange={event => update('telepiAdat.pond.pondType', event.target.value)}>
            <option value="">— Válassz —</option><option value="kortoltes">Körtöltéses</option><option value="volgyezo">Völgyzárógátas</option><option value="hossztoltes">Hossztöltéses</option><option value="egyeb">Egyéb</option>
          </select>
        </div>
        <NumberField label="Átlagos tó-mélység" value={data.pond.averageDepthM} onChange={value => update('telepiAdat.pond.averageDepthM', value)} unit="m" />
      </div>
      <div className="form-grid form-grid-4">
        <NumberField label="Tóterület összesen" value={data.pond.totalAreaHa} onChange={value => update('telepiAdat.pond.totalAreaHa', value)} unit="ha" />
        <NumberField label="Üzemeltetett tóterület" value={data.pond.operatedAreaHa} onChange={value => update('telepiAdat.pond.operatedAreaHa', value)} unit="ha" />
        <NumberField label="Nádas aránya" value={data.pond.reedSharePercent} onChange={value => update('telepiAdat.pond.reedSharePercent', value)} unit="%" />
        <NumberField label="Víztükör felület" value={data.pond.waterSurfaceHa} onChange={value => update('telepiAdat.pond.waterSurfaceHa', value)} unit="ha" />
      </div>
      <div className="form-grid form-grid-2" style={{ marginTop: 16 }}>
        <NumberField label="Szervestrágya-felhasználás" value={data.nutrients.organicManureKg} onChange={value => update('telepiAdat.nutrients.organicManureKg', value)} unit="kg" step="1" />
        <NumberField label="Műtrágya-felhasználás" value={data.nutrients.fertilizerKg} onChange={value => update('telepiAdat.nutrients.fertilizerKg', value)} unit="kg" step="1" />
      </div>
      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Telepi megjegyzés</label>
        <textarea className="form-textarea" value={data.notes} onChange={event => update('telepiAdat.notes', event.target.value)} rows={3} />
      </div>
    </>
  )
}

function WorkforceTable({
  workforce, prefix, update, enterprise = false,
}: {
  workforce: ExtensiveTelepiData['workforce']
  prefix: string
  update: (path: string, value: unknown) => void
  enterprise?: boolean
}) {
  const lines = [
    { key: 'fullTime', label: 'Főállásban foglalkoztatottak' },
    { key: 'partTime6h', label: 'Részmunkaidős (6 órás)' },
    { key: 'partTime4h', label: 'Részmunkaidős (4 órás)' },
  ] as const
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead><tr><th>Foglalkoztatás</th>{enterprise && <th>Összes fő</th>}<th>Éves óra/fő</th><th>Tógazdaság (fő)</th><th>Egyéb ágazat (fő)</th><th>Központi irányítás (fő)</th></tr></thead>
        <tbody>
          {lines.map(line => <tr key={line.key}>
            <td>{line.label}</td>
            {enterprise && <td><CellNumber value={(workforce as ExtensiveBusinessData['workforce'])[line.key].totalCount} onChange={value => update(`${prefix}.${line.key}.totalCount`, value)} step="1" /></td>}
            <td><CellNumber value={workforce[line.key].hoursPerPerson} onChange={value => update(`${prefix}.${line.key}.hoursPerPerson`, value)} step="1" /></td>
            <td><CellNumber value={workforce[line.key].pondCount} onChange={value => update(`${prefix}.${line.key}.pondCount`, value)} step="1" /></td>
            <td><CellNumber value={workforce[line.key].otherSectorCount} onChange={value => update(`${prefix}.${line.key}.otherSectorCount`, value)} step="1" /></td>
            <td><CellNumber value={workforce[line.key].centralManagementCount} onChange={value => update(`${prefix}.${line.key}.centralManagementCount`, value)} step="1" /></td>
          </tr>)}
          <tr><td>Segítő családtag</td>{enterprise && <td><CellNumber value={workforce.familyHelpers.count} onChange={value => update(`${prefix}.familyHelpers.count`, value)} step="1" /></td>}<td><CellNumber value={workforce.familyHelpers.hoursPerPerson} onChange={value => update(`${prefix}.familyHelpers.hoursPerPerson`, value)} step="1" /></td><td colSpan={3}>–</td></tr>
          <tr><td>Alkalmi foglalkoztatás a tógazdaságban</td>{enterprise && <td colSpan={2}>Nap-fő</td>}{!enterprise && <td colSpan={1}>Nap-fő</td>}<td><CellNumber value={workforce.casualPondDays} onChange={value => update(`${prefix}.casualPondDays`, value)} step="1" /></td><td colSpan={2}>–</td></tr>
        </tbody>
      </table>
    </div>
  )
}

function SiteWorkforce({ site, update }: { site: ExtensiveSiteRecord; update: (path: string, value: unknown) => void }) {
  return <TableCard title="Telepi munkaerő"><WorkforceTable workforce={site.telepiAdat.workforce} prefix="telepiAdat.workforce" update={update} /></TableCard>
}

function SiteFeed({ site, update }: { site: ExtensiveSiteRecord; update: (path: string, value: unknown) => void }) {
  const data = site.telepiAdat.feed
  return (
    <TableCard title="Takarmányfelhasználás" note="A mennyiségeket kg-ban, az egységárakat Ft/kg-ban rögzítsd. Saját és vásárolt takarmányhoz külön mennyiség és ár tartozik.">
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Takarmány</th><th>Saját mennyiség (kg)</th><th>Saját egységár (Ft/kg)</th><th>Vásárolt mennyiség (kg)</th><th>Vásárolt egységár (Ft/kg)</th></tr></thead>
          <tbody>{EXTENSIVE_FEEDS.map(feed => {
            const row = data[feed.key]
            return <tr key={feed.key}><td>{feed.label}</td>
              <td><CellNumber value={row.ownKg} onChange={value => update(`telepiAdat.feed.${feed.key}.ownKg`, value)} step="1" /></td>
              <td><CellNumber value={row.ownFtPerKg} onChange={value => update(`telepiAdat.feed.${feed.key}.ownFtPerKg`, value)} /></td>
              <td><CellNumber value={row.purchasedKg} onChange={value => update(`telepiAdat.feed.${feed.key}.purchasedKg`, value)} step="1" /></td>
              <td><CellNumber value={row.purchasedFtPerKg} onChange={value => update(`telepiAdat.feed.${feed.key}.purchasedFtPerKg`, value)} /></td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </TableCard>
  )
}

function SiteFishPrices({ site, update }: { site: ExtensiveSiteRecord; update: (path: string, value: unknown) => void }) {
  return <TableCard title="Halfaj- és korcsoportonkénti árak" note="Előnevelt hal beszerzési ára Ft/db, a többi korcsoporté Ft/kg. Az értékesítési árak éves átlagárak és őszi lehalászási árak.">
    {EXTENSIVE_SPECIES.map(species => <div key={species.key} style={{ marginBottom: 18 }}>
      <h4 style={{ marginBottom: 8 }}>{species.label}</h4>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Korcsoport</th><th>Beszerzési ár</th><th>Vásárolt arány (%)</th><th>Éves átlagos eladási ár (Ft/kg)</th><th>Őszi lehalászási ár (Ft/kg)</th></tr></thead>
          <tbody>{EXTENSIVE_AGES.map(age => {
            const row = site.telepiAdat.fishPrices[species.key][age.key]
            return <tr key={age.key}><td>{age.label} <span style={{ color: 'var(--text-muted)', fontSize: '.75rem' }}>({age.purchaseUnit})</span></td>
              <td><CellNumber value={row.purchasePrice} onChange={value => update(`telepiAdat.fishPrices.${species.key}.${age.key}.purchasePrice`, value)} /></td>
              <td><CellNumber value={row.purchasedSharePercent} onChange={value => update(`telepiAdat.fishPrices.${species.key}.${age.key}.purchasedSharePercent`, value)} step="0.1" /></td>
              <td><CellNumber value={row.annualSalePriceFtPerKg} onChange={value => update(`telepiAdat.fishPrices.${species.key}.${age.key}.annualSalePriceFtPerKg`, value)} /></td>
              <td><CellNumber value={row.autumnSalePriceFtPerKg} onChange={value => update(`telepiAdat.fishPrices.${species.key}.${age.key}.autumnSalePriceFtPerKg`, value)} /></td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </div>)}
  </TableCard>
}

function SiteCosts({ site, business, harvest, update }: {
  site: ExtensiveSiteRecord
  business: ExtensiveBusinessData
  harvest: ExtensiveBusinessHarvest
  update: (path: string, value: unknown) => void
}) {
  return <TableCard title="Telepi költségek" note="A telepen közvetlenül megadott költség felülírja a vállalkozási költségből számított felosztást. Ha a munkafüzet nem tud arányt számítani a hiányzó alapadatok miatt, a számított érték üres marad.">
    <div className="table-wrap">
      <table className="data-table">
        <thead><tr><th>Költségtétel</th><th>Közvetlen telepi adat (Ft)</th><th>Automatikus részarány</th><th>Számított költség (Ft)</th><th>Felhasznált költség (Ft)</th></tr></thead>
        <tbody>{EXTENSIVE_COSTS.map(cost => {
          const calculated = calculateSiteCost(cost.key, site, business, harvest)
          return <tr key={cost.key}><td>{cost.label}</td>
            <td><CellNumber value={site.telepiAdat.siteCosts[cost.key]?.directAmountFt} onChange={value => update(`telepiAdat.siteCosts.${cost.key}.directAmountFt`, value)} step="1" /></td>
            <td>{calculated.share === null ? '—' : `${(calculated.share * 100).toFixed(1)}%`}</td>
            <td>{calculated.allocatedFt === null ? '—' : Math.round(calculated.allocatedFt).toLocaleString('hu-HU')}</td>
            <td style={{ color: 'var(--accent-blue)' }}>{calculated.usedFt === null ? '—' : Math.round(calculated.usedFt).toLocaleString('hu-HU')}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
  </TableCard>
}

function SiteInventory({ site, species, update }: {
  site: ExtensiveSiteRecord
  species: typeof EXTENSIVE_SPECIES
  update: (path: string, value: unknown) => void
}) {
  return <>
    <div className="alert alert-info">III/a telepi állományváltozás · {site.nev}. Válts telephelyet a „Telephelyek” lapon az egyes telepek adataihoz.</div>
    {EXTENSIVE_STOCK_SECTIONS.map(section => <TableCard key={section.key} title={section.title}>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Halfaj</th>{section.rows.map(row => <th key={row.key} colSpan={2}>{row.label}</th>)}</tr><tr><th></th>{section.rows.flatMap(row => [<th key={`${row.key}-db`}>Darab (db)</th>, <th key={`${row.key}-kg`}>Tömeg (kg)</th>])}</tr></thead>
          <tbody>{species.map(item => <tr key={item.key}><td>{item.label}</td>{section.rows.flatMap(row => {
            const amount = site.allomanyvaltozas.cohorts[item.key][row.key]
            return [
              <td key={`${row.key}-db`}><CellNumber value={amount.count} onChange={value => update(`allomanyvaltozas.cohorts.${item.key}.${row.key}.count`, value)} step="1" /></td>,
              <td key={`${row.key}-kg`}><CellNumber value={amount.kg} onChange={value => update(`allomanyvaltozas.cohorts.${item.key}.${row.key}.kg`, value)} step="1" /></td>,
            ]
          })}</tr>)}</tbody>
        </table>
      </div>
    </TableCard>)}
  </>
}

function BusinessHarvest({ harvest, update }: { harvest: ExtensiveBusinessHarvest; update: (path: string, value: unknown) => void }) {
  return <TableCard title="III/b Lehalászás – vállalkozás" note="A vállalkozás éves lehalászásának mennyisége halfaj és korcsoport szerint, kg-ban. A nyári lehalászás is ebben az összesítésben szerepel.">
    <div className="table-wrap">
      <table className="data-table">
        <thead><tr><th>Halfaj</th>{EXTENSIVE_HARVEST_AGES.map(age => <th key={age.key}>{age.label} (kg)</th>)}<th>Összesen (kg)</th></tr></thead>
        <tbody>{EXTENSIVE_SPECIES.map(species => {
          const total = EXTENSIVE_HARVEST_AGES.reduce((sum, age) => sum + (harvest.harvestKg[species.key][age.key] ?? 0), 0)
          return <tr key={species.key}><td>{species.label}</td>
            {EXTENSIVE_HARVEST_AGES.map(age => <td key={age.key}><CellNumber value={harvest.harvestKg[species.key][age.key]} onChange={value => update(`harvestKg.${species.key}.${age.key}`, value)} step="1" /></td>)}
            <td style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>{total ? total.toLocaleString('hu-HU') : '—'}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
  </TableCard>
}
