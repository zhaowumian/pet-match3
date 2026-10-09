// 我的：玩家信息、玩法说明、进度管理
import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useGameStore, sumLevelScores } from '@/store/gameStore'
import { LEVELS } from '@/data/levels'
import MinePageStyles from './index.module.scss'

const RULES = [
  '点击选中一只小动物，再点击相邻的小动物交换位置',
  '横排或竖排凑齐 3 只相同动物即可消除得分',
  '一次消除越多、连锁反应越长，分数越高',
  '每关独立计分：进入关卡积分清零，历史最高分自动保存',
  '在限定步数内达到本关目标分数即可通关解锁下一关',
  '总积分 = 所有关卡最高分之和',
  '没有可消除的组合时会自动重新洗牌'
]

export default function MinePage() {
  const unlockedLevel = useGameStore((s) => s.unlockedLevel)
  const levelScores = useGameStore((s) => s.levelScores)
  const resetProgress = useGameStore((s) => s.resetProgress)

  const passedCount = LEVELS.filter((l) => unlockedLevel > l.id).length
  // 总积分 = 所有关卡积分总和
  const totalScore = sumLevelScores(levelScores)

  const handleReset = () => {
    Taro.showModal({
      title: '清空游戏进度',
      content: '将删除全部关卡进度和最高分记录，且无法恢复。确定继续吗？',
      confirmColor: '#f65e7c',
      confirmText: '清空',
      success: (res) => {
        if (res.confirm) {
          resetProgress()
          Taro.showToast({ title: '进度已清空', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className={classnames('pageGradient', MinePageStyles.page)}>
      {/* 玩家卡片 */}
      <View className={MinePageStyles.profileCard}>
        <View className={MinePageStyles.avatar}>
          <Text className={MinePageStyles.avatarEmoji}>🎮</Text>
        </View>
        <View className={MinePageStyles.profileInfo}>
          <Text className={MinePageStyles.profileName}>消消乐玩家</Text>
          <Text className={MinePageStyles.profileDesc}>已通关 {passedCount} 关 · 总积分 {totalScore}</Text>
        </View>
      </View>

      {/* 玩法说明 */}
      <View className={MinePageStyles.sectionTitle}>玩法说明</View>
      <View className={MinePageStyles.rulesCard}>
        {RULES.map((rule, i) => (
          <View key={i} className={MinePageStyles.ruleItem}>
            <Text className={MinePageStyles.ruleIndex}>{i + 1}</Text>
            <Text className={MinePageStyles.ruleText}>{rule}</Text>
          </View>
        ))}
      </View>

      {/* 进度管理 */}
      <View className={MinePageStyles.sectionTitle}>进度管理</View>
      <View className={MinePageStyles.dangerCard}>
        <View className={MinePageStyles.dangerInfo}>
          <Text className={MinePageStyles.dangerTitle}>清空游戏进度</Text>
          <Text className={MinePageStyles.dangerDesc}>删除全部关卡进度与最高分记录</Text>
        </View>
        <View className={MinePageStyles.dangerButton} onClick={handleReset}>
          <Text className={MinePageStyles.dangerButtonText}>清空</Text>
        </View>
      </View>

      <Text className={MinePageStyles.version}>萌宠消消乐 v1.0.0</Text>
    </View>
  )
}
