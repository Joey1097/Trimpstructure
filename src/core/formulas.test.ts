import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { calcPerSecondProduction, calcCombatPower } from './formulas'

describe('formulas', () => {
  it('production scales with assigned population and multipliers', () => {
    const v = calcPerSecondProduction({
      populationAssigned: 10,
      jobEfficiency: new Decimal(1),
      buildingEfficiency: new Decimal(2),
      worldMultiplier: new Decimal(1.5),
      artifactMultiplier: new Decimal(1),
      stateModifier: new Decimal(1),
    })
    expect(v.toNumber()).toBeCloseTo(10 * 2 * 1.5)
  })

  it('combat power uses sqrt gear gain to avoid blow-up', () => {
    const v = calcCombatPower({
      baseAttack: new Decimal(10),
      baseHealth: new Decimal(100),
      baseDefense: new Decimal(25),
      gearScore: new Decimal(100),
      worldMultiplier: new Decimal(1),
      artifactMultiplier: new Decimal(1),
    })
    expect(v.gt(0)).toBe(true)
  })
})

