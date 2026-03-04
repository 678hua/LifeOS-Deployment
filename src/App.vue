<template>
  <div id="app">
    <router-view />
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <span class="nav-icon">📊</span>
        <span class="nav-label">首页</span>
      </router-link>
      <router-link to="/checkin" class="nav-item">
        <span class="nav-icon">✅</span>
        <span class="nav-label">打卡</span>
      </router-link>
      <router-link to="/tasks" class="nav-item">
        <span class="nav-icon">📋</span>
        <span class="nav-label">任务</span>
      </router-link>
      <router-link to="/notes" class="nav-item">
        <span class="nav-icon">📝</span>
        <span class="nav-label">思记</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <span class="nav-icon">⚙️</span>
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
  background: var(--bg-main);
  border-top: 1px solid var(--border);
  padding: var(--space-sm) 0;
  padding-bottom: max(var(--space-sm), env(safe-area-inset-bottom));
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-xs) var(--space);
  color: var(--text-tertiary);
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: var(--radius);
}

.nav-item:hover {
  background: var(--bg-secondary);
}

.nav-item.router-link-active {
  color: var(--accent);
}

.nav-icon {
  font-size: 20px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}
</style>
