<template>
  <div id="app">
    <router-view />
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <span class="nav-label">首页</span>
      </router-link>
      <router-link to="/checkin" class="nav-item">
        <span class="nav-label">打卡</span>
      </router-link>
      <router-link to="/tasks" class="nav-item">
        <span class="nav-label">任务</span>
      </router-link>
      <router-link to="/notes" class="nav-item">
        <span class="nav-label">思记</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <span class="nav-label">我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 0;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item.router-link-active {
  color: rgba(255, 255, 255, 1);
}

.nav-item.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: rgba(255, 255, 255, 1);
  border-radius: 2px;
}

.nav-label {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Light mode */
@media (prefers-color-scheme: light) {
  .bottom-nav {
    background: rgba(255, 255, 255, 0.8);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .nav-item {
    color: rgba(0, 0, 0, 0.4);
  }
  
  .nav-item.router-link-active {
    color: rgba(0, 0, 0, 1);
  }
  
  .nav-item.router-link-active::after {
    background: rgba(0, 0, 0, 1);
  }
}
</style>
