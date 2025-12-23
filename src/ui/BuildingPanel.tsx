/**
 * @Input: useBuildingStore, BUILDINGS, getBuildingCost
 * @Output: BuildingPanel 组件 - 建筑升级面板
 * @Pos: UI 面板，显示建筑列表和升级按钮
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useBuildingStore } from '../systems/buildings'
import { BUILDINGS, getBuildingCost } from '../data/buildings'

export default function BuildingPanel() {
    const { levels, upgradeBuilding, canAfford } = useBuildingStore()

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
            <h2>建筑</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {Object.values(BUILDINGS).map((building) => {
                    const level = levels[building.id] || 0
                    const maxed = level >= building.maxLevel
                    const affordable = canAfford(building.id)
                    const costs = getBuildingCost(building.id, level)

                    return (
                        <div
                            key={building.id}
                            style={{
                                border: '1px solid #ccc',
                                borderRadius: 8,
                                padding: 16,
                                width: 280,
                                backgroundColor: maxed ? '#E8F5E9' : '#fff',
                            }}
                        >
                            <h3 style={{ margin: '0 0 8px 0' }}>
                                {building.name}
                                <span style={{
                                    float: 'right',
                                    color: maxed ? '#4CAF50' : '#666',
                                    fontSize: 14
                                }}>
                                    Lv.{level}/{building.maxLevel}
                                </span>
                            </h3>
                            <p style={{ fontSize: 14, color: '#666', margin: '0 0 12px 0' }}>
                                {building.description}
                            </p>

                            {!maxed && (
                                <>
                                    <div style={{ fontSize: 12, marginBottom: 8 }}>
                                        <strong>升级费用:</strong>
                                        {Object.entries(costs).map(([res, val]) => (
                                            <span key={res} style={{ marginLeft: 8 }}>
                                                {res}: {val.toString()}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => upgradeBuilding(building.id)}
                                        disabled={!affordable}
                                        style={{
                                            padding: '8px 16px',
                                            cursor: affordable ? 'pointer' : 'not-allowed',
                                            opacity: affordable ? 1 : 0.5,
                                        }}
                                    >
                                        升级
                                    </button>
                                </>
                            )}
                            {maxed && (
                                <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                    ✓ 已满级
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
