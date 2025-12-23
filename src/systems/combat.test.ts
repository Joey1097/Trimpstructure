/**
 * @Input: useCombatStore, TEST_MAP
 * @Output: 战斗模拟测试
 * @Pos: 测试战斗系统的 TTK 计算和战斗流程
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useCombatStore, TEST_MAP } from './combat'

describe('Combat Simulation', () => {
    beforeEach(() => {
        // 重置 store
        useCombatStore.setState({
            map: { currentMapId: 'test', cleared: [], reachable: ['n1'] },
            simulation: null,
        })
    })

    it('simulateCombat 返回正确的 TTK', () => {
        const sim = useCombatStore.getState().simulateCombat('n1')
        expect(sim).not.toBeNull()
        expect(sim!.nodeId).toBe('n1')
        expect(sim!.nodeHp).toBe(TEST_MAP.n1.hp)
        // 基础攻击 10，装备 1，乘数都是 1，所以 DPS = 10
        // TTK = HP(100) / DPS(10) = 10
        expect(sim!.ttk).toBe(10)
    })

    it('startBattle 激活战斗状态', () => {
        useCombatStore.getState().startBattle('n1')
        const { simulation } = useCombatStore.getState()
        expect(simulation).not.toBeNull()
        expect(simulation!.isActive).toBe(true)
        expect(simulation!.startedAt).toBeGreaterThan(0)
    })

    it('clearNode 后战斗状态清空', () => {
        useCombatStore.getState().startBattle('n1')
        useCombatStore.getState().clearNode('n1')
        const { simulation, map } = useCombatStore.getState()
        expect(simulation).toBeNull()
        expect(map.cleared).toContain('n1')
    })
})
