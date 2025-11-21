import { create } from 'zustand'
import Decimal from 'decimal.js'
import { useWorldStore } from './world'

export interface DropChance {
  id: string
  weight: number
  minNode: number
}

export interface MapNode {
  id: string
  name: string
  type: 'normal' | 'shield' | 'timed' | 'protected' | 'env'
  hp: number
  timeLimit?: number
  shieldType?: string
  adjacent: string[]
  drops: DropChance[]
}

export interface MapState {
  currentMapId: string
  cleared: string[]
  reachable: string[]
}

export interface CombatState {
  baseAttack: Decimal
  baseHealth: Decimal
  baseDefense: Decimal
  gearScore: Decimal
  worldMultiplier: Decimal
  artifactMultiplier: Decimal
}

export interface CombatStore {
  map: MapState
  combat: CombatState
  startMap: (mapId: string) => void
  clearNode: (nodeId: string) => void
  updateReachable: () => void
}

export const TEST_MAP: Record<string, MapNode> = {
  n1: { id: 'n1', name: '入口哨站', type: 'normal', hp: 100, adjacent: ['n2'], drops: [{ id: 'blueprint', weight: 1, minNode: 1 }] },
  n2: { id: 'n2', name: '护盾前哨', type: 'shield', hp: 150, shieldType: 'physical', adjacent: ['n3'], drops: [{ id: 'memory', weight: 1, minNode: 2 }] },
  n3: { id: 'n3', name: '核心仓库', type: 'normal', hp: 200, adjacent: [], drops: [{ id: 'blueprint', weight: 1, minNode: 3 }] },
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  map: { currentMapId: 'test', cleared: [], reachable: ['n1'] },
  combat: {
    baseAttack: new Decimal(10),
    baseHealth: new Decimal(100),
    baseDefense: new Decimal(5),
    gearScore: new Decimal(1),
    worldMultiplier: new Decimal(1),
    artifactMultiplier: new Decimal(1),
  },
  startMap: (mapId) => {
    set({ map: { currentMapId: mapId, cleared: [], reachable: ['n1'] } })
  },
  clearNode: (nodeId) => {
    const cleared = [...get().map.cleared]
    if (!cleared.includes(nodeId)) cleared.push(nodeId)
    set({ map: { ...get().map, cleared } })
    get().updateReachable()

    // drop rewards
    const node = TEST_MAP[nodeId]
    if (node) {
      node.drops.forEach((d) => {
        if (d.id === 'blueprint') useWorldStore.getState().addCurrency('blueprint', new Decimal(1))
        if (d.id === 'memory') useWorldStore.getState().addCurrency('memory', new Decimal(1))
      })
    }
  },
  updateReachable: () => {
    const cleared = get().map.cleared
    const reachable: string[] = []
    Object.values(TEST_MAP).forEach((n) => {
      const fromCleared = n.adjacent.some((a) => cleared.includes(a))
      if (cleared.includes(n.id)) return
      if (fromCleared || n.id === 'n1') reachable.push(n.id)
    })
    set({ map: { ...get().map, reachable } })
  },
}))