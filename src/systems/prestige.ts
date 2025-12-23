/**
 * @Input: Zustand, Decimal.js, useGameStore, useBuildingStore
 * @Output: usePrestigeStore - 传承系统状态管理
 * @Pos: Prestige 系统，管理传承点和重置逻辑
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { create } from 'zustand'
import Decimal from 'decimal.js'
import { useGameStore } from '../state/store'
import { useBuildingStore } from './buildings'
import { useCombatStore } from './combat'

export interface PrestigeState {
    legacyPoints: Decimal       // 传承点
    prestigeCount: number       // 传承次数
    totalLegacyPoints: Decimal  // 历史总传承点
    legacyMultiplier: Decimal   // 基于传承点的全局乘数

    // === Layer 2: 觉醒 ===
    awakeningCrystals: Decimal  // 觉醒晶体
    awakeningCount: number      // 觉醒次数
    awakeningMultiplier: Decimal // 觉醒乘数

    // 方法
    canPrestige: () => boolean
    getPrestigeGain: () => Decimal
    doPrestige: () => void
    getLegacyMultiplier: () => Decimal

    // Layer 2 方法
    canAwaken: () => boolean
    getAwakeningGain: () => Decimal
    doAwakening: () => void
    getAwakeningMultiplier: () => Decimal
}

// 传承条件：至少通关一张地图（清除 3 个节点）
const MIN_CLEARED_FOR_PRESTIGE = 3
// 觉醒条件：至少 5 次传承
const MIN_PRESTIGE_FOR_AWAKENING = 5

export const usePrestigeStore = create<PrestigeState>((set, get) => ({
    legacyPoints: new Decimal(0),
    prestigeCount: 0,
    totalLegacyPoints: new Decimal(0),
    legacyMultiplier: new Decimal(1),

    // Layer 2: 觉醒
    awakeningCrystals: new Decimal(0),
    awakeningCount: 0,
    awakeningMultiplier: new Decimal(1),

    canPrestige: () => {
        const cleared = useCombatStore.getState().map.cleared.length
        return cleared >= MIN_CLEARED_FOR_PRESTIGE
    },

    getPrestigeGain: () => {
        const cleared = useCombatStore.getState().map.cleared.length
        const buildingLevels = Object.values(useBuildingStore.getState().levels)
            .reduce((sum, lv) => sum + lv, 0)

        const base = new Decimal(cleared)
        const bonus = new Decimal(1).add(new Decimal(buildingLevels).mul(0.1))
        return base.mul(bonus).floor()
    },

    doPrestige: () => {
        if (!get().canPrestige()) return

        const gain = get().getPrestigeGain()
        const newTotal = get().totalLegacyPoints.add(gain)

        set((state) => ({
            legacyPoints: state.legacyPoints.add(gain),
            prestigeCount: state.prestigeCount + 1,
            totalLegacyPoints: newTotal,
            legacyMultiplier: get().getLegacyMultiplier(),
        }))

        // 重置游戏状态
        const initialAmount = new Decimal(0)
        const initialCap = new Decimal(100)

        useGameStore.setState({
            resources: {
                amounts: { wood: initialAmount, stone: initialAmount, iron: initialAmount, food: initialAmount, crystal: initialAmount },
                caps: { wood: initialCap, stone: initialCap, iron: initialCap, food: initialCap, crystal: initialCap },
                multipliers: { wood: new Decimal(1), stone: new Decimal(1), iron: new Decimal(1), food: new Decimal(1), crystal: new Decimal(1) },
            },
            population: { total: 10, assignment: { worker: 5, builder: 2, researcher: 1, soldier: 2, scout: 0 } },
        })

        useBuildingStore.setState({
            levels: { warehouse: 0, workshop: 0, barracks: 0, researchLab: 0, forge: 0 },
        })

        useCombatStore.getState().startMap('tutorial')
    },

    getLegacyMultiplier: () => {
        const points = get().legacyPoints.toNumber()
        if (points <= 0) return new Decimal(1)
        const bonus = Math.log2(1 + points) * 0.1
        return new Decimal(1 + bonus)
    },

    // === Layer 2: 觉醒 ===
    canAwaken: () => {
        return get().prestigeCount >= MIN_PRESTIGE_FOR_AWAKENING
    },

    getAwakeningGain: () => {
        const prestiges = get().prestigeCount
        const legacy = get().totalLegacyPoints.toNumber()
        // 公式：传承次数 × sqrt(传承点总量)
        return new Decimal(Math.floor(prestiges * Math.sqrt(legacy)))
    },

    doAwakening: () => {
        if (!get().canAwaken()) return

        const gain = get().getAwakeningGain()

        set((state) => ({
            awakeningCrystals: state.awakeningCrystals.add(gain),
            awakeningCount: state.awakeningCount + 1,
            awakeningMultiplier: get().getAwakeningMultiplier(),
            // 觉醒重置传承进度但保留晶体
            legacyPoints: new Decimal(0),
            prestigeCount: 0,
            totalLegacyPoints: new Decimal(0),
        }))

        // 执行传承重置
        get().doPrestige()
    },

    getAwakeningMultiplier: () => {
        const crystals = get().awakeningCrystals.toNumber()
        if (crystals <= 0) return new Decimal(1)
        // 公式：1 + 晶体 × 0.05
        return new Decimal(1 + crystals * 0.05)
    },
}))

