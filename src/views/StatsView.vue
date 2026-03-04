<template>
  <div class="stats-view">
    <div class="tabs">
      <button :class="{ active: activeTab === 'checkin' }" @click="activeTab = 'checkin'">
        打卡
      </button>
      <button :class="{ active: activeTab === 'task' }" @click="activeTab = 'task'">
        任务
      </button>
      <button :class="{ active: activeTab === 'note' }" @click="activeTab = 'note'">
        思记
      </button>
    </div>

    <div v-show="activeTab === 'checkin'" class="tab-content">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ checkinStats.totalDays }}</div>
          <div class="stat-label">总天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ checkinStats.completedDays }}</div>
          <div class="stat-label">完成天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ checkinStats.totalItems }}</div>
          <div class="stat-label">打卡项</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ checkinStats.totalCompletions }}</div>
          <div class="stat-label">总完成</div>
        </div>
      </div>

      <div class="chart-card">
        <h3>完成率</h3>
        <div class="pie-chart">
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#333"
              stroke-width="12"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#4CAF50"
              stroke-width="12"
              :stroke-dasharray="`${completionCircumference} ${completionCircumference}`"
              :stroke-dashoffset="completionOffset"
              transform="rotate(-90 50 50)"
              stroke-linecap="round"
            />
          </svg>
          <div class="chart-center">
            <div class="chart-percentage">{{ completionRate }}%</div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'task'" class="tab-content">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ taskStats.notAccepted }}</div>
          <div class="stat-label">未接取</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ taskStats.inProgress }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ taskStats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>

      <div class="chart-card">
        <h3>墨点数统计</h3>
        <div class="mo-points-display">
          <div class="mo-icon">⭐</div>
          <div class="mo-value">{{ taskStats.totalMoPoints }}</div>
          <div class="mo-label">总墨点数</div>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'note'" class="tab-content">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ noteStats.review }}</div>
          <div class="stat-label">复盘</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ noteStats.memo }}</div>
          <div class="stat-label">备忘录</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ noteStats.total }}</div>
          <div class="stat-label">总计</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCheckInStore } from '../stores/checkin'
import { useTaskStore } from '../stores/task'
import { useNoteStore } from '../stores/note'

const activeTab = ref('checkin')

const checkinStore = useCheckInStore()
const taskStore = useTaskStore()
const noteStore = useNoteStore()

const checkinStats = computed(() => checkinStore.stats)
const taskStats = computed(() => ({
  ...store.stats,
  totalMoPoints: store.totalMoPoints
}))
const noteStats = computed(() => noteStore.stats)

const completionRate = computed(() => {
  if (!checkinStats.value.totalDays) return 0
  return Math.round((checkinStats.value.completedDays / checkinStats.value.totalDays) * 100)
})

const completionCircumference = 2 * Math.PI * 40
const completionOffset = computed(() => {
  return completionCircumference - (completionRate.value / 100) * completionCircumference
})

onMounted(() => {
  checkinStore.fetchStats()
  taskStore.fetchTasks()
  noteStore.fetchNotes()
})
</script>

<style scoped>
.stats-view {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tabs button {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #b0b0b0;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tabs button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.tabs button.active {
  background: #4A90E2;
  border-color: #4A90E2;
  color: #ffffff;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(30, 30, 46, 0.8);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #4A90E2;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #888;
}

/* 图表卡片 */
.chart-card {
  background: rgba(30, 30, 46, 0.8);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.chart-card h3 {
  margin: 0 0 24px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

/* 饼图 */
.pie-chart {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.pie-chart svg {
  width: 100%;
  height: 100%;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.chart-percentage {
  font-size: 32px;
  font-weight: bold;
  color: #4CAF50;
}

/* 墨点数显示 */
.mo-points-display {
  text-align: center;
  padding: 40px 20px;
}

.mo-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.mo-value {
  font-size: 48px;
  font-weight: bold;
  color: #FFC107;
  margin-bottom: 8px;
}

.mo-label {
  font-size: 14px;
  color: #888;
}
</style>
