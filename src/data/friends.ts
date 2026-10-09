// 好友排行数据：开发阶段使用稳定的模拟好友名单
// 上线说明：真实好友排行需接入微信「开放数据域」，
// 用 wx.setUserCloudStorage 上报总积分、开放数据域 wx.getFriendCloudStorage 拉取好友成绩，
// 将 getFriendRank() 替换为开放数据域数据即可。

export interface FriendEntry {
  id: string
  name: string
  avatar: string
  score: number
}

const MOCK_FRIENDS: FriendEntry[] = [
  { id: 'f1', name: '消消小能手', avatar: '🦊', score: 5820 },
  { id: 'f2', name: '豆豆龙', avatar: '🐼', score: 4130 },
  { id: 'f3', name: '甜甜圈', avatar: '🐰', score: 3560 },
  { id: 'f4', name: '阿波罗', avatar: '🦁', score: 2740 },
  { id: 'f5', name: '柠檬精', avatar: '🐸', score: 1980 },
  { id: 'f6', name: '摸鱼选手', avatar: '🐙', score: 1240 },
  { id: 'f7', name: '路过的', avatar: '🐧', score: 680 }
]

export interface RankedEntry {
  id: string
  name: string
  avatar: string
  score: number
  /** 是否为当前玩家 */
  isMe: boolean
  /** 名次（从 1 开始） */
  rank: number
}

/**
 * 生成好友排行榜：模拟好友 + 当前玩家按总积分插入排序
 * @param myScore 玩家总积分（所有关卡积分总和）
 */
export function getFriendRank(myScore: number): RankedEntry[] {
  const me: FriendEntry = { id: 'me', name: '我', avatar: '⭐', score: myScore }
  const all = [...MOCK_FRIENDS, me].sort((a, b) => b.score - a.score)
  return all.map((entry, index) => ({
    ...entry,
    isMe: entry.id === 'me',
    rank: index + 1
  }))
}
