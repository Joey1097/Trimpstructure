# Core 模块

核心游戏逻辑模块，包含公式计算和游戏主循环。

## 文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| `formulas.ts` | ✅ 稳定 | 资源产出和战斗力计算公式 |
| `formulas.test.ts` | ✅ 稳定 | 公式单元测试 |
| `loop.ts` | ✅ 稳定 | 游戏主循环，1秒 tick 驱动 |

## 依赖关系

```
formulas.ts ← loop.ts
           ← systems/combat.ts (通过 calcCombatPower)
```

---
⚠️ **Warning**: If the structure of this folder changes, update this document.
