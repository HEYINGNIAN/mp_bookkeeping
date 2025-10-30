// pages/auth/auth.js
const app = getApp()

Page({
  data: {
    password: '',
    confirmPassword: '',
    passwordStrength: 'weak',
    strengthText: '弱',
    canSubmit: false,
    isFirstTime: true,
    mode: 'setup', // setup 或 login
    showPassword: false,
    showConfirmPassword: false
  },

  onLoad(options) {
    // 检查是否已设置密码
    const hashedPassword = wx.getStorageSync('hashedPassword')
    
    // 确定模式：如果已有密码，则为登录模式
    const mode = hashedPassword ? 'login' : 'setup'
    this.setData({
      mode: mode,
      isFirstTime: !hashedPassword
    })
  },

  // 密码输入
  onPasswordInput(e) {
    const password = e.detail.value
    this.setData({
      password: password
    })
    
    if (this.data.mode === 'setup') {
      this.checkPasswordStrength(password)
    }
    this.checkCanSubmit()
  },

  // 确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
    this.checkCanSubmit()
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
      strengthText: strengthText
    })
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { password, confirmPassword, mode } = this.data
    let canSubmit = false
    
    if (mode === 'login') {
      // 登录模式只需要密码
      canSubmit = password.length >= 6
    } else {
      // 设置模式需要两次密码一致
      canSubmit = password.length >= 6 && password === confirmPassword
    }
    
    this.setData({
      canSubmit: canSubmit
    })
  },

  // 处理提交
  handleSubmit() {
    try {
      const { password, confirmPassword, mode } = this.data
      
      if (!password) {
        wx.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }
      
      if (password.length < 6) {
        wx.showToast({
          title: '密码至少6位',
          icon: 'none'
        })
        return
      }
      
      if (mode === 'setup') {
        // 设置密码模式
        if (password !== confirmPassword) {
          wx.showToast({
            title: '两次密码不一致',
            icon: 'none'
          })
          return
        }
        
        // 保存密码
        app.setMainPassword(password)
        
        wx.showToast({
          title: this.data.isFirstTime ? '密码设置成功' : '密码修改成功',
          icon: 'success'
        })
      } else {
        // 登录模式
        if (app.verifyMainPassword(password)) {
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
          // 明确设置认证状态为true
          app.globalData.isAuthenticated = true
        } else {
          wx.showToast({
            title: '密码错误',
            icon: 'none'
          })
          return
        }
      }
      
      // 延迟导航
      setTimeout(() => {
        // 对于首次设置密码的用户，直接跳转到主页
        if (mode === 'setup') {
          wx.switchTab({
            url: '/pages/index/index'
          })
        } else {
          // 登录模式返回上一页
          wx.navigateBack()
        }
      }, 1500)
    } catch (error) {
      console.error('认证处理失败:', error)
      wx.showToast({
        title: '处理失败，请重试',
        icon: 'error'
      })
    }
  },
  
  // 前往设置新密码
  goToSetup() {
    try {
      this.setData({
        mode: 'setup',
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false
      })
    } catch (error) {
      console.error('切换到设置模式失败:', error)
    }
  },
  
  // 切换密码可见性
  togglePasswordVisibility() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },
  
  // 切换确认密码可见性
  toggleConfirmPasswordVisibility() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    })
  }
})
