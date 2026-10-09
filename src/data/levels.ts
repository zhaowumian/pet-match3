import { LevelConfig } from '@/types/game'

/**
 * 全部关卡配置：每关独立计分（从 0 开始）
 * 目标分数为本关独立目标，随关卡递增；步数逐渐收紧
 */
export const LEVELS: LevelConfig[] = [
  { id: 1, name: '新手牧场', targetScore: 800, steps: 20 },
  { id: 2, name: '糖果小镇', targetScore: 1000, steps: 20 },
  { id: 3, name: '彩虹森林', targetScore: 1200, steps: 20 },
  { id: 4, name: '云朵山谷', targetScore: 1400, steps: 20 },
  { id: 5, name: '莓果海岛', targetScore: 1600, steps: 22 },
  { id: 6, name: '星空沙漠', targetScore: 1800, steps: 22 },
  { id: 7, name: '甜蜜雪山', targetScore: 2000, steps: 24 },
  { id: 8, name: '彩虹极光', targetScore: 2300, steps: 24 },
  { id: 9, name: '梦幻城堡', targetScore: 2600, steps: 26 },
  { id: 10, name: '终极乐园', targetScore: 3000, steps: 28 }
]

/** 根据 id 获取关卡（越界回退到第一关） */
export function getLevel(id: number): LevelConfig {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0]
}
