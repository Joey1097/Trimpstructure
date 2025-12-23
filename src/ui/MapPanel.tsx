/**
 * @Input: useCombatStore, TEST_MAP, useEffect
 * @Output: MapPanel 组件 - 地图推进面板（带战斗模拟）
 * @Pos: UI 面板，显示地图节点、TTK 预估和战斗进度
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useEffect } from 'react'
import { useCombatStore, TEST_MAP } from '../systems/combat'

export default function MapPanel() {
  const { map, simulation, simulateCombat, startBattle, tickBattle } = useCombatStore()

  // 战斗 tick 定时器
  useEffect(() => {
    if (!simulation?.isActive) return
    const interval = setInterval(() => {
      tickBattle()
    }, 100) // 100ms tick
    return () => clearInterval(interval)
  }, [simulation?.isActive, tickBattle])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>地图推进</h2>

      {/* 当前战斗状态 */}
      {simulation?.isActive && (
        <div style={{
          padding: 16,
          marginBottom: 16,
          border: '2px solid #4CAF50',
          borderRadius: 8,
          backgroundColor: '#E8F5E9'
        }}>
          <h3 style={{ margin: '0 0 8px 0' }}>⚔️ 战斗中: {simulation.nodeName}</h3>
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
              backgroundColor: '#4CAF50',
              transition: 'width 0.1s'
            }} />
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>
            伤害: {Math.floor(simulation.currentDamage)} / {simulation.nodeHp} HP
            | 剩余: {Math.max(0, Math.ceil(simulation.ttk - (Date.now() - simulation.startedAt) / 1000))}秒
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {map.reachable.map((id) => {
          const node = TEST_MAP[id]
          if (!node) return null
          const cleared = map.cleared.includes(id)
          const preview = simulateCombat(id)
          const isFighting = simulation?.isActive && simulation.nodeId === id

          return (
            <div
              key={id}
              style={{
                border: isFighting ? '2px solid #4CAF50' : '1px solid #ccc',
                borderRadius: 6,
                padding: 12,
                width: 260,
                opacity: cleared ? 0.6 : 1,
                backgroundColor: cleared ? '#f0f0f0' : isFighting ? '#E8F5E9' : '#fff',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0' }}>{node.name}</h4>
              <p style={{ fontSize: 14, margin: '4px 0' }}>类型: {node.type}</p>
              <p style={{ fontSize: 14, margin: '4px 0' }}>HP: {node.hp}</p>
              {preview && !cleared && (
                <p style={{ fontSize: 14, margin: '4px 0', color: '#666' }}>
                  预估时间: {preview.ttk}秒
                </p>
              )}
              {!cleared && !simulation?.isActive && (
                <button
                  onClick={() => startBattle(id)}
                  style={{ marginTop: 8, padding: '6px 16px', cursor: 'pointer' }}
                >
                  挑战
                </button>
              )}
              {isFighting && (
                <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>战斗中...</span>
              )}
              {cleared && <span style={{ color: 'green' }}>✓ 已通关</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}