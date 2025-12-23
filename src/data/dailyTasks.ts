/**
 * @Input: Decimal.js
 * @Output: DAILY_TASKS - 日常任务池, DailyTask 类型
 * @Pos: 数据定义层，提供日常任务的配置
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import Decimal from 'decimal.js'

export type TaskType = 'clearNodes' | 'upgradeBuilding' | 'completeResearch' | 'collectResources' | 'equipArtifact'

export interface DailyTask {
    id: string
    name: string
    description: string
    type: TaskType
    targetValue: number
    reward: {
        type: 'blueprint' | 'memory' | 'legacyPoints'
        value: Decimal
    }
}

// 日常任务池
export const DAILY_TASK_POOL: DailyTask[] = [
    {
        id: 'daily_clear3',
        name: '地图探索',
        description: '通关3个地图节点',
        type: 'clearNodes',
        targetValue: 3,
        reward: { type: 'blueprint', value: new Decimal(10) },
    },
    {
        id: 'daily_clear5',
        name: '深入探索',
        description: '通关5个地图节点',
        type: 'clearNodes',
        targetValue: 5,
        reward: { type: 'memory', value: new Decimal(8) },
    },
    {
        id: 'daily_build1',
        name: '建设者',
        description: '升级1个建筑',
        type: 'upgradeBuilding',
        targetValue: 1,
        reward: { type: 'blueprint', value: new Decimal(5) },
    },
    {
        id: 'daily_build3',
        name: '大建设者',
        description: '升级3个建筑',
        type: 'upgradeBuilding',
        targetValue: 3,
        reward: { type: 'memory', value: new Decimal(10) },
    },
    {
        id: 'daily_research',
        name: '学者之路',
        description: '完成1项研究',
        type: 'completeResearch',
        targetValue: 1,
        reward: { type: 'blueprint', value: new Decimal(15) },
    },
    {
        id: 'daily_artifact',
        name: '装备整理',
        description: '装备一件神器',
        type: 'equipArtifact',
        targetValue: 1,
        reward: { type: 'memory', value: new Decimal(5) },
    },
]

// 连续登录奖励
export const LOGIN_STREAK_REWARDS: { day: number; reward: { type: string; value: Decimal } }[] = [
    { day: 1, reward: { type: 'blueprint', value: new Decimal(5) } },
    { day: 2, reward: { type: 'memory', value: new Decimal(5) } },
    { day: 3, reward: { type: 'blueprint', value: new Decimal(10) } },
    { day: 4, reward: { type: 'memory', value: new Decimal(10) } },
    { day: 5, reward: { type: 'blueprint', value: new Decimal(15) } },
    { day: 6, reward: { type: 'memory', value: new Decimal(15) } },
    { day: 7, reward: { type: 'legacyPoints', value: new Decimal(1) } },
]

// 随机选取今日任务
export function getRandomDailyTasks(count = 3): DailyTask[] {
    const shuffled = [...DAILY_TASK_POOL].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}
