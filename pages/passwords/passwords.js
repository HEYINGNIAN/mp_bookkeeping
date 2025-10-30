// pages/passwords/passwords.js
const app = getApp()

Page({
  data: {
    passwords: [],
    filteredPasswords: [],
    searchKeyword: '',
    showModal: false,
    isEdit: false,
    showPasswordInput: false,
    passwordStrength: 'weak',
    strengthText: '弱',
    theme: null,
    icons: ['🔐', '🌐', '📧', '💳', '📱', '💻', '🎮', '🛒', '🏦', '📊', '🔑', '🛡️'],
    formData: {
      id: null,
      name: '',
      account: '',
      password: '',
      url: '',
      note: '',
      icon: '🔐',
      strength: 'weak',
      strengthText: '弱',
      createTime: '',
      updateTime: ''
    }
  },

  onLoad(options) {
    const app = getApp()
    this.loadPasswords()
    
    // 检查是否有添加操作
    if (options.action === 'add') {
      this.showAddModal()
    }
    
    // 注册主题变化监听器
    this.themeChangeCallback = (newTheme) => {
      this.setData({
        theme: newTheme
      })
    }
    app.registerThemeChangeListener(this.themeChangeCallback)
  },
  
  onUnload() {
    // 移除主题变化监听器
    const app = getApp()
    app.unregisterThemeChangeListener(this.themeChangeCallback)
  },

  onShow() {
    this.loadPasswords()
    
    // 更新页面主题
    const app = getApp()
    if (app.globalData.currentTheme) {
      this.setData({
        theme: app.globalData.currentTheme
      })
    }
  },

  // 加载密码
  loadPasswords() {
    const passwords = wx.getStorageSync('passwords') || []
    this.setData({
      passwords: passwords
    })
    this.filterPasswords()
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterPasswords()
  },

  // 筛选密码
  filterPasswords() {
    const { passwords, searchKeyword } = this.data
    let filtered = passwords

    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(password => 
        password.name.includes(searchKeyword) || 
        password.account.includes(searchKeyword) ||
        (password.note && password.note.includes(searchKeyword))
      )
    }

    // 按时间排序
    filtered.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))

    this.setData({
      filteredPasswords: filtered
    })
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      showPasswordInput: false,
      formData: {
        id: null,
        name: '',
        account: '',
        password: '',
        url: '',
        note: '',
        icon: '🔐',
        strength: 'weak',
        strengthText: '弱',
        createTime: '',
        updateTime: ''
      }
    })
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false,
      showPasswordInput: false
    })
  },

  // 切换密码显示
  togglePasswordInput() {
    this.setData({
      showPasswordInput: !this.data.showPasswordInput
    })
  },

  // 名称输入
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  // 账号输入
  onAccountInput(e) {
    this.setData({
      'formData.account': e.detail.value
    })
  },

  // 密码输入
  onPasswordInput(e) {
    const password = e.detail.value
    this.setData({
      'formData.password': password
    })
    this.checkPasswordStrength(password)
  },

  // 网址输入
  onUrlInput(e) {
    this.setData({
      'formData.url': e.detail.value
    })
  },

  // 备注输入
  onNoteInput(e) {
    this.setData({
      'formData.note': e.detail.value
    })
  },

  // 选择图标
  selectIcon(e) {
    const icon = e.currentTarget.dataset.icon
    this.setData({
      'formData.icon': icon
    })
  },

  // 检查密码强度
  checkPasswordStrength(password) {
    let strength = 'weak'
    let strengthText = '弱'
    
    if (password.length >= 8) {
      const hasUpper = /[A-Z]/.test(password)
      const hasLower = /[a-z]/.test(password)
      const hasNumber = /\d/.test(password)
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      
      let score = 0
      if (hasUpper) score++
      if (hasLower) score++
      if (hasNumber) score++
      if (hasSpecial) score++
      
      if (score >= 3 && password.length >= 10) {
        strength = 'strong'
        strengthText = '强'
      } else if (score >= 2) {
        strength = 'medium'
        strengthText = '中'
      }
    }
    
    this.setData({
      passwordStrength: strength,
      strengthText: strengthText,
      'formData.strength': strength,
      'formData.strengthText': strengthText
    })
  },

  // 切换密码显示
  togglePassword(e) {
    const id = e.currentTarget.dataset.id
    const passwords = this.data.passwords.map(password => {
      if (password.id == id) {
        return { ...password, showPassword: !password.showPassword }
      }
      return password
    })
    
    this.setData({
      passwords: passwords
    })
    this.filterPasswords()
  },

  // 复制密码
  copyPassword(e) {
    const id = e.currentTarget.dataset.id
    const password = this.data.passwords.find(p => p.id == id)
    
    if (password) {
      wx.setClipboardData({
        data: password.password,
        success: () => {
          wx.showToast({
            title: '密码已复制',
            icon: 'success'
          })
        }
      })
    }
  },

  // 编辑密码
  editPassword(e) {
    const id = e.currentTarget.dataset.id
    const password = this.data.passwords.find(p => p.id == id)
    
    if (password) {
      this.setData({
        showModal: true,
        isEdit: true,
        showPasswordInput: false,
        formData: { ...password }
      })
    }
  },

  // 删除密码
  deletePassword(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个密码吗？',
      success: (res) => {
        if (res.confirm) {
          const passwords = this.data.passwords.filter(password => password.id != id)
          wx.setStorageSync('passwords', passwords)
          this.loadPasswords()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 打开网址
  openUrl(e) {
    const url = e.currentTarget.dataset.url
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '网址已复制',
          icon: 'success'
        })
      }
    })
  },

  // 保存密码
  savePassword() {
    const { formData, isEdit } = this.data
    
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入名称',
        icon: 'none'
      })
      return
    }
    
    if (!formData.account.trim()) {
      wx.showToast({
        title: '请输入账号',
        icon: 'none'
      })
      return
    }
    
    if (!formData.password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    const now = new Date().toISOString()
    const passwords = [...this.data.passwords]
    
    if (isEdit) {
      // 编辑模式
      const index = passwords.findIndex(password => password.id == formData.id)
      if (index !== -1) {
        passwords[index] = {
          ...formData,
          updateTime: now
        }
      }
    } else {
      // 新增模式
      const newPassword = {
        ...formData,
        id: Date.now(),
        showPassword: false,
        createTime: now,
        updateTime: now
      }
      passwords.push(newPassword)
    }
    
    wx.setStorageSync('passwords', passwords)
    this.loadPasswords()
    this.hideModal()
    
    wx.showToast({
      title: isEdit ? '修改成功' : '添加成功',
      icon: 'success'
    })
  }
})
