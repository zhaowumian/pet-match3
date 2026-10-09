// 首页：游戏大厅 —— 开始游戏 + 关卡选择
import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { LEVELS } from '@/data/levels'
import { useGameStore, sumLevelScores } from '@/store/gameStore'
import HomePageStyles from './index.module.scss'

export default function HomePage() {
  const unlockedLevel = useGameStore((s) => s.unlockedLevel)
  const levelScores = useGameStore((s) => s.levelScores)
  // 总积分 = 所有关卡积分总和
  const totalScore = sumLevelScores(levelScores)
  const passedCount = LEVELS.filter((l) => unlockedLevel > l.id).length

  const startGame = (levelId: number) => {
    Taro.navigateTo({ url: `/pages/game/index?level=${levelId}` }).catch((e) =>
      console.error('[HomePage] 跳转游戏页失败', e)
    )
  }

  return (
    <View className={classnames('pageGradient', HomePageStyles.page)}>
      {/* Hero 区 */}
      <View className={HomePageStyles.hero}>
        <View className={HomePageStyles.heroEmoji}>
          <Text className={HomePageStyles.heroItem}>🐱</Text>
          <Text className={HomePageStyles.heroItemBig}>🐶</Text>
          <Text className={HomePageStyles.heroItem}>🐰</Text>
        </View>
        <Text className={HomePageStyles.title}>萌宠消消乐</Text>
        <Text className={HomePageStyles.subtitle}>点击交换相邻小动物，凑齐 3 个即可消除</Text>
      </View>

      {/* 开始按钮 */}
      <View className={HomePageStyles.startButton} onClick={() => startGame(Math.min(unlockedLevel, LEVELS.length))}>
        <Text className={HomePageStyles.startText}>
          {unlockedLevel > 1 ? `继续挑战 · 第${Math.min(unlockedLevel, LEVELS.length)}关` : '开始游戏'}
        </Text>
      </View>

      {/* 关卡选择 */}
      <View className={HomePageStyles.sectionTitle}>选择关卡</View>
      <View className={HomePageStyles.levelGrid}>
        {LEVELS.map((level) => {
          const locked = level.id > unlockedLevel
          const best = levelScores[level.id] ?? 0
          const passed = unlockedLevel > level.id
          const isCurrent = level.id === Math.min(unlockedLevel, LEVELS.length)
          return (
            <View
              key={level.id}
              className={classnames(
                HomePageStyles.levelCard,
                locked && HomePageStyles.levelLocked,
                isCurrent && HomePageStyles.levelCurrent
              )}
              onClick={() => !locked && startGame(level.id)}
            >
              <Text className={HomePageStyles.levelId}>{locked ? '🔒' : level.id}</Text>
              <Text className={HomePageStyles.levelName}>{level.name}</Text>
              <Text className={HomePageStyles.levelBest}>
                {locked ? '未解锁' : passed ? `本关最高 ${best} 分` : `目标 ${level.targetScore} 分`}
              </Text>
              {passed && <Text className={HomePageStyles.passBadge}>✓</Text>}
            </View>
          )
        })}
      </View>

      {/* 统计卡片 */}
      <View className={HomePageStyles.statCard}>
        <View className={HomePageStyles.statItem}>
          <Text className={HomePageStyles.statValue}>{passedCount}</Text>
          <Text className={HomePageStyles.statLabel}>已通过关卡</Text>
        </View>
        <View className={HomePageStyles.statDivider} />
        <View className={HomePageStyles.statItem}>
          <Text className={HomePageStyles.statValue}>{totalScore}</Text>
          <Text className={HomePageStyles.statLabel}>总积分</Text>
        </View>
      </View>
    </View>
  )
}
