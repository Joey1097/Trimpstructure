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

    // === M4 新增地图 ===

    glacier: {
        id: 'glacier',
        name: '冰封冰川',
        description: '护盾+环境双重考验，需要破盾和高生存',
        requiredClears: 12,
        entryNode: 'g1',
        nodes: {
            g1: { id: 'g1', name: '冰川入口', type: 'normal', hp: 350, adjacent: ['g2'], drops: [drop('blueprint', 2)] },
            g2: { id: 'g2', name: '冰霜哨塔', type: 'shield', hp: 500, shieldType: 'ice', adjacent: ['g3', 'g4'], drops: [drop('memory', 2)] },
            g3: { id: 'g3', name: '暴风雪区', type: 'env', hp: 600, adjacent: ['g5'], drops: [drop('blueprint', 3)] },
            g4: { id: 'g4', name: '冰封湖泊', type: 'shield', hp: 550, shieldType: 'magic', adjacent: ['g5'], drops: [drop('memory', 3)] },
            g5: { id: 'g5', name: '冰巨人巢穴', type: 'protected', hp: 800, adjacent: ['g6'], drops: [drop('blueprint', 4), drop('memory', 4)] },
            g6: { id: 'g6', name: '极寒王座', type: 'shield', hp: 1000, shieldType: 'ice', adjacent: [], drops: [drop('blueprint', 6), drop('memory', 6)] },
        },
    },

    volcano: {
        id: 'volcano',
        name: '烈焰火山',
        description: '高伤害限时节点，考验爆发输出',
        requiredClears: 18,
        entryNode: 'v1',
        nodes: {
            v1: { id: 'v1', name: '火山山脚', type: 'normal', hp: 400, adjacent: ['v2', 'v3'], drops: [drop('blueprint', 2)] },
            v2: { id: 'v2', name: '岩浆河道', type: 'timed', hp: 600, timeLimit: 25, adjacent: ['v4'], drops: [drop('memory', 4)] },
            v3: { id: 'v3', name: '熔岩洞穴', type: 'env', hp: 550, adjacent: ['v4'], drops: [drop('blueprint', 3)] },
            v4: { id: 'v4', name: '火焰守卫', type: 'shield', hp: 700, shieldType: 'fire', adjacent: ['v5'], drops: [drop('memory', 4)] },
            v5: { id: 'v5', name: '喷发口', type: 'timed', hp: 900, timeLimit: 35, adjacent: ['v6'], drops: [drop('blueprint', 5)] },
            v6: { id: 'v6', name: '火山心脏', type: 'timed', hp: 1200, timeLimit: 40, adjacent: [], drops: [drop('blueprint', 8), drop('memory', 8)] },
        },
    },

    abyss: {
        id: 'abyss',
        name: '无尽深渊',
        description: '保护节点链，需要策略性推进',
        requiredClears: 25,
        entryNode: 'a1',
        nodes: {
            a1: { id: 'a1', name: '深渊边缘', type: 'normal', hp: 500, adjacent: ['a2'], drops: [drop('blueprint', 3)] },
            a2: { id: 'a2', name: '黑暗通道', type: 'protected', hp: 700, adjacent: ['a3', 'a4'], drops: [drop('memory', 4)] },
            a3: { id: 'a3', name: '虚空裂隙', type: 'shield', hp: 800, shieldType: 'void', adjacent: ['a5'], drops: [drop('blueprint', 4)] },
            a4: { id: 'a4', name: '暗影回廊', type: 'protected', hp: 750, adjacent: ['a5'], drops: [drop('memory', 4)] },
            a5: { id: 'a5', name: '深渊守望者', type: 'protected', hp: 1000, adjacent: ['a6'], drops: [drop('blueprint', 5), drop('memory', 5)] },
            a6: { id: 'a6', name: '虚无核心', type: 'shield', hp: 1500, shieldType: 'void', adjacent: [], drops: [drop('blueprint', 10), drop('memory', 10)] },
        },
    },
}

// 获取可用地图列表（根据总通关节点数）
export function getAvailableMaps(totalCleared: number): GameMap[] {
    return Object.values(MAPS).filter(m => m.requiredClears <= totalCleared)
}
