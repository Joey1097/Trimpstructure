/**
 * @Input: useGameStore (资源/人口状态)
 * @Output: Dashboard 组件 - 概览面板（资源显示/人口分配）
 * @Pos: UI 主面板，显示核心游戏状态
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useGameStore } from '../state/store'
import Decimal from 'decimal.js'

function ResourceRow({ label, value, cap }: { label: string; value: Decimal; cap: Decimal }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span>{label}</span>
      <span>
        {value.toFixed(2)} / {cap.toFixed(0)}
      </span>
    </div>
  )
}

function PopulationSlider({ role }: { role: keyof ReturnType<typeof useGameStore>['population']['assignment'] }) {
  const assignment = useGameStore((s) => s.population.assignment)
  const total = useGameStore((s) => s.population.total)
  const setAssign = useGameStore((s) => s.assignPopulation)
  const value = assignment[role]
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{role}</span>
        <span>{value}</span>
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

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <section>
        <h2>资源</h2>
        <ResourceRow label="木" value={amounts.wood} cap={caps.wood} />
        <ResourceRow label="石" value={amounts.stone} cap={caps.stone} />
        <ResourceRow label="铁" value={amounts.iron} cap={caps.iron} />
        <ResourceRow label="食" value={amounts.food} cap={caps.food} />
        <ResourceRow label="晶体" value={amounts.crystal} cap={caps.crystal} />
      </section>

      <section>
        <h2>人口（总数 {total}）</h2>
        <PopulationSlider role="worker" />
        <PopulationSlider role="builder" />
        <PopulationSlider role="researcher" />
        <PopulationSlider role="soldier" />
        <PopulationSlider role="scout" />
      </section>
    </div>
  )
}

