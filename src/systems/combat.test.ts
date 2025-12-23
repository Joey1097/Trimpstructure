/**
 * @Input: useCombatStore, MAPS
 * @Output: 战斗模拟测试
 * @Pos: 测试战斗系统的 TTK 计算和战斗流程
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useCombatStore } from './combat'
import { MAPS } from '../data/maps'

describe('Combat Simulation', () => {
    beforeEach(() => {
        // 重置 store 使用 tutorial 地图
        useCombatStore.setState({
            map: { currentMapId: 'tutorial', cleared: [], reachable: ['t1'], totalCleared: 0 },
            simulation: null,
        })
    })

    it('simulateCombat 返回正确的 TTK', () => {
        const sim = useCombatStore.getState().simulateCombat('t1')
        expect(sim).not.toBeNull()
        expect(sim!.nodeId).toBe('t1')
        expect(sim!.nodeHp).toBe(MAPS.tutorial.nodes.t1.hp)
        // 基础攻击 10，装备 1，乘数都是 1，所以 DPS = 10
        // TTK = HP(50) / DPS(10) = 5
        expect(sim!.ttk).toBe(5)
    })

    it('startBattle 激活战斗状态', () => {
        useCombatStore.getState().startBattle('t1')
        const { simulation } = useCombatStore.getState()
        expect(simulation).not.toBeNull()
        expect(simulation!.isActive).toBe(true)
        expect(simulation!.startedAt).toBeGreaterThan(0)
    })

    it('clearNode 后战斗状态清空', () => {
        useCombatStore.getState().startBattle('t1')
        useCombatStore.getState().clearNode('t1')
        const { simulation, map } = useCombatStore.getState()
        expect(simulation).toBeNull()
        expect(map.cleared).toContain('t1')
    })

    it('switchMap 切换地图并重置进度', () => {
        useCombatStore.getState().clearNode('t1')
        useCombatStore.getState().switchMap('forest')
        const { map } = useCombatStore.getState()
        expect(map.currentMapId).toBe('forest')
        expect(map.cleared).toHaveLength(0)
        expect(map.reachable).toContain('f1')
    })
})
