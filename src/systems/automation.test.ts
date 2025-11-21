import { describe, it, expect, beforeEach } from 'vitest'
import { useAutomationStore } from './automation'
import { useGameStore } from '../state/store'
import { useCombatStore } from './combat'
import Decimal from 'decimal.js'

describe('automation', () => {
  beforeEach(() => {
    // 重置状态
    useAutomationStore.setState({ automation: { rules: [] } })
    useGameStore.setState({
      resources: {
        amounts: { wood: new Decimal(0), stone: new Decimal(0), iron: new Decimal(0), food: new Decimal(0), crystal: new Decimal(0) },
        caps: { wood: new Decimal(100), stone: new Decimal(100), iron: new Decimal(100), food: new Decimal(100), crystal: new Decimal(100) },
        multipliers: { wood: new Decimal(1), stone: new Decimal(1), iron: new Decimal(1), food: new Decimal(1), crystal: new Decimal(1) }
      },
      population: {
        total: 10,
        assignment: { worker: 2, builder: 2, researcher: 2, soldier: 2, scout: 2 }
      }
    } as any)
    useCombatStore.setState({
      map: {
        currentMapId: 'test',
        cleared: [],
        reachable: ['n1']
      },
      combat: {
        baseAttack: new Decimal(10),
        baseHealth: new Decimal(100),
        baseDefense: new Decimal(5),
        gearScore: new Decimal(1),
        worldMultiplier: new Decimal(1),
        artifactMultiplier: new Decimal(1)
      }
    } as any)
  })

  it('should add and evaluate automation rules', () => {
    const { addRule, tickAutomation } = useAutomationStore.getState()
    
    // 添加一个测试规则：当木头 >= 50 时增加工人
    addRule({
      name: '测试规则',
      enabled: true,
      conditions: [
        { type: 'resource', key: 'wood', op: '>=', value: 50 }
      ],
      actions: [
        { type: 'setPopulation', payload: { role: 'worker', value: 5 } }
      ]
    })

    // 设置木头数量不足
    useGameStore.getState().addResource('wood', new Decimal(30))
    
    // 执行自动化 - 条件不满足，不应执行动作
    tickAutomation()
    expect(useGameStore.getState().population.assignment.worker).toBe(2)

    // 增加木头到满足条件
    useGameStore.getState().addResource('wood', new Decimal(25))
    
    // 执行自动化 - 条件满足，应执行动作
    tickAutomation()
    expect(useGameStore.getState().population.assignment.worker).toBe(5)
  })

  it('should handle multiple conditions', () => {
    const { addRule, tickAutomation } = useAutomationStore.getState()
    
    // 添加需要多个条件的规则
    addRule({
      name: '多条件规则',
      enabled: true,
      conditions: [
        { type: 'resource', key: 'wood', op: '>=', value: 100 },
        { type: 'resource', key: 'stone', op: '>=', value: 50 }
      ],
      actions: [
        { type: 'setPopulation', payload: { role: 'soldier', value: 8 } }
      ]
    })

    // 只满足一个条件
    useGameStore.getState().addResource('wood', new Decimal(120))
    useGameStore.getState().addResource('stone', new Decimal(30))
    
    tickAutomation()
    // 条件未全部满足，不应执行
    expect(useGameStore.getState().population.assignment.soldier).toBe(2)

    // 满足所有条件
    useGameStore.getState().addResource('stone', new Decimal(25))
    
    tickAutomation()
    // 条件全部满足，应执行
    expect(useGameStore.getState().population.assignment.soldier).toBe(8)
  })

  it('should respect enabled flag', () => {
    const { addRule, tickAutomation } = useAutomationStore.getState()
    
    // 添加禁用的规则
    addRule({
      name: '禁用规则',
      enabled: false,
      conditions: [
        { type: 'resource', key: 'wood', op: '>=', value: 50 }
      ],
      actions: [
        { type: 'setPopulation', payload: { role: 'worker', value: 8 } }
      ]
    })

    // 设置满足条件的资源
    useGameStore.getState().addResource('wood', new Decimal(60))
    
    // 执行自动化 - 规则禁用，不应执行
    tickAutomation()
    expect(useGameStore.getState().population.assignment.worker).toBe(2)
  })

  it('should evaluate map conditions correctly', () => {
    const { addRule, tickAutomation } = useAutomationStore.getState()
    
    // 添加基于地图进度的规则
    addRule({
      name: '地图推进规则',
      enabled: true,
      conditions: [
        { type: 'map', key: 'clearedCount', op: '>=', value: 1 }
      ],
      actions: [
        { type: 'setPopulation', payload: { role: 'soldier', value: 8 } }
      ]
    })

    // 初始状态：没有清除的节点
    tickAutomation()
    expect(useGameStore.getState().population.assignment.soldier).toBe(2)

    // 清除一个节点
    useCombatStore.setState({
      map: {
        currentMapId: 'test',
        cleared: ['n1'],
        reachable: ['n2', 'n3']
      }
    } as any)
    
    // 现在条件应该满足
    tickAutomation()
    expect(useGameStore.getState().population.assignment.soldier).toBe(8)
  })
})