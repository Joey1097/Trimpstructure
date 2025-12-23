/**
 * @Input: Decimal.js
 * @Output: WORLD_NODES - 世界节点配置表, WorldNode/NodeBranch 类型
 * @Pos: 数据定义层，提供世界节点树的静态配置（含M4扩展分支）
 * @Notice: If this file changes, update this block AND the folder's README.
 */

import Decimal from 'decimal.js'

export type NodeBranch = 'resource' | 'combat' | 'control' | 'automation' | 'attack' | 'defense' | 'efficiency'

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
  // === 基础节点 ===
  root: {
    id: 'root',
    name: '世界起点',
    branch: 'resource',
    description: '解锁世界树，开启全局乘数',
    cost: { blueprint: new Decimal(0), memory: new Decimal(0) },
    unlocks: ['res1', 'com1', 'atk1', 'def1', 'eff1'],
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

  // === M4 攻击分支 ===
  atk1: {
    id: 'atk1',
    name: '锋刃强化',
    branch: 'attack',
    description: '攻击力 +25%',
    cost: { blueprint: new Decimal(20), memory: new Decimal(15) },
    unlocks: ['atk2'],
    multipliers: { attack: new Decimal(1.25) },
    prerequisites: ['root'],
  },
  atk2: {
    id: 'atk2',
    name: '暴击本能',
    branch: 'attack',
    description: '攻击力 +35%，对护盾额外 +20%',
    cost: { blueprint: new Decimal(60), memory: new Decimal(45) },
    unlocks: ['atk3'],
    multipliers: { attack: new Decimal(1.35), shieldDamage: new Decimal(1.2) },
    prerequisites: ['atk1'],
  },
  atk3: {
    id: 'atk3',
    name: '毁灭之力',
    branch: 'attack',
    description: '攻击力 +50%',
    cost: { blueprint: new Decimal(120), memory: new Decimal(90) },
    unlocks: [],
    multipliers: { attack: new Decimal(1.5) },
    prerequisites: ['atk2'],
  },

  // === M4 防御分支 ===
  def1: {
    id: 'def1',
    name: '铁壁',
    branch: 'defense',
    description: '生命值 +30%',
    cost: { blueprint: new Decimal(20), memory: new Decimal(15) },
    unlocks: ['def2'],
    multipliers: { health: new Decimal(1.3) },
    prerequisites: ['root'],
  },
  def2: {
    id: 'def2',
    name: '环境适应',
    branch: 'defense',
    description: '环境伤害减免 50%',
    cost: { blueprint: new Decimal(55), memory: new Decimal(40) },
    unlocks: ['def3'],
    multipliers: { envResist: new Decimal(0.5) },
    prerequisites: ['def1'],
  },
  def3: {
    id: 'def3',
    name: '不屈意志',
    branch: 'defense',
    description: '限时节点时间 +30%',
    cost: { blueprint: new Decimal(100), memory: new Decimal(75) },
    unlocks: [],
    multipliers: { timeBonus: new Decimal(1.3) },
    prerequisites: ['def2'],
  },

  // === M4 效率分支 ===
  eff1: {
    id: 'eff1',
    name: '快速采集',
    branch: 'efficiency',
    description: '资源采集速度 +20%',
    cost: { blueprint: new Decimal(18), memory: new Decimal(12) },
    unlocks: ['eff2'],
    multipliers: { gatherSpeed: new Decimal(1.2) },
    prerequisites: ['root'],
  },
  eff2: {
    id: 'eff2',
    name: '建设专家',
    branch: 'efficiency',
    description: '建筑升级成本 -15%',
    cost: { blueprint: new Decimal(50), memory: new Decimal(35) },
    unlocks: ['eff3'],
    multipliers: { buildingCost: new Decimal(0.85) },
    prerequisites: ['eff1'],
  },
  eff3: {
    id: 'eff3',
    name: '研究天赋',
    branch: 'efficiency',
    description: '研究速度 +40%',
    cost: { blueprint: new Decimal(90), memory: new Decimal(70) },
    unlocks: [],
    multipliers: { researchSpeed: new Decimal(1.4) },
    prerequisites: ['eff2'],
  },
}