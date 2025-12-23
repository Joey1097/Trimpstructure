# Save 模块

数据持久化层，负责游戏存档的存储和恢复。

## 文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `index.ts` | ✅ 稳定 | 存档核心（IndexedDB + 自动保存 + 完整游戏状态） |
| `save.test.ts` | ✅ 稳定 | 存档测试 |

## 导出

- `saveState(state)` - 保存当前状态到 IndexedDB
- `loadState()` - 从 IndexedDB 加载状态
- `startAutoSave(interval)` - 启动自动保存

## 存储结构

- IndexedDB: `trimpstructure` → `saves` → `latest`
- LocalStorage: `save_summary` (快速恢复指针)

## 保存的系统状态

| 系统 | 保存内容 |
|------|----------|
| 基础资源 | 资源数量/上限/乘数、人口分配 |
| 战斗/地图 | 当前地图、已清除节点、战斗属性 |
| 传承 | 传承点、觉醒晶体、重置次数 |
| 世界节点 | 已解锁/购买节点、货币 |
| 建筑 | 建筑等级 |
| 研究 | 已完成研究、进行中研究 |
| 神器 | 背包、装备、预设 |
| 成就 | 已解锁成就、总成就点 |
| 日常 | 登录天数、任务进度 |
| 自动化 | 自动化规则 |

---
⚠️ **Warning**: If the structure of this folder changes, update this document.
