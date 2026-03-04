<template>
  <div class="checkin-view">
    <!-- 日历视图 -->
    <div class="calendar-container">
      <div class="calendar-header">
        <button @click="prevMonth" class="nav-btn">‹</button>
        <h2>{{ currentMonthLabel }}</h2>
        <button @click="nextMonth" class="nav-btn">›</button>
      </div>
      
      <div class="calendar-grid">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
        <div
          v-for="date in calendarDates"
          :key="date.toISOString()"
          class="date-cell"
          :class="{
            'other-month': date.month !== currentMonth,
            'selected': isSelectedDate(date),
            'today': isToday(date)
          }"
          :style="{ backgroundColor: getDateColor(date) }"
          @click="selectDate(date)"
        >
          <span class="date-num">{{ date.day }}</span>
        </div>
      </div>
      
      <!-- 图例 -->
      <div class="legend">
        <div class="legend-item">
          <span class="legend-color" style="background: #D32F2F"></span>
          <span>0-6 分</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #FFC107"></span>
          <span>7-8 分</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #4CAF50"></span>
          <span>9-10 分</span>
        </div>
      </div>
    </div>

    <!-- 打卡详情面板 -->
    <transition name="slide-up">
      <div v-if="showDetail && selectedDate" class="detail-panel">
        <div class="panel-header">
          <div>
            <h3>{{ formatDate(selectedDate) }}</h3>
            <p>{{ getWeekDay(selectedDate) }}</p>
          </div>
          <button @click="closeDetail" class="close-btn">×</button>
        </div>

        <!-- 星星评分 -->
        <div class="star-rating">
          <span
            v-for="n in 10"
            :key="n"
            class="star"
            :class="{ filled: n <= currentRating }"
            @click="setRating(n)"
          >
            {{ n <= currentRating ? '★' : '☆' }}
          </span>
        </div>

        <!-- 打卡项列表 -->
        <div class="checkin-items">
          <div
            v-for="item in checkinItems"
            :key="item.id"
            class="checkin-item"
            :class="{ completed: isItemCompleted(item) }"
            @click="toggleCheckIn(item)"
          >
            <div class="checkbox" :class="{ checked: isItemCompleted(item) }">
              {{ isItemCompleted(item) ? '✓' : '' }}
            </div>
            <span class="item-title">{{ item.title }}</span>
          </div>
        </div>

        <!-- 添加按钮 -->
        <button @click="showAddDialog = true" class="add-btn">
          <span>+</span> 添加打卡项
        </button>
      </div>
    </transition>

    <!-- 添加打卡项对话框 -->
    <div v-if="showAddDialog" class="dialog-overlay" @click="showAddDialog = false">
      <div class="dialog" @click.stop>
        <h4>添加打卡项</h4>
        <input
          v-model="newItemTitle"
          type="text"
          placeholder="输入打卡项名称"
          @keyup.enter="addItem"
          autofocus
        />
        <div class="dialog-actions">
          <button @click="showAddDialog = false" class="btn-cancel">取消</button>
          <button @click="addItem" class="btn-confirm">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCheckInStore } from '../stores/checkin'

const store = useCheckInStore()

const currentDate = ref(new Date())
const selectedDate = ref(null)
const showDetail = ref(false)
const showAddDialog = ref(false)
const newItemTitle = ref('')

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentMonthLabel = computed(() => {
  return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`
})

const currentMonth = computed(() => currentDate.value.getMonth())

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  
  const dates = []
  
  // 上月日期
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    dates.push(new Date(year, month - 1, day))
  }
  
  // 当月日期
  for (let day = 1; day <= lastDay.getDate(); day++) {
    dates.push(new Date(year, month, day))
  }
  
  // 下月日期
  const remaining = 42 - dates.length
  for (let day = 1; day <= remaining; day++) {
    dates.push(new Date(year, month + 1, day))
  }
  
  return dates
})

const checkinItems = computed(() => store.items)

const currentRating = computed(() => {
  if (!selectedDate.value) return 0
  const record = store.getRecord(selectedDate.value.toISOString().split('T')[0])
  return record?.rating || 0
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (date) => {
  if (selectedDate.value && 
      selectedDate.value.toDateString() === date.toDateString()) {
    showDetail.value = false
    selectedDate.value = null
  } else {
    selectedDate.value = date
    showDetail.value = true
  }
}

const isSelectedDate = (date) => {
  return selectedDate.value && date.toDateString() === selectedDate.value.toDateString()
}

const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getDateColor = (date) => {
  const dateKey = date.toISOString().split('T')[0]
  const record = store.records[dateKey]
  if (!record) return 'transparent'
  
  const score = record.rating || 0
  if (score <= 6) return '#D32F2F'
  if (score <= 8) return '#FFC107'
  return '#4CAF50'
}

const formatDate = (date) => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.day}日`
}

const getWeekDay = (date) => {
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekDays[date.getDay()]
}

const isItemCompleted = (item) => {
  if (!selectedDate.value) return false
  const dateKey = selectedDate.value.toISOString().split('T')[0]
  const record = store.records[dateKey]
  if (!record) return false
  return record.items?.some(i => i.id === item.id && i.isCompleted) || false
}

const toggleCheckIn = (item) => {
  if (selectedDate.value) {
    store.toggleCheckIn(item.id, selectedDate.value)
  }
}

const setRating = (rating) => {
  if (selectedDate.value) {
    store.setRating(selectedDate.value.toISOString().split('T')[0], rating)
  }
}

const addItem = () => {
  if (newItemTitle.value.trim()) {
    store.addItem(newItemTitle.value.trim())
    newItemTitle.value = ''
    showAddDialog.value = false
  }
}

const closeDetail = () => {
  showDetail.value = false
  selectedDate.value = null
}

onMounted(() => {
  // 加载打卡项
  store.fetchItems()
  store.fetchRecords()
})
</script>

<style scoped>
.checkin-view {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

/* 日历容器 */
.calendar-container {
  background: rgba(30, 30, 46, 0.5);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h2 {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 日历网格 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.weekday {
  text-align: center;
  color: #888;
  font-size: 12px;
  padding: 8px 0;
}

.date-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.date-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.date-cell.other-month {
  opacity: 0.3;
}

.date-cell.selected {
  box-shadow: 0 0 0 3px #4A90E2;
}

.date-cell.today {
  border: 2px solid #ffffff;
}

.date-num {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

/* 图例 */
.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #888;
  font-size: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

/* 详情面板 */
.detail-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #1e1e2e 0%, #2a2a3e 100%);
  border-radius: 24px 24px 0 0;
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.panel-header h3 {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
}

.panel-header p {
  color: #888;
  font-size: 14px;
  margin: 4px 0 0;
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 28px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 星星评分 */
.star-rating {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.star {
  font-size: 32px;
  color: #444;
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
}

.star.filled {
  color: #FFC107;
}

.star:hover {
  transform: scale(1.2);
}

/* 打卡项列表 */
.checkin-items {
  margin-bottom: 20px;
}

.checkin-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.checkin-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.checkin-item.completed {
  opacity: 0.6;
}

.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #666;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #4A90E2;
  font-weight: bold;
  transition: all 0.2s;
}

.checkbox.checked {
  background: #4A90E2;
  border-color: #4A90E2;
  color: #ffffff;
}

.item-title {
  color: #ffffff;
  font-size: 16px;
}

.checkin-item.completed .item-title {
  text-decoration: line-through;
  color: #888;
}

/* 添加按钮 */
.add-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4A90E2 0%, #67A3F5 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: #1e1e2e;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
}

.dialog h4 {
  color: #ffffff;
  font-size: 18px;
  margin: 0 0 16px;
}

.dialog input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 16px;
}

.dialog input:focus {
  outline: none;
  border-color: #4A90E2;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: transparent;
  color: #888;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-confirm {
  background: #4A90E2;
  color: #ffffff;
}

.btn-confirm:hover {
  background: #5a9ff2;
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
