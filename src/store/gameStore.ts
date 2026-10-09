// 全局游戏进度状态（Zustand + 本地存储持久化）
import { create } from 'zustand'
import Taro from '@tarojs/taro'

const KEY_UNLOCKED = 'xxl_unlocked_level'
const KEY_LEVEL_SCORES = 'xxl_level_scores'

interface GameStoreState {
  /** 已解锁的最大关卡 id（从 1 开始） */
  unlockedLevel: number
  /** 每关历史最高分：levelId -> score */
  levelScores: Record<number, number>
  /** 记录一局结果：更新每关最高分，胜利时解锁下一关 */
  recordResult: (levelId: number, score: number, won: boolean) => void
  /** 清空全部进度 */
  resetProgress: () => void
}

function loadUnlocked(): number {
  try {
    const v = Taro.getStorageSync(KEY_UNLOCKED)
    return typeof v === 'number' && v >= 1 ? v : 1
  } catch (e) {
    console.error('[GameStore] 读取解锁进度失败', e)
    return 1
  }
}

function loadRecord(key: string): Record<number, number> {
  try {
    const v = Taro.getStorageSync(key)
    if (v && typeof v === 'object') {
      return v as Record<number, number>
    }
    return {}
  } catch (e) {
    console.error(`[GameStore] 读取 ${key} 失败`, e)
    return {}
  }
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  unlockedLevel: loadUnlocked(),
  levelScores: loadRecord(KEY_LEVEL_SCORES),

  recordResult: (levelId: number, score: number, won: boolean) => {
    const { levelScores, unlockedLevel } = get()
    const prevBest = levelScores[levelId] ?? 0
    const nextLevelScores = { ...levelScores, [levelId]: Math.max(prevBest, score) }
    const nextUnlocked = won && levelId + 1 > unlockedLevel ? levelId + 1 : unlockedLevel
    try {
      Taro.setStorageSync(KEY_LEVEL_SCORES, nextLevelScores)
      Taro.setStorageSync(KEY_UNLOCKED, nextUnlocked)
    } catch (e) {
      console.error('[GameStore] 保存进度失败', e)
    }
    console.log(`[GameStore] 记录结果 level=${levelId} score=${score} won=${won} unlocked=${nextUnlocked}`)
    set({ levelScores: nextLevelScores, unlockedLevel: nextUnlocked })
  },

  resetProgress: () => {
    try {
      Taro.removeStorageSync(KEY_UNLOCKED)
      Taro.removeStorageSync(KEY_LEVEL_SCORES)
    } catch (e) {
      console.error('[GameStore] 清空进度失败', e)
    }
    set({ unlockedLevel: 1, levelScores: {} })
  }
}))

/** 总积分 = 所有关卡最高分之和 */
export function sumLevelScores(levelScores: Record<number, number>): number {
  return Object.values(levelScores).reduce((sum, v) => sum + v, 0)
}
