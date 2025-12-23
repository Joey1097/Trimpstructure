# Trimpstructure 源代码

放置增量游戏前端源代码，基于 React + TypeScript。

## 目录结构

| 目录/文件 | 说明 |
|-----------|------|
| `core/` | 核心模块（公式/游戏循环） |
| `state/` | Zustand 状态管理 |
| `systems/` | 游戏子系统（神器/自动化/战斗/世界） |
| `data/` | 静态数据配置 |
| `save/` | 存档系统 |
| `ui/` | React UI 组件 |
| `main.tsx` | 应用入口 |
| `Root.tsx` | 根组件（初始化循环/存档） |
| `App.tsx` | 主应用（标签页导航） |
| `index.css` | 全局样式 |
| `App.css` | 应用样式 |

## 架构概览

```
main.tsx → Root.tsx → App.tsx → ui/*.tsx
              ↓
        core/loop.ts ← formulas.ts
              ↓
        systems/*.ts ← state/store.ts
              ↓
        save/index.ts
```

---
⚠️ **Warning**: If the structure of this folder changes, update this document.
