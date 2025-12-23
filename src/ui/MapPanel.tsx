/**
 * @Input: useCombatStore, MAPS, getAvailableMaps, useEffect
 * @Output: MapPanel 组件 - 地图推进面板（带战斗模拟和多地图）
 * @Pos: UI 面板，显示地图节点、TTK 预估、战斗进度和地图选择
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useEffect } from 'react'
import { useCombatStore } from '../systems/combat'
import { MAPS, getAvailableMaps } from '../data/maps'

// 节点类型样式
const nodeTypeStyles: Record<string, { color: string; icon: string; label: string }> = {
  normal: { color: '#4CAF50', icon: '⚔️', label: '普通' },
  shield: { color: '#2196F3', icon: '🛡️', label: '护盾' },
  timed: { color: '#FF9800', icon: '⏱️', label: '限时' },
  protected: { color: '#9C27B0', icon: '🔒', label: '保护' },
  env: { color: '#F44336', icon: '☠️', label: '环境' },
}

export default function MapPanel() {
  const {
    map,
    simulation,
    getCurrentMap,
    switchMap,
    simulateCombat,
    startBattle,
    tickBattle,
    canDamageNode,
  } = useCombatStore()

  const currentMap = getCurrentMap()
  const availableMaps = getAvailableMaps(map.totalCleared)

  // 战斗 tick 定时器
  useEffect(() => {
    if (!simulation?.isActive) return
    const interval = setInterval(() => {
      tickBattle()
    }, 100)
    return () => clearInterval(interval)
  }, [simulation?.isActive, tickBattle])

  if (!currentMap) return <div>地图加载中...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>地图推进</h2>

      {/* 地图选择器 */}
      <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <strong>选择地图: </strong>
        {availableMaps.map(m => (
          <button
            key={m.id}
            onClick={() => switchMap(m.id)}
            disabled={map.currentMapId === m.id}
            style={{
              marginRight: 8,
              padding: '6px 12px',
              backgroundColor: map.currentMapId === m.id ? '#4CAF50' : '#fff',
              color: map.currentMapId === m.id ? '#fff' : '#333',
              border: '1px solid #ccc',
              borderRadius: 4,
              cursor: map.currentMapId === m.id ? 'default' : 'pointer',
            }}
          >
            {m.name}
          </button>
        ))}
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#666' }}>
          {currentMap.description} | 已通关节点: {map.totalCleared}
        </p>
      </div>

      {/* 当前战斗状态 */}
      {simulation?.isActive && (
        <div style={{
          padding: 16,
          marginBottom: 16,
          border: '2px solid #4CAF50',
          borderRadius: 8,
          backgroundColor: '#E8F5E9'
        }}>
          <h3 style={{ margin: '0 0 8px 0' }}>
            {nodeTypeStyles[simulation.nodeType]?.icon} 战斗中: {simulation.nodeName}
            {simulation.timeLimit && (
              <span style={{ marginLeft: 12, color: '#FF9800' }}>
                ⏱️ 限时 {simulation.timeLimit}秒
              </span>
            )}
          </h3>
          <div style={{
            height: 20,
            backgroundColor: '#ddd',
            borderRadius: 10,
            overflow: 'hidden',
            marginBottom: 8
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (simulation.currentDamage / simulation.nodeHp) * 100)}%`,
              backgroundColor: simulation.timeLimit ? '#FF9800' : '#4CAF50',
              transition: 'width 0.1s'
            }} />
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>
            伤害: {Math.floor(simulation.currentDamage)} / {simulation.nodeHp} HP
            | 剩余: {Math.max(0, Math.ceil(simulation.ttk - (Date.now() - simulation.startedAt) / 1000))}秒
            {simulation.timeLimit && (
              <span style={{ marginLeft: 8, color: '#FF9800' }}>
                | 时限: {Math.max(0, Math.ceil(simulation.timeLimit - (Date.now() - simulation.startedAt) / 1000))}秒
              </span>
            )}
          </p>
        </div>
      )}

      {/* 节点列表 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {map.reachable.map((id) => {
          const node = currentMap.nodes[id]
          if (!node) return null
          const cleared = map.cleared.includes(id)
          const preview = simulateCombat(id)
          const isFighting = simulation?.isActive && simulation.nodeId === id
          const typeStyle = nodeTypeStyles[node.type] || nodeTypeStyles.normal
          const canAttack = canDamageNode(node)

          return (
            <div
              key={id}
              style={{
                border: isFighting ? `2px solid ${typeStyle.color}` : '1px solid #ccc',
                borderRadius: 6,
                padding: 12,
                width: 260,
                opacity: cleared ? 0.6 : 1,
                backgroundColor: cleared ? '#f0f0f0' : isFighting ? '#E8F5E9' : '#fff',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0' }}>
                {typeStyle.icon} {node.name}
              </h4>
              <p style={{ fontSize: 14, margin: '4px 0', color: typeStyle.color }}>
                类型: {typeStyle.label}
                {node.shieldType && <span> ({node.shieldType})</span>}
                {node.timeLimit && <span> | 时限: {node.timeLimit}秒</span>}
              </p>
              <p style={{ fontSize: 14, margin: '4px 0' }}>HP: {node.hp}</p>
              {preview && !cleared && (
                <p style={{ fontSize: 14, margin: '4px 0', color: '#666' }}>
                  预估时间: {preview.ttk}秒
                  {node.type === 'shield' && !canAttack && <span style={{ color: '#F44336' }}> (需破盾)</span>}
                </p>
              )}
              {!cleared && !simulation?.isActive && (
                <button
                  onClick={() => startBattle(id)}
                  disabled={!canAttack}
                  style={{
                    marginTop: 8,
                    padding: '6px 16px',
                    cursor: canAttack ? 'pointer' : 'not-allowed',
                    opacity: canAttack ? 1 : 0.5,
                  }}
                >
                  挑战
                </button>
              )}
              {isFighting && (
                <span style={{ color: typeStyle.color, fontWeight: 'bold' }}>战斗中...</span>
              )}
              {cleared && <span style={{ color: 'green' }}>✓ 已通关</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}