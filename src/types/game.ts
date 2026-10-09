// 游戏核心类型定义

/** 棋盘格子上的动物元素 */
export interface Tile {
  /** 全局唯一 id，用于 React key 与动画跟踪 */
  id: number
  /** 动物种类索引（0~5），对应 data/animals.ts */
  type: number
  /**
   * 下落起始偏移（单位：格数，负数表示从上方滑入）
   * 仅补充的新元素携带，渲染为「从棋盘顶部滑落」动画；普通元素无此字段
   */
  fallFrom?: number
}

/** 棋盘：二维数组，null 表示空位（消除后待下落） */
export type Board = (Tile | null)[][]

/** 棋盘坐标 */
export interface Position {
  row: number
  col: number
}

/** 关卡配置 */
export interface LevelConfig {
  id: number
  name: string
  /** 通关目标分数 */
  targetScore: number
  /** 限定步数 */
  steps: number
}

/** 对局阶段 */
export type GamePhase = 'idle' | 'busy' | 'won' | 'lost'
