/**
 * @Input: idb (IndexedDB), Decimal.js, 所有游戏 Store (game/combat/prestige/world/building/research/artifact/achievement/daily/automation)
 * @Output: saveState, loadState, startAutoSave - 存档系统核心功能（完整游戏状态持久化）
 * @Pos: 数据持久化层，管理 IndexedDB 存储和自动保存
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { openDB } from 'idb'
import type { IDBPDatabase } from 'idb'
import Decimal from 'decimal.js'
import type { GameState, ResourceKey } from '../state/store'
import { useGameStore } from '../state/store'
import { useCombatStore } from '../systems/combat'
import { usePrestigeStore } from '../systems/prestige'
import { useWorldStore } from '../systems/world'
import { useBuildingStore } from '../systems/buildings'
import { useResearchStore } from '../systems/research'
import { useArtifactStore } from '../systems/artifacts'
import { useAchievementStore } from '../systems/achievements'
import { useDailyStore } from '../systems/daily'
import { useAutomationStore } from '../systems/automation'

export interface SaveMeta {
  version: string
  timestamp: number
  playtime: number
  seed: number
}

// === 序列化辅助函数 ===

// 递归将对象中的 Decimal 转为字符串
function serializeDecimals(obj: unknown): unknown {
  if (obj instanceof Decimal) {
    return { __decimal: obj.toString() }
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimals)
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      result[k] = serializeDecimals(v)
    }
    return result
  }
  return obj
}

// 递归将 { __decimal: "..." } 还原为 Decimal
function deserializeDecimals(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(deserializeDecimals)
  }
  if (obj !== null && typeof obj === 'object') {
    const record = obj as Record<string, unknown>
    if ('__decimal' in record && typeof record.__decimal === 'string') {
      return new Decimal(record.__decimal)
    }
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(record)) {
      result[k] = deserializeDecimals(v)
    }
    return result
  }
  return obj
}

export interface SavePayload {
  meta: SaveMeta
  player: {
    resources: {
      amounts: Record<string, string>
      caps: Record<string, string>
      multipliers: Record<string, string>
    }
    population: GameState['population']
  }
  // === 系统状态 ===
  combat: {
    map: { currentMapId: string; cleared: string[]; reachable: string[]; totalCleared: number }
    combat: unknown  // 序列化后的 CombatState
  }
  prestige: {
    legacyPoints: string
    prestigeCount: number
    totalLegacyPoints: string
    legacyMultiplier: string
    awakeningCrystals: string
    awakeningCount: number
    awakeningMultiplier: string
  }
  world: {
    unlocked: string[]
    purchased: string[]
    currencies: { blueprint: string; memory: string }
  }
  building: {
    levels: Record<string, number>
  }
  research: {
    completed: string[]
    current: { researchId: string; startedAt: number; duration: number } | null
  }
  artifact: unknown  // 序列化后的 ArtifactState
  achievement: {
    unlocked: string[]
    totalPoints: string
  }
  daily: {
    lastLoginDate: string | null
    loginStreak: number
    todayTasks: unknown[]  // 序列化后保留
    taskProgress: unknown
    streakClaimed: boolean
  }
  automation: {
    rules: unknown[]  // 序列化后保留
  }
  settings: Record<string, unknown>
}

let db: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (db) return db
  db = await openDB('trimpstructure', 2, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('saves')) {
        database.createObjectStore('saves')
      }
      if (!database.objectStoreNames.contains('meta')) {
        database.createObjectStore('meta')
      }
    },
  })
  return db!
}

export async function saveState(state: GameState): Promise<void> {
  const combatState = useCombatStore.getState()
  const prestigeState = usePrestigeStore.getState()
  const worldState = useWorldStore.getState()
  const buildingState = useBuildingStore.getState()
  const researchState = useResearchStore.getState()
  const artifactState = useArtifactStore.getState()
  const achievementState = useAchievementStore.getState()
  const dailyState = useDailyStore.getState()
  const automationState = useAutomationStore.getState()

  const payload: SavePayload = {
    meta: {
      version: '0.1.0',
      timestamp: Date.now(),
      playtime: 0,
      seed: 0,
    },
    player: {
      resources: {
        amounts: Object.fromEntries(Object.entries(state.resources.amounts).map(([k, v]) => [k, v.toString()])),
        caps: Object.fromEntries(Object.entries(state.resources.caps).map(([k, v]) => [k, v.toString()])),
        multipliers: Object.fromEntries(Object.entries(state.resources.multipliers).map(([k, v]) => [k, v.toString()])),
      },
      population: state.population,
    },
    combat: {
      map: combatState.map,
      combat: serializeDecimals({
        baseAttack: combatState.combat.baseAttack,
        baseHealth: combatState.combat.baseHealth,
        baseDefense: combatState.combat.baseDefense,
        gearScore: combatState.combat.gearScore,
        worldMultiplier: combatState.combat.worldMultiplier,
        artifactMultiplier: combatState.combat.artifactMultiplier,
        shieldBreaker: combatState.combat.shieldBreaker,
      }),
    },
    prestige: {
      legacyPoints: prestigeState.legacyPoints.toString(),
      prestigeCount: prestigeState.prestigeCount,
      totalLegacyPoints: prestigeState.totalLegacyPoints.toString(),
      legacyMultiplier: prestigeState.legacyMultiplier.toString(),
      awakeningCrystals: prestigeState.awakeningCrystals.toString(),
      awakeningCount: prestigeState.awakeningCount,
      awakeningMultiplier: prestigeState.awakeningMultiplier.toString(),
    },
    world: {
      unlocked: worldState.world.unlocked,
      purchased: worldState.world.purchased,
      currencies: {
        blueprint: worldState.world.currencies.blueprint.toString(),
        memory: worldState.world.currencies.memory.toString(),
      },
    },
    building: {
      levels: buildingState.levels,
    },
    research: {
      completed: researchState.completed,
      current: researchState.current,
    },
    artifact: serializeDecimals(artifactState.artifact),
    achievement: {
      unlocked: achievementState.unlocked,
      totalPoints: achievementState.totalPoints.toString(),
    },
    daily: {
      lastLoginDate: dailyState.lastLoginDate,
      loginStreak: dailyState.loginStreak,
      todayTasks: serializeDecimals(dailyState.todayTasks) as unknown[],
      taskProgress: dailyState.taskProgress,
      streakClaimed: dailyState.streakClaimed,
    },
    automation: {
      rules: automationState.automation.rules,
    },
    settings: {},
  }
  const database = await getDB()
  await database.put('saves', payload, 'latest')
  localStorage.setItem('save_summary', JSON.stringify({ timestamp: payload.meta.timestamp, version: payload.meta.version }))
}

export async function loadState(): Promise<Partial<GameState> | null> {
  const database = await getDB()
  const payload = (await database.get('saves', 'latest')) as SavePayload | undefined
  if (!payload) return null

  // === 恢复各系统状态 ===

  // 战斗系统
  if (payload.combat) {
    const combatData = deserializeDecimals(payload.combat.combat) as Record<string, unknown>
    useCombatStore.setState({
      map: payload.combat.map,
      combat: {
        baseAttack: combatData.baseAttack as Decimal,
        baseHealth: combatData.baseHealth as Decimal,
        baseDefense: combatData.baseDefense as Decimal,
        gearScore: combatData.gearScore as Decimal,
        worldMultiplier: combatData.worldMultiplier as Decimal,
        artifactMultiplier: combatData.artifactMultiplier as Decimal,
        shieldBreaker: combatData.shieldBreaker as boolean,
      },
      simulation: null,
    })
  }

  // 传承系统
  if (payload.prestige) {
    usePrestigeStore.setState({
      legacyPoints: new Decimal(payload.prestige.legacyPoints),
      prestigeCount: payload.prestige.prestigeCount,
      totalLegacyPoints: new Decimal(payload.prestige.totalLegacyPoints),
      legacyMultiplier: new Decimal(payload.prestige.legacyMultiplier),
      awakeningCrystals: new Decimal(payload.prestige.awakeningCrystals),
      awakeningCount: payload.prestige.awakeningCount,
      awakeningMultiplier: new Decimal(payload.prestige.awakeningMultiplier),
    })
  }

  // 世界系统
  if (payload.world) {
    useWorldStore.setState({
      world: {
        unlocked: payload.world.unlocked,
        purchased: payload.world.purchased,
        currencies: {
          blueprint: new Decimal(payload.world.currencies.blueprint),
          memory: new Decimal(payload.world.currencies.memory),
        },
      },
    })
  }

  // 建筑系统
  if (payload.building) {
    useBuildingStore.setState({
      levels: payload.building.levels,
    })
  }

  // 研究系统
  if (payload.research) {
    useResearchStore.setState({
      completed: payload.research.completed,
      current: payload.research.current,
    })
  }

  // 神器系统
  if (payload.artifact) {
    const artifactData = deserializeDecimals(payload.artifact) as {
      inventory: Array<{ id: string; name: string; slot: number; tags: ('burst' | 'sustain' | 'control' | 'economy')[]; baseStats: Partial<Record<string, Decimal>>; level: number }>
      equipped: (string | null)[]
      presets: Array<{ name: string; slots: (string | null)[] }>
      activePreset: number
    }
    useArtifactStore.setState({
      artifact: artifactData,
    })
  }

  // 成就系统
  if (payload.achievement) {
    useAchievementStore.setState({
      unlocked: payload.achievement.unlocked,
      totalPoints: new Decimal(payload.achievement.totalPoints),
    })
  }

  // 日常系统
  if (payload.daily) {
    const dailyTasks = deserializeDecimals(payload.daily.todayTasks) as typeof useDailyStore extends { getState: () => infer T } ? T extends { todayTasks: infer U } ? U : never : never
    useDailyStore.setState({
      lastLoginDate: payload.daily.lastLoginDate,
      loginStreak: payload.daily.loginStreak,
      todayTasks: dailyTasks,
      taskProgress: payload.daily.taskProgress as Record<string, { taskId: string; current: number; completed: boolean; claimed: boolean }>,
      streakClaimed: payload.daily.streakClaimed,
    })
  }

  // 自动化系统
  if (payload.automation) {
    useAutomationStore.setState({
      automation: { rules: payload.automation.rules as ReturnType<typeof useAutomationStore.getState>['automation']['rules'] },
    })
  }

  // 返回基础游戏状态
  return {
    resources: {
      amounts: Object.fromEntries(Object.entries(payload.player.resources.amounts).map(([k, v]) => [k as ResourceKey, new Decimal(v as string | number)])) as Record<ResourceKey, Decimal>,
      caps: Object.fromEntries(Object.entries(payload.player.resources.caps).map(([k, v]) => [k as ResourceKey, new Decimal(v as string | number)])) as Record<ResourceKey, Decimal>,
      multipliers: Object.fromEntries(Object.entries(payload.player.resources.multipliers).map(([k, v]) => [k as ResourceKey, new Decimal(v as string | number)])) as Record<ResourceKey, Decimal>,
    },
    population: payload.player.population,
  }
}

export function startAutoSave(intervalMs = 45000): () => void {
  const i = setInterval(() => {
    try {
      const s = useGameStore.getState()
      if (s) saveState(s)
    } catch {
      // 忽略保存错误
    }
  }, intervalMs)
  return () => clearInterval(i)
}
