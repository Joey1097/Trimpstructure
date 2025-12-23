/**
 * @Input: Zustand, Decimal.js, EQUIPMENT, calcTotalGearScore
 * @Output: useEquipmentStore - 装备状态管理 (装备/卸下/总评分计算)
 * @Pos: 装备系统，管理装备槽位和战斗评分加成
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { create } from 'zustand'
import Decimal from 'decimal.js'
import { EQUIPMENT, calcTotalGearScore, type Equipment, type EquipmentSlot } from '../data/equipment'

export interface EquipmentState {
    equipped: Partial<Record<EquipmentSlot, string>>  // slot -> equipment id
}

export interface EquipmentStore {
    equipment: EquipmentState
    equipItem: (equipmentId: string) => boolean
    unequipSlot: (slot: EquipmentSlot) => void
    getEquipped: (slot: EquipmentSlot) => Equipment | null
    getTotalGearScore: () => Decimal
    getEquippedIds: () => string[]
}

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
    equipment: {
        equipped: {},
    },

    equipItem: (equipmentId: string) => {
        const eq = EQUIPMENT[equipmentId]
        if (!eq) return false

        set((state) => ({
            equipment: {
                ...state.equipment,
                equipped: {
                    ...state.equipment.equipped,
                    [eq.slot]: equipmentId,
                },
            },
        }))
        return true
    },

    unequipSlot: (slot: EquipmentSlot) => {
        set((state) => {
            const next = { ...state.equipment.equipped }
            delete next[slot]
            return { equipment: { ...state.equipment, equipped: next } }
        })
    },

    getEquipped: (slot: EquipmentSlot) => {
        const id = get().equipment.equipped[slot]
        return id ? EQUIPMENT[id] || null : null
    },

    getTotalGearScore: () => {
        const ids = get().getEquippedIds()
        return calcTotalGearScore(ids)
    },

    getEquippedIds: () => {
        return Object.values(get().equipment.equipped).filter((id): id is string => !!id)
    },
}))
