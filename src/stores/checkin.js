import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useCheckInStore = defineStore('checkin', () => {
  const items = ref([])
  const records = ref({})
  const selectedDate = ref(null)
  const showDetail = ref(false)

  const stats = computed(() => {
    const totalDays = Object.keys(records.value).length
    const completedDays = Object.values(records.value).filter(
      r => r.items.length > 0 && r.items.every(i => i.isCompleted)
    ).length
    const totalItems = items.value.length
    const totalCompletions = Object.values(records.value).reduce(
      (sum, r) => sum + r.items.filter(i => i.isCompleted).length, 0
    )
    return { totalDays, completedDays, totalItems, totalCompletions }
  })

  function selectDate(date) {
    if (selectedDate.value && 
        selectedDate.value.toDateString() === date.toDateString()) {
      showDetail.value = false
      selectedDate.value = null
    } else {
      selectedDate.value = date
      showDetail.value = true
    }
  }

  function closeDetail() {
    showDetail.value = false
    selectedDate.value = null
  }

  async function addItem(title) {
    const item = {
      id: Date.now().toString(),
      title,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    }
    items.value.push(item)
    await api.post('/checkin/items', item)
  }

  async function removeItem(id) {
    items.value = items.value.filter(i => i.id !== id)
    await api.delete(`/checkin/items/${id}`)
  }

  async function toggleCheckIn(itemId, date) {
    const dateKey = date.toISOString().split('T')[0]
    let record = records.value[dateKey] || { date: dateKey, items: [], rating: 0 }
    
    const itemIndex = record.items.findIndex(i => i.id === itemId)
    if (itemIndex !== -1) {
      record.items[itemIndex].isCompleted = !record.items[itemIndex].isCompleted
    } else {
      const sourceItem = items.value.find(i => i.id === itemId)
      record.items.push({ ...sourceItem, isCompleted: true })
    }
    
    records.value[dateKey] = record
    await api.put(`/checkin/records/${dateKey}`, record)
  }

  async function fetchItems() {
    try {
      const res = await api.get('/checkin/items')
      items.value = res
    } catch (e) {
      console.error('Failed to fetch items:', e)
    }
  }

  async function fetchRecords() {
    try {
      const res = await api.get('/checkin/records')
      records.value = res
    } catch (e) {
      console.error('Failed to fetch records:', e)
    }
  }

  async function setRating(dateKey, rating) {
    const record = records.value[dateKey] || { date: dateKey, items: [], rating: 0 }
    record.rating = rating
    records.value[dateKey] = record
    await api.put(`/checkin/records/${dateKey}`, record)
  }

  async function fetchStats() {
    // Stats are computed locally
  }

  return {
    items, records, selectedDate, showDetail, stats,
    selectDate, closeDetail, addItem, removeItem, toggleCheckIn, setRating,
    fetchItems, fetchRecords, fetchStats,
    getRecord: (dateKey) => records.value[dateKey]
  }
})
