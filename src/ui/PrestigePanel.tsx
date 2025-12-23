/**
 * @Input: usePrestigeStore, useCombatStore
 * @Output: PrestigePanel 组件 - 传承面板
 * @Pos: UI 面板，显示传承状态和执行传承
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { usePrestigeStore } from '../systems/prestige'
import { useCombatStore } from '../systems/combat'

export default function PrestigePanel() {
    const {
        legacyPoints,
        prestigeCount,
        totalLegacyPoints,
        canPrestige,
        getPrestigeGain,
        doPrestige,
        getLegacyMultiplier,
    } = usePrestigeStore()

    const cleared = useCombatStore((s) => s.map.cleared.length)
    const canDoPrestige = canPrestige()
    const gain = getPrestigeGain()
    const multiplier = getLegacyMultiplier()

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
            <h2>传承 (Prestige)</h2>

            {/* 当前状态 */}
            <div style={{
                padding: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                marginBottom: 16
            }}>
                <h3 style={{ margin: '0 0 12px 0' }}>当前状态</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 12, color: '#666' }}>传承点</div>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#9C27B0' }}>
                            {legacyPoints.toString()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#666' }}>传承次数</div>
                        <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                            {prestigeCount}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#666' }}>历史总点数</div>
                        <div style={{ fontSize: 18 }}>
                            {totalLegacyPoints.toString()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#666' }}>当前乘数</div>
                        <div style={{ fontSize: 18, color: '#4CAF50' }}>
                            ×{multiplier.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* 传承预览 */}
            <div style={{
                padding: 16,
                border: canDoPrestige ? '2px solid #9C27B0' : '1px solid #ddd',
                borderRadius: 8,
                marginBottom: 16,
                opacity: canDoPrestige ? 1 : 0.6,
            }}>
                <h3 style={{ margin: '0 0 12px 0' }}>传承预览</h3>
                <p style={{ margin: '8px 0' }}>
                    已通关节点: <strong>{cleared}</strong> / 3 (最低要求)
                </p>
                {canDoPrestige && (
                    <p style={{ margin: '8px 0', color: '#9C27B0', fontWeight: 'bold' }}>
                        将获得: +{gain.toString()} 传承点
                    </p>
                )}

                <div style={{ marginTop: 16 }}>
                    <button
                        onClick={doPrestige}
                        disabled={!canDoPrestige}
                        style={{
                            padding: '12px 24px',
                            fontSize: 16,
                            backgroundColor: canDoPrestige ? '#9C27B0' : '#ccc',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: canDoPrestige ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {canDoPrestige ? '执行传承' : '条件不足'}
                    </button>
                </div>
            </div>

            {/* 警告 */}
            <div style={{
                padding: 12,
                backgroundColor: '#FFF3E0',
                borderRadius: 6,
                fontSize: 14,
                color: '#E65100'
            }}>
                ⚠️ 传承将重置：资源、建筑、地图进度。保留：传承点、世界节点。
            </div>
        </div>
    )
}
