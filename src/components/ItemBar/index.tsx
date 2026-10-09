// 道具栏：炸弹 + 重新随机
import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

export type GameItem = 'bomb' | 'shuffle'

interface ItemBarProps {
  bombCount: number
  shuffleCount: number
  /** 炸弹处于瞄准模式（高亮脉动提示） */
  armed: boolean
  onItemTap: (item: GameItem) => void
}

interface ItemConfig {
  key: GameItem
  emoji: string
  name: string
  desc: string
}

const ITEMS: ItemConfig[] = [
  { key: 'bomb', emoji: '💣', name: '炸弹', desc: '炸掉 3×3 区域 · 耗 1 步' },
  { key: 'shuffle', emoji: '🔀', name: '重新随机', desc: '打乱全部动物 · 免步数' }
]

export default function ItemBar({ bombCount, shuffleCount, armed, onItemTap }: ItemBarProps) {
  const countOf = (key: GameItem) => (key === 'bomb' ? bombCount : shuffleCount)

  return (
    <View className={styles.bar}>
      {ITEMS.map((item) => {
        const count = countOf(item.key)
        const disabled = count <= 0
        const isArmed = item.key === 'bomb' && armed
        return (
          <View
            key={item.key}
            className={classnames(
              styles.item,
              disabled && styles.disabled,
              isArmed && styles.armed
            )}
            onClick={() => onItemTap(item.key)}
          >
            <Text className={styles.emoji}>{item.emoji}</Text>
            <View className={styles.info}>
              <Text className={styles.name}>{item.name}</Text>
              <Text className={styles.desc}>{item.desc}</Text>
            </View>
            <Text className={classnames(styles.count, disabled && styles.countEmpty)}>×{count}</Text>
          </View>
        )
      })}
    </View>
  )
}
