export const EXTENSIVE_SPECIES = [
  { key: 'ponty', label: 'Ponty' },
  { key: 'amur', label: 'Amur' },
  { key: 'busa', label: 'Busa' },
  { key: 'harcsa', label: 'Harcsa' },
  { key: 'sullo', label: 'Fogassüllő' },
  { key: 'csuka', label: 'Csuka' },
  { key: 'compo', label: 'Compó' },
  { key: 'egyeb', label: 'Egyéb' },
] as const

export const EXTENSIVE_AGES = [
  { key: 'elonevelt', label: 'Előnevelt', purchaseUnit: 'Ft/db' },
  { key: 'egynyaras', label: 'Egynyaras', purchaseUnit: 'Ft/kg' },
  { key: 'ketnyaras', label: 'Kétnyaras', purchaseUnit: 'Ft/kg' },
  { key: 'haromnyaras', label: 'Háromnyaras', purchaseUnit: 'Ft/kg' },
  { key: 'tobbnyaras', label: 'Többnyaras (anyahal nélkül)', purchaseUnit: 'Ft/kg' },
] as const

export const EXTENSIVE_HARVEST_AGES = [
  { key: 'egynyaras', label: 'Egynyaras' },
  { key: 'ketnyaras', label: 'Kétnyaras' },
  { key: 'haromnyaras', label: 'Háromnyaras' },
  { key: 'tobbnyaras', label: 'Többnyaras' },
] as const

export const EXTENSIVE_FEEDS = [
  { key: 'buza', label: 'Búza' },
  { key: 'kukorica', label: 'Kukorica' },
  { key: 'arpa', label: 'Árpa' },
  { key: 'triticale', label: 'Triticale' },
  { key: 'egyebGabona', label: 'Egyéb gabonaféle' },
  { key: 'szoja', label: 'Szója' },
  { key: 'takarmanyborso', label: 'Takarmányborsó' },
  { key: 'egyebPillangos', label: 'Egyéb pillangós' },
  { key: 'takarmanykeverek', label: 'Takarmánykeverék, táp, kiegészítő' },
  { key: 'ipariFeherje', label: 'Ipari melléktermék, fehérje (pl. húsliszt)' },
  { key: 'ipariSzenhidrat', label: 'Ipari melléktermék, szénhidrát (pl. búzakorpa)' },
  { key: 'mezogazdasagiMellektermek', label: 'Mezőgazdasági melléktermék (pl. törtszem, rostalj)' },
  { key: 'egyebTakarmany', label: 'Egyéb takarmány' },
] as const

export const EXTENSIVE_COSTS = [
  { key: 'halbeszerzes', label: 'Halbeszerzés (51)' },
  { key: 'takarmany', label: 'Takarmány (51)' },
  { key: 'allategeszsegugy', label: 'Állategészségügyi költség, meszezés nélkül' },
  { key: 'villany', label: 'Villanyáram' },
  { key: 'foldgaz', label: 'Földgáz' },
  { key: 'viz', label: 'Vízhasználat' },
  { key: 'uzemanyag', label: 'Üzem- és kenőanyag' },
  { key: 'egyebEnergia', label: 'Egyéb energiaköltség' },
  { key: 'mutragya', label: 'Műtrágya' },
  { key: 'szervesTragya', label: 'Szervestrágya' },
  { key: 'egyeb51', label: 'Egyéb 51-es számlaosztály' },
  { key: 'egyeb52', label: 'Egyéb 52-es számlaosztály, bérmunka nélkül' },
  { key: 'egyeb53', label: 'Egyéb 53-as számlaosztály' },
  { key: 'berkoltseg54', label: 'Bérköltség és igénybe vett bérmunka (54)' },
  { key: 'szemelyiKifizetes55', label: 'Személyi jellegű egyéb kifizetések (55)' },
  { key: 'berjarulek56', label: 'Bérjárulékok (56)' },
  { key: 'ertekcsokken57', label: 'Értékcsökkenési leírás (57)' },
  { key: 'anyahalErtekcsokken', label: 'Ebből: anyahal értékcsökkenése' },
] as const

export const EXTENSIVE_ENTERPRISE_COST_KEYS = [
  'allategeszsegugy', 'villany', 'foldgaz', 'viz', 'uzemanyag', 'egyebEnergia',
  'mutragya', 'szervesTragya', 'egyeb51', 'egyeb52', 'egyeb53',
  'berkoltseg54', 'szemelyiKifizetes55', 'berjarulek56',
  'ertekcsokken57', 'anyahalErtekcsokken',
] as const

export const EXTENSIVE_WORKFORCE = [
  { key: 'foallas', label: 'Főállásban foglalkoztatottak', defaultHours: 2000 },
  { key: 'reszmunkaido6', label: 'Részmunkaidőben foglalkoztatottak (6 óra)', defaultHours: 1500 },
  { key: 'reszmunkaido4', label: 'Részmunkaidőben foglalkoztatottak (4 óra)', defaultHours: 1000 },
] as const

export const EXTENSIVE_STOCK_SECTIONS = [
  {
    key: 'zsengeEsElonevelt',
    title: 'Zsenge → előnevelt és egynyaras',
    rows: [
      { key: 'zsengeKihelyezes', label: 'Zsenge kihelyezés egynyaras nevelésre' },
      { key: 'eloneveltKihelyezes', label: 'Előnevelt kihelyezés egynyaras nevelésre' },
      { key: 'eloneveltLehalaszas', label: 'Előnevelt lehalászás' },
      { key: 'egynyarasLehalaszas', label: 'Egynyaras lehalászás' },
    ],
  },
  {
    key: 'egynyarasKetnyaras',
    title: 'Egynyaras → kétnyaras',
    rows: [
      { key: 'egynyarasKihelyezes', label: 'Egynyaras kihelyezés' },
      { key: 'ketnyarasLehalaszas', label: 'Kétnyaras lehalászás' },
    ],
  },
  {
    key: 'ketnyarasHaromnyaras',
    title: 'Kétnyaras → háromnyaras',
    rows: [
      { key: 'ketnyarasKihelyezes', label: 'Kétnyaras kihelyezés' },
      { key: 'haromnyarasLehalaszas', label: 'Háromnyaras lehalászás' },
    ],
  },
  {
    key: 'idosebbAllomany',
    title: 'Háromnyarasnál idősebb állomány (anyahal nélkül)',
    rows: [
      { key: 'haromVagyTobbnyarasKihelyezes', label: 'Három- vagy többnyaras kihelyezés' },
      { key: 'tobbnyarasLehalaszas', label: 'Többnyaras lehalászás' },
    ],
  },
] as const

export type NumericValue = number | null
export type AllocationBasis = 'harvest' | 'area' | 'labor' | 'manual'

export const EXTENSIVE_ALLOCATION_BASIS: Record<string, AllocationBasis> = {
  allategeszsegugy: 'harvest',
  villany: 'harvest',
  foldgaz: 'harvest',
  viz: 'area',
  uzemanyag: 'harvest',
  egyebEnergia: 'harvest',
  mutragya: 'area',
  szervesTragya: 'area',
  egyeb51: 'harvest',
  egyeb52: 'harvest',
  egyeb53: 'harvest',
  berkoltseg54: 'labor',
  szemelyiKifizetes55: 'labor',
  berjarulek56: 'labor',
  ertekcsokken57: 'area',
  anyahalErtekcsokken: 'area',
}

type LaborLine = {
  hoursPerPerson: NumericValue
  pondCount: NumericValue
  otherSectorCount: NumericValue
  centralManagementCount: NumericValue
}

type CostAllocation = {
  amountFt: NumericValue
  pondPercent: NumericValue
  otherSectorPercent: NumericValue
  centralManagementPercent: NumericValue
}

export type ExtensiveBusinessData = {
  version: 1
  pond: {
    pondType: string
    totalAreaHa: NumericValue
    operatedAreaHa: NumericValue
    averageDepthM: NumericValue
    reedSharePercent: NumericValue
  }
  workforce: {
    fullTime: LaborLine & { totalCount: NumericValue }
    partTime6h: LaborLine & { totalCount: NumericValue }
    partTime4h: LaborLine & { totalCount: NumericValue }
    familyHelpers: { count: NumericValue; hoursPerPerson: NumericValue }
    casualPondDays: NumericValue
  }
  revenues: {
    mahopSupportFt: NumericValue
    deMinimisSupportFt: NumericValue
    crisisSupportFt: NumericValue
    otherPondSupportFt: NumericValue
    otherPondSupportDescription: string
    indemnitiesFt: NumericValue
    trade: boolean | null
    hatchery: boolean | null
    hatcherySalesFt: NumericValue
    sportFishingSalesFt: NumericValue
  }
  costs: Record<string, CostAllocation>
  notes: string
}

export type ExtensiveFeedLine = {
  ownKg: NumericValue
  purchasedKg: NumericValue
  ownFtPerKg: NumericValue
  purchasedFtPerKg: NumericValue
}

export type ExtensiveFishPrice = {
  purchasePrice: NumericValue
  purchasedSharePercent: NumericValue
  annualSalePriceFtPerKg: NumericValue
  autumnSalePriceFtPerKg: NumericValue
}

export type ExtensiveTelepiData = {
  version: 1
  address: string
  pond: {
    pondType: string
    totalAreaHa: NumericValue
    operatedAreaHa: NumericValue
    averageDepthM: NumericValue
    reedSharePercent: NumericValue
    waterSurfaceHa: NumericValue
  }
  workforce: {
    fullTime: LaborLine
    partTime6h: LaborLine
    partTime4h: LaborLine
    familyHelpers: { count: NumericValue; hoursPerPerson: NumericValue }
    casualPondDays: NumericValue
  }
  feed: Record<string, ExtensiveFeedLine>
  nutrients: { organicManureKg: NumericValue; fertilizerKg: NumericValue }
  fishPrices: Record<string, Record<string, ExtensiveFishPrice>>
  siteCosts: Record<string, { directAmountFt: NumericValue }>
  notes: string
}

type StockAmount = { count: NumericValue; kg: NumericValue }
export type ExtensiveSiteInventory = {
  version: 1
  cohorts: Record<string, Record<string, StockAmount>>
}

export type ExtensiveBusinessHarvest = {
  version: 1
  harvestKg: Record<string, Record<string, NumericValue>>
}

export type ExtensiveSiteRecord = {
  id?: number
  sorszam: number
  nev: string
  telepiAdat: ExtensiveTelepiData
  allomanyvaltozas: ExtensiveSiteInventory
}

function blankLaborLine(defaultHours: NumericValue = null): LaborLine {
  return {
    hoursPerPerson: defaultHours,
    pondCount: null,
    otherSectorCount: null,
    centralManagementCount: null,
  }
}

export function createEmptyExtensiveBusiness(): ExtensiveBusinessData {
  const costs: Record<string, CostAllocation> = {}
  for (const cost of EXTENSIVE_COSTS) {
    costs[cost.key] = {
      amountFt: null,
      pondPercent: null,
      otherSectorPercent: null,
      centralManagementPercent: null,
    }
  }
  // The supplied form defaults account class 53 to central management.
  costs.egyeb53.centralManagementPercent = 100
  costs.egyeb53.pondPercent = 0
  costs.egyeb53.otherSectorPercent = 0

  return {
    version: 1,
    pond: { pondType: '', totalAreaHa: null, operatedAreaHa: null, averageDepthM: null, reedSharePercent: null },
    workforce: {
      fullTime: { ...blankLaborLine(2000), totalCount: null },
      partTime6h: { ...blankLaborLine(1500), totalCount: null },
      partTime4h: { ...blankLaborLine(1000), totalCount: null },
      familyHelpers: { count: null, hoursPerPerson: null },
      casualPondDays: null,
    },
    revenues: {
      mahopSupportFt: null,
      deMinimisSupportFt: null,
      crisisSupportFt: null,
      otherPondSupportFt: null,
      otherPondSupportDescription: '',
      indemnitiesFt: null,
      trade: null,
      hatchery: null,
      hatcherySalesFt: null,
      sportFishingSalesFt: null,
    },
    costs,
    notes: '',
  }
}

export function createEmptyExtensiveTelepiData(): ExtensiveTelepiData {
  const feed: Record<string, ExtensiveFeedLine> = {}
  for (const item of EXTENSIVE_FEEDS) {
    feed[item.key] = { ownKg: null, purchasedKg: null, ownFtPerKg: null, purchasedFtPerKg: null }
  }
  const fishPrices: ExtensiveTelepiData['fishPrices'] = {}
  for (const species of EXTENSIVE_SPECIES) {
    fishPrices[species.key] = {}
    for (const age of EXTENSIVE_AGES) {
      fishPrices[species.key][age.key] = {
        purchasePrice: null,
        purchasedSharePercent: null,
        annualSalePriceFtPerKg: null,
        autumnSalePriceFtPerKg: null,
      }
    }
  }
  const siteCosts: ExtensiveTelepiData['siteCosts'] = {}
  for (const cost of EXTENSIVE_COSTS) siteCosts[cost.key] = { directAmountFt: null }

  return {
    version: 1,
    address: '',
    pond: { pondType: '', totalAreaHa: null, operatedAreaHa: null, averageDepthM: null, reedSharePercent: null, waterSurfaceHa: null },
    workforce: {
      fullTime: blankLaborLine(2000),
      partTime6h: blankLaborLine(1500),
      partTime4h: blankLaborLine(1000),
      familyHelpers: { count: null, hoursPerPerson: null },
      casualPondDays: null,
    },
    feed,
    nutrients: { organicManureKg: null, fertilizerKg: null },
    fishPrices,
    siteCosts,
    notes: '',
  }
}

export function createEmptyExtensiveInventory(): ExtensiveSiteInventory {
  const cohorts: ExtensiveSiteInventory['cohorts'] = {}
  for (const species of EXTENSIVE_SPECIES) {
    cohorts[species.key] = {}
    for (const section of EXTENSIVE_STOCK_SECTIONS) {
      for (const row of section.rows) cohorts[species.key][row.key] = { count: null, kg: null }
    }
  }
  return { version: 1, cohorts }
}

export function createEmptyExtensiveBusinessHarvest(): ExtensiveBusinessHarvest {
  const harvestKg: ExtensiveBusinessHarvest['harvestKg'] = {}
  for (const species of EXTENSIVE_SPECIES) {
    harvestKg[species.key] = {}
    for (const age of EXTENSIVE_HARVEST_AGES) harvestKg[species.key][age.key] = null
  }
  return { version: 1, harvestKg }
}

export function deepMergeDefaults<T>(defaults: T, value: unknown): T {
  if (Array.isArray(defaults)) return (Array.isArray(value) ? value : defaults) as T
  if (defaults && typeof defaults === 'object') {
    const source = value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {}
    const output: Record<string, unknown> = { ...(defaults as Record<string, unknown>) }
    for (const [key, defaultValue] of Object.entries(defaults as Record<string, unknown>)) {
      output[key] = deepMergeDefaults(defaultValue, source[key])
    }
    for (const [key, sourceValue] of Object.entries(source)) {
      if (!(key in output)) output[key] = sourceValue
    }
    return output as T
  }
  return (value === undefined ? defaults : value) as T
}

export function sumNumeric(values: Array<number | null | undefined>): number {
  return values.reduce<number>((sum, value) => sum + (typeof value === 'number' && Number.isFinite(value) ? value : 0), 0)
}

export function siteHarvestForAllocation(inventory: ExtensiveSiteInventory): number {
  let total = 0
  for (const species of EXTENSIVE_SPECIES) {
    const rows = inventory.cohorts[species.key] ?? {}
    for (const section of EXTENSIVE_STOCK_SECTIONS) {
      for (const row of section.rows) {
        if (row.key.toLowerCase().includes('lehalaszas') && row.key !== 'eloneveltLehalaszas') {
          total += rows[row.key]?.kg ?? 0
        }
      }
    }
  }
  return total
}

export function businessHarvestTotal(harvest: ExtensiveBusinessHarvest): number {
  return sumNumeric(EXTENSIVE_SPECIES.flatMap(species =>
    EXTENSIVE_HARVEST_AGES.map(age => harvest.harvestKg[species.key]?.[age.key] ?? null)
  ))
}

export function siteLaborHours(data: ExtensiveTelepiData): number {
  const workforce = data.workforce
  return sumNumeric([
    workforce.fullTime.pondCount !== null ? workforce.fullTime.pondCount * (workforce.fullTime.hoursPerPerson ?? 0) : null,
    workforce.partTime6h.pondCount !== null ? workforce.partTime6h.pondCount * (workforce.partTime6h.hoursPerPerson ?? 0) : null,
    workforce.partTime4h.pondCount !== null ? workforce.partTime4h.pondCount * (workforce.partTime4h.hoursPerPerson ?? 0) : null,
    workforce.familyHelpers.count !== null ? workforce.familyHelpers.count * (workforce.familyHelpers.hoursPerPerson ?? 0) : null,
    workforce.casualPondDays !== null ? workforce.casualPondDays * 8 : null,
  ])
}

export function businessPondLaborHours(data: ExtensiveBusinessData): number {
  const workforce = data.workforce
  return sumNumeric([
    workforce.fullTime.pondCount !== null ? workforce.fullTime.pondCount * (workforce.fullTime.hoursPerPerson ?? 0) : null,
    workforce.partTime6h.pondCount !== null ? workforce.partTime6h.pondCount * (workforce.partTime6h.hoursPerPerson ?? 0) : null,
    workforce.partTime4h.pondCount !== null ? workforce.partTime4h.pondCount * (workforce.partTime4h.hoursPerPerson ?? 0) : null,
    workforce.familyHelpers.count !== null ? workforce.familyHelpers.count * (workforce.familyHelpers.hoursPerPerson ?? 0) : null,
    workforce.casualPondDays !== null ? workforce.casualPondDays * 8 : null,
  ])
}

export function siteCostAllocationShare(
  costKey: string,
  site: ExtensiveTelepiData,
  inventory: ExtensiveSiteInventory,
  business: ExtensiveBusinessData,
  businessHarvest: ExtensiveBusinessHarvest,
): number | null {
  const basis = EXTENSIVE_ALLOCATION_BASIS[costKey]
  if (!basis || basis === 'manual') return null

  if (basis === 'harvest') {
    const denominator = businessHarvestTotal(businessHarvest)
    return denominator > 0 ? siteHarvestForAllocation(inventory) / denominator : null
  }

  if (basis === 'area') {
    const numerator = Math.max(0, (site.pond.operatedAreaHa ?? 0) * (1 - (site.pond.reedSharePercent ?? 0) / 100))
    const denominator = Math.max(0, (business.pond.operatedAreaHa ?? 0) * (1 - (business.pond.reedSharePercent ?? 0) / 100))
    return denominator > 0 ? numerator / denominator : null
  }

  const numerator = siteLaborHours(site)
  const denominator = businessPondLaborHours(business)
  return denominator > 0 ? numerator / denominator : null
}

export function calculateSiteCost(
  costKey: string,
  site: ExtensiveSiteRecord,
  business: ExtensiveBusinessData,
  businessHarvest: ExtensiveBusinessHarvest,
): { share: number | null; allocatedFt: number | null; usedFt: number | null } {
  const allocation = siteCostAllocationShare(costKey, site.telepiAdat, site.allomanyvaltozas, business, businessHarvest)
  const enterpriseCost = business.costs[costKey]
  const siteCost = site.telepiAdat.siteCosts[costKey]
  const allocatedFt = allocation === null || !enterpriseCost || enterpriseCost.amountFt === null || enterpriseCost.pondPercent === null
    ? null
    : enterpriseCost.amountFt * enterpriseCost.pondPercent / 100 * allocation
  const directFt = siteCost?.directAmountFt ?? null
  const usedFt = directFt !== null && directFt > 0 ? directFt : allocatedFt
  return { share: allocation, allocatedFt, usedFt }
}
