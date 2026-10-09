// 游戏页：核心三消玩法
import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import { getLevel, LEVELS } from '@/data/levels'
import { useGameLogic } from '@/hooks/useGameLogic'
import { useGameStore } from '@/store/gameStore'
import GameBoard from '@/components/GameBoard'
import ScorePanel from '@/components/ScorePanel'
import GameModal from '@/components/GameModal'
import ItemBar from '@/components/ItemBar'
import PaymentModal from '@/components/PaymentModal'
import GamePageStyles from './index.module.scss'

export default function GamePage() {
  const router = useRouter()
  const levelId = parseInt(router.params.level ?? '1', 10)
  const level = getLevel(Number.isNaN(levelId) ? 1 : levelId)
  // 本关历史最高分（记录保留，重进本关积分清零重新挑战）
  const levelBest = useGameStore((s) => s.levelScores[level.id] ?? 0)

  const {
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
  } = useGameLogic(level)

  const hasNext = level.id < LEVELS.length

  const goBack = () => {
    Taro.navigateBack().catch((e) => console.error('[GamePage] 返回失败', e))
  }

  const goNext = () => {
    Taro.redirectTo({ url: `/pages/game/index?level=${level.id + 1}` }).catch((e) =>
      console.error('[GamePage] 跳转下一关失败', e)
    )
  }

  const goRetry = () => {
    Taro.redirectTo({ url: `/pages/game/index?level=${level.id}` }).catch((e) =>
      console.error('[GamePage] 重试失败', e)
    )
  }

  const goHome = () => {
    Taro.switchTab({ url: '/pages/home/index' }).catch((e) => console.error('[GamePage] 返回首页失败', e))
  }

  return (
    <View className={classnames('pageGradient', GamePageStyles.page)}>
      <View className={GamePageStyles.topBar}>
        <View className={GamePageStyles.backBtn} onClick={goBack}>
          <Text className={GamePageStyles.backArrow}>‹</Text>
          <Text className={GamePageStyles.backText}>返回</Text>
        </View>
        <Text className={GamePageStyles.bestTag}>本关最高 {levelBest} 分</Text>
      </View>

      <ScorePanel score={score} target={level.targetScore} steps={steps} levelName={`第${level.id}关 · ${level.name}`} combo={combo} />

      <View className={GamePageStyles.boardWrap}>
        <GameBoard board={board} selected={selected} clearingIds={clearingIds} onCellTap={handleCellTap} />
        {deadlockTip && (
          <View className={GamePageStyles.deadlockTip}>
            <Text className={GamePageStyles.deadlockEmoji}>😵</Text>
            <Text className={GamePageStyles.deadlockText}>没有可消除的组合，自动重新洗牌</Text>
          </View>
        )}
      </View>

      <ItemBar bombCount={bombCount} shuffleCount={shuffleCount} armed={armedItem === 'bomb'} onItemTap={handleItemTap} />

      <View className={GamePageStyles.tips}>
        {armedItem === 'bomb' ? (
          <Text className={classnames(GamePageStyles.tipsText, GamePageStyles.tipsArmed)}>
            💣 瞄准中：点击棋盘任意动物引爆（再点道具可取消）
          </Text>
        ) : (
          <>
            <Text className={GamePageStyles.tipsText}>点击选中小动物，再点击相邻动物交换位置</Text>
            <Text className={GamePageStyles.tipsText}>凑齐 3 个及以上相同动物即可消除得分</Text>
          </>
        )}
      </View>

      <PaymentModal
        visible={paymentItem !== null}
        item={paymentItem}
        onPay={() => paymentItem && handlePaymentConfirm(paymentItem)}
        onClose={handlePaymentClose}
      />

      <GameModal
        visible={phase === 'won' || phase === 'lost'}
        won={phase === 'won'}
        score={score}
        target={level.targetScore}
        bestScore={levelBest}
        hasNext={hasNext}
        onRetry={goRetry}
        onNext={goNext}
        onHome={goHome}
      />
    </View>
  )
}
