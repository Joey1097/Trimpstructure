/**
 * @Input: useGameStore, useWorldStore
 * @Output: applyWorldMultipliers() - 将世界乘数同步到资源系统
 * @Pos: 世界效果同步器，连接世界节点和资源系统
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useGameStore } from '../state/store'
import { useWorldStore } from './world'
import { useArtifactStore } from './artifacts'
import { useCombatStore } from './combat'

export function syncGlobalMultipliers() {
  const worldStore = useWorldStore.getState()
  const artifactStore = useArtifactStore.getState()
  const gameStore = useGameStore.getState()
  const combatStore = useCombatStore.getState()

  // 1. 获取基础乘数
  const worldResMul = worldStore.getMultiplier('resource')
  const worldAtkMul = worldStore.getMultiplier('attack')

  const artifactResMul = artifactStore.getArtifactMultiplier('resource')
  const artifactAtkMul = artifactStore.getArtifactMultiplier('attack')

  // 2. 更新资源系统 multiplier
  // GameStore 中 world/artifact 乘数分开存储，在生产公式中相乘
  gameStore.setWorldMultiplier(worldResMul)
  gameStore.setArtifactMultiplier(artifactResMul)

  // 更新各单项资源乘数 (目前先用 worldResMul 覆盖所有，实际可细分)
  const totalGlobalResMul = worldResMul.mul(artifactResMul)
  gameStore.setResourceMultiplier('wood', totalGlobalResMul)
  gameStore.setResourceMultiplier('stone', totalGlobalResMul)
  gameStore.setResourceMultiplier('iron', totalGlobalResMul)
  gameStore.setResourceMultiplier('food', totalGlobalResMul)
  gameStore.setResourceMultiplier('crystal', totalGlobalResMul)

  // 3. 更新战斗系统 multiplier
  combatStore.setWorldMultiplier(worldAtkMul)
  combatStore.setArtifactMultiplier(artifactAtkMul)
}