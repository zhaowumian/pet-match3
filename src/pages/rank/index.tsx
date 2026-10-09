// 排行榜页：好友排行（总积分）+ 各关积分明细
import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import { LEVELS } from '@/data/levels'
import { getFriendRank } from '@/data/friends'
import { useGameStore, sumLevelScores } from '@/store/gameStore'
import RankPageStyles from './index.module.scss'

const MEDALS = ['🥇', '🥈', '🥉']

export default function RankPage() {
  const levelScores = useGameStore((s) => s.levelScores)
  const unlockedLevel = useGameStore((s) => s.unlockedLevel)

  // 总积分 = 所有关卡积分总和
  const totalScore = sumLevelScores(levelScores)
  const passedCount = LEVELS.filter((l) => unlockedLevel > l.id).length
  const friendRank = getFriendRank(totalScore)

  return (
    <View className={classnames('pageGradient', RankPageStyles.page)}>
      <View className={RankPageStyles.summaryCard}>
        <Text className={RankPageStyles.summaryEmoji}>🏆</Text>
        <View className={RankPageStyles.summaryRight}>
          <Text className={RankPageStyles.summaryTitle}>总积分 {totalScore}</Text>
          <Text className={RankPageStyles.summaryDesc}>已通过 {passedCount} / {LEVELS.length} 关</Text>
        </View>
      </View>

      {/* 好友排行（开发阶段为模拟好友，上线接入开放数据域） */}
      <View className={RankPageStyles.sectionTitle}>
        <Text className={RankPageStyles.sectionTitleText}>👫 好友排行</Text>
      </View>
      <View className={RankPageStyles.list}>
        {friendRank.map((entry) => (
          <View key={entry.id} className={classnames(RankPageStyles.item, entry.isMe && RankPageStyles.meItem)}>
            <Text className={RankPageStyles.rank}>
              {entry.rank <= 3 ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
            </Text>
            <Text className={RankPageStyles.avatar}>{entry.avatar}</Text>
            <View className={RankPageStyles.itemInfo}>
              <Text className={classnames(RankPageStyles.itemName, entry.isMe && RankPageStyles.meName)}>
                {entry.name}
                {entry.isMe && '（我）'}
              </Text>
            </View>
            <Text className={RankPageStyles.itemScore}>{entry.score} 分</Text>
          </View>
        ))}
      </View>

      {/* 各关积分明细（每关历史最高净得分） */}
      <View className={RankPageStyles.sectionTitle}>
        <Text className={RankPageStyles.sectionTitleText}>📊 关卡积分</Text>
      </View>
      <View className={RankPageStyles.list}>
        {LEVELS.map((level) => {
          const best = levelScores[level.id] ?? 0
          const passed = unlockedLevel > level.id
          return (
            <View key={level.id} className={RankPageStyles.item}>
              <Text className={RankPageStyles.rank}>{`#${level.id}`}</Text>
              <View className={RankPageStyles.itemInfo}>
                <Text className={RankPageStyles.itemName}>
                  第{level.id}关 · {level.name}
                </Text>
                <Text className={RankPageStyles.itemSub}>
                  {passed ? '已通关' : unlockedLevel === level.id ? '进行中' : '未解锁'}
                </Text>
              </View>
              <Text className={classnames(RankPageStyles.itemScore, best === 0 && RankPageStyles.itemScoreEmpty)}>
                {best > 0 ? `${best} 分` : '--'}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
