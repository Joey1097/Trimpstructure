/**
 * @Input: Zustand, DAILY_TASK_POOL, getRandomDailyTasks, LOGIN_STREAK_REWARDS, useWorldStore
 * @Output: useDailyStore - 日常任务状态管理
 * @Pos: 日常系统，管理每日任务和连续登录
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { create } from 'zustand'
import Decimal from 'decimal.js'
import { getRandomDailyTasks, LOGIN_STREAK_REWARDS, type DailyTask } from '../data/dailyTasks'
import { useWorldStore } from './world'

export interface DailyProgress {
    taskId: string
    current: number
    completed: boolean
    claimed: boolean
}

export interface DailyStore {
    lastLoginDate: string | null
    loginStreak: number
    todayTasks: DailyTask[]
    taskProgress: Record<string, DailyProgress>
    streakClaimed: boolean

    checkLogin: () => { isNewDay: boolean; streakReset: boolean }
    refreshTasks: () => void
    updateProgress: (taskType: string, delta?: number) => void
    claimTaskReward: (taskId: string) => boolean
    claimStreakReward: () => boolean
}

// 获取今日日期字符串
function getTodayString(): string {
    return new Date().toISOString().split('T')[0]
}

export const useDailyStore = create<DailyStore>((set, get) => ({
    lastLoginDate: null,
    loginStreak: 0,
    todayTasks: [],
    taskProgress: {},
    streakClaimed: false,

    checkLogin: () => {
        const today = getTodayString()
        const { lastLoginDate, loginStreak } = get()

        if (lastLoginDate === today) {
            return { isNewDay: false, streakReset: false }
        }

        // 计算是否连续
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const isConsecutive = lastLoginDate === yesterdayStr
        const newStreak = isConsecutive ? (loginStreak % 7) + 1 : 1

        set({
            lastLoginDate: today,
            loginStreak: newStreak,
            streakClaimed: false,
        })

        // 刷新今日任务
        get().refreshTasks()

        return { isNewDay: true, streakReset: !isConsecutive }
    },

    refreshTasks: () => {
        const tasks = getRandomDailyTasks(3)
        const progress: Record<string, DailyProgress> = {}

        tasks.forEach(task => {
            progress[task.id] = { taskId: task.id, current: 0, completed: false, claimed: false }
        })

        set({ todayTasks: tasks, taskProgress: progress })
    },

    updateProgress: (taskType, delta = 1) => {
        const { todayTasks, taskProgress } = get()
        const updates: Record<string, DailyProgress> = { ...taskProgress }

        todayTasks.forEach(task => {
            if (task.type === taskType && !updates[task.id]?.completed) {
                const prog = updates[task.id] || { taskId: task.id, current: 0, completed: false, claimed: false }
                prog.current += delta
                if (prog.current >= task.targetValue) {
                    prog.completed = true
                }
                updates[task.id] = prog
            }
        })

        set({ taskProgress: updates })
    },

    claimTaskReward: (taskId) => {
        const { taskProgress, todayTasks } = get()
        const prog = taskProgress[taskId]
        if (!prog || !prog.completed || prog.claimed) return false

        const task = todayTasks.find(t => t.id === taskId)
        if (!task) return false

        // 发放奖励
        const worldStore = useWorldStore.getState()
        if (task.reward.type === 'blueprint') {
            worldStore.addCurrency('blueprint', task.reward.value)
        } else if (task.reward.type === 'memory') {
            worldStore.addCurrency('memory', task.reward.value)
        }

        set({
            taskProgress: {
                ...taskProgress,
                [taskId]: { ...prog, claimed: true },
            },
        })

        return true
    },

    claimStreakReward: () => {
        const { loginStreak, streakClaimed } = get()
        if (streakClaimed) return false

        const reward = LOGIN_STREAK_REWARDS.find(r => r.day === loginStreak)
        if (!reward) return false

        const worldStore = useWorldStore.getState()
        if (reward.reward.type === 'blueprint') {
            worldStore.addCurrency('blueprint', reward.reward.value)
        } else if (reward.reward.type === 'memory') {
            worldStore.addCurrency('memory', reward.reward.value)
        }

        set({ streakClaimed: true })
        return true
    },
}))
