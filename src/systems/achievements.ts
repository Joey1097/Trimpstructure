/**
 * @Input: Zustand, ACHIEVEMENTS, useCombatStore, usePrestigeStore, useBuildingStore, useResearchStore, useArtifactStore, useWorldStore
 * @Output: useAchievementStore - 成就状态管理
 * @Pos: 成就系统，追踪解锁状态和检测条件
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { create } from 'zustand'
import Decimal from 'decimal.js'
import { ACHIEVEMENTS } from '../data/achievements'
import { useCombatStore } from './combat'
import { usePrestigeStore } from './prestige'
import { useBuildingStore } from './buildings'
import { useResearchStore } from './research'
import { useArtifactStore } from './artifacts'
import { useWorldStore } from './world'

export interface AchievementStore {
    unlocked: string[]
    totalPoints: Decimal

    isUnlocked: (id: string) => boolean
    checkAchievements: () => string[]  // 返回新解锁的成就ID
    getProgress: (id: string) => { current: number; target: number }
    claimReward: (id: string) => boolean
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
    unlocked: [],
    totalPoints: new Decimal(0),

    isUnlocked: (id) => {
        return get().unlocked.includes(id)
    },

    getProgress: (id) => {
        const achievement = ACHIEVEMENTS[id]
        if (!achievement) return { current: 0, target: 0 }

        const { type, value } = achievement.condition
        let current = 0

        switch (type) {
            case 'nodesCleared':
                current = useCombatStore.getState().map.totalCleared
                break
            case 'totalPrestige':
                current = usePrestigeStore.getState().prestigeCount
                break
            case 'buildingLevels':
                current = Object.values(useBuildingStore.getState().levels).reduce((a, b) => a + b, 0)
                break
            case 'researchCount':
                current = useResearchStore.getState().completed.length
                break
            case 'artifactCount':
                current = useArtifactStore.getState().artifact.inventory.length
                break
            case 'worldNodes':
                current = useWorldStore.getState().world.purchased.length
                break
        }

        return { current, target: value }
    },

    checkAchievements: () => {
        const newlyUnlocked: string[] = []
        const { unlocked, getProgress } = get()

        for (const achievement of Object.values(ACHIEVEMENTS)) {
            if (unlocked.includes(achievement.id)) continue

            const { current, target } = getProgress(achievement.id)
            if (current >= target) {
                newlyUnlocked.push(achievement.id)
            }
        }

        if (newlyUnlocked.length > 0) {
            set((state) => ({
                unlocked: [...state.unlocked, ...newlyUnlocked]
            }))
        }

        return newlyUnlocked
    },

    claimReward: (id) => {
        const achievement = ACHIEVEMENTS[id]
        if (!achievement) return false
        if (!get().unlocked.includes(id)) return false

        // 成就点数奖励
        if (achievement.reward.type === 'points') {
            set((state) => ({
                totalPoints: state.totalPoints.add(achievement.reward.value)
            }))
        }

        // 乘数奖励由其他系统读取 unlocked 列表处理
        return true
    },
}))
