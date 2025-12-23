/**
 * @Input: useArtifactStore
 * @Output: ArtifactPanel 组件 - 神器管理面板
 * @Pos: UI 面板，显示神器装备和预设切换
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useArtifactStore } from '../systems/artifacts'

export default function ArtifactPanel() {
  const { artifact, equipArtifact, unequipSlot, switchPreset } = useArtifactStore()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>神器</h2>
      <div style={{ marginBottom: 12 }}>
        预设: {artifact.presets.map((p, i) => (
          <button key={i} disabled={artifact.activePreset === i} onClick={() => switchPreset(i)}>
            {p.name}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: 12, width: 260 }}>
          <h4>已装备</h4>
          {artifact.equipped.map((id, idx) => {
            const art = artifact.inventory.find((i) => i.id === id)
            return (
              <div key={idx} style={{ marginBottom: 8 }}>
                <span>槽{idx + 1}: </span>
                {art ? (
                  <span>
                    {art.name} <button onClick={() => unequipSlot(idx)}>卸下</button>
                  </span>
                ) : (
                  <span style={{ color: '#999' }}>空</span>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: 12, width: 260 }}>
          <h4>背包</h4>
          {artifact.inventory.map((art) => {
            const equipped = artifact.equipped.includes(art.id)
            return (
              <div key={art.id} style={{ marginBottom: 6 }}>
                <span>{art.name} ({art.tags.join(',')})</span>
                {!equipped && (
                  <button onClick={() => equipArtifact(art.id, 0)}>装备</button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}