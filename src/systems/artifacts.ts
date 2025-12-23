/**
 * @Input: Zustand, Decimal.js
 * @Output: useArtifactStore - 神器状态 (背包/装备/预设/乘数计算), 含M4扩展神器池
 * @Pos: 神器系统，提供装备管理和属性加成
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { create } from 'zustand'
import Decimal from 'decimal.js'

export interface Artifact {
  id: string
  name: string
  slot: number
  tags: ('burst' | 'sustain' | 'control' | 'economy')[]
  baseStats: Partial<Record<string, Decimal>>
  level: number
}

export interface ArtifactPreset {
  name: string
  slots: (string | null)[]
}

export interface ArtifactState {
  inventory: Artifact[]
  equipped: (string | null)[]
  presets: ArtifactPreset[]
  activePreset: number
}

export interface ArtifactStore {
  artifact: ArtifactState
  equipArtifact: (invId: string, slotIdx: number) => void
  unequipSlot: (slotIdx: number) => void
  switchPreset: (idx: number) => void
  getArtifactMultiplier: (key: string) => Decimal
}

const SAMPLE_ARTIFACTS: Artifact[] = [
  // === 基础神器 ===
  {
    id: 'a1',
    name: '爆发指环',
    slot: 0,
    tags: ['burst'],
    baseStats: { attack: new Decimal(1.3) },
    level: 1,
  },
  {
    id: 'a2',
    name: '稳定护符',
    slot: 1,
    tags: ['sustain'],
    baseStats: { defense: new Decimal(1.25) },
    level: 1,
  },

  // === M4 新增神器 ===
  {
    id: 'a3',
    name: '时光沙漏',
    slot: 2,
    tags: ['control'],
    baseStats: { timeBonus: new Decimal(1.2) },
    level: 1,
  },
  {
    id: 'a4',
    name: '黄金塔罗',
    slot: 3,
    tags: ['economy'],
    baseStats: { resource: new Decimal(1.35) },
    level: 1,
  },
  {
    id: 'a5',
    name: '破盾之锤',
    slot: 4,
    tags: ['burst'],
    baseStats: { attack: new Decimal(1.2), shieldDamage: new Decimal(1.4) },
    level: 1,
  },
  {
    id: 'a6',
    name: '生命宝珠',
    slot: 0,
    tags: ['sustain'],
    baseStats: { health: new Decimal(1.5) },
    level: 1,
  },
  {
    id: 'a7',
    name: '疾速靴',
    slot: 1,
    tags: ['control'],
    baseStats: { gatherSpeed: new Decimal(1.25) },
    level: 1,
  },
  {
    id: 'a8',
    name: '研究法典',
    slot: 2,
    tags: ['economy'],
    baseStats: { researchSpeed: new Decimal(1.3) },
    level: 1,
  },
  {
    id: 'a9',
    name: '冰霜之心',
    slot: 3,
    tags: ['burst', 'sustain'],
    baseStats: { attack: new Decimal(1.15), defense: new Decimal(1.15) },
    level: 1,
  },
  {
    id: 'a10',
    name: '虚空徽章',
    slot: 4,
    tags: ['burst', 'control'],
    baseStats: { attack: new Decimal(1.4), timeBonus: new Decimal(1.1) },
    level: 1,
  },
]

export const useArtifactStore = create<ArtifactStore>((set, get) => ({
  artifact: {
    inventory: [...SAMPLE_ARTIFACTS],
    equipped: [null, null, null, null, null],
    presets: [
      { name: '推图', slots: ['a1', 'a2', null, null, null] },
      { name: '资源', slots: [null, null, null, null, null] },
    ],
    activePreset: 0,
  },
  equipArtifact: (invId, slotIdx) => {
    const inv = get().artifact.inventory
    const art = inv.find((i) => i.id === invId)
    if (!art) return
    const nextEquipped = [...get().artifact.equipped]
    // unequip from other slots
    for (let i = 0; i < nextEquipped.length; i++) if (nextEquipped[i] === invId) nextEquipped[i] = null
    nextEquipped[slotIdx] = invId
    set({ artifact: { ...get().artifact, equipped: nextEquipped } })
  },
  unequipSlot: (slotIdx) => {
    const next = [...get().artifact.equipped]
    next[slotIdx] = null
    set({ artifact: { ...get().artifact, equipped: next } })
  },
  switchPreset: (idx) => {
    const preset = get().artifact.presets[idx]
    if (!preset) return
    set({ artifact: { ...get().artifact, activePreset: idx, equipped: [...preset.slots] } })
  },
  getArtifactMultiplier: (key) => {
    const equipped = get().artifact.equipped
    let m = new Decimal(1)
    equipped.forEach((id) => {
      if (!id) return
      const art = get().artifact.inventory.find((i) => i.id === id)
      if (art && art.baseStats[key]) m = m.mul(art.baseStats[key]!)
    })
    return m
  },
}))