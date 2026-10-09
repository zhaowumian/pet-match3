// 单个萌宠格子：绝对定位 + 位置过渡动画（交换/下落自然播放）
import React from 'react'
import { View } from '@tarojs/components'
import classnames from 'classnames'
import { Tile } from '@/types/game'
import { ANIMALS } from '@/data/animals'
import styles from './index.module.scss'

interface AnimalCellProps {
  tile: Tile
  row: number
  col: number
  selected: boolean
  clearing: boolean
  onTap: () => void
}

const CELL_PERCENT = 100 / 8 // 8x8 棋盘

export default function AnimalCell({ tile, row, col, selected, clearing, onTap }: AnimalCellProps) {
  const animal = ANIMALS[tile.type] ?? ANIMALS[0]

  const positionStyle = {
    top: `${row * CELL_PERCENT}%`,
    left: `${col * CELL_PERCENT}%`
  } as React.CSSProperties

  // 新补充的元素：从棋盘顶部上方滑落到目标位置（偏移量通过 CSS 变量传入动画）
  const fallStyle =
    typeof tile.fallFrom === 'number'
      ? ({ '--fall-from': `${tile.fallFrom * 100}%` } as React.CSSProperties)
      : {}

  return (
    <View
      className={classnames(
        styles.cell,
        selected && styles.selected,
        clearing && styles.clearing,
        typeof tile.fallFrom === 'number' && styles.falling
      )}
      style={{ ...positionStyle, ...fallStyle }}
      onClick={onTap}
    >
      <View className={styles.inner} style={{ backgroundColor: animal.bg }}>
        <View className={styles.emoji}>{animal.emoji}</View>
      </View>
    </View>
  )
}
