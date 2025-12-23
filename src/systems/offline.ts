/**
 * @Input: React hooks, Decimal.js, useGameStore, useWorldStore
 * @Output: useOfflineReport() - 离线收益计算和报告 hook
 * @Pos: 离线收益系统，计算并应用离线期间的资源积累
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useEffect, useState } from 'react'
import Decimal from 'decimal.js'
import { useGameStore } from '../state/store'
import { useWorldStore } from '../systems/world'

export function useOfflineReport() {
  const [report, setReport] = useState<null | { seconds: number; resources: Record<string, Decimal> }>(null)

  useEffect(() => {
    const last = localStorage.getItem('last_tick_at')
    if (!last) return
    const diff = (Date.now() - parseInt(last, 10)) / 1000
    if (diff <= 0) return

    // 简单模拟离线收益（上限 12h）
    const capped = Math.min(diff, 12 * 3600)
    const game = useGameStore.getState()
    const worldMul = useWorldStore.getState().getMultiplier('resource')
    const assign = game.population.assignment

    const perSec = (role: number) => new Decimal(role).mul(worldMul)
    const deltaWood = perSec(assign.worker).mul(capped)
    const deltaStone = perSec(assign.builder).mul(capped).mul(0.6)
    const deltaIron = perSec(assign.soldier).mul(capped).mul(0.3)
    const deltaFood = perSec(assign.scout).mul(capped).mul(0.8)

    // 使用异步更新避免React警告
    Promise.resolve().then(() => {
      setReport({
        seconds: capped,
        resources: {
          wood: deltaWood,
          stone: deltaStone,
          iron: deltaIron,
          food: deltaFood,
        },
      })
    })

    // apply offline gains
    game.addResource('wood', deltaWood)
    game.addResource('stone', deltaStone)
    game.addResource('iron', deltaIron)
    game.addResource('food', deltaFood)
  }, [])

  return report
}