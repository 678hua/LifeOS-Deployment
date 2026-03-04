<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <h1 class="page-title">任务</h1>
        <p class="page-subtitle">高效完成每一件事</p>
      </header>

      <!-- 任务筛选 -->
      <section class="section">
        <div class="filter-bar">
          <div class="filter-group">
            <button 
              :class="['filter-btn', filter === 'all' ? 'active' : '']"
              @click="filter = 'all'"
            >全部</button>
            <button 
              :class="['filter-btn', filter === 'pending' ? 'active' : '']"
              @click="filter = 'pending'"
            >待办</button>
            <button 
              :class="['filter-btn', filter === 'completed' ? 'active' : '']"
              @click="filter = 'completed'"
            >已完成</button>
          </div>
          <button class="btn btn-primary btn-sm" @click="showAddDialog = true">
            + 新建任务
          </button>
        </div>
      </section>

      <!-- 任务列表 -->
      <section class="section">
        <div class="task-list">
          <div 
            v-for="task in filteredTasks" 
            :key="task.id"
            :class="['task-card', { completed: task.status === 2 }]">
            <div class="task-header">
              <div class="task-title-row">
                <input 
                  type="checkbox"
                  :checked="task.status === 2"
                  @change="toggleTask(task, $event.target.checked)"
                  class="task-checkbox"
                />
                <h3 class="task-title">{{ task.title }}</h3>
              </div>
              <div class="task-actions">
                <button class="btn btn-ghost btn-sm" @click="editTask(task)">编辑</button>
                <button class="btn btn-ghost btn-sm" @click="deleteTask(task.id)">删除</button>
              </div>
            </div>
            
            <p v-if="task.description" class="task-description">{{ task.description }}</p>
            
            <div class="task-meta">
              <span v-if="task.level" :class="['task-level-badge', levelClass(task.level)]">
                {{ levelLabel(task.level) }}
              </span>
              <span v-if="task.deadline" class="task-deadline">
                📅 {{ formatDate(task.deadline) }}
              </span>
              <span v-if="task.duration" class="task-duration">
                ⏱️ {{ formatDuration(task.duration) }}
              </span>
            </div>
          </div>
          
          <div v-if="filteredTasks.length === 0" class="empty-state">
            <p>暂无任务</p>
          </div>
        </div>
      </section>

      <!-- 添加/编辑任务对话框 -->
      <div v-if="showAddDialog || editingTask" class="dialog-overlay" @click="closeDialog">
        <div class="dialog" @click.stop>
          <h3 class="dialog-title">{{ editingTask ? '编辑任务' : '新建任务' }}</h3>
          
          <div class="form-group">
            <label class="form-label">标题</label>
            <input 
              v-model="formData.title"
              class="input"
              placeholder="任务标题"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea 
              v-model="formData.description"
              class="input textarea"
              placeholder="任务描述（可选）"
              rows="3"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">级别</label>
              <select v-model="formData.level" class="input">
                <option :value="1">小</option>
                <option :value="2">中</option>
                <option :value="3">大</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">截止</label>
              <input 
                v-model="formData.deadline"
                type="date"
                class="input"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">预计耗时</label>
            <select v-model="formData.duration" class="input">
              <option :value="15">15 分钟</option>
              <option :value="30">30 分钟</option>
              <option :value="60">1 小时</option>
              <option :value="120">2 小时</option>
              <option :value="240">4 小时</option>
              <option :value="480">8 小时</option>
              <option :value="1440">1 天</option>
              <option :value="2880">2 天</option>
              <option :value="10080">1 周</option>
            </select>
          </div>
          
          <div class="dialog-actions">
            <button class="btn btn-ghost" @click="closeDialog">取消</button>
            <button class="btn btn-primary" @click="saveTask">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/task'

const taskStore = useTaskStore()

const filter = ref('all')
const showAddDialog = ref(false)
const editingTask = ref(null)
const formData = ref({
  title: '',
  description: '',
  level: 2,
  deadline: '',
  duration: 60
})

const filteredTasks = computed(() => {
  let tasks = taskStore.tasks
  
  if (filter.value === 'pending') {
    tasks = tasks.filter(t => t.status !== 2)
  } else if (filter.value === 'completed') {
    tasks = tasks.filter(t => t.status === 2)
  }
  
  return tasks.sort((a, b) => {
    // 未完成的任务排在前面
    if (a.status !== b.status) {
      return a.status - b.status
    }
    // 按创建时间倒序
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

function levelLabel(level) {
  return { 1: '小', 2: '中', 3: '大' }[level] || '中'
}

function levelClass(level) {
  return `level-${level}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function formatDuration(minutes) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes}分钟`
  if (minutes < 1440) return `${Math.round(minutes / 60)}小时`
  return `${Math.round(minutes / 1440)}天`
}

function toggleTask(task, checked) {
  const updatedTask = {
    ...task,
    status: checked ? 2 : 0
  }
  taskStore.updateTask(task.id, updatedTask)
}

function editTask(task) {
  editingTask.value = task
  formData.value = {
    title: task.title,
    description: task.description || '',
    level: task.level || 2,
    deadline: task.deadline ? task.deadline.split('T')[0] : '',
    duration: task.duration || 60
  }
}

function deleteTask(id) {
  if (confirm('确定要删除这个任务吗？')) {
    taskStore.deleteTask(id)
  }
}

function closeDialog() {
  showAddDialog.value = false
  editingTask.value = null
  resetForm()
}

function resetForm() {
  formData.value = {
    title: '',
    description: '',
    level: 2,
    deadline: '',
    duration: 60
  }
}

function saveTask() {
  if (!formData.value.title.trim()) {
    alert('请输入任务标题')
    return
  }
  
  const taskData = {
    ...formData.value,
    status: editingTask.value ? editingTask.value.status : 0,
    category: '',
    created_at: editingTask.value ? editingTask.value.created_at : new Date().toISOString()
  }
  
  if (editingTask.value) {
    taskStore.updateTask(editingTask.value.id, taskData)
  } else {
    taskData.id = Date.now().toString()
    taskStore.addTask(taskData)
  }
  
  closeDialog()
}

onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<style scoped>
.header {
  margin-bottom: var(--space-xl);
}

.section {
  margin-bottom: var(--space-lg);
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space);
}

.filter-group {
  display: flex;
  gap: var(--space-xs);
  background: var(--bg-secondary);
  padding: var(--space-xs);
  border-radius: var(--radius);
}

.filter-btn {
  padding: var(--space-xs) var(--space);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  color: var(--text-primary);
}

.filter-btn.active {
  background: var(--bg-main);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space);
}

.task-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  transition: all 0.2s ease;
}

.task-card:hover {
  background: var(--bg-tertiary);
}

.task-card.completed {
  opacity: 0.6;
}

.task-card.completed .task-title {
  text-decoration: line-through;
}

.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space);
  margin-bottom: var(--space);
}

.task-title-row {
  display: flex;
  align-items: center;
  gap: var(--space);
  flex: 1;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.task-actions {
  display: flex;
  gap: var(--space-xs);
}

.task-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--space);
  line-height: 1.6;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.task-level-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.task-level-badge.level-1 {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent);
}

.task-level-badge.level-2 {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.task-level-badge.level-3 {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
}

.task-deadline,
.task-duration {
  font-size: 12px;
  color: var(--text-tertiary);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--text-tertiary);
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.dialog-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: var(--space-lg);
  color: var(--text-primary);
}

.form-group {
  margin-bottom: var(--space);
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space);
}

.textarea {
  resize: vertical;
  min-height: 80px;
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
