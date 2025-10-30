// pages/accounting/accounting.js
const app = getApp()

Page({
  data: {
    transactions: [],
    filteredTransactions: [],
    searchKeyword: '',
    selectedType: 'all',
    showModal: false,
    isEdit: false,
    categoryIndex: 0,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    currentMonth: '',
    categoryNames: [
      '餐饮', '交通', '购物', '娱乐', '医疗', '教育', 
      '住房', '通讯', '其他', '工资', '奖金', '投资', '兼职'
    ],
    categories: [],
    showGuide: true,
    formData: {
      id: null,
      type: 'expense',
      amount: '',
      title: '',
      category: '',
      note: '',
      createTime: '',
      updateTime: ''
    },
    theme: null
  },

  onLoad(options) {
    const app = getApp()
    
    // 检查是否隐藏引导提示
    const hideGuide = wx.getStorageSync('hideAccountingGuide') || false
    
    this.setData({
      theme: app.globalData.currentTheme,
      showGuide: !hideGuide
    })
    
    this.setCurrentMonth()
    // 加载分类并初始化分类列表
    this.loadCategories()
    this.loadTransactions()
    
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
  
  onShow() {
    // 每次显示页面时重新加载分类，确保使用最新的分类数据
    this.loadCategories()
    this.loadTransactions()
    
    // 更新页面主题
    const app = getApp()
    if (app.globalData.currentTheme) {
      this.setData({
        theme: app.globalData.currentTheme
      })
    }
  },
  
  // 加载分类列表
  loadCategories() {
    const app = getApp()
    const categories = wx.getStorageSync('categories') || app.globalData.categories || []
    this.setData({
      categories: categories,
      categoryNames: categories.map(cat => cat.name)
    })
  },
  
  // 隐藏引导提示
  hideGuide() {
    wx.setStorageSync('hideAccountingGuide', true)
    this.setData({
      showGuide: false
    })
  },
  
  onUnload() {
    // 移除主题变化监听器
    const app = getApp()
    app.unregisterThemeChangeListener(this.themeChangeCallback)
  },



  // 设置当前月份
  setCurrentMonth() {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    this.setData({
      currentMonth: `${year}年${month}月`
    })
  },

  // 加载交易
  loadTransactions() {
    const transactions = wx.getStorageSync('transactions') || []
    this.setData({
      transactions: transactions
    })
    this.calculateStats()
    this.filterTransactions()
  },

  // 计算统计数据
  calculateStats() {
    const { transactions } = this.data
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // 筛选当月交易
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createTime)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })
    
    let totalIncome = 0
    let totalExpense = 0
    
    monthlyTransactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0
      if (transaction.type === 'income') {
        totalIncome += amount
      } else {
        totalExpense += amount
      }
    })
    
    const balance = totalIncome - totalExpense
    
    this.setData({
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      balance: balance.toFixed(2)
    })
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterTransactions()
  },

  // 类型筛选
  filterByType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedType: type
    })
    this.filterTransactions()
  },

  // 筛选交易
  filterTransactions() {
    const { transactions, searchKeyword, selectedType } = this.data
    let filtered = transactions

    // 按类型筛选
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType)
    }

    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(transaction => 
        transaction.title.includes(searchKeyword) || 
        transaction.category.includes(searchKeyword) ||
        (transaction.note && transaction.note.includes(searchKeyword))
      )
    }

    // 按时间排序
    filtered.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))

    this.setData({
      filteredTransactions: filtered
    })
  },

  // 显示添加弹窗
  showAddModal(e) {
    const type = e ? e.currentTarget.dataset.type : 'expense'
    this.setData({
      showModal: true,
      isEdit: false,
      formData: {
        id: null,
        type: type,
        amount: '',
        title: '',
        category: '',
        note: '',
        createTime: '',
        updateTime: ''
      }
    })
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false
    })
  },

  // 选择类型
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      'formData.type': type
    })
  },

  // 金额输入
  onAmountInput(e) {
    this.setData({
      'formData.amount': e.detail.value
    })
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    })
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value
    const category = this.data.categoryNames[index]
    
    this.setData({
      categoryIndex: index,
      'formData.category': category
    })
  },

  // 备注输入
  onNoteInput(e) {
    this.setData({
      'formData.note': e.detail.value
    })
  },

  // 编辑交易
  editTransaction(e) {
    const id = e.currentTarget.dataset.id
    const transaction = this.data.transactions.find(t => t.id == id)
    
    if (transaction) {
      const categoryIndex = this.data.categoryNames.findIndex(cat => cat === transaction.category)
      
      this.setData({
        showModal: true,
        isEdit: true,
        categoryIndex: categoryIndex,
        formData: { ...transaction }
      })
    }
  },

  // 删除交易
  deleteTransaction(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这笔交易吗？',
      success: (res) => {
        if (res.confirm) {
          const transactions = this.data.transactions.filter(transaction => transaction.id != id)
          wx.setStorageSync('transactions', transactions)
          this.loadTransactions()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 保存交易
  saveTransaction() {
    const { formData, isEdit } = this.data
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      })
      return
    }
    
    if (!formData.title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }
    
    if (!formData.category.trim()) {
      wx.showToast({
        title: '请选择分类',
        icon: 'none'
      })
      return
    }

    const now = new Date().toISOString()
    const transactions = [...this.data.transactions]
    
    if (isEdit) {
      // 编辑模式
      const index = transactions.findIndex(transaction => transaction.id == formData.id)
      if (index !== -1) {
        transactions[index] = {
          ...formData,
          updateTime: now
        }
      }
    } else {
      // 新增模式
      const newTransaction = {
        ...formData,
        id: Date.now(),
        createTime: now,
        updateTime: now
      }
      transactions.push(newTransaction)
    }
    
    wx.setStorageSync('transactions', transactions)
    this.loadTransactions()
    this.hideModal()
    
    wx.showToast({
      title: isEdit ? '修改成功' : '添加成功',
      icon: 'success'
    })
  }
})
