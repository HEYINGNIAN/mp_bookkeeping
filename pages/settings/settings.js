// pages/settings/settings.js
const app = getApp()
const themeUtils = require('../../utils/theme.js')

Page({
  data: {
    logCount: 0,
    passwordCount: 0,
    transactionCount: 0,
    categoryCount: 0,
    showConfirmModal: false,
    confirmTitle: '',
    confirmText: '',
    confirmAction: null,
    themes: themeUtils.getAllThemes(),
    currentTheme: 'neon',
    showThemePicker: false,
    theme: {}
  },

  onLoad() {
    this.loadStats()
    this.loadCurrentTheme()
    this.applyTheme()
  },

  onShow() {
    this.loadStats()
    this.loadCurrentTheme()
    this.applyTheme()
    
    // 更新页面主题
    const app = getApp()
    if (app.globalData.currentTheme) {
      this.setData({
        theme: app.globalData.currentTheme,
        currentTheme: wx.getStorageSync('currentTheme') || 'neon'
      })
    }
  },

  // 应用主题
  applyTheme(themeName) {
    const theme = themeName ? themeUtils.setTheme(themeName) : themeUtils.getCurrentTheme()
    if (theme) {
      this.setData({
        theme: theme
      })
      
      // 获取应用实例并更新全局主题
      const app = getApp()
      if (app) {
        app.globalData.currentTheme = theme
      }
      
      // 更新全局样式
      themeUtils.updateGlobalStyle(theme)
    }
  },

  // 加载当前主题
  loadCurrentTheme() {
    const currentTheme = wx.getStorageSync('currentTheme') || 'neon'
    this.setData({
      currentTheme: currentTheme
    })
  },

  // 加载统计数据
  loadStats() {
    const logs = wx.getStorageSync('logs') || []
    const passwords = wx.getStorageSync('passwords') || []
    const transactions = wx.getStorageSync('transactions') || []
    const categories = wx.getStorageSync('categories') || app.globalData.categories

    this.setData({
      logCount: logs.length,
      passwordCount: passwords.length,
      transactionCount: transactions.length,
      categoryCount: categories.length
    })
  },

  // 显示主题选择器
  showThemePicker() {
    this.setData({
      showThemePicker: true
    })
  },

  // 隐藏主题选择器
  hideThemePicker() {
    this.setData({
      showThemePicker: false
    })
  },

  // 选择主题
  selectTheme(e) {
    const themeName = e.currentTarget.dataset.theme
    const result = themeUtils.setTheme(themeName)
    
    if (result) {
      this.setData({
        currentTheme: themeName
      })
      
      wx.showToast({
        title: `已切换为${result.name}`,
        icon: 'success'
      })
      
      this.hideThemePicker()
      
      // 应用主题
      this.applyTheme()
      
      // 刷新当前页面以应用新主题
      this.setData({ themeChanged: true })
      setTimeout(() => {
        this.setData({ themeChanged: false })
      }, 0)
    }
  },

  // 修改密码
  changePassword() {
    wx.navigateTo({
      url: '/pages/auth/auth'
    })
  },

  // 导出数据
  exportData() {
    const data = {
      logs: wx.getStorageSync('logs') || [],
      passwords: wx.getStorageSync('passwords') || [],
      transactions: wx.getStorageSync('transactions') || [],
      categories: wx.getStorageSync('categories') || app.globalData.categories,
      exportTime: new Date().toISOString()
    }

    const dataStr = JSON.stringify(data, null, 2)
    
    wx.setClipboardData({
      data: dataStr,
      success: () => {
        wx.showModal({
          title: '导出成功',
          content: '数据已复制到剪贴板，请保存到安全的地方',
          showCancel: false
        })
      }
    })
  },

  // 导入数据
  importData() {
    wx.showModal({
      title: '导入数据',
      content: '请将备份数据复制到剪贴板，然后点击确认',
      success: (res) => {
        if (res.confirm) {
          wx.getClipboardData({
            success: (clipRes) => {
              try {
                const data = JSON.parse(clipRes.data)
                
                if (data.logs) wx.setStorageSync('logs', data.logs)
                if (data.passwords) wx.setStorageSync('passwords', data.passwords)
                if (data.transactions) wx.setStorageSync('transactions', data.transactions)
                if (data.categories) wx.setStorageSync('categories', data.categories)
                
                this.loadStats()
                
                wx.showToast({
                  title: '导入成功',
                  icon: 'success'
                })
              } catch (error) {
                wx.showToast({
                  title: '数据格式错误',
                  icon: 'error'
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '获取剪贴板失败',
                icon: 'error'
              })
            }
          })
        }
      }
    })
  },

  // 清空所有数据
  clearAllData() {
    this.setData({
      showConfirmModal: true,
      confirmTitle: '⚠️ 危险操作',
      confirmText: '此操作将删除所有数据，包括日志、密码、交易记录等，且无法恢复。确定要继续吗？',
      confirmAction: 'clearAll'
    })
  },

  // 取消确认
  cancelConfirm() {
    this.setData({
      showConfirmModal: false,
      confirmAction: null
    })
  },

  // 确认操作
  confirmAction() {
    const action = this.data.confirmAction
    
    if (action === 'clearAll') {
      // 清空所有数据
      wx.removeStorageSync('logs')
      wx.removeStorageSync('passwords')
      wx.removeStorageSync('transactions')
      wx.removeStorageSync('categories')
      
      // 重置为默认分类
      wx.setStorageSync('categories', app.globalData.categories)
      
      this.loadStats()
      
      wx.showToast({
        title: '数据已清空',
        icon: 'success'
      })
    }
    
    this.setData({
      showConfirmModal: false,
      confirmAction: null
    })
  }
})
