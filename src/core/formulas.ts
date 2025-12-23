/**
 * @Input: Decimal.js 库, ProductionFactors/CombatStats 接口参数
 * @Output: calcPerSecondProduction (资源产出计算), calcCombatPower (战斗力计算)
 * @Pos: 核心公式模块，被 loop.ts 和战斗系统调用
 * @Notice: If this file changes, update this block AND the folder's README.
 */

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

