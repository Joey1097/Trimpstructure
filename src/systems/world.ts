/**
 * @Input: Zustand, Decimal.js, WORLD_NODES (节点配置)
 * @Output: useWorldStore - 世界节点状态 (解锁/购买/货币/乘数)
 * @Pos: 世界节点树系统，管理节点解锁和全局乘数
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { create } from 'zustand'
import Decimal from 'decimal.js'
import { WORLD_NODES } from '../data/worldNodes'

export interface WorldState {
  unlocked: string[]
  purchased: string[]
  currencies: {
    blueprint: Decimal
    memory: Decimal
  }
}

export interface WorldStore {
  world: WorldState
  unlockNode: (id: string) => void
  purchaseNode: (id: string) => boolean
  canPurchase: (nodeId: string) => boolean
  getMultiplier: (key: string) => Decimal
  addCurrency: (key: 'blueprint' | 'memory', delta: Decimal) => void
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  world: {
    unlocked: ['root'],
    purchased: ['root'],
    currencies: {
      blueprint: new Decimal(0),
      memory: new Decimal(0),
    },
  },
  unlockNode: (id) =>
    set((state) => {
      if (state.world.unlocked.includes(id)) return state
      return { world: { ...state.world, unlocked: [...state.world.unlocked, id] } }
    }),
  purchaseNode: (id) => {
    const node = WORLD_NODES[id]
    if (!node) return false
    const state = get().world
    if (state.purchased.includes(id)) return false
    if (!get().canPurchase(id)) return false

    // pay cost
    const nextCurrencies = { ...state.currencies }
    Object.entries(node.cost).forEach(([k, v]) => {
      nextCurrencies[k as keyof typeof nextCurrencies] = nextCurrencies[k as keyof typeof nextCurrencies].sub(v)
    })

    // unlock next
    const nextUnlocked = [...state.unlocked]
    node.unlocks.forEach((u) => {
      if (!nextUnlocked.includes(u)) nextUnlocked.push(u)
    })

    set({
      world: { ...state, currencies: nextCurrencies, purchased: [...state.purchased, id], unlocked: nextUnlocked },
    })
    return true
  },
  canPurchase: (nodeId) => {
    const node = WORLD_NODES[nodeId]
    if (!node) return false
    const state = get().world
    if (state.purchased.includes(nodeId)) return false
    const prereqOk = node.prerequisites.every((p) => state.purchased.includes(p))
    if (!prereqOk) return false
    const canAfford = Object.entries(node.cost).every(([k, v]) => state.currencies[k as keyof typeof state.currencies].gte(v))
    return canAfford
  },
  getMultiplier: (key) => {
    const purchased = get().world.purchased
    let m = new Decimal(1)
    purchased.forEach((id) => {
      const node = WORLD_NODES[id]
      if (node && node.multipliers[key]) m = m.mul(node.multipliers[key]!)
    })
    return m
  },
  addCurrency: (key, delta) =>
    set((state) => ({
      world: { ...state.world, currencies: { ...state.world.currencies, [key]: state.world.currencies[key].add(delta) } },
    })),
}))