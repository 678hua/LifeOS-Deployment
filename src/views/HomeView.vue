<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <h1 class="page-title">LifeOS</h1>
        <p class="page-subtitle">专注每一天</p>
      </header>

      <!-- 今日概览 -->
      <section class="section">
        <div class="overview-grid">
          <div class="stat-card">
            <div class="stat-value">{{ todayTasks.completed }}/{{ todayTasks.total }}</div>
            <div class="stat-label">今日任务</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ todayRating }}/10</div>
            <div class="stat-label">今日评分</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ notesCount }}</div>
            <div class="stat-label">思记</div>
          </div>
        </div>
      </section>

      <!-- 快速打卡 -->
      <section class="section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">今日打卡</h2>
            <button class="btn btn-sm btn-secondary" @click="goToCheckin">编辑</button>
          </div>
          <div class="checkin-items">
            <div v-for="item in checkinItems" :key="item.id" class="checkin-item">
              <span class="checkin-title">{{ item.title }}</span>
              <span :class="['checkin-status', item.completed ? 'done' : '']">
                {{ item.completed ? '已完成' : '未完成' }}
              </span>
            </div>
            <div v-if="checkinItems.length === 0" class="empty-state">
              暂无打卡项，去添加吧
            </div>
          </div>
        </div>
      </section>

      <!-- 待办任务 -->
      <section class="section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">待办任务</h2>
            <button class="btn btn-sm btn-secondary" @click="goToTasks">查看全部</button>
          </div>
          <div class="task-list">
            <div v-for="task in pendingTasks" :key="task.id" class="task-item">
              <div class="task-content">
                <span class="task-title">{{ task.title }}</span>
                <span :class="['task-level', task.level]">{{ levelLabel(task.level) }}</span>
              </div>
              <div class="task-meta">
                <span class="task-deadline" v-if="task.deadline">{{ formatDate(task.deadline) }}</span>
              </div>
            </div>
            <div v-if="pendingTasks.length === 0" class="empty-state">
              没有待办任务
            </div>
          </div>
        </div>
      </section>

      <!-- 最近思记 -->
      <section class="section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">最近思记</h2>
            <button class="btn btn-sm btn-secondary" @click="goToNotes">查看全部</button>
          </div>
          <div class="note-list">
            <div v-for="note in recentNotes" :key="note.id" class="note-item">
              <div class="note-title">{{ note.title || '无标题' }}</div>
              <div class="note-preview">{{ truncate(note.content, 50) }}</div>
              <div class="note-date">{{ formatDate(note.created_at) }}</div>
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
    total: tasks.length,
    completed: tasks.filter(t => t.status === 2).length
  }
})

const pendingTasks = computed(() => {
  return taskStore.tasks
    .filter(t => t.status === 0)
    .slice(0, 5)
})

const checkinItems = computed(() => {
  return checkinStore.items.slice(0, 5)
})

const recentNotes = computed(() => {
  return noteStore.notes.slice(0, 3)
})

const notesCount = computed(() => noteStore.notes.length)

function levelLabel(level) {
  return { 1: '小', 2: '中', 3: '大' }[level] || '中'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) {
    return '今天'
  } else if (diff < 48 * 60 * 60 * 1000) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

function truncate(text, len) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

function goToCheckin() {
  router.push('/checkin')
}

function goToTasks() {
  router.push('/tasks')
}

function goToNotes() {
  router.push('/notes')
}

onMounted(async () => {
  await Promise.all([
    checkinStore.fetchItems(),
    taskStore.fetchTasks(),
    noteStore.fetchNotes()
  ])
})
</script>

<style scoped>
.header {
  margin-bottom: var(--space-xl);
}

.section {
  margin-bottom: var(--space-lg);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space);
  margin-bottom: var(--space-lg);
}

.stat-card {
  background: var(--bg-secondary);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.checkin-items,
.task-list,
.note-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.checkin-item,
.task-item,
.note-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space) var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius);
  transition: background 0.2s ease;
}

.checkin-item:hover,
.task-item:hover,
.note-item:hover {
  background: var(--bg-tertiary);
}

.checkin-title,
.task-title {
  font-size: 14px;
  color: var(--text-primary);
}

.checkin-status {
  font-size: 13px;
  color: var(--text-tertiary);
}

.checkin-status.done {
  color: var(--success);
}

.task-content {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
}

.task-level {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.task-level[data-level="1"] { background: rgba(59, 130, 246, 0.1); color: var(--accent); }
.task-level[data-level="2"] { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
.task-level[data-level="3"] { background: rgba(239, 68, 68, 0.1); color: var(--error); }

.task-meta {
  font-size: 12px;
  color: var(--text-tertiary);
}

.note-title {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.note-preview {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

.note-date {
  font-size: 12px;
  color: var(--text-tertiary);
}

.empty-state {
  text-align: center;
  padding: var(--space-xl);
  color: var(--text-tertiary);
  font-size: 14px;
}
</style>
