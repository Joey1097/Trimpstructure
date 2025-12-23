/**
 * @Input: useGameStore, useArtifactStore, useCombatStore, useWorldStore
 * @Output: useAutomationStore - 自动化规则引擎 (规则CRUD/条件评估/动作执行)
 * @Pos: 自动化系统，每 tick 评估规则并执行动作
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { create } from 'zustand'
import { useGameStore, type ResourceKey } from '../state/store'
import { useArtifactStore } from './artifacts'
import { useCombatStore } from './combat'
import { useWorldStore } from './world'

export interface AutomationRule {
  id: string
  name: string
  enabled: boolean
  conditions: { type: 'resource' | 'map' | 'combat'; key: string; op: '>=' | '<='; value: number }[]
  actions: { type: 'switchPreset' | 'setPopulation' | 'startResearch'; payload: unknown }[]
}

export interface AutomationState {
  rules: AutomationRule[]
}

export interface AutomationStore {
  automation: AutomationState
  addRule: (r: Omit<AutomationRule, 'id'>) => void
  updateRule: (id: string, patch: Partial<AutomationRule>) => void
  deleteRule: (id: string) => void
  tickAutomation: () => void
}

export const useAutomationStore = create<AutomationStore>((set, get) => ({
  automation: {
    rules: [],
  },
  addRule: (r) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ automation: { ...s.automation, rules: [...s.automation.rules, { ...r, id }] } }))
  },
  updateRule: (id, patch) => {
    set((s) => ({
      automation: {
        ...s.automation,
        rules: s.automation.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      },
    }))
  },
  deleteRule: (id) => {
    set((s) => ({
      automation: { ...s.automation, rules: s.automation.rules.filter((r) => r.id !== id) },
    }))
  },
  tickAutomation: () => {
    const { automation } = get()
    const game = useGameStore.getState()
    const artifacts = useArtifactStore.getState()
    const combat = useCombatStore.getState()
    const world = useWorldStore.getState()

    for (const rule of automation.rules) {
      if (!rule.enabled) continue

      // 评估条件
      let conditionsMet = true
      for (const condition of rule.conditions) {
        const met = evaluateCondition(condition, game, combat, world)
        if (!met) {
          conditionsMet = false
          break
        }
      }

      if (conditionsMet) {
        // 执行动作
        for (const action of rule.actions) {
          executeAction(action, game, artifacts)
        }
      }
    }
  },
}))

function evaluateCondition(
  condition: AutomationRule['conditions'][0],
  game: ReturnType<typeof useGameStore.getState>,
  combat: ReturnType<typeof useCombatStore.getState>,
  world: ReturnType<typeof useWorldStore.getState>
): boolean {
  let value: number

  switch (condition.type) {
    case 'resource':
      value = game.resources.amounts[condition.key as ResourceKey].toNumber()
      break
    case 'map':
      if (condition.key === 'clearedCount') {
        value = combat.map.cleared.length
      } else if (condition.key === 'currentNode') {
        // 获取当前可到达的节点数量作为进度指标
        value = combat.map.reachable.length
      } else {
        return false
      }
      break
    case 'combat':
      if (condition.key === 'attack') {
        value = combat.combat.baseAttack.toNumber()
      } else if (condition.key === 'health') {
        value = combat.combat.baseHealth.toNumber()
      } else {
        return false
      }
      break
    default:
      return false
  }

  switch (condition.op) {
    case '>=':
      return value >= condition.value
    case '<=':
      return value <= condition.value
    default:
      return false
  }
}

function executeAction(
  action: AutomationRule['actions'][0],
  game: ReturnType<typeof useGameStore.getState>,
  artifacts: ReturnType<typeof useArtifactStore.getState>
): void {
  switch (action.type) {
    case 'switchPreset':
      // 切换神器预设
      artifacts.switchPreset(action.payload)
      break
    case 'setPopulation': {
      // 设置人口分配
      const { role, value } = action.payload as { role: string; value: number }
      if (role && typeof value === 'number') {
        game.assignPopulation(role, value)
      }
      break
    }
    case 'startResearch':
      // 这里可以扩展研究系统，目前作为占位符
      console.log('开始研究:', action.payload)
      break
    default:
      console.warn('未知的自动化动作类型:', action.type)
  }
}