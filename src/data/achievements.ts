/**
 * @Input: Decimal.js
 * @Output: ACHIEVEMENTS - 成就配置表, Achievement 类型
 * @Pos: 数据定义层，提供成就的静态配置
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import Decimal from 'decimal.js'

export type AchievementCategory = 'explore' | 'efficiency' | 'collection' | 'challenge'

export interface Achievement {
    id: string
    name: string
    description: string
    category: AchievementCategory
    condition: {
        type: 'nodesCleared' | 'totalPrestige' | 'buildingLevels' | 'researchCount' | 'artifactCount' | 'mapCompleted' | 'worldNodes'
        value: number
    }
    reward: {
        type: 'multiplier' | 'unlock' | 'points'
        key?: string
        value: Decimal
    }
}

// 分类样式
export const CATEGORY_STYLES: Record<AchievementCategory, { color: string; icon: string; label: string }> = {
    explore: { color: '#4CAF50', icon: '🗺️', label: '探索' },
    efficiency: { color: '#2196F3', icon: '⚡', label: '效率' },
    collection: { color: '#FF9800', icon: '📦', label: '收藏' },
    challenge: { color: '#9C27B0', icon: '🏆', label: '挑战' },
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
    // === 探索成就 ===
    firstNode: {
        id: 'firstNode',
        name: '初探者',
        description: '通关第一个地图节点',
        category: 'explore',
        condition: { type: 'nodesCleared', value: 1 },
        reward: { type: 'points', value: new Decimal(10) },
    },
    explorer10: {
        id: 'explorer10',
        name: '探险家',
        description: '通关10个地图节点',
        category: 'explore',
        condition: { type: 'nodesCleared', value: 10 },
        reward: { type: 'multiplier', key: 'resource', value: new Decimal(1.05) },
    },
    explorer25: {
        id: 'explorer25',
        name: '冒险者',
        description: '通关25个地图节点',
        category: 'explore',
        condition: { type: 'nodesCleared', value: 25 },
        reward: { type: 'multiplier', key: 'attack', value: new Decimal(1.1) },
    },
    mapMaster: {
        id: 'mapMaster',
        name: '地图大师',
        description: '通关50个地图节点',
        category: 'explore',
        condition: { type: 'nodesCleared', value: 50 },
        reward: { type: 'points', value: new Decimal(100) },
    },

    // === 效率成就 ===
    firstPrestige: {
        id: 'firstPrestige',
        name: '传承者',
        description: '完成第一次传承',
        category: 'efficiency',
        condition: { type: 'totalPrestige', value: 1 },
        reward: { type: 'multiplier', key: 'legacy', value: new Decimal(1.1) },
    },
    prestige5: {
        id: 'prestige5',
        name: '轮回老手',
        description: '完成5次传承',
        category: 'efficiency',
        condition: { type: 'totalPrestige', value: 5 },
        reward: { type: 'multiplier', key: 'resource', value: new Decimal(1.15) },
    },
    builder10: {
        id: 'builder10',
        name: '建筑师',
        description: '累计10级建筑',
        category: 'efficiency',
        condition: { type: 'buildingLevels', value: 10 },
        reward: { type: 'points', value: new Decimal(20) },
    },

    // === 收藏成就 ===
    researcher3: {
        id: 'researcher3',
        name: '学者',
        description: '完成3项研究',
        category: 'collection',
        condition: { type: 'researchCount', value: 3 },
        reward: { type: 'multiplier', key: 'researchSpeed', value: new Decimal(1.1) },
    },
    researchMaster: {
        id: 'researchMaster',
        name: '研究大师',
        description: '完成全部研究',
        category: 'collection',
        condition: { type: 'researchCount', value: 6 },
        reward: { type: 'points', value: new Decimal(50) },
    },
    artifactCollector: {
        id: 'artifactCollector',
        name: '神器收藏家',
        description: '拥有5个神器',
        category: 'collection',
        condition: { type: 'artifactCount', value: 5 },
        reward: { type: 'multiplier', key: 'artifact', value: new Decimal(1.1) },
    },

    // === 挑战成就 ===
    worldExplorer: {
        id: 'worldExplorer',
        name: '世界探索者',
        description: '解锁5个世界节点',
        category: 'challenge',
        condition: { type: 'worldNodes', value: 5 },
        reward: { type: 'multiplier', key: 'world', value: new Decimal(1.1) },
    },
    worldMaster: {
        id: 'worldMaster',
        name: '世界大师',
        description: '解锁10个世界节点',
        category: 'challenge',
        condition: { type: 'worldNodes', value: 10 },
        reward: { type: 'points', value: new Decimal(100) },
    },
}

// 获取成就列表
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return Object.values(ACHIEVEMENTS).filter(a => a.category === category)
}
