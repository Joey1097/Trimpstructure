/**
 * @Input: Zustand, Decimal.js, RESEARCH, canResearch, useWorldStore
 * @Output: useResearchStore - 研究状态管理
 * @Pos: 研究系统，管理研究进度和完成状态
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { create } from 'zustand'
import Decimal from 'decimal.js'
import { RESEARCH, canResearch } from '../data/research'
import { useWorldStore } from './world'

export interface ResearchProgress {
    researchId: string
    startedAt: number
    duration: number  // 总研究时间（秒）
}

export interface ResearchStore {
    completed: string[]
    current: ResearchProgress | null

    isCompleted: (researchId: string) => boolean
    canStart: (researchId: string) => boolean
    canAfford: (researchId: string) => boolean
    startResearch: (researchId: string) => boolean
    tickResearch: () => void
    getProgress: () => number  // 返回 0-1 进度
}

export const useResearchStore = create<ResearchStore>((set, get) => ({
    completed: [],
    current: null,

    isCompleted: (researchId) => {
        return get().completed.includes(researchId)
    },

    canStart: (researchId) => {
        if (get().current) return false  // 已有研究进行中
        if (get().isCompleted(researchId)) return false
        return canResearch(researchId, get().completed)
    },

    canAfford: (researchId) => {
        const research = RESEARCH[researchId]
        if (!research) return false

        const currencies = useWorldStore.getState().world.currencies
        if (research.baseCost.blueprint && currencies.blueprint.lt(research.baseCost.blueprint)) return false
        if (research.baseCost.memory && currencies.memory.lt(research.baseCost.memory)) return false
        return true
    },

    startResearch: (researchId) => {
        if (!get().canStart(researchId)) return false
        if (!get().canAfford(researchId)) return false

        const research = RESEARCH[researchId]
        if (!research) return false

        // 扣除资源
        const worldStore = useWorldStore.getState()
        if (research.baseCost.blueprint) {
            worldStore.addCurrency('blueprint', research.baseCost.blueprint.neg())
        }
        if (research.baseCost.memory) {
            worldStore.addCurrency('memory', research.baseCost.memory.neg())
        }

        set({
            current: {
                researchId,
                startedAt: Date.now(),
                duration: research.researchTime,
            }
        })

        return true
    },

    tickResearch: () => {
        const { current } = get()
        if (!current) return

        const elapsed = (Date.now() - current.startedAt) / 1000
        if (elapsed >= current.duration) {
            // 研究完成
            set((state) => ({
                completed: [...state.completed, current.researchId],
                current: null,
            }))
        }
    },

    getProgress: () => {
        const { current } = get()
        if (!current) return 0
        const elapsed = (Date.now() - current.startedAt) / 1000
        return Math.min(1, elapsed / current.duration)
    },
}))
