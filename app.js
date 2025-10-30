// app.js
const themeUtils = require('./utils/theme.js')
const { encryptPassword, verifyPassword } = require('./utils/crypto.js')

App({
  globalData: {
    userInfo: null,
    isAuthenticated: false,
    categories: [
      { id: 1, name: '工作', color: '#00ff88', icon: '💼' },
      { id: 2, name: '生活', color: '#ff6b6b', icon: '🏠' },
      { id: 3, name: '学习', color: '#4ecdc4', icon: '📚' },
      { id: 4, name: '娱乐', color: '#45b7d1', icon: '🎮' },
      { id: 5, name: '健康', color: '#96ceb4', icon: '💪' }
    ],
    currentTheme: null
  },

  onLaunch() {
    // 加载当前主题
    try {
      // 直接使用主题配置，避免循环依赖
      const currentThemeKey = wx.getStorageSync('currentTheme') || 'neon'
      this.globalData.currentTheme = themeUtils.themes[currentThemeKey] || themeUtils.themes.neon
      
      // 应用主题到导航栏和底部菜单
      if (this.globalData.currentTheme) {
        this.updateTabBarTheme(this.globalData.currentTheme)
      }
    } catch (error) {
      console.error('主题加载失败:', error)
      // 使用默认主题作为后备
      this.globalData.currentTheme = themeUtils.themes.neon
    }
    
    // 初始化认证状态为false
    this.globalData.isAuthenticated = false
    
    // 检查是否已设置主密码
    const hashedPassword = wx.getStorageSync('hashedPassword')
    const isFirstUse = wx.getStorageSync('isFirstUse') === '' || wx.getStorageSync('isFirstUse') === undefined
    
    if (isFirstUse) {
      // 标记为非首次使用，但不自动认证
      wx.setStorageSync('isFirstUse', false)
    }
  },

  // 验证主密码
  verifyMainPassword(password) {
    const storedHash = wx.getStorageSync('hashedPassword')
    if (!storedHash) return false
    return verifyPassword(password, storedHash)
  },

  // 设置主密码
  setMainPassword(password) {
    const hashedPassword = encryptPassword(password)
    wx.setStorageSync('hashedPassword', hashedPassword)
    this.globalData.isAuthenticated = true
  },

  // 清除认证状态
  clearAuth() {
    this.globalData.isAuthenticated = false
  },

  // 获取当前主题
  getCurrentTheme() {
    return this.globalData.currentTheme || themeUtils.getCurrentTheme()
  },

  // 切换主题
  changeTheme(themeName) {
    const theme = themeUtils.setTheme(themeName)
    if (theme) {
      this.globalData.currentTheme = theme
      
      // 动态更新底部导航栏颜色
      this.updateTabBarTheme(theme)
      
      // 发送全局主题变化通知
      if (this.globalData.themeChangeCallbacks && this.globalData.themeChangeCallbacks.length > 0) {
        this.globalData.themeChangeCallbacks.forEach(callback => {
          callback(theme)
        })
      }
      
      return theme
    }
    return null
  },
  
  // 注册主题变化监听器
  registerThemeChangeListener(callback) {
    if (!this.globalData.themeChangeCallbacks) {
      this.globalData.themeChangeCallbacks = []
    }
    this.globalData.themeChangeCallbacks.push(callback)
  },
  
  // 移除主题变化监听器
  unregisterThemeChangeListener(callback) {
    if (this.globalData.themeChangeCallbacks) {
      this.globalData.themeChangeCallbacks = this.globalData.themeChangeCallbacks.filter(cb => cb !== callback)
    }
  },
  
  // 更新底部导航栏主题
  updateTabBarTheme(theme) {
    try {
      // 计算文本颜色是否适合深色或浅色背景
      const isLightBg = this.isLightColor(theme.background || '')
      
      // 设置tabBar颜色
      wx.setTabBarStyle({
        color: isLightBg ? '#666666' : 'rgba(255, 255, 255, 0.7)',
        selectedColor: theme.primaryColor || '#00ff88',
        backgroundColor: isLightBg ? '#ffffff' : '#1a1a1a',
        borderStyle: isLightBg ? 'black' : 'white'
      })
      
      // 动态设置导航栏颜色
      const navBackgroundColor = typeof theme.cardBg === 'string' && theme.cardBg.includes('linear') ? '#ffffff' : (theme.cardBg || '#0a0a0a')
      wx.setNavigationBarColor({
        frontColor: isLightBg ? '#000000' : '#ffffff',
        backgroundColor: navBackgroundColor
      })
    } catch (error) {
      console.error('主题应用失败:', error)
    }
  },
  
  // 判断颜色是否为浅色
  isLightColor(color) {
    try {
      // 添加类型检查，避免color为undefined时调用includes方法
      if (typeof color !== 'string') return false
      // 简单判断：如果背景包含'fff'或明显的浅色关键词，视为浅色背景
      return color.includes('fff') || color.includes('ffffff') || color.includes('light') || 
             (color.includes('linear-gradient') && 
              (color.includes('fff') || color.includes('ffffff')))
    } catch (error) {
      console.error('颜色判断失败:', error)
      return false
    }
  }
})
