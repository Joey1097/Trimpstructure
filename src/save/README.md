# Save 模块

数据持久化层，负责游戏存档的存储和恢复。

## 文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `index.ts` | ✅ 稳定 | 存档核心（IndexedDB + 自动保存） |
| `save.test.ts` | ✅ 稳定 | 存档测试 |

## 导出

- `saveState(state)` - 保存当前状态到 IndexedDB
- `loadState()` - 从 IndexedDB 加载状态
- `startAutoSave(interval)` - 启动自动保存

## 存储结构

- IndexedDB: `trimpstructure` → `saves` → `latest`
- LocalStorage: `save_summary` (快速恢复指针)

---
⚠️ **Warning**: If the structure of this folder changes, update this document.
