/**
 * @Input: useGameStore (状态), calcPerSecondProduction (公式), useAutomationStore (自动化)
 * @Output: startGameLoop() - 启动游戏主循环，返回停止函数
 * @Pos: 游戏核心循环，驱动资源产出和自动化规则执行
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useGameStore } from '../state/store'
import Decimal from 'decimal.js'
import { calcPerSecondProduction } from './formulas'
import { useAutomationStore } from '../systems/automation'

export function startGameLoop(): () => void {
  const tick = () => {
    const state = useGameStore.getState()
    const now = Date.now()
    const elapsedSec = (now - state.lastTickAt) / 1000
    const seconds = Math.max(0, Math.floor(elapsedSec)) || 1

    // resources: example for wood/stone/iron/food
    const assign = state.population.assignment
    const baseJobEff = new Decimal(1)
    const baseBuildingEff = new Decimal(1)
    const stateMod = new Decimal(1)
    // const mul = state.worldMultiplier.mul(state.artifactMultiplier)

    const produce = (assigned: number) =>
      calcPerSecondProduction({
        populationAssigned: assigned,
        jobEfficiency: baseJobEff,
        buildingEfficiency: baseBuildingEff,
        worldMultiplier: state.worldMultiplier,
        artifactMultiplier: state.artifactMultiplier,
        stateModifier: stateMod,
      })

    const deltaWood = produce(assign.worker).mul(seconds)
    const deltaStone = produce(assign.builder).mul(seconds).mul(0.6)
    const deltaIron = produce(assign.soldier).mul(seconds).mul(0.3)
    const deltaFood = produce(assign.scout).mul(seconds).mul(0.8)

    useGameStore.getState().addResource('wood', deltaWood)
    useGameStore.getState().addResource('stone', deltaStone)
    useGameStore.getState().addResource('iron', deltaIron)
    useGameStore.getState().addResource('food', deltaFood)

    // 执行自动化规则
    useAutomationStore.getState().tickAutomation()

    useGameStore.getState().setLastTickAt(now)
  }

  const interval = setInterval(tick, useGameStore.getState().tickSeconds * 1000)
  return () => clearInterval(interval)
}

