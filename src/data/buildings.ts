/**
 * @Input: Decimal.js
 * @Output: BUILDINGS - 建筑配置表, Building 类型
 * @Pos: 数据定义层，提供建筑的静态配置
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import Decimal from 'decimal.js'

export interface Building {
    id: string
    name: string
    description: string
    baseCost: {
        wood?: Decimal
        stone?: Decimal
        iron?: Decimal
    }
    costMultiplier: number  // 每级成本增长倍率
    maxLevel: number
    effects: {
        type: 'resourceCap' | 'resourceMultiplier' | 'populationCap' | 'efficiency'
        target?: string  // 目标资源或岗位
        valuePerLevel: Decimal
    }[]
}

export const BUILDINGS: Record<string, Building> = {
    warehouse: {
        id: 'warehouse',
        name: '仓库',
        description: '增加资源储存上限',
        baseCost: { wood: new Decimal(50), stone: new Decimal(30) },
        costMultiplier: 1.5,
        maxLevel: 20,
        effects: [
            { type: 'resourceCap', target: 'wood', valuePerLevel: new Decimal(100) },
            { type: 'resourceCap', target: 'stone', valuePerLevel: new Decimal(100) },
            { type: 'resourceCap', target: 'iron', valuePerLevel: new Decimal(50) },
        ]
    },
    workshop: {
        id: 'workshop',
        name: '工坊',
        description: '提高工人生产效率',
        baseCost: { wood: new Decimal(100), stone: new Decimal(50) },
        costMultiplier: 1.6,
        maxLevel: 15,
        effects: [
            { type: 'efficiency', target: 'worker', valuePerLevel: new Decimal(0.1) },
        ]
    },
    barracks: {
        id: 'barracks',
        name: '兵营',
        description: '提高士兵战斗效率和人口上限',
        baseCost: { wood: new Decimal(80), stone: new Decimal(100), iron: new Decimal(30) },
        costMultiplier: 1.7,
        maxLevel: 15,
        effects: [
            { type: 'efficiency', target: 'soldier', valuePerLevel: new Decimal(0.1) },
            { type: 'populationCap', valuePerLevel: new Decimal(5) },
        ]
    },
    researchLab: {
        id: 'researchLab',
        name: '研究所',
        description: '提高研究效率',
        baseCost: { wood: new Decimal(120), stone: new Decimal(80), iron: new Decimal(50) },
        costMultiplier: 1.8,
        maxLevel: 10,
        effects: [
            { type: 'efficiency', target: 'researcher', valuePerLevel: new Decimal(0.15) },
        ]
    },
    forge: {
        id: 'forge',
        name: '熔炉',
        description: '提高铁矿产出和装备评分加成',
        baseCost: { stone: new Decimal(150), iron: new Decimal(80) },
        costMultiplier: 1.6,
        maxLevel: 12,
        effects: [
            { type: 'resourceMultiplier', target: 'iron', valuePerLevel: new Decimal(0.1) },
        ]
    },
}

// 计算建筑当前等级的升级成本
export function getBuildingCost(buildingId: string, currentLevel: number): Record<string, Decimal> {
    const building = BUILDINGS[buildingId]
    if (!building) return {}

    const multiplier = new Decimal(building.costMultiplier).pow(currentLevel)
    const costs: Record<string, Decimal> = {}

    if (building.baseCost.wood) costs.wood = building.baseCost.wood.mul(multiplier).floor()
    if (building.baseCost.stone) costs.stone = building.baseCost.stone.mul(multiplier).floor()
    if (building.baseCost.iron) costs.iron = building.baseCost.iron.mul(multiplier).floor()

    return costs
}
