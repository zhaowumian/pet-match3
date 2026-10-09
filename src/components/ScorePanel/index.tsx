// 计分板：目标进度条 + 分数 + 剩余步数 + 连击标签
import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface ScorePanelProps {
  score: number
  target: number
  steps: number
  levelName: string
  combo: number
}

export default function ScorePanel({ score, target, steps, levelName, combo }: ScorePanelProps) {
  const percent = Math.min(100, Math.round((score / target) * 100))

  return (
    <View className={styles.panel}>
      <View className={styles.left}>
        <View className={styles.titleRow}>
          <Text className={styles.levelName}>{levelName}</Text>
          {combo >= 2 && <Text className={styles.comboTag}>连击 ×{combo}!</Text>}
        </View>
        <View className={styles.progressTrack}>
          <View className={styles.progressFill} style={{ width: `${percent}%` }} />
        </View>
        <Text className={styles.scoreText}>
          {score} / {target} 分
        </Text>
      </View>
      <View className={styles.stepsBox}>
        <Text className={classnames(styles.stepsNum, steps <= 3 && styles.stepsDanger)}>{steps}</Text>
        <Text className={styles.stepsLabel}>剩余步数</Text>
      </View>
    </View>
  )
}
