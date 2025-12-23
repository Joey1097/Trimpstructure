/**
 * @Input: useGameStore, useWorldStore
 * @Output: applyWorldMultipliers() - 将世界乘数同步到资源系统
 * @Pos: 世界效果同步器，连接世界节点和资源系统
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useGameStore } from '../state/store'
import { useWorldStore } from '../systems/world'

export function applyWorldMultipliers() {
  const worldMul = useWorldStore.getState().getMultiplier('resource')
  // const attackMul = useWorldStore.getState().getMultiplier('attack')
  const game = useGameStore.getState()

  // 更新全局乘数
  game.setResourceMultiplier('wood', worldMul)
  game.setResourceMultiplier('stone', worldMul)
  game.setResourceMultiplier('iron', worldMul)
  game.setResourceMultiplier('food', worldMul)
  game.setResourceMultiplier('crystal', worldMul)

  // TODO: 战斗模块完成后同步 attackMul
}