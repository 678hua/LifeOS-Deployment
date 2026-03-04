<template>
  <div class="note-view">
    <!-- 类型切换 -->
    <div class="type-selector">
      <button
        :class="{ active: currentType === 'review' }"
        @click="setType('review')"
      >
        复盘
      </button>
      <button
        :class="{ active: currentType === 'memo' }"
        @click="setType('memo')"
      >
        备忘录
      </button>
    </div>

    <!-- 思记列表 -->
    <div class="note-grid">
      <div v-if="filteredNotes.length === 0" class="empty-state">
        <div class="empty-icon">{{ currentType === 'review' ? '📖' : '📝' }}</div>
        <p>暂无{{ currentType === 'review' ? '复盘' : '备忘录' }}</p>
        <span>点击右下角 + 新建</span>
      </div>

      <div
        v-for="note in filteredNotes"
        :key="note.id"
        class="note-card"
        @click="openNote(note)"
      >
        <h3 class="note-title">{{ note.title || '无标题' }}</h3>
        <p class="note-content">{{ note.content || '点击添加内容...' }}</p>
        <div class="note-meta">
          <span class="note-time">🕐 {{ formatTime(note.createdAt) }}</span>
          <span v-if="note.reminderTime" class="note-reminder">
            ⏰ {{ formatTime(note.reminderTime) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 新建按钮 -->
    <button class="fab" @click="openEdit()">
      <span>+</span>
    </button>

    <!-- 编辑对话框 -->
    <div v-if="showEditDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>{{ editingNote ? '编辑' : '新建' }}</h3>
          <button @click="closeDialog" class="close-btn">×</button>
        </div>

        <div class="form-group">
          <input
            v-model="formData.title"
            type="text"
            placeholder="标题（可选）"
            class="title-input"
          />
        </div>

        <div class="form-group">
          <textarea
            v-model="formData.content"
            placeholder="在这里输入内容..."
            rows="10"
            class="content-input"
          ></textarea>
        </div>

        <div class="form-group">
          <label>
            {{ currentType === 'review' ? '记录时间' : '提醒时间' }}
          </label>
          <input v-model="formData.reminderTime" type="datetime-local" />
        </div>

        <div class="dialog-actions">
          <button v-if="editingNote" @click="deleteNote" class="btn-delete">删除</button>
          <button @click="closeDialog" class="btn-cancel">取消</button>
          <button @click="saveNote" class="btn-confirm">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNoteStore } from '../stores/note'

const store = useNoteStore()

const currentType = ref('review')
const showEditDialog = ref(false)
const editingNote = ref(null)

const formData = ref({
  title: '',
  content: '',
  reminderTime: ''
})

const filteredNotes = computed(() => {
  const type = currentType.value === 'review' ? 0 : 1
  return store.notes.filter(n => n.type === type)
})

const setType = (type) => {
  currentType.value = type
  store.setType(type === 'review' ? 0 : 1)
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const openEdit = (note = null) => {
  editingNote.value = note
  if (note) {
    formData.value = {
      title: note.title,
      content: note.content,
      reminderTime: note.reminderTime ? note.reminderTime.slice(0, 16) : ''
    }
  } else {
    formData.value = {
      title: '',
      content: '',
      reminderTime: new Date().toISOString().slice(0, 16)
    }
  }
  showEditDialog.value = true
}

const closeDialog = () => {
  showEditDialog.value = false
  editingNote.value = null
}

const saveNote = () => {
  const note = {
    id: editingNote.value?.id || Date.now().toString(),
    title: formData.value.title,
    content: formData.value.content,
    type: currentType.value === 'review' ? 0 : 1,
    createdAt: editingNote.value?.createdAt || new Date().toISOString(),
    reminderTime: formData.value.reminderTime || null
  }

  if (editingNote.value) {
    store.updateNote(note.id, note)
  } else {
    store.addNote(note)
  }

  closeDialog()
}

const deleteNote = () => {
  if (editingNote.value && confirm('确定要删除吗？')) {
    store.removeNote(editingNote.value.id)
    closeDialog()
  }
}

onMounted(() => {
  store.fetchNotes()
})
</script>

<style scoped>
.note-view {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

/* 类型切换 */
.type-selector {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.type-selector button {
  padding: 10px 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #b0b0b0;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.type-selector button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.type-selector button.active {
  background: #4A90E2;
  border-color: #4A90E2;
  color: #ffffff;
}

/* 思记网格 */
.note-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  padding-bottom: 80px;
}

.empty-state {
  grid-column: 1 / -1;
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

/* 思记卡片 */
.note-card {
  background: rgba(30, 30, 46, 0.8);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.note-title {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px;
}

.note-content {
  flex: 1;
  color: #888;
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.note-reminder {
  color: #4A90E2;
}

/* 浮动按钮 */
.fab {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #4A90E2;
  border: none;
  color: #ffffff;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab:hover {
  transform: scale(1.1);
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
  display: flex;
  flex-direction: column;
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

.title-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.content-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}

.title-input:focus,
.content-input:focus,
input[type="datetime-local"]:focus {
  outline: none;
  border-color: #4A90E2;
}

.form-group label {
  display: block;
  color: #888;
  font-size: 14px;
  margin-bottom: 8px;
}

.form-group input[type="datetime-local"] {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
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
