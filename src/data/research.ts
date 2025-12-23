/**
 * @Input: Decimal.js
 * @Output: RESEARCH - 研究配置表, Research 类型
 * @Pos: 数据定义层，提供研究的静态配置
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import Decimal from 'decimal.js'

export type ResearchCategory = 'efficiency' | 'unlock' | 'automation'

export interface Research {
    id: string
    name: string
    description: string
    category: ResearchCategory
    baseCost: {
        blueprint?: Decimal
        memory?: Decimal
    }
    researchTime: number  // 基础研究时间（秒）
    prerequisites: string[]  // 前置研究
    effects: {
        type: 'multiplier' | 'unlock' | 'efficiency'
        target: string
        value: Decimal
    }[]
}

export const RESEARCH: Record<string, Research> = {
    // 效率类
    efficientGathering: {
        id: 'efficientGathering',
        name: '高效采集',
        description: '提高所有资源采集效率',
        category: 'efficiency',
        baseCost: { blueprint: new Decimal(5) },
        researchTime: 60,
        prerequisites: [],
        effects: [
            { type: 'multiplier', target: 'resource', value: new Decimal(1.1) }
        ]
    },
    improvedConstruction: {
        id: 'improvedConstruction',
        name: '改良建造',
        description: '降低建筑升级成本',
        category: 'efficiency',
        baseCost: { blueprint: new Decimal(10), memory: new Decimal(2) },
        researchTime: 120,
        prerequisites: ['efficientGathering'],
        effects: [
            { type: 'multiplier', target: 'buildingCost', value: new Decimal(0.9) }
        ]
    },
    combatTraining: {
        id: 'combatTraining',
        name: '战斗训练',
        description: '提高士兵基础攻击力',
        category: 'efficiency',
        baseCost: { blueprint: new Decimal(8), memory: new Decimal(3) },
        researchTime: 90,
        prerequisites: [],
        effects: [
            { type: 'multiplier', target: 'baseAttack', value: new Decimal(1.2) }
        ]
    },

    // 解锁类
    shieldBreaker: {
        id: 'shieldBreaker',
        name: '破盾技术',
        description: '解锁对护盾节点的克制能力',
        category: 'unlock',
        baseCost: { blueprint: new Decimal(15), memory: new Decimal(5) },
        researchTime: 180,
        prerequisites: ['combatTraining'],
        effects: [
            { type: 'unlock', target: 'shieldBreaker', value: new Decimal(1) }
        ]
    },
    scouting: {
        id: 'scouting',
        name: '侦察技术',
        description: '解锁探索者岗位',
        category: 'unlock',
        baseCost: { blueprint: new Decimal(12) },
        researchTime: 150,
        prerequisites: ['efficientGathering'],
        effects: [
            { type: 'unlock', target: 'scoutRole', value: new Decimal(1) }
        ]
    },

    // 自动化类
    autoAssign: {
        id: 'autoAssign',
        name: '自动分配',
        description: '解锁人口自动分配功能',
        category: 'automation',
        baseCost: { memory: new Decimal(10) },
        researchTime: 240,
        prerequisites: ['improvedConstruction'],
        effects: [
            { type: 'unlock', target: 'autoAssign', value: new Decimal(1) }
        ]
    },
}

// 检查研究前置条件是否满足
export function canResearch(researchId: string, completed: string[]): boolean {
    const research = RESEARCH[researchId]
    if (!research) return false
    return research.prerequisites.every(p => completed.includes(p))
}
