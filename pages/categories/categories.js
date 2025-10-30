// pages/categories/categories.js
const app = getApp()

Page({
  data: {
    categories: [],
    showModal: false,
    isEdit: false,
    icons: ['💼', '🏠', '📚', '🎮', '💪', '🍔', '🚗', '🛒', '💊', '🎵', '📱', '💻', '🏦', '✈️', '🎨', '🔧'],
    colors: ['#00ff88', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24', '#0984e3', '#6c5ce7', '#a29bfe'],
    formData: {
      id: null,
      name: '',
      icon: '💼',
      color: '#00ff88',
      count: 0
    }
  },

  onLoad() {
    this.loadCategories()
  },

  onShow() {
    this.loadCategories()
  },

  // 加载分类
  loadCategories() {
    let categories = wx.getStorageSync('categories') || app.globalData.categories
    
    // 计算每个分类的使用次数
    categories = categories.map(category => {
      const logs = wx.getStorageSync('logs') || []
      const count = logs.filter(log => log.categoryId == category.id).length
      return { ...category, count }
    })
    
    this.setData({
      categories: categories
    })
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      formData: {
        id: null,
        name: '',
        icon: '💼',
        color: '#00ff88',
        count: 0
      }
    })
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false
    })
  },

  // 名称输入
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  // 选择图标
  selectIcon(e) {
    const icon = e.currentTarget.dataset.icon
    this.setData({
      'formData.icon': icon
    })
  },

  // 选择颜色
  selectColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({
      'formData.color': color
    })
  },

  // 编辑分类
  editCategory(e) {
    const id = e.currentTarget.dataset.id
    const category = this.data.categories.find(cat => cat.id == id)
    
    if (category) {
      this.setData({
        showModal: true,
        isEdit: true,
        formData: { ...category }
      })
    }
  },

  // 删除分类
  deleteCategory(e) {
    const id = e.currentTarget.dataset.id
    const category = this.data.categories.find(cat => cat.id == id)
    
    if (category && category.count > 0) {
      wx.showModal({
        title: '无法删除',
        content: `该分类下还有 ${category.count} 项内容，请先清空后再删除`,
        showCancel: false
      })
      return
    }
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个分类吗？',
      success: (res) => {
        if (res.confirm) {
          const categories = this.data.categories.filter(cat => cat.id != id)
          wx.setStorageSync('categories', categories)
          this.loadCategories()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 保存分类
  saveCategory() {
    const { formData, isEdit } = this.data
    
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入分类名称',
        icon: 'none'
      })
      return
    }

    const categories = [...this.data.categories]
    
    if (isEdit) {
      // 编辑模式
      const index = categories.findIndex(cat => cat.id == formData.id)
      if (index !== -1) {
        categories[index] = {
          ...formData,
          count: categories[index].count // 保持原有计数
        }
      }
    } else {
      // 新增模式
      const newCategory = {
        ...formData,
        id: Date.now()
      }
      categories.push(newCategory)
    }
    
    wx.setStorageSync('categories', categories)
    this.loadCategories()
    this.hideModal()
    
    wx.showToast({
      title: isEdit ? '修改成功' : '添加成功',
      icon: 'success'
    })
  }
})
