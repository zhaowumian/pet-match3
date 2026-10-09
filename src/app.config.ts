export default defineAppConfig({
  pages: ['pages/home/index', 'pages/game/index', 'pages/rank/index', 'pages/mine/index'],
  tabBar: {
    color: '#999999',
    selectedColor: '#ff6b9d',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.svg',
        selectedIconPath: 'assets/tabbar/home-selected.svg'
      },
      {
        pagePath: 'pages/rank/index',
        text: '排行榜',
        iconPath: 'assets/tabbar/rank.svg',
        selectedIconPath: 'assets/tabbar/rank-selected.svg'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.svg',
        selectedIconPath: 'assets/tabbar/mine-selected.svg'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffedf5',
    navigationBarTitleText: '萌宠消消乐',
    navigationBarTextStyle: 'black'
  }
})
