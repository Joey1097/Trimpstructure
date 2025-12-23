/**
 * @Input: useAchievementStore, ACHIEVEMENTS, CATEGORY_STYLES, useEffect
 * @Output: AchievementPanel 组件 - 成就面板
 * @Pos: UI 面板，显示成就列表和进度
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useEffect } from 'react'
import { useAchievementStore } from '../systems/achievements'
import { ACHIEVEMENTS, CATEGORY_STYLES, type AchievementCategory } from '../data/achievements'

const CATEGORIES: AchievementCategory[] = ['explore', 'efficiency', 'collection', 'challenge']

export default function AchievementPanel() {
    const { unlocked, totalPoints, checkAchievements, getProgress, isUnlocked } = useAchievementStore()

    // 定期检查成就
    useEffect(() => {
        const interval = setInterval(checkAchievements, 1000)
        return () => clearInterval(interval)
    }, [checkAchievements])

    const achievements = Object.values(ACHIEVEMENTS)
    const unlockedCount = unlocked.length
    const totalCount = achievements.length

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
            <h2>成就</h2>

            {/* 总览 */}
            <div style={{
                padding: 16,
                marginBottom: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-around',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>{unlockedCount}/{totalCount}</div>
                    <div style={{ fontSize: 14, color: '#666' }}>已解锁成就</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>{totalPoints.toString()}</div>
                    <div style={{ fontSize: 14, color: '#666' }}>成就点数</div>
                </div>
            </div>

            {/* 分类展示 */}
            {CATEGORIES.map((category) => {
                const style = CATEGORY_STYLES[category]
                const categoryAchievements = achievements.filter(a => a.category === category)

                return (
                    <div key={category} style={{ marginBottom: 24 }}>
                        <h3 style={{ color: style.color }}>
                            {style.icon} {style.label}成就
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            {categoryAchievements.map((achievement) => {
                                const done = isUnlocked(achievement.id)
                                const { current, target } = getProgress(achievement.id)
                                const progress = Math.min(100, (current / target) * 100)

                                return (
                                    <div
                                        key={achievement.id}
                                        style={{
                                            border: done ? `2px solid ${style.color}` : '1px solid #ddd',
                                            borderRadius: 8,
                                            padding: 12,
                                            width: 200,
                                            backgroundColor: done ? '#E8F5E9' : '#fff',
                                            opacity: done ? 1 : 0.8,
                                        }}
                                    >
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: 14 }}>
                                            {done && '✓ '}{achievement.name}
                                        </h4>
                                        <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px 0' }}>
                                            {achievement.description}
                                        </p>

                                        {!done && (
                                            <>
                                                <div style={{
                                                    height: 8,
                                                    backgroundColor: '#eee',
                                                    borderRadius: 4,
                                                    overflow: 'hidden',
                                                    marginBottom: 4,
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${progress}%`,
                                                        backgroundColor: style.color,
                                                        transition: 'width 0.3s',
                                                    }} />
                                                </div>
                                                <div style={{ fontSize: 10, color: '#999' }}>
                                                    {current} / {target}
                                                </div>
                                            </>
                                        )}

                                        {done && (
                                            <div style={{ fontSize: 11, color: style.color }}>
                                                +{achievement.reward.value.toString()} {achievement.reward.type === 'points' ? '点数' : '乘数'}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
