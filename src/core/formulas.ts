import Decimal from 'decimal.js'

export interface ProductionFactors {
  populationAssigned: number
  jobEfficiency: Decimal
  buildingEfficiency: Decimal
  worldMultiplier: Decimal
  artifactMultiplier: Decimal
  stateModifier: Decimal
}

export function calcPerSecondProduction(factors: ProductionFactors): Decimal {
  const ppl = new Decimal(factors.populationAssigned)
  return ppl
    .mul(factors.jobEfficiency)
    .mul(factors.buildingEfficiency)
    .mul(factors.worldMultiplier)
    .mul(factors.artifactMultiplier)
    .mul(factors.stateModifier)
}

export interface CombatStats {
  baseAttack: Decimal
  baseHealth: Decimal
  baseDefense: Decimal
  gearScore: Decimal
  worldMultiplier: Decimal
  artifactMultiplier: Decimal
}

export function calcCombatPower(stats: CombatStats): Decimal {
  // gearScore root gain to avoid exponential blow-up
  const gearGain = stats.gearScore.sqrt()
  const base = stats.baseAttack.add(stats.baseHealth.sqrt()).add(stats.baseDefense.sqrt())
  return base.mul(gearGain).mul(stats.worldMultiplier).mul(stats.artifactMultiplier)
}

