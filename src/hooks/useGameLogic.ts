// 对局状态机：管理棋盘、选中、交换、消除连锁、计分、胜负判定
import { useCallback, useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { Board, GamePhase, LevelConfig, Position } from '@/types/game'
import * as engine from '@/utils/gameEngine'
import { useGameStore } from '@/store/gameStore'

const SWAP_MS = 260 // 交换动画时长
const CLEAR_MS = 280 // 消除动画时长
const FALL_MS = 300 // 下落动画时长
const DEADLOCK_TIP_MS = 1300 // 死局提示展示时长

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useGameLogic(level: LevelConfig) {
  const [board, setBoard] = useState<Board>(() => engine.createBoard())
  // 每关独立计分：进入关卡时积分清零，从 0 开始
  const [score, setScore] = useState(0)
  const [steps, setSteps] = useState(level.steps)
  const [selected, setSelected] = useState<Position | null>(null)
  /** 正在消除的 tile id 集合（驱动爆裂动画） */
  const [clearingIds, setClearingIds] = useState<Set<number>>(new Set())
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [combo, setCombo] = useState(0)

  // 用 ref 保存最新棋盘，避免异步编排中的闭包过期问题
  const boardRef = useRef<Board>(board)
  const phaseRef = useRef<GamePhase>(phase)
  phaseRef.current = phase
  // 局内分数（ref 保证异步连锁编排中读写始终是最新值）
  const scoreRef = useRef(0)

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: `第${level.id}关 · ${level.name}` }).catch((e) =>
      console.error('[GameLogic] 设置导航标题失败', e)
    )
  }, [level.id, level.name])

  const finish = useCallback(
    (won: boolean, finalScore: number) => {
      setPhase(won ? 'won' : 'lost')
      phaseRef.current = won ? 'won' : 'lost'
      useGameStore.getState().recordResult(level.id, finalScore, won)
      console.log(`[GameLogic] 对局结束 level=${level.id} won=${won} score=${finalScore}`)
    },
    [level.id]
  )

  /** 执行一次完整的「消除 → 下落 → 连锁」流程
   * @param initialClear 可选的初始消除区（炸弹道具指定 3x3 区域），不传则按交换三连检测
   */
  const runResolve = useCallback(
    async (startBoard: Board, newSteps: number, initialClear?: Set<string>) => {
      let local = startBoard
      let matches = initialClear ?? engine.findMatches(local)
      if (matches.size === 0) return

      let combo = 0

      // 连锁循环：消除 → 计分 → 下落 → 补充 → 再检测
      while (matches.size > 0) {
        combo += 1
        setCombo(combo)

        const cleared = matches.size
        const gained = engine.calcScore(cleared, combo)
        scoreRef.current += gained
        setScore(scoreRef.current)
        console.log(`[GameLogic] 连击${combo} 消除${cleared}个 +${gained}分 累计${scoreRef.current}分`)

        // 阶段一：播放消除爆裂动画
        const ids = new Set<number>()
        local.forEach((row, r) =>
          row.forEach((tile, c) => {
            if (tile && matches.has(engine.posKey(r, c))) ids.add(tile.id)
          })
        )
        setClearingIds(ids)
        await sleep(CLEAR_MS)

        // 阶段二：移除元素、下落、补充（tile id 不变，位置变化驱动下落动画）
        local = engine.applyClear(local, matches)
        local = engine.applyGravity(local)
        local = engine.refill(local)
        boardRef.current = local
        setBoard(local)
        setClearingIds(new Set())
        await sleep(FALL_MS)

        matches = engine.findMatches(local)
      }

      setCombo(0)

      // 死局检测：先展示醒目提示，再自动洗牌
      if (!engine.hasAvailableMoves(local)) {
        setDeadlockTip(true)
        await sleep(DEADLOCK_TIP_MS)
        setDeadlockTip(false)
        local = engine.shuffleBoard(local)
        boardRef.current = local
        setBoard(local)
        await sleep(FALL_MS)
      }

      boardRef.current = local

      // 结算规则：步数消耗完才结算本关（累计分达标 → 胜，否则 → 负）
      const finalScore = scoreRef.current
      if (newSteps <= 0) {
        finish(finalScore >= level.targetScore, finalScore)
      } else {
        setPhase('idle')
        phaseRef.current = 'idle'
      }
    },
    [finish, level.targetScore]
  )

  /** 尝试交换两个相邻位置：无匹配则回退（交换失败动画） */
  const trySwap = useCallback(
    async (a: Position, b: Position) => {
      setPhase('busy')
      phaseRef.current = 'busy'

      let local = engine.swapCells(boardRef.current, a, b)
      boardRef.current = local
      setBoard(local)
      await sleep(SWAP_MS)

      const matches = engine.findMatches(local)
      if (matches.size === 0) {
        // 无效交换：回退
        const reverted = engine.swapCells(local, a, b)
        boardRef.current = reverted
        setBoard(reverted)
        await sleep(SWAP_MS)
        setPhase('idle')
        phaseRef.current = 'idle'
        return
      }

      const newSteps = steps - 1
      setSteps(newSteps)
      await runResolve(local, newSteps)
    },
    [runResolve, steps]
  )

  // ===== 道具系统 =====
  /** 每关可用次数：炸弹 ×1、重新随机 ×1 */
  const [bombCount, setBombCount] = useState(1)
  const [shuffleCount, setShuffleCount] = useState(1)
  /** 已激活的道具（'bomb' 表示进入瞄准模式，等待点击棋盘） */
  const [armedItem, setArmedItem] = useState<'bomb' | 'shuffle' | null>(null)
  /** 死局提示：没有可消除的组合（展示片刻后自动洗牌） */
  const [deadlockTip, setDeadlockTip] = useState(false)

  /** 使用炸弹：引爆以目标为中心的 3x3 区域（消耗 1 步，计入本关得分） */
  const useBomb = useCallback(
    async (center: Position) => {
      setPhase('busy')
      phaseRef.current = 'busy'
      setBombCount((c) => c - 1)
      // 炸弹消耗 1 步
      const newSteps = steps - 1
      setSteps(newSteps)
      const area = engine.getBombArea(boardRef.current, center)
      console.log(`[GameLogic] 使用炸弹 中心=(${center.row},${center.col}) 覆盖${area.size}格 剩余步数${newSteps}`)
      await runResolve(boardRef.current, newSteps, area)
    },
    [runResolve, steps]
  )

  /** 使用重新随机：打乱当前棋盘（保证无初始匹配且有解，不消耗步数） */
  const useShuffle = useCallback(async () => {
    setPhase('busy')
    phaseRef.current = 'busy'
    setShuffleCount((c) => c - 1)
    const local = engine.shuffleBoard(boardRef.current)
    boardRef.current = local
    setBoard(local)
    await sleep(FALL_MS)
    setPhase('idle')
    phaseRef.current = 'idle'
  }, [])

  /** 点击道具按钮：炸弹进入/退出瞄准模式，重新随机立即生效；用完则弹出购买弹窗 */
  const handleItemTap = useCallback(
    (item: 'bomb' | 'shuffle') => {
      if (phaseRef.current !== 'idle') return
      if (item === 'bomb') {
        if (bombCount <= 0) {
          setPaymentItem('bomb')
          return
        }
        setArmedItem((prev) => (prev === 'bomb' ? null : 'bomb'))
        return
      }
      if (shuffleCount <= 0) {
        setPaymentItem('shuffle')
        return
      }
      setArmedItem(null)
      void useShuffle()
    },
    [bombCount, shuffleCount, useShuffle]
  )

  // ===== 道具购买（¥0.01 / 个）=====
  const [paymentItem, setPaymentItem] = useState<'bomb' | 'shuffle' | null>(null)

  /** 发放道具并关闭弹窗 */
  const grantItem = useCallback((item: 'bomb' | 'shuffle') => {
    if (item === 'bomb') setBombCount((c) => c + 1)
    else setShuffleCount((c) => c + 1)
    setPaymentItem(null)
    Taro.showToast({ title: '支付成功，道具已发放', icon: 'success', duration: 1500 })
  }, [])

  /** 发起支付：优先拉起微信支付；开发/预览环境不可用时降级为模拟支付 */
  const handlePaymentConfirm = useCallback(
    (item: 'bomb' | 'shuffle') => {
      Taro.requestPayment({
        provider: 'wxpay',
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: Math.random().toString(36).slice(2),
        package: `prepay_id=dev_${Date.now()}`,
        signType: 'RSA',
        paySign: 'dev_placeholder_sign'
      })
        .then(() => {
          console.log('[GameLogic] 微信支付成功', item)
          grantItem(item)
        })
        .catch((e) => {
          console.log('[GameLogic] 微信支付不可用或已取消，提供模拟支付', e?.errMsg)
          Taro.showModal({
            title: '模拟支付',
            content: '当前环境无法拉起微信支付（开发/预览环境）。是否模拟支付 ¥0.01 并发放道具？',
            confirmText: '模拟支付',
            cancelText: '取消'
          })
            .then((res) => {
              if (res.confirm) grantItem(item)
            })
            .catch((err) => console.error('[GameLogic] 弹窗失败', err))
        })
    },
    [grantItem]
  )

  const handlePaymentClose = useCallback(() => setPaymentItem(null), [])

  /** 点击棋盘格子：道具瞄准 / 选中 / 取消 / 触发交换 */
  const handleCellTap = useCallback(
    (pos: Position) => {
      if (phaseRef.current !== 'idle') return
      // 炸弹瞄准模式：点击任意动物引爆 3x3 区域
      if (armedItem === 'bomb') {
        setArmedItem(null)
        void useBomb(pos)
        return
      }
      if (!selected) {
        setSelected(pos)
        return
      }
      if (selected.row === pos.row && selected.col === pos.col) {
        setSelected(null)
        return
      }
      if (engine.isAdjacent(selected, pos)) {
        const a = selected
        setSelected(null)
        void trySwap(a, pos)
      } else {
        setSelected(pos)
      }
    },
    [armedItem, selected, trySwap, useBomb]
  )

  return {
    board,
    score,
    steps,
    selected,
    clearingIds,
    phase,
    combo,
    bombCount,
    shuffleCount,
    armedItem,
    paymentItem,
    deadlockTip,
    handleCellTap,
    handleItemTap,
    handlePaymentConfirm,
    handlePaymentClose
  }
}
