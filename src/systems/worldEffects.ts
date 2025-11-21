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