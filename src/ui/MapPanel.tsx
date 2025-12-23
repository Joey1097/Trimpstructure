/**
 * @Input: useCombatStore, TEST_MAP
 * @Output: MapPanel 组件 - 地图推进面板
 * @Pos: UI 面板，显示地图节点和战斗入口
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useCombatStore } from '../systems/combat'
import { TEST_MAP } from '../systems/combat'

export default function MapPanel() {
  const { map, clearNode } = useCombatStore()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>地图推进</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {map.reachable.map((id) => {
          const node = TEST_MAP[id]
          if (!node) return null
          const cleared = map.cleared.includes(id)
          return (
            <div
              key={id}
              style={{
                border: '1px solid #ccc',
                borderRadius: 6,
                padding: 12,
                width: 260,
                opacity: cleared ? 0.6 : 1,
                backgroundColor: cleared ? '#f0f0f0' : '#fff',
              }}
            >
              <h4>{node.name}</h4>
              <p style={{ fontSize: 14 }}>类型: {node.type}</p>
              <p style={{ fontSize: 14 }}>HP: {node.hp}</p>
              {!cleared && (
                <button onClick={() => clearNode(id)}>挑战</button>
              )}
              {cleared && <span style={{ color: 'green' }}>已通关</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}