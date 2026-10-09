// 游戏结算弹窗：胜利 / 失败
import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface GameModalProps {
  visible: boolean
  won: boolean
  /** 本关得分（每关独立计分，从 0 开始） */
  score: number
  target: number
  /** 本关历史最高分 */
  bestScore: number
  hasNext: boolean
  onRetry: () => void
  onNext: () => void
  onHome: () => void
}

export default function GameModal({
  visible,
  won,
  score,
  target,
  bestScore,
  hasNext,
  onRetry,
  onNext,
  onHome
}: GameModalProps) {
  if (!visible) return null

  const isNewBest = score >= bestScore && score > 0

  return (
    <View className={styles.mask}>
      <View className={styles.card}>
        <Text className={styles.emoji}>{won ? '🎉' : '😢'}</Text>
        <Text className={styles.title}>{won ? '过关啦！' : '差一点点'}</Text>
        <Text className={styles.desc}>
          {won
            ? `步数用完，本关得分 ${score} 达到目标 ${target} 分`
            : `步数用完，还差 ${Math.max(1, target - score)} 分就能过关`}
        </Text>

        <View className={styles.scoreRow}>
          <View className={styles.scoreItem}>
            <Text className={styles.scoreValue}>{score}</Text>
            <Text className={styles.scoreLabel}>本关得分</Text>
          </View>
          <View className={styles.scoreDivider} />
          <View className={styles.scoreItem}>
            <Text className={classnames(styles.scoreValue, styles.bestValue)}>{bestScore}</Text>
            <Text className={styles.scoreLabel}>{isNewBest && won ? '新纪录！' : '本关最高'}</Text>
          </View>
        </View>

        <View className={styles.buttonGroup}>
          {won ? (
            <>
              {hasNext && (
                <View className={styles.primaryButton} onClick={onNext}>
                  <Text className={styles.primaryText}>下一关</Text>
                </View>
              )}
              <View className={won && hasNext ? styles.ghostButton : styles.primaryButton} onClick={onHome}>
                <Text className={won && hasNext ? styles.ghostText : styles.primaryText}>返回首页</Text>
              </View>
            </>
          ) : (
            <>
              <View className={styles.primaryButton} onClick={onRetry}>
                <Text className={styles.primaryText}>再试一次</Text>
              </View>
              <View className={styles.ghostButton} onClick={onHome}>
                <Text className={styles.ghostText}>返回首页</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  )
}
