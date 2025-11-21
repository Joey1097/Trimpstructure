import { useWorldStore } from '../systems/world'
import { WORLD_NODES } from '../data/worldNodes'

export default function WorldPanel() {
  const { world, purchaseNode, canPurchase } = useWorldStore()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>世界节点树</h2>
      <div style={{ marginBottom: 12 }}>
        蓝图: {world.currencies.blueprint.toFixed(0)} | 记忆: {world.currencies.memory.toFixed(0)}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {world.unlocked.map((id) => {
          const node = WORLD_NODES[id]
          if (!node) return null
          const owned = world.purchased.includes(id)
          const canBuy = canPurchase(id)
          return (
            <div
              key={id}
              style={{
                border: '1px solid #ccc',
                borderRadius: 6,
                padding: 12,
                width: 260,
                opacity: owned ? 0.7 : 1,
                backgroundColor: canBuy ? '#e6ffe6' : '#fff',
              }}
            >
              <h4>{node.name}</h4>
              <p style={{ fontSize: 14 }}>{node.description}</p>
              <div style={{ fontSize: 13, marginTop: 6 }}>
                消耗: {Object.entries(node.cost).map(([k, v]) => `${k}: ${v.toFixed(0)}`).join(', ')}
              </div>
              <div style={{ marginTop: 8 }}>
                {!owned && (
                  <button disabled={!canBuy} onClick={() => purchaseNode(id)}>
                    {canBuy ? '购买' : '未满足条件'}
                  </button>
                )}
                {owned && <span style={{ color: 'green' }}>已拥有</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}