/**
 * @Input: Decimal.js
 * @Output: WORLD_NODES - 世界节点配置表, WorldNode/NodeBranch 类型
 * @Pos: 数据定义层，提供世界节点树的静态配置
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import Decimal from 'decimal.js'

export type NodeBranch = 'resource' | 'combat' | 'control' | 'automation'

export interface WorldNode {
  id: string
  name: string
  branch: NodeBranch
  description: string
  cost: Record<string, Decimal>
  unlocks: string[]
  multipliers: Partial<Record<string, Decimal>>
  prerequisites: string[]
}

export const WORLD_NODES: Record<string, WorldNode> = {
  root: {
    id: 'root',
    name: '世界起点',
    branch: 'resource',
    description: '解锁世界树，开启全局乘数',
    cost: { blueprint: new Decimal(0), memory: new Decimal(0) },
    unlocks: ['res1', 'com1'],
    multipliers: { worldMultiplier: new Decimal(1) },
    prerequisites: [],
  },
  res1: {
    id: 'res1',
    name: '资源增效 I',
    branch: 'resource',
    description: '资源产出 +20%',
    cost: { blueprint: new Decimal(10), memory: new Decimal(5) },
    unlocks: ['res2'],
    multipliers: { resource: new Decimal(1.2) },
    prerequisites: ['root'],
  },
  res2: {
    id: 'res2',
    name: '离线收益 I',
    branch: 'resource',
    description: '离线收益上限延长至 12h',
    cost: { blueprint: new Decimal(30), memory: new Decimal(20) },
    unlocks: [],
    multipliers: { offlineCap: new Decimal(12) },
    prerequisites: ['res1'],
  },
  com1: {
    id: 'com1',
    name: '战斗基础',
    branch: 'combat',
    description: '基础攻击 +15%',
    cost: { blueprint: new Decimal(15), memory: new Decimal(10) },
    unlocks: ['com2'],
    multipliers: { attack: new Decimal(1.15) },
    prerequisites: ['root'],
  },
  com2: {
    id: 'com2',
    name: '破盾训练',
    branch: 'combat',
    description: '解锁破盾机制',
    cost: { blueprint: new Decimal(50), memory: new Decimal(40) },
    unlocks: [],
    multipliers: { shieldBreak: new Decimal(1) },
    prerequisites: ['com1'],
  },
}