# Systems 模块

游戏子系统集合，各系统独立管理特定功能域。

## 文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `artifacts.ts` | ✅ 稳定 | 神器系统（背包/装备/预设） |
| `automation.ts` | ✅ 稳定 | 自动化规则引擎 |
| `automation.test.ts` | ✅ 稳定 | 自动化测试 |
| `buildings.ts` | ✅ 稳定 | 建筑系统 store |
| `combat.ts` | ✅ 稳定 | 战斗与地图系统（多地图 + 护盾/限时） |
| `combat.test.ts` | ✅ 稳定 | 战斗系统测试 |
| `offline.ts` | ✅ 稳定 | 离线收益计算 |
| `prestige.ts` | ✅ 稳定 | 传承系统（传承点/重置） |
| `research.ts` | ✅ 稳定 | 研究系统 store |
| `world.ts` | ✅ 稳定 | 世界节点树 |
| `worldEffects.ts` | ✅ 稳定 | 世界乘数同步器 |

## 依赖关系

```
state/store ← automation ← core/loop
           ← artifacts
           ← buildings ← data/buildings
           ← combat ← world, data/maps
           ← offline
           ← prestige ← combat, buildings
           ← research ← data/research, world
           ← worldEffects ← world
```

---
⚠️ **Warning**: If the structure of this folder changes, update this document.
