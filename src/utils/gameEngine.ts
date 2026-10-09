// 三消游戏核心引擎（纯函数，不依赖 UI）
import { Board, Position, Tile } from '@/types/game'

export const ROWS = 8
export const COLS = 8
export const ANIMAL_TYPE_COUNT = 6

// 动物元素自增 id 计数器（保证全局唯一，用于动画跟踪）
let tileIdCounter = 1

/** 位置转唯一字符串 key */
export function posKey(row: number, col: number): string {
  return `${row},${col}`
}

function createTile(type: number): Tile {
  return { id: tileIdCounter++, type }
}

function randomType(): number {
  return Math.floor(Math.random() * ANIMAL_TYPE_COUNT)
}

/** 生成一个无初始三连、且存在可行步骤的棋盘 */
export function createBoard(): Board {
  const board: Board = []
  for (let r = 0; r < ROWS; r++) {
    const row: (Tile | null)[] = []
    for (let c = 0; c < COLS; c++) {
      let type = randomType()
      // 避免与左侧两格、上方两格形成初始三连
      while (
        (c >= 2 && row[c - 1]?.type === type && row[c - 2]?.type === type) ||
        (r >= 2 && board[r - 1][c]?.type === type && board[r - 2][c]?.type === type)
      ) {
        type = randomType()
      }
      row.push(createTile(type))
    }
    board.push(row)
  }
  if (!hasAvailableMoves(board)) {
    console.log('[GameEngine] 初始棋盘无解，重新生成')
    return createBoard()
  }
  return board
}

/**
 * 检测棋盘上所有横向/纵向 3 连以上的位置集合
 * @returns 形如 "r,c" 的位置 key 集合
 */
export function findMatches(board: Board): Set<string> {
  const matched = new Set<string>()

  // 横向扫描
  for (let r = 0; r < ROWS; r++) {
    let runStart = 0
    for (let c = 1; c <= COLS; c++) {
      const prev = board[r][c - 1]
      const cur = c < COLS ? board[r][c] : null
      if (prev === null || cur === null || cur.type !== prev.type) {
        if (c - runStart >= 3 && prev !== null) {
          for (let k = runStart; k < c; k++) matched.add(posKey(r, k))
        }
        runStart = c
      }
    }
  }

  // 纵向扫描
  for (let c = 0; c < COLS; c++) {
    let runStart = 0
    for (let r = 1; r <= ROWS; r++) {
      const prev = board[r - 1][c]
      const cur = r < ROWS ? board[r][c] : null
      if (prev === null || cur === null || cur.type !== prev.type) {
        if (r - runStart >= 3 && prev !== null) {
          for (let k = runStart; k < r; k++) matched.add(posKey(k, c))
        }
        runStart = r
      }
    }
  }

  return matched
}

/** 将匹配位置从棋盘上移除（置 null） */
export function applyClear(board: Board, matches: Set<string>): Board {
  return board.map((row, r) =>
    row.map((tile, c) => (tile && matches.has(posKey(r, c)) ? null : tile))
  )
}

/** 重力下落：每列非空元素下沉，顶部留空 */
export function applyGravity(board: Board): Board {
  const newBoard: Board = board.map((row) => [...row])
  for (let c = 0; c < COLS; c++) {
    let write = ROWS - 1
    for (let r = ROWS - 1; r >= 0; r--) {
      const tile = newBoard[r][c]
      if (tile !== null) {
        newBoard[write][c] = tile
        if (write !== r) newBoard[r][c] = null
        write--
      }
    }
  }
  return newBoard
}

/**
 * 为所有空位随机补充新动物
 * 新元素携带 fallFrom 偏移：整列从棋盘顶部上方一格处同步滑落到各自目标位置
 */
export function refill(board: Board): Board {
  const newBoard: Board = board.map((row) => [...row])
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (newBoard[r][c] === null) {
        // 重力后空位都集中在列顶部：第 r 行的新元素从棋盘顶外一格（-1 屏幕行）滑入
        // translateY = -(r + 1) 格 → 起始屏幕位置统一为棋盘顶外一格，整列同步滑落
        newBoard[r][c] = { ...createTile(randomType()), fallFrom: -(r + 1) }
      }
    }
  }
  return newBoard
}

/** 交换棋盘上两个位置的元素（返回新棋盘） */
export function swapCells(board: Board, a: Position, b: Position): Board {
  const newBoard: Board = board.map((row) => [...row])
  const tmp = newBoard[a.row][a.col]
  newBoard[a.row][a.col] = newBoard[b.row][b.col]
  newBoard[b.row][b.col] = tmp
  return newBoard
}

/** 两位置是否上下左右相邻 */
export function isAdjacent(a: Position, b: Position): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1
}

/**
 * 炸弹道具：以目标位置为中心的 3x3 爆炸范围（自动裁剪边界）
 * @returns 待消除的位置 key 集合（"r,c"）
 */
export function getBombArea(board: Board, center: Position): Set<string> {
  const area = new Set<string>()
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = center.row + dr
      const c = center.col + dc
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] !== null) {
        area.add(posKey(r, c))
      }
    }
  }
  return area
}

/** 寻找一个可行的交换步骤（用于死局检测） */
export function findAvailableMove(board: Board): [Position, Position] | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // 尝试与右侧交换
      if (c + 1 < COLS) {
        const swapped = swapCells(board, { row: r, col: c }, { row: r, col: c + 1 })
        if (findMatches(swapped).size > 0) {
          return [
            { row: r, col: c },
            { row: r, col: c + 1 }
          ]
        }
      }
      // 尝试与下方交换
      if (r + 1 < ROWS) {
        const swapped = swapCells(board, { row: r, col: c }, { row: r + 1, col: c })
        if (findMatches(swapped).size > 0) {
          return [
            { row: r, col: c },
            { row: r + 1, col: c }
          ]
        }
      }
    }
  }
  return null
}

/** 棋盘是否还有可行步骤 */
export function hasAvailableMoves(board: Board): boolean {
  return findAvailableMove(board) !== null
}

/**
 * 洗牌：打乱现有元素位置，直到无初始匹配且有解
 * 元素 id 不变，UI 上会自然播放位置移动动画
 * 最多尝试 60 次，超限返回最后一次布局（避免极端情况下无限递归）
 */
export function shuffleBoard(board: Board): Board {
  const tiles = board.flat().filter((t): t is Tile => t !== null)
  let lastCandidate: Board = board

  for (let attempt = 0; attempt < 60; attempt++) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = tiles[i]
      tiles[i] = tiles[j]
      tiles[j] = tmp
    }
    const candidate: Board = []
    let idx = 0
    for (let r = 0; r < ROWS; r++) {
      const row: (Tile | null)[] = []
      for (let c = 0; c < COLS; c++) {
        row.push(tiles[idx++] ?? null)
      }
      candidate.push(row)
    }
    lastCandidate = candidate
    if (findMatches(candidate).size === 0 && hasAvailableMoves(candidate)) {
      return candidate
    }
  }

  console.warn('[GameEngine] 洗牌多次仍未找到有效布局，返回最后一次布局')
  return lastCandidate
}

/**
 * 计分：消除数量越多、连锁次数越多，得分越高
 * 3 个 = 30 分，4 个 = 60 分，5 个及以上 = 150 分；连锁加成 ×(1 + 0.5 × (combo-1))
 */
export function calcScore(clearedCount: number, combo: number): number {
  const base = clearedCount >= 5 ? 150 : clearedCount === 4 ? 60 : 30
  return Math.round(base * (1 + (combo - 1) * 0.5))
}
