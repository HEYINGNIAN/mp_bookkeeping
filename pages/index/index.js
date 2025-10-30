// pages/index/index.js
const app = getApp()
const themeUtils = require('../../utils/theme.js')

Page({
  data: {
    isAuthenticated: false,
    showAuthModal: false,
    inputPassword: '',
    logCount: 0,
    passwordCount: 0,
    transactionCount: 0,
    categoryCount: 0,
    recentActivities: [],
    theme: {}
  },

  onLoad() {
    // 加载主题
    this.applyTheme()
    this.checkAuthStatus()
    this.loadData()
  },

  onShow() {
    this.applyTheme()
    this.checkAuthStatus()
    this.loadData()
  },

  // 应用主题
  applyTheme() {
    try {
      // 直接获取主题，避免可能的循环调用
      const currentThemeKey = wx.getStorageSync('currentTheme') || 'neon'
      const theme = themeUtils.themes[currentThemeKey] || themeUtils.themes.neon
      this.setData({ theme: theme })
    } catch (error) {
      console.error('应用主题失败:', error)
      // 使用默认主题作为后备
      this.setData({ theme: themeUtils.themes.neon })
    }
  },

  // 检查认证状态
  checkAuthStatus() {
    try {
      const isAuthenticated = app.globalData.isAuthenticated
      console.log('认证状态检查:', isAuthenticated)
      
      this.setData({
        isAuthenticated: isAuthenticated
      })
      
      // 检查是否需要认证
      const hashedPassword = wx.getStorageSync('hashedPassword')
      
      if (hashedPassword && !isAuthenticated) {
        // 已有密码但未认证，跳转到登录
        // 使用setTimeout延迟跳转，避免渲染问题
        setTimeout(() => {
          // 检查当前是否已经在auth页面，避免重复跳转
          const pages = getCurrentPages()
          const currentPage = pages[pages.length - 1]
          if (currentPage.route !== 'pages/auth/auth') {
            wx.navigateTo({
              url: '/pages/auth/auth'
            })
          }
        }, 100)
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
    }
  },

  // 加载数据
  loadData() {
    if (!app.globalData.isAuthenticated) return

    // 加载日志数量
    const logs = wx.getStorageSync('logs') || []
    this.setData({
      logCount: logs.length
    })

    // 加载密码数量
    const passwords = wx.getStorageSync('passwords') || []
    this.setData({
      passwordCount: passwords.length
    })

    // 加载交易数量
    const transactions = wx.getStorageSync('transactions') || []
    this.setData({
      transactionCount: transactions.length
    })

    // 加载分类数量
    const categories = wx.getStorageSync('categories') || app.globalData.categories
    this.setData({
      categoryCount: categories.length
    })

    // 加载最近活动
    this.loadRecentActivities()
  },

  // 加载最近活动
  loadRecentActivities() {
    const activities = []
    
    // 获取最近的日志
    const logs = wx.getStorageSync('logs') || []
    const recentLogs = logs.slice(-3).map(log => ({
      id: `log_${log.id}`,
      icon: '📝',
      title: log.title,
      time: this.formatTime(log.createTime),
      type: 'log',
      typeText: '日志'
    }))

    // 获取最近的密码
    const passwords = wx.getStorageSync('passwords') || []
    const recentPasswords = passwords.slice(-2).map(password => ({
      id: `password_${password.id}`,
      icon: '🔐',
      title: password.name,
      time: this.formatTime(password.createTime),
      type: 'password',
      typeText: '密码'
    }))

    // 获取最近的交易
    const transactions = wx.getStorageSync('transactions') || []
    const recentTransactions = transactions.slice(-2).map(transaction => ({
      id: `transaction_${transaction.id}`,
      icon: '💰',
      title: `${transaction.type === 'income' ? '收入' : '支出'}: ¥${transaction.amount}`,
      time: this.formatTime(transaction.createTime),
      type: 'transaction',
      typeText: '交易'
    }))

    // 合并并排序
    activities.push(...recentLogs, ...recentPasswords, ...recentTransactions)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time))
    
    this.setData({
      recentActivities: activities.slice(0, 5)
    })
  },

  // 格式化时间
  formatTime(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now - time
    
    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return `${Math.floor(diff / 86400000)}天前`
    }
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({
      inputPassword: e.detail.value
    })
  },

  // 确认认证
  confirmAuth() {
    const password = this.data.inputPassword
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    if (app.verifyMainPassword(password)) {
      app.globalData.isAuthenticated = true
      this.setData({
        isAuthenticated: true,
        showAuthModal: false,
        inputPassword: ''
      })
      this.loadData()
      wx.showToast({
        title: '验证成功',
        icon: 'success'
      })
    } else {
      wx.showToast({
        title: '密码错误',
        icon: 'error'
      })
    }
  },

  // 取消认证
  cancelAuth() {
    this.setData({
      showAuthModal: false,
      inputPassword: ''
    })
  },

  // 导航到日志页面
  navigateToLogs() {
    console.log('点击日志管理')
    wx.switchTab({
      url: '/pages/logs/logs'
    })
  },

  // 导航到密码页面
  navigateToPasswords() {
    console.log('点击密码备忘')
    wx.switchTab({
      url: '/pages/passwords/passwords'
    })
  },

  // 导航到流水账页面
  navigateToAccounting() {
    console.log('点击流水账')
    wx.switchTab({
      url: '/pages/accounting/accounting'
    })
  },

  // 导航到分类页面
  navigateToCategories() {
    console.log('点击分类管理')
    if (!this.checkAuth()) return
    wx.navigateTo({
      url: '/pages/categories/categories'
    })
  },

  // 快速添加日志
  quickAddLog() {
    if (!this.checkAuth()) return
    wx.navigateTo({
      url: '/pages/logs/logs?action=add'
    })
  },

  // 快速添加密码
  quickAddPassword() {
    if (!this.checkAuth()) return
    wx.navigateTo({
      url: '/pages/passwords/passwords?action=add'
    })
  },

  // 快速添加交易
  quickAddTransaction() {
    if (!this.checkAuth()) return
    wx.navigateTo({
      url: '/pages/accounting/accounting?action=add'
    })
  },

  // 检查认证状态
  checkAuth() {
    if (!app.globalData.isAuthenticated) {
      // 统一使用导航到认证页面的方式
      wx.navigateTo({
        url: '/pages/auth/auth'
      })
      return false
    }
    return true
  }
})
