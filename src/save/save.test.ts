import { describe, it, expect } from 'vitest'
import { useGameStore } from '../state/store'
import { saveState, loadState } from './index'
import Decimal from 'decimal.js'

describe('save/load', () => {
  it('should persist and restore resources and population', async () => {
    useGameStore.getState().addResource('wood', new Decimal(12.34))
    useGameStore.getState().assignPopulation('worker', 7)
    await saveState(useGameStore.getState())
    const partial = await loadState()
    expect(partial).toBeTruthy()
    const p = partial!
    // resource
    // @ts-expect-error 测试用例中故意使用类型错误
    expect(p.resources!.amounts.wood.toNumber()).toBeGreaterThan(0)
    expect(p.population!.assignment.worker).toBe(7)
  })
})
