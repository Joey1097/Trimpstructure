/**
 * @Input: useResearchStore, RESEARCH, useWorldStore, useEffect
 * @Output: ResearchPanel 组件 - 研究面板
 * @Pos: UI 面板，显示研究列表和进度
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useEffect } from 'react'
import { useResearchStore } from '../systems/research'
import { RESEARCH } from '../data/research'
import { useWorldStore } from '../systems/world'

// 分类样式
const categoryStyles: Record<string, { color: string; label: string }> = {
    efficiency: { color: '#4CAF50', label: '效率' },
    unlock: { color: '#2196F3', label: '解锁' },
    automation: { color: '#9C27B0', label: '自动化' },
}

export default function ResearchPanel() {
    const { completed, current, canStart, canAfford, startResearch, tickResearch, getProgress } = useResearchStore()
    const currencies = useWorldStore((s) => s.world.currencies)

    // 研究进度 tick
    useEffect(() => {
        if (!current) return
        const interval = setInterval(tickResearch, 100)
        return () => clearInterval(interval)
    }, [current, tickResearch])

    const researchList = Object.values(RESEARCH)
    const progress = getProgress()

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
            <h2>研究</h2>

            {/* 资源显示 */}
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                <strong>研究资源: </strong>
                <span style={{ marginRight: 16 }}>📘 蓝图: {currencies.blueprint.toString()}</span>
                <span>🧠 记忆: {currencies.memory.toString()}</span>
            </div>

            {/* 当前研究 */}
            {current && (
                <div style={{
                    padding: 16,
                    marginBottom: 16,
                    border: '2px solid #2196F3',
                    borderRadius: 8,
                    backgroundColor: '#E3F2FD'
                }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>🔬 研究中: {RESEARCH[current.researchId]?.name}</h3>
                    <div style={{
                        height: 20,
                        backgroundColor: '#ddd',
                        borderRadius: 10,
                        overflow: 'hidden',
                        marginBottom: 8
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress * 100}%`,
                            backgroundColor: '#2196F3',
                            transition: 'width 0.1s'
                        }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 14 }}>
                        进度: {Math.floor(progress * 100)}%
                        | 剩余: {Math.max(0, Math.ceil(current.duration * (1 - progress)))}秒
                    </p>
                </div>
            )}

            {/* 研究列表 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {researchList.map((research) => {
                    const isCompleted = completed.includes(research.id)
                    const canStartThis = canStart(research.id)
                    const canAffordThis = canAfford(research.id)
                    const categoryStyle = categoryStyles[research.category] || categoryStyles.efficiency
                    const prereqsMet = research.prerequisites.every(p => completed.includes(p))

                    return (
                        <div
                            key={research.id}
                            style={{
                                border: isCompleted ? '2px solid #4CAF50' : '1px solid #ccc',
                                borderRadius: 6,
                                padding: 12,
                                width: 260,
                                opacity: isCompleted ? 0.7 : prereqsMet ? 1 : 0.5,
                                backgroundColor: isCompleted ? '#E8F5E9' : '#fff',
                            }}
                        >
                            <h4 style={{ margin: '0 0 8px 0' }}>
                                {research.name}
                                <span style={{
                                    float: 'right',
                                    fontSize: 12,
                                    padding: '2px 6px',
                                    backgroundColor: categoryStyle.color,
                                    color: '#fff',
                                    borderRadius: 4,
                                }}>
                                    {categoryStyle.label}
                                </span>
                            </h4>
                            <p style={{ fontSize: 14, color: '#666', margin: '0 0 8px 0' }}>
                                {research.description}
                            </p>

                            {!isCompleted && (
                                <>
                                    <div style={{ fontSize: 12, marginBottom: 8 }}>
                                        <strong>费用: </strong>
                                        {research.baseCost.blueprint && <span>📘{research.baseCost.blueprint.toString()} </span>}
                                        {research.baseCost.memory && <span>🧠{research.baseCost.memory.toString()} </span>}
                                        | ⏱️{research.researchTime}秒
                                    </div>
                                    {research.prerequisites.length > 0 && (
                                        <div style={{ fontSize: 12, marginBottom: 8, color: prereqsMet ? '#4CAF50' : '#F44336' }}>
                                            前置: {research.prerequisites.map(p => RESEARCH[p]?.name || p).join(', ')}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => startResearch(research.id)}
                                        disabled={!canStartThis || !canAffordThis}
                                        style={{
                                            padding: '6px 12px',
                                            cursor: canStartThis && canAffordThis ? 'pointer' : 'not-allowed',
                                            opacity: canStartThis && canAffordThis ? 1 : 0.5,
                                        }}
                                    >
                                        {current ? '研究中...' : canAffordThis ? '开始研究' : '资源不足'}
                                    </button>
                                </>
                            )}
                            {isCompleted && (
                                <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>✓ 已完成</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
