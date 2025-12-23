/**
 * @Input: Zustand, Decimal.js, useWorldStore, MAPS
 * @Output: useCombatStore - 战斗/地图状态 (节点/路径/战斗属性/掉落)
 * @Pos: 战斗与地图系统，管理节点推进和战斗力计算
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { create } from 'zustand'
import Decimal from 'decimal.js'
import { useWorldStore } from './world'
import { MAPS, type GameMap } from '../data/maps'

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
  totalCleared: number  // 跨地图总通关数
}

export interface CombatState {
  baseAttack: Decimal
  baseHealth: Decimal
  baseDefense: Decimal
  gearScore: Decimal
  worldMultiplier: Decimal
  artifactMultiplier: Decimal
  shieldBreaker: boolean  // 是否解锁破盾
}

export interface CombatSimulation {
  nodeId: string
  nodeName: string
  nodeHp: number
  nodeType: MapNode['type']
  currentDamage: number
  ttk: number  // Time to Kill in seconds
  startedAt: number
  isActive: boolean
  timeLimit?: number  // 限时节点的时间限制
}

export interface CombatStore {
  map: MapState
  combat: CombatState
  simulation: CombatSimulation | null
  getCurrentMap: () => GameMap | null
  getNode: (nodeId: string) => MapNode | null
  switchMap: (mapId: string) => void
  startMap: (mapId: string) => void
  clearNode: (nodeId: string) => void
  updateReachable: () => void
  simulateCombat: (nodeId: string) => CombatSimulation | null
  startBattle: (nodeId: string) => void
  tickBattle: () => void
  canDamageNode: (node: MapNode) => boolean
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  map: { currentMapId: 'tutorial', cleared: [], reachable: ['t1'], totalCleared: 0 },
  combat: {
    baseAttack: new Decimal(10),
    baseHealth: new Decimal(100),
    baseDefense: new Decimal(5),
    gearScore: new Decimal(1),
    worldMultiplier: new Decimal(1),
    artifactMultiplier: new Decimal(1),
    shieldBreaker: false,
  },
  simulation: null,

  getCurrentMap: () => {
    return MAPS[get().map.currentMapId] || null
  },

  getNode: (nodeId) => {
    const map = get().getCurrentMap()
    return map?.nodes[nodeId] || null
  },

  switchMap: (mapId) => {
    const map = MAPS[mapId]
    if (!map) return
    set({
      map: { ...get().map, currentMapId: mapId, cleared: [], reachable: [map.entryNode] },
      simulation: null,
    })
  },

  startMap: (mapId) => {
    const map = MAPS[mapId]
    if (!map) return
    set({
      map: { currentMapId: mapId, cleared: [], reachable: [map.entryNode], totalCleared: get().map.totalCleared },
      simulation: null
    })
  },

  clearNode: (nodeId) => {
    const cleared = [...get().map.cleared]
    if (!cleared.includes(nodeId)) cleared.push(nodeId)
    const totalCleared = get().map.totalCleared + 1
    set({ map: { ...get().map, cleared, totalCleared }, simulation: null })
    get().updateReachable()

    // drop rewards
    const node = get().getNode(nodeId)
    if (node) {
      node.drops.forEach((d: DropChance) => {
        if (d.id === 'blueprint') useWorldStore.getState().addCurrency('blueprint', new Decimal(d.weight))
        if (d.id === 'memory') useWorldStore.getState().addCurrency('memory', new Decimal(d.weight))
      })
    }
  },

  updateReachable: () => {
    const map = get().getCurrentMap()
    if (!map) return

    const cleared = get().map.cleared
    const reachable: string[] = []
    Object.values(map.nodes).forEach((n: MapNode) => {
      const fromCleared = n.adjacent.some((a: string) => cleared.includes(a))
      if (cleared.includes(n.id)) return
      if (fromCleared || n.id === map.entryNode) reachable.push(n.id)
    })
    set({ map: { ...get().map, reachable } })
  },

  canDamageNode: (node) => {
    if (node.type === 'normal' || node.type === 'timed') return true
    if (node.type === 'shield') return get().combat.shieldBreaker
    if (node.type === 'protected') {
      // 保护节点需要相邻节点都被清除
      const cleared = get().map.cleared
      return node.adjacent.every(a => cleared.includes(a))
    }
    return true
  },

  // 模拟战斗，返回预估 TTK
  simulateCombat: (nodeId) => {
    const node = get().getNode(nodeId)
    if (!node) return null

    const { combat } = get()
    // 计算 DPS = 基础攻击 × 根号(装备评分) × 世界乘数 × 神器乘数
    let dps = combat.baseAttack
      .mul(combat.gearScore.sqrt())
      .mul(combat.worldMultiplier)
      .mul(combat.artifactMultiplier)

    // 护盾节点如果没有破盾能力，伤害减半
    if (node.type === 'shield' && !combat.shieldBreaker) {
      dps = dps.mul(0.5)
    }

    // TTK = 节点HP / DPS
    const ttk = Math.ceil(node.hp / dps.toNumber())

    return {
      nodeId,
      nodeName: node.name,
      nodeHp: node.hp,
      nodeType: node.type,
      currentDamage: 0,
      ttk,
      startedAt: 0,
      isActive: false,
      timeLimit: node.timeLimit,
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

    // 限时节点超时检查
    if (simulation.timeLimit && elapsed >= simulation.timeLimit) {
      // 超时失败，重置战斗
      set({ simulation: null })
      return
    }

    let dps = combat.baseAttack
      .mul(combat.gearScore.sqrt())
      .mul(combat.worldMultiplier)
      .mul(combat.artifactMultiplier)

    // 护盾减伤
    const node = get().getNode(simulation.nodeId)
    if (node?.type === 'shield' && !combat.shieldBreaker) {
      dps = dps.mul(0.5)
    }

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