import { create } from 'zustand'
import Decimal from 'decimal.js'

export type ResourceKey = 'wood' | 'stone' | 'iron' | 'food' | 'crystal'

export interface ResourcesState {
  amounts: Record<ResourceKey, Decimal>
  caps: Record<ResourceKey, Decimal>
  multipliers: Record<ResourceKey, Decimal>
}

export interface PopulationState {
  total: number
  assignment: {
    worker: number
    builder: number
    researcher: number
    soldier: number
    scout: number
  }
}

export interface GameState {
  tickSeconds: number
  lastTickAt: number
  resources: ResourcesState
  population: PopulationState
  worldMultiplier: Decimal
  artifactMultiplier: Decimal
  hydrate: (partial: Partial<GameState>) => void
  setTickSeconds: (s: number) => void
  setLastTickAt: (t: number) => void
  assignPopulation: (role: keyof PopulationState['assignment'], value: number) => void
  setTotalPopulation: (v: number) => void
  addResource: (key: ResourceKey, delta: Decimal) => void
  setResourceCap: (key: ResourceKey, cap: Decimal) => void
  setResourceMultiplier: (key: ResourceKey, mul: Decimal) => void
}

const initialAmount = new Decimal(0)
const initialCap = new Decimal(100)
const initialMul = new Decimal(1)

export const useGameStore = create<GameState>((set) => ({
  tickSeconds: 1,
  lastTickAt: Date.now(),
  resources: {
    amounts: {
      wood: initialAmount,
      stone: initialAmount,
      iron: initialAmount,
      food: initialAmount,
      crystal: initialAmount,
    },
    caps: {
      wood: initialCap,
      stone: initialCap,
      iron: initialCap,
      food: initialCap,
      crystal: initialCap,
    },
    multipliers: {
      wood: initialMul,
      stone: initialMul,
      iron: initialMul,
      food: initialMul,
      crystal: initialMul,
    },
  },
  population: {
    total: 10,
    assignment: {
      worker: 5,
      builder: 2,
      researcher: 1,
      soldier: 1,
      scout: 1,
    },
  },
  worldMultiplier: new Decimal(1),
  artifactMultiplier: new Decimal(1),
  hydrate: (partial) => set((state) => ({ ...state, ...partial })),
  setTickSeconds: (s) => set({ tickSeconds: s }),
  setLastTickAt: (t) => set({ lastTickAt: t }),
  assignPopulation: (role, value) =>
    set((state) => ({
      population: {
        ...state.population,
        assignment: { ...state.population.assignment, [role]: value },
      },
    })),
  setTotalPopulation: (v) => set((state) => ({ population: { ...state.population, total: v } })),
  addResource: (key, delta) =>
    set((state) => {
      const next = state.resources.amounts[key].add(delta)
      const capped = Decimal.min(next, state.resources.caps[key])
      return { resources: { ...state.resources, amounts: { ...state.resources.amounts, [key]: capped } } }
    }),
  setResourceCap: (key, cap) =>
    set((state) => ({ resources: { ...state.resources, caps: { ...state.resources.caps, [key]: cap } } })),
  setResourceMultiplier: (key, mul) =>
    set((state) => ({ resources: { ...state.resources, multipliers: { ...state.resources.multipliers, [key]: mul } } })),
}))
