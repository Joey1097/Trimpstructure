# State 模块

Zustand 全局状态管理，存储游戏核心数据。

## 文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `store.ts` | ✅ 稳定 | 全局游戏状态（资源/人口/乘数） |

## 导出

- `useGameStore` - Zustand store hook
- `ResourceKey` - 资源类型
- `GameState`, `ResourcesState`, `PopulationState` - 类型定义

---
⚠️ **Warning**: If the structure of this folder changes, update this document.
