/**
 * @Input: React hooks, 6个 UI 面板组件
 * @Output: App 组件 - 主应用容器（标签页导航）
 * @Pos: 应用主组件，管理面板切换
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useState } from 'react'
import Dashboard from './ui/Dashboard'
import WorldPanel from './ui/WorldPanel'
import ArtifactPanel from './ui/ArtifactPanel'
import MapPanel from './ui/MapPanel'
import AutomationPanel from './ui/AutomationPanel'
import BuildingPanel from './ui/BuildingPanel'
import PrestigePanel from './ui/PrestigePanel'

type TabType = 'dashboard' | 'world' | 'artifacts' | 'map' | 'automation' | 'building' | 'prestige'

export default function App() {
  const [tab, setTab] = useState<TabType>('dashboard')

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Trimpstructure 原型</h1>
      <nav style={{ marginBottom: 16 }}>
        <button onClick={() => setTab('dashboard')} disabled={tab === 'dashboard'}>概览</button>
        <button onClick={() => setTab('building')} disabled={tab === 'building'}>建筑</button>
        <button onClick={() => setTab('world')} disabled={tab === 'world'}>世界</button>
        <button onClick={() => setTab('artifacts')} disabled={tab === 'artifacts'}>神器</button>
        <button onClick={() => setTab('map')} disabled={tab === 'map'}>地图</button>
        <button onClick={() => setTab('automation')} disabled={tab === 'automation'}>自动化</button>
        <button onClick={() => setTab('prestige')} disabled={tab === 'prestige'}>传承</button>
      </nav>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'building' && <BuildingPanel />}
      {tab === 'world' && <WorldPanel />}
      {tab === 'artifacts' && <ArtifactPanel />}
      {tab === 'map' && <MapPanel />}
      {tab === 'automation' && <AutomationPanel />}
      {tab === 'prestige' && <PrestigePanel />}
    </div>
  )
}