/**
 * @Input: startGameLoop, startAutoSave, useOfflineReport, App 组件
 * @Output: Root 组件 - 应用根容器
 * @Pos: 顶层组件，初始化游戏循环/存档/离线收益
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useEffect } from 'react'
import { startGameLoop } from './core/loop'
import { startAutoSave } from './save/index'
import { useOfflineReport } from './systems/offline'
import { syncGlobalMultipliers } from './systems/worldEffects'
import { useWorldStore } from './systems/world'
import { useArtifactStore } from './systems/artifacts'
import App from './App'

export default function Root() {
  const offlineReport = useOfflineReport()

  useEffect(() => {
    const stopLoop = startGameLoop()
    const stopSave = startAutoSave()
    return () => {
      stopLoop()
      stopSave()
    }
  }, [])

  // 监听并同步全局乘数
  useEffect(() => {
    // 初始同步
    syncGlobalMultipliers()

    // 订阅变更
    const unsubWorld = useWorldStore.subscribe(() => syncGlobalMultipliers())
    const unsubArtifact = useArtifactStore.subscribe(() => syncGlobalMultipliers())

    return () => {
      unsubWorld()
      unsubArtifact()
    }
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      {offlineReport && (
        <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: 12, marginBottom: 12 }}>
          <strong>离线收益报告</strong>
          <div>离线时长: {Math.floor(offlineReport.seconds)} 秒</div>
          <div>
            获得资源:{' '}
            {Object.entries(offlineReport.resources)
              .map(([k, v]) => `${k}: ${v.toFixed(2)}`)
              .join(', ')}
          </div>
        </div>
      )}
      <App />
    </div>
  )
}