<template>
  <div class="home-view">
    <!-- 侧边导航抽屉 -->
    <aside v-if="currentTab !== 'profile'" class="drawer" :class="{ open: drawerOpen }">
      <nav class="drawer-nav">
        <a 
          :class="{ active: currentPage === 'checkin' }"
          @click="navigateTo('checkin')"
        >
          <span class="icon">📅</span>
          <span>打卡</span>
        </a>
        <a 
          :class="{ active: currentPage === 'task' }"
          @click="navigateTo('task')"
        >
          <span class="icon">✅</span>
          <span>任务</span>
        </a>
        <a 
          :class="{ active: currentPage === 'note' }"
          @click="navigateTo('note')"
        >
          <span class="icon">📝</span>
          <span>思记</span>
        </a>
        <a 
          :class="{ active: currentPage === 'lottery' }"
          @click="navigateTo('lottery')"
        >
          <span class="icon">🎰</span>
          <span>抽奖</span>
        </a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部 AppBar -->
      <header v-if="currentTab !== 'profile'" class="app-bar">
        <button class="menu-btn" @click="toggleDrawer">
          <span>☰</span>
        </button>
        <h1 class="title">{{ pageTitle }}</h1>
      </header>

      <!-- 页面内容 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部导航栏 -->
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item" :class="{ active: currentTab === 'home' }">
        <span class="icon">🏠</span>
        <span>首页</span>
      </router-link>
      <router-link to="/stats" class="nav-item" :class="{ active: currentTab === 'stats' }">
        <span class="icon">📊</span>
        <span>统计</span>
      </router-link>
      <router-link to="/profile" class="nav-item" :class="{ active: currentTab === 'profile' }">
        <span class="icon">👤</span>
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const drawerOpen = ref(false)

const currentTab = computed(() => {
  if (route.path === '/') return 'home'
  if (route.path === '/stats') return 'stats'
  if (route.path === '/profile') return 'profile'
  return 'home'
})

const currentPage = computed(() => {
  if (route.name === 'checkin') return 'checkin'
  if (route.name === 'task') return 'task'
  if (route.name === 'note') return 'note'
  return 'checkin'
})

const pageTitle = computed(() => {
  const titles = { checkin: '打卡', task: '任务', note: '思记', lottery: '抽奖' }
  return titles[currentPage.value] || '打卡'
})

const navigateTo = (page) => {
  router.push({ name: page })
  drawerOpen.value = false
}

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value
}
</script>

<style scoped>
.home-view {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #ffffff;
}

/* 侧边抽屉 */
.drawer {
  position: fixed;
  left: -280px;
  top: 0;
  width: 280px;
  height: 100%;
  background: rgba(30, 30, 46, 0.98);
  backdrop-filter: blur(10px);
  transition: left 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
}

.drawer.open {
  left: 0;
}

.drawer-nav {
  padding: 80px 20px 20px;
}

.drawer-nav a {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 8px;
  border-radius: 12px;
  color: #b0b0b0;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.drawer-nav a:hover {
  background: rgba(74, 144, 226, 0.1);
  color: #ffffff;
}

.drawer-nav a.active {
  background: linear-gradient(135deg, #4A90E2 0%, #67A3F5 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.drawer-nav .icon {
  margin-right: 12px;
  font-size: 20px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 0;
}

/* AppBar */
.app-bar {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgba(30, 30, 46, 0.5);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  margin-right: 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

/* 底部导航 */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 0;
  background: rgba(30, 30, 46, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #b0b0b0;
  padding: 8px 20px;
  border-radius: 12px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.nav-item.active {
  color: #4A90E2;
}

.nav-item .icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-item span:last-child {
  font-size: 12px;
  font-weight: 500;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
