<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <h1 class="page-title">打卡</h1>
        <p class="page-subtitle">记录每一天</p>
      </header>

      <!-- 日历视图 -->
      <section class="section">
        <div class="calendar-card card">
          <div class="calendar-header">
            <button class="btn btn-ghost btn-sm" @click="prevMonth">‹</button>
            <span class="calendar-title">{{ currentMonthLabel }}</span>
            <button class="btn btn-ghost btn-sm" @click="nextMonth">›</button>
          </div>
          <div class="calendar-grid">
            <div class="calendar-weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
            <div 
              v-for="day in calendarDays" 
              :key="day.date"
              :class="['calendar-day', { 
                'other-month': !day.currentMonth,
                'today': day.isToday,
                'has-record': day.hasRecord
              }]"
              @click="selectDate(day.date)"
            >
              <span class="day-number">{{ day.day }}</span>
              <span v-if="day.hasRecord" class="day-indicator"></span>
            </div>
          </div>
        </div>
      </section>

      <!-- 选中日期详情 -->
      <section class="section" v-if="selectedDate">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">{{ formatDate(selectedDate) }}</h2>
            <div class="rating-control">
              <span class="rating-label">评分：</span>
              <input 
                type="number" 
                class="rating-input"
                v-model="currentRating"
                min="0" 
                max="10"
                @change="saveRating"
              />
              <span class="rating-max">/10</span>
            </div>
          </div>

          <div class="checkin-items">
            <div v-for="item in checkinItems" :key="item.id" class="checkin-item">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  :checked="isItemCompleted(item.id)"
                  @change="toggleItem(item.id, $event.target.checked)"
                />
                <span class="checkbox-text">{{ item.title }}</span>
              </label>
            </div>
          </div>

          <button class="btn btn-primary btn-sm mt" @click="addItem">
            + 添加打卡项
          </button>
        </div>
      </section>

      <!-- 添加打卡项对话框 -->
      <div v-if="showAddDialog" class="dialog-overlay" @click="showAddDialog = false">
        <div class="dialog" @click.stop>
          <h3 class="dialog-title">添加打卡项</h3>
          <input 
            v-model="newItemTitle"
            class="input"
            placeholder="例如：早起、运动、阅读..."
            @keyup.enter="confirmAddItem"
          />
          <div class="dialog-actions">
            <button class="btn btn-ghost" @click="showAddDialog = false">取消</button>
            <button class="btn btn-primary" @click="confirmAddItem">添加</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCheckInStore } from '../stores/checkin'

const checkinStore = useCheckInStore()

const weekdays = ['一', '二', '三', '四', '五', '六', '日']
const currentDate = ref(new Date())
const selectedDate = ref(new Date().toISOString().split('T')[0])
const currentRating = ref(0)
const showAddDialog = ref(false)
const newItemTitle = ref('')

const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long' 
  })
})

const checkinItems = computed(() => checkinStore.items)

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = (firstDay.getDay() + 6) % 7 // Monday = 0
  
  const days = []
  
  // Previous month
  const prevLastDay = new Date(year, month, 0)
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevLastDay.getDate() - i).toISOString().split('T')[0],
      day: prevLastDay.getDate() - i,
      currentMonth: false,
      isToday: false,
      hasRecord: false
    })
  }
  
  // Current month
  const today = new Date().toISOString().split('T')[0]
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i).toISOString().split('T')[0]
    days.push({
      date,
      day: i,
      currentMonth: true,
      isToday: date === today,
      hasRecord: checkinStore.records[date] !== undefined
    })
  }
  
  // Next month
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i).toISOString().split('T')[0],
      day: i,
      currentMonth: false,
      isToday: false,
      hasRecord: false
    })
  }
  
  return days
})

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function selectDate(date) {
  selectedDate.value = date
  const record = checkinStore.records[date]
  currentRating.value = record ? (record.rating || 0) : 0
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  })
}

function isItemCompleted(itemId) {
  const record = checkinStore.records[selectedDate.value]
  if (!record || !record.items) return false
  return record.items.includes(itemId)
}

function toggleItem(itemId, checked) {
  const record = checkinStore.records[selectedDate.value] || { items: [], rating: 0 }
  const items = [...(record.items || [])]
  
  if (checked) {
    items.push(itemId)
  } else {
    const idx = items.indexOf(itemId)
    if (idx > -1) items.splice(idx, 1)
  }
  
  // saveRecord not implemented in store
}

function saveRating() {
  const record = checkinStore.records[selectedDate.value] || { items: [], rating: 0 }
  checkinStore.saveRecord(selectedDate.value, record.items || [], currentRating.value)
}

function addItem() {
  showAddDialog.value = true
  newItemTitle.value = ''
}

function confirmAddItem() {
  if (newItemTitle.value.trim()) {
    checkinStore.addItem(newItemTitle.value.trim())
    showAddDialog.value = false
  }
}

onMounted(async () => {
  await checkinStore.fetchItems()
  await checkinStore.fetchRecords()
  selectDate(new Date().toISOString().split('T')[0])
})
</script>

<style scoped>
.header {
  margin-bottom: var(--space-xl);
}

.section {
  margin-bottom: var(--space-lg);
}

.calendar-card {
  padding: var(--space-md);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.calendar-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-xs);
}

.calendar-weekday {
  text-align: center;
  font-size: 12px;
  color: var(--text-tertiary);
  padding: var(--space-sm);
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.calendar-day:hover {
  background: var(--bg-tertiary);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: var(--primary);
  color: #ffffff;
}

.calendar-day.has-record .day-indicator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 2px;
}

.calendar-day.today .day-indicator {
  background: #ffffff;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
}

.rating-control {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.rating-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.rating-input {
  width: 60px;
  padding: var(--space-xs) var(--space-sm);
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

.rating-max {
  font-size: 14px;
  color: var(--text-secondary);
}

.checkin-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.checkin-item {
  padding: var(--space) var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space);
  cursor: pointer;
  width: 100%;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 14px;
  color: var(--text-primary);
  flex: 1;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.dialog {
  background: var(--bg-main);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 400px;
  animation: slideUp 0.3s ease;
}

.dialog-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: var(--space-lg);
  color: var(--text-primary);
}

.dialog-actions {
  display: flex;
  gap: var(--space);
  margin-top: var(--space-lg);
  justify-content: flex-end;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
