// pages/logs/logs.js
const app = getApp()

Page({
  data: {
    logs: [],
    filteredLogs: [],
    categories: [],
    categoryNames: [],
    searchKeyword: '',
    selectedCategory: 'all',
    showModal: false,
    isEdit: false,
    categoryIndex: 0,
    theme: null,
    formData: {
      id: null,
      title: '',
      content: '',
      categoryId: null,
      categoryName: '',
      categoryIcon: '',
      categoryColor: '',
      tags: '',
      createTime: '',
      updateTime: ''
    }
  },

  onLoad(options) {
    this.loadCategories()
    this.loadLogs()
    
    // 设置主题
    this.setData({
      theme: app.globalData.currentTheme
    })
    
    // 注册主题变化监听器
    this.themeChangeCallback = (newTheme) => {
      this.setData({
        theme: newTheme
      })
    }
    app.registerThemeChangeListener(this.themeChangeCallback)
    
    // 检查是否有添加操作
    if (options.action === 'add') {
      this.showAddModal()
    }
  },
  
  onUnload() {
    // 移除主题变化监听器
    const app = getApp()
    app.unregisterThemeChangeListener(this.themeChangeCallback)
  },

  onShow() {
    this.loadLogs()
  },

  // 加载分类
  loadCategories() {
    const categories = wx.getStorageSync('categories') || app.globalData.categories
    const categoryNames = categories.map(cat => `${cat.icon} ${cat.name}`)
    
    this.setData({
      categories: categories,
      categoryNames: categoryNames
    })
  },

  // 加载日志
  loadLogs() {
    const logs = wx.getStorageSync('logs') || []
    this.setData({
      logs: logs
    })
    this.filterLogs()
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterLogs()
  },

  // 分类筛选
  filterByCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      selectedCategory: category
    })
    this.filterLogs()
  },

  // 筛选日志
  filterLogs() {
    const { logs, searchKeyword, selectedCategory } = this.data
    let filtered = logs

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => log.categoryId == selectedCategory)
    }

    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(log => 
        log.title.includes(searchKeyword) || 
        log.content.includes(searchKeyword) ||
        (log.tags && log.tags.some(tag => tag.includes(searchKeyword)))
      )
    }

    // 按时间排序
    filtered.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))

    this.setData({
      filteredLogs: filtered
    })
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      formData: {
        id: null,
        title: '',
        content: '',
        categoryId: null,
        categoryName: '',
        categoryIcon: '',
        categoryColor: '',
        tags: '',
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

  // 标题输入
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    })
  },

  // 内容输入
  onContentInput(e) {
    this.setData({
      'formData.content': e.detail.value
    })
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value
    const category = this.data.categories[index]
    
    this.setData({
      categoryIndex: index,
      'formData.categoryId': category.id,
      'formData.categoryName': category.name,
      'formData.categoryIcon': category.icon,
      'formData.categoryColor': category.color
    })
  },

  // 标签输入
  onTagsInput(e) {
    this.setData({
      'formData.tags': e.detail.value
    })
  },

  // 编辑日志
  editLog(e) {
    const id = e.currentTarget.dataset.id
    const log = this.data.logs.find(l => l.id == id)
    
    if (log) {
      const categoryIndex = this.data.categories.findIndex(cat => cat.id == log.categoryId)
      
      this.setData({
        showModal: true,
        isEdit: true,
        categoryIndex: categoryIndex,
        formData: {
          ...log,
          tags: log.tags ? log.tags.join(',') : ''
        }
      })
    }
  },

  // 删除日志
  deleteLog(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条日志吗？',
      success: (res) => {
        if (res.confirm) {
          const logs = this.data.logs.filter(log => log.id != id)
          wx.setStorageSync('logs', logs)
          this.loadLogs()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 保存日志
  saveLog() {
    const { formData, isEdit } = this.data
    
    if (!formData.title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }
    
    if (!formData.content.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }
    
    if (!formData.categoryId) {
      wx.showToast({
        title: '请选择分类',
        icon: 'none'
      })
      return
    }

    const now = new Date().toISOString()
    const logs = [...this.data.logs]
    
    if (isEdit) {
      // 编辑模式
      const index = logs.findIndex(log => log.id == formData.id)
      if (index !== -1) {
        logs[index] = {
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          updateTime: now
        }
      }
    } else {
      // 新增模式
      const newLog = {
        ...formData,
        id: Date.now(),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        createTime: now,
        updateTime: now
      }
      logs.push(newLog)
    }
    
    wx.setStorageSync('logs', logs)
    this.loadLogs()
    this.hideModal()
    
    wx.showToast({
      title: isEdit ? '修改成功' : '添加成功',
      icon: 'success'
    })
  }
})
