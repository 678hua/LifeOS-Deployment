<template>
  <div class="page">
    <div class="container">
      <header>
        <h1 class="page-title">LifeOS</h1>
        <p class="page-subtitle">专注每一天</p>
      </header>

      <!-- 今日概览 -->
      <section class="section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ todayTasks.completed }}/{{ todayTasks.total }}</div>
            <div class="stat-label">今日任务</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ todayRating }}</div>
            <div class="stat-label">今日评分</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ notesCount }}</div>
            <div class="stat-label">思记</div>
          </div>
        </div>
      </section>

      <!-- 打卡 -->
      <section class="section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">打卡</h2>
            <button class="btn btn-sm" @click="goToCheckin">查看</button>
          </div>
          <div class="list">
            <div v-for="item in checkinItems.slice(0, 3)" :key="item.id" class="list-item">
              <span class="list-item-title">{{ item.title }}</span>
            </div>
            <div v-if="checkinItems.length === 0" class="empty-state">
              暂无打卡项
            </div>
          </div>
        </div>
      </section>

      <!-- 任务 -->
      <section class="section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">任务</h2>
            <button class="btn btn-sm" @click="goToTasks">查看</button>
          </div>
          <div class="list">
            <div v-for="task in pendingTasks.slice(0, 3)" :key="task.id" class="list-item">
              <div class="list-item-content">
                <span class="list-item-title">{{ task.title }}</span>
                <span class="list-item-meta" v-if="task.level">{{ levelLabel(task.level) }}</span>
              </div>
            </div>
            <div v-if="pendingTasks.length === 0" class="empty-state">
              暂无待办任务
            </div>
          </div>
        </div>
      </section>

      <!-- 思记 -->
      <section class="section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">思记</h2>
            <button class="btn btn-sm" @click="goToNotes">查看</button>
          </div>
          <div class="list">
            <div v-for="note in recentNotes" :key="note.id" class="list-item">
              <div class="list-item-content">
                <span class="list-item-title">{{ note.title || '无标题' }}</span>
                <span class="list-item-meta">{{ formatDate(note.created_at) }}</span>
              </div>
            </div>
            <div v-if="recentNotes.length === 0" class="empty-state">
              暂无思记
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckInStore } from '../stores/checkin'
import { useTaskStore } from '../stores/task'
import { useNoteStore } from '../stores/note'

const router = useRouter()
const checkinStore = useCheckInStore()
const taskStore = useTaskStore()
const noteStore = useNoteStore()

const todayRating = ref(0)

const todayTasks = computed(() => {
  const today = new Date().toDateString()
  const tasks = taskStore.tasks.filter(t => 
    t.start_time && new Date(t.start_time).toDateString() === today
  )
  return {
    total: tasks.length || taskStore.tasks.filter(t => t.status !== 2).length,
    completed: tasks.filter(t => t.status === 2).length
  }
})

const pendingTasks = computed(() => {
  return taskStore.tasks.filter(t => t.status === 0 || t.status === 1).slice(0, 5)
})

const checkinItems = computed(() => checkinStore.items || [])
const recentNotes = computed(() => noteStore.notes ? noteStore.notes.slice(0, 3) : [])
const notesCount = computed(() => noteStore.notes ? noteStore.notes.length : 0)

function levelLabel(level) {
  return { 1: '小', 2: '中', 3: '大' }[level] || ''
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) return '今天'
  if (diff < 7 * 24 * 60 * 60 * 1000) return '本周'
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function goToCheckin() { router.push('/checkin') }
function goToTasks() { router.push('/tasks') }
function goToNotes() { router.push('/notes') }

onMounted(async () => {
  await Promise.all([
    checkinStore.fetchItems(),
    taskStore.fetchTasks(),
    noteStore.fetchNotes()
  ])
})
</script>

<style scoped>
.section {
  margin-bottom: var(--space-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  text-align: center;
  border: 1px solid var(--border);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.list-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.list-item-title {
  font-size: 15px;
  font-weight: 500;
}

.list-item-meta {
  font-size: 13px;
  color: var(--text-tertiary);
}
</style>
