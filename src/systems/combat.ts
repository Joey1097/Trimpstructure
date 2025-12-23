/**
 * @Input: Zustand, Decimal.js, useWorldStore
 * @Output: useCombatStore - 战斗/地图状态 (节点/路径/战斗属性/掉落)
 * @Pos: 战斗与地图系统，管理节点推进和战斗力计算
 * @Notice: If this file changes, update this block AND the folder's README.
 */

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

export interface CombatSimulation {
  nodeId: string
  nodeName: string
  nodeHp: number
  currentDamage: number
  ttk: number  // Time to Kill in seconds
  startedAt: number
  isActive: boolean
}

export interface CombatStore {
  map: MapState
  combat: CombatState
  simulation: CombatSimulation | null
  startMap: (mapId: string) => void
  clearNode: (nodeId: string) => void
  updateReachable: () => void
  simulateCombat: (nodeId: string) => CombatSimulation | null
  startBattle: (nodeId: string) => void
  tickBattle: () => void
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
  simulation: null,

  startMap: (mapId) => {
    set({ map: { currentMapId: mapId, cleared: [], reachable: ['n1'] }, simulation: null })
  },

  clearNode: (nodeId) => {
    const cleared = [...get().map.cleared]
    if (!cleared.includes(nodeId)) cleared.push(nodeId)
    set({ map: { ...get().map, cleared }, simulation: null })
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

  // 模拟战斗，返回预估 TTK
  simulateCombat: (nodeId) => {
    const node = TEST_MAP[nodeId]
    if (!node) return null

    const { combat } = get()
    // 计算 DPS = 基础攻击 × 根号(装备评分) × 世界乘数 × 神器乘数
    const dps = combat.baseAttack
      .mul(combat.gearScore.sqrt())
      .mul(combat.worldMultiplier)
      .mul(combat.artifactMultiplier)

    // TTK = 节点HP / DPS
    const ttk = Math.ceil(node.hp / dps.toNumber())

    return {
      nodeId,
      nodeName: node.name,
      nodeHp: node.hp,
      currentDamage: 0,
      ttk,
      startedAt: 0,
      isActive: false,
    }
  },

  // 开始战斗
  startBattle: (nodeId) => {
    const sim = get().simulateCombat(nodeId)
    if (!sim) return

    set({
      simulation: {
        ...sim,
        startedAt: Date.now(),
        isActive: true,
      }
    })
  },

  // 每 tick 更新战斗进度
  tickBattle: () => {
    const { simulation, combat } = get()
    if (!simulation || !simulation.isActive) return

    const elapsed = (Date.now() - simulation.startedAt) / 1000
    const dps = combat.baseAttack
      .mul(combat.gearScore.sqrt())
      .mul(combat.worldMultiplier)
      .mul(combat.artifactMultiplier)

    const damage = dps.mul(elapsed).toNumber()

    if (damage >= simulation.nodeHp) {
      // 战斗胜利，清理节点
      get().clearNode(simulation.nodeId)
    } else {
      // 更新伤害进度
      set({
        simulation: { ...simulation, currentDamage: damage }
      })
    }
  },
}))