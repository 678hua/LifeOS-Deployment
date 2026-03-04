<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <h1 class="page-title">思记</h1>
        <p class="page-subtitle">记录思考与感悟</p>
      </header>

      <section class="section">
        <div class="toolbar">
          <button class="btn btn-primary" @click="showAddDialog = true">
            + 新建思记
          </button>
        </div>
      </section>

      <section class="section">
        <div class="note-grid">
          <div 
            v-for="note in notes" 
            :key="note.id"
            class="note-card card"
            @click="editNote(note)"
          >
            <div class="note-header">
              <h3 class="note-title">{{ note.title || '无标题' }}</h3>
              <span class="note-date">{{ formatDate(note.created_at) }}</span>
            </div>
            <p class="note-content">{{ truncate(note.content, 150) }}</p>
            <div class="note-footer">
              <span v-if="note.type === 1" class="note-type-badge">复盘</span>
              <span v-else-if="note.type === 2" class="note-type-badge">备忘录</span>
            </div>
          </div>
          
          <div v-if="notes.length === 0" class="empty-state">
            <p>暂无思记</p>
          </div>
        </div>
      </section>

      <!-- 添加/编辑对话框 -->
      <div v-if="showAddDialog || editingNote" class="dialog-overlay" @click="closeDialog">
        <div class="dialog" @click.stop>
          <h3 class="dialog-title">{{ editingNote ? '编辑思记' : '新建思记' }}</h3>
          
          <div class="form-group">
            <label class="form-label">标题</label>
            <input 
              v-model="formData.title"
              class="input"
              placeholder="标题（可选）"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">类型</label>
            <select v-model="formData.type" class="input">
              <option :value="1">复盘</option>
              <option :value="2">备忘录</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">内容</label>
            <textarea 
              v-model="formData.content"
              class="input textarea"
              placeholder="记录你的思考和感悟..."
              rows="10"
            />
          </div>
          
          <div class="dialog-actions">
            <button class="btn btn-ghost" @click="closeDialog">取消</button>
            <button class="btn btn-primary" @click="saveNote">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNoteStore } from '../stores/note'

const noteStore = useNoteStore()

const showAddDialog = ref(false)
const editingNote = ref(null)
const formData = ref({
  title: '',
  content: '',
  type: 2
})

const notes = computed(() => noteStore.notes)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('zh-CN', { weekday: 'long' })
  } else {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
  }
}

function truncate(text, len) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

function editNote(note) {
  editingNote.value = note
  formData.value = {
    title: note.title || '',
    content: note.content || '',
    type: note.type || 2
  }
}

function closeDialog() {
  showAddDialog.value = false
  editingNote.value = null
  resetForm()
}

function resetForm() {
  formData.value = {
    title: '',
    content: '',
    type: 2
  }
}

function saveNote() {
  if (!formData.value.content.trim()) {
    alert('请输入内容')
    return
  }
  
  const noteData = {
    ...formData.value,
    created_at: editingNote.value ? editingNote.value.created_at : new Date().toISOString(),
    reminder_time: null
  }
  
  if (editingNote.value) {
    noteStore.updateNote(editingNote.value.id, noteData)
  } else {
    noteData.id = Date.now().toString()
    noteStore.addNote(noteData)
  }
  
  closeDialog()
}

onMounted(() => {
  noteStore.fetchNotes()
})
</script>

<style scoped>
.header {
  margin-bottom: var(--space-xl);
}

.section {
  margin-bottom: var(--space-lg);
}

.toolbar {
  display: flex;
  justify-content: flex-end;
}

.note-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space);
}

.note-card {
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.note-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.note-header {
  margin-bottom: var(--space);
}

.note-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.note-date {
  font-size: 12px;
  color: var(--text-tertiary);
}

.note-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  flex: 1;
  white-space: pre-wrap;
}

.note-footer {
  margin-top: var(--space);
  padding-top: var(--space);
  border-top: 1px solid var(--border);
}

.note-type-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.empty-state {
  grid-column: 1 / -1;
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
  max-width: 600px;
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

.textarea {
  resize: vertical;
  min-height: 200px;
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
