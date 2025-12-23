/**
 * @Input: Decimal.js
 * @Output: MAPS - 地图配置表, GameMap/MapNode 类型
 * @Pos: 数据定义层，提供多张地图的配置
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import type { MapNode, DropChance } from '../systems/combat'

// 生成掉落配置
const drop = (id: string, weight = 1, minNode = 1): DropChance => ({ id, weight, minNode })

export interface GameMap {
    id: string
    name: string
    description: string
    requiredClears: number  // 需要通关多少节点才能解锁下一张地图
    nodes: Record<string, MapNode>
    entryNode: string
}

export const MAPS: Record<string, GameMap> = {
    tutorial: {
        id: 'tutorial',
        name: '新手森林',
        description: '初始区域，适合熟悉基本操作',
        requiredClears: 0,
        entryNode: 't1',
        nodes: {
            t1: { id: 't1', name: '林间小路', type: 'normal', hp: 50, adjacent: ['t2'], drops: [drop('blueprint')] },
            t2: { id: 't2', name: '野狼据点', type: 'normal', hp: 80, adjacent: ['t3'], drops: [drop('blueprint')] },
            t3: { id: 't3', name: '守林人小屋', type: 'normal', hp: 100, adjacent: [], drops: [drop('memory')] },
        },
    },

    forest: {
        id: 'forest',
        name: '迷雾森林',
        description: '护盾节点初次登场',
        requiredClears: 3,
        entryNode: 'f1',
        nodes: {
            f1: { id: 'f1', name: '迷雾入口', type: 'normal', hp: 120, adjacent: ['f2', 'f3'], drops: [drop('blueprint')] },
            f2: { id: 'f2', name: '精灵岗哨', type: 'shield', hp: 180, shieldType: 'physical', adjacent: ['f4'], drops: [drop('memory')] },
            f3: { id: 'f3', name: '密林深处', type: 'normal', hp: 150, adjacent: ['f4'], drops: [drop('blueprint', 2)] },
            f4: { id: 'f4', name: '古树之心', type: 'shield', hp: 250, shieldType: 'magic', adjacent: [], drops: [drop('memory', 2)] },
        },
    },

    desert: {
        id: 'desert',
        name: '沙漠遗迹',
        description: '限时节点考验爆发力',
        requiredClears: 7,
        entryNode: 'd1',
        nodes: {
            d1: { id: 'd1', name: '沙漠边缘', type: 'normal', hp: 200, adjacent: ['d2', 'd3'], drops: [drop('blueprint')] },
            d2: { id: 'd2', name: '流沙陷阱', type: 'timed', hp: 300, timeLimit: 30, adjacent: ['d4'], drops: [drop('memory', 3)] },
            d3: { id: 'd3', name: '绿洲休息站', type: 'normal', hp: 180, adjacent: ['d4'], drops: [drop('blueprint', 2)] },
            d4: { id: 'd4', name: '遗迹入口', type: 'protected', hp: 400, adjacent: ['d5'], drops: [drop('memory', 2)] },
            d5: { id: 'd5', name: '法老宝库', type: 'timed', hp: 500, timeLimit: 45, adjacent: [], drops: [drop('blueprint', 5), drop('memory', 5)] },
        },
    },
}

// 获取可用地图列表（根据总通关节点数）
export function getAvailableMaps(totalCleared: number): GameMap[] {
    return Object.values(MAPS).filter(m => m.requiredClears <= totalCleared)
}
