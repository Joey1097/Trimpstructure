import { openDB } from 'idb'
import type { IDBPDatabase } from 'idb'
import Decimal from 'decimal.js'
import type { GameState } from '../state/store'
import { useGameStore } from '../state/store'

export interface SaveMeta {
  version: string
  timestamp: number
  playtime: number
  seed: number
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
  settings: Record<string, unknown>
}

let db: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (db) return db
  db = await openDB('trimpstructure', 1, {
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
  const payload: SavePayload = {
    meta: {
      version: '0.0.1',
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
