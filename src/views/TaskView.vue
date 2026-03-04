<template>
  <div class="task-view">
    <!-- 分类标签 -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat"
        :class="{ active: selectedCategory === cat }"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- 任务列表 -->
    <div class="task-list">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>暂无任务</p>
        <span>点击右上角 + 新建任务</span>
      </div>

      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-card"
        :class="`level-${task.level}`"
        @click="openTaskDetail(task)"
      >
        <div class="task-header">
          <h3 class="task-title">{{ task.title }}</h3>
          <div class="badges">
            <span class="level-badge" :class="`level-${task.level}`">
              {{ levelLabels[task.level] }}
            </span>
            <span class="status-badge" :class="`status-${task.status}`">
              {{ statusLabels[task.status] }}
            </span>
          </div>
        </div>

        <p v-if="task.description" class="task-desc">{{ task.description }}</p>

        <div class="task-meta">
          <div class="meta-item">
            <span class="icon">⏱</span>
            <span>{{ formatDuration(task.duration) }}</span>
          </div>
          <div class="meta-item">
            <span class="icon">📅</span>
            <span>{{ formatDate(task.startTime) }}</span>
          </div>
          <div class="meta-item">
            <span class="icon">🚩</span>
            <span>{{ formatDate(task.endTime) }}</span>
          </div>
          <div class="mo-points" :class="`level-${task.level}`">
            <span>⭐</span>
            <span>{{ task.moPoints }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建按钮 -->
    <button class="fab" @click="showEditDialog = true">
      <span>+</span>
    </button>

    <!-- 任务编辑对话框 -->
    <div v-if="showEditDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ editingTask ? '编辑任务' : '新建任务' }}</h3>
          <button @click="closeDialog" class="close-btn">×</button>
        </div>

        <div class="form-group">
          <label>任务标题 *</label>
          <input v-model="formData.title" type="text" placeholder="输入任务标题" />
        </div>

        <div class="form-group">
          <label>任务描述</label>
          <textarea v-model="formData.description" rows="3" placeholder="任务描述（可选）"></textarea>
        </div>

        <div class="form-group">
          <label>任务级别</label>
          <div class="level-selector">
            <button
              v-for="(label, key) in levelLabels"
              :key="key"
              :class="{ active: formData.level === key }"
              @click="selectLevel(key)"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>墨点数 ({{ getMoPointRange(formData.level).min }}~{{ getMoPointRange(formData.level).max }})</label>
          <input
            v-model.number="formData.moPoints"
            type="range"
            :min="getMoPointRange(formData.level).min"
            :max="getMoPointRange(formData.level).max"
          />
          <div class="range-value">{{ formData.moPoints }} 墨点</div>
        </div>

        <div class="form-group">
          <label>时长</label>
          <select v-model="formData.duration">
            <option :value="15">15 分钟</option>
            <option :value="30">30 分钟</option>
            <option :value="60">1 小时</option>
            <option :value="120">2 小时</option>
            <option :value="240">4 小时</option>
            <option :value="1440">1 天</option>
            <option :value="4320">3 天</option>
            <option :value="10080">7 天</option>
          </select>
        </div>

        <div class="form-group">
          <label>起始时间</label>
          <input v-model="formData.startTime" type="datetime-local" />
        </div>

        <div class="form-group">
          <label>截止时间</label>
          <input v-model="formData.endTime" type="datetime-local" />
        </div>

        <div class="dialog-actions">
          <button v-if="editingTask" @click="deleteTask" class="btn-delete">删除</button>
          <button @click="closeDialog" class="btn-cancel">取消</button>
          <button @click="saveTask" class="btn-confirm">{{ editingTask ? '保存' : '创建' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/task'

const store = useTaskStore()

const categories = ['全部分类', '学习', '工作项目', '财务分析', '个人成长']
const selectedCategory = ref('全部分类')
const showEditDialog = ref(false)
const editingTask = ref(null)

const levelLabels = {
  0: '小',
  1: '中',
  2: '大'
}

const statusLabels = {
  0: '未接取',
  1: '进行中',
  2: '完成'
}

const formData = ref({
  title: '',
  description: '',
  level: 0,
  moPoints: 10,
  duration: 60,
  startTime: '',
  endTime: '',
  status: 0,
  category: ''
})

const filteredTasks = computed(() => {
  if (selectedCategory.value === '全部分类') {
    return store.tasks
  }
  return store.tasks.filter(t => t.category === selectedCategory.value)
})

const selectLevel = (level) => {
  formData.value.level = level
  const range = getMoPointRange(level)
  if (formData.value.moPoints < range.min) {
    formData.value.moPoints = range.min
  } else if (formData.value.moPoints > range.max) {
    formData.value.moPoints = range.max
  }
}

const getMoPointRange = (level) => {
  const ranges = [
    { min: 10, max: 30 },
    { min: 30, max: 100 },
    { min: 100, max: 500 }
  ]
  return ranges[level] || ranges[0]
}

const formatDuration = (minutes) => {
  if (minutes >= 1440) {
    return `${Math.floor(minutes / 1440)}天`
  } else if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h${minutes % 60}m`
  }
  return `${minutes}m`
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const openTaskDetail = (task) => {
  editingTask.value = task
  formData.value = {
    title: task.title,
    description: task.description,
    level: task.level,
    moPoints: task.moPoints,
    duration: task.duration,
    startTime: task.startTime,
    endTime: task.endTime,
    status: task.status,
    category: task.category
  }
  showEditDialog.value = true
}

const closeDialog = () => {
  showEditDialog.value = false
  editingTask.value = null
  resetForm()
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    level: 0,
    moPoints: 10,
    duration: 60,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    status: 0,
    category: ''
  }
}

const saveTask = () => {
  if (!formData.value.title.trim()) return

  const task = {
    id: editingTask.value?.id || Date.now().toString(),
    ...formData.value,
    createdAt: editingTask.value?.createdAt || new Date().toISOString()
  }

  if (editingTask.value) {
    store.updateTask(task.id, task)
  } else {
    store.addTask(task)
  }

  closeDialog()
}

const deleteTask = () => {
  if (editingTask.value && confirm('确定要删除这个任务吗？')) {
    store.removeTask(editingTask.value.id)
    closeDialog()
  }
}

onMounted(() => {
  store.fetchTasks()
  resetForm()
})
</script>

<style scoped>
.task-view {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.category-tabs button {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #b0b0b0;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.category-tabs button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.category-tabs button.active {
  background: rgba(74, 144, 226, 0.2);
  border-color: #4A90E2;
  color: #4A90E2;
}

/* 任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-state span {
  font-size: 14px;
  color: #888;
}

/* 任务卡片 */
.task-card {
  background: rgba(30, 30, 46, 0.8);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
  flex: 1;
}

.badges {
  display: flex;
  gap: 8px;
}

.level-badge, .status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: bold;
}

.level-badge.level-0 { background: rgba(76, 175, 80, 0.2); color: #4CAF50; border: 1px solid #4CAF50; }
.level-badge.level-1 { background: rgba(255, 152, 0, 0.2); color: #FF9800; border: 1px solid #FF9800; }
.level-badge.level-2 { background: rgba(244, 67, 54, 0.2); color: #F44336; border: 1px solid #F44336; }

.status-badge.status-0 { background: rgba(158, 158, 158, 0.2); color: #9E9E9E; border: 1px solid #9E9E9E; }
.status-badge.status-1 { background: rgba(74, 144, 226, 0.2); color: #4A90E2; border: 1px solid #4A90E2; }
.status-badge.status-2 { background: rgba(76, 175, 80, 0.2); color: #4CAF50; border: 1px solid #4CAF50; }

.task-desc {
  color: #888;
  font-size: 14px;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #888;
}

.meta-item .icon {
  font-size: 14px;
}

.mo-points {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.mo-points.level-0 { background: #4CAF50; color: #ffffff; }
.mo-points.level-1 { background: #FF9800; color: #ffffff; }
.mo-points.level-2 { background: #F44336; color: #ffffff; }

/* 浮动按钮 */
.fab {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A90E2 0%, #67A3F5 100%);
  border: none;
  color: #ffffff;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(74, 144, 226, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.5);
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
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
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
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.form-group {
  padding: 16px 20px;
}

.form-group label {
  display: block;
  color: #888;
  font-size: 14px;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select,
.form-group input[type="datetime-local"] {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4A90E2;
}

.level-selector {
  display: flex;
  gap: 12px;
}

.level-selector button {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.level-selector button.active {
  border-color: #4A90E2;
  color: #4A90E2;
  background: rgba(74, 144, 226, 0.1);
}

.form-group input[type="range"] {
  width: 100%;
  margin-top: 8px;
}

.range-value {
  text-align: center;
  color: #4A90E2;
  font-weight: bold;
  margin-top: 8px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel, .btn-confirm, .btn-delete {
  flex: 1;
  padding: 12px;
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

.btn-delete {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
}

.btn-delete:hover {
  background: rgba(244, 67, 54, 0.3);
}
</style>
