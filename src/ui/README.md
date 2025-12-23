# UI 模块

React UI 组件层，负责渲染游戏界面。

## 文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `Dashboard.tsx` | ✅ 稳定 | 概览面板（资源/人口） |
| `WorldPanel.tsx` | ✅ 稳定 | 世界节点树面板 |
| `ArtifactPanel.tsx` | ✅ 稳定 | 神器管理面板 |
| `MapPanel.tsx` | ✅ 稳定 | 地图推进面板（多地图 + 战斗进度） |
| `AutomationPanel.tsx` | ✅ 稳定 | 自动化规则面板 |
| `BuildingPanel.tsx` | ✅ 稳定 | 建筑升级面板 |
| `ResearchPanel.tsx` | ✅ 稳定 | 研究面板 |
| `PrestigePanel.tsx` | ✅ 稳定 | 传承面板 |
| `StatsPanel.tsx` | ✅ 稳定 | 统计与目标面板 |
| `SettingsPanel.tsx` | ✅ 稳定 | 设置面板 |
| `AchievementPanel.tsx` | ✅ 稳定 | 成就面板 |
| `ResearchPanel.tsx` | ✅ 稳定 | 研究面板 |
| `PrestigePanel.tsx` | ✅ 稳定 | 传承面板 |
| `StatsPanel.tsx` | ✅ 稳定 | 统计与目标面板 |
| `SettingsPanel.tsx` | ✅ 稳定 | 设置面板 |

## 导航结构

通过 `App.tsx` 的 tab 切换访问各面板：
- 概览 → Dashboard
- 统计 → StatsPanel
- 建筑 → BuildingPanel
- 研究 → ResearchPanel
- 世界 → WorldPanel
- 神器 → ArtifactPanel
- 地图 → MapPanel
- 自动化 → AutomationPanel
- 传承 → PrestigePanel
- 设置 → SettingsPanel

---
⚠️ **Warning**: If the structure of this folder changes, update this document.
