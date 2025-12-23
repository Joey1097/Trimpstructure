/**
 * @Input: useGameStore, loadState, saveState
 * @Output: SettingsPanel 组件 - 设置面板
 * @Pos: UI 面板，显示游戏设置和存档管理
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import { useState } from 'react'
import { useGameStore } from '../state/store'
import { saveState, loadState } from '../save/index'

export default function SettingsPanel() {
    const tickSeconds = useGameStore((s) => s.tickSeconds)
    const setTickSeconds = useGameStore((s) => s.setTickSeconds)
    const [showResetConfirm, setShowResetConfirm] = useState(false)
    const [saveStatus, setSaveStatus] = useState<string | null>(null)

    // 游戏速度选项
    const speedOptions = [
        { label: '0.5x', value: 2 },
        { label: '1x', value: 1 },
        { label: '2x', value: 0.5 },
        { label: '4x', value: 0.25 },
    ]

    // 手动保存
    const handleManualSave = async () => {
        try {
            const state = useGameStore.getState()
            await saveState(state)
            setSaveStatus('✅ 保存成功')
            setTimeout(() => setSaveStatus(null), 2000)
        } catch {
            setSaveStatus('❌ 保存失败')
            setTimeout(() => setSaveStatus(null), 2000)
        }
    }

    // 手动加载
    const handleManualLoad = async () => {
        try {
            const state = await loadState()
            if (state) {
                useGameStore.getState().hydrate(state)
                setSaveStatus('✅ 加载成功')
            } else {
                setSaveStatus('⚠️ 没有存档')
            }
            setTimeout(() => setSaveStatus(null), 2000)
        } catch {
            setSaveStatus('❌ 加载失败')
            setTimeout(() => setSaveStatus(null), 2000)
        }
    }

    // 重置存档
    const handleReset = () => {
        if (!showResetConfirm) {
            setShowResetConfirm(true)
            return
        }

        // 清除 IndexedDB
        indexedDB.deleteDatabase('trimpstructure')
        localStorage.clear()
        window.location.reload()
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
            <h2>设置</h2>

            {/* 游戏速度 */}
            <div style={{
                padding: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                marginBottom: 16
            }}>
                <h3 style={{ margin: '0 0 12px 0' }}>⚡ 游戏速度</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    {speedOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setTickSeconds(opt.value)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: tickSeconds === opt.value ? '#4CAF50' : '#fff',
                                color: tickSeconds === opt.value ? '#fff' : '#333',
                                border: '1px solid #ccc',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <p style={{ margin: '12px 0 0', fontSize: 14, color: '#666' }}>
                    当前 Tick 间隔: {tickSeconds}秒
                </p>
            </div>

            {/* 存档管理 */}
            <div style={{
                padding: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                marginBottom: 16
            }}>
                <h3 style={{ margin: '0 0 12px 0' }}>💾 存档管理</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={handleManualSave}>手动保存</button>
                    <button onClick={handleManualLoad}>手动加载</button>
                </div>
                {saveStatus && (
                    <p style={{ margin: '12px 0 0', fontWeight: 'bold' }}>{saveStatus}</p>
                )}
                <p style={{ margin: '12px 0 0', fontSize: 14, color: '#666' }}>
                    游戏每 45 秒自动保存一次。
                </p>
            </div>

            {/* 危险操作 */}
            <div style={{
                padding: 16,
                backgroundColor: '#FFEBEE',
                border: '1px solid #F44336',
                borderRadius: 8
            }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#F44336' }}>⚠️ 危险操作</h3>
                {!showResetConfirm ? (
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        style={{
                            backgroundColor: '#F44336',
                            color: '#fff',
                            border: 'none',
                        }}
                    >
                        重置所有数据
                    </button>
                ) : (
                    <div>
                        <p style={{ color: '#F44336', fontWeight: 'bold', margin: '0 0 12px 0' }}>
                            确定要删除所有存档吗？此操作不可撤销！
                        </p>
                        <button
                            onClick={handleReset}
                            style={{
                                backgroundColor: '#F44336',
                                color: '#fff',
                                border: 'none',
                                marginRight: 8,
                            }}
                        >
                            确认删除
                        </button>
                        <button onClick={() => setShowResetConfirm(false)}>
                            取消
                        </button>
                    </div>
                )}
            </div>

            {/* 关于 */}
            <div style={{
                marginTop: 16,
                padding: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 8
            }}>
                <h3 style={{ margin: '0 0 8px 0' }}>ℹ️ 关于</h3>
                <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                    Trimpstructure 原型 v0.3.0<br />
                    基于 React + TypeScript + Zustand
                </p>
            </div>
        </div>
    )
}
