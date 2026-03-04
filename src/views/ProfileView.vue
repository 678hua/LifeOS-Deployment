<template>
  <div class="profile-view">
    <!-- 头像区域 -->
    <div class="profile-header">
      <div class="avatar" @click="changeAvatar">
        <span v-if="!avatarUrl">👤</span>
        <img v-else :src="avatarUrl" alt="Avatar" />
      </div>
      <button class="edit-avatar-btn" @click="changeAvatar">编辑头像</button>
      <h2 class="username">用户</h2>
    </div>

    <!-- 墨点数卡片 -->
    <div class="mo-points-card">
      <div class="mo-icon">⭐</div>
      <div class="mo-info">
        <div class="mo-value">{{ totalMoPoints }}</div>
        <div class="mo-label">总墨点数</div>
      </div>
    </div>

    <!-- 设置列表 -->
    <div class="settings-list">
      <div class="setting-item" @click="showThemeSelector = true">
        <span class="setting-icon">🎨</span>
        <div class="setting-content">
          <div class="setting-title">背景模式</div>
          <div class="setting-desc">深色模式 / 浅色模式 / 跟随系统</div>
        </div>
        <span class="setting-arrow">›</span>
      </div>

      <div class="setting-item">
        <span class="setting-icon">🔔</span>
        <div class="setting-content">
          <div class="setting-title">通知设置</div>
        </div>
        <span class="setting-arrow">›</span>
      </div>

      <div class="setting-item">
        <span class="setting-icon">☁️</span>
        <div class="setting-content">
          <div class="setting-title">数据备份</div>
        </div>
        <span class="setting-arrow">›</span>
      </div>

      <div class="setting-item">
        <span class="setting-icon">ℹ️</span>
        <div class="setting-content">
          <div class="setting-title">关于 LifeOS</div>
          <div class="setting-desc">版本 1.0.0</div>
        </div>
        <span class="setting-arrow">›</span>
      </div>
    </div>

    <!-- 主题选择器 -->
    <div v-if="showThemeSelector" class="dialog-overlay" @click="showThemeSelector = false">
      <div class="dialog" @click.stop>
        <h3>选择背景模式</h3>
        <div class="theme-options">
          <button
            :class="{ active: themeMode === 'light' }"
            @click="setTheme('light')"
          >
            <span class="theme-icon">☀️</span>
            <span>浅色模式</span>
          </button>
          <button
            :class="{ active: themeMode === 'dark' }"
            @click="setTheme('dark')"
          >
            <span class="theme-icon">🌙</span>
            <span>深色模式</span>
          </button>
          <button
            :class="{ active: themeMode === 'system' }"
            @click="setTheme('system')"
          >
            <span class="theme-icon">⚙️</span>
            <span>跟随系统</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/task'

const taskStore = useTaskStore()

const avatarUrl = ref('')
const themeMode = ref('system')
const showThemeSelector = ref(false)

const totalMoPoints = computed(() => taskStore.totalMoPoints)

const changeAvatar = () => {
  // 头像更换逻辑
  alert('头像更换功能开发中')
}

const setTheme = (mode) => {
  themeMode.value = mode
  localStorage.setItem('theme_mode', mode)
  showThemeSelector.value = false
  
  // 应用主题
  document.documentElement.setAttribute('data-theme', mode)
}

onMounted(() => {
  taskStore.fetchTasks()
  const savedTheme = localStorage.getItem('theme_mode')
  if (savedTheme) {
    themeMode.value = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
})
</script>

<style scoped>
.profile-view {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

/* 头像区域 */
.profile-header {
  text-align: center;
  padding: 40px 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A90E2 0%, #67A3F5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 48px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(74, 144, 226, 0.3);
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.edit-avatar-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #888;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.edit-avatar-btn:hover {
  border-color: #4A90E2;
  color: #4A90E2;
}

.username {
  margin: 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
}

/* 墨点数卡片 */
.mo-points-card {
  background: linear-gradient(135deg, #FFA726 0%, #FFB74D 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(255, 167, 38, 0.3);
}

.mo-icon {
  font-size: 48px;
}

.mo-info {
  flex: 1;
}

.mo-value {
  font-size: 36px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
}

.mo-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 设置列表 */
.settings-list {
  background: rgba(30, 30, 46, 0.8);
  border-radius: 12px;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.setting-icon {
  font-size: 24px;
  margin-right: 16px;
}

.setting-content {
  flex: 1;
}

.setting-title {
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.setting-desc {
  color: #888;
  font-size: 13px;
}

.setting-arrow {
  color: #666;
  font-size: 20px;
}

/* 主题选择器 */
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

.dialog h3 {
  margin: 0 0 20px;
  color: #ffffff;
  font-size: 18px;
  text-align: center;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-options button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #b0b0b0;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-options button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.theme-options button.active {
  border-color: #4A90E2;
  background: rgba(74, 144, 226, 0.1);
  color: #4A90E2;
}

.theme-icon {
  font-size: 24px;
}
</style>
