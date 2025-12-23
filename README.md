# Trimpstructure

> 融合 Structure 层级反馈与 Trimps 资源-人口-战斗循环的放置增量游戏原型

## 快速开始

```bash
npm install
npm run dev
```

## 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Zustand | 状态管理 |
| Vite | 构建工具 |
| decimal.js | 大数计算 |
| IndexedDB | 本地存储 |

## 项目结构

```
├── docs/           # 设计文档
│   └── blueprint.md  # 游戏设计蓝图
├── src/            # 源代码
│   ├── core/       # 核心模块
│   ├── state/      # 状态管理
│   ├── systems/    # 游戏系统
│   ├── data/       # 数据配置
│   ├── save/       # 存档系统
│   └── ui/         # UI 组件
└── public/         # 静态资源
```

## 命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm test` | 运行测试 |
| `npm run lint` | 代码检查 |

## 开发进度

详见 [docs/blueprint.md](docs/blueprint.md) 中的里程碑规划。

---
⚠️ **Warning**: If the structure of this project changes, update this document.
