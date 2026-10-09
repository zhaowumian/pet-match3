// 游戏棋盘：8x8 萌宠网格
import React from 'react'
import { View } from '@tarojs/components'
import classnames from 'classnames'
import { Board, Position } from '@/types/game'
import AnimalCell from '@/components/AnimalCell'
import styles from './index.module.scss'

interface GameBoardProps {
  board: Board
  selected: Position | null
  clearingIds: Set<number>
  onCellTap: (pos: Position) => void
}

export default function GameBoard({ board, selected, clearingIds, onCellTap }: GameBoardProps) {
  return (
    <View className={classnames(styles.board)}>
      {board.map((row, r) =>
        row.map((tile, c) => {
          if (!tile) return null
          return (
            <AnimalCell
              key={tile.id}
              tile={tile}
              row={r}
              col={c}
              selected={!!selected && selected.row === r && selected.col === c}
              clearing={clearingIds.has(tile.id)}
              onTap={() => onCellTap({ row: r, col: c })}
            />
          )
        })
      )}
    </View>
  )
}
