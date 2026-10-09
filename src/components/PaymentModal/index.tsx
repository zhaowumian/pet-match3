// 道具购买弹窗：道具用完后支付 ¥0.01 获取
import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import type { GameItem } from '@/components/ItemBar'
import styles from './index.module.scss'

interface PaymentModalProps {
  visible: boolean
  /** 当前购买的目标道具 */
  item: GameItem | null
  /** 点击支付按钮 */
  onPay: () => void
  onClose: () => void
}

const ITEM_META: Record<GameItem, { emoji: string; name: string; desc: string }> = {
  bomb: { emoji: '💣', name: '炸弹', desc: '炸掉 3×3 区域，消耗 1 步' },
  shuffle: { emoji: '🔀', name: '重新随机', desc: '打乱全部动物，不消耗步数' }
}

export default function PaymentModal({ visible, item, onPay, onClose }: PaymentModalProps) {
  if (!visible || !item) return null
  const meta = ITEM_META[item]

  return (
    <View className={styles.mask} onClick={onClose}>
      <View className={styles.card} onClick={(e) => e.stopPropagation()}>
        <Text className={styles.title}>获取道具</Text>
        <View className={styles.itemRow}>
          <Text className={styles.itemEmoji}>{meta.emoji}</Text>
          <View className={styles.itemInfo}>
            <Text className={styles.itemName}>{meta.name} × 1</Text>
            <Text className={styles.itemDesc}>{meta.desc}</Text>
          </View>
        </View>
        <Text className={styles.price}>¥0.01</Text>
        <View className={styles.payBtn} onClick={onPay}>
          <Text className={styles.payBtnText}>微信支付 ¥0.01</Text>
        </View>
        <Text className={styles.cancel} onClick={onClose}>暂不需要</Text>
      </View>
    </View>
  )
}
