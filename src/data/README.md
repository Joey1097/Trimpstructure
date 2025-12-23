# Data 模块

游戏数据定义层，包含静态配置表。

## 文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `worldNodes.ts` | ✅ 稳定 | 世界节点树配置 |
| `buildings.ts` | ✅ 稳定 | 建筑配置表（5种建筑） |
| `research.ts` | ✅ 稳定 | 研究配置表（6种研究） |
| `maps.ts` | ✅ 稳定 | 多地图配置（新手/森林/沙漠） |
| `equipment.ts` | ✅ 稳定 | 装备配置表（7件装备） |

## 依赖关系

```
buildings.ts → systems/buildings.ts → ui/BuildingPanel.tsx
research.ts → systems/research.ts → ui/ResearchPanel.tsx
maps.ts → systems/combat.ts → ui/MapPanel.tsx
equipment.ts → (待集成)
```

---
⚠️ **Warning**: If the structure of this folder changes, update this document.
