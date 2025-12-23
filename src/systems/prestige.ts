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

    // 传承加成
    legacyMultiplier: Decimal   // 基于传承点的全局乘数

    // 方法
    canPrestige: () => boolean
    getPrestigeGain: () => Decimal
    doPrestige: () => void
    getLegacyMultiplier: () => Decimal
}

// 传承条件：至少通关一张地图（清除 3 个节点）
const MIN_CLEARED_FOR_PRESTIGE = 3

export const usePrestigeStore = create<PrestigeState>((set, get) => ({
    legacyPoints: new Decimal(0),
    prestigeCount: 0,
    totalLegacyPoints: new Decimal(0),
    legacyMultiplier: new Decimal(1),

    canPrestige: () => {
        const cleared = useCombatStore.getState().map.cleared.length
        return cleared >= MIN_CLEARED_FOR_PRESTIGE
    },

    // 计算传承获得的点数：基于通关节点数和建筑总等级
    getPrestigeGain: () => {
        const cleared = useCombatStore.getState().map.cleared.length
        const buildingLevels = Object.values(useBuildingStore.getState().levels)
            .reduce((sum, lv) => sum + lv, 0)

        // 公式：节点数 × (1 + 建筑总等级 × 0.1)
        const base = new Decimal(cleared)
        const bonus = new Decimal(1).add(new Decimal(buildingLevels).mul(0.1))
        return base.mul(bonus).floor()
    },

    doPrestige: () => {
        if (!get().canPrestige()) return

        const gain = get().getPrestigeGain()
        const newTotal = get().totalLegacyPoints.add(gain)

        // 更新传承状态
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
                    wood: new Decimal(1),
                    stone: new Decimal(1),
                    iron: new Decimal(1),
                    food: new Decimal(1),
                    crystal: new Decimal(1),
                },
            },
            population: {
                total: 10,
                assignment: { worker: 5, builder: 2, researcher: 1, soldier: 2, scout: 0 },
            },
        })

        // 重置建筑
        useBuildingStore.setState({
            levels: {
                warehouse: 0,
                workshop: 0,
                barracks: 0,
                researchLab: 0,
                forge: 0,
            },
        })

        // 重置战斗/地图
        useCombatStore.getState().startMap('test')
    },

    // 计算传承乘数：每点传承点提供 5% 加成，使用对数递减
    getLegacyMultiplier: () => {
        const points = get().legacyPoints.toNumber()
        if (points <= 0) return new Decimal(1)

        // 公式：1 + log2(1 + points) × 0.1
        const bonus = Math.log2(1 + points) * 0.1
        return new Decimal(1 + bonus)
    },
}))
