/**
 * @Input: Zustand, Decimal.js, BUILDINGS, getBuildingCost, useGameStore
 * @Output: useBuildingStore - 建筑状态管理
 * @Pos: 建筑系统，管理建筑等级和升级逻辑
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { create } from 'zustand'
import Decimal from 'decimal.js'
import { BUILDINGS, getBuildingCost } from '../data/buildings'
import { useGameStore, type ResourceKey } from '../state/store'

export interface BuildingState {
    levels: Record<string, number>
    upgradeBuilding: (buildingId: string) => boolean
    canAfford: (buildingId: string) => boolean
    getLevel: (buildingId: string) => number
}

export const useBuildingStore = create<BuildingState>((set, get) => ({
    levels: {
        warehouse: 0,
        workshop: 0,
        barracks: 0,
        researchLab: 0,
        forge: 0,
    },

    getLevel: (buildingId: string) => {
        return get().levels[buildingId] || 0
    },

    canAfford: (buildingId: string) => {
        const level = get().getLevel(buildingId)
        const building = BUILDINGS[buildingId]
        if (!building || level >= building.maxLevel) return false

        const costs = getBuildingCost(buildingId, level)
        const resources = useGameStore.getState().resources.amounts

        for (const [key, value] of Object.entries(costs)) {
            if (resources[key as ResourceKey].lt(value)) return false
        }
        return true
    },

    upgradeBuilding: (buildingId: string) => {
        if (!get().canAfford(buildingId)) return false

        const level = get().getLevel(buildingId)
        const costs = getBuildingCost(buildingId, level)
        const gameStore = useGameStore.getState()

        // 扣除资源
        for (const [key, value] of Object.entries(costs)) {
            gameStore.addResource(key as ResourceKey, value.neg())
        }

        // 升级建筑
        set((state) => ({
            levels: { ...state.levels, [buildingId]: level + 1 }
        }))

        return true
    },
}))
