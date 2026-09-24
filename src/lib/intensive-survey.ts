export const INTENSIVE_SPECIES = [
  { key: 'afrikaiHarcsa', label: 'Afrikai harcsa' },
  { key: 'egyeb', label: 'Egyéb hal' },
] as const

export const INTENSIVE_AGES = [
  { key: 'larva', label: 'Lárva' },
  { key: 'novendek', label: 'Növendék' },
  { key: 'piaci', label: 'Piaci méretű' },
] as const

export const INTENSIVE_FEEDS = [
  { key: 'eloneveltHaltap', label: 'Előnevelt haltáp' },
  { key: 'haltap', label: 'Haltáp' },
  { key: 'egyebTakarmany', label: 'Egyéb takarmány' },
] as const

export const INTENSIVE_COSTS = [
  { key: 'halbeszerzes', label: 'Halbeszerzés' },
  { key: 'takarmany', label: 'Takarmány' },
  { key: 'allategeszsegugy', label: 'Állategészségügyi költség (meszezés nélkül)' },
  { key: 'villany', label: 'Villanyáram' },
  { key: 'foldgaz', label: 'Földgáz' },
  { key: 'viz', label: 'Vízhasználat' },
  { key: 'uzemanyag', label: 'Üzem- és kenőanyag' },
  { key: 'egyebEnergia', label: 'Egyéb energiaköltség' },
  { key: 'mutragya', label: 'Műtrágyaköltség' },
  { key: 'szervesTragya', label: 'Szervestrágyaköltség' },
  { key: 'egyeb51', label: 'Egyéb 51-es számlaosztály' },
  { key: 'egyeb52', label: 'Egyéb 52-es számlaosztály, bérmunka nélkül' },
  { key: 'egyeb53', label: 'Egyéb 53-as számlaosztály' },
  { key: 'berkoltseg54', label: 'Bérköltség és igénybe vett bérmunka (54)' },
  { key: 'szemelyiKifizetes55', label: 'Személyi jellegű egyéb kifizetések (55)' },
  { key: 'berjarulek56', label: 'Bérjárulékok (56)' },
  { key: 'ertekcsokken57', label: 'Értékcsökkenési leírás (57)' },
  { key: 'anyahalErtekcsokken', label: 'Ebből: anyahal értékcsökkenése' },
] as const

export const INTENSIVE_VOLUME_COSTS = [
  'allategeszsegugy', 'villany', 'foldgaz', 'viz', 'uzemanyag', 'egyebEnergia',
  'mutragya', 'szervesTragya', 'egyeb51', 'egyeb52', 'egyeb53',
] as const

export const INTENSIVE_LABOR_COSTS = [
  'berkoltseg54', 'szemelyiKifizetes55', 'berjarulek56',
] as const

export const INTENSIVE_TECHNOLOGIES = [
  { key: 'ras', label: 'Medencés/kádas recirkulációs rendszer (RAS)' },
  { key: 'atfolyovizes', label: 'Medencés/kádas átfolyóvizes rendszer' },
  { key: 'ketreces', label: 'Ketreces rendszer' },
  { key: 'toAToban', label: 'Tó a tóban rendszer' },
  { key: 'egyeb', label: 'Egyéb' },
] as const

export type IntensiveNumber = number | null
export type IntensiveLabor = {
  hoursPerPerson: IntensiveNumber
  catfishCount: IntensiveNumber
  otherSectorCount: IntensiveNumber
  centralManagementCount: IntensiveNumber
}
export type IntensiveCostAllocation = {
  amountFt: IntensiveNumber
  catfishPercent: IntensiveNumber
  otherSectorPercent: IntensiveNumber
  centralManagementPercent: IntensiveNumber
}

export type IntensiveBusinessData = {
  version: 1
  technologyType: string
  basins: { totalVolumeM3: IntensiveNumber; productionWaterVolumeM3: IntensiveNumber }
  workforce: {
    fullTime: IntensiveLabor
    partTime6h: IntensiveLabor
    partTime4h: IntensiveLabor
    familyHelpers: { count: IntensiveNumber; hoursPerPerson: IntensiveNumber }
    casualCatfishDays: IntensiveNumber
  }
  revenues: {
    deMinimisFt: IntensiveNumber
    crisisSupportFt: IntensiveNumber
    otherSupportFt: IntensiveNumber
    otherSupportDescription: string
    indemnitiesFt: IntensiveNumber
    trade: boolean | null
  }
  costs: Record<string, IntensiveCostAllocation>
  notes: string
}

export type IntensiveFeedLine = {
  ownKg: IntensiveNumber
  purchasedKg: IntensiveNumber
  ownFtPerKg: IntensiveNumber
  purchasedFtPerKg: IntensiveNumber
}
export type IntensiveFishPrice = {
  purchasePriceFtPerKg: IntensiveNumber
  purchasedSharePercent: IntensiveNumber
  annualSalePriceFtPerKg: IntensiveNumber
}
export type IntensiveSiteData = {
  version: 1
  address: string
  technologyType: string
  basins: { totalVolumeM3: IntensiveNumber; productionWaterVolumeM3: IntensiveNumber }
  workforce: {
    fullTime: IntensiveLabor
    partTime6h: IntensiveLabor
    partTime4h: IntensiveLabor
    familyHelpers: { count: IntensiveNumber; hoursPerPerson: IntensiveNumber }
    casualCatfishDays: IntensiveNumber
  }
  feed: Record<string, IntensiveFeedLine>
  fishPrices: Record<string, Record<string, IntensiveFishPrice>>
  siteCosts: Record<string, { directAmountFt: IntensiveNumber }>
  notes: string
}

export type IntensiveStockAmount = { count: IntensiveNumber; kg: IntensiveNumber }
export type IntensiveSiteStock = {
  version: 1
  originalFishPriceFtPerKg: IntensiveNumber
  species: Record<string, {
    openingStock: IntensiveStockAmount
    larvaeStocked: IntensiveStockAmount
    juvenilesStocked: IntensiveStockAmount
    producedJuvenilesSold: IntensiveStockAmount
    foodSizeFishProduced: IntensiveStockAmount
    closingStock: IntensiveStockAmount
  }>
}

export type IntensiveReportLine = {
  count: IntensiveNumber
  kg: IntensiveNumber
  productionVolumeM3: IntensiveNumber
}
export type IntensiveBusinessReport = {
  version: 1
  rows: {
    totalFishProduced: IntensiveReportLine
    foodSizeFishProduced: IntensiveReportLine
    producedFoodFishSold: IntensiveReportLine
    producedJuvenilesSold: IntensiveReportLine
    ownProcessorFish: IntensiveReportLine
    broodstockAtYearEnd: IntensiveReportLine
    juvenilesAtYearEnd: IntensiveReportLine
    fertilizedEggsMillion: IntensiveNumber
    furtherRaisedLarvaeMillion: IntensiveNumber
  }
}

export type IntensiveSiteRecord = {
  id?: number
  sorszam: number
  nev: string
  telepiAdat: IntensiveSiteData
  allomanyvaltozas: IntensiveSiteStock
}

function blankLabor(hoursPerPerson: IntensiveNumber = null): IntensiveLabor {
  return { hoursPerPerson, catfishCount: null, otherSectorCount: null, centralManagementCount: null }
}

export function createEmptyIntensiveBusiness(): IntensiveBusinessData {
  const costs: Record<string, IntensiveCostAllocation> = {}
  for (const item of INTENSIVE_COSTS) {
    costs[item.key] = { amountFt: null, catfishPercent: null, otherSectorPercent: null, centralManagementPercent: null }
  }
  // The supplied template has these zero splits and defaults account class 53 to central management.
  costs.allategeszsegugy.catfishPercent = 0
  costs.allategeszsegugy.otherSectorPercent = 0
  costs.allategeszsegugy.centralManagementPercent = 0
  costs.mutragya.catfishPercent = 0
  costs.mutragya.otherSectorPercent = 0
  costs.mutragya.centralManagementPercent = 0
  costs.szervesTragya.catfishPercent = 0
  costs.szervesTragya.otherSectorPercent = 0
  costs.szervesTragya.centralManagementPercent = 0
  costs.egyeb53.catfishPercent = 0
  costs.egyeb53.otherSectorPercent = 0
  costs.egyeb53.centralManagementPercent = 100
  return {
    version: 1,
    technologyType: '',
    basins: { totalVolumeM3: null, productionWaterVolumeM3: null },
    workforce: {
      fullTime: blankLabor(2000),
      partTime6h: blankLabor(1500),
      partTime4h: blankLabor(1000),
      familyHelpers: { count: null, hoursPerPerson: null },
      casualCatfishDays: null,
    },
    revenues: {
      deMinimisFt: null,
      crisisSupportFt: null,
      otherSupportFt: null,
      otherSupportDescription: '',
      indemnitiesFt: null,
      trade: null,
    },
    costs,
    notes: '',
  }
}

export function createEmptyIntensiveSiteData(): IntensiveSiteData {
  const feed: Record<string, IntensiveFeedLine> = {}
  for (const item of INTENSIVE_FEEDS) feed[item.key] = { ownKg: null, purchasedKg: null, ownFtPerKg: null, purchasedFtPerKg: null }
  const fishPrices: IntensiveSiteData['fishPrices'] = {}
  for (const species of INTENSIVE_SPECIES) {
    fishPrices[species.key] = {}
    for (const age of INTENSIVE_AGES) {
      fishPrices[species.key][age.key] = { purchasePriceFtPerKg: null, purchasedSharePercent: null, annualSalePriceFtPerKg: null }
    }
  }
  const siteCosts: IntensiveSiteData['siteCosts'] = {}
  for (const cost of INTENSIVE_COSTS) siteCosts[cost.key] = { directAmountFt: null }
  return {
    version: 1,
    address: '',
    technologyType: '',
    basins: { totalVolumeM3: null, productionWaterVolumeM3: null },
    workforce: {
      fullTime: blankLabor(2000),
      partTime6h: blankLabor(1500),
      partTime4h: blankLabor(1000),
      familyHelpers: { count: null, hoursPerPerson: null },
      casualCatfishDays: null,
    },
    feed,
    fishPrices,
    siteCosts,
    notes: '',
  }
}

export function createEmptyIntensiveSiteStock(): IntensiveSiteStock {
  const emptyAmount = (): IntensiveStockAmount => ({ count: null, kg: null })
  const species: IntensiveSiteStock['species'] = {}
  for (const item of INTENSIVE_SPECIES) {
    species[item.key] = {
      openingStock: emptyAmount(),
      larvaeStocked: emptyAmount(),
      juvenilesStocked: emptyAmount(),
      producedJuvenilesSold: emptyAmount(),
      foodSizeFishProduced: emptyAmount(),
      closingStock: emptyAmount(),
    }
  }
  species.afrikaiHarcsa.larvaeStocked.count = 0
  return { version: 1, originalFishPriceFtPerKg: null, species }
}

function emptyReportLine(): IntensiveReportLine {
  return { count: null, kg: null, productionVolumeM3: null }
}

export function createEmptyIntensiveBusinessReport(): IntensiveBusinessReport {
  return {
    version: 1,
    rows: {
      totalFishProduced: emptyReportLine(),
      foodSizeFishProduced: emptyReportLine(),
      producedFoodFishSold: emptyReportLine(),
      producedJuvenilesSold: emptyReportLine(),
      ownProcessorFish: emptyReportLine(),
      broodstockAtYearEnd: emptyReportLine(),
      juvenilesAtYearEnd: emptyReportLine(),
      fertilizedEggsMillion: null,
      furtherRaisedLarvaeMillion: null,
    },
  }
}

export function mergeIntensiveDefaults<T>(defaults: T, value: unknown): T {
  if (defaults && typeof defaults === 'object' && !Array.isArray(defaults)) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
    const result: Record<string, unknown> = { ...(defaults as Record<string, unknown>) }
    for (const [key, defaultValue] of Object.entries(defaults as Record<string, unknown>)) {
      result[key] = mergeIntensiveDefaults(defaultValue, source[key])
    }
    for (const [key, sourceValue] of Object.entries(source)) if (!(key in result)) result[key] = sourceValue
    return result as T
  }
  return (value === undefined ? defaults : value) as T
}

export function intensiveLaborHours(workforce: IntensiveSiteData['workforce'] | IntensiveBusinessData['workforce']): number {
  const lineHours = (line: IntensiveLabor) => (line.catfishCount ?? 0) * (line.hoursPerPerson ?? 0)
  return lineHours(workforce.fullTime) + lineHours(workforce.partTime6h) + lineHours(workforce.partTime4h)
    + (workforce.familyHelpers.count ?? 0) * (workforce.familyHelpers.hoursPerPerson ?? 0)
    + (workforce.casualCatfishDays ?? 0) * 8
}

export function intensiveSiteCost(
  costKey: string,
  site: IntensiveSiteRecord,
  business: IntensiveBusinessData,
): { share: number | null; allocatedFt: number | null; usedFt: number | null; basis: 'volume' | 'labor' | 'direct' } {
  const basis = INTENSIVE_VOLUME_COSTS.includes(costKey as typeof INTENSIVE_VOLUME_COSTS[number])
    ? 'volume'
    : INTENSIVE_LABOR_COSTS.includes(costKey as typeof INTENSIVE_LABOR_COSTS[number]) ? 'labor' : 'direct'
  let share: number | null = null
  if (basis === 'volume') {
    const total = business.basins.productionWaterVolumeM3
    if (total !== null && total > 0) share = (site.telepiAdat.basins.productionWaterVolumeM3 ?? 0) / total
  } else if (basis === 'labor') {
    const total = intensiveLaborHours(business.workforce)
    if (total > 0) share = intensiveLaborHours(site.telepiAdat.workforce) / total
  }
  const enterpriseCost = business.costs[costKey]
  const allocatedFt = share === null || !enterpriseCost || enterpriseCost.amountFt === null || enterpriseCost.catfishPercent === null
    ? null
    : enterpriseCost.amountFt * enterpriseCost.catfishPercent / 100 * share
  const directFt = site.telepiAdat.siteCosts[costKey]?.directAmountFt ?? null
  const usedFt = directFt !== null && directFt > 0 ? directFt : allocatedFt
  return { share, allocatedFt, usedFt, basis }
}
