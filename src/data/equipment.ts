/**
 * @Input: Decimal.js
 * @Output: EQUIPMENT - 装备配置表, Equipment 类型
 * @Pos: 数据定义层，提供装备的静态配置
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import Decimal from 'decimal.js'

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory'
export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Equipment {
    id: string
    name: string
    description: string
    slot: EquipmentSlot
    rarity: EquipmentRarity
    gearScoreBonus: Decimal
    effects: {
        type: 'attack' | 'defense' | 'health' | 'efficiency'
        value: Decimal
    }[]
}

// 稀有度颜色
export const RARITY_COLORS: Record<EquipmentRarity, string> = {
    common: '#9E9E9E',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
}

// 稀有度基础评分乘数
const RARITY_MULTIPLIER: Record<EquipmentRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
}

export const EQUIPMENT: Record<string, Equipment> = {
    // 武器
    woodenSword: {
        id: 'woodenSword',
        name: '木剑',
        description: '新手入门武器',
        slot: 'weapon',
        rarity: 'common',
        gearScoreBonus: new Decimal(1),
        effects: [{ type: 'attack', value: new Decimal(2) }],
    },
    ironSword: {
        id: 'ironSword',
        name: '铁剑',
        description: '可靠的铁制武器',
        slot: 'weapon',
        rarity: 'uncommon',
        gearScoreBonus: new Decimal(3),
        effects: [{ type: 'attack', value: new Decimal(5) }],
    },
    flameBlade: {
        id: 'flameBlade',
        name: '烈焰之刃',
        description: '附着火焰的魔法剑',
        slot: 'weapon',
        rarity: 'rare',
        gearScoreBonus: new Decimal(8),
        effects: [{ type: 'attack', value: new Decimal(12) }],
    },

    // 护甲
    leatherArmor: {
        id: 'leatherArmor',
        name: '皮甲',
        description: '轻便的皮革护甲',
        slot: 'armor',
        rarity: 'common',
        gearScoreBonus: new Decimal(1),
        effects: [{ type: 'defense', value: new Decimal(2) }],
    },
    chainmail: {
        id: 'chainmail',
        name: '锁子甲',
        description: '交织的金属锁链护甲',
        slot: 'armor',
        rarity: 'uncommon',
        gearScoreBonus: new Decimal(3),
        effects: [{ type: 'defense', value: new Decimal(5) }, { type: 'health', value: new Decimal(10) }],
    },

    // 饰品
    luckyCharm: {
        id: 'luckyCharm',
        name: '幸运符',
        description: '带来好运的护身符',
        slot: 'accessory',
        rarity: 'common',
        gearScoreBonus: new Decimal(1),
        effects: [{ type: 'efficiency', value: new Decimal(0.05) }],
    },
    ancientRing: {
        id: 'ancientRing',
        name: '远古之戒',
        description: '蕴含神秘力量的戒指',
        slot: 'accessory',
        rarity: 'rare',
        gearScoreBonus: new Decimal(5),
        effects: [{ type: 'attack', value: new Decimal(3) }, { type: 'defense', value: new Decimal(3) }],
    },
}

// 计算装备总评分加成
export function calcTotalGearScore(equippedIds: string[]): Decimal {
    return equippedIds.reduce((sum, id) => {
        const eq = EQUIPMENT[id]
        return eq ? sum.add(eq.gearScoreBonus) : sum
    }, new Decimal(1))  // 基础评分 1
}
