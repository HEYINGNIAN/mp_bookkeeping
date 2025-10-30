// 主题配置系统
const themes = {
  neon: {
    name: '霓虹科技',
    icon: '⚡',
    background: 'linear-gradient(180deg, #0f1a2e 0%, #1a0f2e 100%)',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    cardBg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
    cardBorder: 'rgba(102, 126, 234, 0.4)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    shadowColor: 'rgba(102, 126, 234, 0.5)'
  },
  elegant: {
    name: '唯美典雅',
    icon: '🌹',
    background: 'linear-gradient(180deg, #fff3e0 0%, #fce4ec 100%)',
    primaryColor: '#e91e63',
    secondaryColor: '#f06292',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(233, 30, 99, 0.3)',
    textPrimary: '#4a148c',
    textSecondary: '#7b1fa2',
    shadowColor: 'rgba(233, 30, 99, 0.3)'
  },
  ancient: {
    name: '古韵雅风',
    icon: '🏮',
    background: 'linear-gradient(180deg, #2e2414 0%, #3d2c1e 100%)',
    primaryColor: '#d4af37',
    secondaryColor: '#8b6914',
    cardBg: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(139, 105, 20, 0.1) 100%)',
    cardBorder: 'rgba(212, 175, 55, 0.4)',
    textPrimary: '#f4e4bc',
    textSecondary: '#d4af37',
    shadowColor: 'rgba(212, 175, 55, 0.4)'
  },
  nature: {
    name: '自然风景',
    icon: '🌲',
    background: 'linear-gradient(180deg, #0a4d3a 0%, #1a7d5c 100%)',
    primaryColor: '#66bb6a',
    secondaryColor: '#43a047',
    cardBg: 'linear-gradient(135deg, rgba(102, 187, 106, 0.15) 0%, rgba(67, 160, 71, 0.15) 100%)',
    cardBorder: 'rgba(102, 187, 106, 0.4)',
    textPrimary: '#ffffff',
    textSecondary: '#c8e6c9',
    shadowColor: 'rgba(102, 187, 106, 0.4)'
  },
  cyberpunk: {
    name: '赛博朋克',
    icon: '🌃',
    background: 'linear-gradient(180deg, #0d0d0d 0%, #1a0a1a 100%)',
    primaryColor: '#ff00ff',
    secondaryColor: '#00ffff',
    cardBg: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1) 0%, rgba(0, 255, 255, 0.1) 100%)',
    cardBorder: 'rgba(255, 0, 255, 0.5)',
    textPrimary: '#ffffff',
    textSecondary: '#ff00ff',
    shadowColor: 'rgba(255, 0, 255, 0.6)'
  },
  anime: {
    name: '萌系动漫',
    icon: '🌸',
    background: 'linear-gradient(180deg, #ffedf5 0%, #ffcfe4 100%)',
    primaryColor: '#ff4081',
    secondaryColor: '#ff80ab',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: 'rgba(255, 64, 129, 0.4)',
    textPrimary: '#6a1b9a',
    textSecondary: '#d500f9',
    shadowColor: 'rgba(255, 64, 129, 0.3)'
  }
}

module.exports = {
  themes,
  
  // 获取当前主题
  getCurrentTheme() {
    const currentTheme = wx.getStorageSync('currentTheme') || 'neon'
    return themes[currentTheme]
  },
  
  // 设置主题
  setTheme(themeName) {
    try {
      if (themes[themeName]) {
        wx.setStorageSync('currentTheme', themeName)
        // 移除getApp()调用以避免循环依赖
        // 主题变更通知应该由调用此方法的组件或页面负责处理
        return themes[themeName]
      }
    } catch (error) {
      console.error('设置主题失败:', error)
    }
    return null
  },
  
  // 获取所有主题列表
  getAllThemes() {
    return Object.keys(themes).map(key => ({
      id: key,
      ...themes[key]
    }))
  },
  
  // 更新全局样式
  updateGlobalStyle(theme) {
    // 创建全局样式变量并存储
    wx.setStorageSync('theme-variables', {
      '--theme-primary': theme.primaryColor,
      '--theme-secondary': theme.secondaryColor,
      '--theme-background': theme.background,
      '--theme-card-bg': theme.cardBg,
      '--theme-card-border': theme.cardBorder,
      '--theme-text-primary': theme.textPrimary,
      '--theme-text-secondary': theme.textSecondary,
      '--theme-shadow': theme.shadowColor
    })
    
    // 动态设置全局样式（通过WXS或组件内联样式实现）
    return theme
  },
  
  // 应用主题到页面
  applyTheme() {
    const theme = this.getCurrentTheme()
    
    // 设置全局CSS变量（微信小程序需要使用rpx单位处理）
    wx.setStorageSync('theme-styles', {
      background: theme.background,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      cardBg: theme.cardBg,
      cardBorder: theme.cardBorder,
      textPrimary: theme.textPrimary,
      textSecondary: theme.textSecondary,
      shadowColor: theme.shadowColor
    })
    
    return theme
  }
}
