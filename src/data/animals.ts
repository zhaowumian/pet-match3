/** 游戏元素：萌宠 emoji + 糖果底色（纯文本渲染，无需图片资源） */
export interface AnimalItem {
  emoji: string
  bg: string
  name: string
}

export const ANIMALS: AnimalItem[] = [
  { emoji: '🐱', bg: '#ffd9e5', name: '小猫' },
  { emoji: '🐶', bg: '#ffe9c9', name: '小狗' },
  { emoji: '🐰', bg: '#ece5ff', name: '兔子' },
  { emoji: '🦊', bg: '#ffdfc9', name: '狐狸' },
  { emoji: '🐼', bg: '#d8f0ff', name: '熊猫' },
  { emoji: '🐸', bg: '#d9f5dd', name: '青蛙' }
]
