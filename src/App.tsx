import { useState } from 'react'
import Dashboard from './ui/Dashboard'
import WorldPanel from './ui/WorldPanel'
import ArtifactPanel from './ui/ArtifactPanel'
import MapPanel from './ui/MapPanel'
import AutomationPanel from './ui/AutomationPanel'

export default function App() {
  const [tab, setTab] = useState<'dashboard' | 'world' | 'artifacts' | 'map' | 'automation'>('dashboard')

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Trimpstructure 原型</h1>
      <nav style={{ marginBottom: 16 }}>
        <button onClick={() => setTab('dashboard')} disabled={tab === 'dashboard'}>概览</button>
        <button onClick={() => setTab('world')} disabled={tab === 'world'}>世界</button>
        <button onClick={() => setTab('artifacts')} disabled={tab === 'artifacts'}>神器</button>
        <button onClick={() => setTab('map')} disabled={tab === 'map'}>地图</button>
        <button onClick={() => setTab('automation')} disabled={tab === 'automation'}>自动化</button>
      </nav>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'world' && <WorldPanel />}
      {tab === 'artifacts' && <ArtifactPanel />}
      {tab === 'map' && <MapPanel />}
      {tab === 'automation' && <AutomationPanel />}
    </div>
  )
}