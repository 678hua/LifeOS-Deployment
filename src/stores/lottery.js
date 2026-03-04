import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useLotteryStore = defineStore('lottery', () => {
  const prizes = ref([])
  const records = ref([])
  const currentPrize = ref(null)
  const currentCost = ref(10)
  const isDrawing = ref(false)

  // 原神风格概率
  const rates = {
    five: 0.6,
    four: 5.1,
    three: 94.3
  }

  const stats = computed(() => {
    return {
      total: records.value.length,
      five: records.value.filter(r => r.star === 2).length,
      four: records.value.filter(r => r.star === 1).length,
      three: records.value.filter(r => r.star === 0).length,
    }
  })

  async function fetchRecords() {
    try {
      const res = await api.get('/lottery/records')
      records.value = res
    } catch (e) {
      console.error('Failed to fetch records:', e)
    }
  }

  async function draw() {
    if (isDrawing.value) throw new Error('正在祈愿中')
    
    isDrawing.value = true
    
    try {
      const res = await api.post('/lottery/draw', { moPointCost: currentCost.value })
      currentPrize.value = res.prize
      records.value.unshift(res.record)
      
      return res.prize
    } finally {
      isDrawing.value = false
    }
  }

  return {
    prizes,
    records,
    currentPrize,
    currentCost,
    isDrawing,
    stats,
    rates,
    fetchRecords,
    draw,
  }
})
