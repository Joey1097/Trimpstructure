/**
 * @Input: useGameStore, useCombatStore, usePrestigeStore, useBuildingStore, useResearchStore
 * @Output: StatsPanel 组件 - 统计与目标面板
 * @Pos: UI 面板，显示游戏统计、乘数链路和下一目标推荐
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useGameStore } from '../state/store'
import { useCombatStore } from '../systems/combat'
import { usePrestigeStore } from '../systems/prestige'
import { useBuildingStore } from '../systems/buildings'
import { useResearchStore } from '../systems/research'
import { BUILDINGS } from '../data/buildings'

export default function StatsPanel() {
    const resources = useGameStore((s) => s.resources)
    const population = useGameStore((s) => s.population)
    const { map, combat } = useCombatStore()
    const { legacyPoints, prestigeCount, getLegacyMultiplier } = usePrestigeStore()
    const buildingLevels = useBuildingStore((s) => s.levels)
    const completedResearch = useResearchStore((s) => s.completed)

    // 计算总建筑等级
    const totalBuildingLevels = Object.values(buildingLevels).reduce((sum, lv) => sum + lv, 0)

    // 计算综合乘数
    const legacyMul = getLegacyMultiplier()
    const worldMul = combat.worldMultiplier
    const artifactMul = combat.artifactMultiplier
    const totalMul = legacyMul.mul(worldMul).mul(artifactMul)

    // 目标推荐逻辑
    const getNextGoal = () => {
        if (map.totalCleared < 3) return { icon: '🗺️', text: '通关3个节点解锁传承', progress: map.totalCleared, target: 3 }
        if (totalBuildingLevels < 5) return { icon: '🏗️', text: '升级5级建筑提高效率', progress: totalBuildingLevels, target: 5 }
        if (completedResearch.length < 1) return { icon: '🔬', text: '完成首个研究项目', progress: completedResearch.length, target: 1 }
        if (prestigeCount < 1) return { icon: '⚡', text: '执行首次传承', progress: prestigeCount, target: 1 }
        if (map.totalCleared < 10) return { icon: '🗺️', text: '通关10个节点解锁更多地图', progress: map.totalCleared, target: 10 }
        return { icon: '🏆', text: '继续探索更深的地图', progress: map.totalCleared, target: 20 }
    }

    const nextGoal = getNextGoal()

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
            <h2>统计与目标</h2>

            {/* 下一目标 */}
            <div style={{
                padding: 16,
                marginBottom: 16,
                border: '2px solid #FF9800',
                borderRadius: 8,
                backgroundColor: '#FFF3E0'
            }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{nextGoal.icon} 当前目标</h3>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{nextGoal.text}</p>
                <div style={{
                    height: 16,
                    backgroundColor: '#ddd',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.min(100, (nextGoal.progress / nextGoal.target) * 100)}%`,
                        backgroundColor: '#FF9800',
                        transition: 'width 0.3s'
                    }} />
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: '#666' }}>
                    进度: {nextGoal.progress} / {nextGoal.target}
                </p>
            </div>

            {/* 核心统计 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                <StatCard icon="🗺️" label="通关节点" value={map.totalCleared} />
                <StatCard icon="⚡" label="传承次数" value={prestigeCount} />
                <StatCard icon="💎" label="传承点" value={legacyPoints.toString()} />
                <StatCard icon="🏗️" label="建筑总等级" value={totalBuildingLevels} />
                <StatCard icon="🔬" label="完成研究" value={completedResearch.length} />
                <StatCard icon="👥" label="总人口" value={population.total} />
            </div>

            {/* 乘数链路可视化 */}
            <div style={{
                padding: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                marginBottom: 16
            }}>
                <h3 style={{ margin: '0 0 12px 0' }}>📊 乘数链路</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <MultiplierNode label="基础" value="1.00" color="#9E9E9E" />
                    <span style={{ fontSize: 18 }}>×</span>
                    <MultiplierNode label="传承" value={legacyMul.toFixed(2)} color="#9C27B0" />
                    <span style={{ fontSize: 18 }}>×</span>
                    <MultiplierNode label="世界" value={worldMul.toFixed(2)} color="#2196F3" />
                    <span style={{ fontSize: 18 }}>×</span>
                    <MultiplierNode label="神器" value={artifactMul.toFixed(2)} color="#FF9800" />
                    <span style={{ fontSize: 18 }}>=</span>
                    <MultiplierNode label="总计" value={totalMul.toFixed(2)} color="#4CAF50" isTotal />
                </div>
                <p style={{ margin: '12px 0 0', fontSize: 14, color: '#666' }}>
                    💡 乘数越高，资源产出和战斗力越强。通过传承、世界节点和神器提升乘数。
                </p>
            </div>

            {/* 资源概览 */}
            <div style={{
                padding: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 8
            }}>
                <h3 style={{ margin: '0 0 12px 0' }}>📦 资源状态</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {Object.entries(resources.amounts).map(([key, val]) => (
                        <div key={key} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: '#666' }}>{key}</div>
                            <div style={{ fontWeight: 'bold' }}>{val.toFixed(0)}</div>
                            <div style={{ fontSize: 10, color: '#999' }}>
                                / {resources.caps[key as keyof typeof resources.caps].toString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// 统计卡片组件
function StatCard({ icon, label, value }: { icon: string; label: string; value: number | string }) {
    return (
        <div style={{
            padding: 12,
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: 8,
            textAlign: 'center'
        }}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>{value}</div>
        </div>
    )
}

// 乘数节点组件
function MultiplierNode({ label, value, color, isTotal = false }: {
    label: string;
    value: string;
    color: string;
    isTotal?: boolean;
}) {
    return (
        <div style={{
            padding: '8px 12px',
            backgroundColor: isTotal ? color : '#fff',
            border: `2px solid ${color}`,
            borderRadius: 8,
            textAlign: 'center',
            minWidth: 60,
        }}>
            <div style={{ fontSize: 10, color: isTotal ? '#fff' : '#666' }}>{label}</div>
            <div style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: isTotal ? '#fff' : color
            }}>
                ×{value}
            </div>
        </div>
    )
}
