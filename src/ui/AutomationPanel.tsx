import { useAutomationStore, type AutomationRule } from '../systems/automation'
import { useArtifactStore } from '../systems/artifacts'
import { useState } from 'react'

const PRESET_RULES: Omit<AutomationRule, 'id'>[] = [
  {
    name: '资源充足时切换攻击预设',
    enabled: false,
    conditions: [
      { type: 'resource', key: 'wood', op: '>=', value: 1000 },
      { type: 'resource', key: 'stone', op: '>=', value: 500 }
    ],
    actions: [
      { type: 'switchPreset', payload: 0 },
      { type: 'setPopulation', payload: { role: 'soldier', value: 10 } }
    ]
  },
  {
    name: '低资源时切换采集预设',
    enabled: false,
    conditions: [
      { type: 'resource', key: 'wood', op: '<=', value: 100 }
    ],
    actions: [
      { type: 'switchPreset', payload: 1 },
      { type: 'setPopulation', payload: { role: 'worker', value: 15 } }
    ]
  },
  {
    name: '推进地图时增强战力',
    enabled: false,
    conditions: [
      { type: 'map', key: 'clearedCount', op: '>=', value: 5 }
    ],
    actions: [
      { type: 'setPopulation', payload: { role: 'soldier', value: 20 } }
    ]
  }
]

export default function AutomationPanel() {
  const { automation, addRule, updateRule, deleteRule } = useAutomationStore()
  const [editingRule, setEditingRule] = useState<string | null>(null)

  const addPresetRule = (preset: Omit<AutomationRule, 'id'>) => {
    addRule(preset)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>自动化规则</h2>
      
      <div style={{ marginBottom: 20 }}>
        <h3>预设规则</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESET_RULES.map((preset, idx) => (
            <button key={idx} onClick={() => addPresetRule(preset)} style={{ fontSize: 12 }}>
              添加: {preset.name}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => addRule({ name: '新规则', enabled: true, conditions: [], actions: [] })}>
        添加自定义规则
      </button>
      
      <div style={{ marginTop: 12 }}>
        {automation.rules.map((r) => (
          <div key={r.id} style={{ border: '1px solid #ccc', borderRadius: 6, padding: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>{r.name}</span>
              <div>
                <button onClick={() => setEditingRule(editingRule === r.id ? null : r.id)} style={{ marginRight: 8 }}>
                  {editingRule === r.id ? '收起' : '编辑'}
                </button>
                <button onClick={() => deleteRule(r.id)}>删除</button>
              </div>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={(e) => updateRule(r.id, { enabled: e.target.checked })}
                />{' '}
                启用
              </label>
            </div>
            
            {editingRule === r.id && (
              <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <RuleEditor rule={r} onUpdate={(patch) => updateRule(r.id, patch)} />
              </div>
            )}
            
            {!r.conditions.length && !r.actions.length && (
              <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
                此规则暂无条件和动作
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RuleEditor({ rule, onUpdate }: { rule: AutomationRule; onUpdate: (patch: Partial<AutomationRule>) => void }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label>
          规则名称:
          <input
            type="text"
            value={rule.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            style={{ marginLeft: 8 }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: 12 }}>
        <strong>条件 ({rule.conditions.length}):</strong>
        {rule.conditions.map((cond, idx) => (
          <div key={idx} style={{ fontSize: 13, marginLeft: 8, marginTop: 4 }}>
            • {cond.type}.{cond.key} {cond.op} {cond.value}
          </div>
        ))}
        {rule.conditions.length === 0 && (
          <div style={{ fontSize: 13, color: '#666', marginLeft: 8 }}>暂无条件</div>
        )}
      </div>
      
      <div>
        <strong>动作 ({rule.actions.length}):</strong>
        {rule.actions.map((action, idx) => (
          <div key={idx} style={{ fontSize: 13, marginLeft: 8, marginTop: 4 }}>
            • {action.type}: {JSON.stringify(action.payload)}
          </div>
        ))}
        {rule.actions.length === 0 && (
          <div style={{ fontSize: 13, color: '#666', marginLeft: 8 }}>暂无动作</div>
        )}
      </div>
      
      <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
        提示: 目前需要通过预设规则或代码来添加条件和动作
      </div>
    </div>
  )
}