/**
 * @Input: useGameStore (资源/人口状态), useCombatStore, usePrestigeStore, useWorldStore, useArtifactStore
 * @Output: Dashboard 组件 - 概览面板（资源显示/人口分配/乘算链路可视化）
 * @Pos: UI 主面板，显示核心游戏状态和产出分解
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useState } from 'react'
import { useGameStore } from '../state/store'
import { useCombatStore } from '../systems/combat'
import { usePrestigeStore } from '../systems/prestige'
import { useWorldStore } from '../systems/world'
import { useArtifactStore } from '../systems/artifacts'
import Decimal from 'decimal.js'

// 资源产出分解组件
function ProductionBreakdown({
  resourceKey,
  label,
  assignedPop
}: {
  resourceKey: string
  label: string
  assignedPop: number
}) {
  const [showDetail, setShowDetail] = useState(false)

  const worldMul = useWorldStore((s) => s.getMultiplier('resource'))
  const artifactMul = useArtifactStore((s) => s.getArtifactMultiplier('resource'))
  const legacyMul = usePrestigeStore((s) => s.getLegacyMultiplier())

  // 各效率因子（简化版，实际可从建筑系统获取）
  const basePop = new Decimal(assignedPop)
  const jobEff = new Decimal(1)
  const buildingEff = new Decimal(1)

  // 计算每秒产出
  const perSecond = basePop.mul(jobEff).mul(buildingEff).mul(worldMul).mul(artifactMul).mul(legacyMul)

  // 计算各段贡献百分比
  const totalMul = worldMul.mul(artifactMul).mul(legacyMul)

  return (
    <div
      style={{
        padding: '8px 12px',
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        border: showDetail ? '2px solid #4CAF50' : '1px solid #ddd',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={() => setShowDetail(true)}
      onMouseLeave={() => setShowDetail(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>{label}</span>
        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
          +{perSecond.toFixed(2)}/秒
        </span>
      </div>

      {showDetail && (
        <div style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px dashed #ddd',
          fontSize: 13,
          color: '#666'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <MultiplierChip label="人口" value={basePop.toString()} color="#9E9E9E" />
            <span>×</span>
            <MultiplierChip label="岗位" value={jobEff.toFixed(2)} color="#607D8B" />
            <span>×</span>
            <MultiplierChip label="建筑" value={buildingEff.toFixed(2)} color="#795548" />
            <span>×</span>
            <MultiplierChip label="世界" value={worldMul.toFixed(2)} color="#2196F3" />
            <span>×</span>
            <MultiplierChip label="神器" value={artifactMul.toFixed(2)} color="#FF9800" />
            <span>×</span>
            <MultiplierChip label="传承" value={legacyMul.toFixed(2)} color="#9C27B0" />
          </div>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            总乘数: <strong style={{ color: '#4CAF50' }}>×{totalMul.toFixed(2)}</strong>
          </div>
        </div>
      )}
    </div>
  )
}

// 乘数标签组件
function MultiplierChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span style={{
      padding: '2px 8px',
      backgroundColor: color,
      color: '#fff',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 'bold'
    }}>
      {label}: {value}
    </span>
  )
}

function ResourceRow({ label, value, cap }: { label: string; value: Decimal; cap: Decimal }) {
  const percentage = value.div(cap).mul(100).toNumber()
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
        <span>{label}</span>
        <span>
          {value.toFixed(2)} / {cap.toFixed(0)}
        </span>
      </div>
      <div style={{
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, percentage)}%`,
          backgroundColor: percentage > 90 ? '#f44336' : '#4CAF50',
          transition: 'width 0.3s'
        }} />
      </div>
    </div>
  )
}

function PopulationSlider({ role }: { role: keyof ReturnType<typeof useGameStore>['population']['assignment'] }) {
  const assignment = useGameStore((s) => s.population.assignment)
  const total = useGameStore((s) => s.population.total)
  const setAssign = useGameStore((s) => s.assignPopulation)
  const value = assignment[role]

  const roleLabels: Record<string, string> = {
    worker: '工人 🪓',
    builder: '建造者 🔨',
    researcher: '研究员 🔬',
    soldier: '士兵 ⚔️',
    scout: '探索者 🔍'
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{roleLabels[role] || role}</span>
        <span style={{ fontWeight: 'bold' }}>{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={total}
        value={value}
        onChange={(e) => setAssign(role, parseInt(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default function Dashboard() {
  const amounts = useGameStore((s) => s.resources.amounts)
  const caps = useGameStore((s) => s.resources.caps)
  const total = useGameStore((s) => s.population.total)
  const assignment = useGameStore((s) => s.population.assignment)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      {/* 资源 + 产出分解 */}
      <section style={{ marginBottom: 24 }}>
        <h2>📦 资源</h2>
        <ResourceRow label="🪵 木" value={amounts.wood} cap={caps.wood} />
        <ResourceRow label="🪨 石" value={amounts.stone} cap={caps.stone} />
        <ResourceRow label="⛏️ 铁" value={amounts.iron} cap={caps.iron} />
        <ResourceRow label="🍞 食" value={amounts.food} cap={caps.food} />
        <ResourceRow label="💎 晶体" value={amounts.crystal} cap={caps.crystal} />
      </section>

      {/* 产出分解（悬浮查看详情） */}
      <section style={{ marginBottom: 24 }}>
        <h2>📊 每秒产出 <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>（悬浮查看分解）</span></h2>
        <ProductionBreakdown resourceKey="wood" label="🪵 木材" assignedPop={assignment.worker} />
        <ProductionBreakdown resourceKey="stone" label="🪨 石材" assignedPop={assignment.builder} />
        <ProductionBreakdown resourceKey="iron" label="⛏️ 铁矿" assignedPop={assignment.soldier} />
        <ProductionBreakdown resourceKey="food" label="🍞 食物" assignedPop={assignment.scout} />
      </section>

      {/* 人口分配 */}
      <section>
        <h2>👥 人口分配（总数 {total}）</h2>
        <PopulationSlider role="worker" />
        <PopulationSlider role="builder" />
        <PopulationSlider role="researcher" />
        <PopulationSlider role="soldier" />
        <PopulationSlider role="scout" />
      </section>
    </div>
  )
}
